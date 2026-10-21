import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
export const lifecycleScenarios = ['recovery', 'advanced', 'cancel', 'new-success', 'new-reject', 'clear-success', 'clear-reject', 'switch-success', 'switch-reject', 'stop-success', 'stop-reject', 'resolver-success', 'resolver-reject', 'current-reject'];
lifecycleScenarios.push('custom-recovery', 'type-exit');
lifecycleScenarios.push('variant-playing', 'variant-recovery', 'variant-race-success', 'variant-race-reject', 'variant-load-failure', 'variant-navigation');
lifecycleScenarios.push('navigation-reentry', 'navigation-reentry-stale', 'variant-ready-failure');
lifecycleScenarios.push('ladder-chart', 'ladder-tuning', 'ladder-race', 'ladder-navigation', 'catalog-failure', 'catalog-pending');
lifecycleScenarios.push('boot-pending', 'boot-failure', 'boot-navigation', 'boot-timeout', 'ladder-views', 'ladder-credit', 'ladder-type-exit');
lifecycleScenarios.push('boot-initial-default', 'boot-initial-saved', 'boot-initial-default-error', 'boot-initial-saved-error', 'boot-initial-other-saved', 'boot-initial-user-pick', 'boot-initial-control', 'boot-initial-reentry', 'boot-initial-error-reentry');
for (const mode of ['jam', 'workout']) for (const phase of ['ready', 'resolver', 'voices']) for (const action of ['valid', 'mode', 'navigation', 'stop', 'reject', 'mode-reject', 'navigation-reject', 'stop-reject']) lifecycleScenarios.push(`${mode}-${phase}-${action}`);

