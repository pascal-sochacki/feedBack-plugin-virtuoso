// SPDX-License-Identifier: AGPL-3.0-only
import { chartBeatSeconds, HANDMARK_FINGERS_LESSON, HANDMARK_STROKES_LESSON, handMarkLessonMode } from './display-policy.js';
import { isBassCfg } from '../../core/instrument-tuning.js';

/** Stable ordering is cached per note-array identity; annotations remain live.
 * @param {import('./renderer-types.js').RenderNote[]} notes */
export function orderHandMarks(notes) {
  return [...notes].sort((a,b) => a.t - b.t);
}

/** @param {import('./renderer-types.js').RenderNote[]} notes @param {number} pxPerSec */
function spacing(notes, pxPerSec) {
  return notes.length > 1 ? (notes[notes.length-1].t - notes[0].t) / (notes.length-1) * pxPerSec : 99;
}

/** Simile thinning uses the preceding candidate, even when that mark was omitted.
 * Placement and the Tab open-finger omission stay with each renderer.
 * @param {import('./renderer-types.js').RenderNote[]} ordered
 * @param {import('./renderer-types.js').RenderBundle} bundle
 * @param {number} now @param {number} behind @param {number} ahead
 * @param {number} pxPerSec @param {boolean} includeOpen */
export function selectHandMarks(ordered, bundle, now, behind, ahead, pxPerSec, includeOpen) {
  const visible = ordered.filter(n => n.t - now >= -behind && n.t - now <= ahead);
  const picked = visible.filter(n => n.pkd === 0 || n.pkd === 1 || n.rh != null);
  const fingered = visible.filter(n => n.fg != null && (includeOpen || n.fg > 0) && !n.mt);
  const beat = chartBeatSeconds(bundle) || 0.5;
  const lesson = handMarkLessonMode(bundle);
  const strokesLesson = HANDMARK_STROKES_LESSON.has(lesson);
  const fingersLesson = HANDMARK_FINGERS_LESSON.has(lesson);
  const bass = isBassCfg(bundle.config || {});
  const strokeSpacing = spacing(picked, pxPerSec), fingerSpacing = spacing(fingered, pxPerSec);
  const strokes = picked.filter((n,i) => {
    if (!i || strokeSpacing >= 18 || strokesLesson) return true;
    const prev = picked[i-1];
    const mark = n.pkd != null ? 'k' + n.pkd : 'r' + n.rh;
    const prevMark = prev.pkd != null ? 'k' + prev.pkd : 'r' + prev.rh;
    return mark === prevMark || n.t - prev.t >= beat * 1.4;
  });
  const fingers = fingered.filter((n,i) => {
    if (!i || fingerSpacing >= 12 || fingersLesson || (bass && n.f >= 1 && n.f < 5)) return true;
    const prev = fingered[i-1];
    return n.s !== prev.s || Math.abs(n.f - prev.f) > 4;
  });
  return {strokes,fingers,hasStrokes:picked.length > 0,hasFingers:fingered.length > 0};
}
