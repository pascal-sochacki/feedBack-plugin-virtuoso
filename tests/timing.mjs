import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { RHYTHM_CELLS, parseMeter, secondsPerDivision, rhythmSteps, measureSeconds } from '../src/core/timing.js';

test('fresh timing import and calls need no renderer, audio or host', () => {
  const url = new URL('../src/core/timing.js', import.meta.url).href;
  execFileSync(process.execPath, ['--input-type=module', '-e', `
    for (const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext']) {
      Object.defineProperty(globalThis, name, { get() { throw new Error(name); } });
    }
    const t = await import(${JSON.stringify(url)});
    const cfg = {bpm:120, meter:t.parseMeter('7/8:2+2+3'), subdivision:'gallop'};
    if (t.measureSeconds(cfg) !== 1.75 || t.secondsPerDivision(cfg) !== 0.25 || t.rhythmSteps(cfg).length !== 3) throw new Error('timing drift');
  `]);
});

test('meter parsing preserves defaults, grouping, partial integers and malformed NaN', () => {
  for (const value of [undefined, null, '', false, 0, NaN]) {
    assert.deepEqual(parseMeter(value), {numerator:4, denominator:4, grouping:[4]});
  }
  for (const [value, expected] of [
    ['4/4', [4,4,[4]]], ['6/8', [6,8,[6]]], ['7/8:2+2+3', [7,8,[2,2,3]]],
    ['5/8:3+2', [5,8,[3,2]]], ['7/8:bad', [7,8,[7]]],
    ['7/8:2+bad+-1+0+3junk:ignored', [7,8,[2,-1,0,3]]],
    ['0/-8', [1,1,[1]]], ['/8', [4,8,[4]]], ['3/', [3,4,[3]]],
    ['3.9/8junk', [3,8,[3]]], ['bad/nope', [NaN,NaN,[NaN]]],
    ['7/nope:2+5', [7,NaN,[2,5]]], [true, [NaN,4,[NaN]]],
    [{toString:() => '9/8:3+3+3'}, [9,8,[3,3,3]]]
  ]) {
    const [numerator, denominator, grouping] = expected;
    assert.deepEqual(parseMeter(value), {numerator, denominator, grouping}, String(value));
  }
});

test('division and bar durations retain quarter BPM semantics in simple, compound and odd meters', () => {
  const divisions = {quarter:0.5, eighth:0.25, sixteenth:0.125, triplet:0.5/3, eighth_triplet:0.5/3, sixteenth_triplet:0.5/6, gallop:0.25, reverse_gallop:0.25, unknown:0.25};
  for (const [meter, duration] of [['4/4',2], ['6/8',1.5], ['7/8:2+2+3',1.75], ['5/4',2.5], ['3/2',3]]) {
    for (const [subdivision, seconds] of Object.entries(divisions)) {
      for (const swing of ['straight','swing','shuffle']) {
        const cfg = {bpm:120, meter:parseMeter(meter), subdivision, swing};
        assert.equal(secondsPerDivision(cfg), seconds);
        assert.equal(measureSeconds(cfg), duration);
        if (!Object.hasOwn(RHYTHM_CELLS, subdivision)) assert.equal(rhythmSteps(cfg), null);
      }
    }
  }
});

test('all nine rhythm cells preserve quarter-beat arrays, strokes and accent metadata', () => {
  const expected = {
    gallop:[0.5,0.25,0.25], reverse_gallop:[0.25,0.25,0.5], skip_chug:[0.75,0.25], snap:[0.25,0.75],
    herta_chug:[0.25,0.125,0.125,0.25, 0.25,0.125,0.125,0.25, 0.25,0.125,0.125,0.25, 0.25,0.125,0.125,0.25],
    tresillo:[1.5,1.5,1], son_clave:[1.5,1.5,2,1,2], rumba_clave:[1.5,2,1.5,1,2], habanera:[1.5,0.5,1,1]
  };
  assert.deepEqual(Object.keys(RHYTHM_CELLS), Object.keys(expected));
  for (const [subdivision, beats] of Object.entries(expected)) {
    assert.deepEqual(RHYTHM_CELLS[subdivision].beats, beats);
    assert.equal(Number.isInteger(beats.reduce((a,b) => a+b, 0)), true);
    for (const meter of ['4/4','6/8','7/8:2+2+3']) {
      const cfg = {bpm:120, subdivision, meter:parseMeter(meter), swing:'shuffle'};
      assert.deepEqual(rhythmSteps(cfg), beats.map(b => b * 0.5));
      assert.notEqual(rhythmSteps(cfg), rhythmSteps(cfg));
    }
  }
  assert.deepEqual(RHYTHM_CELLS.gallop.strokes, ['d','d','u']);
  assert.deepEqual(RHYTHM_CELLS.reverse_gallop.strokes, ['d','u','d']);
  assert.equal(RHYTHM_CELLS.herta_chug.accentEvery, 4);
  assert.equal(RHYTHM_CELLS.herta_chug.strokes, undefined);
});

test('numeric timing quirks and inherited-key behavior are not newly validated', () => {
  for (const [bpm, expected] of [[0,Infinity], [NaN,NaN], [undefined,NaN], [-120,-0.5], ['120',0.5], [Infinity,0]]) {
    assert.equal(secondsPerDivision({bpm, subdivision:'quarter'}), expected);
    assert.equal(measureSeconds({bpm, meter:parseMeter('4/4')}), expected * 4);
    assert.deepEqual(rhythmSteps({bpm, subdivision:'gallop'}), [0.5,0.25,0.25].map(b => b * (60 / bpm)));
  }
  assert.ok(Object.is(secondsPerDivision({bpm:-Infinity, subdivision:'quarter'}), -0));
  assert.ok(Number.isNaN(measureSeconds({bpm:120, meter:parseMeter('bad/4')})));
  assert.equal(secondsPerDivision({bpm:120, subdivision:'toString'}), Object.prototype.toString);
  assert.throws(() => rhythmSteps({bpm:120, subdivision:'toString'}), TypeError);
  assert.throws(() => secondsPerDivision(null), TypeError);
  assert.throws(() => rhythmSteps(null), TypeError);
  assert.throws(() => measureSeconds({bpm:120}), TypeError);
});

test('rhythm cells remain shared mutable objects while returned durations are fresh', async () => {
  const again = await import('../src/core/timing.js');
  assert.equal(again.RHYTHM_CELLS, RHYTHM_CELLS);
  assert.equal(Object.getPrototypeOf(RHYTHM_CELLS), Object.prototype);
  assert.equal(Object.isFrozen(RHYTHM_CELLS), false);
  assert.equal(again.RHYTHM_CELLS.gallop.beats, RHYTHM_CELLS.gallop.beats);
  const cfg = {bpm:120, subdivision:'gallop'};
  const steps = rhythmSteps(cfg);
  try {
    RHYTHM_CELLS.gallop.beats[0] = 1;
    assert.equal(again.rhythmSteps(cfg)[0], 0.5);
    assert.equal(steps[0], 0.25);
  } finally { RHYTHM_CELLS.gallop.beats[0] = 0.5; }
  assert.notEqual(RHYTHM_CELLS.gallop.beats, RHYTHM_CELLS.reverse_gallop.beats);
});
