// SPDX-License-Identifier: AGPL-3.0-only
import { buildSingleChart } from './exercise-dispatch.js';
import { measureSeconds } from './timing.js';
import { buildAccompanimentEvents } from './backing.js';
import { appendChordGeometry } from './chart-assembly.js';
import { swingNotesBacking } from './feel.js';
import { appendTimelineOffset, compileChordTimeline } from './chord-timeline.js';

// ── End additional generators ───────────────────────────────────────────────

/** @type {Record<string, string[]>} */
export const CYCLE_KEY_ORDERS = {
  circle_of_fourths: ['C','F','Bb','Eb','Ab','Db','Gb','B','E','A','D','G'],
  circle_of_fifths:  ['C','G','D','A','E','B','Gb','Db','Ab','Eb','Bb','F'],
  chromatic:         ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
};

/** @param {import('./generation-types.js').GenerationConfig} cfg @returns {import('./generation-types.js').Chart} */
export function buildKeyCycleChart(cfg) {
  const order = CYCLE_KEY_ORDERS[/** @type {string} */ (cfg.keyCycle)];
  if (!order) return buildSingleChart(cfg);
  const startIdx = Math.max(0, order.indexOf(cfg.key));
  const count = Math.max(2, Math.min(12, cfg.keyCycleLength || 4));
  const keys = Array.from({ length: count }, (_, i) => order[(startIdx + i) % order.length]);
  /** @type {import('./notes.js').Note[]} */
  const notes = [];
  /** @type {import('./generation-types.js').ChartChord[]} */
  const chords = [];
  /** @type {import('./generation-types.js').ChordTemplate[]} */
  const chordTemplates = [];
  /** @type {import('./generation-types.js').HandShape[]} */
  const handShapes = [];
  const sections = [];
  /** @type {import('./generation-types.js').Anchor[]} */
  const anchors = [];
  /** @type {import('./generation-types.js').AccompanimentEvent[]} */
  const backingEvents = [];
  /** @type {import('./generation-types.js').TimelineEvent[]} */
  const timeline = [];
  let t = 0, tplOffset = 0, beatOff = 0, barOff = 0;
  for (const key of keys) {
    const kCfg = Object.assign({}, cfg, { key, keyCycle: 'none' });
    const chart = buildSingleChart(kCfg);
    const dur = Math.max(chart.duration || 0, cfg.bars * measureSeconds(kCfg));
    // Per-KEY backing on THIS key — the cycle changes key, so a single-cfg backing
    // would play the START key under every key. Build + swing in key-local time, then
    // offset by t (the chart carries it; consumers don't re-build/re-swing).
    const rawBack = buildAccompanimentEvents(kCfg, dur);
    const sw = swingNotesBacking(chart.notes, rawBack, kCfg);
    // Per-KEY timeline too (same desync rule) — the cycle changes key, so a
    // single-key timeline would label every rung with the START key's harmony.
    appendTimelineOffset(timeline, compileChordTimeline(kCfg, dur), t, beatOff, barOff);
    sections.push({ name: key, number: sections.length + 1, time: Number(t.toFixed(6)) });
    sw.notes.forEach(n => notes.push(Object.assign({}, n, { t: Number((n.t + t).toFixed(6)) })));
    appendChordGeometry({ chords, chordTemplates, handShapes }, chart, t, tplOffset);
    (chart.anchors || []).forEach(a => anchors.push(Object.assign({}, a, { time: Number((a.time + t).toFixed(6)) })));
    sw.backing.forEach(ev => backingEvents.push(Object.assign({}, ev, { t: Number((ev.t + t).toFixed(6)), end: Number((ev.end + t).toFixed(6)) })));
    tplOffset += chart.chordTemplates.length;
    const kBar = measureSeconds(kCfg);
    beatOff += (dur / kBar) * Math.max(1, kCfg.meter.numerator);
    barOff += Math.round(dur / kBar);
    t += dur;
  }
  return { notes, chords, chordTemplates, handShapes, sections, anchors, backingEvents, timeline, duration: t };
}
