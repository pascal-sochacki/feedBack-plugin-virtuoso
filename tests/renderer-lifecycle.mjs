import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import fc from 'fast-check';
import {createRendererLifecycle} from '../src/shell/renderer-lifecycle.js';
import {characterize} from './helpers/characterization.mjs';
import {buildLab} from '../scripts/cut-lab.mjs';

const deferred = () => {let resolve, reject; const promise = new Promise((yes,no) => {resolve=yes; reject=no;}); return {promise,resolve,reject};};
const flush = async () => {for (let i=0;i<20;i++) await Promise.resolve();};

function harness() {
  const nodes = new Map(), listeners = new Set(), timers = new Map(), frames = new Map(), store = new Map();
  let serial = 0, playing = false;
  class Element {
    constructor() {this.width=800; this.height=500; this.style={}; this.value=''; this.classes=new Map(); this.classList={toggle:(name,on)=>this.classes.set(name,on)};}
    getBoundingClientRect() {return {width:800,height:500};}
    appendChild(node) {node.parentElement=this; nodes.set(node.id,node);}
    replaceWith(node) {this.parentElement.appendChild(node); this.parentElement=null;}
  }
  for (const id of ['render-host','renderer-status','view-select','root','handmarks-toggle-wrap']) nodes.set('virtuoso-'+id,new Element());
  const preference=new Element();
  globalThis.document={getElementById:id=>nodes.get(id)||null, querySelector:()=>preference, createElement:()=>new Element()};
  globalThis.window={addEventListener:(_type,handler)=>listeners.add(handler),removeEventListener:(_type,handler)=>listeners.delete(handler)};
  globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
  globalThis.setTimeout=handler=>{timers.set(++serial,handler); return serial;};
  globalThis.clearTimeout=id=>timers.delete(id);
  globalThis.requestAnimationFrame=handler=>{frames.set(++serial,handler); return serial;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  const instances=[],events=[];
  const factory=(ready,initFailure)=>()=>{
    const candidate={draw(){},destroys:0,init(canvas,bundle){events.push(['init',canvas,bundle]); if(initFailure)throw initFailure;},resize(...size){events.push(['resize',...size]);},destroy(){this.destroys++;},readyPromise:ready};
    instances.push(candidate); return candidate;
  };
  const owner=createRendererLifecycle({makeHighway:factory(),makeTab:factory(),makeNotation:factory(),
    onBeforeAttach(){events.push(['stop']);},prepareScene(exercise){events.push(['scene']);return {config:exercise.session,chords:[{t:0,id:1}],chordTemplates:[{name:'C'}]};},
    onRendererCommitted:label=>events.push(['commit',label]),onLayoutChanged:()=>events.push(['draw']),onWindowResized:()=>events.push(['overlays']),isPlaying:()=>playing});
  owner.setFactoryProbe(async kind=>({factory:factory(),label:kind}));
  return {owner,factory,instances,events,nodes,listeners,timers,frames,store,preference,setPlaying:value=>{playing=value;}};
}

const savedGlobals = Object.fromEntries(['document','window','localStorage','setTimeout','clearTimeout','requestAnimationFrame','cancelAnimationFrame'].map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
test.afterEach(()=>{for(const [name,descriptor] of Object.entries(savedGlobals)) {if(!descriptor)delete globalThis[name];else Object.defineProperty(globalThis,name,descriptor);}});

test('native renderer owner import and construction never read DOM, host, storage, clocks or factories',()=>{
  execFileSync(process.execPath,['--input-type=module','-e',`
    for(const name of ['document','window','localStorage','fetch','performance','requestAnimationFrame'])Object.defineProperty(globalThis,name,{get(){throw Error('IO '+name)}});
    const {createRendererLifecycle}=await import(${JSON.stringify(new URL('../src/shell/renderer-lifecycle.js',import.meta.url).href)});
    const fail=()=>{throw Error('early dependency')};
    const owner=createRendererLifecycle({makeHighway:fail,makeTab:fail,makeNotation:fail,onBeforeAttach:fail,prepareScene:fail,onRendererCommitted:fail,onLayoutChanged:fail,onWindowResized:fail,isPlaying:fail});
    if(owner.renderer!==null||owner.currentRequest()!==0)throw Error('initial state');
  `]);
});

test('real entry Play waits on a candidate already published but not ready',()=>{
  assert.deepEqual(characterize(undefined,{lifecycle:'renderer-held-play'}),{lifecycle:'renderer-held-play'});
  const temp=mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode','virtuoso-renderer-play-'));
  try {buildLab(temp);assert.deepEqual(characterize(join(temp,'virtuoso_lab'),{lifecycle:'renderer-held-play'}),{lifecycle:'renderer-held-play'});}
  finally {rmSync(temp,{recursive:true,force:true});}
});

for (const suffix of ['stop','stop-reject','new','new-reject','new-play-reject','voices-stop','voices-new']) test(`real source and Lab held Play cancellation: ${suffix}`,()=>{
  const controls={lifecycle:'renderer-held-play-'+suffix};
  assert.deepEqual(characterize(undefined,controls),controls);
  const temp=mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode','virtuoso-renderer-cancel-'));
  try {buildLab(temp);assert.deepEqual(characterize(join(temp,'virtuoso_lab'),controls),controls);}
  finally {rmSync(temp,{recursive:true,force:true});}
});

for (const suffix of ['reject', 'session-reject']) test(`real source and Lab report current held Play readiness failure without unhandled rejection: ${suffix}`,()=>{
  const controls={lifecycle:'renderer-held-play-'+suffix};
  assert.deepEqual(characterize(undefined,controls),controls);
  const temp=mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode','virtuoso-renderer-reject-'));
  try {buildLab(temp);assert.deepEqual(characterize(join(temp,'virtuoso_lab'),controls),controls);}
  finally {rmSync(temp,{recursive:true,force:true});}
});

test('malformed borrowed candidates observe rejected readiness before draw/init validation or getters throw',()=>{
  execFileSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    const {createRendererLifecycle}=await import(${JSON.stringify(new URL('../src/shell/renderer-lifecycle.js',import.meta.url).href)});
    const unhandled=[];process.on('unhandledRejection',error=>unhandled.push(error));
    const canvas={id:'',style:{},width:800,height:500,getBoundingClientRect:()=>({width:800,height:500})};
    const host={getBoundingClientRect:canvas.getBoundingClientRect,appendChild(node){node.parentElement=this;}};
    globalThis.document={getElementById:id=>id==='virtuoso-render-host'?host:null,createElement:()=>canvas};
    globalThis.localStorage={getItem:()=>null};
    let destroys=0;
    const owner=createRendererLifecycle({makeHighway(){},makeTab(){},makeNotation(){},onBeforeAttach(){},prepareScene:exercise=>({config:exercise.session}),onRendererCommitted(){throw Error('unexpected commit')},onLayoutChanged(){},onWindowResized(){},isPlaying:()=>false});
    for(const kind of ['missing-draw','draw-getter','init-getter','ready-getter','then-getter']) {
      const candidate={destroy(){destroys++;}};
      if(kind!=='ready-getter'&&kind!=='then-getter')candidate.readyPromise=Promise.reject(Error('ready rejected '+kind));
      if(kind==='draw-getter')Object.defineProperty(candidate,'draw',{get(){throw Error('draw getter')}});
      if(['init-getter','ready-getter','then-getter'].includes(kind))candidate.draw=()=>{};
      if(kind==='init-getter')Object.defineProperty(candidate,'init',{get(){throw Error('init getter')}});
      if(kind==='ready-getter')Object.defineProperty(candidate,'readyPromise',{get(){throw Error('ready getter')}});
      if(kind==='then-getter')candidate.readyPromise={get then(){throw Error('then getter')}};
      owner.setFactoryProbe(async()=>({factory:()=>candidate,label:kind}));
      const expected=kind==='missing-draw'?/FeedBack-compatible/:new RegExp(kind.replace('-',' '));
      await assert.rejects(owner.attach({session:{renderer:'tab_2d'}}),expected);
      assert.equal(owner.renderer,null);owner.reset();
      await new Promise(resolve=>setImmediate(resolve));
      assert.deepEqual(unhandled,[],kind);
    }
    assert.equal(destroys,5);
  `],{encoding:'utf8'});
});

test('init throwing while readiness rejects never leaves an unhandled rejection',()=>{
  execFileSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    const {createRendererLifecycle}=await import(${JSON.stringify(new URL('../src/shell/renderer-lifecycle.js',import.meta.url).href)});
    const unhandled=[];process.on('unhandledRejection',error=>unhandled.push(error));
    const canvas={id:'',style:{},width:800,height:500,parentElement:null,getBoundingClientRect:()=>({width:800,height:500})};
    const host={getBoundingClientRect:canvas.getBoundingClientRect,appendChild(node){node.parentElement=this;}};
    globalThis.document={getElementById:id=>id==='virtuoso-render-host'?host:null,createElement:()=>canvas};
    globalThis.localStorage={getItem:()=>null};
    let destroys=0;
    const factory=()=>({draw(){},init(){this.readyPromise=Promise.reject(Error('ready'));throw Error('init')},destroy(){destroys++;}});
    const owner=createRendererLifecycle({makeHighway:factory,makeTab:factory,makeNotation:factory,onBeforeAttach(){},prepareScene:exercise=>({config:exercise.session}),onRendererCommitted(){},onLayoutChanged(){},onWindowResized(){},isPlaying:()=>false});
    await assert.rejects(owner.attach({session:{renderer:'tab_2d'}}),/init/);
    await new Promise(resolve=>setImmediate(resolve));
    assert.deepEqual(unhandled,[]);assert.equal(destroys,1);
  `],{encoding:'utf8'});
});

