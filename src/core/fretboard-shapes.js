// SPDX-License-Identifier: AGPL-3.0-only
import { SCALE_INTERVALS } from './scale-intervals.js';

/** @typedef {string | number} ShapeId */
/** @typedef {{s: number, f: number, d: number, isRoot: boolean, fg: number}} ShapeNote */
/** @typedef {{fretMin: number, fretMax: number, rootFret: number | null, rootStringIdx: number | null, notes: ShapeNote[], displayName: string}} ResolvedShape */
/** @typedef {{rootStringIdx: number, displayName: string, scaleFretSpanFromRoot: number[], pentFretSpanFromRoot?: number[], chordTemplates: Record<string, {s: number, fOff: number, iv: number, fg: number}[]>}} CagedShape */

// Unified CAGED shape data — single source of truth.
//
// Each shape stores everything the plugin needs to know about it:
//   - rootStringIdx:           which string the canonical root sits on
//                              (s=0 is low E in standard tuning, per
//                              Virtuoso's openMidis convention)
//   - displayName:             user-facing label
//   - scaleFretSpanFromRoot:   [low, high] offsets that define the fret
//                              window of the scale shape relative to the
//                              root's fret on rootStringIdx
//   - chordTemplates:          chord-tone offsets for rendering chord boxes
//                              on the highway, one entry per chord quality
//                              (maj / min / dim). Each entry is an array of
//                              { s, fOff, iv } where s is the string
//                              (low-E=0), fOff is the fret offset from the
//                              shape's rootFret, and iv is the interval in
//                              semitones above the chord root.
//
// Worked example — C-shape in C major:
//   rootStringIdx 1 (A string), keyPc 0 (C), so rootFret = 3.
//   scaleFretSpanFromRoot [-3, 2] → scale window is frets 0..5.
//   chordTemplates.maj has the C-shape chord-tone offsets relative to that
//   root fret 3.
//
// Historical note: the previous version of this file used two separate
// structures (CAGED_SHAPE_DEFS for chord templates in a high-E=0 indexing,
// and a separate scale-shape map in low-E=0). Those were unified here on
// 2026-05-26 to a single low-E=0 table so the two halves can't drift apart.
// Each chordTemplate entry: { s, fOff, iv, fg }
//   s   — string index (low-E=0)
//   fOff — fret offset from the shape's root fret
//   iv  — interval class above root (0=root, 3=minor 3rd, 4=major 3rd, 6=dim5, 7=perfect 5th)
//   fg  — suggested left-hand finger (1=index, 2=middle, 3=ring, 4=pinky).
//         Encoded for the *barre form*; when the resulting fret = 0 (open),
//         the renderer should show an open-string marker and ignore fg.
//         Repeated fg values across adjacent strings indicate a barre/mini-barre.
/** @type {Record<string, CagedShape>} */
export const CAGED_SHAPES = {
  C: {
    rootStringIdx: 1, displayName: 'C-shape', scaleFretSpanFromRoot: [-3, 2],
    chordTemplates: {
      maj: [{s:1,fOff:0,iv:0,fg:4},{s:2,fOff:-1,iv:4,fg:3},{s:3,fOff:-3,iv:7,fg:1},{s:4,fOff:-2,iv:0,fg:2},{s:5,fOff:-3,iv:4,fg:1}],
      min: [{s:1,fOff:0,iv:0,fg:4},{s:2,fOff:-2,iv:3,fg:3},{s:3,fOff:-3,iv:7,fg:2},{s:4,fOff:-2,iv:0,fg:3},{s:5,fOff:-4,iv:3,fg:1}],
      dim: [{s:1,fOff:0,iv:0,fg:4},{s:2,fOff:-2,iv:3,fg:2},{s:3,fOff:-4,iv:6,fg:1},{s:4,fOff:-2,iv:0,fg:3},{s:5,fOff:-4,iv:3,fg:1}]
    }
  },
  A: {
    rootStringIdx: 1, displayName: 'A-shape', scaleFretSpanFromRoot: [-1, 4], pentFretSpanFromRoot: [0, 3],
    chordTemplates: {
      maj: [{s:1,fOff:0,iv:0,fg:1},{s:2,fOff:2,iv:7,fg:3},{s:3,fOff:2,iv:0,fg:3},{s:4,fOff:2,iv:4,fg:3},{s:5,fOff:0,iv:7,fg:1}],
      min: [{s:1,fOff:0,iv:0,fg:1},{s:2,fOff:2,iv:7,fg:3},{s:3,fOff:2,iv:0,fg:4},{s:4,fOff:1,iv:3,fg:2},{s:5,fOff:0,iv:7,fg:1}],
      // dim fingering corrected 2026-06-06 (load-guard catch): fg1 spanned
      // fOff 0 AND -1 (impossible). Now: pinky-side mini-barre fg3 at +1
      // (s2+s4, s3 arches higher inside — valid), index on the low ♭5.
      dim: [{s:1,fOff:0,iv:0,fg:2},{s:2,fOff:1,iv:6,fg:3},{s:3,fOff:2,iv:0,fg:4},{s:4,fOff:1,iv:3,fg:3},{s:5,fOff:-1,iv:6,fg:1}]
    }
  },
  G: {
    rootStringIdx: 0, displayName: 'G-shape', scaleFretSpanFromRoot: [-3, 2],
    chordTemplates: {
      // G-shape is overwhelmingly played as an open chord (3-2-0-0-0-3, classic
      // 2-1-0-0-0-3 fingering). Barre-up form is rare/uncomfortable.
      // maj fingering corrected 2026-06-07 (load-guard catch): fg1 spanned
      // fOff -1 AND -3 (impossible). fg encodes the barre form per the header
      // convention: index barre at -3, middle on the 3rd, ring/pinky split the
      // two roots. templateFromShape zeroes fingers on open strings, so the
      // open-G render shows 3-2-0-0-0-4 — the (equally classic) C-change-
      // friendly open fingering.
      maj: [{s:0,fOff:0,iv:0,fg:3},{s:1,fOff:-1,iv:4,fg:2},{s:2,fOff:-3,iv:7,fg:1},{s:3,fOff:-3,iv:0,fg:1},{s:4,fOff:-3,iv:4,fg:1},{s:5,fOff:0,iv:0,fg:4}],
      // min/dim fingering corrected 2026-06-07 (load-guard catch): fg1 spanned
      // 3 fret offsets (impossible). Both are MOVABLE-only renders (fOff -4 →
      // fret -1 at open-G root 3 → templateFromShape returns null) consumed by
      // the arpeggio paths, so finger them as the arpeggio-through-the-shape:
      // 1FPF from the lowest fret. min: index -4, middle mini-barre/roll -3
      // (s2+s3 adjacent), ring -2, pinky replants the two outer roots at 0.
      min: [{s:0,fOff:0,iv:0,fg:4},{s:1,fOff:-2,iv:3,fg:3},{s:2,fOff:-3,iv:7,fg:2},{s:3,fOff:-3,iv:0,fg:2},{s:4,fOff:-4,iv:3,fg:1},{s:5,fOff:0,iv:0,fg:4}],
      // dim: index mini-barre at -4 (s2+s4; s3 arches HIGHER at -3 — valid,
      // the classic xx1212 dim-grip core), middle -3, ring -2, pinky roots.
      dim: [{s:0,fOff:0,iv:0,fg:4},{s:1,fOff:-2,iv:3,fg:3},{s:2,fOff:-4,iv:6,fg:1},{s:3,fOff:-3,iv:0,fg:2},{s:4,fOff:-4,iv:3,fg:1},{s:5,fOff:0,iv:0,fg:4}]
    }
  },
  E: {
    rootStringIdx: 0, displayName: 'E-shape', scaleFretSpanFromRoot: [-1, 4], pentFretSpanFromRoot: [0, 3],
    chordTemplates: {
      // E-shape barre is the canonical movable shape — fingering encoded for
      // the barre form (e.g. F major at rootFret 1: 1-3-3-2-1-1).
      maj: [{s:0,fOff:0,iv:0,fg:1},{s:1,fOff:2,iv:7,fg:3},{s:2,fOff:2,iv:0,fg:4},{s:3,fOff:1,iv:4,fg:2},{s:4,fOff:0,iv:7,fg:1},{s:5,fOff:0,iv:0,fg:1}],
      min: [{s:0,fOff:0,iv:0,fg:1},{s:1,fOff:2,iv:7,fg:3},{s:2,fOff:2,iv:0,fg:4},{s:3,fOff:0,iv:3,fg:1},{s:4,fOff:0,iv:7,fg:1},{s:5,fOff:0,iv:0,fg:1}],
      // dim fingering corrected 2026-06-07 (load-guard catch): fg1 sat at
      // fOff 0 AND -1 (the ♭5 below the barre — impossible). No 6-string
      // simultaneous E-dim grip exists (see the caged-template guard SKIP
      // note; real dim comping uses the 4-string D/A forms), so finger it as
      // the arpeggio-through-the-shape, 1FPF anchored on the low ♭5: index
      // -1, middle replants the three 0-offset tones, ring +1, pinky +2
      // (2-3-4-2-1-2 low→high).
      dim: [{s:0,fOff:0,iv:0,fg:2},{s:1,fOff:1,iv:6,fg:3},{s:2,fOff:2,iv:0,fg:4},{s:3,fOff:0,iv:3,fg:2},{s:4,fOff:-1,iv:6,fg:1},{s:5,fOff:0,iv:0,fg:2}]
    }
  },
  D: {
    rootStringIdx: 2, displayName: 'D-shape', scaleFretSpanFromRoot: [-2, 3],
    chordTemplates: {
      maj: [{s:2,fOff:0,iv:0,fg:1},{s:3,fOff:2,iv:7,fg:2},{s:4,fOff:3,iv:0,fg:4},{s:5,fOff:2,iv:4,fg:3}],
      min: [{s:2,fOff:0,iv:0,fg:1},{s:3,fOff:2,iv:7,fg:3},{s:4,fOff:3,iv:0,fg:4},{s:5,fOff:1,iv:3,fg:2}],
      // dim fingering corrected 2026-06-06 (load-guard catch): fg1 spanned
      // fOff 0 AND +1 (impossible). Now: index on the root, fg2 mini-barre
      // at +1 (s3+s5, s4 arches higher inside — valid), pinky on the octave.
      dim: [{s:2,fOff:0,iv:0,fg:1},{s:3,fOff:1,iv:6,fg:2},{s:4,fOff:3,iv:0,fg:4},{s:5,fOff:1,iv:3,fg:2}]
    }
  }
};
/** @type {ShapeId[]} */
export const CAGED_CYCLE = ['C', 'A', 'G', 'E', 'D']; // cyclic order (C→A→G→E→D→C…)

