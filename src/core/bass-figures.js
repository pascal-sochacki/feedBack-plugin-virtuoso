// SPDX-License-Identifier: AGPL-3.0-only
import { isBassCfg } from './instrument-tuning.js';
import { resolveArrangement } from './arrangement.js';
import { pcAtOrAbove } from './voicing.js';
import { COMP_VEL } from './comp-cells.js';

// ── BASS_FIGURES — backing bass figures (backing engine step 4, Build-plan v2 #4/#6) ──
// The bass lane parallel to COMP_GROOVES: a figure walks role:'bass' events
// under the comp on the shared chord timeline. Design rules (bass-pedagogy's
// locked re-check — agent memory project_backing_bass_figures_recheck):
//   · beat 1 of every chord change = the ROOT, at the chord slot's exact grid
//     time (the kick's slot) — never humanized; quarters on the beat are
//     fixed points of the swing warp, so a jazz walking line stays straight
//     against the swung ride by construction (the per-voice-feel rule).
//   · register: roots fold into MIDI 28–43 (E1–G2), the line stays ≤50 (D3),
//     floor 28 always — never the low-B register in backing.
//   · leaps ≤9 semitones; the octave (12) whitelisted as a device.
//   · note length ~90% of the slot (the boogie 0.9 rule) — a model line the
//     player can internalize, not a synth drone.
//   · deterministic: generators draw ONLY from the chart's seeded rng — the
//     same cfg rolls the same line every pass (a figure that mutates every
//     pass can't be internalized; charts stay byte-golden).
//   · MUTE the whole figure when the player IS the bassist (jam-drops-bass:
//     the player supplies the low end) — see bassFigureForConfig; the comp
//     also register-LIFTS (lowest voice ≥48) whenever a figure plays,
//     dropping the pad's folded root so the two lanes never fight.
// A pattern figure is a COMP_GROOVES-schema grid: '.' or { iv, acc?, g?,
// hold? } (iv = semitones above the chord root; g = ghost; hold = sustain to
// the next strike / chord end). Generators (walking, motown_counter) are
// rule-sets, not stored patterns. Every figure carries a player-facing label.
export const BASS_FIG_FLOOR = 28, BASS_FIG_CEIL = 50, BASS_ROOT_CAP = 43;

