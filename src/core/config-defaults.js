// SPDX-License-Identifier: AGPL-3.0-only
import { NOTE_ALIASES } from './pitch.js';
import { STYLE_PALETTES } from './style-palettes.js';
import { isShapeAwareSystem, defaultShapeForSystem, fretWindowForShape } from './fretboard-shapes.js';
/** @param {string} instrument @param {number} [stringCount] */
export function defaultFretboardSystem(instrument, stringCount) {
  if (instrument === 'bass') return 'position';
  return (stringCount || 6) > 6 ? '3nps' : 'caged';
}

/** @param {{fretboardSystem: string, instrument?: string, key: string, scale: string, shape?: string | number | null}} cfg @param {number[]} openMidis */
export function resolveCurrentShape(cfg, openMidis) {
  if (!isShapeAwareSystem(cfg.fretboardSystem)) return null;
  // Bass never resolves a guitar shape system (defense-in-depth: the count
  // guards alone pass a 6-string bass, whose all-4ths tuning breaks the
  // EADGBE-interval templates — notes land a semitone flat on the top two
  // strings; bass-pedagogy 2026-07-10). The UI hides shape controls for bass,
  // but a programmatic config (preset import, host sync) must be safe too.
  if (cfg.instrument === 'bass') return null;
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  /** @type {string | number | null | undefined} */
  let shape = cfg.shape;
  // Coerce numeric shape ids for 3NPS (form values are strings).
  if (cfg.fretboardSystem === '3nps') shape = parseInt(/** @type {string} */ (shape), 10);
  if (shape == null || shape === '' || (typeof shape === 'number' && isNaN(shape))) {
    shape = defaultShapeForSystem(cfg.fretboardSystem, keyPc, cfg.scale, openMidis);
  }
  const resolved = fretWindowForShape(keyPc, cfg.fretboardSystem, /** @type {string | number} */ (shape), cfg.scale, openMidis);
  if (!resolved) return null;
  return { shape, resolved };
}

/** @param {string} styleId @param {{progressionIdx?: number, scaleIdx?: number, progression?: string, scale?: string, key?: string}} [opts] */
export function stylePaletteConfig(styleId, opts) {
  const pal = STYLE_PALETTES[styleId];
  if (!pal) return null;
  opts = opts || {};
  /** @param {string[]} arr @param {number} idx @param {string | undefined} override */
  const at = (arr, idx, override) => override != null ? override
    : arr[(((idx | 0) % arr.length) + arr.length) % arr.length];
  /** @type {{style: string, progression: string, scale: string, key: string, chordDepth: string, chordOverride: string, swing: string, backingStyle: string, guideTones: boolean, audioProfile?: string}} */
  const out = {
    style: styleId,
    progression: at(pal.progressions, opts.progressionIdx || 0, opts.progression),
    scale:       at(pal.leadScales,   opts.scaleIdx || 0,       opts.scale),
    key:         opts.key || pal.defaultKey,
    chordDepth:  pal.chordDepth,
    chordOverride: pal.chordOverride,
    swing:       pal.feel.swing,
    backingStyle: pal.feel.backingStyle,
    guideTones:  pal.guideTones,        // advisory metadata for the consumer
  };
  if (pal.audioProfile) out.audioProfile = pal.audioProfile;
  return out;
}
