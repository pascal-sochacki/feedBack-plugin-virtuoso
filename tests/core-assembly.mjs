import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {appendChordGeometry} from '../src/core/chart-assembly.js';
import {appendCountInBeats} from '../src/core/count-in.js';
import {buildSegmentConfig} from '../src/core/session-config.js';
import {buildSingleChart} from '../src/core/exercise-dispatch.js';
import {generateSession} from '../src/core/session.js';
import {fillNotesFromSeq, directedPath, orientSeq} from '../src/core/sequence.js';
const round = n => Number(n.toFixed(6));

test('block chord geometry clones timed records, shares templates/nested notes and retains strict malformed-array failures', () => {
  const chart = {
    chords:[{t:0.1234567,id:2,hd:false,notes:[{s:0,f:3}]}],
    chordTemplates:[{name:'C',displayName:'C',arp:false,fingers:[1],frets:[3]}],
    handShapes:[{chord_id:2,start_time:0.1234567,end_time:1.2345678,arp:false}],
  };
  const before = structuredClone(chart);
  const dest = {chords:[],chordTemplates:[],handShapes:[]};
  appendChordGeometry(dest,chart,2.0000004,5);
  assert.deepEqual(chart,before);
  assert.deepEqual(dest.chords[0],{...chart.chords[0],t:2.123457,id:7});
  assert.deepEqual(dest.handShapes[0],{...chart.handShapes[0],chord_id:7,start_time:2.123457,end_time:3.234568});
  assert.notEqual(dest.chords[0],chart.chords[0]);
  assert.notEqual(dest.handShapes[0],chart.handShapes[0]);
  assert.equal(dest.chords[0].notes,chart.chords[0].notes);
  assert.equal(dest.chordTemplates[0],chart.chordTemplates[0]);
  assert.throws(()=>appendChordGeometry(dest,{...chart,chords:null},0,0),TypeError);
  appendChordGeometry(dest,chart,0,1);
  assert.deepEqual(dest.chords.map(c=>c.id),[7,3]);
});

test('incoming count-in retains odd-meter grouping, per-beat live subdivision reads and endpoint tolerance', () => {
  let reads = 0;
  const cfg = {bpm:120,meter:{numerator:7,denominator:8,grouping:[2,2,3]},get subdivision(){reads++;return 'sixteenth';}};
  const beats = [{time:-1,measure:1,accent:'measure'}];
  appendCountInBeats(beats,cfg,1.75,3);
  assert.deepEqual(beats.slice(1).map(b=>b.time),[3,3.25,3.5,3.75,4,4.25,4.5,4.75]);
  assert.deepEqual(beats.slice(1).map(b=>b.accent),['measure','beat','group','beat','group','beat','beat','measure']);
  assert.ok(beats.slice(1).every(b=>b.brk && b.brkSub===2));
  assert.equal(reads,2*8,'lookup still reads subdivision twice per ordinary beat');
  assert.equal(beats[0].time,-1);
});

test('guitar and bass sessions retain exact incoming and wrap break arithmetic on each block grid', () => {
  for (const stringSetup of ['guitar_6_standard','bass_5_standard']) {
    const segments=[
      {name:'First',kind:'chromatic',config:{bpm:120,bars:1,meter:'4/4',fretboardSystem:'position',fretMin:1,fretMax:4}},
      {name:'Second',kind:'chromatic',config:{bpm:90,bars:1,meter:'7/8',subdivision:'sixteenth',fretboardSystem:'position',fretMin:1,fretMax:4}},
    ];
    const session={stringSetup,interBlockBreak:'always',segments};
    const {chart}=generateSession(session);
    const [first,second]=chart.segmentBounds;
    const incomingBar=(60/90)*(4/8)*7;
    assert.equal(first.start,0);
    assert.equal(second.start,round(first.end+incomingBar));
    const localCharts=segments.map(s=>buildSingleChart(buildSegmentConfig(s,session)));
    const secondStart=localCharts[0].duration+incomingBar;
    assert.equal(chart.duration,secondStart+localCharts[1].duration+2,'wrap uses first block 4/4 at 120; total duration remains unrounded');
    assert.equal(second.barSec,round(incomingBar));
    assert.ok(chart.beats.filter(b=>b.brk && b.time>=first.end && b.time<second.start).every(b=>b.brkSub===2));
    assert.ok(chart.beats.filter(b=>b.brk && b.time>=second.end).every(b=>b.brkSub===2));
    for (const [i,bound] of chart.segmentBounds.entries()) {
      const cfg=buildSegmentConfig(segments.find(s=>s.name===bound.name),session);
      const local=buildSingleChart(cfg);
      const start=i===0?0:secondStart;
      assert.equal(bound.end,round(start+local.duration));
      const notes=chart.notes.filter(n=>n.t>=bound.start && n.t<bound.end);
      assert.deepEqual(notes,local.notes.map(n=>({...n,t:round(n.t+start)})));
    }
  }
});

