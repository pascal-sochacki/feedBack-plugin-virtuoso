import assert from 'node:assert/strict';
import test from 'node:test';
import { NOTE_NAMES, NOTE_ALIASES, pcName, midiToFreq } from '../src/core/pitch.js';

test('pitch names retain sharp spelling and chromatic order', () => {
    assert.deepEqual(NOTE_NAMES, ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']);
    for (let pc = -48; pc < 60; pc++) {
        assert.equal(pcName(pc), NOTE_NAMES[((pc % 12) + 12) % 12]);
    }
});

test('all original enharmonic aliases retain their pitch classes', () => {
    assert.deepEqual(NOTE_ALIASES, {
        C: 0, 'B#': 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4,
        F: 5, 'E#': 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9,
        'A#': 10, Bb: 10, B: 11, Cb: 11,
    });
    assert.equal(NOTE_ALIASES.H, undefined);
    assert.equal(NOTE_ALIASES.db, undefined);
});

test('frequency conversion preserves A440, octave ratios, and fractional MIDI', () => {
    assert.equal(midiToFreq(69), 440);
    assert.equal(midiToFreq(57), 220);
    assert.equal(midiToFreq(81), 880);
    for (let midi = 0; midi <= 127; midi += 0.5) {
        assert.equal(midiToFreq(midi), 440 * Math.pow(2, (midi - 69) / 12));
    }
});

test('numeric edge behavior is unchanged rather than newly validated', () => {
    for (const pc of [NaN, Infinity, -Infinity, 0.5]) assert.equal(pcName(pc), undefined);
    assert.equal(pcName(-0), 'C');
    assert.ok(Number.isNaN(midiToFreq(NaN)));
    assert.equal(midiToFreq(Infinity), Infinity);
    assert.equal(midiToFreq(-Infinity), 0);
});

test('extraction preserves the existing mutable table contract', async () => {
    const again = await import('../src/core/pitch.js');
    assert.equal(again.NOTE_NAMES, NOTE_NAMES);
    assert.equal(again.NOTE_ALIASES, NOTE_ALIASES);
    assert.equal(Object.isFrozen(NOTE_NAMES), false);
    assert.equal(Object.isFrozen(NOTE_ALIASES), false);
    assert.equal(Object.getPrototypeOf(NOTE_ALIASES), Object.prototype);
    const original = NOTE_NAMES[0];
    try {
        NOTE_NAMES[0] = 'test';
        assert.equal(pcName(0), 'test');
    } finally {
        NOTE_NAMES[0] = original;
    }
});
