import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { CHORD_FORMULAS, DIATONIC_QUALITIES } from '../src/core/chord-theory.js';

test('fresh chord theory import is host-independent', () => {
  const url = new URL('../src/core/chord-theory.js', import.meta.url).href;
  execFileSync(process.execPath, ['--input-type=module', '-e', `
    for (const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext']) {
      Object.defineProperty(globalThis, name, { get() { throw new Error(name); } });
    }
    const theory = await import(${JSON.stringify(url)});
    if (Object.keys(theory.CHORD_FORMULAS).length !== 27) throw new Error('registry drift');
  `]);
});

test('entire chord quality registry preserves symbols and full extension stacks', () => {
  assert.deepEqual(CHORD_FORMULAS, {
    maj:{symbol:'maj', intervals:[0,4,7]}, min:{symbol:'min', intervals:[0,3,7]}, dim:{symbol:'dim', intervals:[0,3,6]}, aug:{symbol:'aug', intervals:[0,4,8]},
    '5':{symbol:'5', intervals:[0,7]}, '5oct':{symbol:'5', intervals:[0,7,12]},
    sus2:{symbol:'sus2', intervals:[0,2,7]}, sus4:{symbol:'sus4', intervals:[0,5,7]},
    '6':{symbol:'6', intervals:[0,4,7,9]}, min6:{symbol:'m6', intervals:[0,3,7,9]},
    add9:{symbol:'add9', intervals:[0,4,7,14]}, '69':{symbol:'6/9', intervals:[0,4,7,9,14]},
    maj7:{symbol:'maj7', intervals:[0,4,7,11]}, min7:{symbol:'min7', intervals:[0,3,7,10]}, dom7:{symbol:'7', intervals:[0,4,7,10]},
    min7b5:{symbol:'m7b5', intervals:[0,3,6,10]}, dim7:{symbol:'dim7', intervals:[0,3,6,9]}, min_maj7:{symbol:'m(maj7)', intervals:[0,3,7,11]},
    maj9:{symbol:'maj9', intervals:[0,4,7,11,14]}, min9:{symbol:'m9', intervals:[0,3,7,10,14]}, dom9:{symbol:'9', intervals:[0,4,7,10,14]},
    maj11:{symbol:'maj11', intervals:[0,4,7,11,14,17]}, min11:{symbol:'m11', intervals:[0,3,7,10,14,17]}, dom11:{symbol:'11', intervals:[0,4,7,10,14,17]},
    maj13:{symbol:'maj13', intervals:[0,4,7,11,14,21]}, min13:{symbol:'m13', intervals:[0,3,7,10,14,21]}, dom13:{symbol:'13', intervals:[0,4,7,10,14,21]}
  });
});

test('all nine diatonic rows retain their hand-authored qualities without theory corrections', () => {
  assert.deepEqual(DIATONIC_QUALITIES, {
    major:{triad:['maj','min','min','maj','maj','min','dim'], seventh:['maj7','min7','min7','maj7','dom7','min7','min7b5']},
    dorian:{triad:['min','min','maj','maj','min','dim','maj'], seventh:['min7','min7','maj7','dom7','min7','min7b5','maj7']},
    phrygian:{triad:['min','maj','maj','min','dim','maj','min'], seventh:['min7','maj7','dom7','min7','min7b5','maj7','min7']},
    lydian:{triad:['maj','maj','min','dim','maj','min','min'], seventh:['maj7','dom7','min7','min7b5','maj7','min7','min7']},
    mixolydian:{triad:['maj','min','dim','maj','min','min','maj'], seventh:['dom7','min7','min7b5','maj7','min7','min7','maj7']},
    natural_minor:{triad:['min','dim','maj','min','min','maj','maj'], seventh:['min7','min7b5','maj7','min7','min7','maj7','dom7']},
    locrian:{triad:['dim','maj','min','min','maj','maj','min'], seventh:['min7b5','maj7','min7','min7','maj7','dom7','min7']},
    harmonic_minor:{triad:['min','dim','aug','min','maj','maj','dim'], seventh:['min7','min7b5','maj7','min7','dom7','maj7','dim7']},
    melodic_minor:{triad:['min','min','aug','maj','maj','dim','dim'], seventh:['min7','min7','maj7','dom7','dom7','min7b5','min7b5']}
  });
  for (const row of Object.values(DIATONIC_QUALITIES)) {
    for (const qualities of Object.values(row)) {
      assert.equal(qualities.length, 7);
      assert.ok(qualities.every(q => Object.hasOwn(CHORD_FORMULAS, q)));
    }
  }
});

test('chord registries share mutable ordinary objects and arrays, including synthetic qualities', async () => {
  const again = await import('../src/core/chord-theory.js');
  for (const table of [CHORD_FORMULAS, DIATONIC_QUALITIES]) {
    assert.equal(Object.getPrototypeOf(table), Object.prototype);
    assert.equal(Object.isFrozen(table), false);
  }
  assert.equal(again.CHORD_FORMULAS, CHORD_FORMULAS);
  assert.equal(again.DIATONIC_QUALITIES, DIATONIC_QUALITIES);
  assert.equal(again.CHORD_FORMULAS.maj.intervals, CHORD_FORMULAS.maj.intervals);
  assert.equal(again.DIATONIC_QUALITIES.major.triad, DIATONIC_QUALITIES.major.triad);
  assert.notEqual(CHORD_FORMULAS.min6.intervals, CHORD_FORMULAS['6'].intervals);
  try {
    CHORD_FORMULAS.maj.intervals.push(14);
    DIATONIC_QUALITIES.major.triad[0] = 'aug';
    CHORD_FORMULAS.test_synthetic = {symbol:'test', intervals:[0,4,7,11,14,17,21], mode:'lydian'};
    assert.equal(again.CHORD_FORMULAS.maj.intervals.at(-1), 14);
    assert.equal(again.DIATONIC_QUALITIES.major.triad[0], 'aug');
    assert.equal(again.CHORD_FORMULAS.test_synthetic, CHORD_FORMULAS.test_synthetic);
    assert.equal(DIATONIC_QUALITIES.lydian.triad[0], 'maj');
  } finally {
    CHORD_FORMULAS.maj.intervals.pop();
    DIATONIC_QUALITIES.major.triad[0] = 'maj';
    delete CHORD_FORMULAS.test_synthetic;
  }
  assert.equal(CHORD_FORMULAS.unknown_quality, undefined);
});
