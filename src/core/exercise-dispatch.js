// SPDX-License-Identifier: AGPL-3.0-only
import { buildScaleExercise, buildChordScaleExercise, buildScaleThirdsExercise, buildScaleSixthsExercise, buildStringSkippingExercise, buildPositionShiftExercise, buildRhythmicDisplacementExercise, buildBebopScaleExercise, buildHybridPickingExercise, buildTriadicPairsExercise, buildPentatonicSuperExercise, buildOctaveDisplacementExercise } from './builders/scale.js';
import { buildSweepArpeggioExercise, buildChromaticEnclosuresExercise, buildArpeggioInversionsExercise, buildArpeggioExercise } from './builders/arpeggio.js';
import { buildChromaticExercise } from './builders/chromatic.js';
import { buildSpiderExercise, buildBendingExercise, buildLegatoExercise, buildVibratoExercise, buildCallResponseExercise, buildTremoloPickingExercise, buildHertaExercise, buildRhythmPulseExercise, buildPedalPointExercise } from './builders/technique.js';
import { buildFingerstyleArpExercise, buildStrumCompExercise } from './builders/strum.js';
import { buildGuideTonesExercise, buildShellVoicingsExercise } from './builders/guide-tones.js';
import { buildMotifExercise } from './builders/motif.js';
import { buildTappingExercise } from './builders/tapping.js';
import { buildPedalRiffExercise } from './builders/pedal-riff.js';
import { buildWalkingBassExercise, buildRootFifthOctaveExercise, buildOctaveGrooveExercise, buildDeadNoteGrooveExercise, buildRightHandTechniqueExercise, buildSlapPopExercise } from './builders/bass.js';
import { progressionDegreesForConfig } from './harmony.js';

/** @param {import('./generation-types.js').GenerationConfig} cfg @returns {import('./generation-types.js').Chart} */
export function buildSingleChart(cfg) {
  const mode = cfg.mode || cfg.practiceType || 'scale';
  if (mode === 'scale' || mode === 'modal_vamp') return buildScaleExercise(cfg);
  if (mode === 'chord_scales')      return buildChordScaleExercise(cfg);
  if (mode === 'sweep_arpeggios')   return buildSweepArpeggioExercise(cfg);
  if (mode === 'chromatic')              return buildChromaticExercise(cfg);
  if (mode === 'spider')                 return buildSpiderExercise(cfg);
  if (mode === 'fingerstyle_arp')        return buildFingerstyleArpExercise(cfg);
  if (mode === 'guide_tones')            return buildGuideTonesExercise(cfg);
  if (mode === 'bending')                return buildBendingExercise(cfg);
  if (mode === 'legato')                 return buildLegatoExercise(cfg);
  if (mode === 'vibrato')                return buildVibratoExercise(cfg);
  if (mode === 'scale_thirds')           return buildScaleThirdsExercise(cfg);
  if (mode === 'scale_sixths')           return buildScaleSixthsExercise(cfg);
  if (mode === 'call_response')          return buildCallResponseExercise(cfg);
  if (mode === 'tremolo_picking')        return buildTremoloPickingExercise(cfg);
  if (mode === 'herta')                  return buildHertaExercise(cfg);
  if (mode === 'motif')                  return buildMotifExercise(cfg);
  if (mode === 'rhythm_pulse')           return buildRhythmPulseExercise(cfg);
  if (mode === 'tapping')                return buildTappingExercise(cfg);
  if (mode === 'pedal_point')            return buildPedalPointExercise(cfg);
  if (mode === 'pedal_riff')             return buildPedalRiffExercise(cfg);
  if (mode === 'string_skipping')        return buildStringSkippingExercise(cfg);
  if (mode === 'position_shift')         return buildPositionShiftExercise(cfg);
  if (mode === 'rhythmic_displacement')  return buildRhythmicDisplacementExercise(cfg);
  if (mode === 'chromatic_enclosures')   return buildChromaticEnclosuresExercise(cfg);
  if (mode === 'bebop_scale')            return buildBebopScaleExercise(cfg);
  if (mode === 'arpeggio_inversions')    return buildArpeggioInversionsExercise(cfg);
  if (mode === 'walking_bass')           return buildWalkingBassExercise(cfg);
  if (mode === 'hybrid_picking')         return buildHybridPickingExercise(cfg);
  if (mode === 'triadic_pairs')          return buildTriadicPairsExercise(cfg);
  if (mode === 'pentatonic_super')       return buildPentatonicSuperExercise(cfg);
  if (mode === 'shell_voicings')         return buildShellVoicingsExercise(cfg);
  if (mode === 'strum_comp')             return buildStrumCompExercise(cfg);
  if (mode === 'octave_displacement')    return buildOctaveDisplacementExercise(cfg);
  if (mode === 'root_fifth_octave')      return buildRootFifthOctaveExercise(cfg);
  if (mode === 'octave_groove')          return buildOctaveGrooveExercise(cfg);
  if (mode === 'dead_note_groove')       return buildDeadNoteGrooveExercise(cfg);
  if (mode === 'right_hand_technique')   return buildRightHandTechniqueExercise(cfg);
  if (mode === 'slap_pop')               return buildSlapPopExercise(cfg);
  return buildArpeggioExercise(cfg, progressionDegreesForConfig(cfg));
}
