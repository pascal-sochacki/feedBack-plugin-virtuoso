// SPDX-License-Identifier: AGPL-3.0-only
import { openMidisForConfig, isBassCfg } from '../instrument-tuning.js';
import { measureSeconds, secondsPerDivision } from '../timing.js';
import { progressionDegreesForConfig, chordRootForDegree, chordQualityForDegree } from '../harmony.js';
import { nearestPositionForPc } from '../positions.js';
import { noteDefaults } from '../notes.js';
import { CHORD_FORMULAS } from '../chord-theory.js';
import { applyStrokePolicy } from '../stroke-policy.js';

// ── Bass groove primitives (Phase 4 — bass-pedagogy pre-build spec) ─────────
// Bass is GROOVE + RIGHT-HAND first (inverts the guitar instinct). These are
// fixed-interval grips on the all-4ths neck, NOT scale-window scans: from a root
// (s,f) the 5th is (s+1,+P5) and the octave (s+2,+8ve). Computed BY PITCH (not a
// hardcoded +2 frets) so they stay correct under drop/alt tunings — and on a
// guitar's all-4ths low strings too (so the builders never crash, even though the
// UI offers them only on bass via offerable()). Slap/pop/ghost use the existing
// schema (no new field): thumb-slap = low-string note + ac; pop = high-string note
// + ac; ghost/dead = mt. Per-lane spec: agent-memory/bass-pedagogy-expert/
// project_bass_groove_primitives_spec. Funk/soul-idiom validate the FEEL at the
// template stage (Phase 6). Tagged bass-native in PRACTICE_APPLICABILITY.

// Root grip low enough that the up-octave fits on a fretted string (root on
// s ≤ count-3), nearest the previous pitch. Returns { root, fifth, octave }
// as {s,f,midi}, or null. The 5th/octave are found BY PITCH on the next strings.
/** @param {import('../generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {number} prevMidi */
export function bassRootGrip(cfg, rootPc, prevMidi) {
  const opens = openMidisForConfig(cfg);
  const count = opens.length;
  const fMin = cfg.fretMin || 0, fMax = Math.min(cfg.fretMax || 12, 15);
  let root = null, bestDist = Infinity;
  for (let s = 0; s <= count - 3; s++) {
    for (let f = fMin; f <= fMax; f++) {
      if (((opens[s] + f) % 12) !== rootPc) continue;
      const midi = opens[s] + f, d = Math.abs(midi - prevMidi);
      if (d < bestDist) { root = { s, f, midi }; bestDist = d; }
    }
  }
  if (!root) return null;
  /** @param {number} s @param {number} targetMidi */
  const onString = (s, targetMidi) => {
    const openPc = ((opens[s] % 12) + 12) % 12, pc = ((targetMidi % 12) + 12) % 12;
    let f = (((pc - openPc) % 12) + 12) % 12;
    while (opens[s] + f < targetMidi - 6 && f + 12 <= 17) f += 12;
    return { s, f, midi: opens[s] + f };
  };
  // lowFifth — the P5 BELOW the root on the string below (the "why own a
  // 5-string" reach; bass-pedagogy spec 2026-07-12). Guards: root.s>=1 (a
  // string exists below) AND root.f>=2 (at f0/f1 the pc-math octave-push
  // wraps the note UP a 4th — the opposite of the intent), plus an exact
  // pitch check (never trust pc arithmetic alone on a custom tuning). Null
  // when unavailable — consumers degrade to the upper fifth.
  let lowFifth = null;
  if (root.s >= 1 && root.f >= 2) {
    const cand = onString(root.s - 1, root.midi - 7);
    if (cand.midi === root.midi - 7 && cand.f >= 0) lowFifth = cand;
  }
  return { root, fifth: onString(root.s + 1, root.midi + 7), octave: onString(root.s + 2, root.midi + 12), lowFifth };
}

