import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ROOT } from './helpers/characterization.mjs';
import { makeClassic2DHighwayRenderer } from '../src/shell/renderers/classic-2d.js';
import { checkNativeGraph, moduleEdges } from '../scripts/native-module-graph.mjs';

test('Tab/Notation factories and imports are inert with strict global traps and own no RAF or document listeners', () => {
  const urls = ['tab','notation','display-policy','hand-marks','notation-pitch'].map(name=>new URL(`../src/shell/renderers/${name}.js`,import.meta.url).href);
  execFileSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    for (const name of ['window','document','localStorage','fetch','requestAnimationFrame','cancelAnimationFrame']) Object.defineProperty(globalThis,name,{get(){throw Error('IO '+name)}});
    const [tab,notation] = await Promise.all(${JSON.stringify(urls)}.map(url=>import(url)));
    const prefs = {getRenderTheme(){throw Error('early theme')},handMarksOn(){throw Error('early marks')}};
    for (const factory of [tab.makeBuiltin2DTabRenderer,notation.makeBuiltin2DNotationRenderer]) {
      const renderer = factory(prefs); renderer.draw({notes:[]});renderer.resize();
      assert.ok(Object.keys(renderer).includes('destroy'));
    }
  `],{encoding:'utf8'});
});

test('renderer modules are import-time inert and factory construction needs neither host nor DOM', () => {
  const urls = ['host-factories','selection','classic-2d','renderer-types'].map(name => new URL(`../src/shell/renderers/${name}.js`,import.meta.url).href);
  execFileSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    for (const name of ['window','document','localStorage','fetch']) Object.defineProperty(globalThis,name,{get(){throw Error('import IO '+name)}});
    const modules = await Promise.all(${JSON.stringify(urls)}.map(url=>import(url)));
    const renderer = modules[2].makeClassic2DHighwayRenderer();
    assert.deepEqual(Object.keys(renderer),['init','draw','resize','destroy']);
    renderer.draw({notes:[]}); renderer.resize();
  `],{encoding:'utf8'});
});

test('exact renderer DAG remains lower shell and core cannot import any new owner', () => {
  const dir = `${ROOT}src/shell/renderers/`;
  const names = ['host-factories','selection','classic-2d','renderer-types','tab','notation','display-policy','hand-marks','notation-pitch'];
  const actual = checkNativeGraph([`${ROOT}screen.js`],{coreRoot:`${ROOT}src/core`});
  for (const name of names.filter(name => name !== 'renderer-types')) assert.ok(actual.has(`${dir}${name}.js`),name);
  assert.deepEqual(moduleEdges(readFileSync(`${dir}selection.js`,'utf8')).map(edge=>edge.specifier),['./host-factories.js','./classic-2d.js']);
  for (const name of ['host-factories','classic-2d','renderer-types']) assert.deepEqual(moduleEdges(readFileSync(`${dir}${name}.js`,'utf8')),[],name);
  assert.deepEqual(moduleEdges(readFileSync(`${dir}tab.js`,'utf8')).map(edge=>edge.specifier),['./display-policy.js','./hand-marks.js']);
  assert.deepEqual(moduleEdges(readFileSync(`${dir}notation.js`,'utf8')).map(edge=>edge.specifier),['./display-policy.js','./hand-marks.js','./notation-pitch.js']);
  assert.deepEqual(moduleEdges(readFileSync(`${dir}hand-marks.js`,'utf8')).map(edge=>edge.specifier),['./display-policy.js','../../core/instrument-tuning.js']);
  assert.deepEqual(moduleEdges(readFileSync(`${dir}notation-pitch.js`,'utf8')).map(edge=>edge.specifier),['../../core/pitch.js','../../core/scale-intervals.js']);
  assert.deepEqual(moduleEdges(readFileSync(`${dir}display-policy.js`,'utf8')).map(edge=>edge.specifier),['../../core/pitch.js']);
  for (const name of names) assert.throws(() => checkNativeGraph(['/graph/src/core/control.js'],{coreRoot:'/graph/src/core',read:()=>`import '../shell/renderers/${name}.js';`}),/core dependency escapes/);
});
