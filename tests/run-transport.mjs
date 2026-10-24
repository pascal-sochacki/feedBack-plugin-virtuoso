import assert from 'node:assert/strict';
import test from 'node:test';
import {createRunTransport} from '../src/shell/run-transport.js';

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

test('exact resume preserves cursor and skips the ordinary bar-entry runway',()=>{
  const {owner,clock}=harness();
  owner.seek(3.25,10);owner.begin();owner.anchor(3.25,0.1);owner.pause();
  clock(1500);
  assert.equal(owner.resumeAt(4),true);
  assert.equal(owner.time,4);
  assert.equal(owner.preRollUntil,0);
  assert.equal(owner.sessionPausedMs(),500);
  assert.equal(owner.resumeAt(5),false);
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
