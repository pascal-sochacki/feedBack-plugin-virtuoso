import {createTransportState, anchorTransport, advanceTransport, pausedDuration, resumePosition} from '../core/run-transport.js';

/**
 * @typedef {import('../core/run-transport.js').ClockSample} ClockSample
 * @typedef {import('../core/run-transport.js').Beat} Beat
 */
/**
 * @template {import('./renderers/renderer-types.js').RenderBundle} Bundle
 * @typedef {{identity:number, bundle:Bundle|null, pending:Promise<boolean>}} StartRequest
 */
/**
 * @template {import('./renderers/renderer-types.js').RenderBundle} Bundle
 * @typedef {Object} TransportDependencies
 * @property {{currentRequest:()=>number, isCurrentRequest:(identity:number)=>boolean}} operation
 * @property {()=>Bundle|null} getBundle
 * @property {(bundle:Bundle)=>Promise<void>} prepareVoices
 * @property {()=>void} startPlayback
 * @property {()=>ClockSample} clockNow
 */

/** @template {import('./renderers/renderer-types.js').RenderBundle} Bundle @param {TransportDependencies<Bundle>} dependencies */
export function createRunTransport(dependencies) {
  const state = createTransportState();
  /** @type {StartRequest<Bundle>|null} */
  let startRequest = null;
  const owns = (/** @type {StartRequest<Bundle>} */ request) => startRequest === request
    && dependencies.operation.isCurrentRequest(request.identity)
    && dependencies.getBundle() === request.bundle;

  /** @param {Promise<boolean>} ready @param {()=>void} beforeStart @returns {Promise<boolean>} */
  function runStart(ready, beforeStart) {
    // A second Play on the same pending attachment joins it rather than
    // invalidating the generation whose readiness promise it is waiting for.
    if (startRequest && owns(startRequest)) return startRequest.pending;
    const request = {identity:dependencies.operation.currentRequest(), bundle:dependencies.getBundle(), pending:Promise.resolve(false)};
    startRequest = request;
    request.pending = (async () => {
      try {
        if (!await ready || !owns(request) || !request.bundle) return false;
        await dependencies.prepareVoices(request.bundle);
        if (!owns(request)) return false;
        beforeStart();
        dependencies.startPlayback();
        return true;
      } catch (error) {
        if (!owns(request)) return false;
        throw error;
      } finally {
        if (startRequest === request) startRequest = null;
      }
    })();
    return request.pending;
  }

  /** @param {number} time @param {number} lookahead */
  function anchor(time, lookahead) { anchorTransport(state, dependencies.clockNow(), time, lookahead); }
  function begin() {
    state.playing = true; state.paused = false;
    state.pausedAccumMs = 0; state.pauseBeganMs = 0; state.preRollUntil = 0;
  }
  function rememberStart() {
    if (state.loopA !== null && state.loopB !== null) state.time = Math.min(state.loopA, state.loopB);
    state.startTime = state.time;
  }
  function rewindToStart() { state.time = state.startTime; state.anchorTime = state.startTime; }
  /** @param {boolean} [rewind] @param {boolean} [clearPreRoll] */
  function stop(rewind = false, clearPreRoll = false) {
    state.playing = false; state.paused = false;
    if (clearPreRoll) state.preRollUntil = 0;
    if (rewind) rewindToStart();
  }
  function pause() {
    if (!state.playing || state.paused) return false;
    state.paused = true; state.pauseBeganMs = dependencies.clockNow().wallMs;
    return true;
  }
  /** @param {{lead:number, beats:Beat[]}} timeline */
  function resume(timeline) {
    if (!state.playing || !state.paused) return false;
    state.pausedAccumMs = pausedDuration(state, dependencies.clockNow().wallMs);
    state.paused = false;
    state.time = resumePosition(state, timeline);
    return true;
  }
  /** Resume at an exact chart position without the regular bar-entry runway. @param {number} time */
  function resumeAt(time) {
    if (!state.playing || !state.paused) return false;
    state.pausedAccumMs = pausedDuration(state, dependencies.clockNow().wallMs);
    state.paused = false;
    state.preRollUntil = 0;
    state.time = time;
    return true;
  }
  /** @param {number} nowMs */
  function advance(nowMs) { advanceTransport(state, {...dependencies.clockNow(), wallMs:nowMs}); }
  function finishPreRoll() { if (state.preRollUntil > 0 && state.time >= state.preRollUntil) state.preRollUntil = 0; }
  /** @param {number} time */
  function moveCursor(time) { state.time = time; }
  /** @param {number} time @param {number} duration */
  function seek(time, duration) { state.time = Math.max(0, Math.min(duration, Number(time) || 0)); }
  /** @param {number} length */
  function wrap(length) { state.anchorTime -= length; state.time -= length; }
  /** @param {number|null} a @param {number|null} b */
  function setLoop(a, b) { state.loopA = a; state.loopB = b; }
  /** @param {number|null} a @param {number|null} b */
  function markLoop(a, b) { state.markerA = a; state.markerB = b; }
  function resetWraps() { state.wraps = 0; }
  function countWrap() { state.wraps++; }
  function resetLoop() { markLoop(null, null); resetWraps(); }
  return {
    runStart, begin, rememberStart, stop, pause, resume, resumeAt, anchor, advance, finishPreRoll, moveCursor, seek, wrap,
    setLoop, markLoop, resetWraps, countWrap, resetLoop, rewindToStart,
    sessionPausedMs:() => pausedDuration(state, dependencies.clockNow().wallMs),
    // Read-only live access: no copied clock or writable shell shadow state.
    get playing() {return state.playing;}, get paused() {return state.paused;}, get time() {return state.time;},
    get startTime() {return state.startTime;}, get anchorTime() {return state.anchorTime;},
    get anchorMs() {return state.anchorMs;}, get anchorAudio() {return state.anchorAudio;},
    get preRollUntil() {return state.preRollUntil;},
    get loopA() {return state.loopA;}, get loopB() {return state.loopB;},
    get markerA() {return state.markerA;}, get markerB() {return state.markerB;}, get wraps() {return state.wraps;}
  };
}
