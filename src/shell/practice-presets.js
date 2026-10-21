// SPDX-License-Identifier: AGPL-3.0-only
/** @typedef {{id: string, name?: string, kind?: string, config?: Record<string, unknown>}} PracticePreset */
/** @typedef {Window & {__virtuosoFavorites?: Record<string, PracticePreset>}} PresetWindow */
/** @param {string} id */
const $ = id => document.getElementById(id);

/** @param {{onSelect: (config: Record<string, unknown>) => void}} context */
export function createPracticePresets(context) {
  let mounted = false;
  let visit = 0;
  let request = 0;
  /** @type {(() => void) | null} */
  let removeListener = null;
  const cache = () => /** @type {PresetWindow} */ (window).__virtuosoFavorites;
  /** @param {string} key */
  function get(key) { return cache()?.[key]; }

  /** @param {HTMLElement} target @param {string} key @param {PracticePreset} preset */
  function append(target, key, preset) {
    if (target.querySelector('option[value="' + key + '"]')) return;
    const option = document.createElement('option');
    option.value = key; option.textContent = preset.name || preset.id;
    target.appendChild(option);
  }
  async function load() {
    const select = $('virtuoso-pathway');
    const group = select?.querySelector('optgroup[label="Favorites"]');
    if (!select || !group) return;
    const picker = /** @type {HTMLSelectElement | null} */ ($('virtuoso-preset-picker'));
    const currentRequest = ++request, currentVisit = visit;
    try {
      const response = await fetch('/api/plugins/virtuoso/presets');
      const data = response.ok ? await response.json() : null;
      const presets = /** @type {PracticePreset[]} */ (data && Array.isArray(data.presets) ? data.presets : []);
      if (!presets.length || currentRequest !== request || currentVisit !== visit || !mounted || $('virtuoso-pathway') !== select || $('virtuoso-preset-picker') !== picker) return;
      const host = /** @type {PresetWindow} */ (window);
      host.__virtuosoFavorites = host.__virtuosoFavorites || {};
      for (const preset of presets) {
        if (!preset || !preset.id) continue;
        const key = 'fav__' + preset.id;
        host.__virtuosoFavorites[key] = preset;
        append(/** @type {HTMLElement} */ (group), key, preset);
        if (picker) append(picker, key, preset);
      }
      if (group.children.length) /** @type {HTMLElement} */ (group).hidden = false;
      const wrap = $('virtuoso-preset-picker-wrap');
      if (wrap && picker && picker.options.length > 1) wrap.hidden = false;
    } catch (_) {}
  }
  function mount() {
    if (mounted) return;
    mounted = true;
    const currentVisit = visit;
    const picker = /** @type {HTMLSelectElement | null} */ ($('virtuoso-preset-picker'));
    if (!picker) return;
    const handler = () => {
      if (!mounted || currentVisit !== visit || !picker.value) return;
      const preset = get(picker.value);
      if (preset?.config) context.onSelect(preset.config);
    };
    picker.addEventListener('change', handler);
    removeListener = () => picker.removeEventListener('change', handler);
  }
  function unmount() {
    mounted = false; visit++; request++;
    removeListener?.(); removeListener = null;
  }
  return {get, load, mount, unmount};
}
