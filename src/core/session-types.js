// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Authored inputs differ from resolved builder cfg (notably meter/shape).
 * @typedef {Partial<Omit<import('./generation-types.js').GenerationConfig, 'meter' | 'shape' | 'customOpenMidis' | 'audio' | 'shapeDisplayName'>> & {meter?: string | import('./timing.js').Meter, shape?: string | number | null, shapeDisplayName?: string | null, bendTarget?: string, renderer?: string, advancedMode?: boolean, spiderPair?: string, anchor?: string, anchorFret?: number, hertaAccent?: number, hertaWalk?: boolean, pulseOffbeat?: boolean, customOpenMidis?: string | number[], audio?: {notes?: boolean, metronome?: boolean, harmony?: boolean}}} SegmentConfig
 * @typedef {{enabled?: boolean, bpmStart?: number, bpmTarget?: number, bpmStep?: number, repsPerStep?: number}} BpmLadder
 * @typedef {{enabled?: boolean, strategy?: string, keysPerSession?: number}} KeyCycle
 * @typedef {{id?: string, name?: string, kind?: string, role?: string, templateId?: string, practiceId?: string, practiceFile?: import('./practice-files.js').Practice, practicePath?: string, practiceFilePath?: string, stringSetup?: string, bpm?: number | null, variantIdx?: number, locks?: Record<string, boolean>, config?: SegmentConfig, bpmLadder?: BpmLadder, keyCycle?: KeyCycle, targetSec?: number | string | null, applicabilityError?: string, _added?: boolean}} Segment
 * @typedef {{version?: number, name?: string, stringSetup?: string, customOpenMidis?: string | number[], interBlockBreak?: string, countInBars?: number, bpmLadder?: BpmLadder, keyCycle?: KeyCycle, segments?: Segment[]}} Session
 * @typedef {{applicability?: string[], standardOnly?: boolean, genre?: string, skill?: string, band?: string, instrument?: string, instAgnostic?: boolean}} SegmentMetadata
 * `style` may be descriptive genre metadata; only `paletteLock` applies its STYLE_PALETTES defaults.
 * @typedef {{id?: string, label?: string, kind: string, role: string, band: string, instrument: string, style?: string | null, paletteLock?: boolean, competency?: string, creditsPathway?: string, practiceId?: string, practicePath?: string, practiceFilePath?: string, practice?: import('./practice-files.js').Practice, metadata?: SegmentMetadata, base?: SegmentConfig, vary?: SegmentConfig[], targetSec?: number}} SegmentTemplate
 * @typedef {{name?: string, kind?: string, role: string | null, competency: string, templateId: string | null, variantIdx: number | null, added: boolean, key: string | null, bpm: number | null, barSec: number, start: number, end: number}} SegmentBound
 * @typedef {import('./generation-types.js').Chart & {segmentBounds: SegmentBound[]}} SessionChart
 */
export {};
