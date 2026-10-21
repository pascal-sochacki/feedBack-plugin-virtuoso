// SPDX-License-Identifier: AGPL-3.0-only
import { openMidisForConfig } from '../instrument-tuning.js';
import { secondsPerDivision, measureSeconds, wholeCycleStepCount, rhythmSteps, RHYTHM_CELLS } from '../timing.js';
import { CHROMATIC_PATTERNS } from './chromatic.js';
import { noteDefaults } from '../notes.js';
import { scalePositionsForSystem } from '../positions.js';
import { fillNotesFromSeq, orientSeq } from '../sequence.js';
import { applyStrokePolicy } from '../stroke-policy.js';
import { NOTE_ALIASES } from '../pitch.js';

/** @typedef {import('../positions.js').PositionConfig & import('../stroke-policy.js').StrokeConfig & {bars: number, meter: import('../timing.js').Meter, chromaticPattern: string, spiderPair?: string, bendTarget?: string, direction?: string, hertaWalk?: boolean, hertaAccent?: number, pulseAccent: number, pulseOffbeat?: boolean}} TechniqueConfig */

// ── Fingerstyle generators (the Acoustic & Fingerstyle pack, 2026-06-12) ──

// The two-string crossing "spider" (community-contributed warmup, beta thread
// 2026-06-12). A chromatic 4-finger frame where EVERY pluck changes string:
// the pattern alternates treble/bass within a string pair, and each
// repetition MIRRORS which string leads — so the right hand never rests and
// the left hand holds the frame across the gap. Let everything ring (the
// fingerstyle point, per the source thread); RH marks = thumb (p) on the
// bass-side string, the treble side takes its classical home finger (i/m/a
// by string). The frame walks up the neck one fret per cell and back down
// (the "4 reps then move a fret" loop, with reps left to the A-B loop).
// spiderPair widens the pair: adjacent (D+G) → skip (A+B) → wide (E+e) —
// the three difficulty grades from the source thread, stretch + skip width.
/** @param {TechniqueConfig} cfg */
export function buildSpiderExercise(cfg) {
  const opens = openMidisForConfig(cfg);
  const count = opens.length;
  const step = secondsPerDivision(cfg);
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const offsets = CHROMATIC_PATTERNS[cfg.chromaticPattern] || CHROMATIC_PATTERNS['1342'];
  const spread = cfg.spiderPair === 'wide' ? 2 : cfg.spiderPair === 'skip' ? 1 : 0;
  const mid = Math.floor(count / 2);                       // 6-string: lo=2 (D), hi=3 (G)
  const lo = Math.max(0, mid - 1 - spread), hi = Math.min(count - 1, mid + spread);
  if (lo === hi) throw new Error('Spider needs two distinct strings — widen the setup.');
  // Treble-side home finger: top string → a, next → m, then i (E/B/G on guitar).
  const trebleRh = hi >= count - 1 ? 3 : hi === count - 2 ? 2 : 1;
  // Frame walk: fretMin is the starting frame (the thread starts at 5 — fret 1
  // is harder on the hand), climbing while the 4-fret span stays ≤ fretMax,
  // then back down — an up_down cycle with no doubled turnaround.
  const frameLo = Math.max(1, cfg.fretMin || 5);
  const frameHi = Math.max(frameLo, Math.min((cfg.fretMax || 12) - 3, 12));
  const frames = [];
  for (let f = frameLo; f <= frameHi; f++) frames.push(f);
  for (let f = frameHi - 1; f > frameLo; f--) frames.push(f);
  const notes = [];
  const sections = [{ name: `Spider — strings ${count - lo} & ${count - hi}`, number: 1, time: 0 }];
  const cellLen = offsets.length * 2;                      // hi-lead pass + the lo-lead mirror
  const fullCycleSteps = Math.max(1, frames.length * cellLen);
  const totalSteps = wholeCycleStepCount(totalTime, step, fullCycleSteps);
  let t = 0;
  for (let k = 0; k < totalSteps; k++) {
    const cell = Math.floor(k / cellLen), inCell = k % cellLen;
    const F = frames[cell % frames.length];
    const mirrored = inCell >= offsets.length;
    const off = offsets[inCell % offsets.length];
    const onHi = (inCell % 2 === 0) !== mirrored;          // who leads flips each half-cell
    /** @type {import('../notes.js').Note} */
    const nf = { t: Number(t.toFixed(6)), s: onHi ? hi : lo, f: F + off,
                 sus: Number(Math.min(step * 1.9, 2.4).toFixed(6)),   // let it ring
                 rh: onHi ? trebleRh : 0 };
    if (off >= 0 && off <= 3) nf.fg = off + 1;             // one finger per frame fret
    notes.push(noteDefaults(nf));
    t += step;
  }
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration: Math.max(totalTime, Number(t.toFixed(6))) };
}

