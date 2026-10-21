// SPDX-License-Identifier: AGPL-3.0-only
import { STRING_SETUPS } from './instrument-tuning.js';
import { parseMeter } from './timing.js';
import { isShapeAwareSystem } from './fretboard-shapes.js';
import { defaultFretboardSystem, resolveCurrentShape } from './config-defaults.js';
/** @param {import('./session-types.js').Segment} segment @param {import('./session-types.js').Session} session @returns {import('./generation-types.js').GenerationConfig} */
export function buildSegmentConfig(segment, session) {
  const stringSetup = session.stringSetup || 'guitar_6_standard';
  const setup = STRING_SETUPS[stringSetup] || STRING_SETUPS.guitar_6_standard;
  // Alt-tuning (Workout fix 2026-06-09): the session may carry the player's
  // customOpenMidis — set shell-side in onLaunchSession, only when the instrument
  // FAMILY matches, already applyTuningAdaptL1-resolved. LENGTH-GUARD it against
  // THIS setup's string count (a 6-string CSV must never land on a 4-string bass).
  // (Core-pure: reads only the passed `session`, no DOM/store.)
  /** @param {unknown} v */
  const _parseSegMidis = (v) => {
    const list = Array.isArray(v) ? v.slice()
      : (typeof v === 'string' && v.trim() ? v.split(',').map(s => parseInt(s, 10)).filter(Number.isFinite) : null);
    return (list && list.length === setup.openMidis.length) ? list : null;
  };
  const sessionTuning = _parseSegMidis(session.customOpenMidis);
  const raw = /** @type {Omit<import('./session-types.js').SegmentConfig, 'shapeNotes'> & {stringSetup: string, instrument: string, stringCount: number, shapeNotes?: import('./fretboard-shapes.js').ShapeNote[] | null}} */ (Object.assign({
    // Structural defaults
    key:'C', scale:'major', bpm:80, bars:4, direction:'up_down', sequence:'none',
    meter:'4/4',   // safety-net default so a meter-less config never yields meter.denominator undefined
    // fretboardSystem: instrument/count-aware (bass → position, guitar 7/8 →
    // 3nps, guitar 6 → caged); a segment's own coded system still wins (a rung
    // that TEACHES a CAGED shape stays a CAGED lesson on its coded strings).
    subdivision:'eighth', fretboardSystem: defaultFretboardSystem(setup.instrument, setup.openMidis.length), shape:'E', fretMin:0, fretMax:5,
    chordDepth:'seventh', progression:'ii-V-I', chordOverride:'auto',
    chordScaleStrategy:'mode_of_moment', chromaticPattern:'1234', keyCycle:'none',
    repeatCount:1, advancedMode:true, voices:'thirds_only', renderer:'highway_3d',
    audio:{ notes:false, metronome:true, harmony:false },
  }, segment.config || {}, {
    // Always derive these from the session's string setup
    stringSetup, instrument:setup.instrument,
    stringCount:setup.openMidis.length,
    // Segment kind drives the mode dispatch
    mode: segment.kind, practiceType: segment.kind,
  }));
  // Normalize customOpenMidis to an ARRAY — openMidisForConfig + the resolvers
  // expect an array (as readConfig produces), NOT a CSV string. A segment's OWN
  // tuning (an L3 rung CSV in segment.config) wins over the player's session
  // tuning; both length-guarded to this setup.
  const effTuning = _parseSegMidis(raw.customOpenMidis) || sessionTuning;
  if (effTuning) raw.customOpenMidis = effTuning; else delete raw.customOpenMidis;
  const effectiveOpenMidis = effTuning || setup.openMidis;
  // Parse meter string → object (e.g. '4/4' → { numerator:4, denominator:4, grouping:[4] })
  if (typeof raw.meter === 'string') raw.meter = parseMeter(raw.meter);
  // Resolve CAGED / 3NPS / Open shape into fretMin/fretMax + shapeNotes
  raw.shapeNotes = null; raw.shapeDisplayName = null;
  if (isShapeAwareSystem(/** @type {string} */ (raw.fretboardSystem))) {
    const resolved = resolveCurrentShape({ fretboardSystem:/** @type {string} */ (raw.fretboardSystem), instrument:raw.instrument, key:/** @type {string} */ (raw.key), scale:/** @type {string} */ (raw.scale), shape:raw.shape }, effectiveOpenMidis);
    if (resolved) {
      raw.shape = resolved.shape;
      raw.shapeNotes = resolved.resolved.notes;
      raw.shapeDisplayName = resolved.resolved.displayName;
      raw.fretMin = resolved.resolved.fretMin;
      raw.fretMax = resolved.resolved.fretMax;
    }
  }
  return /** @type {import('./generation-types.js').GenerationConfig} */ (/** @type {unknown} */ (raw));
}
