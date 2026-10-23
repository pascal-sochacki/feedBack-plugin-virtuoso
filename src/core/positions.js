// SPDX-License-Identifier: AGPL-3.0-only
import { NOTE_ALIASES } from './pitch.js';
import { SCALE_INTERVALS } from './scale-intervals.js';
import { openMidisForConfig } from './instrument-tuning.js';

/**
 * @typedef {{s: number, f: number, midi: number, pc?: number, fg?: number}} Position
 * @typedef {import('./instrument-tuning.js').InstrumentTuningConfig & {key: string, scale: string, stringCount: number, fretMin: number, fretMax: number, fretboardSystem?: string, shapeNotes?: {s: number, f: number, fg?: number}[] | null}} PositionConfig
 */

/** @param {PositionConfig} cfg */
export function scalePcs(cfg) { const keyPc = NOTE_ALIASES[cfg.key] ?? 0; return (SCALE_INTERVALS[cfg.scale] || SCALE_INTERVALS.major).map(i => (keyPc + i) % 12); }

// Find the {s, f, midi} within [fretMin, fretMax] whose pitch class matches
// targetPc and whose MIDI pitch is closest to prevMidi. Used by guide tones
// for voice-leading — each successive guide tone takes the nearest occurrence
// rather than jumping to an arbitrary octave.
/** @param {number} targetPc @param {number} prevMidi @param {number[]} openMidis @param {number} fretMin @param {number} fretMax */
export function nearestPositionForPc(targetPc, prevMidi, openMidis, fretMin, fretMax) {
  const normPc = ((targetPc % 12) + 12) % 12;
  const options = [];
  for (let s = 0; s < openMidis.length; s++) {
    for (let f = Math.max(0, fretMin); f <= Math.min(24, fretMax); f++) {
      const midi = openMidis[s] + f;
      if (((midi % 12) + 12) % 12 === normPc) options.push({ s, f, midi });
    }
  }
  if (!options.length) return null;
  // Closest pitch to prevMidi wins; on a tie (the same pitch is reachable at
  // two string/fret spots, e.g. D2 at low-E fret 10 or D-string fret 0) prefer
  // the LOWER fret so lines stay in a comfortable, low hand position instead of
  // drifting up the neck. Used by walking bass, guide tones, shell voicings.
  let best = options[0], bestDist = Math.abs(options[0].midi - prevMidi);
  for (let i = 1; i < options.length; i++) {
    const d = Math.abs(options[i].midi - prevMidi);
    if (d < bestDist || (d === bestDist && options[i].f < best.f)) { best = options[i]; bestDist = d; }
  }
  return best;
}

/** @param {number} pc @param {PositionConfig} cfg */
export function positionsForPitchClass(pc, cfg) {
  const opens = openMidisForConfig(cfg), out = [];
  for (let s = 0; s < cfg.stringCount; s++) for (let f = cfg.fretMin; f <= cfg.fretMax; f++) {
    const midi = opens[s] + f;
    if (midi % 12 === pc) out.push({ s, f, midi, pc });
  }
  return out.sort((a,b) => a.midi - b.midi || a.s - b.s || a.f - b.f);
}

/** @param {PositionConfig} cfg */
export function allScalePositions(cfg) {
  const pcs = new Set(scalePcs(cfg));
  const opens = openMidisForConfig(cfg);
  const chosen = [], usedMidi = new Set();
  let lastMidi = -Infinity;
  for (let s = 0; s < cfg.stringCount; s++) {
    const candidates = [];
    for (let f = cfg.fretMin; f <= cfg.fretMax; f++) {
      const midi = opens[s] + f, pc = midi % 12;
      if (pcs.has(pc)) candidates.push({ s, f, midi, pc });
    }
    candidates.sort((a,b) => a.midi - b.midi || a.f - b.f);
    const picks = [];
    for (const p of candidates) {
      if (p.midi <= lastMidi || usedMidi.has(p.midi)) continue;
      picks.push(p);
      if (picks.length >= 3) break;
    }
    if (picks.length < 3) {
      for (const p of candidates) {
        if (usedMidi.has(p.midi) || picks.some(x => x.s === p.s && x.f === p.f)) continue;
        picks.push(p);
        if (picks.length >= 3) break;
      }
    }
    picks.sort((a,b) => a.midi - b.midi || a.f - b.f);
    for (const p of picks) {
      if (usedMidi.has(p.midi)) continue;
      chosen.push(p); usedMidi.add(p.midi);
      if (p.midi > lastMidi) lastMidi = p.midi;
    }
  }
  if (chosen.length > 1) return chosen;
  return everyScalePosition(cfg).filter((p, index, arr) => arr.findIndex(x => x.midi === p.midi) === index);
}

/** @param {PositionConfig} cfg */
export function everyScalePosition(cfg) {
  const pcs = new Set(scalePcs(cfg));
  const opens = openMidisForConfig(cfg);
  const out = [];
  for (let s = 0; s < cfg.stringCount; s++) for (let f = cfg.fretMin; f <= cfg.fretMax; f++) {
    const midi = opens[s] + f, pc = midi % 12;
    if (pcs.has(pc)) out.push({ s, f, midi, pc });
  }
  return out.sort((a,b) => a.midi - b.midi || a.s - b.s || a.f - b.f);
}

