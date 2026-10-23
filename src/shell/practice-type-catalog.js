// SPDX-License-Identifier: AGPL-3.0-only
import { PRACTICE_BLOCKS, PRACTICE_TYPE_CATALOG } from '../content/practice-blocks.js';
import { offerable } from '../core/practice-selection.js';

/** @param {string} instrument */
export function practiceTypesForInstrument(instrument) {
  return PRACTICE_TYPE_CATALOG.filter(({ kind }) =>
    offerable(kind, instrument) && Object.values(PRACTICE_BLOCKS).some(block =>
      block.kind === kind && block.metadata.applicability.includes(instrument)));
}

/** @param {string} current @param {{kind: string}[]} options */
export function practiceTypeSelection(current, options) {
  if (options.some(option => option.kind === current)) return current;
  if (options.some(option => option.kind === 'scale')) return 'scale';
  return options[0]?.kind || '';
}
