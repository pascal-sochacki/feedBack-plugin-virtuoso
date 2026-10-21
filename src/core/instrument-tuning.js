// SPDX-License-Identifier: AGPL-3.0-only

/** @typedef {{ stringSetup?: string, instrument?: string, customOpenMidis?: number[] }} InstrumentTuningConfig */

/** @type {Record<string, { label: string, instrument: string, openMidis: number[], tuning: number[] }>} */
export const STRING_SETUPS = {
  guitar_6_standard: { label:'6-string guitar — standard', instrument:'guitar', openMidis:[40,45,50,55,59,64], tuning:[0,0,0,0,0,0] },
  guitar_6_drop_d: { label:'6-string guitar — Drop D', instrument:'guitar', openMidis:[38,45,50,55,59,64], tuning:[-2,0,0,0,0,0] },
  guitar_7_standard: { label:'7-string guitar — standard', instrument:'guitar', openMidis:[35,40,45,50,55,59,64], tuning:[0,0,0,0,0,0,0] },
  // tuning was [2,0,…] — internally inconsistent metadata (implied a nonsense E
  // base for string 0; the 8-string family standard IS F#, offset 0 — matches the
  // host's STANDARD_OPEN_MIDIS["guitar-8"]). Inert for playback (openMidisForConfig
  // never reads .tuning) but live in chart.tuning: a host round-trip through that
  // offset would detune string 0 a whole step. Fixed 2026-07-10 (guitar-pedagogy).
  guitar_8_standard: { label:'8-string guitar — standard', instrument:'guitar', openMidis:[30,35,40,45,50,55,59,64], tuning:[0,0,0,0,0,0,0,0] },
  bass_4_standard: { label:'4-string bass — standard', instrument:'bass', openMidis:[28,33,38,43], tuning:[0,0,0,0] },
  bass_5_standard: { label:'5-string bass — standard low B', instrument:'bass', openMidis:[23,28,33,38,43], tuning:[0,0,0,0,0] },
  bass_6_standard: { label:'6-string bass — standard (B-E-A-D-G-C)', instrument:'bass', openMidis:[23,28,33,38,43,48], tuning:[0,0,0,0,0,0] }
};

// Curated tunings. Keyed by `${family}_${stringCount}` → array of options
// ({label, midis}). Order is from lowest to highest string (matches
// STRING_SETUPS.openMidis). Picking one of these maps to a stringSetup
// when the midis match a built-in preset; otherwise it's stored as a
// customOpenMidis override (see readConfig + openMidisForConfig).
// `offset:true` = an INTENT tag (tuning panel 2026-06-05, bass-pedagogy
// ruling): the player thinks of this tuning as the family standard
// TRANSPOSED (Eb/D standard — "everything down a step"), so a coded rung may
// adapt to it by uniform key+opens transposition (applyTuningAdaptL1).
// Untagged = a STRUCTURAL tuning at concert pitch (drop-X, BEAD, high-C,
// DADGAD, open-X): uniform-delta arithmetic alone MISCLASSIFIES these (BEAD
// is "a 5-string minus the G", numerically −5; high-C is numerically +5) —
// a bassist's B string is a B string, never "E down a fourth". Never
// classify by midis math; the tag decides.
export const TUNING_PRESETS = {
  guitar_6: [
    { id:'standard',     label:'Standard (E A D G B E)',      midis:[40,45,50,55,59,64], offset:true },
    { id:'drop_d',       label:'Drop D (D A D G B E)',        midis:[38,45,50,55,59,64] },
    { id:'drop_c',       label:'Drop C (C G C F A D)',        midis:[36,43,48,53,57,62] },
    { id:'drop_b',       label:'Drop B (B F# B E G# C#)',     midis:[35,42,47,52,56,61] },
    { id:'eb_standard',  label:'Eb Standard (down ½ step)',   midis:[39,44,49,54,58,63], offset:true },
    { id:'d_standard',   label:'D Standard (down 1 step)',    midis:[38,43,48,53,57,62], offset:true },
    // Host-parity uniform standards (2026-07-10): the host tuning table names
    // these; tagging them offset:true here keeps applyTuningAdaptL1's transpose
    // path working when they arrive via the host selector sync ("add a tagged
    // preset, don't grow a delta heuristic" — bass-pedagogy ruling).
    { id:'cs_standard',  label:'C# Standard (down 1½ steps)', midis:[37,42,47,52,56,61], offset:true },
    { id:'c_standard',   label:'C Standard (down 2 steps)',   midis:[36,41,46,51,55,60], offset:true },
    { id:'dadgad',       label:'DADGAD',                       midis:[38,45,50,55,57,62] },
    { id:'open_g',       label:'Open G (D G D G B D)',        midis:[38,43,50,55,59,62] },
    { id:'open_d',       label:'Open D (D A D F# A D)',       midis:[38,45,50,54,57,62] },
  ],
  guitar_7: [
    { id:'standard',     label:'Standard (B E A D G B E)',    midis:[35,40,45,50,55,59,64], offset:true },
    { id:'drop_a',       label:'Drop A (A E A D G B E)',      midis:[33,40,45,50,55,59,64] },
    // Host-parity uniform standards (see the guitar_6 note).
    { id:'bb_standard',  label:'Bb Standard (down ½ step)',   midis:[34,39,44,49,54,58,63], offset:true },
    { id:'a_standard',   label:'A Standard (down 1 step)',    midis:[33,38,43,48,53,57,62], offset:true },
  ],
  guitar_8: [
    { id:'standard',     label:'Standard (F# B E A D G B E)', midis:[30,35,40,45,50,55,59,64], offset:true },
    { id:'drop_e',       label:'Drop E (E B E A D G B E)',    midis:[28,35,40,45,50,55,59,64] },
    // Host-parity uniform standards (see the guitar_6 note).
    { id:'e_standard',   label:'E Standard (down 1 step)',    midis:[28,33,38,43,48,53,57,62], offset:true },
  ],
  bass_4: [
    { id:'standard',     label:'Standard (E A D G)',          midis:[28,33,38,43], offset:true },
    { id:'drop_d',       label:'Drop D (D A D G)',            midis:[26,33,38,43] },
    { id:'eb_standard',  label:'Eb Standard (down ½ step)',   midis:[27,32,37,42], offset:true },
    { id:'bead',         label:'BEAD (low B)',                midis:[23,28,33,38] },
  ],
  bass_5: [
    { id:'standard',     label:'Standard low B (B E A D G)',  midis:[23,28,33,38,43], offset:true },
    { id:'standard_hc',  label:'Standard high C (E A D G C)', midis:[28,33,38,43,48] },
    { id:'drop_a',       label:'Drop A (A E A D G)',          midis:[21,28,33,38,43] },
  ],
  bass_6: [
    { id:'standard',     label:'Standard (B E A D G C)',      midis:[23,28,33,38,43,48], offset:true },
  ],
};
// Maps `${family}_${count}_${tuningId}` → stringSetup name when the preset
// matches a built-in entry; otherwise the chosen tuning gets stored as
// customOpenMidis on the config.
export const TUNING_TO_SETUP = {
  guitar_6_standard: 'guitar_6_standard',
  guitar_6_drop_d:   'guitar_6_drop_d',
  guitar_7_standard: 'guitar_7_standard',
  guitar_8_standard: 'guitar_8_standard',
  bass_4_standard:   'bass_4_standard',
  bass_5_standard:   'bass_5_standard',
  bass_6_standard:   'bass_6_standard',
};

