// SPDX-License-Identifier: AGPL-3.0-only
// Pre-form pathway realization keeps CSV tuning and optional authored values.
export type AuthoredConfig = import('../content/pathways.js').PathwayConfig & {
  keyNominal?: string; tuningOffset?: number; tuningLabel?: string;
  anchorStation?: string; anchorFret?: number;
};
