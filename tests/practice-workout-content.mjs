import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync, readdirSync} from 'node:fs';
import {join, relative} from 'node:path';
import {parsePracticeMarkdown, practiceWorkoutSegment, validatePracticeIndex, buildPracticeFileExercise} from '../src/core/practice-files.js';
import {PRACTICE_BLOCKS} from '../src/content/practice-blocks.js';
import {SEGMENT_TEMPLATES} from '../src/content/segments.js';
import {materializeSegment, refreshWorkout} from '../src/core/segments.js';
import {buildSessionChart} from '../src/core/session-chart.js';
import {buildSegmentConfig} from '../src/core/session-config.js';
import {materializeWorkoutConfig} from '../src/core/workout-config.js';
import {createWorkoutEditor} from '../src/shell/workout-editor.js';
import {STYLE_PALETTES} from '../src/core/style-palettes.js';
import {rollSegment} from '../src/core/segments.js';
import {assertSegmentTemplatesValid} from './support/segment-integrity.mjs';

const SEGMENT_BANDS = ['beginner','intermediate','advanced'];

const root = new URL('../assets/practices/', import.meta.url);
const rootPath = root.pathname;
function files(dir) {
  return readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?files(join(dir,item.name)):item.name.endsWith('.md')?[join(dir,item.name)]:[]);
}

test('generated practice index covers every Markdown asset exactly once and rejects traversal',()=>{
  const index=validatePracticeIndex(JSON.parse(readFileSync(new URL('../assets/practices/index.json',import.meta.url),'utf8')));
  const paths=index.map(entry=>entry.path).sort();
  assert.deepEqual(paths,files(rootPath).map(file=>relative(rootPath,file)).sort());
  assert.equal(new Set(index.map(entry=>entry.id)).size,index.length);
  assert.throws(()=>validatePracticeIndex({practices:[{id:'bad',title:'Bad',path:'../secret.md',use:'custom'}]}),/Unknown practice index entry/);
  for(const entry of index){
    const practice=parsePracticeMarkdown(readFileSync(new URL(`../assets/practices/${entry.path}`,import.meta.url),'utf8'));
    assert.equal(practice.id,entry.id);
    if(entry.use==='block') assert.ok(practice.block);
  }
});

test('Markdown catalog drives unique, filterable workout cards with legal metadata',()=>{
  const catalog=Object.values(PRACTICE_BLOCKS);
  assert.equal(Object.keys(PRACTICE_BLOCKS).length,Object.keys(SEGMENT_TEMPLATES).length);
  const labels=new Map();
  for(const item of catalog){const label=item.label.toLowerCase();labels.set(label,(labels.get(label)||0)+1);}
  assert.ok([...labels.values()].every(count=>count<=2));
  for(const item of catalog){
    assert.ok(SEGMENT_BANDS.includes(item.band));
    assert.ok(['guitar','bass'].includes(item.metadata.instrument));
    assert.ok(item.metadata.applicability.includes(item.metadata.instrument));
    assert.ok(item.practicePath.endsWith('.md'));
  }
});

test('workout catalog invariants hold for every template and every materialized variation',()=>{
  assertSegmentTemplatesValid(SEGMENT_TEMPLATES);
  for(const [id,template] of Object.entries(SEGMENT_TEMPLATES)){
    for(let index=0;index<(template.vary?.length||1);index++){
      const config=rollSegment(template,{variantIdx:index}).config;
      assert.equal(config.bpm,template.base.bpm,`${id} variation ${index} keeps BPM fixed`);
      assert.equal(config.bars,template.base.bars,`${id} variation ${index} keeps bars fixed`);
    }
  }
});

