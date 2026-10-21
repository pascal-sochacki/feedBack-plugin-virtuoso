/**
 * @typedef {{wallMs:number, audioSeconds:number|null}} ClockSample
 * @typedef {{time:number, accent?:string, measure?:number, _tail?:boolean}} Beat
 * @typedef {Object} TransportState
 * @property {boolean} playing
 * @property {boolean} paused
 * @property {number} time
 * @property {number} startTime
 * @property {number} anchorTime
 * @property {number} anchorMs
 * @property {number|null} anchorAudio
 * @property {number} pausedAccumMs
 * @property {number} pauseBeganMs
 * @property {number} preRollUntil
 * @property {number|null} loopA
 * @property {number|null} loopB
 * @property {number|null} markerA
 * @property {number|null} markerB
 * @property {number} wraps
 */

/** @returns {TransportState} */
export function createTransportState() {
  return {playing:false, paused:false, time:0, startTime:0, anchorTime:0,
    anchorMs:0, anchorAudio:null, pausedAccumMs:0, pauseBeganMs:0,
    preRollUntil:0, loopA:null, loopB:null, markerA:null, markerB:null, wraps:0};
}

/** @param {TransportState} state @param {ClockSample} clock @param {number} time @param {number} lookahead */
export function anchorTransport(state, clock, time, lookahead) {
  state.anchorTime = time;
  state.anchorMs = clock.wallMs + lookahead * 1000;
  state.anchorAudio = clock.audioSeconds === null ? null : clock.audioSeconds + lookahead;
}

/** @param {TransportState} state @param {ClockSample} clock */
export function advanceTransport(state, clock) {
  if (!state.playing || state.paused) return;
  // The audio clock freezes with suspended playback; wall time must not advance it.
  const elapsedMs = clock.audioSeconds !== null && state.anchorAudio !== null
    ? Math.max(0, (clock.audioSeconds - state.anchorAudio) * 1000)
    : Math.max(0, clock.wallMs - state.anchorMs);
  state.time = state.anchorTime + elapsedMs / 1000;
}

/** @param {TransportState} state @param {number} wallMs */
export function pausedDuration(state, wallMs) {
  return state.pausedAccumMs + (state.paused ? Math.max(0, wallMs - state.pauseBeganMs) : 0);
}

/** @param {TransportState} state @param {{lead:number, beats:Beat[]}} timeline */
export function resumePosition(state, timeline) {
  const {lead, beats} = timeline, pauseTime = state.time;
  state.preRollUntil = 0;
  if (pauseTime <= lead + 1e-3) return pauseTime;
  const measures = beats.filter(beat => !beat._tail && (beat.accent === 'measure' || (beat.measure || -1) >= 0))
    .map(beat => beat.time).sort((a,b) => a-b);
  let reentry = lead;
  for (const measure of measures) { if (measure <= pauseTime + 1e-3) reentry = measure; else break; }
  if (reentry <= lead + 1e-3) return pauseTime;
  const index = measures.indexOf(reentry);
  const bar = index >= 0 && index + 1 < measures.length ? measures[index + 1] - reentry
    : index > 0 ? reentry - measures[index - 1] : 2;
  const bars = Math.max(1, Math.min(2, Math.round(2 / Math.max(0.3, bar))));
  let start = reentry - bars * bar;
  if (state.loopA !== null) start = Math.max(start, state.loopA);
  state.preRollUntil = reentry;
  return Math.max(0, start);
}