test('candidate is published before ready; current success commits after ready with supplied canvas and exact-once reset',async()=>{
  const h=harness(),gate=deferred();
  h.owner.setFactoryProbe(async()=>({factory:h.factory(gate.promise),label:'ready'}));
  const exercise={session:{renderer:'notation_2d'}};
  const pending=h.owner.attach(exercise); await flush();
  const candidate=h.instances.at(-1); assert.equal(h.owner.renderer,candidate);
  assert.equal(h.events.some(e=>e[0]==='commit'),false);
  candidate.setMode=mode=>h.events.push(['mode',mode]);
  gate.resolve(); assert.equal(await pending,true);
  assert.deepEqual(h.events.slice(-3),[['mode','notation'],['resize',800,500],['commit','ready']]);
  assert.equal(h.owner.actualView,'notation_2d'); assert.equal(h.owner.desiredView,'notation_2d');
  h.owner.reset();h.owner.reset();assert.equal(candidate.destroys,1);assert.equal(h.owner.renderer,null);assert.equal(h.owner.bundle,null);
});

for (const phase of ['resolver','ready']) for (const rejected of [false,true]) test(`stale ${phase} ${rejected?'rejection':'success'} cannot reclaim A→B→A or destroy current candidate`,async()=>{
  const h=harness(),gate=deferred();
  h.owner.setFactoryProbe(phase==='resolver'?()=>gate.promise:async()=>({factory:h.factory(gate.promise),label:'old'}));
  const old=h.owner.attach({session:{renderer:'tab_2d'}}); await flush();
  const stale=h.owner.renderer,identity=h.owner.currentRequest();
  h.owner.setFactoryProbe(async kind=>({factory:h.factory(),label:kind}));
  await h.owner.attach({session:{renderer:'notation_2d'}});await h.owner.attach({session:{renderer:'tab_2d'}});
  const current=h.owner.renderer,bundle=h.owner.bundle,count=h.instances.length;
  if(rejected)gate.reject(Error('old'));else gate.resolve({factory:h.factory(),label:'old'});
  assert.equal(await old,false);assert.equal(h.owner.isCurrentRequest(identity),false);
  assert.equal(h.owner.renderer,current);assert.equal(h.owner.bundle,bundle);assert.equal(current.destroys,0);assert.equal(h.instances.length,count);
  if(stale)assert.equal(stale.destroys,1);
});

