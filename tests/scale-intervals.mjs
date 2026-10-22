import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { SCALE_INTERVALS } from '../src/core/scale-intervals.js';

test('fresh real leaf import is import-time host-independent', () => {
  const url = new URL('../src/core/scale-intervals.js', import.meta.url).href;
  execFileSync(process.execPath, ['--input-type=module', '-e', `
    for (const name of ['window','document','localStorage','fetch','sessionStorage']) {
      Object.defineProperty(globalThis, name, { get() { throw new Error(name); } });
    }
    const { SCALE_INTERVALS } = await import(${JSON.stringify(url)});
    if (Object.keys(SCALE_INTERVALS).length !== 28) throw new Error('registry drift');
  `]);
});

test('all 28 scale interval sequences retain exact baseline values', () => {
  assert.deepEqual(SCALE_INTERVALS, {
    major:[0,2,4,5,7,9,11], natural_minor:[0,2,3,5,7,8,10], harmonic_minor:[0,2,3,5,7,8,11],
    melodic_minor:[0,2,3,5,7,9,11],
    minor_pentatonic:[0,3,5,7,10], major_pentatonic:[0,2,4,7,9], blues:[0,3,5,6,7,10],
    bebop_major:[0,2,4,5,7,8,9,11], bebop_dominant:[0,2,4,5,7,9,10,11], bebop_dorian:[0,2,3,4,5,7,9,10],
    dorian:[0,2,3,5,7,9,10], phrygian:[0,1,3,5,7,8,10], lydian:[0,2,4,6,7,9,11],
    mixolydian:[0,2,4,5,7,9,10], locrian:[0,1,3,5,6,8,10],
    phrygian_dominant:[0,1,4,5,7,8,10], lydian_dominant:[0,2,4,6,7,9,10],
    whole_tone:[0,2,4,6,8,10], diminished:[0,2,3,5,6,8,9,11],
    dorian_b2:[0,1,3,5,7,9,10], lydian_augmented:[0,2,4,6,8,9,11], mixolydian_b6:[0,2,4,5,7,8,10],
    locrian_sharp2:[0,2,3,5,6,8,10], altered:[0,1,3,4,6,8,10], half_whole_dim:[0,1,3,4,6,7,9,10],
    double_harmonic:[0,1,4,5,7,8,11], hungarian_minor:[0,2,3,6,7,8,11], neapolitan_minor:[0,1,3,5,7,8,11],
  });
});

test('scale registers remain ordered unique semitones and diatonic modes rotate', () => {
  assert.equal(Object.keys(SCALE_INTERVALS).length, 28);
  for (const intervals of Object.values(SCALE_INTERVALS)) {
    assert.equal(intervals[0], 0);
    assert.ok(intervals.every((value, i) => Number.isInteger(value) && value < 12 && (!i || value > intervals[i-1])));
    assert.equal(new Set(intervals).size, intervals.length);
  }
  const modes = ['major','dorian','phrygian','lydian','mixolydian','natural_minor','locrian'];
  for (const [i, mode] of modes.entries()) {
    const major = SCALE_INTERVALS.major;
    assert.deepEqual(SCALE_INTERVALS[mode], major.map((_, j) => (major[(i+j)%7] - major[i] + 12) % 12));
  }
});

test('real imports share ordinary mutable table and array identities without aliasing scales', async () => {
  const again = await import('../src/core/scale-intervals.js');
  assert.equal(again.SCALE_INTERVALS, SCALE_INTERVALS);
  assert.equal(again.SCALE_INTERVALS.major, SCALE_INTERVALS.major);
  assert.equal(Object.getPrototypeOf(SCALE_INTERVALS), Object.prototype);
  assert.equal(Object.isFrozen(SCALE_INTERVALS), false);
  assert.notEqual(SCALE_INTERVALS.major, SCALE_INTERVALS.melodic_minor);
  const original = SCALE_INTERVALS.major[1];
  try {
    SCALE_INTERVALS.major[1] = 1;
    assert.equal(again.SCALE_INTERVALS.major[1], 1);
    assert.equal(SCALE_INTERVALS.melodic_minor[1], 2);
  } finally { SCALE_INTERVALS.major[1] = original; }
  assert.equal(SCALE_INTERVALS.unknown_scale, undefined);
});
