// SPDX-License-Identifier: AGPL-3.0-only
import { mulberry32, shuffleCopy } from './random.js';
import { wholeCycleStepCount } from './timing.js';
import { noteDefaults } from './notes.js';

/** @type {Record<string, number[] | null>} */
export const SEQUENCE_PATTERNS = {
  none:null,
  fours:[0,1,2,3],
  triplets:[0,1,2],
  thirds:[0,2],
  fourths:[0,3],
  fifths:[0,4],
  sixths:[0,5],
  broken_triads:[0,2,4],
  yngwie_sixes:[0,1,2,3,2,1]
};

// ── Generator helpers ───────────────────────────────────────────────────────
// Most pattern generators below build a list of "events" (each at least
// { s, f }, optionally carrying technique flags), then either play them as-is
// or mirror them for ascending/descending/up-down practice, then lay them onto
// the timeline one per subdivision. These two helpers capture that shared tail
// so each builder only expresses what makes it distinct.

// Technique flags an event may carry through to its rendered note. Anything
// not in this list (e.g. midi/pc bookkeeping) is dropped so notes stay clean.
export const SEQ_NOTE_FIELDS = ['ho', 'po', 'vb', 'tr', 'tp', 'bn', 'hm', 'hp', 'pm', 'mt', 'ac', 'sl', 'slu', 'fg'];

/** @template T @param {T[]} positions @param {string} pattern */
export function applySequencePattern(positions, pattern) {
  const offsets = SEQUENCE_PATTERNS[pattern];
  if (!offsets || !offsets.length || positions.length < 2) return positions;
  const maxOffset = Math.max.apply(null, offsets);
  if (positions.length <= maxOffset) return positions;
  const out = [];
  for (let i = 0; i + maxOffset < positions.length; i++) {
    for (const offset of offsets) out.push(positions[i + offset]);
  }
  return out.length ? out : positions;
}

// `rand` = the chart's seeded PRNG (chartRng(cfg)) — only 'random' draws on it.
/** @template T @param {T[]} items @param {string | undefined} direction @param {number | undefined} repeatCount @param {() => number} [rand] */
export function directedPath(items, direction, repeatCount, rand) {
  const base = items.slice();
  if (base.length <= 1) return base;
  const rng = rand || mulberry32(0);   // defensive: never fall back to Math.random
  /** @type {T[] | null} */
  let phrase;
  switch (direction) {
    case 'ascending': phrase = base; break;
    case 'descending': phrase = base.slice().reverse(); break;
    case 'down_up': phrase = base.slice().reverse().concat(base.slice(1, -1)); break;
    case 'random': phrase = null; break;            // re-shuffled per repeat below
    case 'up_down':
    default: phrase = base.concat(base.slice(1, -1).reverse()); break;
  }
  const out = [];
  const repeats = Math.max(1, repeatCount || 1);
  for (let i = 0; i < repeats; i++) out.push(...(direction === 'random' ? shuffleCopy(base, rng) : /** @type {T[]} */ (phrase)));
  return out;
}

// Map a (possibly out-of-range) linear index onto [0, len-1] by REFLECTION
// (a triangle wave) instead of wraparound (a sawtooth). When a run walks past
// the end of a box, wraparound teleports top→bottom (a ~2-octave leap); a
// reflection bounces back stepwise, the way a player turns a run around at the
// edge of a position. Used by the chord-scale bar emission so neither a short
// box nor a mid-box entry point produces an unplayable intra-bar jump.
/** @param {number} p @param {number} len */
export function reflectIdx(p, len) {
  if (len <= 1) return 0;
  const period = 2 * (len - 1);
  const m = ((p % period) + period) % period;
  return m < len ? m : period - m;
}

/** @template T @param {T[]} events @param {string | undefined} direction */
export function orientSeq(events, direction) {
  if (direction === 'descending') return events.slice().reverse();
  if (direction === 'up_down')    return [...events, ...events.slice().reverse()];
  return events;
}

// Fill the timeline with `seq`, cycling it, one note per step.
// opts: { step, steps?, totalTime, sus, name, startAt=0, loopCycleSteps?, duration=Math.max(t,totalTime) }
// `steps` (optional) is a cycling array of per-note durations for non-uniform
// rhythms (gallop — see rhythmSteps); when absent, the uniform `step` is used.
// `loopCycleSteps` rounds uniform-step drills up to a whole sequence cycle so
// playback loops back to the start of a complete mechanical phrase.
/** @param {(Partial<import('./notes.js').Note> & {s: number, f: number})[]} seq @param {{step: number, steps?: number[] | null, totalTime: number, sus: number, name: string, startAt?: number, loopCycleSteps?: number, duration?: number}} opts */
export function fillNotesFromSeq(seq, opts) {
  const { step, steps, totalTime, sus, name, startAt = 0 } = opts;
  const notes = [], sections = [{ name, number: 1, time: 0 }];
  const hasVariableSteps = !!(steps && steps.length);
  const loopCycleSteps = !hasVariableSteps && opts.loopCycleSteps != null
    ? Math.max(1, Math.round(opts.loopCycleSteps) || 1) : 0;
  const targetSteps = loopCycleSteps
    ? wholeCycleStepCount(Math.max(0, totalTime - startAt), step, loopCycleSteps) : null;
  let t = startAt, idx = 0;
  while (targetSteps != null ? idx < targetSteps : t < totalTime - 0.001) {
    const ev = seq[idx % seq.length];
    /** @type {Record<string, number | boolean | string | undefined>} */
    const note = { t: Number(t.toFixed(6)), s: ev.s, f: ev.f, sus };
    for (const k of SEQ_NOTE_FIELDS) if (ev[/** @type {keyof import('./notes.js').Note} */ (k)] !== undefined) note[k] = ev[/** @type {keyof import('./notes.js').Note} */ (k)];
    notes.push(noteDefaults(note));
    t += hasVariableSteps ? steps[idx % steps.length] : step; idx++;
  }
  const duration = opts.duration != null ? opts.duration : Math.max(totalTime, Number(t.toFixed(6)));
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration };
}
