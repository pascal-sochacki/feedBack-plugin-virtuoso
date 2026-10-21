// SPDX-License-Identifier: AGPL-3.0-only
import { NOTE_ALIASES } from '../pitch.js';
import { SCALE_INTERVALS } from '../scale-intervals.js';
import { progressionDegreesForConfig, chordRootForDegree, chordQualityForDegree } from '../harmony.js';
import { measureSeconds } from '../timing.js';
import { openMidisForConfig, isBassCfg } from '../instrument-tuning.js';
import { isShapeAwareSystem } from '../fretboard-shapes.js';
import { CHORD_FORMULAS } from '../chord-theory.js';
import { nearestPositionForPc } from '../positions.js';
import { noteDefaults } from '../notes.js';

// Guide tones generator — jazz entry-point exercise for any progression.
// Generates only the 3rd and/or 7th of each chord, voice-led so each note
// moves by the smallest possible interval to the next chord's guide tone.
// `cfg.voices`: 'thirds_only' | 'sevenths_only' | 'both_alternating'
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildGuideTonesExercise(cfg) {
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  const scale = cfg.scale || 'major';
  const scaleInts = SCALE_INTERVALS[scale] || SCALE_INTERVALS.major;
  const chordDepth = cfg.chordDepth || 'seventh';
  const degrees = progressionDegreesForConfig(cfg);
  const voices = cfg.voices || 'thirds_only';
  const mLen = measureSeconds(cfg);
  const openMidis = openMidisForConfig(cfg);
  // Resolve fret range from shape if shape-aware system
  let fMin = cfg.fretMin, fMax = cfg.fretMax;
  if (isShapeAwareSystem(/** @type {string} */ (cfg.fretboardSystem)) && cfg.shapeNotes && cfg.shapeNotes.length) {
    const fs = cfg.shapeNotes.map(n => n.f);
    fMin = Math.min.apply(null, fs); fMax = Math.max.apply(null, fs);
  }
  // Expand slightly for voice-leading flexibility without leaving the position
  const searchFMin = Math.max(0, fMin - 2);
  const searchFMax = Math.min(24, fMax + 2);

  const notes = [], sections = [];
  sections.push({ name:`Guide tones — ${voices.replace(/_/g,' ')}`, number:1, time:0 });

  // Start register: mid guitar (E4 = 64), or the bass register (E2 = 40) on bass
  // so guide tones don't seed two octaves too high (harmony-theory ruling).
  let prevMidi = isBassCfg(cfg) ? 40 : 64;
  let useThird = true;
  let t = 0;
  const reps = Math.max(1, Math.round(cfg.bars / Math.max(1, degrees.length)));

  for (let rep = 0; rep < reps; rep++) {
    for (let di = 0; di < degrees.length; di++) {
      const degree = degrees[di];
      const degNum = (degree && typeof degree === 'object') ? degree.deg : degree;
      if (degNum != null && (degNum < 1 || degNum > scaleInts.length)) { t += mLen; continue; }
      const chordRootPc = chordRootForDegree(cfg, degree);   // handles {semis|deg} tokens + minor pinning + tritone sub
      const quality = chordQualityForDegree(cfg.scale, chordDepth, degree, cfg.chordOverride, cfg.progression);
      const formula = CHORD_FORMULAS[quality]?.intervals || [0, 4, 7];
      // 3rd = formula[1], 7th = formula[3] (if present, else fall back to 5th)
      const thirdPc  = (chordRootPc + (formula[1] ?? formula[0])) % 12;
      const seventhPc = formula.length >= 4
        ? (chordRootPc + formula[3]) % 12
        : (chordRootPc + (formula[2] ?? formula[1] ?? formula[0])) % 12;

      let targetPc;
      if (voices === 'thirds_only')   targetPc = thirdPc;
      else if (voices === 'sevenths_only') targetPc = seventhPc;
      else { targetPc = useThird ? thirdPc : seventhPc; useThird = !useThird; }

      const pos = nearestPositionForPc(targetPc, prevMidi, openMidis, searchFMin, searchFMax);
      if (pos) {
        notes.push(noteDefaults({ t:Number(t.toFixed(6)), s:pos.s, f:pos.f, sus:Math.max(0.05, mLen * 0.9), ac:di === 0 && rep === 0 }));
        prevMidi = pos.midi;
      }
      t += mLen;
    }
  }
  const duration = Math.max(t, cfg.bars * mLen);
  return { notes, chords:[], chordTemplates:[], handShapes:[], sections, duration };
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildShellVoicingsExercise(cfg) {
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const opens = openMidisForConfig(cfg);
  const degrees = progressionDegreesForConfig(cfg);
  const fMin = cfg.fretMin || 0, fMax = cfg.fretMax || 12;
  const notes = [], sections = [{ name: `Shell voicings — ${cfg.key}`, number: 1, time: 0 }];
  let prevMidi = 48, t = 0, bar = 0;
  while (t < totalTime - 0.001) {
    const deg = degrees[bar % degrees.length];
    const rootPc = chordRootForDegree(cfg, deg);
    const quality = chordQualityForDegree(cfg.scale, 'seventh', deg, cfg.chordOverride, cfg.progression);
    const formula = CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj7;
    // Shell: root (0), 3rd (index 1), 7th (index 3 or fall back to 5th)
    const shellIdxs = [0, 1, formula.intervals[3] != null ? 3 : 2];
    for (let b = 0; b < 3; b++) {
      const pc = (rootPc + formula.intervals[shellIdxs[b]]) % 12;
      const pos = nearestPositionForPc(pc, prevMidi, opens, fMin, fMax);
      if (pos) {
        const noteT = t + (b / 3) * mLen;
        if (noteT < totalTime)
          notes.push(noteDefaults({ t: Number(noteT.toFixed(6)), s: pos.s, f: pos.f, sus: Math.max(0.1, mLen / 3 * 0.9) }));
        prevMidi = opens[pos.s] + pos.f;
      }
    }
    t += mLen; bar++;
  }
  if (!notes.length) throw new Error('No shell voicing notes generated.');
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration: Math.max(t, totalTime) };
}
