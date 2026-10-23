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
  const sessionSetupId = draft.stringSetup && STRING_SETUPS[draft.stringSetup] ? draft.stringSetup : 'guitar_6_standard';
  const sessionSetup = STRING_SETUPS[sessionSetupId];
  const formSetup = options.stringSetup ? STRING_SETUPS[options.stringSetup] : null;
  const authoredSegments = (draft.segments || []).map(segment => materializeSegment(segment)).filter(isSegment);
  const portable = authoredSegments.length > 0 && authoredSegments.every(seg => seg.templateId && SEGMENT_TEMPLATES[seg.templateId]?.instrument === 'any');
  const inheritForm = !!formSetup && (formSetup.instrument === sessionSetup.instrument || portable);
  if (formSetup && !inheritForm) throw new Error('Workout requires a different instrument. Change Setup or choose a compatible Workout; your draft is retained.');
  const effectiveSetup = (inheritForm ? options.stringSetup : sessionSetupId) || sessionSetupId;
  const customOpenMidis = inheritForm ? options.customOpenMidis.trim() : '';
  if (formSetup) {
    const parse = (/** @type {string | number[] | undefined} */ value) => Array.isArray(value) ? value : value ? value.split(',').map(Number) : null;
    const player = parse(customOpenMidis) || formSetup.openMidis;
    if (player.length !== formSetup.openMidis.length || !player.every(Number.isFinite)) throw new Error('Invalid Setup tuning. Correct Setup; your draft is retained.');
    for (const seg of authoredSegments) {
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
  const segments = (draft.segments || []).map(segment => materializeSegment(segment,{stringSetup:effectiveSetup}));
  const invalid = segments.filter(segment => !segment).length;
  if (invalid) throw new Error(`Workout contains ${invalid} unknown block${invalid === 1 ? '' : 's'}`);
  const incompatible = segments.find(segment => segment?.kind === 'unavailable');
  if (incompatible) throw new Error(incompatible.applicabilityError || 'Workout contains an inapplicable block');
  return applyLengthPreset(Object.assign({}, draft, {
    stringSetup:effectiveSetup,
    ...(inheritForm && customOpenMidis ? {customOpenMidis} : {}),
    countInBars:options.countInBars,
    segments:segments.filter(isSegment).map(seg =>
      Object.assign({},seg,{config:Object.assign({},seg.config,{audio:options.audio})}))
  }),draft.lengthPreset);
}
/** @param {import('./session-types.js').Segment | null | undefined} seg @returns {seg is import('./session-types.js').Segment} */
function isSegment(seg) { return !!seg; }
