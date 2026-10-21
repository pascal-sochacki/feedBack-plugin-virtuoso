// SPDX-License-Identifier: AGPL-3.0-only
import { secondsPerDivision, measureSeconds } from '../timing.js';
import { scalePositionsForSystem, dedupeUnisons } from '../positions.js';
import { fillNotesFromSeq, SEQ_NOTE_FIELDS } from '../sequence.js';
import { openMidisForConfig } from '../instrument-tuning.js';
import { CHORD_FORMULAS } from '../chord-theory.js';
import { sweepArpeggioPositions, sliceSweepTopStrings } from '../chord-positions.js';
import { progressionDegreesForConfig, chordRootForDegree, chordQualityForDegree, chordName } from '../harmony.js';
import { noteDefaults } from '../notes.js';

// Tapping ladder (concept_tapping pack, panel 2026-07-14) splits into two engines:
// the ARTICULATION drill (this function) and the tapped-arpeggio CASCADE
// (buildTappedArpeggioExercise). tapArp routes 'tapping' to the cascade.
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildTappingExercise(cfg) {
  if (cfg.tapArp) return buildTappedArpeggioExercise(cfg);
  // Articulation drill (ladder rung 1): a single-string two-note tap cell — the
  // fretting hand HOLDS a scale tone, the picking hand TAPS the octave above, and a
  // pull-off sounds the fretted note. tap (on the beat) → pull-off (the "&"). This
  // replaces the old off-idiom "every scale note tapped +12 across the whole neck"
  // (metal-idiom 2026-07-14: nobody taps a scale — the atom is the tap/pull cell).
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const TAP = 12, FRET_CAP = 22;   // most necks end ~22; keep the tapped note ON the neck
  const isBass = String(cfg.stringSetup || '').indexOf('bass') === 0;
  // Register clamp (bass-pedagogy 2026-07-14): the fretted note stays where the
  // string speaks cleanly — frets 5+ on bass (below = sub-fundamental mud + the
  // grading floor), 2+ on guitar — and the tap (+12) stays under the fret cap.
  const loFret = isBass ? 5 : 2;
  const allPos = scalePositionsForSystem(cfg);
  const events = [];
  for (const p of allPos) {
    if (p.f < loFret || p.f + TAP > FRET_CAP) continue;
    events.push({ s: p.s, f: p.f + TAP, tp: true });    // TAP the octave (picking hand)
    events.push({ s: p.s, f: p.f, po: true });          // PULL-OFF to the fretted tone
  }
  if (!events.length) throw new Error('No tapping positions — need a fretted note between fret ' + loFret + ' and ' + (FRET_CAP - TAP) + ' (widen the range / use a single-string system).');
  const sus = Math.max(0.05, step * 0.85);
  return fillNotesFromSeq(events, { step, totalTime, sus, loopCycleSteps: events.length, name: `Tapping — ${cfg.key} ${cfg.scale}` });
}

// One tapped-arpeggio CASCADE path for one chord (Tapping ladder rungs 2–5). The
// picking-hand tap buys reach past one hand's span, so a WIDE arpeggio pours down
// the neck as a string of tap→pull→hammer cells — one cell per string, ascending
// low→high, spelling the chord. Harmony-theory: it rides the same one-tone-per-
// string grid the sweep ladder builds (root on the bass string). Notes are pick-
// transparent (tp/po/ho) — no pkd, nothing re-judged on top of the host verdict.
/** @param {import('../generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality @param {number} anchorFret */
export function buildTapCascadePath(cfg, rootPc, quality, anchorFret) {
  const opens = openMidisForConfig(cfg);
  const isBass = String(cfg.stringSetup || '').indexOf('bass') === 0;
  const FRET_CAP = 22;
  const fLo = Math.max(isBass ? 5 : 0, Number.isFinite(cfg.fretMin) ? cfg.fretMin : 5);
  const fHi = Math.min(FRET_CAP, Number.isFinite(cfg.fretMax) ? cfg.fretMax : 19);
  const formula = CHORD_FORMULAS[quality] || CHORD_FORMULAS.min;
  const tonePcs = new Set(formula.intervals.map(iv => (rootPc + iv) % 12));
  // One anchor chord-tone per string (root on the bass string), optionally sliced to
  // the top-N strings for the entry rungs (sweepStrings:1 = the single-string EVH
  // cell). dedupeUnisons drops a grid tone that repeats a pitch already taken on a
  // lower string (the dim7-symmetry no-unison edge, harmony flag).
  let grid = dedupeUnisons(sweepArpeggioPositions(cfg, rootPc, quality, anchorFret));
  if (cfg.sweepStrings) grid = sliceSweepTopStrings(grid, cfg.sweepStrings);
  grid = grid.slice().sort((a, b) => a.s - b.s);   // ascending low→high string
  const cells = [];
  for (const g of grid) {
    const openS = opens[g.s];
    const toneFrets = [];
    for (let f = fLo; f <= fHi; f++) if (tonePcs.has((openS + f) % 12)) toneFrets.push(f);
    const lhLow = g.f;                       // fretting-hand anchor (the grid tone)
    const reach = (lhLow < 5) ? 3 : 4;       // hand span low on the neck is tighter
    // Second fretting-hand tone: nearest chord tone within reach ABOVE the anchor.
    const lhHigh = toneFrets.find(f => f > lhLow && f - lhLow <= reach);
    // Tapped tone: a WIDE chord tone (≥5 frets — the span one hand can't cover) above
    // the highest fretting tone; that unreachable interval is exactly why the tap
    // exists. Falls back to the octave of the anchor. Wide-to-the-tap is the rule.
    const topLH = lhHigh != null ? lhHigh : lhLow;
    let tap = toneFrets.find(f => f > topLH && f - topLH >= 5 && f <= FRET_CAP);
    if (tap == null && lhLow + 12 <= FRET_CAP) tap = lhLow + 12;
    if (tap == null) continue;               // no reachable tap on this string → skip it
    /** @type {import('../generation-types.js').ChordPosition[]} */
    const cell = [
      { s: g.s, f: tap, tp: true, midi: openS + tap },     // TAP the high tone
      { s: g.s, f: lhLow, po: true, midi: openS + lhLow }  // PULL-OFF to the anchor
    ];
    // Guitar adds the HAMMER-ON to the second fretting tone (the 3-note EVH cell);
    // bass stays a 2-note tap→pull (root + one chord tone, no dense low clusters —
    // bass-pedagogy). No hammer where there's no in-reach second tone.
    if (!isBass && lhHigh != null) cell.push({ s: g.s, f: lhHigh, ho: true, midi: openS + lhHigh });
    cells.push(cell);
  }
  if (!cells.length) return [];
  let path = /** @type {import('../generation-types.js').ChordPosition[]} */ ([]).concat.apply([], cells);
  // up_down: pour the cascade back down (reverse the CELL order, cells intact).
  if (cfg.direction === 'up_down' && cells.length > 1) {
    path = path.concat(/** @type {import('../generation-types.js').ChordPosition[]} */ ([]).concat.apply([], cells.slice(0, -1).reverse()));
  }
  // No-unison pass (this builder bypasses the startup shape-guard): collapse an
  // event repeating the immediately-preceding pitch — the audible dim7-symmetry
  // artifact where a tap meets the next string's anchor at the same MIDI.
  return path.filter((n, i, arr) => i === 0 || n.midi !== arr[i - 1].midi);
}

