import { selectRendererFactory } from './renderers/selection.js';

/**
 * @typedef {import('./renderers/renderer-types.js').Renderer} Renderer
 * @typedef {import('./renderers/renderer-types.js').RenderBundle} RenderBundle
 * @typedef {import('./renderers/renderer-types.js').RendererSelection} RendererSelection
 * @typedef {import('../core/generation-types.js').GenerationConfig & {renderer?: string, stringCount?: number}} RendererConfig
 * @typedef {import('../types/entry-data.js').EntryExercise} Exercise
 * @typedef {Object} LifecycleDependencies
 * @property {import('./renderers/renderer-types.js').RendererFactory} makeHighway
 * @property {import('./renderers/renderer-types.js').RendererFactory} makeTab
 * @property {import('./renderers/renderer-types.js').RendererFactory} makeNotation
 * @property {() => void} onBeforeAttach
 * @property {(exercise: Exercise, config: RendererConfig) => RenderBundle & {config: RendererConfig}} prepareScene
 * @property {(label: string) => void} onRendererCommitted
 * @property {() => void} onLayoutChanged
 * @property {() => boolean} isPlaying
 * @property {() => void} onWindowResized
 */

/** @param {LifecycleDependencies} dependencies */
export function createRendererLifecycle(dependencies) {
  /** @type {Renderer | null} */
  let renderer = null;
  /** @type {RenderBundle | null} */
  let bundle = null;
  /** @type {HTMLCanvasElement | null} */
  let canvas = null;
  let request = 0, desiredView = '', actualView = '';
  const destroyed = new WeakSet();
  /** @type {((kind: string) => Promise<RendererSelection>) | null} */
  let factoryProbe = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let resizeTimer = null;
  /** @type {number | null} */
  let layoutFrame = null;
  let mounted = false;
  /** @type {Promise<boolean> | null} */
  let pendingAttachment = null;

  const element = (/** @type {string} */ id) => document.getElementById(id);
  const currentRequest = () => request;
  const isCurrentRequest = (/** @type {number | undefined} */ identity) => identity === request;
  const invalidate = () => ++request;

  /** @param {Renderer | null} instance */
  function destroy(instance) {
    if (!instance || (typeof instance !== 'object' && typeof instance !== 'function') || destroyed.has(instance)) return;
    destroyed.add(instance);
    try { instance.destroy?.(); } catch (error) { console.warn('[Virtuoso] renderer destroy failed', error); }
  }

  function cancelLayout() {
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    if (layoutFrame !== null) cancelAnimationFrame(layoutFrame);
    resizeTimer = null; layoutFrame = null;
  }

  function reset() {
    invalidate(); cancelLayout();
    const old = renderer;
    renderer = null; bundle = null; canvas = null; pendingAttachment = null;
    destroy(old);
  }

  /** @param {string} kind */
  async function resolveFactory(kind) {
    if (factoryProbe) return factoryProbe(kind);
    return selectRendererFactory(kind, dependencies.makeHighway, dependencies.makeTab, dependencies.makeNotation);
  }

  /** @param {string} kind */
  function syncView(kind) {
    const select = /** @type {HTMLSelectElement | null} */ (element('virtuoso_lab-view-select'));
    if (select && select.value !== kind) select.value = kind;
    const root = element('virtuoso_lab-root');
    if (root) {
      root.classList.toggle('virtuoso_lab-theme-renderer', kind === 'tab_2d' || kind === 'notation_2d');
      root.classList.toggle('virtuoso_lab-fb-capable', ['highway_3d', 'highway_2d', 'builtin_2d', 'tab_2d', 'notation_2d'].includes(kind));
      root.classList.toggle('virtuoso_lab-hud-title-on', kind === 'highway_3d');
    }
    element('virtuoso_lab-handmarks-toggle-wrap')?.classList.toggle('virtuoso_lab_vir-offview', kind === 'highway_3d');
  }

  /** @param {string} kind */
  function selectView(kind) {
    desiredView = kind; syncView(kind);
    localStorage.setItem('virtuoso_lab.renderer', kind);
    const preference = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="renderer"]'));
    if (preference && preference.value !== kind) preference.value = kind;
  }

  function replaceCanvas() {
    const host = element('virtuoso_lab-render-host'), old = element('virtuoso_lab-canvas');
    const next = document.createElement('canvas');
    next.id = 'virtuoso_lab-canvas'; next.style.width = '100%'; next.style.height = '100%';
    if (old && old.parentElement) old.replaceWith(next); else if (host) host.appendChild(next);
    const rect = (host || next).getBoundingClientRect();
    next.width = Math.max(640, Math.round(rect.width || 1280));
    next.height = Math.max(420, Math.round(rect.height || 720));
    return next;
  }

  /** @param {Exercise} exercise @param {boolean} preserveIntent @returns {Promise<boolean>} */
  async function attachCandidate(exercise, preserveIntent) {
    const config = { ...exercise.session };
    if (!config.renderer || config.renderer === 'highway_3d') {
      const saved = localStorage.getItem('virtuoso_lab.renderer');
      if (saved) config.renderer = saved;
    }
    if (!preserveIntent) desiredView = config.renderer || '';
    if (config.renderer === 'highway_3d' && (config.stringCount || 6) > 8) config.renderer = 'builtin_2d';
    exercise.session.renderer = config.renderer;
    syncView(config.renderer || '');
    dependencies.onBeforeAttach();
    reset();
    const activeBundle = dependencies.prepareScene(exercise, config);
    setBundle(activeBundle, config.renderer || '');
    const identity = request;
    /** @type {Renderer | null} */
    let candidate = null;
    try {
      // Canvas replacement must follow resolution: a late borrowed factory must
      // never detach or initialize the canvas belonging to a newer request.
      const resolved = await resolveFactory(config.renderer || '');
      if (!isCurrentRequest(identity)) return false;
      if (resolved.kind && resolved.kind !== config.renderer) {
        config.renderer = resolved.kind;
        exercise.session.renderer = resolved.kind;
        if (activeBundle.config) activeBundle.config.renderer = resolved.kind;
        // Retain the existing fallback preference policy, separately from intent.
        const preference = /** @type {HTMLSelectElement | null} */ (document.querySelector('[name="renderer"]'));
        if (preference) preference.value = resolved.kind;
        localStorage.setItem('virtuoso_lab.renderer', resolved.kind);
        syncView(resolved.kind);
      }
      canvas = replaceCanvas();
      candidate = resolved.factory();
      renderer = candidate;
      // Observe borrowed readiness before any other capability getter/validation
      // can throw. Promise assimilation also observes a throwing then getter.
      let ready = observeReady(candidate);
      if (!candidate || typeof candidate.draw !== 'function') throw new Error('Selected renderer did not return a FeedBack-compatible renderer object.');
      try {
        if (typeof candidate.init === 'function') candidate.init(canvas, bundle || undefined);
      } finally {
        // Some borrowed factories create readiness in init instead of factory
        // construction, including when init itself exits by throwing.
        ready = observeReady(candidate);
      }
      if (ready) await ready;
      if (!isCurrentRequest(identity) || renderer !== candidate) { destroy(candidate); return false; }
      actualView = config.renderer || '';
      if (actualView === 'notation_2d') candidate.setMode?.('notation');
      const rect = (canvas.parentElement || element('virtuoso_lab-render-host'))?.getBoundingClientRect() || {width:canvas.width, height:canvas.height};
      if (typeof candidate.resize === 'function') candidate.resize(Math.round(rect.width || canvas.width), Math.round(rect.height || canvas.height));
      dependencies.onRendererCommitted(resolved.label);
      return true;
    } catch (error) {
      destroy(candidate);
      if (!isCurrentRequest(identity)) return false;
      if (renderer === candidate) renderer = null;
      throw error;
    }
  }

  /** @param {Renderer | null} candidate */
  function observeReady(candidate) {
    const ready = candidate?.readyPromise;
    if (!ready) return null;
    const pending = Promise.resolve(ready);
    pending.catch(() => {});
    return pending;
  }

  /** @param {Exercise} exercise @param {boolean} [preserveIntent] @returns {Promise<boolean>} */
  function attach(exercise, preserveIntent = false) {
    // Even a preference/scene preparation failure is a new intent: invalidate
    // pending playback without disposing the still visible previous renderer.
    invalidate();
    pendingAttachment = attachCandidate(exercise, preserveIntent);
    return pendingAttachment;
  }

  async function waitUntilReady() {
    const identity = request, pending = pendingAttachment;
    try {
      if (pending && !await pending) return false;
      return isCurrentRequest(identity) && renderer !== null;
    } catch (error) {
      if (!isCurrentRequest(identity)) return false;
      throw error;
    }
  }

  /** @param {RenderBundle} activeBundle @param {string} kind */
  function setBundle(activeBundle, kind) {
    // Only the borrowed highway gets the chord-free view; grading and audio
    // always retain the complete active bundle owned by the player.
    bundle = kind === 'highway_3d'
      ? Object.assign({}, activeBundle, {chords:[], chordTemplates:[], bgReactive:false})
      : activeBundle;
  }

  /** @param {boolean} [fitHost] */
  function resize(fitHost = true) {
    if (!renderer || typeof renderer.resize !== 'function') return;
    if (!fitHost) { renderer.resize(); return; }
    const host = element('virtuoso_lab-render-host');
    if (host) { const rect = host.getBoundingClientRect(); renderer.resize(Math.round(rect.width), Math.round(rect.height)); }
  }

  /** @param {number} ms */
  function refitDuring(ms) {
    if (layoutFrame !== null) cancelAnimationFrame(layoutFrame);
    const identity = request, start = performance.now();
    const step = () => {
      layoutFrame = null;
      if (!isCurrentRequest(identity)) return;
      resize(); dependencies.onLayoutChanged();
      if (performance.now() - start < (ms || 0)) layoutFrame = requestAnimationFrame(step);
    };
    step();
  }

  function refitNextFrame() {
    if (layoutFrame !== null) cancelAnimationFrame(layoutFrame);
    const identity = request;
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = null;
      if (!isCurrentRequest(identity)) return;
      resize(); dependencies.onLayoutChanged();
    });
  }

  function onResize() {
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    const identity = request;
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
      if (!isCurrentRequest(identity)) return;
      if (renderer && bundle && !dependencies.isPlaying()) { try { resize(false); } catch (_) {} dependencies.onLayoutChanged(); }
      dependencies.onWindowResized();
    }, 120);
  }

  function mount() {
    if (mounted) return;
    mounted = true; window.addEventListener('resize', onResize);
  }
  function unmount() {
    if (mounted) window.removeEventListener('resize', onResize);
    mounted = false; reset();
  }

  return {
    attach, reset, mount, unmount, resolveFactory, syncView, selectView, setBundle,
    resize, refitDuring, refitNextFrame, waitUntilReady, currentRequest, isCurrentRequest, invalidate,
    /** @param {((kind: string) => Promise<RendererSelection>) | null} probe */
    setFactoryProbe(probe) { factoryProbe = probe; },
    get renderer() { return renderer; }, get bundle() { return bundle; },
    get desiredView() { return desiredView; }, get actualView() { return actualView; }
  };
}
