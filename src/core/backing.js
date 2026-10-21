// SPDX-License-Identifier: AGPL-3.0-only
import { resolveArrangement, cfgAudioProfile } from './arrangement.js';
import { resolveAudioProfile } from './audio-profiles.js';
import { compCellForConfig, COMP_GROOVES, buildCompCellHits } from './comp-cells.js';
import { bassFigureForConfig, buildBassFigureEvents } from './bass-figures.js';
import { resolveGroove } from './drum-grooves.js';
import { progressionDegreesForConfig } from './harmony.js';
import { NOTE_ALIASES } from './pitch.js';
import { backingVoicingStyle, voiceBackingChord, voiceLeadBackingChord, voiceBackingPad, pcAtOrAbove } from './voicing.js';
import { compileChordTimeline } from './chord-timeline.js';
import { chartRng } from './random.js';
import { measureSeconds } from './timing.js';

// DESUGAR a cfg's resolved arrangement → an ordered tracks[] (track-architecture engine
// core, stage 1). Each track = {id, role, cell, bus}. The fixed comp/bass/drums/pad lanes
// become EXPLICIT tracks, resolved through the SAME resolvers buildBackingEvents/
// buildDrumEvents use (compCellForConfig / bassFigureForConfig / resolveGroove / the
// profile pad), gated by the recipe's ensemble on/off. A genre will later OPT IN to its
// own tracks:[] for N lanes (e.g. bluegrass banjo + guitar). NOT YET CONSUMED — stage 2
// makes buildBackingEvents loop over this; for now it's the verified adapter + the basis
// for the per-track salted rng. Byte-identical: it just re-expresses today's 4 lanes.
/** @param {import('./generation-types.js').GenerationConfig} cfg */
export function recipeTracks(cfg) {
  const ens = resolveArrangement(cfg).ensemble || {};
  /** @param {string} id */
  const on = id => ens[id] !== 'off';
  /** @type {import('./generation-types.js').AudioProfile} */
  let prof = {}; try { prof = resolveAudioProfile(cfg); } catch (_) {}
  const tracks = [];
  const compId = compCellForConfig(cfg);
  if (compId && on('comp')) tracks.push({ id: 'comp', role: 'comp', cell: compId, bus: 'harmony' });
  const figId = bassFigureForConfig(cfg);
  if (figId && on('bass')) tracks.push({ id: 'bass', role: 'bass', cell: figId, bus: 'bass' });
  const grooveId = resolveGroove(cfg);
  if (grooveId && on('drums')) tracks.push({ id: 'drums', role: 'drums', cell: grooveId, bus: 'drums' });
  const padRole = prof.pad && prof.pad.role;
  if (padRole && on('pad')) tracks.push({ id: 'pad', role: padRole === 'comp' ? 'comp' : 'sustain', bus: padRole === 'comp' ? 'harmony' : 'pad', padBus: padRole === 'comp' });
  // Genre OPT-IN extra comp lanes (track-architecture stage 3b): a recipe's tracks:[] declares
  // comp tracks BEYOND the primary — the bluegrass guitar boom-chuck ALONGSIDE the banjo roll.
  // Each {id, cell, bus, voice}; role defaults 'comp', bus defaults a per-id comp bus. Gated by
  // ensemble[id] (defaults on). Byte-identical for the 28 genres that declare no tracks[].
  for (const t of (resolveArrangement(cfg).tracks || [])) {
    if (!on(t.id)) continue;
    tracks.push({ id: t.id, role: t.role || 'comp', cell: t.cell, bus: t.bus || ('comp_' + t.id), voice: t.voice, label: t.label });
  }
  return tracks;
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} duration */
export function buildBackingEvents(cfg, duration) {
  if (cfg.backingDensity === 0) return [];            // click-only density: no comp, no bass
  // Player-is-the-comp (L&D's lane-suppression rule): a strum_comp drill IS
  // the comp — backing harmony would double the player's own strums. (Step 4
  // moved this AHEAD of the boogie branch: the suppression rule beats a
  // style's backing recipe.)
  if ((cfg.practiceType || cfg.mode) === 'strum_comp') return [];
  // The pad-vs-comp A/B dev flag keeps the WHOLE pre-engine layer: the
  // bespoke boogie builder for boogie styles (the pre-step-4 sound), the
  // coalesced pad for everything else (cell + figure resolvers both gate).
  if (cfg.backingStyle === 'boogie' && cfg.backingPadDev) return buildBoogieBacking(cfg, duration);
  /** @type {import('./generation-types.js').BackingEvent[]} */
  const events = [];
  // Voice-lead chord-to-chord (step 2): thread prevVoicing through the loop.
  // Block/rung scoping is free — sessions and ladders call buildBackingEvents
  // per part (the desync rule), so voice-leading never crosses a block seam.
  // Re-anchor only at the TOP OF THE FORM (progression-cycle start) and only
  // when the comp has drifted > a 4th from the register centre — a comper
  // resets at the top of the form, never mid-form.
  const cycleLen = Math.max(1, (progressionDegreesForConfig(cfg) || []).length);
  const cellId = compCellForConfig(cfg);
  const cell = cellId ? COMP_GROOVES[cellId] : null;
  const _bjKeyPc = NOTE_ALIASES[cfg.key] ?? 0;   // key tonic pc for the banjo-roll drone (compTargetMidis)
  const figId = bassFigureForConfig(cfg);
  const lift = !!figId;                               // a real bass plays — the comp drops its folded root
  // Keys (pad) layer (un-orphan, panel 2026-06-13): a profile may declare a 2nd
  // harmonic voice on the Keys bus — 'sustain' = a separate rootless pad ABOVE the
  // comp (voiceBackingPad), 'comp' = the comp itself routed to Keys (e.g. jazz's
  // comping PIANO). Gated off when the recipe sets ensemble.pad:'off' (metal/punk
  // stay keyless) and never fires for an un-recipe'd / pad-less profile.
  const _prof = resolveAudioProfile(cfg);
  const _padRole = (_prof.pad && _prof.pad.role) || null;
  const _padOn = !!_padRole && resolveArrangement(cfg).ensemble.pad !== 'off';
  const _padSustain = _padOn && _padRole === 'sustain';
  const _padComp = _padOn && _padRole === 'comp';
  // Voicing STYLE (Layer 2): strum genres get a tight low GUITAR triad and a strummer
  // RE-GRABS each chord (no voice-leading); jazz/funk comp the rootless 'shell' AND
  // voice-lead it. cfgAudioProfile keys the style; jazz's comp-on-keys still shells.
  const _voicingStyle = _padComp ? 'shell' : backingVoicingStyle(cfgAudioProfile(cfg));
  const beatSec = (60 / cfg.bpm) * (4 / cfg.meter.denominator);
  const timeline = compileChordTimeline(cfg, duration);
  // Generators draw ONLY from the chart's seeded rng (determinism is a hard
  // rule — the same cfg walks the same line on every pass and regenerate).
  const figHits = figId ? buildBassFigureEvents(figId, timeline, duration, beatSec, chartRng(cfg)) : null;
  // N-comp lanes (track-architecture stage 2): comp tracks a genre opts into BEYOND the
  // primary. EMPTY for every desugared genre today (only 'comp'/'pad' carry role 'comp'), so
  // the extra-comp loop below is dormant + byte-identical until a genre (bluegrass) declares
  // its own tracks[]. Each extra lane gets its own bar-variation state (independent variation).
  const _extraComps = recipeTracks(cfg).filter(t => t.role === 'comp' && t.id !== 'comp' && t.id !== 'pad').map(t => ({ ...t, _var: { last: -1 } }));
  /** @type {number[] | null} */
  let prevVoicing = null;
  let evIdx = 0;
  /** @type {import('./generation-types.js').BackingEvent | null} */
  let lastPad = null;
  /** @type {import('./generation-types.js').BackingEvent | null} */
  let lastSustainPad = null;
  const _primaryVar = { last: -1 };   // the primary comp lane's seed-rotated bar-variation state
  for (let ci = 0; ci < timeline.length; ci++) {
    const c = timeline[ci];
    if (evIdx % cycleLen === 0 && prevVoicing && Math.abs((prevVoicing[1] ?? 55) - 55) > 5) prevVoicing = null;
    /** @type {number[]} */
    const midis = _voicingStyle === 'triad'
      ? voiceBackingChord(c.rootPc, c.intervals, cfg.instrument, lift, 'triad')   // strummer re-grabs each chord (no voice-leading)
      : prevVoicing
        ? voiceLeadBackingChord(c.rootPc, c.intervals, cfg.instrument, prevVoicing, lift)
        : voiceBackingChord(c.rootPc, c.intervals, cfg.instrument, lift, _voicingStyle);
    prevVoicing = midis;
    evIdx++;
    const fh = figHits ? figHits[ci] : null;
    // Exactly ONE event per chord change carries the label + theory payload
    // (name/cpcs/gpcs/rn/fn): the figure's beat-1 root when a figure plays
    // (it lands at the slot start — the kick lock), else the comp cell's
    // first hit, else the pad event. The dense-lane consumers (jamTargetPcs,
    // the Jam overview + anticipation, drawBackingChords) key off that
    // carrier — one label per change, never one per hit.
    if (cell) {
      // The COMP_GROOVES path: build the PRIMARY comp lane's hits (the grid-stepping + the
      // seed-rotated bar-variation now live in buildCompCellHits, shared with the extra
      // lanes), MERGE the bass figure in (bass-first on ties), and stamp the one-label-per-
      // change carrier on hits[0]. Identical output to the pre-stage-2 inline loop.
      const compHits = buildCompCellHits(cfg, c, cell, /** @type {string} */ (cellId), midis, lift, _bjKeyPc, _padComp, beatSec, duration, _primaryVar);
      /** @type {import('./generation-types.js').BackingEvent[]} */
      const hits = fh && fh.length ? fh.slice() : [];
      for (const h of compHits) hits.push(h);
      hits.sort((a, b) => (a.t - b.t) || (a.role === 'bass' ? -1 : b.role === 'bass' ? 1 : 0));
      if (hits.length) Object.assign(hits[0], { name: c.name, cpcs: c.cpcs, gpcs: c.gpcs, rn: c.rn, fn: c.fn });
      events.push(...hits);
      // ADDITIONAL comp lanes (e.g. bluegrass guitar boom-chuck ALONGSIDE the banjo roll):
      // each builds its own hits over the SAME chord + voicing (harmonically locked for
      // free — both read the identical timeline), tagged with its track id; no bass merge,
      // no label (the primary carries it). Dormant until a genre declares >1 comp track.
      for (const ec of _extraComps) {
        const ecell = COMP_GROOVES[/** @type {string} */ (ec.cell)]; if (!ecell) continue;
        const eHits = buildCompCellHits(cfg, c, ecell, /** @type {string} */ (ec.cell), midis, lift, _bjKeyPc, false, beatSec, duration, ec._var);
        for (const h of eHits) { h.track = ec.id; h.bus = ec.bus; }
        events.push(...eHits);
      }
      // Sustain Keys pad (un-orphan): a separate held rootless voice ABOVE the comp.
      // Coalesce consecutive identical voicings so it doesn't re-attack every bar.
      if (_padSustain) {
        const pmidis = voiceBackingPad(c.rootPc, c.intervals, midis);
        if (pmidis.length) {
          if (lastSustainPad && lastSustainPad.end >= c.startSec - 1e-4 && lastSustainPad.midis.length === pmidis.length && lastSustainPad.midis.every((m, k) => m === pmidis[k])) {
            lastSustainPad.end = c.endSec;
          } else {
            lastSustainPad = { t: c.startSec, end: c.endSec, role: 'pad', name: '', midis: pmidis };
            events.push(lastSustainPad);
          }
        }
      }
      continue;
    }
    // Legacy pad: coalesce consecutive identical chords into one sustained
    // event so the pad doesn't hard re-attack every bar (the "pumping").
    // lastPad tracks the comp lane explicitly — figure hits interleave
    // behind it in the array, so events[events.length-1] is no longer it.
    if (lastPad && lastPad.name === c.name && lastPad.midis.length === midis.length && lastPad.midis.every((m, k) => m === midis[k])) {
      lastPad.end = c.endSec;
    } else {
      lastPad = { t:c.startSec, end:c.endSec, name:c.name, midis, cpcs:c.cpcs, gpcs:c.gpcs, rn:c.rn, fn:c.fn };
      events.push(lastPad);
    }
    if (fh && fh.length) events.push(...fh);
  }
  return events;
}

