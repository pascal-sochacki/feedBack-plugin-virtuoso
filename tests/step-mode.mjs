import assert from 'node:assert/strict';
import test from 'node:test';
import {buildStepEvents, enteredStepEventPitch, isStepEventInLoop, matchesStepEventPitch, nextStepIndex, stepEventHasDetectablePitch} from '../src/core/step-mode.js';
import {midiToFreq} from '../src/core/pitch.js';

test('step events group simultaneous notes and omit muted and loop-tail copies', () => {
  const events = buildStepEvents([
    {t:2, s:1, f:3}, {t:1, s:0, f:2}, {t:1.008, s:2, f:4},
    {t:1.01, s:3, f:5}, {t:1.2, s:4, f:6, mt:true}, {t:3, s:5, f:7, _tail:true},
  ]);
  assert.deepEqual(events.map(event => event.time), [1, 1.01, 2]);
  assert.deepEqual(events[0].notes.map(note => note.s), [0, 2]);
});

test('step cursor starts at the next event and safely ends after the chart', () => {
  const events = buildStepEvents([{t:1, s:0, f:0}, {t:2, s:0, f:1}]);
  assert.equal(nextStepIndex(events, 0), 0);
  assert.equal(nextStepIndex(events, 1), 0);
  assert.equal(nextStepIndex(events, 1.951), 1);
  assert.equal(nextStepIndex(events, 2), 1);
  assert.equal(nextStepIndex(events, 5), 2);
});

test('A/B loops only pause for events in the loop and reset the cursor at the wrapped time', () => {
  const events = buildStepEvents([{t:1, s:0, f:0}, {t:3, s:0, f:1}, {t:5, s:0, f:2}, {t:6, s:0, f:3}, {t:7, s:0, f:4}]);
  assert.equal(isStepEventInLoop(events[0], 2, 6), false);
  assert.equal(isStepEventInLoop(events[1], 2, 6), true);
  assert.equal(isStepEventInLoop(events[2], 2, 6), true);
  assert.equal(isStepEventInLoop(events[3], 2, 6), false);
  assert.equal(isStepEventInLoop(events[4], 2, 6), false);
  const wrappedTime = 6.25 - (6 - 2);
  assert.equal(nextStepIndex(events, wrappedTime), 1);
});

test('step pitch matching requires a fresh confident pitch within tolerance and accepts any chord member', () => {
  const events = buildStepEvents([{t:1, s:0, f:0}, {t:1.005, s:1, f:4}]);
  const openMidis = [60, 60];
  assert.equal(matchesStepEventPitch(midiToFreq(60), 0.86, events[0], openMidis, 0.85), true);
  assert.equal(matchesStepEventPitch(midiToFreq(64), 0.9, events[0], openMidis, 0.85), true);
  assert.equal(matchesStepEventPitch(midiToFreq(62), 0.9, events[0], openMidis, 0.85), false);
  assert.equal(matchesStepEventPitch(midiToFreq(60), 0.85, events[0], openMidis, 0.85), false);
  assert.equal(matchesStepEventPitch(NaN, 0.9, events[0], openMidis, 0.85), false);
  assert.equal(matchesStepEventPitch(0, 0.9, events[0], openMidis, 0.85), false);
});

test('step auto-advance requires a pitch transition, not a sustained detector lock', () => {
  const event = buildStepEvents([{t:1, s:0, f:0}])[0];
  const openMidis = [60];
  const matching = {freqHz:midiToFreq(60), confidence:0.9};
  assert.equal(enteredStepEventPitch(null, matching, event, openMidis, 0.85), true);
  assert.equal(enteredStepEventPitch(matching, matching, event, openMidis, 0.85), false);
  assert.equal(enteredStepEventPitch({freqHz:matching.freqHz, confidence:0.8}, matching, event, openMidis, 0.85), true);
  assert.equal(enteredStepEventPitch({freqHz:midiToFreq(61), confidence:0.9}, matching, event, openMidis, 0.85), true);
});

test('step auto-advance cue only claims pitch detection for notes above its floor', () => {
  const low = buildStepEvents([{t:1, s:0, f:0}])[0];
  const detectable = buildStepEvents([{t:2, s:1, f:0}])[0];
  assert.equal(stepEventHasDetectablePitch(low, [20, 60], 30), false);
  assert.equal(stepEventHasDetectablePitch(detectable, [28, 60], 30), true);
});
