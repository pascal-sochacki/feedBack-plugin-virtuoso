// SPDX-License-Identifier: AGPL-3.0-only
// Internal run snapshots only: these contracts do not validate localStorage JSON.
export interface TimingDeviation {t: number; d: number; sb?: number}
export interface FeltAnalysis {
  verdict: 'locked' | 'settling' | 'dragging' | 'rushing' | null;
  n: number; untight: boolean; spanBars?: number;
  leanMs?: number; driftMs?: number; jitterMs?: number;
}
export interface HeatCell {s: number; f: number; hit: number; miss: number; ex: number}
export interface HeatSnapshot {
  cells: HeatCell[]; opens: number[]; missTotal: number; fgMissN: number;
  fgMiss: Record<string, number>; transMiss: Record<string, number>;
}
export interface LeanBar {i: number; lean: number; jit: number; n: number}
export interface LeanSnapshot {bars: LeanBar[]; chg: {med: number; n: number} | null}
export interface RunInfo {
  total: number; judged: number; exemptSubFloor: number; exemptMuted: number;
  exemptChords: number; exemptLegato: number; exemptFast: number; floorMs: number;
  tremoloSpans: number; tremoloNotes: number; ear: string;
  winSingleMs: number; winChordMs: number; winInherited: boolean;
  leanMs?: number | null; leanN?: number; nearMiss?: number;
  heat?: HeatSnapshot | null; leanBars?: LeanSnapshot | null;
  calMs?: number; calMatched?: number; latencyMs?: number;
}
export interface BlockCredit {
  pathwayId: string; pathwayLabel: string; tier: number; tierName: string;
  feltVerdict?: FeltAnalysis['verdict'];
}
export interface FeltCredit extends Omit<BlockCredit, 'feltVerdict'> {
  verdict: FeltAnalysis['verdict']; flip: boolean; feltPB: boolean; feltBpm: number | null;
}
export interface DepthGain {xpGained: number; travelKey: string | null; travelRung: boolean; cleanRung: boolean}
export interface ProofClaim {
  kind: string; label: string; tierName: string; bpm: number | null; key: string | null;
  transfer: string; progression?: string; landings?: number; changes?: number;
}
export interface Chapter {
  name?: string; kind?: string; role: string | null; competency: string | null;
  added: boolean; key: string | null; durSec: number; reached: boolean;
  hits: number; judged: number; hadInput: boolean; earned: BlockCredit | null;
  felt: Pick<FeltAnalysis, 'verdict' | 'untight'> & {spanBars: number} | null;
}
export interface ScoreSummary {hits: number; missed: number; judgedPassed: number; hadInput: boolean; info: RunInfo | null}
export interface Badge {id: string; name: string; desc: string}
export interface ProofDuration {content_ms?: number; duration_ms?: number; bpm?: number | null; hit_count?: number; miss_count?: number}
export interface RunSummary {
  mode: string; scale: string | null; key: string | null; pathway_id: string | null;
  practice_type: string; bpm: number | null; bpm_tier: number | null;
  duration_ms: number; displayName: string; tierCleared: boolean; clearedTier: number | null;
  depth: DepthGain | null; proof: ProofClaim | null; streak: number; jam: boolean;
  chapters: Chapter[] | null;
  recognizer: {kind: string; bpm?: number; pct?: number; prev?: number} | null;
  specBest: {best: number; runs: number; isNew: boolean; prev: number} | null;
  levelUp: {level: number; name: string; summit: boolean} | null;
  badgesNew: Badge[] | null; felt: FeltAnalysis | null; feltResult: FeltCredit | null;
  progression: string | null; style: string | null;
  ladder: {pathwayId: string; tiers: number[]; highestCleared: number} | null;
  results: ScoreSummary;
}
export interface CoachCandidate {fault: string; why: string; pathwayId: string}
export interface CoachContext {isBass?: boolean; curPw?: string | null; info?: Partial<RunInfo> | null; felt?: FeltAnalysis | null}
export interface CoachFocus {cat: string; streak: number}
export type MeterState = {show: false; hits?: never; total?: never}
  | {show: true; hits: number; total: number};
export interface ShareModel {
  lane: string; dur: string; eyebrow: string; hero: string; heroGreen: boolean; sub: string;
  stats: {label: string; value: string}[]; extra: string[];
}
export interface SessionLog {
  id: string; date: string; ts: number; mode: string; pathway_id: string | null;
  bpm: number | null; bpm_tier: number | null; scale: string | null; key: string | null;
  key_credit: string | null; tuning_offset: number; practice_type: string;
  authoredPractice: {pathwayId: string; tierIndex: number} | null;
  progression: string | null; style: string | null; hand_marks_on: boolean;
  content_ms: number; duration_ms: number; hit_count: number; miss_count: number; jam: boolean;
}
