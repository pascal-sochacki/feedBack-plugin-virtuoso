// SPDX-License-Identifier: AGPL-3.0-only
import { materializeSegment, segmentCompetency, blockRole } from './segments.js';
import { buildSegmentConfig } from './session-config.js';
import { measureSeconds } from './timing.js';
import { buildBeats, buildAnchors } from './chart-grid.js';
import { buildSingleChart } from './exercise-dispatch.js';
import { buildKeyCycleChart } from './key-cycle.js';
import { buildBackingEvents } from './backing.js';
import { buildDrumEvents, resolveGroove } from './drum-grooves.js';
import { swingNotesBacking } from './feel.js';
import { compileChordTimeline, appendTimelineOffset } from './chord-timeline.js';
import { blockTargetSec, fillBlockToDuration } from './chart-tiling.js';
import { countInSubTicks } from './count-in.js';
/** @param {import('./generation-types.js').GenerationConfig} segCfg @param {import('./session-types.js').BpmLadder} ladder @returns {import('./generation-types.js').Chart} */
export function buildBpmLadderChart(segCfg, ladder) {
  const { bpmStart, bpmTarget, bpmStep, repsPerStep = 1 } = /** @type {Required<Pick<import('./session-types.js').BpmLadder, 'bpmStart' | 'bpmTarget' | 'bpmStep'>> & {repsPerStep?: number}} */ (ladder);
  /** @type {import('./generation-types.js').Chart} */
  const arrays = {notes:[], chords:[], chordTemplates:[], handShapes:[], sections:[], anchors:[], beats:[], backingEvents:[], timeline:[], duration:0};
  const {notes, chords, chordTemplates, handShapes, sections} = arrays;
  const anchors = /** @type {import('./generation-types.js').Anchor[]} */ (arrays.anchors);
  const beats = /** @type {import('./generation-types.js').Beat[]} */ (arrays.beats);
  const backingEvents = /** @type {import('./generation-types.js').AccompanimentEvent[]} */ (arrays.backingEvents);
  const timeline = /** @type {import('./generation-types.js').TimelineEvent[]} */ (arrays.timeline);
  let t = 0, tplOffset = 0, beatOff = 0, barOff = 0;
  for (let bpm = bpmStart; bpm <= bpmTarget + 0.001; bpm += bpmStep) {
    for (let r = 0; r < repsPerStep; r++) {
      const stepCfg = Object.assign({}, segCfg, { bpm, keyCycle:'none' });
      const chart = buildSingleChart(stepCfg);
      const dur = Math.max(chart.duration || 0, segCfg.bars * measureSeconds(stepCfg));
      // Per-RUNG backing + swing on THIS rung's tempo — the ladder climbs tempo, so
      // a single-cfg backing would drift off the accelerating notes. Build + swing in
      // rung-local time, then offset by t (the chart carries it; consumers don't re-swing).
      const rawBack = /** @type {import('./generation-types.js').AccompanimentEvent[]} */ (buildBackingEvents(stepCfg, dur)).concat(buildDrumEvents(stepCfg, dur, resolveGroove(stepCfg)));
      const sw = swingNotesBacking(chart.notes, rawBack, stepCfg);
      // Per-RUNG timeline (desync rule) — tempo changes the rung's SECONDS.
      appendTimelineOffset(timeline, compileChordTimeline(stepCfg, dur), t, beatOff, barOff);
      if (r === 0) sections.push({ name:`${Math.round(bpm)} BPM`, number:sections.length + 1, time:Number(t.toFixed(6)) });
      sw.notes.forEach(n => notes.push(Object.assign({}, n, { t:Number((n.t + t).toFixed(6)) })));
      chart.chords.forEach(c => chords.push(Object.assign({}, c, { t:Number((c.t + t).toFixed(6)), id:c.id + tplOffset })));
      chart.chordTemplates.forEach(ct => chordTemplates.push(ct));
      chart.handShapes.forEach(hs => handShapes.push(Object.assign({}, hs, { chord_id:hs.chord_id + tplOffset, start_time:Number((hs.start_time + t).toFixed(6)), end_time:Number((hs.end_time + t).toFixed(6)) })));
      (chart.anchors || []).forEach(a => anchors.push(Object.assign({}, a, { time:Number((a.time + t).toFixed(6)) })));
      buildBeats(stepCfg, dur).forEach(b => beats.push(Object.assign({}, b, { time:Number((b.time + t).toFixed(6)) })));
      sw.backing.forEach(ev => backingEvents.push(Object.assign({}, ev, { t:Number((ev.t + t).toFixed(6)), end:Number((ev.end + t).toFixed(6)) })));
      tplOffset += (chart.chordTemplates || []).length;
      const rBar = measureSeconds(stepCfg);
      beatOff += (dur / rBar) * Math.max(1, stepCfg.meter.numerator);
      barOff += Math.round(dur / rBar);
      t += dur;
    }
  }
  return { notes, chords, chordTemplates, handShapes, sections, anchors, beats, backingEvents, timeline, duration:t };
}