// Tapped-arpeggio cascade exercise: lays one cascade per bar, re-rooting on the
// bar's chord, so a single-tonic drill and a "tap over changes" rung share one path
// (same per-bar chord machinery as buildSweepArpeggioExercise).
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildTappedArpeggioExercise(cfg) {
  const degrees = progressionDegreesForConfig(cfg);
  const mLen = measureSeconds(cfg), step = secondsPerDivision(cfg);
  const totalBars = Math.max(1, cfg.bars), duration = totalBars * mLen;
  const isBass = String(cfg.stringSetup || '').indexOf('bass') === 0;
  const fMin = Number.isFinite(cfg.fretMin) ? cfg.fretMin : 5;
  const fMax = Number.isFinite(cfg.fretMax) ? cfg.fretMax : (isBass ? 15 : 19);
  const anchorFret = Math.floor((fMin + fMax) / 2);
  const perBar = Math.max(1, Math.floor(mLen / step + 1e-6));
  const sus = Math.max(0.05, step * 0.85);
  const cfgWin = Object.assign({}, cfg, { fretMin: fMin, fretMax: fMax });
  const notes = [], sections = [];
  // Carried across the whole exercise so no seam — the loop-wrap when a short
  // cascade tiles to fill a bar, or the join between two bars' chords — ever
  // re-articulates the same (string,fret) twice in a row (the no-unison adjacency
  // rule; the per-path midi filter can't see these seams).
  let lastKey = null;
  for (let bar = 0; bar < totalBars; bar++) {
    const degree = degrees[bar % degrees.length];
    const rootPc = chordRootForDegree(cfg, degree);
    const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth, degree, cfg.chordOverride, cfg.progression);
    const path = buildTapCascadePath(cfgWin, rootPc, quality, anchorFret);
    if (!path.length) continue;
    const barStart = bar * mLen;
    sections.push({ name: chordName(rootPc, quality), number: sections.length + 1, time: Number(barStart.toFixed(6)) });
    let cursor = 0;
    for (let i = 0; i < perBar; i++) {
      const t = barStart + i * step;
      if (t >= duration - 1e-6) break;
      let ev = path[cursor % path.length];
      let key = ev.s + ':' + ev.f;
      if (key === lastKey) { cursor++; ev = path[cursor % path.length]; key = ev.s + ':' + ev.f; }
      cursor++; lastKey = key;
      /** @type {Record<string, number | boolean | string | undefined>} */
      const nf = { t: Number(t.toFixed(6)), s: ev.s, f: ev.f, sus };
      for (const k of SEQ_NOTE_FIELDS) if (ev[/** @type {keyof typeof ev} */ (k)] !== undefined) nf[k] = ev[/** @type {keyof typeof ev} */ (k)];
      notes.push(noteDefaults(nf));
    }
  }
  if (!notes.length) throw new Error('No tapped-arpeggio positions — widen the fret window (need chord tones a tap-span apart).');
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration };
}
