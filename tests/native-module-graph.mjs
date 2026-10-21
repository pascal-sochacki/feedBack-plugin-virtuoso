import assert from 'node:assert/strict';
import test from 'node:test';
import {moduleEdges,checkNativeGraph} from '../scripts/native-module-graph.mjs';

test('parser distinguishes actual import calls followed by blocks and object division from methods and regex', () => {
  for (const source of ["import('../shell/io.js')\n{}", "const x={} / import('../shell/io.js') /2", "const x={} / import('bad') /2", "if(true) {} /[/'{}]/.test('x'); import('bad')", "function f(){if(true){} return /[/'{}]/;} import('bad')", "const x=`raw import('ignored') ${`${import('bad')}`}`", "const x={import(){ return import('bad'); }}", "class X { import() { return import('bad'); } }"]) {
    assert.equal(moduleEdges(source).length,1,source);
    assert.throws(()=>checkNativeGraph(['/graph/src/core/a.js'],{coreRoot:'/graph/src/core',read:()=>source}),/core dependency escapes|requires relative dependencies/,source);
  }
  assert.deepEqual(moduleEdges("const x={import(){},export(){}}; class X { import(){} static import(){} }; x.import('ignored'); x?.import('ignored'); const y={} / 2 / 3; if(true){} /import('ignored')/.test('');"),[]);
  assert.deepEqual(moduleEdges("/* import('ignored') */ const s=\"import('ignored')\"; import './side.js'; export {x} from './reexport.js'; const p=import('./literal.js');").map(e=>e.specifier),['./side.js','./reexport.js','./literal.js']);
});

test('parser fails closed on invalid/new syntax and computed imports; passive content cannot depend on core/shell', () => {
  for (const source of ["import(x)","import('./' + x)","import(`./literal.js`)","`${import(x)}`"]) assert.throws(()=>moduleEdges(source),/computed dynamic import/);
  for (const source of ["const x = /unterminated", "const x = {", "import('./x.js', {with:{type:'json'}})"]) assert.throws(()=>moduleEdges(source),/unsupported\/invalid module syntax/);
  const coreRoot='/graph/src/core',a=coreRoot+'/a.js',c='/graph/src/content/c.js';
  assert.throws(()=>checkNativeGraph([a],{coreRoot,read:f=>f===a?"import '../content/c.js'":"import '../shell/io.js'"}),/passive content dependency escapes/);
  assert.throws(()=>checkNativeGraph([a],{coreRoot,read:f=>f===a?"import '../content/c.js'":"import '../core/a.js'"}),/passive content dependency escapes/);
  assert.equal(checkNativeGraph([a],{coreRoot,read:f=>f===a?"import '../content/c.js'":''}).has(c),true);
});
