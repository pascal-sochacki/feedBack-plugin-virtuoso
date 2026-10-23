// SPDX-License-Identifier: AGPL-3.0-only
import { STRING_SETUPS } from './instrument-tuning.js';
import { materializeSegment } from './segments.js';
import { applyLengthPreset } from './workout-length.js';
import {offerable} from './practice-selection.js';
import {SEGMENT_TEMPLATES} from '../content/segments.js';
/** @typedef {import('./session-types.js').Session & {description?: string, tags?: string[], lengthPreset?: string | null}} WorkoutDraft */
/** @typedef {{audio: {notes: boolean, metronome: boolean, harmony: boolean}, stringSetup: string | null, customOpenMidis: string, countInBars: number}} WorkoutLaunchOptions */

/** @param {WorkoutDraft} draft @param {WorkoutLaunchOptions} options */
export function materializeWorkoutConfig(draft, options) {
  const sessionSetup = STRING_SETUPS[/** @type {string} */ (draft.stringSetup)] || STRING_SETUPS.guitar_6_standard;
  const formSetup = options.stringSetup ? STRING_SETUPS[options.stringSetup] : null;
  const segments = (draft.segments || []).map(materializeSegment).filter(isSegment);
  const portable = segments.length > 0 && segments.every(seg => seg.templateId && SEGMENT_TEMPLATES[seg.templateId]?.instrument === 'any');
  const inheritForm = !!formSetup && (formSetup.instrument === sessionSetup.instrument || portable);
  if (formSetup && !inheritForm) throw new Error('Workout requires a different instrument. Change Setup or choose a compatible Workout; your draft is retained.');
  const customOpenMidis = inheritForm ? options.customOpenMidis.trim() : '';
  if (formSetup) {
    const parse = (/** @type {string | number[] | undefined} */ value) => Array.isArray(value) ? value : value ? value.split(',').map(Number) : null;
    const player = parse(customOpenMidis) || formSetup.openMidis;
    if (player.length !== formSetup.openMidis.length || !player.every(Number.isFinite)) throw new Error('Invalid Setup tuning. Correct Setup; your draft is retained.');
    for (const seg of segments) {
      if (!offerable(seg.kind || 'scale',formSetup.instrument)) throw new Error('Workout block is incompatible with Setup. Edit the block or change Setup; your draft is retained.');
      // Degree-driven blocks intentionally adapt across counts/tunings. Explicit
      // block tuning is an authored physical constraint, not a retune instruction.
      const tuning = parse(seg.config?.customOpenMidis);
      if (tuning && (tuning.length !== player.length || tuning.some((midi,index) => midi !== player[index]))) throw new Error('Workout block requires a different tuning/string count. Edit the block or change Setup; your draft is retained.');
    }
    const authoredTuning = parse(draft.customOpenMidis);
    if (authoredTuning && (authoredTuning.length !== player.length || authoredTuning.some((midi,index) => midi !== player[index]))) throw new Error('Workout requires a different tuning/string count. Change Setup or choose another Workout; your draft is retained.');
  }
  // Family compatibility prevents guitar-only techniques from reaching a bass setup.
  return applyLengthPreset(Object.assign({}, draft, {
    ...(inheritForm ? {stringSetup:options.stringSetup} : {}),
    ...(inheritForm && customOpenMidis ? {customOpenMidis} : {}),
    countInBars:options.countInBars,
    segments:segments.map(seg =>
      Object.assign({},seg,{config:Object.assign({},seg.config,{audio:options.audio})}))
  }),draft.lengthPreset);
}
/** @param {import('./session-types.js').Segment | null | undefined} seg @returns {seg is import('./session-types.js').Segment} */
function isSegment(seg) { return !!seg; }
