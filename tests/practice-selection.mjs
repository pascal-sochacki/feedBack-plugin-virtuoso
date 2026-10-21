import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import fc from 'fast-check';
import {createPracticeSelection} from '../src/shell/practice-selection.js';
import {initialPracticeSelection,selectPracticePathway,practiceTierFields,PRACTICE_APPLICABILITY,offerable} from '../src/core/practice-selection.js';
import {PATHWAYS} from '../src/content/pathways.js';
import {STRING_SETUPS} from '../src/core/instrument-tuning.js';
import {parsePracticeMarkdown,practicePathwayEntry} from '../src/core/practice-files.js';
import {characterize} from './helpers/characterization.mjs';
import {buildLab} from '../scripts/cut-lab.mjs';

const md=readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup.md',import.meta.url),'utf8');
const ladder=readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup-ladder.md',import.meta.url),'utf8');
const index=readFileSync(new URL('../assets/practices/index.json',import.meta.url),'utf8');
const flush=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};

test('real entry lifecycle owns listeners across three actor cycles, canceled unload, incompatible tuning recovery and late ready rejection in source and Lab',()=>{
  const control={lifecycle:'selection-events'};
  assert.deepEqual(characterize(undefined,control),{lifecycle:'selection-events'});
  const temp=mkdtempSync(join(process.env.TMPDIR,'opencode/virtuoso-selection-events-'));
  try {buildLab(temp);assert.deepEqual(characterize(join(temp,'virtuoso_lab'),control),{lifecycle:'selection-events'});}
  finally {rmSync(temp,{recursive:true,force:true});}
});

function dom() {
  class Element {
    constructor(value='') {Object.assign(this,{value,disabled:false,hidden:false,checked:false,style:{},children:[],handlers:new Map()});const classes=new Set();this.classList={contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)};}
    get options(){return this.children;}
    set innerHTML(value){assert.equal(value,'');this.children=[];}
    appendChild(node){this.children.push(node);return node;}
    replaceChildren(){this.children=[];}
    addEventListener(event,handler){const handlers=this.handlers.get(event)||new Set();handlers.add(handler);this.handlers.set(event,handlers);}
    removeEventListener(event,handler){this.handlers.get(event)?.delete(handler);}
    dispatchEvent(event){return Promise.all([...this.handlers.get(event.type)||[]].map(handler=>handler({type:event.type,target:this})));}
    closest(){return null;}
    setAttribute(){}
  }
  const nodes=new Map();
  for(const id of ['controls','root','status','pathway','file-select','file-load','file-unload','file-next','file-variant','advanced-toggle','shape','fretboard-system','caged-shape-value','anchor-station','pathway-scale','pathway-scale-wrap','shape-prev','shape-next','mode-select',...['guided','custom','session','jam'].map(x=>'mode-'+x)])nodes.set('virtuoso-'+id,new Element());
  const fields=Object.fromEntries(['key','scale','meter','subdivision','bars','direction','sequence','shape','fretboardSystem','fretMin','fretMax','keyCycle','swing','stringSetup','instrument'].map(name=>[name,new Element()]));
  fields.stringSetup.value='guitar_6_standard';fields.instrument.value='guitar';fields.key.value='C';fields.scale.value='major';
  nodes.get('virtuoso-controls').elements={namedItem:name=>fields[name]||null};
  nodes.get('virtuoso-controls').querySelector=selector=>fields[selector.match(/name="([^"]+)"/)?.[1]]||null;
  nodes.get('virtuoso-file-select').value='chromatic-warmup';
  nodes.get('virtuoso-fretboard-system').value='position';
  nodes.get('virtuoso-pathway').children=['custom','chromatic_warmup','pent_foundation','bass_rh_pulse'].map(value=>new Element(value));
  const store=new Map();
  globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
  globalThis.document={getElementById:id=>nodes.get(id)||null,querySelector:selector=>fields[selector.match(/name="([^"]+)"/)?.[1]]||null,querySelectorAll:()=>[],createElement:()=>new Element()};
  globalThis.window={location:{href:'https://host.test/'}};
  let bundle=true,owner;
  const events=[];
  const dependencies={getContext:()=>({family:fields.instrument.value,hasBundle:bundle}),bands:[{id:'core',pathways:['pent_foundation','chromatic_warmup']},{id:'concept_rhythm',pathways:['rhy_swing']}],
    applySelectedConfig(id,config,variation){events.push(['apply',id,config,variation]);if(config)owner.beforeConfig();},
    changeModeView(mode,pathwayMode){events.push(['mode',mode,pathwayMode]);if(pathwayMode!=null)nodes.get('virtuoso-root').classList.toggle('virtuoso-pathway-mode',pathwayMode);},
    stopAndInvalidatePlayback(reset){events.push(['stop',reset]);owner?.cancelLoad();if(reset!=='none')bundle=false;},
    regenerateSelectedConfig:async()=>{events.push(['generate',owner.variantId]);return true;},
    presentation:{renderFile(){events.push(['file',owner.file?.id||null,owner.variantId]);},renderPosition(){events.push(['position']);},renderCatalog(){},refreshStatus(){}}
  };
  owner=createPracticeSelection(dependencies);
  globalThis.fetch=async url=>new Response(String(url).endsWith('index.json')?index:String(url).endsWith('chromatic-warmup-ladder.md')?ladder:md);
  return {owner,dependencies,nodes,fields,store,events,setBundle:value=>{bundle=value;}};
}

