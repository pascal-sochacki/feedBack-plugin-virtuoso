// SPDX-License-Identifier: AGPL-3.0-only
// Generated widgets in screen.js, not arbitrary event targets.
export interface WidgetSelectors {
  '#virtuoso-rig-file': HTMLInputElement;
  '.virtuoso-rig-out': HTMLInputElement & {dataset: {amp: string}};
  '.virtuoso-mixer-fader': HTMLInputElement & {dataset: {k: string}};
  '.virtuoso-mixer-pan': HTMLInputElement & {dataset: {k: string}};
  '.virtuoso-mixer-amp': HTMLSelectElement & {dataset: {k: string}};
  '.virtuoso-mixer-kit': HTMLSelectElement & {dataset: {k: string}};
  '.virtuoso-mixer-instr': HTMLSelectElement & {dataset: {k: string}};
  '[data-act="depth-pattern"]': HTMLButtonElement;
  '.virtuoso-progress-seg': HTMLButtonElement & {dataset: {segIndex: string}};
  '.virtuoso-starter-confirm-yes': HTMLButtonElement & {dataset: {starterId: string}};
  '.virtuoso-starter-confirm-no': HTMLButtonElement;
  '[data-act="dismiss-summary"]': HTMLButtonElement;
  '[data-act="copy-card"], [data-act="download-card"]': HTMLButtonElement;
  '.virtuoso-mixer-viewtab': HTMLButtonElement;
  '.virtuoso-rig-load': HTMLButtonElement;
  '.virtuoso-rig-reset': HTMLButtonElement & {dataset: {amp: string}};
  '.virtuoso-mixer-inbtn': HTMLButtonElement & {dataset: {go: string}};
  '.virtuoso-mixer-tog': HTMLButtonElement & {dataset: {k: string; act: 'mute' | 'solo'} | {act: 'dim'; k?: never}};
}