/** @type {Record<string, import('./generation-types.js').BassFigure>} */
export const BASS_FIGURES = {
  sustained_root: { kind: 'pattern', div: 1, bars: 1, label: 'sustained root',
    grid: [{ iv: 0, acc: 1, hold: 1 }, '.', '.', '.'] },
  two_feel:       { kind: 'pattern', div: 1, bars: 1, label: 'two-feel bass (root–5)',
    grid: [{ iv: 0, acc: 1 }, '.', { iv: 7 }, '.'] },
  // Walking two-feel (panel 2026-06-13, country+bass-pedagogy): the root–5 boom on
  // 1 & 3 + a 6th→♭7 walk-up climbing the back half of the bar into the next chord's
  // root — the country bassist's signature approach run (the ♭7 leads up a half-step
  // to ANY next root). Half the "country feel" the static two_feel was missing. A
  // pattern approximation of the true next-chord-aware walk (the gen is a follow-on). div:2.
  two_feel_walk:  { kind: 'pattern', div: 2, bars: 1, label: 'walking two-feel (root–5 + approach)',
    grid: [{ iv: 0, acc: 1 }, '.', '.', '.', { iv: 7 }, '.', { iv: 9 }, { iv: 10 }] },
  root_pump:      { kind: 'pattern', div: 2, bars: 1, label: 'eighth-note root pump',
    grid: [{ iv: 0, acc: 1 }, { iv: 0 }, { iv: 0 }, { iv: 0 }, { iv: 0, acc: 1 }, { iv: 0 }, { iv: 0 }, { iv: 0 }] },
  // Metal GALLOP bass (panel 2026-06-13, bass+metal-pedagogy): the root on the exact
  // gallop grid — eighth + two 16ths per beat ([root, rest, root, root]×4) — so it
  // hits onset-for-onset with the metal_gallop comp AND the metal_drive kick (a.nna).
  // THAT lock is what makes the rhythm section sound like one tight band, not three
  // parts. Root-only (power-chord context); the down-accent leads each gallop. div:4.
  root_gallop:    { kind: 'pattern', div: 4, bars: 1, label: 'metal gallop bass (kick-locked)',
    grid: [{ iv: 0, acc: 1 }, '.', { iv: 0 }, { iv: 0 }, { iv: 0, acc: 1 }, '.', { iv: 0 }, { iv: 0 },
           { iv: 0, acc: 1 }, '.', { iv: 0 }, { iv: 0 }, { iv: 0, acc: 1 }, '.', { iv: 0 }, { iv: 0 }] },
  // The shipped blues boogie bass, ported verbatim as figure #1 (root–5–6–♭7
  // on the beats) — the boogie recipe = this + the boogie_stab comp cell.
  bass_ostinato:  { kind: 'pattern', div: 1, bars: 1, label: 'boogie bass figure',
    grid: [{ iv: 0, acc: 1 }, { iv: 7 }, { iv: 9 }, { iv: 10 }] },
  walking:        { kind: 'gen', label: 'walking bass' },
  motown_counter: { kind: 'gen', label: 'Motown-style counter-line' },
  // Funk 16th pocket (funk-idiom + bass-pedagogy sign-off): accented root on the
  // one (kick-locked), ghost-thumb chucks on the 'a' subdivisions, then the
  // melodic 5th→♭7 answer late in the bar (the ♭7 sits ABOVE the root, iv:10, in
  // the anchor window — bass-ped: no octave wrap). Only the one + the 5/♭7 tail
  // are full notes; everything between is a ghost (the funk contour). div:4.
  funk_pocket_16: { kind: 'pattern', div: 4, bars: 1, label: '16th funk pocket',
    grid: [{ iv: 0, acc: 1 }, '.', '.', { iv: 0, g: 1 }, '.', '.', { iv: 0, g: 1 }, '.',
           '.', { iv: 0, g: 1 }, '.', { iv: 7 }, '.', '.', { iv: 10 }, '.'] },
  // ── World / genre bass figures (band-intel genre batch, bass-pedagogy-vetted
  // 2026-06-13) — each the genre's idiomatic low-end ROLE, register-folded by the
  // engine, beat-1 root-locked to the kick.
  // Reggae one-drop riddim: root pickup on 1, the REST on beat 3 (step 4) where
  // the kick drops in — the bass IS the hook, round R–♭3–5–♭3 contour.
  reggae_riddim:    { kind: 'pattern', div: 2, bars: 1, label: 'reggae one-drop riddim',
    grid: [{ iv: 0, acc: 1 }, '.', { iv: 0 }, { iv: 3 }, '.', { iv: 5 }, { iv: 3 }, '.'] },
  // Disco octave bass: relentless root/up-octave eighth bounce, accents on the two
  // downbeats — the four-on-the-floor lock.
  octave_jump_bass: { kind: 'pattern', div: 2, bars: 1, label: 'disco octave bass',
    grid: [{ iv: 0, acc: 1 }, { iv: 12 }, { iv: 0 }, { iv: 12 }, { iv: 0, acc: 1 }, { iv: 12 }, { iv: 0 }, { iv: 12 }] },
  // Bossa surdo two-feel: root on 1 & 3, the 5th pushing the &-of-2 & &-of-4 — the
  // figure that defines bossa low-end.
  bossa_bass:       { kind: 'pattern', div: 2, bars: 1, label: 'bossa nova root–5 surdo',
    grid: [{ iv: 0, acc: 1 }, '.', '.', { iv: 7 }, { iv: 0 }, '.', '.', { iv: 7 }] },
  // Afrobeat melodic ostinato (Fela/Tony-Allen): a syncopated &-pushed loop —
  // R → 5 → R → ♭7 → octave → 5 → ghost-R — that climbs the ♭7 into the octave then
  // walks back to loop seamlessly, locked to the kick on beat 1. The bass IS the hook.
  afro_ostinato:    { kind: 'pattern', div: 4, bars: 1, label: 'Afrobeat melodic ostinato',
    grid: [{ iv: 0, acc: 1 }, '.', { iv: 7 }, '.', { iv: 0 }, '.', { iv: 10 }, { iv: 12, hold: 1 },
           '.', '.', { iv: 7 }, '.', { iv: 5 }, '.', { iv: 0, g: 1 }, '.'] },
  // ── World / genre bass figures Wave 2 (band-intel, bass-pedagogy-vetted
  // 2026-06-13 — all 4 confirmed ship-as-written) ─────────────────────────────
  // Norteño tuba/tololoche oom-pah: root "oom" on 1, the 5th-up "oom" on 3 — the
  // fat low foundation under the bajo chop. div:1.
  oompah_polka:     { kind: 'pattern', div: 1, bars: 1, label: 'oom-pah polka bass (root–5)',
    grid: [{ iv: 0, acc: 1 }, '.', { iv: 7, acc: 1 }, '.'] },
  // Norteño full-tier with a tololoche approach: the oom-pah, then the 4th late as a
  // descending approach into the next bar's root (bass-ped: a walk-DOWN, idiomatic). div:2.
  oompah_walk:      { kind: 'pattern', div: 2, bars: 1, label: 'oom-pah bass with approach',
    grid: [{ iv: 0, acc: 1 }, '.', { iv: 7 }, '.', { iv: 7, acc: 1 }, '.', { iv: 5 }, '.'] },
  // Tango habanera 3-3-2 síncopa: root/5th onsets at 16th-slots 0,3,6,8,11,14 = the
  // dotted tango bass, the slot-14 hit leaning as an arrastre pickup into beat 1. div:4.
  habanera_332:     { kind: 'pattern', div: 4, bars: 1, label: 'habanera (3-3-2)',
    grid: [{ iv: 0, acc: 1 }, '.', '.', { iv: 7 }, '.', '.', { iv: 0, acc: 1 }, '.',
           { iv: 7 }, '.', '.', { iv: 0 }, '.', '.', { iv: 7, acc: 1 }, '.'] },
  // New Orleans tresillo "big four": the habanera-derived 3-3-2 root figure (hits at
  // bar-1 slots 0,6,8 = the tresillo) with the 5th "big four" push (slot 14) propelling
  // bar 2 — the Earl-Palmer Crescent-City lift. div:4, bars:2.
  tresillo_nola:    { kind: 'pattern', div: 4, bars: 2, label: 'tresillo (NOLA big four)',
    grid: [{ iv: 0, acc: 1 }, '.', '.', '.', '.', '.', { iv: 0 }, '.', { iv: 0, acc: 1 }, '.', '.', '.', '.', '.', { iv: 7 }, '.',
           { iv: 0, acc: 1 }, '.', '.', '.', '.', '.', { iv: 0 }, '.', { iv: 0, acc: 1 }, '.', '.', '.', '.', '.', { iv: 0 }, '.'] },
};