test('pure pathway transitions retain first variation, tier reset/preservation, negative wrapping, missing/custom state and shared metadata',()=>{
  let state=initialPracticeSelection();const pathway={base:{key:'C'},vary:[{},{},{}],tempoTiers:[60,80],tempoTierSubdivs:['quarter','eighth'],tempoTierBars:[0,6]};
  const before=structuredClone(pathway);state=selectPracticePathway(state,'a',pathway,'core',-1);assert.equal(state.variationIndex,2);
  state.tierIndex=1;state=selectPracticePathway(state,'a',pathway,'core',1);assert.equal(state.tierIndex,1);
  assert.deepEqual(practiceTierFields(pathway,0),[['bpm','60'],['subdivision','quarter'],['bars','0']]);
  assert.deepEqual(practiceTierFields(pathway,9),[]);
  const custom=selectPracticePathway(state,'custom',undefined,null);assert.equal(custom.tierIndex,1);assert.equal(custom.bandId,'core');
  const missing=selectPracticePathway(custom,'missing',undefined,null);assert.equal(missing.variationIndex,1);
  assert.equal(selectPracticePathway(missing,'a',pathway,'core').tierIndex,0);assert.deepEqual(pathway,before);
  const saved=PRACTICE_APPLICABILITY.bending.bass;
  try {assert.equal(offerable('bending','bass'),false);PRACTICE_APPLICABILITY.bending.bass='adapted';assert.equal(offerable('bending','bass'),true);assert.equal(offerable('unknown','bass'),true);}
  finally {PRACTICE_APPLICABILITY.bending.bass=saved;}
});

test('actual 24 authored variation/tier choices and all seven setups use current preferences, retain tuning and live catalog identity',()=>{
  const {owner,fields}=dom(),saved=PATHWAYS.chromatic_warmup;
  try {
    PATHWAYS.chromatic_warmup=practicePathwayEntry(parsePracticeMarkdown(ladder));
    for(const setup of Object.keys(STRING_SETUPS)) {
      fields.stringSetup.value=setup;
      for(let variation=0;variation<6;variation++)for(let tier=0;tier<4;tier++) {
        owner.applyPathway('chromatic_warmup',variation);owner.setTier(tier);
        const preferences={stringSetup:setup,instrument:STRING_SETUPS[setup].instrument,stringCount:STRING_SETUPS[setup].openMidis.length,bpm:83,renderer:'notation_2d',customOpenMidis:[38,45,50,55,59,64]};
        globalThis.document.getElementById('virtuoso-root').classList.toggle('virtuoso-pathway-mode',true);
        const cfg=owner.selectedConfig(preferences);
        assert.equal(cfg,preferences);assert.equal(cfg.bpm,83);assert.equal(cfg.renderer,'notation_2d');assert.equal(cfg.stringSetup,setup);
        assert.equal(cfg.practicePathwayVariationId,PATHWAYS.chromatic_warmup.practiceFile.pathway.variations[variation].id);
        assert.equal(cfg.practicePathwayTierIndex,tier);assert.equal(cfg.practiceFile,PATHWAYS.chromatic_warmup.practiceFile);
      }
    }
  } finally {if(saved)PATHWAYS.chromatic_warmup=saved;else delete PATHWAYS.chromatic_warmup;}
});

