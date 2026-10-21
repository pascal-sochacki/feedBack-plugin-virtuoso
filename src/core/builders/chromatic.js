// SPDX-License-Identifier: AGPL-3.0-only
import { openMidisForConfig, isBassCfg } from '../instrument-tuning.js';
import { secondsPerDivision, measureSeconds, wholeCycleStepCount } from '../timing.js';
import { noteDefaults } from '../notes.js';
import { applyStrokePolicy } from '../stroke-policy.js';

/** @typedef {import('../stroke-policy.js').StrokeConfig & {bars: number, meter: import('../timing.js').Meter, chromaticPattern: string, direction?: string, fretMin?: number}} ChromaticConfig */

/** @type {Record<string, number[]>} */
export const CHROMATIC_PATTERNS = {
  '1234':[0,1,2,3], '4321':[3,2,1,0], '1324':[0,2,1,3], '1342':[0,2,3,1], '2413':[1,3,0,2]
};
/** @type {Record<string, string>} */
export const CHROMATIC_PATTERN_LABELS = {
  '1234':'1-2-3-4 (standard)', '4321':'4-3-2-1 (reverse)',
  '1324':'1-3-2-4 (crossing)', '1342':'1-3-4-2 (spider)', '2413':'2-4-1-3 (advanced)'
};

/** @param {ChromaticConfig} cfg */
export function buildChromaticExercise(cfg) {
  const opens = openMidisForConfig(cfg);
  const stringCount = opens.length;
  const step = secondsPerDivision(cfg);
  const mLen = measureSeconds(cfg);
  const totalTime = cfg.bars * mLen;
  const offsets = CHROMATIC_PATTERNS[cfg.chromaticPattern] || CHROMATIC_PATTERNS['1234'];
  // Bass chromatic warm-up floors at the 5th fret: a flat 1-2-3-4 down at fret 1
  // on a 34" scale is a hand-wrecking stretch (bass-pedagogy veto) — and it's the
  // prerequisite for honestly SHOWING the bass fret-hand fingering on this drill.
  let fretBase = Math.max(0, cfg.fretMin || 1);
  if (isBassCfg(cfg) && fretBase < 5) fretBase = 5;
  const notes = [];
  const sections = [{ name: `Chromatic ${CHROMATIC_PATTERN_LABELS[cfg.chromaticPattern] || cfg.chromaticPattern}`, number: 1, time: 0 }];

  // Build a repeating unit: one full pass across all strings per direction leg
  // Direction: 'ascending' = low-E to high-E, 'descending' = reverse,
  //            'up_down' = ascending then descending (classic warmup)
  // Virtuoso convention: s=0 is the LOWEST string (low E). "Ascending" across
  // strings means low E → high e, i.e. s=0 first, climbing to s=stringCount-1.
  const stringsAsc = Array.from({ length: stringCount }, (_, i) => i); // low E (s=0) first
  const stringsDesc = stringsAsc.slice().reverse();
  let stringOrder;
  if (cfg.direction === 'ascending') stringOrder = stringsAsc;
  else if (cfg.direction === 'descending') stringOrder = stringsDesc;
  else stringOrder = [...stringsAsc, ...stringsDesc]; // up_down

  // Build the repeating event list for one pass through the pattern
  const unit = [];
  for (const s of stringOrder) {
    for (const offset of offsets) {
      // Chromatic frame fingering (guitar-pedagogy ruling): 1-2-3-4 per
      // 4-fret frame — the canonical spider; no schools dispute it.
      unit.push({ s, f: fretBase + offset, fg: (offset >= 0 && offset <= 3) ? offset + 1 : null });
    }
  }

  const totalSteps = wholeCycleStepCount(totalTime, step, unit.length);
  let t = 0;
  for (let unitIdx = 0; unitIdx < totalSteps; unitIdx++) {
    const { s, f, fg } = unit[unitIdx % unit.length];
    /** @type {import('../notes.js').Note} */
    const nf = { t: Number(t.toFixed(6)), s, f, sus: Math.max(0.04, step * 0.85) };
    if (fg != null) nf.fg = f === 0 ? 0 : fg;
    notes.push(noteDefaults(nf));
    t += step;
  }
  applyStrokePolicy(notes, cfg, 'alternate');   // the chromatic warmup IS the alternate-picking lesson

  const duration = Math.max(totalTime, Number(t.toFixed(6)));
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections, duration };
}
