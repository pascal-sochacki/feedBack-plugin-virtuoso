// SPDX-License-Identifier: AGPL-3.0-only
import { cfgAudioProfile } from './arrangement.js';

// Swing/shuffle feel as a single post-process over the assembled bundle, so the
// lead notes and the backing comp swing together against the steady metronome
// (clicks stay on the grid — they're the reference you shuffle against). Warps
// each onset's phase WITHIN its beat: the eighth boundary 0.5 → r (0.667 = a
// triplet shuffle), so downbeats stay put and off-beats fall late. Count-in and
// loop-tail offsets are whole bars, so phase stays aligned across the timeline.
/** @type {Record<string, number>} */
export const SWING_RATIOS = { straight:0.5, swing:0.6, shuffle:0.667 };

// ── Tier-2: per-genre micro-timing LEAN (rhythm-meter 2026-06-13) ─────────────
// The "feel" polish: a SYSTEMATIC (not random) per-role timing offset that drags
// the backbeat/comp behind the kick+bass (laid-back) or pushes it ahead (urgent).
// The relative offset BETWEEN roles is what the ear reads as a "pocket" — distinct
// from the engine's symmetric ±jitter (which can't make a CONSISTENT lean). Seconds,
// +late / −early; keyed by audioProfile (+ drum VOICE — the backbeat snare is the
// prime mover). Deterministic, so byte-golden charts stay byte-golden. The kick +
// bass-root stay anchored; the snare/comp lean against them = the audible drag.
/** @type {Record<string, Record<string, number>>} */
export const FEEL_TIMING = {
  country: { snare_xstick: 0.013, snare: 0.013, comp: 0.009 },   // laid-back country backbeat
  jazz:    { snare: 0.012, snare_xstick: 0.012, comp: 0.010 },   // brushy lay-back behind the ride
  blues:   { snare: 0.012, comp: 0.010 },                        // lazy shuffle drag
  soul:    { snare: 0.014, comp: 0.010 },                        // deep behind-the-beat pocket
  reggae:  { snare_xstick: 0.016, snare: 0.016, bass: -0.005 },  // the one-drop drag
  gospel:  { snare: 0.012, comp: 0.008 },
  funk:    { comp: -0.004 },                                     // tight/forward 16th pocket
  // metal/djent/punk/disco: on-the-grid (urgency/precision IS the feel) — no entry.
};

// Warp one onset's phase WITHIN its beat on cfg's grid: the eighth boundary
// 0.5 → r (0.667 = a triplet shuffle); downbeats map to themselves. Returns t
// unchanged for a straight feel. The SINGLE definition shared by the per-block
// session assembly (swingNotesBacking, block-local time) and the single-exercise
// post-pass (applySwingToBundle) — so multi-tempo sessions swing each block on
// its OWN grid instead of one global block-1 grid.
/** @param {number} t @param {import('./generation-types.js').GenerationConfig} cfg */
export function swungTime(t, cfg) {
  const r = SWING_RATIOS[cfg.swing] || 0.5;
  if (r === 0.5) return t;
  const beatSec = (60 / cfg.bpm) * (4 / cfg.meter.denominator);
  const bi = Math.floor(t / beatSec + 1e-9);
  const frac = t / beatSec - bi;
  const f2 = frac < 0.5 ? frac * (2 * r) : r + (frac - 0.5) * 2 * (1 - r);
  return +(((bi + f2) * beatSec)).toFixed(6);
}

// Swing a notes[] + backingEvents[] pair on cfg's grid (returns new arrays).
// Used per-block at session assembly in BLOCK-LOCAL time (before the +t offset)
// so phase is measured from the block origin; respects noSwing (pre-swung) cells.
/** @template {import('./notes.js').Note} N @template {{t: number, end: number, noSwing?: boolean}} B @param {N[]} notes @param {B[]} backing @param {import('./generation-types.js').GenerationConfig} cfg */
export function swingNotesBacking(notes, backing, cfg) {
  if ((SWING_RATIOS[cfg.swing] || 0.5) === 0.5) return { notes:notes || [], backing:backing || [] };
  const sn = (notes || []).map(n => {
    if (n.noSwing) return n;
    const nt = swungTime(n.t, cfg), ne = swungTime(n.t + (n.sus || 0), cfg);
    return Object.assign({}, n, { t:nt, sus:Math.max(0.02, +(ne - nt).toFixed(6)) });
  });
  const sb = (backing || []).map(ev => {
    if (ev.noSwing) return ev;
    const et = swungTime(ev.t, cfg), ee = swungTime(ev.end, cfg);
    return Object.assign({}, ev, { t:et, end:Math.max(+(et + 0.02).toFixed(6), ee) });
  });
  return { notes:sn, backing:sb };
}

/** @param {{t: number, end?: number, role?: string, voice?: string}[]} events @param {import('./generation-types.js').GenerationConfig} cfg @param {number} duration */
export function applyFeelLean(events, cfg, duration) {
  const lean = FEEL_TIMING[cfgAudioProfile(cfg)];
  if (!lean || !events || !events.length) return;
  const hi = (duration || 1e9) - 0.02;
  for (const ev of events) {
    const dt = ev.role === 'drums' ? (lean[/** @type {string} */ (ev.voice)] != null ? lean[/** @type {string} */ (ev.voice)] : (lean.drums || 0))
             : ev.role === 'bass'  ? (lean.bass || 0)
             : (lean.comp || 0);   // comp + pad ride the comp lean
    if (!dt) continue;
    const t = Math.max(0, Math.min(hi, ev.t + dt));
    if (ev.end != null) ev.end = +(ev.end + (t - ev.t)).toFixed(6);
    ev.t = +t.toFixed(6);
  }
}
