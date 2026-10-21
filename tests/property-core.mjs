import assert from 'node:assert/strict';
import test from 'node:test';
import fc from 'fast-check';
import {parsePracticeMarkdown, buildPracticeFileExercise} from '../src/core/practice-files.js';
import {generateExercise} from '../src/core/exercise.js';
import {buildSegmentConfig} from '../src/core/session-config.js';
import {STRING_SETUPS} from '../src/core/instrument-tuning.js';
import {resolveCAGEDShape, resolveOpenShape} from '../src/core/fretboard-shapes.js';

function integerSetting(name, fallback, min, max) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  assert.match(raw, /^-?\d+$/, `${name} must be an integer`);
  const value = Number(raw);
  assert.ok(Number.isSafeInteger(value) && value >= min && value <= max, `${name} out of range`);
  return value;
}

const options = {
  seed: integerSetting('PROPERTY_SEED', 20261021, -2147483648, 2147483647),
  numRuns: integerSetting('PROPERTY_NUM_RUNS', 100, 1, 10000),
  ...(process.env.PROPERTY_PATH === undefined ? {} : {path:process.env.PROPERTY_PATH}),
};
const setup = fc.constantFrom(...Object.keys(STRING_SETUPS));
const tempo = fc.integer({min:30, max:260});
const scale = fc.constantFrom('major', 'natural_minor', 'minor_pentatonic', 'major_pentatonic', 'blues');

function freeze(value) {
  if (!value || typeof value !== 'object') return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) <= 0.000001, `${actual} != ${expected}`);
}

test('property: format-2 tempo scaling preserves written notes and annotations', () => {
  const writtenNote = fc.record({
    s:fc.integer({min:0,max:5}), f:fc.integer({min:0,max:24}),
    finger:fc.integer({min:1,max:4}), pkd:fc.integer({min:0,max:1}),
    ticks:fc.integer({min:0,max:4}),
  });
  fc.assert(fc.property(tempo, tempo, fc.array(writtenNote, {minLength:1,maxLength:32}), (referenceTempo, bpm, rows) => {
    // Quarter-second spacing and bounded sustains keep every shrunk case schema-valid.
    const notes = rows.map((row,i) => ({t:i/4,s:row.s,f:row.f,fg:row.f===0?0:row.finger,pkd:row.pkd,sus:row.ticks/16}));
    const duration = rows.length/4;
    const source = `---\nformatVersion: 2\nid: generated-practice\ntitle: Generated practice\ninstrument: guitar\ntuning: standard\nmeter: 4/4\nreferenceTempo: ${referenceTempo}\n---\nWritten notes.\n\n\`\`\`json\n${JSON.stringify({variants:[{id:'written',title:'Written',duration,notes}]})}\n\`\`\`\n`;
    const practiceFile = parsePracticeMarkdown(source);
    const cfg = freeze({practiceFile,bpm,instrument:'guitar',stringSetup:'guitar_6_standard',stringCount:6});
    const before = structuredClone(cfg);
    const {chart} = buildPracticeFileExercise(cfg);
    const factor = referenceTempo/bpm;
    near(chart.duration,duration*factor);
    assert.equal(chart.notes.length,notes.length);
    chart.notes.forEach((note,i) => {
      assert.deepEqual(note,{...notes[i],t:notes[i].t*factor,sus:notes[i].sus*factor});
      assert.ok(note.t+note.sus <= chart.duration+0.000001);
    });
    assert.deepEqual(cfg,before);
  }), options);
});

test('property: seeded random scale generation is byte-deterministic and leaves cfg unchanged', () => {
  fc.assert(fc.property(fc.record({
    stringSetup:setup, bpm:tempo, bars:fc.integer({min:1,max:4}),
    humanSeed:fc.integer({min:0,max:2147483647}), scale,
    key:fc.constantFrom('C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'),
    fretMin:fc.integer({min:1,max:12}),
  }), row => {
    const cfg = freeze(buildSegmentConfig({kind:'scale',config:{...row,fretMax:row.fretMin+4,fretboardSystem:'position',direction:'random'}}, {stringSetup:row.stringSetup}));
    const before = structuredClone(cfg);
    const first = generateExercise(cfg);
    assert.ok(first.chart.notes.length);
    assert.equal(JSON.stringify(first),JSON.stringify(generateExercise(cfg)));
    assert.deepEqual(cfg,before);
    assert.equal(first.chart.humanSeed,row.humanSeed);
  }), options);
});

test('property: chromatic charts retain whole cycles, lowest-string orientation and bounded timing', () => {
  fc.assert(fc.property(fc.record({
    stringSetup:setup, bpm:tempo, bars:fc.integer({min:1,max:4}),
    fretMin:fc.integer({min:1,max:20}),
    direction:fc.constantFrom('ascending','descending','up_down'),
    chromaticPattern:fc.constantFrom('1234','4321','1324','1342','2413'),
    meter:fc.constantFrom('4/4','7/8'), subdivision:fc.constantFrom('quarter','eighth','sixteenth'),
  }), row => {
    const cfg = buildSegmentConfig({kind:'chromatic',config:{...row,fretMax:row.fretMin+3,fretboardSystem:'position'}}, {stringSetup:row.stringSetup});
    const {chart} = generateExercise(cfg);
    const strings = STRING_SETUPS[row.stringSetup].openMidis.length;
    const base = Math.max(row.fretMin,cfg.instrument==='bass'?5:1);
    assert.ok(Number.isFinite(chart.duration) && chart.duration>0);
    assert.ok(chart.notes.length>0);
    assert.equal(chart.notes.length % (4*strings*(row.direction==='up_down'?2:1)),0);
    assert.equal(chart.notes[0].s,row.direction==='descending'?strings-1:0);
    chart.notes.forEach((note,i) => {
      assert.ok(Number.isInteger(note.s) && note.s>=0 && note.s<strings);
      assert.ok(Number.isInteger(note.f) && note.f>=base && note.f<=base+3);
      assert.ok(Number.isFinite(note.t) && note.t>=0);
      assert.ok(Number.isFinite(note.sus) && note.sus>=0);
      assert.ok(note.t+note.sus<=chart.duration+0.000001);
      if (i) assert.ok(note.t>chart.notes[i-1].t);
    });
  }), options);
});

test('property: degree-driven Open and guitar CAGED shapes never repeat a MIDI pitch', () => {
  fc.assert(fc.property(setup, fc.integer({min:0,max:11}), scale, fc.constantFrom('C','A','G','E','D'), (stringSetup,keyPc,scaleName,shape) => {
    const {openMidis,instrument} = STRING_SETUPS[stringSetup];
    const shapes = [resolveOpenShape(keyPc,scaleName,openMidis)];
    if (instrument==='guitar') shapes.push(resolveCAGEDShape(keyPc,shape,scaleName,openMidis));
    for (const resolved of shapes) {
      assert.ok(resolved && resolved.notes.length);
      const midis = resolved.notes.map(note => {
        assert.ok(Number.isInteger(note.s) && note.s>=0 && note.s<openMidis.length);
        assert.ok(Number.isInteger(note.f) && note.f>=resolved.fretMin && note.f<=resolved.fretMax);
        return openMidis[note.s]+note.f;
      });
      assert.equal(new Set(midis).size,midis.length);
    }
  }), options);
});
