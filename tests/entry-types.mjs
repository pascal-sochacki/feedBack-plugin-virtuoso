// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {parse} from '../scripts/vendor/acorn.mjs';
import {normalizeTransport} from './helpers/run-transport.mjs';
import {normalizeEntrySafety} from './helpers/entry-safety.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const entry = readFileSync(new URL('../screen.js', import.meta.url), 'utf8');

test('nullable string dictionary coercions retain null, undefined, missing and inherited lookup captures', () => {
  const pairs = [['counts','h'], ['seen','h'], ['b.src','piece'], ['kit.pieces','piece'],
    ['DRUM_PIECE_GAIN','piece'], ['TONE_GM','harmProfile.pad.tone'],
    ['PATHWAYS','practiceSelection.pathwayId'], ['PATHWAYS','_activeSession.pathway_id']];
  for (const [table, key] of pairs) {
    assert.ok(entry.includes(`${table}[String(${key})]`), `${table}: ${key}`);
    const dictionary = {null:17, undefined:23, '':31, authored:47};
    const before = [null, undefined, '', 'authored', 'missing', 'toString'].map(key => dictionary[key]);
    const after = [null, undefined, '', 'authored', 'missing', 'toString'].map(key => dictionary[String(key)]);
    assert.deepEqual(after, before);
    assert.deepEqual(before.slice(0,5), [17,23,31,47,undefined]);
  }
});