test('Markdown genre metadata does not implicitly lock a block to a style palette',()=>{
  const blues=SEGMENT_TEMPLATES['file-blues_mix'];
  assert.equal(PRACTICE_BLOCKS['file-blues_mix'].metadata.genre,'blues');
  assert.equal(blues.style,'blues');
  assert.notEqual(blues.paletteLock,true);
  assert.deepEqual(blues.vary.map((_,index)=>rollSegment(blues,{variantIdx:index}).config.scale),[
    'major_pentatonic','minor_pentatonic','blues','major_pentatonic','minor_pentatonic',
  ]);
  assert.equal(rollSegment(blues,{variantIdx:0}).config.progression,'12_bar_blues');

  const mismatches=[];
  for(const [id,template] of Object.entries(SEGMENT_TEMPLATES)){
    if(!template.style||template.paletteLock) continue;
    const palette=STYLE_PALETTES[template.style];
    for(let index=0;index<(template.vary?.length||1);index++){
      const config=rollSegment(template,{variantIdx:index}).config;
      if((config.progression&&!palette.progressions.includes(config.progression))||(config.scale&&!palette.leadScales.includes(config.scale))) mismatches.push(`${id}:${index}`);
    }
  }
  assert.deepEqual(mismatches,[
    'file-blues_mix:0','file-blues_mix:3','file-country_chicken_pickin:3',
    'file-country_train:0','file-country_train:2','file-country_train:4',
    'file-rock_classic_changes:2','file-rock_classic_changes:4',
    'file-rock_lead_vocab:0','file-rock_lead_vocab:1','file-rock_lead_vocab:3',
    'file-rock_pedal_riff:2','file-rock_pedal_riff:3',
    'file-rock_pentatonic:1','file-rock_pentatonic:3',
    'file-rock_power_backbeat:0','file-rock_power_backbeat:1','file-rock_power_backbeat:3','file-rock_power_backbeat:4',
    'g_metal_phrygian:0','g_metal_phrygian:1','g_metal_phrygian:2','g_metal_phrygian:3',
  ]);
});

test('explicit style palette locks and no-row scale gate are validated',()=>{
  const locked={...SEGMENT_TEMPLATES['file-blues_mix'],paletteLock:true,base:{...SEGMENT_TEMPLATES['file-blues_mix'].base,scale:'blues'},vary:[{scale:'blues',progression:'12_bar_blues'}]};
  assert.doesNotThrow(()=>assertSegmentTemplatesValid({locked}));
  const generated=rollSegment({...locked,base:{bpm:80,bars:4},vary:[{}]},{variantIdx:0}).config;
  assert.equal(generated.style,'blues');
  assert.equal(generated.chordDepth,'seventh');
  assert.equal(generated.chordOverride,'dom7');
  const unlocked=rollSegment({...locked,paletteLock:false,base:{bpm:80,bars:4},vary:[{}]},{variantIdx:0}).config;
  assert.equal(unlocked.style,undefined);
  assert.equal(unlocked.chordDepth,undefined);
  assert.throws(()=>assertSegmentTemplatesValid({locked:{...locked,vary:[{scale:'major_pentatonic'}]}}),/style-lock/);
  assert.throws(()=>assertSegmentTemplatesValid({bad:{...locked,style:'unknown'}}),/unknown style/);
  assert.throws(()=>assertSegmentTemplatesValid({bad:{...locked,vary:[{bpm:100}]}}),/length determinants/);
  assert.throws(()=>assertSegmentTemplatesValid({bad:{...locked,role:'not-a-role'}}),/unknown role/);
  assert.throws(()=>assertSegmentTemplatesValid({bad:{...locked,style:null,paletteLock:false,base:{...locked.base,scale:'whole_tone',progression:'12_bar_blues',chordOverride:'auto'},vary:[{}]}}),/no-row-scale gate/);
  assert.doesNotThrow(()=>assertSegmentTemplatesValid({safe:{...locked,style:null,paletteLock:false,base:{...locked.base,scale:'whole_tone',progression:'static_i',chordOverride:'auto'},vary:[{}]}}));
  assert.doesNotThrow(()=>assertSegmentTemplatesValid({safe:{...locked,style:null,paletteLock:false,base:{...locked.base,scale:'whole_tone',progression:'12_bar_blues',chordOverride:'dom7'},vary:[{}]}}));
});

