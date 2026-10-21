import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { PATHWAYS } from '../src/content/pathways.js';
import { parsePracticeMarkdown, validatePractice, validatePracticeIndex, buildPracticeFileExercise, practicePathwayEntry, practicePathwaySelection, practicePathwayCredit } from '../src/core/practice-files.js';
import { createPracticeFileLoader } from '../src/shell/practice-files.js';
import { displayPracticeProse } from '../src/shell/practice-presentation.js';
import { createPracticeCatalog } from '../src/shell/practice-catalog.js';
import { lifecycleScenarios } from './helpers/lifecycle.mjs';

const source = readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup.md', import.meta.url), 'utf8');
const index = readFileSync(new URL('../assets/practices/index.json', import.meta.url), 'utf8');
const practice = parsePracticeMarkdown(source);
const first = practice.variants[0];
const withNotes = notes => ({ ...practice, variants:[{ ...first, notes }] });
const cfg = { instrument:'guitar', stringSetup:'guitar_6_standard', stringCount:6, bpm:60, practiceFile:practice, audio:{ notes:true, harmony:true }, swing:'shuffle', bars:32, keyCycle:'fourths', targetSec:60 };

test('passive PATHWAYS remains an ordinary mutable authored registry', () => {
  assert.equal(Object.hasOwn(PATHWAYS, 'chromatic_warmup'), false);
  const ids = Object.keys(PATHWAYS);
  assert.ok(ids.length > 0);
  const entry = PATHWAYS[ids[0]], key = entry.label;
  entry.label = 'mutation probe';
  assert.equal(PATHWAYS[ids[0]].label, 'mutation probe');
  entry.label = key;
});

