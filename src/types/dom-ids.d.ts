// SPDX-License-Identifier: AGPL-3.0-only
// Literal form/media IDs verified against screen.html and settings.html.
// Other IDs intentionally retain HTMLElement; every lookup remains nullable.
export type VirtuosoElements =
  { [Id in "virtuoso-countin-default" | "virtuoso-file-select" | "virtuoso-file-variant" | "virtuoso-fretboard-system" | "virtuoso-jam-key" | "virtuoso-jam-prog" | "virtuoso-length-preset" | "virtuoso-mode-select" | "virtuoso-pathway" | "virtuoso-pathway-scale" | "virtuoso-preset-picker" | "virtuoso-shape" | "virtuoso-tuning-select" | "virtuoso-view-select"]: HTMLSelectElement }
  & { [Id in "virtuoso-summary"]: HTMLDivElement }
  & { [Id in "virtuoso-advanced-toggle" | "virtuoso-anchor-station" | "virtuoso-audio-harmony" | "virtuoso-audio-metronome" | "virtuoso-audio-notes" | "virtuoso-audio-profile" | "virtuoso-autosave-card" | "virtuoso-backing-bass" | "virtuoso-backing-comp" | "virtuoso-backing-density" | "virtuoso-backing-style" | "virtuoso-breathe-toggle" | "virtuoso-brightness" | "virtuoso-caged-shape-value" | "virtuoso-custom-open-midis" | "virtuoso-drums" | "virtuoso-herta-accent" | "virtuoso-herta-walk" | "virtuoso-jam-tempo" | "virtuoso-key-nominal" | "virtuoso-motif-cell" | "virtuoso-motif-phase" | "virtuoso-paste-share" | "virtuoso-pima-pattern" | "virtuoso-pulse-accent" | "virtuoso-pulse-offbeat" | "virtuoso-rfo-pattern" | "virtuoso-rh-tech-mode" | "virtuoso-routine-name" | "virtuoso-save-dir" | "virtuoso-session-audio-harmony" | "virtuoso-session-audio-metronome" | "virtuoso-session-audio-notes" | "virtuoso-shape-walk" | "virtuoso-spider-pair" | "virtuoso-stroke-policy" | "virtuoso-strum-pattern" | "virtuoso-sweep-strings" | "virtuoso-swing" | "virtuoso-tap-arp" | "virtuoso-tuning-offset" | "virtuoso-voicing-position" | "virtuoso-walk-approach" | "virtuoso-walk-feel"]: HTMLInputElement }
  & { [Id in "virtuoso-cheat-close" | "virtuoso-downshift-go" | "virtuoso-downshift-x" | "virtuoso-file-load" | "virtuoso-file-next" | "virtuoso-file-unload" | "virtuoso-focus-btn" | "virtuoso-fretboard-toggle" | "virtuoso-handmarks-toggle" | "virtuoso-help-btn" | "virtuoso-jam-go" | "virtuoso-keeploop-toggle" | "virtuoso-launch-session" | "virtuoso-library-close" | "virtuoso-library-open" | "virtuoso-listen" | "virtuoso-loop-a" | "virtuoso-loop-b" | "virtuoso-loop-clear" | "virtuoso-loop-seg" | "virtuoso-mixer-btn" | "virtuoso-mixer-close" | "virtuoso-mode-custom" | "virtuoso-mode-guided" | "virtuoso-mode-jam" | "virtuoso-mode-session" | "virtuoso-next-seg" | "virtuoso-nudge-back" | "virtuoso-nudge-fwd" | "virtuoso-packs-cancel" | "virtuoso-packs-close" | "virtuoso-packs-save" | "virtuoso-packs-to-available" | "virtuoso-packs-to-installed" | "virtuoso-pane-collapse-btn" | "virtuoso-pane-expand-btn" | "virtuoso-play" | "virtuoso-prev-seg" | "virtuoso-profile-badge" | "virtuoso-progress-close" | "virtuoso-prove-clean" | "virtuoso-regenerate" | "virtuoso-results-close" | "virtuoso-routine-save-cancel" | "virtuoso-routine-save-go" | "virtuoso-save-browse" | "virtuoso-save-routine" | "virtuoso-save-tuning" | "virtuoso-settings-btn" | "virtuoso-settings-host" | "virtuoso-settings-progress" | "virtuoso-settings-shortcuts" | "virtuoso-setup-btn" | "virtuoso-shape-next" | "virtuoso-shape-prev" | "virtuoso-share" | "virtuoso-start-cta" | "virtuoso-starters-close" | "virtuoso-starters-open" | "virtuoso-stop" | "virtuoso-to-start" | "virtuoso-tuner-badge" | "virtuoso-workout-refresh"]: HTMLButtonElement }
  & { "virtuoso-profile-avatar": HTMLImageElement; "virtuoso-controls": HTMLFormElement }
  & { [Id in "virtuoso-canvas" | "virtuoso-chordbox" | "virtuoso-fretboard" | "virtuoso-overview-canvas" | "virtuoso-ruler-canvas"]: HTMLCanvasElement };

// These controls are emitted by the entry's live panel renderers.
export interface GeneratedElements {
  'virtuoso-lcd-bpm': HTMLInputElement;
  'virtuoso-rig-file': HTMLInputElement;
  'virtuoso-results-hero-cv': HTMLCanvasElement;
}

export type ElementForId<Id extends string> =
  (Id extends keyof VirtuosoElements ? VirtuosoElements[Id] : Id extends keyof GeneratedElements ? GeneratedElements[Id] : HTMLElement) | null;

