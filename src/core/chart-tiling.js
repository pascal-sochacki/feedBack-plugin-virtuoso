// SPDX-License-Identifier: AGPL-3.0-only
import { measureSeconds } from './timing.js';
import { appendTimelineOffset } from './chord-timeline.js';

// ── Workout time primitive (build-queue #3) ─────────────────────────────────
// Repeat a block's WHOLE-CELL content until it fills at least targetSec of
// wall-clock time, overshooting to the next whole repetition — never cutting a
// run mid-phrase. The "cell" is one full pass of the block exercise (its `bars`);
// reps are whole passes, so phrases stay intact and the playhead crossing the
// block's end IS the advance (no second clock). Existing builders count bars/reps;
// this is the one piece that thinks in seconds. A block stays an existing
// curriculum unit (a pathway node / Custom config) — this only extends its length.
// Templates are identical across reps, so chord ids are reused (no tplOffset
// growth); beats are left to the caller's buildBeats over the new duration.
/** @param {import('./generation-types.js').Chart} chart @param {import('./generation-types.js').GenerationConfig} segCfg @param {number} targetSec */
export function fillBlockToDuration(chart, segCfg, targetSec) {
  const cellDur = (chart && chart.duration) || (segCfg.bars * measureSeconds(segCfg));
  if (!(targetSec > 0) || !(cellDur > 0)) return chart;
  // ceil → overshoot to a whole cell; the tiny epsilon avoids an extra rep when
  // targetSec is an exact multiple of cellDur (floating-point safe).
  const reps = Math.max(1, Math.ceil((targetSec - 1e-6) / cellDur));
  if (reps === 1) return chart;
  /** @type {import('./notes.js').Note[]} */
  const notes = [];
  /** @type {import('./generation-types.js').ChartChord[]} */
  const chords = [];
  /** @type {import('./generation-types.js').HandShape[]} */
  const handShapes = [];
  /** @type {import('./generation-types.js').Anchor[]} */
  const anchors = [];
  /** @type {import('./generation-types.js').Section[]} */
  const sections = [];
  /** @type {import('./generation-types.js').Beat[]} */
  const beats = [];
  /** @type {import('./generation-types.js').AccompanimentEvent[]} */
  const backingEvents = [];
  /** @type {import('./generation-types.js').TimelineEvent[]} */
  const timeline = [];
  // Slot offsets for tiling a timeline-carrying chart (key cycle + targetSec):
  // beats/bars per cell derived from the cell's wall length on this cfg's grid.
  const cellBars = cellDur / measureSeconds(segCfg);
  const cellBeats = cellBars * Math.max(1, segCfg.meter.numerator);
  for (let r = 0; r < reps; r++) {
    const off = r * cellDur;
    (chart.notes || []).forEach(n => notes.push(Object.assign({}, n, { t: Number((n.t + off).toFixed(6)) })));
    (chart.chords || []).forEach(c => chords.push(Object.assign({}, c, { t: Number((c.t + off).toFixed(6)) })));
    (chart.handShapes || []).forEach(hs => handShapes.push(Object.assign({}, hs, { start_time: Number((hs.start_time + off).toFixed(6)), end_time: Number((hs.end_time + off).toFixed(6)) })));
    (chart.anchors || []).forEach(a => anchors.push(Object.assign({}, a, { time: Number((a.time + off).toFixed(6)) })));
    if (chart.sections) (chart.sections || []).forEach(s => sections.push(Object.assign({}, s, { number: sections.length + 1, time: Number((s.time + off).toFixed(6)) })));
    if (chart.beats)    (chart.beats || []).forEach(b => beats.push(Object.assign({}, b, { time: Number((b.time + off).toFixed(6)) })));
    if (chart.backingEvents) (chart.backingEvents || []).forEach(ev => backingEvents.push(Object.assign({}, ev, { t: Number((ev.t + off).toFixed(6)), end: Number((ev.end + off).toFixed(6)) })));
    if (chart.timeline) appendTimelineOffset(timeline, chart.timeline, off, r * cellBeats, Math.round(r * cellBars));
  }
  const out = Object.assign({}, chart, { notes, chords, handShapes, anchors, duration: Number((reps * cellDur).toFixed(6)) });
  if (chart.sections) out.sections = sections;
  if (chart.beats) out.beats = beats;
  if (chart.backingEvents) out.backingEvents = backingEvents;
  if (chart.timeline) out.timeline = timeline;
  return out;
}

// A block's target duration in seconds (Workout). Reads it off the segment, or its
// config, or the cfg directly (single-exercise Custom block). null = bars-driven.
/** @param {{targetSec?: number | string | null, config?: {targetSec?: number | string | null}} | null | undefined} src */
export function blockTargetSec(src) {
  if (!src) return null;
  if (src.targetSec != null) return Number(src.targetSec) || null;
  if (src.config && src.config.targetSec != null) return Number(src.config.targetSec) || null;
  return null;
}
