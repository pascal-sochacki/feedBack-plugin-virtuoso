// SPDX-License-Identifier: AGPL-3.0-only
import { progressionDegreesForConfig, chordRootForDegree, chordQualityForDegree, chordName } from './harmony.js';
import { measureSeconds } from './timing.js';
import { CHORD_FORMULAS } from './chord-theory.js';

// Roman-numeral + harmonic-function helpers for the Jam chord-loop overview
// (the transferable layer + the band tints). Function hues are categorical and
// deliberately NOT meter-green (green = cleared-only).
export const ROMAN_BASE = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Chord-tone + guide-tone pitch classes for a chord, for the Jam target-highlight.
// cpcs = all chord tones; gpcs = the guide tones (3rd + 7th — the chord's identity).
/** @param {number} rootPc @param {number[]} intervals */
export function chordHighlightPcs(rootPc, intervals) {
  const ivset = intervals.map(i => ((i % 12) + 12) % 12);
  const cpcs = Array.from(new Set(ivset.map(iv => (rootPc + iv) % 12)));
  const third = ivset.includes(4) ? 4 : ivset.includes(3) ? 3 : null;
  const sev = ivset.includes(10) ? 10 : ivset.includes(11) ? 11 : null;
  const gpcs = [third, sev].filter(x => x != null).map(iv => (rootPc + iv) % 12);
  return { cpcs, gpcs };
}

/** @param {import('./generation-types.js').Degree} degree */
export function degreeFunction(degree) {
  const d = (degree && typeof degree === 'object') ? (degree.deg || 1) : Math.round(degree || 1);
  const m = (((d - 1) % 7) + 7) % 7 + 1;
  if (m === 5 || m === 7) return 'dominant';
  if (m === 2 || m === 4) return 'subdominant';
  return 'tonic';
}

/** @param {import('./generation-types.js').Degree | null} degree @param {string} quality */
export function romanLabel(degree, quality) {
  if (degree == null) return '';
  if (typeof degree === 'object') return degree.rn || '';   // chromatic/borrowed token carries its own
  const d = Math.round(degree);
  let r = ROMAN_BASE[(((d - 1) % 7) + 7) % 7 + 1] || '';
  const q = String(quality || '');
  if (/^min/.test(q) || /^dim/.test(q)) r = r.toLowerCase();
  if (/min7b5/.test(q)) r += 'ø7'; else if (/dim7/.test(q)) r += '°7'; else if (/^dim/.test(q)) r += '°';
  else if (/maj(7|9|11|13)/.test(q)) r += 'maj7';   // major-seventh family — never read as dominant "7"
  else if (/13/.test(q)) r += '13'; else if (/11/.test(q)) r += '11'; else if (/9/.test(q)) r += '9';
  else if (/7/.test(q)) r += '7';
  return r;
}

