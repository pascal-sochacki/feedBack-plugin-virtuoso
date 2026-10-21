// SPDX-License-Identifier: AGPL-3.0-only
import { SCALE_INTERVALS } from './scale-intervals.js';
import { NOTE_ALIASES } from './pitch.js';
import { compileChordTimeline } from './chord-timeline.js';
import { measureSeconds } from './timing.js';
import { isBassCfg } from './instrument-tuning.js';
import { nearestPositionForPc } from './positions.js';

// ── MOTIF_CELLS — the riff-vocabulary engine ─────────────────────────────────
// (Charette 2026-06-12; schema docs/plugin/design/riff-vocabulary-roundtable.md §1, process
// docs/plugin/riff-vocabulary-playbook.md.) The pitch-bearing sibling of RHYTHM_CELLS:
// hand-authored 1–2-bar trademark genre DEVICES, degree-relative and key-free,
// drilled through keys/positions by buildMotifExercise. Devices not songs —
// every cell is a technique device, a traditional common-stock figure, or an
// original exemplar written in-style; never a transcription (the legal +
// north-star bright lines). The arc per rung: NAME → DRILL → VARY → CONSTRUCT
// → JAM; the construct step rides the proven call_response surface (D13:
// response bars are genuinely empty = an unscored answer window).
//
// Cell shape (v1 — 4/4 only, D5):
//   { label, genres[], bars:1|2, bind:'static'|'changes', prog, scale,
//     range:{loMidi,hiMidi}, noFold, openPolicy, maxSpan, bpmCeiling,
//     startBeat, rhythmScale,
//     steps:[{ a:'key'|'chord'|'target', deg|chr, acc, tgt, oct, stack:[…],
//              d (beats), + art fields (sl/slu/ho/po/vb/ac/mt/pm/bn/bt) }] }
//   a    = the ANCHOR deg/chr measures from: 'key' (default — the key root,
//          exact-register), 'chord' (the cell-timeline event under the step's
//          onset), 'target' (a chord/guide tone of that event via
//          tgt:'R'|'3'|'5'|'7' — the enclosure machine).
//   deg  = diatonic degree of the cell's scale (+ acc ±1 alteration);
//   chr  = raw semitones from the anchor — chromatic approaches ONLY (keeps
//          spelling honest + transposition trivially correct).
//   stack = extra tokens sounded WITH the step (in-cell double-stops) —
//          emitted as same-t `ch`-tagged dyads on a DIFFERENT string.
// Time-variation = the two cell flags startBeat + rhythmScale ONLY (D3);
// pitch/ending variants are a SECOND authored cell. Author STRAIGHT — swing
// is the existing feel layer (swingNotesBacking / applySwingToBundle).
// v1 LIMITS (guarded at load so nothing ships silently broken): no pickup
// (anacrusis — D4, batch 2), no harmonyInterval (the twin-lead harmonize
// path — the metal slice), 4/4 only. The NO-UNISON guard deliberately does
// NOT apply here: a motif legitimately repeats pitches, and motif emission
// bypasses the shape resolver entirely.
/** @type {Record<string, import('./generation-types.js').MotifCell>} */
export const MOTIF_CELLS = {
  // Blues descending-3rds turnaround (traditional common-stock figure — the
  // token the HELD blues turnaround rung was gated on, blues-idiom device #1).
  // Parallel minor-3rd dyads walk chromatically down over the I — top voice
  // ♭7→6→♭6→5 over 5→♭5→4→3 — landing the I's 5th+3rd, then bar 2 breathes on
  // the root and approaches the V from a half-step above, landing its root
  // (the resolution the startup guard proves in all 12 keys). Bass ADAPT
  // (device map): the lower voice IS the bass line — single-note walkdown.
  blues_turnaround_thirds: {
    label: 'Descending-3rds turnaround', genres: ['blues'], bars: 2,
    bind: 'changes', prog: 'blues_turnaround', scale: 'mixolydian',
    chordOverride: 'dom7',   // blues I7/V7 — the device owns its quality too (D2; mixolydian's diatonic v is minor, which a turnaround is not)
    range: { loMidi: 52, hiMidi: 76 }, openPolicy: 'closed_required',
    maxSpan: 4, bpmCeiling: 140,
    steps: [
      // Bar 1 — over the I: the chromatic walkdown in parallel m3 dyads.
      { a:'key', deg:7,         d:1, stack:[{ deg:5 }] },           // ♭7 + 5
      { a:'key', deg:6,         d:1, stack:[{ deg:5, acc:-1 }] },   // 6  + ♭5
      { a:'key', deg:6, acc:-1, d:1, stack:[{ deg:4 }] },           // ♭6 + 4
      { a:'key', deg:5,         d:1, stack:[{ deg:3 }] },           // 5  + 3 — the I, landed
      // Bar 2 — the breath on the root, then "turn to the V".
      { a:'key',   deg:1, d:2 },
      { a:'chord', chr:1, d:0.5 },                                  // half-step above the V root
      { a:'chord', chr:0, d:1.5, ac:true },                         // land the V — the resolution step
    ],
  },
};

