// SPDX-License-Identifier: AGPL-3.0-only
import { isBassCfg, openMidisForConfig } from './instrument-tuning.js';
import { compileChordTimeline, appendTimelineOffset } from './chord-timeline.js';
import { nearestPositionForPc } from './positions.js';
import { noteDefaults } from './notes.js';
import { buildSingleChart } from './exercise-dispatch.js';
import { STYLE_PALETTES, jamProgressionLabel } from './style-palettes.js';
import { resolveHumanSeed } from './random.js';
import { COMMON_PROGRESSIONS } from './harmony.js';
import { measureSeconds } from './timing.js';
import { buildBackingEvents } from './backing.js';
import { buildDrumEvents, resolveGroove } from './drum-grooves.js';
import { swingNotesBacking } from './feel.js';

// ── J-3 Energy macro (band-intensity over the loop) ─────────────────────────
// Energy shapes how FULL + HARD the band plays. Chill/Groove/Drive PIN one
// density level (1 sparse / 2 groove / 3 full) across every pass; Auto performs
// a build→peak→breakdown ARC across the passes (the section-arc — the wrap back
// to the intro reads as a reset). It moves the density TIER (→ resolveArrangement
// per-tier picks + the sparse breakdown drops the bass) AND a per-pass velocity
// lift, so the arc has dynamic CONTOUR, not just a changing instrument count.
/** @type {Record<string, number>} */
export const ENERGY_PIN = { chill: 1, groove: 2, drive: 3 };

/** @type {Record<number, number>} */
export const ENERGY_VEL = { 1: 0.85, 2: 1.0, 3: 1.12 };

// ── Jam multi-pass chart (Jam redesign slice J-1; docs/plugin/design/jam-mode-roundtable.md) ──
// Bakes the "living band" variation INTO the chart instead of mutating a live
// loop (D-J4 "variety before reactivity"): N passes of the style's progression,
// each pass re-rolled (per-pass humanSeed → fresh micro-timing/velocity/figure
// rolls), density-cycled (default → thinned → default → sparse, so the wrap
// back to full reads as a lift), optionally round-robining the style's
// progressions[] (the "switch it up" shuffle, D-J5a), with a small generic
// snare run into each seam + an open-hat lift on each new pass's one. The Jam
// loop region covers ALL passes, so every cycle differs with zero live-
// mutation risk. Band-mode filter (D-J2): 'no_bass' drops role:'bass' (a
// bassist OWNS the foundation); 'drums_only' keeps only the kit. Assembly
// mirrors buildKeyCycleChart (per-pass build + swing + offset). Core-pure.
/** @param {import('./generation-types.js').AccompanimentEvent[]} events @param {import('./generation-types.js').GenerationConfig} cfg @param {number} dur @param {number} pass */
export function appendJamSeamFill(events, cfg, dur, pass) {
  if (!events.some(e => e.role === 'drums')) return;     // drumless style/density: no fill
  const beatSec = (60 / cfg.bpm) * (4 / cfg.meter.denominator);
  const lastBeat = dur - beatSec;
  // Two snare 16ths ramping into the wrap ("& a" of the final beat)…
  /** @type {[number, number, boolean][]} */ ([[0.5, 0.45, true], [0.75, 0.8, false]]).forEach(([off, vel, ghost]) => {
    const tt = lastBeat + beatSec * off;
    if (tt < dur - 1e-3) events.push({ t: +tt.toFixed(6), end: +(tt + 0.1).toFixed(6), role: 'drums', voice: 'snare', velocity: vel, accent: !ghost, ghost, noSwing: false });
  });
  // …and an open-hat lift on this pass's own one (passes after the first).
  if (pass > 0) events.push({ t: 0, end: 0.1, role: 'drums', voice: 'hh_open', velocity: 0.8, accent: true, ghost: false, noSwing: false });
}

// per-density velocity scalar (clamped at the voicing)
/** @param {number} d */
export function energyVelScale(d) { return ENERGY_VEL[d] != null ? ENERGY_VEL[d] : 1; }

// The Auto density arc for N passes: ease in at groove (2) → build/hold the peak
// at full (3) → breakdown to sparse (1) on the last pass. Band present from the
// first pass (no "where's my band?"); the breakdown is the dramatic moment, the
// wrap the rebuild. Robust for 2–8 passes.
/** @param {number} passes */
export function energyAutoArc(passes) {
  const n = Math.max(2, passes | 0), arc = [];
  for (let i = 0; i < n; i++) arc.push(i === n - 1 ? 1 : i === 0 ? 2 : 3);
  return arc;
}

