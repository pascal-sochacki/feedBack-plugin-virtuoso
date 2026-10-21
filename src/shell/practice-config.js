// SPDX-License-Identifier: AGPL-3.0-only
import { STRING_SETUPS } from '../core/instrument-tuning.js';
import { defaultFretboardSystem, resolveCurrentShape } from '../core/config-defaults.js';
import { isShapeAwareSystem } from '../core/fretboard-shapes.js';
import { parseMeter } from '../core/timing.js';
import { countInSubTicks } from '../core/count-in.js';
import { practiceFormDefaults } from '../core/practice-form-defaults.js';

/** @param {string} id */
const $ = id => document.getElementById(id);

/** The sole live DOM → plain generation cfg funnel. Preferences stay shell-owned.
 * @returns {import('../types/form-config.js').FormConfig}
 */
export function readConfig() {
  const form = /** @type {HTMLFormElement} */ ($('virtuoso-controls'));
  // This form contains text/check controls, not file uploads.
  const data = /** @type {{get: (name: string) => string | null}} */ (new FormData(form));
  const stringSetup = data.get('stringSetup') || 'guitar_6_standard';
  const setup = STRING_SETUPS[stringSetup] || STRING_SETUPS.guitar_6_standard;
  const raw = (data.get('customOpenMidis') || '').trim();
  const list = raw ? raw.split(',').map(s => parseInt(s, 10)).filter(Number.isFinite) : null;
  const customOpenMidis = list && list.length === setup.openMidis.length ? list : null;
  // Disabled advanced inputs disappear from FormData but still carry pathway windows.
  /** @param {string} name @param {string} fallback */
  const fretValue = (name, fallback) => {
    const el = /** @type {HTMLInputElement | null} */ (form.elements.namedItem(name));
    return el?.value || data.get(name) || fallback;
  };
  // HTML bounds alone cannot contain crafted links or programmatic field writes.
  let fretMin = Math.min(35, Math.max(0, parseInt(fretValue('fretMin', '0'), 10) || 0));
  let fretMax = Math.min(36, Math.max(fretMin + 1, parseInt(fretValue('fretMax', '5'), 10) || 5));
  const practiceType = data.get('practiceType') || data.get('mode') || 'scale';
  const advancedMode = data.get('advancedMode') === 'on';
  const fretboardSystem = (advancedMode && data.get('fretboardSystem')) || defaultFretboardSystem(setup.instrument, setup.openMidis.length);
  /** @type {string | number | null | undefined} */
  let shape = data.get('shape');
  let shapeNotes = null, shapeDisplayName = null;
  // Frame-window drills must never inherit the beginner CAGED window.
  if (isShapeAwareSystem(fretboardSystem) && practiceType !== 'chromatic' && practiceType !== 'spider') {
    const resolved = resolveCurrentShape({fretboardSystem, instrument:setup.instrument, key:data.get('key') || 'C', scale:data.get('scale') || 'major', shape}, customOpenMidis || setup.openMidis);
    if (resolved) {
      shape = resolved.shape; shapeNotes = resolved.resolved.notes; shapeDisplayName = resolved.resolved.displayName;
      fretMin = resolved.resolved.fretMin; fretMax = resolved.resolved.fretMax;
    }
  }
  return {
    mode:practiceType,
    practiceType,
    advancedMode,
    fretboardSystem,
    shape,
    shapeNotes,
    shapeDisplayName,
    cagedShape:advancedMode ? (data.get('cagedShape') || 'C') : 'C',
    voicingPosition:advancedMode ? (data.get('voicingPosition') || 'open') : 'open',
    strumPattern:data.get('strumPattern') || '',
    shapeWalk:advancedMode && String(data.get('shapeWalk') || '') === 'true',
    renderer:data.get('renderer') || localStorage.getItem('virtuoso.renderer') || 'highway_3d',
    instrument:setup.instrument,
    stringSetup,
    setupLabel:setup.label,
    customOpenMidis,
    stringCount:setup.openMidis.length,
    keyNominal:(data.get('keyNominal') || '').toString() || null,
    tuningOffset:parseInt(data.get('tuningOffset') || '0', 10) || 0,
    anchorStation:(data.get('anchorStation') || '').toString() || null,
    key:data.get('key') || 'C',
    scale:data.get('scale') || 'major',
    bpm:Math.max(30, Math.min(260, parseFloat(data.get('bpm') || '100'))),
    countInBars:(() => {
      const v = parseInt(data.get('countIn') || '', 10);
      let bars = Math.max(0, Math.min(8, Number.isFinite(v) ? v : 1));
      // Only the untouched one-bar default gets a gridded bar at fast density.
      try {
        if (bars === 1 && !localStorage.getItem('virtuoso.countInDefault')) {
          const m = parseMeter(data.get('meter'));
          if (m && countInSubTicks({subdivision:String(data.get('subdivision') || ''), meter:m}) >= 4) bars = 2;
        }
      } catch (_) {}
      return bars;
    })(),
    clickSubdiv:Math.max(1, Math.min(4, parseInt(data.get('clickSubdiv') || '1', 10) || 1)),
    meter:parseMeter(data.get('meter')),
    subdivision:data.get('subdivision') || 'eighth',
    direction:advancedMode ? (data.get('direction') || 'up_down') : 'up_down',
    repeatCount:advancedMode ? Math.max(1, Math.min(16, parseInt(data.get('repeatCount') || '1', 10))) : 1,
    sequence:advancedMode ? (data.get('sequence') || 'none') : 'none',
    harmonize:data.get('harmonize') === 'on',
    tremolo:data.get('tremolo') === 'on',
    chordScaleStrategy:advancedMode ? (data.get('chordScaleStrategy') || 'mode_of_moment') : 'mode_of_moment',
    fretMin,
    fretMax,
    bars:Math.max(1, Math.min(32, parseInt(data.get('bars') || '4', 10))),
    chordDepth:advancedMode ? (data.get('chordDepth') || 'triad') : 'triad',
    tritoneSub:advancedMode ? (data.get('tritoneSub') || 'off') : 'off',
    progression:practiceType === 'guide_tones'
      ? (data.get('guideToneProgression') || 'ii-V-I')
      : (advancedMode ? (data.get('progression') || 'diatonic') : 'diatonic'),
    chordOverride:advancedMode ? (data.get('chordOverride') || 'auto') : 'auto',
    backingStyle:data.get('backingStyle') || 'pad',
    swing:data.get('swing') || 'straight',
    drums:(data.get('drums') || '').toString(),
    chromaticPattern:data.get('chromaticPattern') || '1234',
    voices:data.get('voices') || 'thirds_only',
    keyCycle:data.get('keyCycle') || 'none',
    keyCycleLength:Math.max(2, Math.min(12, parseInt(data.get('keyCycleLength') || '4', 10))),
    bendTarget:data.get('bendTarget') || 'whole',
    pulseAccent:Math.max(0, Math.min(3, parseInt(data.get('pulseAccent') || '0', 10) || 0)),
    pulseOffbeat:data.get('pulseOffbeat') === 'on' || data.get('pulseOffbeat') === 'true',
    strokePolicy:(data.get('strokePolicy') || '').toString(),
    backingComp:(data.get('backingComp') || '').toString(),
    backingBass:(data.get('backingBass') || '').toString(),
    backingDensity:data.get('backingDensity') !== null && data.get('backingDensity') !== '' ? Math.max(0, Math.min(3, parseInt(data.get('backingDensity') || '', 10) || 0)) : undefined,
    backingPadDev:(() => { try { return localStorage.getItem('virtuoso.backingPad') === 'pad'; } catch (_) { return false; } })(),
    hertaAccent:Math.max(0, Math.min(3, parseInt(data.get('hertaAccent') || '0', 10) || 0)),
    hertaWalk:data.get('hertaWalk') === 'on' || data.get('hertaWalk') === 'true',
    motifCell:(data.get('motifCell') || '').toString(),
    motifPhase:(data.get('motifPhase') || '').toString(),
    spiderPair:(data.get('spiderPair') || '').toString(),
    pimaPattern:(data.get('pimaPattern') || '').toString(),
    sweepStrings:Math.max(0, Math.min(6, parseInt(data.get('sweepStrings') || '0', 10) || 0)),
    tapArp:(data.get('tapArp') || '').toString() === 'true',
    rhTechMode:data.get('rhTechMode') || 'pulse',
    rfoPattern:data.get('rfoPattern') || 'r5o',
    walkApproach:data.get('walkApproach') || 'scale',
    walkFeel:data.get('walkFeel') || 'four',
    audio:{
      notes:data.get('audioNotes') === 'on',
      metronome:data.get('audioMetronome') === 'on',
      harmony:data.get('audioHarmony') === 'on',
      profile:data.get('audioProfile') || '',
      brightness:Math.max(0, Math.min(1, parseFloat(data.get('brightness') || '')))
    }
  };
}

