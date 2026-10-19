// @ts-check

/** @type {string[]} */
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** @type {Record<string, number>} */
export const NOTE_ALIASES = { C:0, 'B#':0, 'C#':1, Db:1, D:2, 'D#':3, Eb:3, E:4, Fb:4, F:5, 'E#':5, 'F#':6, Gb:6, G:7, 'G#':8, Ab:8, A:9, 'A#':10, Bb:10, B:11, Cb:11 };

/** @param {number} pc */
export function pcName(pc) { return NOTE_NAMES[((pc % 12) + 12) % 12]; }

/** @param {number} midi */
export function midiToFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