test('invalid borrowed shapes, factory/init/ready failures clean only owned candidate and propagate current errors',async()=>{
  const h=harness();
  for(const value of [null,42,{}, {destroy(){this.count=(this.count||0)+1;}}]) {
    h.owner.setFactoryProbe(async()=>({factory:()=>value,label:'invalid'}));
    await assert.rejects(h.owner.attach({session:{renderer:'tab_2d'}}),/FeedBack-compatible/);
    assert.equal(h.owner.renderer,null);if(value?.destroy)assert.equal(value.count,1);
  }
  h.owner.setFactoryProbe(async()=>({factory:()=>{throw Error('factory')},label:'throw'}));
  await assert.rejects(h.owner.attach({session:{renderer:'tab_2d'}}),/factory/);
  h.owner.setFactoryProbe(async()=>({factory:h.factory(undefined,Error('init')),label:'init'}));
  await assert.rejects(h.owner.attach({session:{renderer:'tab_2d'}}),/init/);assert.equal(h.instances.at(-1).destroys,1);
  h.owner.setFactoryProbe(async()=>({factory:h.factory(Promise.reject(Error('ready'))),label:'ready'}));
  await assert.rejects(h.owner.attach({session:{renderer:'tab_2d'}}),/ready/);assert.equal(h.instances.at(-1).destroys,1);
  h.owner.setFactoryProbe(async()=>({factory:()=>({draw(){}}),label:'minimal'}));
  assert.equal(await h.owner.attach({session:{renderer:'tab_2d'}}),true);h.owner.reset();
});

