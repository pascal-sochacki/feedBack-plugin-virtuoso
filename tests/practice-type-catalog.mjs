import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { PRACTICE_BLOCKS, PRACTICE_TYPE_CATALOG } from '../src/content/practice-blocks.js';
import { offerable } from '../src/core/practice-selection.js';
import { practiceTypesForInstrument, practiceTypeSelection } from '../src/shell/practice-type-catalog.js';

test('practice type options are sourced from applicable Markdown blocks', () => {
  for (const instrument of ['guitar', 'bass', 'piano']) {
    const expected = new Set(Object.values(PRACTICE_BLOCKS)
      .filter(block => block.metadata.applicability.includes(instrument) && offerable(block.kind, instrument))
      .filter(block => block.kind !== 'file')
      .map(block => block.kind));
    const options = practiceTypesForInstrument(instrument);
    assert.deepEqual(new Set(options.map(option => option.kind)), expected);
    assert.equal(options.length, expected.size);
    assert.ok(options.every(option => option.label.trim()));
  }
  assert.equal(practiceTypesForInstrument('guitar').some(option => option.kind === 'walking_bass'), false);
  assert.equal(practiceTypesForInstrument('bass').some(option => option.kind === 'bending'), false);
  assert.equal(PRACTICE_TYPE_CATALOG.some(option => option.kind === 'file'), false);
});

test('type labels are unique, stable, and use clear authored labels or readable type names', () => {
  const first = Object.fromEntries(PRACTICE_TYPE_CATALOG.map(option => [option.kind, option.label]));
  const second = Object.fromEntries(PRACTICE_TYPE_CATALOG.map(option => [option.kind, option.label]));
  assert.deepEqual(first, second);
  for (const [kind, label] of Object.entries(first)) {
    assert.ok(Object.values(PRACTICE_BLOCKS).some(block => block.kind === kind));
    assert.ok(label.trim());
  }
  assert.equal(first.scale, 'Scale pattern');
  assert.equal(first.octave_groove, 'Octave groove');
});

test('changing setup preserves an offered type and falls back for unavailable types', () => {
  const guitar = practiceTypesForInstrument('guitar');
  const bass = practiceTypesForInstrument('bass');
  assert.equal(practiceTypeSelection('scale', bass), 'scale');
  assert.equal(practiceTypeSelection('bending', bass), 'scale');
  assert.equal(practiceTypeSelection('bending', guitar), 'bending');
  assert.equal(practiceTypeSelection('unknown', []), '');
});

test('HTML does not maintain a duplicate practice type option catalog', async () => {
  const html = await readFile(new URL('../screen.html', import.meta.url), 'utf8');
  const select = /<select name="practiceType">([\s\S]*?)<\/select>/.exec(html);
  assert.ok(select);
  assert.doesNotMatch(select[1], /<option\b/);
});

test('generated practice type catalog refresh is deterministic', async () => {
  const path = new URL('../src/content/practice-blocks.js', import.meta.url);
  execFileSync(process.execPath, ['scripts/generate-practice-blocks.mjs'], { cwd: new URL('..', import.meta.url) });
  const first = await readFile(path, 'utf8');
  execFileSync(process.execPath, ['scripts/generate-practice-blocks.mjs'], { cwd: new URL('..', import.meta.url) });
  assert.equal(await readFile(path, 'utf8'), first);
});