export function syncAdvancedMode() {
  const toggle = /** @type {HTMLInputElement | null} */ ($('virtuoso-advanced-toggle'));
  const enabled = !!toggle?.checked;
  $('virtuoso-root')?.classList.toggle('virtuoso-advanced', enabled);
  document.querySelectorAll('.virtuoso-advanced-only input, .virtuoso-advanced-only select, .virtuoso-advanced-only textarea, .virtuoso-advanced-only button').forEach(el => {
    /** @type {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement} */ (el).disabled = !enabled;
  });
}

/** @param {string} name @param {unknown} value */
export function setFieldSilent(name, value) {
  // Setup inputs can be associated by form="" without being form descendants.
  const field = /** @type {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null} */ (document.querySelector('#virtuoso-controls [name="' + name + '"]') || document.querySelector('[form="virtuoso-controls"][name="' + name + '"]'));
  if (!field) return;
  if (field.type === 'checkbox') /** @type {HTMLInputElement} */ (field).checked = !!value;
  else field.value = String(value);
}

/**
 * Instrument eligibility precedes practice-type writes; profile warming precedes
 * the final own-key overlay. Callers retain catalog/transport cancellation and L1.
 * @param {Record<string, unknown>} config
 * @param {{onInstrument: () => void, onProfile: (config: Record<string, unknown>) => void, onComplete: () => void}} context
 */
export function applyPracticeConfig(config, context) {
  if (Object.prototype.hasOwnProperty.call(config, 'advancedMode')) setFieldSilent('advancedMode', config.advancedMode);
  syncAdvancedMode();
  if (config.stringSetup && STRING_SETUPS[/** @type {string} */ (config.stringSetup)]) {
    setFieldSilent('stringSetup', config.stringSetup);
    context.onInstrument();
  }
  for (const [name,value] of practiceFormDefaults(config)) setFieldSilent(name,value);
  context.onProfile(config);
  for (const name of Object.keys(config)) if (name !== 'advancedMode') setFieldSilent(name,config[name]);
  context.onComplete();
}
