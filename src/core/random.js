// SPDX-License-Identifier: AGPL-3.0-only

/** @typedef {{humanSeed?: number, practiceType?: string, key?: string, scale?: string, shape?: string | number, fretboardSystem?: string, bpm?: number, bars?: number, meter?: {numerator?: number, denominator?: number}, subdivision?: string, progression?: string, direction?: string, sequence?: string, stringSetup?: string, chromaticPattern?: string, chordDepth?: string, chordOverride?: string, repeatCount?: number}} SeedConfig */

// ── Deterministic generation RNG (backing-engine step 1) ─────────────────────
// ALL randomness in the generation path routes through a per-chart seeded PRNG:
// the same cfg always yields a byte-identical chart (golden-testable; guarded by
// smoke-backing-engine). Variety comes from CHANGING the cfg (vary[], Refresh,
// an explicit cfg.humanSeed), never from hidden dice. Future humanization
// (drum/velocity jitter, fill rolls) must draw from this stream too.
/** @param {string} str */
export function hashStringToSeed(str) {            // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

/** @param {number} seed */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The chart's seed: an explicit cfg.humanSeed wins (reproduce/share a roll);
// otherwise a stable hash of the generation-relevant cfg identity.
/** @param {SeedConfig} cfg @param {string | number | null} [salt] */
export function resolveHumanSeed(cfg, salt) {
  let base;
  if (Number.isFinite(cfg.humanSeed)) base = /** @type {number} */ (cfg.humanSeed) >>> 0;
  else {
    const m = cfg.meter || {};
    base = hashStringToSeed([
      cfg.practiceType, cfg.key, cfg.scale, cfg.shape, cfg.fretboardSystem,
      cfg.bpm, cfg.bars, m.numerator, m.denominator, cfg.subdivision,
      cfg.progression, cfg.direction, cfg.sequence, cfg.stringSetup,
      cfg.chromaticPattern, cfg.chordDepth, cfg.chordOverride, cfg.repeatCount,
    ].join('|'));
  }
  // Per-track sub-stream SALT (track-architecture engine core): a track id mixes into the
  // seed so each track's rolls are independent + stable under reorder/insert (adding comp
  // #2 must not shift comp #1's rolls). No salt = byte-identical to the pre-track engine.
  return salt == null ? base : (base ^ hashStringToSeed('trk§' + salt)) >>> 0;
}

/** @param {SeedConfig} cfg @param {string | number | null} [salt] */
export function chartRng(cfg, salt) { return mulberry32(resolveHumanSeed(cfg, salt)); }

/** @template T @param {T[]} items @param {() => number} rand */
export function shuffleCopy(items, rand) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
