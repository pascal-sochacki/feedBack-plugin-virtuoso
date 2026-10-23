import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync, readdirSync} from 'node:fs';
import {join, relative} from 'node:path';
import {parsePracticeMarkdown, practiceWorkoutSegment, validatePracticeIndex, buildPracticeFileExercise} from '../src/core/practice-files.js';
import {PRACTICE_BLOCKS} from '../src/content/practice-blocks.js';
import {SEGMENT_TEMPLATES, SEGMENT_BANDS} from '../src/content/segments.js';
import {materializeSegment, refreshWorkout} from '../src/core/segments.js';
import {buildSessionChart} from '../src/core/session-chart.js';
import {buildSegmentConfig} from '../src/core/session-config.js';
import {materializeWorkoutConfig} from '../src/core/workout-config.js';
import {createWorkoutEditor} from '../src/shell/workout-editor.js';

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