test('actual fallback retains legacy persisted cfg policy separately from desired view and chord-free highway bundle',async()=>{
  const h=harness(); h.owner.selectView('highway_3d');
  h.owner.setFactoryProbe(async()=>({factory:h.factory(),label:'fallback',kind:'builtin_2d'}));
  const exercise={session:{renderer:'highway_3d'}};await h.owner.attach(exercise);
  assert.equal(h.owner.desiredView,'highway_3d');assert.equal(h.owner.actualView,'builtin_2d');
  assert.equal(exercise.session.renderer,'builtin_2d');assert.equal(h.preference.value,'builtin_2d');assert.equal(h.store.get('virtuoso.renderer'),'builtin_2d');
  assert.deepEqual(h.owner.bundle.chords,[],'resolver fallback preserves original chord-free init bundle');
  h.owner.setFactoryProbe(async()=>({factory:h.factory(),label:'full'}));await h.owner.attach({session:{renderer:'tab_2d'}});
  assert.equal(h.owner.bundle.chords.length,1);
  h.owner.selectView('notation_2d');await h.owner.attach({session:{renderer:'builtin_2d'}},true);
  assert.equal(h.owner.desiredView,'notation_2d');assert.equal(h.owner.actualView,'builtin_2d','error retry preserves selected intent separately from actual scene');
});

test('owner resolves preferred then legacy factories at call time, local Classic and absent borrowed highway fallback',async()=>{
  const h=harness();h.owner.setFactoryProbe(null);
  const {window,document}=globalThis;
  const legacy=h.factory(),preferred=h.factory();
  window.slopsmithViz_highway_2d=legacy;
  assert.equal((await h.owner.resolveFactory('highway_2d')).factory,legacy);
  window.feedBackViz_highway_2d=preferred;
  assert.equal((await h.owner.resolveFactory('highway_2d')).factory,preferred);
  delete window.feedBackViz_highway_2d;delete window.slopsmithViz_highway_2d;
  const classic=await h.owner.resolveFactory('highway_2d');assert.equal(classic.label,'2D Highway');assert.equal(typeof classic.factory().destroy,'function');
  document.head={appendChild(script){script.onerror();}};
  const fallback=await h.owner.resolveFactory('highway_3d');assert.equal(fallback.kind,'builtin_2d');assert.equal(fallback.label,'2D Highway (fallback)');
  window.feedBackViz_highway_3d=preferred;
  assert.equal((await h.owner.resolveFactory('highway_3d')).factory,preferred,'late registration stays visible after absence');
});

