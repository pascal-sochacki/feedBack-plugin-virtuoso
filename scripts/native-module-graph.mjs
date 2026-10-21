// Developer-only parser: never packaged, imported or required by runtime modules.
import { parse } from './vendor/acorn.mjs';
import { readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';

export function moduleEdges(source, file = '<module>') {
  let ast;
  try { ast = parse(source, {ecmaVersion:2022, sourceType:'module'}); }
  catch (error) { throw Error(`${file}: unsupported/invalid module syntax: ${error.message}`); }
  const edges = [];
  const visit = node => {
    if (node.type === 'ImportExpression') {
      if (node.source.type !== 'Literal' || typeof node.source.value !== 'string') throw Error(`${file}: computed dynamic import is unsupported by native graph policy; use a literal relative specifier`);
      edges.push({kind:'dynamic',specifier:node.source.value});
    } else if (node.type === 'ImportDeclaration') edges.push({kind:'import',specifier:node.source.value});
    else if ((node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') && node.source) edges.push({kind:'export',specifier:node.source.value});
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) { for (const child of value) if (child?.type) visit(child); }
      else if (value?.type) visit(value);
    }
  };
  visit(ast);
  return edges;
}

export function checkNativeGraph(entryFiles, { coreRoot, contentRoot, read = file => readFileSync(file,'utf8') } = {}) {
  const visited = new Set(), active = new Set();
  const core = coreRoot && resolve(coreRoot) + sep;
  const content = contentRoot ? resolve(contentRoot) + sep : coreRoot && resolve(coreRoot,'../content') + sep;
  const visit = file => {
    file = resolve(file);
    if (active.has(file)) throw Error('native module cycle: ' + [...active,file].join(' → '));
    if (visited.has(file)) return;
    active.add(file);
    for (const edge of moduleEdges(read(file),file)) {
      if (!edge.specifier.startsWith('./') && !edge.specifier.startsWith('../')) throw Error(`${file}: native graph requires relative dependencies, got ${edge.specifier}`);
      const dependency = resolve(dirname(file),edge.specifier);
      if (core && file.startsWith(core) && !dependency.startsWith(core) && !(content && dependency.startsWith(content))) throw Error(`${file}: core dependency escapes into shell/host: ${edge.specifier}`);
      if (content && file.startsWith(content) && !dependency.startsWith(content)) throw Error(`${file}: passive content dependency escapes: ${edge.specifier}`);
      visit(dependency);
    }
    active.delete(file); visited.add(file);
  };
  for (const file of entryFiles) visit(file);
  return visited;
}
