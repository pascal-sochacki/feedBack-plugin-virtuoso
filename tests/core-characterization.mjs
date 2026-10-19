import assert from 'node:assert/strict';
import test from 'node:test';
import { characterize, compareCorpus, expectedCorpus } from './helpers/characterization.mjs';

test('source core matches committed pre-extraction exercises, all sessions and synchronous API', () => {
  compareCorpus(characterize());
});

test('negative control: a raw note-time mutation is rejected by corpus comparison', () => {
  const expected = expectedCorpus();
  const actual = characterize(undefined, undefined, { mutateRawNote: true });
  assert.equal(actual.results['scale/major'].firstNotes[0].t, expected.results['scale/major'].firstNotes[0].t + 0.001);
  assert.notEqual(actual.results['scale/major'].sha256, expected.results['scale/major'].sha256);
  // Remove the readable-summary difference so only the raw-output SHA gate fails.
  actual.results['scale/major'].firstNotes = expected.results['scale/major'].firstNotes;
  assert.throws(() => compareCorpus(actual), /committed pre-extraction core corpus changed/);
});

test('negative control: a failing entry startup console.assert exits fatally', () => {
  assert.throws(() => characterize(undefined, undefined, { failStartupAssertion: true }), error => {
    assert.equal(error.status, 1);
    assert.equal(error.stdout, '');
    assert.match(error.stderr, /\[Virtuoso shapes\] C-shape in C major should span frets 0–5/);
    return true;
  });
});