test('sequence emission preserves whole mechanical cycles, annotation whitelist, variable rhythms and distinct turn policies', () => {
  const seq=[{s:0,f:1,fg:1,pkd:0,midi:41,ho:false},{s:0,f:2,fg:2,ac:true}];
  const chart=fillNotesFromSeq(seq,{step:0.25,totalTime:0.6,sus:0.1,name:'Cycle',loopCycleSteps:2});
  assert.deepEqual(chart.notes.map(n=>n.t),[0,0.25,0.5,0.75]);
  assert.equal(chart.duration,1);
  assert.deepEqual(chart.notes.map(n=>n.fg),[1,2,1,2]);
  assert.equal(chart.notes[0].ho,false);
  assert.equal(chart.notes[0].midi,undefined);
  assert.equal(chart.notes[0].pkd,undefined,'sequence whitelist intentionally excludes pkd');
  const variable=fillNotesFromSeq(seq,{step:0.25,steps:[0.5,0.25],totalTime:0.6,sus:0.1,name:'Variable',loopCycleSteps:4});
  assert.deepEqual(variable.notes.map(n=>n.t),[0,0.5]);
  assert.equal(variable.duration,0.75);
  assert.deepEqual(directedPath([1,2,3],'up_down',1),[1,2,3,2]);
  assert.deepEqual(orientSeq([1,2,3],'up_down'),[1,2,3,3,2,1]);
  let rolls=0;
  directedPath([1,2,3,4],'random',3,()=>{rolls++;return 0.5;});
  assert.equal(rolls,9);
});

test('assembly owners import and execute without ambient RNG or host IO', () => {
  execFileSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    for(const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext']) Object.defineProperty(globalThis,name,{get(){throw Error('IO: '+name)}});
    Math.random=()=>{throw Error('ambient RNG')};
    const {appendChordGeometry}=await import(${JSON.stringify(new URL('../src/core/chart-assembly.js',import.meta.url).href)});
    const {appendCountInBeats}=await import(${JSON.stringify(new URL('../src/core/count-in.js',import.meta.url).href)});
    const {buildAccompanimentEvents}=await import(${JSON.stringify(new URL('../src/core/backing.js',import.meta.url).href)});
    const {buildSegmentConfig}=await import(${JSON.stringify(new URL('../src/core/session-config.js',import.meta.url).href)});
    appendChordGeometry({chords:[],chordTemplates:[],handShapes:[]},{chords:[],chordTemplates:[],handShapes:[]},0,0);
    for(const stringSetup of ['guitar_6_standard','bass_5_standard']) {
      const cfg=buildSegmentConfig({kind:'scale',config:{bars:1,bpm:120,humanSeed:42,fretboardSystem:'position',audioProfile:'rock'}},{stringSetup});
      assert.ok(buildAccompanimentEvents(cfg,2).length);
      const beats=[];appendCountInBeats(beats,cfg,2,0);assert.ok(beats.length);
    }
  `]);
});
