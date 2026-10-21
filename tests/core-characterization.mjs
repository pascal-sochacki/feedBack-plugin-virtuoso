import assert from 'node:assert/strict';
import { moduleEdges, checkNativeGraph } from '../scripts/native-module-graph.mjs';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { BUILT_IN_SESSIONS } from '../src/content/workouts.js';
import * as instrumentTuning from '../src/core/instrument-tuning.js';
import { instrumentTuningSnapshot } from './helpers/instrument-tuning.mjs';
import * as fretboardShapes from '../src/core/fretboard-shapes.js';
import { fretboardShapeSnapshot } from './helpers/fretboard-shapes.mjs';
import { characterize, compareCorpus, expectedCorpus } from './helpers/characterization.mjs';
import * as chromatic from '../src/core/builders/chromatic.js';
import * as strokes from '../src/core/stroke-policy.js';
import { noteDefaults } from '../src/core/notes.js';
import { wholeCycleStepCount, secondsPerDivision, measureSeconds } from '../src/core/timing.js';
import { chromaticBuilderSnapshot } from './helpers/chromatic-builder.mjs';

test('chromatic raw builders, helper calls, full exercises/bundles and Workouts match independently captured dirty entry', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/chromatic-builder-before-extraction.json',import.meta.url),'utf8'));
  const snapshot = characterize(undefined,undefined,{chromaticBuilderSnapshot:true});
  const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(hash(snapshot),fixture.snapshotSha256);
  for (const name of ['tables','charts','edges','helpers','exercises','sessions']) {
    assert.equal(hash(snapshot[name]),fixture[name].sha256,name);
    assert.equal(Array.isArray(snapshot[name]) ? snapshot[name].length : Object.keys(snapshot[name]).length,fixture[name].count);
  }
  const direct = JSON.parse(JSON.stringify(chromaticBuilderSnapshot({...chromatic,...strokes,noteDefaults,wholeCycleStepCount},instrumentTuning)));
  for (const name of ['tables','charts','edges','helpers']) assert.deepEqual(direct[name],snapshot[name]);
  const changed = structuredClone(snapshot);
  changed.exercises[0].exercise.chart.notes[0].sus += 0.001;
  assert.notEqual(hash(changed),fixture.snapshotSha256,'tail changes are not normalized away');
});

test('chromatic note grid, full-cycle overflow, final sustain, string order and finger/pick annotations remain exact', () => {
  const snapshot = chromaticBuilderSnapshot({...chromatic,...strokes,noteDefaults,wholeCycleStepCount},instrumentTuning);
  for (const {cfg,chart} of snapshot.charts) {
    const step = secondsPerDivision(cfg), minimum = cfg.bars * measureSeconds(cfg);
    const count = instrumentTuning.openMidisForConfig(cfg).length;
    const legs = cfg.direction === 'ascending' || cfg.direction === 'descending' ? 1 : 2;
    const cycle = count * 4 * legs;
    assert.ok(chart.notes.length > 0 && chart.notes.length % cycle === 0);
    assert.ok(chart.duration >= minimum && chart.duration <= Math.max(minimum,cycle * step) + cycle * step);
    let t = 0;
    for (const [i,note] of chart.notes.entries()) {
      assert.equal(note.t,Number(t.toFixed(6))); t += step;
      assert.equal(note.sus,Math.max(0.04,step * 0.85));
      assert.equal(note.ac,false);
      assert.ok(note.s >= 0 && note.s < count && note.f >= 0 && note.f <= 24);
      const floor = Math.max(instrumentTuning.isBassCfg(cfg) ? 5 : 0,Math.max(0,cfg.fretMin || 1));
      assert.equal(note.fg,note.f === 0 ? 0 : note.f - floor + 1);
      if (!cfg.strokePolicy && !instrumentTuning.isBassCfg(cfg) && !['gallop','reverse_gallop'].includes(cfg.subdivision)) {
        const beat = (60 / cfg.bpm) * (4 / cfg.meter.denominator);
        assert.equal(note.pkd,step >= beat * 1.4 ? 0 : i % 2,'coarse /8 grid preserves existing rest re-anchor');
      }
      if (!cfg.strokePolicy && instrumentTuning.isBassCfg(cfg)) assert.ok(note.rh === 1 || note.rh === 2);
    }
    assert.equal(chart.duration,Math.max(minimum,Number(t.toFixed(6))));
    const last = chart.notes.at(-1);
    assert.ok(last.t + last.sus <= chart.duration + 1e-6,'final sustain fits complete-cycle duration');
    assert.equal(chart.notes[0].s,cfg.direction === 'descending' ? count - 1 : 0);
  }
  const cfg = snapshot.charts[0].cfg;
  const chart = chromatic.buildChromaticExercise(cfg);
  assert.equal(chart.notes.length,24);
  assert.ok(chart.duration > cfg.bars * measureSeconds(cfg),'one nominal bar rounds up to one complete six-string pass');
  const upDown = chromatic.buildChromaticExercise({...cfg,direction:'up_down'});
  assert.equal(upDown.notes.length,48);
  assert.equal(upDown.notes[23].s,5); assert.equal(upDown.notes[24].s,5,'turnaround string repeats intentionally');
});

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

