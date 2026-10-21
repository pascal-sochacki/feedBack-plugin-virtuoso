// SPDX-License-Identifier: AGPL-3.0-only
import { noteDefaults } from '../notes.js';
import { measureSeconds, secondsPerDivision } from '../timing.js';
import { progressionDegreesForConfig, chordRootForDegree, chordQualityForDegree, chordName } from '../harmony.js';
import { CAGED_SHAPES } from '../fretboard-shapes.js';
import { STRUM_SHAPE_ORDER, pickStrumGrip } from '../strum-grips.js';
import { templateFromPositions } from '../chord-positions.js';

// ── strum_comp: held voiced chord + strum rhythm/feel ───────────────────────
// The one new generator from the Workout charette. Pre-build consult (2026-06-02):
// rhythm-meter (the STRUM_PATTERNS cell model + the down/up micro-stagger),
// harmony (voice from CAGED grips, NOT the voiceChord pad), guitar-pedagogy
// (playability + muted-string encoding + bass = n-a). Per-lane specs in
// .claude/agent-memory/{rhythm-meter-architect,harmony-theory-architect,
// guitar-pedagogy-expert}/*strum*. It's a RHYTHM-HAND-INDEPENDENCE drill: hold a
// real fretting-hand GRIP and strike it on a strum pattern; the strum hand never
// stops (rests = no event, hand keeps the clock).
//
// STRUM_PATTERNS — rhythm cells (sibling to SEQUENCE_PATTERNS), authored in 4/4.
//   div    steps per beat (1 quarter · 2 eighth · 3 triplet · 4 sixteenth)
//   grid   one token per step: D down(low→high) · U up(high→low, top strings) ·
//          '.' rest/ring · X muted chuck (mt) · '-' tie. A '!' suffix accents that step.
//   accent which steps auto-accent: downbeat | backbeat | offbeat | even
//   preSwing  the cell is already swung → its notes carry noSwing so the global
//             swing post-process doesn't double-swing it.
/** @type {Record<string, {div: number, bars: number, grid: string[], accent: string, preSwing?: boolean}>} */
export const STRUM_PATTERNS = {
  held_pad:                 { div:1, bars:1, grid:['D','.','.','.'], accent:'downbeat' },
  quarter_down:             { div:1, bars:1, grid:['D','D','D','D'], accent:'downbeat' },
  eighth_down:              { div:2, bars:1, grid:['D','D','D','D','D','D','D','D'], accent:'backbeat' },
  folk_pop_ddu_udu:         { div:2, bars:1, grid:['D','.','D','U','.','U','D','U'], accent:'backbeat' },
  sixteenth_funk_scratch:   { div:4, bars:1, grid:['D','X','U','X','D','X','U','X','D','X','U','X','D','X','U','X'], accent:'offbeat' },
  reggae_skank:             { div:2, bars:1, grid:['.','U','.','U','.','U','.','U'], accent:'offbeat' },
  ballad_arpeggiated_strum: { div:3, bars:1, grid:['D','.','U','.','U','.','D','.','U','.','U','.'], accent:'downbeat', preSwing:true },
  charleston:               { div:2, bars:1, grid:['D','.','.','D','.','.','.','.'], accent:'downbeat' },
};

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function defaultStrumPattern(cfg) {
  if (cfg.style === 'funk')   return 'sixteenth_funk_scratch';
  if (cfg.style === 'reggae') return 'reggae_skank';
  if (cfg.chordOverride === '5' || cfg.chordOverride === '5oct') return 'eighth_down';
  if (cfg.subdivision === 'quarter') return 'quarter_down';
  return 'folk_pop_ddu_udu';
}

