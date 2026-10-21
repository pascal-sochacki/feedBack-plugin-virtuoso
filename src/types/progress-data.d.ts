// SPDX-License-Identifier: AGPL-3.0-only
// Internal writer contracts do not validate the legacy JSON.parse reader.
export interface ProgressNode {
  reps: number; depth: {travel: number | null; clean: number | null; eyesOff: number | null};
  masteredAt: number | null; keysCleared: string[];
}
export interface TierRecord {highest_tier?: number; bestBpm?: number; feltBpm?: number}
export interface Routine {id: string; name?: string; kind: 'workout'; config: import('../core/session-types.js').Session}
