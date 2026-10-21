// SPDX-License-Identifier: AGPL-3.0-only
/** @type {Record<string, Record<string, string>>} */
export const PRACTICE_APPLICABILITY = {
  bending:{bass:'n-a'}, tremolo_picking:{bass:'n-a'}, hybrid_picking:{bass:'n-a'},
  strum_comp:{bass:'n-a'},
  legato:{bass:'adapted'}, pedal_riff:{bass:'adapted'}, vibrato:{bass:'adapted'},
  tapping:{bass:'adapted'}, herta:{bass:'adapted'}, motif:{bass:'adapted'},
  spider:{bass:'adapted'}, fingerstyle_arp:{bass:'n-a'}, pentatonic_super:{bass:'adapted'},
  sweep_arpeggios:{bass:'adapted'}, shell_voicings:{bass:'adapted'},
  root_fifth_octave:{guitar:'n-a'}, octave_groove:{guitar:'n-a'}, dead_note_groove:{guitar:'n-a'},
  right_hand_technique:{guitar:'n-a'}, slap_pop:{guitar:'n-a'},
};
/** @param {string} primitive @param {string} instrument */
export function offerable(primitive, instrument) { return (PRACTICE_APPLICABILITY[primitive]?.[instrument] || 'native') !== 'n-a'; }

/** @typedef {{pathwayId: string | null, variationIndex: number, tierIndex: number, bandId: string | null}} PracticeSelection */
/** @typedef {{base?: Record<string, unknown>, vary?: Record<string, unknown>[], tempoTiers?: number[], tempoTierSubdivs?: string[], tempoTierBars?: number[]}} SelectablePathway */

/** @returns {PracticeSelection} */
export function initialPracticeSelection() {
  return {pathwayId:null, variationIndex:0, tierIndex:0, bandId:null};
}

/** @param {PracticeSelection} current @param {string} id @param {SelectablePathway | undefined} pathway @param {string | null} bandId @param {number | null | undefined} variationIndex */
export function selectPracticePathway(current, id, pathway, bandId, variationIndex) {
  const next = {...current, pathwayId:id};
  if (id === 'custom') return next;
  next.bandId = bandId || current.bandId;
  if (!pathway?.base) return next;
  const length = pathway.vary?.length || 1;
  next.variationIndex = variationIndex != null ? ((variationIndex % length) + length) % length : 0;
  if (id !== current.pathwayId) next.tierIndex = 0;
  return next;
}

/** @param {SelectablePathway | null | undefined} pathway @param {number} index @returns {[string, string][]} */
export function practiceTierFields(pathway, index) {
  if (pathway?.tempoTiers?.[index] == null) return [];
  /** @type {[string, string][]} */
  const fields = [['bpm', String(pathway.tempoTiers[index])]];
  if (pathway.tempoTierSubdivs?.[index]) fields.push(['subdivision', pathway.tempoTierSubdivs[index]]);
  if (pathway.tempoTierBars?.[index] != null) fields.push(['bars', String(pathway.tempoTierBars[index])]);
  return fields;
}