/** @param {InstrumentTuningConfig} cfg */
export function openMidisForConfig(cfg) {
  // A customOpenMidis override on the config wins over the stringSetup's
  // default — that's how per-string tunings (DADGAD, baritone, custom)
  // flow from the form into the generators.
  if (Array.isArray(cfg.customOpenMidis) && cfg.customOpenMidis.length) return cfg.customOpenMidis.slice();
  return (STRING_SETUPS[/** @type {string} */ (cfg.stringSetup)] || STRING_SETUPS.guitar_6_standard).openMidis.slice();
}
/** @param {InstrumentTuningConfig} cfg */
export function tuningOffsetsForConfig(cfg) {
  // When a custom tuning is in play, derive offsets from the difference
  // between custom and stringSetup-standard midis so downstream callers
  // that read the offset field still see something meaningful.
  const baseSetup = STRING_SETUPS[/** @type {string} */ (cfg.stringSetup)] || STRING_SETUPS.guitar_6_standard;
  if (Array.isArray(cfg.customOpenMidis) && cfg.customOpenMidis.length === baseSetup.openMidis.length) {
    return cfg.customOpenMidis.map((m, i) => m - baseSetup.openMidis[i]);
  }
  return baseSetup.tuning.slice();
}

/** @param {InstrumentTuningConfig} cfg */
export function isBassCfg(cfg) {
  // stringSetup is the authoritative cfg token; cfg.instrument is data DERIVED
  // from it at readConfig time and can go stale when a caller patches
  // stringSetup onto an existing cfg — so the setup wins.
  return ((STRING_SETUPS[/** @type {string} */ (cfg.stringSetup)] || {}).instrument || cfg.instrument) === 'bass';
}

/** @param {string} family @param {number} count */
export function hostStandardMidisFor(family, count) {
  return (STRING_SETUPS[`${family}_${count}_standard`] || {}).openMidis || null;
}

// Parse "E2", "F#3", "Bb4" into a MIDI number (C-1 = 0, C4 = 60). Returns
// null on malformed input. Octave is required so the user gets a single
// explicit semantics instead of guessing.
/** @param {unknown} s */
export function parseNoteName(s) {
  if (typeof s !== 'string') return null;
  const m = /^\s*([A-Ga-g])([#♯b♭]?)(-?\d+)\s*$/.exec(s);
  if (!m) return null;
  const letter = m[1].toUpperCase();
  const acc = m[2].replace('♯','#').replace('♭','b');
  const oct = parseInt(m[3], 10);
  /** @type {Record<string, number>} */
  const baseMap = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  let pc = baseMap[letter];
  if (acc === '#') pc += 1; else if (acc === 'b') pc -= 1;
  const midi = (oct + 1) * 12 + pc;
  if (midi < 0 || midi > 127) return null;
  return midi;
}
/** @param {number} midi */
export function midiToNoteName(midi) {
  if (!Number.isFinite(midi)) return '';
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const oct = Math.floor(midi / 12) - 1;
  return names[((midi % 12) + 12) % 12] + oct;
}
