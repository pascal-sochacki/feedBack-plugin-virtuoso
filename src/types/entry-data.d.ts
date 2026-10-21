// SPDX-License-Identifier: AGPL-3.0-only
import type {GenerationConfig, Chart} from '../core/generation-types.js';
import type {Note} from '../core/notes.js';
export type EntryAccompaniment = (import('../core/generation-types.js').BackingEvent & {voice?: never; velocity?: never; accent?: never; ghost?: never; dur?: never})
  | (import('../core/generation-types.js').DrumEvent & {
    name?: never; midis?: never; vel?: never; fig?: never; track?: never; bus?: never;
    cpcs?: never; gpcs?: never; rn?: never; fn?: never; a?: never; comp?: never; padBus?: never; rootPc?: never;
  });
export type EntryNote = Note & {_tail?: boolean};
export type EntryConfig = Omit<GenerationConfig, 'audio' | 'shapeDisplayName'> & {
  shapeDisplayName?: string | null;
  audio?: {profile?: string; brightness?: number; notes?: boolean; metronome?: boolean; harmony?: boolean; drums?: boolean};
  countInBars?: number; renderer?: string; sessionName?: string; sessionId?: string;
  bpmTier?: string; tempoTier?: string; tier?: string;
  setupLabel?: string; keyNominal?: string | null; anchorStation?: string | null;
  tuningOffset?: number; practicedPathwayId?: string | null;
  practicePathwayCredit?: {pathwayId: string; tierIndex: number};
  practiceFileId?: string;
};
export type EntryBeat = import('../core/generation-types.js').Beat & {brk?: boolean; brkSub?: number; _tail?: boolean};
export type EntryChart = Omit<Chart, 'notes' | 'backingEvents' | 'beats'> & {
  notes: EntryNote[];
  beats?: EntryBeat[];
  backingEvents?: EntryAccompaniment[];
  leadIn?: number;
  segmentBounds?: import('../core/session-types.js').SegmentBound[] | null;
};
export interface GuideToneProof {changes: number; landings: number; rootRestarts: number; ratio: number}
export interface EntryBundle {
  proofMeta?: GuideToneProof | null;
  currentTime: number;
  songInfo: {title: string; artist: string; arrangement: string; tuning: number[]; capo: number; duration: number; format: string; fretboardSystem?: string};
  config: EntryConfig; finiteRun: boolean; isReady: boolean;
  notes: EntryNote[]; chords: Chart['chords']; anchors: Chart['anchors']; beats: EntryBeat[] | undefined;
  sections: Chart['sections']; chordTemplates: Chart['chordTemplates']; handShapes: Chart['handShapes'];
  segmentBounds: import('../core/session-types.js').SegmentBound[] | null;
  timeline: Chart['timeline'] | null; leadIn: number; backingEvents: EntryAccompaniment[];
  stringCount: number; tuning: number[]; openMidis: number[]; capo: number;
  lyrics: string[]; toneChanges: object[]; toneBase: string; drumTab: null;
  mastery: number; hasPhraseData: boolean; inverted: boolean; lefty: boolean;
  renderScale: number; lyricsVisible: boolean; project: null; fretX: null;
  getNoteState: (note: EntryNote) => 'hit' | 'miss' | 'active' | {state: string; live: boolean; alpha: number} | null;
  getNoteStateProvider: () => EntryBundle['getNoteState'] | null;
  // Legacy bundles could attach the raw borrowed chart/session; only defensive
  // fallbacks read them, tolerating either timeline event shape.
  chart?: {timeline?: Chart['timeline']};
  session?: {segments?: Array<{config?: EntryConfig}>};
}
export interface EntryExercise {version: number; session: EntryConfig; chart: EntryChart}
export interface OverviewBand {name: string; rn?: string; start: number; end: number; color: string; chord?: boolean}
export type JumpingTabBundle = import('../shell/renderers/renderer-types.js').RenderBundle & {
  backingEvents?: EntryAccompaniment[];
};
