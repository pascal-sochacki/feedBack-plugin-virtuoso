// SPDX-License-Identifier: AGPL-3.0-only
import { parsePracticeMarkdown, validatePracticeIndex } from '../core/practice-files.js';

export function createPracticeFileLoader(baseURL, fetchFile = fetch) {
  const base = new URL(baseURL);
  const cache = new Map();
  async function read(path, signal) {
    const url = new URL(path, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error('Unsafe practice URL');
    const response = await fetchFile(url.href, { signal, redirect:'error', cache:'no-cache' });
    if (!response.ok) throw new Error(`Practice file unavailable (${response.status})`);
    if (Number(response.headers.get('content-length')) > 65536) throw new Error('Practice source is too large');
    const text = await response.text();
    if (text.length > 65536) throw new Error('Practice source is too large');
    return text;
  }
  return async function load(id, signal) {
    if (cache.has(id)) return cache.get(id);
    const index = validatePracticeIndex(JSON.parse(await read('index.json', signal)));
    const item = index.find(item => item.id === id);
    if (!item) throw new Error('Unknown practice id');
    const practice = parsePracticeMarkdown(await read(item.path, signal));
    if (practice.id !== item.id || practice.title !== item.title) throw new Error('Practice metadata does not match its index');
    if (signal?.aborted) throw new Error('Practice load cancelled');
    cache.set(id, practice);
    return practice;
  };
}

// Prose is deliberately plain text: HTML, links and Markdown never execute.
export function displayPracticeProse(element, practice) {
  element.textContent = practice ? `${practice.title}\nReference tempo: ${practice.referenceTempo} BPM · ${practice.meter} · guitar standard six-string\n\n${practice.prose}` : '';
}
