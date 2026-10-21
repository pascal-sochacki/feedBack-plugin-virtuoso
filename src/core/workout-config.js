// SPDX-License-Identifier: AGPL-3.0-only
import { STRING_SETUPS } from './instrument-tuning.js';
import { materializeSegment } from './segments.js';
import { applyLengthPreset } from './workout-length.js';
/** @typedef {import('./session-types.js').Session & {description?: string, tags?: string[], lengthPreset?: string | null}} WorkoutDraft */
/** @typedef {{audio: {notes: boolean, metronome: boolean, harmony: boolean}, stringSetup: string | null, customOpenMidis: string, countInBars: number}} WorkoutLaunchOptions */

/** @param {WorkoutDraft} draft @param {WorkoutLaunchOptions} options */
export function materializeWorkoutConfig(draft, options) {
  const sessionSetup = STRING_SETUPS[/** @type {string} */ (draft.stringSetup)] || STRING_SETUPS.guitar_6_standard;
  const formSetup = options.stringSetup ? STRING_SETUPS[options.stringSetup] : null;
  const inheritForm = !!formSetup && formSetup.instrument === sessionSetup.instrument;
  const customOpenMidis = inheritForm ? options.customOpenMidis.trim() : '';
  // Family compatibility prevents guitar-only techniques from reaching a bass setup.
  return applyLengthPreset(Object.assign({}, draft, {
    ...(inheritForm ? {stringSetup:options.stringSetup} : {}),
    ...(inheritForm && customOpenMidis ? {customOpenMidis} : {}),
    countInBars:options.countInBars,
    segments:(draft.segments || []).map(materializeSegment).filter(isSegment).map(seg =>
      Object.assign({},seg,{config:Object.assign({},seg.config,{audio:options.audio})}))
  }),draft.lengthPreset);
}
/** @param {import('./session-types.js').Segment | null | undefined} seg @returns {seg is import('./session-types.js').Segment} */
function isSegment(seg) { return !!seg; }
