// SPDX-License-Identifier: AGPL-3.0-only
import { DIATONIC_QUALITIES } from '../../src/core/chord-theory.js';
import { SEGMENT_ROLES } from '../../src/content/segments.js';
import { STYLE_PALETTES } from '../../src/core/style-palettes.js';
import { rollSegment } from '../../src/core/segments.js';

const SEGMENT_BANDS = ['beginner', 'intermediate', 'advanced'];
const SINGLE_CHORD_BACKINGS = new Set(['static_i', 'none']);
const GATE_EXEMPT_SCALES = new Set(['minor_pentatonic', 'major_pentatonic', 'blues', 'bebop_major', 'bebop_dominant']);

/** Validate every catalog variant against the workout authoring invariants. */
/** @param {Record<string, import('../../src/core/session-types.js').SegmentTemplate>} templates */
export function assertSegmentTemplatesValid(templates) {
  for (const [id, template] of Object.entries(templates)) {
    if (!SEGMENT_ROLES[template.role]) throw new Error(`[Virtuoso segment-template] ${id} has unknown role "${template.role}"`);
    if (!SEGMENT_BANDS.includes(template.band)) throw new Error(`[Virtuoso segment-template] ${id} has unknown band "${template.band}"`);
    if (!template.kind || typeof template.kind !== 'string') throw new Error(`[Virtuoso segment-template] ${id} has no kind`);
    if (template.style && !STYLE_PALETTES[template.style]) throw new Error(`[Virtuoso segment-template] ${id} references unknown style "${template.style}"`);
    if (template.paletteLock && !template.style) throw new Error(`[Virtuoso segment-template] ${id} requires a style for its palette lock`);

    const variants = template.vary?.length ? template.vary : [{}];
    for (const delta of variants) {
      for (const field of ['bpm', 'targetSec', 'meter', 'bars']) {
        if (field in delta) throw new Error(`[Virtuoso segment-template] ${id} vary delta sets ${field} — length determinants (bpm/targetSec/meter/bars) must be held across variants`);
      }
    }

    for (let index = 0; index < variants.length; index++) {
      const config = rollSegment(template, { variantIdx: index }).config;
      if (template.paletteLock) {
        const palette = STYLE_PALETTES[/** @type {string} */ (template.style)];
        if (config.progression && !palette.progressions.includes(config.progression)) throw new Error(`[Virtuoso segment-template] ${id} variant ${index} progression "${config.progression}" is not in the ${template.style} palette (style-lock)`);
        if (config.scale && !palette.leadScales.includes(config.scale)) throw new Error(`[Virtuoso segment-template] ${id} variant ${index} scale "${config.scale}" is not in the ${template.style} palette (style-lock)`);
      }
      const hasQualityRow = !!(config.scale && DIATONIC_QUALITIES[config.scale]);
      const singleChord = template.kind === 'modal_vamp' || !config.progression || config.progression === 'none' || SINGLE_CHORD_BACKINGS.has(config.progression);
      const forcedChord = config.chordOverride && config.chordOverride !== 'auto';
      if (config.scale && !hasQualityRow && !GATE_EXEMPT_SCALES.has(config.scale) && !singleChord && !forcedChord) {
        throw new Error(`[Virtuoso segment-template] ${id} variant ${index}: exotic scale "${config.scale}" over multi-chord backing "${config.progression}" with auto chords (no-row-scale gate)`);
      }
    }
  }
}
