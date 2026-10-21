// SPDX-License-Identifier: AGPL-3.0-only
import { scalePositionsForSystem } from '../positions.js';
import { applySequencePattern, directedPath, reflectIdx, orientSeq, fillNotesFromSeq } from '../sequence.js';
import { secondsPerDivision, rhythmSteps, measureSeconds, wholeCycleStepCount } from '../timing.js';
import { chartRng } from '../random.js';
import { noteDefaults } from '../notes.js';
import { applyStrokePolicy } from '../stroke-policy.js';
import { progressionDegreesForConfig, chordRootForDegree, chordQualityForDegree, chordName } from '../harmony.js';
import { openMidisForConfig } from '../instrument-tuning.js';
import { chordScalePositions, chordTonePositionsInPosition, pickChordPositions, templateFromPositions } from '../chord-positions.js';
import { CHORD_FORMULAS } from '../chord-theory.js';
import { SCALE_INTERVALS } from '../scale-intervals.js';
import { NOTE_ALIASES, pcName } from '../pitch.js';

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildScaleExercise(cfg) {
  const positions = scalePositionsForSystem(cfg);
  if (!positions.length) throw new Error('No scale notes found inside this fret range.');
  const sequenced = applySequencePattern(positions, cfg.sequence);
  const step = secondsPerDivision(cfg), steps = rhythmSteps(cfg), mLen = measureSeconds(cfg), minDuration = cfg.bars * mLen;
  const avgStep = steps ? steps.reduce((a, b) => a + b, 0) / steps.length : step;
  const path = directedPath(sequenced, cfg.direction, cfg.repeatCount, chartRng(cfg));
  const rawDuration = Math.max(minDuration, path.length * avgStep);
  const duration = Math.ceil(rawDuration / mLen - 1e-6) * mLen;
  // Cumulative clock so non-uniform rhythms (gallop) work; when `steps` is null
  // each tick is the uniform `step`, identical to the old i*step placement.
  const notes = [];
  let t = 0, i = 0;
  while (t < duration - 0.001) {
    const p = path[i % path.length];
    const sd = steps ? steps[i % steps.length] : step;
    /** @type {import('../notes.js').Note} */
    const nf = { t:Number(t.toFixed(6)), s:p.s, f:p.f, sus:Math.max(0.04, sd * 0.78), ac:i % Math.max(1, cfg.meter.numerator) === 0 };
    if (p.fg != null) nf.fg = p.fg;
    notes.push(noteDefaults(nf));
    t += sd; i++;
  }
  applyStrokePolicy(notes, cfg, 'alternate');   // scale runs default strict alternate; a rung may declare a school (economy/gypsy/…)
  return { notes, chords:[], chordTemplates:[], handShapes:[], sections:[{ name:`scale-${cfg.fretboardSystem || 'position'}`, number:1, time:0 }], duration };
}