// Which bass figure (if any) plays for this cfg — the lane's auto-pilot,
// mirroring compCellForConfig. Order matters: the A/B dev flag + density
// gates first (bass enters at density 2, 'groove'); the PLAYER-IS-THE-BASSIST
// mute beats everything musical; authored wins; the boogie recipe's bass half
// is figure #1; the jazz pilot WALKS (the same swung-cfg condition as the
// Charleston, so the two arrive together). Everything else: no figure yet —
// genres get theirs with the step-6 recipes, each genre-agent-vetted.
/** @param {import('./generation-types.js').GenerationConfig} cfg */
export function bassFigureForConfig(cfg) {
  if (cfg.backingPadDev) return null;
  if (cfg.backingDensity === 0 || cfg.backingDensity === 1) return null;
  if (isBassCfg(cfg)) return null;
  if (cfg.backingBass && BASS_FIGURES[cfg.backingBass]) return cfg.backingBass;
  if (cfg.backingStyle === 'boogie') return 'bass_ostinato';
  if (cfg.swing && cfg.swing !== 'straight') return 'walking';
  const recBass = resolveArrangement(cfg).picks.bass;            // band-intel B1: the genre's bass (un-wired styles)
  if (recBass && BASS_FIGURES[recBass]) return recBass;
  return null;
}

// Fold a chord root into the figure's root window: ≥ the E1 floor, low
// enough that root+maxIv stays under the line ceiling, ≤ G2 regardless.
// (Eb edge: when neither octave fits the window, stay high — a one-semitone
// ceiling overshoot beats dropping below the E1 floor.)
/** @param {number} rootPc @param {number} maxIv */
export function bassFigureRoot(rootPc, maxIv) {
  const cap = Math.min(BASS_ROOT_CAP, BASS_FIG_CEIL - maxIv);
  let m = pcAtOrAbove(rootPc, BASS_FIG_FLOOR);
  if (m > cap && m - 12 >= BASS_FIG_FLOOR) m -= 12;
  return m;
}

// Fold a pitch class to the octave nearest a reference note, inside the line
// range — chord-seam landings stay small (≤6 semitones either way).
/** @param {number} pc @param {number} ref */
export function nearestBassPc(pc, ref) {
  let m = ref + ((((pc - ref) % 12) + 12) % 12);
  if (m - ref > 6) m -= 12;
  return clampBassLine(m);
}

