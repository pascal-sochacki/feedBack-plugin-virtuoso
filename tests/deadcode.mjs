import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const repo = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(readFileSync(join(repo, 'knip.json'), 'utf8'));
const cli = join(repo, 'node_modules/knip/bin/knip.js');

test('dead-code scope protects native entry and developer commands without making every source an entry', () => {
  assert.equal(config.includeEntryExports, true);
  assert.equal(config.ignoreExportsUsedInFile, true);
  assert.deepEqual(Object.keys(config.workspaces), ['.', 'src']);
  assert.deepEqual(config.workspaces.src.entry, []);
  assert.deepEqual(config.workspaces.src.project, ['**/*.js!']);
  const root = config.workspaces['.'];
  assert.ok(root.entry.includes('screen.js!'));
  assert.ok(root.entry.includes('tests/*.mjs'));
  for (const name of ['check-brand-hygiene', 'check-doc-links', 'cut-beta', 'cut-lab', 'lint']) {
    assert.ok(root.entry.includes(`scripts/${name}.mjs`), name);
  }
  for (const patterns of [root.entry, root.project]) {
    assert.ok(patterns.every(pattern => !/src|vendor|static|assets|\.claude/.test(pattern)));
  }
  assert.equal(config.ignoreDependencies, undefined);
  assert.equal(config.ignore, undefined);
});

test('installed Knip detects dead exports/files/dependencies across the real nested-workspace policy', {
  skip: !existsSync(cli) && 'Run npm ci to exercise installed Knip negative controls',
}, () => {
  const approved = join(tmpdir(), 'opencode');
  const temp = mkdtempSync(join(existsSync(approved) ? approved : tmpdir(), 'virtuoso-knip-test-'));
  const write = (file, text) => {
    const path = join(temp, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  };
  try {
    write('knip.json', JSON.stringify(config));
    write('package.json', JSON.stringify({ private: true, dependencies: { 'unused-control': '1.0.0' }, devDependencies: { 'unused-dev-control': '1.0.0' } }));
    write('src/package.json', '{"type":"module"}');
    write('screen.js', "import { used } from './src/core/live.js';\nimport './src/core/side-effect.js';\nconsole.log(used);\nimport('./src/core/lazy.js').then(m => console.log(m.lazy));\nexport const deadEntry = 1;\n");
    write('src/core/live.js', 'export const used = 1;\nexport const deadExport = 2;\nexport const internallyUsed = 3;\nconsole.log(internallyUsed);\nexport const regressionOnly = 4;\n');
    write('src/core/side-effect.js', 'globalThis.controlInitialized = true;\n');
    write('src/core/lazy.js', 'export const lazy = 1;\n');
    write('src/core/dead-file.js', 'export const unreachable = 1;\n');
    write('tests/control.mjs', "import { regressionOnly } from '../src/core/live.js';\nconsole.log(regressionOnly);\n");
    for (const production of [false, true]) {
      const args = [cli, '--config', 'knip.json', '--reporter', 'json', '--no-progress', '--no-config-hints'];
      if (production) args.push('--production');
      const result = spawnSync(process.execPath, args, { cwd: temp, encoding: 'utf8' });
      assert.ifError(result.error);
      assert.equal(result.status, 1, result.stderr || result.stdout);
      const report = JSON.parse(result.stdout);
      assert.ok(report.issues.find(issue => issue.file === 'src/core/dead-file.js')?.files.length, result.stdout);
      const live = report.issues.find(issue => issue.file === 'src/core/live.js');
      const exports = live.exports.map(item => item.name).sort();
      assert.deepEqual(exports, production ? ['deadExport', 'regressionOnly'] : ['deadExport']);
      assert.ok(report.issues.find(issue => issue.file === 'screen.js').exports.some(item => item.name === 'deadEntry'));
      assert.ok(report.issues.find(issue => issue.file === 'package.json').dependencies.some(item => item.name === 'unused-control'));
      const dev = report.issues.find(issue => issue.file === 'package.json').devDependencies ?? [];
      assert.equal(dev.some(item => item.name === 'unused-dev-control'), !production);
      for (const name of ['live', 'lazy', 'side-effect']) {
        assert.ok(!report.issues.find(issue => issue.file === `src/core/${name}.js`)?.files.length);
      }
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