// ===========================================================================
// §7 · EXERCISE BUILDERS
// each returns an { exercise } object (see docs/plugin/exercise-schema.md).
// ===========================================================================
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildChordScaleExercise(cfg) {
  const degrees = progressionDegreesForConfig(cfg);
  const mLen = measureSeconds(cfg), step = secondsPerDivision(cfg);
  const totalBars = Math.max(1, cfg.bars), duration = totalBars * mLen;
  const notesPerBar = Math.max(1, Math.round(mLen / step));
  const strategy = cfg.chordScaleStrategy || 'mode_of_moment';
  const isPark = strategy === 'chord_tone_emphasis';            // one parent scale, accent chord tones
  const useEnclosure = strategy === 'mode_of_moment_enclose';   // Connect + a bebop enclosure into each change
  const keyParent = isPark ? scalePositionsForSystem(cfg) : null;
  /** @type {import('../notes.js').Note[]} */
  const notes = [];
  const chordTemplates = [], chords = [], handShapes = [], sections = [];
  /** @type {number[]} */
  const barStarts = []; // notes[] index of each emitted bar's first (downbeat) note — used by the enclosure post-pass
  let cursor = 0;
  /** @type {number | null} */
  let prevMidi = null; // last note's pitch — threads voice-leading across the changes (Connect)
  // Connect: choose where the new chord's run STARTS so the line resolves INTO
  // the chord instead of restarting on its root. Prefer the nearest 3rd/7th
  // (guide tone) to the previous note, then nearest chord tone, then nearest
  // scale note; the first bar (no previous note) opens on the root. Ties prefer
  // the lower fret (stay in a comfortable hand position) — mirrors
  // nearestPositionForPc, the voice-leading primitive used by guide tones.
  /** @param {import('../positions.js').Position[]} path @param {number | null} prev @param {Set<number | undefined>} guidePcs @param {Set<number | undefined>} chordPcs @param {number} rootPc */
  function connectStartIdx(path, prev, guidePcs, chordPcs, rootPc) {
    if (prev == null) { for (let k = 0; k < path.length; k++) if (path[k].pc === rootPc) return k; return 0; }
    /** @param {(p: import('../positions.js').Position) => boolean} test */
    const nearest = (test) => {
      let bestK = -1, bestD = Infinity, bestF = Infinity;
      for (let k = 0; k < path.length; k++) {
        const p = path[k];
        if (p.midi == null || !test(p)) continue;
        const d = Math.abs(p.midi - /** @type {number} */ (prev));
        if (d < bestD || (d === bestD && p.f < bestF)) { bestK = k; bestD = d; bestF = p.f; }
      }
      return bestK;
    };
    let k = nearest(p => guidePcs.has(p.pc));
    if (k < 0) k = nearest(p => chordPcs.has(p.pc));
    if (k < 0) k = nearest(() => true);
    return k < 0 ? 0 : k;
  }
  // Bebop enclosure: lead INTO each change by rewriting the two notes before the
  // downbeat target as its chromatic upper + lower neighbours (above, below,
  // target) on the target's own string — the canonical bebop approach, and
  // maximally playable (one finger steps around the target). Needs ≥3 notes/bar
  // and the target off the nut/top fret; skipped otherwise. The neighbours are
  // intentionally chromatic (out-of-scale) — that's the device.
  function addEnclosures() {
    if (notesPerBar < 3) return;
    const opens = openMidisForConfig(cfg);
    /** @param {import('../notes.js').Note} n */
    const midiOf = (n) => opens[n.s] + n.f;
    for (let b = 1; b < barStarts.length; b++) {
      const tIdx = barStarts[b], target = notes[tIdx];
      if (!target || target.f < 1 || target.f > 23) continue;
      const above = tIdx - 2, below = tIdx - 1;
      if (above < barStarts[b - 1]) continue; // both neighbours must belong to the previous bar
      // Avoid a cross-string unison: if the chromatic upper neighbour would just
      // re-sound the note feeding into it (same pitch, different string, back to
      // back — a pointless re-fingering), skip the enclosure here and leave the
      // bar as plain Connect. (guitar-pedagogy spot-check, 2026-06-01.)
      const feed = notes[above - 1];
      if (feed && above - 1 >= barStarts[b - 1] && feed.s !== target.s && midiOf(feed) === opens[target.s] + target.f + 1) continue;
      notes[below].s = target.s; notes[below].f = target.f - 1; // chromatic lower neighbour
      notes[above].s = target.s; notes[above].f = target.f + 1; // chromatic upper neighbour
    }
  }
  const pathRand = chartRng(cfg);   // one seeded stream for the whole build
  for (let bar = 0; bar < totalBars; bar++) {
    const degree = degrees[bar % degrees.length];
    const rootPc = chordRootForDegree(cfg, degree);
    const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth, degree, cfg.chordOverride, cfg.progression);
    const positions = isPark ? keyParent : chordScalePositions(cfg, rootPc, quality);
    if (!positions || !positions.length) continue;
    const sequenced = applySequencePattern(positions, cfg.sequence);
    const path = directedPath(sequenced, cfg.direction, cfg.repeatCount, pathRand);
    if (!path.length) continue;
    const barStart = bar * mLen;
    const name = chordName(rootPc, quality), templateId = chordTemplates.length;
    const tones = chordTonePositionsInPosition(cfg, rootPc, quality);
    const displayTones = tones.length ? tones : pickChordPositions(cfg, rootPc, quality);
    const formula = (CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj).intervals;
    const chordPcs = new Set(formula.map(iv => (rootPc + iv) % 12));
    // Guide tones (3rd + 7th) define the chord's quality and are the natural
    // resolution targets when the harmony moves — Connect lands the change here.
    const guidePcs = new Set([
      (rootPc + (formula[1] ?? formula[0])) % 12,
      (rootPc + (formula.length >= 4 ? formula[3] : (formula[2] ?? formula[1] ?? formula[0]))) % 12,
    ]);
    chordTemplates.push(templateFromPositions(name, displayTones, cfg, false));
    chords.push({ t:Number(barStart.toFixed(6)), id:templateId, hd:false, notes:displayTones.map(p => noteDefaults({ s:p.s, f:p.f, sus:0 })) });
    handShapes.push({ chord_id:templateId, start_time:Number(barStart.toFixed(6)), end_time:Number((barStart + mLen).toFixed(6)), arp:false });
    sections.push({ name, number:templateId + 1, time:Number(barStart.toFixed(6)) });
    // PARK (chord_tone_emphasis) walks one parent scale continuously (cursor).
    // CONNECT (scale-follows-chord) voice-leads: start the new chord's run on the
    // guide tone nearest the previous note, then continue — no more root-restart.
    let startIdx;
    if (isPark) startIdx = cursor;
    else startIdx = connectStartIdx(path, prevMidi, guidePcs, chordPcs, rootPc);
    /** @type {number | null} */
    let lastMidi = prevMidi;
    barStarts.push(notes.length); // index of this bar's downbeat note (for the enclosure post-pass)
    for (let i = 0; i < notesPerBar; i++) {
      // Reflect (bounce at the box edges) rather than wrap (teleport top→bottom)
      // — keeps the run stepwise when notesPerBar exceeds the box or the entry
      // point is mid-box. Pre-existing leap fixed for both Park and Connect.
      const p = path[reflectIdx(startIdx + i, path.length)];
      const onBeat = i % Math.max(1, cfg.meter.numerator) === 0;
    const isTarget = !isPark && i === 0 && guidePcs.has(/** @type {number} */ (p.pc)); // the resolved guide tone on the change
    const isChordTone = isPark && chordPcs.has(/** @type {number} */ (p.pc));
      notes.push(noteDefaults({ t:Number((barStart + i * step).toFixed(6)), s:p.s, f:p.f, sus:Math.max(0.04, step * 0.78), ac:onBeat || isChordTone || isTarget }));
      if (p.midi != null) lastMidi = p.midi;
    }
    if (isPark) cursor += notesPerBar;
    else prevMidi = lastMidi;
  }
  if (useEnclosure) addEnclosures();
  return { notes, chords, chordTemplates, handShapes, sections:sections.length ? sections : [{ name:'chord-scales', number:1, time:0 }], duration };
}

