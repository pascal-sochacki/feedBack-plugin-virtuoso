// SPDX-License-Identifier: AGPL-3.0-only
import type * as Shapes from '../core/fretboard-shapes.js';
import type {CoachContext, CoachCandidate, CoachFocus, FeltAnalysis, RunSummary, ScoreSummary, RunInfo} from './results-data.js';
import type {EntryBundle, EntryExercise} from './entry-data.js';
import type {TierRecord} from './progress-data.js';
import type {DepthGain, FeltCredit, ShareModel, SessionLog, TimingDeviation} from './results-data.js';

/** Public browser API attached by the entry IIFE. Persisted JSON remains unvalidated. */
export interface VirtuosoPublicAPI {
  generateExercise: typeof import('../core/exercise.js').generateExercise;
  generateSession: typeof import('../core/session.js').generateSession;
  makeBundle: (exercise: EntryExercise) => EntryBundle;
  resolveRendererFactory: (kind: string) => Promise<import('../shell/renderers/renderer-types.js').RendererSelection>;
  readConfig: typeof import('../shell/practice-config.js').readConfig;
  setSegmentLoop: (a: unknown, b: unknown) => void;
  clearSegmentLoop: () => void;
  getSegmentLoop: () => {a: number | null; b: number | null};
  STYLE_PALETTES: typeof import('../core/style-palettes.js').STYLE_PALETTES;
  stylePaletteConfig: typeof import('../core/config-defaults.js').stylePaletteConfig;
  SEGMENT_TEMPLATES: typeof import('../content/segments.js').SEGMENT_TEMPLATES;
  SEGMENT_ROLES: typeof import('../content/segments.js').SEGMENT_ROLES;
  BUILT_IN_SESSIONS: typeof import('../content/workouts.js').BUILT_IN_SESSIONS;
  rollSegment: typeof import('../core/segments.js').rollSegment;
  refreshWorkout: typeof import('../core/segments.js').refreshWorkout;
  applyLengthPreset: typeof import('../core/workout-length.js').applyLengthPreset;
  materializeSegment: typeof import('../core/segments.js').materializeSegment;
  /** Raw localStorage JSON is not validated against a progress schema. */
  progressLoad: () => unknown;
  /** Accepts data for serialization; it does not certify its persisted shape. */
  progressSave: (value: object) => void;
  progressSetMode: (mode: 'off' | 'casual' | 'hardcore') => void;
  advanceDepthLadder: (session: SessionLog) => DepthGain | null;
  nodeProgressState: (id: string, progress: Record<string, TierRecord>) => {
    tierCount: number; highestTier: number; cleared: boolean; inProgress: boolean;
    prereq: string | null; prereqUnmet: boolean;
    depth: {travel: boolean; clean: boolean; eyesOff: boolean; mastered: boolean; keysCleared: number} | null;
  };
  woodshedLog: () => {
    totalMin: number; weekMin: number; sessions: number; days: number; xp: number;
    numbers: {label: string; bpm: number}[];
    travels: {label: string; keys: number; mastered: boolean}[];
    grooves: {label: string; bpm: number}[];
  };
  streakCount: (sessions: Pick<SessionLog, 'date'>[]) => number;
  creditBlockTier: (templateId: string | null | undefined, bpm: number | null | undefined,
    score: {hits: number; judged: number} | null) => import('./results-data.js').BlockCredit | null;
  xpLevelInfo: (xp: number) => {
    level: number; name: string; xp: number; at: number; nextName: string | null;
    nextAt: number | null; into: number; span: number;
  };
  computeBadges: () => string[];
  creditBadges: () => {newBadges: import('./results-data.js').Badge[]; all: import('./results-data.js').Badge[]} | null;
  shareCardText: (summary: RunSummary | null) => string;
  isShareworthy: (summary: RunSummary | null) => boolean;
  feltHoldAnalyze: (deviations: TimingDeviation[] | null, options?: {barSec?: number}) => FeltAnalysis;
  creditFeltRung: (pathwayId: string, bpm: number | null | undefined, analysis: FeltAnalysis | null) => FeltCredit | null;
  shareCardModel: (summary: RunSummary | null) => ShareModel | null;
  renderShareCardImage: (summary: RunSummary | null) => HTMLCanvasElement | null;
  jamArmFromDrill: (styleId: string, key: string | null, deviceLabel: string) => void;
  jamTargetPcs: (time: number) => Set<number> | null;
  jamNextGuidePcs: (time: number) => Set<number> | null;
  goldDebug: {
    bar: {minMs: number; minInKeyPct: number; minChordHops: number; minPcs: number; combOnly: boolean};
    reset: () => void;
    mirror: () => {confirmed: number; inChord: number; inKey: number; outside: number; pcs: Set<number>; chordHops: number; lastSeg: string | null; comb: boolean} | null;
    seed: (mirror: Partial<{confirmed: number; inChord: number; inKey: number; outside: number; pcs: Iterable<number>; chordHops: number; lastSeg: string | null; comb: boolean}> | null) => void;
    evaluate: (session: {duration_ms?: number} | null) => {
      confirmed: number; inChord: number; inKey: number; inChordPct: number; inKeyPct: number;
      chordHops: number; pcCount: number; verifier: string; durationMs: number; met?: boolean;
    } | null;
    store: (styleId: string, result: NonNullable<ReturnType<VirtuosoPublicAPI['goldDebug']['evaluate']>>) => boolean;
    midiTarget: (midi: number, openMidis?: number[]) => {s: number; f: number; b: boolean}[] | null;
    armed: () => boolean;
  };
  getActiveBundleInfo: () => {config: EntryBundle['config']; duration: number; leadIn: number} | null;
  sgStats: () => Record<string, number>;
}

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
    Virtuoso: VirtuosoPublicAPI;
    __virtuosoShapes?: ShapeDebug;
    __virtuosoCoach?: CoachDebug;
    __virtuosoKeysBound?: boolean;
  }
  var __SS_HARNESS__: boolean | undefined;
  var __ss_sgStats: {voices: number; doubled: number; chucks: number; mutestr: number} | undefined;
  var __ss_debug: Record<string, unknown> | undefined;
}
