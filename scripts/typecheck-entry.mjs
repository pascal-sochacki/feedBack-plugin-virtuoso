// SPDX-License-Identifier: AGPL-3.0-only
import ts from 'typescript';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const configPath = resolve(root, 'tsconfig.entry.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config || {}, ts.sys, root);
const diagnostics = [...(config.error ? [config.error] : []), ...parsed.errors,
  ...ts.getPreEmitDiagnostics(ts.createProgram(parsed.fileNames, parsed.options))];
const rows = diagnostics.map(diagnostic => {
  const position = diagnostic.file && diagnostic.start !== undefined
    ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start) : null;
  return { code: diagnostic.code, file: diagnostic.file ? relative(root, diagnostic.file.fileName) : '(config)',
    line: position ? position.line + 1 : null, column: position ? position.character + 1 : null,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ') };
});
const byCode = {}, byFile = {};
for (const row of rows) {
  byCode[row.code] = (byCode[row.code] || 0) + 1;
  byFile[row.file] = (byFile[row.file] || 0) + 1;
}
const report = { typescript: ts.version, config: 'tsconfig.entry.json', total: rows.length, byCode, byFile, diagnostics: rows };
const output = resolve(root, 'coverage/typecheck-entry.json');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(`Strict browser entry: ${report.total} diagnostics (TypeScript ${ts.version})`);
console.log('By code:', byCode);
console.log('By file:', byFile);
for (const code of Object.keys(byCode)) {
  const example = rows.find(row => String(row.code) === code);
  console.log(`TS${code}: ${example.file}:${example.line}:${example.column} ${example.message.slice(0, 360)}`);
}
console.log('Full ignored report: coverage/typecheck-entry.json');
process.exitCode = diagnostics.length ? 1 : 0;
