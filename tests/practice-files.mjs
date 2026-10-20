import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { parsePracticeMarkdown, validatePractice, validatePracticeIndex, buildPracticeFileExercise } from '../src/core/practice-files.js';
import { createPracticeFileLoader, displayPracticeProse } from '../src/shell/practice-files.js';
import { lifecycleScenarios } from './helpers/lifecycle.mjs';

const source = readFileSync(new URL('../assets/practices/guitar/beginner/chromatic-warmup.md', import.meta.url), 'utf8');
const index = readFileSync(new URL('../assets/practices/index.json', import.meta.url), 'utf8');
const practice = parsePracticeMarkdown(source);
const cfg = { instrument:'guitar', stringSetup:'guitar_6_standard', stringCount:6, bpm:60, practiceFile:practice, audio:{ notes:true, harmony:true }, swing:'shuffle', bars:32, keyCycle:'fourths', targetSec:60 };

for (const scenario of lifecycleScenarios) {
  test(`real entry bound lifecycle: ${scenario}`, () => {
    const root = new URL('../', import.meta.url).pathname;
    const output = execFileSync(process.execPath, ['tests/helpers/core-runner.mjs', root, '', JSON.stringify({ lifecycle:scenario })], { cwd:root, encoding:'utf8' });
    assert.equal(JSON.parse(output).lifecycle, scenario);
  });
}

test('authoritative prototype parses exact low-string attacks and explicit final-beat duration', () => {
  assert.equal(practice.id, 'chromatic-warmup');
  assert.equal(practice.referenceTempo, 60);
  assert.equal(practice.duration, 4);
  assert.deepEqual(practice.notes, [1,2,3,4].map((f, t) => ({ t, s:0, f, sus:0 })));
  assert.match(practice.prose, /Build clean finger placement/);
  assert.ok(!practice.prose.includes('```'));
  assert.deepEqual(parsePracticeMarkdown(source.replaceAll('\n', '\r\n')), practice);
});

test('tempo scales source seconds and sustains without regenerating frets or filling bars', () => {
  const saved = JSON.stringify(practice);
  for (const bpm of [30,60,120,260]) {
    const exercise = buildPracticeFileExercise({ ...cfg, bpm });
    assert.equal(exercise.chart.duration, 4 * 60 / bpm);
    assert.deepEqual(exercise.chart.notes, practice.notes.map(n => ({ ...n, t:n.t * (60 / bpm) })));
    assert.equal(exercise.session.referenceTempo, 60);
    assert.equal(exercise.session.swing, 'straight');
    assert.equal(exercise.session.targetSec, null);
    assert.equal(exercise.session.audio.harmony, false);
    assert.deepEqual(exercise.chart.backingEvents, []);
  }
  const hinted = { ...practice, notes:[{ t:0.5,s:2,f:0,sus:0.25,fg:0,pkd:1 }, { t:2,s:5,f:24,sus:1,fg:4 }] };
  const out = buildPracticeFileExercise({ ...cfg, practiceFile:hinted, bpm:120 });
  assert.deepEqual(out.chart.notes, hinted.notes.map(n => ({ ...n, t:n.t / 2, sus:n.sus / 2 })));
  assert.equal(JSON.stringify(practice), saved);
});

test('strict frontmatter rejects missing, duplicate, YAML, URLs and invalid reference tempos', () => {
  for (const changed of [source.replace('id: chromatic-warmup\n',''), source.replace('id: chromatic-warmup','id: chromatic-warmup\nid: again'),
    source.replace('title: Chromatic warm-up', 'title: |\n  multiline'), source.replace('referenceTempo: 60','referenceTempo: https://example.test'),
    source.replace('referenceTempo: 60','referenceTempo: 0'), source.replace('meter: 4/4','meter: 7/8'),
    source.replace('instrument: guitar','instrument: bass'), source.replace('tuning: standard','tuning: drop-d'),
    source.replace('---\n',''), source.replace('title: Chromatic warm-up','extra: value\ntitle: Chromatic warm-up')]) {
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
    assert.throws(() => validatePractice({ ...practice, notes:[{ ...practice.notes[0], ...note }] }));
  }
  assert.throws(() => validatePractice({ ...practice, notes:[practice.notes[0],{ ...practice.notes[1],t:0 }] }));
  assert.throws(() => validatePractice({ ...practice, notes:[{ ...practice.notes[0],sus:2 },practice.notes[1]] }));
  assert.throws(() => validatePractice({ ...practice, notes:[{ ...practice.notes[3],sus:2 }] }));
  assert.throws(() => validatePractice({ ...practice, notes:[] }));
  assert.throws(() => parsePracticeMarkdown('x'.repeat(65537)));
});

test('incompatible guitar/bass tuning and invalid tempo fail without changing cfg', () => {
  for (const delta of [{instrument:'bass'}, {stringCount:7}, {stringSetup:'guitar_6_drop_d'}, {customOpenMidis:[38,45,50,55,59,64]}, {bpm:NaN}, {bpm:29}, {bpm:261}]) {
    const input = { ...cfg, ...delta }, saved = JSON.stringify(input);
    assert.throws(() => buildPracticeFileExercise(input));
    assert.equal(JSON.stringify(input), saved);
  }
  assert.deepEqual(buildPracticeFileExercise({ ...cfg, customOpenMidis:[40,45,50,55,59,64] }).chart.notes, practice.notes);
});

test('index only admits reviewed ids and exact local paths (no URL or encoded traversal)', () => {
  const parsed = JSON.parse(index);
  assert.equal(validatePracticeIndex(parsed)[0].id, practice.id);
  for (const path of ['../secret.md','%2e%2e/secret.md','/absolute.md','https://example.test/a.md','//example.test/a.md','guitar/beginner/chromatic-warmup.md?x=1']) {
    assert.throws(() => validatePracticeIndex({ practices:[{ ...parsed.practices[0], path }] }));
  }
  assert.throws(() => validatePracticeIndex({ practices:[{ ...parsed.practices[0], id:'other' }] }));
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

test('multiline prose including HTML and links is displayed only via textContent', () => {
  const malicious = parsePracticeMarkdown(source.replace('# Chromatic warm-up', '# Warm-up\n\n<img src=x onerror=alert(1)>\n[link](javascript:alert(1))'));
  const element = { set innerHTML(_) { throw new Error('HTML execution path'); }, textContent:'' };
  displayPracticeProse(element, malicious);
  assert.match(element.textContent, /<img src=x onerror=alert\(1\)>/);
  assert.match(element.textContent, /Reference tempo: 60/);
});

test('fresh parser/builder imports are host-independent', () => {
  const url = new URL('../src/core/practice-files.js', import.meta.url).href;
  execFileSync(process.execPath, ['--input-type=module','-e', `for (const key of ['window','document','localStorage','fetch']) Object.defineProperty(globalThis,key,{get(){throw Error(key)}}); const m=await import(${JSON.stringify(url)}); m.buildPracticeFileExercise(${JSON.stringify(cfg)});`]);
});
