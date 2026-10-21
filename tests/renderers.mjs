import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { characterize, ROOT } from './helpers/characterization.mjs';
import { classicRenderingSnapshot } from './helpers/renderer-integration.mjs';
import { makeClassic2DHighwayRenderer } from '../src/shell/renderers/classic-2d.js';
import { checkNativeGraph, moduleEdges } from '../scripts/native-module-graph.mjs';
import { parse } from '../scripts/vendor/acorn.mjs';
import {movedSelectionStatements, changedSelectionStatements, normalizeSelection} from './helpers/practice-selection.mjs';
import {rendererChangedStatements} from './helpers/renderer-lifecycle.mjs';
import {transportChangedStatements, normalizeTransport, removedUnusedStatements} from './helpers/run-transport.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/renderers-before-extraction.json',import.meta.url),'utf8'));
const localFixture = JSON.parse(readFileSync(new URL('./fixtures/local-renderers-before-extraction.json',import.meta.url),'utf8'));
const tuningFixture = JSON.parse(readFileSync(new URL('./fixtures/tuning-settings-before-extraction.json',import.meta.url),'utf8'));
const hash = text => createHash('sha256').update(text).digest('hex');

test('entry statement order remains pinned outside independently characterized Workout and tuning owners', () => {
  const source = readFileSync(`${ROOT}screen.js`,'utf8');
  const ast = parse(source,{ecmaVersion:2022,sourceType:'module'});
  const imports = ast.body.filter(node=>node.type === 'ImportDeclaration' && node.source.value !== './src/shell/run-transport.js').map(node=>node.source.value);
   assert.deepEqual(imports.filter(path=>!['./src/shell/renderer-lifecycle.js','./src/shell/practice-config.js','./src/shell/practice-presets.js','./src/content/form-cues.js','./src/core/practice-form-cue.js','./src/shell/practice-presentation.js','./src/shell/practice-selection.js','./src/core/practice-selection.js'].includes(path)).slice(0,-6),localFixture.originalImportOrder.filter(path=>!['./src/shell/renderers/selection.js','./src/shell/practice-catalog.js','./src/shell/practice-files.js'].includes(path)),'remaining old direct module order stays unchanged');
  assert.deepEqual(imports.slice(-6),['./src/shell/renderers/tab.js','./src/shell/renderers/notation.js','./src/shell/renderers/display-policy.js','./src/shell/workout-editor.js','./src/shell/workout-display.js','./src/shell/tuning-settings.js']);
  const body = ast.body.find(node => node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression' && node.expression.callee.type === 'FunctionExpression').expression.callee.body.body;
  const moved = new Set(localFixture.movedStatements);
  for (const name of [...tuningFixture.changedStatements,'tuningSettings']) moved.add(name);
  for (const name of ['readConfig','syncAdvancedMode','setFieldSilent','applyPathwayConfig','loadPathwayFavorites','savePreset','practicePresets']) moved.add(name);
   for (const name of ['FORM_CUES','FORM_CUE_RUNGS','FORM_CUE_BANDS','bassFormCueCandidates','formCueForRung']) moved.add(name);
   for (const name of ['updateStartCta','startSkillHook','describeCurrentContent','updatePathwayGoalCard','positionStepperIsShapeMode','variationAxisLabel','variationValueLabel','updatePositionStepper','practicePresentation']) moved.add(name);
    moved.add('syncPracticeFileControls');
   for (const name of [...movedSelectionStatements,...changedSelectionStatements]) moved.add(name);
   for (const name of rendererChangedStatements) moved.add(name);
   for (const name of transportChangedStatements) moved.add(name);
   for (const name of removedUnusedStatements) moved.add(name);
  const manifest = JSON.parse(readFileSync(`${ROOT}plugin.json`,'utf8'));
  const versionNode = body.find(node=>node.declarations?.[0]?.id?.name === 'VIRTUOSO_VERSION');
  assert.equal(versionNode.declarations[0].init.value,manifest.version,'source header mirrors reserved manifest version');
  // Only the independently asserted release badge may differ from the old pin;
  // all other statements and their order retain the historical byte comparison.
   const statements = body.filter(node => !moved.has(node.id?.name || node.declarations?.[0]?.id?.name) && !source.slice(node.start,node.end).includes("Object.defineProperty(globalThis.__ss_debug, 'lifecycle'")).map(node=>
      node === versionNode ? "const VIRTUOSO_VERSION = '0.2.13';" : normalizeSelection(normalizeTransport(source.slice(node.start,node.end))).replace('customTuningSync: tuningSettings.syncInputs','customTuningSync: syncCustomTuningInputs').replace('const preset = practicePresets.get(id);','const preset = window.__virtuosoFavorites && window.__virtuosoFavorites[id];').replaceAll('practicePresentation.renderGoal(', 'updatePathwayGoalCard(').replaceAll('practicePresentation.renderPosition(', 'updatePositionStepper(').replaceAll('practicePresentation.renderStart(', 'updateStartCta(').replaceAll('practicePresentation.describe(', 'describeCurrentContent('));
  // The old 899-statement hash stays archived in the immutable renderer fixture;
  // editing/state writers are now covered by the independent Workout event capture.
    const configFixture = JSON.parse(readFileSync(new URL('./fixtures/practice-selection-before-extraction.json',import.meta.url),'utf8'));
   const rendererFixture=JSON.parse(readFileSync(new URL('./fixtures/renderer-lifecycle-before-extraction.json',import.meta.url),'utf8'));
   assert.equal(configFixture.unmovedStatements,794);
   assert.equal(rendererFixture.historicalStatements,770);
   const transportFixture=JSON.parse(readFileSync(new URL('./fixtures/run-transport-before-extraction.json',import.meta.url),'utf8'));
   const cleanup=JSON.parse(readFileSync(new URL('./fixtures/unused-declarations-before-cleanup.json',import.meta.url)));
   assert.equal(transportFixture.historical.statements,747);
   assert.equal(statements.length,cleanup.historical.statements);
   assert.equal(hash(JSON.stringify(statements)),cleanup.historical.sha256);
});

test('Tab unchanged paint matches historical capture; corrected Notation matches actual native entry', () => {
  const snapshot = characterize(undefined,undefined,{localRendererSnapshot:true});
  // Derived from the independently saved pre-cleanup capture, NOT new renderer output.
  // Only backing-store writes / explicit transform resets are approved Tab deltas.
  const tabRows = snapshot.rows.filter(row=>row.kind==='makeBuiltin2DTabRenderer').map(row=>({...row,calls:row.calls.filter(c=>c[0]!=='canvas' && c[0]!=='setTransform')}));
  assert.equal(hash(JSON.stringify(tabRows)),'8c12db89848b86dea61c1e57ed7908fde2bc98f00b0f91bcdf5c600f9a192479');
  // Unclipped G-major opening frames remain unchanged, including bass/alternate
  // tuning, all annotations, judgment paint and renderer-owned hand placement.
  const notationRows = snapshot.rows.filter(r=>r.kind==='makeBuiltin2DNotationRenderer' && r.label.includes('/G/major')).map(r=>{
    const calls = r.calls.filter((c,i)=>c[0]!=='canvas' && c[0]!=='setTransform' && !(r.calls[i-1]?.[0]==='setTransform' && c[0]==='set' && c[1]==='lineCap' && c[2]==='butt'));
    const starts = calls.flatMap((c,i)=>c[0]==='fillRect' && c[1]===0 && c[2]===0 && c[3]===800 && c[4]===600 ? [i] : []);
    return {label:r.label,calls:calls.slice(starts[0],starts[1]-1)};
  });
  assert.equal(hash(JSON.stringify(notationRows)),'b2c45609bc8dcb11818053a89f21fb1aeb172392a20c6bce8d33c33779164d3d');
  assert.equal(localFixture.snapshotSha256,'5dd78d0146abdd748841b583cee1f4fc75807ca8e759b01d646d86f65d0a4ae7','historical evidence is not recaptured');
  for (const key of ['generated','raw','instances','frames']) assert.equal(snapshot[key],localFixture[key]);
  for (const row of snapshot.rows) {assert.equal(row.inert,true);assert.equal(row.listeners,0);}
  assert.deepEqual(characterize(undefined,undefined,{localRendererSnapshot:true,localRendererDirect:true}),snapshot);
});

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

test('real entry host factory selection, script policy and Classic canvas sequence match independent dirty capture', () => {
  const snapshot = characterize(undefined,undefined,{rendererSnapshot:true});
  const text = JSON.stringify(snapshot);
  assert.equal(Buffer.byteLength(text),fixture.snapshotBytes);
  assert.equal(hash(text),fixture.snapshotSha256);
  assert.deepEqual(snapshot.classic.methods,['init','draw','resize','destroy']);
  assert.equal(snapshot.classic.inertAfterDestroy,true);
  assert.equal(snapshot.classic.listeners,0);
  assert.ok(snapshot.classic.calls.some(call => call[0] === 'setTransform'),'lefty readable text');
  assert.ok(snapshot.classic.calls.some(call => call[0] === 'set' && call[1] === 'globalAlpha' && call[2] === 0.5),'miss display only');
  const oldWindow = globalThis.window, oldDocument = globalThis.document;
  globalThis.window = {}; globalThis.document = {};
  try { assert.deepEqual(classicRenderingSnapshot(makeClassic2DHighwayRenderer),snapshot.classic); }
  finally { globalThis.window = oldWindow; globalThis.document = oldDocument; }
  const changed = structuredClone(snapshot); changed.classic.calls[0][1] = '3d';
  assert.notEqual(hash(JSON.stringify(changed)),fixture.snapshotSha256,'canvas sequence is not normalized away');
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