// 3NPS positions, named by mode. Each position starts on a specific scale
// degree on the low E string, then places 3 consecutive scale degrees on
// each subsequent string.
/** @type {Record<string, {startDegree: number, mode: string, displayName: string}>} */
export const THREE_NPS_POSITION_DEFS = {
  1: { startDegree: 1, mode: 'Ionian',     displayName: 'Position 1 (Ionian)' },
  2: { startDegree: 2, mode: 'Dorian',     displayName: 'Position 2 (Dorian)' },
  3: { startDegree: 3, mode: 'Phrygian',   displayName: 'Position 3 (Phrygian)' },
  4: { startDegree: 4, mode: 'Lydian',     displayName: 'Position 4 (Lydian)' },
  5: { startDegree: 5, mode: 'Mixolydian', displayName: 'Position 5 (Mixolydian)' },
  6: { startDegree: 6, mode: 'Aeolian',    displayName: 'Position 6 (Aeolian)' },
  7: { startDegree: 7, mode: 'Locrian',    displayName: 'Position 7 (Locrian)' }
};
/** @type {ShapeId[]} */
export const THREE_NPS_CYCLE = [1, 2, 3, 4, 5, 6, 7];

// Pitch-class helpers — independent of any tuning, derived from openMidis.
/** @param {number[]} openMidis @param {number} stringIdx */
export function openPcForString(openMidis, stringIdx) {
  return openMidis[stringIdx] % 12;
}
/** @param {number} openPc @param {number} targetPc */
export function lowestFretWithPc(openPc, targetPc) {
  return ((targetPc - openPc) + 12) % 12;
}
/** @param {string} scale */
export function scaleSemitones(scale) {
  return SCALE_INTERVALS[scale] || SCALE_INTERVALS.major;
}
/** @param {number} keyPc @param {number} degree @param {string} scale */
export function pcOfDegree(keyPc, degree, scale) {
  const semis = scaleSemitones(scale);
  if (degree < 1 || degree > semis.length) return null;
  return (keyPc + semis[degree - 1]) % 12;
}
/** @param {number} keyPc @param {number} notePc @param {string} scale */
export function degreeOfPc(keyPc, notePc, scale) {
  const semis = scaleSemitones(scale);
  const interval = ((notePc - keyPc) + 12) % 12;
  const idx = semis.indexOf(interval);
  return idx === -1 ? null : idx + 1;
}
// Suggested left-hand finger for a note in a box (1=index..4=pinky, 0=open).
// One-finger-per-fret from the box's index-finger anchor, clamped to 1–4.
// The B and high-E strings (s=4,5) get a −1 nudge because the G→B major-3rd
// tuning gap shifts the same shape one fret higher there; un-nudging keeps the
// canonical fingering (validated by the fretboard-pedagogy review, 2026-05-29).
/** @param {number} s @param {number} f @param {number} anchorFret @param {boolean} applyGBNudge */
export function scaleFingerFor(s, f, anchorFret, applyGBNudge) {
  if (f <= 0) return 0; // open string
  const nudge = (applyGBNudge && s >= 4) ? 1 : 0;
  return Math.max(1, Math.min(4, (f - anchorFret + 1) - nudge));
}
// 3NPS fingering for the three ascending frets on one string, from the standard
// per-string interval lookup: whole-whole (span 4) = 1-2-4, whole-half = 1-2-3,
// half-whole = 1-3-4. (fretboard-pedagogy review, 2026-05-29.)
/** @param {number[]} frets */
export function threeNpsStringFingers(frets) {
  const g1 = frets[1] - frets[0], g2 = frets[2] - frets[1];
  if (g1 >= 2 && g2 >= 2) return [1, 2, 4];
  if (g1 >= 2 && g2 < 2) return [1, 2, 3];
  if (g1 < 2 && g2 >= 2) return [1, 3, 4];
  return [1, 2, 3];
}

