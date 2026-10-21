// SPDX-License-Identifier: AGPL-3.0-only
// Consumer subset verified against vendor/webaudiofont-src/npm/src/{otypes,player}.ts.
export interface WaveZone {
  keyRangeLow: number; keyRangeHigh: number; originalPitch: number;
  coarseTune: number; fineTune: number; loopStart: number; loopEnd: number;
  sampleRate: number; buffer?: AudioBuffer; delay?: number;
  sample?: string; file?: string; sustain?: number;
  ahdsr?: boolean | {duration: number; volume: number}[];
}
export interface WavePreset {zones: WaveZone[]}
export interface WaveEnvelope {
  gain: AudioParam;
  audioBufferSourceNode?: AudioBufferSourceNode | null;
  target: AudioNode; when: number; duration: number; cancel: () => void;
  pitch: number; preset: WavePreset;
}
export interface WafPlayer {
  adjustPreset(ctx: AudioContext, preset: WavePreset): void;
  queueWaveTable(ctx: AudioContext, target: AudioNode, preset: WavePreset, when: number,
    pitch: number, duration: number, volume?: number,
    slides?: {when: number; delta: number}[]): WaveEnvelope | null;
  cancelQueue(ctx: AudioContext): void;
}
declare global {
  var WebAudioFontPlayer: {new(): WafPlayer};
  interface Window {
    [preset: `_tone_${string}`]: WavePreset | undefined;
    [preset: `_drum_${string}`]: WavePreset | undefined;
  }
}
