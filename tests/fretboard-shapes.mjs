import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CAGED_CYCLE,
  CAGED_SHAPES,
  isOpenSystemSensible,
  nextShapeInCycle,
  resolveCAGEDShape,
  resolveOpenShape,
  resolveThreeNPSPosition,
  shapeOrderForKey
} from '../src/core/fretboard-shapes.js';

const guitar = [40, 45, 50, 55, 59, 64];

function fretsByString(shape) {
  const map = {};
  for (const note of shape.notes) {
    if (!map[note.s]) map[note.s] = [];
    map[note.s].push(note.f);
  }
  for (const string of Object.keys(map)) map[string].sort((a, b) => a - b);
  return map;
}

test('CAGED C-shape in C major spans frets 0–5 and has its root at A-string fret 3', () => {
  const shape = resolveCAGEDShape(0, 'C', 'major', guitar);
  assert.ok(shape, 'C-shape in C major should resolve');
  assert.deepEqual([shape.fretMin, shape.fretMax], [0, 5], 'C-shape in C major should span frets 0–5');
  assert.ok(shape.notes.some(note => note.s === 1 && note.f === 3 && note.isRoot),
    'C-shape in C major should have root at s=1 f=3');
});

test('CAGED E-shape in G major spans frets 2–7 and has its root at low E fret 3', () => {
  const shape = resolveCAGEDShape(7, 'E', 'major', guitar);
  assert.ok(shape, 'E-shape in G major should resolve');
  assert.deepEqual([shape.fretMin, shape.fretMax], [2, 7], 'E-shape in G major should span frets 2–7');
  assert.ok(shape.notes.some(note => note.s === 0 && note.f === 3 && note.isRoot),
    'E-shape in G major should have root at s=0 f=3');
});

test('3NPS position 1 in C major has the expected low E and B-string frets', () => {
  const frets = fretsByString(resolveThreeNPSPosition(0, 1, 'major', guitar));
  assert.deepEqual(frets[0], [8, 10, 12], '3NPS Pos 1 in C major, low E should be [8,10,12]');
  assert.deepEqual(frets[4], [10, 12, 13], '3NPS Pos 1 in C major, B string should be [10,12,13]');
});

test('3NPS position 1 in G major has the expected low E frets', () => {
  const frets = fretsByString(resolveThreeNPSPosition(7, 1, 'major', guitar));
  assert.deepEqual(frets[0], [3, 5, 7], '3NPS Pos 1 in G major, low E should be [3,5,7]');
});

test('CAGED order is correct in C and G major', () => {
  assert.deepEqual(shapeOrderForKey(0, 'caged', 'major', guitar), ['C', 'A', 'G', 'E', 'D'],
    'CAGED order in C major should be C,A,G,E,D');
  assert.deepEqual(shapeOrderForKey(7, 'caged', 'major', guitar), ['G', 'E', 'D', 'C', 'A'],
    'CAGED order in G major should be G,E,D,C,A');
});

test('Open is sensible for C major, but not Db or Ab major', () => {
  assert.equal(isOpenSystemSensible(0, 'major', guitar), true,
    'Open should be sensible for C major');
  assert.equal(isOpenSystemSensible(1, 'major', guitar), false,
    'Open should NOT be sensible for Db major (no root in frets 0-3)');
  assert.equal(isOpenSystemSensible(8, 'major', guitar), false,
    'Open should NOT be sensible for Ab major (no root in frets 0-3)');
});

test('next CAGED shape advances and wraps in C major', () => {
  assert.equal(nextShapeInCycle(0, 'caged', 'C', 'major', guitar), 'A',
    'After C-shape in C major, next is A-shape');
  assert.equal(nextShapeInCycle(0, 'caged', 'D', 'major', guitar), 'C',
    'After D-shape in C major, wraps to C-shape');
});

test('CAGED and Open shapes do not duplicate pitches across strings', () => {
  const keys = [0, 7, 9, 2, 3];
  const scales = ['major', 'natural_minor', 'harmonic_minor'];

  for (const key of keys) {
    for (const scale of scales) {
      for (const shape of CAGED_CYCLE) {
        const resolved = resolveCAGEDShape(key, shape, scale, guitar);
        assert.ok(resolved, `CAGED ${shape}-shape key=${key} ${scale} should resolve`);
        const midis = resolved.notes.map(note => guitar[note.s] + note.f);
        assert.equal(new Set(midis).size, midis.length,
          `CAGED ${shape}-shape key=${key} ${scale} doubles a pitch`);
      }

      const open = resolveOpenShape(key, scale, guitar);
      const openMidis = open.notes.map(note => guitar[note.s] + note.f);
      assert.equal(new Set(openMidis).size, openMidis.length,
        `Open key=${key} ${scale} doubles a pitch`);
    }
  }
});

test('each finger in an authored CAGED chord template uses a single fret offset', () => {
  const skip = new Set(['G:maj', 'G:min', 'G:dim', 'C:min', 'E:dim']);
  for (const [shapeKey, shape] of Object.entries(CAGED_SHAPES)) {
    for (const [quality, notes] of Object.entries(shape.chordTemplates || {})) {
      if (skip.has(`${shapeKey}:${quality}`)) continue;
      const byFinger = new Map();
      for (const note of notes) {
        if (!note.fg) continue;
        if (!byFinger.has(note.fg)) byFinger.set(note.fg, new Set());
        byFinger.get(note.fg).add(note.fOff);
      }

      for (const [finger, offsets] of byFinger) {
        assert.ok(offsets.size <= 1,
          `${shapeKey}/${quality} finger ${finger} spans ${offsets.size} fret offsets (impossible)`);
        if (offsets.size !== 1) continue;
        const group = notes.filter(note => note.fg === finger);
        if (group.length < 2) continue;
        const lo = Math.min(...group.map(note => note.s));
        const hi = Math.max(...group.map(note => note.s));
        const fret = group[0].fOff;
        for (const note of notes) {
          assert.ok(!(note.s > lo && note.s < hi && note.fOff < fret),
            `${shapeKey}/${quality} barre (finger ${finger} at fOff ${fret}) crosses a lower stop on string ${note.s} (impossible)`);
        }
      }
    }
  }
});
