// SPDX-License-Identifier: AGPL-3.0-only
import { openMidisForConfig } from './instrument-tuning.js';
import { chordName } from './harmony.js';
import { templateFromPositions, cagedShapeNotesForChord, cagedShapeQualityKey, pickShapeRootFret, templateFromShape } from './chord-positions.js';
import { CAGED_SHAPES } from './fretboard-shapes.js';

// ── STRUM_GRIPS — movable 7th / 9th / 11th / 13th / sus voicings (Phase B) ───
// strum_comp voices triads from CAGED_SHAPES.chordTemplates (maj/min/dim only):
// 7ths there reduce to a triad and 9/11/13 produce NO grip. STRUM_GRIPS is the
// SEPARATE movable-shape table (per the harmony voicing spec — do NOT bloat
// CAGED_SHAPES, the scale resolver shares it) that supplies REAL extended grips;
// pickStrumGrip consults it BEFORE the triad fallback. Each grip is a standard
// movable barre/shape transcribed relative to a root fret:
//   s    = string, low-E = 0 (mapped onto the top six on a 7/8-string)
//   fOff = fret offset from the root fret (root sits at fOff 0 on the root string);
//          a negative fOff means a note BELOW the root fret (compact 9/13 shapes)
//   iv   = interval label (display / probe only)
//   fg   = fretting finger (1 index/barre … 4 pinky)
// `form` letter (E = root on low-E s0, A = root on A s1) lets a rung teach "the
// same quality two ways" the way the CAGED-shapes rung does. Rules baked in
// (harmony-theory + guitar-pedagogy pre-build specs, agent-memory):
//   • extensions live on the TOP strings — never a 6-string 9/11/13;
//   • a doubled pc is a true OCTAVE (different MIDI), never the same MIDI on two
//     strings (that is a unison = dead) — enforced by assertStrumGripsValid below;
//   • a guitar "11" is a min11 or a 9sus (true dom11 drops the 3rd) → the dominant
//     extension grip is labelled dom9, never "11".
/** @type {Record<string, import('./generation-types.js').StrumGrip[]>} */
export const STRUM_GRIPS = {
  // Foundation sevenths — E-form and A-form barre grips (the four 7th colors).
  dom7: [
    { form:'E', rootStr:0, notes:[ {s:0,fOff:0,iv:'R',fg:1},{s:1,fOff:2,iv:'5',fg:3},{s:2,fOff:0,iv:'♭7',fg:1},{s:3,fOff:1,iv:'3',fg:2},{s:4,fOff:0,iv:'5',fg:1},{s:5,fOff:0,iv:'R',fg:1} ] },
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:1},{s:2,fOff:2,iv:'5',fg:3},{s:3,fOff:0,iv:'♭7',fg:1},{s:4,fOff:2,iv:'3',fg:4},{s:5,fOff:0,iv:'5',fg:1} ] },
  ],
  min7: [
    { form:'E', rootStr:0, notes:[ {s:0,fOff:0,iv:'R',fg:1},{s:1,fOff:2,iv:'5',fg:3},{s:2,fOff:0,iv:'♭7',fg:1},{s:3,fOff:0,iv:'♭3',fg:1},{s:4,fOff:0,iv:'5',fg:1},{s:5,fOff:0,iv:'R',fg:1} ] },
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:1},{s:2,fOff:2,iv:'5',fg:3},{s:3,fOff:0,iv:'♭7',fg:1},{s:4,fOff:1,iv:'♭3',fg:2},{s:5,fOff:0,iv:'5',fg:1} ] },
  ],
  maj7: [
    { form:'E', rootStr:0, notes:[ {s:0,fOff:0,iv:'R',fg:1},{s:1,fOff:2,iv:'5',fg:4},{s:2,fOff:1,iv:'7',fg:3},{s:3,fOff:1,iv:'3',fg:2},{s:4,fOff:0,iv:'5',fg:1},{s:5,fOff:0,iv:'R',fg:1} ] },
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:1},{s:2,fOff:2,iv:'5',fg:3},{s:3,fOff:1,iv:'7',fg:2},{s:4,fOff:2,iv:'3',fg:4},{s:5,fOff:0,iv:'5',fg:1} ] },
  ],
  // vii of the harmonized-key lap.
  min7b5: [
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:1},{s:2,fOff:1,iv:'♭5',fg:2},{s:3,fOff:0,iv:'♭7',fg:1},{s:4,fOff:1,iv:'♭3',fg:3} ] },
  ],
  // Suspended color.
  sus2: [
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:1},{s:2,fOff:2,iv:'5',fg:3},{s:3,fOff:2,iv:'R',fg:4},{s:4,fOff:0,iv:'2',fg:1},{s:5,fOff:0,iv:'5',fg:1} ] },
  ],
  sus4: [
    { form:'E', rootStr:0, notes:[ {s:0,fOff:0,iv:'R',fg:1},{s:1,fOff:2,iv:'5',fg:3},{s:2,fOff:2,iv:'R',fg:3},{s:3,fOff:2,iv:'4',fg:3},{s:4,fOff:0,iv:'5',fg:1},{s:5,fOff:0,iv:'R',fg:1} ] },
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:1},{s:2,fOff:2,iv:'5',fg:2},{s:3,fOff:2,iv:'R',fg:3},{s:4,fOff:3,iv:'4',fg:4},{s:5,fOff:0,iv:'5',fg:1} ] },
  ],
  // Extensions — compact top-string shapes (omit the 5th, root carried by bass).
  // dom9 = the funk "E9/A9"; labelled dom9, never "11".
  dom9: [
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:2},{s:2,fOff:-1,iv:'3',fg:1},{s:3,fOff:0,iv:'♭7',fg:3},{s:4,fOff:0,iv:'9',fg:4} ] },
  ],
  min9: [
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:2},{s:2,fOff:-2,iv:'♭3',fg:1},{s:3,fOff:0,iv:'♭7',fg:3},{s:4,fOff:0,iv:'9',fg:4} ] },
  ],
  maj9: [
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:2},{s:2,fOff:-1,iv:'3',fg:1},{s:3,fOff:1,iv:'7',fg:3},{s:4,fOff:0,iv:'9',fg:4} ] },
  ],
  // min11 — the best-value extension grip (Am11 "x-0-0-0-1-0" form): barre + one finger.
  min11: [
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:1},{s:2,fOff:0,iv:'11',fg:1},{s:3,fOff:0,iv:'♭7',fg:1},{s:4,fOff:1,iv:'♭3',fg:2},{s:5,fOff:0,iv:'5',fg:1} ] },
  ],
  // dom13 — the big-band/blues V (R-3-♭7-9-13 on the top strings).
  dom13: [
    { form:'A', rootStr:1, notes:[ {s:1,fOff:0,iv:'R',fg:2},{s:2,fOff:-1,iv:'3',fg:1},{s:3,fOff:0,iv:'♭7',fg:3},{s:4,fOff:0,iv:'9',fg:3},{s:5,fOff:2,iv:'13',fg:4} ] },
  ],
};