test('fresh PATHWAYS import is host-independent and ordinary nested data remains mutable', () => {
  const url = new URL('../src/content/pathways.js', import.meta.url).href;
  execFileSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    for (const name of ['window','document','localStorage','sessionStorage','fetch','AudioContext','feedBack','slopsmith','noteDetect']) {
      Object.defineProperty(globalThis, name, { configurable:true, get() { throw Error('host access: ' + name); } });
    }
    const { PATHWAYS } = await import(${JSON.stringify(url)});
    assert.equal((await import(${JSON.stringify(url)})).PATHWAYS, PATHWAYS);
    const before = JSON.stringify(PATHWAYS);
    const row = PATHWAYS.blues_foundation;
    assert.equal(Object.getPrototypeOf(PATHWAYS), Object.prototype);
    assert.equal(Object.isFrozen(PATHWAYS), false);
    const bpm = row.base.bpm;
    const tier = row.tempoTiers[0];
    const key = row.vary[0].key;
    try {
      row.base.bpm++;
      row.tempoTiers[0]++;
      row.vary[0].key = 'F#';
      assert.equal(row.base.bpm, bpm + 1);
      assert.equal(row.tempoTiers[0], tier + 1);
      assert.equal(row.vary[0].key, 'F#');
      PATHWAYS.__mutation_probe = row;
      assert.equal(PATHWAYS.__mutation_probe, row);
      assert.equal(delete PATHWAYS.__mutation_probe, true);
    } finally {
      row.base.bpm = bpm;
      row.tempoTiers[0] = tier;
      row.vary[0].key = key;
      delete PATHWAYS.__mutation_probe;
    }
    assert.equal(JSON.stringify(PATHWAYS), before);
  `], { encoding:'utf8' });
});

test('shared Pathway contract accepts authored hydration and optional density fields but rejects typos', () => {
  const markdown = readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup-ladder.md', import.meta.url), 'utf8');
  const {practiceFile, ...authored} = practicePathwayEntry(parsePracticeMarkdown(markdown));
  assert.equal(practiceFile.id, 'chromatic_warmup');
  const file = new URL('../src/content/pathway-type-probe.ts', import.meta.url).pathname;
  const options = {allowJs:true, checkJs:true, noEmit:true, strict:true, target:ts.ScriptTarget.ES2022,
    module:ts.ModuleKind.ESNext, moduleResolution:ts.ModuleResolutionKind.Bundler, types:[]};
  const positive = `
    import {PATHWAYS, type Pathway, type PathwayConfig} from './pathways.js';
    const hydrated: Pathway = ${JSON.stringify(authored)};
    PATHWAYS.chromatic_warmup = hydrated;
    for (const [, pw] of Object.entries(PATHWAYS)) {
      const subdivisions: string[] | undefined = pw.tempoTierSubdivs;
      const bars: number[] | undefined = pw.tempoTierBars;
      const tempos: number[] = pw.tempoTiers;
      const configs: PathwayConfig[] = [pw.base].concat(pw.vary);
      for (const cfg of configs) {
        const shape: string | number | undefined = cfg.shape;
        const anchor: string | undefined = cfg.anchor;
      }
    }
  `;
  const diagnose = source => {
    const host = ts.createCompilerHost(options), read = host.readFile;
    host.readFile = path => path === file ? source : read(path);
    const program = ts.createProgram([file], options, host);
    return ts.getPreEmitDiagnostics(program);
  };
  assert.deepEqual(diagnose(positive).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
  const negative = diagnose(positive + `
    PATHWAYS.blues_foundation.tempoTierSubdivz;
    PATHWAYS.blues_foundation.inventedPathwayField;
    PATHWAYS.blues_foundation.base.inventedConfigField;
    PATHWAYS.blues_foundation.tempoTierBars = ['eight'];
  `);
  assert.equal(negative.length, 4);
  assert.ok(negative.every(d => d.file?.fileName === file));
  assert.deepEqual(negative.map(d => d.code), [2551, 2339, 2339, 2322]);
});

test('real entry hydration inserts authored Warmup into the exported registry without replacing references', () => {
  const root = new URL('../', import.meta.url).pathname;
  const output = execFileSync(process.execPath, ['tests/helpers/core-runner.mjs', root, '{"pathwayIdentity":true}'], { cwd:root, encoding:'utf8' });
  assert.equal(JSON.parse(output).pathwayIdentity, true);
});

test('catalog cancellation and late rejection cannot clear or poison a newer retry; ready is cached', async () => {
  const gates = [];
  const load = () => {};
  load.index = () => new Promise((resolve, reject) => gates.push({resolve, reject}));
  let changes = 0;
  const catalog = createPracticeCatalog(load, {}, {guitar:{}}, () => { changes++; });
  const old = catalog.initialize();
  assert.equal(catalog.initialize(), old);
  await Promise.resolve();
  catalog.cancel();
  const retry = catalog.initialize();
  await Promise.resolve();
  gates[0].reject(Error('abandoned')); await old;
  assert.equal(catalog.initialize(), retry, 'old finally cannot clear new promise');
  assert.equal(catalog.state.error, null);
  assert.equal(changes, 0);
  gates[1].resolve([]); await retry;
  assert.equal(catalog.state.settled, true);
  await catalog.initialize();
  assert.equal(gates.length, 2, 'ready is reused');
  assert.equal(changes, 2);
});

test('version three owns stable Ladder identity, six variations, twelve charts and explicit four-tier references', () => {
  const ladder = parsePracticeMarkdown(readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup-ladder.md', import.meta.url), 'utf8'));
  const entry = practicePathwayEntry(ladder);
  assert.equal(ladder.id, 'chromatic_warmup');
  assert.equal(ladder.variants.length, 12);
  assert.equal(entry.vary.length, 6);
  assert.deepEqual(entry.tempoTiers, [60,70,80,90]);
  assert.deepEqual(entry.tempoTierSubdivs, ['quarter','quarter','quarter','eighth']);
  assert.deepEqual(entry.tempoTierBars, [4,6,8,8]);
  assert.deepEqual(entry.formCues, ['one_finger_per_fret','light_grip']);
  for (let v = 0; v < 6; v++) for (let t = 0; t < 4; t++) {
    const selected = practicePathwaySelection(ladder, v, t);
    const chart = ladder.variants.find(variant => variant.id === selected.practiceVariantId);
    assert.equal(chart.notes.length, t === 3 ? 96 : 48);
    assert.equal(chart.duration, 48);
    assert.ok(chart.hint);
    for (const delta of [{instrument:'bass'}, {stringSetup:'guitar_6_drop_d'}, {stringCount:7}, {openMidis:[38,45,50,55,59,64]}]) {
      assert.throws(() => buildPracticeFileExercise({ ...cfg, ...selected, meter:{numerator:4,denominator:4}, ...delta }), /standard/);
    }
  }
  for (const mutate of [p => { p.tiers[1].bpm = 60; }, p => { p.variations[0].charts[3] = 'missing'; },
    p => { p.variations[0].charts.pop(); }, p => { p.base.extra = true; }, p => { p.goal = ''; }]) {
    const changed = structuredClone(ladder); mutate(changed.pathway);
    assert.throws(() => validatePractice(changed));
  }
  assert.throws(() => practicePathwaySelection(ladder, 6, 0));
  assert.throws(() => practicePathwaySelection(ladder, 0, 4));
});

for (const scenario of lifecycleScenarios) {
  test(`real entry bound lifecycle: ${scenario}`, () => {
    const root = new URL('../', import.meta.url).pathname;
    const output = execFileSync(process.execPath, ['tests/helpers/core-runner.mjs', root, JSON.stringify({ lifecycle:scenario })], { cwd:root, encoding:'utf8' });
    assert.equal(JSON.parse(output).lifecycle, scenario);
  });
}

test('authoritative prototype parses exact low-string attacks and explicit final-beat duration', () => {
  assert.equal(practice.id, 'chromatic-warmup');
  assert.equal(practice.referenceTempo, 60);
  assert.equal(practice.formatVersion, 2);
  for (const [i, variant] of practice.variants.entries()) {
    assert.equal(variant.duration, 4);
    assert.deepEqual(variant.notes, [1,2,3,4].map((fg, t) => ({ t, s:0, f:fg + i * 4, sus:0, fg, pkd:t % 2 })));
  }
  assert.match(practice.prose, /Build clean finger placement/);
  assert.ok(!practice.prose.includes('```'));
  assert.deepEqual(parsePracticeMarkdown(source.replaceAll('\n', '\r\n')), practice);
});