// Bending drill — cycles scale tones on the highest (thinnest) strings, each
// note bent from a fret below the target pitch.
// bn=0.5 (half step) bends 1 semitone; bn=1 (whole step) bends 2 semitones.
//
// Virtuoso convention: s=0 is the LOWEST (thickest) string. Bends are
// idiomatic on the thinnest strings, so the practical bending range is the
// TOP three string indices (e.g. on a 6-string: s=3=G, s=4=B, s=5=high e).
// Bass strings are far too stiff to bend cleanly, so we never target s=0..2
// on guitar, and we exclude bass instruments from this drill entirely.
/** @param {TechniqueConfig} cfg */
export function buildBendingExercise(cfg) {
  const bendTarget = cfg.bendTarget || 'whole';
  const step = secondsPerDivision(cfg);
  const mLen  = measureSeconds(cfg);
  const totalTime = cfg.bars * mLen;
  if (cfg.instrument === 'bass') throw new Error('Bending drills are a guitar technique — pick a guitar string setup.');
  const allPos = scalePositionsForSystem(cfg);
  // Top three strings (highest indices). On a 6-string that's G, B, high e.
  const topStart = Math.max(0, cfg.stringCount - 3);
  const BEND_STRINGS = new Set();
  for (let s = topStart; s < cfg.stringCount; s++) BEND_STRINGS.add(s);
  let mixToggle = false;
  const events = [];
  for (const pos of allPos) {
    if (!BEND_STRINGS.has(pos.s)) continue;
    let bn;
    if (bendTarget === 'half')       bn = 0.5;
    else if (bendTarget === 'whole') bn = 1;
    else { bn = mixToggle ? 0.5 : 1; mixToggle = !mixToggle; }
    const semitones = bn < 1 ? 1 : 2;    // frets below the target pitch
    const preFret = pos.f - semitones;
    // Need a fretted note to bend: fret >= 1. preFret 0 would be an open
    // string, which has no fret behind it to push — physically impossible.
    if (preFret < 1) continue;
    events.push({ s: pos.s, f: preFret, bn });
  }
  if (!events.length) throw new Error('No bendable notes in this position. Try a higher fret range or CAGED shape.');
  let seq;
  if (cfg.direction === 'descending')    seq = events.slice().reverse();
  else if (cfg.direction === 'up_down')  seq = [...events, ...events.slice().reverse()];
  else                                   seq = events;
  const sus = Math.max(0.2, step * 0.92);
  const bendName = bendTarget === 'half' ? 'Half-step bends' : bendTarget === 'whole' ? 'Whole-step bends' : 'Mixed bends';
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `${bendName} — ${cfg.key} ${cfg.scale}` });
}

// ── 20 additional generators ────────────────────────────────────────────────

