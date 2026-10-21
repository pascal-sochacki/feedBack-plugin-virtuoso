// SPDX-License-Identifier: AGPL-3.0-only
import { RHYTHM_CELLS, secondsPerDivision } from './timing.js';
import { isBassCfg } from './instrument-tuning.js';

/**
 * @typedef {import('./notes.js').Note} Note
 * @typedef {import('./instrument-tuning.js').InstrumentTuningConfig & {bpm: number, subdivision: string, meter?: {denominator?: number}, strokePolicy?: string, crosspick?: boolean}} StrokeConfig
 */

// Alternate-picking pkd emission (hand-marks Slice 1; guitar-pedagogy ruling):
// strict alternation by NOTE ORDER — string crossings included; the triplet
// beat-flip IS the lesson — down first, re-anchored on a down after a rest.
// Legato (ho/po) and tapped notes are pick-transparent: no pkd, and they
// don't advance the alternation. Muted chugs DO pick (and count). Host wire
// ints adopted verbatim: 0 = down, 1 = up (sloppak `pkd`). Display-only data
// — nothing ever scores on it (the panel's unanimous constitution).
/** @template {Note} T @param {T[]} notes @param {StrokeConfig} cfg */
export function applyAlternatePicking(notes, cfg) {
  const beat = (60 / cfg.bpm) * (4 / ((cfg.meter && cfg.meter.denominator) || 4));
  let next = 0, lastT = null;
  for (const n of notes) {
    if (n.ho || n.po || n.tp) continue;
    if (lastT != null && n.t - lastT >= beat * 1.4) next = 0;   // a real rest → re-anchor down
    n.pkd = next; next = next ^ 1;
    lastT = n.t;
  }
  return notes;
}
// ── Stroke-policy engine (hand-marks Slice 2) ──────────────────────────────
// Picking SCHOOLS are per-genre PURE FUNCTIONS declared per rung
// (cfg.strokePolicy, a pathway-driven hidden field) — never a universal
// default, never silently legislated (roundtable constitution: schools that
// legitimately differ ship as policies/flags; display-only, nothing ever
// scores on pkd). Builders pass a fallback where Slice 1 already alternated.
//   alternate — strict by note order (applyAlternatePicking above, verbatim)
//   economy   — alternate within a string; a string CROSSING continues the
//               travel direction (ascend ⇒ another down, descend ⇒ another
//               up): the mini-sweep through the crossing
//   gypsy     — every string change ⇒ downstroke (the strict rest-stroke
//               school); upstrokes exist only as same-string fill
//               (invariant: a pkd:1 note is on the previous picked string)
//   bluegrass — position-derived, not order-derived: on-beat ⇒ down,
//               off-beat ⇒ up on the eighth grid (slurs transparent);
//               cfg.crosspick flips to the d-d-u crosspick roll
//   metal     — alternate + forced DOWN on accents/stabs; palm-muted
//               eighth-or-coarser chugs are ALL-DOWN up to
//               DOWNPICK_CEILING_BPM — ABOVE the ceiling the policy itself
//               flips to alternate (the per-tier flip IS the lesson: the
//               wall where real players switch — L&D/metal rulings)
const DOWNPICK_CEILING_BPM = 170;
/** @template {Note} T @param {T[]} notes @param {StrokeConfig} cfg */
export function applyEconomyPicking(notes, cfg) {
  const beat = (60 / cfg.bpm) * (4 / ((cfg.meter && cfg.meter.denominator) || 4));
  let prev = null, prevStroke = 0;
  for (const n of notes) {
    if (n.ho || n.po || n.tp) continue;
    if (prev == null || n.t - prev.t >= beat * 1.4) n.pkd = 0;        // entry / rest → down
    else if (n.s === prev.s) n.pkd = prevStroke ^ 1;                  // same string: alternate
    else n.pkd = n.s > prev.s ? 0 : 1;                                // crossing continues travel (s=0 lowest)
    prevStroke = n.pkd; prev = n;
  }
  return notes;
}
/** @template {Note} T @param {T[]} notes @param {StrokeConfig} cfg */
export function applyGypsyPicking(notes, cfg) {
  const beat = (60 / cfg.bpm) * (4 / ((cfg.meter && cfg.meter.denominator) || 4));
  let prev = null, prevStroke = 0;
  for (const n of notes) {
    if (n.ho || n.po || n.tp) continue;
    if (prev == null || n.t - prev.t >= beat * 1.4 || n.s !== prev.s) n.pkd = 0;  // entry, rest, ANY string change → down
    else n.pkd = prevStroke ^ 1;                                                  // same-string fill alternates
    prevStroke = n.pkd; prev = n;
  }
  return notes;
}
/** @template {Note} T @param {T[]} notes @param {StrokeConfig} cfg */
export function applyBluegrassPicking(notes, cfg) {
  if (cfg.crosspick) {            // the d-d-u crosspick roll, by picked-note order
    let i = 0;
    for (const n of notes) { if (n.ho || n.po || n.tp) continue; n.pkd = (i % 3) === 2 ? 1 : 0; i++; }
    return notes;
  }
  const half = (60 / cfg.bpm) / 2;   // the eighth grid bluegrass lives on
  for (const n of notes) {
    if (n.ho || n.po || n.tp) continue;
    n.pkd = (Math.round(n.t / half) % 2) ? 1 : 0;   // on-beat down, off-beat up
  }
  return notes;
}
/** @template {Note} T @param {T[]} notes @param {StrokeConfig} cfg */
export function applyMetalPicking(notes, cfg) {
  const beat = (60 / cfg.bpm) * (4 / ((cfg.meter && cfg.meter.denominator) || 4));
  const eighthOrCoarser = secondsPerDivision(cfg) >= (60 / cfg.bpm) / 2 - 1e-6;
  const chugAllDown = eighthOrCoarser && cfg.bpm <= DOWNPICK_CEILING_BPM;
  let next = 0, lastT = null;
  for (const n of notes) {
    if (n.ho || n.po || n.tp) continue;
    if (lastT != null && n.t - lastT >= beat * 1.4) next = 0;
    if (chugAllDown && n.pm) { n.pkd = 0; next = 1; }   // the all-down chug (≤ ceiling)
    else if (n.ac) { n.pkd = 0; next = 1; }             // accents/stabs force a down
    else { n.pkd = next; next = next ^ 1; }
    lastT = n.t;
  }
  return notes;
}
// Bass fingerstyle plucking — host `rh` enum verbatim (0=p,1=i,2=m,3=a,4=c).
// The bass-pedagogy ruling: strict i-m parity by sequence order, GHOSTS COUNT
// (the 16th motor never stops — mt notes are plucked and advance parity);
// legato/tapped transparent; rest re-anchors on i. The RAKE is encoded
// IMPLICITLY (no new field): on a descending adjacent-string crossing in a
// 16th run the same finger continues through (max 2 strings) — display-side
// decimation keeps exactly these parity BREAKS visible. Tier-gated by the
// 16th feel itself (walking quarters and beginner 8th rungs never rake).
/** @template {Note} T @param {T[]} notes @param {StrokeConfig} cfg */
export function applyBassPlucking(notes, cfg) {
  const beat = (60 / cfg.bpm) * (4 / ((cfg.meter && cfg.meter.denominator) || 4));
  const sixteenth = secondsPerDivision(cfg) <= (60 / cfg.bpm) / 4 + 1e-6;
  let next = 1, lastT = null, prev = null, rakeRun = 0;
  for (const n of notes) {
    if (n.ho || n.po || n.tp) continue;
    if (lastT != null && n.t - lastT >= beat * 1.4) { next = 1; rakeRun = 0; }
    if (sixteenth && prev && prev.rh != null && lastT != null && n.s === prev.s - 1 && rakeRun < 1 && (n.t - lastT) < beat) {
      n.rh = prev.rh; rakeRun++;                       // the rake: same finger continues down
    } else { n.rh = next; rakeRun = 0; }
    next = n.rh === 1 ? 2 : 1;
    prev = n; lastT = n.t;
  }
  return notes;
}
// A rhythm cell's `strokes` array is the DEFINITIVE pick pattern for that
// device (gallop D-DU etc.) — it wins over any policy when stroke emission
// is active. Returns true if it applied.
/** @param {Note[]} notes @param {StrokeConfig} cfg */
export function applyCellStrokes(notes, cfg) {
  const cell = RHYTHM_CELLS[cfg.subdivision];
  if (!cell || !cell.strokes || !cell.strokes.length) return false;
  let i = 0;
  for (const n of notes) {
    if (n.ho || n.po || n.tp) continue;
    n.pkd = cell.strokes[i % cell.strokes.length] === 'u' ? 1 : 0; i++;
  }
  return true;
}
/** @template {Note} T @param {T[]} notes @param {StrokeConfig} cfg @param {string} [fallback] */
export function applyStrokePolicy(notes, cfg, fallback) {
  const declared = !!cfg.strokePolicy;
  // Bass default school is FINGERSTYLE (bass-pedagogy veto: "pick arrows by
  // default on fingerstyle rungs") — an undeclared bass run gets rh i-m
  // parity instead of pick strokes; a rung that DECLARES a pick school
  // (djent pick-bass) keeps pkd. The 'bass_parity' fallback token marks
  // builders ruled for bass-but-not-guitar emission (arpeggio runs).
  if (!declared && isBassCfg(cfg)) {
    return fallback ? applyBassPlucking(notes, cfg) : notes;
  }
  const policy = cfg.strokePolicy || (fallback === 'bass_parity' ? '' : fallback);
  if (!policy) return notes;   // omitted/none → player's choice (no marks)
  if (applyCellStrokes(notes, cfg)) return notes;   // a cell's strokes are definitive (gallop D-DU)
  if (policy === 'alternate') return applyAlternatePicking(notes, cfg);
  if (policy === 'economy')   return applyEconomyPicking(notes, cfg);
  if (policy === 'gypsy')     return applyGypsyPicking(notes, cfg);
  if (policy === 'bluegrass') return applyBluegrassPicking(notes, cfg);
  if (policy === 'metal')     return applyMetalPicking(notes, cfg);
  return notes;
}