/** @param {number} m */
export function clampBassLine(m) {
  while (m < BASS_FIG_FLOOR) m += 12;
  while (m > BASS_FIG_CEIL) m -= 12;
  return m;
}

// Step a pattern figure's grid across one chord event window (the same
// tiling the comp cells use). Hits are UNLABELED — buildBackingEvents
// assigns the one chord-change carrier.
/** @param {string} figId @param {import('./generation-types.js').BassFigure} fig @param {import('./generation-types.js').TimelineEvent} c @param {number} beatSec @param {number} duration */
export function bassPatternEvents(figId, fig, c, beatSec, duration) {
  const stepSec = beatSec / /** @type {number} */ (fig.div), n = /** @type {NonNullable<typeof fig.grid>} */ (fig.grid).length;
  const maxIv = Math.max.apply(null, /** @type {NonNullable<typeof fig.grid>} */ (fig.grid).map(s => (s === '.' ? 0 : s.iv)));
  const root0 = bassFigureRoot(c.rootPc, maxIv);
  const out = [];
  for (let k = 0; ; k++) {
    const t0 = c.startSec + k * stepSec;
    if (t0 >= c.endSec - 1e-4 || t0 >= duration - 1e-4) break;
    const step = /** @type {NonNullable<typeof fig.grid>} */ (fig.grid)[k % n];
    if (step === '.' || !step) continue;
    let end;
    if (step.hold) {
      end = c.endSec;
      for (let j = k + 1; ; j++) {
        const tj = c.startSec + j * stepSec;
        if (tj >= c.endSec - 1e-4) break;
          if (/** @type {NonNullable<typeof fig.grid>} */ (fig.grid)[j % n] !== '.') { end = tj; break; }
      }
    } else end = t0 + stepSec * 0.9;
    out.push({ t: +t0.toFixed(6), end: +Math.min(end, c.endSec, duration).toFixed(6), name: '',
               midis: [root0 + step.iv], role: 'bass',
               vel: step.acc ? COMP_VEL.accent : step.g ? COMP_VEL.ghost : COMP_VEL.normal, fig: figId });
  }
  return out;
}

