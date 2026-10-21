import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {characterize} from './helpers/characterization.mjs';
import {sessionCases} from './helpers/session-generation.mjs';
import {generateSession} from '../src/core/session.js';
import {buildBpmLadderChart} from '../src/core/session-chart.js';
import {buildSegmentConfig} from '../src/core/session-config.js';
import {SEGMENT_TEMPLATES} from '../src/content/segments.js';
import {BUILT_IN_SESSIONS} from '../src/content/workouts.js';
import {STYLE_PALETTES} from '../src/core/style-palettes.js';
import {stylePaletteConfig} from '../src/core/config-defaults.js';
import {materializeSegment, refreshWorkout} from '../src/core/segments.js';
import {measureSeconds} from '../src/core/timing.js';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fixture = JSON.parse(readFileSync(new URL('./fixtures/session-generation-before-extraction.json',import.meta.url),'utf8'));

test('complete session generation and bundles retain independent dirty-entry hashes for 356 cases and 595 helper calls', () => {
  const snapshot = characterize(undefined,undefined,{sessionGenerationSnapshot:true});
  assert.equal(hash(snapshot),fixture.snapshotSha256);
  for (const [name,section] of Object.entries(fixture.sections)) assert.equal(hash(snapshot[name]),section.sha256,name);
  assert.equal(snapshot.sessions.length,356);
  assert.equal(snapshot.sessions.filter(x=>x.result.value).length,354);
  assert.equal(snapshot.helpers.length,595);
  assert.equal(Object.keys(snapshot.tables.SEGMENT_TEMPLATES).length,65);
  for (const [i,row] of snapshot.sessions.entries()) assert.equal(hash(row.result),fixture.cases[i].sha256,row.id);
  // ID injection remains an explicit entry startup guard, not content import IO.
  for (const [id,t] of Object.entries(SEGMENT_TEMPLATES)) t.id = id;
  const cases = sessionCases({BUILT_IN_SESSIONS,SEGMENT_TEMPLATES,STYLE_PALETTES,stylePaletteConfig});
  for (const [i,{id,session}] of cases.entries()) {
    if (!snapshot.sessions[i].result.value) continue;
    assert.deepEqual(JSON.parse(JSON.stringify(generateSession(session))),snapshot.sessions[i].result.value.exercise,id);
  }
  const changed = structuredClone(snapshot);
  changed.sessions[0].result.value.exercise.chart.notes[0].t += 0.001;
  assert.notEqual(hash(changed),fixture.snapshotSha256);
});

test('session blocks retain incoming meter breaks, rung-local tempo/backing, offsets, target tiling and tuning', () => {
  const session = sessionCases({BUILT_IN_SESSIONS,SEGMENT_TEMPLATES,STYLE_PALETTES,stylePaletteConfig}).find(x=>x.id === 'mixed:guitar_6_standard:always:0').session;
  const {chart,session:meta} = generateSession(session);
  assert.deepEqual(meta.customOpenMidis,[38,45,50,55,59,64]);
  assert.equal(meta.countInBars,3);
  assert.equal(chart.segmentBounds.length,3);
  const [ladder,cycle,target] = chart.segmentBounds;
  assert.equal(ladder.start,0);
  assert.ok(cycle.start > ladder.end && target.start > cycle.end);
  assert.ok(target.end-target.start >= 12 && target.end-target.start < 20);
  assert.ok(chart.duration > target.end,'wrap breath retained');
  for (const bound of chart.segmentBounds) {
    assert.ok(chart.notes.some(n=>n.t >= bound.start && n.t < bound.end));
    assert.ok(chart.anchors.some(n=>n.time >= bound.start && n.time < bound.end));
    assert.ok(chart.timeline.some(n=>n.startSec >= bound.start && n.startSec < bound.end));
  }
  for (const ev of chart.backingEvents) assert.ok(chart.segmentBounds.some(b=>ev.t >= b.start-1e-6 && ev.t < b.end+1e-6),'no backing attacks in breaks');
  const brk = chart.beats.filter(b=>b.brk && b.time >= ladder.end && b.time < cycle.start);
  assert.ok(brk.length > 0); assert.ok(brk.every(b=>b.brkSub === 1),'incoming quarters previewed');
  const seg = materializeSegment(session.segments[0]);
  const cfg = buildSegmentConfig(seg,session), rung = buildBpmLadderChart(cfg,seg.bpmLadder);
  assert.deepEqual(rung.sections.map(s=>s.name),['80 BPM','90 BPM','100 BPM']);
  const expected = [80,90,100].map(bpm=>2*Math.max(buildBpmLadderChart(cfg,{bpmStart:bpm,bpmTarget:bpm,bpmStep:10,repsPerStep:1}).duration,cfg.bars*measureSeconds({...cfg,bpm})));
  assert.ok(Math.abs(rung.duration-expected.reduce((a,b)=>a+b,0)) < 1e-6);
  const offset = cycle.start;
  assert.ok(chart.notes.some(n=>n.t === Number(offset.toFixed(6))),'next block starts at its own downbeat');
});

test('fresh complete session imports trap host/RNG/guards and keep passive shared mutable registries and pure refresh ownership', () => {
  execFileSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    for(const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext','feedBack','slopsmith','noteDetect']) Object.defineProperty(globalThis,name,{get(){throw Error('IO: '+name)}});
    Math.random=()=>{throw Error('ambient RNG')}; console.assert=()=>{throw Error('boot guard')};
    const {generateSession}=await import(${JSON.stringify(new URL('../src/core/session.js',import.meta.url).href)});
    const content=await import(${JSON.stringify(new URL('../src/content/segments.js',import.meta.url).href)});
    const again=await import(${JSON.stringify(new URL('../src/content/segments.js',import.meta.url).href)});
    const {materializeSegment,refreshWorkout}=await import(${JSON.stringify(new URL('../src/core/segments.js',import.meta.url).href)});
    assert.equal(content.SEGMENT_TEMPLATES,again.SEGMENT_TEMPLATES);
    const t=content.SEGMENT_TEMPLATES.g_warm_chromatic;
    assert.equal(t.id,undefined,'guard did not run at import');
    assert.equal(Object.getPrototypeOf(t.base),Object.prototype);
    t.id='g_warm_chromatic';
    const s={name:'Pure',stringSetup:'guitar_6_standard',segments:[{templateId:t.id,variantIdx:0}]};
    const before=JSON.stringify(s); const a=generateSession(s);
    assert.equal(JSON.stringify(s),before); assert.ok(a.chart.notes.length);
    const old=t.vary[0].fretMin; t.vary[0].fretMin=7;
    assert.equal(materializeSegment(s.segments[0]).config.fretMin,7); t.vary[0].fretMin=old;
    const next=refreshWorkout(s); assert.notEqual(next,s); assert.equal(s.segments[0].variantIdx,0); assert.equal(next.segments[0].variantIdx,1);
    const inline={kind:'scale',config:{bpm:96,bars:1}}; const x={segments:[inline]}; assert.equal(refreshWorkout(x).segments[0],inline);
  `]);
  const s={segments:[{templateId:'g_warm_chromatic',variantIdx:0},{kind:'scale'}]};
  assert.equal(refreshWorkout(s,{scope:99}).segments[0],s.segments[0]);
});
