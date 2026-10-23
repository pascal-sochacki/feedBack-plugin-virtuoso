// SPDX-License-Identifier: AGPL-3.0-only
// Raw editor values include disabled controls; global preferences never travel.
const GLOBAL_FIELDS = new Set(['instrument', 'stringSetup', 'customOpenMidis', 'renderer', 'countIn', 'clickSubdiv', 'audioNotes', 'audioMetronome', 'audioHarmony', 'brightness']);
/** @param {HTMLFormElement | null} form */
export function captureTabControls(form) {
  /** @type {Record<string, {value: string, checked?: boolean}>} */
  const values = {};
  for (const node of Array.from(form?.elements || [])) {
    const field = /** @type {HTMLInputElement} */ (node);
    if (!field.name || GLOBAL_FIELDS.has(field.name) || field.type === 'button' || field.type === 'submit') continue;
    values[field.name] = {value:field.value, ...(field.type === 'checkbox' ? {checked:field.checked} : {})};
  }
  return values;
}
/** @param {HTMLFormElement | null} form @param {ReturnType<typeof captureTabControls>} values */
export function restoreTabControls(form, values) {
  for (const [name, value] of Object.entries(values)) {
    if (GLOBAL_FIELDS.has(name)) continue;
    const field = /** @type {HTMLInputElement | null} */ (form?.elements.namedItem(name));
    if (!field) continue;
    field.value = value.value;
    if (value.checked != null) field.checked = value.checked;
  }
}
