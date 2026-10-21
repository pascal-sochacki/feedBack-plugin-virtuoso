// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Developer-only contracts for the existing plain-data generation API.
 * @typedef {number | {deg?: number, semis?: number, q?: string, rn?: string}} Degree
 * @typedef {import('./positions.js').Position & {interval?: number | string, ho?: boolean, po?: boolean, tp?: boolean}} ChordPosition
 * @typedef {{name: string, displayName: string, arp: boolean, fingers: number[], frets: number[]}} ChordTemplate
 * @typedef {{t: number, id: number, hd: boolean, notes: Partial<import('./notes.js').Note>[]}} ChartChord
 * @typedef {{chord_id: number, start_time: number, end_time: number, arp: boolean}} HandShape
 * @typedef {{name: string, number: number, time: number}} Section
 * @typedef {{time: number, fret: number, width: number}} Anchor
 * @typedef {{time: number, measure: number, accent: string}} Beat
 * @typedef {BackingEvent | DrumEvent} AccompanimentEvent
 * @typedef {{notes: import('./notes.js').Note[], chords: ChartChord[], chordTemplates: ChordTemplate[], handShapes: HandShape[], sections: Section[], duration: number, anchors?: Anchor[], beats?: Beat[], backingEvents?: AccompanimentEvent[], timeline?: TimelineEvent[], humanSeed?: number}} Chart
 * @typedef {import('./positions.js').PositionConfig & import('./stroke-policy.js').StrokeConfig & import('./random.js').SeedConfig & {
 *   bars: number, meter: import('./timing.js').Meter & {grouping: number[]}, mode?: string,
 *   direction: string, sequence: string, repeatCount: number,
 *   chromaticPattern: string, pulseAccent: number,
 *   chordDepth: string, chordOverride: string, progression: string,
 *   tritoneSub?: string, shape: string, cagedShape: string, shapeDisplayName?: string,
 *   style?: string, voicingPosition?: string, shapeWalk?: boolean, strumPattern?: string, pimaPattern?: string,
 *   harmonicRhythm?: string,
 *   audioProfile?: string, audio?: {profile?: string, brightness?: number}, pathway?: string,
 *   densityTier?: string, backingDensity?: number, arrangementFeel?: string,
 *   backingPadDev?: boolean, backingStyle?: string, backingComp?: string, backingBass?: string, compCell?: string, bassFigure?: string,
 *   drums?: string, groove?: string, swing: string, motifCell?: string, motifPhase?: string,
 *   targetSec?: number | string | null, practiceFile?: unknown, practicePathwayId?: string,
 *   jamStyle?: string, jamPasses?: number, jamProgressionIdx?: number, jamSwitchUp?: boolean,
 *   jamEnergy?: string, jamBandMode?: string, jamSpotlight?: boolean, keyCycle?: string, keyCycleLength?: number,
 *   chordScaleStrategy?: string, sweepStrings?: number, sweepTopHopo?: boolean,
 *   harmonize?: boolean, tremolo?: boolean, tapArp?: boolean,
 *   voices?: string, walkApproach?: string, walkApproachMode?: string, walkPattern?: string, walkFeel?: string,
 *   rhTechMode?: string, rfoPattern?: string
 * }} GenerationConfig
 * @typedef {{bar: number, startSec: number, endSec: number, startBeat: number, durBeats: number, degree: Degree, rootPc: number, quality: string, intervals: number[], name: string, rn: string, fn: string, cpcs: number[], gpcs: number[], push?: number}} TimelineEvent
 * @typedef {{form: string, rootStr: number, notes: {s: number, fOff: number, iv: string, fg: number}[]}} StrumGrip
 * @typedef {{shape: string, rootFret: number, gripNotes: ChordPosition[], template: ChordTemplate}} ResolvedGrip
 * @typedef {{fixedShape?: string | null, economy?: boolean, walkGate?: boolean, prevMeanFret?: number}} GripOptions
 * @typedef {{a?: string, deg?: number, chr?: number, acc?: number, oct?: number, tgt?: string, stack?: MotifToken[]}} MotifToken
 * @typedef {MotifToken & {d: number, ho?: boolean, po?: boolean, vb?: boolean, ac?: boolean, mt?: boolean, pm?: boolean, bn?: number, bt?: number, sl?: number, slu?: number}} MotifStep
 * @typedef {{label: string, genres: string[], bars: number, bind: string, prog?: string, scale?: string, chordOverride?: string, range?: {loMidi: number, hiMidi: number}, noFold?: boolean, openPolicy?: string, maxSpan?: number, bpmCeiling?: number, startBeat?: number, rhythmScale?: number, steps: MotifStep[]}} MotifCell
 * @typedef {{id: string, cell?: string, role?: string, bus?: string, voice?: string, label?: string, padBus?: boolean}} Track
 * @typedef {{picks: {comp?: string, bass?: string, drums?: string}, ensemble: Record<string, string>, registers?: Record<string, number>, tracks?: Track[]}} ArrangementRecipe
 * @typedef {ArrangementRecipe & {tier: string, registers: Record<string, number>}} Arrangement
 * @typedef {{t: string, a: string, acc?: number, d?: string}} CompStep
 * @typedef {{div: number, bars: number, label: string, grid: ('.' | CompStep)[], vary?: ('.' | CompStep)[][], preSwing?: boolean, preSwung?: boolean, noSwing?: boolean}} CompCell
 * @typedef {{kind: string, div?: number, bars?: number, label: string, grid?: ('.' | {iv: number, acc?: number, g?: number, hold?: number})[]}} BassFigure
 * @typedef {{t: number, end: number, name: string, midis: number[], role?: string, vel?: number, fig?: string, noSwing?: boolean, track?: string, bus?: string, cpcs?: number[], gpcs?: number[], rn?: string, fn?: string, a?: string, comp?: string, padBus?: boolean}} BackingEvent
 * @typedef {{t: number, end: number, role: string, voice: string, velocity: number, accent: boolean, ghost: boolean, noSwing?: boolean, dur?: number}} DrumEvent
 * @typedef {{engine?: string, tone?: string, level?: number, sg?: boolean, amp?: string, role?: string, bank?: string}} AudioVoice
 * @typedef {{family?: string, harmony?: AudioVoice, notes?: AudioVoice, bass?: AudioVoice, pad?: AudioVoice | null, drums?: {kit?: string, level?: number}, brightness?: number, humanize?: number, drumHumanize?: number}} AudioProfile
 * @typedef {string | {pat: string, div?: number, vel?: number}} DrumLane
 * @typedef {{div: number, lanes: Record<string, DrumLane>, preSwung?: boolean, cellBars?: number, sig?: string, fillFamily?: string, fillEveryBars?: number, comp?: Record<string, DrumLane>[]}} DrumGroove
 * @typedef {{label: string, defaultKey: string, progressions: string[], leadScales: string[], chordDepth: string, chordOverride: string, guideTones: boolean, feel: {swing: string, backingStyle: string}, audioProfile: string}} StylePalette
 */
export {};
