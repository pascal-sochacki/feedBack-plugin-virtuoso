// SPDX-License-Identifier: AGPL-3.0-only
import type {EntryNote} from './entry-data.js';
export interface JudgmentInfo {
  timingState?: string; timingError?: number; pitchState?: string; pitchError?: number;
}
// Span metadata is added only for tremolo groups; consumers must narrow it.
export interface JudgmentWindowBase {
  key: string; t: number; susEff: number; matchStart: number; matchEnd: number;
  exclStart: number; exclEnd: number; notes: EntryNote[]; pcs: Set<number>;
  sbx: number; credited: boolean; missDispatched?: boolean; missInfo?: JudgmentInfo;
  _detIds?: Set<string>;
}
export type SpanWindow = JudgmentWindowBase & {span: true; spanEnd: number; bktN: number; bkts: Set<number>};
export type JudgmentWindow = SpanWindow | (JudgmentWindowBase & {span?: false; spanEnd?: never; bktN?: never; bkts?: never});
