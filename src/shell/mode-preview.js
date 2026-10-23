// SPDX-License-Identifier: AGPL-3.0-only
/** Explicit shared-control edits rebuild the active mode stopped. Navigation
 * return is deliberately a separate operation and never builds editor modes.
 * @param {{mode: () => string, invalidate: () => void, workout: () => Promise<unknown>, jam: () => Promise<unknown>, single: () => Promise<unknown>}} owner
 */
export function createModePreview(owner) {
  async function changed() {
    owner.invalidate();
    const mode = owner.mode();
    if (mode === 'session') return owner.workout();
    if (mode === 'jam') return owner.jam();
    return owner.single();
  }
  async function returned() {
    if (owner.mode() === 'session' || owner.mode() === 'jam') return;
    return owner.single();
  }
  return {changed, returned};
}