/** @param {PositionConfig} cfg */
export function singleStringScalePositions(cfg) {
  const pcs = new Set(scalePcs(cfg));
  const opens = openMidisForConfig(cfg);
  /** @type {Position[]} */
  let best = [];
  for (let s = 0; s < cfg.stringCount; s++) {
    const row = [];
    for (let f = cfg.fretMin; f <= cfg.fretMax; f++) {
      const midi = opens[s] + f, pc = midi % 12;
      if (pcs.has(pc)) row.push({ s, f, midi, pc });
    }
    if (row.length > best.length) best = row;
  }
  return best.sort((a,b) => a.midi - b.midi || a.f - b.f);
}

// Drop unison duplicates (same pitch on two strings) from a position list,
// keeping the first occurrence. Positions are expected midi-ascending, so the
// lower string/fret wins. Enforces the no-unison rule for any run — scales and
// arpeggios alike, regardless of which resolver produced the positions.
/** @template {Position} T @param {T[]} positions */
export function dedupeUnisons(positions) {
  const out = [], used = new Set();
  for (const p of positions) {
    if (!p || used.has(p.midi)) continue;
    used.add(p.midi);
    out.push(p);
  }
  return out;
}

// Convert a shape's note list (s/f/d/isRoot/fg) into the {s,f,midi,pc,fg}
// shape the chart generators expect. `fg` (fret-hand finger 0–4) rides along
// from the validated resolvers — it was silently dropped here until the
// 2026-06-06 hand-marks panel found the severed line (the honesty rule:
// fingering is emitted ONLY where a validated source provides it).
/** @param {PositionConfig} cfg @param {{s: number, f: number, fg?: number}[]} shapeNotes */
export function shapeNotesToPositions(cfg, shapeNotes) {
  const opens = openMidisForConfig(cfg);
  const mapped = shapeNotes
    .filter(n => n.s >= 0 && n.s < cfg.stringCount)
    .map(n => {
      const midi = opens[n.s] + n.f;
      /** @type {Position} */
      const p = { s: n.s, f: n.f, midi, pc: midi % 12 };
      if (n.fg != null) p.fg = n.fg;
      return p;
    })
    .sort((a, b) => a.midi - b.midi || a.s - b.s || a.f - b.f);
  // No-unison guard at the run/seam layer: a pitch must sound only once even
  // when shapes are stitched together (combined positions, arpeggio + scale).
  // Resolvers already avoid intra-shape unisons; this also covers combinations.
  return dedupeUnisons(mapped);
}

/** @param {PositionConfig} cfg @returns {Position[]} */
export function scalePositionsForSystem(cfg) {
  // Shape-aware systems (caged / 3nps / open) come pre-resolved by readConfig
  // — return the shape's note set directly.
  if (cfg.shapeNotes && cfg.shapeNotes.length) {
    return shapeNotesToPositions(cfg, cfg.shapeNotes);
  }
  switch (cfg.fretboardSystem) {
    case 'single_string': return singleStringScalePositions(cfg);
    // full_neck is the one path that doesn't resolve through a unison-deduping
    // resolver (shape paths → shapeNotesToPositions; position → allScalePositions
    // unique-midi). everyScalePosition collects every fret across the neck, so a
    // pitch recurs on multiple strings — dedupe to one ascending pass (no-unison rule).
    // FRET-COUNT ASSUMPTION: this sweeps a fixed 0–24 neck. Virtuoso has no
    // instrument fret-count model (MAX_FRET=36 is only an input sanity-clamp, not a
    // real neck length), so the top of this run reaches fret ~24 — playable on 24-fret
    // guitars but past the end of 21/22-fret necks (most Fender/Gibson). Accepted by
    // decision (2026-05-31): leave at 24. Future option if it matters: add a per-
    // instrument `frets` field to STRING_SETUPS and clamp fretMax to it here.
    case 'full_neck': return dedupeUnisons(everyScalePosition(Object.assign({}, cfg, { fretMin:0, fretMax:24 })));
    case 'position':
    default: {
      const pos = allScalePositions(cfg);
      // Bass fretting-hand numbering (bass-pedagogy ruling 2026-06-06): the
      // dual regime — 1-2-4 (Simandl-derived) below an index anchor of fret 5,
      // one-finger-per-fret above — applied per BOX, never per note. Guitar
      // position boxes emit NO fingering (honesty rule: no validated source
      // → omit); bass's rule IS the validated source. Bass must never route
      // through scaleFingerFor (its G→B nudge is guitar-only).
      if (String(cfg.stringSetup || '').indexOf('bass') === 0) applyBassFingering(pos);
      return pos;
    }
  }
}

/** @param {number} f @param {number} anchor */
export function bassFingerFor(f, anchor) {
  if (f === 0) return 0;
  if (anchor >= 5) { const fg = f - anchor + 1; return (fg >= 1 && fg <= 4) ? fg : null; }
  const off = f - anchor;                       // low position: three ascending frets = 1-2-4
  return off === 0 ? 1 : off === 1 ? 2 : off === 2 ? 4 : null;   // wider = a shift, not a stretch
}

/** @template {Position} T @param {T[]} positions */
export function applyBassFingering(positions) {
  const fretted = positions.filter(p => p.f > 0);
  if (!fretted.length) return positions;
  const anchor = Math.min(...fretted.map(p => p.f));
  for (const p of positions) {
    const fg = bassFingerFor(p.f, anchor);
    if (fg != null) p.fg = fg;                  // out-of-regime frets stay unmarked (honest)
  }
  return positions;
}