// LEGACY boogie/shuffle backing (blues-idiom + harmony-theory-architect review).
// Walk a root-5-6-♭7 bass figure on the beats and stab a rootless dom9 shell
// (3rd / ♭7 / 9th) on the off-beats — the classic blues shuffle comp. The
// off-beat stabs swing late once applySwingToBundle runs, giving the triplet
// feel. Re-articulated, NOT coalesced — movement is the point.
// STEP 4 (the full-recipe migration): boogie now plays through the unified
// path as the boogie_stab comp cell + the bass_ostinato figure; this bespoke
// builder is kept ONLY behind the backingPadDev A/B flag (the pre-engine
// sound for comparison). Don't extend it — extend the registries.
/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} duration */
export function buildBoogieBacking(cfg, duration) {
  const slot = measureSeconds(cfg);
  const beatsPerBar = Math.max(1, cfg.meter.numerator);
  const beatSec = slot / beatsPerBar;
  const bassLow = cfg.instrument === 'bass' ? 24 : 36, bassHigh = cfg.instrument === 'bass' ? 38 : 48;
  const upperLow = cfg.instrument === 'bass' ? 50 : 58, upperHigh = 72;
  const BOOGIE = [0, 7, 9, 10]; // root, 5th, 6th, ♭7 — the walking boogie figure
  const events = [];
  for (const c of compileChordTimeline(cfg, duration)) {
    const t = c.startSec, rootPc = c.rootPc, name = c.name, cpcs = c.cpcs, gpcs = c.gpcs;
    const ivset = c.intervals.map(i => ((i % 12) + 12) % 12);
    // Rootless shell: guide tones (3rd + 7th) + the 9th colour. Falls back to the
    // full voiced pad when the chord has no clear 3rd/7th (e.g. a power chord).
    const third = ivset.includes(4) ? 4 : ivset.includes(3) ? 3 : null;
    const sev = ivset.includes(10) ? 10 : ivset.includes(11) ? 11 : null;
    let shell;
    if (third != null && sev != null) {
      shell = []; let cur = upperLow;
      for (const iv of [third, sev, 14]) {
        let m = pcAtOrAbove((rootPc + iv) % 12, cur);
        if (m > upperHigh) m -= 12;
        shell.push(m); cur = m + 2;
      }
      shell.sort((a, b) => a - b);
    } else {
      shell = voiceBackingChord(rootPc, c.intervals, cfg.instrument);
    }
    const bassRoot = pcAtOrAbove(rootPc % 12, bassLow);
    const root0 = bassRoot > bassHigh ? bassRoot - 12 : bassRoot;
    // Walk the beats of THIS event's window (not an assumed whole bar) so a
    // sub-bar harmonic-rhythm event gets its own figure-from-the-root restart.
    // Bar-locked events span exactly a bar — output unchanged.
    for (let b = 0; ; b++) {
      const beatT = t + b * beatSec;
      if (beatT >= c.endSec - 1e-4 || beatT >= duration - 1e-4) break;
      const bassMidi = root0 + BOOGIE[b % BOOGIE.length];
      // Walking bass on the beat (only the bar's downbeat carries the chord name,
      // so the in-tree backing overlay shows one label per bar, not per hit).
      // role:'bass' routes it to the sampled bass voice / 'bass' bus, distinct
      // from the harmony shell — so the boogie walks like a bass, not an organ.
      events.push({ t:Number(beatT.toFixed(6)), end:Number(Math.min(duration, beatT + beatSec * 0.9).toFixed(6)), name: b === 0 ? name : '', midis:[bassMidi], role:'bass', cpcs, gpcs });
      // Chord-shell chick on the off-beat (the swung "and").
      const upT = beatT + beatSec * 0.5;
      if (upT < c.endSec - 1e-4 && upT < duration - 1e-4) events.push({ t:Number(upT.toFixed(6)), end:Number(Math.min(duration, upT + beatSec * 0.4).toFixed(6)), name:'', midis:shell, cpcs, gpcs });
    }
  }
  return events;
}