// Walking-bass approach landing for the bar's LAST beat (Bass Lines & Changes).
// Returns the MIDI to land on just before the next chord, or null for 'scale' (the
// plain scale-walk). Mirrors the backing walker bassWalkEvents' approach set:
//   chromatic — a ½-step into the next root, from the side the line is on
//   dominant  — the 5th of the NEXT chord (the V→I bass move; resolves down a 5th)
//   mixed     — alternates chromatic/dominant per change for a varied line
// fromMidi = the bar's starting root; targetMidi = the next root's nearest octave.
/** @param {string | undefined} mode @param {number} bar @param {number} targetMidi @param {number} nextRootPc @param {number} fromMidi */
export function walkApproachMidi(mode, bar, targetMidi, nextRootPc, fromMidi) {
  let m = mode;
  if (m === 'mixed') m = (bar % 2 === 0) ? 'chromatic' : 'dominant';
  if (m === 'dominant') {
    const domPc = (((nextRootPc + 7) % 12) + 12) % 12;            // the 5th of the next chord
    const n = fromMidi - ((((fromMidi - domPc) % 12) + 12) % 12); // greatest ≤ fromMidi with that pc
    return Math.abs(n - fromMidi) <= Math.abs(n + 12 - fromMidi) ? n : n + 12;
  }
  return targetMidi + (fromMidi >= targetMidi ? 1 : -1);          // chromatic ½-step into the next root
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildWalkingBassExercise(cfg) {
  const opens = openMidisForConfig(cfg);
  const mLen = measureSeconds(cfg), beatStep = 60 / cfg.bpm;
  const totalTime = cfg.bars * mLen;
  const degrees = progressionDegreesForConfig(cfg);
  const fMin = cfg.fretMin || 0, fMax = cfg.fretMax || 12;
  const notes = [], sections = [{ name: `Walking bass — ${cfg.key} ${cfg.scale}`, number: 1, time: 0 }];
  let prevMidi = 40, t = 0, prevDeg = null;
  for (let bar = 0; bar < cfg.bars; bar++) {
    const deg = degrees[bar % degrees.length];
    const nextDeg = degrees[(bar + 1) % degrees.length];
    const rootPc = chordRootForDegree(cfg, deg);
    const nextRootPc = chordRootForDegree(cfg, nextDeg);
    const rootPos = nearestPositionForPc(rootPc, prevMidi, opens, fMin, fMax);
    if (!rootPos) { t += mLen; continue; }
    const beatsPerBar = cfg.meter.numerator;
    // Accent the downbeat ONLY when the chord changes (jazz-idiom ruling): the
    // accent then MEANS "new chord here" — a hammer on every bar is oom-pah, not
    // walking. Two-feel = root & 5th as half notes on 1 & 3 (the "in 2" on-ramp).
    const chordChanged = deg !== prevDeg;
    const feel = cfg.walkFeel || 'four';
    const rootsOnly = feel === 'roots';   // root on the ONE only — the harmony-literacy bridge
    const twoFeel = feel === 'two' && beatsPerBar >= 4;
    const rootSus = rootsOnly ? beatStep * beatsPerBar * 0.92 : twoFeel ? beatStep * (beatsPerBar / 2) * 0.92 : beatStep * 0.9;
    notes.push(noteDefaults({ t: Number(t.toFixed(6)), s: rootPos.s, f: rootPos.f, sus: rootSus, ac: chordChanged }));
    // barRootMidi anchors the straight-line walk toward the next root. We
    // interpolate from this FIXED point (not the moving prevMidi) so the line
    // actually travels across the bar instead of stalling on one pitch.
    const barRootMidi = opens[rootPos.s] + rootPos.f;
    prevMidi = barRootMidi; prevDeg = deg;
    // Target octave of next root nearest to the bar's starting root.
    let targetMidi = nextRootPc;
    while (targetMidi < barRootMidi - 6) targetMidi += 12;
    while (targetMidi > barRootMidi + 17) targetMidi -= 12;
    if (rootsOnly) { t += mLen; continue; }   // just the root, held the whole bar (follow the changes)
    if (twoFeel) {
      // The 5th on beat 3 (half the bar in), held — the classic "in 2" foundation.
      const fifthPc = (rootPc + 7) % 12, half = Math.floor(beatsPerBar / 2);
      const pos = nearestPositionForPc(fifthPc, barRootMidi, opens, fMin, fMax);
      if (pos) { notes.push(noteDefaults({ t: Number((t + half * beatStep).toFixed(6)), s: pos.s, f: pos.f, sus: rootSus })); prevMidi = opens[pos.s] + pos.f; }
      t += mLen;
      continue;
    }
    // Walking quarters: a CHORD-TONE-FIRST walk pool (chord tones + the passing
    // 2nd + the 6th over maj/dom/dorian) — a real line, not a scale run
    // (harmony-theory ruling; mirrors the backing walker bassWalkEvents).
    const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth, deg, cfg.chordOverride, cfg.progression);
    const chordIvs = (CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj).intervals.map(i => (((i % 12) + 12) % 12));
    const poolPcs = new Set(chordIvs.map(iv => (rootPc + iv) % 12));
    poolPcs.add((rootPc + 2) % 12);   // the passing 2nd (R-2-3 stepwise lines)
    if ((chordIvs.includes(4) || chordIvs.includes(10)) && !chordIvs.includes(6)) poolPcs.add((rootPc + 9) % 12);   // 6th over maj/dom, never over ♭5
    /** @param {number} approxMidi */
    const poolNear = (approxMidi) => {
      const cands = [];
      for (const pc of poolPcs) { const oct = Math.round((approxMidi - pc) / 12); for (const o of [oct - 1, oct, oct + 1]) cands.push(pc + o * 12); }
      return [...new Set(cands)].sort((a, b) => Math.abs(a - approxMidi) - Math.abs(b - approxMidi));
    };
    // Approach into the next chord on the LAST beat (Lines & Changes). null = the
    // plain pool-walk (early rungs); a value = land a chromatic/dominant approach
    // on beat (beatsPerBar-1) so the next downbeat RESOLVES into it, and the
    // off-beats before it walk toward THAT landing (not the bare next root).
    const approachMode = cfg.walkApproach || 'scale';
    const apprMidi = (approachMode !== 'scale' && beatsPerBar >= 2)
      ? walkApproachMidi(approachMode, bar, targetMidi, nextRootPc, barRootMidi) : null;
    const aim = apprMidi != null ? apprMidi : targetMidi;
    const lastBeat = beatsPerBar - 1, nextRootPcN = ((nextRootPc % 12) + 12) % 12;
    for (let b = 1; b < beatsPerBar; b++) {
      if (apprMidi != null && b === lastBeat) {
        // The deliberate approach note — exact pitch, nearest playable position.
        const apprPc = (((apprMidi % 12) + 12) % 12);
        const pos = nearestPositionForPc(apprPc, apprMidi, opens, fMin, fMax);
        if (pos) {
          notes.push(noteDefaults({ t: Number((t + b * beatStep).toFixed(6)), s: pos.s, f: pos.f, sus: beatStep * 0.9 }));
          prevMidi = opens[pos.s] + pos.f;
        }
        continue;
      }
      const denom = apprMidi != null ? lastBeat : beatsPerBar;   // land ON the approach at lastBeat
      const frac = b / denom;
      const approxMidi = Math.round(barRootMidi + (aim - barRootMidi) * frac);
      // Nearest pool tone to the line: no immediate repeat; cap leaps at ~a 5th
      // (≤9 semis, prefer stepwise) so it reads as a line; the final scale-mode
      // beat avoids the next downbeat's pitch-class (the cardinal cross-barline
      // repeat); the beat before an approach never pre-plays the approach pitch.
      // `fallback` (first playable non-repeat) guarantees a note even if the
      // preference filters reject everything.
      let chosen = null, fallback = null;
      for (const cand of poolNear(approxMidi)) {
        if (cand === prevMidi) continue;
        const candPc = (((cand % 12) + 12) % 12);
        const pos = nearestPositionForPc(candPc, cand, opens, fMin, fMax);
        if (!pos) continue;
        if (!fallback) fallback = pos;
        if (Math.abs(cand - prevMidi) > 9) continue;
        if (apprMidi == null && b === lastBeat && candPc === nextRootPcN) continue;
        if (apprMidi != null && b === lastBeat - 1 && cand === apprMidi) continue;
        if (opens[pos.s] + pos.f === cand) { chosen = pos; break; }
      }
      const place = chosen || fallback;
      if (place) {
        notes.push(noteDefaults({ t: Number((t + b * beatStep).toFixed(6)), s: place.s, f: place.f, sus: beatStep * 0.9 }));
        prevMidi = opens[place.s] + place.f;
      }
    }
    t += mLen;
  }
  if (!notes.length) throw new Error('No walking bass notes generated.');
  applyStrokePolicy(notes, cfg, 'bass_parity');   // bass: strict i-m parity (quarters never rake)
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration: Math.max(t, totalTime) };
}