// Scale-degree → semitone offset for a motif token (deg is 1-based against
// the cell's scale; degrees past the scale length spill into the next octave).
/** @param {string} scale @param {number} deg @param {number | undefined} acc */
export function motifDegreeSemis(scale, deg, acc) {
  const iv = SCALE_INTERVALS[scale] || SCALE_INTERVALS.major;
  const d0 = Math.round(deg) - 1;
  const idx = ((d0 % iv.length) + iv.length) % iv.length;
  return iv[idx] + Math.floor(d0 / iv.length) * 12 + (/** @type {number} */ (acc) | 0);
}

// Place an EXACT midi in the fret window. Prefers staying near the previous
// fret (the hand stays put); excludeS keeps a stack partner off its main
// note's string (the same-onset same-string impossibility).
/** @param {number} midi @param {number[]} opens @param {number} fretLo @param {number} fretHi @param {number | null} prevF @param {Set<number> | null} excludeS */
export function motifPlaceMidi(midi, opens, fretLo, fretHi, prevF, excludeS) {
  let best = null;
  for (let s = 0; s < opens.length; s++) {
    if (excludeS && excludeS.has(s)) continue;
    const f = midi - opens[s];
    if (f < 0 || f > 24 || f < fretLo || f > fretHi) continue;
    const cost = prevF != null ? Math.abs(f - prevF) : f;
    if (!best || cost < best.cost) best = { s, f, midi, cost };
  }
  return best;
}

