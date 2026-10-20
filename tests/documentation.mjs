import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkDocumentation, checkMarkdownLinks, markdownFiles, REPO } from '../scripts/check-doc-links.mjs';

test('documentation local links resolve and repository guidance is mirrored', () => {
  assert.deepEqual(checkDocumentation(), []);
  assert.equal(readFileSync(join(REPO, 'AGENTS.md'), 'utf8'), readFileSync(join(REPO, 'CLAUDE.md'), 'utf8'));
  const oldNames = new Set(markdownFiles(join(REPO, 'docs')).map(file => file.split('/').at(-1)));
  const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: REPO, encoding: 'utf8' }).split('\0');
  for (const file of files.filter(file => /\.(md|mjs|js|html|py|yml|yaml|ps1)$/.test(file) && !/^(assets|static)\//.test(file))) {
    let text;
    try { text = readFileSync(join(REPO, file), 'utf8'); } catch { continue; }
    for (const match of text.matchAll(/\bdocs\/([\w-]+\.md)\b/g)) {
      assert.ok(!oldNames.has(match[1]) || match[1] === 'index.md', `${file}: stale moved path ${match[0]}`);
    }
  }
});

test('documentation checker rejects missing targets while ignoring anchors and examples', () => {
  const file = join(REPO, 'README.md');
  const text = '[ok](docs/index.md#entry) [anchor](#entry) [web](https://example.invalid)\n' +
    '[template](${path}/guide.md)\n```md\n[example](missing-example.md)\n```\n' +
    '[broken](missing-document.md) <img src="missing-image.png">';
  assert.deepEqual(checkMarkdownLinks(file, text), [
    'README.md: missing missing-document.md', 'README.md: missing missing-image.png',
  ]);
});
