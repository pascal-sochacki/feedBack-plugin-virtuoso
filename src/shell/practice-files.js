// SPDX-License-Identifier: AGPL-3.0-only
import { parsePracticeMarkdown, validatePracticeIndex } from '../core/practice-files.js';

export function createPracticeFileLoader(baseURL, fetchFile = fetch, timeoutMs = 10000) {
  const base = new URL(baseURL);
  const cache = new Map();
  let catalog = null;
  async function read(path, signal) {
    const url = new URL(path, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error('Unsafe practice URL');
    const controller = new AbortController();
    let timer, cancel;
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
  async function index(signal) {
    if (catalog) return catalog;
    const parsed = validatePracticeIndex(JSON.parse(await read('index.json', signal)));
    if (signal?.aborted) throw new Error('Practice load cancelled');
    catalog = parsed;
    return catalog;
  }
  async function load(id, signal) {
    if (cache.has(id)) return cache.get(id);
    const entries = await index(signal);
    const item = entries.find(item => item.id === id);
    if (!item) throw new Error('Unknown practice id');
    const practice = parsePracticeMarkdown(await read(item.path, signal));
    if (practice.id !== item.id || practice.title !== item.title) throw new Error('Practice metadata does not match its index');
    if ((item.use === 'pathway') !== !!practice.pathway) throw new Error('Practice capability does not match its index');
    if (signal?.aborted) throw new Error('Practice load cancelled');
    cache.set(id, practice);
    return practice;
  }
  load.index = index;
  return load;
}

// Prose is deliberately plain text: HTML, links and Markdown never execute.
export function displayPracticeProse(element, practice) {
  element.textContent = practice ? `${practice.title}\nReference tempo: ${practice.referenceTempo} BPM · ${practice.meter} · guitar standard six-string\n\n${practice.prose}` : '';
}
