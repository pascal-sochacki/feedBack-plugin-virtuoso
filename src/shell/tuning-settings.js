// SPDX-License-Identifier: AGPL-3.0-only
import { STRING_SETUPS, TUNING_PRESETS, TUNING_TO_SETUP, parseNoteName, midiToNoteName } from '../core/instrument-tuning.js';

/** @typedef {{name: string, midis: number[]}} HostTuning */
/** @typedef {{id: string, name: string, family: string, string_count: number, midis?: number[]}} SavedTuning */
/** @param {string} id */
const $ = id => document.getElementById(id);
/** @param {string} id */
const valueElement = id => /** @type {HTMLInputElement | HTMLSelectElement | null} */ ($(id));
const setupElement = () => /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="stringSetup"]'));
/** @param {number[]} a @param {number[]} b */
const sameMidis = (a, b) => a.length === b.length && a.every((m, i) => m === b[i]);
/** @param {string} family @param {number} count */
const presetsFor = (family, count) => TUNING_PRESETS[/** @type {keyof typeof TUNING_PRESETS} */ (`${family}_${count}`)] || [];

/**
 * The inner form owns tuning selection and its cache, not L1 persistence or playback.
 * Host entries and eligibility are read at action time, never captured at construction.
 * @param {{hostEntries: (family: string, count: number) => HostTuning[],
 * onDeclaration: () => void, onCustomChange: (commit: boolean, includeFile: boolean) => void,
 * onSelection: () => void, onDisplay: () => void}} context
 */
