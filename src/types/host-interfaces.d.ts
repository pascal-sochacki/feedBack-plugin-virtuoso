// SPDX-License-Identifier: AGPL-3.0-only
// Read-only host evidence: eef58c88 (2026-10-21), static/app.js and
// plugins/minigames/screen.js. Capabilities may publish late or be absent.
export interface HostBus {
  navigate?: (screenId: string, params?: object) => void;
  emit?: (event: string, detail?: unknown) => void;
  on?: {
    (event: 'tuner:frame', listener: (event: CustomEvent<import('./host-data.js').TunerFrame>) => void, options?: AddEventListenerOptions | boolean): void;
    (event: 'screen:changed', listener: (event: CustomEvent<{id: string}>) => void, options?: AddEventListenerOptions | boolean): void;
    (event: string, listener: EventListener, options?: AddEventListenerOptions | boolean): void;
  };
  off?: (event: string, listener: EventListener, options?: EventListenerOptions | boolean) => void;
  workingTuning?: { setCurrentInstrument?: (instrument: string, stringCount: number) => void };
}
export interface PitchFrame {
  freqHz: number; midiFloat: number; cents: number; confidence: number;
  tMs: number; expectedBaseFreqHz: number | null;
}
export interface ContinuousPitchHandle {
  on(event: 'pitch', callback: (frame: PitchFrame) => void): ContinuousPitchHandle;
  on(event: 'end', callback: (result: {reason: string; error?: unknown}) => void): ContinuousPitchHandle;
  stop(): void;
  isRunning(): boolean;
}
export interface HostMinigames {
  __alive?: boolean;
  scoring?: { createContinuous?: (options?: { expectedBaseFreqHz?: number; smoothingMs?: number }) => ContinuousPitchHandle };
}
// Desktop source 00653cf4, src/main/preload.ts (2026-10-21), corroborated by
// host static/js/juce-audio.js. Consumer subset, not a running-host version floor.
export interface HostDesktop {
  audio?: {
    isAudioRunning?: () => boolean | Promise<boolean>;
    getCurrentDevice?: () => Promise<{output?: string} | null>;
    getLevels?: () => Promise<{inputLevel: number; outputLevel?: number} | null>;
  };
  // preload forwards IPC; main.ts:1384–1386 performs the action without a return.
  power?: { setScreenAwake?: (keep: boolean) => Promise<void> };
}
// note_detect source 412433de, screen.js:18094–18183 (2026-10-21).
export interface VerifyTarget {s: number; f: number; ho?: boolean; po?: boolean; b?: boolean; sl?: boolean; hm?: boolean}
export interface VerifyContext {
  arrangement?: string; openMidis?: number[]; tuning?: number[]; offsets?: number[];
  capo?: number; stringCount?: number;
}
export interface ContainedVerdict {
  id: string; detected: boolean; detectedSongTime: number; centsError: number; snr: number;
}
export interface NoteDetect {
  setVerifyTarget?: (notes: VerifyTarget[] | null, context?: VerifyContext | null) => void;
  isContainedVerifierAvailable?: () => boolean;
  setContainedChart?: (notes: (VerifyTarget & {id: string; t: number; sus?: number})[], context?: VerifyContext | null) => Promise<boolean | null>;
  pushContainedPlayhead?: (time: number, playing: boolean) => Promise<void>;
  drainContainedVerdicts?: () => ContainedVerdict[];
  releaseContainedChart?: () => Promise<void>;
  isEnabled?: () => boolean;
  enable?: () => Promise<boolean>;
  disable?: (options?: {silent?: boolean}) => void;
}
declare global {
  interface Window {
    clipboardData?: DataTransfer;
    feedBack?: HostBus;
    slopsmith?: HostBus;
    feedBackMinigames?: HostMinigames;
    slopsmithMinigames?: HostMinigames;
    feedBackDesktop?: HostDesktop;
    slopsmithDesktop?: HostDesktop;
    showScreen?: (screenId: string) => void;
    webkitAudioContext?: typeof AudioContext;
    noteDetect?: NoteDetect;
  }
}
