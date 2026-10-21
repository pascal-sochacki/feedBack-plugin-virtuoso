import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {createPracticePresentation,positionStepperIsShapeMode} from '../src/shell/practice-presentation.js';
import {PATHWAYS} from '../src/content/pathways.js';
import {FORM_CUES} from '../src/content/form-cues.js';

function dom() {
  const nodes=new Map();
  for(const id of ['pathway-goal-card','pathway-title','pathway-tag','pathway-goal','pathway-goal-rest','goal-more','pathway-form-cue','pathway-backing-note','pathway-tuning-note','pathway-pb','prove-clean','start-cta','start-name','start-verb','start-skill','position-row','position-label','position-readout','shape','fretboard-system','root']) {
    const classes=new Set();
    const el={textContent:'',style:{},hidden:false,value:'position',options:[],classList:{contains:x=>classes.has(x),add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)}};
    Object.defineProperty(el,'innerHTML',{set(){throw Error('Plain text only');}});
    nodes.set(`virtuoso-${id}`,el);
  }
  globalThis.document={getElementById:id=>nodes.get(id)||null};
  return id=>nodes.get(`virtuoso-${id}`);
}
const base=()=>({pathwayId:'pent_foundation',tierIndex:0,variationIndex:0,bandId:'concept_picking',cfg:{instrument:'guitar',practiceType:'scale',key:'D',scale:'major',fretMin:0,fretMax:12,backingDensity:0},bestBpm:null,proveClean:false,instrument:null,detectorMinHz:30,concertKey:'D',playing:false,paused:false,jamMode:false,jamIntent:'',session:null});

test('direct presentation priority, disclosure, PB, supports and transport are display-only and live', () => {
  const el=dom(),state=base(),calls=[];
  const owner=createPracticePresentation({getCurrentPractice:(view,id)=>{calls.push([view,id]);return state;}});
  const saved=PATHWAYS.pent_foundation;
  try {
    PATHWAYS.pent_foundation={label:'Plain <b>& title</b>',goal:'Recognize it. Long <img onerror=bad> & hint.',tempoTiers:[60,80],formCues:['light_grip','guide_finger'],vary:[{key:'C'},{key:'D'}]};
    owner.renderGoal(state.pathwayId);
    assert.equal(el('pathway-goal').textContent,'Recognize it.');assert.equal(el('pathway-goal-rest').textContent,'Long <img onerror=bad> & hint.');
    assert.equal(el('pathway-title').textContent,'Plain <b>& title</b>');assert.equal(el('pathway-form-cue').textContent,'Form · '+FORM_CUES.guitar.light_grip);
    assert.equal(el('pathway-backing-note').textContent,'Backing · click only');assert.equal(el('goal-more').style.display,'');assert.equal(el('prove-clean').style.display,'none');
    state.tierIndex=1;state.bestBpm=60;state.proveClean=true;state.playing=true;state.paused=true;state.variationIndex=-1;
    owner.renderGoal(state.pathwayId,true);owner.renderPosition();
    assert.equal(el('pathway-form-cue').textContent,'Form · '+FORM_CUES.guitar.guide_finger);
    assert.equal(el('pathway-pb').textContent,'Your clean best here: 60 BPM — beat it (next rung at 80)');assert.equal(el('prove-clean').style.display,'');
    assert.equal(el('position-label').textContent,'Key');assert.equal(el('position-readout').textContent,'D (2/2)');assert.equal(el('start-verb').textContent,'▶ RESUME');
    state.cfg.instrument='bass';state.cfg.practiceType='slap_pop';owner.renderGoal(state.pathwayId);
    assert.equal(el('pathway-form-cue').textContent,'Form · '+FORM_CUES.bass.pop_hook);
    const before=calls.length;owner.renderGoal(null,false,{name:'Favorite <img>'});assert.equal(calls.length,before);assert.equal(el('pathway-title').textContent,'Favorite <img>');assert.equal(el('goal-more').style.display,'none');
    assert.deepEqual(calls[0],['goal','pent_foundation']);
  } finally {PATHWAYS.pent_foundation=saved;}
});

