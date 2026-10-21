// SPDX-License-Identifier: AGPL-3.0-only
import type * as Shapes from '../core/fretboard-shapes.js';
import type {CoachContext, CoachCandidate, CoachFocus, FeltAnalysis, RunSummary, ScoreSummary, RunInfo} from './results-data.js';
export interface ShapeDebug {
  CAGED_SHAPES: typeof Shapes.CAGED_SHAPES;
  THREE_NPS_POSITION_DEFS: typeof Shapes.THREE_NPS_POSITION_DEFS;
  CAGED_CYCLE: typeof Shapes.CAGED_CYCLE; THREE_NPS_CYCLE: typeof Shapes.THREE_NPS_CYCLE;
  resolveCAGEDShape: typeof Shapes.resolveCAGEDShape;
  resolveThreeNPSPosition: typeof Shapes.resolveThreeNPSPosition;
  resolveOpenShape: typeof Shapes.resolveOpenShape;
  isOpenSystemSensible: typeof Shapes.isOpenSystemSensible;
  fretWindowForShape: typeof Shapes.fretWindowForShape;
  shapeOrderForKey: typeof Shapes.shapeOrderForKey;
  nextShapeInCycle: typeof Shapes.nextShapeInCycle;
  defaultShapeForSystem: typeof Shapes.defaultShapeForSystem;
  isShapeAwareSystem: typeof Shapes.isShapeAwareSystem;
  openPcForString: typeof Shapes.openPcForString;
  pcOfDegree: typeof Shapes.pcOfDegree; degreeOfPc: typeof Shapes.degreeOfPc;
}
export interface CoachDebug {
  coachRxFor: (context: CoachContext | null) => CoachCandidate | null;
  coachRxCandidates: (context: CoachContext | null) => CoachCandidate[];
  applyCoachHysteresis: (candidates: CoachCandidate[] | null, focus: CoachFocus | null) => {chosen: CoachCandidate | null | undefined; focus: CoachFocus | null};
  coachRxHtml: (candidate: CoachCandidate | null) => string;
  buildPocketDiagnosis: (felt: FeltAnalysis | null) => {text: string; tone: string} | null;
  buildCoachRx: (summary: RunSummary | null, score: Partial<ScoreSummary>, info: Partial<RunInfo> | null) => CoachCandidate | null | undefined;
  lastEndedSession: () => RunSummary | null;
}
declare global {
  interface Window {
    __virtuosoShapes?: ShapeDebug;
    __virtuosoCoach?: CoachDebug;
    __virtuosoKeysBound?: boolean;
  }
  var __SS_HARNESS__: boolean | undefined;
  var __ss_sgStats: {voices: number; doubled: number; chucks: number; mutestr: number} | undefined;
  var __ss_debug: Record<string, unknown> | undefined;
}