// The WALKING generator (bass-pedagogy's locked minimal rules): per chord
// window — beat 1 = the root on every change (3rd/5th only on a repeated
// chord's 2nd+ window), landed nearest the previous note; the LAST beat
// approaches the NEXT chord's root (chromatic ±1 weighted highest, then the
// dominant — the next chord's 5th — then scalar ±2); middle beats = chord
// tones stepping from the landing toward the approach, no adjacent repeats.
/** @param {string} figId @param {import('./generation-types.js').TimelineEvent[]} timeline @param {number} duration @param {number} beatSec @param {() => number} rng */
export function bassWalkEvents(figId, timeline, duration, beatSec, rng) {
  // PASS 1 (bass-pedagogy must-fix, 2026-06-07 vetting): pre-roll every
  // window's beat-1 DEGREE so each bar's approach can target the next
  // window's ACTUAL landing — a repeated chord may open on its 3rd/5th, and
  // a chromatic approach into a root that never comes sounds like a flubbed
  // note (the never-list: "every bar targets the next chord"). One seeded
  // stream, drawn in pass order — still deterministic.
  const landIvs = [], chg = [];
  {
    let lastName = null, sameRun = 0;
    for (const c of timeline) {
      sameRun = c.name === lastName ? sameRun + 1 : 0; lastName = c.name;
      chg.push(sameRun === 0);
      const ivs = c.intervals.map(i => ((i % 12) + 12) % 12);
      let iv1 = 0;
      if (sameRun > 0) {
        const r = rng();
        iv1 = r < 0.5 ? 0 : r < 0.8 ? (ivs.includes(7) ? 7 : 0) : (ivs.includes(4) ? 4 : ivs.includes(3) ? 3 : 0);
      }
      landIvs.push(iv1);
    }
  }
  const perChord = [];
  /** @type {number | null} */
  let prev = null;
  for (let ci = 0; ci < timeline.length; ci++) {
    const c = timeline[ci], nx = (ci + 1) % timeline.length;
    const next = timeline[nx];
    const hits = [];
    const ivs = c.intervals.map(i => ((i % 12) + 12) % 12);
    const beats = Math.max(1, Math.round((c.endSec - c.startSec) / beatSec - 1e-6));
    const pc1 = ((c.rootPc + landIvs[ci]) % 12 + 12) % 12;
    /** @type {number} */
    const b1 = prev == null ? bassFigureRoot(pc1, 0) : nearestBassPc(pc1, prev);
    const notes = [b1];
    if (beats >= 2) {
      // The approach targets the next window's LANDING (root or the pre-
      // rolled 3rd/5th), chromatic ±1 weighted highest; the dominant branch
      // stays harmonic (the next CHORD's 5th) but never duplicates the
      // landing pitch class (that would repeat across the barline).
      const landPcNext = ((next.rootPc + landIvs[nx]) % 12 + 12) % 12;
      const nextLand = nearestBassPc(landPcNext, b1);
      const roll = rng();
      let appr = roll < 0.55 ? nextLand + (b1 >= nextLand ? 1 : -1)
        : roll < 0.8 ? nearestBassPc((next.rootPc + 7) % 12, nextLand)
        : nextLand + (b1 >= nextLand ? 2 : -2);
      if (((appr % 12) + 12) % 12 === landPcNext) appr = nextLand + (b1 >= nextLand ? 1 : -1);
      appr = clampBassLine(appr);
      if (appr === b1 && beats === 2) appr = clampBassLine(nextLand + (b1 > nextLand ? -1 : 1));
      // Walk pool across the playable range: chord tones + the scale 2nd
      // (the classic passing quarter — gives R-2-3 / stepwise lines instead
      // of chord-tone zigzag) + the 6th over major/dominant/dorian colour
      // (never over a ♭5 chord, where the natural 6 is off-scale).
      const poolIvs = ivs.slice();
      if (!poolIvs.includes(2)) poolIvs.push(2);
      if ((ivs.includes(4) || ivs.includes(10)) && !ivs.includes(6) && !poolIvs.includes(9)) poolIvs.push(9);
      const pool = [];
      for (const iv of poolIvs) {
        const pc = ((c.rootPc + iv) % 12 + 12) % 12;
        for (let m = BASS_FIG_FLOOR + ((pc - BASS_FIG_FLOOR) % 12 + 12) % 12; m <= BASS_FIG_CEIL; m += 12) pool.push(m);
      }
      pool.sort((a, b) => a - b);
      for (let b = 1; b <= beats - 2; b++) {
        const target = b1 + (appr - b1) * (b / (beats - 1));
        const last = notes[notes.length - 1];
        let pick = null, bestD = Infinity;
        for (const m of pool) {
          if (m === last) continue;                                   // no adjacent repeats
          if (b === beats - 2 && m === appr) continue;                // no repeat INTO the approach
          if (Math.abs(m - last) > 9) continue;                       // leap cap
          const d = Math.abs(m - target) + (Math.abs(m - last) > 4 ? 1.5 : 0);   // prefer stepwise
          if (d < bestD) { bestD = d; pick = m; }
        }
        notes.push(pick == null ? clampBassLine(last + (appr >= last ? 2 : -2)) : pick);
      }
      notes.push(appr);
      // Leap-cap repair: a range-clamp octave fold can leave a non-octave
      // leap >9 — refold toward the line, or swap in a chord tone that fits.
      for (let i = 1; i < notes.length; i++) {
        const gap = notes[i] - notes[i - 1];
        if (Math.abs(gap) <= 9 || Math.abs(gap) === 12) continue;
        const alt = notes[i] + (gap > 0 ? -12 : 12);
        if (alt >= BASS_FIG_FLOOR && alt <= BASS_FIG_CEIL && alt !== notes[i - 1] && (i + 1 >= notes.length || alt !== notes[i + 1])) { notes[i] = alt; continue; }
        for (const m of pool) {
          if (m === notes[i - 1] || (i + 1 < notes.length && m === notes[i + 1])) continue;
          if (Math.abs(m - notes[i - 1]) <= 9 && (i + 1 >= notes.length || Math.abs(notes[i + 1] - m) <= 9)) { notes[i] = m; break; }
        }
      }
    }
    for (let b = 0; b < notes.length; b++) {
      const t0 = c.startSec + b * beatSec;
      if (t0 >= c.endSec - 1e-4 || t0 >= duration - 1e-4) break;
      // Accent ONLY when the chord actually changes (jazz-idiom vetting
      // 2026-06-07): the accent then MEANS "new chord here" — a hammer on
      // every bar's downbeat is oom-pah, not walking.
      hits.push({ t: +t0.toFixed(6), end: +Math.min(c.endSec, duration, t0 + beatSec * 0.9).toFixed(6),
                  name: '', midis: [notes[b]], role: 'bass',
                  vel: b === 0 && chg[ci] ? COMP_VEL.accent : COMP_VEL.normal, fig: figId });
    }
    if (hits.length) prev = hits[hits.length - 1].midis[0];
    perChord.push(hits);
  }
  return perChord;
}

