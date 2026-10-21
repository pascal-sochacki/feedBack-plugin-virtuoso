// SPDX-License-Identifier: AGPL-3.0-only
import { SEGMENT_TEMPLATES } from '../content/segments.js';
import { materializeSegment, segmentCompetency, segmentEstDuration, blockRole } from './segments.js';
// Longer presets add context-cycling blocks rather than massing one drill.
// Recompute from the canonical arc so changing presets never compounds additions.
/** @type {Record<string, number>} */
export const LENGTH_PRESETS = { quick: 10, standard: 20, woodshed: 30 };

/** @type {Record<string, number>} */
export const LENGTH_CAP = { quick: 1.25, standard: 1.5, woodshed: 1.75 };

/** @type {Record<string, number>} */
export const DOSE_CEILING = { warmup: 75, technique: 90, scale_arp: 90, application: 120, jam: 150, review: 90, cooldown: 60 };

/** @param {string | null | undefined} role */
export function doseCeiling(role) { return DOSE_CEILING[/** @type {string} */ (role)] || 90; }

export const REVIEW_MAX_PASSES = 4, APP_MAX_PASSES = 3;

/** @param {string | null | undefined} preset */
export function lengthPresetSec(preset) { return LENGTH_PRESETS[/** @type {string} */ (preset)] ? LENGTH_PRESETS[/** @type {string} */ (preset)] * 60 : null; }

export const CIRCLE_OF_FIFTHS = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];

/** @param {string} key */
export function nextFifthKey(key) {
  /** @type {Record<string, string>} */
  const norm = { 'Gb':'F#','C#':'Db','D#':'Eb','G#':'Ab','A#':'Bb' };
  const k = norm[key] || key;
  const i = CIRCLE_OF_FIFTHS.indexOf(k);
  return i < 0 ? key : CIRCLE_OF_FIFTHS[(i + 1) % CIRCLE_OF_FIFTHS.length];
}

/** @param {import('./session-types.js').Segment} s */
export function segNatDur(s) { const m = materializeSegment(s); return m ? segmentEstDuration(m) : 0; }

/** @param {import('./session-types.js').Segment} src @param {number} [step] */
export function deriveReviewBlock(src, step) {
  step = step || 0;
  const comp = segmentCompetency(src, src);
  let block, key;
  if (src.templateId && SEGMENT_TEMPLATES[src.templateId]) {
    const tmpl = SEGMENT_TEMPLATES[src.templateId];
    const nVar = (tmpl.vary && tmpl.vary.length) ? tmpl.vary.length : 1;
    block = materializeSegment({ templateId: src.templateId, variantIdx: (((src.variantIdx || 0) + 1 + step) % nVar) });
    key = block && block.config && block.config.key;
  } else {
    const cfg = Object.assign({}, src.config || {});
    let k = cfg.key;
    for (let i = 0; i <= step; i++) if (k) k = nextFifthKey(k);
    if (k) cfg.key = k;
    key = k; block = { kind: src.kind, config: cfg };
  }
  if (!block) return null;
  return Object.assign({}, block, {
    id: (src.id || 'blk') + '_review' + (step ? '_' + step : ''),
    name: `Revisited — ${comp}${key ? ` in ${key}` : ''}`, role: 'review', _added: true,
    config: Object.assign({}, block.config, { audio: (src.config || {}).audio }),
  });
}

/** @param {import('./session-types.js').Segment} src @param {number} [step] */
export function deriveApplicationBlock(src, step) {
  step = step || 0;
  const cfg = Object.assign({}, src.config || {});
  let k = cfg.key;
  for (let i = 0; i <= step; i++) if (k) k = nextFifthKey(k);
  if (k) cfg.key = k;
  return Object.assign({}, src, {
    id: (src.id || 'blk') + '_app2' + (step ? '_' + step : ''),
    name: `Apply again${k ? ` in ${k}` : ''}`, role: src.role || blockRole(src) || 'application', _added: true, config: cfg,
  });
}

