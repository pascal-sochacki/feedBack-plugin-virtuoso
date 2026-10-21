import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { format } from 'node:util';
import { parse } from '../../scripts/vendor/acorn.mjs';

process.on('uncaughtException', error => { console.error(error.stack?.replace(/data:text[^\s)]+:(\d+):(\d+)/g, 'entry:$1:$2') || error.message); process.exit(1); });

// Each invocation is a fresh process: module caches, globals and RNG cannot leak
// between the baseline, source and renamed Lab namespaces.
const [root, baseline, controlsJson = '{}'] = process.argv.slice(2);
const controls = JSON.parse(controlsJson);
const sessionGeneration = controls.sessionGenerationSnapshot;
delete controls.sessionGenerationSnapshot;
const generationFoundation = controls.generationFoundationSnapshot;
delete controls.generationFoundationSnapshot;
const generationCluster = controls.generationClusterSnapshot;
delete controls.generationClusterSnapshot;
const backingCluster = controls.backingClusterSnapshot;
delete controls.backingClusterSnapshot;
const captureEntryPath = controls.captureEntryPath;
delete controls.captureEntryPath;
const rendererSnapshot = controls.rendererSnapshot;
delete controls.rendererSnapshot;
const localRendererSnapshot = controls.localRendererSnapshot;
delete controls.localRendererSnapshot;
const localRendererDirect = controls.localRendererDirect;
delete controls.localRendererDirect;
const workoutEditorSnapshot = controls.workoutEditorSnapshot;
delete controls.workoutEditorSnapshot;
assert.ok(Object.keys(controls).every(key => ['failStartupAssertion', 'mutateRawNote', 'audioRemoval', 'practiceFileProbe', 'lifecycle', 'chromaticProbe', 'pathwaySnapshot', 'pathwayIdentity', 'workoutSnapshot', 'workoutIdentity', 'instrumentTuningSnapshot', 'instrumentTuningIdentity', 'fretboardShapeSnapshot', 'fretboardShapeIdentity', 'chromaticBuilderSnapshot'].includes(key)), 'unknown harness control');
let startupAssertions = 0;
// Node only logs console.assert failures; source startup guards must gate CI.
console.assert = (condition, ...args) => {
  startupAssertions++;
  if (controls.failStartupAssertion && startupAssertions === 1) condition = false;
  assert.ok(condition, format(...args));
};
const read = file => baseline
  ? execFileSync('git', ['show', `${baseline}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 8 << 20 })
  : readFileSync(resolve(root, file), 'utf8');
const dataUrl = text => 'data:text/javascript;base64,' + Buffer.from(text).toString('base64');
const seed = 0x51ca1e;
let state = seed;
const reset = () => { state = seed; };
Math.random = () => {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 4294967296;
};
const NativeDate = Date;
globalThis.Date = class extends NativeDate {
  constructor(...args) { super(...(args.length ? args : [1792368000000])); }
  static now() { return 1792368000000; }
};
globalThis.localStorage = { getItem: () => null, setItem() {} };
const listeners = [];
globalThis.document = { readyState: 'loading', addEventListener: (...args) => listeners.push(args), getElementById: () => null };
globalThis.window = { addEventListener() {} };
const lab = !baseline && JSON.parse(read('plugin.json')).id === 'virtuoso_lab';
globalThis[lab ? '__VIRTUOSO_LAB_HARNESS__' : '__SS_HARNESS__'] = true;

// Only static import URLs change to accommodate the browser-selected root .js
// entry in Node. The complete IIFE and real leaf modules execute, unsliced.
let entry = captureEntryPath ? readFileSync(captureEntryPath,'utf8') : read('screen.js');
if (rendererSnapshot) {
  const end = entry.lastIndexOf('})();');
  assert.ok(end > 0);
  entry = entry.slice(0,end) + `globalThis[Symbol.for('renderer-probe')] = { hostBus, hostMinigames, hostDesktop, vizFactoryFor, loadScriptOnce, borrowHostViz, resolveRendererFactory, makeClassic2DHighwayRenderer, makeBuiltin2DRenderer, makeBuiltin2DTabRenderer, makeBuiltin2DNotationRenderer };\n` + entry.slice(end);
}
if (localRendererSnapshot) {
  const end = entry.lastIndexOf('})();');
  entry = entry.slice(0,end) + `globalThis[Symbol.for('local-renderer-probe')] = { makeBuiltin2DTabRenderer, makeBuiltin2DNotationRenderer, setRenderTheme };\n` + entry.slice(end);
}
if (workoutEditorSnapshot || controls.lifecycle === 'editor-page-events') {
  const end = entry.lastIndexOf('})();');
  entry = entry.slice(0,end) + `globalThis[Symbol.for('workout-editor-probe')] = { loadStarter, loadRoutine, editor: typeof workoutEditor !== 'undefined' ? workoutEditor : undefined, draft: () => typeof workoutEditor !== 'undefined' ? workoutEditor.draft : _workoutDraft };\n` + entry.slice(end);
}
// Historical probes used entry imports as lexical access. Cleanup must not force
// production to retain unused bindings just to serve the characterization harness.
if (!baseline && !captureEntryPath) {
  const imports = parse(entry, { ecmaVersion: 2022, sourceType: 'module' }).body.filter(node => node.type === 'ImportDeclaration');
  const bound = new Set(imports.flatMap(node => node.specifiers.map(specifier => specifier.local.name)));
  const needed = new Set();
  if (rendererSnapshot) {
    for (const name of ['vizFactoryFor', 'borrowHostViz']) needed.add(name);
    entry += `\nimport { makeClassic2DHighwayRenderer } from './src/shell/renderers/classic-2d.js';\n`;
  }
  if (sessionGeneration) for (const name of (await import('./session-generation.mjs')).sessionNames) needed.add(name);
  if (generationCluster) for (const name of (await import('./generation-cluster.mjs')).clusterNames) needed.add(name);
  if (backingCluster) for (const name of (await import('./backing-cluster.mjs')).backingNames) needed.add(name);
  if (generationFoundation) for (const name of (await import('./generation-foundation.mjs')).foundationNames) needed.add(name);
  if (controls.chromaticBuilderSnapshot) for (const name of ['CHROMATIC_PATTERNS', 'buildChromaticExercise', 'noteDefaults', 'wholeCycleStepCount', 'applyAlternatePicking', 'applyBluegrassPicking', 'applyCellStrokes', 'applyStrokePolicy']) needed.add(name);
  if (controls.fretboardShapeSnapshot || controls.fretboardShapeIdentity) for (const name of ['lowestFretWithPc', 'scaleSemitones', 'scaleFingerFor', 'threeNpsStringFingers']) needed.add(name);
  for (const node of imports) {
    const module = await import(pathToFileURL(resolve(root, node.source.value)));
    const names = Object.keys(module).filter(name => needed.has(name) && !bound.has(name));
    if (!names.length) continue;
    entry += `\nimport { ${names.join(',')} } from ${JSON.stringify(node.source.value)};\n`;
    for (const name of names) bound.add(name);
  }
}
if (sessionGeneration) {
  const { sessionNames } = await import('./session-generation.mjs');
  const end = entry.lastIndexOf('})();');
  assert.ok(end > 0);
  entry = entry.slice(0,end) + `globalThis[Symbol.for('session-generation')] = { ${sessionNames.join(',')} };\n` + entry.slice(end);
}
if (generationCluster) {
  const { clusterNames } = await import('./generation-cluster.mjs');
  const end = entry.lastIndexOf('})();');
  assert.ok(end > 0);
  entry = entry.slice(0,end) + `globalThis[Symbol.for('generation-cluster')] = { ${clusterNames.join(',')} };\n` + entry.slice(end);
}
if (backingCluster) {
  const { backingNames } = await import('./backing-cluster.mjs');
  const end = entry.lastIndexOf('})();');
  assert.ok(end > 0);
  entry = entry.slice(0,end) + `globalThis[Symbol.for('backing-cluster')] = { ${backingNames.join(',')} };\n` + entry.slice(end);
}
if (generationFoundation) {
  const { foundationNames } = await import('./generation-foundation.mjs');
  const end = entry.lastIndexOf('})();');
  assert.ok(end > 0);
  entry = entry.slice(0,end) + `globalThis[Symbol.for('generation-foundation')] = { ${foundationNames.join(',')} };\n` + entry.slice(end);
}
if (controls.chromaticBuilderSnapshot) {
  const end = entry.lastIndexOf('})();');
  assert.ok(end > 0);
  entry = entry.slice(0,end) + `globalThis[Symbol.for('chromatic-builder-probe')] = { CHROMATIC_PATTERNS, CHROMATIC_PATTERN_LABELS, buildChromaticExercise, noteDefaults, wholeCycleStepCount, applyAlternatePicking, applyEconomyPicking, applyGypsyPicking, applyBluegrassPicking, applyMetalPicking, applyBassPlucking, applyCellStrokes, applyStrokePolicy };\n` + entry.slice(end);
}
if (controls.fretboardShapeSnapshot || controls.fretboardShapeIdentity) {
  const end = entry.lastIndexOf('})();');
  assert.ok(end > 0);
  entry = entry.slice(0, end) + `globalThis[Symbol.for('fretboard-shape-probe')] = { CAGED_SHAPES, CAGED_CYCLE, THREE_NPS_POSITION_DEFS, THREE_NPS_CYCLE, openPcForString, lowestFretWithPc, scaleSemitones, pcOfDegree, degreeOfPc, scaleFingerFor, threeNpsStringFingers, resolveCAGEDShape, resolveThreeNPSPosition, resolveOpenShape, isOpenSystemSensible, fretWindowForShape, shapeOrderForKey, nextShapeInCycle, defaultShapeForSystem, isShapeAwareSystem, resolveCurrentShape };\n` + entry.slice(end);
}
if (controls.instrumentTuningSnapshot) {
  // Test-only access to lexical bindings; the complete entry still evaluates, with no sliced subjects.
  const end = entry.lastIndexOf('})();');
  assert.ok(end > 0);
  entry = entry.slice(0, end) + `globalThis[Symbol.for('instrument-tuning-probe')] = { STRING_SETUPS, TUNING_PRESETS, TUNING_TO_SETUP, openMidisForConfig, tuningOffsetsForConfig, isBassCfg, hostStandardMidisFor, parseNoteName, midiToNoteName };\n` + entry.slice(end);
}
entry = entry.replace(/(import\s+[^;]+?\s+from\s+)(['"])(\.\/[^'"]+)\2/g, (_, prefix, quote, file) => {
  const url = baseline ? dataUrl(read(file.slice(2))) : pathToFileURL(resolve(root, file)).href;
  return prefix + quote + url + quote;
});
try { await import(dataUrl(entry)); } catch (error) { console.error(error.message); process.exit(1); }
assert.ok(startupAssertions > 0, 'entry startup assertions executed');
const api = window[lab ? 'VirtuosoLab' : 'Virtuoso'];
const debug = globalThis[lab ? '__virtuoso_lab_debug' : '__ss_debug'];
assert.ok(api && debug, 'public and debug APIs publish synchronously at entry evaluation');
assert.equal(window[lab ? 'Virtuoso' : 'VirtuosoLab'], undefined);
assert.equal(listeners.length, 1);
assert.equal(listeners[0][0], 'DOMContentLoaded');
assert.deepEqual(listeners[0][2], { once: true });
if (rendererSnapshot) {
  const { rendererIntegrationSnapshot } = await import('./renderer-integration.mjs');
  const snapshot = await rendererIntegrationSnapshot(globalThis[Symbol.for('renderer-probe')], lab);
  await new Promise(resolve => process.stdout.write(JSON.stringify(snapshot), resolve));
  process.exit(0);
}
if (localRendererSnapshot) {
  const { localRenderingSnapshot } = await import('./local-rendering.mjs');
  let factories = globalThis[Symbol.for('local-renderer-probe')];
  if (localRendererDirect) {
    const tab = await import(pathToFileURL(resolve(root,'src/shell/renderers/tab.js')));
    const notation = await import(pathToFileURL(resolve(root,'src/shell/renderers/notation.js')));
    const { RENDER_THEMES } = await import(pathToFileURL(resolve(root,'src/shell/renderers/display-policy.js')));
    let theme = 'light';
    const prefs = {getRenderTheme:()=>RENDER_THEMES[theme],handMarksOn:()=>localStorage.getItem('virtuoso.showHandMarks') !== 'off'};
    factories = {makeBuiltin2DTabRenderer:()=>tab.makeBuiltin2DTabRenderer(prefs),makeBuiltin2DNotationRenderer:()=>notation.makeBuiltin2DNotationRenderer(prefs),setRenderTheme:name=>{theme=name;}};
  }
  const snapshot = localRenderingSnapshot({...api,...factories});
  await new Promise(resolve => process.stdout.write(JSON.stringify(snapshot),resolve));
  process.exit(0);
}
if (sessionGeneration) {
  const {sessionSnapshot} = await import('./session-generation.mjs');
  const core = globalThis[Symbol.for('session-generation')];
  delete globalThis[Symbol.for('session-generation')];
  if (entry.includes('src/core/session.js')) {
    const sessionCore = await import(pathToFileURL(resolve(root,'src/core/session.js')));
    const content = await import(pathToFileURL(resolve(root,'src/content/segments.js')));
    assert.equal(api.generateSession,sessionCore.generateSession);
    assert.equal(api.SEGMENT_TEMPLATES,content.SEGMENT_TEMPLATES);
  }
  for (const name of ['window','document','localStorage','sessionStorage','fetch','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{configurable:true,get(){throw Error('core host access: '+name)}});
  Math.random = () => { throw Error('ambient RNG'); };
  const snapshot = sessionSnapshot({...api,...core});
  await new Promise(resolve=>process.stdout.write(JSON.stringify(snapshot),resolve));
  process.exit(0);
}
if (backingCluster) {
  const { backingClusterSnapshot } = await import('./backing-cluster.mjs');
  const core=globalThis[Symbol.for('backing-cluster')];
  delete globalThis[Symbol.for('backing-cluster')];
  for(const name of ['window','document','localStorage','sessionStorage','fetch','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{configurable:true,get(){throw Error('core host access: '+name)}});
  const snapshot=backingClusterSnapshot(core);
  await new Promise(resolve=>process.stdout.write(JSON.stringify(snapshot),resolve));
  process.exit(0);
}
if (generationCluster) {
  const { generationClusterSnapshot } = await import('./generation-cluster.mjs');
  const core = globalThis[Symbol.for('generation-cluster')];
  delete globalThis[Symbol.for('generation-cluster')];
  const tuning = await import(pathToFileURL(resolve(root,'src/core/instrument-tuning.js')));
  for (const name of ['window','document','localStorage','sessionStorage','fetch','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{configurable:true,get() { throw Error('core host access: '+name); }});
  const snapshot = generationClusterSnapshot(core,tuning);
  await new Promise(resolve=>process.stdout.write(JSON.stringify(snapshot),resolve));
  process.exit(0);
}
if (generationFoundation) {
  const { generationFoundationSnapshot } = await import('./generation-foundation.mjs');
  const tuning = await import(pathToFileURL(resolve(root,'src/core/instrument-tuning.js')));
  const shapes = await import(pathToFileURL(resolve(root,'src/core/fretboard-shapes.js')));
  const core = globalThis[Symbol.for('generation-foundation')];
  delete globalThis[Symbol.for('generation-foundation')];
  for (const path of ['random','sequence','positions','chart-grid','harmony','chord-positions','builders/scale','builders/technique','builders/arpeggio','builders/bass','builders/tapping','builders/guide-tones','builders/pedal-riff']) {
    if (!entry.includes('src/core/'+path+'.js')) continue;
    const module = await import(pathToFileURL(resolve(root,'src/core/'+path+'.js')));
    for (const name of Object.keys(module)) if (Object.hasOwn(core,name)) assert.equal(core[name],module[name],'entry shares native binding: '+name);
  }
  for (const name of ['window','document','localStorage','sessionStorage','fetch','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{ configurable:true,get() { throw Error('core host access: ' + name); } });
  const snapshot = generationFoundationSnapshot(core,tuning,shapes,api);
  if (entry.includes('src/core/exercise.js')) {
    const exerciseCore = await import(pathToFileURL(resolve(root,'src/core/exercise.js')));
    assert.equal(api.generateExercise,exerciseCore.generateExercise,'synchronous API shares native generator');
    const dispatch = await import(pathToFileURL(resolve(root,'src/core/exercise-dispatch.js')));
    assert.equal(core.buildSingleChart,dispatch.buildSingleChart);
    // Public generation is the exact native function, not an entry wrapper.
    // Do not reroll Workouts here: their ambient variant RNG is intentionally
    // consumed once in the independently captured complete snapshot.
  }
  await new Promise(resolve => process.stdout.write(JSON.stringify(snapshot),resolve));
  process.exit(0);
}
if (controls.chromaticBuilderSnapshot) {
  const core = globalThis[Symbol.for('chromatic-builder-probe')];
  delete globalThis[Symbol.for('chromatic-builder-probe')];
  const { chromaticBuilderSnapshot } = await import('./chromatic-builder.mjs');
  const tuning = await import(pathToFileURL(resolve(root,'src/core/instrument-tuning.js')));
  if (entry.includes('./src/core/builders/chromatic.js') || entry.includes('src/core/builders/chromatic.js')) {
    const builder = await import(pathToFileURL(resolve(root,'src/core/builders/chromatic.js')));
    for (const name of ['CHROMATIC_PATTERNS','CHROMATIC_PATTERN_LABELS','buildChromaticExercise']) assert.equal(core[name],builder[name],'entry shares imported binding: ' + name);
  }
  for (const name of ['window','document','localStorage','sessionStorage','fetch','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{ configurable:true,get() { throw Error('core host access: ' + name); } });
  const snapshot = chromaticBuilderSnapshot(core,tuning,api.generateExercise,api.makeBundle,api.generateSession);
  await new Promise(resolve => process.stdout.write(JSON.stringify(snapshot),resolve));
  process.exit(0);
}
if (controls.fretboardShapeSnapshot || controls.fretboardShapeIdentity) {
  const probe = globalThis[Symbol.for('fretboard-shape-probe')];
  delete globalThis[Symbol.for('fretboard-shape-probe')];
  if (controls.fretboardShapeIdentity) {
    const core = await import(pathToFileURL(resolve(root, 'src/core/fretboard-shapes.js')));
    const published = window[lab ? '__virtuoso_labShapes' : '__virtuosoShapes'];
    for (const name of Object.keys(published)) assert.equal(published[name], core[name], name);
    assert.equal(debug.resolveThreeNPSPosition, core.resolveThreeNPSPosition);
    process.stdout.write(JSON.stringify({ fretboardShapeIdentity:true }));
  } else {
    const { fretboardShapeSnapshot } = await import('./fretboard-shapes.mjs');
    const tuning = await import(pathToFileURL(resolve(root, 'src/core/instrument-tuning.js')));
    for (const setup of Object.values(tuning.STRING_SETUPS).filter(s => s.instrument === 'bass')) {
      for (const fretboardSystem of ['caged','3nps','open']) assert.equal(probe.resolveCurrentShape({ instrument:'bass',fretboardSystem,key:'C',scale:'major',shape:1 },setup.openMidis),null);
    }
    for (const name of ['window','document','localStorage','sessionStorage','fetch']) Object.defineProperty(globalThis,name,{ configurable:true,get() { throw Error('core host access: ' + name); } });
    const snapshot = fretboardShapeSnapshot(probe,tuning,api.generateExercise,probe.resolveCurrentShape);
    await new Promise(resolve => process.stdout.write(JSON.stringify(snapshot),resolve));
  }
  process.exit(0);
}
if (controls.instrumentTuningSnapshot) {
  const { instrumentTuningSnapshot } = await import('./instrument-tuning.mjs');
  const core = globalThis[Symbol.for('instrument-tuning-probe')];
  delete globalThis[Symbol.for('instrument-tuning-probe')];
  process.stdout.write(JSON.stringify(instrumentTuningSnapshot(core)));
  process.exit(0);
}
if (controls.instrumentTuningIdentity) {
  const core = await import(pathToFileURL(resolve(root, 'src/core/instrument-tuning.js')));
  assert.equal(debug.STRING_SETUPS, core.STRING_SETUPS);
  process.stdout.write(JSON.stringify({ instrumentTuningIdentity:true }));
  process.exit(0);
}
if (controls.workoutSnapshot) {
  await new Promise(resolve => process.stdout.write(JSON.stringify(api.BUILT_IN_SESSIONS), resolve));
  process.exit(0);
}
if (controls.workoutIdentity) {
  const { BUILT_IN_SESSIONS } = await import(pathToFileURL(resolve(root, 'src/content/workouts.js')));
  assert.equal(api.BUILT_IN_SESSIONS, BUILT_IN_SESSIONS);
  assert.equal(Object.keys(BUILT_IN_SESSIONS)[0], 'starter_arc');
  const saved = JSON.stringify(BUILT_IN_SESSIONS);
  for (const [id, session] of Object.entries(BUILT_IN_SESSIONS)) {
    assert.match(id, /^[a-z][a-z0-9_]*$/);
    assert.equal(session.version, 1);
    assert.ok(session.name && session.description && session.segments.length);
    assert.ok(debug.STRING_SETUPS[session.stringSetup], id);
    for (const segment of session.segments) {
      if (segment.templateId) assert.ok(api.SEGMENT_TEMPLATES[segment.templateId], `${id}: ${segment.templateId}`);
      else assert.ok(segment.kind && segment.config, `${id}: inline segment`);
    }
  }
  const clone = JSON.parse(saved);
  clone.starter_arc.segments[0].config.bpm++;
  assert.equal(JSON.stringify(BUILT_IN_SESSIONS), saved, 'draft edits leave the registry unchanged');
  process.stdout.write(JSON.stringify({ workoutIdentity:true }));
  process.exit(0);
}
if (controls.pathwaySnapshot) {
  await new Promise(resolve => process.stdout.write(JSON.stringify(debug.lifecycle.pathways), resolve));
  process.exit(0);
}
if (controls.pathwayIdentity) {
  const { PATHWAYS } = await import(pathToFileURL(resolve(root, 'src/content/pathways.js')));
  const { parsePracticeMarkdown, practicePathwayEntry } = await import(pathToFileURL(resolve(root, 'src/core/practice-files.js')));
  const exported = PATHWAYS;
  const published = debug.lifecycle.pathways;
  const rows = Object.entries(PATHWAYS);
  assert.equal(published, exported);
  assert.equal(Object.hasOwn(exported, 'chromatic_warmup'), false);
  const saved = JSON.stringify(exported);
  const fetchBefore = globalThis.fetch;
  window.location = { href:'http://localhost/' };
  let requests = 0;
  globalThis.fetch = async url => {
    requests++;
    const path = 'assets/practices/' + String(url).split('/assets/practices/')[1];
    return { ok:true, headers:{ get:() => null }, text:async () => read(path) };
  };
  try {
    await debug.lifecycle.initialize();
    assert.equal(debug.lifecycle.pathways, exported);
    assert.equal((await import(pathToFileURL(resolve(root, 'src/content/pathways.js')))).PATHWAYS, exported);
    const authored = parsePracticeMarkdown(read('assets/practices/guitar/beginner/chromatic-warmup-ladder.md'));
    assert.ok(exported.chromatic_warmup, 'catalog hydrated authored Warmup');
    assert.deepEqual(exported.chromatic_warmup, practicePathwayEntry(authored));
    assert.equal(Object.keys(exported).length, 152);
    for (const [id, row] of rows) assert.equal(exported[id], row, id);
    const hydrated = exported.chromatic_warmup;
    const requestCount = requests;
    await debug.lifecycle.initialize();
    assert.equal(exported.chromatic_warmup, hydrated);
    assert.equal(requests, requestCount, 'successful hydration remains cached');
  } finally {
    delete exported.chromatic_warmup;
    globalThis.fetch = fetchBefore;
  }
  assert.equal(JSON.stringify(exported), saved);
  process.stdout.write(JSON.stringify({ pathwayIdentity:true }));
  process.exit(0);
}
if (controls.lifecycle || workoutEditorSnapshot) {
  const { runLifecycle } = await import('./lifecycle.mjs');
  const snapshot = await runLifecycle({ root, api, debug, lab, scenario: workoutEditorSnapshot ? 'editor-capture' : controls.lifecycle, boot:listeners[0][1] });
  await new Promise(resolve => process.stdout.write(JSON.stringify(workoutEditorSnapshot ? snapshot : { lifecycle: controls.lifecycle }), resolve));
  process.exit(0);
}
if (controls.chromaticProbe) {
  const { parsePracticeMarkdown, practicePathwaySelection } = await import(pathToFileURL(resolve(root, 'src/core/practice-files.js')));
  const practice = parsePracticeMarkdown(read('assets/practices/guitar/beginner/chromatic-warmup-ladder.md'));
  const fixture = JSON.parse(readFileSync(new URL('../fixtures/chromatic-warmup-before-migration.json', import.meta.url), 'utf8'));
  for (const [i, expected] of fixture.cases.entries()) {
    const selected = practicePathwaySelection(practice, Math.floor(i / 4), i % 4);
    const cfg = { ...expected.cfg, ...selected, meter:expected.cfg.meter };
    reset();
    const exercise = api.generateExercise(cfg);
    assert.deepEqual(exercise.chart, expected.exercise.chart, `variation ${Math.floor(i / 4)} tier ${i % 4}: entire raw chart`);
    for (const [key, value] of Object.entries(expected.cfg)) assert.deepEqual(exercise.session[key], value, `session ${key}`);
    assert.equal(exercise.session.practicePathwayId, 'chromatic_warmup');
    const bundle = api.makeBundle(exercise);
    assert.deepEqual(bundle.notes.filter(n => !n._tail), expected.bundleNotes);
    assert.equal(bundle.leadIn, expected.leadIn);
    assert.deepEqual(api.generateExercise(cfg), exercise, 'deterministic replay');
  }
  process.stdout.write(JSON.stringify({ chromaticProbe:true, cases:fixture.cases.length }));
  process.exit(0);
}
if (controls.practiceFileProbe) {
  const { parsePracticeMarkdown } = await import(pathToFileURL(resolve(root, 'src/core/practice-files.js')));
  const practice = parsePracticeMarkdown(read('assets/practices/guitar/beginner/chromatic-warmup.md'));
  const cfg = { practiceFile:practice, instrument:'guitar', stringSetup:'guitar_6_standard', stringCount:6, bpm:120, countInBars:1, renderer:'builtin_2d', audio:{ notes:true, metronome:true, harmony:true }, swing:'shuffle', bars:32, keyCycle:'fourths', targetSec:60 };
  const exercise = api.generateExercise(cfg);
  assert.equal(exercise.chart.duration, 2);
  assert.deepEqual(exercise.chart.notes, practice.variants[0].notes.map(n => ({ ...n, t:n.t / 2 })));
  assert.ok(exercise.chart.beats.length > 0);
  const bundle = api.makeBundle(exercise);
  assert.equal(bundle.leadIn, 2);
  assert.equal(bundle.songInfo.duration, 4);
  assert.equal(bundle.songInfo.title, practice.title);
  assert.deepEqual(bundle.notes.filter(n => !n._tail), practice.variants[0].notes.map(n => ({ ...n, t:2 + n.t / 2 })));
  assert.deepEqual(bundle.backingEvents, []);
  assert.deepEqual(bundle.openMidis, [40,45,50,55,59,64]);
  assert.equal(exercise.chart.notes[0].t, 0);
  for (const variant of practice.variants) {
    const selected = api.generateExercise({ ...cfg, practiceVariantId:variant.id });
    assert.equal(selected.session.practiceFileVariantId, variant.id);
    assert.equal(selected.chart.duration, variant.duration / 2);
    assert.deepEqual(selected.chart.notes, variant.notes.map(n => ({ ...n, t:n.t / 2, sus:n.sus / 2 })));
    assert.deepEqual(api.makeBundle(selected).notes.filter(n => !n._tail), variant.notes.map(n => ({ ...n, t:2 + n.t / 2, sus:n.sus / 2 })));
  }
}
if (controls.audioRemoval) {
  const audio = debug.audioRemoval;
  const channels = ['notes', 'harmony', 'pad', 'comp2'];
  const saved = { ch: Object.fromEntries(channels.map(k => [k, { instrument: '8ridge', level: 0.73, amp: 'metal' }])) };
  globalThis.localStorage.getItem = key => key.endsWith('.mixer') ? JSON.stringify(saved) : null;
  audio.mixerLoad();
  for (const key of channels) {
    assert.equal(debug.mixerStateRef()[key].instrument, 'shiny');
    assert.equal(debug.mixerStateRef()[key].level, 0.73);
    assert.equal(audio.sgToneFor(key), 'shiny');
    assert.equal(debug.liveInstrumentReady(key), true);
    assert.equal(debug.resolveAmpId(key, 'shiny', {}), 'metal');
  }
  for (const resolveBank of [debug.sgNotesWanted, debug.sgHarmWanted, debug.sgPadWanted]) assert.equal(resolveBank({}), 'shiny');
  assert.equal(debug.SAMPLE_BANKS['8ridge'], undefined);
  assert.ok(!audio.MIXER_INSTRUMENTS.melodic.some(([id]) => id === '8ridge'));
  assert.deepEqual(debug.sgFilesFor(28, 1, '8ridge'), debug.sgFilesFor(28, 1, 'shiny'));
  assert.ok(debug.sgFilesFor(28, 1, '8ridge').every(f => f.startsWith('sg_')));
  for (const key of channels) {
    debug.mixerStateRef()[key].instrument = null;
    debug.mixerStateRef()[key].amp = null;
  }
  assert.equal(debug.sgNotesWanted({ notes: { sg: true } }), 'shiny');
  assert.equal(debug.sgHarmWanted({ harmony: { sg: true } }), 'shiny');
  assert.equal(debug.sgPadWanted({ pad: { bank: 'salamander' } }), 'salamander');
  assert.equal(debug.resolveAmpId('pad', 'salamander', {}), null);
  delete debug.mixerStateRef().notes.amp;
  assert.equal(debug.resolveAmpId('notes', 'shiny', {}), 'clean');
  const node = () => ({ frequency: {}, Q: {}, gain: {}, threshold: {}, ratio: {}, attack: {}, release: {}, knee: {}, connect() {} });
  const ctx = {
    sampleRate: 48000, createBiquadFilter: node, createWaveShaper: node,
    createGain: node, createConvolver: node, createDynamicsCompressor: node,
    createBuffer: (channels, length, sampleRate) => ({ length, sampleRate, getChannelData: () => new Float32Array(length) })
  };
  globalThis.fetch = () => { throw new Error('metal must not fetch a removed cab'); };
  const preset = audio.AMP_PRESETS.metal;
  assert.equal(preset.ir, undefined);
  assert.deepEqual([preset.preHp, preset.drive, preset.curve, preset.makeup, preset.comp], [110, 16, 'hard', 0.38, [-16, 3, 0.008, 0.12]]);
  const chain = audio.buildAmpChain(ctx, preset, 'metal');
  const cab = chain.nodes.find(n => n.buffer);
  assert.ok(cab);
  assert.equal(cab.buffer, audio.cabIrBuffer(ctx));
  assert.equal(cab.buffer.length, 2400);
  assert.deepEqual(debug.irState(), {});
  process.stdout.write(JSON.stringify({ audioRemoval: true }));
  process.exit(0);
}
const publicKeys = Object.keys(api).sort();
const debugKeys = Object.keys(debug).sort();
for (const name of ['window', 'document', 'localStorage', 'fetch', 'feedBack', 'slopsmith', 'noteDetect', 'sessionStorage']) {
  Object.defineProperty(globalThis, name, { configurable: true, get() { throw new Error(`core host access: ${name}`); } });
}

const base = {
  practiceType: 'scale', key: 'C', scale: 'major', bpm: 96, bars: 2,
  direction: 'up_down', sequence: 'none', meter: { numerator: 4, denominator: 4, grouping: [4] },
  subdivision: 'eighth', fretboardSystem: 'position', shape: 'E', fretMin: 0, fretMax: 12,
  stringSetup: 'guitar_6_standard', openMidis: [40,45,50,55,59,64], tuning: [0,0,0,0,0,0],
  chordDepth: 'seventh', progression: 'ii-V-I', chordOverride: 'auto',
  chordScaleStrategy: 'mode_of_moment', chromaticPattern: '1234', keyCycle: 'none',
  repeatCount: 1, advancedMode: true, voices: 'thirds_only', humanSeed: 12345,
  audio: { notes: false, metronome: true, harmony: false },
};
const cases = [];
const add = (id, cfg) => cases.push([id, () => {
  const config = { ...base, ...cfg };
  config.stringCount = config.openMidis.length;
  config.instrument = config.stringSetup.startsWith('bass') ? 'bass' : 'guitar';
  return api.generateExercise(config);
}]);
const scales = ['major','natural_minor','harmonic_minor','melodic_minor','minor_pentatonic','major_pentatonic','blues','bebop_major','bebop_dominant','bebop_dorian','dorian','phrygian','lydian','mixolydian','locrian','phrygian_dominant','lydian_dominant','whole_tone','diminished','dorian_b2','lydian_augmented','mixolydian_b6','locrian_sharp2','altered','half_whole_dim','double_harmonic','hungarian_minor','neapolitan_minor'];
for (const scale of scales) add(`scale/${scale}`, { scale, key: 'F#', direction: 'up' });
for (const [setup, data] of Object.entries(debug.STRING_SETUPS)) {
  add(`strings/${setup}`, { stringSetup: setup, openMidis: data.openMidis, tuning: data.tuning, fretboardSystem: 'position', direction: 'up' });
  // Bass intentionally uses position boxes; mirror readConfig's guitar resolver
  // contract rather than passing a 3nps token that silently falls back.
  if (data.instrument !== 'guitar') continue;
  const resolved = debug.resolveThreeNPSPosition(0, 1, 'major', data.openMidis);
  assert.equal(resolved.notes.length, data.openMidis.length * 3, setup);
  add(`3nps/${setup}`, {
    stringSetup: setup, openMidis: data.openMidis, tuning: data.tuning,
    fretboardSystem: '3nps', shape: 1, shapeNotes: resolved.notes,
    shapeDisplayName: resolved.displayName, fretMin: resolved.fretMin,
    fretMax: resolved.fretMax, bars: 3, direction: 'up',
  });
}
add('tuning/drop-c', { openMidis: [36,43,48,53,57,62], customOpenMidis: [36,43,48,53,57,62], tuning: [-4,-2,-2,-2,-2,-2] });
add('scale/random-sequence', { direction: 'random', sequence: 'thirds', scale: 'dorian' });
add('arpeggio/extended', { practiceType: 'arpeggio', chordOverride: 'dom13' });
add('chord-scale/connect', { practiceType: 'chord_scales', chordScaleStrategy: 'mode_of_moment' });
add('rhythm/odd-gallop', { practiceType: 'rhythm_pulse', meter: { numerator: 7, denominator: 8, grouping: [2,2,3] }, subdivision: 'gallop' });
add('technique/herta', { practiceType: 'herta', subdivision: 'sixteenth' });
add('scale/key-cycle', { keyCycle: 'circle_of_fourths', bars: 1 });
for (const [id, session] of Object.entries(api.BUILT_IN_SESSIONS)) cases.push([`session/${id}`, () => api.generateSession(session)]);
assert.equal(Object.keys(api.BUILT_IN_SESSIONS).length, 25);
const results = {};
for (const [id, generate] of cases) {
  reset();
  let exercise;
  try { exercise = generate(); } catch (error) { throw new Error(`${id}: ${error.message}`); }
  assert.ok(!exercise.then, `${id}: synchronous generation`);
  assert.equal(exercise.version, 1);
  assert.ok(exercise.session && exercise.chart);
  const chart = exercise.chart;
  if (!id.startsWith('session/')) {
    assert.equal(exercise.session.tuning.length, exercise.session.stringCount, `${id}: tuning/string count`);
  }
  assert.ok(Number.isFinite(chart.duration) && chart.duration > 0, id);
  assert.ok(Array.isArray(chart.notes) && Array.isArray(chart.chords), id);
  assert.ok(chart.notes.length || chart.chords.length, `${id}: nonempty music`);
  for (const note of chart.notes) {
    assert.ok(Number.isFinite(note.t) && Number.isFinite(note.f), id);
    assert.ok(Number.isInteger(note.s) && note.s >= 0 && note.s < (exercise.session.openMidis?.length || 8), id);
  }
  // Adjacent-pitch checks apply only to one-way scalar runs: turns/repetitions,
  // chords, percussion, and pedal-point technique drills legitimately repeat.
  if (id.startsWith('scale/') && id !== 'scale/random-sequence' && id !== 'scale/key-cycle') {
    for (let i = 1; i < chart.notes.length; i++) {
      const a = chart.notes[i-1], b = chart.notes[i];
      assert.notEqual(exercise.session.openMidis[a.s] + a.f, exercise.session.openMidis[b.s] + b.f, `${id}: adjacent unison`);
    }
  }
  if (id.startsWith('3nps/')) {
    const resolved = debug.resolveThreeNPSPosition(0, 1, 'major', exercise.session.openMidis);
    const positions = chart.notes.map(({ s, f, fg }) => ({ s, f, fg }));
    assert.deepEqual(positions.slice(0, resolved.notes.length), resolved.notes.map(({ s, f, fg }) => ({ s, f, fg })), `${id}: generated run consumes resolved shape and fingering`);
    for (let s = 0; s < exercise.session.stringCount; s++) {
      assert.equal(new Set(positions.filter(n => n.s === s).map(n => n.f)).size, 3, `${id}: three distinct frets per string`);
    }
  }
  const replayJson = JSON.stringify(exercise);
  reset();
  assert.equal(JSON.stringify(generate()), replayJson, `${id}: deterministic replay`);
  if (controls.mutateRawNote && id === 'scale/major') chart.notes[0].t += 0.001;
  const json = JSON.stringify(exercise);
  results[id] = {
    sha256: createHash('sha256').update(json).digest('hex'),
    duration: chart.duration, notes: chart.notes.length, chords: chart.chords.length,
    ...( ['scale/major', 'rhythm/odd-gallop', 'technique/herta'].includes(id) ? { firstNotes: chart.notes.slice(0, 2) } : {} ),
    ...(id.startsWith('session/') ? {} : { tuning: exercise.session.tuning, openMidis: exercise.session.customOpenMidis || exercise.session.openMidis }),
  };
}
process.stdout.write(JSON.stringify({ seed, fixedDate: Date.now(), publicKeys, debugKeys, results }));
