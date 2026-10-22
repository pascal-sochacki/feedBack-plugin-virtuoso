// FELT-HOLD — estimate a sustained bass pocket from credited onset deviations.
export const FELT_HOLD_THRESHOLDS = { MIN_N: 12, MIN_BARS: 4, JITTER_LOCK: 25, JITTER_SETTLE: 45, LEAN_AHEAD: -18, LEAN_BEHIND: 28, DRIFT_FAIL: 35 };

/** @param {number[]} a */
function _feltMedian(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
/** @param {{t: number, d: number}[]} pts */
function _feltTheilSen(pts) {   // median pairwise slope (ms per second) over { t:sec, d:ms }
  const sl = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const dt = pts[j].t - pts[i].t; if (Math.abs(dt) > 1e-6) sl.push((pts[j].d - pts[i].d) / dt);
  }
  return sl.length ? _feltMedian(sl) : 0;
}

// devs = [{ d:sec, t:sec }]; opts.barSec. Returns { verdict, leanMs, driftMs,
// jitterMs, n, spanBars, untight } — verdict null = no pocket read (untight true →
// loose-but-played, false → too little evidence). Pure; no host/DOM.
/** @param {import('../types/results-data.js').TimingDeviation[] | null} devs @param {{barSec?: number}} [opts] @returns {import('../types/results-data.js').FeltAnalysis} */
export function feltHoldAnalyze(devs, opts) {
  opts = opts || {};
  const barSec = opts.barSec !== undefined && opts.barSec > 0 ? opts.barSec : 2;
  if (!Array.isArray(devs) || devs.length < FELT_HOLD_THRESHOLDS.MIN_N) return { verdict: null, n: devs ? devs.length : 0, untight: false };
  // Subtract register-dependent speak-budget excess so late-arriving low-note
  // evidence does not read as player lateness. Missing sb (old vectors) = 0.
  const pts = devs.map(x => ({ t: x.t, d: (x.d - (x.sb || 0)) * 1000 })).sort((a, b) => a.t - b.t);   // d → ms
  // Longest CONTINUOUS credited span (break the chain on a gap > ~2 bars).
  const gapMax = 2 * barSec; let runStart = 0, best = [0, 0];
  for (let i = 1; i <= pts.length; i++) {
    if (i === pts.length || pts[i].t - pts[i - 1].t > gapMax) {
      if (i - runStart > best[1] - best[0]) best = [runStart, i];
      runStart = i;
    }
  }
  const seg = pts.slice(best[0], best[1]);
  const spanSec = seg.length ? (seg[seg.length - 1].t - seg[0].t) : 0;
  const spanBars = barSec > 0 ? spanSec / barSec : 0;
  if (seg.length < FELT_HOLD_THRESHOLDS.MIN_N || spanBars < FELT_HOLD_THRESHOLDS.MIN_BARS) return { verdict: null, n: seg.length, spanBars: Math.round(spanBars), untight: false };
  const leanMs = Math.round(_feltMedian(seg.map(p => p.d)));
  const slope = _feltTheilSen(seg);                  // ms/s
  const driftMs = Math.round(slope * spanSec);
  const resid = seg.map(p => p.d - slope * (p.t - seg[0].t));   // detrend
  const medR = _feltMedian(resid);
  const jitterMs = Math.round(1.4826 * _feltMedian(resid.map(r => Math.abs(r - medR))));
  let /** @type {import('../types/results-data.js').FeltAnalysis['verdict']} */ verdict, untight = false;
  if (Math.abs(driftMs) >= FELT_HOLD_THRESHOLDS.DRIFT_FAIL) verdict = driftMs > 0 ? 'dragging' : 'rushing';   // trend first (+ = behind)
  else if (leanMs >= FELT_HOLD_THRESHOLDS.LEAN_BEHIND) verdict = 'dragging';
  else if (leanMs <= FELT_HOLD_THRESHOLDS.LEAN_AHEAD) verdict = 'rushing';
  else if (jitterMs <= FELT_HOLD_THRESHOLDS.JITTER_LOCK) verdict = 'locked';
  else if (jitterMs <= FELT_HOLD_THRESHOLDS.JITTER_SETTLE) verdict = 'settling';
  else { verdict = null; untight = true; }          // loose-but-centered: no pocket yet, encouraging copy
  return { verdict, leanMs, driftMs, jitterMs, n: seg.length, spanBars: Math.round(spanBars), untight };
}
