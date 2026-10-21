import assert from 'node:assert/strict';
import test from 'node:test';
import {generateSession} from '../src/core/session.js';
import {buildBpmLadderChart} from '../src/core/session-chart.js';
import {buildSegmentConfig} from '../src/core/session-config.js';
import {SEGMENT_TEMPLATES} from '../src/content/segments.js';
import {BUILT_IN_SESSIONS} from '../src/content/workouts.js';
import {STYLE_PALETTES} from '../src/core/style-palettes.js';
import {stylePaletteConfig} from '../src/core/config-defaults.js';
import {materializeSegment, refreshWorkout} from '../src/core/segments.js';
import {measureSeconds} from '../src/core/timing.js';

test('session blocks retain incoming meter breaks, rung-local tempo/backing, offsets, target tiling and tuning', () => {
  const config = {key:'Db',scale:'dorian',bpm:137,bars:1,meter:'7/8',subdivision:'gallop',humanSeed:0,direction:'random',fretboardSystem:'position',fretMin:5,fretMax:12,audioProfile:'jazz',progression:'ii-V-I',chordDepth:'ninth'};
  const session = {name:'Mixed',stringSetup:'guitar_6_standard',interBlockBreak:'always',countInBars:3,customOpenMidis:'38,45,50,55,59,64',segments:[
    {name:'Ladder',kind:'scale',config,bpmLadder:{enabled:true,bpmStart:80,bpmTarget:100,bpmStep:10,repsPerStep:2}},
    {name:'Cycle',kind:'guide_tones',config:{...config,bpm:96,meter:'4/4',subdivision:'quarter'},keyCycle:{enabled:true,strategy:'circle_of_fourths',keysPerSession:3}},
    {name:'Target',kind:'chromatic',config:{...config,bpm:173,meter:'3/4',subdivision:'sixteenth',fretMin:1,fretMax:4},targetSec:12},
  ]};
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
