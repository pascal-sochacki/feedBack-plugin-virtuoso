import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = fileURLToPath(new URL('../', import.meta.url));
export const LINT_FILES = ['screen.js', 'src/**/*.js', 'scripts/**/*.mjs', 'tests/**/*.mjs', 'eslint.config.mjs'];

export function warningKey(file, message, source) {
  const lines = source.split('\n');
  const statement = lines.slice(message.line - 1, message.endLine || message.line).join('\n').trim();
  return JSON.stringify([file, message.ruleId, message.message, createHash('sha256').update(statement).digest('hex')]);
}

export function newDiagnostics(results, baseline, root = REPO) {
  const remaining = new Map(baseline.map(({ key, count }) => [key, count]));
  const unexpected = [];
  for (const result of results) {
    const file = relative(root, result.filePath).split('\\').join('/');
    for (const message of result.messages) {
      const key = warningKey(file, message, result.source || '');
      const count = remaining.get(key) || 0;
      if (message.severity === 1 && count > 0) {
        remaining.set(key, count - 1);
        continue;
      }
      unexpected.push({ file, ...message });
    }
  }
  return unexpected;
}

async function main() {
  const { ESLint } = await import('eslint');
  const eslint = new ESLint({ cwd: REPO });
  const baseline = JSON.parse(readFileSync(new URL('./lint-baseline.json', import.meta.url), 'utf8'));
  const results = await eslint.lintFiles(process.argv.includes('--core') ? ['src/**/*.js'] : LINT_FILES);
  const unexpected = newDiagnostics(results, baseline);
  for (const message of unexpected) {
    console.error(`${message.file}:${message.line}:${message.column} ${message.ruleId || 'parse'}: ${message.message}`);
  }
  const warnings = results.reduce((sum, result) => sum + result.warningCount, 0);
  console.log(`Lint: ${results.length} files, ${unexpected.length} new/error diagnostics, ${warnings} known warnings (explicit baseline).`);
  if (unexpected.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
