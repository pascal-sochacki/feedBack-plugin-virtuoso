import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fc from 'fast-check';
import {createRunTransport} from '../src/shell/run-transport.js';
import {characterize,ROOT} from './helpers/characterization.mjs';
import {transportStatements} from './helpers/run-transport.mjs';
import {buildLab,transformRuntime} from '../scripts/cut-lab.mjs';

const fixture=JSON.parse(readFileSync(new URL('./fixtures/run-transport-before-extraction.json',import.meta.url)));
const hash=text=>createHash('sha256').update(text).digest('hex');
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};

function harness() {
  let identity=0,bundle={},wallMs=1000,audioSeconds=null,ready=Promise.resolve(true);
  const events=[];
  let voices=async()=>{events.push('voices');};
  const operation={currentRequest:()=>identity,isCurrentRequest:id=>id===identity};
  const owner=createRunTransport({operation,getBundle:()=>bundle,prepareVoices:b=>voices(b),
    startPlayback:()=>events.push('start'),clockNow:()=>({wallMs,audioSeconds})});
  return {owner,events,operation,setVoices:fn=>{voices=fn;},clock:(wall,audio=null)=>{wallMs=wall;audioSeconds=audio;},
    invalidate:()=>{identity++;},replace:()=>{bundle={};},start:()=>owner.runStart(ready,()=>events.push('before')),
    ready:promise=>{ready=promise;}};
}

test('transport retains independently captured dirty-before actual audio/clock/target/status events in source and Lab',()=>{
  const rows=transportStatements(readFileSync(join(ROOT,'screen.js'),'utf8'));
  const cleanup=JSON.parse(readFileSync(new URL('./fixtures/unused-declarations-before-cleanup.json',import.meta.url)));
  assert.equal(fixture.entry.statements,782);
  assert.equal(rows.length,cleanup.entry.statements);assert.equal(hash(JSON.stringify(rows)),cleanup.entry.sha256);
  const actual=characterize(undefined,undefined,{lifecycle:'transport-events'}),text=JSON.stringify(actual);
  assert.equal(actual.length,fixture.events.rows);assert.equal(Buffer.byteLength(text),fixture.events.bytes);assert.equal(hash(text),fixture.events.sha256);
  const temp=mkdtempSync(join(process.env.TMPDIR,'opencode/virtuoso-transport-parity-'));
  try {buildLab(temp);assert.equal(JSON.stringify(characterize(join(temp,'virtuoso_lab'),undefined,{lifecycle:'transport-events'})),transformRuntime(text));}
  finally {rmSync(temp,{recursive:true,force:true});}
});

test('real source and Lab repeated pending Play warms and starts exactly once (dirty-before failed 2 vs 1)',()=>{
  const controls={lifecycle:'transport-repeat-play'};assert.deepEqual(characterize(undefined,undefined,controls),controls);
  const temp=mkdtempSync(join(process.env.TMPDIR,'opencode/virtuoso-transport-repeat-'));
  try {buildLab(temp);assert.deepEqual(characterize(join(temp,'virtuoso_lab'),undefined,controls),controls);}
  finally {rmSync(temp,{recursive:true,force:true});}
});

test('native transport import and construction are inert and live getters cannot be written',()=>{
  execFileSync(process.execPath,['--input-type=module','-e',`
    for(const name of ['window','document','localStorage','performance','fetch'])Object.defineProperty(globalThis,name,{get(){throw Error(name)}});
    const {createRunTransport}=await import(${JSON.stringify(new URL('../src/shell/run-transport.js',import.meta.url).href)});
    const fail=()=>{throw Error('dependency')};const owner=createRunTransport({operation:{currentRequest:fail,isCurrentRequest:fail},getBundle:fail,prepareVoices:fail,startPlayback:fail,clockNow:fail});
    if(owner.playing||owner.time!==0)throw Error('initial');
    let threw=false;try{owner.time=5;}catch{threw=true;}if(!threw)throw Error('writable');
  `]);
});

test('audio clock, wall fallback, frozen pause, resume runway and Stop cursor preserve independent math',()=>{
  const {owner,clock}=harness();owner.seek(9,30);owner.begin();owner.rememberStart();owner.anchor(9,0.1);
  clock(1100);owner.advance(1100);assert.equal(owner.time,9);
  clock(1600);owner.advance(1600);assert.equal(owner.time,9.5);
  clock(2000,4);owner.anchor(9.5,0.1);clock(99000,4.6);owner.advance(99000);assert.ok(Math.abs(owner.time-10)<1e-10);
  owner.pause();clock(104000,99);owner.advance(104000);assert.ok(Math.abs(owner.time-10)<1e-10);assert.equal(owner.sessionPausedMs(),5000);
  owner.resume({lead:2,beats:[2,4,6,8,10,12].map(time=>({time,accent:'measure'}))});assert.equal(owner.time,8);assert.equal(owner.preRollUntil,10);
  owner.anchor(8,0.1);clock(105000,101.1);owner.advance(105000);owner.finishPreRoll();assert.equal(owner.preRollUntil,0);
  owner.stop(true,true);assert.equal(owner.time,9);assert.equal(owner.anchorTime,9);assert.equal(owner.playing,false);
  owner.seek(-5,30);assert.equal(owner.time,0);owner.seek(99,30);assert.equal(owner.time,30);
});