test('unified shape data, resolvers and actual scale/arpeggio outputs match dirty pre-move runtime', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/fretboard-shapes-before-extraction.json', import.meta.url), 'utf8'));
  const snapshot = characterize(undefined, undefined, { fretboardShapeSnapshot:true });
  const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(hash(snapshot), fixture.snapshotSha256);
  assert.equal(hash(snapshot.tables), fixture.tableSha256);
  for (const name of ['resolvers','helpers','exercises']) assert.equal(snapshot[name].length, fixture[name]);
  const direct = JSON.parse(JSON.stringify(fretboardShapeSnapshot(fretboardShapes,instrumentTuning)));
  assert.deepEqual(direct.tables,snapshot.tables);
  assert.deepEqual(direct.resolvers,snapshot.resolvers);
  assert.deepEqual(direct.helpers,snapshot.helpers);
  assert.equal(characterize(undefined, undefined, { fretboardShapeIdentity:true }).fretboardShapeIdentity,true);
  for (const { cfg,selected,exercise } of snapshot.exercises) {
    assert.ok(exercise.chart.notes.length);
    if (cfg.instrument === 'bass') assert.equal(selected,null,'bass stays position-based, not new guitar shape support');
    for (const note of exercise.chart.notes) {
      assert.ok(Number.isFinite(note.t) && Number.isInteger(note.f) && note.f >= 0 && note.f <= 24);
      assert.ok(Number.isInteger(note.s) && note.s >= 0 && note.s < cfg.stringCount);
    }
    if (cfg.practiceType !== 'scale') continue;
    const midis = exercise.chart.notes.map(n => cfg.openMidis[n.s] + n.f);
    for (let i = 1; i < midis.length; i++) assert.notEqual(midis[i],midis[i-1],'one-way scalar seam no-unison');
  }
  const changed = structuredClone(snapshot);
  changed.resolvers[0].result.value.notes[0].fg++;
  assert.notEqual(hash(changed),fixture.snapshotSha256,'fingering change is not normalized away');
});

