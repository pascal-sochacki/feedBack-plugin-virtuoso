// Developer-only source graph check using the TypeScript compiler API.
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';

export function moduleEdges(source, file = '<module>') {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
  if (ast.parseDiagnostics.length) {
    const diagnostic = ast.parseDiagnostics[0];
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
    throw Error(`${file}: unsupported/invalid module syntax: ${message}`);
  }
  const edges = [];
  const visit = node => {
    if (ts.isImportDeclaration(node)) {
      if (ts.isStringLiteral(node.moduleSpecifier)) edges.push({kind:'import',specifier:node.moduleSpecifier.text});
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      if (ts.isStringLiteral(node.moduleSpecifier)) edges.push({kind:'export',specifier:node.moduleSpecifier.text});
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      if (node.arguments.length !== 1) throw Error(`${file}: dynamic import options are unsupported by native graph policy`);
      const specifier = node.arguments[0];
      if (!specifier || !ts.isStringLiteral(specifier)) throw Error(`${file}: computed dynamic import is unsupported by native graph policy; use a literal relative specifier`);
      edges.push({kind:'dynamic',specifier:specifier.text});
    }
    ts.forEachChild(node, visit);
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
