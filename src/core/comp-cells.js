// SPDX-License-Identifier: AGPL-3.0-only
import { resolveArrangement } from './arrangement.js';
import { pcAtOrAbove } from './voicing.js';
import { measureSeconds } from './timing.js';
import { resolveHumanSeed } from './random.js';

// ── COMP_GROOVES — backing comp cells (backing engine step 3, Build-plan v2 #3) ──
// The pad-killer: a declared cell re-articulates the comp lane on the shared
// STRUM_PATTERNS grid schema (authored in 4/4; div × 4 × bars steps) instead
// of one sustained pad per chord. A step is '.' (rest/ring) or an object
// { t: target, a: artic, acc?: 1 } — target picks WHAT of the voicing sounds,
// artic HOW (per-hit length + velocity = mix 7a; zero extra audio nodes —
// the scheduler already plays midis for a duration at a volume).
// UNDECLARED = the legacy coalesced pad, unchanged (genre cells ship vetted,
// per the locked plan: jazz is the pilot, boogie's stabs the proof shape).
// Every cell carries a player-facing label (the future goal-card line).
/** @type {Record<string, number>} */
export const COMP_ARTIC = { stab: 0.45, chug: 0.22, sus: 1.0, ring: 0, chuck: 0.15 };

// hit length ×step (ring = to the chord's end; chuck = the recorded dead-strum)
export const COMP_VEL = { accent: 1.0, normal: 0.78, ghost: 0.45 };

// sound-design velocity tiers
// Continuous comp velocity (genre-band realism slice, rhythm-meter): three flat
// tiers read as a grid. Keep an authored ACCENT as the ceiling, but give the
// un-accented hits a METRIC contour — the bar's downbeat heavier than an on-beat
// heavier than an off-beat subdivision — so the comp has a pulse, not a flat level.
// Deterministic (no rng; the same cfg → the same chart — the per-hit ±wobble is the
// scheduler's audio-only RR, not the chart).
/** @param {import('./generation-types.js').CompStep} step @param {number} k @param {number} div @param {number} numer */
export function compHitVel(step, k, div, numer) {
  const base = step.acc ? COMP_VEL.accent : step.a === 'chug' ? COMP_VEL.ghost : COMP_VEL.normal;
  if (step.acc) return base;                                   // authored accent = the loudest hit, untouched
  const downbeat = (k % (div * Math.max(1, numer))) === 0;     // bar downbeat
  const onBeat = (k % div) === 0;                              // a beat (not an off-beat sub)
  const bump = downbeat ? 0.12 : onBeat ? 0.05 : -0.03;
  return Math.max(0.2, Math.min(0.97, base + bump));
}

// Build a 16-step (div:4) bluegrass banjo forward roll by tiling a 3-pick cell — the
// 3-against-16 phase rotation IS the Scruggs forward tumble (the cell's drone/degree
// lands on a different sixteenth each beat). Accents on the quarter pulse (0/4/8/12).
// Cell tokens: 'drone' (the high 5th-string key-tonic drone) or a degree 'R'/'3'/'5'.
/** @param {string[]} cell */
export const bjRoll = (cell) => Array.from({ length: 16 }, (_, i) => {
  const tok = cell[i % cell.length];
  /** @type {import('./generation-types.js').CompStep} */
  const step = tok === 'drone' ? { t: 'drone', a: 'ring' } : { t: 'deg', d: tok, a: 'ring' };
  if (i % 4 === 0) step.acc = 1;
  return step;
});