// motown_counter (gen): the syncopated chord-tone counter-line — root on 1
// (kick-locked), an octave/5th pop mid-bar, a low-velocity GHOST (the dead
// thumb), and a chromatic approach into the next root on the last upbeat.
// Authored-only until the soul/Motown recipe lands (step 6).
/** @param {string} figId @param {import('./generation-types.js').TimelineEvent[]} timeline @param {number} duration @param {number} beatSec @param {() => number} rng */
export function bassMotownEvents(figId, timeline, duration, beatSec, rng) {
  const perChord = [];
  for (let ci = 0; ci < timeline.length; ci++) {
    const c = timeline[ci], next = timeline[ci + 1] || timeline[0];
    /** @type {import('./generation-types.js').BackingEvent[]} */
    const hits = [];
    const ivs = c.intervals.map(i => ((i % 12) + 12) % 12);
    const root0 = bassFigureRoot(c.rootPc, 12);
    const octOk = root0 + 12 <= BASS_FIG_CEIL + 1;     // the Eb-edge fold may sit one over
    const beats = Math.max(1, Math.round((c.endSec - c.startSec) / beatSec - 1e-6));
    /** @param {number} slot @param {number} midi @param {number} vel */
    const push = (slot, midi, vel) => {
      const t0 = c.startSec + slot * (beatSec / 2);
      if (t0 >= c.endSec - 1e-4 || t0 >= duration - 1e-4) return;
      hits.push({ t: +t0.toFixed(6), end: +Math.min(c.endSec, duration, t0 + beatSec * 0.45).toFixed(6),
                  name: '', midis: [midi], role: 'bass', vel, fig: figId });
    };
    // Quality-gated colour tone (bass-pedagogy must-fix, 2026-06-07): the ♭7
    // when the chord has one OR a bare minor 3rd — a natural 6 over a minor
    // chord is a deliberate dorian choice, not a default, and out of key on
    // a diatonic vi. The major 6th only over major/dominant colour.
    const fifth = root0 + 7;
    const six = (ivs.includes(10) || (ivs.includes(3) && !ivs.includes(4))) ? root0 + 10 : root0 + 9;
    const nextRoot = nearestBassPc(((next.rootPc % 12) + 12) % 12, root0);
    const appr = clampBassLine(nextRoot + (root0 >= nextRoot ? 1 : -1));
    push(0, root0, COMP_VEL.accent);                   // the kick-locked root
    if (beats >= 4) {
      push(3, rng() < 0.6 ? fifth : six, COMP_VEL.normal);   // the '& of 2' push
      const pop = octOk && rng() < 0.6 ? root0 + 12 : fifth;
      push(4, pop, COMP_VEL.normal);                   // beat-3 pop
      if (rng() < 0.7) push(5, pop, COMP_VEL.ghost);   // the dead-thumb ghost
      push(6, fifth, COMP_VEL.normal);
      push(7, appr, COMP_VEL.normal);                  // chromatic approach into the next root
    } else if (beats >= 2) {
      push(2, octOk && rng() < 0.5 ? root0 + 12 : fifth, COMP_VEL.normal);
      push(beats * 2 - 1, appr, COMP_VEL.normal);
    }
    perChord.push(hits);
  }
  return perChord;
}

// Dispatch: the figure's hits grouped PER timeline event (the caller labels
// the first hit per chord change and merges with the comp lane).
/** @param {string} figId @param {import('./generation-types.js').TimelineEvent[]} timeline @param {number} duration @param {number} beatSec @param {() => number} rng */
export function buildBassFigureEvents(figId, timeline, duration, beatSec, rng) {
  const fig = BASS_FIGURES[figId];
  if (!fig) return timeline.map(() => []);
  if (fig.kind === 'pattern') return timeline.map(c => bassPatternEvents(figId, fig, c, beatSec, duration));
  if (figId === 'walking') return bassWalkEvents(figId, timeline, duration, beatSec, rng);
  if (figId === 'motown_counter') return bassMotownEvents(figId, timeline, duration, beatSec, rng);
  return timeline.map(() => []);
}
