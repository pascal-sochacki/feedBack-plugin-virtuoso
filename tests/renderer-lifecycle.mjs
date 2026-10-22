import assert from 'node:assert/strict';
import test from 'node:test';
import {createRendererLifecycle} from '../src/shell/renderer-lifecycle.js';

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
  for (const id of ['render-host','renderer-status','view-select','root','handmarks-toggle-wrap']) nodes.set('virtuoso_lab-'+id,new Element());
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