/** @param {string} mode @param {number} k @param {number} div @param {number} beatsPerBar */
export function strumStepAccented(mode, k, div, beatsPerBar) {
  const beatIdx = Math.floor(k / div), within = k % div;
  switch (mode) {
    case 'even':     return true;
    case 'offbeat':  return div >= 2 && within === Math.floor(div / 2);
    case 'backbeat': return within === 0 && (beatIdx % 2 === 1);                              // 2 & 4 in 4/4
    case 'downbeat':
    default:         return within === 0 && (beatIdx === 0 || beatIdx === Math.floor(beatsPerBar / 2)); // 1 (& 3)
  }
}

// Emit one strum as per-string time-staggered events (a rake, not a block chord).
// Down = low→high (ascending s); up = top ≤4 strings high→low. Stagger tightens
// with tempo so two strums never smear; de-stacking onsets is limiter-friendly.
/** @param {import('../notes.js').Note[]} notes @param {import('../generation-types.js').ChordPosition[]} gripNotes @param {string} tok @param {number} stepT @param {number} stepSec @param {boolean} accent @param {boolean} preSwing */
export function emitStrum(notes, gripNotes, tok, stepT, stepSec, accent, preSwing) {
  const sorted = gripNotes.slice().sort((a, b) => a.s - b.s);
  const mute = (tok === 'X');
  let struck, order;
  if (tok === 'U') { struck = sorted.slice(-4); order = struck.slice().reverse(); }  // up: top ≤4, high→low
  else             { struck = sorted; order = struck; }                              // down / chuck: all, low→high
  const span = Math.max(1, order.length);
  // Accent-aware rake (band-intel C1): an accented strike snaps tighter (a
  // faster wrist), a ghost/mute drags slightly wider — the loose-vs-snapped
  // contrast is most of what reads as a human strum hand.
  const widthMul = accent ? 0.7 : mute ? 1.15 : 1.0;
  const stagger = Math.max(0.005, Math.min(0.02, (stepSec * 0.40 * widthMul) / span));
  const sus = mute ? Math.max(0.04, stepSec * 0.35) : Math.max(0.05, stepSec * 0.92);
  order.forEach((p, k) => {
    notes.push(noteDefaults({
      t: Number((stepT + k * stagger).toFixed(6)), s: p.s, f: p.f, sus: Number(sus.toFixed(6)),
      mt: mute, ac: !!accent, noSwing: !!preSwing,
      // Strum-group tag: one strike = one chord event. The rake stagger means
      // these notes do NOT share a t, so the scorer's chord-exemption grouping
      // (startPitchTracker) needs this explicit key. stepT is unique per strike
      // within a chart and deterministic (byte-golden safe).
      ch: Number(stepT.toFixed(6)),
    }));
  });
}

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildStrumCompExercise(cfg) {
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const beatsPerBar = Math.max(1, cfg.meter.numerator);
  const beatUnit = mLen / beatsPerBar;
  const degrees = progressionDegreesForConfig(cfg);
  const fixedShape = (cfg.voicingPosition === 'movable' && cfg.shape && CAGED_SHAPES[cfg.shape]) ? cfg.shape : null;
  // Shape WALK ("The Five CAGED Shapes" rung): voice bar i's chord in the i-th
  // CAGED shape, ordered low→high by each shape's natural lowest grip for the
  // first chord — for any key this reproduces the canonical CAGED stack
  // climbing the neck (G: G→E→D→C→A). Each chord box is renamed with its
  // shape so the player learns the vocabulary, not just the grip. Overrides
  // fixedShape per bar; pairs naturally with a static_i progression ("the
  // same chord, five ways up the neck").
  let walkOrder = null;
  if (cfg.shapeWalk) {
    const deg0 = degrees[0];
    const rootPc0 = chordRootForDegree(cfg, deg0);
    const quality0 = chordQualityForDegree(cfg.scale, cfg.chordDepth, deg0, cfg.chordOverride, cfg.progression);
    walkOrder = STRUM_SHAPE_ORDER
      .map(sh => { const g = pickStrumGrip(cfg, rootPc0, quality0, -1, { fixedShape: sh, walkGate: true }); return g ? { sh, lo: Math.min.apply(null, g.gripNotes.map(p => p.f)) } : null; })
      .filter(/** @returns {x is {sh: string, lo: number}} */ x => Boolean(x))
      .sort((a, b) => a.lo - b.lo)
      .map(x => x.sh);
    if (!walkOrder.length) walkOrder = null;
  }
  // Low tempo tiers breathe: 2 bars per shape at ≤80 BPM (10 bars = exactly
  // one lap), 1 bar per shape above (10 bars = two laps) — pedagogy review.
  const barsPerShape = cfg.bpm <= 80 ? 2 : 1;
  const pat = STRUM_PATTERNS[/** @type {string} */ (cfg.strumPattern)] || STRUM_PATTERNS[defaultStrumPattern(cfg)] || STRUM_PATTERNS.folk_pop_ddu_udu;
  // Odd-meter / non-4-beat degrade: if the 4/4-authored grid doesn't fit this bar,
  // fall back to a down-strum on each beat (the chord "limps" with the meter).
  const gridFits = pat.grid.length === beatsPerBar * pat.div;
  const stepCount = gridFits ? pat.grid.length : beatsPerBar;
  const stepSec   = gridFits ? (beatUnit / pat.div) : beatUnit;

  /** @type {import('../notes.js').Note[]} */
  const notes = [];
  const chords = [], chordTemplates = [], handShapes = [];
  const sections = [{ name:`Strum — ${cfg.key}`, number:1, time:0 }];
  let templateId = 0, prevRootFret = -1, prevMeanFret = -1;   // mean grip fret feeds economy hand-distance
  for (let bar = 0, t = 0; t < totalTime - 0.001; bar++, t += mLen) {
    const deg = degrees[bar % degrees.length];
    const rootPc = chordRootForDegree(cfg, deg);
    const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth, deg, cfg.chordOverride, cfg.progression);
    const barShape = walkOrder ? walkOrder[Math.floor(bar / barsPerShape) % walkOrder.length] : null;
    const grip = pickStrumGrip(cfg, rootPc, quality, barShape ? -1 : prevRootFret,
      { fixedShape: barShape || fixedShape, walkGate: !!barShape, economy: cfg.voicingPosition === 'economy', prevMeanFret });
    if (!grip || !grip.gripNotes.length) continue;
    // (Walk mode needs no extra labeling — templateFromShape's displayName is
    // already "G (E-shape)", and the chord box prefers displayName.)
    prevRootFret = grip.rootFret;
    prevMeanFret = grip.gripNotes.reduce((a, p) => a + p.f, 0) / grip.gripNotes.length;
    // Chord box: the full grip (so the chord-box renderers draw x/o + fingering).
    const id = templateId++;
    chordTemplates.push(grip.template || templateFromPositions(chordName(rootPc, quality), grip.gripNotes, cfg, false));
    chords.push({ t:Number(t.toFixed(6)), id, hd:false, notes:grip.gripNotes.map(p => noteDefaults({ s:p.s, f:p.f, sus:0 })) });
    handShapes.push({ chord_id:id, start_time:Number(t.toFixed(6)), end_time:Number((t + mLen).toFixed(6)), arp:false });
    // Strikes from the pattern.
    for (let k = 0; k < stepCount; k++) {
      const raw = gridFits ? pat.grid[k] : 'D';
      const tok = String(raw).replace('!', '');
      if (tok === '.' || tok === '-') continue;
      const stepT = t + k * stepSec;
      if (stepT >= totalTime - 0.0005) break;
      const accent = String(raw).includes('!') || strumStepAccented(pat.accent, k, pat.div, beatsPerBar);
      emitStrum(notes, grip.gripNotes, tok, stepT, stepSec, accent, !!pat.preSwing);
    }
  }
  if (!notes.length) throw new Error('No strum/comp notes generated (strum_comp needs ≥6 strings — guitar only).');
  return { notes, chords, chordTemplates, handShapes, sections, duration:totalTime };
}