// Resolve a CAGED shape in a given key.
// Returns { fretMin, fretMax, rootFret, rootStringIdx, notes: [{s,f,d,isRoot}], displayName }
// or null if the shape is undefined.
/** @param {number} keyPc @param {ShapeId} shape @param {string} scale @param {number[]} openMidis @returns {ResolvedShape | null} */
export function resolveCAGEDShape(keyPc, shape, scale, openMidis) {
  const def = CAGED_SHAPES[shape];
  if (!def) return null;
  // CAGED is a 6-string system — its shapes encode the standard EADGBE interval
  // pattern. On an extended-range guitar (7/8-string) the box is anchored on the
  // TOP SIX strings (the EADGBE sub-group); the extra low string(s) are treated
  // as added range, NOT part of the shape. Anchoring across all N strings would
  // root e.g. the E-shape on the low B/F# — a box no method book teaches and no
  // player has under their fingers. `off` shifts the shape's string indices up
  // into that top-six window; off=0 for a standard 6-string, so this is a no-op
  // there (and keeps arpeggio-CAGED, which contains to 6, and scale-CAGED
  // consistent). Extended-range design per the guitar-pedagogy review, 2026-06-01.
  const numStrings = openMidis.length;
  const off = Math.max(0, numStrings - 6);
  const rootStringIdx = def.rootStringIdx + off;
  const rootOpenPc = openPcForString(openMidis, rootStringIdx);
  let rootFret = lowestFretWithPc(rootOpenPc, keyPc);
  const spanDef = (def.pentFretSpanFromRoot && (scale === 'minor_pentatonic' || scale === 'major_pentatonic' || scale === 'blues'))
    ? def.pentFretSpanFromRoot : def.scaleFretSpanFromRoot;
  // Nut-clamp fix: if the box would extend below the nut (rootFret too low, so
  // the lower part of the shape is unplayable and the box collapses to a sliver
  // at fret 0), shift the whole shape up an octave so it resolves as a complete,
  // canonical fretted box. CAGED shapes are fretted boxes — open-string
  // vocabulary belongs to the separate Open position system.
  if (rootFret + spanDef[0] < 0) rootFret += 12;
  const fretMin = rootFret + spanDef[0];
  const fretMax = rootFret + spanDef[1];
  const firstFret = Math.max(0, fretMin);
  // Degree-driven, no-unison selection. A naive fret-window block repeats the
  // SAME pitch wherever two adjacent strings overlap (e.g. A-major A-shape:
  // B on the G string f4 and the B string f0). Per the no-unison rule, each
  // pitch may sound on only one string in the box; the lower string wins a
  // shared pitch (added first) so the box stays compact and ascending. Roots
  // in different octaves are distinct pitches and are all kept.
  const notes = [];
  const usedMidi = new Set();
  for (let s = off; s < numStrings; s++) {
    const openPc = openPcForString(openMidis, s);
    const openMidi = openMidis[s];
    for (let f = firstFret; f <= fretMax; f++) {
      const notePc = (openPc + f) % 12;
      const degree = degreeOfPc(keyPc, notePc, scale);
      if (degree === null) continue;
      const midi = openMidi + f;
      if (usedMidi.has(midi)) continue; // unison already placed on a lower string
      usedMidi.add(midi);
      // Fingering is computed against the 6-string-equivalent index (s - off):
      // scaleFingerFor's G→B nudge keys off the B-string index (4 on a 6-string),
      // so on the top-6 of a 7/8-string the same EADGBE box must reuse the
      // 6-string indices or the nudge would fire on the wrong (G) string.
      notes.push({ s, f, d: degree, isRoot: degree === 1, fg: scaleFingerFor(s - off, f, firstFret, true) });
    }
  }
  return {
    fretMin: Math.max(0, fretMin),
    fretMax,
    rootFret,
    rootStringIdx,
    notes,
    displayName: def.displayName
  };
}

