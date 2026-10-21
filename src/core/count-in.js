// SPDX-License-Identifier: AGPL-3.0-only

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
