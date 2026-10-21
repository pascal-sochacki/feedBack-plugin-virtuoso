// SPDX-License-Identifier: AGPL-3.0-only
import { SEGMENT_TEMPLATES } from '../content/segments.js';
import { stylePaletteConfig } from './config-defaults.js';
import { parseMeter } from './timing.js';
/** @overload @param {import('./session-types.js').SegmentTemplate} template @param {{variantIdx?: number, locks?: Record<string, boolean>}} [opts] @returns {import('./session-types.js').Segment & {config: import('./session-types.js').SegmentConfig}} */
/** @overload @param {null | undefined} template @param {{variantIdx?: number, locks?: Record<string, boolean>}} [opts] @returns {null} */
/** @param {import('./session-types.js').SegmentTemplate | null | undefined} template @param {{variantIdx?: number, locks?: Record<string, boolean>}} [opts] @returns {import('./session-types.js').Segment | null} */
export function rollSegment(template, opts) {
  if (!template) return null;
  opts = opts || {};
  const vary = (template.vary && template.vary.length) ? template.vary : [{}];
  const n = vary.length;
  const idx = (((/** @type {number} */ (opts.variantIdx) | 0) % n) + n) % n;
  const anchor = /** @type {Record<string, unknown>} */ (vary[0] || {});
  const delta = /** @type {Record<string, unknown>} */ (Object.assign({}, vary[idx]));
  const locks = opts.locks || null;
  if (locks) for (const ax of Object.keys(locks)) {
    if (locks[ax] && (ax in anchor)) delta[ax] = anchor[ax];
  }
  let styleCfg = {};
  if (template.style) {
    const sp = stylePaletteConfig(template.style, {
        progression: /** @type {string | undefined} */ (delta.progression) || (template.base && template.base.progression),
        scale:       /** @type {string | undefined} */ (delta.scale)       || (template.base && template.base.scale),
        key:         /** @type {string | undefined} */ (delta.key)         || (template.base && template.base.key),
    });
    if (sp) styleCfg = sp;
  }
  // Palette is the floor, variant the ceiling; locks pin axes to variant zero.
  const config = /** @type {import('./session-types.js').SegmentConfig} */ (Object.assign({}, styleCfg, template.base || {}, delta));
  if (template.targetSec != null && config.targetSec == null) config.targetSec = template.targetSec;
  return {
    id: template.id + (idx ? '__v' + idx : ''),
    name: template.label || template.id,
    kind: template.kind,
    role: template.role,
    templateId: template.id,
    variantIdx: idx,
    config,
  };
}

/** @param {import('./session-types.js').Session} session @param {{scope?: string | number}} [opts] */
export function refreshWorkout(session, opts) {
  if (!session) return session;
  opts = opts || {};
  const scope = (opts.scope == null) ? 'all' : opts.scope;
  const segs = (session.segments || []).map((seg, i) => {
    const isRef = !!(seg && seg.templateId && !seg.kind);
    if (!isRef) return seg;
    const hit = scope === 'all' || scope === seg.id || scope === i;
    if (!hit) return seg;
    const tmpl = SEGMENT_TEMPLATES[/** @type {string} */ (seg.templateId)];
    const n = (tmpl && tmpl.vary && tmpl.vary.length) || 1;
    if (n <= 1) return seg;
    return Object.assign({}, seg, { variantIdx: (((/** @type {number} */ (seg.variantIdx) | 0) + 1) % n) });
  });
  return Object.assign({}, session, { segments: segs });
}

/** @param {import('./session-types.js').Segment | undefined} rawSeg */
export function materializeSegment(rawSeg) {
  if (!(rawSeg && rawSeg.templateId && !rawSeg.kind)) return rawSeg;
  const tmpl = SEGMENT_TEMPLATES[rawSeg.templateId];
  if (!tmpl) return null;
  const seg = rollSegment(tmpl, { variantIdx: rawSeg.variantIdx, locks: rawSeg.locks });
  if (rawSeg.name) seg.name = rawSeg.name;
  if (rawSeg.bpmLadder) seg.bpmLadder = rawSeg.bpmLadder;
  if (rawSeg.keyCycle) seg.keyCycle = rawSeg.keyCycle;
  if (rawSeg.targetSec != null) seg.targetSec = rawSeg.targetSec;
  return seg;
}

/** @type {Record<string, string>} */
export const KIND_COMPETENCY = {
  chromatic:'finger independence', scale:'scale fluency', arpeggios:'arpeggio shapes',
  diatonic_arpeggios:'seventh-chord vocabulary', chord_scales:'play the changes',
  guide_tones:'voice-lead the changes', pedal_riff:'riff lock', legato:'hammer/pull fluency',
  bending:'bend intonation', sweep_arpeggios:'clean sweep picking', strum_comp:'comping feel',
  shell_voicings:'shell voicings', rhythm_pulse:'subdivision + feel', herta:'burst control',
  motif:'riff vocabulary',
  spider:'string-crossing independence', fingerstyle_arp:'p-i-m-a control',
  concept_chords:'chord concepts', walking_bass:'walking lines', root_fifth_octave:'root-fifth lock',
  octave_groove:'octave groove', dead_note_groove:'dead-note feel', slap_pop:'slap & pop',
  right_hand_technique:'right-hand control', tapping:'tapping fluency', hybrid_picking:'hybrid picking',
  tremolo_picking:'tremolo control', vibrato:'vibrato control',
};

/** @param {string | undefined} kind */
export function prettyKind(kind) { return String(kind || 'practice').replace(/_/g, ' '); }

/** @param {import('./session-types.js').Segment | undefined} rawSeg @param {import('./session-types.js').Segment | undefined} segment */
export function segmentCompetency(rawSeg, segment) {
  const tmpl = rawSeg && rawSeg.templateId ? SEGMENT_TEMPLATES[rawSeg.templateId] : null;
  if (tmpl && tmpl.competency) return tmpl.competency;
  const kind = segment && segment.kind;
  return KIND_COMPETENCY[/** @type {string} */ (kind)] || prettyKind(kind);
}

/** @param {import('./session-types.js').Segment} seg */
export function segmentEstDuration(seg) {
  const cfg = seg.config || {};
  const m = parseMeter(cfg.meter || '4/4');
  const bpm = cfg.bpm || 80;
  const bars = cfg.bars || 4;
  return bars * (60 / bpm) * (4 / m.denominator) * m.numerator;
}

/** @type {Record<string, string>} */
export const KIND_ROLE = {
  chromatic:'warmup', scale:'scale_arp', arpeggios:'scale_arp', diatonic_arpeggios:'scale_arp',
  guide_tones:'application', chord_scales:'application', strum_comp:'application', modal_vamp:'jam',
  legato:'technique', bending:'technique', sweep_arpeggios:'technique', pedal_riff:'technique',
  rhythm_pulse:'technique', herta:'technique', concept_chords:'application',
  motif:'application',
  spider:'warmup', fingerstyle_arp:'technique',
};

/** @param {import('./session-types.js').Segment} seg */
export function blockRole(seg) {
  if (seg.role) return seg.role;
  if (seg.templateId && SEGMENT_TEMPLATES[seg.templateId]) return SEGMENT_TEMPLATES[seg.templateId].role;
  return KIND_ROLE[/** @type {string} */ (seg.kind)] || null;
}