// Per-pass dynamics: scale comp/bass (ev.vel, default 1) + drums (ev.velocity,
// default 0.78) by the energy scalar. Jam-only (buildJamChart), so non-jam
// backing is untouched. Clamped so nothing clips or drops out.
/** @param {{role?: string, velocity?: number, vel?: number}[]} events @param {number} k */
export function scaleBackingDynamics(events, k) {
  if (k === 1) return;
  for (const ev of events) {
    if (ev.role === 'drums') { const v = Number.isFinite(ev.velocity) ? /** @type {number} */ (ev.velocity) : 0.78; ev.velocity = +Math.min(1, Math.max(0.02, v * k)).toFixed(4); }
    else { const v = Number.isFinite(ev.vel) ? /** @type {number} */ (ev.vel) : 1; ev.vel = +Math.min(1, Math.max(0.05, v * k)).toFixed(4); }
  }
}

/** @param {import('./generation-types.js').TimelineEvent} ev @param {import('./generation-types.js').GenerationConfig} cfg @param {string} styleId @param {number} pass @param {number} idx */
export function jamSpotlightPhrasePcs(ev, cfg, styleId, pass, idx) {
  const root = ((ev.rootPc || 0) % 12 + 12) % 12;
  const cpcs = Array.isArray(ev.cpcs) && ev.cpcs.length ? ev.cpcs : [root, (root + 4) % 12, (root + 7) % 12];
  const guides = Array.isArray(ev.gpcs) && ev.gpcs.length ? ev.gpcs : cpcs.filter(pc => pc !== root && pc !== (root + 7) % 12);
  const fifth = cpcs.includes((root + 7) % 12) ? (root + 7) % 12 : cpcs[1] || root;
  if (isBassCfg(cfg)) {
    if (['disco', 'synthwave', 'funk'].includes(styleId)) return [root, (root + 7) % 12, root];
    if (['jazz', 'gypsy_jazz', 'western_swing'].includes(styleId)) return [root, (root + 11) % 12, root];
    if (['reggae', 'dub', 'shoegaze'].includes(styleId)) return [root];
    return [root, fifth];
  }
  if (['jazz', 'gypsy_jazz', 'city-pop', 'ragtime'].includes(styleId)) return [guides[0] || cpcs[1] || root, guides[1] || cpcs[2] || root, root];
  if (['funk', 'reggae', 'afrobeat', 'disco', 'soul'].includes(styleId)) return [root, fifth, cpcs[(idx + pass) % cpcs.length] || root];
  if (['metal', 'djent', 'punk', 'rock', 'surf'].includes(styleId)) return [root, fifth, root];
  if (['country', 'bluegrass', 'western_swing', 'blues'].includes(styleId)) return [root, cpcs.find(pc => pc !== root && pc !== fifth) || fifth, fifth];
  return [root, guides[0] || cpcs[1] || fifth, cpcs[2] || root];
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} duration @param {number} pass @param {string} styleId @returns {import('./notes.js').Note[]} */
export function jamSpotlightPhraseNotes(cfg, duration, pass, styleId) {
  const tl = compileChordTimeline(cfg, duration).filter(ev => ev && ev.cpcs && ev.startSec < duration - 0.001);
  const beatSec = (60 / cfg.bpm) * (4 / cfg.meter.denominator);
  const opens = openMidisForConfig(cfg);
  const fMin = Math.max(0, Number.isFinite(cfg.fretMin) ? cfg.fretMin : 0);
  const fMax = Math.min(24, Number.isFinite(cfg.fretMax) ? cfg.fretMax : fMin + 7);
  const notes = [];
  let prevMidi = isBassCfg(cfg) ? 40 : 60;
  for (let i = 0; i < tl.length; i++) {
    const ev = tl[i];
    if (ev.startSec >= duration - 0.001) break;
    if (!isBassCfg(cfg) && i % 2 !== pass % 2) continue;   // call, then air
    const pcs = jamSpotlightPhrasePcs(ev, cfg, styleId, pass, i);
    const maxNotes = isBassCfg(cfg) ? Math.min(2, pcs.length) : Math.min(3, pcs.length);
    for (let j = 0; j < maxNotes; j++) {
      const tt = ev.startSec + beatSec * (isBassCfg(cfg) ? j : (j === 0 ? 0 : j * 0.75));
      if (tt >= ev.endSec - beatSec * 0.15 || tt >= duration - 0.001) continue;
      const pos = nearestPositionForPc(pcs[j], prevMidi, opens, fMin, fMax);
      if (!pos) continue;
      prevMidi = pos.midi;
      notes.push(noteDefaults({
        t: Number(tt.toFixed(6)), s: pos.s, f: pos.f,
        sus: Math.max(0.08, beatSec * (isBassCfg(cfg) ? 0.72 : 0.52)),
        ac: j === 0, _spotlightPhrase: true,
      }));
    }
  }
  return notes.length ? notes : buildSingleChart(cfg).notes.slice(0, 4).map(n => Object.assign({}, n, { _spotlightPhrase: true }));
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @returns {import('./generation-types.js').Chart} */
export function buildJamChart(cfg) {
  const pal = STYLE_PALETTES[/** @type {string} */ (cfg.jamStyle)];
  const passes = Math.max(2, Math.min(8, /** @type {number} */ (cfg.jamPasses) | 0 || 4));
  const progIdx = /** @type {number} */ (cfg.jamProgressionIdx) | 0;
  const switchUp = !!cfg.jamSwitchUp && pal && pal.progressions.length > 1;
  const baseSeed = resolveHumanSeed(cfg);
  // Energy (J-3): manual Chill/Groove/Drive pins every pass to one density; Auto
  // arcs density across the passes. An explicit cfg.backingDensity (non-jam
  // callers) still wins. Default 'auto'.
  const energy = cfg.jamEnergy || 'auto';
  const autoArc = energyAutoArc(passes);
  /** @param {number} p */
  const passDensityFor = (p) => cfg.backingDensity != null ? cfg.backingDensity
    : (ENERGY_PIN[energy] != null ? ENERGY_PIN[energy] : autoArc[p % autoArc.length]);
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
  for (let pass = 0; pass < passes; pass++) {
    const dPass = passDensityFor(pass);
    const progs = pal ? pal.progressions : [cfg.progression];
    const progression = progs[(((progIdx + (switchUp ? pass : 0)) % progs.length) + progs.length) % progs.length];
    const degs = COMMON_PROGRESSIONS[progression];
    const bars = (degs && degs.length) ? Math.max(2, Math.min(16, degs.length)) : (cfg.bars || 8);
    const pCfg = Object.assign({}, cfg, {
      progression, bars,
      humanSeed: (baseSeed + pass * 0x9e3779b9) >>> 0,
      backingDensity: dPass,
      jamStyle: undefined, jamPasses: undefined,     // the pass builds plain — no recursion
    });
    const chart = buildSingleChart(pCfg);
    const dur = Math.max(chart.duration || 0, bars * measureSeconds(pCfg));
    let rawBack = /** @type {import('./generation-types.js').AccompanimentEvent[]} */ (buildBackingEvents(pCfg, dur)).concat(buildDrumEvents(pCfg, dur, resolveGroove(pCfg)));
    appendJamSeamFill(rawBack, pCfg, dur, pass);
    if (cfg.jamBandMode === 'no_bass') rawBack = rawBack.filter(ev => ev.role !== 'bass');
    else if (cfg.jamBandMode === 'drums_only') rawBack = rawBack.filter(ev => ev.role === 'drums');
    scaleBackingDynamics(rawBack, energyVelScale(dPass));   // J-3: a touch of dynamics over the arc
    const sw = swingNotesBacking(chart.notes, rawBack, pCfg);
    appendTimelineOffset(timeline, compileChordTimeline(pCfg, dur), t, beatOff, barOff);
    sections.push({ name: jamProgressionLabel(progression), number: sections.length + 1, time: Number(t.toFixed(6)) });
    // Spotlight (J-3 trade-solos): tag this pass's lead notes with whose turn it
    // is (even pass = you solo / odd = band solos). The scheduler silences 'you'
    // lead notes (you're the soloist); the cue + highlight switch per turn. Off →
    // no tag added → byte-identical chart.
    const soloTurn = cfg.jamSpotlight ? (pass % 2 === 0 ? 'you' : 'band') : null;
    const leadNotes = soloTurn === 'band' ? swingNotesBacking(jamSpotlightPhraseNotes(pCfg, dur, pass, /** @type {string} */ (cfg.jamStyle)), [], pCfg).notes : sw.notes;
    leadNotes.forEach(n => { const nn = Object.assign({}, n, { t: Number((n.t + t).toFixed(6)) }); if (soloTurn) nn.solo = soloTurn; notes.push(nn); });
    chart.chords.forEach(c => chords.push(Object.assign({}, c, { t: Number((c.t + t).toFixed(6)), id: c.id + tplOffset })));
    chart.chordTemplates.forEach(ct => chordTemplates.push(ct));
    chart.handShapes.forEach(hs => handShapes.push(Object.assign({}, hs, { chord_id: hs.chord_id + tplOffset, start_time: Number((hs.start_time + t).toFixed(6)), end_time: Number((hs.end_time + t).toFixed(6)) })));
    (chart.anchors || []).forEach(a => anchors.push(Object.assign({}, a, { time: Number((a.time + t).toFixed(6)) })));
    sw.backing.forEach(ev => backingEvents.push(Object.assign({}, ev, { t: Number((ev.t + t).toFixed(6)), end: Number((ev.end + t).toFixed(6)) })));
    tplOffset += chart.chordTemplates.length;
    const pBar = measureSeconds(pCfg);
    beatOff += (dur / pBar) * Math.max(1, pCfg.meter.numerator);
    barOff += Math.round(dur / pBar);
    t += dur;
  }
  return { notes, chords, chordTemplates, handShapes, sections, anchors, backingEvents, timeline, duration: t };
}