// Build a "scale in <interval>" run. For each scale tone (lower voice) we pair
// it with the scale tone that sits the requested harmonic interval above it.
//
// The old implementation stepped by a fixed array index (+2 for a third, +5
// for a sixth). That is only correct for a 7-note diatonic scale: in a 5-note
// pentatonic, +2 indices is a 4th and +5 indices is an octave. We instead pick
// the partner by *pitch* — the scale tone whose interval above the lower voice
// is closest to the target semitone distance — so the drill yields real thirds
// and sixths in any scale (pentatonic, blues, modes, bebop, …).
//   minSemis/maxSemis bound the acceptable interval so we never label a 4th a
//   "third"; if no scale tone falls in range above a given lower voice (e.g.
//   the top of the range), that lower voice is skipped.
/** @param {import('../generation-types.js').GenerationConfig} cfg @param {string} label @param {number} targetSemis @param {number} minSemis @param {number} maxSemis */
export function buildScaleHarmonyRun(cfg, label, targetSemis, minSemis, maxSemis) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const sorted = scalePositionsForSystem(cfg).slice().sort((a, b) => a.midi - b.midi || a.s - b.s);
  if (sorted.length < 2) throw new Error(`Need more scale notes for ${label} — expand fret range.`);
  const pairs = [];
  for (let i = 0; i < sorted.length; i++) {
    const lo = sorted[i];
    // Find the scale tone whose pitch sits closest to targetSemis above `lo`,
    // searching only notes higher than `lo` and within [minSemis, maxSemis].
    let partner = null, bestErr = Infinity;
    for (let j = i + 1; j < sorted.length; j++) {
      const interval = sorted[j].midi - lo.midi;
      if (interval < minSemis) continue;
      if (interval > maxSemis) break; // sorted ascending — no closer match beyond here
      const err = Math.abs(interval - targetSemis);
      if (err < bestErr) { bestErr = err; partner = sorted[j]; }
    }
    if (partner) pairs.push([lo, partner]);
  }
  if (!pairs.length) throw new Error(`No ${label} available in this position — widen the fret range.`);
  // Twin-guitar harmonization (§2.4): the two voices sound TOGETHER (melody +
  // harmony a 3rd/6th above), one dyad per step — the melodeath/melodic-metal
  // signature — instead of walking the dyad notes as a single line.
  if (cfg.harmonize) {
    const step = secondsPerDivision(cfg), steps = rhythmSteps(cfg);
    const seq = cfg.direction === 'descending' ? pairs.slice().reverse()
      : cfg.direction === 'up_down' ? [...pairs, ...pairs.slice().reverse()] : pairs;
    const sus = Math.max(0.05, (steps ? steps[0] : step) * 0.9);
    const tr = !!cfg.tremolo;   // tremolo-picked twin leads — the melodeath signature
    const targetSteps = steps && steps.length ? null : wholeCycleStepCount(totalTime, step, seq.length);
    const notes = []; let t = 0, idx = 0;
    while (targetSteps != null ? idx < targetSteps : t < totalTime - 0.001) {
      const [lo, hi] = seq[idx % seq.length];
      notes.push(noteDefaults({ t: Number(t.toFixed(6)), s: lo.s, f: lo.f, sus, tr }));
      notes.push(noteDefaults({ t: Number(t.toFixed(6)), s: hi.s, f: hi.f, sus, tr }));
      t += (steps && steps.length) ? steps[idx % steps.length] : step; idx++;
    }
    return { notes, chords: [], chordTemplates: [], handShapes: [], sections: [{ name: `Harmonized ${label} — ${cfg.key} ${cfg.scale}`, number: 1, time: 0 }], duration: Math.max(totalTime, Number(t.toFixed(6))) };
  }
  /** @type {import('../positions.js').Position[]} */
  const asc = [];
  for (const [lo, hi] of pairs) { asc.push(lo); asc.push(hi); }
  // In a "run of thirds/sixths" each dyad's upper voice is frequently the next
  // dyad's lower voice (…A-C, C-E…). Played as a single-note line that yields a
  // repeated pitch (…C, C…). A player never re-articulates the same note there,
  // so collapse any immediate same-position repeat into one event.
  const cleaned = asc.filter((p, i) => i === 0 || p.s !== asc[i - 1].s || p.f !== asc[i - 1].f);
  const seq = orientSeq(cleaned, cfg.direction);
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Scale in ${label} — ${cfg.key} ${cfg.scale}` });
}

// Diatonic third ≈ 3–4 semitones (m3/M3). Target 4 (M3) so major-leaning
// scales prefer the major third where both are available.
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildScaleThirdsExercise(cfg) {
  return buildScaleHarmonyRun(cfg, 'thirds', 4, 3, 4);
}

// Diatonic sixth ≈ 8–9 semitones (m6/M6). Target 9 (M6).
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildScaleSixthsExercise(cfg) {
  return buildScaleHarmonyRun(cfg, 'sixths', 9, 8, 9);
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildStringSkippingExercise(cfg) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const allPos = scalePositionsForSystem(cfg);
  if (!allPos.length) throw new Error('No notes in range.');
  /** @type {Record<number, import('../positions.js').Position[]>} */
  const byStr = {};
  for (const p of allPos) (byStr[p.s] || (byStr[p.s] = [])).push(p);
  const strings = Object.keys(byStr).map(Number).sort((a, b) => a - b);
  // Interleave even-index and odd-index strings — creates visible cross-string jumps
  const events = [];
  for (const grp of [strings.filter(s => s % 2 === 0), strings.filter(s => s % 2 === 1)]) {
    for (const s of grp)
      for (const p of byStr[s].sort((a, b) => a.f - b.f)) events.push(p);
  }
  const seq = orientSeq(events, cfg.direction);
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `String skipping — ${cfg.key} ${cfg.scale}` });
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildPositionShiftExercise(cfg) {
  // Extend the fret range to force a positional shift across a shape boundary
  const wideCfg = Object.assign({}, cfg, { fretboardSystem: 'position', fretMax: (cfg.fretMax || 5) + 7, shapeNotes: null });
  const allPos = scalePositionsForSystem(wideCfg);
  if (!allPos.length) throw new Error('No notes found — try a lower fret range.');
  const sorted = allPos.slice().sort((a, b) => a.midi - b.midi || a.s - b.s);
  const seq = orientSeq(sorted, cfg.direction);
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Position shift — ${cfg.key} ${cfg.scale}` });
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildRhythmicDisplacementExercise(cfg) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const allPos = scalePositionsForSystem(cfg);
  if (!allPos.length) throw new Error('No notes in range.');
  const sorted = allPos.slice().sort((a, b) => a.midi - b.midi);
  const seq = orientSeq(sorted, cfg.direction);
  const offset = 60 / cfg.bpm; // displace by one quarter note
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(seq, { step, totalTime, sus, startAt: offset, duration: totalTime, name: `Rhythmic displacement — ${cfg.key} ${cfg.scale}` });
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildBebopScaleExercise(cfg) {
  // Use bebop scale variant; chord tones land on downbeats with 8-note chromatic passing tone
  const scaleInts = SCALE_INTERVALS[cfg.scale] || [];
  // A minor 3rd (interval 3) in the source scale means a minor tonality — route
  // to bebop minor (keeps the b3) rather than a major-3rd bebop scale. A dominant
  // context (mixolydian: major 3rd + b7) gets bebop dominant; otherwise bebop major.
  const hasMinorThird = scaleInts.includes(3);
  const hasFlatSeventh = scaleInts.includes(10);
  const bebopScale = (cfg.scale || '').startsWith('bebop_') ? cfg.scale
    : hasMinorThird ? 'bebop_dorian'
    : hasFlatSeventh ? 'bebop_dominant'
    : 'bebop_major';
  const bebopCfg = Object.assign({}, cfg, { scale: bebopScale, sequence: 'none', shapeNotes: null });
  const allPos = scalePositionsForSystem(bebopCfg);
  if (!allPos.length) throw new Error('No bebop scale notes in range.');
  const sorted = allPos.slice().sort((a, b) => a.midi - b.midi || a.s - b.s);
  const seq = orientSeq(sorted, cfg.direction);
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Bebop scale — ${cfg.key} (${bebopScale.replace('_', ' ')})` });
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildHybridPickingExercise(cfg) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const allPos = scalePositionsForSystem(cfg);
  if (!allPos.length) throw new Error('No notes in range.');
  /** @type {Record<number, import('../positions.js').Position[]>} */
  const byStr = {};
  for (const p of allPos) (byStr[p.s] || (byStr[p.s] = [])).push(p);
  // Virtuoso convention: s=0 is the LOWEST string (low E). Ascending sort puts
  // the low strings first so strings[i] (pick) sits below strings[i+1] (finger pluck).
  const strings = Object.keys(byStr).map(Number).sort((a, b) => a - b); // low E (s=0) first
  // Pair consecutive strings: pick low, pluck high, creating the hybrid pattern
  const events = [];
  for (let i = 0; i + 1 < strings.length; i++) {
    const lo = byStr[strings[i]].sort((a, b) => a.f - b.f);
    const hi = byStr[strings[i + 1]].sort((a, b) => a.f - b.f);
    const len = Math.max(lo.length, hi.length);
    for (let j = 0; j < len; j++) {
      events.push(lo[j % lo.length]);
      events.push(hi[j % hi.length]);
    }
  }
  if (!events.length) throw new Error('Need ≥ 2 strings for hybrid picking.');
  const seq = orientSeq(events, cfg.direction);
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Hybrid picking — ${cfg.key} ${cfg.scale}` });
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildTriadicPairsExercise(cfg) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  const scaleInts = SCALE_INTERVALS[cfg.scale] || SCALE_INTERVALS.major;
  const opens = openMidisForConfig(cfg);
  const fMin = cfg.fretMin || 0, fMax = cfg.fretMax || 12;
  // The "triad pair" device (Lydian / Bebop pedagogy) alternates two ADJACENT
  // triads that share NO common tones, so the two triads together spell six
  // distinct scale tones. The I and ii triads do exactly that:
  //   Triad 1 = I  : degrees 1-3-5 (indices 0,2,4)
  //   Triad 2 = ii : degrees 2-4-6 (indices 1,3,5)
  // The previous version paired I (1-3-5) with iii (3-5-7); those share the
  // 3rd and 5th, producing duplicate pitches back-to-back and only four
  // distinct tones — not a real triad pair.
  const t1Pcs = [0, 2, 4].map(i => (keyPc + scaleInts[i % scaleInts.length]) % 12);
  const t2Pcs = [1, 3, 5].map(i => (keyPc + scaleInts[i % scaleInts.length]) % 12);
  /** @param {number[]} pcs */
  function findNotes(pcs) {
    const out = [];
    for (let s = 0; s < opens.length; s++)
      for (let f = fMin; f <= fMax; f++) {
        const pc = ((opens[s] + f) % 12 + 12) % 12;
        if (pcs.includes(pc)) out.push({ s, f, midi: opens[s] + f });
      }
    return out.sort((a, b) => a.midi - b.midi);
  }
  const t1 = findNotes(t1Pcs), t2 = findNotes(t2Pcs);
  if (!t1.length || !t2.length) throw new Error('Not enough chord tones for triadic pairs.');
  // Play triad 1 ascending in full, then triad 2 ascending in full — the
  // idiomatic "run one triad then the next" articulation — guarding against a
  // back-to-back identical physical position at the seam.
  /** @type {{s: number, f: number, midi: number}[]} */
  const events = [];
  for (const p of t1) events.push(p);
  for (const p of t2) events.push(p);
  // De-dup any accidental immediate repeat of the same string+fret.
  const deduped = events.filter((p, i) => i === 0 || p.s !== events[i - 1].s || p.f !== events[i - 1].f);
  const seq = orientSeq(deduped, cfg.direction);
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Triadic pairs — ${cfg.key} ${cfg.scale}` });
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildPentatonicSuperExercise(cfg) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  // Superimpose minor pentatonic from the b3 above the root — gives Dorian flavor
  const superRoot = (keyPc + 3) % 12;
  const pentInts = SCALE_INTERVALS.minor_pentatonic;
  const superPcs = pentInts.map(i => (superRoot + i) % 12);
  const opens = openMidisForConfig(cfg);
  const fMin = cfg.fretMin || 0, fMax = cfg.fretMax || 12;
  const positions = [];
  for (let s = 0; s < opens.length; s++)
    for (let f = fMin; f <= fMax; f++) {
      const pc = ((opens[s] + f) % 12 + 12) % 12;
      if (superPcs.includes(pc)) positions.push({ s, f, midi: opens[s] + f });
    }
  if (!positions.length) throw new Error('No superimposed pentatonic notes in range.');
  const sorted = positions.sort((a, b) => a.midi - b.midi);
  const seq = orientSeq(sorted, cfg.direction);
  const sus = Math.max(0.05, step * 0.88);
  const superName = pcName(superRoot);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Pent. superimposition — ${superName}m over ${cfg.key}` });
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildOctaveDisplacementExercise(cfg) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  const scaleInts = SCALE_INTERVALS[cfg.scale] || SCALE_INTERVALS.major;
  const opens = openMidisForConfig(cfg);
  const fMin = cfg.fretMin || 0, fMax = Math.min(24, (cfg.fretMax || 12) + 12);
  const events = [];
  for (const iv of scaleInts) {
    const pc = (keyPc + iv) % 12;
    const instances = [];
    for (let s = 0; s < opens.length; s++)
      for (let f = fMin; f <= fMax; f++)
        if (((opens[s] + f) % 12 + 12) % 12 === pc) instances.push({ s, f, midi: opens[s] + f });
    instances.sort((a, b) => a.midi - b.midi);
    // Find a pair exactly one octave apart, preferring the cross-string octave
    // with the SMALLEST fret span — the compact octave grip players actually
    // use (e.g. low-E fret 8 + G-string fret 5), not the same-string +12 pair
    // which is a 12-fret leap no one plays. Fall back to a same-string pair
    // only if no cross-string octave exists in range.
    let pair = null, pairSpan = Infinity, sameStringPair = null;
    for (let i = 0; i + 1 < instances.length; i++) {
      for (let j = i + 1; j < instances.length; j++) {
        if (instances[j].midi - instances[i].midi !== 12) continue;
        if (instances[j].s !== instances[i].s) {
          const span = Math.abs(instances[j].f - instances[i].f);
          if (span < pairSpan) { pair = [instances[i], instances[j]]; pairSpan = span; }
        } else if (!sameStringPair) {
          sameStringPair = [instances[i], instances[j]];
        }
      }
    }
    pair = pair || sameStringPair;
    if (pair) { events.push(pair[0]); events.push(pair[1]); }
  }
  if (!events.length) throw new Error('No octave pairs in range — expand fret range.');
  const seq = orientSeq(events, cfg.direction);
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Octave displacement — ${cfg.key} ${cfg.scale}` });
}
