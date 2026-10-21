// SPDX-License-Identifier: AGPL-3.0-only

/**
 * @typedef {{t: number, s: number, f: number, sus?: number, sl?: number, slu?: number, bn?: number, bt?: number, ho?: boolean, po?: boolean, hm?: boolean, hp?: boolean, pm?: boolean, mt?: boolean, vb?: boolean, tr?: boolean, ac?: boolean, tp?: boolean, fg?: number, pkd?: number, rh?: number, noSwing?: boolean, slap?: boolean, ch?: number | string, solo?: string, _spotlightPhrase?: boolean}} Note
 */

// `bt` (bend intent, riff-vocab v1 articulation add): 0 = bend-up (today's
// default semantic), 1 = release, 2 = pre-bend, 3 = pre-bend-and-release,
// 4 = bend-and-release (round trip). `bn` stays the magnitude (now incl. the
// 0.25 quarter-curl). Audio/judging already treat bn generically; bt is the
// declared INTENT for renderers/judging to grow into (the DapperTap
// "bends judged unbent" class). See docs/plugin/exercise-schema.md.
/** @template {object} T @param {T | null} [extra] */
export function noteDefaults(extra) { return Object.assign({ t:0, s:0, f:0, sus:0, sl:-1, slu:-1, bn:0, bt:0, ho:false, po:false, hm:false, hp:false, pm:false, mt:false, vb:false, tr:false, ac:false, tp:false }, extra || {}); }