// p-i-m-a broken-chord study over a progression — the classical arpeggio-
// study tradition, genericized: hold each bar's grip (the same open/CAGED
// grips strum_comp picks) and arpeggiate it one string at a time, thumb on
// the bass string, i-m-a on their home strings, every note ringing through
// the bar (free stroke, let ring). The pattern restarts on each chord.
/** @type {Record<string, string[]>} */
export const PIMA_PATTERNS = {
  pima:   ['p', 'i', 'm', 'a'],                  // the ascending foundation
  pami:   ['p', 'a', 'm', 'i'],                  // descending answer
  pimami: ['p', 'i', 'm', 'a', 'm', 'i'],        // the up-and-back wave
  pmim:   ['p', 'm', 'i', 'm'],                  // inner-voice alternation
};

/** @param {import('../generation-types.js').GenerationConfig} cfg */
export function buildFingerstyleArpExercise(cfg) {
  const mLen = measureSeconds(cfg), totalTime = cfg.bars * mLen;
  const step = secondsPerDivision(cfg);
  const degrees = progressionDegreesForConfig(cfg);
  const seq = PIMA_PATTERNS[/** @type {string} */ (cfg.pimaPattern)] || PIMA_PATTERNS.pima;
  const notes = [], chords = [], chordTemplates = [], handShapes = [];
  const sections = [{ name: `Fingerstyle — ${cfg.key}`, number: 1, time: 0 }];
  let templateId = 0, prevRootFret = -1;
  for (let bar = 0, t = 0; t < totalTime - 0.001; bar++, t += mLen) {
    const deg = degrees[bar % degrees.length];
    const rootPc = chordRootForDegree(cfg, deg);
    const quality = chordQualityForDegree(cfg.scale, cfg.chordDepth, deg, cfg.chordOverride, cfg.progression);
    const grip = pickStrumGrip(cfg, rootPc, quality, prevRootFret, {});
    if (!grip || !grip.gripNotes.length) continue;
    prevRootFret = grip.rootFret;
    const id = templateId++;
    chordTemplates.push(grip.template || templateFromPositions(chordName(rootPc, quality), grip.gripNotes, cfg, false));
    chords.push({ t: Number(t.toFixed(6)), id, hd: false, notes: grip.gripNotes.map(p => noteDefaults({ s: p.s, f: p.f, sus: 0 })) });
    handShapes.push({ chord_id: id, start_time: Number(t.toFixed(6)), end_time: Number((t + mLen).toFixed(6)), arp: true });
    // Thumb = the grip's lowest sounded string; i/m/a = its top three (low→high).
    const sorted = grip.gripNotes.slice().sort((a, b) => a.s - b.s);
    const bassN = sorted[0];
    const top = sorted.slice(-3);
    /** @param {string} tok */
    const forTok = (tok) => tok === 'p' ? { n: bassN, rh: 0 }
      : tok === 'i' ? { n: top[0] || bassN, rh: 1 }
      : tok === 'm' ? { n: top[1] || top[0] || bassN, rh: 2 }
      :               { n: top[2] || top[1] || top[0] || bassN, rh: 3 };
    const barEnd = Math.min(t + mLen, totalTime);
    for (let k = 0; ; k++) {
      const tk = t + k * step;
      if (tk >= barEnd - 0.0005) break;
      const { n, rh } = forTok(seq[k % seq.length]);
      notes.push(noteDefaults({ t: Number(tk.toFixed(6)), s: n.s, f: n.f,
                                sus: Number(Math.min(barEnd - tk, 2.4).toFixed(6)), rh }));
    }
  }
  if (!notes.length) throw new Error('No fingerstyle notes generated (needs a 6-string guitar setup).');
  return { notes, chords, chordTemplates, handShapes, sections, duration: totalTime };
}
