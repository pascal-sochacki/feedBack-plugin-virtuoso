// SPDX-License-Identifier: AGPL-3.0-only
import { BUILT_IN_SESSIONS } from '../content/workouts.js';
import { buildSessionChart } from './session-chart.js';
import { materializeSegment } from './segments.js';
import { buildSegmentConfig } from './session-config.js';
import { buildAnchors } from './chart-grid.js';
/** @param {import('./session-types.js').Session} session */
export function generateSession(session) {
  const chart = buildSessionChart(session);
  const duration = chart.duration || 0;
  // Use first segment's config for metadata — materialise a template-ref first so
  // the metadata cfg has a real meter/key/scale (not a config-less ref → undefined).
  const firstSeg = materializeSegment((session.segments || [])[0]);
  const firstCfg = firstSeg ? buildSegmentConfig(firstSeg, session) : /** @type {import('./generation-types.js').GenerationConfig} */ ({});
  const anchors = chart.anchors?.length ? chart.anchors : buildAnchors(firstCfg, duration);
  const sessionMeta = Object.assign({}, firstCfg, {
    mode:'session', practiceType:'session',
    // Block-1 count-in: the session path bypasses readConfig, so makeBundle saw
    // no countInBars and a Workout slammed in cold. Carry it (the shell sets
    // session.countInBars from the player's default; floor ≥1 — count-in is
    // always on). Counted in block 1's meter (firstCfg) — "incoming governs".
    countInBars: Math.max(1, Math.min(8, (session.countInBars != null ? session.countInBars : 1))),
    sessionName:session.name, sessionId:Object.keys(BUILT_IN_SESSIONS).find(k => BUILT_IN_SESSIONS[/** @type {keyof typeof BUILT_IN_SESSIONS} */ (k)] === session) || 'custom'
  });
  return { version:1, session:sessionMeta, chart:Object.assign({}, chart, { beats:chart.beats || [], anchors, duration }) };
}
