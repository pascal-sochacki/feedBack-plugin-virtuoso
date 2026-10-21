// SPDX-License-Identifier: AGPL-3.0-only
// Read-only eef58c88: lib/routers/tunings.py and tuner/utils/ui.js, 2026-10-21.
export type HostTuningTable = Record<string, Record<string, number[]>>;
export interface HostSettingsInput {instrument?: unknown; string_count?: unknown; tuning?: unknown; pathway?: string}
export interface TunerFrame {note: string | null; cents: number; freq: number; hasSignal: boolean}
declare global {
  interface AudioContext {
    // Optional browser capability, guarded by typeof at the existing caller.
    setSinkId?: (sinkId: string) => Promise<void>;
  }
  interface Window {
    tuner?: {toggle?: () => void | Promise<void>};
    // Only the guarded legacy caller exists in eef58c88; no publisher was found.
    _tunerReloadConfig?: () => unknown;
    v3Progression?: {get?: () => {mastery_rank?: string} | null};
  }
}