test('loop markers remain distinct from committed cycle, phase carry retains anchor clocks and Stop start',()=>{
  const {owner}=harness();owner.markLoop(4,null);assert.equal(owner.loopA,null);owner.setLoop(4,6);
  owner.seek(5,10);owner.begin();owner.rememberStart();assert.equal(owner.time,4);owner.anchor(4,0.1);
  owner.moveCursor(6.3);owner.wrap(2);owner.countWrap();assert.equal(owner.time,4.3);assert.equal(owner.anchorTime,2);assert.equal(owner.startTime,4);assert.equal(owner.anchorMs,1100);
  owner.pause();owner.seek(5.5,10);owner.resume({lead:0,beats:[0,2,4,6].map(time=>({time,accent:'measure'}))});assert.equal(owner.time,4);assert.equal(owner.preRollUntil,4);
  owner.resetLoop();assert.equal(owner.markerA,null);assert.equal(owner.wraps,0);assert.equal(owner.loopA,4);
  owner.stop();assert.equal(owner.time,4);owner.setLoop(null,null);assert.equal(owner.loopB,null);
});

test('pending readiness false/rejection never warms; current voice failure propagates, stale failure is silent',async()=>{
  for(const outcome of ['false','reject']) {
    const h=harness(),ready=deferred();h.ready(ready.promise);const pending=h.start();
    if(outcome==='false'){ready.resolve(false);assert.equal(await pending,false);}else {ready.reject(Error('ready'));await assert.rejects(pending,/ready/);}
    assert.deepEqual(h.events,[]);
  }
  const h=harness();h.setVoices(async()=>{throw Error('voice');});await assert.rejects(h.start(),/voice/);assert.deepEqual(h.events,[]);
  const stale=harness(),voices=deferred();stale.setVoices(()=>voices.promise);const old=stale.start();await flush();stale.invalidate();
  voices.reject(Error('stale'));assert.equal(await old,false);assert.deepEqual(stale.events,[]);
});

test('pending run joins identity without invalidating ready generation; replaced bundle and canceled operation never start',async()=>{
  const h=harness(),gate=deferred();h.ready(gate.promise);const first=h.start(),second=h.start();assert.equal(first,second);gate.resolve(true);
  assert.equal(await first,true);assert.deepEqual(h.events,['voices','before','start']);
  for(const cancel of ['invalidate','replace']) {
    const current=harness(),ready=deferred();current.ready(ready.promise);const pending=current.start();current[cancel]();ready.resolve(true);
    assert.equal(await pending,false);assert.deepEqual(current.events,[]);
  }
  const latest=harness(),oldVoices=deferred();latest.setVoices(()=>oldVoices.promise);const old=latest.start();await flush();latest.invalidate();latest.replace();latest.setVoices(async()=>latest.events.push('new-voices'));
  assert.equal(await latest.start(),true);oldVoices.resolve();assert.equal(await old,false);assert.deepEqual(latest.events,['new-voices','before','start']);
});

test('property: bounded valid async transport commands preserve cancellation and independent clock laws',async()=>{
  const seed=Number(process.env.PROPERTY_SEED||20261021),numRuns=Number(process.env.PROPERTY_NUM_RUNS||100);
  await fc.assert(fc.asyncProperty(fc.array(fc.constantFrom('play','resolve','cancel','replace','pause','seek','advance','stop'),{minLength:1,maxLength:32}),async commands=>{
    const h=harness();let expectedStarts=0;const pending=[];
    for(const command of commands) {
      if(command==='play'&&!pending.length) {const gate=deferred();h.ready(gate.promise);const result=h.start();pending.push({gate,result,identity:h.operation.currentRequest()});}
      if(command==='resolve'&&pending.length) {
        const request=pending.shift(),expected=request.identity===h.operation.currentRequest();
        request.gate.resolve(true);await flush();assert.equal(await request.result,expected);
        if(expected)expectedStarts++;
      }
      if(command==='cancel')h.invalidate();if(command==='replace'){h.invalidate();h.replace();}
      if(command==='pause'){h.owner.begin();h.owner.pause();const time=h.owner.time;h.clock(8000,90);h.owner.advance(8000);assert.equal(h.owner.time,time);}
      if(command==='seek'){h.owner.seek(12,10);assert.equal(h.owner.time,10);}
      if(command==='advance'){h.owner.begin();h.clock(1000,null);h.owner.anchor(2,0.1);h.clock(2100,null);h.owner.advance(2100);assert.equal(h.owner.time,3);}
      if(command==='stop'){h.invalidate();h.owner.stop();assert.equal(h.owner.playing,false);assert.equal(h.owner.paused,false);}
    }
    h.invalidate();for(const request of pending){request.gate.resolve(true);assert.equal(await request.result,false);}
    assert.equal(h.events.filter(event=>event==='start').length,expectedStarts);
  }),{seed,numRuns});
});