// Resolve a 3NPS position in a given key.
// Generates 3 consecutive scale degrees per string starting from `position`
// on the low E string, then climbs the rest of the strings by +3 degrees each.
// Fret choice: lowest valid fret per degree, with octave bumps to keep each
// string's notes ascending AND keep the position climbing across strings.
/** @param {number} keyPc @param {ShapeId} position @param {string} scale @param {number[]} openMidis @returns {ResolvedShape | null} */
export function resolveThreeNPSPosition(keyPc, position, scale, openMidis) {
  const def = THREE_NPS_POSITION_DEFS[position];
  if (!def) return null;
  const semis = scaleSemitones(scale);
  const NUM_DEGREES = semis.length;
  const notes = [];
  let prevHighMidi = -1;
  const numStrings = openMidis.length;
  for (let s = 0; s < numStrings; s++) {
    const baseDegreeIdx = ((def.startDegree - 1) + s * 3) % NUM_DEGREES;
    const degrees = [
      baseDegreeIdx,
      (baseDegreeIdx + 1) % NUM_DEGREES,
      (baseDegreeIdx + 2) % NUM_DEGREES
    ];
    const openPc = openPcForString(openMidis, s);
    const openMidi = openMidis[s];
    const fretsForDegrees = degrees.map(idx => lowestFretWithPc(openPc, (keyPc + semis[idx]) % 12));
    for (let i = 1; i < fretsForDegrees.length; i++) {
      while (openMidi + fretsForDegrees[i] <= openMidi + fretsForDegrees[i - 1]) {
        fretsForDegrees[i] += 12;
      }
    }
    while (prevHighMidi >= 0 && openMidi + fretsForDegrees[0] <= prevHighMidi) {
      for (let i = 0; i < fretsForDegrees.length; i++) fretsForDegrees[i] += 12;
    }
    prevHighMidi = openMidi + fretsForDegrees[fretsForDegrees.length - 1];
    const fingers = threeNpsStringFingers(fretsForDegrees);
    for (let i = 0; i < degrees.length; i++) {
      notes.push({ s, f: fretsForDegrees[i], d: degrees[i] + 1, isRoot: degrees[i] === 0, fg: fingers[i] });
    }
  }
  const allFrets = notes.map(n => n.f);
  return {
    fretMin: Math.min.apply(null, allFrets),
    fretMax: Math.max.apply(null, allFrets),
    rootFret: notes.find(n => n.isRoot && n.s === 0)?.f ?? null,
    rootStringIdx: 0,
    notes,
    displayName: def.displayName
  };
}

