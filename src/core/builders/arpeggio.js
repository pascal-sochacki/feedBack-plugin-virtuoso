// SPDX-License-Identifier: AGPL-3.0-only
import { secondsPerDivision, measureSeconds } from '../timing.js';
import { chartRng } from '../random.js';
import { chordRootForDegree, chordQualityForDegree, chordName, progressionDegreesForConfig, DEPTH_TONES } from '../harmony.js';
import { pickShapeRootFret, cagedShapeNotesForChord, chordTonePositionsInPosition, pickChordPositions, templateFromShape, templateFromPositions, sweepArpeggioPositions, sliceSweepTopStrings, buildSweepPathWithHopo } from '../chord-positions.js';
import { dedupeUnisons } from '../positions.js';
import { noteDefaults } from '../notes.js';
import { directedPath, orientSeq, fillNotesFromSeq } from '../sequence.js';
import { applyStrokePolicy } from '../stroke-policy.js';
import { CAGED_SHAPES } from '../fretboard-shapes.js';
import { isBassCfg, openMidisForConfig } from '../instrument-tuning.js';
import { NOTE_ALIASES } from '../pitch.js';
import { CHORD_FORMULAS } from '../chord-theory.js';

/** @param {import('../generation-types.js').GenerationConfig} cfg @param {import('../generation-types.js').Degree[]} degrees */
export function buildArpeggioExercise(cfg, degrees) {
  const step = secondsPerDivision(cfg), mLen = measureSeconds(cfg);
  /** @type {import('../generation-types.js').ChordTemplate[]} */
  const chordTemplates = [];
  /** @type {import('../generation-types.js').ChartChord[]} */
  const chords = [];
  /** @type {import('../generation-types.js').HandShape[]} */
  const handShapes = [];
  /** @type {import('../notes.js').Note[]} */
  const notes = [];
  /** @type {import('../generation-types.js').Section[]} */
  const sections = [];
  const isShapeRunStrict = cfg.fretboardSystem === 'caged_shape_run';
  const isShapeRunFollow = cfg.fretboardSystem === 'caged_shape_follow';
  const isShapeRun = isShapeRunStrict || isShapeRunFollow;
  const shapeRunMode = isShapeRunStrict ? 'ascend' : 'closest';
  /** @type {import('../generation-types.js').Anchor[] | null} */
  const shapeRunAnchors = isShapeRun ? [] : null;
  const pathRand = chartRng(cfg);   // one seeded stream for the whole build
  /** @type {number | null} */
  let prevRootFret = null;
  let t = 0;
  degrees.forEach(degree => {
    const rootPc = chordRootForDegree(cfg, degree);
    const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth, degree, cfg.chordOverride, cfg.progression);
    let displayPositions = null;
    let chordCfg = cfg;
    let shapeRootFret = null;
    // CAGED single-shape modes: play the literal shape geometry, transposed to this chord's root
    // on the shape's anchor string. Strict mode marches monotonically up the neck; follow mode
    // picks the closest fret to the previous chord (lets the shape go up AND down the neck).
    if (isShapeRun) {
      const rootFret = pickShapeRootFret(cfg, cfg.cagedShape, rootPc, prevRootFret, shapeRunMode);
      if (rootFret != null) {
        prevRootFret = rootFret; // always advance so next chord ascends from the right position
        const shapeNotes = cagedShapeNotesForChord(cfg, cfg.cagedShape, quality, rootFret);
        if (shapeNotes && shapeNotes.length) {
          displayPositions = shapeNotes;
          shapeRootFret = rootFret;
          const winLo = Math.max(0, rootFret - 4);
          const winHi = Math.min(24, rootFret + 4);
          chordCfg = Object.assign({}, cfg, { fretMin:winLo, fretMax:winHi });
          /** @type {import('../generation-types.js').Anchor[]} */ (shapeRunAnchors).push({ time:Number(t.toFixed(6)), fret:winLo, width:winHi - winLo + 1 });
        }
      }
    }
    // Fallback for non-shape-run modes, or when a shape template isn't available for this quality
    if (!displayPositions || !displayPositions.length) {
      const positionTones = chordTonePositionsInPosition(chordCfg, rootPc, quality);
      displayPositions = positionTones.length ? positionTones : pickChordPositions(chordCfg, rootPc, quality);
    }
    if (!displayPositions.length) return;
    // No-unison rule: the arpeggio run must not sound the same pitch on two
    // strings (e.g. a fallback resolver picking the same octave twice).
    displayPositions = dedupeUnisons(displayPositions);
    const name = chordName(rootPc, quality), templateId = chordTemplates.length;
    const shapeTemplate = (isShapeRun && shapeRootFret != null)
      ? templateFromShape(name, cfg.cagedShape, quality, shapeRootFret, chordCfg, true)
      : null;
    chordTemplates.push(shapeTemplate || templateFromPositions(name, displayPositions, chordCfg, true));
    chords.push({ t:Number(t.toFixed(6)), id:templateId, hd:false, notes:displayPositions.map(p => noteDefaults({ s:p.s, f:p.f, sus:0 })) });
    sections.push({ name, number:templateId + 1, time:Number(t.toFixed(6)) });
    const path = directedPath(displayPositions, cfg.direction, cfg.repeatCount, pathRand);
    const chordSlot = Math.max(mLen, path.length * step);
    handShapes.push({ chord_id:templateId, start_time:Number(t.toFixed(6)), end_time:Number((t + chordSlot).toFixed(6)), arp:true });
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      /** @type {import('../notes.js').Note} */
      const nf = { t:Number((t + i * step).toFixed(6)), s:p.s, f:p.f, sus:Math.max(0.04, step * 0.72), ac:i === 0 };
      if (p.fg != null) nf.fg = p.fg;   // shape-run arpeggios carry the template's fingering
      notes.push(noteDefaults(nf));
    }
    t += chordSlot;
  });
  applyStrokePolicy(notes, cfg, 'bass_parity');   // bass arpeggio runs: strict i-m parity (guitar: player's choice)
  /** @type {import('../generation-types.js').Chart} */
  const result = { notes, chords, chordTemplates, handShapes, sections:sections.length ? sections : [{ name:'arpeggios', number:1, time:0 }], duration:Math.max(t, cfg.bars * mLen) };
  if (shapeRunAnchors) result.anchors = shapeRunAnchors;
  return result;
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildSweepArpeggioExercise(cfg) {
  const degrees = progressionDegreesForConfig(cfg);
  const mLen = measureSeconds(cfg), step = secondsPerDivision(cfg);
  const totalBars = Math.max(1, cfg.bars), duration = totalBars * mLen;
  const anchorFret = Math.floor((cfg.fretMin + cfg.fretMax) / 2);
  // Sweep shapes come from the canonical CAGED chord-tone template when a CAGED
  // shape is active: it's a contiguous one-note-per-string arpeggio box that
  // carries fingering by construction (the standard CAGED arpeggio shapes).
  // pickShapeRootFret walks the chosen shape up/down the neck per chord.
  const shape = cfg.shape || cfg.cagedShape;
  // ≥6 GUITAR strings: a 7/8-string can host the 6-string CAGED sweep template
  // on its top-six (anchored via `off` in pickShapeRootFret/cagedShapeNotesForChord),
  // so the extended-range sweep keeps by-construction fingering instead of the
  // greedy all-string rake. <6 OR bass (a 6-string bass passes the count but
  // breaks the EADGBE template intervals) → falls to sweepArpeggioPositions.
  const wantShape = cfg.instrument !== 'bass' && cfg.stringCount >= 6 && !!CAGED_SHAPES[shape];
  // The CAGED chordTemplates carry only TRIADS (maj/min/dim) — cagedShapeQualityKey
  // collapses min7→min and maj7/dom7→maj, so a seventh sweep through the template
  // would silently drop the 7th (its whole color). Route seventh sweeps to the
  // interval-derived greedy arpeggio instead: sweepArpeggioPositions reads the
  // full CHORD_FORMULAS (incl. the 7th), and we anchor it at the shape's walked
  // root fret below so it still sits in the canonical CAGED position per chord.
  // It loses only the static template fingers, which templateFromPositions then
  // recomputes (1FPF). Triad sweeps keep the by-construction template.
  const seventhSweep = cfg.chordDepth === 'seventh';
  const useShape = wantShape && !seventhSweep;
  let prevRootFret = null;
  const notes = [], chordTemplates = [], chords = [], handShapes = [], sections = [];
  for (let bar = 0; bar < totalBars; bar++) {
    const degree = degrees[bar % degrees.length];
    const rootPc = chordRootForDegree(cfg, degree);
    const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth, degree, cfg.chordOverride, cfg.progression);
    let positions = null, shapeRootFret = null;
    if (useShape) {
      const rootFret = pickShapeRootFret(cfg, shape, rootPc, prevRootFret, 'closest');
      if (rootFret != null) {
        prevRootFret = rootFret;
        const tmplPos = cagedShapeNotesForChord(cfg, shape, quality, rootFret);
        if (tmplPos && tmplPos.length) { positions = dedupeUnisons(tmplPos); shapeRootFret = rootFret; }
      }
    }
    if (!positions || !positions.length) {
      // Interval-derived greedy arpeggio (the no-shape/bass case AND every
      // seventh sweep). When a CAGED shape is named (a seventh sweep), anchor the
      // greedy search at the shape's walked root fret so the 7th sweep tracks the
      // canonical position per chord rather than a fixed mid-window anchor.
      let aFret = anchorFret;
      if (wantShape) {
        const rf = pickShapeRootFret(cfg, shape, rootPc, prevRootFret, 'closest');
        if (rf != null) { prevRootFret = rf; aFret = rf; }
      }
      positions = dedupeUnisons(sweepArpeggioPositions(cfg, rootPc, quality, aFret));
    }
    // sweepStrings:N — constrain the rake to the top N strings (the cleanest
    // entry sweep; e.g. a 3-string triad on G-B-e). Anti-leak-defaulted in
    // applyPathwayConfig so it never persists into the next pathway.
    if (cfg.sweepStrings) positions = sliceSweepTopStrings(positions, cfg.sweepStrings);
    if (!positions.length) continue;
    const path = buildSweepPathWithHopo(positions, cfg, rootPc, quality);
    if (!path.length) continue;
    const barStart = bar * mLen;
    const name = chordName(rootPc, quality), templateId = chordTemplates.length;
    const shapeTmpl = (shapeRootFret != null) ? templateFromShape(name, shape, quality, shapeRootFret, cfg, true) : null;
    chordTemplates.push(shapeTmpl || templateFromPositions(name, positions, cfg, true));
    chords.push({ t:Number(barStart.toFixed(6)), id:templateId, hd:false, notes:positions.map(p => noteDefaults({ s:p.s, f:p.f, sus:0 })) });
    handShapes.push({ chord_id:templateId, start_time:Number(barStart.toFixed(6)), end_time:Number((barStart + mLen).toFixed(6)), arp:true });
    sections.push({ name, number:templateId + 1, time:Number(barStart.toFixed(6)) });
    const limit = Math.min(Math.floor(mLen / step), path.length);
    // Sweep pkd is fully directional (metal + guitar-pedagogy rulings):
    // ascending leg all-down, descending all-up; the apex ho/po turnaround is
    // pick-transparent. Same-string steps continue the current direction.
    // GUITAR ONLY (hand-marks Slice 2; bass-pedagogy veto: guitar sweep pick
    // logic never ships on bass) — bass gets i-m parity with implicit rakes
    // below: the "raked broken arpeggio" adaptation.
    const sweepPick = !isBassCfg(cfg);
    let sweepDir = 0, prevS = null;
    for (let i = 0; i < limit; i++) {
      const p = path[i];
      /** @type {import('../notes.js').Note} */
      const nf = { t:Number((barStart + i * step).toFixed(6)), s:p.s, f:p.f, sus:Math.max(0.04, step * 0.6), ac:i === 0, ho:!!p.ho, po:!!p.po };
      if (p.fg != null) nf.fg = p.fg;
      if (prevS != null) sweepDir = p.s > prevS ? 0 : p.s < prevS ? 1 : sweepDir;
      if (sweepPick && !p.ho && !p.po) nf.pkd = sweepDir;
      prevS = p.s;
      notes.push(noteDefaults(nf));
    }
  }
  applyStrokePolicy(notes, cfg, 'bass_parity');   // bass sweeps: i-m parity + the implicit rake (no-op on guitar — pkd already set inline)
  return { notes, chords, chordTemplates, handShapes, sections:sections.length ? sections : [{ name:'sweep-arpeggios', number:1, time:0 }], duration };
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildChromaticEnclosuresExercise(cfg) {
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth || 'seventh', 1, cfg.chordOverride, cfg.progression);
  const formula = CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj7;
  const chordPcs = formula.intervals.map(i => (keyPc + i) % 12);
  const opens = openMidisForConfig(cfg);
  const fMin = cfg.fretMin || 0, fMax = cfg.fretMax || 12;
  const targets = [];
  for (let s = 0; s < opens.length; s++)
    for (let f = fMin + 1; f <= fMax; f++) {
      const midi = opens[s] + f;
      if (chordPcs.includes(((midi % 12) + 12) % 12)) targets.push({ s, f, midi });
    }
  targets.sort((a, b) => a.midi - b.midi);
  if (!targets.length) throw new Error('No chord tones in range for enclosures.');
  // Each target: lower approach (-1 fret), upper approach (+1 fret), resolution.
  // Approach notes are skipped if they'd fall off the neck (≤0 lower bound is
  // guaranteed since targets start at fMin+1; guard the upper edge at fret 24).
  /** @type {{s: number, f: number}[]} */
  const events = [];
  for (const tgt of targets) {
    if (tgt.f - 1 >= 0)  events.push({ s: tgt.s, f: tgt.f - 1 });
    if (tgt.f + 1 <= 24) events.push({ s: tgt.s, f: tgt.f + 1 });
    events.push({ s: tgt.s, f: tgt.f });
  }
  // One target's resolution often equals the next target's lower approach
  // (e.g. resolve to B, then approach C from B) — collapse the back-to-back
  // identical position so the line doesn't re-pick the same note.
  const cleaned = events.filter((p, i) => i === 0 || p.s !== events[i - 1].s || p.f !== events[i - 1].f);
  const seq = orientSeq(cleaned, cfg.direction);
  const sus = Math.max(0.05, step * 0.88);
  return fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Chromatic enclosures — ${cfg.key}` });
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildArpeggioInversionsExercise(cfg) {
  const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth || 'triad', 1, cfg.chordOverride, cfg.progression);
  const formula = CHORD_FORMULAS[quality] || CHORD_FORMULAS.maj;
  const keyPc = NOTE_ALIASES[cfg.key] ?? 0;
  const take = DEPTH_TONES[cfg.chordDepth] || 3;
  const intervals = formula.intervals.slice(0, take);
  const chordPcs = intervals.map(i => (keyPc + i) % 12);
  const opens = openMidisForConfig(cfg);
  const fMin = cfg.fretMin || 0, fMax = cfg.fretMax || 12;
  const allTones = [];
  for (let s = 0; s < opens.length; s++)
    for (let f = fMin; f <= fMax; f++) {
      const midi = opens[s] + f, pc = ((midi % 12) + 12) % 12;
      const ci = chordPcs.indexOf(pc);
      if (ci >= 0) allTones.push({ s, f, midi, ci });
    }
  allTones.sort((a, b) => a.midi - b.midi);
  if (!allTones.length) throw new Error('No chord tones in range.');
  // Build clean inversions: each inversion is ONE ascending arpeggio of
  // `intervals.length` notes, stepping through the chord tones in order from
  // a different starting chord-tone each time:
  //   root position : 1-3-5(-7)
  //   1st inversion : 3-5(-7)-1
  //   2nd inversion : 5(-7)-1-3 …
  // For each note we take the next chord tone strictly higher than the
  // previous, so the line climbs through the inversion instead of replaying an
  // overlapping window of the whole chord-tone pool.
  const n = intervals.length;
  const events = [];
  for (let inv = 0; inv < n; inv++) {
    let prevMidi = -1;
    let placed = 0;
    for (let step = 0; step < n; step++) {
      const ci = (inv + step) % n;
      const cand = allTones.find(t => t.ci === ci && t.midi > prevMidi);
      if (!cand) break;
      events.push(cand);
      prevMidi = cand.midi;
      placed++;
    }
    // If an inversion couldn't complete in range, drop its partial fragment so
    // we don't emit a malformed group.
    if (placed < n) events.length -= placed;
  }
  if (!events.length) throw new Error('Could not build inversions in range.');
  const seq = orientSeq(events, cfg.direction);
  const step = secondsPerDivision(cfg), totalTime = cfg.bars * measureSeconds(cfg);
  const sus = Math.max(0.05, step * 0.88);
  const ex = fillNotesFromSeq(seq, { step, totalTime, sus, loopCycleSteps: seq.length, name: `Inversions — ${cfg.key} ${quality}` });
  applyStrokePolicy(ex.notes, cfg, 'bass_parity');   // bass: strict i-m parity (guitar: player's choice)
  return ex;
}