test('tempo scales source seconds and sustains without regenerating frets or filling bars', () => {
  const saved = JSON.stringify(practice);
  for (const variant of practice.variants) for (const bpm of [30,60,120,260]) {
    const exercise = buildPracticeFileExercise({ ...cfg, bpm, practiceVariantId:variant.id });
    assert.equal(exercise.chart.duration, 4 * 60 / bpm);
    assert.deepEqual(exercise.chart.notes, variant.notes.map(n => ({ ...n, t:n.t * (60 / bpm) })));
    assert.equal(exercise.session.practiceFileVariantId, variant.id);
    assert.equal(exercise.session.practiceFileVariantTitle, variant.title);
    assert.equal(exercise.session.practiceFileVariantHint, variant.hint);
    assert.deepEqual(buildPracticeFileExercise({ ...exercise.session, bpm:120 }).chart.notes, variant.notes.map(n => ({ ...n, t:n.t / 2 })));
    assert.equal(exercise.session.referenceTempo, 60);
    assert.equal(exercise.session.swing, 'straight');
    assert.equal(exercise.session.targetSec, null);
    assert.equal(exercise.session.audio.harmony, false);
    assert.deepEqual(exercise.chart.backingEvents, []);
  }
  const hinted = withNotes([{ t:0.5,s:2,f:0,sus:0.25,fg:0,pkd:1 }, { t:2,s:5,f:24,sus:1,fg:4 }]);
  const out = buildPracticeFileExercise({ ...cfg, practiceFile:hinted, bpm:120 });
  assert.deepEqual(out.chart.notes, hinted.variants[0].notes.map(n => ({ ...n, t:n.t / 2, sus:n.sus / 2 })));
  assert.equal(JSON.stringify(practice), saved);
});

test('strict frontmatter rejects missing, duplicate, YAML, URLs and invalid reference tempos', () => {
  for (const changed of [source.replace('id: chromatic-warmup\n',''), source.replace('id: chromatic-warmup','id: chromatic-warmup\nid: again'),
    source.replace('title: Chromatic warm-up', 'title: |\n  multiline'), source.replace('referenceTempo: 60','referenceTempo: https://example.test'),
    source.replace('referenceTempo: 60','referenceTempo: 0'), source.replace('meter: 4/4','meter: 7/8'),
    source.replace('instrument: guitar','instrument: bass'), source.replace('tuning: standard','tuning: drop-d'),
    source.replace('---\n',''), source.replace('title: Chromatic warm-up','extra: value\ntitle: Chromatic warm-up'),
    source.replace('formatVersion: 2\n',''), source.replace('formatVersion: 2','formatVersion: 1')]) {
    assert.throws(() => parsePracticeMarkdown(changed));
  }
});