export function createTuningSettings(context) {
  /** @type {SavedTuning[]} */
  let savedTunings = [];
  /** @type {Array<() => void>} */
  let listeners = [];
  /** @type {Array<() => void>} */
  let inputListeners = [];
  let mounted = false;
  let displayMounted = false;
  let visit = 0;
  let inputsVersion = 0;

  function family() {
    const el = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="instrument"]'));
    return el?.value === 'bass' ? 'bass' : 'guitar';
  }
  function count() { return (STRING_SETUPS[setupElement()?.value || ''] || STRING_SETUPS.guitar_6_standard).openMidis.length; }
  /** @param {number[]} midis */
  function commit(midis) { const hidden = valueElement('virtuoso_lab-custom-open-midis'); if (hidden) hidden.value = midis.join(','); }
  function clearInputListeners() { inputsVersion++; for (const remove of inputListeners) remove(); inputListeners = []; }
  /** @param {boolean} [commitEdit] */
  function edit(commitEdit = false) {
    const inputs = document.querySelectorAll('.virtuoso_lab-custom-tuning-input');
    /** @type {number[]} */
    const midis = [];
    let valid = true;
    for (const node of Array.from(inputs)) {
      const input = /** @type {HTMLInputElement} */ (node);
      const midi = parseNoteName(input.value);
      if (midi == null) { input.classList.add('invalid'); valid = false; }
      else { input.classList.remove('invalid'); midis.push(midi); }
    }
    if (!valid) return;
    commit(midis);
    context.onDeclaration();
    context.onCustomChange(commitEdit, true);
  }
  function syncInputs() {
    const sel = valueElement('virtuoso_lab-tuning-select'), wrap = $('virtuoso_lab-custom-tuning');
    const inputs = $('virtuoso_lab-custom-tuning-inputs'), hidden = valueElement('virtuoso_lab-custom-open-midis');
    if (!sel || !wrap || !inputs || !hidden) return;
    const custom = sel.value === 'custom';
    wrap.style.display = custom ? 'flex' : 'none';
    if (!custom) return;
    const n = count();
    let midis = hidden.value ? hidden.value.split(',').map(Number).filter(Number.isFinite) : null;
    if (!midis || midis.length !== n) {
      midis = (STRING_SETUPS[setupElement()?.value || ''] || STRING_SETUPS.guitar_6_standard).openMidis.slice();
      if (midis.length !== n) {
        while (midis.length < n) midis.unshift(midis[0] - 5);
        midis = midis.slice(0, n);
      }
    }
    clearInputListeners();
    inputs.innerHTML = '';
    const version = inputsVersion;
    for (let i = 0; i < n; i++) {
      const input = document.createElement('input');
      input.type = 'text'; input.className = 'virtuoso_lab-custom-tuning-input';
      input.value = midiToNoteName(midis[i]); input.dataset.idx = String(i); input.spellcheck = false;
      for (const type of mounted ? ['input', 'blur'] : []) {
        const handler = () => { if (mounted && version === inputsVersion) edit(type === 'blur'); };
        input.addEventListener(type, handler);
        inputListeners.push(() => input.removeEventListener(type, handler));
      }
      inputs.appendChild(input);
    }
    // Seed the hidden field before an immediate readConfig, even without typing.
    commit(midis);
  }
  function sync() {
    const sel = /** @type {HTMLSelectElement | null} */ ($('virtuoso_lab-tuning-select'));
    if (!sel) return;
    const fam = family(), n = count(), presets = presetsFor(fam, n);
    const setupName = setupElement()?.value || `${fam}_${n}_standard`;
    const customStr = valueElement('virtuoso_lab-custom-open-midis')?.value || '';
    const custom = customStr ? customStr.split(',').map(Number).filter(Number.isFinite) : null;
    const effective = custom && custom.length === n ? custom : (STRING_SETUPS[setupName]?.openMidis || []);
    sel.innerHTML = '';
    /** @type {string | null} */
    let activeId = null;
    /** Saved rows retain their own array-iteration direction. @param {string} label @param {Array<{id: string, label: string, midis: number[]}>} rows @param {boolean} [saved] */
    function group(label, rows, saved = false) {
      const group = document.createElement('optgroup'); group.label = label;
      for (const row of rows) {
        const opt = document.createElement('option');
        opt.value = row.id; opt.textContent = row.label; opt.dataset.midis = row.midis.join(',');
        group.appendChild(opt);
        if (!activeId && (saved ? sameMidis(row.midis, effective) : sameMidis(effective, row.midis))) activeId = row.id;
      }
      if (sel) sel.appendChild(group);
    }
    // Keep stable built-in IDs and first-match precedence: built-in, host, saved.
    group('Built-in', presets);
    const host = context.hostEntries(fam, n).filter(e => !presets.some(p => sameMidis(p.midis, e.midis)));
    if (host.length) group('FeedBack', host.map(e => ({id:`host:${e.name}`, label:e.name, midis:e.midis})));
    const mine = savedTunings.filter(t => t.family === fam && t.string_count === n);
    if (mine.length) group('Saved', mine.map(t => ({id:`saved:${t.id}`, label:t.name, midis:t.midis || []})), true);
    const opt = document.createElement('option'); opt.value = 'custom'; opt.textContent = 'Custom…'; sel.appendChild(opt);
    if (!activeId && custom && custom.length === n) activeId = 'custom';
    sel.value = activeId || (sel.options[0] && sel.options[0].value) || 'custom';
    syncInputs(); context.onDisplay();
  }
  async function load() {
    try {
      const response = await fetch('/api/plugins/virtuoso_lab/tunings');
      if (!response.ok) return;
      const body = await response.json();
      savedTunings = Array.isArray(body.tunings) ? body.tunings : [];
    } catch (_) { savedTunings = []; }
    // Cache completion is not a declaration and reads the current family/count.
    sync();
  }
  async function save() {
    const midis = (valueElement('virtuoso_lab-custom-open-midis')?.value || '').split(',').map(Number).filter(Number.isFinite);
    if (!midis.length) return;
    const fam = family(), n = count(); if (midis.length !== n) return;
    const name = window.prompt('Save tuning as:', midis.map(midiToNoteName).join(' ')); if (!name) return;
    try {
      const response = await fetch('/api/plugins/virtuoso_lab/tunings', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:name.trim(), family:fam, string_count:n, midis})});
      if (!response.ok) { console.warn('[Virtuoso] save tuning failed', response.status, await response.text()); return; }
      await load();
    } catch (e) { console.warn('[Virtuoso] save tuning error', e); }
  }
  function select() {
    const sel = /** @type {HTMLSelectElement | null} */ ($('virtuoso_lab-tuning-select')); if (!sel) return;
    const hidden = /** @type {HTMLInputElement} */ ($('virtuoso_lab-custom-open-midis'));
    if (sel.value && (sel.value.startsWith('saved:') || sel.value.startsWith('host:'))) {
      const midis = (sel.options[sel.selectedIndex]?.dataset.midis || '').split(',').map(Number).filter(Number.isFinite);
      if (midis.length) {
        const fam = family(), n = count(), setup = setupElement();
        if (setup) { setup.value = `${fam}_${n}_standard`; commit(midis); setup.dispatchEvent(new Event('change', {bubbles:true})); }
        syncInputs(); context.onDeclaration();
      }
      return;
    }
    if (sel.value === 'custom') {
      if (!hidden.value) commit((STRING_SETUPS[setupElement()?.value || ''] || STRING_SETUPS.guitar_6_standard).openMidis.slice());
      syncInputs(); context.onDeclaration(); context.onCustomChange(true, false); return;
    }
    hidden.value = '';
    const fam = family(), n = count(), preset = presetsFor(fam, n).find(p => p.id === sel.value);
    if (!preset) return;
    const setup = /** @type {HTMLSelectElement} */ (setupElement());
    const setupName = TUNING_TO_SETUP[/** @type {keyof typeof TUNING_TO_SETUP} */ (`${fam}_${n}_${preset.id}`)];
    if (setupName && STRING_SETUPS[setupName]) setup.value = setupName;
    else { setup.value = `${fam}_${n}_standard`; commit(preset.midis); }
    setup.dispatchEvent(new Event('change', {bubbles:true}));
    syncInputs(); context.onDeclaration();
  }
  function mount() {
    if (mounted) return;
    mounted = true; const identity = ++visit;
    /** @param {string} id @param {string} type @param {() => void | Promise<void>} action */
    function listen(id, type, action) {
      const el = $(id); if (!el) return;
      const handler = () => { if (mounted && identity === visit) return action(); };
      el.addEventListener(type, handler); listeners.push(() => el.removeEventListener(type, handler));
    }
    listen('virtuoso_lab-tuning-select', 'change', () => { select(); context.onSelection(); });
    listen('virtuoso_lab-save-tuning', 'click', save);
  }
  function mountDisplay() {
    if (displayMounted) return;
    displayMounted = true;
    const identity = visit, el = $('virtuoso_lab-tuning-select'); if (!el) return;
    const handler = () => { if (mounted && identity === visit) context.onDisplay(); };
    el.addEventListener('change', handler); listeners.push(() => el.removeEventListener('change', handler));
  }
  function unmount() { mounted = false; displayMounted = false; visit++; for (const remove of listeners) remove(); listeners = []; clearInputListeners(); }
  return {sync, syncInputs, load, mount, mountDisplay, unmount};
}
