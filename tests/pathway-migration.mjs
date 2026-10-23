import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {PRACTICE_ASSET_PATHS,parsePracticeMarkdown,practicePathwayEntry,validatePracticeIndex,validatePractice,buildPracticeFileExercise} from '../src/core/practice-files.js';
import {catalogPathwaySelection,catalogPathwayConfig} from '../src/shell/practice-catalog.js';
import {practiceTierFields} from '../src/core/practice-selection.js';

const index=validatePracticeIndex(JSON.parse(readFileSync(new URL('../assets/practices/index.json',import.meta.url),'utf8')));
const entries=index.filter(item=>item.id.startsWith('file-'));
const original=JSON.parse(readFileSync(new URL('./fixtures/pathway-migration.json',import.meta.url),'utf8'));
const screen=readFileSync(new URL('../src/content/pathway-bands.js',import.meta.url),'utf8');

test('generated pathway catalog has explicit assets and retains every migrated authored value/order',()=>{
  assert.equal(entries.length,106);
  assert.equal(new Set(entries.map(item=>item.path)).size,entries.length);
  assert.deepEqual(index.map(item=>item.path).sort(),PRACTICE_ASSET_PATHS.slice().sort());
  for(const item of entries){
    const practice=parsePracticeMarkdown(readFileSync(new URL(`../assets/practices/${item.path}`,import.meta.url),'utf8'));
    assert.equal('formatVersion' in practice,false);
    assert.equal(practice.id,item.id);
    assert.equal('variants' in practice,false);
    const entry=practicePathwayEntry(practice), expected=original[item.id.slice(5)];
    assert.deepEqual({label:entry.label,goal:entry.goal,scales:entry.scales,base:entry.base,vary:entry.vary,tempoTiers:entry.tempoTiers,tempoTierSubdivs:entry.tempoTierSubdivs??null,tempoTierBars:entry.tempoTierBars??null,instAgnostic:entry.instAgnostic??false},Object.fromEntries([...Object.entries(expected).filter(([key])=>key!=='band'),['instAgnostic',expected.instAgnostic??false]]));
    const bandLine=screen.split('\n').find(line=>line.includes(`'${item.id}'`) && line.includes('pathways:'));
    assert.ok(bandLine?.includes(`id:'${expected.band}'`),`${item.id} band placement`);
  }
});

test('generated pathway selection merges base, variation, and density in runtime order without authored-note playback',()=>{
  const practice=parsePracticeMarkdown(readFileSync(new URL(`../assets/practices/${entries[0].path}`,import.meta.url),'utf8'));
  const entry=practicePathwayEntry(practice), enriched=entry;
  const variation=entry.vary.length-1,tier=entry.tempoTiers.length-1;
  const expected={...entry.base,...entry.vary[variation],bpm:entry.tempoTiers[tier]};
  if(entry.tempoTierSubdivs?.[tier])expected.subdivision=entry.tempoTierSubdivs[tier];
  if(entry.tempoTierBars?.[tier]!=null)expected.bars=entry.tempoTierBars[tier];
  assert.deepEqual(catalogPathwaySelection(enriched,variation,tier),expected);
  assert.deepEqual(practiceTierFields(enriched,tier),[['bpm',String(entry.tempoTiers[tier])],...(entry.tempoTierSubdivs?.[tier] ? [['subdivision',entry.tempoTierSubdivs[tier]]] : []),...(entry.tempoTierBars?.[tier]!=null ? [['bars',String(entry.tempoTierBars[tier])]] : [])]);
  const prefs={renderer:'tab_2d',instrument:'guitar',stringSetup:'guitar_6_standard',stringCount:6,bpm:93};
  assert.deepEqual(catalogPathwayConfig(enriched,variation,tier,prefs),{...prefs,...expected,renderer:prefs.renderer});
  assert.throws(()=>buildPracticeFileExercise({practiceFile:practice}),/not authored-note/);
});

test('practice schemas are selected by legal content shape, never by formatVersion',()=>{
  const custom=parsePracticeMarkdown(md('guitar/beginner/chromatic-warmup.md'));
  const ladder=parsePracticeMarkdown(md('guitar/beginner/chromatic-warmup-ladder.md'));
  const generated=parsePracticeMarkdown(readFileSync(new URL(`../assets/practices/${entries[0].path}`,import.meta.url),'utf8'));
  for(const practice of [custom,ladder,generated]) assert.equal('formatVersion' in practice,false);
  assert.ok(custom.variants && !custom.pathway);
  assert.ok(ladder.variants && ladder.pathway?.tiers && ladder.pathway?.variations);
  assert.ok(!generated.variants && generated.pathway?.tempoTiers && generated.pathway?.vary);
  assert.throws(()=>validatePractice({...custom,formatVersion:2}),/Unsupported practice field/);
  assert.throws(()=>parsePracticeMarkdown(readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup.md',import.meta.url),'utf8').replace('id: chromatic-warmup','formatVersion: 2\nid: chromatic-warmup')),/frontmatter/);
  assert.throws(()=>validatePractice({...custom,pathway:generated.pathway}),/Unsupported practice field or technique/);
  assert.throws(()=>validatePractice({...generated,variants:custom.variants}),/Unsupported practice field or technique/);
  assert.throws(()=>validatePractice({...generated,pathway:{...generated.pathway,tiers:[]}}),/Unsupported practice field or technique/);
  assert.throws(()=>validatePractice({...custom,variants:undefined,pathway:undefined}),/requires variants or generated pathway/);
});

function md(path){return readFileSync(new URL(`../assets/practices/${path}`,import.meta.url),'utf8');}