// Resolve the open-position shape for a given key.
// Generates all scale notes in frets 0–3 across every string. Some keys have
// very few notes here (e.g., F#, Bb in major) — callers can check the note
// count and decide whether Open is sensible for the key.
/** @param {number} keyPc @param {string} scale @param {number[]} openMidis @returns {ResolvedShape} */
export function resolveOpenShape(keyPc, scale, openMidis) {
  const fretMin = 0;
  const fretMax = 3;
  const notes = [];
  const numStrings = openMidis.length;
  // Open position is built from the EADGBE open-string vocabulary — like CAGED it
  // anchors on the TOP SIX strings on a 7/8-string (off = N-6). Without this, the
  // low B/F# open string can claim a pitch first and, because dedupe is
  // lower-string-wins, EVICT it from the canonical standard string the player
  // expects — pulling notes OFF the standard strings, not just adding junk on an
  // unused one. (Extended-range fix, guitar-pedagogy review 2026-06-01.)
  const off = Math.max(0, numStrings - 6);
  // No-unison selection (see resolveCAGEDShape): drop a pitch already placed
  // on a lower string so open position never doubles a note across strings.
  const usedMidi = new Set();
  for (let s = off; s < numStrings; s++) {
    const openPc = openPcForString(openMidis, s);
    const openMidi = openMidis[s];
    for (let f = fretMin; f <= fretMax; f++) {
      const notePc = (openPc + f) % 12;
      const degree = degreeOfPc(keyPc, notePc, scale);
      if (degree === null) continue;
      const midi = openMidi + f;
      if (usedMidi.has(midi)) continue;
      usedMidi.add(midi);
      notes.push({ s, f, d: degree, isRoot: degree === 1, fg: scaleFingerFor(s, f, 1, false) });
    }
  }
  return { fretMin, fretMax, rootFret: null, rootStringIdx: null, notes, displayName: 'Open position' };
}

