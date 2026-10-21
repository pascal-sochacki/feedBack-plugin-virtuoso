import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { format } from 'node:util';

process.on('uncaughtException', error => { console.error(error.stack?.replace(/data:text[^\s)]+:(\d+):(\d+)/g, 'entry:$1:$2') || error.message); process.exit(1); });

// Each invocation is a fresh process: module caches, globals and RNG cannot leak
// between the source and renamed Lab namespaces.
const [root, controlsJson = '{}'] = process.argv.slice(2);
const controls = JSON.parse(controlsJson);
const entrySafety = controls.entrySafety;
delete controls.entrySafety;
assert.ok(Object.keys(controls).every(key => ['failStartupAssertion', 'audioRemoval', 'lifecycle', 'pathwayIdentity', 'workoutIdentity'].includes(key)), 'unknown harness control');
let startupAssertions = 0;
// Node only logs console.assert failures; source startup guards must gate CI.
console.assert = (condition, ...args) => {
  startupAssertions++;
  if (controls.failStartupAssertion && startupAssertions === 1) condition = false;
  assert.ok(condition, format(...args));
};
const read = file => readFileSync(resolve(root, file), 'utf8');
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
const lab = JSON.parse(read('plugin.json')).id === 'virtuoso_lab';
globalThis[lab ? '__VIRTUOSO_LAB_HARNESS__' : '__SS_HARNESS__'] = true;

// Only static import URLs change to accommodate the browser-selected root .js
// entry in Node. The complete IIFE and real leaf modules execute, unsliced.
let entry = read('screen.js');
if (entrySafety) {
  const end = entry.lastIndexOf('})();');
  entry = entry.slice(0,end) + `globalThis[Symbol.for('entry-safety')] = {makeBuiltin2DRenderer, goScreen, bind};\n` + entry.slice(end);
}
if (controls.lifecycle === 'editor-page-events') {
  const end = entry.lastIndexOf('})();');
  entry = entry.slice(0,end) + `globalThis[Symbol.for('workout-editor-probe')] = { loadStarter, loadRoutine, editor: typeof workoutEditor !== 'undefined' ? workoutEditor : undefined, draft: () => typeof workoutEditor !== 'undefined' ? workoutEditor.draft : _workoutDraft };\n` + entry.slice(end);
}
entry = entry.replace(/(import\s+[^;]+?\s+from\s+)(['"])(\.\/[^'"]+)\2/g, (_, prefix, quote, file) =>
  prefix + quote + pathToFileURL(resolve(root, file)).href + quote);
try { await import(dataUrl(entry)); } catch (error) { console.error(error.message); process.exit(1); }
assert.ok(startupAssertions > 0, 'entry startup assertions executed');
const api = window[lab ? 'VirtuosoLab' : 'Virtuoso'];
const debug = globalThis[lab ? '__virtuoso_lab_debug' : '__ss_debug'];
if (entrySafety) {
  if (entrySafety === 'host-navigation') {
    const calls = [];
    const bus = {navigate:id => calls.push(id)};
    let reads = 0;
    Object.defineProperty(window, 'feedBack', {configurable:true, get:() => ++reads === 1 ? bus : null});
    assert.doesNotThrow(() => globalThis[Symbol.for('entry-safety')].goScreen('settings'));
    assert.deepEqual(calls, ['settings']);
    process.stdout.write(JSON.stringify({entrySafety:'host-navigation'}));
    process.exit(0);
  }
  const factory = globalThis[Symbol.for('entry-safety')].makeBuiltin2DRenderer;
  const renderer = factory();
  let destroyOnResize = false;
  const canvas = {width:640,height:420,getContext:()=>({}),parentElement:{getBoundingClientRect(){
    if (destroyOnResize) renderer.destroy();
    return {width:640,height:420};
  }}};
  window.addEventListener = () => {};
  window.removeEventListener = () => {};
  renderer.init(canvas);
  destroyOnResize = true;
  assert.doesNotThrow(() => renderer.draw({currentTime:0,notes:[],songInfo:{duration:1}}));
  process.stdout.write(JSON.stringify({entrySafety:true}));
  process.exit(0);
}
assert.ok(api && debug, 'public and debug APIs publish synchronously at entry evaluation');
assert.equal(window[lab ? 'Virtuoso' : 'VirtuosoLab'], undefined);
assert.equal(listeners.length, 1);
assert.equal(listeners[0][0], 'DOMContentLoaded');
assert.deepEqual(listeners[0][2], { once: true });
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
if (controls.lifecycle) {
  const { runLifecycle } = await import('./lifecycle.mjs');
  await runLifecycle({ root, api, debug, lab, scenario: controls.lifecycle, boot:listeners[0][1] });
  process.stdout.write(JSON.stringify({ lifecycle: controls.lifecycle }));
  process.exit(0);
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
    createBuffer: (_channels, length, sampleRate) => ({ length, sampleRate, getChannelData: () => new Float32Array(length) })
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
process.stdout.write(JSON.stringify({ publicKeys:Object.keys(api).sort(), debugKeys:Object.keys(debug).sort() }));