test('direct file lifecycle stops/resets before validation, Next wraps, failed replacement clears, stale listeners and A→B→A visits cannot reclaim state',async()=>{
  const {owner,nodes,events}=dom();owner.mount('files');owner.mount('files');
  assert.equal(nodes.get('virtuoso-file-load').handlers.get('click').size,1);
  await nodes.get('virtuoso-file-load').dispatchEvent({type:'click'});assert.ok(owner.file);
  const variants=owner.file.variants;
  await owner.chooseVariant(variants.at(-1).id);events.length=0;
  await nodes.get('virtuoso-file-next').dispatchEvent({type:'click'});
  assert.deepEqual(events[0],['stop','loop']);assert.equal(owner.variantId,variants[0].id);
  events.length=0;await owner.chooseVariant('missing');assert.deepEqual(events,[]);
  nodes.get('virtuoso-file-select').value='missing';await owner.loadFile();assert.equal(owner.file,null);assert.match(nodes.get('virtuoso-status').textContent,/Unknown practice id/);
  const stale=[...nodes.get('virtuoso-file-load').handlers.get('click')][0];
  owner.leave();events.length=0;await stale({target:nodes.get('virtuoso-file-load')});assert.deepEqual(events,[]);
  await owner.enter();await flush();nodes.get('virtuoso-file-select').value='chromatic-warmup';
  nodes.get('virtuoso-file-select').value='chromatic-warmup';
  await owner.loadFile();
  assert.ok(owner.file);
  owner.leave();await owner.enter();await stale({target:nodes.get('virtuoso-file-load')});assert.equal(owner.file,null);
});

test('mode switches preserve saved Warmup intent during pending catalog, canceled page lifecycle keeps active listeners and eligibility is declaration-aware',async()=>{
  const {owner,nodes,fields,store,events}=dom();store.set('virtuoso.lastPathway','chromatic_warmup');
  const saved=PATHWAYS.chromatic_warmup;delete PATHWAYS.chromatic_warmup;
  try {
    owner.mount('files');owner.mount('selection');owner.initial();assert.equal(owner.pendingInitial.id,'chromatic_warmup');
    assert.equal(store.get('virtuoso.lastPathway'),'chromatic_warmup');
    for(const mode of ['custom','session','jam','guided']) {
      if(mode==='guided')store.set('virtuoso.lastPathway','chromatic_warmup');
      owner.selectMode(mode);assert.equal(store.get('virtuoso.lastMode'),mode);
      assert.equal(events.some(row=>row[0]==='generate'&&row[1]),false);
      assert.equal(nodes.get('virtuoso-mode-'+mode).handlers.get('click').size,1);
    }
    assert.equal(owner.pendingInitial.id,'chromatic_warmup');
    owner.controlChanged('bpm');assert.equal(owner.pendingInitial,null);assert.equal(owner.pathwayId,'custom');
    fields.stringSetup.value='bass_4_standard';assert.equal(owner.isHidden('bend_drill'),true);assert.equal(owner.isHidden('rhy_swing'),false);
    fields.instrument.value='bass';owner.initial();assert.equal(owner.pathwayId,'bass_rh_pulse');
    owner.leave();await owner.enter();await flush();assert.equal(nodes.get('virtuoso-mode-custom').handlers.get('click').size,1);
  } finally {owner.leave();if(saved)PATHWAYS.chromatic_warmup=saved;else delete PATHWAYS.chromatic_warmup;}
});

test('pending file identity and current DOM guard reject an A→B→A response after departure without clobbering the new visit',async()=>{
  const {owner,nodes}=dom();const requests=[];
  globalThis.fetch=async url=>{
    if(String(url).endsWith('index.json'))return new Response(index);
    if(String(url).endsWith('chromatic-warmup-ladder.md'))return new Response(ladder);
    const gate=deferred();requests.push(gate);await gate.promise;return new Response(md);
  };
  owner.mount('files');await owner.initialize();
  nodes.get('virtuoso-file-select').value='chromatic-warmup';const old=owner.loadFile();await flush();assert.equal(requests.length,1);
  owner.leave();await owner.enter();nodes.get('virtuoso-file-select').value='chromatic-warmup';
  const current=owner.loadFile();await flush();assert.equal(requests.length,2);
  requests[0].resolve();await old;assert.equal(owner.file,null);
  requests[1].resolve();await current;assert.equal(owner.file.id,'chromatic-warmup');
  const file=owner.file;await owner.chooseVariant(file.variants[1].id);assert.equal(owner.file,file);
  owner.leave();await owner.enter();await flush();assert.equal(owner.file,null);
  nodes.get('virtuoso-file-select').value='chromatic-warmup';await owner.loadFile();assert.ok(owner.file);
  // Request caching does not revive an abandoned event listener or DOM node.
  const stale=[...nodes.get('virtuoso-file-load').handlers.get('click')][0];
  nodes.set('virtuoso-file-load',{addEventListener(){},removeEventListener(){}});
  await stale({target:nodes.get('virtuoso-file-load')});assert.ok(owner.file);
  owner.leave();
});

