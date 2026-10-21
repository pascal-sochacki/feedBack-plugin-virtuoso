// SPDX-License-Identifier: AGPL-3.0-only
import { buildBeats } from './chart-grid.js';

/** @type {Record<string, number>} */
export const COUNTIN_TOKEN_TICKS = { gallop: 2, reverse_gallop: 2, skip_chug: 4, snap: 4, herta_chug: 4 };

/** @type {Record<string, number>} */
export const SUBDIV_BEAT_FRAC = { quarter: 1, eighth: 0.5, sixteenth: 0.25, triplet: 1 / 3, eighth_triplet: 1 / 3, sixteenth_triplet: 1 / 6 };

/** @param {{subdivision: string, meter: import('./timing.js').Meter}} cfg */
export function countInSubTicks(cfg) {
  const o = COUNTIN_TOKEN_TICKS[cfg.subdivision];
  if (o != null) return o;
  const f = SUBDIV_BEAT_FRAC[cfg.subdivision];
  if (!f) return 1;
  return Math.max(1, Math.min(6, Math.round((4 / cfg.meter.denominator) / f)));
}

/**
 * The incoming grid owns the breath, retaining the grid's endpoint tolerance.
 * Read subdivision per emitted beat, as the original session assembly did.
 * @param {import('./generation-types.js').Beat[]} beats
 * @param {import('./generation-types.js').GenerationConfig} cfg
 * @param {number} duration
 * @param {number} offset
 */
export function appendCountInBeats(beats, cfg, duration, offset) {
  buildBeats(cfg, Math.max(0, duration - 1e-4)).forEach(b =>
    beats.push(Object.assign({}, b, { time: Number((b.time + offset).toFixed(6)), brk: true, brkSub: countInSubTicks(cfg) })));
}