// right_hand_technique — pitch-INVISIBLE plucking-hand stamina (alternating i-m /
// raking / 3-finger). A steady re-articulated root pulse at the subdivision; the
// hand pattern IS the drill, named in the goal-card.
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildRightHandTechniqueExercise(cfg) {
  const step = secondsPerDivision(cfg), mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const degrees = progressionDegreesForConfig(cfg);
  const notes = [], sections = [{ name:`Right-hand technique — ${cfg.key}`, number:1, time:0 }];
  const sus = Math.max(0.05, step * 0.5);
  // rhTechMode (Bass Groove & Right-Hand ladder) selects the per-step position
  // sequence over the all-4ths grip (root s, fifth s+1, octave s+2 — adjacent
  // ascending strings):
  //   pulse        — re-articulated root on one string (the i-m motor; default)
  //   crossing     — alternate root↔fifth across two adjacent strings
  //   rake         — descending octave→fifth→root dragged with ONE plucking
  //                  finger across the adjacent strings (the upright-derived rake)
  //   three_finger — root pulse with the pluck rotating index→middle→ring
  const mode = cfg.rhTechMode || 'pulse';
  const bassRh = isBassCfg(cfg);
  let prevMidi = 33, t = 0, bar = 0;
  while (t < totalTime - 0.001) {
    const grip = bassRootGrip(cfg, chordRootForDegree(cfg, degrees[bar % degrees.length]), prevMidi);
    const barEnd = Math.min(totalTime, t + mLen);
    if (grip) {
      const seq = mode === 'crossing' ? [grip.root, grip.fifth]
        : mode === 'rake' ? [grip.octave, grip.fifth, grip.root]
        : [grip.root];
      let i = 0;
      for (let tt = t; tt < barEnd - 0.001; tt += step, i++) {
        const p = seq[i % seq.length];
        /** @type {import('../notes.js').Note} */
        const nf = { t:Number(tt.toFixed(6)), s:p.s, f:p.f, sus };
        if (bassRh) {
          if (mode === 'rake') nf.rh = 1;                       // one finger dragged through the rake
          else if (mode === 'three_finger') nf.rh = [1, 2, 3][i % 3];
        }
        notes.push(noteDefaults(nf));
      }
      prevMidi = grip.root.midi;
    }
    t = barEnd; bar++;
  }
  if (!notes.length) throw new Error('No right-hand technique notes generated.');
  // pulse/crossing keep the i-m parity drill (the alternation IS the lesson);
  // rake (single dragged finger) and three_finger (explicit rotation) set their
  // own rh above, so the parity pass would wrongly overwrite them.
  if (mode === 'pulse' || mode === 'crossing') applyStrokePolicy(notes, cfg, 'bass_parity');
  return { notes, chords:[], chordTemplates:[], handShapes:[], sections, duration:totalTime };
}

