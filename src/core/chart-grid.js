// SPDX-License-Identifier: AGPL-3.0-only
import { measureSeconds } from './timing.js';

/** @param {{bpm: number, meter: import('./timing.js').Meter & {grouping: number[]}}} cfg @param {number} duration */
export function buildBeats(cfg, duration) {
  const beats = [], beatUnit = (60 / cfg.bpm) * (4 / cfg.meter.denominator), mLen = measureSeconds(cfg), groupingStarts = new Set();
  let g = 0; for (const width of cfg.meter.grouping) { groupingStarts.add(g); g += width; }
  let measure = 1;
  for (let barStart = 0; barStart <= duration + 0.0001; barStart += mLen) {
    for (let i = 0; i < cfg.meter.numerator; i++) {
      const time = Number((barStart + i * beatUnit).toFixed(6));
      if (time > duration + 0.0001) break;
      beats.push({ time, measure: i === 0 ? measure : -1, accent: i === 0 ? 'measure' : (groupingStarts.has(i) ? 'group' : 'beat') });
    }
    measure += 1;
  }
  return beats;
}

/** @param {{fretMin: number, fretMax: number}} cfg @param {number} duration */
export function buildAnchors(cfg, duration) { const fMin = Number.isFinite(cfg.fretMin) ? cfg.fretMin : 0, fMax = Number.isFinite(cfg.fretMax) ? cfg.fretMax : fMin + 4; const out = [], width = Math.max(3, fMax - fMin + 1); for (let t = 0; t <= duration + 0.0001; t += 2) out.push({ time: Number(t.toFixed(6)), fret: fMin, width }); return out; }
