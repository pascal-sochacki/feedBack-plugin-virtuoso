import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export function characterize(root = ROOT, baseline, controls = {}) {
  return JSON.parse(execFileSync(process.execPath, [fileURLToPath(new URL('./core-runner.mjs', import.meta.url)), root, baseline || '', JSON.stringify(controls)], { encoding: 'utf8', maxBuffer: 8 << 20, stdio: ['ignore', 'pipe', 'pipe'] }));
}
export function expectedCorpus() {
  return JSON.parse(readFileSync(new URL('../fixtures/core-characterization.json', import.meta.url), 'utf8')).corpus;
}
export function compareCorpus(actual, expected = expectedCorpus()) {
  assert.deepEqual(actual, expected, 'committed pre-extraction core corpus changed');
}
