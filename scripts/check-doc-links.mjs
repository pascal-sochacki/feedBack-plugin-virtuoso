import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function markdownFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (['.git', 'node_modules', '__pycache__'].includes(entry.name)) return [];
    const path = join(root, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : [];
  });
}

export function checkMarkdownLinks(file, text = readFileSync(file, 'utf8'), root = REPO) {
  const errors = [];
  // Examples in code fences are not published navigation links.
  const prose = text.replace(/^(`{3,}|~{3,}).*\n[\s\S]*?^\1\s*$/gm, '');
  const targets = [
    ...prose.matchAll(/!?\[[^\]\n]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+["'][^\n]*?["'])?\s*\)/g),
    ...prose.matchAll(/^\s*\[[^\]]+\]:\s*(<[^>]+>|\S+)/gm),
    ...prose.matchAll(/\b(?:href|src)=["']([^"']+)["']/g),
  ];
  for (const match of targets) {
    const target = match[1].replace(/^<|>$/g, '');
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target) || /[{}<>]|\$\(|\$\{/.test(target)) continue;
    let path;
    try { path = decodeURIComponent(target.split(/[?#]/)[0]); }
    catch { errors.push(`${relative(root, file)}: invalid URL ${target}`); continue; }
    if (!path) continue;
    const destination = path.startsWith('/') ? resolve(root, '.' + path) : resolve(dirname(file), path);
    if (!existsSync(destination)) errors.push(`${relative(root, file)}: missing ${target}`);
  }
  return errors;
}

export function checkDocumentation(root = REPO) {
  return markdownFiles(root).flatMap(file => checkMarkdownLinks(file, undefined, root));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = checkDocumentation();
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('Documentation local links OK');
}