// Pick one grabbable grip for a chord. Power chords build directly; extended
// qualities (7th/9th/11th/13th/sus) voice from STRUM_GRIPS; everything else
// voices from a CAGED triad grip. voicingPosition: 'open' (default, prefer the
// most open cowboy grip) | 'movable' (a fixed CAGED shape walked up the neck
// nearest the previous chord).
export const STRUM_SHAPE_ORDER = ['C','A','G','E','D'];

// A movable power-chord grip (root + 5th [+ octave]) on the low string-set —
// built directly from the interval geometry (CAGED has no power-chord template).
// Fret offsets are computed BY PITCH against the actual open-string intervals,
// not hardcoded (+2 assumed standard 4ths — WRONG in drop tunings, where the
// s0→s1 fifth collapses the grip to the iconic SAME-FRET one-finger barre:
// {s0:F, s1:F, s2:F} = root·5th·octave. The old +2 sounded root + MAJOR 6TH
// in every drop-X/DADGAD/Open-D tuning — a real wrong pitch. Guitar-pedagogy
// 2026-07-12: gate on the interval (opens[1]-opens[0] === 7 collapses; DADGAD
// and Open D are TRUE positives — the barre is the idiomatic voicing there),
// apply by default (in a drop tuning the barre is the only correct voicing),
// F=0 = a valid open voicing. templateFromPositions fingers a same-fret row
// as a shared-finger barre (fg 1) by construction.
/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality @param {number | null} prevRootFret */
export function powerChordGrip(cfg, rootPc, quality, prevRootFret) {
  const opens = openMidisForConfig(cfg);
  if (opens.length < 3) return null;
  const open0 = ((opens[0] % 12) + 12) % 12;
  let f = (((rootPc - open0) % 12) + 12) % 12;                 // 0..11 on the lowest string
  if (prevRootFret != null && prevRootFret >= 0 && f + 12 <= 12 &&
      Math.abs((f + 12) - prevRootFret) < Math.abs(f - prevRootFret)) f += 12;
  const fifthF = f + 7 - (opens[1] - opens[0]);                // 5th above root, on s1
  if (fifthF < 0) return null;                                 // hostile custom tuning — no grippable 5th
  const gripNotes = [{ s:0, f, midi:opens[0] + f }, { s:1, f:fifthF, midi:opens[1] + fifthF }];
  if (quality === '5oct') {
    const octF = f + 12 - (opens[2] - opens[0]);               // octave above root, on s2
    if (octF >= 0) gripNotes.push({ s:2, f:octF, midi:opens[2] + octF });
  }
  const name = chordName(rootPc, quality);
  return { shape:'power', rootFret:f, gripNotes, template:templateFromPositions(name, gripNotes, cfg, false) };
}