/** @param {TechniqueConfig} cfg */
export function buildLegatoExercise(cfg) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const allPos = scalePositionsForSystem(cfg);
  if (!allPos.length) throw new Error('No notes in range.');
  /** @type {Record<number, import('../positions.js').Position[]>} */
  const byStr = {};
  for (const p of allPos) (byStr[p.s] || (byStr[p.s] = [])).push(p);
  // Virtuoso convention: s=0 is the LOWEST string (low E). An ascending legato
  // run climbs low E → high e (s=0 → s=last), low fret → high fret per string,
  // hammering on after the first note on each string.
  const strAsc = Object.keys(byStr).map(Number).sort((a, b) => a - b);
  /** @type {(Partial<import('../notes.js').Note> & {s: number, f: number})[]} */
  const asc = [];
  /** @type {(Partial<import('../notes.js').Note> & {s: number, f: number})[]} */
  const desc = [];
  // carry n.fg — the fretting-hand finger (the bass 1-2-4 box puts the hammered
  // note on the pinky); SEQ_NOTE_FIELDS now lists 'fg' so it survives to the chart.
  for (const s of strAsc) {
    byStr[s].sort((a, b) => a.f - b.f).forEach((n, i) => asc.push({ s: n.s, f: n.f, fg: n.fg, ho: i > 0, po: false }));
  }
  for (const s of strAsc.slice().reverse()) {
    byStr[s].sort((a, b) => b.f - a.f).forEach((n, i) => desc.push({ s: n.s, f: n.f, fg: n.fg, ho: false, po: i > 0 }));
  }
  const seq = cfg.direction === 'ascending' ? asc : cfg.direction === 'descending' ? desc : [...asc, ...desc];
  const sus = Math.max(0.05, step * 0.9);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Legato runs — ${cfg.key} ${cfg.scale}` });
}

/** @param {TechniqueConfig} cfg */
export function buildVibratoExercise(cfg) {
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const allPos = scalePositionsForSystem(cfg);
  if (!allPos.length) throw new Error('No notes in range.');
  const sorted = allPos.slice().sort((a, b) => a.midi - b.midi);
  const seq = orientSeq(sorted.map(p => ({ s: p.s, f: p.f, vb: true })), cfg.direction);
  const noteStep = mLen / 2, sus = Math.max(0.4, noteStep - 0.08);
  return fillNotesFromSeq(seq, { step: noteStep, totalTime, sus, loopCycleSteps: seq.length, name: `Vibrato — ${cfg.key} ${cfg.scale}` });
}

/** @param {TechniqueConfig} cfg */
export function buildCallResponseExercise(cfg) {
  const step = secondsPerDivision(cfg), mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  // Honour RHYTHM_CELLS so a gallop/reverse-gallop call actually models the cell
  // the player is told to echo (was a silent no-op — the djent capstone review,
  // 2026-06-05). Cells sum to whole beats (startup guard), so cycling them
  // continuously through the silent response bars keeps every call bar starting
  // on the cell's first onset; null for simple subdivisions = unchanged timing.
  const steps = rhythmSteps(cfg);
  const allPos = scalePositionsForSystem(cfg);
  if (!allPos.length) throw new Error('No notes in range.');
  const sorted = allPos.slice().sort((a, b) => a.midi - b.midi);
  const seq = cfg.direction === 'descending' ? sorted.slice().reverse()
    : cfg.direction === 'up_down' ? [...sorted, ...sorted.slice().reverse()] : sorted;
  const CALL = 2, CYCLE = 4; // 2 bars call, 2 bars silence
  const sus = Math.max(0.05, step * 0.85);
  const notes = [], sections = [{ name: 'Call', number: 1, time: 0 }, { name: 'Response', number: 2, time: CALL * mLen }];
  let t = 0, noteIdx = 0, stepIdx = 0;
  while (t < totalTime - 0.001) {
    // +1e-9: accumulated float t can land one ulp under k·mLen, leaking one
    // extra note ON the response-bar downbeat — smearing the exact call/space
    // boundary this drill teaches (rhythm-meter review; also fixes the shipped
    // blues_call_response / rhy_trade_bars 33rd-note leak).
    if (Math.floor(t / mLen + 1e-9) % CYCLE < CALL) {
      notes.push(noteDefaults({ t: Number(t.toFixed(6)), s: seq[noteIdx % seq.length].s, f: seq[noteIdx % seq.length].f, sus }));
      noteIdx++;
    }
    t += (steps && steps.length) ? steps[stepIdx % steps.length] : step; stepIdx++;
  }
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration: Math.max(t, totalTime) };
}

/** @param {TechniqueConfig} cfg */
export function buildTremoloPickingExercise(cfg) {
  const step = secondsPerDivision(cfg), mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const sorted = scalePositionsForSystem(cfg).slice().sort((a, b) => a.midi - b.midi);
  if (!sorted.length) throw new Error('No notes in range.');
  const sus = Math.max(0.03, step * 0.9);
  const notes = [], sections = [{ name: `Tremolo picking — ${cfg.key} ${cfg.scale}`, number: 1, time: 0 }];
  let t = 0, posIdx = 0;
  while (t < totalTime - 0.001) {
    const barEnd = Math.min((Math.floor(t / mLen) + 1) * mLen, totalTime);
    const pos = sorted[posIdx % sorted.length];
    for (let mt = t; mt < barEnd - 0.001; mt += step)
      notes.push(noteDefaults({ t: Number(mt.toFixed(6)), s: pos.s, f: pos.f, sus, tr: true }));
    t = barEnd; posIdx++;
  }
  applyStrokePolicy(notes, cfg, 'alternate');   // tremolo: strict alternate, never re-anchored mid-span (continuous notes can't trip the rest rule)
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration: Math.max(t, totalTime) };
}

// ── Herta — the rolling 4-note burst (Tier-3; Christian's dogfood drill) ──────
// THE GUITAR ADAPTATION (guitar-pedagogy panel): a single-string trill burst —
// pick → hammer-on → pull-off → pick across four even sixteenths, default accent
// on note 1 (the picked attack lands on the beat). The continuous repeat IS the
// practice form (the rudiment-isolation ladder). Static-pitch first (one anchor
// position); `hertaWalk` walks the base note through the scale ("then add pitch").
// `hertaAccent` (0–3) moves the accent for the accent-control ladder (L&D).
//
// This is NOT the authentic drum rudiment (R R L R, crushed double, accent on the
// LAST note — drum-pedagogy) — that's a SEPARATE drum node (Tier-3 follow-on).
// This borrows the rhythmic SHAPE onto the fretting+picking hands, honestly
// labelled as a herta-STYLE burst, not "the rudiment". Whole-step trill (+2) is
// the canonical, always-playable guitar herta; pitch is secondary to the motor.
/** @param {TechniqueConfig} cfg */
export function buildHertaExercise(cfg) {
  const q = 60 / cfg.bpm, step = q / 4;                 // a herta is inherently sixteenths
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const TRILL = 2;                                       // whole-step trill partner
  const positions = scalePositionsForSystem(cfg).slice().sort((a, b) => a.midi - b.midi);
  if (!positions.length) throw new Error('No notes in range for the herta burst.');
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  const rootPos = positions.find(p => ((p.midi % 12) + 12) % 12 === keyPc);
  const walk = !!cfg.hertaWalk;
  const accentAt = Math.max(0, Math.min(3, cfg.hertaAccent != null ? (cfg.hertaAccent | 0) : 0));
  const baseSeq = walk ? positions : [rootPos || positions[0]];   // static: one anchor note
  /** @param {import('../positions.js').Position} b */
  const cellFor = (b) => ([
    { s: b.s, f: b.f },                       // 0: pick (the down-attack)
    { s: b.s, f: b.f + TRILL, ho: true },     // 1: hammer-on (trill up)
    { s: b.s, f: b.f, po: true },             // 2: pull-off (trill back)
    { s: b.s, f: b.f },                       // 3: pick (parks for the next burst)
  ]);
  const sus = Math.max(0.03, step * 0.9);
  const notes = [], sections = [{ name: `Herta burst — ${cfg.key} ${cfg.scale}`, number: 1, time: 0 }];
  let t = 0, cellIdx = 0;
  while (t < totalTime - 0.001) {
    const cell = cellFor(baseSeq[cellIdx % baseSeq.length]);
    for (let k = 0; k < 4 && t < totalTime - 0.001; k++) {
      const n = cell[k];
      notes.push(noteDefaults({ t: Number(t.toFixed(6)), s: n.s, f: n.f, sus, ho: !!n.ho, po: !!n.po, ac: k === accentAt }));
      t += step;
    }
    cellIdx++;
  }
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration: Math.max(t, totalTime) };
}

// ── Single-string rhythm pulse — the keystone of the Rhythm ladder ───────────
// (Rhythm-ladder panel, 2026-06-04; spec docs/plugin/design/rhythm-ladder-roundtable.md.) ONE
// palm-muted note on the LOWEST string, struck in the configured rhythm cell over a
// steady click, so the drill is PURE TIME — no fretting-hand variable, no pitch
// reading: the picking hand IS the metronome (guitar-pedagogy's keystone framing).
// `pulseAccent` (0–3) moves the accent within each beat for the Accent-Displacement
// rung (same notes, the accent moves — drum-pedagogy's highest-transfer concept). A
// world-rhythm cell (subdivision:'tresillo'/'son_clave'/…) rides the same one-note
// vehicle = "tap the clave's TIME" (a single line teaches the time of a feel, never
// the ensemble interlock). Instrument-agnostic — on bass this is the root pulse
// (offerable() leaves it native for both; the bass face is the low-string root).
/** @param {TechniqueConfig} cfg */
export function buildRhythmPulseExercise(cfg) {
  const step = secondsPerDivision(cfg), steps = rhythmSteps(cfg);
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const beat = 60 / cfg.bpm;
  // The anchor: the key's root on the LOWEST string (s=0), low in the neck — the
  // percussive, palm-muteable pulse the panel specified.
  const opens = openMidisForConfig(cfg);
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  const rootFret = (((keyPc - (opens[0] % 12)) % 12) + 12) % 12;   // 0–11 on the low string
  const accentAt = Math.max(0, Math.min(3, (cfg.pulseAccent | 0) || 0));
  // Reggae skank: shift the whole pulse a half-beat onto the upbeats (the "&"), with
  // a clipped staccato — "play only the &, trust the empty 1". With subdivision
  // 'quarter' the onsets land on the & of every beat (the one-drop skank chop).
  const offbeat = !!cfg.pulseOffbeat;
  const stepsLen = (steps && steps.length) ? steps.length : 0;
  const subsPerBeat = Math.max(1, Math.round(beat / (step || beat)));
  const sus = Math.max(0.03, (stepsLen ? Math.min.apply(null, /** @type {number[]} */ (steps)) : step) * (offbeat ? 0.5 : 0.9));
  const cellLabel = (RHYTHM_CELLS[cfg.subdivision] && RHYTHM_CELLS[cfg.subdivision].label) || cfg.subdivision;
  const notes = [], sections = [{ name: `Single-string pulse — ${cfg.key} (${offbeat ? 'skank, ' : ''}${cellLabel})`, number: 1, time: 0 }];
  let t = offbeat ? beat / 2 : 0, idx = 0;
  while (t < totalTime - 0.001) {
    // Cells accent their downbeat (first onset of each repetition) — or every
    // accentEvery-th onset when the cell declares one (the herta chug's
    // 3-over-2 lean: the accent rides each ¾-beat cell inside the 3-beat
    // cycle encoding). Even subdivisions accent the accentAt-th note of each
    // beat (Accent Displacement).
    const cellAccentEvery = RHYTHM_CELLS[cfg.subdivision] && RHYTHM_CELLS[cfg.subdivision].accentEvery;
    const isAccent = stepsLen ? (idx % (cellAccentEvery || stepsLen) === 0)
                              : ((idx % subsPerBeat) === (accentAt % subsPerBeat));
    notes.push(noteDefaults({ t: Number(t.toFixed(6)), s: 0, f: rootFret, sus, pm: true, ac: isAccent }));
    t += stepsLen ? /** @type {number[]} */ (steps)[idx % stepsLen] : step; idx++;
  }
  // No fallback: pulse rungs mark strokes only when the rung declares a school
  // (djent_chug_lock declares 'metal' — all-down chugs that flip to alternate
  // past the downpick ceiling, the wall its goal-card teaches).
  applyStrokePolicy(notes, cfg);
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration: Math.max(t, totalTime) };
}

/** @param {TechniqueConfig} cfg */
export function buildPedalPointExercise(cfg) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const allPos = scalePositionsForSystem(cfg);
  if (!allPos.length) throw new Error('No notes in range.');
  const sorted = allPos.slice().sort((a, b) => a.midi - b.midi);
  const pedal = sorted[0];
  const melody = sorted.filter(p => p.midi > pedal.midi);
  if (!melody.length) throw new Error('Wider pitch range needed for pedal point.');
  const melSeq = cfg.direction === 'descending' ? melody.slice().reverse()
    : cfg.direction === 'up_down' ? [...melody, ...melody.slice().reverse()] : melody;
  const events = [];
  for (const m of melSeq) { events.push(pedal); events.push(m); }
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(events, { step, totalTime, sus, loopCycleSteps: events.length, name: `Pedal point — ${cfg.key} ${cfg.scale}` });
}
