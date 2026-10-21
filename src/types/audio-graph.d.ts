// SPDX-License-Identifier: AGPL-3.0-only
export interface AmpPreset {
  label: string; preHp: number; drive: number; curve: string; makeup: number;
  preMid?: [number, number, number];
  post: [BiquadFilterType, number, number, number][];
  noCab?: boolean; ir?: string; comp?: [number, number, number, number];
}
export interface AudioBus {
  ctx: AudioContext; master: GainNode; limiter: DynamicsCompressorNode;
  backingGroup: GainNode; masterAnalyser: AnalyserNode;
  tracks: Record<string, GainNode>; panners: Record<string, StereoPannerNode>;
  analysers: Record<string, AnalyserNode>;
  reverb?: ConvolverNode; synthPlate?: DelayNode; synthChorus?: GainNode;
  voiceIn?: Record<string, GainNode>;
  amps?: Record<string, {id: string; nodes: AudioNode[]; makeup?: GainNode}>;
  fx?: {drums?: DrumBusEffects} & Record<string, MelodicBusEffects | DrumBusEffects>;
}
export interface MelodicBusEffects {
  send: GainNode; carve: BiquadFilterNode;
  loShelf?: never; hiShelf?: never; comp?: never;
}
export interface DrumBusEffects {
  send: GainNode; loShelf: BiquadFilterNode; hiShelf: BiquadFilterNode; comp: DynamicsCompressorNode;
  carve?: never;
}
export interface MixRecipe {
  level: Record<string, number>; pan: Record<string, number>; send: Record<string, number>;
  carve: {harmonyHP?: number; padHP?: number; bassLP?: number}; masterTrim: number;
  drumkit: {loShelf?: {f: number; dB: number}; hiShelf?: {dB: number};
    compRatio?: number; compThr?: number} | null;
}
export interface MixerChannelState {
  level: number; pan: number; mute: boolean; solo: boolean;
  instrument: string | null; kit: string | null; amp: string | null;
}
export interface SampleBank {
  kcs: number[]; rr: number; bright: number; amped?: boolean; tune?: number;
  velLayers: {tag: string | number; maxVel: number}[] | null;
  file: (keycenter: number, layer: string | number | null, roundRobin: number) => string;
}
export type ScheduledResource = (AudioNode & {stop?: (when?: number) => void}) | {stop: (when?: number) => void; disconnect: () => void};
export interface MixerChannel {
  key: string; label: string; backing?: boolean; instr?: 'melodic' | 'bass';
  amp?: boolean; pan?: number; group: string; kit?: boolean;
  dynamic?: boolean; role?: string; trackLabel?: string;
}
export interface DrumBank {src: Record<string, string>; rr: Record<string, number>; file: (token: string, take: number) => string}
export type DrumKit = {engine: 'sample'; pieces: Record<string, number>; bank?: string; font?: string; variant?: number; level?: number; preset?: never}
  | {engine: 'synth'; preset: string; level?: number; pieces?: never; bank?: never; font?: never; variant?: never};
