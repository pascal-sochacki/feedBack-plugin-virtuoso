import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
export const lifecycleScenarios = ['recovery', 'advanced', 'cancel', 'new-success', 'new-reject', 'clear-success', 'clear-reject', 'switch-success', 'switch-reject', 'stop-success', 'stop-reject', 'resolver-success', 'resolver-reject', 'current-reject'];
lifecycleScenarios.push('custom-recovery', 'type-exit');
for (const mode of ['jam', 'workout']) for (const phase of ['ready', 'resolver', 'voices']) for (const action of ['valid', 'mode', 'navigation', 'stop', 'reject', 'mode-reject', 'navigation-reject', 'stop-reject']) lifecycleScenarios.push(`${mode}-${phase}-${action}`);

export async function runLifecycle({ root, api, debug, lab, scenario }) {
  const logError = console.error;
  console.error = (...args) => logError(...args.map(x => x instanceof Error ? x.stack.replace(/data:text[^\s)]+:(\d+):(\d+)/g, 'entry:$1:$2') : x));
  console.warn = console.error;
  const prefix = lab ? 'virtuoso_lab' : 'virtuoso';
  const nodes = new Map();
  const fields = {};
  const advanced = new Set(['fretMin', 'fretMax', 'sequence', 'fretboardSystem', 'shape']);
  class Element {
    constructor(id = '', name = '', value = '') {
      Object.assign(this, { id, name, value, checked:false, disabled:false, hidden:false, dataset:{}, style:{}, options:[], width:800, height:500 });
      this.handlers = {};
      const classes = new Set();
      this.classList = { add: (...xs) => xs.forEach(x => classes.add(x)), remove: (...xs) => xs.forEach(x => classes.delete(x)), contains: x => classes.has(x), toggle: (x, on) => on ? classes.add(x) : classes.delete(x) };
    }
    addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); }
    dispatchEvent(event) {
      const pending = [];
      for (const fn of this.handlers[event.type] || []) pending.push(fn({ type:event.type, target:this, isTrusted:false }));
      if (event.bubbles && this.name) for (const fn of form.handlers[event.type] || []) fn({ type:event.type, target:this, isTrusted:false });
      return Promise.all(pending);
    }
    click() { return this.dispatchEvent({ type:'click' }); }
    closest(selector) { return selector === `.${prefix}-advanced-only` && advanced.has(this.name) ? this : null; }
    querySelector(selector) { return query(selector); }
    querySelectorAll() { return []; }
    setAttribute() {}
    removeAttribute() {}
    getBoundingClientRect() { return { width:800, height:500 }; }
    appendChild(el) { el.parentElement = this; (this.children ||= []).push(el); if (el.id) nodes.set(el.id, el); return el; }
    replaceWith(el) { this.parentElement.appendChild(el); this.parentElement = null; }
  }
  const add = id => { const el = new Element(`${prefix}-${id}`); nodes.set(el.id, el); return el; };
  const form = add('controls'); form.elements = fields;
  for (const [name, value] of Object.entries({ instrument:'guitar', stringSetup:'guitar_6_standard', practiceType:'scale', key:'C', scale:'major', bpm:'60', bars:'2', countIn:'1', meter:'4/4', subdivision:'eighth', fretMin:'0', fretMax:'12', fretboardSystem:'position', shape:'E', sequence:'none', direction:'up', keyCycle:'none', swing:'straight', renderer:'highway_2d' })) fields[name] = new Element('', name, value);
  add('root'); add('summary'); add('status'); add('renderer-status'); add('render-host');
  add('play'); add('stop');
  add('mode-custom'); add('go-library'); add('jam-go'); add('launch-session');
  fields.customOpenMidis = add('custom-open-midis'); fields.customOpenMidis.name = 'customOpenMidis';
  const customInputs = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map(value => new Element('', '', value));
  add('file-select').value = 'chromatic-warmup'; add('file-load'); add('file-unload'); add('file-prose'); add('regenerate'); add('view-select');
  const toggle = add('advanced-toggle'); toggle.name = 'advancedMode'; toggle.type = 'checkbox'; fields.advancedMode = toggle;
  const query = selector => {
    const name = selector.match(/\[name="([^"]+)"\]/)?.[1];
    if (name) return fields[name] || null;
    return selector.startsWith('#') ? nodes.get(selector.slice(1)) || null : null;
  };
  document.getElementById = id => nodes.get(id) || null;
  document.querySelector = query;
  document.querySelectorAll = selector => selector === `.${prefix}-custom-tuning-input` ? (nodes.get(`${prefix}-custom-tuning-inputs`)?.children || customInputs) : selector.includes(`.${prefix}-advanced-only`) ? [...advanced].map(n => fields[n]) : [];
  document.createElement = () => new Element();
  globalThis.FormData = class { constructor() {} get(name) { const el = fields[name]; return !el || el.disabled ? null : el.type === 'checkbox' ? (el.checked ? 'on' : null) : el.value; } entries() { return Object.keys(fields).map(n => [n, this.get(n)]).filter(([, v]) => v !== null)[Symbol.iterator](); } };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  // No live host, layout or timer-driven boot: only explicitly dispatched actions run.
  globalThis.setTimeout = () => 0;
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = () => {};
  window.location = { href:'https://host.test/', hash:'' };
  window.AudioContext = class { constructor() { this.state = 'running'; } };
  window.history = { replaceState() {} };
  globalThis.history = window.history;
  globalThis.location = window.location;
  const source = readFileSync(resolve(root, 'assets/practices/guitar/beginner/chromatic-warmup.md'), 'utf8');
  const index = readFileSync(resolve(root, 'assets/practices/index.json'), 'utf8');
  let fetchGate = null;
  globalThis.fetch = async url => {
    if (String(url).endsWith('chromatic-warmup.md')) { if (fetchGate) await fetchGate.promise; return new Response(source); }
    if (String(url).endsWith('index.json')) return new Response(index);
    return new Response('{}');
  };
  const instances = [];
  let ready = null;
  const factory = () => {
    const instance = { draws:0, resizes:0, destroys:0, readyPromise:ready?.promise, init() {}, draw() { this.draws++; }, resize() { this.resizes++; }, destroy() { this.destroys++; } };
    instances.push(instance); return instance;
  };
  window.feedBackViz_highway_2d = factory;
  localStorage.getItem = key => key.endsWith('.renderer') ? 'highway_2d' : null;
  const lifecycle = debug.lifecycle;
  assert.equal(lifecycle.bind(), true);
  await flush();
  const change = (name, value) => { fields[name].value = value; fields[name].dispatchEvent({ type:'change', bubbles:true }); };
  const load = async () => { nodes.get(`${prefix}-file-load`).click(); await flush(); assert.ok(lifecycle.state().loadedPracticeFile); };
  if (scenario.startsWith('jam-') || scenario.startsWith('workout-')) {
    const [mode, phase, ...actions] = scenario.split('-');
    const action = actions.join('-');
    const gate = deferred();
    let starts = 0, warms = 0;
    lifecycle.playback(() => { starts++; }, async () => { warms++; if (phase === 'voices') await gate.promise; });
    if (phase === 'ready') ready = gate;
    if (phase === 'resolver') lifecycle.resolveFactory(() => gate.promise);
    const pending = nodes.get(`${prefix}-${mode === 'jam' ? 'jam-go' : 'launch-session'}`).click(); await flush();
    assert.equal(starts, 0);
    if (action.startsWith('mode')) nodes.get(`${prefix}-mode-custom`).click();
    if (action.startsWith('navigation')) nodes.get(`${prefix}-go-library`).click();
    if (action.startsWith('stop')) nodes.get(`${prefix}-stop`).click();
    const status = nodes.get(`${prefix}-status`).textContent;
    if (action.endsWith('reject')) gate.reject(new Error('launch failure'));
    else gate.resolve(phase === 'resolver' ? { factory, label:'test' } : undefined);
    await pending;
    assert.equal(starts, action === 'valid' ? 1 : 0);
    if (action !== 'valid' && action !== 'reject') assert.equal(nodes.get(`${prefix}-status`).textContent, status);
    if (phase !== 'voices' && action !== 'valid') assert.equal(warms, 0);
    if (mode === 'workout') assert.equal(nodes.get(`${prefix}-launch-session`).disabled, false);
  } else if (scenario === 'custom-recovery' || scenario === 'type-exit') {
    await load();
    if (scenario === 'custom-recovery') {
      fields.customOpenMidis.value = '38,45,50,55,59,64';
      await lifecycle.generate(); assert.equal(lifecycle.state().activeBundle, null);
      // Exercise the real per-string blur callback through the tuning input UI.
      const tuning = add('tuning-select'); tuning.value = 'custom';
      add('custom-tuning'); add('custom-tuning-inputs');
      lifecycle.customTuningSync();
      nodes.get(`${prefix}-custom-tuning-inputs`).children.forEach((input, i) => { input.value = customInputs[i].value; });
      for (const input of nodes.get(`${prefix}-custom-tuning-inputs`).children) input.dispatchEvent({ type:'blur' });
      await flush();
      assert.equal(fields.customOpenMidis.value, '40,45,50,55,59,64');
      assert.ok(lifecycle.state().activeBundle.config.practiceFile);
    } else {
      change('stringSetup', 'bass_4_standard'); await flush();
      assert.equal(lifecycle.state().activeBundle, null);
      change('practiceType', 'chromatic'); await flush();
      assert.equal(lifecycle.state().loadedPracticeFile, null);
      assert.equal(lifecycle.state().activeBundle.config.practiceType, 'chromatic');
      assert.equal(fields.key.disabled, false);
    }
  } else if (scenario === 'recovery') {
    await load();
    const practice = lifecycle.state().loadedPracticeFile;
    change('stringSetup', 'bass_4_standard'); await flush();
    assert.equal(lifecycle.state().activeBundle, null);
    assert.equal(lifecycle.state().loadedPracticeFile, practice);
    change('stringSetup', 'guitar_6_standard'); await flush();
    assert.deepEqual(lifecycle.state().activeBundle.config.practiceFile, practice);
    change('bpm', '120'); await flush();
    assert.equal(lifecycle.state().activeBundle.config.bpm, 120);
    assert.equal(fields.stringSetup.value, 'guitar_6_standard');
  } else if (scenario === 'advanced') {
    await load();
    toggle.checked = true; toggle.dispatchEvent({ type:'change', bubbles:true }); await flush();
    assert.equal(fields.sequence.disabled, true);
    nodes.get(`${prefix}-file-unload`).click(); await flush();
    assert.equal(fields.sequence.disabled, false);
    change('sequence', 'thirds'); await flush();
    assert.equal(lifecycle.state().activeBundle.config.sequence, 'thirds');
    await load(); toggle.checked = false; toggle.dispatchEvent({ type:'change', bubbles:true }); await flush();
    nodes.get(`${prefix}-file-unload`).click(); await flush();
    assert.equal(fields.sequence.disabled, true);
    assert.equal(fields.key.disabled, false);
    change('stringSetup', 'bass_4_standard'); await flush();
    assert.equal(lifecycle.state().activeBundle.config.instrument, 'bass');
  } else if (scenario === 'cancel') {
    fetchGate = deferred();
    const pending = lifecycle.load(); await flush();
    lifecycle.clear(); await lifecycle.generate();
    const bundle = lifecycle.state().activeBundle;
    fetchGate.resolve(); await pending;
    assert.equal(lifecycle.state().loadedPracticeFile, null);
    assert.equal(lifecycle.state().activeBundle, bundle);
  } else if (scenario.startsWith('resolver')) {
    const gate = deferred();
    lifecycle.resolveFactory(() => gate.promise);
    const pending = lifecycle.generate(); await flush();
    lifecycle.resolveFactory(null);
    await load();
    const current = lifecycle.state();
    const count = instances.length;
    if (scenario.endsWith('reject')) gate.reject(new Error('old resolver failure'));
    else gate.resolve({ factory, label:'stale' });
    await pending;
    assert.equal(instances.length, count);
    assert.equal(lifecycle.state().renderer, current.renderer);
    assert.equal(lifecycle.state().activeBundle, current.activeBundle);
    assert.equal(current.renderer.destroys, 0);
  } else if (scenario === 'current-reject') {
    await load();
    ready = deferred();
    const pending = lifecycle.generate(); await flush();
    const failed = instances.at(-1);
    ready.reject(new Error('current ready failure')); await pending;
    assert.equal(failed.destroys, 1);
    assert.equal(lifecycle.state().activeBundle, null);
    assert.ok(lifecycle.state().loadedPracticeFile);
    ready = null;
    change('bpm', '120'); await flush();
    assert.equal(lifecycle.state().activeBundle.config.bpm, 120);
  } else {
    if (scenario.startsWith('clear')) await load();
    ready = deferred();
    const gate = ready;
    const pending = lifecycle.generate(); await flush();
    const stale = instances.at(-1);
    ready = null;
    if (scenario.startsWith('clear')) { await load(); nodes.get(`${prefix}-file-unload`).click(); await flush(); }
    else if (scenario.startsWith('switch')) { await lifecycle.switchView('highway_2d'); }
    else if (scenario.startsWith('stop')) { lifecycle.stop(); }
    else { await load(); }
    const current = lifecycle.state();
    const replacement = instances.at(-1);
    const counts = [replacement.draws, replacement.resizes, replacement.destroys];
    const status = nodes.get(`${prefix}-status`).textContent;
    api.setSegmentLoop(0.1, 0.5);
    if (scenario.endsWith('reject')) gate.reject(new Error('old ready failure')); else gate.resolve();
    await pending;
    assert.equal(stale.destroys, 1);
    assert.equal(stale.resizes, 0);
    assert.equal(lifecycle.state().activeBundle, current.activeBundle);
    assert.equal(lifecycle.state().renderer, current.renderer);
    assert.equal(lifecycle.state().currentPracticeTime, 0.1);
    assert.deepEqual(api.getSegmentLoop(), { a:0.1, b:0.5 });
    assert.equal(nodes.get(`${prefix}-status`).textContent, status);
    // setSegmentLoop draws once; a stale completion must do nothing afterwards.
    assert.deepEqual([replacement.draws, replacement.resizes, replacement.destroys], [counts[0] + (current.renderer ? 1 : 0), counts[1], counts[2]]);
  }
}
