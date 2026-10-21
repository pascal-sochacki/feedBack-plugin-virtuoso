// SPDX-License-Identifier: AGPL-3.0-only
import { NOTE_ALIASES } from '../../core/pitch.js';
import { SCALE_INTERVALS } from '../../core/scale-intervals.js';

const LETTERS = 'CDEFGAB';
export const STAFF_NATURALS = [0, 2, 4, 5, 7, 9, 11];
/** @type {Record<string, number>} */
const SIGNATURES = {C:0,'C#':7,Db:-5,D:2,Eb:-3,E:4,F:-1,'F#':6,Gb:-6,G:1,Ab:-4,A:3,Bb:-2,B:5,Cb:-7};
// Chromatic and letter offsets preserve modal spelling, not just pitch class.
/** @type {Record<string, number[]>} */
const PARENTS = {
  natural_minor:[3,2], harmonic_minor:[3,2], melodic_minor:[3,2],
  dorian:[-2,-1], phrygian:[-4,-2], lydian:[-5,-3], mixolydian:[-7,-4], locrian:[1,1],
  // Retain the existing signature conventions for non-diatonic scale blueprints.
  dorian_b2:[-2,-1], lydian_augmented:[1,-3], lydian_dominant:[2,1],
  mixolydian_b6:[-1,-4], locrian_sharp2:[-5,1], altered:[-6,-4], phrygian_dominant:[-3,-2],
};
/** @param {number} n */
const pc = n => (n % 12 + 12) % 12;

/** Display-only policy; theoretical signatures beyond seven normalize enharmonically.
 * @param {string} key @param {string} scale */
export function resolveNotationKey(key, scale) {
  if (!Object.hasOwn(NOTE_ALIASES, key)) key = 'C';
  const root = NOTE_ALIASES[key];
  const [chromatic, degree] = PARENTS[scale] || [0,0];
  const parentPc = pc(root + chromatic);
  const parentLetter = (LETTERS.indexOf(key[0]) + degree + 7) % 7;
  const candidates = Object.keys(SIGNATURES).filter(name => NOTE_ALIASES[name] === parentPc);
  const name = candidates.find(name => LETTERS.indexOf(name[0]) === parentLetter)
    || candidates.sort((a,b) => Math.abs(SIGNATURES[a]) - Math.abs(SIGNATURES[b]))[0];
  const numAcc = SIGNATURES[name];
  const alterations = [0,0,0,0,0,0,0];
  const order = numAcc < 0 ? [6,2,5,1,4,0,3] : [3,0,4,1,5,2,6];
  for (let i=0;i<Math.abs(numAcc);i++) alterations[order[i]] = Math.sign(numAcc);
  const spellings = Array.from({length:12}, (_, pitch) => {
    const natural = STAFF_NATURALS.indexOf(pitch);
    if (natural >= 0) return [natural,0];
    const letter = STAFF_NATURALS.findIndex(n => pc(n + (numAcc < 0 ? -1 : 1)) === pitch);
    return [letter,numAcc < 0 ? -1 : 1];
  });
  for (let letter=0;letter<7;letter++) spellings[pc(STAFF_NATURALS[letter] + alterations[letter])] = [letter,alterations[letter]];
   // Legacy blueprint parent offsets select signatures, not the configured tonic's letter.
  const intervals = SCALE_INTERVALS[scale];
  if (intervals?.length === 7) {
     const tonicLetter = LETTERS.indexOf(key[0]);
    for (let i=0;i<7;i++) {
      const letter = (tonicLetter + i) % 7;
      const pitch = pc(root + intervals[i]);
      const alter = (pitch - STAFF_NATURALS[letter] + 18) % 12 - 6;
      // Double accidentals are outside this renderer's glyph vocabulary.
      if (Math.abs(alter) <= 1) spellings[pitch] = [letter,alter];
    }
  }
  return {name,numAcc,spellings};
}
