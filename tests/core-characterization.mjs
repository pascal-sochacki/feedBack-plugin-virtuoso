import assert from 'node:assert/strict';
import { moduleEdges, checkNativeGraph } from '../scripts/native-module-graph.mjs';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import * as instrumentTuning from '../src/core/instrument-tuning.js';
import * as fretboardShapes from '../src/core/fretboard-shapes.js';
import { characterize } from './helpers/characterization.mjs';

test('fresh chromatic dependency graph traps IO/boot, preserves mutable tables and never mutates cfg', () => {
  const url = new URL('../src/core/builders/chromatic.js',import.meta.url).href;
  const strokesUrl = new URL('../src/core/stroke-policy.js',import.meta.url).href;
  const notesUrl = new URL('../src/core/notes.js',import.meta.url).href;
  execFileSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    for (const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{configurable:true,get(){throw Error('IO: '+name)}});
    Math.random = () => { throw Error('chromatic must not consume RNG'); };
    console.assert = () => { throw Error('boot guard moved'); };
    const core = await import(${JSON.stringify(url)});
    const again = await import(${JSON.stringify(url)});
    const strokes = await import(${JSON.stringify(strokesUrl)});
    const {noteDefaults} = await import(${JSON.stringify(notesUrl)});
    const cfg = Object.freeze({stringSetup:'guitar_6_standard',bpm:120,bars:1,meter:Object.freeze({numerator:4,denominator:4}),subdivision:'eighth',chromaticPattern:'1234',direction:'ascending',fretMin:1,customOpenMidis:Object.freeze([38,45,50,55,59,64])});
    const before = JSON.stringify(cfg);
    const chart = core.buildChromaticExercise(cfg);
    assert.equal(JSON.stringify(cfg),before);
    assert.equal(again.CHROMATIC_PATTERNS,core.CHROMATIC_PATTERNS);
    assert.equal(Object.getPrototypeOf(core.CHROMATIC_PATTERNS),Object.prototype);
    const offsets = core.CHROMATIC_PATTERNS['1234'];
    try {
      offsets[0] = 3;
      core.CHROMATIC_PATTERN_LABELS['1234'] = 'probe';
      const changed = core.buildChromaticExercise(cfg);
      assert.equal(changed.notes[0].f,4); assert.equal(changed.sections[0].name,'Chromatic probe');
    } finally { offsets[0] = 0; core.CHROMATIC_PATTERN_LABELS['1234'] = '1-2-3-4 (standard)'; }
    chart.notes[0].f = 99;
    assert.equal(core.buildChromaticExercise(cfg).notes[0].f,1,'fresh mutable output');
    const extra = {t:2,ac:true,custom:'kept'};
    const note = noteDefaults(extra);
    assert.notEqual(note,extra); assert.equal(note.custom,'kept');
    const notes = [{t:0,s:0,f:1},{t:0.25,s:0,f:2,ho:true},{t:0.5,s:1,f:1},{t:2,s:0,f:1}];
    assert.equal(strokes.applyStrokePolicy(notes,cfg,'alternate'),notes,'existing in-place annotation contract');
    assert.deepEqual(notes.map(n=>n.pkd),[0,undefined,1,0]);
    assert.throws(()=>core.buildChromaticExercise({...cfg,chromaticPattern:'toString'}),TypeError);
    assert.ok(Number.isNaN(core.buildChromaticExercise({...cfg,bars:NaN}).duration));
  `],{encoding:'utf8'});
});

test('fresh shape import/calls are host-independent, guard-free, mutable and dependency-shared', () => {
  const url = new URL('../src/core/fretboard-shapes.js',import.meta.url).href;
  const scalesUrl = new URL('../src/core/scale-intervals.js',import.meta.url).href;
  const tuningUrl = new URL('../src/core/instrument-tuning.js',import.meta.url).href;
  execFileSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    for (const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{ configurable:true,get() { throw Error('host access: ' + name); } });
    console.assert = () => { throw Error('startup assertion advanced into module'); };
    const core = await import(${JSON.stringify(url)});
    const again = await import(${JSON.stringify(url)});
    const { SCALE_INTERVALS } = await import(${JSON.stringify(scalesUrl)});
    const tuning = await import(${JSON.stringify(tuningUrl)});
    const before = JSON.stringify(core.CAGED_SHAPES);
    assert.equal(Object.getPrototypeOf(core.CAGED_SHAPES),Object.prototype);
    assert.equal(again.CAGED_SHAPES,core.CAGED_SHAPES);
    assert.equal(again.CAGED_CYCLE,core.CAGED_CYCLE);
    assert.equal(again.THREE_NPS_POSITION_DEFS,core.THREE_NPS_POSITION_DEFS);
    assert.equal(again.THREE_NPS_CYCLE,core.THREE_NPS_CYCLE);
    assert.equal(core.scaleSemitones('major'),SCALE_INTERVALS.major);
    const shape = core.CAGED_SHAPES.E;
    const span = shape.scaleFretSpanFromRoot;
    const template = shape.chordTemplates.maj;
    const finger = template[0].fg;
    const opens = [40,45,50,55,59,64];
    try {
      span[1]++;
      assert.equal(core.resolveCAGEDShape(7,'E','major',opens).fretMax,8);
      template[0].fg++;
      assert.equal(again.CAGED_SHAPES.E.chordTemplates.maj[0].fg,finger + 1);
      core.CAGED_SHAPES.__probe = shape;
      assert.deepEqual(core.resolveCAGEDShape(7,'__probe','major',opens),core.resolveCAGEDShape(7,'E','major',opens));
      assert.equal(delete core.CAGED_SHAPES.__probe,true);
      core.CAGED_CYCLE.push('E');
      assert.equal(core.shapeOrderForKey(7,'caged','major',opens).filter(s => s === 'E').length,2);
      core.THREE_NPS_POSITION_DEFS[1].displayName = 'probe';
      assert.equal(core.resolveThreeNPSPosition(0,1,'major',opens).displayName,'probe');
      core.THREE_NPS_CYCLE.push(1);
      assert.equal(core.shapeOrderForKey(0,'3nps','major',opens).length,8);
      SCALE_INTERVALS.major.push(1);
      assert.equal(core.degreeOfPc(0,1,'major'),8);
    } finally {
      span[1]--; template[0].fg = finger; delete core.CAGED_SHAPES.__probe;
      core.CAGED_CYCLE.pop(); core.THREE_NPS_CYCLE.pop();
      core.THREE_NPS_POSITION_DEFS[1].displayName = 'Position 1 (Ionian)'; SCALE_INTERVALS.major.pop();
    }
    assert.equal(JSON.stringify(core.CAGED_SHAPES),before);
    assert.equal(core.resolveCAGEDShape(0,'missing','major',opens),null);
    assert.throws(() => core.resolveCAGEDShape(0,'toString','major',opens),TypeError);
    assert.throws(() => core.resolveOpenShape(0,'toString',opens),TypeError);
    assert.equal(core.resolveThreeNPSPosition(0,0,'major',opens),null);
    assert.equal(core.resolveThreeNPSPosition(0,1,'major',[]).fretMin,Infinity);
    assert.equal(core.resolveThreeNPSPosition(0,1,'major',[]).fretMax,-Infinity);
    assert.ok(Number.isNaN(core.openPcForString(opens,8)));
    assert.equal(core.nextShapeInCycle(0,'3nps','1','major',opens),core.shapeOrderForKey(0,'3nps','major',opens)[0],'no new numeric coercion');
  `],{ encoding:'utf8' });
});

