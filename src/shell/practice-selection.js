// SPDX-License-Identifier: AGPL-3.0-only
import {PATHWAYS} from '../content/pathways.js';
import {FORM_CUES} from '../content/form-cues.js';
import {initialPracticeSelection, selectPracticePathway, practiceTierFields, offerable} from '../core/practice-selection.js';
import {createPracticeCatalog, displayPracticeCatalog, catalogPathwayConfig} from './practice-catalog.js';
import {createPracticeFileLoader} from './practice-files.js';
import {syncAdvancedMode, setFieldSilent} from './practice-config.js';
import {STRING_SETUPS} from '../core/instrument-tuning.js';
import {positionStepperIsShapeMode} from './practice-presentation.js';
import {NOTE_ALIASES} from '../core/pitch.js';
import {isShapeAwareSystem, shapeOrderForKey, fretWindowForShape, defaultShapeForSystem} from '../core/fretboard-shapes.js';
import {captureTabControls, restoreTabControls} from './tab-state.js';

  /** @typedef {import('../core/practice-files.js').Practice} Practice */
  /** @typedef {import('../core/practice-selection.js').SelectablePathway & {label?: string, scales?: string[], instAgnostic?: boolean, practiceFile?: Practice}} SelectionPathway */
/** @type {Record<string, SelectionPathway>} */
const pathways = PATHWAYS;
/** @param {string} id */
const $ = id => typeof document === 'undefined' ? null : document.getElementById(id);
/** @param {string} id */
const select = id => /** @type {HTMLSelectElement | null} */ ($(id));
const DEFAULT = 'chromatic_warmup';
const PATHWAY_KEY = 'virtuoso_lab.lastPathway', MODE_KEY = 'virtuoso_lab.lastMode';
/** @param {string} key */
function stored(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
/** @param {string} key @param {string} value */
function save(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
/** @param {string} text */
function status(text) { const el = $('virtuoso_lab-status'); if (el) el.textContent = text; }

/**
 * Host instrument adaptation and player state are semantic boundaries, not UI proxies.
 * @param {{
 * getContext: () => {family: string, hasBundle: boolean},
 * bands: {id: string, pathways: string[]}[],
 * applySelectedConfig: (id: string, config: Record<string, unknown> | null, variation: Record<string, unknown> | null) => void,
 * changeModeView: (mode: string, pathwayMode?: boolean) => void,
 * stopAndInvalidatePlayback: (reset: 'none' | 'cursor' | 'loop') => void,
 * regenerateSelectedConfig: () => Promise<boolean | undefined>,
 * rederiveSelection?: () => void,
 * presentation: {renderFile: () => void, renderPosition: () => void, renderCatalog: () => void, refreshStatus: () => void}
 * }} dependencies
 */
export function createPracticeSelection(dependencies) {
  let selection = initialPracticeSelection();
  let activeTab = 'guided';
  let unavailableReason = '';
  /** @param {string} reason */
  function block(reason) { unavailableReason = reason; dependencies.stopAndInvalidatePlayback('loop'); syncAvailability(); status(reason); }
  function recover() { unavailableReason = ''; syncAvailability(); }
  function syncAvailability() {
    for (const id of ['virtuoso_lab-play','virtuoso_lab-regenerate','virtuoso_lab-listen']) {
      const button = /** @type {HTMLButtonElement | null} */ ($(id));
      if (button) { button.disabled = !!unavailableReason; button.setAttribute('aria-disabled',String(!!unavailableReason)); }
    }
  }
  /** All entry points share ownership, including direct lesson/file actions. @param {string} mode */
  function activate(mode) {
    if (mode === activeTab) return;
    snapshots.set(activeTab, {selection:{...selection}, controls:captureTabControls(form()), file, variantId});
    cancelInitial(); cancelLoad(); dependencies.stopAndInvalidatePlayback('loop');
    file = null; variantId = null; activeTab = mode; recover(); save(MODE_KEY, mode);
    dependencies.changeModeView(mode);
  }
  /** @type {Map<string, {selection: typeof selection, controls: ReturnType<typeof captureTabControls>, file: Practice | null, variantId: string | null}>} */
  const snapshots = new Map();
  const form = () => /** @type {HTMLFormElement | null} */ ($('virtuoso_lab-controls'));
  /** @type {Practice | null} */
  let file = null;
  /** @type {string | null} */
  let variantId = null;
  /** @type {AbortController | null} */
  let request = null;
  let requestIdentity = 0, visit = 0, active = true;
  /** @type {{id: string, visit: number} | null} */
  let pendingInitial = null;
  /** @type {ReturnType<typeof createPracticeFileLoader> | null} */
  let loader = null;
  /** @type {ReturnType<typeof createPracticeCatalog> | null} */
  let catalog = null;
  const mounted = new Set();
  /** @type {(() => void)[]} */
  let removers = [];
  /** @param {string} id */
  function bandFor(id) { return dependencies.bands.find(band => band.pathways.includes(id))?.id || null; }
  /** @param {string} id */
  function isHidden(id) {
    const setup = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="stringSetup"]'));
    const instrument = (setup && STRING_SETUPS[setup.value]?.instrument) || 'guitar';
    const pathway = pathways[id], type = pathway?.base?.practiceType;
    if (typeof type === 'string' && !offerable(type,instrument)) return true;
    const codedSetup = pathway?.base?.stringSetup;
    const codedInstrument = typeof codedSetup === 'string' ? STRING_SETUPS[codedSetup]?.instrument : undefined;
    return !!(codedInstrument && codedInstrument !== instrument && bandFor(id) !== 'concept_rhythm' && !pathway?.instAgnostic);
  }

  function cancelLoad() { requestIdentity++; request?.abort(); request = null; }
  function hasPathwayFile() { return !!pathways[selection.pathwayId || '']?.practiceFile && !!$('virtuoso_lab-root')?.classList.contains('virtuoso_lab-pathway-mode'); }
  function syncFileControls() {
    const form = /** @type {HTMLFormElement | null} */ ($('virtuoso_lab-controls'));
    if (!form) return;
    syncAdvancedMode();
    for (const name of ['key','scale','meter','subdivision','bars','direction','sequence','shape','fretboardSystem','fretMin','fretMax','keyCycle','swing']) {
      const el = /** @type {HTMLInputElement | HTMLSelectElement | null} */ (form.elements.namedItem(name));
      if (el) el.disabled = !!file || (!!el.closest('.virtuoso_lab-advanced-only') && !/** @type {HTMLInputElement | null} */ ($('virtuoso_lab-advanced-toggle'))?.checked);
    }
    dependencies.presentation.renderFile();
  }
  /** @param {'none' | 'cursor' | 'loop'} [reset] */
  function clearFile(reset = 'none') {
    recover();
    dependencies.stopAndInvalidatePlayback(reset);
    cancelLoad(); file = null; variantId = null;
    syncFileControls();
  }
  function cancelInitial() { pendingInitial = null; }
  function beforeConfig() { cancelInitial(); clearFile(); }
  /** @param {string} id @param {number | null} [variationIndex] */
  function applyPathway(id, variationIndex) {
    activate(id === 'custom' ? 'custom' : 'guided');
    cancelInitial();
    if (id === DEFAULT && !pathways[id]) {
      selection = {...selection,pathwayId:id};
      dependencies.changeModeView('guided',true);
      if (catalog?.state.error) fallbackLadder();
      else { pendingInitial = {id,visit}; unavailable(); }
      return;
    }
    if (id !== 'custom' && (!pathways[id]?.base || isHidden(id))) { fallbackLadder(); return; }
    recover();
    const pathway = pathways[id];
    selection = selectPracticePathway(selection, id, pathway, bandFor(id), variationIndex);
    const picker = select('virtuoso_lab-pathway'); if (picker) picker.value = id;
    if (id === 'custom') { dependencies.applySelectedConfig(id, null, null); return; }
    if (!pathway?.base) { dependencies.applySelectedConfig(id, null, null); return; }
    const variation = pathway.vary?.[selection.variationIndex] || {};
    const config = {...pathway.base, ...variation};
    // The fixed chart validates the declaration, never retunes it or replaces the view.
    if (pathway.practiceFile) {
      config.stringSetup = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="stringSetup"]'))?.value;
      config.customOpenMidis = /** @type {HTMLInputElement | null} */ ($('virtuoso_lab-custom-open-midis'))?.value || '';
    }
    dependencies.applySelectedConfig(id, config, variation);
  }
  function unavailable() { status(catalog?.state.error ? 'Chromatic Warmup unavailable' : 'Chromatic Warmup loading…'); }
  function canGenerate() {
    if (unavailableReason) { status(unavailableReason); return false; }
    return true;
  }
  function initial() {
    if (!snapshots.has('custom')) snapshots.set('custom', {selection:{...selection, pathwayId:'custom'}, controls:captureTabControls(form()), file:null, variantId:null});
    const picker = select('virtuoso_lab-pathway'); if (!picker) return;
    const saved = stored(PATHWAY_KEY);
    const valid = saved && saved !== 'custom' && pathways[saved] && !isHidden(saved);
    if (!valid && saved?.startsWith('file-') && Array.from(picker.options).some(option => option.value === saved)) {
      selection = {...selection, pathwayId:saved};
      picker.value = saved;
      dependencies.changeModeView('guided', true);
      pendingInitial = {id:saved, visit};
      return;
    }
    const id = valid ? saved : dependencies.getContext().family === 'bass' ? 'bass_rh_pulse' : DEFAULT;
    if (!Array.from(picker.options).some(option => option.value === id)) return;
    picker.value = id;
    if (id === DEFAULT && !pathways[id]) {
      selection = {...selection, pathwayId:id};
      dependencies.changeModeView('guided', true);
      if (!catalog?.state.error) pendingInitial = {id, visit};
      else fallbackLadder();
      return;
    }
    applyPathway(id); save(PATHWAY_KEY, id);
  }
  function syncCatalog() {
    if (!active) return;
    displayPracticeCatalog(catalog?.state, pathways, DEFAULT, select('virtuoso_lab-file-select'), select('virtuoso_lab-pathway'), $('virtuoso_lab-file-load'), () => document.createElement('option'));
    dependencies.presentation.renderCatalog();
    const intended = pendingInitial;
    if (activeTab === 'guided' && intended && intended.visit === visit && catalog?.state.settled) {
      cancelInitial();
      if (select('virtuoso_lab-pathway')?.value === intended.id && selection.pathwayId === intended.id && (dependencies.getContext().family === 'guitar' || pathways[intended.id]?.instAgnostic)) {
        if (pathways[intended.id]) { applyPathway(intended.id); save(PATHWAY_KEY, intended.id); dependencies.regenerateSelectedConfig(); }
        else fallbackLadder();
      }
    }
    const currentId = selection.pathwayId;
    if (activeTab === 'guided' && !intended && currentId?.startsWith('file-') && pathways[currentId] && select('virtuoso_lab-pathway')?.value === currentId) {
      applyPathway(currentId); dependencies.regenerateSelectedConfig();
    }
    dependencies.presentation.refreshStatus();
  }
  function getLoader() {
    if (!loader) loader = createPracticeFileLoader(new URL('/api/plugins/virtuoso_lab/assets/practices/', window.location.href));
    return loader;
  }
  async function initialize() {
    if (!active) return catalog?.state;
    if (!catalog) catalog = createPracticeCatalog(getLoader(), pathways, FORM_CUES, syncCatalog);
    return catalog.initialize();
  }
  /** @param {string} id */
  async function chooseVariant(id) {
    if (!file?.variants?.some(variant => variant.id === id)) return;
    recover();
    dependencies.stopAndInvalidatePlayback('loop');
    variantId = id; syncFileControls();
    await dependencies.regenerateSelectedConfig();
  }
  async function loadFile() {
    if (activeTab !== 'custom') selectMode('custom');
    if (pendingInitial) applyPathway('custom');
    if (hasPathwayFile()) applyPathway('custom');
    // A failed replacement intentionally leaves the old file cleared.
    clearFile('cursor');
    const identity = requestIdentity, currentVisit = visit;
    const controller = new AbortController(); request = controller;
    const picker = select('virtuoso_lab-file-select'), id = picker?.value;
    const ownsRequest = () => identity === requestIdentity && request === controller && currentVisit === visit && active && select('virtuoso_lab-file-select') === picker;
    status('Loading file practice…');
    try {
      const loaded = await getLoader()(id, controller.signal);
      if (!ownsRequest()) return;
      const variants = loaded.variants;
      if (!variants?.length) throw new Error('Practice has no authored variants');
      file = loaded; variantId = variants[0].id;
      syncFileControls(); await dependencies.regenerateSelectedConfig();
    } catch (error) {
      if (ownsRequest()) status(`File practice error: ${error instanceof Error ? error.message : error}`);
    }
  }
  /** @param {string} mode */
  function selectMode(mode) {
    if (!['guided','custom','session','jam'].includes(mode) || mode === activeTab) return;
    const wasPending = !!pendingInitial;
    activate(mode);
    if (mode === 'jam' || mode === 'session') return;
    const retained = snapshots.get(mode);
    if (retained && (mode === 'custom' || (pathways[retained.selection.pathwayId || ''] && !isHidden(retained.selection.pathwayId || '')))) {
      selection = {...retained.selection};
      restoreTabControls(form(), retained.controls);
      // Rebuild options against restored key/scale/system BEFORE reselecting shape.
      syncShapes();
      restoreTabControls(form(), retained.controls);
      syncShapeHidden();
      file = retained.file; variantId = retained.variantId;
      const picker = select('virtuoso_lab-pathway'); if (picker) picker.value = selection.pathwayId || 'custom';
      dependencies.changeModeView(mode, mode === 'guided');
      if (mode === 'guided') dependencies.rederiveSelection?.();
      syncFileControls(); syncAnchorKeyLock();
      dependencies.regenerateSelectedConfig();
      return;
    }
    const picker = select('virtuoso_lab-pathway');
    if (!picker) { dependencies.changeModeView(mode, mode === 'guided'); return; }
    if (mode === 'custom') picker.value = 'custom';
    else {
      const saved = stored(PATHWAY_KEY), family = dependencies.getContext().family;
      if (family === 'guitar' && !pathways[DEFAULT] && (wasPending || saved === DEFAULT)) { initial(); return; }
      const valid = saved && saved !== 'custom' && pathways[saved] && !isHidden(saved);
      const id = selection.pathwayId;
      const activeOK = id && id !== 'custom' && pathways[id] && !isHidden(id);
      picker.value = valid ? saved : activeOK ? id : family === 'bass' ? 'bass_rh_pulse' : DEFAULT;
      if (!pathways[picker.value] || isHidden(picker.value)) {
        const fallback = Array.from(picker.options).find(option => option.value !== 'custom' && pathways[option.value]?.base && !isHidden(option.value));
        if (!fallback) { dependencies.changeModeView(mode, true); block('No compatible Ladder lesson. Change Setup to recover.'); return; }
        picker.value = fallback.value;
      }
    }
    applyPathway(picker.value);
    if (picker.value !== 'custom') save(PATHWAY_KEY,picker.value);
    if (!pendingInitial) dependencies.regenerateSelectedConfig();
    if (retained) status('Previous Ladder lesson unavailable. Selected a compatible lesson; Setup was not changed.');
  }
  function resumeMode() { const mode = stored(MODE_KEY); if (mode === 'custom' || mode === 'session' || mode === 'jam') selectMode(mode); }
  /** @param {number} index */
  function setTier(index) { selection = {...selection, tierIndex:index}; }
  /** @param {SelectionPathway | null | undefined} pathway @param {number} index */
  function applyTier(pathway, index) { for (const [name,value] of practiceTierFields(pathway,index)) setFieldSilent(name,value); }
  /** @param {string | null} id */
  function browseBand(id) { selection = {...selection, bandId:id}; }
  /** @param {string} id @param {Record<string, unknown>} config */
  function tierConfig(id, config) {
    for (const [name,value] of practiceTierFields(pathways[id],selection.tierIndex)) config[name] = name === 'bpm' || name === 'bars' ? Number(value) : value;
  }
  /** @param {number} direction */
  function stepPosition(direction) {
    if (positionStepperIsShapeMode()) {
      const picker = select('virtuoso_lab-shape'); if (!picker?.options.length) return;
      const length = picker.options.length;
      picker.selectedIndex = (picker.selectedIndex + direction + length) % length;
      picker.dispatchEvent(new Event('change',{bubbles:true}));
      dependencies.presentation.renderPosition(); return;
    }
    const id = selection.pathwayId, pathway = id && id !== 'custom' ? pathways[id] : null;
    if (!pathway?.vary || pathway.vary.length < 2) return;
    const length = pathway.vary.length;
    applyPathway(/** @type {string} */ (id), ((selection.variationIndex + direction) % length + length) % length);
    dependencies.regenerateSelectedConfig();
  }
  function syncAnchorKeyLock() {
    const key = /** @type {HTMLSelectElement | null} */ (document.querySelector('#virtuoso_lab-controls [name="key"]'));
    if (!key) return;
    const locked = !!select('virtuoso_lab-anchor-station')?.value && !!selection.pathwayId && selection.pathwayId !== 'custom';
    key.classList.toggle('virtuoso_lab-key-locked',locked); key.setAttribute('aria-disabled',locked ? 'true' : 'false');
    const label = key.closest('label');
    if (label) label.title = locked ? 'This lesson anchors on your lowest string — the key is derived from your tuning (change it in Setup).' : '';
  }
  function syncShapeHidden() {
    const system = select('virtuoso_lab-fretboard-system'), shape = select('virtuoso_lab-shape');
    const hidden = /** @type {HTMLInputElement | null} */ ($('virtuoso_lab-caged-shape-value'));
    if (shape && hidden && system?.value === 'caged' && shape.value) hidden.value = shape.value;
  }
  function syncShapes() {
    const picker = select('virtuoso_lab-shape'); if (!picker) return;
    const systemPicker = select('virtuoso_lab-fretboard-system');
    const system = systemPicker ? systemPicker.value : 'caged';
    const key = /** @type {HTMLSelectElement | null} */ (document.querySelector('#virtuoso_lab-controls [name="key"]'));
    const scale = /** @type {HTMLSelectElement | null} */ (document.querySelector('#virtuoso_lab-controls [name="scale"]'));
    const keyPc = key ? NOTE_ALIASES[key.value] ?? 0 : 0, scaleId = scale ? scale.value : 'major';
    const setup = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="stringSetup"]'));
    const opens = (STRING_SETUPS[setup?.value || 'guitar_6_standard'] || STRING_SETUPS.guitar_6_standard).openMidis, previous = picker.value;
    picker.replaceChildren();
    if (!isShapeAwareSystem(system)) return;
    const order = shapeOrderForKey(keyPc,system,scaleId,opens);
    if (!order.length) {
      const option = document.createElement('option'); option.value = ''; option.textContent = '(not available in this key)'; option.disabled = true;
      picker.appendChild(option); return;
    }
    for (const shape of order) {
      const resolved = fretWindowForShape(keyPc,system,shape,scaleId,opens), option = document.createElement('option');
      option.value = String(shape);
      const fret = resolved?.fretMin;
      const position = fret == null ? '' : fret === 0 ? 'open position' : `${fret}${fret === 1 ? 'st' : fret === 2 ? 'nd' : fret === 3 ? 'rd' : 'th'} position`;
      option.textContent = resolved ? `${resolved.displayName} (${position})` : String(shape);
      option.title = fret == null ? '' : `frets ${fret}–${resolved?.fretMax}`;
      picker.appendChild(option);
    }
    picker.value = order.map(String).includes(previous) ? previous : String(order[0]);
    const hidden = /** @type {HTMLInputElement | null} */ ($('virtuoso_lab-caged-shape-value'));
    if (hidden && system === 'caged') hidden.value = picker.value || 'C';
  }
  /** @param {string} id @param {Record<string, unknown>} config @param {Record<string, unknown>} variation */
  function selectShape(id,config,variation) {
    const picker = select('virtuoso_lab-shape'), pathway = pathways[id];
    if (!picker || !pathway?.base) return;
    const system = String(config.fretboardSystem || 'caged');
    const key = /** @type {HTMLSelectElement | null} */ ($('virtuoso_lab-controls')?.querySelector('[name="key"]'));
    const keyPc = key ? NOTE_ALIASES[key.value] ?? 0 : 0, scale = String(config.scale || 'major');
    const opens = STRING_SETUPS.guitar_6_standard.openMidis;
    let chosen = config.shape;
    if (chosen == null && isShapeAwareSystem(system)) {
      const hint = variation.fretMin != null ? variation.fretMin : pathway.base.fretMin;
      const order = shapeOrderForKey(keyPc,system,scale,opens);
      let closest = order[0], distance = Infinity;
      for (const shape of order) {
        const resolved = fretWindowForShape(keyPc,system,shape,scale,opens); if (!resolved) continue;
        const delta = Math.abs(resolved.fretMin - (Number(hint) || 0));
        if (delta < distance) { closest = shape; distance = delta; }
      }
      chosen = closest || defaultShapeForSystem(system,keyPc,scale,opens);
    }
    syncShapes();
    if (chosen != null) { picker.value = String(chosen); syncShapeHidden(); }
  }
  /** @param {string | null} id */
  function syncScaleDropdown(id) {
    const picker = select('virtuoso_lab-pathway-scale'), wrap = $('virtuoso_lab-pathway-scale-wrap');
    if (!picker) return;
    const scales = id && id !== 'custom' ? pathways[id]?.scales || [] : [];
    if (!scales.length) { if (wrap) wrap.style.display = 'none'; return; }
    if (wrap) wrap.style.display = '';
    /** @type {Record<string, string | null>} */
    const labels = {};
    document.querySelectorAll('[name="scale"] option').forEach(node => { const option = /** @type {HTMLOptionElement} */ (node); labels[option.value] = option.textContent; });
    picker.replaceChildren();
    const current = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="scale"]'))?.value || '';
    for (const scale of scales) {
      const option = document.createElement('option'); option.value = scale; option.textContent = labels[scale] || scale;
      if (scale === current) option.selected = true;
      picker.appendChild(option);
    }
    if (!scales.includes(current)) { picker.value = scales[0]; setFieldSilent('scale',scales[0]); }
  }
  function dropIfUnplayable() {
    if (activeTab !== 'guided') return false;
    if (!unavailableReason && selection.pathwayId && pathways[selection.pathwayId] && !isHidden(selection.pathwayId)) return false;
    fallbackLadder(); return true;
  }
  function fallbackLadder() {
    const fallback = Object.keys(pathways).find(id => id !== 'custom' && pathways[id]?.base && !isHidden(id));
    dependencies.stopAndInvalidatePlayback('loop');
    dependencies.changeModeView('guided', true);
    if (fallback) { applyPathway(fallback); dependencies.regenerateSelectedConfig(); status('Selected a compatible Ladder lesson for your instrument.'); }
    else block('No compatible Ladder lesson. Change Setup to recover.');
  }
  /** @param {string} name */
  function controlChanged(name) {
    if (pendingInitial) applyPathway('custom');
    const leavingFile = name === 'practiceType' && !!file;
    if (name === 'practiceType') { if (hasPathwayFile()) applyPathway('custom'); clearFile(); }
    return leavingFile;
  }
  /** @param {ReturnType<import('./practice-config.js').readConfig>} cfg */
  function selectedConfig(cfg) {
    if (unavailableReason) throw new Error(unavailableReason);
    if (activeTab === 'custom' && !file && !offerable(cfg.practiceType, dependencies.getContext().family)) {
      cfg.practiceType = 'scale'; cfg.mode = 'scale'; setFieldSilent('practiceType','scale');
      status('Previous Custom practice is incompatible. Selected Scale; your generated settings and Setup are retained.');
    }
    const selected = /** @type {ReturnType<import('./practice-config.js').readConfig> & {practiceFile?: Practice, practiceVariantId?: string | null}} */ (cfg);
    if (file) { selected.practiceFile = file; selected.practiceVariantId = variantId; }
    const pathway = pathways[selection.pathwayId || ''];
    if (!file && pathway?.practiceFile && hasPathwayFile()) Object.assign(cfg, catalogPathwayConfig({practiceFile:pathway.practiceFile}, selection.variationIndex, selection.tierIndex, cfg));
    return cfg;
  }
  /** @param {'files' | 'selection' | 'position'} group */
  function mount(group) {
    if (mounted.has(group)) return;
    mounted.add(group);
    const currentVisit = visit;
    /** @param {string} id @param {string} event @param {(event: Event) => unknown} action */
    function listen(id,event,action) {
      const node = $(id); if (!node) return;
      const handler = (/** @type {Event} */ ev) => { if (active && currentVisit === visit && $(id) === node) return action(ev); };
      node.addEventListener(event,handler); removers.push(() => node.removeEventListener(event,handler));
    }
    if (group === 'files') {
      syncCatalog();
      listen('virtuoso_lab-file-select','change',cancelLoad);
      listen('virtuoso_lab-file-load','click',loadFile);
      listen('virtuoso_lab-file-variant','change',ev => chooseVariant(/** @type {HTMLSelectElement} */ (ev.target).value));
      listen('virtuoso_lab-file-next','click',() => { const variants = file?.variants; if (!variants?.length) return; const index = variants.findIndex(variant => variant.id === variantId); return chooseVariant(variants[(index + 1) % variants.length].id); });
      listen('virtuoso_lab-file-unload','click',() => { clearFile(); return dependencies.regenerateSelectedConfig(); });
      return;
    }
    if (group === 'position') {
      listen('virtuoso_lab-shape-prev','click',() => stepPosition(-1));
      listen('virtuoso_lab-shape-next','click',() => stepPosition(1));
      const refresh = () => { syncShapes(); syncShapeHidden(); dependencies.presentation.renderPosition(); };
      listen('virtuoso_lab-fretboard-system','change',refresh);
      for (const name of ['key','scale']) {
        const node = $('virtuoso_lab-controls')?.querySelector('[name="' + name + '"]'); if (!node) continue;
        const handler = () => { if (active && currentVisit === visit && $('virtuoso_lab-controls')?.querySelector('[name="' + name + '"]') === node) refresh(); };
        node.addEventListener('change',handler); removers.push(() => node.removeEventListener('change',handler));
      }
      return;
    }
    listen('virtuoso_lab-pathway','change',() => {
      const picker = select('virtuoso_lab-pathway'); if (!picker) return;
      if (picker.value === DEFAULT && !pathways[DEFAULT]) { unavailable(); return; }
      const wasPending = !!pendingInitial;
      const needsPreview = dependencies.getContext().hasBundle || activeTab !== (picker.value === 'custom' ? 'custom' : 'guided');
      applyPathway(picker.value);
      // Custom is a mode, not a lesson to restore when returning to the Ladder.
      if (picker.value !== 'custom') save(PATHWAY_KEY,picker.value);
      if (wasPending || needsPreview || hasPathwayFile()) return dependencies.regenerateSelectedConfig();
    });
    for (const mode of ['guided','custom','session','jam']) listen('virtuoso_lab-mode-' + mode,'click',() => selectMode(mode));
    listen('virtuoso_lab-mode-select','change',ev => selectMode(/** @type {HTMLSelectElement} */ (ev.target).value));
  }
  function leave() {
    active = false; visit++; catalog?.cancel();
    for (const remove of removers) remove(); removers = []; mounted.clear();
    cancelLoad(); dependencies.stopAndInvalidatePlayback('loop');
  }
  function enter() {
    active = true;
    dependencies.changeModeView(activeTab);
    if (activeTab === 'guided' || activeTab === 'custom') dependencies.changeModeView(activeTab, activeTab === 'guided');
    mount('files'); mount('position'); mount('selection'); syncFileControls(); syncAvailability();
    if (pendingInitial && activeTab === 'guided') initial();
    return initialize();
  }
  return {get pathwayId() {return selection.pathwayId;}, get variationIndex() {return selection.variationIndex;}, get tierIndex() {return selection.tierIndex;}, get bandId() {return selection.bandId;}, get file() {return file;}, get variantId() {return variantId;}, get pendingInitial() {return pendingInitial;}, get active() {return active;}, get catalogState() {return catalog?.state;},
    get activeTab() {return activeTab;}, get unavailableReason() {return unavailableReason;}, canGenerate, block, recover,
    applyPathway, initial, selectMode, resumeMode, setTier, applyTier, browseBand, selectedConfig, tierConfig, isHidden, bandFor, dropIfUnplayable, controlChanged, syncScaleDropdown, syncAnchorKeyLock, syncShapes, syncShapeHidden, selectShape, cancelInitial, beforeConfig, cancelLoad, clearFile, syncFileControls, hasPathwayFile, loadFile, chooseVariant, initialize, mount, leave, enter};
}