// root_fifth_octave — the foundational bass box (taught BEFORE scales). R-5-8-5
// per bar, anchored on each chord's root.
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildRootFifthOctaveExercise(cfg) {
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const beatsPerBar = Math.max(1, cfg.meter.numerator), beatSec = mLen / beatsPerBar;
  const degrees = progressionDegreesForConfig(cfg);
  const notes = [], sections = [{ name:`Root–5th–octave — ${cfg.key}`, number:1, time:0 }];
  const sus = Math.max(0.08, beatSec * 0.9);
  let prevMidi = 33, t = 0, bar = 0;
  while (t < totalTime - 0.001) {
    const grip = bassRootGrip(cfg, chordRootForDegree(cfg, degrees[bar % degrees.length]), prevMidi);
    if (grip) {
      // Default R-5-8-5 — the canonical pre-scales box, deliberately untouched.
      // rfoPattern 'low5' (opt-in, bass-pedagogy spec 2026-07-12) = R–low5–5–8:
      // root on the downbeat, then the fifth BELOW on the string below (the
      // 5-string reach), traversing both fifths + the octave. When the low
      // fifth is unreachable (root on the lowest string / low fret) the grip
      // degrades to the upper fifth — the pattern stays playable everywhere.
      const seq = (cfg.rfoPattern === 'low5')
        ? [grip.root, grip.lowFifth || grip.fifth, grip.fifth, grip.octave]
        : [grip.root, grip.fifth, grip.octave, grip.fifth];   // R-5-8-5
      for (let b = 0; b < beatsPerBar; b++) {
        const p = seq[b % seq.length], nt = t + b * beatSec;
        if (nt < totalTime) notes.push(noteDefaults({ t:Number(nt.toFixed(6)), s:p.s, f:p.f, sus, ac:(b === 0) }));
      }
      prevMidi = grip.root.midi;
    }
    t += mLen; bar++;
  }
  if (!notes.length) throw new Error('No root-fifth-octave notes generated.');
  applyStrokePolicy(notes, cfg, 'bass_parity');   // bass: strict i-m parity
  return { notes, chords:[], chordTemplates:[], handShapes:[], sections, duration:totalTime };
}