test('supported guitar shape pitch uniqueness, extended anchors and fingering remain meaningful', () => {
  const { STRING_SETUPS,openMidisForConfig } = instrumentTuning;
  for (const [id,setup] of Object.entries(STRING_SETUPS)) {
    if (setup.instrument !== 'guitar') continue;
    const opens = openMidisForConfig({ stringSetup:id });
    for (const key of [0,7,9]) for (const scale of ['major','natural_minor','minor_pentatonic','blues']) {
      for (const shape of fretboardShapes.CAGED_CYCLE) {
        const resolved = fretboardShapes.resolveCAGEDShape(key,shape,scale,opens);
        const midis = resolved.notes.map(n => opens[n.s] + n.f);
        assert.equal(new Set(midis).size,midis.length);
        assert.ok(resolved.notes.length > 0);
        for (const note of resolved.notes) {
          assert.ok(note.s >= opens.length - 6 && note.s < opens.length);
          assert.ok(note.f >= resolved.fretMin && note.f <= resolved.fretMax && note.f <= 24);
          assert.ok(note.fg >= 0 && note.fg <= 4);
          assert.equal(note.d,fretboardShapes.degreeOfPc(key,(opens[note.s] + note.f) % 12,scale));
        }
      }
      const resolved = fretboardShapes.resolveOpenShape(key,scale,opens);
      assert.equal(new Set(resolved.notes.map(n => opens[n.s] + n.f)).size,resolved.notes.length);
      assert.ok(resolved.notes.every(n => n.s >= opens.length - 6 && n.f >= 0 && n.f <= 3));
    }
    const resolved = fretboardShapes.resolveThreeNPSPosition(0,1,'major',opens);
    assert.equal(resolved.notes.length,opens.length * 3);
    const pitches = resolved.notes.map(n => opens[n.s] + n.f);
    assert.ok(pitches.every((m,i) => i === 0 || m > pitches[i-1]));
    for (let s = 0; s < opens.length; s++) {
      const notes = resolved.notes.filter(n => n.s === s);
      assert.equal(notes.length,3);
      assert.deepEqual(notes.map(n => n.fg),fretboardShapes.threeNpsStringFingers(notes.map(n => n.f)));
    }
  }
  const unisons = [40,40,40,40,40,40];
  for (const resolved of [fretboardShapes.resolveCAGEDShape(0,'E','major',unisons),fretboardShapes.resolveOpenShape(0,'major',unisons)]) {
    assert.ok(resolved.notes.every(n => n.s === 0),'lower string wins duplicate pitch');
    assert.equal(new Set(resolved.notes.map(n => n.f)).size,resolved.notes.length);
  }
});

