// SPDX-License-Identifier: AGPL-3.0-only
import { NOTE_NAMES } from '../../core/pitch.js';

// Ordinary mutable palettes stay shared with entry; only its active theme binding
// and persisted hand-mark preference are read through the live factory contract.
/** @type {Record<string, import('./renderer-types.js').RenderTheme>} */
export const RENDER_THEMES = {
  light: {
    bg: '#fbf8ef',          // parchment
    bgAlt: '#fbf8ef',
    ink: '#1a1a1a',          // primary text + strokes
    inkSoft: '#3f3f3f',
    dim: '#6b6b6b',           // secondary text (HUD, measure numbers)
    ledger: '#1a1a1a',
    noteFill: '#1a1a1a',
    noteOutline: '#1a1a1a',
    stem: '#1a1a1a',
    beam: '#1a1a1a',
    keysig: '#1a1a1a',
    accidental: '#1a1a1a',
    chordName: '#1a1a1a',
    sectionLabel: '#1a1a1a',
    hopo: '#1a1a1a',
    bend: '#1a1a1a',
    playhead: '#b91c1c',     // red playhead
    faintLine: 'rgba(0,0,0,0.25)',
  },
  dark: {
    bg: '#0a1322',           // navy ground
    bgAlt: '#070c18',
    ink: '#e2e8f0',
    inkSoft: '#cbd5e1',
    dim: '#94a3b8',
    ledger: '#cbd5e1',
    noteFill: '#e2e8f0',
    noteOutline: '#e2e8f0',
    stem: '#e2e8f0',
    beam: '#e2e8f0',
    keysig: '#e2e8f0',
    accidental: '#e2e8f0',
    chordName: '#bfdbfe',
    sectionLabel: '#fbcfe8',
    hopo: '#cbd5e1',
    bend: '#cbd5e1',
    playhead: '#f87171',
    faintLine: 'rgba(226,232,240,0.18)',
  },
};
export const HANDMARK_FINGERS_LESSON = new Set(['chromatic', 'spider', 'sweep_arpeggios', 'fingerstyle_arp']);
export const HANDMARK_STROKES_LESSON = new Set(['chromatic', 'spider', 'tremolo_picking', 'hybrid_picking', 'strum_comp', 'slap_pop', 'dead_note_groove', 'octave_groove', 'right_hand_technique']);
/** @param {import('./renderer-types.js').RenderBundle} bundle */
export function handMarkLessonMode(bundle) { return (bundle && bundle.config && (bundle.config.mode || bundle.config.practiceType)) || ''; }
// Plucking-hand glyph for the stroke lane. Fingerstyle/classical = p-i-m-a-c
// (rh indexes the string). SLAP is its own vocabulary: thumb = T, pop = P —
// NOT the classical 'p'/'i', which mislabels a slapped octave as an index
// pluck and a thumb-slap as a classical thumb (bass-pedagogy ruling 2026-06-18).
/** @param {import('./renderer-types.js').RenderNote} n */
export function rhGlyph(n) { if (n.slap) return n.rh === 0 ? 'T' : 'P'; return 'pimac'[/** @type {number} */ (n.rh)] || '?'; }
/** @param {import('./renderer-types.js').RenderBundle | null} bundle */
export function chartBeatSeconds(bundle) {
  /** @type {Partial<import('../../core/generation-types.js').GenerationConfig>} */
  const c = (bundle && bundle.config) || {};
  const bpm = c.bpm || 90, den = (c.meter && c.meter.denominator) || 4;
  return (60 / bpm) * (4 / den);
}
/** @param {number} midi */
export function stringLabelForMidi(midi) {
  const pc = ((midi % 12) + 12) % 12;
  // High e and low E share the name "E" — caller decides case via string index
  return NOTE_NAMES[pc];
}

/** @param {number} bn */
export function bendLabel(bn) {
  return bn === 0.5 ? '½' : bn === 1 ? 'full' : bn === 1.5 ? '1½' : '2';
}
