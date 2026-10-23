import assert from 'node:assert/strict';
import test from 'node:test';
import {createWorkoutEditor} from '../src/shell/workout-editor.js';
import {materializeWorkoutConfig} from '../src/core/workout-config.js';
import {BUILT_IN_SESSIONS} from '../src/content/workouts.js';
import {SEGMENT_TEMPLATES} from '../src/content/segments.js';
import {el} from '../src/shell/dom.js';

function dom() {
  class Element {
    constructor(tag='div') {this.tagName=tag;this.handlers=new Map();this.dataset={};this.style={};this.attributes={};this.children=[];this.classList={add(){},remove(){},toggle(){}};this.value='';this.checked=false;this.hidden=false;this.disabled=false;this.draggable=false;this.id='';this.title='';this.type='';this.tabIndex=0;this.spellcheck=true;}
    addEventListener(type,fn) {const set=this.handlers.get(type)||new Set();set.add(fn);this.handlers.set(type,set);}
    removeEventListener(type,fn) {this.handlers.get(type)?.delete(fn);}
    appendChild(child) {this.children.push(child);return child;}
    replaceChildren(...children) {this.children=[];for(const child of children)if(child!=null)this.appendChild(child);}
    setAttribute(name,value) {this.attributes[name]=String(value);}
    querySelectorAll(){return [];}
    get textContent() {return this.children.map(child=>child.textContent).join('');}
    async fire(type,target=this,extra={}) {for (const fn of this.handlers.get(type)||[]) await fn({target,preventDefault(){},...extra});}
  }
  class TextNode {constructor(text){this.textContent=text;}}
  const nodes=new Map(['session-info','segment-list','length-preset','breathe-toggle','workout-refresh','refresh-summary'].map(id=>['virtuoso_lab-'+id,new Element()]));
  globalThis.HTMLElement=Element;
  globalThis.document={getElementById:id=>nodes.get(id)||null,createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag),createTextNode:text=>new TextNode(text)};
  globalThis.window={matchMedia:()=>({matches:true})};
  const action=(act,index)=>({closest:sel=>sel==='.virtuoso_lab-segment-card'?{dataset:{segIndex:String(index)},classList:{add(){}}}:sel==='[data-act]'?{dataset:{act},disabled:false}:null});
  return {nodes,action};
}

test('DOM builder flattens children and sets safe properties and attributes', () => {
  dom();
  const node=el('button',{className:'action',dataset:{segIndex:4},style:{color:'red'},disabled:true,hidden:false,'aria-label':'<close>'},'one',[2,false,null,undefined,['<img src=x>']]);
  assert.equal(node.className,'action');assert.equal(node.dataset.segIndex,'4');assert.equal(node.style.color,'red');
    assert.equal(node.disabled,true);assert.equal(node.hidden,false);assert.equal(node.attributes['aria-label'],'<close>');
  assert.equal(node.children.length,3);assert.equal(node.textContent,'one2<img src=x>');
  assert.equal(node.children.some(child=>child.tagName==='img'),false);
});

test('DOM builder ignores unsupported and executable properties', () => {
  dom();
  const node=el('iframe',{srcdoc:'<script>alert(1)</script>',href:'javascript:alert(1)',src:'javascript:alert(1)',onerror:'alert(1)',onclick:()=>{},unknown:'value'});
  assert.equal(node.attributes.srcdoc,undefined);assert.equal(node.attributes.href,undefined);assert.equal(node.attributes.src,undefined);
  assert.equal(node.attributes.onerror,undefined);assert.equal(node.attributes.onclick,undefined);assert.equal(node.attributes.unknown,undefined);
  assert.equal(Object.hasOwn(node,'onerror'),false);assert.equal(Object.hasOwn(node,'onclick'),false);
});

test('dynamic HTML-looking values stay inert text in DOM builder nodes', () => {
  dom();
  const payload='<img src=x onerror=alert(1)><script>alert(1)</script>';
  const node=el('div',{title:payload},payload);
  assert.equal(node.title,payload);
  assert.equal(node.textContent,payload);
  assert.equal(node.children.length,1);
  assert.equal(node.children[0].tagName,undefined);
});

