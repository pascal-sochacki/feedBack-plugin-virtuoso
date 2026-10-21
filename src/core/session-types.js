// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Authored inputs differ from resolved builder cfg (notably meter/shape).
 * @typedef {Partial<Omit<import('./generation-types.js').GenerationConfig, 'meter' | 'shape' | 'customOpenMidis' | 'audio' | 'shapeDisplayName'>> & {meter?: string | import('./timing.js').Meter, shape?: string | number | null, shapeDisplayName?: string | null, bendTarget?: string, customOpenMidis?: string | number[], audio?: {notes?: boolean, metronome?: boolean, harmony?: boolean}}} SegmentConfig
 * @typedef {{enabled?: boolean, bpmStart?: number, bpmTarget?: number, bpmStep?: number, repsPerStep?: number}} BpmLadder
 * @typedef {{enabled?: boolean, strategy?: string, keysPerSession?: number}} KeyCycle
 * @typedef {{id?: string, name?: string, kind?: string, role?: string, templateId?: string, variantIdx?: number, locks?: Record<string, boolean>, config?: SegmentConfig, bpmLadder?: BpmLadder, keyCycle?: KeyCycle, targetSec?: number | string | null, _added?: boolean}} Segment
 * @typedef {{version?: number, name?: string, stringSetup?: string, customOpenMidis?: string | number[], interBlockBreak?: string, countInBars?: number, bpmLadder?: BpmLadder, keyCycle?: KeyCycle, segments?: Segment[]}} Session
 * @typedef {{id?: string, label?: string, kind: string, role: string, band: string, instrument: string, style?: string | null, competency?: string, creditsPathway?: string, base?: SegmentConfig, vary?: SegmentConfig[], targetSec?: number}} SegmentTemplate
 * @typedef {{name?: string, kind?: string, role: string | null, competency: string, templateId: string | null, variantIdx: number | null, added: boolean, key: string | null, bpm: number | null, barSec: number, start: number, end: number}} SegmentBound
 * @typedef {import('./generation-types.js').Chart & {segmentBounds: SegmentBound[]}} SessionChart
 */
export {};