/** @param {import('./session-types.js').Segment[]} origSegs @param {string} preset @param {number} addBudget */
export function composeAddArc(origSegs, preset, addBudget) {
  if (preset === 'quick' || addBudget <= 1) return [];
  const roles = origSegs.map(blockRole);
  const appIdx = roles.findIndex(r => r === 'application' || r === 'jam');
  let skillIdx = roles.findIndex(r => r === 'technique' || r === 'scale_arp');
  if (skillIdx < 0) skillIdx = roles.findIndex(r => r !== 'warmup' && r !== 'cooldown' && r !== 'jam');
  let lastApp = -1; for (let i = 0; i < roles.length; i++) if (roles[i] === 'application' || roles[i] === 'jam') lastApp = i;
  const endsCold = !(roles.includes('application') || roles.includes('jam') || roles.includes('cooldown') || roles.includes('review'));
  const wantReview = preset === 'woodshed' || (preset === 'standard' && endsCold);
  const doApp = preset === 'woodshed' && lastApp >= 0;
  const revBudget = doApp ? addBudget * 0.6 : addBudget;
  const appBudget = doApp ? addBudget * 0.4 : 0;
  const out = [];
  if (wantReview && skillIdx >= 0) {
    const ceil = doseCeiling('review');
    const n = Math.max(1, Math.min(REVIEW_MAX_PASSES, Math.round(revBudget / ceil)));
    for (let i = 0; i < n; i++) { const b = deriveReviewBlock(origSegs[skillIdx], i); if (b) out.push({ seg: b, anchorIdx: appIdx >= 0 ? appIdx : origSegs.length, share: revBudget / n }); }
  }
  if (doApp) {
    const ceil = doseCeiling(roles[lastApp] || 'application');
    const n = Math.max(1, Math.min(APP_MAX_PASSES, Math.round(appBudget / ceil)));
    for (let i = 0; i < n; i++) { const b = deriveApplicationBlock(origSegs[lastApp], i); if (b) out.push({ seg: b, anchorIdx: origSegs.length, share: appBudget / n }); }
  }
  return out;
}

/** @param {import('./session-types.js').Session} session @param {string | null | undefined} preset */
export function applyLengthPreset(session, preset) {
  const totalSec = lengthPresetSec(preset);
  if (!totalSec || !session) return session;
  // Recompute from the CANONICAL arc — strip any prior _added blocks so changing
  // presets never compounds review passes (rhythm-meter). Non-mutating.
  const origSegs = (session.segments || []).filter(s => !s._added);
  if (!origSegs.length) return session;
  const nat = origSegs.map(segNatDur);
  const natSum = nat.reduce((a, b) => a + b, 0) || 1;
  const cap = LENGTH_CAP[/** @type {string} */ (preset)] || 1.5;
  const originalBudget = Math.min(totalSec, natSum * cap);
  const addBudget = totalSec - originalBudget;
  const adds = composeAddArc(origSegs, /** @type {string} */ (preset), addBudget);
  if (!adds.length) {
    // No add-arc (Quick, the preset fits a gentle stretch, or nothing to derive)
    // → dose the original arc across the WHOLE total proportionally (the prior
    // behaviour; a clean degrade so the realized length still ≈ the preset).
    const scaled = origSegs.map((s, i) => Object.assign({}, s, { targetSec: Math.max(20, (nat[i] / natSum) * totalSec) }));
    return Object.assign({}, session, { segments: scaled });
  }
  // Dose the original arc to originalBudget (≈ natural × cap — no massing). Each
  // added pass takes its `share`, CLAMPED at ~1.6× its category ceiling so a
  // thin source + a long preset can't bloat one pass (it under-fills with varied
  // contexts instead — honest length over massing).
  const origScaled = origSegs.map((s, i) => Object.assign({}, s, { targetSec: Math.max(20, (nat[i] / natSum) * originalBudget) }));
  adds.forEach(a => { const ceil = doseCeiling(blockRole(a.seg)); a.seg = Object.assign({}, a.seg, { targetSec: Math.max(20, Math.min(a.share, ceil * 1.6)) }); });
  // Splice added blocks at their anchors (descending so earlier inserts don't
  // shift later anchors). The result is a reordered+extended segments[] array.
  /** @type {import('./session-types.js').Segment[]} */
  const segs = origScaled.slice();
  adds.slice().sort((a, b) => b.anchorIdx - a.anchorIdx).forEach(a => { segs.splice(a.anchorIdx, 0, a.seg); });
  return Object.assign({}, session, { segments: segs });
}