test('entry retains the original chord-fingering startup guard against mutated imported data', () => {
  const url = new URL('../src/core/fretboard-shapes.js',import.meta.url).href;
  const runner = new URL('./helpers/core-runner.mjs',import.meta.url).href;
  const root = new URL('../',import.meta.url).pathname;
  assert.throws(() => execFileSync(process.execPath,['--input-type=module','-e',`
    const core = await import(${JSON.stringify(url)});
    core.CAGED_SHAPES.A.chordTemplates.maj[1].fg = 1;
    process.argv = [process.execPath,'runner',${JSON.stringify(root)},'{}'];
    await import(${JSON.stringify(runner)});
  `],{ encoding:'utf8',stdio:'pipe' }),error => {
    assert.equal(error.status,1);
    assert.equal(error.stdout,'');
    assert.match(error.stderr,/\[Virtuoso caged-template\] A:maj finger 1 spans fret offsets/);
    return true;
  });
});

test('fresh instrument/tuning import and calls trap host access; ordinary data stays shared and mutable', () => {
  const url = new URL('../src/core/instrument-tuning.js', import.meta.url).href;
  execFileSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    for (const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext','feedBack','slopsmith','noteDetect']) {
      Object.defineProperty(globalThis, name, { configurable:true, get() { throw Error('host access: ' + name); } });
    }
    const core = await import(${JSON.stringify(url)});
    assert.deepEqual(Object.keys(core), ['STRING_SETUPS','TUNING_PRESETS','TUNING_TO_SETUP','hostStandardMidisFor','isBassCfg','midiToNoteName','openMidisForConfig','parseNoteName','tuningOffsetsForConfig']);
    const again = await import(${JSON.stringify(url)});
    for (const name of ['STRING_SETUPS','TUNING_PRESETS','TUNING_TO_SETUP']) {
      const table = core[name];
      assert.equal(again[name], table);
      assert.equal(Object.getPrototypeOf(table), Object.prototype);
      table.__probe = table[Object.keys(table)[0]];
      assert.equal(delete table.__probe, true);
    }
    const row = core.STRING_SETUPS.bass_4_standard;
    const opens = row.openMidis;
    const saved = opens[0];
    const preset = core.TUNING_PRESETS.bass_4[0];
    const label = preset.label;
    const alias = core.TUNING_TO_SETUP.bass_4_standard;
    try {
      opens[0]++;
      row.tuning.push(9);
      preset.label = 'probe';
      preset.midis.push(99);
      core.TUNING_TO_SETUP.bass_4_standard = 'probe';
      assert.equal(core.hostStandardMidisFor('bass',4), opens);
      assert.equal(core.openMidisForConfig({ stringSetup:'bass_4_standard' })[0], saved + 1);
      assert.equal(core.tuningOffsetsForConfig({ stringSetup:'bass_4_standard' }).at(-1), 9);
      assert.equal(again.TUNING_PRESETS.bass_4[0].label, 'probe');
      assert.equal(again.TUNING_PRESETS.bass_4[0].midis.at(-1), 99);
      assert.equal(again.TUNING_TO_SETUP.bass_4_standard, 'probe');
      assert.equal(core.isBassCfg({ stringSetup:'bass_4_standard' }), true);
      assert.equal(core.parseNoteName('E2'), 40);
      assert.equal(core.midiToNoteName(40), 'E2');
    } finally {
      opens[0] = saved;
      row.tuning.pop();
      preset.label = label;
      preset.midis.pop();
      core.TUNING_TO_SETUP.bass_4_standard = alias;
    }
  `], { encoding:'utf8' });
});

test('supported guitar/bass preset overrides preserve low-string order, offsets, intent and copy contracts', () => {
  const { STRING_SETUPS, TUNING_PRESETS, TUNING_TO_SETUP, openMidisForConfig, tuningOffsetsForConfig, isBassCfg, hostStandardMidisFor, midiToNoteName } = instrumentTuning;
  for (const [familyCount, presets] of Object.entries(TUNING_PRESETS)) {
    const [family, count] = familyCount.split('_');
    const stringSetup = `${familyCount}_standard`;
    const base = STRING_SETUPS[stringSetup];
    assert.equal(base.openMidis.length, Number(count));
    assert.equal(hostStandardMidisFor(family, Number(count)), base.openMidis);
    for (const preset of presets) {
      const cfg = { stringSetup, customOpenMidis:preset.midis, instrument:'stale' };
      const saved = structuredClone(cfg);
      assert.equal(preset.midis.length, Number(count));
      assert.deepEqual(openMidisForConfig(cfg), preset.midis);
      assert.deepEqual(tuningOffsetsForConfig(cfg), preset.midis.map((m,i) => m - base.openMidis[i]));
      assert.equal(isBassCfg(cfg), family === 'bass');
      const opens = openMidisForConfig(cfg);
      opens[0]++;
      const offsets = tuningOffsetsForConfig(cfg);
      offsets[0]++;
      assert.deepEqual(cfg, saved);
      assert.notEqual(preset.midis, base.openMidis);
      const mapped = TUNING_TO_SETUP[`${familyCount}_${preset.id}`];
      if (mapped) assert.deepEqual(STRING_SETUPS[mapped].openMidis, preset.midis);
    }
  }
  assert.deepEqual(tuningOffsetsForConfig({ stringSetup:'guitar_6_drop_d' }), [-2,0,0,0,0,0]);
  assert.deepEqual(tuningOffsetsForConfig({ stringSetup:'guitar_6_drop_d', customOpenMidis:[38,45,50,55,59,64] }), [0,0,0,0,0,0]);
  assert.equal(TUNING_TO_SETUP.bass_4_drop_d, undefined);
  assert.equal(TUNING_PRESETS.bass_4.find(p => p.id === 'bead').offset, undefined);
  assert.equal(TUNING_PRESETS.bass_5.find(p => p.id === 'standard_hc').offset, undefined);
  assert.equal(TUNING_PRESETS.guitar_6.find(p => p.id === 'd_standard').offset, true);
  assert.deepEqual(openMidisForConfig({ customOpenMidis:[1,2] }), [1,2]);
  assert.deepEqual(tuningOffsetsForConfig({ customOpenMidis:[1,2] }), [0,0,0,0,0,0]);
  assert.ok(Number.isNaN(midiToNoteName(40.5)), 'original fractional formatting returns numeric NaN');
  assert.ok(Number.isNaN(tuningOffsetsForConfig({ customOpenMidis:[NaN,45,50,55,59,64] })[0]));
  const opens = openMidisForConfig({});
  opens[0]++;
  assert.equal(STRING_SETUPS.guitar_6_standard.openMidis[0], 40);
});

test('fresh workouts import traps host access and preserves mutable registry/rows/arrays', () => {
  const url = new URL('../src/content/workouts.js', import.meta.url).href;
  execFileSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    for (const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext','feedBack','slopsmith','noteDetect']) {
      Object.defineProperty(globalThis, name, { configurable:true, get() { throw Error('host access: ' + name); } });
    }
    const module = await import(${JSON.stringify(url)});
    const { BUILT_IN_SESSIONS } = module;
    assert.deepEqual(Object.keys(module), ['BUILT_IN_SESSIONS']);
    assert.equal((await import(${JSON.stringify(url)})).BUILT_IN_SESSIONS, BUILT_IN_SESSIONS);
    assert.equal(Object.getPrototypeOf(BUILT_IN_SESSIONS), Object.prototype);
    const before = JSON.stringify(BUILT_IN_SESSIONS);
    const row = BUILT_IN_SESSIONS.starter_arc;
    const config = row.segments[0].config;
    const bpm = config.bpm;
    const name = row.name;
    const tagCount = row.tags.length;
    try {
      config.bpm++;
      row.name = 'mutation probe';
      row.tags.push('mutation probe');
      BUILT_IN_SESSIONS.__mutation_probe = row;
      assert.equal(config.bpm, bpm + 1);
      assert.equal(row.name, 'mutation probe');
      assert.equal(row.tags.length, tagCount + 1);
      assert.equal(BUILT_IN_SESSIONS.__mutation_probe, row);
      assert.equal(delete BUILT_IN_SESSIONS.__mutation_probe, true);
    } finally {
      config.bpm = bpm;
      row.name = name;
      row.tags.length = tagCount;
      delete BUILT_IN_SESSIONS.__mutation_probe;
    }
    assert.equal(JSON.stringify(BUILT_IN_SESSIONS), before);
  `], { encoding:'utf8' });
});