/** @type {Record<string, string>} */
export const TECH_CLASS = {
  bending:'bend', vibrato:'bend',
  legato:'legato', tapping:'legato', string_skipping:'legato', hybrid_picking:'legato',
  sweep_arpeggios:'sweep',
  strum_comp:'comp', shell_voicings:'comp', chord_scales:'comp',
  slap_pop:'slap',
  walking_bass:'groove', root_fifth_octave:'groove', octave_groove:'groove',
  dead_note_groove:'groove', right_hand_technique:'groove',
};

/** @param {string | undefined} kind */
export function techniqueClass(kind) { return TECH_CLASS[/** @type {string} */ (kind)] || 'pick'; }

/** @param {import('./generation-types.js').GenerationConfig} cfg */
export function segFretCenter(cfg) { return (((cfg.fretMin || 0) + (cfg.fretMax || 0)) / 2); }

/** @param {import('./generation-types.js').GenerationConfig} prevCfg @param {import('./generation-types.js').GenerationConfig} curCfg @param {string} mode */
export function interBlockBreakBars(prevCfg, curCfg, mode) {
  if (mode === 'off') return 0;
  const barSec = measureSeconds(curCfg) || 2;
  let bars = Math.max(1, Math.min(4, Math.round(2.0 / barSec)));        // ~2s felt, whole incoming bars
  const techChange = techniqueClass(prevCfg.mode || prevCfg.practiceType) !== techniqueClass(curCfg.mode || curCfg.practiceType);
  const bigLeap = Math.abs(segFretCenter(prevCfg) - segFretCenter(curCfg)) >= 5;
  const tempoSame = prevCfg.bpm === curCfg.bpm;
  const meterSame = (prevCfg.meter?.numerator === curCfg.meter?.numerator) && (prevCfg.meter?.denominator === curCfg.meter?.denominator);
  // 'auto': adjacent blocks that genuinely flow (same pulse + hand-mode + region)
  // still get a 1-bar reset-breath (2026-06-09 panel: L&D + rhythm-meter). A
  // Workout is a SEQUENCE of distinct drills — a zero boundary erases the chunk
  // the curriculum is built on, and the breath carries the per-block verdict
  // beat. Real transitions get the full quantized break below.
  if (mode !== 'always' && tempoSame && meterSame && !techChange && !bigLeap) return 1;
  // Technique-class change (both hands re-grip) or a ≥5-fret leap → never tighter
  // than ~3s (guitar-ped: at fast tempos 2 bars starves a legato→slap re-grip).
  if (techChange || bigLeap) bars = Math.max(bars, 2, Math.ceil(3.0 / barSec));
  return bars;
}

