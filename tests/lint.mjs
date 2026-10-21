import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
    assert.ok(result.messages.some(message => message.ruleId === 'no-unused-vars' && message.severity === 2));
    assert.equal(newDiagnostics([result], []).length, 1);
  }
  const [core] = await eslint.lintText('export const value = document.title;', { filePath: 'src/core/lint-control.js' });
  assert.ok(core.messages.some(message => message.ruleId === 'no-undef' && message.severity === 2));
  const [duplicate] = await eslint.lintText('export const value = { a: 1, a: 2 };', { filePath: 'src/core/lint-control.js' });
  assert.ok(duplicate.messages.some(message => message.ruleId === 'no-dupe-keys' && message.severity === 2));
  const [browser] = await eslint.lintText('document.title; new WebAudioFontPlayer();', { filePath: 'screen.js' });
  assert.deepEqual(browser.messages, []);
});

test('actual flat config rejects every unused binding and parameter without a legacy allowance', {
  skip: !existsSync(join(REPO, 'node_modules/eslint/package.json')) && 'Run npm ci to exercise installed lint tooling',
}, async () => {
  const { ESLint } = await import('eslint');
  const eslint = new ESLint({ cwd: REPO });
  const baseline = JSON.parse(readFileSync(join(REPO, 'scripts/lint-baseline.json'), 'utf8'));
  for (const filePath of ['screen.js', 'src/core/lint-control.js', 'src/core/builders/guide-tones.js',
    'src/shell/lint-control.js', 'scripts/lint-control.mjs', 'tests/lint-control.mjs', 'eslint.config.mjs']) {
    const options = await eslint.calculateConfigForFile(filePath);
    assert.equal(options.rules['no-unused-vars'][1].args, 'all');
    assert.equal(options.rules['no-unused-vars'][1].argsIgnorePattern, '^_');
    assert.equal(options.rules['no-unused-vars'][1].caughtErrors, 'none');
    assert.equal(options.rules['no-unused-vars'][0], 2);
    assert.equal(options.rules['no-unused-vars'][1].varsIgnorePattern, undefined);
    for (const source of ['[1].map((unused, index) => index);',
      '[1].map((value, unused) => value);', 'export function unusedArgument(unused) {}',
      'const UNUSED_CONSTANT = 1;', 'function unusedFunction() {}',
      'export function usedFunction() { const unusedLocal = 1; }',
      'const _unusedLocal = 1;', "import { unusedImport } from './control.js';"]) {
      const [result] = await eslint.lintText(source, { filePath });
      assert.equal(result.messages.length, 1, `${filePath}: ${source}`);
      assert.equal(result.messages[0].ruleId, 'no-unused-vars');
       assert.equal(result.messages[0].severity, 2);
      assert.equal(newDiagnostics([result], baseline).length, 1);
    }
    const [intentional] = await eslint.lintText('[1].map((_value, index) => index); try { 1; } catch (error) {}', { filePath });
    assert.deepEqual(intentional.messages, []);
    const [local] = await eslint.lintText('const _unusedLocal = 1;', { filePath });
    assert.equal(newDiagnostics([local], []).length, 1, 'argument exemption must not mask unused locals');
  }
  assert.ok(baseline.every(row => JSON.parse(row.key)[1] !== 'no-unused-vars'));
});

test('all first-party files have zero unused binding diagnostics under the installed config', {
  skip: !existsSync(join(REPO, 'node_modules/eslint/package.json')) && 'Run npm ci to exercise installed lint tooling',
}, async () => {
  const { ESLint } = await import('eslint');
  const { LINT_FILES } = await import('../scripts/lint.mjs');
  const results = await new ESLint({ cwd: REPO }).lintFiles(LINT_FILES);
  const unused = results.flatMap(result => result.messages.filter(message => message.ruleId === 'no-unused-vars')
    .map(message => `${result.filePath}:${message.line} ${message.message}`));
  assert.deepEqual(unused, []);
});

test('TypeScript unused-declaration probe covers the complete browser entry without masking other type debt', async () => {
  const { default: ts } = await import('typescript');
  const { config } = ts.readConfigFile(join(REPO, 'tsconfig.json'), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent({ ...config, include: ['screen.js'] }, ts.sys, REPO);
  assert.equal(parsed.options.noUnusedLocals, true);
  assert.equal(parsed.options.noUnusedParameters, true);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const unusedCodes = new Set([6133, 6192, 6196, 6198, 6199]);
  const unused = ts.getPreEmitDiagnostics(program).filter(diagnostic => unusedCodes.has(diagnostic.code))
    .map(diagnostic => `${diagnostic.file?.fileName}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
  assert.deepEqual(unused, []);
});