test('controller owns mutable clone edits, raw indexes, refresh aliases, selectors and visit listener teardown', async () => {
  for(const [id,t] of Object.entries(SEGMENT_TEMPLATES)) t.id=id;
  const {nodes,action}=dom();
  const editor=createWorkoutEditor(async()=>{throw Error('edit must not preview');});
  editor.select('starter_arc');const draft=editor.draft,segs=draft.segments;
  const shipped=JSON.stringify(BUILT_IN_SESSIONS);
  editor.mount('timeline');editor.mount('options');editor.mount('timeline');
  const list=nodes.get('virtuoso_lab-segment-list');
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
  const length=nodes.get('virtuoso_lab-length-preset');length.value='';await length.fire('change');assert.equal(editor.draft.lengthPreset,null);
  const breathe=nodes.get('virtuoso_lab-breathe-toggle');breathe.checked=false;await breathe.fire('change');assert.equal(editor.draft.interBlockBreak,'off');
  const stale=[...list.handlers.get('click')][0];
  editor.unmount();assert.ok([...list.handlers.values()].every(set=>set.size===0));
  editor.mount('timeline');editor.mount('options');const size=segs.length;
  await stale({target:action('dup',0)});assert.equal(segs.length,size);
  await list.fire('click',action('dup',0));assert.equal(segs.length,size+1);
  const templateId=Object.keys(SEGMENT_TEMPLATES).find(id=>SEGMENT_TEMPLATES[id].vary?.length>1);
  editor.replace('refs',{segments:[{templateId,variantIdx:0},{kind:'scale',config:{key:'C'}}]});
  const before=editor.draft,inline=before.segments[1];
  const template=SEGMENT_TEMPLATES[templateId], originalLabel=template.label;
  template.label='<img src=x>';
  await list.fire('click',action('reroll',0));
  template.label=originalLabel;
  assert.notEqual(editor.draft,before);assert.equal(editor.draft.segments[1],inline,'refresh keeps inline aliases');
  assert.equal(before.segments[0].variantIdx,0,'old ref draft is not edited by refresh');
  const summary=nodes.get('virtuoso_lab-refresh-summary');
  const bold=summary.children[0].children.find(child=>child.tagName==='b');
  assert.ok(bold);assert.equal(bold.textContent,'<img src=x>');
  assert.equal(bold.children[0].tagName,undefined);
  editor.replace('refs',{stringSetup:'guitar_6_standard',segments:[{templateId:'missing'},{kind:'scale',config:{bpm:80}}]});
  const listChildren=nodes.get('virtuoso_lab-segment-list').children;
  assert.equal(listChildren.length,1);assert.equal(listChildren[0].dataset.segIndex,'1');
  editor.replace('unsafe',{name:'<img src=x>',description:'<b>description</b>',segments:[{kind:'<script>',name:'<svg onload=x>'}]});
  const info=nodes.get('virtuoso_lab-session-info');
  assert.equal(info.children[0].textContent,'<img src=x>');assert.equal(info.children[1].textContent,'<b>description</b>');
  assert.equal(info.children[0].children[0].tagName,undefined);
  const card=nodes.get('virtuoso_lab-segment-list').children[0];
  assert.equal(card.dataset.kind,'<script>');assert.equal(card.children[0].children[2].textContent,'<svg onload=x>');
  editor.select('absent');assert.equal(editor.draft,null);assert.equal(nodes.get('virtuoso_lab-segment-list').children.length,0);
  editor.unmount();
});

test('plain Workout config materializes refs and inherits only family-compatible tuning without mutating input', () => {
  const draft={stringSetup:'guitar_6_standard',segments:[{kind:'scale',config:{key:'C',bpm:80}}]};
  const original=JSON.stringify(draft),audio={notes:true,metronome:false,harmony:false};
  const options={audio,stringSetup:'guitar_7_standard',customOpenMidis:' 38,45,50,55,59,64,69 ',countInBars:2};
  const cfg=materializeWorkoutConfig(draft,options);
  assert.equal(cfg.stringSetup,options.stringSetup);assert.equal(cfg.customOpenMidis,options.customOpenMidis.trim());assert.equal(cfg.countInBars,2);
  assert.equal(cfg.segments[0].config.audio,audio);assert.notEqual(cfg.segments[0].config,draft.segments[0].config);
  assert.throws(()=>materializeWorkoutConfig(draft,{...options,stringSetup:'bass_4_standard'}),/draft is retained/);
  assert.equal(JSON.stringify(draft),original);
});

test('Workout explicit physical constraints block mismatched tuning/count but degree-driven drafts retain BPM and adapt counts',()=>{
  const options={audio:{notes:true,metronome:true,harmony:false},stringSetup:'guitar_7_standard',customOpenMidis:'',countInBars:1};
  const draft={stringSetup:'guitar_6_standard',segments:[{kind:'scale',config:{bpm:123}}]};
  assert.equal(materializeWorkoutConfig(draft,options).segments[0].config.bpm,123);
  const fixed={...draft,segments:[{kind:'scale',config:{bpm:123,customOpenMidis:'40,45,50,55,59,64'}}]};
  const before=JSON.stringify(fixed);
  assert.throws(()=>materializeWorkoutConfig(fixed,options),/tuning\/string count/);
  assert.equal(JSON.stringify(fixed),before);
  assert.equal(materializeWorkoutConfig(fixed,{...options,stringSetup:'guitar_6_standard'}).segments[0].config.bpm,123);
});
