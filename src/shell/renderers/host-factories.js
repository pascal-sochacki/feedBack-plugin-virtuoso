// Host globals are deliberately read at call time: plugins publish late and can
// replace their factories without reloading this native module.
/** @returns {import('../../types/host-interfaces.js').HostBus | null} */
export function hostBus() { return hostGlobals().feedBack || hostGlobals().slopsmith || null; }
/** @returns {import('../../types/host-interfaces.js').HostMinigames | null} */
export function hostMinigames() { return hostGlobals().feedBackMinigames || hostGlobals().slopsmithMinigames || null; }
/** @returns {import('../../types/host-interfaces.js').HostDesktop | null} */
export function hostDesktop() { return hostGlobals().feedBackDesktop || hostGlobals().slopsmithDesktop || null; }

/** @returns {Window & Record<string, unknown>} */
function hostGlobals() { return /** @type {Window & Record<string, unknown>} */ (/** @type {unknown} */ (window)); }

/** @param {string} id @param {string} src @returns {Promise<void>} */
export function loadScriptOnce(id, src) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement('script');
    s.id = id; s.src = src;
    s.onload = () => resolve();
    s.onerror = () => { try { s.remove(); } catch (_) {} reject(new Error(`Failed to load ${src}`)); };
    document.head.appendChild(s);
  });
}

/** @param {string} vizId @returns {import('./renderer-types.js').RendererFactory | null} */
export function vizFactoryFor(vizId) {
  const a = 'feedBackViz_' + vizId, b = 'slopsmithViz_' + vizId;
  const host = hostGlobals();
  return /** @type {import('./renderer-types.js').RendererFactory | null} */ (
    (typeof host[a] === 'function' && host[a]) || (typeof host[b] === 'function' && host[b]) || null
  );
}

/** @param {string} vizId @param {string} scriptPath */
export async function borrowHostViz(vizId, scriptPath) {
  let f = vizFactoryFor(vizId);
  if (typeof f === 'function') return f;
  let loaded = true;
  // A missing optional host plugin is legitimate absence, not contract drift.
  try { await loadScriptOnce('virtuoso_lab-viz-' + vizId, scriptPath); }
  catch (_) { loaded = false; }
  if (loaded) {
    // Publication can follow onload; keep the existing bounded polling policy.
    const start = Date.now();
    while (typeof vizFactoryFor(vizId) !== 'function' && Date.now() - start < 3000) {
      await new Promise(r => setTimeout(r, 50));
    }
    f = vizFactoryFor(vizId);
    if (typeof f !== 'function') {
      try { console.error('[Virtuoso host-viz] ' + scriptPath + ' loaded but no viz factory registered (feedBackViz_' + vizId + ' / slopsmithViz_' + vizId + ') — host viz contract drift?'); } catch (_) {}
    }
  }
  f = vizFactoryFor(vizId);
  return typeof f === 'function' ? f : null;
}