// Heuristic for whether Open position is a sensible system for this key.
// The "open position" character comes from ringing open strings — so the
// key must have at least 2 unique open-string pitches in its scale.
// This excludes Db, F#, and Ab major (≤1 open string in scale) and
// includes everything else.
/** @param {number} keyPc @param {string} scale @param {number[]} openMidis */
export function isOpenSystemSensible(keyPc, scale, openMidis) {
  const semis = scaleSemitones(scale);
  const scalePcs = new Set(semis.map(s => (keyPc + s) % 12));
  const openInScale = new Set();
  for (let s = 0; s < openMidis.length; s++) {
    const openPc = openMidis[s] % 12;
    if (scalePcs.has(openPc)) openInScale.add(openPc);
  }
  return openInScale.size >= 2;
}

// Unified entry point. Returns the shape's resolved data or null.
/** @param {number} keyPc @param {string} system @param {ShapeId} shape @param {string} scale @param {number[]} openMidis */
export function fretWindowForShape(keyPc, system, shape, scale, openMidis) {
  if (system === 'caged')   return resolveCAGEDShape(keyPc, shape, scale, openMidis);
  if (system === '3nps')    return resolveThreeNPSPosition(keyPc, shape, scale, openMidis);
  if (system === 'open')    return resolveOpenShape(keyPc, scale, openMidis);
  return null;
}