export async function runLifecycle({ root, api, debug, lab, scenario, boot }) {
  const logError = console.error;
  console.error = (...args) => logError(...args.map(x => x instanceof Error ? x.stack.replace(/data:text[^\s)]+:(\d+):(\d+)/g, 'entry:$1:$2') : x));
  console.warn = console.error;
  const prefix = lab ? 'virtuoso_lab' : 'virtuoso';
  const editorScenario = scenario === 'editor-capture' || scenario === 'editor-page-events';
  const pageHandlers = new Map();
  if (editorScenario) window.addEventListener = (type, handler) => {
    const handlers = pageHandlers.get(type) || []; handlers.push(handler); pageHandlers.set(type, handlers);
  };
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
    removeEventListener(type, fn) { this.handlers[type] = (this.handlers[type] || []).filter(handler => handler !== fn); }
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
    replaceChildren() { this.children = []; }
    replaceWith(el) { this.parentElement.appendChild(el); this.parentElement = null; }
  }
  const add = id => { const el = new Element(`${prefix}-${id}`); nodes.set(el.id, el); return el; };
  const form = add('controls'); form.elements = fields;
  for (const [name, value] of Object.entries({ instrument:'guitar', stringSetup:'guitar_6_standard', practiceType:'scale', key:'C', scale:'major', bpm:'60', bars:'2', countIn:'1', meter:'4/4', subdivision:'eighth', fretMin:'0', fretMax:'12', fretboardSystem:'position', shape:'E', sequence:'none', direction:'up', keyCycle:'none', swing:'straight', renderer:'highway_2d' })) fields[name] = new Element('', name, value);
  add('root'); add('summary'); add('status'); add('renderer-status'); add('render-host');
  add('play'); add('stop');
  add('mode-custom'); add('mode-session'); add('mode-jam'); add('mode-guided'); add('go-library'); add('jam-go'); add('launch-session');
  if (editorScenario) for (const id of ['session-info','segment-list','length-preset','breathe-toggle','workout-refresh','refresh-summary']) add(id);
  fields.customOpenMidis = add('custom-open-midis'); fields.customOpenMidis.name = 'customOpenMidis';
  const customInputs = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map(value => new Element('', '', value));
  add('file-select').value = 'chromatic-warmup'; add('file-load'); add('file-unload'); add('file-prose'); add('regenerate'); add('view-select');
  add('file-variants').hidden = true; add('file-variant').disabled = true; add('file-next').disabled = true; add('file-hint');
  for (const id of ['file-hint', 'file-prose']) Object.defineProperty(nodes.get(`${prefix}-${id}`), 'innerHTML', {set() { throw Error('File text must never use HTML'); }});
  const toggle = add('advanced-toggle'); toggle.name = 'advancedMode'; toggle.type = 'checkbox'; fields.advancedMode = toggle;
  if (scenario.startsWith('boot-') || scenario === 'ladder-credit' || scenario === 'ladder-type-exit') {
    const picker = add('pathway'); picker.name = 'pathway'; fields.pathway = picker;
    picker.options = ['custom', 'chromatic_warmup', 'pent_foundation'].map(value => new Element('', '', value));
    picker.options[0].disabled = false;
  }
  const query = selector => {
    if (selector.startsWith('optgroup')) return null;
    const name = selector.match(/\[name="([^"]+)"\]/)?.[1];
    if (name) return fields[name] || null;
    return selector.startsWith('#') ? nodes.get(selector.slice(1)) || null : null;
  };
  document.getElementById = id => nodes.get(id) || null;
  document.querySelector = query;
  document.querySelectorAll = selector => selector === `.${prefix}-custom-tuning-input` ? (nodes.get(`${prefix}-custom-tuning-inputs`)?.children || customInputs) : selector.includes(`.${prefix}-advanced-only`) ? [...advanced].map(n => fields[n]) : [];
  document.createElement = () => new Element();
  globalThis.FormData = class { constructor() {} get(name) { const el = fields[name]; return !el || el.disabled ? null : el.type === 'checkbox' ? (el.checked ? 'on' : null) : el.value; } entries() { return Object.keys(fields).map(n => [n, this.get(n)]).filter(([, v]) => v !== null)[Symbol.iterator](); } };
  const observers = [];
  globalThis.ResizeObserver = class { constructor(callback) { observers.push(callback); } observe() {} disconnect() {} };
  // No live host, layout or timer-driven boot: only explicitly dispatched actions run.
  const timers = new Map(); let timerId = 0;
  globalThis.setTimeout = (callback, delay) => { timers.set(++timerId, {callback, delay}); return timerId; };
  globalThis.clearTimeout = id => timers.delete(id);
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = () => {};
  window.location = { href:'https://host.test/', hash:'' };
  const param = () => ({ value:0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} });
  const audioNode = () => ({ gain:param(), frequency:param(), Q:param(), pan:param(), threshold:param(), knee:param(), ratio:param(), attack:param(), release:param(), connect() {}, disconnect() {}, start() {}, stop() {} });
  window.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createOscillator = audioNode; createGain = audioNode; createBiquadFilter = audioNode;
    createDynamicsCompressor = audioNode; createAnalyser = audioNode; createStereoPanner = audioNode;
  };
  window.history = { replaceState() {} };
  globalThis.history = window.history;
  globalThis.location = window.location;
  const source = readFileSync(resolve(root, 'assets/practices/guitar/beginner/chromatic-warmup.md'), 'utf8');
  const index = readFileSync(resolve(root, 'assets/practices/index.json'), 'utf8');
  let fetchGate = null, fetchFailure = false, ladderRequests = 0;
  globalThis.fetch = async url => {
    if (String(url).endsWith('chromatic-warmup-ladder.md')) {
      ladderRequests++;
      if (fetchGate) await fetchGate.promise;
      return new Response(fetchFailure || ['catalog-failure','boot-failure'].includes(scenario) ? '{}' : readFileSync(resolve(root, 'assets/practices/guitar/beginner/chromatic-warmup-ladder.md'), 'utf8'));
    }
    if (String(url).endsWith('chromatic-warmup.md')) { if (fetchGate) await fetchGate.promise; return new Response(fetchFailure ? '{}' : source); }
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
  const hostHandlers = new Map();
  if (editorScenario || scenario.startsWith('navigation-reentry') || scenario === 'ladder-navigation' || scenario.startsWith('boot-')) window.feedBack = {
    on(type, handler) { const handlers = hostHandlers.get(type) || []; handlers.push(handler); hostHandlers.set(type, handlers); },
    emit() {}
  };
  localStorage.getItem = key => key.endsWith('.renderer') ? 'highway_2d' : null;
  const lifecycle = debug.lifecycle;
  if (scenario.startsWith('boot-initial-')) {
    const store = new Map([[`${prefix}.renderer`, 'highway_2d']]);
    const saved = scenario.includes('other-saved') ? 'pent_foundation' : scenario.includes('saved') ? 'chromatic_warmup' : null;
    if (saved) store.set(`${prefix}.lastPathway`, saved);
    localStorage.getItem = key => store.get(key) || null;
    localStorage.setItem = (key, value) => store.set(key, value);
    fetchGate = deferred(); const old = fetchGate;
    boot(); await flush();
    const warmup = fields.pathway.options.find(option => option.value === 'chromatic_warmup');
    assert.equal(warmup.disabled, true);
    assert.equal(fields.pathway.value, saved || 'chromatic_warmup');
    assert.equal(store.get(`${prefix}.lastPathway`) || null, saved, 'loading never saves a fallback');
    await lifecycle.generate();
    if (!scenario.includes('other-saved')) assert.equal(lifecycle.state().activeBundle, null, 'pending lesson has no generated substitute');
    if (scenario.endsWith('user-pick')) {
      fields.pathway.value = 'pent_foundation'; await fields.pathway.dispatchEvent({type:'change', bubbles:true}); await flush();
    }
    if (scenario.endsWith('control')) {
      fields.bpm.value = '83'; await fields.bpm.dispatchEvent({type:'change', bubbles:true}); await flush();
    }
    const navigate = id => { for (const handler of hostHandlers.get('screen:changed') || []) handler({detail:{id}}); };
    if (scenario.endsWith('error-reentry')) {
      fetchFailure = true; old.resolve(); await lifecycle.initialize(); await flush();
      assert.equal(fields.pathway.value, 'custom');
      assert.equal(store.has(`${prefix}.lastPathway`), false);
      navigate('home'); fetchFailure = false; fetchGate = deferred(); navigate(`plugin-${prefix}`); await flush();
      fetchGate.resolve(); await lifecycle.initialize(); await flush();
      assert.equal(warmup.disabled, false, 'failed catalog retries on next visit');
    } else if (scenario.endsWith('reentry')) {
      navigate('home'); await flush();
      assert.equal(lifecycle.pathways.chromatic_warmup, undefined);
      assert.equal(lifecycle.state().activeBundle, null);
      fetchGate = deferred(); const retry = fetchGate;
      navigate(`plugin-${prefix}`); await flush();
      assert.equal(ladderRequests, 2);
      old.reject(Error('old request rejected after retry began')); await flush();
      assert.equal(lifecycle.pathways.chromatic_warmup, undefined);
      retry.resolve(); await lifecycle.initialize(); await flush();
      assert.equal(fields.pathway.value, 'chromatic_warmup');
      assert.equal(lifecycle.state().lastExercise.session.practicePathwayId, 'chromatic_warmup');
      const hydrated = lifecycle.pathways.chromatic_warmup;
      navigate('home'); navigate(`plugin-${prefix}`); await lifecycle.initialize(); await flush();
      assert.equal(ladderRequests, 2, 'successful hydration is reused');
      assert.equal(lifecycle.pathways.chromatic_warmup, hydrated);
    } else {
      fetchFailure = scenario.endsWith('error'); old.resolve(); await lifecycle.initialize(); await flush();
      if (fetchFailure) {
        assert.equal(fields.pathway.value, 'custom');
        assert.equal(warmup.disabled, true);
        assert.match(nodes.get(`${prefix}-status`).textContent, /unavailable/);
        assert.equal(store.get(`${prefix}.lastPathway`) || null, saved, 'failure preserves saved intent');
      } else if (scenario.endsWith('control')) {
        assert.equal(fields.pathway.value, 'custom');
        assert.equal(fields.bpm.value, '83');
        assert.equal(store.has(`${prefix}.lastPathway`), false);
      } else if (scenario.endsWith('user-pick') || scenario.includes('other-saved')) {
        assert.equal(fields.pathway.value, 'pent_foundation');
        assert.equal(store.get(`${prefix}.lastPathway`), 'pent_foundation');
        assert.equal(lifecycle.state().lastExercise.session.practicePathwayId, undefined);
      } else {
        assert.equal(fields.pathway.value, 'chromatic_warmup');
        assert.equal(store.get(`${prefix}.lastPathway`), 'chromatic_warmup');
        assert.equal(lifecycle.state().lastExercise.session.practicePathwayId, 'chromatic_warmup');
        const current = lifecycle.state().activeBundle;
        await lifecycle.initialize(); await flush();
        assert.equal(lifecycle.state().activeBundle, current, 'intended selection applies once');
      }
    }
    return;
  }
  if (scenario.startsWith('boot-')) {
    fetchGate = deferred();
    const gate = fetchGate;
    if (scenario === 'boot-failure') fetchFailure = true;
    boot(); await flush();
    assert.equal(nodes.get(`${prefix}-root`).dataset[lab ? 'virtuoso_labInit' : 'virtuosoInit'], '1');
    const count = nodes.get(`${prefix}-play`).handlers.click.length;
    assert.equal(count, 1, 'actual DOMContentLoaded boot binds while catalog is pending');
    const warmup = fields.pathway.options.find(option => option.value === 'chromatic_warmup');
    assert.equal(warmup.disabled, true);
    for (const mode of ['custom', 'session', 'jam', 'guided']) {
      await nodes.get(`${prefix}-mode-${mode}`).click(); await flush();
      assert.equal(nodes.get(`${prefix}-root`).dataset[lab ? 'virtuoso_labInit' : 'virtuosoInit'], '1');
      const rootElement = nodes.get(`${prefix}-root`);
      if (mode === 'session') assert.equal(rootElement.classList.contains(`${prefix}-session-mode`), true);
      if (mode === 'jam') assert.equal(rootElement.classList.contains(`${prefix}-jam-mode`), true);
    }
    let starts = 0;
    lifecycle.playback(() => { starts++; });
    await nodes.get(`${prefix}-mode-session`).click();
    await nodes.get(`${prefix}-launch-session`).click();
    await nodes.get(`${prefix}-mode-jam`).click();
    await nodes.get(`${prefix}-jam-go`).click();
    assert.equal(starts, 2, 'Workout and Jam can launch while catalog is stalled');
    await nodes.get(`${prefix}-mode-custom`).click();
    await lifecycle.generate();
    assert.ok(lifecycle.state().activeBundle, 'ordinary Custom generation works during stalled catalog');
    const current = lifecycle.state().activeBundle;
    if (scenario === 'boot-navigation') {
      for (const handler of hostHandlers.get('screen:changed') || []) handler({detail:{id:'home'}});
      await flush();
      assert.equal(lifecycle.state().activeBundle, null);
    }
    if (scenario === 'boot-timeout') {
      const request = [...timers.values()].find(timer => timer.delay === 10000);
      assert.ok(request, 'real boot installs bounded request deadline');
      request.callback();
    } else gate.resolve();
    fetchGate = null;
    await lifecycle.initialize(); await flush();
    assert.equal(nodes.get(`${prefix}-play`).handlers.click.length, count, 'hydration never rebinds events');
    if (scenario === 'boot-navigation') {
      assert.equal(lifecycle.pathways.chromatic_warmup, undefined, 'cancelled hydration never registers late data');
      assert.equal(lifecycle.state().activeBundle, null);
    } else if (scenario === 'boot-failure' || scenario === 'boot-timeout') {
      assert.equal(warmup.disabled, true);
      assert.match(nodes.get(`${prefix}-status`).textContent, /unavailable/);
    } else {
      assert.equal(warmup.disabled, false);
      assert.equal(lifecycle.state().activeBundle, current, 'hydration does not replace current content');
      lifecycle.applyPathway('chromatic_warmup'); await lifecycle.generate();
      assert.equal(lifecycle.state().lastExercise.session.practicePathwayId, 'chromatic_warmup');
    }
    return;
  }
  if (scenario === 'catalog-pending') {
    fetchGate = deferred();
    const pending = lifecycle.initialize();
    assert.equal(lifecycle.bind(), true, 'ordinary UI binds before metadata hydration');
    await flush();
    assert.equal(lifecycle.pathways.chromatic_warmup, undefined);
    fetchGate.resolve(); await pending; fetchGate = null;
    assert.ok(lifecycle.pathways.chromatic_warmup);
  }
  await lifecycle.initialize();
  assert.equal(lifecycle.bind(), scenario !== 'catalog-pending');
  await flush();
  const change = (name, value) => { fields[name].value = value; fields[name].dispatchEvent({ type:'change', bubbles:true }); };
  if (editorScenario) {
    const probe = globalThis[Symbol.for('workout-editor-probe')];
    const snapshot = [];
    const record = () => snapshot.push(JSON.parse(JSON.stringify({draft:probe.draft(),info:nodes.get(`${prefix}-session-info`).innerHTML,list:nodes.get(`${prefix}-segment-list`).innerHTML,summary:nodes.get(`${prefix}-refresh-summary`).innerHTML})));
    window.matchMedia = () => ({matches:true});
    probe.loadStarter('starter_arc', true); record();
    const shipped = JSON.stringify(api.BUILT_IN_SESSIONS.starter_arc);
    const list = nodes.get(`${prefix}-segment-list`);
    const action = async (act,index) => {
      const lengthBefore = probe.draft().segments.length;
      const card = new Element(); card.dataset.segIndex = String(index);
      const ctl = new Element(); ctl.dataset.act = act;
      const target = {closest:selector => selector.endsWith('segment-card') ? card : selector === '[data-act]' ? ctl : null};
      for (const handler of list.handlers.click) await handler({target});
      if (act === 'dup') assert.equal(probe.draft().segments.length,lengthBefore+1,'one click duplicates exactly once');
      if (act === 'remove') assert.equal(probe.draft().segments.length,lengthBefore-1,'one click removes exactly once');
      record();
    };
    await action('dup',0); await action('remove',1); await action('reroll',0);
    const refId = Object.keys(api.BUILT_IN_SESSIONS).find(id => api.BUILT_IN_SESSIONS[id].segments.some(seg => seg.templateId && !seg.kind));
    probe.loadStarter(refId,true); record(); await action('reroll',0);
    await nodes.get(`${prefix}-workout-refresh`).click(); record();
    const length = nodes.get(`${prefix}-length-preset`); length.value = 'quick'; await length.dispatchEvent({type:'change'}); record();
    const breathe = nodes.get(`${prefix}-breathe-toggle`); breathe.checked = false; await breathe.dispatchEvent({type:'change'}); record();
    assert.equal(JSON.stringify(api.BUILT_IN_SESSIONS.starter_arc),shipped,'editing never mutates shipped starter');
    lifecycle.playback(() => {}, () => Promise.resolve());
    await lifecycle.workout();
    snapshot.push(JSON.parse(JSON.stringify(lifecycle.state().lastExercise)));
    assert.equal(lifecycle.bind(),false,'bind never duplicates editor handlers');
    if (typeof probe.editor !== 'undefined') {
      const stale = list.handlers.click[0];
      const before = JSON.stringify(probe.draft());
      const navigate = id => {for (const handler of hostHandlers.get('screen:changed') || []) handler({detail:{id}});};
      if (scenario === 'editor-page-events') {
        const firePage = (type,event={}) => {for (const handler of pageHandlers.get(type) || []) handler(event);};
        let starts = 0;
        lifecycle.playback(() => {starts++;}, () => Promise.resolve());
        const selected = probe.editor.selectedId, draft = probe.draft();
        const dirty = probe.editor.dirty;
        const html = list.innerHTML;
        const assertRetained = () => {
          assert.equal(probe.draft(),draft); assert.equal(probe.editor.selectedId,selected);
          assert.equal(probe.editor.dirty,dirty); assert.equal(list.innerHTML,html);
          assert.equal(list.handlers.click.length,1);
          assert.equal(lifecycle.bind(),false,'page restoration never rebinds the entry');
        };
        // Another owner cancels beforeunload: this document and its UI stay alive.
        firePage('beforeunload',{defaultPrevented:true}); assertRetained();
        await action('dup',0); await action('remove',1);
        for (const event of [{persisted:true},{persisted:false},{}]) {
          firePage('pagehide',event); firePage('pageshow',event); firePage('pageshow',event);
          assertRetained(); await action('dup',0); await action('remove',1);
        }
        assert.equal(starts,0,'page events never launch or preview playback');
        assert.equal((pageHandlers.get('beforeunload') || []).length,1);
        assert.equal((pageHandlers.get('pagehide') || []).length,1,'session flushing is not double-registered');
        navigate('home');
        firePage('pagehide',{persisted:true}); firePage('pageshow',{persisted:true});
        assert.equal(list.handlers.click.length,0,'inactive restored plugin is not rebound');
        navigate(`plugin-${prefix}`); await flush();
        navigate(`plugin-${prefix}`); await flush();
        assertRetained(); await action('dup',0); await action('remove',1);
        assert.equal(starts,0,'navigation return never autoplays');
      }
      navigate('home');
      assert.equal(list.handlers.click.length,0,'navigation detaches editor DOM handlers');
      navigate(`plugin-${prefix}`); await flush();
      assert.equal(list.handlers.click.length,1,'return mounts exactly one editor handler');
      await stale({target:{closest:selector => selector.endsWith('segment-card') ? {dataset:{segIndex:'0'}} : {dataset:{act:'dup'}}}});
      assert.equal(JSON.stringify(probe.draft()),before,'old visit handler cannot edit returning draft');
    }
    return snapshot;
  }
  const load = async () => { nodes.get(`${prefix}-file-load`).click(); await flush(); assert.ok(lifecycle.state().loadedPracticeFile); };
  if (scenario === 'catalog-pending') return;
  if (scenario === 'catalog-failure') {
    assert.equal(lifecycle.pathways.chromatic_warmup, undefined);
    await lifecycle.generate();
    assert.ok(lifecycle.state().activeBundle, 'other generated lessons remain usable');
    assert.match(nodes.get(`${prefix}-status`).textContent, /Chromatic Warmup unavailable/);
    return;
  }
  if (scenario.startsWith('ladder-')) {
    const fixture = JSON.parse(readFileSync(new URL('../fixtures/chromatic-warmup-before-migration.json', import.meta.url), 'utf8'));
    assert.equal(api.nodeProgressState('chromatic_warmup', {chromatic_warmup:{highest_tier:3}}).cleared, true);
    assert.equal(api.nodeProgressState('pent_foundation', {}).prereq, 'chromatic_warmup');
    let starts = 0; lifecycle.playback(() => { starts++; });
    for (let variation = 0; variation < 6; variation++) for (let tier = 0; tier < 4; tier++) {
      lifecycle.applyPathway('chromatic_warmup', variation); lifecycle.tier(tier);
      await lifecycle.generate();
      const exercise = lifecycle.state().lastExercise;
      assert.equal(exercise.session.practicePathwayId, 'chromatic_warmup');
      const original = fixture.cases[variation * 4 + tier].exercise.chart.notes;
      assert.deepEqual(exercise.chart.notes.slice(0, original.length), original);
      assert.equal(exercise.chart.notes.length, [96,48,48,96][tier], 'existing shell run target still tiles whole passes');
      assert.equal(exercise.session.bars, [4,6,8,8][tier]);
    }
    assert.equal(starts, 0);
    if (scenario === 'ladder-views') {
      lifecycle.resolveFactory(async kind => ({factory, label:kind}));
      for (const view of ['tab_2d', 'notation_2d']) {
        await lifecycle.switchView(view);
        change('bpm', '85'); await flush();
        assert.equal(lifecycle.state().activeBundle.config.renderer, view);
        change('customOpenMidis', '38,45,50,55,59,64'); await flush();
        assert.equal(lifecycle.state().activeBundle, null);
        change('customOpenMidis', '40,45,50,55,59,64'); await flush();
        assert.equal(lifecycle.state().activeBundle.config.renderer, view);
      }
      lifecycle.resolveFactory(async kind => {
        if (kind === 'notation_2d') throw Error('notation unavailable');
        return {factory, label:kind};
      });
      await lifecycle.switchView('notation_2d');
      assert.equal(lifecycle.state().activeBundle.config.renderer, 'builtin_2d');
      change('bpm', '86'); await flush();
      assert.equal(lifecycle.state().activeBundle.config.renderer, 'builtin_2d', 'actual fallback survives regeneration');
      lifecycle.resolveFactory(async () => ({factory, label:'2D Highway (fallback)', kind:'builtin_2d'}));
      await lifecycle.switchView('highway_3d');
      change('bpm', '87'); await flush();
      assert.equal(lifecycle.state().activeBundle.config.renderer, 'builtin_2d', 'resolver fallback also survives regeneration');
    }
    if (scenario === 'ladder-credit' || scenario === 'ladder-type-exit') {
      const store = new Map();
      localStorage.getItem = key => store.get(key) || null;
      localStorage.setItem = (key, value) => store.set(key, value);
      if (scenario === 'ladder-credit') {
        for (let tier = 0; tier < 4; tier++) {
          lifecycle.applyPathway('chromatic_warmup'); lifecycle.tier(tier); await lifecycle.generate();
          lifecycle.sessionBegin();
          assert.equal(lifecycle.session().bpm_tier, tier);
          assert.equal(lifecycle.session().pathway_id, 'chromatic_warmup');
        }
        lifecycle.tier(0); change('bpm', '90'); await flush();
        lifecycle.sessionBegin(); const quarter = structuredClone(lifecycle.session());
        assert.equal(quarter.bpm_tier, 0, 'quarter at 90 is capped to selected density tier');
        fields.pathway.value = 'pent_foundation';
        const earned = lifecycle.advanceTier(quarter);
        assert.equal(earned.tier, 0);
        assert.equal(api.nodeProgressState('chromatic_warmup', JSON.parse(store.get(`${prefix}.pathway_tiers`))).cleared, false);
        lifecycle.tier(3); await lifecycle.generate(); lifecycle.sessionBegin();
        const eighth = structuredClone(lifecycle.session());
        assert.equal(eighth.bpm_tier, 3);
        lifecycle.applyPathway('pent_foundation');
        assert.equal(lifecycle.advanceTier(eighth).tier, 3, 'run-bound identity survives subsequent selection');
      } else {
        change('practiceType', 'scale'); await flush();
        assert.equal(fields.pathway.value, 'custom');
        lifecycle.sessionBegin();
        assert.equal(lifecycle.session().mode, 'custom');
        assert.equal(lifecycle.session().pathway_id, null);
        fields.pathway.value = 'chromatic_warmup';
        lifecycle.advanceTier(lifecycle.session());
        assert.equal(JSON.parse(store.get(`${prefix}.pathway_tiers`) || '{}').chromatic_warmup, undefined);
      }
    }
    if (scenario === 'ladder-tuning') {
      change('customOpenMidis', '38,45,50,55,59,64'); await flush();
      assert.equal(lifecycle.state().activeBundle, null);
      lifecycle.applyPathway('chromatic_warmup', 1);
      assert.equal(fields.customOpenMidis.value, '38,45,50,55,59,64', 'selection never retunes');
      await lifecycle.generate();
      assert.equal(lifecycle.state().activeBundle, null);
      change('customOpenMidis', '40,45,50,55,59,64'); await flush();
      assert.ok(lifecycle.state().activeBundle, 'compatible Setup recovers without Play');
    }
    if (scenario === 'ladder-race') {
      ready = deferred(); const gate = ready;
      const pending = lifecycle.generate(); await flush();
      lifecycle.tier(0); ready = null;
      await lifecycle.generate(); const tierBundle = lifecycle.state().activeBundle;
      gate.resolve(); await pending;
      assert.equal(lifecycle.state().activeBundle, tierBundle, 'late higher-tier readiness cannot reclaim a newer tier');
      ready = deferred(); const abandoned = ready;
      const old = lifecycle.generate(); await flush();
      lifecycle.applyPathway('pent_foundation'); ready = null;
      await lifecycle.generate(); const current = lifecycle.state().activeBundle;
      abandoned.resolve(); await old;
      assert.equal(lifecycle.state().activeBundle, current);
      assert.equal(current.config.practiceFile, undefined);
      assert.equal(starts, 0);
    }
    if (scenario === 'ladder-navigation') {
      ready = deferred(); const gate = ready;
      const pending = lifecycle.generate(); await flush();
      for (const handler of hostHandlers.get('screen:changed') || []) handler({detail:{id:'home'}});
      gate.resolve(); await pending;
      assert.equal(lifecycle.state().activeBundle, null);
      assert.equal(starts, 0, 'abandoned Ladder readiness never starts playback');
    }
    return;
  }
  if (scenario.startsWith('navigation-reentry')) {
    const screen = id => { for (const handler of hostHandlers.get('screen:changed') || []) handler({detail:{id}}); };
    let starts = 0;
    lifecycle.playback(() => { starts++; });
    // Fire the real once-only layout callback before exercising repeat visits.
    observers.at(-1)([{contentRect:{width:800, height:500}}]); await flush();
    assert.ok(lifecycle.state().activeBundle);
    screen(`plugin-${prefix}`); await flush();
    await load();
    screen('home'); await flush();
    assert.equal(lifecycle.state().activeBundle, null);
    assert.equal(lifecycle.state().loadedPracticeFile, null);
    ready = scenario.endsWith('stale') ? deferred() : null;
    const gate = ready;
    const before = instances.length;
    screen(`plugin-${prefix}`); screen(`plugin-${prefix}`); await flush();
    assert.equal(instances.length, before + 1, 'one generation per visit, even repeated show events');
    assert.equal(lifecycle.state().activeBundle.config.practiceFile, undefined);
    if (gate) {
      const abandoned = instances.at(-1);
      screen('home'); ready = null;
      screen(`plugin-${prefix}`); await flush();
      const current = lifecycle.state().activeBundle;
      api.setSegmentLoop(0.1, 0.5);
      gate.reject(Error('abandoned reentry readiness')); await flush();
      assert.equal(abandoned.destroys, 1);
      assert.equal(lifecycle.state().activeBundle, current);
      assert.deepEqual(api.getSegmentLoop(), {a:0.1, b:0.5});
    } else {
      assert.ok(lifecycle.state().renderer);
      assert.match(nodes.get(`${prefix}-status`).textContent, /^Ready/);
      screen('home'); screen(`plugin-${prefix}`); await flush();
      assert.equal(instances.length, before + 2);
      assert.ok(lifecycle.state().renderer);
      assert.equal(lifecycle.state().currentPracticeTime, 0);
    }
    assert.equal(starts, 0);
    assert.equal(lifecycle.bind(), false);
  } else if (scenario.startsWith('variant-')) {
    const select = nodes.get(`${prefix}-file-variant`), next = nodes.get(`${prefix}-file-next`);
    const selectVariant = id => { select.value = id; return select.dispatchEvent({type:'change'}); };
    const assertVariant = id => {
      assert.equal(lifecycle.state().activeBundle.config.practiceFileVariantId, id);
      assert.equal(select.value, id);
      assert.equal(lifecycle.state().activeBundle.config.bpm, 120);
      assert.equal(fields.countIn.value, '1');
    };
    if (scenario === 'variant-load-failure') {
      fetchFailure = true;
      await nodes.get(`${prefix}-file-load`).click(); await flush();
      assert.equal(lifecycle.state().activeBundle, null);
      assert.equal(lifecycle.state().loadedPracticeFile, null);
      assert.equal(select.disabled, true);
      assert.equal(nodes.get(`${prefix}-file-hint`).textContent, '');
      return;
    }
    if (scenario === 'variant-navigation') {
      fetchGate = deferred();
      const pending = nodes.get(`${prefix}-file-load`).click(); await flush();
      nodes.get(`${prefix}-go-library`).click(); await flush();
      fetchGate.resolve(); await pending;
      assert.equal(lifecycle.state().loadedPracticeFile, null);
      assert.equal(lifecycle.state().activeBundle, null);
      fetchGate = null;
      await load(); await selectVariant('fifth-position');
      nodes.get(`${prefix}-go-library`).click(); await flush();
      assert.equal(lifecycle.state().loadedPracticeFile, null);
      assert.equal(lifecycle.state().activeBundle, null);
      assert.equal(select.disabled, true);
      assert.equal(nodes.get(`${prefix}-file-variants`).hidden, true);
      assert.equal(nodes.get(`${prefix}-file-hint`).textContent, '');
      return;
    }
    await load(); change('bpm', '120'); await flush();
    assert.deepEqual(select.children.map(el => el.value), ['first-position', 'fifth-position']);
    if (scenario === 'variant-playing') {
      // Run the real Play/Stop state transitions; no audio device or detector.
      lifecycle.state().activeBundle.config.audio.notes = false;
      await nodes.get(`${prefix}-play`).click(); await flush();
      assert.match(nodes.get(`${prefix}-status`).textContent, /Playing/);
      const old = instances.at(-1);
      api.setSegmentLoop(0.2, 0.7);
      await selectVariant('fifth-position'); await flush();
      assert.equal(old.destroys, 1); assertVariant('fifth-position');
      assert.equal(lifecycle.state().currentPracticeTime, 0);
      assert.deepEqual(api.getSegmentLoop(), {a:null, b:null});
      assert.match(nodes.get(`${prefix}-status`).textContent, /^Ready/);
      lifecycle.state().activeBundle.config.audio.notes = false;
      await nodes.get(`${prefix}-play`).click(); await flush();
      await next.click(); await flush(); assertVariant('first-position');
      assert.match(nodes.get(`${prefix}-status`).textContent, /^Ready/);
      await next.click(); await flush(); assertVariant('fifth-position');
    } else if (scenario === 'variant-recovery') {
      api.setSegmentLoop(0.2, 0.7);
      change('stringSetup', 'bass_4_standard'); await flush();
      api.setSegmentLoop(0.2, 0.7);
      const pending = selectVariant('fifth-position');
      assert.deepEqual(api.getSegmentLoop(), {a:null, b:null});
      assert.equal(lifecycle.state().currentPracticeTime, 0);
      await pending; await flush();
      assert.equal(lifecycle.state().activeBundle, null);
      assert.equal(select.value, 'fifth-position'); assert.equal(select.disabled, false);
      assert.match(nodes.get(`${prefix}-status`).textContent, /standard/);
      change('stringSetup', 'guitar_6_standard'); await flush(); assertVariant('fifth-position');
      assert.match(nodes.get(`${prefix}-status`).textContent, /^Ready/);
    } else if (scenario === 'variant-ready-failure') {
      api.setSegmentLoop(0.2, 0.7);
      ready = deferred(); const gate = ready;
      const pending = selectVariant('fifth-position');
      assert.deepEqual(api.getSegmentLoop(), {a:null, b:null});
      assert.equal(lifecycle.state().currentPracticeTime, 0);
      await flush();
      gate.reject(Error('variant readiness failure')); await pending;
      assert.equal(lifecycle.state().activeBundle, null);
      assert.deepEqual(api.getSegmentLoop(), {a:null, b:null});
      assert.equal(lifecycle.state().currentPracticeTime, 0);
      assert.equal(select.value, 'fifth-position');
      ready = null;
      change('bpm', '120'); await flush(); assertVariant('fifth-position');
    } else {
      api.setSegmentLoop(0.2, 0.7);
      ready = deferred(); const gate = ready;
      const pending = selectVariant('fifth-position');
      assert.deepEqual(api.getSegmentLoop(), {a:null, b:null});
      assert.equal(lifecycle.state().currentPracticeTime, 0);
      await flush(); const stale = instances.at(-1);
      ready = null;
      await selectVariant('first-position'); await flush();
      const current = lifecycle.state().activeBundle;
      api.setSegmentLoop(0.1, 0.5);
      if (scenario.endsWith('reject')) gate.reject(Error('stale variant failure')); else gate.resolve();
      await pending;
      assert.equal(stale.destroys, 1); assert.equal(lifecycle.state().activeBundle, current);
      assert.deepEqual(api.getSegmentLoop(), {a:0.1, b:0.5});
      assert.equal(lifecycle.state().currentPracticeTime, 0.1);
      assertVariant('first-position');
      assert.equal(nodes.get(`${prefix}-file-hint`).textContent, lifecycle.state().loadedPracticeFile.variants[0].hint);
      assert.match(nodes.get(`${prefix}-status`).textContent, /^Ready/);
    }
    nodes.get(`${prefix}-file-unload`).click(); await flush();
    assert.equal(select.disabled, true); assert.equal(next.disabled, true); assert.equal(select.children.length, 0);
    assert.equal(nodes.get(`${prefix}-file-variants`).hidden, true);
    assert.equal(nodes.get(`${prefix}-file-hint`).textContent, ''); assert.equal(fields.key.disabled, false);
  } else if (scenario.startsWith('jam-') || scenario.startsWith('workout-')) {
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
      assert.equal(nodes.get(`${prefix}-file-variant`).disabled, true);
      assert.equal(nodes.get(`${prefix}-file-hint`).textContent, '');
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
    assert.equal(nodes.get(`${prefix}-file-variants`).hidden, true);
    assert.equal(nodes.get(`${prefix}-file-variant`).disabled, true);
    assert.equal(nodes.get(`${prefix}-file-hint`).textContent, '');
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
