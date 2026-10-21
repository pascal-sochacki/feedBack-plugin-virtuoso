// SPDX-License-Identifier: AGPL-3.0-only
import { MOTIF_CELLS, resolveMotifCell } from '../motif.js';
import { openMidisForConfig, isBassCfg } from '../instrument-tuning.js';
import { scalePositionsForSystem } from '../positions.js';
import { measureSeconds } from '../timing.js';
import { noteDefaults } from '../notes.js';
import { buildAccompanimentEvents } from '../backing.js';
import { swingNotesBacking } from '../feel.js';
import { compileChordTimeline } from '../chord-timeline.js';

// The riff-vocabulary generator. Drill phase tiles the cell over cfg.bars;
// construct phase (cfg.motifPhase:'construct') plays the cell as the CALL and
// leaves an equal-length empty RESPONSE window — the player's answer space
// (unscored: no notes = no judge windows; the call_response surface, D13).
/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildMotifExercise(cfg) {
  const cellId = (cfg.motifCell && MOTIF_CELLS[cfg.motifCell]) ? cfg.motifCell : 'blues_turnaround_thirds';
  const cell = MOTIF_CELLS[cellId];
  const construct = cfg.motifPhase === 'construct';
  const opens = openMidisForConfig(cfg);
  // Position window = where the player's chosen shape/position lives (the
  // same window the scale drills use), padded one fret for the chromatic
  // neighbours; generous fallback when the system yields nothing.
  let fretLo = 0, fretHi = 14;
  try {
    const pos = scalePositionsForSystem(cfg);
    if (pos && pos.length) {
      fretLo = Math.max(0, Math.min.apply(null, pos.map(p => p.f)) - 1);
      fretHi = Math.min(24, Math.max.apply(null, pos.map(p => p.f)) + 1);
      if (fretHi - fretLo < 5) fretHi = Math.min(24, fretLo + 5);
    }
  } catch (_) { /* keep the fallback window */ }
  const r = resolveMotifCell(cell, cfg, opens, fretLo, fretHi);
  const bass = isBassCfg(cfg);
  const beatSec = (60 / cfg.bpm) * (4 / cfg.meter.denominator);
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const cellSec = cell.bars * 4 * beatSec;
  const cycleSec = construct ? cellSec * 2 : cellSec;
  const shift = (cell.startBeat || 0) * beatSec;     // D3 displacement flag
  const rScale = cell.rhythmScale || 1;              // D3 augment/diminish flag
  const notes = [];
  const sections = construct
    ? [{ name: `Call — ${cell.label}`, number: 1, time: 0 }, { name: 'Your answer', number: 2, time: Number(cellSec.toFixed(6)) }]
    : [{ name: `${cell.label} — ${cfg.key}`, number: 1, time: 0 }];
  for (let pass = 0; pass * cycleSec < totalTime - 0.001; pass++) {
    const base = pass * cycleSec + shift;
    for (let i = 0; i < r.placed.length; i++) {
      const p = r.placed[i];
      const t = base + p.beat * beatSec * rScale;
      if (t >= totalTime - 1e-3) continue;
      const sus = Math.max(0.05, p.d * beatSec * rScale * 0.9);
      const art = p.st;
      // Bass ADAPT (D11 + the blues device map): the lower voice IS the bass
      // line — play the stack token as the main note, no dyads.
      /** @type {{s: number, f: number}} */
      let main = p;
      let group = p.stack;
      if (bass && p.stack && p.stack.length) { main = p.stack[0]; group = []; }
      const tag = (group && group.length) ? `m${pass}_${i}` : undefined;
      notes.push(noteDefaults(Object.assign({
        t: Number(t.toFixed(6)), s: main.s, f: main.f, sus,
        ho: !!art.ho, po: !!art.po, vb: !!art.vb, ac: !!art.ac, mt: !!art.mt, pm: !!art.pm,
        bn: art.bn || 0, bt: art.bt || 0,
        sl: art.sl != null ? art.sl : -1, slu: art.slu != null ? art.slu : -1,
      }, tag ? { ch: tag } : null)));
      if (!bass) for (const q of (group || [])) {
        notes.push(noteDefaults({ t: Number(t.toFixed(6)), s: q.s, f: q.f, sus, ch: tag }));
      }
    }
  }
  if (!notes.length) throw new Error('No motif notes generated.');
  // The cell OWNS its harmony (D2): backing + timeline come from the cell's
  // prog/scale (the pre-assembled buildKeyCycleChart pattern), so a Custom-
  // mode progression pick can never disagree with the device. Pre-swung here
  // for the same reason — makeBundle skips its swing when backing rides in.
  const cfgM = Object.assign({}, cfg, { progression: cell.prog || cfg.progression, scale: cell.scale || cfg.scale, chordOverride: cell.chordOverride || cfg.chordOverride });
  const rawBack = buildAccompanimentEvents(cfgM, totalTime);
  const sw = swingNotesBacking(notes, rawBack, cfgM);
  return { notes: sw.notes, chords: [], chordTemplates: [], handShapes: [], sections,
    duration: totalTime, backingEvents: sw.backing, timeline: compileChordTimeline(cfgM, totalTime) };
}
