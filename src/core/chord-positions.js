// SPDX-License-Identifier: AGPL-3.0-only
import { TEMPLATE_QUALITIES, MODE_FOR_QUALITY } from './harmony.js';
import { CAGED_SHAPES } from './fretboard-shapes.js';
import { openMidisForConfig } from './instrument-tuning.js';
import { CHORD_FORMULAS } from './chord-theory.js';
import { positionsForPitchClass } from './positions.js';
import { SCALE_INTERVALS } from './scale-intervals.js';

/** @param {string} quality */
export function cagedShapeQualityKey(quality) {
  // Power chords + 9/11/13 extensions have no triad template — signal "skip the
  // template" so callers fall back to interval-derived voicing (root+5th for
  // power chords, full chord-tone set for extensions). Returning null makes
  // `def.chordTemplates[null]` undefined → the template functions return null.
  if (!TEMPLATE_QUALITIES.has(quality)) return null;
  if (quality === 'min' || quality === 'min7' || quality === 'min_maj7') return 'min';
  if (quality === 'dim' || quality === 'dim7' || quality === 'min7b5') return 'dim';
  return 'maj';
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {string} shape @param {string} quality @param {number} rootFret @returns {import('./generation-types.js').ChordPosition[] | null} */
export function cagedShapeNotesForChord(cfg, shape, quality, rootFret) {
  // CAGED chord-tone templates are a 6-string (EADGBE) system. Need ≥6 GUITAR
  // strings; bass 4/5 (<6) → null so the caller falls back — and bass at ANY
  // count → null: a 6-string bass passes the count guard but is all-4ths (no
  // G→B major 3rd), so the interval-baked template lands a semitone flat on the
  // top two strings (bass-pedagogy 2026-07-10). On a 7/8-string guitar the
  // template anchors on the TOP SIX strings (off = N-6), mirroring resolveCAGEDShape.
  if (cfg.instrument === 'bass' || cfg.stringCount < 6) return null;
  const def = CAGED_SHAPES[shape];
  if (!def) return null;
  const tmpl = def.chordTemplates[/** @type {string} */ (cagedShapeQualityKey(quality))];
  if (!tmpl) return null;
  const opens = openMidisForConfig(cfg);
  const off = Math.max(0, cfg.stringCount - 6);
  const out = [];
  for (const note of tmpl) {
    // note.s is in low-E=0 6-string indexing; shift onto the top-six window.
    const s = note.s + off;
    if (s < 0 || s >= cfg.stringCount) continue;
    const f = rootFret + note.fOff;
    if (f < 0 || f > 24) continue;
    const midi = opens[s] + f;
    out.push({ s, f, midi, pc:midi % 12, interval:note.iv });
  }
  out.sort((a, b) => a.midi - b.midi || a.s - b.s);
  return out;
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {string} shape @param {number} rootPc @param {number | null} prevRootFret @param {string} mode */
export function pickShapeRootFret(cfg, shape, rootPc, prevRootFret, mode) {
  const def = CAGED_SHAPES[shape];
  if (!def) return null;
  // def.rootStringIdx is low-E=0 6-string indexing; on a 7/8-string the shape is
  // anchored on the top-six (off = N-6), so the anchor string shifts up too —
  // otherwise the root fret would be computed off the low B/F#, not the EADGBE
  // 'low E'. Mirrors resolveCAGEDShape / cagedShapeNotesForChord.
  const off = Math.max(0, cfg.stringCount - 6);
  const rootStringIdx = def.rootStringIdx + off;
  if (rootStringIdx < 0 || rootStringIdx >= cfg.stringCount) return null;
  const opens = openMidisForConfig(cfg);
  const anchorPc = ((opens[rootStringIdx] % 12) + 12) % 12;
  const baseFret = (((rootPc - anchorPc) % 12) + 12) % 12;
  // Generate candidate frets across the neck (baseFret + 0/12, plus -12/+24 for headroom)
  const options = [];
  for (let octShift = -1; octShift <= 2; octShift++) {
    const f = baseFret + octShift * 12;
    // Leave ~4 frets of headroom at the top so the shape extension fits
    if (f >= 0 && f <= 20) options.push(f);
  }
  if (!options.length) return baseFret;
  if (prevRootFret == null || prevRootFret < 0) {
    // First chord: lowest valid fret (matches user's example: C in C-shape starts at fret 3)
    return Math.min.apply(null, options);
  }
  if (mode === 'ascend') {
    const above = options.filter(f => f > prevRootFret);
    if (above.length) return Math.min.apply(null, above);
    // Ran out of neck — fall back to closest as a safety net
  }
  if (mode === 'nearest_low') {
    // Fixed-shape / economy comping: prefer the playable low-position octave —
    // nearest among candidates ≤ fret 12 (barre-lesson territory); go higher
    // only when no low candidate exists. Without this an A-shape I–IV–V in G
    // walked G→C→D to frets 10→15→17 (nearest-anchor overshoot into the dusty
    // end of the neck; caught dogfooding the Chords ladder 2026-06-06).
    const low = options.filter(f => f <= 12);
    const pool = low.length ? low : options;
    let bf = pool[0], bd = Math.abs(pool[0] - prevRootFret);
    for (const f of pool) { const d = Math.abs(f - prevRootFret); if (d < bd) { bf = f; bd = d; } }
    return bf;
  }
  let best = options[0], bestDist = Math.abs(options[0] - prevRootFret);
  for (let i = 1; i < options.length; i++) {
    const d = Math.abs(options[i] - prevRootFret);
    if (d < bestDist) { best = options[i]; bestDist = d; }
  }
  return best;
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality @returns {import('./generation-types.js').ChordPosition[]} */
export function pickChordPositions(cfg, rootPc, quality) {
  const formula = CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj, picked = [], used = new Set();
  for (const interval of formula.intervals) {
    const pc = (rootPc + interval) % 12, candidates = positionsForPitchClass(pc, cfg);
    const next = candidates.find(p => !used.has(`${p.s}:${p.f}`)) || candidates[0];
    if (next) { picked.push(Object.assign({}, next, { interval })); used.add(`${next.s}:${next.f}`); }
  }
  return picked.sort((a,b) => a.midi - b.midi || a.s - b.s);
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality @returns {import('./generation-types.js').ChordPosition[]} */
export function chordTonePositionsInPosition(cfg, rootPc, quality) {
  const formula = CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj;
  const intervalPcs = formula.intervals.map(interval => ({ interval, pc:(rootPc + interval) % 12 }));
  const chordPcs = new Set(intervalPcs.map(x => x.pc));
  const opens = openMidisForConfig(cfg);
  const out = [];
  const usedMidi = new Set();
  for (let s = 0; s < cfg.stringCount; s++) {
    for (let f = cfg.fretMin; f <= cfg.fretMax; f++) {
      const midi = opens[s] + f, pc = midi % 12;
      if (!chordPcs.has(pc) || usedMidi.has(midi)) continue;
      const match = intervalPcs.find(x => x.pc === pc) || { interval:0 };
      out.push({ s, f, midi, pc, interval:match.interval });
      usedMidi.add(midi);
    }
  }
  out.sort((a,b) => a.midi - b.midi || a.s - b.s || a.f - b.f);
  if (out.length) return out;
  return pickChordPositions(cfg, rootPc, quality);
}

// Build a chord template from canonical CAGED shape data — preferred path when
// the generator knows which CAGED shape it's working in. Produces the full
// chord voicing (all strings the shape covers, not just the strings the
// generator happened to play) with sensible fingerings.
/** @param {string} name @param {string} shape @param {string} quality @param {number} rootFret @param {import('./generation-types.js').GenerationConfig} cfg @param {boolean} arp */
export function templateFromShape(name, shape, quality, rootFret, cfg, arp) {
  // 6-string (EADGBE) template; need ≥6 GUITAR strings (a 6-string bass passes
  // the count but its all-4ths tuning breaks the template intervals — see
  // cagedShapeNotesForChord). On 7/8 it sits on the top-six (off = N-6) so the
  // chord box matches the anchored CAGED shape.
  if (cfg.instrument === 'bass' || cfg.stringCount < 6) return null;
  const def = CAGED_SHAPES[shape];
  if (!def) return null;
  const tmpl = def.chordTemplates[/** @type {string} */ (cagedShapeQualityKey(quality))];
  if (!tmpl) return null;
  const off = Math.max(0, cfg.stringCount - 6);
  const frets = new Array(cfg.stringCount).fill(-1);
  const fingers = new Array(cfg.stringCount).fill(-1);
  for (const ent of tmpl) {
    const s = ent.s + off;
    if (s < 0 || s >= cfg.stringCount) continue;
    const f = rootFret + ent.fOff;
    if (f < 0 || f > 24) return null;
    frets[s] = f;
    fingers[s] = f === 0 ? 0 : (ent.fg ?? 1);
  }
  return { name, displayName:`${name} (${def.displayName})`, arp:!!arp, fingers, frets };
}

// Fallback when no shape context is available. Ranks distinct non-zero frets
// ascending — the lowest gets finger 1 (index / barre), next gets 2, etc.
// Strings sharing the same fret share the same finger (indicates a barre).
// Better than the previous "every string gets finger 1" but not perfect for
// shapes with non-contiguous same-fret strings; use templateFromShape when
// the CAGED shape is known.
/** @param {string} name @param {{s: number, f: number}[]} positions @param {import('./generation-types.js').GenerationConfig} cfg @param {boolean} arp */
export function templateFromPositions(name, positions, cfg, arp) {
  const frets = new Array(cfg.stringCount).fill(-1), fingers = new Array(cfg.stringCount).fill(-1);
  for (const p of positions) {
    if (!p || p.s < 0 || p.s >= cfg.stringCount) continue;
    if (frets[p.s] === -1 || p.f < frets[p.s]) frets[p.s] = p.f;
  }
  // Heuristic fingering, pedagogy-passed (hand-marks Slice 3; the honesty
  // rule): fingers are emitted only when the diagram is actually GRIPPABLE —
  // a fretted span of ≤4 frets (one hand). Within that, finger = fret OFFSET
  // from the lowest fretted fret (one-finger-per-fret): a same-fret row
  // shares one finger (the barre — legal) and a finger can never land on two
  // different frets (the double-booked class the strum-grip guard polices).
  // The old distinct-fret RANK mis-fingered barres (a root-5 power grip got
  // index+middle instead of index+ring) and "fingered" arpeggio tone
  // collections spanning 7+ frets as if one hand could grip them — a wrong
  // digit misteaches; omission is honest (the run's per-note fg carries the
  // real fingering).
  const fretted = frets.filter(f => f > 0);
  if (fretted.length && Math.max.apply(null, fretted) - Math.min.apply(null, fretted) <= 3) {
    const minF = Math.min.apply(null, fretted);
    for (let s = 0; s < cfg.stringCount; s++) {
      if (frets[s] === -1) continue;
      fingers[s] = frets[s] === 0 ? 0 : Math.min(4, frets[s] - minF + 1);
    }
  }
  return { name, displayName:name, arp:!!arp, fingers, frets };
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality @returns {import('./positions.js').Position[]} */
export function chordScalePositions(cfg, rootPc, quality) {
  const scaleName = (CHORD_FORMULAS[quality] && CHORD_FORMULAS[quality].mode) || MODE_FOR_QUALITY[quality] || 'major';
  const intervals = SCALE_INTERVALS[scaleName] || SCALE_INTERVALS.major;
  const pcs = new Set(intervals.map(i => (rootPc + i) % 12));
  const opens = openMidisForConfig(cfg);
  // One position per pitch (prefer the lower fret) so a chord-scale RUN never
  // re-sounds the same pitch on two strings — the no-unison rule, matching the
  // CAGED/Open resolvers. (This previously kept every duplicate, which let
  // Connect lines re-finger an identical pitch across adjacent strings.)
  const byMidi = new Map();
  for (let s = 0; s < cfg.stringCount; s++) for (let f = cfg.fretMin; f <= cfg.fretMax; f++) {
    const midi = opens[s] + f, pc = midi % 12;
    if (!pcs.has(pc)) continue;
    const e = byMidi.get(midi);
    if (!e || f < e.f) byMidi.set(midi, { s, f, midi, pc });
  }
  return [...byMidi.values()].sort((a,b) => a.midi - b.midi || a.s - b.s || a.f - b.f);
}

// Constrain a resolved sweep position set to the top N (highest-pitched) strings —
// the entry-rung "3-string sweep" (G-B-e triad) before the full box. Keeps the N
// highest string indices present (s=high e is the topmost). Returns the input
// unchanged when N is falsy or ≥ the strings already present.
/** @template {{s: number}} T @param {T[]} positions @param {number | undefined} n */
export function sliceSweepTopStrings(positions, n) {
  if (!n || !positions || !positions.length) return positions;
  const strings = [...new Set(positions.map(p => p.s))].sort((a, b) => b - a);
  if (n >= strings.length) return positions;
  const keep = new Set(strings.slice(0, n));
  return positions.filter(p => keep.has(p.s));
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality @param {number} anchorFret @returns {import('./generation-types.js').ChordPosition[]} */
export function sweepArpeggioPositions(cfg, rootPc, quality, anchorFret) {
  const formula = CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj;
  // Chord tones as pitch-classes in ASCENDING interval order: R, 3, 5, (7)…
  // We lay ONE chord tone per string in this cycle so EVERY tone is sounded — a
  // seventh sweep must rake the 7th, not skip it. (The old "nearest of ANY chord
  // tone per string" greedy repeated root/3rd/5th and dropped the 7th on most
  // chords — caught by probe-sweep-bass-ladders.) The bass string takes the root
  // (cycle index 0); each higher string takes the next tone nearest the running
  // fret, so the shape stays contiguous (a real sweepable grip).
  const tonePcs = [...new Set(formula.intervals.map(iv => (rootPc + iv) % 12))];
  const opens = openMidisForConfig(cfg), out = [];
  const fLo = Math.max(0, cfg.fretMin), fHi = Math.min(24, cfg.fretMax);
  // Contain the sweep window to the top-six on a 7/8-string (off = N-6), so the
  // default extended-range sweep is the canonical top-six grip rather than an
  // all-strings rake rooted on the low B/F# (the extra low string(s) are opt-in
  // range). off=0 on ≤6-string, so bass/6-string sweep every string as before.
  const off = Math.max(0, cfg.stringCount - 6);
  const bassStr = off; // lowest string of the sweep window — the bass anchor
  // Nearest fret on string s sounding pitch-class pc, to a reference fret.
  /** @param {number} s @param {number} pc @param {number} ref */
  const nearestPc = (s, pc, ref) => {
    let bf = null, bd = Infinity;
    for (let f = fLo; f <= fHi; f++) {
      if (((opens[s] + f) % 12) !== pc) continue;
      const d = Math.abs(f - ref);
      if (d < bd) { bf = f; bd = d; }
    }
    return bf == null ? null : { s, f: bf, midi: opens[s] + bf, pc, d: bd };
  };
  // COVERAGE-FIRST selection (so a seventh sweep actually rakes the 7th): the
  // bass string anchors on the ROOT; each higher string then prefers an UNCOVERED
  // chord tone, nearest the running fret, until all tones are sounded — then takes
  // the nearest tone. Distance-to-ref keeps the shape contiguous/compact. (A plain
  // "nearest of any tone" greedy repeated root/3rd/5th and dropped the 7th when it
  // was never the closest — caught by probe-sweep-bass-ladders.)
  const covered = new Set();
  let prevFret = anchorFret;
  for (let s = off; s < cfg.stringCount; s++) {
    const ref = (s === bassStr) ? anchorFret : prevFret;
    const cands = /** @type {NonNullable<ReturnType<typeof nearestPc>>[]} */ (tonePcs.map(pc => nearestPc(s, pc, ref)).filter(Boolean));
    if (!cands.length) continue;
    let pick;
    if (s === bassStr) {
      pick = cands.find(c => c.pc === rootPc) || cands.slice().sort((a, b) => a.d - b.d)[0];
    } else {
      const uncovered = cands.filter(c => !covered.has(c.pc));
      pick = (uncovered.length ? uncovered : cands).slice().sort((a, b) => a.d - b.d)[0];
    }
    out.push({ s: pick.s, f: pick.f, midi: pick.midi, pc: pick.pc });
    covered.add(pick.pc);
    prevFret = pick.f;
  }
  return out;
}

/** @param {import('./generation-types.js').ChordPosition} apexPos @param {import('./generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality @returns {import('./generation-types.js').ChordPosition[]} */
export function sweepTurnaroundNotes(apexPos, cfg, rootPc, quality) {
  const opens = openMidisForConfig(cfg);
  const formula = CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj;
  const intervalPcSet = new Set(formula.intervals.map(iv => (rootPc + iv) % 12));
  // Cap the turnaround reach at +3 frets: a HO/PO to +5 above the apex is an
  // impossible stretch low on the neck (validated by fretboard-pedagogy review).
  for (let f = apexPos.f + 1; f <= Math.min(24, apexPos.f + 3); f++) {
    const pc = (opens[apexPos.s] + f) % 12;
    if (intervalPcSet.has(pc)) {
      return [
        { s:apexPos.s, f, midi:opens[apexPos.s] + f, pc, ho:true },
        { s:apexPos.s, f:apexPos.f, midi:opens[apexPos.s] + apexPos.f, pc:apexPos.pc, po:true }
      ];
    }
  }
  return [];
}

/** @param {import('./generation-types.js').ChordPosition[]} positions @param {import('./generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality */
export function buildSweepPathWithHopo(positions, cfg, rootPc, quality) {
  // Virtuoso convention: s=0 is the LOWEST string (low E), s=last is the
  // highest (high e). sweepArpeggioPositions returns them built s=0→s=last,
  // i.e. ALREADY in low-E→high-e (ascending) order — so the ascending sweep
  // is the array as-is, NOT reversed.
  const ascending = positions.slice();          // low E (bass/root) → high e (apex)
  const apexPos = ascending[ascending.length - 1]; // highest string = apex of the sweep
  const turnaround = apexPos ? sweepTurnaroundNotes(apexPos, cfg, rootPc, quality) : [];
  // Descending leg: from the string just below the apex back down to the low E.
  // Skip the apex itself — the HO/PO turnaround already covers it.
  const descending = ascending.slice(0, -1).reverse();
  if (turnaround.length) {
    return [...ascending, ...turnaround, ...descending];
  }
  return [...ascending, ...descending.slice(1)];
}
