import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createPracticeSelection} from '../src/shell/practice-selection.js';
import {initialPracticeSelection,selectPracticePathway,practiceTierFields,PRACTICE_APPLICABILITY,offerable} from '../src/core/practice-selection.js';
import {PATHWAYS} from '../src/content/pathways.js';
import {STRING_SETUPS} from '../src/core/instrument-tuning.js';
import {parsePracticeMarkdown,practicePathwayEntry} from '../src/core/practice-files.js';
import {deriveLessonFields} from '../src/core/lesson-adaptation.js';

const ladder=readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup-ladder.md',import.meta.url),'utf8');
const index=JSON.stringify({practices:[{id:'chromatic-warmup',title:'Chromatic warm-up',path:'guitar/beginner/chromatic-warmup.md',use:'custom'},{id:'chromatic_warmup',title:'Chromatic Warmup',path:'guitar/beginner/chromatic-warmup-ladder.md',use:'pathway'}]});
const md=readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup.md',import.meta.url),'utf8');
const flush=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};

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
  for(const id of ['controls','root','status','pathway','file-select','file-load','file-unload','file-next','file-variant','advanced-toggle','shape','fretboard-system','caged-shape-value','anchor-station','pathway-scale','pathway-scale-wrap','shape-prev','shape-next','mode-select','file-practices',...['guided','custom','session','jam'].map(x=>'mode-'+x)])nodes.set('virtuoso_lab-'+id,new Element());
  const fields=Object.fromEntries(['key','scale','bpm','meter','subdivision','bars','direction','sequence','shape','fretboardSystem','fretMin','fretMax','keyCycle','swing','stringSetup','instrument'].map(name=>[name,new Element()]));
  fields.shape=nodes.get('virtuoso_lab-shape');fields.fretboardSystem=nodes.get('virtuoso_lab-fretboard-system');
  for(const [name,field] of Object.entries(fields)){field.name=name;field.type='text';}
  fields.stringSetup.value='guitar_6_standard';fields.instrument.value='guitar';fields.key.value='C';fields.scale.value='major';
  const elements=Object.values(fields);elements.namedItem=name=>fields[name]||null;
  nodes.get('virtuoso_lab-controls').elements=elements;
  nodes.get('virtuoso_lab-controls').querySelector=selector=>fields[selector.match(/name="([^"]+)"/)?.[1]]||null;
  nodes.get('virtuoso_lab-file-select').value='chromatic-warmup';
  nodes.get('virtuoso_lab-fretboard-system').value='position';
  nodes.get('virtuoso_lab-pathway').children=['custom','chromatic_warmup','pent_foundation','bass_rh_pulse'].map(value=>new Element(value));
  const store=new Map();
  globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
  globalThis.document={getElementById:id=>nodes.get(id)||null,querySelector:selector=>fields[selector.match(/name="([^"]+)"/)?.[1]]||null,querySelectorAll:()=>[],createElement:()=>new Element()};
  globalThis.window={location:{href:'https://host.test/'}};
  let bundle=true,owner;
  const events=[];
  const dependencies={getContext:()=>({family:fields.instrument.value,hasBundle:bundle}),bands:[{id:'core',pathways:['pent_foundation','chromatic_warmup']},{id:'concept_rhythm',pathways:['rhy_swing']}],
    applySelectedConfig(id,config,variation){events.push(['apply',id,config,variation]);if(config)owner.beforeConfig();},
    changeModeView(mode,pathwayMode){events.push(['mode',mode,pathwayMode]);if(pathwayMode!=null)nodes.get('virtuoso_lab-root').classList.toggle('virtuoso_lab-pathway-mode',pathwayMode);},
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
    PATHWAYS.chromatic_warmup.instAgnostic=true;
    for(const setup of Object.keys(STRING_SETUPS)) {
      fields.stringSetup.value=setup;
      for(let variation=0;variation<6;variation++)for(let tier=0;tier<4;tier++) {
        owner.applyPathway('chromatic_warmup',variation);owner.setTier(tier);
        const preferences={stringSetup:setup,instrument:STRING_SETUPS[setup].instrument,stringCount:STRING_SETUPS[setup].openMidis.length,bpm:83,renderer:'notation_2d',customOpenMidis:[38,45,50,55,59,64]};
        globalThis.document.getElementById('virtuoso_lab-root').classList.toggle('virtuoso_lab-pathway-mode',true);
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
  assert.equal(nodes.get('virtuoso_lab-file-load').handlers.get('click').size,1);
  await nodes.get('virtuoso_lab-file-load').dispatchEvent({type:'click'});assert.ok(owner.file);
  const variants=owner.file.variants;
  await owner.chooseVariant(variants.at(-1).id);events.length=0;
  await nodes.get('virtuoso_lab-file-next').dispatchEvent({type:'click'});
  assert.deepEqual(events[0],['stop','loop']);assert.equal(owner.variantId,variants[0].id);
  events.length=0;await owner.chooseVariant('missing');assert.deepEqual(events,[]);
  nodes.get('virtuoso_lab-file-select').value='missing';await owner.loadFile();assert.equal(owner.file,null);assert.match(nodes.get('virtuoso_lab-status').textContent,/Unknown practice id/);
  const stale=[...nodes.get('virtuoso_lab-file-load').handlers.get('click')][0];
  owner.leave();events.length=0;await stale({target:nodes.get('virtuoso_lab-file-load')});assert.deepEqual(events,[]);
  await owner.enter();await flush();nodes.get('virtuoso_lab-file-select').value='chromatic-warmup';
  nodes.get('virtuoso_lab-file-select').value='chromatic-warmup';
  await owner.loadFile();
  assert.ok(owner.file);
  const retainedFile=owner.file;
  owner.leave();await owner.enter();await stale({target:nodes.get('virtuoso_lab-file-load')});assert.equal(owner.file,retainedFile);
});

test('Custom file selection loads from active mode despite missing or stale persisted mode',async()=>{
  for (const persistedMode of [null,'guided']) {
    const {owner,nodes,store,events}=dom();
    owner.selectMode('custom');
    if (persistedMode == null) store.delete('virtuoso_lab.lastMode');
    else store.set('virtuoso_lab.lastMode',persistedMode);
    owner.mount('files');
    nodes.get('virtuoso_lab-file-select').value='chromatic-warmup';
    await nodes.get('virtuoso_lab-file-select').dispatchEvent({type:'change'});
    assert.equal(owner.activeTab,'custom');
    assert.equal(owner.file.id,'chromatic-warmup');
    assert.equal(owner.variantId,owner.file.variants[0].id);
    assert.equal(nodes.get('virtuoso_lab-file-practices').open,true);
    assert.deepEqual(events.filter(row=>row[0]==='file').at(-1),['file','chromatic-warmup',owner.file.variants[0].id]);
    assert.equal(store.get('virtuoso_lab.lastMode'),'custom');
    assert.equal(nodes.get('virtuoso_lab-root').classList.contains('virtuoso_lab-pathway-mode'),false);
    owner.leave();
  }
});

test('returning to Custom synchronizes its view and saved preset favorites remain available',async()=>{
  const {owner,nodes}=dom();
  owner.selectMode('guided');
  owner.selectMode('custom');
  assert.equal(nodes.get('virtuoso_lab-root').classList.contains('virtuoso_lab-pathway-mode'),false);
  const html=readFileSync(new URL('../screen.html',import.meta.url),'utf8');
  assert.match(html,/id="virtuoso_lab-preset-picker-wrap"[^>]*>Load preset/);
  assert.match(html,/id="virtuoso_lab-preset-picker"/);
  assert.match(html,/optgroup label="Favorites"/);
  owner.leave();
});

test('Custom selector immediately applies authored and generated Markdown content as playable config',async()=>{
  const {owner,nodes,store,fields,events}=dom();
  store.set('virtuoso_lab.lastMode','custom');
  const catalog={practices:[
    {id:'chromatic-warmup',title:'Chromatic warm-up',path:'guitar/beginner/chromatic-warmup.md',use:'custom'},
    {id:'file-pent_foundation',title:'Pentatonic Foundation',path:'guitar/pathways/file-pent_foundation.md',use:'pathway'},
  ]};
  globalThis.fetch=async url=>{
    if(String(url).endsWith('index.json'))return new Response(JSON.stringify(catalog));
    if(String(url).endsWith('file-pent_foundation.md'))return new Response(readFileSync(new URL('../assets/practices/guitar/pathways/file-pent_foundation.md',import.meta.url),'utf8'));
    return new Response(md);
  };
  owner.mount('files');
  nodes.get('virtuoso_lab-file-select').value='file-pent_foundation';
  await nodes.get('virtuoso_lab-file-select').dispatchEvent({type:'change'});
  assert.equal(owner.file.id,'file-pent_foundation');
  assert.equal(store.get('virtuoso_lab.lastMode'),'custom');
  const generated=owner.selectedConfig({key:'C',scale:'major',bpm:91,meter:'4/4',instrument:'guitar',stringSetup:'guitar_6_standard',stringCount:6,renderer:'highway_3d'});
  assert.equal(generated.practiceType,'scale');assert.equal(generated.key,'A');assert.equal(generated.scale,'minor_pentatonic');
  assert.equal(generated.practiceFilePath,'guitar/pathways/file-pent_foundation.md');
  assert.equal(generated.practiceFile,undefined);
  const choices=owner.file.pathway.vary;
  const alt=choices[1];await owner.chooseVariant('variation-1');
  const selected=owner.selectedConfig({key:'C',scale:'major',bpm:92,meter:'4/4',instrument:'guitar',stringSetup:'guitar_6_standard',stringCount:6,renderer:'highway_3d'});
  assert.equal(selected.key,alt.key);
  assert.equal(selected.practiceFilePath,'guitar/pathways/file-pent_foundation.md');
  assert.ok(events.some(row=>row[0]==='mode'&&row[1]==='custom'&&row[2]===false));
  nodes.get('virtuoso_lab-file-select').value='chromatic-warmup';
  await nodes.get('virtuoso_lab-file-select').dispatchEvent({type:'change'});
  assert.equal(owner.file.id,'chromatic-warmup');
  const authored=owner.selectedConfig({key:'C',scale:'major',bpm:93,meter:'4/4',instrument:'guitar',stringSetup:'guitar_6_standard',stringCount:6,renderer:'highway_3d'});
  assert.equal(authored.practiceType,'file');
  assert.equal(authored.practiceFile.id,'chromatic-warmup');
  assert.equal(authored.practiceFilePath,'guitar/beginner/chromatic-warmup.md');
  assert.ok(authored.practiceVariantId);
  owner.leave();
  fields.instrument.value='guitar';
});

test('mode switches preserve saved Warmup intent during pending catalog, canceled page lifecycle keeps active listeners and eligibility is declaration-aware',async()=>{
  const {owner,nodes,fields,store,events}=dom();store.set('virtuoso_lab.lastPathway','chromatic_warmup');
  const saved=PATHWAYS.chromatic_warmup;delete PATHWAYS.chromatic_warmup;
  try {
    owner.mount('files');owner.mount('selection');owner.initial();assert.equal(owner.pendingInitial.id,'chromatic_warmup');
    assert.equal(store.get('virtuoso_lab.lastPathway'),'chromatic_warmup');
    for(const mode of ['custom','session','jam','guided']) {
      if(mode==='guided')store.set('virtuoso_lab.lastPathway','chromatic_warmup');
      owner.selectMode(mode);assert.equal(store.get('virtuoso_lab.lastMode'),mode);
      assert.equal(events.some(row=>row[0]==='generate'&&row[1]),false);
      assert.equal(nodes.get('virtuoso_lab-mode-'+mode).handlers.get('click').size,1);
    }
    assert.equal(owner.pendingInitial.id,'chromatic_warmup');
    owner.controlChanged('bpm');assert.equal(owner.pendingInitial,null);assert.equal(owner.pathwayId,'custom');
    PATHWAYS['file-bend_drill']={base:{practiceType:'bending',stringSetup:'guitar_6_standard'}};
    fields.stringSetup.value='bass_4_standard';assert.equal(owner.isHidden('file-bend_drill'),true);assert.equal(owner.isHidden('rhy_swing'),false);
    fields.instrument.value='bass';owner.initial();assert.equal(owner.pathwayId,'bass_rh_pulse');
    owner.leave();await owner.enter();await flush();assert.equal(nodes.get('virtuoso_lab-mode-custom').handlers.get('click').size,1);
  } finally {owner.leave();delete PATHWAYS['file-bend_drill'];if(saved)PATHWAYS.chromatic_warmup=saved;else delete PATHWAYS.chromatic_warmup;}
});

test('file-prefixed saved pathway waits for catalog hydration and preserves its identity',async()=>{
  const {owner,nodes,store}=dom();store.set('virtuoso_lab.lastPathway','file-pent_foundation');
  const savedPathways={};for(const item of JSON.parse(readFileSync(new URL('../assets/practices/index.json',import.meta.url),'utf8')).practices.filter(item=>item.use==='pathway')){savedPathways[item.id]=PATHWAYS[item.id];delete PATHWAYS[item.id];}
  nodes.get('virtuoso_lab-pathway').children.push({value:'file-pent_foundation'});
  const catalog=JSON.parse(readFileSync(new URL('../assets/practices/index.json',import.meta.url),'utf8'));
  globalThis.fetch=async url=>{
    if(String(url).endsWith('index.json'))return new Response(JSON.stringify(catalog));
    const item=catalog.practices.find(entry=>String(url).endsWith(entry.path));
    return new Response(readFileSync(new URL('../assets/practices/'+item.path,import.meta.url),'utf8'));
  };
  owner.mount('files');owner.mount('selection');owner.initial();
  assert.equal(owner.pendingInitial.id,'file-pent_foundation');
  await owner.initialize();
  assert.equal(owner.catalogState.error,null);
  assert.equal(PATHWAYS['file-pent_foundation'].label,'Pentatonic Foundation');
  assert.equal(owner.pendingInitial,null);
  owner.leave();for(const [id,pathway] of Object.entries(savedPathways))if(pathway)PATHWAYS[id]=pathway;
});

test('Ladder → Custom → Ladder restores loaded Markdown lessons and rejects obsolete fallback identities',async()=>{
  const {owner,nodes,store}=dom();
  const catalog=JSON.parse(readFileSync(new URL('../assets/practices/index.json',import.meta.url),'utf8'));
  const savedPathways=new Map(catalog.practices.filter(item=>item.use==='pathway').map(item=>[item.id,PATHWAYS[item.id]]));
  for(const id of savedPathways.keys())delete PATHWAYS[id];
  // Match the real picker: migrated lessons use their catalog IDs, not legacy IDs.
  nodes.get('virtuoso_lab-pathway').children=nodes.get('virtuoso_lab-pathway').children.filter(option=>option.value!=='pent_foundation');
  for(const id of savedPathways.keys())if(!nodes.get('virtuoso_lab-pathway').options.some(option=>option.value===id))nodes.get('virtuoso_lab-pathway').appendChild({value:id});
  globalThis.fetch=async url=>{
    if(String(url).endsWith('index.json'))return new Response(JSON.stringify(catalog));
    const item=catalog.practices.find(entry=>String(url).endsWith(entry.path));
    return new Response(readFileSync(new URL('../assets/practices/'+item.path,import.meta.url),'utf8'));
  };
  try {
    owner.mount('files');owner.mount('selection');owner.initial();await owner.initialize();
    assert.equal(owner.catalogState.error,null);
    for(const id of ['chromatic_warmup','file-pent_foundation']) {
      nodes.get('virtuoso_lab-pathway').value=id;
      await nodes.get('virtuoso_lab-pathway').dispatchEvent({type:'change'});
      assert.ok(PATHWAYS[id].base);assert.ok(PATHWAYS[id].vary.length);
      await nodes.get('virtuoso_lab-mode-custom').dispatchEvent({type:'click'});
      assert.equal(owner.pathwayId,'custom');assert.equal(owner.file,null);
      assert.equal(store.get('virtuoso_lab.lastPathway'),id);
      await nodes.get('virtuoso_lab-mode-guided').dispatchEvent({type:'click'});
      assert.equal(owner.pathwayId,id);assert.equal(nodes.get('virtuoso_lab-pathway').value,id);
    }
    for(const saved of ['custom','pent_foundation']) {
      owner.selectMode('custom');store.set('virtuoso_lab.lastPathway',saved);
      owner.selectMode('guided');
      // In-open navigation now prefers the retained lesson over storage.
      assert.equal(owner.pathwayId,'file-pent_foundation');
      assert.ok(nodes.get('virtuoso_lab-pathway').options.some(option=>option.value===owner.pathwayId));
    }
  } finally {
    owner.leave();
    for(const [id,pathway] of savedPathways)if(pathway)PATHWAYS[id]=pathway;else delete PATHWAYS[id];
  }
});

test('all tab transitions invalidate runtime; Custom file variant survives Workout and Jam without building their playback',async()=>{
  const {owner,events}=dom();
  owner.selectMode('custom');await owner.loadFile();
  const file=owner.file,variant=file.variants.at(-1).id;
  await owner.chooseVariant(variant);
  for(const mode of ['session','jam','custom','guided','session','custom']) {
    events.length=0;owner.selectMode(mode);
    assert.deepEqual(events[0],['stop','loop']);
    if(mode==='session'||mode==='jam')assert.equal(events.some(event=>event[0]==='generate'),false);
    if(mode==='custom'){assert.equal(owner.file,file);assert.equal(owner.variantId,variant);}
  }
});

test('Custom round trips rebuild dependent shape options and preserve raw tempo across systems and scales',()=>{
  const {owner,fields,nodes}=dom();owner.selectMode('custom');
  for(const [system,scale,key] of [['caged','major','G'],['3nps','natural_minor','A'],['position','major_pentatonic','C']]){
    fields.fretboardSystem.value=system;fields.scale.value=scale;fields.key.value=key;
    owner.syncShapes();const shape=fields.shape.options.at(-1)?.value || '';
    fields.shape.value=shape;fields.bpm.value='137';
    owner.selectMode('jam');fields.fretboardSystem.value='open';fields.scale.value='major';fields.key.value='Db';fields.bpm.value='90';owner.syncShapes();
    owner.selectMode('custom');
    assert.equal(fields.fretboardSystem.value,system);assert.equal(fields.scale.value,scale);assert.equal(fields.key.value,key);assert.equal(fields.bpm.value,'137');
    assert.equal(fields.shape.value,shape);
    if(shape)assert.ok(fields.shape.options.some(option=>option.value===shape));
    if(system==='caged')assert.equal(nodes.get('virtuoso_lab-caged-shape-value').value,shape);
  }
});

test('host leave/enter preserves each mode owner and editors without hidden preview or a no-op Ladder switch',async()=>{
  const {owner,events,fields}=dom();
  for(const mode of ['custom','session','jam','guided']){
    owner.selectMode(mode);fields.bpm.value='119';
    owner.leave();events.length=0;await owner.enter();
    assert.equal(owner.activeTab,mode);assert.equal(fields.bpm.value,'119');
    assert.ok(events.some(event=>event[0]==='mode'&&event[1]===mode));
    if(mode==='session'||mode==='jam')assert.equal(events.some(event=>event[0]==='generate'),false);
    if(mode!=='guided'){events.length=0;owner.selectMode('guided');assert.equal(owner.activeTab,'guided');assert.ok(events.some(event=>event[0]==='stop'&&event[1]==='loop'));}
  }
});

test('direct Custom to non-file Ladder picker builds a stopped preview after activation clears old bundle',async()=>{
  const {owner,nodes,events}=dom();owner.mount('selection');owner.selectMode('custom');
  const saved=PATHWAYS.preview;
  try{
    PATHWAYS.preview={base:{practiceType:'scale',stringSetup:'guitar_6_standard'},vary:[{}]};
    nodes.get('virtuoso_lab-pathway').value='preview';events.length=0;
    await nodes.get('virtuoso_lab-pathway').dispatchEvent({type:'change'});
    assert.equal(owner.activeTab,'guided');assert.equal(owner.pathwayId,'preview');
    const stop=events.findIndex(event=>event[0]==='stop'&&event[1]==='loop');const generation=events.findIndex(event=>event[0]==='generate');
    assert.ok(stop>=0&&generation>stop);
  }finally{if(saved)PATHWAYS.preview=saved;else delete PATHWAYS.preview;}
});

test('direct mode entry has one owner; no compatible Ladder gates generation and Setup recovery generates stopped fallback',()=>{
  const {owner,fields,events}=dom();owner.applyPathway('custom');assert.equal(owner.activeTab,'custom');
  const retained=Object.entries(PATHWAYS);for(const id of Object.keys(PATHWAYS))delete PATHWAYS[id];
  try{
    owner.selectMode('guided');assert.equal(owner.activeTab,'guided');assert.equal(owner.canGenerate(),false);
    assert.throws(()=>owner.selectedConfig({practiceType:'scale'}),/No compatible/);
    PATHWAYS.recovery={base:{practiceType:'scale',stringSetup:'bass_4_standard'},vary:[{}]};fields.instrument.value='bass';fields.stringSetup.value='bass_4_standard';
    events.length=0;assert.equal(owner.dropIfUnplayable(),true);assert.equal(owner.canGenerate(),true);assert.equal(owner.pathwayId,'recovery');
    assert.ok(events.some(event=>event[0]==='generate'));assert.ok(events.some(event=>event[0]==='stop'&&event[1]==='loop'));
  }finally{delete PATHWAYS.recovery;for(const [id,pw]of retained)PATHWAYS[id]=pw;}
});

test('Ladder restore rederives metadata against live tuning without replacing manual tempo',()=>{
  const {owner,fields,dependencies}=dom();const saved=PATHWAYS.restore;
  PATHWAYS.restore={base:{practiceType:'scale',stringSetup:'guitar_6_standard',key:'E'},vary:[{}],tempoTiers:[60,90]};
  let tuning='';dependencies.rederiveSelection=()=>{const derived=deriveLessonFields(PATHWAYS.restore.base,fields.stringSetup.value,tuning);fields.key.value=derived.key;};
  try{
    owner.applyPathway('restore');owner.setTier(1);fields.bpm.value='113';owner.selectMode('jam');
    tuning='38,43,48,53,57,62';owner.selectMode('guided');
    assert.equal(fields.key.value,'D');assert.equal(fields.bpm.value,'113');assert.equal(owner.tierIndex,1);
  }finally{if(saved)PATHWAYS.restore=saved;else delete PATHWAYS.restore;}
});

test('pending file identity and current DOM guard reject an A→B→A response after departure without clobbering the new visit',async()=>{
  const {owner,nodes}=dom();const requests=[];
  globalThis.fetch=async url=>{
    if(String(url).endsWith('index.json'))return new Response(index);
    if(String(url).endsWith('chromatic-warmup-ladder.md'))return new Response(ladder);
    const gate=deferred();requests.push(gate);await gate.promise;return new Response(md);
  };
  owner.mount('files');await owner.initialize();
  nodes.get('virtuoso_lab-file-select').value='chromatic-warmup';const old=owner.loadFile();await flush();assert.equal(requests.length,1);
  owner.leave();await owner.enter();nodes.get('virtuoso_lab-file-select').value='chromatic-warmup';
  const current=owner.loadFile();await flush();assert.equal(requests.length,2);
  requests[0].resolve();await old;assert.equal(owner.file,null);
  requests[1].resolve();await current;assert.equal(owner.file.id,'chromatic-warmup');
  const file=owner.file;await owner.chooseVariant(file.variants[1].id);assert.equal(owner.file,file);
  owner.leave();await owner.enter();await flush();assert.equal(owner.file,file);assert.equal(owner.variantId,file.variants[1].id);
  nodes.get('virtuoso_lab-file-select').value='chromatic-warmup';await owner.loadFile();assert.ok(owner.file);
  // Request caching does not revive an abandoned event listener or DOM node.
  const stale=[...nodes.get('virtuoso_lab-file-load').handlers.get('click')][0];
  nodes.set('virtuoso_lab-file-load',{addEventListener(){},removeEventListener(){}});
  await stale({target:nodes.get('virtuoso_lab-file-load')});assert.ok(owner.file);
  owner.leave();
});

test('direct shape and scale controls preserve current choices, legacy hidden values, negative step wrap and live applicability',async()=>{
  const {owner,nodes,fields,events}=dom();
  const system=nodes.get('virtuoso_lab-fretboard-system'),shape=nodes.get('virtuoso_lab-shape'),hidden=nodes.get('virtuoso_lab-caged-shape-value');
  system.value='caged';shape.value='E';owner.syncShapes();assert.equal(shape.value,'E');assert.equal(hidden.value,'E');
  assert.ok(shape.options.some(option=>option.textContent.includes('position')));
  system.value='3nps';owner.syncShapes();assert.equal(hidden.value,'E','non-CAGED leaves chord hidden field alone');
  const migrated=PATHWAYS['file-pent_foundation']={label:'Pentatonic Foundation',scales:['minor_pentatonic','blues','major_pentatonic'],base:{practiceType:'scale',stringSetup:'guitar_6_standard',meter:'4/4'},vary:[{}]};
  owner.selectShape('file-pent_foundation',{fretboardSystem:'caged',scale:'major'}, {fretMin:7});assert.ok(shape.value);
  fields.scale.value='not-in-lesson';owner.syncScaleDropdown('file-pent_foundation');assert.equal(fields.scale.value,migrated.scales[0]);
  owner.syncScaleDropdown(null);assert.equal(nodes.get('virtuoso_lab-pathway-scale-wrap').style.display,'none');
  owner.mount('position');owner.applyPathway('chromatic_warmup');
  const selected=owner.pathwayId;events.length=0;
  await nodes.get('virtuoso_lab-shape-prev').dispatchEvent({type:'click'});
  assert.equal(owner.pathwayId,selected);assert.equal(nodes.get('virtuoso_lab-shape-prev').handlers.get('click').size,1);
  owner.leave();assert.equal(nodes.get('virtuoso_lab-shape-prev').handlers.get('click').size,0);
});