// Available shapes for a system, ordered low-to-high by where each shape
// sits on the neck for the given key. Used by the Shape dropdown to list
// shapes in fret order and by Next Variation to cycle through them.
/** @param {number} keyPc @param {string} system @param {string} scale @param {number[]} openMidis @returns {ShapeId[]} */
export function shapeOrderForKey(keyPc, system, scale, openMidis) {
  if (system === 'caged') {
    return CAGED_CYCLE
      .map(shape => ({ shape, resolved: resolveCAGEDShape(keyPc, shape, scale, openMidis) }))
      .filter(entry => entry.resolved)
      .sort((a, b) => /** @type {ResolvedShape} */ (a.resolved).fretMin - /** @type {ResolvedShape} */ (b.resolved).fretMin)
      .map(entry => entry.shape);
  }
  if (system === '3nps') {
    return THREE_NPS_CYCLE
      .map(shape => ({ shape, resolved: resolveThreeNPSPosition(keyPc, shape, scale, openMidis) }))
      .filter(entry => entry.resolved)
      .sort((a, b) => /** @type {ResolvedShape} */ (a.resolved).fretMin - /** @type {ResolvedShape} */ (b.resolved).fretMin)
      .map(entry => entry.shape);
  }
  if (system === 'open') {
    return isOpenSystemSensible(keyPc, scale, openMidis) ? ['open'] : [];
  }
  return [];
}

// Returns the next shape in the cyclic order for the current key, wrapping.
// Used by the Next Variation button.
/** @param {number} keyPc @param {string} system @param {ShapeId} currentShape @param {string} scale @param {number[]} openMidis */
export function nextShapeInCycle(keyPc, system, currentShape, scale, openMidis) {
  const order = shapeOrderForKey(keyPc, system, scale, openMidis);
  if (!order.length) return null;
  const idx = order.indexOf(currentShape);
  if (idx === -1) return order[0];
  return order[(idx + 1) % order.length];
}

// Map a fretboardSystem value to its kind. Shape-aware systems flow through
// the new resolver functions; the others fall back to the legacy
// fretMin/fretMax handling.
const SHAPE_AWARE_SYSTEMS = new Set(['caged', '3nps', 'open']);
/** @param {string} system */
export function isShapeAwareSystem(system) { return SHAPE_AWARE_SYSTEMS.has(system); }

// Sensible default shape for a system + key.
/** @param {string} system @param {number} keyPc @param {string} scale @param {number[]} openMidis */
export function defaultShapeForSystem(system, keyPc, scale, openMidis) {
  if (system === 'open') return 'open';
  const order = shapeOrderForKey(keyPc, system, scale, openMidis);
  if (order && order.length) return order[0];
  if (system === 'caged') return 'C';
  if (system === '3nps')  return 1;
  return null;
}
