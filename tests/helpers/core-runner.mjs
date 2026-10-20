import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { format } from 'node:util';

process.on('uncaughtException', error => { console.error(error.message); process.exit(1); });

// Each invocation is a fresh process: module caches, globals and RNG cannot leak
// between the baseline, source and renamed Lab namespaces.
const [root, baseline, controlsJson = '{}'] = process.argv.slice(2);
const controls = JSON.parse(controlsJson);
assert.ok(Object.keys(controls).every(key => ['failStartupAssertion', 'mutateRawNote', 'audioRemoval'].includes(key)), 'unknown harness control');
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
let entry = read('screen.js');
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
