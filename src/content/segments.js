// SPDX-License-Identifier: AGPL-3.0-only

import { PRACTICE_BLOCKS } from './practice-blocks.js';

/** @type {Record<string, import('../core/session-types.js').SegmentTemplate>} */
export const SEGMENT_TEMPLATES = Object.fromEntries(Object.entries(PRACTICE_BLOCKS).map(([id, practice]) => [id, {
  id, role:practice.role, label:practice.label, competency:practice.competency, band:practice.band,
  instrument:practice.instrument, style:practice.style || null, paletteLock:practice.paletteLock === true, kind:practice.kind,
  base:practice.base, vary:practice.vary, practiceId:id, metadata:practice.metadata,
}]));

/** @type {Record<string, {label: string, order: number}>} */
export const SEGMENT_ROLES = {
  warmup:      { label:'Warm-up',     order:0 },
  technique:   { label:'Technique',   order:1 },
  scale_arp:   { label:'Scale / Arp', order:2 },
  application: { label:'Application', order:3 },
  jam:         { label:'Jam',         order:4 },
  review:      { label:'Review',      order:5 },
  cooldown:    { label:'Cool-down',   order:6 },
};