// octave_groove — the disco octave bounce. Relentless even R-8 IS the idiom
// (soul-motown feel review: don't syncopate it, don't add a Motown toggle — Motown
// melodic-bass is a separate future primitive). Two feel fixes: the weight lands on
// the HIGH octave (the pop up), not the root; tight root launch + singing octave
// landing (sus 0.45 vs 0.70).
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildOctaveGrooveExercise(cfg) {
  const step = secondsPerDivision(cfg), mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const degrees = progressionDegreesForConfig(cfg);
  const notes = [], sections = [{ name:`Octave groove — ${cfg.key}`, number:1, time:0 }];
  // Bass plucking is assigned BY STRING/role, not parity (bass-pedagogy
  // ruling): index on the low root, middle on the octave pop. Display-only.
  const bassRh = isBassCfg(cfg);
  let prevMidi = 33, t = 0, bar = 0;
  while (t < totalTime - 0.001) {
    const grip = bassRootGrip(cfg, chordRootForDegree(cfg, degrees[bar % degrees.length]), prevMidi);
    const barEnd = Math.min(totalTime, t + mLen);
    if (grip) {
      let i = 0;
      for (let tt = t; tt < barEnd - 0.001; tt += step, i++) {
        const isRoot = (i % 2 === 0);
        const p = isRoot ? grip.root : grip.octave;
        /** @type {import('../notes.js').Note} */
        const nf = { t:Number(tt.toFixed(6)), s:p.s, f:p.f, sus:Math.max(0.04, step * (isRoot ? 0.45 : 0.70)), ac:!isRoot, noSwing:true };
        if (bassRh) nf.rh = isRoot ? 1 : 2;
        notes.push(noteDefaults(nf));
      }
      prevMidi = grip.root.midi;
    }
    t = barEnd; bar++;
  }
  if (!notes.length) throw new Error('No octave groove notes generated.');
  return { notes, chords:[], chordTemplates:[], handShapes:[], sections, duration:totalTime };
}

// dead_note_groove — the 16th-note funk pocket. Funk-idiom feel review: uniformity
// kills the pocket — the REAL notes must SYNCOPATE (the one, then the & of 2, the &
// of 3, the a of 4 — the push that pulls the loop around), a few genuine RESTS make
// it breathe, and only ~2 accents/bar. Muted ghosts (mt) fill the rest. noSwing so
// the 8th-pair swing post-process can't smear the 16ths. Authored for a 4/4 16-step
// bar; other meters degrade to a tone-on-downbeats / ghost-between feel.
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildDeadNoteGrooveExercise(cfg) {
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const beatsPerBar = Math.max(1, cfg.meter.numerator), sixteenth = mLen / (beatsPerBar * 4);
  const stepsPerBar = beatsPerBar * 4, map16 = stepsPerBar === 16;
  const degrees = progressionDegreesForConfig(cfg);
  const notes = [], sections = [{ name:`Dead-note pocket — ${cfg.key}`, number:1, time:0 }];
  const realSus = Math.max(0.03, sixteenth * 0.6), ghostSus = Math.max(0.02, sixteenth * 0.4);
  const REAL = new Set([0, 6, 10, 14]), REST = new Set([2, 5, 13]), ACCENT = new Set([0, 6]);
  let prevMidi = 33, t = 0, bar = 0;
  while (t < totalTime - 0.001) {
    const grip = bassRootGrip(cfg, chordRootForDegree(cfg, degrees[bar % degrees.length]), prevMidi);
    const barEnd = Math.min(totalTime, t + mLen);
    if (grip) {
      const realPitch = [grip.root, grip.octave, grip.fifth, grip.octave];   // root on the one, colour on the pushes
      const tones = [grip.root, grip.octave, grip.fifth];
      let i = 0, realIdx = 0;
      for (let tt = t; tt < barEnd - 0.001; tt += sixteenth, i++) {
        if (map16 && REST.has(i)) continue;
        const isReal = map16 ? REAL.has(i) : (i % 4 === 0);
        if (isReal) {
          const p = map16 ? realPitch[realIdx++ % realPitch.length] : tones[Math.floor(i / 4) % tones.length];
          notes.push(noteDefaults({ t:Number(tt.toFixed(6)), s:p.s, f:p.f, sus:realSus, ac:(map16 ? ACCENT.has(i) : i === 0), noSwing:true }));
          prevMidi = p.midi;
        } else {
          notes.push(noteDefaults({ t:Number(tt.toFixed(6)), s:grip.root.s, f:grip.root.f, sus:ghostSus, mt:true, noSwing:true }));
        }
      }
    }
    t = barEnd; bar++;
  }
  if (!notes.length) throw new Error('No dead-note groove notes generated.');
  applyStrokePolicy(notes, cfg, 'bass_parity');   // bass: i-m parity, GHOSTS COUNT (the 16th motor)
  return { notes, chords:[], chordTemplates:[], handShapes:[], sections, duration:totalTime };
}