test('JSON fences reject malformed, multiple, unsupported or ambiguous chart payloads', () => {
  assert.throws(() => parsePracticeMarkdown(source.replace('"duration": 4', '"duration": 5, "duration": 4')), /Duplicate/);
  assert.throws(() => parsePracticeMarkdown(source.replace('"f": 1', '"f": 2, "\\u0066": 1')), /Duplicate/);
  for (const changed of [source.replace('"duration": 4','"duration": nope'), source + '\n```json\n{}\n```\n',
    source.replace('```json','```'), source.replace('"duration": 4','"chords": [], "duration": 4'),
    source.replace('"duration": 4','"duration": 3'), source.replace('"notes": [','"notes": null, "ignored": [')]) assert.throws(() => parsePracticeMarkdown(changed));
});

test('validation rejects chords, overlaps, unsupported technique flags and malformed numbers', () => {
  for (const note of [{t:NaN}, {t:-1}, {s:6}, {s:0.5}, {f:25}, {f:-1}, {sus:Infinity}, {sus:-1}, {bn:0}, {ho:false}, {sl:-1}, {fn:1}, {ch:'group'}, {fg:0}, {pkd:2}]) {
    assert.throws(() => validatePractice(withNotes([{ ...first.notes[0], ...note }])));
  }
  assert.throws(() => validatePractice(withNotes([first.notes[0],{ ...first.notes[1],t:0 }])));
  assert.throws(() => validatePractice(withNotes([{ ...first.notes[0],sus:2 },first.notes[1]])));
  assert.throws(() => validatePractice(withNotes([{ ...first.notes[3],sus:2 }])));
  assert.throws(() => validatePractice(withNotes([])));
  assert.throws(() => parsePracticeMarkdown('x'.repeat(65537)));
  assert.throws(() => parsePracticeMarkdown(source + 'é'.repeat(32768)), /large/);
});

test('incompatible guitar/bass tuning and invalid tempo fail without changing cfg', () => {
  for (const delta of [{instrument:'bass'}, {stringCount:7}, {stringSetup:'guitar_6_drop_d'}, {customOpenMidis:[38,45,50,55,59,64]}, {bpm:NaN}, {bpm:29}, {bpm:261}]) {
    const input = { ...cfg, ...delta }, saved = JSON.stringify(input);
    assert.throws(() => buildPracticeFileExercise(input));
    assert.equal(JSON.stringify(input), saved);
  }
  assert.deepEqual(buildPracticeFileExercise({ ...cfg, customOpenMidis:[40,45,50,55,59,64] }).chart.notes, first.notes);
});

test('version two requires unique authored variants and validates every sibling before selection', () => {
  for (const delta of [{variants:[]}, {variants:null}, {notes:first.notes}, {duration:4}, {id:'bad__id'},
    {variants:[first, first]}, {variants:[first, { ...practice.variants[1], notes:[{t:0,s:0,f:25,sus:0}] }]},
    {variants:[{ ...first, title:' ' }]}, {variants:[{ ...first, hint:'x'.repeat(501) }]},
    {variants:[{ ...first, hint:'line\nbreak' }]}, {variants:[{ ...first, referenceTempo:90 }]},
    {variants:Array.from({length:33}, (_, i) => ({ ...first, id:`v-${i}` }))}]) {
    assert.throws(() => buildPracticeFileExercise({ ...cfg, practiceFile:{ ...practice, ...delta } }));
  }
  const fence = payload => source.replace(/```json\n[\s\S]*?\n```/, '```json\n' + JSON.stringify(payload) + '\n```');
  for (const payload of [{duration:4, notes:first.notes}, {variants:practice.variants, notes:first.notes},
    {variants:practice.variants, id:practice.id}, {variants:practice.variants, referenceTempo:60},
    {variants:practice.variants, tuning:'standard'}]) assert.throws(() => parsePracticeMarkdown(fence(payload)));
  for (const practiceVariantId of ['missing', '', null, 0]) assert.throws(() => buildPracticeFileExercise({ ...cfg, practiceVariantId }), /Unknown/);
  const many = Array.from({length:2049}, (_, t) => ({t:t / 10,s:0,f:1,sus:0}));
  assert.throws(() => validatePractice({ ...practice, variants:[{ ...first, duration:300, notes:many }, { ...first, id:'second', duration:300, notes:many }] }), /Too many/);
});