/** @param {import('./session-types.js').Session} session @returns {import('./session-types.js').SessionChart} */
export function buildSessionChart(session) {
  /** @type {import('./generation-types.js').Chart} */
  const arrays = {notes:[], chords:[], chordTemplates:[], handShapes:[], sections:[], anchors:[], beats:[], backingEvents:[], timeline:[], duration:0};
  const {notes, chords, chordTemplates, handShapes, sections} = arrays;
  const anchors = /** @type {import('./generation-types.js').Anchor[]} */ (arrays.anchors);
  const beats = /** @type {import('./generation-types.js').Beat[]} */ (arrays.beats);
  const backingEvents = /** @type {import('./generation-types.js').AccompanimentEvent[]} */ (arrays.backingEvents);
  const timeline = /** @type {import('./generation-types.js').TimelineEvent[]} */ (arrays.timeline);
  // Per-segment time bounds — drives the session transport (progress bar,
  // segment jump, active-segment highlight, per-segment loop).
  /** @type {import('./session-types.js').SegmentBound[]} */
  const segmentBounds = [];
  let t = 0, tplOffset = 0, prevCfg = null, firstCfg = null, beatOff = 0, barOff = 0;
  const breakMode = session.interBlockBreak || 'auto';

  for (const rawSeg of (session.segments || [])) {
    // Template-ref slots ({ templateId, variantIdx, locks }) materialise through
    // the variation engine; inline segments ({ kind, config }) pass through. An
    // unknown templateId is skipped (validateSegmentTemplates catches authored ones).
    const segment = materializeSegment(rawSeg);
    if (!segment) continue;                                 // unknown templateId — skip
    const segCfg = buildSegmentConfig(segment, session);
    if (!firstCfg) firstCfg = segCfg;   // captured for the loop-wrap break (block-N → block-1 re-entry)
    // Inter-block break: a count-in for THIS (incoming) block so the prior block
    // doesn't slam into it. Adds count beats over the gap + advances the offset.
    if (prevCfg) {
      const brkBars = interBlockBreakBars(prevCfg, segCfg, breakMode);
      if (brkBars > 0) {
        const brkSec = brkBars * measureSeconds(segCfg);
        // brkSub: the incoming block's count-in grid (rhythm-meter spec 2026-06-12)
        // — the click scheduler previews the NEXT block's subdivision through the
        // break, read per-beat (the session-level cfg can't know each block's grid).
        buildBeats(segCfg, Math.max(0, brkSec - 1e-4)).forEach(b =>
          beats.push(Object.assign({}, b, { time: Number((b.time + t).toFixed(6)), brk: true, brkSub: countInSubTicks(segCfg) })));
        t += brkSec;
        // The break advances the slot offsets too (in the INCOMING block's
        // meter — the break IS the incoming block's count-in).
        beatOff += brkBars * Math.max(1, segCfg.meter.numerator);
        barOff += brkBars;
      }
    }
    // Determine which builder to use for this segment
    const ladder = segment.bpmLadder
      ? (segment.bpmLadder.enabled ? segment.bpmLadder : null)
      : (session.bpmLadder?.enabled ? session.bpmLadder : null);
    const keyCycleStrategy = (segment.keyCycle !== undefined)
      ? (segment.keyCycle?.enabled ? segment.keyCycle.strategy : null)
      : (session.keyCycle?.enabled ? session.keyCycle.strategy : null);
    const keyCycleLen = (segment.keyCycle?.keysPerSession) || (session.keyCycle?.keysPerSession) || 4;

    let chart;
    if (ladder) {
      chart = buildBpmLadderChart(segCfg, ladder);
    } else if (keyCycleStrategy) {
      chart = buildKeyCycleChart(Object.assign({}, segCfg, { keyCycle:keyCycleStrategy, keyCycleLength:keyCycleLen }));
    } else {
      chart = buildSingleChart(segCfg);
    }

    // Workout block: if the block declares a target wall-clock duration, fill it
    // with whole repetitions (overshoot, never cut a phrase). The block stays an
    // existing curriculum unit; only its length changes. Beats are regenerated
    // below over the filled duration.
    const tSec = blockTargetSec(segment);
    if (tSec != null) chart = fillBlockToDuration(chart, segCfg, tSec);

    const dur = chart.duration || (segCfg.bars * measureSeconds(segCfg));

    // Per-block backing (comp + bass + drums) on THIS block's OWN config — the
    // multi-block desync fix. Backing was previously synthesized ONCE from the
    // first block's cfg in makeBundle, so block 2+ drifted off the per-block
    // notes/beats (wrong tempo/meter/key) and played through the inter-block
    // breaks. Build it here on the SAME timeline as the notes, and swing it (with
    // the notes) on this block's grid in LOCAL time, before the +t offset — a
    // global swing post-pass warps later blocks against the first block's grid.
    // The break gap is backing-silent for free: t already advanced past the break,
    // so this block's backing starts on its own downbeat. A bpm-ladder / key-cycle
    // block already carries its OWN per-rung backing (built + swung at each rung's
    // tempo/key) — use that as-is and don't re-swing the (already-swung) notes.
    const swung = chart.backingEvents
      ? { notes: chart.notes, backing: chart.backingEvents }
      : swingNotesBacking(chart.notes, /** @type {import('./generation-types.js').AccompanimentEvent[]} */ (buildBackingEvents(segCfg, dur)).concat(buildDrumEvents(segCfg, dur, resolveGroove(segCfg))), segCfg);
    // Per-block TIMELINE on this block's own config (the desync rule applied
    // to harmony): without it the seam proof metric falls back to judging the
    // whole Workout against the FIRST block's progression. Ladder / key-cycle
    // charts already carry their per-rung-assembled timeline — offset as-is.
    appendTimelineOffset(timeline, (chart.timeline && chart.timeline.length) ? chart.timeline : compileChordTimeline(segCfg, dur), t, beatOff, barOff);

    // Segment-level section marker at the top of each segment
    sections.push({ name:/** @type {string} */ (segment.name), number:sections.length + 1, time:Number(t.toFixed(6)) });
    // Sub-sections from the chart (BPM ladder steps, key cycle keys) — skip index 0
    // since that collides with the segment marker we just pushed
    (chart.sections || []).forEach((s, i) => {
      if (i === 0) return;
      sections.push(Object.assign({}, s, { number:sections.length + 1, time:Number((s.time + t).toFixed(6)) }));
    });

    swung.notes.forEach(n => notes.push(Object.assign({}, n, { t:Number((n.t + t).toFixed(6)) })));
    chart.chords.forEach(c => chords.push(Object.assign({}, c, { t:Number((c.t + t).toFixed(6)), id:c.id + tplOffset })));
    chart.chordTemplates.forEach(ct => chordTemplates.push(ct));
    chart.handShapes.forEach(hs => handShapes.push(Object.assign({}, hs, { chord_id:hs.chord_id + tplOffset, start_time:Number((hs.start_time + t).toFixed(6)), end_time:Number((hs.end_time + t).toFixed(6)) })));
    // Per-block anchors (the desync rule applied to the hand-position zone): a
    // block that doesn't emit its OWN anchors (position-mode runs don't — only
    // shape runs set shapeRunAnchors) must still contribute a fret-window box
    // built from ITS segCfg, not silently inherit block 1's. Without this the
    // session anchors[] stays empty for ordinary Workout blocks, and
    // generateSession's firstCfg fallback then parks the highway's blue
    // fret-window highlight at segment 1's window for the WHOLE Workout — it
    // aligns with the first segment and drifts off every following one (the
    // 2026-06-11 DapperTap "highlight doesn't follow segments" report).
    const segAnchors = (chart.anchors && chart.anchors.length) ? chart.anchors : buildAnchors(segCfg, dur);
    segAnchors.forEach(a => anchors.push(Object.assign({}, a, { time:Number((a.time + t).toFixed(6)) })));
    // Use pre-computed beats if the chart has them (BPM ladder), else generate
    const segBeats = chart.beats || buildBeats(segCfg, dur);
    segBeats.forEach(b => beats.push(Object.assign({}, b, { time:Number((b.time + t).toFixed(6)) })));
    swung.backing.forEach(ev => backingEvents.push(Object.assign({}, ev, { t:Number((ev.t + t).toFixed(6)), end:Number((ev.end + t).toFixed(6)) })));
    tplOffset += (chart.chordTemplates || []).length;
    const blkBar = measureSeconds(segCfg);
    segmentBounds.push({ name:segment.name, kind:segment.kind, role:(blockRole(segment) || segment.role || null),
      competency:segmentCompetency(rawSeg, segment),
      templateId:(rawSeg.templateId || null), variantIdx:(rawSeg.variantIdx != null ? rawSeg.variantIdx : null),
      added:!!rawSeg._added, key:(segCfg.key || null), bpm:(segCfg.bpm || null),
      barSec:Number(blkBar.toFixed(6)),   // the block's own bar length — the per-block felt verdict's span unit
      start:Number(t.toFixed(6)), end:Number((t + dur).toFixed(6)) });
    beatOff += (dur / blkBar) * Math.max(1, segCfg.meter.numerator);
    barOff += Math.round(dur / blkBar);
    t += dur;
    prevCfg = segCfg;
  }
  // Loop-wrap breath: the seamless whole-chart loop re-enters block 1 with no
  // break (jarring after minutes). Append a TRAILING wrap break (block-N → block-1)
  // INSIDE [0,t] so the count-in shift + the contentLen phase-carry stay correct
  // (devops). It's the re-entry count for passes 2+ (the head count-in plays only
  // pass 1 — the loop wraps to leadIn, after it). Re-entry is never a segue, so
  // interBlockBreakBars' 1-bar floor gives ≥1 under 'auto'; 'off' yields 0.
  if (firstCfg && prevCfg && (session.segments || []).length > 1) {
    const wrapBars = interBlockBreakBars(prevCfg, firstCfg, breakMode);
    if (wrapBars > 0) {
      const wrapSec = wrapBars * measureSeconds(firstCfg);
      buildBeats(firstCfg, Math.max(0, wrapSec - 1e-4)).forEach(b =>
        beats.push(Object.assign({}, b, { time: Number((b.time + t).toFixed(6)), brk: true, brkSub: countInSubTicks(firstCfg) })));   // re-entry previews block-1's grid
      t += wrapSec;
    }
  }
  return { notes, chords, chordTemplates, handShapes, sections, anchors, beats, backingEvents, segmentBounds, timeline, duration:t };
}