test('synchronous public workout registry is the exact import with valid real template references', () => {
  assert.equal(characterize(undefined, { workoutIdentity:true }).workoutIdentity, true);
});

test('source native generation graph is acyclic, host-free and has no upward dependencies', async () => {
  const { readdirSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const root = new URL('../src/core/',import.meta.url).pathname;
  const files = [];
  const directory = path => { for (const item of readdirSync(path,{withFileTypes:true})) { const file=resolve(path,item.name); if(item.isDirectory()) directory(file); else if(item.name.endsWith('.js')) files.push(file); } };
  directory(root);
  const visited = checkNativeGraph(files,{coreRoot:root});
  assert.ok(visited.size >= 20);
});

test('native graph sees side effects/reexports/literal dynamics and rejects hidden illegal edges', () => {
  assert.deepEqual(moduleEdges(`
    // import './comment.js';
    const text = "export * from './string.js'";
    const template = \`import './template.js' \${import('./interpolation.js')}\`;
    const pattern = /import\\('regex'\\)/;
    if (text) /export.*from/.test(text);
    const divided = 12 / 3 / 2;
    obj.import('./method.js'); obj?.import('./optional.js');
    const object = { import(path) { return path; }, export: "from './object.js'" };
    class Methods { import(path) { return /import.*from/.test(path); } }
    function match(text) { return /import\\('return-regex'\\)/.test(text); }
    const meta = import.meta.url;
    import './side.js'; import {value} from './named.js';
    export * from './star.js'; export {value} from './reexport.js';
    const pending = import('./dynamic.js');
    import './escaped\\u002ejs';
  `).map(e=>e.specifier),['./interpolation.js','./side.js','./named.js','./star.js','./reexport.js','./dynamic.js','./escaped.js']);
  for (const text of ["import(path)","import('./prefix/' + path)","import(`./template.js`)","import(`./${path}.js`)"]) assert.throws(()=>moduleEdges(text,'fixture.js'),/fixture.js: computed dynamic import.*literal relative specifier/);
  const root='/native-fixture/src/core';
  const graph = source => ({coreRoot:root,read:file=>source[file] ?? ''});
  for (const statement of ["import '../shell/io.js'", "export * from '../shell/io.js'", "export {x} from '../shell/io.js'", "import('../shell/io.js')"]) assert.throws(()=>checkNativeGraph([root+'/a.js'],graph({[root+'/a.js']:statement})),/core dependency escapes/);
  assert.throws(()=>checkNativeGraph([root+'/a.js'],graph({[root+'/a.js']:"export * from './b.js'",[root+'/b.js']:"import './a.js'"})),/native module cycle/);
  assert.throws(()=>checkNativeGraph([root+'/a.js'],graph({[root+'/a.js']:"import('node:fs')"})),/requires relative dependencies/);
  assert.throws(()=>checkNativeGraph([root+'/a.js'],graph({[root+'/a.js']:"import(config.path)"})),/computed dynamic import/);
});

test('negative control: a failing entry startup console.assert exits fatally', () => {
  assert.throws(() => characterize(undefined, { failStartupAssertion: true }), error => {
    assert.equal(error.status, 1);
    assert.equal(error.stdout, '');
    assert.match(error.stderr, /\[Virtuoso shapes\] C-shape in C major should span frets 0–5/);
    return true;
  });
});