test('authored catalog added after construction controls selected hint/title; no stale registry snapshot', () => {
  const el=dom(),state=base();state.pathwayId='late';state.variationIndex=0;state.tierIndex=0;
  const owner=createPracticePresentation({getCurrentPractice:()=>state});
  try {
    PATHWAYS.late={label:'MD title',goal:'MD authoritative goal. MD remainder.',tempoTiers:[60],vary:[{},{}],practiceFile:{variants:[{id:'a',hint:'A <img> & plain'},{id:'b',hint:'B <script> & plain'}],pathway:{variations:[{title:'Variation <b>A</b>',charts:['a']},{title:'Variation <b>B</b>',charts:['b']}],tiers:[{bpm:60}]}}};
    owner.renderGoal('late');owner.renderPosition();assert.equal(el('pathway-goal-rest').textContent,'MD remainder.\n\nA <img> & plain');assert.equal(el('position-readout').textContent,'Variation <b>A</b> (1/2)');
    state.variationIndex=1;owner.renderGoal('late');owner.renderPosition();assert.equal(el('pathway-goal-rest').textContent,'MD remainder.\n\nB <script> & plain');assert.equal(el('position-readout').textContent,'Variation <b>B</b> (2/2)');
    PATHWAYS.late={...PATHWAYS.late,label:'Updated MD title',goal:'Replacement goal.'};owner.renderGoal('late');assert.equal(el('pathway-title').textContent,'Updated MD title');assert.equal(el('pathway-goal').textContent,'Replacement goal.');
  } finally {delete PATHWAYS.late;}
});

test('presentation import/construction is inert and absent panels never read state or bind events', () => {
  execFileSync(process.execPath,['--input-type=module','-e',`for(const name of ['document','window','localStorage','fetch'])Object.defineProperty(globalThis,name,{get(){throw Error(name)}});const {createPracticePresentation}=await import(${JSON.stringify(new URL('../src/shell/practice-presentation.js',import.meta.url).href)});createPracticePresentation({getCurrentPractice(){throw Error('early snapshot')}});`]);
  delete globalThis.document;
  const owner=createPracticePresentation({getCurrentPractice(){throw Error('absent panel snapshot');}});
  owner.renderGoal('pent_foundation');owner.renderPosition();owner.renderStart();assert.equal(positionStepperIsShapeMode(),false);
  owner.renderFile();
});

test('status names active file/Jam before leftover form and retains renderer-independent frets', () => {
  const state=base(),owner=createPracticePresentation({getCurrentPractice:()=>state});
  assert.equal(owner.describe(),'D major, frets 0–12');
  state.cfg.mode='chromatic';state.cfg.chromaticPattern='1234';assert.match(owner.describe(),/^Chromatic .*frets 0–12$/);
  state.jamMode=true;state.jamIntent='land the third';state.session={jamStyle:'blues',key:'G',bpm:90};assert.equal(owner.describe(),'Jam — Blues in G · 90 BPM · land the third');
  state.session={practiceFile:{},sessionName:'MD <title>',practiceFileVariantTitle:'Plain <hint>',bpm:60,referenceTempo:120};assert.equal(owner.describe(),'File practice — MD <title> · Plain <hint> · 60 BPM (reference 120)');
});

test('direct file presentation uses selected plain hint/title/prose and clears controls without mutation or listeners', () => {
  const el=dom(),state=base(),nodes=new Map();
  for(const id of ['file-prose','file-unload','file-variants','file-variant','file-next','file-hint']) {
    const node={textContent:'',value:'',hidden:false,disabled:false,children:[],replaceChildren(){this.children=[];},appendChild(child){this.children.push(child);},addEventListener(){throw Error('Presentation cannot bind config actions');}};
    Object.defineProperty(node,'innerHTML',{set(){throw Error('Unsafe authored HTML');}});nodes.set(`virtuoso-${id}`,node);
  }
  globalThis.document={getElementById:id=>nodes.get(id)||el(id.replace('virtuoso-',''))||null,createElement:()=>({})};
  const practice=Object.freeze({title:'MD <b>title</b>',referenceTempo:120,meter:'4/4',prose:'<img> & markdown [link](bad)',variants:Object.freeze([{id:'a',title:'A <b>',hint:'First & <img>'},{id:'b',title:'B <script>',hint:'Second & <script>'}])});
  state.practiceFile=practice;state.practiceVariantId='b';
  const owner=createPracticePresentation({getCurrentPractice:view=>{assert.equal(view,'file');return state;}});owner.renderFile();
  assert.equal(nodes.get('virtuoso-file-hint').textContent,'Second & <script>');assert.deepEqual(nodes.get('virtuoso-file-variant').children,[{value:'a',textContent:'A <b>'},{value:'b',textContent:'B <script>'}]);
  assert.match(nodes.get('virtuoso-file-prose').textContent,/<img> & markdown \[link\]\(bad\)/);assert.equal(nodes.get('virtuoso-file-variant').value,'b');assert.equal(state.practiceFile,practice);
  state.practiceFile=null;state.practiceVariantId=null;owner.renderFile();assert.equal(nodes.get('virtuoso-file-hint').textContent,'');assert.equal(nodes.get('virtuoso-file-prose').textContent,'');assert.equal(nodes.get('virtuoso-file-variant').disabled,true);assert.equal(nodes.get('virtuoso-file-variants').hidden,true);
});