test('index only admits reviewed ids and exact local paths (no URL or encoded traversal)', () => {
  const parsed = JSON.parse(index);
  assert.equal(validatePracticeIndex(parsed)[0].id, practice.id);
  for (const path of ['../secret.md','%2e%2e/secret.md','/absolute.md','https://example.test/a.md','//example.test/a.md','guitar/beginner/chromatic-warmup.md?x=1']) {
    assert.throws(() => validatePracticeIndex({ practices:[{ ...parsed.practices[0], path }, parsed.practices[1]] }));
  }
  assert.throws(() => validatePracticeIndex({ practices:[parsed.practices[0], { ...parsed.practices[1], id:parsed.practices[0].id }] }));
});

test('loader uses same-origin assets, validated cache, explicit errors and cancellation', async () => {
  const calls = [];
  const mock = async (url, options) => { calls.push([url,options]); return new Response(url.endsWith('index.json') ? index : source); };
  const load = createPracticeFileLoader('https://host.test/api/plugins/virtuoso_lab/assets/practices/', mock);
  assert.deepEqual(await load(practice.id), practice);
  await load(practice.id);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(([url, options]) => url.startsWith('https://host.test/api/plugins/virtuoso_lab/assets/practices/') && options.redirect === 'error'));
  await assert.rejects(createPracticeFileLoader('https://host.test/assets/', async () => new Response('',{status:404}))(practice.id), /unavailable/);
  await assert.rejects(createPracticeFileLoader('https://host.test/assets/', async url => new Response(url.endsWith('index.json') ? index : source.replace('id: chromatic-warmup','id: other')))(practice.id), /metadata/);
  const controller = new AbortController();
  const aborted = createPracticeFileLoader('https://host.test/assets/', async url => { if (!url.endsWith('index.json')) controller.abort(); return new Response(url.endsWith('index.json') ? index : source); });
  await assert.rejects(aborted(practice.id, controller.signal), /cancelled/);
});

test('loader bounds stalled fetch and body reads, aborts requests and never caches late responses', async () => {
  let signal, release;
  const load = createPracticeFileLoader('https://host.test/assets/', async (_, options) => {
    signal = options.signal;
    return await new Promise(resolve => { release = resolve; });
  }, 5);
  await assert.rejects(load.index(), /timed out/);
  assert.equal(signal.aborted, true);
  release(new Response(index));
  await assert.rejects(load.index(), /timed out/, 'late response cannot cache catalog');
  const body = createPracticeFileLoader('https://host.test/assets/', async () => ({ok:true, headers:new Headers(), text:() => new Promise(() => {})}), 5);
  await assert.rejects(body.index(), /timed out/);
});

test('authored credit caps selected density and rejects mismatched mapping/config', () => {
  const lesson = parsePracticeMarkdown(readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup-ladder.md', import.meta.url), 'utf8'));
  const quarter = { ...practicePathwaySelection(lesson, 0, 0), bpm:90 };
  assert.equal(practicePathwayCredit(quarter, lesson).tierIndex, 0);
  assert.equal(practicePathwayCredit(practicePathwaySelection(lesson, 0, 3), lesson).tierIndex, 3);
  for (const delta of [{subdivision:'eighth'}, {practicePathwayTierIndex:3}, {practiceVariantId:'missing'}, {bars:8}, {practiceType:'scale'}]) {
    assert.equal(practicePathwayCredit({ ...quarter, ...delta }, lesson), null);
  }
});

test('multiline prose including HTML and links is displayed only via textContent', () => {
  const malicious = parsePracticeMarkdown(source.replace('# Chromatic warm-up', '# Warm-up\n\n<img src=x onerror=alert(1)>\n[link](javascript:alert(1))'));
  const element = { set innerHTML(_) { throw new Error('HTML execution path'); }, textContent:'' };
  displayPracticeProse(element, malicious);
  assert.match(element.textContent, /<img src=x onerror=alert\(1\)>/);
  assert.match(element.textContent, /Reference tempo: 60/);
  const inert = validatePractice({ ...practice, variants:[{ ...first, hint:'<img src=x onerror=alert(1)>' }] });
  assert.equal(inert.variants[0].hint, '<img src=x onerror=alert(1)>');
});

test('fresh parser/builder imports are host-independent', () => {
  const url = new URL('../src/core/practice-files.js', import.meta.url).href;
  execFileSync(process.execPath, ['--input-type=module','-e', `for (const key of ['window','document','localStorage','fetch']) Object.defineProperty(globalThis,key,{get(){throw Error(key)}}); const m=await import(${JSON.stringify(url)}); m.buildPracticeFileExercise(${JSON.stringify(cfg)});`]);
});
