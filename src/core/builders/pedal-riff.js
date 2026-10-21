// SPDX-License-Identifier: AGPL-3.0-only
import { openMidisForConfig } from '../instrument-tuning.js';
import { secondsPerDivision, rhythmSteps, measureSeconds } from '../timing.js';
import { NOTE_ALIASES } from '../pitch.js';
import { progressionDegreesForConfig, chordRootForDegree } from '../harmony.js';
import { noteDefaults } from '../notes.js';

// Pedal-point RIFF (genre-framework §2.3): a palm-muted low pedal (s=0, tonic,
// open on drop tunings) alternating with power chords higher up — the defining
// metalcore / djent / melodeath / death-metal riff shape. Power-chord roots walk
// the configured progression (degrees → root pcs, including chromatic {semis}
// tokens); the pedal/chord alternation honours the gallop subdivision. Power
// chords are root+5th+octave on the 4ths-tuned mid strings (s=1/2/3).
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildPedalRiffExercise(cfg) {
  const opens = openMidisForConfig(cfg);
  if (opens.length < 4) throw new Error('Pedal-point riff needs at least 4 strings.');
  const step = secondsPerDivision(cfg), steps = rhythmSteps(cfg), mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  const pedalFret = (((keyPc - (opens[0] % 12)) % 12) + 12) % 12;   // tonic on the lowest string
  const s1pc = opens[1] % 12;
  const tremolo = !!cfg.tremolo;
  // Power chord rooted on s=1 (above the pedal). `5oct` = root+5th+octave across 3
  // strings (the heavy djent chug); `5` / anything else = root+5th dyad (the tight
  // one-finger shape). s=1/2/3 are perfect 4ths apart in guitar & bass tunings.
  const threeString = cfg.chordOverride === '5oct';
  /** @param {number} rootPc */
  const powerChord = (rootPc) => {
    const rf = (((rootPc - s1pc) % 12) + 12) % 12;
    const c = [{ s: 1, f: rf }, { s: 2, f: rf + 2 }];
    if (threeString) c.push({ s: 3, f: rf + 2 });
    return c;
  };
  const roots = progressionDegreesForConfig(cfg).map(d => chordRootForDegree(cfg, d));
  // Power chords land on the meter's GROUP STARTS so the polymeter cell lives in
  // the riff itself: 3+3+2 → chords on beats 0,3,6, pedal chugs fill the rest. A
  // trivial grouping (no cell, e.g. plain 4/4) places a chord on every beat — the
  // standard chug. This puts the rhythm in the NOTES, not just the metronome accent.
  const beatLen = (60 / cfg.bpm) * (4 / cfg.meter.denominator);
  const grouping = (cfg.meter.grouping && cfg.meter.grouping.length > 1)
    ? cfg.meter.grouping : Array(Math.max(1, cfg.meter.numerator)).fill(1);
  const groupStartBeats = []; { let g = 0; for (const w of grouping) { groupStartBeats.push(g); g += w; } }
  const chordTimes = [];
  for (let bar = 0; bar * mLen < totalTime - 1e-6; bar++)
    for (const gb of groupStartBeats) { const ct = bar * mLen + gb * beatLen; if (ct < totalTime - 1e-6) chordTimes.push(ct); }
  const sus = Math.max(0.05, step * 0.9);
  const notes = []; let t = 0, idx = 0, chordIdx = 0, ci = 0;
  while (t < totalTime - 0.001) {
    const tt = Number(t.toFixed(6));
    if (ci < chordTimes.length && t >= chordTimes[ci] - 1e-6) {        // group start → power chord
      for (const n of powerChord(roots[chordIdx % roots.length])) notes.push(noteDefaults({ t: tt, s: n.s, f: n.f, sus, tr: tremolo }));
      chordIdx++; ci++;
    } else {
      notes.push(noteDefaults({ t: tt, s: 0, f: pedalFret, sus, pm: true, tr: tremolo }));   // pedal chug between chords
    }
    t += (steps && steps.length) ? steps[idx % steps.length] : step; idx++;
  }
  return { notes, chords: [], chordTemplates: [], handShapes: [], sections: [{ name: `Pedal-point riff — ${cfg.key} ${cfg.scale}`, number: 1, time: 0 }], duration: Math.max(t, totalTime) };
}
