// SPDX-License-Identifier: AGPL-3.0-only
import { parsePracticeMarkdown, validatePracticeIndex } from '../core/practice-files.js';

/** @param {string | URL} baseURL @param {typeof fetch} [fetchFile] @param {number} [timeoutMs] */
export function createPracticeFileLoader(baseURL, fetchFile = fetch, timeoutMs = 10000) {
  const base = new URL(baseURL);
  /** @type {Map<string, import('../core/practice-files.js').Practice>} */
  const cache = new Map();
  /** @type {ReturnType<typeof validatePracticeIndex> | null} */
  let catalog = null;
  /** @param {string} path @param {AbortSignal | undefined} signal */
  async function read(path, signal) {
    const url = new URL(path, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error('Unsafe practice URL');
    const controller = new AbortController();
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timer;
    /** @type {() => void} */
    let cancel = () => {};
    const cancelled = new Promise((_, reject) => {
      cancel = () => { controller.abort(); reject(new Error('Practice load cancelled')); };
      signal?.addEventListener('abort', cancel, { once:true });
      timer = setTimeout(() => { controller.abort(); reject(new Error('Practice request timed out')); }, timeoutMs);
      if (signal?.aborted) cancel();
    });
    try {
      // Bound the body read too, even if a host/fetch shim ignores abort.
      return await Promise.race([cancelled, (async () => {
        const response = await fetchFile(url.href, { signal:controller.signal, redirect:'error', cache:'no-cache' });
        if (!response.ok) throw new Error(`Practice file unavailable (${response.status})`);
        if (Number(response.headers.get('content-length')) > 65536) throw new Error('Practice source is too large');
        const text = await response.text();
        if (text.length > 65536 || new TextEncoder().encode(text).length > 65536) throw new Error('Practice source is too large');
        return text;
      })()]);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
    }
  }
  /** @param {AbortSignal} [signal] */
  async function index(signal) {
    if (catalog) return catalog;
    const parsed = validatePracticeIndex(JSON.parse(await read('index.json', signal)));
    if (signal?.aborted) throw new Error('Practice load cancelled');
    catalog = parsed;
    return catalog;
  }
  /** @param {string | undefined} id @param {AbortSignal} [signal] */
  async function load(id, signal) {
    // Missing UI selection still resolves the index before rejecting, preserving
    // the loader's original IO/error ordering during partial-DOM startup.
    const cached = id === undefined ? undefined : cache.get(id);
    if (cached) return cached;
    const entries = await index(signal);
    const item = entries.find(item => item.id === id);
    if (!item) throw new Error('Unknown practice id');
    const practice = parsePracticeMarkdown(await read(item.path, signal));
    if (practice.id !== item.id || practice.title !== item.title) throw new Error('Practice metadata does not match its index');
    if ((item.use === 'pathway') !== !!practice.pathway) throw new Error('Practice capability does not match its index');
    if (signal?.aborted) throw new Error('Practice load cancelled');
    cache.set(item.id, practice);
    return practice;
  }
  load.index = index;
  return load;
}