test('nullable string indexing preserves dictionary value and configuration property contracts', () => {
  const {config} = ts.readConfigFile(root + 'tsconfig.entry.json', ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const path = root + 'tests/nullable-key-control.ts';
  const source = `import {PATHWAYS} from '../src/content/pathways.js';
import type {AudioProfile} from '../src/core/generation-types.js';
export function lookup(key: string | null | undefined, profile: AudioProfile) {
  const label: string = PATHWAYS[String(key)].label;
  const optionalTone: string = String(profile.pad?.tone);
  // @ts-expect-error nullable keys still require explicit property coercion
  PATHWAYS[key];
  // @ts-expect-error lookup cannot invent a pathway property
  PATHWAYS[String(key)].lable;
  // @ts-expect-error correct indexed key does not change label's value type
  const wrong: number = PATHWAYS[String(key)].label;
  return {label, optionalTone, wrong};
}`;
  const host = ts.createCompilerHost(parsed.options), read = host.readFile, exists = host.fileExists;
  host.readFile = file => file === path ? source : read(file);
  host.fileExists = file => file === path || exists(file);
  const check = () => ts.getPreEmitDiagnostics(ts.createProgram([path], parsed.options, host));
  assert.deepEqual(check().map(d => `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`), []);
  host.readFile = file => file === path ? source.replace(/\/\/ @ts-expect-error[^\n]*/g, '') : read(file);
  assert.deepEqual(check().map(d => d.code).sort((a,b) => a-b), [2322,2538,2538,2551]);
});

test('typing foundation retains independently saved dirty-before complete executable AST', () => {
  const text = JSON.stringify(parse(normalizeEntrySafety(entry), {ecmaVersion:'latest', sourceType:'module'}),
    (key, value) => ['start', 'end', 'raw'].includes(key) ? undefined : value);
  assert.equal(createHash('sha256').update(text).digest('hex'),
    '10f4e4402b7fdff8a2d5da9286ea4ea7e922e5077e67ace9acdc185513de863c');
  const host = JSON.stringify(parse(readFileSync(new URL('../src/shell/renderers/host-factories.js', import.meta.url), 'utf8'),
    {ecmaVersion:'latest', sourceType:'module'}), (key, value) => ['start', 'end', 'raw'].includes(key) ? undefined : value);
  assert.equal(createHash('sha256').update(host).digest('hex'),
    '440c940cc17a4c41bdf302a35e117ac74b0b80c0f20d96d7140b0266c419c7ae');
  assert.equal(normalizeTransport('function f(x) { return x; }'),
    normalizeTransport('/** @param {number} x */\nfunction f(x) { return x; }'));
  assert.notEqual(normalizeTransport('/** @param {number} x */\nfunction f(x) { return x + 1; }'),
    normalizeTransport('function f(x) { return x; }'));
  assert.notEqual(normalizeTransport('function f(x) { /* behavior explanation */ return x; }'),
    normalizeTransport('function f(x) { return x; }'));
});

test('DOM ID contract agrees with actual uncommented markup, including settings-only controls', () => {
  const markup = ['screen.html', 'settings.html'].map(file => readFileSync(new URL('../' + file, import.meta.url), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')).join('\n');
  const tags = new Map();
  for (const match of markup.matchAll(/<([a-z][\w-]*)\b[^>]*\bid=["']([^"']+)["'][^>]*>/gi)) {
    assert.ok(!tags.has(match[2]) || tags.get(match[2]) === match[1], `ambiguous ${match[2]}`);
    tags.set(match[2], match[1]);
  }
  const contract = readFileSync(new URL('../src/types/dom-ids.d.ts', import.meta.url), 'utf8');
  const kinds = {HTMLSelectElement:'select', HTMLInputElement:'input', HTMLButtonElement:'button', HTMLCanvasElement:'canvas', HTMLDivElement:'div'};
  for (const match of contract.matchAll(/\[Id in ([^\]]+)\]: (\w+)/g)) {
    for (const id of match[1].matchAll(/"([^"]+)"/g)) assert.equal(tags.get(id[1]), kinds[match[2]], id[1]);
  }
  for (const [id, tag] of tags) {
    if (['input', 'select', 'button', 'canvas', 'form', 'img'].includes(tag)) assert.ok(contract.includes(JSON.stringify(id)), id);
  }
  assert.equal(tags.get('virtuoso-profile-avatar'), 'img');
  assert.equal(tags.get('virtuoso-controls'), 'form');
  for (const match of contract.matchAll(/\[Selector in ([^\n]+)\]: (\w+)/g)) {
    for (const selector of match[1].matchAll(/'([^']+)'/g)) {
      const name = selector[1].match(/^(?:#virtuoso-controls )?\[name="([^"]+)"\]$/)?.[1];
      assert.ok(name, selector[1]);
      const fields = [...markup.matchAll(/<(input|select|textarea)\b[^>]*\bname="([^"]+)"[^>]*>/g)]
        .filter(field => field[2] === name);
      assert.ok(fields.length, name);
      assert.ok(fields.every(field => field[1] === kinds[match[2]]), selector[1]);
    }
  }
});

test('strict entry contracts reject unavailable host calls, wrong element properties and null assumptions', () => {
  const {config} = ts.readConfigFile(root + 'tsconfig.entry.json', ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  assert.equal(ts.version, '5.9.3');
  for (const flag of ['strict', 'checkJs', 'allowJs', 'noEmit', 'noUnusedLocals', 'noUnusedParameters']) assert.equal(parsed.options[flag], true, flag);
  const path = root + 'tests/entry-type-control.ts';
  // Take the real helper's JSDoc/body, rather than testing a lookalike accessor.
  const helper = entry.slice(entry.indexOf('  /**\n   * Fixed form/media IDs'), entry.indexOf('  /** @param {string} key'))
    .replaceAll("'./src/types/", "'../src/types/");
  const source = `import {hostBus} from '../src/shell/renderers/host-factories.js';
const input = $('virtuoso-audio-notes');
if (input) { input.checked = true;
// @ts-expect-error TS2339 input is not a canvas
input.getContext('2d'); }
const canvas = $('virtuoso-canvas');
if (canvas) { canvas.getContext('2d');
// @ts-expect-error TS2339 canvas is not a checkbox
canvas.checked = true; }
// @ts-expect-error TS2531 mounted markup is not guaranteed
$('virtuoso-shape').value;
// @ts-expect-error TS2339 dynamic IDs remain HTMLElement
$('virtuoso-' + Date.now())?.value;
const bus = hostBus();
// @ts-expect-error TS2531/TS2722 bus and navigate may be absent
bus.navigate('settings');
bus?.navigate?.('settings');
// @ts-expect-error TS2339 no invented capability
bus?.startVirtuosoPlayer();
window.noteDetect?.setVerifyTarget?.([{s:0,f:3,b:false}], {openMidis:[40,45,50,55,59,64]});
// @ts-expect-error TS2322 target positions are numeric
window.noteDetect?.setVerifyTarget?.([{s:'low',f:3}]);
${helper}`;
  const host = ts.createCompilerHost(parsed.options);
  const read = host.readFile, exists = host.fileExists;
  // JS checkJs controls are still parsed as JavaScript, so JSDoc overloads apply.
  const jsPath = path.replace(/\.ts$/, '.js');
  host.readFile = file => file === jsPath ? source : read(file);
  host.fileExists = file => file === jsPath || exists(file);
  const program = ts.createProgram([jsPath, root + 'src/types/host-interfaces.d.ts'], parsed.options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.deepEqual(diagnostics.map(d => `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`), []);
  host.readFile = file => file === jsPath ? source.replace(/\/\/ @ts-expect-error[^\n]*/g, '') : read(file);
  const unmasked = ts.getPreEmitDiagnostics(ts.createProgram([jsPath, root + 'src/types/host-interfaces.d.ts'], parsed.options, host));
  assert.deepEqual(unmasked.map(d => d.code).sort((a, b) => a - b), [2322, 2339, 2339, 2339, 2339, 2531, 2722, 18047]);
});

test('entry command reports actual complete diagnostics and fails rather than blessing a debt budget', () => {
  const result = spawnSync(process.execPath, ['scripts/typecheck-entry.mjs'], {cwd:root, encoding:'utf8'});
  const report = JSON.parse(readFileSync(new URL('../coverage/typecheck-entry.json', import.meta.url), 'utf8'));
  assert.equal(result.status, report.total ? 1 : 0);
  assert.equal(report.config, 'tsconfig.entry.json');
  assert.equal(report.typescript, '5.9.3');
  assert.equal(report.total, report.diagnostics.length);
  assert.equal(Object.values(report.byCode).reduce((sum, count) => sum + count, 0), report.total);
  assert.equal(Object.values(report.byFile).reduce((sum, count) => sum + count, 0), report.total);
  assert.match(result.stdout, new RegExp(`Strict browser entry: ${report.total} diagnostics`));
  for (const code of Object.keys(report.byCode)) assert.ok(result.stdout.includes(`TS${code}:`));
});

test('generated widget selector contracts agree with source tags and authored data attributes', () => {
  const markup = entry + '\n' + readFileSync(new URL('../screen.html', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const tags = [...markup.matchAll(/<(input|button|select|canvas|div|span)\b[^>]*>/g)].map(match => match[0]);
  const declaration = readFileSync(new URL('../src/types/event-dom.d.ts', import.meta.url), 'utf8');
  const kinds = {HTMLInputElement:'input', HTMLButtonElement:'button', HTMLSelectElement:'select'};
  for (const match of declaration.matchAll(/'([^']+)': (HTML\w+Element)(?: & \{dataset: (.+))?;/g)) {
    for (const selector of match[1].split(', ')) {
      const candidates = tags.filter(tag => selector.startsWith('#') ? tag.includes(`id="${selector.slice(1)}"`)
        : selector.startsWith('.') ? (tag.match(/class="([^"]*)"/)?.[1] || '').split(/\s+/).includes(selector.slice(1))
        : tag.includes(selector.slice(1, -1)));
      assert.ok(candidates.length, selector);
      assert.ok(candidates.every(tag => tag.startsWith('<' + kinds[match[2]])), selector);
      for (const field of (match[3] || '').matchAll(/(\w+): string/g)) {
        const attr = field[1].replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
        const required = selector === '.virtuoso-mixer-tog' ? candidates.filter(tag => !tag.includes('data-act="dim"')) : candidates;
        assert.ok(required.every(tag => tag.includes(`data-${attr}=`)), `${selector}: ${attr}`);
      }
      if (selector === '.virtuoso-mixer-tog') assert.ok(candidates.every(tag => /data-act="(?:dim|mute|solo)"/.test(tag)));
    }
  }
  const generated = readFileSync(new URL('../src/types/dom-ids.d.ts', import.meta.url), 'utf8').split('export interface GeneratedElements {')[1].split('}')[0];
  for (const match of generated.matchAll(/'([^']+)': (HTML\w+Element);/g)) {
    assert.ok(tags.some(tag => tag.includes(`id="${match[1]}"`) && tag.startsWith('<' + (kinds[match[2]] || 'canvas'))), match[1]);
  }
});

test('fixed control-list metadata matches uncommented authored HTML', () => {
  const markup = readFileSync(new URL('../screen.html', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const tags = [...markup.matchAll(/<button\b[^>]*>/g)].map(match => match[0]);
  const declaration = readFileSync(new URL('../src/types/dom-ids.d.ts', import.meta.url), 'utf8');
  for (const match of declaration.matchAll(/querySelectorAll\(selectors: '([^']+)'\): NodeListOf<HTMLButtonElement & \{dataset: \{(\w+): string\}\}>;/g)) {
    const selector = match[1];
    const attribute = match[2];
    const scope = selector.startsWith('#') ? markup.match(new RegExp(`<[^>]+id="${selector.split(' ')[0].slice(1)}"[^>]*>[\\s\\S]*?<\\/div>`))?.[0] : markup;
    assert.ok(scope, selector);
    const className = selector.split(' ').at(-1).slice(1);
    const candidates = tags.filter(tag => scope.includes(tag) && (tag.match(/class="([^"]*)"/)?.[1] || '').split(/\s+/).includes(className));
    assert.ok(candidates.length, selector);
    assert.ok(candidates.every(tag => tag.includes(`data-${attribute}=`)), `${selector}: ${attribute}`);
  }
});

test('public and debug duplicate removal preserves first insertion order and identical final references', () => {
  const properties = source => {
    const ast = parse(source, {ecmaVersion:'latest',sourceType:'module'});
    const objects = [];
    const visit = node => {
      if (node.type === 'AssignmentExpression' && ['window.Virtuoso','globalThis.__ss_debug'].includes(source.slice(node.left.start,node.left.end))) {
        objects.push(node.right.properties.map(property => ({key:property.key.name, value:source.slice(property.value.start,property.value.end)})));
      }
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(child => {if(child?.type)visit(child);});
        else if (value?.type) visit(value);
      }
    };
    visit(ast);
    return objects;
  };
  const before = entry.replace('creditFeltRung, shareCardModel, renderShareCardImage,', 'creditFeltRung, shareCardModel, shareCardText, renderShareCardImage, isShareworthy,')
    .replace('resolveDrumKit, recipeTracks, buildCompCellHits, activeBundleBacking:', 'resolveDrumKit, recipeTracks, resolveHumanSeed, buildCompCellHits, activeBundleBacking:');
  const old = properties(before), current = properties(entry);
  assert.equal(old.length, 2);
  assert.deepEqual(current.map(rows => rows.length), [40,91]);
  for (let i=0;i<old.length;i++) {
    const final = new Map();
    for (const property of old[i]) {
      const previous = final.get(property.key);
      if (previous !== undefined) assert.equal(previous, property.value, property.key);
      final.set(property.key, property.value);
    }
    assert.deepEqual(current[i].map(property => [property.key,property.value]), [...final]);
  }
});

test('resolved owner contracts distinguish complete audio voices, bass generators and rolled segment configuration', () => {
  const {config} = ts.readConfigFile(root + 'tsconfig.entry.json', ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const path = root + 'tests/owner-type-control.ts';
  const source = `import {resolveAudioProfile} from '../src/core/audio-profiles.js';
import {rollSegment} from '../src/core/segments.js';
import {SEGMENT_TEMPLATES} from '../src/content/segments.js';
import type {BassFigure} from '../src/core/generation-types.js';
import type {AudioBus, DrumBusEffects} from '../src/types/audio-graph.js';
export function check(bus: AudioBus, drums: DrumBusEffects, figure: BassFigure) {
  const profile = resolveAudioProfile({});
  const level: number = profile.harmony.level;
  const tone: string = profile.notes.tone;
  const cfg = rollSegment(SEGMENT_TEMPLATES['any-authored-id']).config;
  if (figure.kind === 'pattern') { const div: number = figure.div; figure.grid.map(step => step); void div; }
  bus.fx = {drums}; drums.comp.ratio.value = 3;
  // @ts-expect-error raw generator figures do not have a pattern grid
  if (figure.kind === 'gen') figure.grid.map(step => step);
  // @ts-expect-error pattern records require division, bars and grid
  const incomplete: BassFigure = {kind:'pattern',label:'wrong'};
  // @ts-expect-error drum effects require actual compressor and shelf nodes
  bus.fx = {drums:{send:drums.send}};
  // @ts-expect-error audio default level is numeric
  profile.bass.level = 'quiet';
  // @ts-expect-error rolled configuration is not an untyped bag
  cfg.inventedPracticeFlag = true;
  return {level,tone,incomplete};
}`;
  const host = ts.createCompilerHost(parsed.options), read = host.readFile, exists = host.fileExists;
  host.readFile = file => file === path ? source : read(file);
  host.fileExists = file => file === path || exists(file);
  const check = () => ts.getPreEmitDiagnostics(ts.createProgram([path], parsed.options, host));
  assert.deepEqual(check().map(d => `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`), []);
  host.readFile = file => file === path ? source.replace(/\/\/ @ts-expect-error[^\n]*/g, '') : read(file);
  assert.deepEqual(check().map(d => d.code).sort((a,b) => a-b), [2322,2322,2339,2739,7006,18048]);
});

test('widget, chord-input and nullable form contracts reject wrong fields without widening generator ownership', () => {
  const {config} = ts.readConfigFile(root + 'tsconfig.entry.json', ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const path = root + 'tests/wave5-type-control.ts';
  const source = `import {resolveMotifCell} from '../src/core/motif.js';
import type {WidgetSelectors} from '../src/types/event-dom.js';
import type {FormConfig} from '../src/types/form-config.js';
import type {MotifCell} from '../src/core/generation-types.js';
export function check(cell: MotifCell, pan: WidgetSelectors['.virtuoso-mixer-pan'], cfg: FormConfig) {
  resolveMotifCell(cell, {key:'C', bpm:80, chordDepth:'triad', chordOverride:'auto'}, [40,45,50,55,59,64], 0, 5);
  cfg.shapeNotes = null; cfg.shape = 1;
  pan.value = '0'; const channel: string = pan.dataset.k;
  // @ts-expect-error input widget cannot have a canvas context
  pan.getContext('2d');
  // @ts-expect-error typed generator input cannot have a string BPM
  resolveMotifCell(cell, {key:'C', bpm:'80', chordDepth:'triad', chordOverride:'auto'}, [40], 0, 5);
  // @ts-expect-error nullable form does not permit boolean shape IDs
  cfg.shape = false;
  // @ts-expect-error generated ID still resolves to a nullable input
  document.getElementById('virtuoso-lcd-bpm').value = '80';
  // @ts-expect-error arbitrary selectors have no required channel metadata
  const arbitrary: string = document.querySelector('unknown')?.dataset.k;
  return {channel, arbitrary};
}`;
  const host = ts.createCompilerHost(parsed.options), read = host.readFile, exists = host.fileExists;
  host.readFile = file => file === path ? source : read(file);
  host.fileExists = file => file === path || exists(file);
  const check = () => ts.getPreEmitDiagnostics(ts.createProgram([path], parsed.options, host));
  assert.deepEqual(check().map(d => `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`), []);
  host.readFile = file => file === path ? source.replace(/\/\/ @ts-expect-error[^\n]*/g, '') : read(file);
  assert.deepEqual(check().map(d => d.code).sort((a, b) => a - b), [2322, 2322, 2339, 2339, 2339, 2531]);
});

test('desktop power uses genuine optional screen-awake IPC with no invented method or boolean result', () => {
  const {config} = ts.readConfigFile(root + 'tsconfig.entry.json', ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const path = root + 'tests/power-type-control.js';
  const source = `import {hostDesktop} from '../src/shell/renderers/host-factories.js';
export async function keepAwake() {
  const desktop = hostDesktop();
  const setAwake = desktop?.power?.setScreenAwake;
  if (setAwake) {
    /** @type {void} */ const result = await setAwake(true);
    return result;
  }
  // @ts-expect-error nonexistent historical proposal is not a host API
  desktop?.power?.setPreventSleep?.(true);
  // @ts-expect-error optional desktop/power/method require availability checks
  await desktop.power.setScreenAwake(true);
  // @ts-expect-error IPC handler returns no boolean
  /** @type {boolean} */ const bool = await desktop?.power?.setScreenAwake?.(false);
  return bool;
}`;
  const host = ts.createCompilerHost(parsed.options), read = host.readFile, exists = host.fileExists;
  host.readFile = file => file === path ? source : read(file);
  host.fileExists = file => file === path || exists(file);
  const check = () => ts.getPreEmitDiagnostics(ts.createProgram([path], parsed.options, host));
  assert.deepEqual(check().map(d => `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`), []);
  host.readFile = file => file === path ? source.replace(/\/\/ @ts-expect-error[^\n]*/g, '') : read(file);
  assert.deepEqual(check().map(d => d.code).sort((a, b) => a - b), [2322, 2339, 2722, 18047, 18048]);
});

test('results, form and plugin-owned contracts retain precise optional data and reject invented fields', () => {
  const {config} = ts.readConfigFile(root + 'tsconfig.entry.json', ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const path = root + 'tests/results-type-control.ts';
  const source = `import type {RunSummary, HeatSnapshot, FeltAnalysis} from '../src/types/results-data.js';
import type {FormConfig} from '../src/types/form-config.js';
export function inspect(summary: RunSummary, heat: HeatSnapshot, felt: FeltAnalysis, form: FormConfig) {
  heat.fgMiss['4'] = 3;
  form.shape = null; form.customOpenMidis = null;
  summary.results.info?.heat?.cells.map(cell => cell.hit + cell.miss);
  window.__virtuosoShapes?.resolveCAGEDShape(0, 'C', 'major', [40,45,50,55,59,64]);
  document.querySelector('#virtuoso-controls [name="bpm"]')?.value;
  // @ts-expect-error unknown selectors remain Element
  document.querySelector('#made-up')?.value;
  // @ts-expect-error literal input cannot provide a canvas context
  document.querySelector('#virtuoso-controls [name="bpm"]')?.getContext('2d');
  // @ts-expect-error form nullable shape is not a validated string
  const shape: string = form.shape;
  // @ts-expect-error no invented score percentage
  summary.results.accuracy;
  // @ts-expect-error early evidence returns no numerical lean
  const lean: number = felt.leanMs;
  // @ts-expect-error derived internal heat counts are numeric
  heat.fgMiss['4'] = 'three';
  // @ts-expect-error plugin debug surface has no new player
  window.__virtuosoCoach?.playSong();
  return {shape, lean};
}`;
  const host = ts.createCompilerHost(parsed.options), read = host.readFile, exists = host.fileExists;
  host.readFile = file => file === path ? source : read(file);
  host.fileExists = file => file === path || exists(file);
  const roots = [path, root + 'src/types/dom-ids.d.ts', root + 'src/types/plugin-globals.d.ts'];
  const check = () => ts.getPreEmitDiagnostics(ts.createProgram(roots, parsed.options, host));
  assert.deepEqual(check().map(d => `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`), []);
  host.readFile = file => file === path ? source.replace(/\/\/ @ts-expect-error[^\n]*/g, '') : read(file);
  assert.deepEqual(check().map(d => d.code).sort((a, b) => a - b), [2322, 2322, 2322, 2339, 2339, 2339, 2339]);
});

test('wave3 boundary contracts retain nullable metadata, exact host frames and numeric mutable registries', () => {
  const {config} = ts.readConfigFile(root + 'tsconfig.entry.json', ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const path = root + 'tests/wave3-type-control.ts';
  const source = `import {TUNING_PRESETS, openMidisForConfig} from '../src/core/instrument-tuning.js';
import {BUILT_IN_SESSIONS} from '../src/content/workouts.js';
import {SEGMENT_ROLES} from '../src/content/segments.js';
import type {EntryBundle, EntryAccompaniment} from '../src/types/entry-data.js';
import type {HostSettingsInput, TunerFrame} from '../src/types/host-data.js';
import type {AuthoredConfig} from '../src/types/authored-config.js';
export function inspect(bundle: EntryBundle, input: HostSettingsInput, frame: TunerFrame, cfg: AuthoredConfig) {
  openMidisForConfig({customOpenMidis:null});
  cfg.customOpenMidis = '40,45,50,55,59,64';
  SEGMENT_ROLES['technique'].order = 2;
  TUNING_PRESETS['guitar_6'][0].midis.push(64);
  BUILT_IN_SESSIONS['starter_arc'].tags.push('test');
  bundle.getNoteState(bundle.notes[0]);
  // @ts-expect-error no invented public player method
  bundle.playSong();
  // @ts-expect-error raw settings tuning is unknown until narrowed
  input.tuning.slice();
  // @ts-expect-error host tuner cents are numeric
  frame.cents = 'sharp';
  // @ts-expect-error authored shape cannot be a boolean
  cfg.shape = true;
  // @ts-expect-error numeric MIDI registry
  TUNING_PRESETS['guitar_6'][0].midis.push('E');
  // @ts-expect-error role ordering is numeric
  SEGMENT_ROLES['technique'].order = 'first';
  // @ts-expect-error drum payload cannot pretend to contain chord pitches
  const drum: EntryAccompaniment = {t:0,end:1,role:'drums',voice:'kick',velocity:1,accent:true,ghost:false,midis:[40]};
  return {drum, input};
}`;
  const host = ts.createCompilerHost(parsed.options), read = host.readFile, exists = host.fileExists;
  host.readFile = file => file === path ? source : read(file);
  host.fileExists = file => file === path || exists(file);
  const check = () => ts.getPreEmitDiagnostics(ts.createProgram([path], parsed.options, host));
  assert.deepEqual(check().map(d => `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`), []);
  host.readFile = file => file === path ? source.replace(/\/\/ @ts-expect-error[^\n]*/g, '') : read(file);
  const errors = check();
  assert.equal(errors.length, 7);
  assert.ok(errors.some(d => d.code === 18046));
  assert.ok(errors.some(d => d.code === 2339));
});

test('wave4 renderer, transport and span contracts admit absent sustain and require complete span metadata', () => {
  const {config} = ts.readConfigFile(root + 'tsconfig.entry.json', ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const path = root + 'tests/wave4-type-control.ts';
  const source = `import type {RenderNote} from '../src/shell/renderers/renderer-types.js';
import type {JudgmentWindow} from '../src/types/judgment-data.js';
import type {MeterState} from '../src/types/results-data.js';
import {createRunTransport} from '../src/shell/run-transport.js';
export const note: RenderNote = {t:0,s:0,f:3};
export const hidden: MeterState = {show:false};
export function check(window: JudgmentWindow) {
  if (window.span) window.bkts.add(0);
  // @ts-expect-error sustain remains genuinely optional
  const sustain: number = note.sus;
  // @ts-expect-error ordinary groups have no span bucket set
  if (!window.span) window.bkts.add(0);
  // @ts-expect-error visible meter requires complete values
  const meter: MeterState = {show:true};
  // @ts-expect-error generic transport preserves the concrete bundle shape
  createRunTransport({operation:{currentRequest:()=>0,isCurrentRequest:()=>true},getBundle:()=>({notes:[],tag:'owned'}),prepareVoices:async (bundle:{wrong:number})=>{},startPlayback:()=>{},clockNow:()=>({wallMs:0,audioSeconds:null})});
  return {sustain,meter};
}`;
  const host = ts.createCompilerHost(parsed.options), read = host.readFile, exists = host.fileExists;
  host.readFile = file => file === path ? source : read(file);
  host.fileExists = file => file === path || exists(file);
  const check = () => ts.getPreEmitDiagnostics(ts.createProgram([path], parsed.options, host));
  assert.deepEqual(check().map(d => `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`), []);
  host.readFile = file => file === path ? source.replace(/\/\/ @ts-expect-error[^\n]*/g, '') : read(file);
  assert.equal(check().length, 5);
});

test('public Virtuoso API exposes typed entry points without validating persisted JSON', () => {
  const {config} = ts.readConfigFile(root + 'tsconfig.entry.json', ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const path = root + 'tests/virtuoso-public-api-type-control.ts';
  const source = `import type {Session} from '../src/core/session-types.js';
import type {ShareModel} from '../src/types/results-data.js';
const api = window.Virtuoso;
const config = api.readConfig();
const exercise = api.generateExercise(config);
const session: Session = {name:'Typed Workout'};
const generated = api.generateSession(session);
const bundle = api.makeBundle(exercise);
const refreshed: Session = api.refreshWorkout(api.applyLengthPreset(session, 'standard'));
const palette = api.stylePaletteConfig('blues', {progressionIdx:0, key:'A'});
const share: ShareModel | null = api.shareCardModel(null);
const persisted: unknown = api.progressLoad();
if (persisted && typeof persisted === 'object') api.progressSave(persisted);
api.setSegmentLoop(0, 4);
api.clearSegmentLoop();
api.resolveRendererFactory('tab_2d');
// Persisted localStorage JSON is deliberately not typed as validated progress.
// @ts-expect-error callers must narrow unknown persisted data before reading fields
api.progressLoad().xp;
// @ts-expect-error the public object has no invented member
api.playSong();
// @ts-expect-error style palette progression index is numeric
api.stylePaletteConfig('blues', {progressionIdx:'first'});
// @ts-expect-error generation requires a real generation configuration
api.generateExercise('not a config');
export {bundle, generated, palette, refreshed, share};`;
  const host = ts.createCompilerHost(parsed.options), read = host.readFile, exists = host.fileExists;
  host.readFile = file => file === path ? source : read(file);
  host.fileExists = file => file === path || exists(file);
  const roots = [path, root + 'src/types/plugin-globals.d.ts'];
  const check = () => ts.getPreEmitDiagnostics(ts.createProgram(roots, parsed.options, host));
  assert.deepEqual(check().map(d => `TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`), []);
  host.readFile = file => file === path ? source.replace(/\/\/ @ts-expect-error[^\n]*/g, '') : read(file);
  assert.deepEqual(check().map(d => d.code).sort((a, b) => a - b), [2322, 2339, 2345, 2571]);
});