/** @type {Record<string, import('./generation-types.js').CompCell>} */
export const COMP_GROOVES = {
  vamp_half:   { div: 1, bars: 1, label: 'half-note vamp',
    grid: [{ t: 'chord', a: 'sus', acc: 1 }, '.', { t: 'chord', a: 'sus' }, '.'] },
  four_comp:   { div: 1, bars: 1, label: 'four-to-the-bar comp',
    grid: [{ t: 'shell', a: 'stab', acc: 1 }, { t: 'shell', a: 'stab' }, { t: 'shell', a: 'stab', acc: 1 }, { t: 'shell', a: 'stab' }] },
  // Charleston: the figure's character lives on the '&-of-2' PUSH (jazz-idiom
  // vetting 2026-06-07) — accent the anticipation, not beat 1 (a beat-1-heavy
  // comp teaches inverted swing time).
  // Charleston comp — now with per-bar VARIANTS (Layer 3, jazz-idiom 2026-06-13): a
  // real comper never plays the same bar twice. The engine seed-rotates these 6
  // one-bar rhythms (no immediate repeat) so jazz/gospel comping breathes + anticipates
  // + lays out instead of looping one stab forever. `grid` = the base (variant 0).
  // All `t:'shell'` (rootless guide-tone stabs — the jazz comp voice).
  charleston:  { div: 2, bars: 1, label: 'Charleston comp',
    grid: [{ t: 'shell', a: 'stab' }, '.', '.', { t: 'shell', a: 'sus', acc: 1 }, '.', '.', '.', '.'],
    vary: [
      [{ t: 'shell', a: 'stab' }, '.', '.', { t: 'shell', a: 'sus', acc: 1 }, '.', '.', '.', '.'],   // 0: Charleston (1 + &-of-2)
      ['.', '.', '.', '.', '.', '.', '.', { t: 'shell', a: 'sus', acc: 1 }],                          // 1: &-of-4 push — anticipate the next chord
      ['.', '.', '.', '.', '.', '.', '.', '.'],                                                        // 2: lay out — the comper drops (the space)
      ['.', { t: 'shell', a: 'stab' }, '.', '.', '.', { t: 'shell', a: 'stab', acc: 1 }, '.', '.'],    // 3: offbeat pair (&-of-1 + &-of-3)
      [{ t: 'shell', a: 'stab' }, '.', '.', { t: 'shell', a: 'sus' }, '.', '.', '.', { t: 'shell', a: 'sus', acc: 1 }], // 4: Charleston + the &-of-4 anticipation
      ['.', '.', { t: 'shell', a: 'stab' }, '.', '.', '.', { t: 'shell', a: 'stab', acc: 1 }, '.'],    // 5: backbeat stabs (2 & 4)
    ] },
  rock_chug:   { div: 2, bars: 1, label: 'eighth chug',
    grid: [{ t: 'chord', a: 'chug', acc: 1 }, { t: 'chord', a: 'chug' }, { t: 'chord', a: 'chug' }, { t: 'chord', a: 'chug' },
           { t: 'chord', a: 'ring', acc: 1 }, '.', { t: 'chord', a: 'chug' }, { t: 'chord', a: 'chug' }] },
  pop_push:    { div: 2, bars: 1, label: 'pushed pop comp',
    grid: [{ t: 'chord', a: 'stab', acc: 1 }, '.', '.', { t: 'chord', a: 'sus' }, '.', '.', { t: 'chord', a: 'stab' }, '.'] },
  // Boogie stabs lean BACKBEAT-side (blues-idiom vetting 2026-06-07): accents
  // on the '&-of-2'/'&-of-4' ride with the snare crack — accenting &-of-1/&-of-3
  // stacked weight on the strong-beat side (oom-pah, not shuffle).
  boogie_stab: { div: 2, bars: 1, label: 'offbeat shuffle stabs',
    grid: ['.', { t: 'shell', a: 'stab' }, '.', { t: 'shell', a: 'stab', acc: 1 }, '.', { t: 'shell', a: 'stab' }, '.', { t: 'shell', a: 'stab', acc: 1 }] },
  // ── Metal rhythm-section comp cells (band-intel, panel 2026-06-13) — the
  // chugging backing the new metal LEAD pathways ride over. Power 5ths (target
  // root5) ONLY: under high gain the perfect 5th is the one interval that stays
  // clean — a comp 3rd turns to mud and clashes the lead's own 3rd (harmony
  // ruling). rock_chug is WRONG for metal (its rings are anti-metal — metal-idiom).
  // The comp plays the double-tracked DI-through-Metal-amp insert; accents mark
  // the quarter pulse.
  metal_chug_8:   { div: 2, bars: 1, label: 'metal eighth chug (power 5ths)',
    grid: [{ t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug' },
           { t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug' }] },
  // Djent sixteenth pedal chug — one low pedal note (lifts an octave over the
  // bass for the guitar+bass octave lock), relentless 16ths, the static-vamp engine.
  metal_pedal_16: { div: 4, bars: 1, label: 'djent sixteenth pedal chug',
    grid: [{ t: 'pedal', a: 'chug', acc: 1 }, { t: 'pedal', a: 'chug' }, { t: 'pedal', a: 'chug' }, { t: 'pedal', a: 'chug' },
           { t: 'pedal', a: 'chug', acc: 1 }, { t: 'pedal', a: 'chug' }, { t: 'pedal', a: 'chug' }, { t: 'pedal', a: 'chug' },
           { t: 'pedal', a: 'chug', acc: 1 }, { t: 'pedal', a: 'chug' }, { t: 'pedal', a: 'chug' }, { t: 'pedal', a: 'chug' },
           { t: 'pedal', a: 'chug', acc: 1 }, { t: 'pedal', a: 'chug' }, { t: 'pedal', a: 'chug' }, { t: 'pedal', a: 'chug' }] },
  // The gallop (eighth + two sixteenths) on power 5ths — [hit, rest, hit, hit]
  // per beat; the accented downbeat rings through the rest as the 'eighth'.
  metal_gallop:   { div: 4, bars: 1, label: 'metal gallop (power 5ths)',
    grid: [{ t: 'root5', a: 'chug', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' },
           { t: 'root5', a: 'chug', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' },
           { t: 'root5', a: 'chug', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' },
           { t: 'root5', a: 'chug', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }] },
  // Metal syncopated chug + power-chord STABS (panel 2026-06-13, metal+guitar-
  // pedagogy): the riff BREATHES — palm-muted ghost chugs (a:'chug' = ghost vel)
  // with the chord BARKING out on the syncopations (a:'stab'+acc = full, short, not
  // a sustained ring — metal stabs are hard and short) + rest HOLES (the air IS the
  // riff). The contrast between the muted motor and the barked stab is what makes it
  // a riff, not a metronomic chug. Power 5ths only (low, under the lead). div:4.
  // Metal riff — the base + per-bar VARIANTS (Layer 3 reuse, metal-idiom 2026-06-13):
  // a real riff PHRASES across bars (a riff isn't one bar looped). The engine rotates
  // these so the metal comp breathes (rests) → drives (gallop) → barks (stabs) bar to
  // bar — the multi-bar "riff" feel without a fragile hand-built 2-bar grid. Power 5ths.
  metal_chug_stab: { div: 4, bars: 1, label: 'metal syncopated chug + stab',
    grid: [{ t: 'root5', a: 'stab', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' },
           { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }, { t: 'root5', a: 'stab', acc: 1 }, '.',
           { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }, '.',
           { t: 'root5', a: 'stab', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }],
    vary: [
      // 0: the base — chug motor + stabs on 1 / &-of-2 / 4
      [{ t: 'root5', a: 'stab', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' },
       { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }, { t: 'root5', a: 'stab', acc: 1 }, '.',
       { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }, '.',
       { t: 'root5', a: 'stab', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }],
      // 1: breathing — rest holes, stabs punctuate the space
      [{ t: 'root5', a: 'stab', acc: 1 }, '.', '.', { t: 'root5', a: 'chug' },
       { t: 'root5', a: 'chug' }, '.', { t: 'root5', a: 'stab', acc: 1 }, '.',
       '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }, '.',
       { t: 'root5', a: 'stab', acc: 1 }, '.', '.', '.'],
      // 2: gallop drive — the relentless e+2-16ths chug under an accented downbeat
      [{ t: 'root5', a: 'chug', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' },
       { t: 'root5', a: 'chug', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' },
       { t: 'root5', a: 'chug', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' },
       { t: 'root5', a: 'stab', acc: 1 }, '.', { t: 'root5', a: 'chug' }, { t: 'root5', a: 'chug' }],
    ] },
  // ── Genre comp cells (B1 batch, panel 2026-06-13) ───────────────────────────
  // Funk 16th chank (funk-idiom): the constant-strum-hand 16th part — muted
  // chucks with chord stabs landing on the syncopations, accent the one. div:4.
  funk_chank_16:  { div: 4, bars: 1, label: '16th funk chank',
    grid: [{ t: 'chord', a: 'stab', acc: 1 }, '.', { t: 'chord', a: 'chuck' }, '.',
           { t: 'chord', a: 'stab' }, '.', '.', { t: 'chord', a: 'stab' },
           '.', { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'stab' }, '.',
           '.', { t: 'chord', a: 'stab' }, { t: 'chord', a: 'chuck' }, '.'] },
  // Country chuck — the "chicka" of boom-chicka (country-idiom + bass-pedagogy:
  // in a full band the BASS owns the "boom" via the two_feel figure on 1 & 3, so
  // the GUITAR plays only the chord chuck. FIX (panel 2026-06-13, country+guitar-
  // pedagogy): the chord must land ON THE BACKBEAT (2 & 4), NOT on every offbeat —
  // a chop on every "&" with empty beats IS the reggae skank (that's why it sounded
  // like reggae). Here: a down-up "CHICK-a" brush ON 2 and ON 4 (the on-beat strike
  // accented, the 16th-tail up-stroke ghosted), beats 1 & 3 EMPTY (bass owns them).
  // Placement on the beat, not between beats, is what makes it country. div:4.
  country_chuck:  { div: 4, bars: 1, label: 'country chicka (backbeat brush)',
    grid: ['.', '.', '.', '.',
           { t: 'chord', a: 'chuck', acc: 1 }, { t: 'chord', a: 'chuck' }, '.', '.',
           '.', '.', '.', '.',
           { t: 'chord', a: 'chuck', acc: 1 }, { t: 'chord', a: 'chuck' }, '.', '.'] },
  // ── World / genre comp cells (band-intel genre batch, panel 2026-06-13) ──────
  // Reggae skank (reggae-idiom): the muted chord chop on EVERY offbeat (the &s) —
  // beats are silent, the space is the genre. The bass owns the riddim. div:2.
  reggae_skank:   { div: 2, bars: 1, label: 'reggae skank (offbeat chop)',
    grid: ['.', { t: 'chord', a: 'chuck', acc: 1 }, '.', { t: 'chord', a: 'chuck' },
           '.', { t: 'chord', a: 'chuck', acc: 1 }, '.', { t: 'chord', a: 'chuck' }] },
  // Disco 16th scratch (disco-idiom): the constant muted 16th "chicken-scratch"
  // wah guitar with a chord stab popping the &-of-2 and &-of-4. The single most
  // identifiable disco comp voice (string stabs = a 2nd lane, roadmapped). div:4.
  disco_scratch_16: { div: 4, bars: 1, label: 'disco 16th scratch',
    grid: [{ t: 'chord', a: 'chuck', acc: 1 }, { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'chuck' },
           { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'stab', acc: 1 }, { t: 'chord', a: 'chuck' },
           { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'chuck' },
           { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'chuck' }, { t: 'chord', a: 'stab', acc: 1 }, { t: 'chord', a: 'chuck' }] },
  // Bossa comp (latin-idiom): the nylon thumb-shell on beats 1 & 3 with the chord
  // stabs riding the offbeats — the João Gilberto syncopation. STRAIGHT 8ths. div:2.
  bossa_comp:     { div: 2, bars: 1, label: 'bossa comp (nylon)',
    grid: [{ t: 'shell', a: 'sus', acc: 1 }, { t: 'chord', a: 'stab' }, '.', { t: 'chord', a: 'stab' },
           { t: 'shell', a: 'sus' }, { t: 'chord', a: 'stab' }, '.', { t: 'chord', a: 'stab' }] },
  // Soul rhythm-guitar stabs (soul-idiom): the clean Motown/Stax chank lands ONLY
  // on the backbeat (2 & 4) plus the &-of-4 push; beats 1 & 3 are empty (the bass
  // and kick own them). The space is the pocket. div:4.
  soul_stab_16:   { div: 4, bars: 1, label: 'soul rhythm-guitar stabs',
    grid: ['.', '.', '.', '.',
           { t: 'chord', a: 'stab', acc: 1 }, '.', '.', '.',
           '.', '.', '.', '.',
           { t: 'chord', a: 'stab', acc: 1 }, '.', { t: 'chord', a: 'stab' }, '.'] },
  // Afrobeat interlock (afrobeat-idiom): the two-guitar interlock folded into one
  // lane — ringing top notes against muted chucks, a hypnotic 16th syncopation
  // over the vamp. The bass ostinato + percussion carry the rest. div:4.
  afrobeat_interlock: { div: 4, bars: 1, label: 'afrobeat interlock',
    grid: [{ t: 'top', a: 'ring', acc: 1 }, { t: 'chord', a: 'chuck' }, '.', { t: 'chord', a: 'chuck' },
           { t: 'top', a: 'ring' }, '.', { t: 'chord', a: 'chuck' }, '.',
           { t: 'chord', a: 'chuck' }, { t: 'top', a: 'ring' }, '.', { t: 'chord', a: 'chuck' },
           '.', { t: 'chord', a: 'chuck' }, { t: 'top', a: 'ring', acc: 1 }, '.'] },
  // ── World / genre comp cells Wave 2 (band-intel, panel 2026-06-13) ───────────
  // Norteño bajo-sexto offbeat chop (the "pah"): the bass owns the "oom" (1 & 3),
  // so the bajo chops the chord on 2 & 4. The accordion lead rides on top. div:1.
  bajo_chop:      { div: 1, bars: 1, label: 'bajo-sexto offbeat chop (the pah)',
    grid: ['.', { t: 'chord', a: 'chuck' }, '.', { t: 'chord', a: 'chuck', acc: 1 }] },
  // Tango marcato (marca en cuatro): every beat struck as a hard staccato chord
  // stab — the relentless bandoneón/piano drive. The off-16ths stay empty. div:4.
  marcato4:       { div: 4, bars: 1, label: 'tango marcato (4)',
    grid: [{ t: 'chord', a: 'stab', acc: 1 }, '.', '.', '.',
           { t: 'chord', a: 'stab', acc: 1 }, '.', '.', '.',
           { t: 'chord', a: 'stab', acc: 1 }, '.', '.', '.',
           { t: 'chord', a: 'stab', acc: 1 }, '.', '.', '.'] },
  // Bluegrass banjo FORWARD ROLL (3-agent design, 2026-06-14): a continuous stream of
  // single picks — the fixed high-G drone (t:'drone') on the 3+3+2 accents {0,3,6}, the
  // chord tones (R/5/3) threaded between, all let-RING so the picks overlap into the
  // banjo's signature wash (the agents' #1 realism lever, free via 'ring'). Straight
  // 8ths (div:2, noSwing). The drone over D rings as a sus4 — KEPT (the banjo sound).
  // vary[] rotates a backward roll so the bed never loops byte-identical. (v1 is
  // banjo-LED — replaces the guitar boom-chuck; banjo ALONGSIDE guitar = a 2nd comp lane.)
  // v2 (bluegrass-idiom + harmony panel, 2026-06-14): 16th forward roll (was div:2 8ths
  // — too slow), a KEY-TONIC drone (was a fixed G4 — out of key off G), degrees seated an
  // octave below the drone (kills the v1 min-2nd-under-the-drone clash on the V chord).
  // Main = the forward roll; vary[] = a reverse roll + a root-anchored lay-out vamp.
  banjo_roll:     { div: 4, bars: 1, noSwing: true, label: 'bluegrass banjo forward roll',
    grid: bjRoll(['drone', '5', '3']),
    vary: [ bjRoll(['drone', '3', '5']), bjRoll(['drone', 'R', '5']) ] },
  // Bluegrass guitar boom-chuck (track-architecture stage 3b — the first per-track extra lane):
  // the flat-top's alternating-bass rhythm RIDING ALONGSIDE the banjo roll, NOT replacing it.
  // The upright (two_feel) owns the low foundation on 1 & 3; the guitar's "boom" is the chord
  // ROOT in its OWN register (pedal → root ≥ E3, above the upright = register separation, so
  // low-end exclusivity holds), the "chuck" a short muted chord brush on the backbeat (2 & 4).
  boom_chuck:     { div: 1, bars: 1, noSwing: true, label: 'bluegrass guitar boom-chuck',
    grid: [{ t: 'pedal', a: 'stab', acc: 1 }, { t: 'chord', a: 'chuck' }, { t: 'pedal', a: 'stab' }, { t: 'chord', a: 'chuck' }] },
  // Western swing SOCK RHYTHM (the celebrated 4-to-the-bar rhythm-guitar art): four EVEN
  // closed-voicing chord chunks per bar — short/percussive, the driving heart of the band.
  // noSwing:true — the chunk itself does NOT swing (no eighths to warp); the band swings
  // AROUND it (ride/lead/solos). acc on 1 & 3 = the dance "down". Voiced via chordDepth:
  // 'seventh' → 6th/dom7 closed shapes (guitar-pedagogy + harmony). The noSwing flag now
  // actually reaches the swing pass (buildCompCellHits propagation fix).
  sock_rhythm:    { div: 1, bars: 1, noSwing: true, label: 'western-swing sock rhythm (4-to-the-bar)',
    grid: [{ t: 'chord', a: 'stab', acc: 1 }, { t: 'chord', a: 'stab' }, { t: 'chord', a: 'stab', acc: 1 }, { t: 'chord', a: 'stab' }] },
  // Tenor-banjo CHOP (a tracks[] lane — NOT the 5-string Scruggs roll/drone; banjo-pedagogy
  // 2026-06-15): the 4-string tenor banjo doubling the sock pulse a register up — t:'top'
  // (the single highest voice, above the sock guitar's mass) + a:'chuck' (short/percussive).
  tenor_banjo_chop: { div: 1, bars: 1, noSwing: true, label: 'tenor-banjo chop (4-to-the-bar)',
    grid: [{ t: 'top', a: 'chuck', acc: 1 }, { t: 'top', a: 'chuck' }, { t: 'top', a: 'chuck', acc: 1 }, { t: 'top', a: 'chuck' }] },
  // City Pop maj9 stabs (the AOR-fusion gloss): lush maj9 chord bloom on beat 1 +
  // top-voice motion, a syncopated push, sustained ring — jazzier/more sustained
  // than funk_chank_16's percussive chuck. The harmony IS the gloss. div:4.
  citypop_maj9_16: { div: 4, bars: 1, label: 'City Pop maj9 stabs',
    grid: [{ t: 'chord', a: 'ring', acc: 1 }, '.', { t: 'top', a: 'stab' }, '.',
           '.', { t: 'chord', a: 'stab' }, '.', { t: 'shell', a: 'stab' },
           { t: 'chord', a: 'sus' }, '.', '.', { t: 'top', a: 'stab' },
           '.', { t: 'chord', a: 'stab', acc: 1 }, '.', '.'] },
  // Synthwave 16th ARPEGGIATOR (rhythm-meter 2026-06-15) — THE engine of the track: a
  // relentless 16th stream over the voicing (root5→shell→top→shell), every step a:'ring'
  // so the synth-pluck picks OVERLAP into the hypnotic churn. The harmony changes SLOWLY
  // underneath. noSwing:true (machine-straight); vary[] rotates the contour (up-down /
  // octave-leap / descending) so 8 bars breathe. div:4 (16ths) — locks to the subdivision.
  synth_arp_16: { div: 4, bars: 1, noSwing: true, label: 'synthwave 16th arpeggiator',
    grid: [{ t:'root5', a:'ring', acc:1 }, { t:'shell', a:'ring' }, { t:'top', a:'ring' }, { t:'shell', a:'ring' },
           { t:'root5', a:'ring' },        { t:'shell', a:'ring' }, { t:'top', a:'ring' }, { t:'shell', a:'ring' },
           { t:'root5', a:'ring' },        { t:'shell', a:'ring' }, { t:'top', a:'ring' }, { t:'shell', a:'ring' },
           { t:'root5', a:'ring' },        { t:'shell', a:'ring' }, { t:'top', a:'ring' }, { t:'shell', a:'ring' }],
    vary: [
      [{ t:'root5', a:'ring', acc:1 }, { t:'shell', a:'ring' }, { t:'top', a:'ring' }, { t:'shell', a:'ring' },
       { t:'root5', a:'ring' },        { t:'shell', a:'ring' }, { t:'top', a:'ring' }, { t:'shell', a:'ring' },
       { t:'root5', a:'ring' },        { t:'shell', a:'ring' }, { t:'top', a:'ring' }, { t:'shell', a:'ring' },
       { t:'root5', a:'ring' },        { t:'shell', a:'ring' }, { t:'top', a:'ring' }, { t:'shell', a:'ring' }],
      [{ t:'root5', a:'ring', acc:1 }, { t:'top', a:'ring' }, { t:'root5', a:'ring' }, { t:'top', a:'ring', acc:1 },
       { t:'root5', a:'ring' },        { t:'top', a:'ring' }, { t:'root5', a:'ring' }, { t:'top', a:'ring', acc:1 },
       { t:'root5', a:'ring' },        { t:'top', a:'ring' }, { t:'root5', a:'ring' }, { t:'top', a:'ring', acc:1 },
       { t:'root5', a:'ring' },        { t:'top', a:'ring' }, { t:'root5', a:'ring' }, { t:'top', a:'ring' }],
      [{ t:'top', a:'ring', acc:1 },   { t:'shell', a:'ring' }, { t:'root5', a:'ring' }, { t:'shell', a:'ring' },
       { t:'top', a:'ring' },          { t:'shell', a:'ring' }, { t:'root5', a:'ring' }, { t:'shell', a:'ring' },
       { t:'top', a:'ring' },          { t:'shell', a:'ring' }, { t:'root5', a:'ring' }, { t:'shell', a:'ring' },
       { t:'top', a:'ring' },          { t:'shell', a:'ring' }, { t:'root5', a:'ring' }, { t:'root5', a:'ring' }],
    ] },
  // Synthwave brass/synth STAB — sparse hits on 2 & 4 (the 80s horn punch). A tracks[]
  // lane voiced via GM brass on its own bus (full tier only). div:2 (8 eighth slots).
  synth_stab: { div: 2, bars: 1, label: 'synthwave brass/synth stab',
    grid: ['.', '.', { t:'chord', a:'stab', acc:1 }, '.', '.', '.', { t:'chord', a:'stab', acc:1 }, '.'] },
  // New Orleans rhumba-boogie keys (Professor Longhair): a tresillo-locked LH root5
  // stab under a sustained RH chord ring — the rolling soul of NOLA R&B. 2-bar cell
  // so the cross-bar tresillo breathes. div:4, cellBars via bars:2.
  rhumba_boogie:  { div: 4, bars: 2, label: 'rhumba-boogie (NOLA keys)',
    grid: [{ t: 'root5', a: 'stab', acc: 1 }, '.', '.', '.', '.', '.', { t: 'root5', a: 'stab' }, '.',
           { t: 'chord', a: 'ring', acc: 1 }, '.', '.', '.', '.', '.', { t: 'root5', a: 'stab' }, '.',
           { t: 'root5', a: 'stab', acc: 1 }, '.', '.', '.', '.', '.', { t: 'root5', a: 'stab' }, '.',
           { t: 'chord', a: 'ring', acc: 1 }, '.', '.', '.', '.', '.', { t: 'top', a: 'stab' }, '.'] },
  // ── World / genre comp cells Wave 3a (band-intel, panel 2026-06-13) — the
  // DRUMLESS solo/technique accompaniments. Each is the genre's whole rhythm bed. ──
  // Classical fingerstyle arpeggio: a let-ring broken chord walking up-and-back the
  // voicing (root5→shell→top→shell) — a continuo/étude bed in good period taste. div:2.
  classical_arp:  { div: 2, bars: 1, label: 'classical arpeggio (broken chord, let-ring)',
    grid: [{ t: 'root5', a: 'ring' }, { t: 'shell', a: 'ring' }, { t: 'top', a: 'ring' }, { t: 'shell', a: 'ring' },
           { t: 'root5', a: 'ring' }, { t: 'shell', a: 'ring' }, { t: 'top', a: 'ring' }, { t: 'shell', a: 'ring' }] },
  // Flamenco rasgueado (tangos/rumba feel): sharp accented stab hits on 1 & 3 with
  // golpe-ish muted chucks filling the 16ths and a ring resolve into beat 4 — the
  // Phrygian color comes from the andalusian/phrygian_vamp progression. div:4.
  rasgueado_tangos: { div: 4, bars: 1, label: 'flamenco rasgueado (tangos)',
    grid: [{ t: 'chord', a: 'stab', acc: 1 }, '.', { t: 'top', a: 'chuck' }, { t: 'chord', a: 'stab' },
           '.', { t: 'top', a: 'chuck' }, { t: 'chord', a: 'ring' }, '.',
           { t: 'chord', a: 'stab', acc: 1 }, '.', { t: 'top', a: 'chuck' }, { t: 'chord', a: 'stab' },
           { t: 'chord', a: 'ring' }, { t: 'top', a: 'chuck' }, { t: 'chord', a: 'stab' }, { t: 'top', a: 'chuck' }] },
  // Folk Travis fingerpick: an alternating-thumb root5 bass on the quarters under
  // fingers plucking the top chord-tone on every offbeat, all let-ring into the
  // open-string drone — the alternating-thumb idiom. div:2.
  travis_pick:    { div: 2, bars: 1, label: 'Travis fingerpick (alternating thumb)',
    grid: [{ t: 'root5', a: 'ring', acc: 1 }, { t: 'top', a: 'ring' }, { t: 'top', a: 'ring' }, { t: 'top', a: 'ring' },
           { t: 'root5', a: 'ring' }, { t: 'top', a: 'ring' }, { t: 'top', a: 'ring' }, { t: 'top', a: 'ring' }] },
  // Gypsy-jazz la pompe (manouche): the percussive "boom-CHK" — a chord ON the beat +
  // a clipped dead up-chuck on the 2nd 16th, weight on 2 & 4 so it gallops. The
  // swing lilt is baked into the grid (the palette stays straight so the recipe drives). div:4.
  la_pompe:       { div: 4, bars: 1, label: 'la pompe (manouche)',
    grid: [{ t: 'chord', a: 'ring' }, { t: 'chord', a: 'chuck' }, '.', '.',
           { t: 'chord', a: 'stab', acc: 1 }, { t: 'chord', a: 'chuck' }, '.', '.',
           { t: 'chord', a: 'ring' }, { t: 'chord', a: 'chuck' }, '.', '.',
           { t: 'chord', a: 'stab', acc: 1 }, { t: 'chord', a: 'chuck' }, '.', '.'] },
  // Ragtime/stride left hand: the leaping "oom-pah" — a low bass note (root5, ~E2)
  // on 1 & 3 + a ringing mid chord stab on 2 & 4 (a stab, NOT boom_chuck's mute, so
  // the harmony blooms). The bass figure register-lifts it into the stride spread. div:1.
  stride_oompah:  { div: 1, bars: 1, label: 'stride oom-pah (L.H.)',
    grid: [{ t: 'root5', a: 'stab', acc: 1 }, { t: 'chord', a: 'stab' },
           { t: 'root5', a: 'stab' }, { t: 'chord', a: 'stab', acc: 1 }] },
  // ── World / genre comp cells Wave 3b (band-intel, panel 2026-06-13) — rock-family.
  // surf + prog need NO new comp (reuse metal_chug_8 / charleston); these 3 are the
  // genuinely-distinct rock-family rhythm parts. ──────────────────────────────────
  // Shoegaze open drone wash: re-articulate the open voicing each half-bar at full
  // sustain so the bed keeps ringing/blooming (vamp_half sags dry without the effects
  // wall). The magic is the reverb/chorus WALL (sound-design); this keeps the drone alive. div:1.
  drone_wash:  { div: 1, bars: 1, label: 'open drone wash',
    grid: [{ t: 'chord', a: 'ring', acc: 1 }, { t: 'chord', a: 'sus' }, { t: 'chord', a: 'ring' }, { t: 'chord', a: 'sus' }] },
  // Midwest-emo twinkle: a 16th let-ring arpeggio — a droning low pedal anchors the
  // beats while the TOP voice climbs/falls in a melodic contour (asymmetric, vs
  // classical_arp's symmetric broken chord). Open-string blur on purpose. div:4.
  emo_twinkle: { div: 4, bars: 1, label: 'emo twinkle arpeggio (ringing, top-voice melody)',
    grid: [{ t: 'pedal', a: 'ring', acc: 1 }, { t: 'shell', a: 'ring' }, { t: 'top', a: 'ring' }, { t: 'shell', a: 'ring' },
           { t: 'top', a: 'ring' }, { t: 'shell', a: 'ring' }, { t: 'top', a: 'ring' }, { t: 'pedal', a: 'ring' },
           { t: 'shell', a: 'ring' }, { t: 'top', a: 'ring' }, { t: 'shell', a: 'ring' }, { t: 'top', a: 'ring' },
           { t: 'pedal', a: 'ring' }, { t: 'shell', a: 'ring' }, { t: 'top', a: 'ring' }, { t: 'shell', a: 'ring' }] },
  // Punk wall-of-downstrokes: relentless ALL-8th power 5ths, EVERY eighth accented
  // (no quarter-pulse weighting like metal_chug_8, no beat-3 ring like rock_chug) —
  // the uniform all-downstroke attack IS the genre. root5 only, tight chug. div:2.
  punk_down8:  { div: 2, bars: 1, label: 'punk downstroke wall (power 5ths)',
    grid: [{ t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug', acc: 1 },
           { t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug', acc: 1 }, { t: 'root5', a: 'chug', acc: 1 }] },
};

// Which cell (if any) drives the comp for this cfg. Authored wins; density 1
// is the vamp; the boogie recipe's comp half is the offbeat stabs (step 4 —
// the full-recipe migration; its bass half is the bass_ostinato figure); the
// jazz pilot rides the swing feel; everything else stays the legacy pad
// until its genre cell is vetted (step 6 recipes).
/** @param {import('./generation-types.js').GenerationConfig} cfg */
export function compCellForConfig(cfg) {
  if (cfg.backingPadDev) return null;                 // the pad-vs-comp A/B dev flag (read shell-side in readConfig — core stays localStorage-free)
  if (cfg.backingDensity === 0) return null;          // density 0 = click only (handled upstream)
  if (cfg.backingComp && COMP_GROOVES[cfg.backingComp]) return cfg.backingComp;
  if (cfg.backingDensity === 1) return 'vamp_half';
  if (cfg.backingStyle === 'boogie') return 'boogie_stab';
  // The genre RECIPE's comp pick beats the generic swing→charleston default (band-intel
  // B1 + western-swing 2026-06-15): a swung style with a recipe comps ITS cell (western_
  // swing → sock_rhythm, not charleston). Charleston stays the FALLBACK for a swung style
  // with no recipe comp (the original jazz pilot). jazz's recipe already picks charleston,
  // so it is unchanged; only western_swing (recipe sock_rhythm) flips.
  const recComp = resolveArrangement(cfg).picks.comp;
  if (recComp && COMP_GROOVES[recComp]) return recComp;
  if (cfg.swing && cfg.swing !== 'straight') return 'charleston';   // the jazz pilot — fallback for a swung, un-recipe'd cfg
  return null;
}

// Banjo 5th-string DRONE by KEY tonic pc (bluegrass-idiom v3, 2026-06-14): the open 5th
// string at the player's REAL capo (0–4 off the shape they're in), NEVER the literal tonic
// — so it stays in the actual 5th-string window (G4–B4, 67–71) and never fakes a high-capo
// C#5/D5/Eb5 sound (the v2 bug). Tonic for the capo-0–4 keys (G/Ab/A/Bb/B); the open-G
// drone (67) for the no-capo open-position keys (C/D + the rare C#/Eb/F#); A/Bb for E/F
// (the D-shape capo-2/3 — the open string ringing as a consonant 5th/sus, not the tonic).
// Drone per tonic pc → a covered BJ_KCS keycenter that's IN-KEY (2026-06-15 fix): the old
// map droned a fixed G(67) even where G is out-of-key (Db→#4, Gb→b2) and put E/A on the
// un-recorded MIDI 69 (→ a +1-semitone pitch-shift on the loudest voice). Now every key's
// drone is an in-key tonic/5th/9th on a recorded sample: Db/Gb→68(Ab), E/A→71(B).
/** @type {Record<number, number>} */
export const BANJO_DRONE_BY_TONIC = { 0: 67, 1: 68, 2: 67, 3: 67, 4: 71, 5: 70, 6: 68, 7: 67, 8: 68, 9: 71, 10: 70, 11: 71 };

// Resolve a cell step's TARGET into midis from the chord's voiced stack.
// `lift` mirrors the voicing lift: low single-note targets move out of the
// bass figure's register when one plays.
/** @param {Pick<import('./generation-types.js').CompStep, 't' | 'd'>} step @param {number[]} midis @param {Pick<import('./generation-types.js').TimelineEvent, 'rootPc' | 'intervals'>} c @param {boolean} lift @param {number | null} [keyPc] */
export function compTargetMidis(step, midis, c, lift, keyPc) {
  if (step.t === 'chord') return midis;
  if (step.t === 'top')   return midis.slice(-1);
  if (step.t === 'pedal') return [pcAtOrAbove(c.rootPc % 12, lift ? 52 : 40)];
  if (step.t === 'root5') {
    // Anchored LOW (E2 region) so power 5ths sit UNDER the lead — harmony
    // ruling for the metal lead-over-backing context: comp top ≤ ~midi 52,
    // lead ≥ 57, a clean window above the smear. root5 is the metal cells'
    // target and was unused by any shipped cell before, so the low anchor is safe.
    const r = pcAtOrAbove(c.rootPc % 12, 40);
    return [r, r + 7];
  }
  // Banjo roll (v3 panel, 2026-06-14): the 5th-string DRONE = BANJO_DRONE_BY_TONIC — the
  // open string at a REAL capo (0–4 off the shape), never the literal tonic, so it never
  // fakes a high-capo C#5/D5 sound (the v2 bug Christian caught). `deg` = a chord tone
  // (R/3/5) seated LOW (R≥48, 3rd/5th≥52) and capped at drone−3 (folded down an octave if
  // it'd ring within a min-2nd under the drone) — the geometric fix for the V-chord clash.
  const droneMidi = BANJO_DRONE_BY_TONIC[(keyPc == null ? 7 : keyPc) % 12];
  if (step.t === 'drone') return [droneMidi];
  if (step.t === 'deg') {
    const ivb = c.intervals.map(i => ((i % 12) + 12) % 12);
    const semi = step.d === 'R' ? 0 : step.d === '3' ? (ivb.includes(3) ? 3 : 4) : 7;
    let m = pcAtOrAbove((c.rootPc + semi) % 12, step.d === 'R' ? 48 : 52);
    while (m > droneMidi - 3) m -= 12;   // every deg ≤ drone−3: kills the min-2nd-under-drone clash
    return [m];
  }
  // shell: guide tones (3rd + 7th) + the 9 colour — the boogie shell rule;
  // falls back to the full voicing when there's no clear 3rd/7th.
  const iv = c.intervals.map(i => ((i % 12) + 12) % 12);
  const third = iv.includes(4) ? 4 : iv.includes(3) ? 3 : null;
  const sev = iv.includes(10) ? 10 : iv.includes(11) ? 11 : null;
  if (third == null || sev == null) return midis;
  const out = []; let cur = 58;
  for (const x of [third, sev, 14]) {
    let m = pcAtOrAbove((c.rootPc + x) % 12, cur);
    if (m > 72) m -= 12;
    out.push(m); cur = m + 2;
  }
  return out.sort((a, b) => a - b);
}

// Two-hand rootless JAZZ keys comp (piano-pedagogy ruleset — specced 2026-06-05,
// BUILT in the genre-band realism slice 2026-06-13). The jazz "piano" was the guitar
// comp grid (one 3-note treble shell stack, MIDI ≥58) on a piano sound — NO left hand.
// A real comper plays rootless A/B voicings: a 4-note shell in the 3rd octave (A-form
// 3-5-7-9 / B-form 7-9-3-5), the bass owning the root, ALTERNATING form by bar so
// successive chords voice-lead (the A↔B circle-of-fifths swap). The lower register is
// the two-hand feel the treble-only shell lacked. Falls back to the existing rootless
// shell when there's no clear 3rd+7th (power/sus chord). Deterministic (barIdx only).
/** @param {number} rootPc @param {number[]} intervals @param {number} barIdx */
export function voiceKeysComp(rootPc, intervals, barIdx) {
  const iv = (intervals || []).map(i => (((i % 12) + 12) % 12));
  /** @param {number} x */
  const has = x => iv.includes(x);
  const third = has(4) ? 4 : has(3) ? 3 : null;
  const sev = has(10) ? 10 : has(11) ? 11 : null;
  if (third == null || sev == null)                       // power/sus → the existing rootless shell
    return compTargetMidis({ t: 'shell' }, [], { rootPc, intervals }, false);
  const fifth = has(6) ? 6 : has(8) ? 8 : 7;              // keep a ♭5/♯5 alteration, else P5
  const ninth = has(1) ? 1 : 2;                           // ♭9 (altered dom) else 9
  // A-form (3-5-7-9) / B-form (7-9-3-5), alternating by bar; stacked ascending from
  // the 3rd octave (~MIDI 50) — the cursor handles the inversion so the form just
  // changes which guide tone is lowest (the voice-leading variety).
  const degs = (barIdx & 1) === 0 ? [third, fifth, sev, ninth] : [sev, ninth, third, fifth];
  /** @type {number[]} */
  const out = []; let cursor = 50;
  for (const d of degs) {
    const apc = (((rootPc + d) % 12) + 12) % 12;
    const m = cursor + ((((apc - cursor) % 12) + 12) % 12);   // lowest pc ≥ cursor
    if (!out.includes(m)) out.push(m);
    cursor = m + 2;
  }
  if (out.length < 2) return compTargetMidis({ t: 'shell' }, [], { rootPc, intervals }, false);
  return out.sort((a, b) => a - b);
}

// Build ONE comp cell's hits over ONE chord window (the grid-stepping inner loop, extracted
// so N comp lanes can share it — track-architecture engine core stage 2). Returns just the
// comp hits (no bass merge, no label — the caller owns those). `varState` ({last}) carries the
// seed-rotated bar-variation pick across chords PER comp lane (independent variation per lane).
/** @param {import('./generation-types.js').GenerationConfig} cfg @param {import('./generation-types.js').TimelineEvent} c @param {import('./generation-types.js').CompCell} cell @param {string} cellId @param {number[]} midis @param {boolean} lift @param {number} bjKeyPc @param {boolean} padComp @param {number} beatSec @param {number} duration @param {{last: number}} varState */
export function buildCompCellHits(cfg, c, cell, cellId, midis, lift, bjKeyPc, padComp, beatSec, duration, varState) {
  const stepSec = beatSec / cell.div;
  let activeGrid = cell.grid;
  if (cell.vary && cell.vary.length > 1) {
    const barIdx = Math.round(c.startSec / measureSeconds(cfg));
    const vseed = (typeof resolveHumanSeed === 'function' ? resolveHumanSeed(cfg) : 0) || 1;
    const hh = Math.abs(Math.sin((barIdx + 1) * 53.17 + vseed * 1.7) * 43758.5453);
    let vi = Math.floor((hh - Math.floor(hh)) * cell.vary.length) % cell.vary.length;
    if (vi === varState.last) vi = (vi + 1) % cell.vary.length;   // no immediate repeat
    varState.last = vi; activeGrid = cell.vary[vi];
  }
  const cellSteps = activeGrid.length;
  const keysMidis = padComp ? voiceKeysComp(c.rootPc, c.intervals, Math.round(c.startSec / measureSeconds(cfg))) : null;
  /** @type {import('./generation-types.js').BackingEvent[]} */
  const hits = [];
  for (let k = 0; ; k++) {
    const t0 = c.startSec + k * stepSec;
    if (t0 >= c.endSec - 1e-4 || t0 >= duration - 1e-4) break;
    const step = activeGrid[k % cellSteps];
    if (step === '.' || !step) continue;
    const frac = COMP_ARTIC[step.a];
    const end = step.a === 'ring' ? c.endSec
      : step.a === 'sus' ? Math.min(c.endSec, (() => {
          for (let j = k + 1; ; j++) {
            const tj = c.startSec + j * stepSec;
            if (tj >= c.endSec - 1e-4) return c.endSec;
            if (activeGrid[j % cellSteps] !== '.') return tj;
          }
        })())
      : Math.min(c.endSec, t0 + Math.max(0.06, stepSec * frac));
    hits.push({ t: +t0.toFixed(6), end: +end.toFixed(6), name: '',
                midis: (keysMidis && (step.t == null || step.t === 'shell' || step.t === 'chord')) ? keysMidis : compTargetMidis(step, midis, c, lift, bjKeyPc),
                vel: compHitVel(step, k, cell.div, cfg.meter.numerator),
                // A cell's noSwing/preSwung flag must reach the emitted event or the
                // global swing warp (swingNotesBacking reads ev.noSwing) ignores it —
                // so an EVEN comp cell (sock_rhythm) under a swing-feel genre would get
                // lopsided. Mirrors the strum_comp precedent (noSwing:!!preSwing).
                a: step.a, comp: cellId, padBus: padComp, noSwing: !!(cell.noSwing || cell.preSwung) });
  }
  return hits;
}
