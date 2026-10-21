// SPDX-License-Identifier: AGPL-3.0-only
import { buildPracticeFileExercise } from './practice-files.js';
import { blockTargetSec, fillBlockToDuration } from './chart-tiling.js';
import { buildBeats, buildAnchors } from './chart-grid.js';
import { resolveHumanSeed } from './random.js';
import { compileChordTimeline } from './chord-timeline.js';
import { STYLE_PALETTES } from './style-palettes.js';
import { buildJamChart } from './jam-chart.js';
import { buildKeyCycleChart } from './key-cycle.js';
import { buildSingleChart } from './exercise-dispatch.js';
import { measureSeconds } from './timing.js';

// ===========================================================================
// §8 · generateExercise() DISPATCH
// routes cfg.practiceType to the correct builder above.
// ===========================================================================
/** @param {import('./generation-types.js').GenerationConfig} cfg */
export function generateExercise(cfg) {
  if (cfg.practiceFile) {
    const exercise = /** @type {{version: number, session: import('./generation-types.js').GenerationConfig, chart: import('./generation-types.js').Chart}} */ (/** @type {unknown} */ (buildPracticeFileExercise(cfg)));
    if (cfg.practicePathwayId) {
      const target = blockTargetSec(cfg);
      const chart = target == null ? exercise.chart : fillBlockToDuration(exercise.chart, cfg, target);
      exercise.chart = chart;
      chart.beats = buildBeats(cfg, chart.duration);
      chart.anchors = buildAnchors(cfg, chart.duration);
      chart.humanSeed = resolveHumanSeed(cfg);
      chart.timeline = compileChordTimeline(cfg, chart.duration);
      return exercise;
    }
    exercise.chart.beats = buildBeats(exercise.session, exercise.chart.duration);
    return exercise;
  }
  let chart = cfg.jamStyle && STYLE_PALETTES[cfg.jamStyle] && (/** @type {number} */ (cfg.jamPasses) | 0) > 1
    ? buildJamChart(cfg)
    : cfg.keyCycle && cfg.keyCycle !== 'none'
      ? buildKeyCycleChart(cfg)
      : buildSingleChart(cfg);
  // Workout single block: a Custom config + a target duration → fill with whole
  // repetitions before timing (no-op when targetSec is absent, i.e. normal play).
  const tSec = blockTargetSec(cfg);
  if (tSec != null) chart = fillBlockToDuration(chart, cfg, tSec);
  const duration = Math.max(chart.duration || 0, cfg.bars * measureSeconds(cfg));
  const anchors = chart.anchors && chart.anchors.length ? chart.anchors : buildAnchors(cfg, duration);
  // chart.timeline = the shared harmonic skeleton (the single chord source the
  // backing reads) exposed for the Jam chord-loop, the seam proof metric, and
  // play-the-changes drill routing. A multi-part chart (key cycle) carries its
  // own per-rung-assembled timeline — use it; otherwise compile here.
  // chart.humanSeed = the resolved generation seed (charts are byte-identical
  // for the same cfg+seed — guarded by smoke-backing-engine).
  /** @type {{beats: import('./generation-types.js').Beat[], anchors: import('./generation-types.js').Anchor[], duration: number, humanSeed: number, timeline?: import('./generation-types.js').TimelineEvent[]}} */
  const extra = { beats:buildBeats(cfg, duration), anchors, duration, humanSeed: resolveHumanSeed(cfg) };
  extra.timeline = (chart.timeline && chart.timeline.length) ? chart.timeline : compileChordTimeline(cfg, duration);
  return { version:1, session:cfg, chart:Object.assign({}, chart, extra) };
}
