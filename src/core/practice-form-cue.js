// SPDX-License-Identifier: AGPL-3.0-only
import { FORM_CUES, FORM_CUE_RUNGS, FORM_CUE_BANDS } from '../content/form-cues.js';
/** @typedef {{instrument?: string, practiceType?: string, fretMin?: number}} CueConfig */
/** @param {CueConfig | null | undefined} cfg */
function bassCandidates(cfg) {
  const pt = cfg?.practiceType || '';
  if (pt === 'slap_pop') return ['thumb_bounce','pop_hook'];
  if (pt === 'walking_bass') return ['pivot_dont_jump','full_value'];
  if (pt === 'octave_groove' || pt === 'dead_note_groove' || pt === 'right_hand_technique') return ['floating_thumb','strict_im'];
  if (pt === 'chromatic' || pt === 'root_fifth_octave' || (cfg && cfg.fretMin != null && cfg.fretMin < 5)) return ['one_two_four','strict_im'];
  return ['strict_im'];
}
/**
 * A pre-run ergonomics sentence, never a verdict-triggered diagnosis.
 * Candidate rotation takes precedence over top-tier tension and band defaults.
 * @param {string} pathwayId
 * @param {{formCues?: string[], tempoTiers?: number[]} | null | undefined} pathway
 * @param {number} tierIdx
 * @param {CueConfig | null | undefined} cfg
 * @param {string | null | undefined} bandId
 */
export function practiceFormCue(pathwayId, pathway, tierIdx, cfg, bandId) {
  if (!pathway) return null;
  const instrument = cfg?.instrument === 'bass' ? 'bass' : 'guitar';
  const library = FORM_CUES[instrument];
  const candidates = instrument === 'bass' ? bassCandidates(cfg) : pathway.formCues || FORM_CUE_RUNGS[pathwayId];
  if (candidates?.length) return library[candidates[Math.max(0,tierIdx | 0) % candidates.length]] || null;
  const topTier = pathway.tempoTiers && pathway.tempoTiers.length > 1 && tierIdx >= pathway.tempoTiers.length - 1;
  if (topTier) return library[instrument === 'bass' ? 'relax_forearm' : 'shoulder_drop'];
  return library[FORM_CUE_BANDS[bandId || ''] || (instrument === 'bass' ? 'strict_im' : 'light_grip')] || null;
}
