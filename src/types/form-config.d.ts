// SPDX-License-Identifier: AGPL-3.0-only
import type {GenerationConfig} from '../core/generation-types.js';
import type {ShapeNote} from '../core/fretboard-shapes.js';
// DOM decoding may leave shape/tuning/display fields unset. This is not a
// promise that a form configuration has passed generator validation.
export type FormConfig = Omit<GenerationConfig, 'shape' | 'shapeNotes' | 'shapeDisplayName' | 'customOpenMidis' | 'audio'> & {
  mode: string; practiceType: string; advancedMode: boolean; fretboardSystem: string;
  shape: string | number | null; shapeNotes: ShapeNote[] | null;
  shapeDisplayName: string | null; renderer: string; instrument: string;
  stringSetup: string; setupLabel: string; customOpenMidis: number[] | null;
  keyNominal: string | null; tuningOffset: number; anchorStation: string | null;
  countInBars: number; clickSubdiv: number; bendTarget: string;
  pulseOffbeat: boolean; strokePolicy: string; hertaAccent: number; hertaWalk: boolean; spiderPair: string;
  audio: {notes: boolean; metronome: boolean; harmony: boolean; profile: string; brightness: number; drums?: boolean};
  practicePathwayId?: string; practicedPathwayId?: string | null;
  practicePathwayCredit?: {pathwayId: string; tierIndex: number};
};