// slap_pop — the slap pocket. Funk-idiom feel review: real slap is mostly GHOSTS +
// SPACE with a few hits that snap, not a clockwork T-P. On a 16-grid: thumb (root,
// low) on the one and the "and-area" of 3; pop (octave, high) on the backbeat + the
// a-of-3 / &-of-4 pushes; dead-thumb ghosts (mt) between; the rest rests. Two accents
// (the one + the backbeat). noSwing keeps the 16ths straight (v1). Other meters
// degrade to an 8th-feel T-P. Advanced; gate after fingerstyle.
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildSlapPopExercise(cfg) {
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const beatsPerBar = Math.max(1, cfg.meter.numerator), sixteenth = mLen / (beatsPerBar * 4);
  const stepsPerBar = beatsPerBar * 4, map16 = stepsPerBar === 16;
  const degrees = progressionDegreesForConfig(cfg);
  const notes = [], sections = [{ name:`Slap & pop — ${cfg.key}`, number:1, time:0 }];
  const realSus = Math.max(0.03, sixteenth * 0.55), ghostSus = Math.max(0.02, sixteenth * 0.4);
  const THUMB = new Set([0, 8]), POP = new Set([4, 11, 14]), GHOST = new Set([2, 6, 13]), ACCENT = new Set([0, 4]);
  let prevMidi = 33, t = 0, bar = 0;
  while (t < totalTime - 0.001) {
    const grip = bassRootGrip(cfg, chordRootForDegree(cfg, degrees[bar % degrees.length]), prevMidi);
    const barEnd = Math.min(totalTime, t + mLen);
    if (grip) {
      let i = 0;
      // Slap-vs-pop is REGION-derived (bass-pedagogy ruling: no new field):
      // thumb hits + dead-thumb ghosts on the low root = rh 0 (p, the thumb);
      // pops hooked under the high octave = rh 1. Bass-only, display-only.
      const bassRh = isBassCfg(cfg);
      for (let tt = t; tt < barEnd - 0.001; tt += sixteenth, i++) {
        const T = Number(tt.toFixed(6));
        if (map16) {
          // slap:true tags the stroke lane to render T (thumb) / P (pop) instead of
          // the fingerstyle p-i-m-a map (bass-pedagogy glyph fix 2026-06-18).
          if (THUMB.has(i))      notes.push(noteDefaults(Object.assign({ t:T, s:grip.root.s,   f:grip.root.f,   sus:realSus,  ac:ACCENT.has(i), noSwing:true }, bassRh ? { rh:0, slap:true } : null)));
          else if (POP.has(i))   notes.push(noteDefaults(Object.assign({ t:T, s:grip.octave.s, f:grip.octave.f, sus:realSus,  ac:ACCENT.has(i), noSwing:true }, bassRh ? { rh:1, slap:true } : null)));
          else if (GHOST.has(i)) notes.push(noteDefaults(Object.assign({ t:T, s:grip.root.s,   f:grip.root.f,   sus:ghostSus, mt:true,          noSwing:true }, bassRh ? { rh:0, slap:true } : null)));
          // else rest
        } else if (i % 2 === 0) {
          const p = (i % 4 === 0) ? grip.root : grip.octave;
          notes.push(noteDefaults(Object.assign({ t:T, s:p.s, f:p.f, sus:realSus, ac:(i % 4 === 0), noSwing:true }, bassRh ? { rh:(i % 4 === 0) ? 0 : 1, slap:true } : null)));
        }
      }
      prevMidi = grip.root.midi;
    }
    t = barEnd; bar++;
  }
  if (!notes.length) throw new Error('No slap/pop notes generated.');
  return { notes, chords:[], chordTemplates:[], handShapes:[], sections, duration:totalTime };
}
