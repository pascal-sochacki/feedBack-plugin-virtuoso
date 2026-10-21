import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {characterize} from './helpers/characterization.mjs';
import {buildLab} from '../scripts/cut-lab.mjs';
import {createWorkoutEditor} from '../src/shell/workout-editor.js';
import {materializeWorkoutConfig} from '../src/core/workout-config.js';
import {BUILT_IN_SESSIONS} from '../src/content/workouts.js';
import {SEGMENT_TEMPLATES} from '../src/content/segments.js';

function dom() {
  class Element {
    constructor() {this.handlers=new Map();this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.value='';this.checked=false;}
    addEventListener(type,fn) {const set=this.handlers.get(type)||new Set();set.add(fn);this.handlers.set(type,set);}
    removeEventListener(type,fn) {this.handlers.get(type)?.delete(fn);}
    querySelectorAll(){return [];}
    async fire(type,target=this,extra={}) {for (const fn of this.handlers.get(type)||[]) await fn({target,preventDefault(){},...extra});}
  }
  const nodes=new Map(['session-info','segment-list','length-preset','breathe-toggle','workout-refresh','refresh-summary'].map(id=>['virtuoso-'+id,new Element()]));
  globalThis.document={getElementById:id=>nodes.get(id)||null};
  globalThis.window={matchMedia:()=>({matches:true})};
  const action=(act,index)=>({closest:sel=>sel==='.virtuoso-segment-card'?{dataset:{segIndex:String(index)},classList:{add(){}}}:sel==='[data-act]'?{dataset:{act},disabled:false}:null});
  return {nodes,action};
}

test('real source and Lab retain Workout handlers on canceled unload and active BFCache restore, not inactive restore', () => {
  characterize(undefined,{lifecycle:'editor-page-events'});
  const temp = mkdtempSync(join(process.env.TMPDIR || '/tmp/opencode','virtuoso-page-events-'));
  try {
    buildLab(temp);
    characterize(join(temp,'virtuoso_lab'),{lifecycle:'editor-page-events'});
  } finally {rmSync(temp,{recursive:true,force:true});}
});

test('controller owns mutable clone edits, raw indexes, refresh aliases, selectors and visit listener teardown', async () => {
  for(const [id,t] of Object.entries(SEGMENT_TEMPLATES)) t.id=id;
  const {nodes,action}=dom();
  const editor=createWorkoutEditor(async()=>{throw Error('edit must not preview');});
  editor.select('starter_arc');const draft=editor.draft,segs=draft.segments;
  const shipped=JSON.stringify(BUILT_IN_SESSIONS);
  editor.mount('timeline');editor.mount('options');editor.mount('timeline');
  const list=nodes.get('virtuoso-segment-list');
  assert.equal(list.handlers.get('click').size,1);
  await list.fire('click',action('dup',0));
  assert.equal(editor.draft,draft);assert.equal(editor.draft.segments,segs);
  assert.notEqual(segs[0],segs[1]);assert.notEqual(segs[0].config,segs[1].config);
  await list.fire('click',action('remove',1));assert.equal(segs.length,3);
  const transfer={setData(){}};
  await list.fire('dragstart',action('grip',0),{dataTransfer:transfer});
  await list.fire('drop',list,{clientY:100,dataTransfer:transfer});
  assert.equal(segs[2].id,'warmup','drop appends the raw block');
  editor.add('chromatic');assert.equal(JSON.stringify(BUILT_IN_SESSIONS),shipped);
  const length=nodes.get('virtuoso-length-preset');length.value='';await length.fire('change');assert.equal(editor.draft.lengthPreset,null);
  const breathe=nodes.get('virtuoso-breathe-toggle');breathe.checked=false;await breathe.fire('change');assert.equal(editor.draft.interBlockBreak,'off');
  const stale=[...list.handlers.get('click')][0];
  editor.unmount();assert.ok([...list.handlers.values()].every(set=>set.size===0));
  editor.mount('timeline');editor.mount('options');const size=segs.length;
  await stale({target:action('dup',0)});assert.equal(segs.length,size);
  await list.fire('click',action('dup',0));assert.equal(segs.length,size+1);
  const templateId=Object.keys(SEGMENT_TEMPLATES).find(id=>SEGMENT_TEMPLATES[id].vary?.length>1);
  editor.replace('refs',{segments:[{templateId,variantIdx:0},{kind:'scale',config:{key:'C'}}]});
  const before=editor.draft,inline=before.segments[1];
  await list.fire('click',action('reroll',0));
  assert.notEqual(editor.draft,before);assert.equal(editor.draft.segments[1],inline,'refresh keeps inline aliases');
  assert.equal(before.segments[0].variantIdx,0,'old ref draft is not edited by refresh');
  editor.replace('refs',{stringSetup:'guitar_6_standard',segments:[{templateId:'missing'},{kind:'scale',config:{bpm:80}}]});
  assert.match(nodes.get('virtuoso-segment-list').innerHTML,/data-seg-index="1"/);
  editor.select('absent');assert.equal(editor.draft,null);assert.equal(nodes.get('virtuoso-segment-list').innerHTML,'');
  editor.unmount();
});

test('plain Workout config materializes refs and inherits only family-compatible tuning without mutating input', () => {
  const draft={stringSetup:'guitar_6_standard',segments:[{kind:'scale',config:{key:'C',bpm:80}}]};
  const original=JSON.stringify(draft),audio={notes:true,metronome:false,harmony:false};
  const options={audio,stringSetup:'guitar_7_standard',customOpenMidis:' 38,45,50,55,59,64,69 ',countInBars:2};
  const cfg=materializeWorkoutConfig(draft,options);
  assert.equal(cfg.stringSetup,options.stringSetup);assert.equal(cfg.customOpenMidis,options.customOpenMidis.trim());assert.equal(cfg.countInBars,2);
  assert.equal(cfg.segments[0].config.audio,audio);assert.notEqual(cfg.segments[0].config,draft.segments[0].config);
  assert.equal(materializeWorkoutConfig(draft,{...options,stringSetup:'bass_4_standard'}).stringSetup,'guitar_6_standard');
  assert.equal(JSON.stringify(draft),original);
});

test('fresh controller/config imports and controller construction trap DOM host storage and fetch access', () => {
  execFileSync(process.execPath,['--input-type=module','-e',`
    for(const name of ['document','window','localStorage','fetch']) Object.defineProperty(globalThis,name,{get(){throw Error(name)}});
    const {createWorkoutEditor}=await import(${JSON.stringify(new URL('../src/shell/workout-editor.js',import.meta.url).href)});
    createWorkoutEditor(async()=>{});
  `]);
});
