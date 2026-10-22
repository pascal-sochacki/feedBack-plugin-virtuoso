import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {createTuningSettings} from '../src/shell/tuning-settings.js';
import {readConfig, setFieldSilent, syncAdvancedMode, applyPracticeConfig} from '../src/shell/practice-config.js';
import {practiceFormDefaults} from '../src/core/practice-form-defaults.js';
import {createPracticePresets} from '../src/shell/practice-presets.js';

function configDom(values = {}, disabled = []) {
  const fields = Object.fromEntries(Object.entries(values).map(([name,value]) => [name,{name,value,disabled:disabled.includes(name),type:'text'}]));
  const form = {elements:{namedItem:name=>fields[name] || null}};
  globalThis.document = {getElementById:id=>id==='virtuoso_lab-controls'?form:null,querySelector:selector=>fields[selector.match(/name="([^"]+)"/)?.[1]] || null,querySelectorAll:()=>disabled.map(name=>fields[name])};
  globalThis.FormData = class {get(name) {const field=fields[name];return field&&!field.disabled?field.value:null;}};
  globalThis.localStorage = {getItem:()=>null};
  return fields;
}

test('direct configuration reader preserves live disabled fret priority, nullable selection, numeric defaults and NaN', () => {
  configDom({practiceType:'chromatic',fretMin:'9',fretMax:'13',bpm:'bad',brightness:'bad'},['fretMin','fretMax']);
  let cfg=readConfig();assert.equal(cfg.fretMin,9);assert.equal(cfg.fretMax,13);assert.equal(cfg.shape,null);
  assert.ok(Number.isNaN(cfg.bpm));assert.ok(Number.isNaN(cfg.audio.brightness));
  assert.equal(cfg.direction,'up_down');assert.equal(cfg.repeatCount,1);assert.equal(cfg.backingDensity,undefined);
  configDom({practiceType:'spider',fretMin:'10000',fretMax:'-3',countIn:'0',clickSubdiv:'99'});
  cfg=readConfig();assert.equal(cfg.fretMin,35);assert.equal(cfg.fretMax,36);assert.equal(cfg.countInBars,0);assert.equal(cfg.clickSubdiv,4);
  configDom({mode:'guide_tones',progression:'other',guideToneProgression:'blues',backingDensity:'bad'});
  cfg=readConfig();assert.equal(cfg.mode,'guide_tones');assert.equal(cfg.progression,'blues');assert.equal(cfg.backingDensity,0);
});

test('direct configuration reader covers all seven setups, actual tuning resolution and count-in preference priority', () => {
  for(const [setup,count,instrument] of [['guitar_6_standard',6,'guitar'],['guitar_7_standard',7,'guitar'],['guitar_8_standard',8,'guitar'],['bass_4_standard',4,'bass'],['bass_5_standard',5,'bass'],['bass_6_standard',6,'bass'],['guitar_6_drop_d',6,'guitar']]) {
    configDom({stringSetup:setup,practiceType:'chromatic',customOpenMidis:Array.from({length:count},(_,i)=>30+i*5).join(','),subdivision:'sixteenth',meter:'4/4'});
    let cfg=readConfig();assert.equal(cfg.stringCount,count);assert.equal(cfg.instrument,instrument);assert.equal(cfg.customOpenMidis.length,count);
    assert.equal(cfg.countInBars,2);globalThis.localStorage.getItem=key=>key==='virtuoso_lab.countInDefault'?'1':null;
    cfg=readConfig();assert.equal(cfg.countInBars,1);
  }
  configDom({practiceType:'scale',customOpenMidis:'38,43,48,53,57,62',key:'D',scale:'major',shape:'E'});
  const detuned=readConfig();assert.ok(detuned.shapeNotes.length>0);
  configDom({practiceType:'scale',customOpenMidis:'40,45,50,55,59,64',key:'D',scale:'major',shape:'E'});
  assert.notDeepEqual(readConfig().shapeNotes,detuned.shapeNotes);
  configDom({practiceType:'chromatic',customOpenMidis:'38,43,bad'});assert.equal(readConfig().customOpenMidis,null);
});

test('silent form writer preserves missing controls, coercion and advanced disable ownership; configuration import is inert', () => {
  const fields=configDom({key:'C',advancedMode:''},['key']);fields.advancedMode.type='checkbox';
  setFieldSilent('missing',0);setFieldSilent('key',null);assert.equal(fields.key.value,'null');
  setFieldSilent('advancedMode','false');assert.equal(fields.advancedMode.checked,true);
  syncAdvancedMode();assert.equal(fields.key.disabled,true);
  execFileSync(process.execPath,['--input-type=module','-e',`for(const name of ['document','window','localStorage','fetch']) Object.defineProperty(globalThis,name,{get(){throw Error(name)}});await import(${JSON.stringify(new URL('../src/shell/practice-config.js',import.meta.url).href)});`]);
});

test('practice form application preserves instrument-before-fields and profile-before-overlay ordering with own/inherited keys', () => {
  const fields=configDom({stringSetup:'guitar_6_standard',practiceType:'scale',backingStyle:'boogie',brightness:'0',advancedMode:''});
  const cfg=Object.assign(Object.create({backingStyle:'inherited',swing:'shuffle'}),{stringSetup:'bass_4_standard',practiceType:'walking_bass',brightness:null,advancedMode:false});
  const order=[];
  applyPracticeConfig(cfg,{onInstrument(){order.push('instrument');assert.equal(fields.stringSetup.value,'bass_4_standard');assert.equal(fields.practiceType.value,'scale');},onProfile(){order.push('profile');assert.equal(fields.brightness.value,'0.5');},onComplete(){order.push('complete');assert.equal(fields.practiceType.value,'walking_bass');}});
  assert.deepEqual(order,['instrument','profile','complete']);assert.equal(fields.brightness.value,'null');assert.equal(fields.backingStyle.value,'inherited');
  const defaults=Object.fromEntries(practiceFormDefaults(Object.freeze({hertaAccent:0,sweepStrings:null,backingDensity:NaN,customOpenMidis:[]})));
  assert.equal(defaults.hertaAccent,0);assert.equal(defaults.sweepStrings,'0');assert.ok(Number.isNaN(defaults.backingDensity));assert.deepEqual(defaults.customOpenMidis,[]);
});

function presetDom() {
  class Element {
    constructor(){this.children=[];this.handlers=new Set();this.value='';}
    get options(){return this.children;}
    querySelector(selector){return this.children.find(el=>selector.includes('"'+el.value+'"')) || null;}
    appendChild(el){this.children.push(el);}
    addEventListener(_,fn){this.handlers.add(fn);}
    removeEventListener(_,fn){this.handlers.delete(fn);}
    fire(){for(const fn of this.handlers)fn();}
  }
  const group=new Element(),picker=new Element();picker.children=[{value:''}];
  const wrap={hidden:true},pathway={querySelector:()=>group};
  globalThis.document={getElementById:id=>id==='virtuoso_lab-pathway'?pathway:id==='virtuoso_lab-preset-picker'?picker:wrap,createElement:()=>new Element()};
  globalThis.window={};return {group,picker,wrap};
}

test('practice preset owner retains cache identity, first insertion and live selection without auto-apply on fetch', async () => {
  const {picker,group,wrap}=presetDom();const selected=[];
  const owner=createPracticePresets({onSelect:cfg=>selected.push(cfg)});owner.mount();owner.mount();
  const cfg={key:'G'};globalThis.fetch=async()=>new Response(JSON.stringify({presets:[null,{id:'a',name:'First',config:cfg},{id:'a',name:'Replacement',config:{key:'D'}}]}));
  await owner.load();assert.equal(picker.handlers.size,1);assert.equal(picker.options.length,2);assert.equal(group.children.length,1);assert.equal(group.children[0].textContent,'First');assert.equal(wrap.hidden,false);assert.equal(selected.length,0);
  picker.value='fav__a';picker.fire();assert.equal(selected[0],owner.get('fav__a').config);assert.equal(selected[0].key,'D');
  const cache=globalThis.window.__virtuosoFavorites;globalThis.fetch=async()=>new Response('failure',{status:500});await owner.load();assert.equal(globalThis.window.__virtuosoFavorites,cache);
  globalThis.fetch=async()=>{throw Error('offline');};await owner.load();assert.equal(globalThis.window.__virtuosoFavorites,cache);owner.unmount();
});

test('practice preset loads are latest-request and visit owned; stale handlers and navigation cannot write abandoned UI', async () => {
  const {picker,group}=presetDom();let calls=0;const owner=createPracticePresets({onSelect:()=>calls++});owner.mount();
  const stale=[...picker.handlers][0];const gates=[];globalThis.fetch=()=>new Promise(resolve=>gates.push(resolve));
  const old=owner.load(),newer=owner.load();gates[1](new Response(JSON.stringify({presets:[{id:'new',config:{}}]})));await newer;
  gates[0](new Response(JSON.stringify({presets:[{id:'old',config:{}}]})));await old;assert.equal(owner.get('fav__old'),undefined);
  const abandoned=owner.load();owner.unmount();owner.mount();gates[2](new Response(JSON.stringify({presets:[{id:'abandoned'}]})));await abandoned;
  assert.equal(group.children.length,1);picker.value='fav__new';stale();assert.equal(calls,0);picker.fire();assert.equal(calls,1);owner.unmount();
  execFileSync(process.execPath,['--input-type=module','-e',`for(const name of ['document','window','localStorage','fetch']) Object.defineProperty(globalThis,name,{get(){throw Error(name)}});const {createPracticePresets}=await import(${JSON.stringify(new URL('../src/shell/practice-presets.js',import.meta.url).href)});createPracticePresets({onSelect(){throw Error('early selection')}});const {practiceFormDefaults}=await import(${JSON.stringify(new URL('../src/core/practice-form-defaults.js',import.meta.url).href)});practiceFormDefaults({});`]);
});
function dom() {
  class Element {
    constructor() {this.handlers=new Map();this.dataset={};this.style={};this.children=[];this.value='';this.classList={add(){},remove(){}};}
    set innerHTML(_) {this.children=[];}
    get options() {return this.children.flatMap(el=>el.children.length ? el.children : [el]);}
    get selectedIndex() {return this.options.findIndex(el=>el.value===this.value);}
    appendChild(el) {this.children.push(el);}
    addEventListener(type,fn) {const set=this.handlers.get(type)||new Set();set.add(fn);this.handlers.set(type,set);}
    removeEventListener(type,fn) {this.handlers.get(type)?.delete(fn);}
    dispatchEvent(event) {return this.fire(event.type);}
    async fire(type) {for(const fn of this.handlers.get(type)||[]) await fn();}
  }
  const nodes = new Map(['tuning-select','save-tuning','custom-open-midis','custom-tuning','custom-tuning-inputs'].map(id=>['virtuoso_lab-'+id,new Element()]));
  const setup=new Element(),instrument=new Element(); setup.value='guitar_6_standard'; instrument.value='guitar';
  globalThis.document={getElementById:id=>nodes.get(id)||null,querySelector:selector=>selector.includes('stringSetup')?setup:instrument,querySelectorAll:()=>nodes.get('virtuoso_lab-custom-tuning-inputs').children,createElement:()=>new Element()};
  globalThis.window={prompt:()=>null};
  return {nodes,setup,instrument};
}

test('tuning controller owns first-match groups, live host reads, cache completion and exact selection declaration ordering', async () => {
  const {nodes,setup,instrument}=dom();
  let host=[],declared=0,selected=0,custom=[];
  const controller=createTuningSettings({hostEntries:()=>host,onDeclaration:()=>declared++,onSelection:()=>selected++,onCustomChange:(...args)=>custom.push(args),onDisplay(){}});
  const select=nodes.get('virtuoso_lab-tuning-select'),hidden=nodes.get('virtuoso_lab-custom-open-midis');
  controller.mount();controller.mount();controller.sync();
  assert.equal(select.handlers.get('change').size,1);
  host=[{name:'Duplicate',midis:[40,45,50,55,59,64]},{name:'Alternate',midis:[37,44,49,54,58,63]}];
  controller.sync();assert.equal(select.options.filter(el=>el.value.startsWith('host:')).length,1);
  hidden.value=host[1].midis.join(',');controller.sync();assert.equal(select.value,'host:Alternate');
  await select.fire('change');assert.equal(declared,1);assert.equal(selected,1);assert.equal(setup.value,'guitar_6_standard');
  select.value='custom';await select.fire('change');assert.deepEqual(custom,[[true,false]]);
  const input=nodes.get('virtuoso_lab-custom-tuning-inputs').children[0]; input.value='C2';await input.fire('input');assert.equal(hidden.value.split(',')[0],'36');assert.deepEqual(custom.at(-1),[false,true]);
  await input.fire('blur');assert.deepEqual(custom.at(-1),[true,true]);
  let finish;
  globalThis.fetch=()=>new Promise(resolve=>{finish=resolve;});
  const pending=controller.load();instrument.value='bass';setup.value='bass_4_standard';hidden.value='';
  finish(new Response(JSON.stringify({tunings:[{id:'bass',name:'My bass',family:'bass',string_count:4,midis:[27,32,37,42]}]})));
  await pending;assert.ok(select.options.some(el=>el.value==='saved:bass'));assert.equal(select.value,'standard');
  assert.equal(declared,4,'loading only repaints, never persists L1');
  controller.unmount();
});

test('tuning listeners are visit-owned, old dynamic inputs cannot write, and canceled page events are not captured', async () => {
  const {nodes}=dom();let calls=0;
  const controller=createTuningSettings({hostEntries:()=>[],onDeclaration:()=>calls++,onSelection(){},onCustomChange(){},onDisplay(){}});
  const select=nodes.get('virtuoso_lab-tuning-select');
  controller.mount();controller.sync();select.value='custom';await select.fire('change');
  const old=nodes.get('virtuoso_lab-custom-tuning-inputs').children[0],stale=[...old.handlers.get('blur')][0];
  controller.syncInputs();const before=calls;await stale();assert.equal(calls,before);
  const staleSelect=[...select.handlers.get('change')][0];
  controller.unmount();assert.equal(select.handlers.get('change').size,0);
  controller.mount();controller.syncInputs();await staleSelect();assert.equal(calls,before);
  select.value='standard';await select.fire('change');assert.equal(calls,before+1);
  controller.unmount();
});

test('tuning settings import and construction are inert without DOM, host, storage or fetch', () => {
  execFileSync(process.execPath,['--input-type=module','-e',`
    for(const name of ['document','window','localStorage','fetch']) Object.defineProperty(globalThis,name,{get(){throw Error(name)}});
    const {createTuningSettings}=await import(${JSON.stringify(new URL('../src/shell/tuning-settings.js',import.meta.url).href)});
    createTuningSettings({hostEntries(){throw Error('early host')},onDeclaration(){},onCustomChange(){},onSelection(){},onDisplay(){}});
  `]);
});

test('tuning save cancellation, HTTP failure and load rejection preserve declaration and cache semantics', async () => {
  const {nodes}=dom();let declarations=0,requests=0;
  const controller=createTuningSettings({hostEntries:()=>[],onDeclaration:()=>declarations++,onSelection(){},onCustomChange(){},onDisplay(){}});
  controller.mount();nodes.get('virtuoso_lab-custom-open-midis').value='37,44,49,54,58,63';
  globalThis.fetch=async()=>{requests++;return new Response(JSON.stringify({tunings:[{id:'old',name:'Old',family:'guitar',string_count:6,midis:[37,44,49,54,58,63]}]}));};
  await controller.load();assert.equal(nodes.get('virtuoso_lab-tuning-select').value,'saved:old');
  await nodes.get('virtuoso_lab-save-tuning').fire('click');assert.equal(requests,1,'canceled prompt does not fetch');
  globalThis.window.prompt=()=> 'new';
  globalThis.fetch=async()=>{requests++;return new Response('failed',{status:500});};
  const warn=console.warn;console.warn=()=>{};
  try {await nodes.get('virtuoso_lab-save-tuning').fire('click');} finally {console.warn=warn;}
  assert.equal(requests,2,'failed save does not refetch');
  await controller.load();assert.equal(nodes.get('virtuoso_lab-tuning-select').value,'saved:old','HTTP load failure keeps old cache');
  globalThis.fetch=async()=>{throw Error('offline');};await controller.load();
  assert.equal(nodes.get('virtuoso_lab-tuning-select').value,'custom','rejected load clears old cache');
  assert.equal(declarations,0);
  controller.unmount();
});