test('direct shape and scale controls preserve current choices, legacy hidden values, negative step wrap and live applicability',async()=>{
  const {owner,nodes,fields,events}=dom();
  const system=nodes.get('virtuoso-fretboard-system'),shape=nodes.get('virtuoso-shape'),hidden=nodes.get('virtuoso-caged-shape-value');
  system.value='caged';shape.value='E';owner.syncShapes();assert.equal(shape.value,'E');assert.equal(hidden.value,'E');
  assert.ok(shape.options.some(option=>option.textContent.includes('position')));
  system.value='3nps';owner.syncShapes();assert.equal(hidden.value,'E','non-CAGED leaves chord hidden field alone');
  owner.selectShape('pent_foundation',{fretboardSystem:'caged',scale:'major'}, {fretMin:7});assert.ok(shape.value);
  fields.scale.value='not-in-lesson';owner.syncScaleDropdown('pent_foundation');assert.equal(fields.scale.value,PATHWAYS.pent_foundation.scales[0]);
  owner.syncScaleDropdown(null);assert.equal(nodes.get('virtuoso-pathway-scale-wrap').style.display,'none');
  owner.mount('position');owner.applyPathway('chromatic_warmup');
  const selected=owner.pathwayId;events.length=0;
  await nodes.get('virtuoso-shape-prev').dispatchEvent({type:'click'});
  assert.equal(owner.pathwayId,selected);assert.equal(nodes.get('virtuoso-shape-prev').handlers.get('click').size,1);
  owner.leave();assert.equal(nodes.get('virtuoso-shape-prev').handlers.get('click').size,0);
});

test('pure model and controller import/construction are inert; absent controls default without reading runtime IO',()=>{
  execFileSync(process.execPath,['--input-type=module','-e',`for(const name of ['window','document','localStorage','fetch'])Object.defineProperty(globalThis,name,{get(){throw Error(name)}});const {createPracticeSelection}=await import(${JSON.stringify(new URL('../src/shell/practice-selection.js',import.meta.url).href)});createPracticeSelection({});const {initialPracticeSelection}=await import(${JSON.stringify(new URL('../src/core/practice-selection.js',import.meta.url).href)});initialPracticeSelection();`]);
  globalThis.document={getElementById:()=>null};const owner=createPracticeSelection({});
  owner.initial();owner.syncFileControls();owner.syncShapes();owner.syncScaleDropdown(null);
});

test('property: valid real pathway sequences preserve metadata and last explicit selection wins without tier leakage',()=>{
  const ids=Object.keys(PATHWAYS),seed=Number(process.env.PROPERTY_SEED||20261021);
  fc.assert(fc.property(fc.array(fc.record({id:fc.constantFrom(...ids),variation:fc.integer({min:-100,max:100}),tier:fc.integer({min:0,max:3})}),{minLength:1,maxLength:40}),steps=>{
    let state=initialPracticeSelection();
    for(const step of steps) {
      const pathway=PATHWAYS[step.id],before=JSON.stringify(pathway),previous=state;
      state=selectPracticePathway(state,step.id,pathway,'core',step.variation);
      assert.equal(state.pathwayId,step.id);assert.equal(state.tierIndex,step.id===previous.pathwayId?previous.tierIndex:0);
      assert.ok(state.variationIndex>=0&&state.variationIndex<(pathway.vary?.length||1));
      state={...state,tierIndex:step.tier};assert.equal(JSON.stringify(pathway),before);
    }
    assert.equal(state.pathwayId,steps.at(-1).id);
  }),{seed,numRuns:100});
});