test('authored and generated Markdown practices become playable Workout segments',()=>{
const index=JSON.parse(readFileSync(new URL('../assets/practices/index.json',import.meta.url),'utf8')).practices;
  const authored=index.find(item=>item.id==='chromatic_warmup');
  const generated=index.find(item=>item.id==='file-pent_foundation');
  const authoredPractice=parsePracticeMarkdown(readFileSync(new URL(`../assets/practices/${authored.path}`,import.meta.url),'utf8'));
  const generatedPractice=parsePracticeMarkdown(readFileSync(new URL(`../assets/practices/${generated.path}`,import.meta.url),'utf8'));
  assert.equal(practiceWorkoutSegment(authoredPractice).config.practiceVariantId,authoredPractice.pathway.variations[0].charts[0]);
  assert.equal(practiceWorkoutSegment(generatedPractice).config.practiceType,'scale');
  const generatedBlock=materializeSegment({practiceId:generatedPractice.id,variantIdx:0});
  assert.equal(generatedBlock.practiceId,generatedPractice.id);
  assert.ok(generatedBlock.config.scale);
  const authoredBlock=practiceWorkoutSegment(authoredPractice);
  const chart=buildPracticeFileExercise({...authoredBlock.config,instrument:'guitar',stringSetup:'guitar_6_standard',stringCount:6,customOpenMidis:[40,45,50,55,59,64],bpm:60});
  assert.ok(chart.chart.notes.length>0);
  const mixed=buildSessionChart({stringSetup:'guitar_6_standard',interBlockBreak:'off',segments:[
    {...authoredBlock,config:{...authoredBlock.config,bpm:60}},
    {...generatedBlock,bpm:90},
  ]});
  assert.ok(mixed.notes.length>0);
  assert.equal(mixed.segmentBounds.length,2);
});

test('per-block BPM override survives workout materialization without mutating the shared definition',()=>{
  const id=Object.keys(PRACTICE_BLOCKS).find(key=>PRACTICE_BLOCKS[key].metadata.instrument==='guitar'),template=PRACTICE_BLOCKS[id];
  const original=template.base.bpm;
  const draft={stringSetup:'guitar_6_standard',segments:[{practiceId:id,variantIdx:0,bpm:123}]};
  const session=materializeWorkoutConfig(draft,{audio:{notes:true,metronome:true,harmony:false},stringSetup:null,customOpenMidis:'',countInBars:1});
  assert.equal(session.segments[0].config.bpm,123);
  assert.equal(template.base.bpm,original);
});

test('Markdown practice block audio settings survive chart rematerialization without mutating canonical config',()=>{
  const id='g_app_chord_tone',practice=PRACTICE_BLOCKS[id];
  const originalBase=structuredClone(practice.base),originalVariation=structuredClone(practice.vary[0]);
  for(const notes of [false,true]){
    const audio={notes,metronome:!notes,harmony:notes};
    const session=materializeWorkoutConfig({stringSetup:'guitar_6_standard',interBlockBreak:'off',segments:[{practiceId:id,variantIdx:0}]},
      {audio,stringSetup:null,customOpenMidis:'',countInBars:1});

    assert.deepEqual(session.segments[0].config.audio,audio);
    assert.deepEqual(buildSegmentConfig(materializeSegment(session.segments[0],{stringSetup:session.stringSetup}),session).audio,audio);
    assert.ok(buildSessionChart(session).notes.length>0);
  }
  assert.deepEqual(practice.base,originalBase);
  assert.deepEqual(practice.vary[0],originalVariation);
});

