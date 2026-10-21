/**
 * @typedef {{numerator: number, denominator: number, grouping?: number[]}} Meter
 * @typedef {{bpm: number, subdivision: string}} DivisionConfig
 */

// ── RHYTHM_CELLS — the recombinable rhythm-cell table (Rhythm-ladder panel, ──────
// 2026-06-04; spec docs/plugin/design/rhythm-ladder-roundtable.md). The engine already tiles an
// arbitrary per-step duration array with no bar-reset (fillNotesFromSeq's `steps`
// path), so any rhythmic cell COMMENSURATE with the bar is data, not code: the whole
// gallop / dotted-snap / clave / tresillo wave becomes CURATION. `beats` is the cell
// as a cycling array of per-onset durations in BEATS (quarter = 1.0); rhythmSteps()
// multiplies by the quarter-note seconds. The cross-idiom ATOM is the tresillo
// [1.5,1.5,1.0] (3-3-2 eighths) — Latin/NOLA/tango/norteño all point at this ONE def.
// INVARIANT (asserted at the original entry startup point, mirroring no-unison): every cell sums to a WHOLE number
// of beats so it re-aligns to the beat grid (a per-beat cell sums to 1; a 1-bar cell
// to 4; son/rumba clave to 8 = 2 bars). A single line teaches the TIME of a feel,
// never the ensemble interlock ("tap the clave's time"). gallop/reverse_gallop moved
// here from the old hardcoded rhythmSteps lookup.
/** @type {Record<string, {beats: number[], strokes?: string[], accentEvery?: number, label: string}>} */
export const RHYTHM_CELLS = {
  // Per-beat gallop family (the Gallop & Snap rung; metal-idiom lane).
  // `strokes` (optional, hand-marks Slice 2): the cell's DEFINITIVE pick
  // pattern (guitar-pedagogy ruling: gallop default D-DU, reverse DU-D;
  // all-down is a named variant, not the default). Consumed by
  // applyStrokePolicy when stroke emission is active; display-only.
  gallop:         { beats:[0.5, 0.25, 0.25], strokes:['d','d','u'], label:'Gallop (♪ ♬)' },           // NWOBHM/power
  reverse_gallop: { beats:[0.25, 0.25, 0.5], strokes:['d','u','d'], label:'Reverse gallop (♬ ♪)' },   // thrash/death
  skip_chug:      { beats:[0.75, 0.25],      label:'Skip / dotted (♩. ♬)' },   // thrash skip
  snap:           { beats:[0.25, 0.75],      label:'Snap (♬ ♩.)' },            // front-weighted pickup
  // The HERTA CHUG (Christian's ask 2026-06-12 — the famous modern-djent
  // rhythm figure; what the melodic pick_herta drill was NOT). Canonical form
  // per the drum-transcription literature: a 16th grid accented in groups of
  // THREE sixteenths with an extra 32nd after every accent — i.e. the cell
  // [16th, 32nd, 32nd, 16th] spanning ¾ of a beat, a 3-over-2 that phases
  // against the 4/4 backbeat and re-aligns every 3 beats. Encoded as the full
  // 3-beat cycle (4 cells) for the whole-beat guard; accentEvery:4 puts the
  // accent on every CELL start (the audible 3-over-2 lean), not just the
  // cycle start. NO declared strokes: strict-alternate territory at any
  // usable tempo, so the rung's strokePolicy:'alternate' marks it.
  herta_chug: { beats:[0.25, 0.125, 0.125, 0.25,  0.25, 0.125, 0.125, 0.25,  0.25, 0.125, 0.125, 0.25,  0.25, 0.125, 0.125, 0.25],
                accentEvery: 4, label:'Herta chug (16th + two 32nds + 16th)' },
  // World-rhythm cells (tap on one note = "the TIME of the feel"). Bar-commensurate.
  tresillo:       { beats:[1.5, 1.5, 1.0],            label:'Tresillo (3-3-2)' },          // 1 bar — the cross-idiom atom
  son_clave:      { beats:[1.5, 1.5, 2.0, 1.0, 2.0],  label:'Son clave (2-3, 2-bar)' },    // onsets 0,3,6,10,12 / 16 eighths
  rumba_clave:    { beats:[1.5, 2.0, 1.5, 1.0, 2.0],  label:'Rumba clave (2-bar)' },       // onsets 0,3,7,10,12 (eighth 7 vs 6 = rumba)
  habanera:       { beats:[1.5, 0.5, 1.0, 1.0],       label:'Habanera' },                  // onsets 0,3,4,6 / 8 eighths
};

/** @param {unknown} value */
export function parseMeter(value) {
  const [sig, groupingRaw] = String(value || '4/4').split(':');
  const [nRaw, dRaw] = sig.split('/');
  const numerator = Math.max(1, parseInt(nRaw || '4', 10));
  const denominator = Math.max(1, parseInt(dRaw || '4', 10));
  const grouping = groupingRaw ? groupingRaw.split('+').map(x => parseInt(x, 10)).filter(Number.isFinite) : [numerator];
  return { numerator, denominator, grouping: grouping.length ? grouping : [numerator] };
}

/** @param {DivisionConfig} cfg */
export function secondsPerDivision(cfg) { const q = 60 / cfg.bpm; return (/** @type {Record<string, number>} */ ({ quarter:q, eighth:q/2, sixteenth:q/4, triplet:q/3, eighth_triplet:q/3, sixteenth_triplet:q/6, gallop:q/2, reverse_gallop:q/2 }))[cfg.subdivision] || q/2; }

// Non-uniform rhythm patterns (genre-framework §2.5). Returns a cycling array of
// per-note durations for one beat, or null for the uniform subdivisions (which
// use secondsPerDivision instead). Gallop = eighth + two sixteenths; reverse =
// two sixteenths + eighth — the metal rhythm-guitar staple. Consumed by
// fillNotesFromSeq's `steps` path; generators opt in via rhythmSteps(cfg).
/** @param {DivisionConfig} cfg */
export function rhythmSteps(cfg) {
  const q = 60 / cfg.bpm;
  const cell = RHYTHM_CELLS[cfg.subdivision];
  if (cell) return cell.beats.map(b => b * q);   // gallop/reverse + skip/snap + tresillo/clave/habanera
  return null;
}

/** @param {{bpm: number, meter: Meter}} cfg */
export function measureSeconds(cfg) { return (60 / cfg.bpm) * (4 / cfg.meter.denominator) * cfg.meter.numerator; }

// Loopable warmup drills should wrap at the end of a WHOLE mechanical cycle,
// not at an arbitrary bars×time cutoff mid-cell. `bars` is therefore treated
// as the MINIMUM length for these drills; the chart rounds up to the next full
// cycle so keep-looping playback re-enters on a natural hand-motion boundary.
/** @param {number} totalTime @param {number} step @param {number} cycleSteps */
export function wholeCycleStepCount(totalTime, step, cycleSteps) {
  const minSteps = Math.max(1, Math.ceil(Math.max(0, totalTime - 1e-9) / Math.max(1e-6, step)));
  const cycle = Math.max(1, Math.round(cycleSteps) || 1);
  return Math.ceil(minSteps / cycle) * cycle;
}