// Find the root fret for a STRUM_GRIPS form, honoring a note below the root fret
// (rejects any fret that would push a note below 0). Lowest valid on the first
// chord; nearest the previous root after that (smooth, no teleporting).
/** @param {import('./generation-types.js').GenerationConfig} cfg @param {import('./generation-types.js').StrumGrip} grip @param {number} rootPc @param {number | null} prevRootFret */
export function strumGripRootFret(cfg, grip, rootPc, prevRootFret) {
  const opens = openMidisForConfig(cfg);
  const off = Math.max(0, cfg.stringCount - 6);
  const sIdx = grip.rootStr + off;
  if (sIdx < 0 || sIdx >= cfg.stringCount) return null;
  const anchorPc = ((opens[sIdx] % 12) + 12) % 12;
  const base = (((rootPc - anchorPc) % 12) + 12) % 12;
  let minOff = 0, maxOff = 0;
  for (const n of grip.notes) { if (n.fOff < minOff) minOff = n.fOff; if (n.fOff > maxOff) maxOff = n.fOff; }
  const options = [];
  for (let oct = 0; oct <= 2; oct++) {
    const f = base + oct * 12;
    if (f + minOff >= 0 && f + maxOff <= 22) options.push(f);
  }
  if (!options.length) return null;
  if (prevRootFret == null || prevRootFret < 0) return Math.min.apply(null, options);
  let best = options[0], bd = Math.abs(options[0] - prevRootFret);
  for (const f of options) { const d = Math.abs(f - prevRootFret); if (d < bd) { best = f; bd = d; } }
  return best;
}

// Resolve a STRUM_GRIPS form at a root fret into {s,f,midi,pc,interval} notes
// (top-six window on a 7/8-string, mirroring cagedShapeNotesForChord). Returns
// null if the grip runs off the neck at this fret.
/** @param {import('./generation-types.js').GenerationConfig} cfg @param {import('./generation-types.js').StrumGrip} grip @param {number} rootFret */
export function resolveStrumGrip(cfg, grip, rootFret) {
  const opens = openMidisForConfig(cfg);
  const off = Math.max(0, cfg.stringCount - 6);
  const out = [];
  for (const n of grip.notes) {
    const s = n.s + off;
    if (s < 0 || s >= cfg.stringCount) continue;
    const f = rootFret + n.fOff;
    if (f < 0 || f > 24) return null;
    const midi = opens[s] + f;
    out.push({ s, f, midi, pc: ((midi % 12) + 12) % 12, interval: n.iv });
  }
  out.sort((a, b) => a.midi - b.midi || a.s - b.s);
  return out.length >= 3 ? out : null;
}

