import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { after, test } from 'node:test';
import { buildLab, REPO, transformRuntime } from '../scripts/cut-lab.mjs';
import { characterize, compareCorpus } from './helpers/characterization.mjs';
import { checkMarkdownLinks } from '../scripts/check-doc-links.mjs';

const approvedTemp = join(tmpdir(), 'opencode');
const temp = existsSync(approvedTemp) ? approvedTemp : tmpdir();
const dist = mkdtempSync(join(temp, 'virtuoso-lab-test-'));
const artifact = buildLab(dist);
after(() => rmSync(dist, { recursive: true, force: true }));
const read = file => readFileSync(join(artifact.root, file), 'utf8');

test('Lab manifest, complete source graph and ZIP carry a separate identity', async () => {
  const manifest = JSON.parse(read('plugin.json'));
  assert.equal(manifest.id, 'virtuoso_lab');
  assert.equal(manifest.name, 'Virtuoso (Lab)');
  assert.equal(manifest.nav.label, 'Virtuoso (Lab)');
  assert.equal(manifest.nav.screen, 'virtuoso_lab');
  assert.equal(manifest.scriptType, 'module');
  assert.deepEqual(checkMarkdownLinks(join(artifact.root, 'README.md'), read('README.md'), artifact.root), []);
  assert.match(read('README.md'), /Experimental, not a stable update/);
  assert.deepEqual(manifest.settings.server_files, ['plugin_data/virtuoso_lab/presets.json', 'plugin_data/virtuoso_lab/tunings.json']);
  assert.match(read('screen.js'), /import .*from ['"]\.\/src\/core\/pitch\.js['"]/);
  assert.match(read('screen.js'), new RegExp(`VIRTUOSO_VERSION = '${manifest.version.replaceAll('.', '\\.')}'`));
  assert.equal(JSON.parse(read('src/package.json')).type, 'module');
  const pitch = await import(pathToFileURL(join(artifact.root, 'src/core/pitch.js')));
  assert.equal(pitch.midiToFreq(69), 440);
  const sourceScales = await import('../src/core/scale-intervals.js');
  const labScales = await import(pathToFileURL(join(artifact.root, 'src/core/scale-intervals.js')));
  assert.deepEqual(labScales.SCALE_INTERVALS, sourceScales.SCALE_INTERVALS);
  assert.notEqual(labScales.SCALE_INTERVALS, sourceScales.SCALE_INTERVALS);
  assert.match(read('screen.js'), /import .*from ['"]\.\/src\/core\/scale-intervals\.js['"]/);
  const entries = execFileSync('unzip', ['-Z1', artifact.zip], { encoding: 'utf8' });
  assert.match(entries, /virtuoso_lab\/src\/core\/pitch.js/);
  assert.match(entries, /virtuoso_lab\/src\/core\/scale-intervals.js/);
  assert.match(entries, /virtuoso_lab\/assets\/thumb.png/);
  assert.match(entries, /virtuoso_lab\/static\/wafonts\/WebAudioFontPlayer.js/);
  assert.doesNotMatch(entries, /node_modules|\.git\/|plugin_data\/|\.claude/);
  for (const file of artifact.files.filter(p => p.startsWith('assets/') || /\.(ogg|wav|woff2|txt)$/.test(p))) {
    assert.deepEqual(readFileSync(join(artifact.root, file)), readFileSync(join(REPO, file)), file);
  }
});

test('runtime namespace rewrites do not rename host APIs or music tokens', () => {
  for (const file of ['screen.js', 'screen.html', 'settings.html', 'routes.py']) {
    // Repository citations deliberately retain the real fork name, not its runtime ID.
    const text = read(file).replaceAll('https://github.com/pascal-sochacki/feedBack-plugin-virtuoso', 'SOURCE_REPOSITORY');
    assert.doesNotMatch(text, /virtuoso(?!_lab)|\.Virtuoso\b|__ss_|__SS_|(?<![\w])(?:ss-|vir-)|\bVirtuoso(?:Display|Esports|Metal)/);
  }
  assert.match(read('routes.py'), /virtuoso_lab_presets/);
  assert.match(read('routes.py'), /virtuoso_lab_tunings/);
  assert.match(read('screen.js'), /virtuoso_lab:progress/);
  assert.match(read('screen.js'), /window\.VirtuosoLab =/);
  const fixture = 'feedBack noteDetect slopsmith_notedetect slopsmith_notedetect_save_dir chord_tone_emphasis bass-felt _tone_ _drum_ vir-lit --vir-accent';
  assert.equal(transformRuntime(fixture), 'feedBack noteDetect slopsmith_notedetect slopsmith_notedetect_save_dir chord_tone_emphasis bass-felt _virtuoso_lab_tone_ _virtuoso_lab_drum_ virtuoso_lab_vir-lit --virtuoso_lab_vir-accent');
  const ids = text => new Set([...text.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const originalIds = ids(readFileSync(join(REPO, 'screen.html'), 'utf8'));
  assert.deepEqual([...ids(read('screen.html'))].filter(id => originalIds.has(id)), []);
  const hostKeys = text => [...text.matchAll(/(?:window\.(?:feedBack\w*|slopsmith\w*|noteDetect|tuner)|slopsmith_notedetect\w*)/g)].map(m => m[0]);
  assert.deepEqual(hostKeys(read('screen.js')), hostKeys(readFileSync(join(REPO, 'screen.js'), 'utf8')));
});

test('Lab carries verbatim legal texts, upstream preferred source and copyright notices', () => {
  const digest = file => createHash('sha256').update(readFileSync(join(artifact.root, file))).digest('hex');
  assert.equal(digest('LICENSES/GPL-3.0.txt'), '3972dc9744f6499f0f9b2dbf76696f2ae7ad8af9b23dde66d6af86c9dfb36986');
  assert.equal(digest('LICENSES/CC-BY-3.0.txt'), 'e6bc9e9c474700b708f568bac9e5a8a9bcb2b1dad53442f5ba449fcb848b8e76');
  assert.equal(digest('LICENSES/FluidR3-provenance.md'), '0fa7d85b3114adb91cebd42fe955e22df6b19917e9c8e19c401080c075975636');
  assert.equal(digest('vendor/webaudiofont-src/npm/dist/WebAudioFontPlayer.js'), 'f3f3bae5fa47140eecc0c72834d3b4eaed16ca108f891456aa2625b86d3fb07f');
  for (const file of artifact.files.filter(p => /^(LICENSES|vendor)\//.test(p) || ['SOURCE.md', 'THIRD_PARTY_NOTICES.md'].includes(p))) {
    assert.deepEqual(readFileSync(join(artifact.root, file)), readFileSync(join(REPO, file)), file);
    if (file.endsWith('.md') && !file.startsWith('LICENSES/')) {
      assert.deepEqual(checkMarkdownLinks(join(artifact.root, file), read(file), artifact.root), [], file);
    }
  }
  for (const file of ['README.md', 'SOURCE.md', 'settings.html']) {
    assert.match(read(file), /2026 Christian Cowan/);
    assert.match(read(file), /Pascal Sochacki/);
    assert.match(read(file), /AGPL-3\.0-only/);
  }
  assert.match(read('LICENSES/MIT-FluidR3.txt'), /2000-2002, 2008 Frank Wen/);
  assert.match(read('LICENSES/MIT-FluidR3.txt'), /Permission is hereby granted/);
  const presetHashes = read('static/wafonts/SHA256SUMS.txt').trim().split('\n');
  assert.equal(presetHashes.length, 28);
  for (const line of presetHashes) {
    const [hash, file] = line.split(/\s+/);
    assert.equal(createHash('sha256').update(readFileSync(join(REPO, 'static/wafonts', file))).digest('hex'), hash, file);
  }
  assert.match(read('THIRD_PARTY_NOTICES.md'), /removed.*2026-10-20/);
  assert.match(read('static/wafonts/README.md'), /GPL-3\.0-or-later \(not MIT\)/);
  const originalPlayer = join(artifact.root, 'vendor/webaudiofont-src/npm/dist/WebAudioFontPlayer.js');
  const rebuiltPlayer = join(dist, 'LabPlayer.js');
  execFileSync(process.execPath, [join(artifact.root, 'vendor/webaudiofont-src/rebuild-lab.mjs'), originalPlayer, rebuiltPlayer]);
  assert.deepEqual(readFileSync(rebuiltPlayer), readFileSync(join(artifact.root, 'static/wafonts/WebAudioFontPlayer.js')));
  const entries = execFileSync('unzip', ['-Z1', artifact.zip], { encoding: 'utf8' });
  assert.match(entries, /virtuoso_lab\/THIRD_PARTY_NOTICES.md/);
  assert.match(entries, /virtuoso_lab\/vendor\/webaudiofont-src\/npm\/src\/player.ts/);
  assert.doesNotMatch(entries, /cab_clean\.wav|cab_drive\.wav|static\/nam\/|wafonts\/alt\//);
  const links = [...read('settings.html').matchAll(/<a [^>]*href="([^"]+)"[^>]*>/g)];
  assert.equal(links.length, 3);
  for (const link of links) {
    assert.ok(link[1].startsWith('https://github.com/pascal-sochacki/feedBack-plugin-virtuoso/'));
    assert.match(link[0], /target="_blank"/);
    assert.match(link[0], /rel="noopener noreferrer"/);
  }
});

test('Lab audio scripts publish private player and mutable preset globals', () => {
  const file = artifact.files.find(p => p.startsWith('static/wafonts/') && /\/0\d.*\.js$/.test(p));
  assert.ok(file);
  const sandbox = {};
  vm.runInNewContext(read(file), sandbox);
  assert.ok(Object.keys(sandbox).some(k => k.startsWith('_virtuoso_lab_tone_')));
  assert.ok(!Object.keys(sandbox).some(k => k.startsWith('_tone_')));
  vm.runInNewContext(read('static/wafonts/WebAudioFontPlayer.js'), sandbox);
  assert.equal(typeof sandbox.VirtuosoLabWebAudioFontPlayer, 'function');
  assert.equal(sandbox.WebAudioFontPlayer, undefined);
});

test('withdrawn recordings are absent from source, Lab inventory, folder and ZIP', () => {
  for (const root of [REPO, artifact.root]) assert.ok(!readdirSync(join(root, 'static/samples')).some(f => /^8r_.*\.ogg$/.test(f)));
  const files = execFileSync('git', ['ls-files', 'static/samples/8r_*.ogg'], { cwd: REPO, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  for (const file of [...files, 'static/irs/v30_4x12.wav']) assert.equal(existsSync(join(REPO, file)), false, file);
  assert.doesNotMatch(artifact.files.join('\n'), /static\/samples\/8r_.*\.ogg|static\/irs\/v30_4x12\.wav/);
  const entries = execFileSync('unzip', ['-Z1', artifact.zip], { encoding: 'utf8' });
  assert.doesNotMatch(entries, /\/8r_.*\.ogg|\/v30_4x12\.wav|vendor\/.*(?:8ridge|AIDA)/i);
  assert.equal(existsSync(join(artifact.root, 'static/irs/v30_4x12.wav')), false);
});

test('real source and Lab audio functions migrate old DI pins and use the procedural metal cab', () => {
  for (const root of [REPO, artifact.root]) assert.deepEqual(characterize(root, undefined, { audioRemoval: true }), { audioRemoval: true });
});

test('generated Python routes and SQL own only Lab persistence and endpoints', () => {
  execFileSync('python3', ['-c', `
import ast, sqlite3, sys
tree = ast.parse(open(sys.argv[1]).read())
constants = {n.targets[0].id: n.value.value for n in tree.body if isinstance(n, ast.Assign) and isinstance(n.targets[0], ast.Name) and isinstance(n.value, ast.Constant)}
assert constants['PLUGIN_ID'] == 'virtuoso_lab'
assert constants['TEMP_ROOT_NAME'] == '.virtuoso_lab-temp'
paths = []
db = sqlite3.connect(':memory:')
for n in ast.walk(tree):
    if not isinstance(n, ast.Call) or not isinstance(n.func, ast.Attribute) or not n.args:
        continue
    arg = n.args[0]
    if n.func.attr in ('get', 'post', 'delete') and isinstance(n.func.value, ast.Name) and n.func.value.id == 'app':
        assert isinstance(arg, ast.JoinedStr)
        path = ''.join(v.value if isinstance(v, ast.Constant) else constants[v.value.id] for v in arg.values)
        paths.append(path)
    if n.func.attr == 'execute' and isinstance(arg, ast.Constant) and isinstance(arg.value, str) and 'CREATE TABLE' in arg.value:
        db.execute(arg.value)
assert paths and all(p.startswith('/api/plugins/virtuoso_lab/') for p in paths)
assert {'virtuoso_lab_presets', 'virtuoso_lab_tunings'} <= {r[0] for r in db.execute('SELECT name FROM sqlite_master')}
`, join(artifact.root, 'routes.py')]);
});

test('isolated real Lab ESM entry retains startup guards and committed core corpus', () => {
  compareCorpus(characterize(artifact.root));
});

test('regeneration replaces only marked output and is repeatable', () => {
  const before = read('screen.js');
  buildLab(dist);
  assert.equal(read('screen.js'), before);
  assert.throws(() => buildLab(REPO), /outside/);
});
