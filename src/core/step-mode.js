// @ts-check

import { midiToFreq } from './pitch.js';

const SIMULTANEOUS_TOLERANCE = 0.01;

/** @typedef {{t:number, s:number, f:number, mt?:boolean, _tail?:boolean}} StepNote */
/** @typedef {{time:number, notes:StepNote[]}} StepEvent */

/** @param {StepNote[]|null|undefined} notes @returns {StepEvent[]} */
export function buildStepEvents(notes) {
  const ordered = (notes || []).filter(note => !note.mt && !note._tail && Number.isFinite(note.t))
    .map(note => ({...note, t:Number(note.t)}))
    .sort((a, b) => a.t - b.t);
  /** @type {StepEvent[]} */
  const events = [];
  for (const note of ordered) {
    let event = events[events.length - 1];
    if (!event || note.t - event.time > SIMULTANEOUS_TOLERANCE) {
      event = {time:note.t, notes:[]};
      events.push(event);
    }
    event.notes.push(note);
  }
  return events;
}

/** Find the first event at or after the requested chart time. @param {StepEvent[]} events @param {number} time */
export function nextStepIndex(events, time) {
  const index = events.findIndex(event => event.time >= time - 1e-6);
  return index < 0 ? events.length : index;
}

/** @param {StepEvent|undefined} event @param {number|null} loopA @param {number|null} loopB */
export function isStepEventInLoop(event, loopA, loopB) {
  return !!event && loopA != null && loopB != null && event.time >= loopA && event.time < loopB;
}

/** @param {number} freqHz @param {number} confidence @param {StepEvent|undefined} event @param {number[]} openMidis @param {number} minConfidence @param {number} [toleranceCents] */
export function matchesStepEventPitch(freqHz, confidence, event, openMidis, minConfidence, toleranceCents = 50) {
  if (!Number.isFinite(freqHz) || freqHz <= 0 || !Number.isFinite(confidence) || confidence <= minConfidence || !event) return false;
  return event.notes.some(note => {
    const openMidi = openMidis[note.s];
    if (!Number.isFinite(openMidi)) return false;
    const expectedHz = midiToFreq(openMidi + note.f);
    return Math.abs(1200 * Math.log2(freqHz / expectedHz)) <= toleranceCents;
  });
}

/** @param {StepEvent|undefined} event @param {number[]} openMidis @param {number} [minHz] */
export function stepEventHasDetectablePitch(event, openMidis, minHz = 30) {
  return !!event && event.notes.some(note => {
    const openMidi = openMidis[note.s];
    return Number.isFinite(openMidi) && midiToFreq(openMidi + note.f) >= minHz;
  });
}

/** @param {{freqHz:number, confidence:number}|null} previous @param {{freqHz:number, confidence:number}} current @param {StepEvent|undefined} event @param {number[]} openMidis @param {number} minConfidence @param {number} [toleranceCents] @param {number} [minHz] */
export function enteredStepEventPitch(previous, current, event, openMidis, minConfidence, toleranceCents = 50, minHz = 30) {
  if (!event) return false;
  const detectableEvent = {
    ...event,
    notes:event.notes.filter(note => {
      const openMidi = openMidis[note.s];
      return Number.isFinite(openMidi) && midiToFreq(openMidi + note.f) >= minHz;
    }),
  };
  if (!detectableEvent.notes.length
    || !matchesStepEventPitch(current.freqHz, current.confidence, detectableEvent, openMidis, minConfidence, toleranceCents)) return false;
  return !previous || !matchesStepEventPitch(previous.freqHz, previous.confidence, detectableEvent, openMidis, minConfidence, toleranceCents);
}