// Exact form-scoped selectors only; arbitrary selectors retain the DOM library type.
export type VirtuosoSelectors =
  { [Selector in '#virtuoso-controls [name="countIn"]' | '#virtuoso-controls [name="meter"]' | '#virtuoso-controls [name="subdivision"]' | '#virtuoso-controls [name="key"]' | '#virtuoso-controls [name="stringSetup"]' | '#virtuoso-controls [name="sequence"]' | '#virtuoso-controls [name="scale"]' | '[name="instrument"]' | '[name="stringSetup"]' | '[name="practiceType"]' | '[name="fretboardSystem"]' | '[name="renderer"]']: HTMLSelectElement }
  & { [Selector in '#virtuoso-controls [name="advancedMode"]' | '#virtuoso-controls [name="customOpenMidis"]' | '#virtuoso-controls [name="bpm"]']: HTMLInputElement };
export type VirtuosoHtmlLists = '#virtuoso-jam-hl .virtuoso-jam-hl-btn' | '.virtuoso-feel-btn'
  | '.virtuoso-band-add'
  | '#virtuoso-xp-mode .virtuoso-mini-btn' | '#virtuoso-countin-grid .virtuoso-mini-btn'
  | '.virtuoso-tp-seg' | '#virtuoso-session-progress .virtuoso-progress-seg'
  | '#virtuoso-segment-list .virtuoso-segment-card' | '.virtuoso-instr-btn'
  | '.virtuoso-mode-bar .virtuoso-mode-btn' | '.virtuoso-chromatic-only'
  | '.virtuoso-guide-tones-only' | '.virtuoso-bending-only'
  | '#virtuoso-jam-feel .virtuoso-jam-feel-btn' | '#virtuoso-jam-guide .virtuoso-jam-feel-btn'
  | '#virtuoso-jam-band .virtuoso-jam-feel-btn' | '#virtuoso-jam-depth .virtuoso-jam-feel-btn'
  | '#virtuoso-jam-energy .virtuoso-jam-feel-btn' | '#virtuoso-jam-spotlight .virtuoso-jam-feel-btn';
declare global {
  interface Element {
    querySelector(selectors: `.virtuoso-mixer-meter-fill[data-k="${string}"]`): HTMLDivElement | null;
    querySelectorAll(selectors: '.virtuoso-pack-row:not(.is-core)'): NodeListOf<HTMLDivElement>;
    closest(selectors: '[data-filter]'): (HTMLElement & {dataset: {filter: 'genre' | 'skill' | 'instrument'; value: string}}) | null;
    closest(selectors: '[data-sfilter]'): (HTMLElement & {dataset: {sfilter: 'genre' | 'level' | 'instrument'; value: string}}) | null;
    closest(selectors: '.virtuoso-lib-add'): (HTMLButtonElement & {dataset: {templateId: string}}) | null;
    closest(selectors: '.virtuoso-routine-load' | '.virtuoso-routine-del'): (HTMLButtonElement & {dataset: {routineId: string}}) | null;
    closest(selectors: '.virtuoso-starter-load'): (HTMLButtonElement & {dataset: {starterId: string}}) | null;
    closest(selectors: 'label'): HTMLLabelElement | null;
    closest<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    closest<E extends Element = Element>(selectors: string): E | null;
    querySelector(selectors: '.virtuoso-results-card'): HTMLElement | null;
    querySelector(selectors: '.virtuoso-jam-search'): HTMLInputElement | null;
    querySelector(selectors: '[data-act="jam-again"]'): HTMLButtonElement | null;
    querySelectorAll(selectors: '[data-act="copy-card"], [data-act="download-card"]'): NodeListOf<HTMLButtonElement>;
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    querySelector<E extends Element = Element>(selectors: string): E | null;
    querySelectorAll(selectors: '.virtuoso-mixer-viewtab'): NodeListOf<HTMLElement>;
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
  }
  interface Document {
    querySelector(selectors: '.virtuoso-jam-inspector'): HTMLDivElement | null;
    querySelectorAll(selectors: '.virtuoso-instr-btn'): NodeListOf<HTMLButtonElement & {dataset: {instrument: string}}>;
    querySelectorAll(selectors: '.virtuoso-tp-seg'): NodeListOf<HTMLButtonElement & {dataset: {countin: string}}>;
    querySelectorAll(selectors: '.virtuoso-feel-btn'): NodeListOf<HTMLButtonElement & {dataset: {feel: string}}>;
    querySelectorAll(selectors: '#virtuoso-xp-mode .virtuoso-mini-btn'): NodeListOf<HTMLButtonElement & {dataset: {xp: string}}>;
    querySelectorAll(selectors: '#virtuoso-countin-grid .virtuoso-mini-btn'): NodeListOf<HTMLButtonElement & {dataset: {grid: string}}>;
    getElementById<Id extends keyof VirtuosoElements>(elementId: Id): VirtuosoElements[Id] | null;
    getElementById<Id extends keyof GeneratedElements>(elementId: Id): GeneratedElements[Id] | null;
    getElementById(elementId: string): HTMLElement | null;
    querySelector<Selector extends keyof VirtuosoSelectors>(selectors: Selector): VirtuosoSelectors[Selector] | null;
    querySelector(selectors: `[data-screen="${string}"]`): HTMLElement | null;
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    querySelector<E extends Element = Element>(selectors: string): E | null;
    querySelectorAll(selectors: VirtuosoHtmlLists): NodeListOf<HTMLElement>;
    querySelectorAll(selectors: '.virtuoso-practice-pill input'): NodeListOf<HTMLInputElement>;
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
  }
}
