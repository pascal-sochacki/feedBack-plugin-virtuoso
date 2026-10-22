import assert from 'node:assert/strict';
import test from 'node:test';
import { feltHoldAnalyze } from '../src/core/felt-hold.js';

function deviations(count, { step = 1, start = 0, d = 0, sb = 0 } = {}) {
  return Array.from({ length: count }, (_, i) => ({ t: start + i * step, d, sb }));
}

test('minimum evidence and minimum continuous span gate results', () => {
  assert.deepEqual(feltHoldAnalyze(null), { verdict: null, n: 0, untight: false });
  assert.deepEqual(feltHoldAnalyze([]), { verdict: null, n: 0, untight: false });
  assert.deepEqual(feltHoldAnalyze(deviations(11)), { verdict: null, n: 11, untight: false });
  assert.deepEqual(feltHoldAnalyze(deviations(12, { step: 0.5 })), { verdict: null, n: 12, spanBars: 3, untight: false });
});

test('constant lean classes and threshold ordering are preserved', () => {
  assert.equal(feltHoldAnalyze(deviations(12, { d: 0.027 })).verdict, 'locked');
  assert.equal(feltHoldAnalyze(deviations(12, { d: 0.028 })).verdict, 'dragging');
  assert.equal(feltHoldAnalyze(deviations(12, { d: -0.018 })).verdict, 'rushing');
});

test('trend/drift takes precedence over centered lean', () => {
  const rising = deviations(12).map((point, i) => ({ ...point, d: i * 0.01 }));
  const falling = deviations(12).map((point, i) => ({ ...point, d: -i * 0.01 }));
  assert.equal(feltHoldAnalyze(rising).verdict, 'dragging');
  assert.equal(feltHoldAnalyze(falling).verdict, 'rushing');
});

test('detrended jitter distinguishes settling from loose centered playing', () => {
  const input = deviations(12).map((point, i) => ({ ...point, d: i % 2 ? 0.03 : -0.03 }));
  const result = feltHoldAnalyze(input);
  assert.equal(result.verdict, 'settling');
  assert.equal(result.untight, false);

  const loose = deviations(12).map((point, i) => ({ ...point, d: i % 2 ? 0.1 : -0.1 }));
  assert.equal(feltHoldAnalyze(loose).verdict, null);
  assert.equal(feltHoldAnalyze(loose).untight, true);
});

test('discontinuous data uses the longest run only', () => {
  const first = deviations(12, { d: 0.1 });
  const longest = deviations(13, { start: 40 });
  const result = feltHoldAnalyze([...first, ...longest]);
  assert.equal(result.n, 13);
  assert.equal(result.verdict, 'locked');
});

test('speak-budget excess is removed before lean and jitter analysis', () => {
  const lateRawEvidence = deviations(12, { d: 0.03, sb: 0.03 });
  assert.equal(feltHoldAnalyze(lateRawEvidence).verdict, 'locked');
  assert.equal(feltHoldAnalyze(deviations(12, { d: 0.03 })).verdict, 'dragging');
});

test('barSec defaults to two seconds for omitted and non-positive values', () => {
  const input = deviations(12);
  assert.deepEqual(feltHoldAnalyze(input, { barSec: 0 }), feltHoldAnalyze(input));
  assert.deepEqual(feltHoldAnalyze(input, { barSec: -1 }), feltHoldAnalyze(input));
  assert.equal(feltHoldAnalyze(input, { barSec: 4 }).verdict, null);
});