test('fresh shape import/calls are host-independent, guard-free, mutable and dependency-shared', () => {
  const url = new URL('../src/core/fretboard-shapes.js',import.meta.url).href;
  const scalesUrl = new URL('../src/core/scale-intervals.js',import.meta.url).href;
  const helperUrl = new URL('./helpers/fretboard-shapes.mjs',import.meta.url).href;
  const tuningUrl = new URL('../src/core/instrument-tuning.js',import.meta.url).href;
  execFileSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    for (const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{ configurable:true,get() { throw Error('host access: ' + name); } });
    console.assert = () => { throw Error('startup assertion advanced into module'); };
    const core = await import(${JSON.stringify(url)});
    const again = await import(${JSON.stringify(url)});
    const { SCALE_INTERVALS } = await import(${JSON.stringify(scalesUrl)});
    const { fretboardShapeSnapshot } = await import(${JSON.stringify(helperUrl)});
    const tuning = await import(${JSON.stringify(tuningUrl)});
    fretboardShapeSnapshot(core,tuning);
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
    process.argv = [process.execPath,'runner',${JSON.stringify(root)},'','{}'];
    await import(${JSON.stringify(runner)});
  `],{ encoding:'utf8',stdio:'pipe' }),error => {
    assert.equal(error.status,1);
    assert.equal(error.stdout,'');
    assert.match(error.stderr,/\[Virtuoso caged-template\] A:maj finger 1 spans fret offsets/);
    return true;
  });
});

test('instrument/tuning tables and six helpers match independently captured dirty-entry runtime', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/instrument-tuning-before-extraction.json', import.meta.url), 'utf8'));
  const snapshot = JSON.parse(JSON.stringify(instrumentTuningSnapshot(instrumentTuning)));
  const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(hash(snapshot), fixture.snapshotSha256);
  assert.equal(hash(snapshot.tables), fixture.tableSha256);
  for (const [name, ids] of Object.entries(fixture.tableIds)) assert.deepEqual(Object.keys(snapshot.tables[name]), ids);
  for (const [key, ids] of Object.entries(fixture.presetIds)) assert.deepEqual(snapshot.tables.TUNING_PRESETS[key].map(p => p.id), ids);
  assert.deepEqual(characterize(undefined, undefined, { instrumentTuningSnapshot:true }), snapshot);
  assert.equal(characterize(undefined, undefined, { instrumentTuningIdentity:true }).instrumentTuningIdentity, true);
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

test('passive workouts preserve all 25 ordered IDs and complete pre-extraction metadata/configs', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/workouts-before-extraction.json', import.meta.url), 'utf8'));
  assert.equal(fixture.ids.length, 25);
  assert.deepEqual(Object.keys(BUILT_IN_SESSIONS), fixture.ids);
  const json = JSON.stringify(BUILT_IN_SESSIONS);
  assert.equal(createHash('sha256').update(json).digest('hex'), fixture.sha256);
  const root = new URL('../', import.meta.url).pathname;
  const snapshot = execFileSync(process.execPath, ['tests/helpers/core-runner.mjs', root, '', '{"workoutSnapshot":true}'], { cwd:root, encoding:'utf8' });
  assert.equal(snapshot, json);
  assert.deepEqual(JSON.parse(snapshot), BUILT_IN_SESSIONS);
  const changed = structuredClone(BUILT_IN_SESSIONS);
  changed.starter_arc.segments[0].config.bpm++;
  assert.notEqual(createHash('sha256').update(JSON.stringify(changed)).digest('hex'), fixture.sha256);
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
  assert.equal(characterize(undefined, undefined, { workoutIdentity:true }).workoutIdentity, true);
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

test('strum/motif/voicing/timeline cluster matches independent dirty entry capture through actual native imports', async () => {
  const { generationClusterSnapshot } = await import('./helpers/generation-cluster.mjs');
  const core = Object.assign({},...await Promise.all(['strum-grips','builders/strum','chord-timeline','motif','voicing'].map(path=>import('../src/core/'+path+'.js'))));
  const snapshot = generationClusterSnapshot(core,instrumentTuning);
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/generation-cluster-before-extraction.json',import.meta.url),'utf8'));
  const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(hash(snapshot),fixture.clusterSha256);
  for(const [name,count] of Object.entries(fixture.counts)) assert.equal(snapshot[name].length,count);
  assert.deepEqual(JSON.parse(JSON.stringify(snapshot)),characterize(undefined,undefined,{generationClusterSnapshot:true}));
});

test('native backing and full genre Jam corpus matches independent dirty entry and preserves mutable data', async () => {
  const {backingClusterSnapshot}=await import('./helpers/backing-cluster.mjs');
  const modules=['arrangement','comp-cells','bass-figures','audio-profiles','drum-grooves','backing','feel','style-palettes','key-cycle','exercise','exercise-dispatch','chord-timeline','random'];
  const core=Object.assign({},...await Promise.all(modules.map(path=>import('../src/core/'+path+'.js'))));
  const snapshot=backingClusterSnapshot(core);
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/generation-cluster-before-extraction.json',import.meta.url),'utf8'));
  assert.equal(createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'),fixture.backingSha256);
  for(const [name,count] of Object.entries(fixture.backingCounts)) assert.equal(snapshot[name].length,count);
  assert.equal(snapshot.jams.filter(r=>r.result.error).length,0,'all 31 styles × 3 band modes generate valid spotlight/switch-up charts');
  for(const row of snapshot.jams) assert.ok(row.result.value.chart.notes.length);
  const table=core.ARRANGEMENT_RECIPES,first=Object.keys(table)[0],rec=table[first];
  const value=rec.picks.comp; rec.picks.comp='probe'; assert.equal(core.ARRANGEMENT_RECIPES[first],rec); rec.picks.comp=value;
  assert.deepEqual(characterize(undefined,undefined,{backingClusterSnapshot:true}),JSON.parse(JSON.stringify(snapshot)));
});

test('complete native exercise core imports under IO/RNG/guard traps and drives all 40 practice types', () => {
  const root=new URL('../',import.meta.url).href;
  execFileSync(process.execPath,['--input-type=module'],{input:`
    import assert from 'node:assert/strict';
    for(const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{configurable:true,get(){throw Error('host access: '+name)}});
    Math.random=()=>{throw Error('ambient RNG')}; console.assert=()=>{throw Error('import startup guard')};
    const base=${JSON.stringify(root)};
    const {generateExercise}=await import(base+'src/core/exercise.js');
    const {buildSingleChart}=await import(base+'src/core/exercise-dispatch.js');
    const tuning=await import(base+'src/core/instrument-tuning.js');
    const shapes=await import(base+'src/core/fretboard-shapes.js');
    const {foundationConfigs}=await import(base+'tests/helpers/generation-foundation.mjs');
    const passed=new Set();
    for(const cfg of foundationConfigs(tuning,shapes)) {
      let exercise; try {exercise=generateExercise(cfg)} catch {continue}
      if (!exercise.chart.notes.length || !(exercise.chart.duration > 0) || !Number.isFinite(exercise.chart.duration)) continue;
      assert.equal(exercise.version,1); assert.equal(exercise.session,cfg);
      assert.ok(exercise.chart.notes.length); assert.ok(Number.isFinite(exercise.chart.duration));
      assert.deepEqual(generateExercise(cfg),exercise); passed.add(cfg.practiceType);
    }
    assert.equal(passed.size,40);
    const {STRUM_GRIPS}=await import(base+'src/core/strum-grips.js');
    assert.equal((await import(base+'src/core/strum-grips.js')).STRUM_GRIPS,STRUM_GRIPS);
    const row=STRUM_GRIPS.dom7[0]; const finger=row.notes[0].fg;
    row.notes[0].fg=4; assert.equal(STRUM_GRIPS.dom7[0].notes[0].fg,4); row.notes[0].fg=finger;
  `,encoding:'utf8'});
});

test('generation foundation matches independently captured dirty raw charts, bundles and every Workout', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/generation-foundation-before-extraction.json',import.meta.url),'utf8'));
  const snapshot = characterize(undefined,undefined,{generationFoundationSnapshot:true});
  const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(hash(snapshot),fixture.snapshotSha256);
  for (const [name,count] of Object.entries(fixture.counts)) assert.equal(snapshot[name].length,count);
  for (const [name,expected] of Object.entries(fixture.sections)) assert.equal(hash(snapshot[name]),expected,name);
  assert.equal(snapshot.charts.filter(r=>r.result.value).length,fixture.validCharts);
  assert.equal(snapshot.exercises.filter(r=>r.result.value).length,fixture.validExercises);
  const valid = new Set(snapshot.exercises.filter(r=>r.result.value).map(r=>r.cfg.practiceType));
  assert.equal(valid.size,40,'every actual practice type has valid generation coverage');
  const changed = structuredClone(snapshot.charts);
  changed[0].result.value.notes[0].t += 0.001;
  assert.notEqual(hash(changed),fixture.sections.charts,'raw note time cannot be normalized away');
});

test('fresh foundation modules trap host, startup guards and ambient randomness; builders match real entry', () => {
  const root = new URL('../',import.meta.url).href;
  const snapshot = characterize(undefined,undefined,{generationFoundationSnapshot:true});
  execFileSync(process.execPath,['--input-type=module'],{input:`
    import assert from 'node:assert/strict';
    import { createHash } from 'node:crypto';
    for (const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{configurable:true,get() { throw Error('host access: ' + name); }});
    Math.random = () => { throw Error('ambient random'); };
    console.assert = () => { throw Error('startup guard moved into import'); };
    const base = ${JSON.stringify(root)};
    const modules = await Promise.all(['random','sequence','positions','chart-grid','harmony','chord-positions','builders/scale','builders/technique','builders/arpeggio','builders/bass','builders/tapping','builders/guide-tones','builders/pedal-riff','builders/chromatic'].map(path=>import(base+'src/core/'+path+'.js')));
    const core = Object.assign({},...modules);
    const tuning = await import(base+'src/core/instrument-tuning.js');
    const shapes = await import(base+'src/core/fretboard-shapes.js');
    const { foundationConfigs } = await import(base+'tests/helpers/generation-foundation.mjs');
    const builders = { scale:'buildScaleExercise',modal_vamp:'buildScaleExercise',chord_scales:'buildChordScaleExercise',sweep_arpeggios:'buildSweepArpeggioExercise',chromatic:'buildChromaticExercise',spider:'buildSpiderExercise',guide_tones:'buildGuideTonesExercise',bending:'buildBendingExercise',legato:'buildLegatoExercise',vibrato:'buildVibratoExercise',scale_thirds:'buildScaleThirdsExercise',scale_sixths:'buildScaleSixthsExercise',call_response:'buildCallResponseExercise',tremolo_picking:'buildTremoloPickingExercise',herta:'buildHertaExercise',rhythm_pulse:'buildRhythmPulseExercise',tapping:'buildTappingExercise',pedal_point:'buildPedalPointExercise',string_skipping:'buildStringSkippingExercise',position_shift:'buildPositionShiftExercise',rhythmic_displacement:'buildRhythmicDisplacementExercise',chromatic_enclosures:'buildChromaticEnclosuresExercise',bebop_scale:'buildBebopScaleExercise',arpeggio_inversions:'buildArpeggioInversionsExercise',walking_bass:'buildWalkingBassExercise',hybrid_picking:'buildHybridPickingExercise',triadic_pairs:'buildTriadicPairsExercise',pentatonic_super:'buildPentatonicSuperExercise',shell_voicings:'buildShellVoicingsExercise',octave_displacement:'buildOctaveDisplacementExercise',root_fifth_octave:'buildRootFifthOctaveExercise',octave_groove:'buildOctaveGrooveExercise',dead_note_groove:'buildDeadNoteGrooveExercise',right_hand_technique:'buildRightHandTechniqueExercise',slap_pop:'buildSlapPopExercise',arpeggio:'buildArpeggioExercise' };
    const expected = ${JSON.stringify(snapshot.charts.filter(r=>buildersAvailable(r.cfg.practiceType)).map(r=>({cfg:r.cfg,result:r.result})))};
    builders.pedal_riff = 'buildPedalRiffExercise';
    const cfgs = foundationConfigs(tuning,shapes).filter(c=>builders[c.practiceType]);
    const charts = cfgs.map(cfg=>{
      let result;
      try { const chart=cfg.practiceType === 'arpeggio' ? core.buildArpeggioExercise(cfg,core.progressionDegreesForConfig(cfg)) : core[builders[cfg.practiceType]](cfg); result={value:chart}; }
      catch(error) { result={error:error.name,message:error.message}; }
      return {cfg,result};
    });
    assert.deepEqual(JSON.parse(JSON.stringify(charts)),expected);
    const cfg=cfgs[0];
    Object.freeze(cfg); Object.freeze(cfg.meter); Object.freeze(cfg.openMidis);
    const chart=core.buildScaleExercise(cfg);
    assert.notEqual(core.buildScaleExercise(cfg).notes,chart.notes);
    assert.ok(chart.notes.every(n=>Number.isFinite(n.t) && n.s >= 0 && n.s < cfg.stringCount));
    const pitches=chart.notes.map(n=>cfg.openMidis[n.s]+n.f);
    assert.equal(new Set(core.scalePositionsForSystem(cfg).map(p=>p.midi)).size,core.scalePositionsForSystem(cfg).length);
    for(let i=1;i<pitches.length;i++) assert.notEqual(pitches[i],pitches[i-1]);
    const dyads=core.buildScaleThirdsExercise({...cfg,harmonize:true,direction:'ascending'}).notes;
    for(let i=0;i<dyads.length;i+=2) {
      assert.equal(dyads[i].t,dyads[i+1].t);
      const interval=cfg.openMidis[dyads[i+1].s]+dyads[i+1].f-cfg.openMidis[dyads[i].s]-dyads[i].f;
      assert.ok(interval === 3 || interval === 4,'thirds are pitch intervals, not array offsets');
    }
    const bassCfg=cfgs.find(c=>c.stringSetup === 'bass_4_standard' && c.practiceType === 'scale');
    const octave=core.buildOctaveGrooveExercise(bassCfg).notes;
    for(let i=0;i+1<octave.length;i+=2) {
      assert.equal(bassCfg.openMidis[octave[i+1].s]+octave[i+1].f-bassCfg.openMidis[octave[i].s]-octave[i].f,12);
      assert.equal(octave[i].rh,1); assert.equal(octave[i+1].rh,2);
      assert.equal(octave[i+1].ac,true); assert.equal(octave[i].noSwing,true);
    }
    const positions=[{s:0,f:1,midi:41},{s:0,f:2,midi:42},{s:0,f:3,midi:43}];
    assert.equal(core.applyBassFingering(positions),positions);
    assert.deepEqual(positions.map(p=>p.fg),[1,2,4]);
    assert.equal(core.orientSeq(positions,'ascending'),positions);
    const table=core.SEQUENCE_PATTERNS;
    assert.equal((await import(base+'src/core/sequence.js')).SEQUENCE_PATTERNS,table);
    table.__probe=[0,1]; assert.equal(delete table.__probe,true);
    const theory=await import(base+'src/core/chord-theory.js');
    const quality=core.diatonicExtendedQuality('major',3,'ninth');
    const row=theory.CHORD_FORMULAS[quality];
    assert.equal(core.diatonicExtendedQuality('major',3,'ninth'),quality);
    assert.equal(theory.CHORD_FORMULAS[quality],row);
    assert.deepEqual(row.intervals,core.diatonicChordIntervals('major',3,5));
  `,encoding:'utf8',maxBuffer:8<<20});
});

function buildersAvailable(type) { return !['fingerstyle_arp','motif','strum_comp'].includes(type); }

test('source core matches committed pre-extraction exercises, all sessions and synchronous API', () => {
  compareCorpus(characterize());
});

test('negative control: a raw note-time mutation is rejected by corpus comparison', () => {
  const expected = expectedCorpus();
  const actual = characterize(undefined, undefined, { mutateRawNote: true });
  assert.equal(actual.results['scale/major'].firstNotes[0].t, expected.results['scale/major'].firstNotes[0].t + 0.001);
  assert.notEqual(actual.results['scale/major'].sha256, expected.results['scale/major'].sha256);
  // Remove the readable-summary difference so only the raw-output SHA gate fails.
  actual.results['scale/major'].firstNotes = expected.results['scale/major'].firstNotes;
  assert.throws(() => compareCorpus(actual), /committed pre-extraction core corpus changed/);
});

test('negative control: a failing entry startup console.assert exits fatally', () => {
  assert.throws(() => characterize(undefined, undefined, { failStartupAssertion: true }), error => {
    assert.equal(error.status, 1);
    assert.equal(error.stdout, '');
    assert.match(error.stderr, /\[Virtuoso shapes\] C-shape in C major should span frets 0–5/);
    return true;
  });
});