// Pick an extended grip (7th/9th/11th/13th/sus). fixedShape ('E'/'A') selects the
// form when movable; open mode scores the most-open grip across forms.
/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality @param {number | null} prevRootFret @param {import('./generation-types.js').GripOptions} opts */
export function pickExtendedStrumGrip(cfg, rootPc, quality, prevRootFret, opts) {
  const all = STRUM_GRIPS[quality];
  if (!all) return null;
  const forms = (opts.fixedShape && all.some(g => g.form === opts.fixedShape))
    ? all.filter(g => g.form === opts.fixedShape) : all;
  const name = chordName(rootPc, quality);
  let best = null;
  for (const grip of forms) {
    const rootFret = strumGripRootFret(cfg, grip, rootPc, prevRootFret);
    if (rootFret == null) continue;
    const gripNotes = resolveStrumGrip(cfg, grip, rootFret);
    if (!gripNotes) continue;
    const cand = { shape: grip.form, rootFret, gripNotes, template: templateFromPositions(name, gripNotes, cfg, false) };
    if (opts.fixedShape && forms.length === 1) { best = cand; break; }
    /** @param {import('./generation-types.js').ResolvedGrip} c */
    const score = c => c.gripNotes.filter(p => p.f === 0).length * 100 - Math.max.apply(null, c.gripNotes.map(p => p.f));
    if (!best || score(cand) > score(best)) best = cand;
  }
  return best;
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} rootPc @param {string} quality @param {number | null} prevRootFret @param {import('./generation-types.js').GripOptions} opts */
export function pickStrumGrip(cfg, rootPc, quality, prevRootFret, opts) {
  if (quality === '5' || quality === '5oct') return powerChordGrip(cfg, rootPc, quality, prevRootFret);
  if (STRUM_GRIPS[quality]) {
    const ext = pickExtendedStrumGrip(cfg, rootPc, quality, prevRootFret, opts);
    if (ext) return ext;   // else fall through to the CAGED triad reduction (off-neck edge)
  }
  const name = chordName(rootPc, quality);
  const shapes = opts.fixedShape ? [opts.fixedShape] : STRUM_SHAPE_ORDER;
  // Voice-economy mode ('economy', the Comping-the-Changes promise): from the
  // second chord on, pick the grip NEAREST the previous one across ALL five
  // shapes — the "hand barely moves" comping skill. The first chord (no prev)
  // falls through to open scoring for a natural starting grip.
  const economy = !opts.fixedShape && opts.economy && prevRootFret != null && prevRootFret >= 0;
  // Triad-completeness (guitar-pedagogy review 2026-06-06, must-fix #1): a
  // strummable grip must sound ≥3 DISTINCT pitch classes including the root.
  // Low rootFrets drop template notes below fret 0 (key A's C-shape at
  // rootFret 0 collapses to a dyad), which made the five-shape walk a
  // FOUR-shape walk in keys A/E and emitted 2-note dyad "chords" in F/B.
  // Incomplete at the low octave → retry one octave up before skipping.
  /** @param {import('./generation-types.js').ChordPosition[] | null} g @returns {g is import('./generation-types.js').ChordPosition[]} */
  const gripComplete = (g) => {
    if (!g || g.length < 3) return false;
    const pcs = new Set(g.map(p => ((/** @type {number} */ (p.pc) - rootPc) % 12 + 12) % 12));
    return pcs.has(0) && pcs.size >= 3;
  };
  /** @param {string} shape @param {number} baseFret */
  const resolveGrip = (shape, baseFret) => {
    let rf = baseFret, g = cagedShapeNotesForChord(cfg, shape, quality, rf);
    if (!gripComplete(g) && rf + 12 <= 20) {
      const hi = cagedShapeNotesForChord(cfg, shape, quality, rf + 12);
      if (gripComplete(hi)) { rf += 12; g = hi; }
    }
    if (!gripComplete(g)) return null;
    let partial = false;
    // Movable G-shape (pedagogy review should-fix): the full movable G-shape
    // barre is a never-played grip ("rare/uncomfortable" per its own data
    // comment). MAJOR: drop the high-string root → the standard partial grab
    // (C: 8-7-5-5-5-x, an E-barre-like 4-finger grip). MINOR/DIM: no real
    // movable G-form exists. "Movable" = no open string in the grip.
    if (shape === 'G' && g.every(p => p.f > 0)) {
      if (cagedShapeQualityKey(quality) !== 'maj') { if (opts.walkGate) return null; }
      else {
        const hiS = Math.max.apply(null, g.map(p => p.s));
        const part = g.filter(p => p.s !== hiS);
        if (gripComplete(part)) { g = part; partial = true; }
      }
    }
    // Movable C-shape MINOR and movable E-shape DIM are impossible grips (a
    // barre with a lower fret inside its span) — the walk skips them (an
    // honest shorter walk beats an unplayable shape); economy excludes them.
    const qk = cagedShapeQualityKey(quality);
    if (opts.walkGate && g.every(p => p.f > 0) && ((shape === 'C' && qk === 'min') || (shape === 'E' && qk === 'dim'))) return null;
    return { rootFret: rf, gripNotes: g, partial };
  };
  /** @param {import('./generation-types.js').ChordPosition[]} g */
  const meanFret = (g) => g.reduce((a, p) => a + p.f, 0) / g.length;
  // Economy gates + tie-break (review must-fix #2): movable G-shape (either
  // quality) and movable C-shape MINOR are real-world non-grips (the movable
  // C-minor needs five fingers); "movable" = no open string in the grip.
  // Hand distance = |mean grip fret − previous mean| — C/G shapes sit BELOW
  // their root fret, so root-fret distance systematically picked the hard
  // forms. Distance ties break toward the workhorse barres E>A>D>G>C.
  /** @type {Record<string, number>} */
  const ECON_RANK = { E: 0, A: 1, D: 2, G: 3, C: 4 };
  let best = null, bestDist = Infinity;
  for (const shape of shapes) {
    const anchorPrev = (opts.fixedShape || economy) ? prevRootFret : -1;   // open mode: each chord finds its lowest grip
    const baseFret = pickShapeRootFret(cfg, shape, rootPc, anchorPrev, 'nearest_low');
    if (baseFret == null) continue;
    const resolved = resolveGrip(shape, baseFret);
    if (!resolved) continue;
    const { rootFret, gripNotes } = resolved;
    // A partial grip must NOT use the full-shape template box (it would draw
    // strings the player should mute) — fall to position-derived fingering,
    // keeping the shape vocabulary on the label ("… (G-shape partial)").
    const template = (resolved.partial ? null : templateFromShape(name, shape, quality, rootFret, cfg, false)) || templateFromPositions(name, gripNotes, cfg, false);
    if (resolved.partial && template && !/-shape/.test(template.displayName || '')) {
      template.displayName = `${name} (${CAGED_SHAPES[shape].displayName} partial)`;
    }
    const cand = { shape, rootFret, gripNotes, template };
    if (opts.fixedShape) { best = cand; break; }
    if (economy) {
      const open = gripNotes.some(p => p.f === 0);
      const qk2 = cagedShapeQualityKey(quality);
      if (!open && (shape === 'G' || (shape === 'C' && qk2 === 'min') || (shape === 'E' && qk2 === 'dim'))) continue;
      const prevMean = (opts.prevMeanFret != null && opts.prevMeanFret >= 0) ? opts.prevMeanFret : prevRootFret;
      const d = Math.abs(meanFret(gripNotes) - prevMean);
      if (!best || d < bestDist - 1e-9 || (Math.abs(d - bestDist) <= 1e-9 && ECON_RANK[shape] < ECON_RANK[best.shape])) { best = cand; bestDist = d; }
      continue;
    }
    // open mode: prefer the most open grip (most fret-0 strings, then lowest top fret)
    /** @param {import('./generation-types.js').ResolvedGrip} c */
    const score = c => c.gripNotes.filter(p => p.f === 0).length * 100 - Math.max.apply(null, c.gripNotes.map(p => p.f));
    if (!best || score(cand) > score(best)) best = cand;
  }
  return best;
}