test('ready gate is request-owned through cancellation and current rejection; construction failure invalidates old intent',async()=>{
  const h=harness(),gate=deferred();
  h.owner.setFactoryProbe(async()=>({factory:h.factory(gate.promise),label:'pending'}));
  const attachment=h.owner.attach({session:{renderer:'tab_2d'}});await flush();
  const held=h.owner.waitUntilReady();h.owner.reset();gate.reject(Error('late'));
  assert.equal(await attachment,false);assert.equal(await held,false);assert.equal(await h.owner.waitUntilReady(),false);
  h.owner.setFactoryProbe(async()=>({factory:h.factory(Promise.reject(Error('current'))),label:'current'}));
  const current=h.owner.attach({session:{renderer:'tab_2d'}}),ready=h.owner.waitUntilReady();
  await assert.rejects(current,/current/);await assert.rejects(ready,/current/);
  await h.owner.attach({session:{renderer:'tab_2d'}}).catch(()=>{});
  const identity=h.owner.currentRequest();
  localStorage.getItem=()=>{throw Error('storage');};
  await assert.rejects(h.owner.attach({session:{renderer:'highway_3d'}}),/storage/);
  assert.equal(h.owner.isCurrentRequest(identity),false);
});

test('visit-owned resize debounce and transition frames cancel on reset/leave; mount is exact once',async()=>{
  const h=harness();h.owner.mount();h.owner.mount();assert.equal(h.listeners.size,1);
  await h.owner.attach({session:{renderer:'tab_2d'}});
  for(const fn of h.listeners)fn();for(const fn of h.listeners)fn();assert.equal(h.timers.size,1);
  const callback=[...h.timers.values()][0];h.timers.clear();callback();assert.deepEqual(h.events.slice(-3),[['resize'],['draw'],['overlays']]);
  h.owner.refitDuring(300);assert.equal(h.frames.size,1);const frame=[...h.frames.values()][0];
  const count=h.events.length;h.owner.unmount();assert.equal(h.listeners.size,0);assert.equal(h.frames.size,0);assert.equal(h.timers.size,0);
  frame();callback();assert.equal(h.events.length,count);assert.equal(h.instances.at(-1).destroys,1);
  h.owner.mount();h.owner.refitNextFrame();assert.equal(h.frames.size,1);h.owner.unmount();assert.equal(h.frames.size,0);
});

test('property: bounded async renderer schedules obey last intent, stale cleanup and one active candidate',async()=>{
  await fc.assert(fc.asyncProperty(fc.array(fc.record({kind:fc.constantFrom('highway_2d','tab_2d','notation_2d'),phase:fc.constantFrom('resolver','ready'),cancel:fc.boolean(),reject:fc.boolean()}),{minLength:1,maxLength:10}),async actions=>{
    const h=harness(),pending=[];let expected=null;
    for(const action of actions) {
      const gate=deferred();h.owner.setFactoryProbe(action.phase==='resolver'?()=>gate.promise:async()=>({factory:h.factory(gate.promise),label:action.kind}));
      const promise=h.owner.attach({session:{renderer:action.kind}});await flush();
      pending.push({promise,gate,action});
      if(action.cancel){h.owner.reset();expected=null;}else expected=pending.at(-1);
    }
    // Reverse completion deliberately makes old responses arrive after the last
    // visible intent. The oracle is the action log, never owner state transitions.
    for(const item of pending.toReversed()) {
      if(item.action.reject)item.gate.reject(Error('scheduled'));else item.gate.resolve({factory:h.factory(),label:item.action.kind});
      let accepted=false;try{accepted=await item.promise;}catch(error){assert.equal(item,expected);assert.match(error.message,/scheduled/);}
      assert.equal(accepted,item===expected&&!item.action.reject);
    }
    const committed=expected&&!expected.action.reject;
    assert.equal(h.owner.renderer!==null,!!committed);
    if(committed)assert.equal(h.owner.actualView,expected.action.kind);
    assert.equal(h.instances.filter(instance=>instance.destroys===0).length,committed?1:0);
    h.owner.reset();assert.ok(h.instances.every(instance=>instance.destroys===1));
  }),{seed:Number(process.env.FC_SEED||20261021),numRuns:100});
});