// Resolve ONE pass of a motif cell in a key/window → beat-timed placements.
// Pure (no DOM/host); shared by buildMotifExercise and the startup guard.
// The cell OWNS its progression (D2): the harmonic events of the pass come
// from the cell's prog/scale, so 'chord'/'target' anchors and the resolution
// check always read the device's own changes.
/** @param {import('./generation-types.js').MotifCell} cell @param {import('./instrument-tuning.js').InstrumentTuningConfig & Pick<import('./generation-types.js').GenerationConfig, 'key' | 'bpm' | 'chordDepth' | 'chordOverride'> & Partial<Pick<import('./generation-types.js').GenerationConfig, 'scale' | 'progression' | 'tritoneSub' | 'mode' | 'harmonicRhythm'>>} cfg @param {number[]} opens @param {number} fretLo @param {number} fretHi */
export function resolveMotifCell(cell, cfg, opens, fretLo, fretHi) {
  const keyPc = (((NOTE_ALIASES[cfg.key] != null ? NOTE_ALIASES[cfg.key] : 0) % 12) + 12) % 12;
  const scale = cell.scale || cfg.scale || 'major';
  const cellCfg = Object.assign({}, cfg, {
    progression: cell.prog || cfg.progression || 'static_i',
    scale, bars: cell.bars,
    chordOverride: cell.chordOverride || cfg.chordOverride,
    meter: { numerator: 4, denominator: 4, grouping: [4] },   // v1 cells are 4/4 (D5)
  });
  const events = compileChordTimeline(cellCfg, cell.bars * measureSeconds(cellCfg));
  /** @param {number} beat */
  const evAt = (beat) => {
    for (const e of events) if (beat >= e.startBeat - 1e-6 && beat < e.startBeat + e.durBeats - 1e-6) return e;
    return events[events.length - 1];
  };
  const range = cell.range || { loMidi: 48, hiMidi: 84 };
  const center = (range.loMidi + range.hiMidi) / 2 - (isBassCfg(cfg) ? 12 : 0);
  // Candidate key-root registers reachable in the window, nearest the cell's
  // preferred register first; first candidate that places every step wins
  // (octave-FOLD only as the fallback round — fold, never clip).
  const rootSet = new Set();
  for (let s = 0; s < opens.length; s++) for (let f = Math.max(0, fretLo); f <= Math.min(24, fretHi); f++) {
    const m = opens[s] + f;
    if (((m % 12) + 12) % 12 === keyPc) rootSet.add(m);
  }
  const rootCands = Array.from(rootSet).sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
  if (!rootCands.length) throw new Error(`[Virtuoso motif] no ${cfg.key} root reachable in frets ${fretLo}-${fretHi}`);
  /** @param {number} rootMidi @param {boolean} allowFold */
  const attempt = (rootMidi, allowFold) => {
    const placed = [];
    let beatCur = 0;
    /** @type {number | null} */
    let prevF = null;
    let prevMidi = rootMidi;
    /** @param {import('./generation-types.js').MotifToken} tok @param {number} anchorMidi @param {Set<number> | null} exclude @param {number | null} nearF */
    const place = (tok, anchorMidi, exclude, nearF) => {
      const oct12 = 12 * (tok.oct || 0);
      const semis = (tok.deg != null ? motifDegreeSemis(scale, tok.deg, tok.acc) : 0) + (tok.chr || 0);
      const midi = anchorMidi + semis + oct12;
      let p = motifPlaceMidi(midi, opens, fretLo, fretHi, nearF, exclude);
      if (!p && allowFold && !cell.noFold) p = motifPlaceMidi(midi + (midi > center ? -12 : 12), opens, fretLo, fretHi, nearF, exclude);
      return p;
    };
    for (const st of cell.steps) {
      let pl;
      if (st.a === 'chord' || st.a === 'target') {
        // pc-anchored: measured from the timeline event under this onset;
        // register by proximity to the running line (nearestPositionForPc,
        // the placement keystone walking bass / guide tones already use).
        const ev = evAt(beatCur);
        let basePc = ev.rootPc;
        if (st.a === 'target') {
          const ivs = (ev.intervals || []).map(i => ((i % 12) + 12) % 12);
          const t = String(st.tgt || '3');
          basePc = t === 'R' ? ev.rootPc
            : t === '5' ? (ev.rootPc + 7) % 12
            : t === '7' ? (ev.rootPc + (ivs.includes(10) ? 10 : 11)) % 12
            : (ev.rootPc + (ivs.includes(4) ? 4 : 3)) % 12;
        }
        const pc = (((basePc + (st.chr || 0) + (st.deg != null ? motifDegreeSemis(scale, st.deg, st.acc) : 0)) % 12) + 12) % 12;
        pl = nearestPositionForPc(pc, prevMidi + 12 * (st.oct || 0), opens, fretLo, fretHi);
        if (pl) pl = { s: pl.s, f: pl.f, midi: pl.midi };
      } else {
        pl = place(st, rootMidi, null, prevF);   // 'key': exact register from the root
      }
      if (!pl) return null;
      const used = new Set([pl.s]);
      const stackPl = [];
      for (const tok of (st.stack || [])) {
        const q = place(tok, rootMidi, used, pl.f);
        if (!q) return null;
        used.add(q.s); stackPl.push({ s: q.s, f: q.f, midi: q.midi });
      }
      placed.push({ beat: beatCur, d: st.d, s: pl.s, f: pl.f, midi: pl.midi, st, stack: stackPl });
      prevF = pl.f; prevMidi = pl.midi; beatCur += st.d;
    }
    return placed;
  };
  let placed = null;
  for (const rm of rootCands) { placed = attempt(rm, false); if (placed) break; }
  if (!placed) for (const rm of rootCands) { placed = attempt(rm, true); if (placed) break; }
  if (!placed) throw new Error(`[Virtuoso motif] cell does not resolve in frets ${fretLo}-${fretHi} (key ${cfg.key})`);
  return { placed, events };
}
