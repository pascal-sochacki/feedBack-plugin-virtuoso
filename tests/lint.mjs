import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { newDiagnostics, warningKey, REPO } from '../scripts/lint.mjs';

test('lint debt ratchet rejects new warnings, duplicates and errors without line-number churn', () => {
  const message = { severity: 1, ruleId: 'no-unused-vars', message: "'old' is defined but never used.", line: 1 };
  const result = { filePath: join(REPO, 'screen.js'), source: 'const old = 1;', messages: [message] };
  const baseline = [{ key: warningKey('screen.js', message, result.source), count: 1 }];
  assert.deepEqual(newDiagnostics([result], baseline), []);
  assert.deepEqual(newDiagnostics([{ ...result, source: '\nconst old = 1;', messages: [{ ...message, line: 2 }] }], baseline), []);
  assert.equal(newDiagnostics([{ ...result, messages: [message, message] }], baseline).length, 1);
  assert.equal(newDiagnostics([{ ...result, messages: [{ ...message, severity: 2 }] }], baseline).length, 1);
  assert.equal(newDiagnostics([{ ...result, source: 'const old = sideEffect();' }], baseline).length, 1);
  assert.equal(newDiagnostics([{ ...result, filePath: join(REPO, 'src/core/new.js') }], baseline).length, 1);
  assert.deepEqual(newDiagnostics([], baseline), []);
});

test('actual flat config enforces unused imports, undefined core globals and correctness', {
  skip: !existsSync(join(REPO, 'node_modules/eslint/package.json')) && 'Run npm ci to exercise installed lint tooling',
}, async () => {
  const { ESLint } = await import('eslint');
  const eslint = new ESLint({ cwd: REPO });
  for (const filePath of ['screen.js', 'src/core/lint-control.js', 'scripts/lint-control.mjs', 'tests/lint-control.mjs']) {
    const [result] = await eslint.lintText("import { unusedControl } from './control.js';", { filePath });
    assert.ok(result.messages.some(message => message.ruleId === 'no-unused-vars'));
    assert.equal(newDiagnostics([result], []).length, 1);
  }
  const [core] = await eslint.lintText('export const value = document.title;', { filePath: 'src/core/lint-control.js' });
  assert.ok(core.messages.some(message => message.ruleId === 'no-undef' && message.severity === 2));
  const [duplicate] = await eslint.lintText('export const value = { a: 1, a: 2 };', { filePath: 'src/core/lint-control.js' });
  assert.ok(duplicate.messages.some(message => message.ruleId === 'no-dupe-keys' && message.severity === 2));
  const [browser] = await eslint.lintText('document.title; new WebAudioFontPlayer();', { filePath: 'screen.js' });
  assert.deepEqual(browser.messages, []);
});