// ── Chord timeline — the single source of "what chord at what bar/beat" ──────
// Derived ONCE from the cfg (progression × key × scale × chordDepth/override ×
// tritoneSub) into a beat-keyed harmonic skeleton. Both the BACKING (pad +
// boogie, below) read this instead of re-deriving the chord inline, so the
// accompaniment can never silently disagree with the foreground about the
// harmony. Exposed as chart.timeline (generateExercise/generateSession) for the
// Jam loop, the seam proof metric, and play-the-changes drill routing.
//
// Event schema (backing-engine step 1; chair's ruling — beats canonical,
// seconds derived):
//   startBeat/durBeats = the harmonic SLOT (never pushed; theory labels rn/fn
//     describe the slot). cfg.harmonicRhythm '2/bar' packs two progression
//     degrees per bar (the real ii–V in one bar); absent/'1/bar' = the
//     bar-locked case — unchanged output, nothing regresses.
//   startSec/endSec = the SOUNDING window (push applied, pre-swing) — what the
//     comp/bass/mirror realize. `push` (beats, optional) is ANTICIPATION: the
//     chord sounds early. The compiler emits none; recipe/engine ops set it
//     and re-derive via applyTimelinePush below.
//   bass (slash/pedal override) + gen:'approach' (engine-generated passing
//     chords) ride the same events when steps 2-3 produce them.
// See memory project_cross_instrument_backing_unification.
/** @param {Pick<import('./generation-types.js').GenerationConfig, 'key' | 'scale' | 'progression' | 'chordDepth' | 'chordOverride' | 'tritoneSub' | 'mode' | 'bpm' | 'meter' | 'harmonicRhythm'>} cfg @param {number} duration @returns {import('./generation-types.js').TimelineEvent[]} */
export function compileChordTimeline(cfg, duration) {
  const degrees = progressionDegreesForConfig(cfg);
  const slot = measureSeconds(cfg);
  const beatsPerBar = Math.max(1, cfg.meter.numerator);
  const perBar = cfg.harmonicRhythm === '2/bar' ? 2 : 1;
  const evSec = slot / perBar, evBeats = beatsPerBar / perBar;
  const out = [];
  for (let t = 0, i = 0; t < duration - 0.001; t += evSec, i++) {
    const degree = degrees[i % degrees.length];
    const rootPc = chordRootForDegree(cfg, degree);
    const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth, degree, cfg.chordOverride, cfg.progression);
    const formula = CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj;
    const { cpcs, gpcs } = chordHighlightPcs(rootPc, formula.intervals);
    out.push({
      bar: Math.floor(i / perBar),
      startSec: Number(t.toFixed(6)),
      endSec: Number(Math.min(duration, t + evSec).toFixed(6)),
      startBeat: i * evBeats, durBeats: evBeats,
      degree, rootPc, quality, intervals: formula.intervals,
      name: chordName(rootPc, quality),
      rn: romanLabel(degree, quality), fn: degreeFunction(degree),
      cpcs, gpcs,
    });
  }
  return out;
}

// Re-derive the SOUNDING seconds of timeline events that carry `push` (beats of
// anticipation): the pushed chord starts early — clamped so it never reaches
// back past chart time 0 (the count-in boundary; makeBundle's lead-in shift
// happens later) — and the PREVIOUS event stops sounding where the anticipated
// chord arrives (anticipation replaces the old chord's tail; that's the device).
// Slot fields (startBeat/durBeats) are untouched. Mutates + returns events.
/** @template {import('./generation-types.js').TimelineEvent} T @param {T[]} events @param {import('./generation-types.js').GenerationConfig} cfg @param {number} duration */
export function applyTimelinePush(events, cfg, duration) {
  const beatSec = measureSeconds(cfg) / Math.max(1, cfg.meter.numerator);
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const push = Number(ev.push) || 0;
    if (push <= 0) continue;
    const slotStart = ev.startBeat * beatSec;
    const sounded = Math.max(0, Math.min(slotStart, slotStart - push * beatSec));
    ev.startSec = Number(sounded.toFixed(6));
    if (i > 0 && events[i - 1].endSec > ev.startSec) events[i - 1].endSec = ev.startSec;
    if (ev.endSec > duration) ev.endSec = Number(duration.toFixed(6));
  }
  return events;
}

// Append a compiled timeline into an assembling multi-part chart (key-cycle
// rung / bpm-ladder rung / session block), offsetting seconds by tSec and the
// slot fields by beatOff/barOff — the 2026-06-02 desync rule applied to the
// timeline: every timed array is assembled in the per-part loop, in the
// part's OWN config, so the seam proof metric and the Jam loop never judge a
// later part against the first part's harmony.
/** @param {import('./generation-types.js').TimelineEvent[]} target @param {import('./generation-types.js').TimelineEvent[]} events @param {number} tSec @param {number} beatOff @param {number} barOff */
export function appendTimelineOffset(target, events, tSec, beatOff, barOff) {
  for (const ev of events) target.push(Object.assign({}, ev, {
    bar: ev.bar + barOff,
    startBeat: Number((ev.startBeat + beatOff).toFixed(6)),
    startSec: Number((ev.startSec + tSec).toFixed(6)),
    endSec: Number((ev.endSec + tSec).toFixed(6)),
  }));
}
