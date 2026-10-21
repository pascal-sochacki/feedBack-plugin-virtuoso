// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Templates remain shared; timed geometry is cloned as each block gets its own
 * template ID range. Whole-cell tiling instead reuses IDs and does not use this.
 * @param {Pick<import('./generation-types.js').Chart, 'chords' | 'chordTemplates' | 'handShapes'>} dest
 * @param {Pick<import('./generation-types.js').Chart, 'chords' | 'chordTemplates' | 'handShapes'>} chart
 * @param {number} timeOffset
 * @param {number} templateOffset
 */
export function appendChordGeometry(dest, chart, timeOffset, templateOffset) {
  chart.chords.forEach(c => dest.chords.push(Object.assign({}, c, {
    t: Number((c.t + timeOffset).toFixed(6)), id: c.id + templateOffset,
  })));
  chart.chordTemplates.forEach(ct => dest.chordTemplates.push(ct));
  chart.handShapes.forEach(hs => dest.handShapes.push(Object.assign({}, hs, {
    chord_id: hs.chord_id + templateOffset,
    start_time: Number((hs.start_time + timeOffset).toFixed(6)),
    end_time: Number((hs.end_time + timeOffset).toFixed(6)),
  })));
}