test('practiceId refs refresh individually and all, and enforce session instrument applicability',()=>{
  const guitarId=Object.keys(PRACTICE_BLOCKS).find(key=>PRACTICE_BLOCKS[key].metadata.instrument==='guitar'&&!PRACTICE_BLOCKS[key].metadata.standardOnly);
  const bassId=Object.keys(PRACTICE_BLOCKS).find(key=>PRACTICE_BLOCKS[key].metadata.instrument==='bass');
  const draft={stringSetup:'guitar_6_standard',segments:[{id:'g',practiceId:guitarId,variantIdx:0},{id:'b',practiceId:bassId,variantIdx:0}]};
  const one=refreshWorkout(draft,{scope:0});
  assert.notEqual(one.segments[0].variantIdx,draft.segments[0].variantIdx);
  assert.equal(one.segments[1].variantIdx,draft.segments[1].variantIdx);
  const all=refreshWorkout(draft);
  assert.notEqual(all.segments[0].variantIdx,draft.segments[0].variantIdx);
  assert.notEqual(all.segments[1].variantIdx,draft.segments[1].variantIdx);
  assert.throws(()=>materializeWorkoutConfig(draft,{audio:{notes:true,metronome:true,harmony:false},stringSetup:null,customOpenMidis:'',countInBars:1}),/not applicable to guitar/);
  const bassDraft={stringSetup:'bass_4_standard',segments:[{practiceId:bassId,variantIdx:0}]};
  const bassSession=materializeWorkoutConfig(bassDraft,{audio:{notes:true,metronome:true,harmony:false},stringSetup:null,customOpenMidis:'',countInBars:1});
  assert.equal(bassSession.segments.length,1);
  assert.equal(bassSession.stringSetup,'bass_4_standard');
  assert.throws(()=>materializeWorkoutConfig({stringSetup:'guitar_6_standard',segments:[{templateId:'missing'}]},{audio:{notes:true,metronome:true,harmony:false},stringSetup:null,customOpenMidis:'',countInBars:1}),/unknown block/);
});

test('generated and authored file-backed practice refs preserve selected file/pathway identities when materialized',()=>{
  const catalog=JSON.parse(readFileSync(new URL('../assets/practices/index.json',import.meta.url),'utf8')).practices;
  const generatedEntry=catalog.find(item=>item.id==='file-pent_foundation');
  const generated=parsePracticeMarkdown(readFileSync(new URL(`../assets/practices/${generatedEntry.path}`,import.meta.url),'utf8'));
  const authoredEntry=catalog.find(item=>item.id==='chromatic_warmup');
  const authored=parsePracticeMarkdown(readFileSync(new URL(`../assets/practices/${authoredEntry.path}`,import.meta.url),'utf8'));
  const authoredSegment=practiceWorkoutSegment(authored,authored.pathway.variations[1].charts[0]);
  const workout=materializeWorkoutConfig({stringSetup:'guitar_6_standard',segments:[
    {practiceId:generated.id,variantIdx:2},
    {...authoredSegment,practicePath:authoredEntry.path,practiceFilePath:authoredEntry.path},
  ]},{audio:{notes:true,metronome:true,harmony:false},stringSetup:'guitar_6_standard',customOpenMidis:'',countInBars:1});
  assert.equal(workout.segments[0].config.key,'D');
  assert.equal(workout.segments[0].config.practiceFilePath,generatedEntry.path);
  assert.equal(workout.segments[1].practiceFile.id,authored.id);
  assert.equal(workout.segments[1].config.practicePathwayId,authored.id);
  assert.equal(workout.segments[1].config.practiceVariantId,authored.pathway.variations[1].charts[0]);
  assert.equal(workout.segments[1].practicePath,authoredEntry.path);
});

test('editor accepts file-backed blocks and retains independent BPM overrides',()=>{
  globalThis.document={getElementById:()=>null};
  const editor=createWorkoutEditor(async()=>{});
  editor.select('starter_arc');
  const id=Object.keys(PRACTICE_BLOCKS)[0];
  editor.addPractice(id);
  const block=editor.draft.segments.at(-1);
  assert.equal(block.practiceId,id);
  block.bpm=137;
  assert.equal(materializeSegment(block).config.bpm,137);
  delete globalThis.document;
});
