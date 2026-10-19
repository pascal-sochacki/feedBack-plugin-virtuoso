import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { after, test } from 'node:test';
import { buildLab, REPO, transformRuntime } from '../scripts/cut-lab.mjs';

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
  assert.deepEqual(manifest.settings.server_files, ['plugin_data/virtuoso_lab/presets.json', 'plugin_data/virtuoso_lab/tunings.json']);
  assert.match(read('screen.js'), /import .*from ['"]\.\/src\/core\/pitch\.js['"]/);
  assert.match(read('screen.js'), new RegExp(`VIRTUOSO_VERSION = '${manifest.version.replaceAll('.', '\\.')}'`));
  assert.equal(JSON.parse(read('src/package.json')).type, 'module');
  const pitch = await import(pathToFileURL(join(artifact.root, 'src/core/pitch.js')));
  assert.equal(pitch.midiToFreq(69), 440);
  const entries = execFileSync('unzip', ['-Z1', artifact.zip], { encoding: 'utf8' });
  assert.match(entries, /virtuoso_lab\/src\/core\/pitch.js/);
  assert.match(entries, /virtuoso_lab\/assets\/thumb.png/);
  assert.match(entries, /virtuoso_lab\/static\/wafonts\/WebAudioFontPlayer.js/);
  assert.doesNotMatch(entries, /node_modules|\.git\/|plugin_data\/|\.claude/);
  for (const file of artifact.files.filter(p => p.startsWith('assets/') || /\.(ogg|wav|woff2|txt)$/.test(p))) {
    assert.deepEqual(readFileSync(join(artifact.root, file)), readFileSync(join(REPO, file)), file);
  }
});

test('runtime namespace rewrites do not rename host APIs or music tokens', () => {
  for (const file of ['screen.js', 'screen.html', 'settings.html', 'routes.py']) {
    const text = read(file);
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

test('real Lab entry retains startup guards and baseline session outputs', async () => {
  const baseline = execFileSync('git', ['show', '8436194ce45d745902513b2c576031bd2e4db1c9:screen.js'], { cwd: REPO, encoding: 'utf8', maxBuffer: 8 << 20 });
  const storage = { getItem: () => null, setItem() {} };
  const document = { readyState: 'loading', addEventListener() {}, getElementById: () => null };
  const sandbox = { console, document, localStorage: storage, __SS_HARNESS__: true, addEventListener() {} };
  sandbox.window = sandbox;
  vm.runInNewContext(baseline, sandbox);
  const saved = new Map(['window', 'document', 'localStorage', '__VIRTUOSO_LAB_HARNESS__'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  try {
    globalThis.window = { addEventListener() {} };
    globalThis.document = document;
    globalThis.localStorage = storage;
    globalThis.__VIRTUOSO_LAB_HARNESS__ = true;
    await import(pathToFileURL(join(artifact.root, 'screen.js')));
    const lab = window.VirtuosoLab;
    assert.ok(lab);
    assert.equal(window.Virtuoso, undefined);
    assert.deepEqual(Object.keys(lab).sort(), Object.keys(sandbox.Virtuoso).sort());
    assert.deepEqual(Object.keys(globalThis.__virtuoso_lab_debug).sort(), Object.keys(sandbox.__ss_debug).sort());
    for (const [id, session] of Object.entries(lab.BUILT_IN_SESSIONS)) {
      assert.equal(JSON.stringify(lab.generateSession(session)), JSON.stringify(sandbox.Virtuoso.generateSession(sandbox.Virtuoso.BUILT_IN_SESSIONS[id])), id);
    }
    assert.equal(lab.progressLoad().xpTotal, sandbox.Virtuoso.progressLoad().xpTotal);
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
    delete globalThis.__virtuoso_lab_debug;
  }
});

test('regeneration replaces only marked output and is repeatable', () => {
  const before = read('screen.js');
  buildLab(dist);
  assert.equal(read('screen.js'), before);
  assert.throws(() => buildLab(REPO), /outside/);
});
