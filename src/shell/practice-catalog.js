// SPDX-License-Identifier: AGPL-3.0-only
import { practicePathwayEntry } from '../core/practice-files.js';

/** @typedef {import('../core/practice-files.js').Practice} Practice */
/** @typedef {{id: string, title: string, path: string, use: string}} CatalogItem */
/** @typedef {{settled: boolean, entries: CatalogItem[], error: unknown}} CatalogState */
/** @typedef {ReturnType<typeof practicePathwayEntry> & {practiceFile: Practice}} CatalogPathway */

// Only file-backed controls depend on this owner; normal UI never waits for IO.
/** @param {ReturnType<import('./practice-files.js').createPracticeFileLoader>} load @param {Record<string, {practiceFile?: Practice}>} pathways @param {{guitar: Record<string, string>}} formCues @param {(state: CatalogState) => void} [changed] */
export function createPracticeCatalog(load, pathways, formCues, changed = () => {}) {
  /** @type {Promise<CatalogState> | null} */
  let pending = null;
  /** @type {CatalogState} */
  const state = { settled:false, entries:[], error:null };
  /** @type {AbortController | null} */
  let controller = null;
  function initialize() {
    if (state.settled && !state.error) return Promise.resolve(state);
    if (pending) return pending;
    const request = new AbortController();
    controller = request;
    state.settled = false;
    state.error = null;
    pending = Promise.resolve().then(async () => {
      if (controller !== request) return state;
      try {
        const entries = await load.index(request.signal);
        if (controller !== request) return state;
        state.entries = entries;
        changed(state);
        /** @type {Record<string, CatalogPathway>} */
        const additions = {};
        for (const item of state.entries.filter(item => item.use === 'pathway')) {
          const entry = practicePathwayEntry(await load(item.id, request.signal));
          if (controller !== request) return state;
          if (entry.formCues.some((/** @type {string} */ id) => !Object.hasOwn(formCues.guitar, id))) throw new Error('Unknown pathway form cue');
          if (Object.hasOwn(pathways, item.id)) throw new Error('Duplicate pathway catalog identity');
          freezeSnapshot(entry.practiceFile);
          additions[item.id] = entry;
        }
        Object.assign(pathways, additions);
      } catch (error) {
        if (controller !== request) return state;
        state.error = error;
      } finally {
        if (controller === request) {
          pending = null;
          controller = null;
          state.settled = true;
          changed(state);
        }
      }
      return state;
    });
    return pending;
  }
  return { state, initialize, cancel:() => {
    const request = controller;
    controller = null;
    pending = null;
    request?.abort();
  } };
}

/** @param {unknown} value */
function freezeSnapshot(value) {
  if (!value || typeof value !== 'object') return;
  Object.values(value).forEach(freezeSnapshot);
  Object.freeze(value);
}

// Internal catalog snapshots are validated once and immutable. Public cfg still
// passes through the strict core validator on every generateExercise call.
/** @param {{practiceFile: Practice}} entry @param {number} variationIndex @param {number} tierIndex */
export function catalogPathwaySelection(entry, variationIndex, tierIndex) {
  const practice = entry.practiceFile, pathway = practice.pathway;
  if (!pathway) throw new Error('Missing pathway metadata');
  const variation = pathway.variations[variationIndex], tier = pathway.tiers[tierIndex];
  if (!variation || !tier) throw new Error('Unknown pathway variation or tier');
  return { ...pathway.base, ...variation.config, ...tier, practiceFile:practice,
    practiceVariantId:variation.charts[tierIndex], practicePathwayId:practice.id,
    practicePathwayVariationId:variation.id, practicePathwayTierIndex:tierIndex };
}

/** @param {{practiceFile: Practice}} entry @param {number} variationIndex @param {number} tierIndex @param {ReturnType<import('./practice-config.js').readConfig>} preferences */
export function catalogPathwayConfig(entry, variationIndex, tierIndex, preferences) {
  const selected = catalogPathwaySelection(entry, variationIndex, tierIndex);
  return { ...preferences, ...selected, bpm:preferences.bpm, renderer:preferences.renderer,
    instrument:preferences.instrument, stringSetup:preferences.stringSetup, stringCount:preferences.stringCount };
}

/** @param {CatalogState | undefined} state @param {Record<string, {label?: string}>} pathways @param {string} defaultId @param {HTMLSelectElement | null} select @param {HTMLSelectElement | null} picker @param {HTMLElement | null} load @param {() => HTMLOptionElement} createOption */
export function displayPracticeCatalog(state, pathways, defaultId, select, picker, load, createOption) {
  if (select) {
    select.replaceChildren();
    for (const item of state?.entries.filter(item => item.use === 'custom') || []) {
      const option = createOption(); option.value = item.id; option.textContent = item.title;
      select.appendChild(option);
    }
  }
  if (load) /** @type {HTMLButtonElement} */ (load).disabled = !state?.entries.length;
  const option = picker && Array.from(picker.options).find(item => item.value === defaultId);
  if (!option) return;
  option.disabled = !pathways[defaultId];
  option.textContent = pathways[defaultId]?.label || (state?.error ? 'Chromatic Warmup unavailable' : 'Chromatic Warmup loading…');
}
