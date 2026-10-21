// SPDX-License-Identifier: AGPL-3.0-only
import { cfgAudioProfile, resolveArrangement } from './arrangement.js';
import { mulberry32, resolveHumanSeed } from './random.js';
import { AUDIO_PROFILES } from './audio-profiles.js';

// ── Drum grooves (audio-realism Phase D · backing-engine step 5) ─────────────
// A groove is a declarative per-voice lane cell on a subdivision grid. `div` =
// steps per beat (2=8ths, 3=triplets, 4=16ths). A lane is a token string of
// length numerator*div, OR a `{ pat, vel, div }` object — `vel` scales that
// lane's token velocities (the quiet jazz kit; a feathered foot), `div` overrides
// the subdivision for that one lane (a 16th double-kick under an 8th hat).
// Tokens: 'a'=accent, 'n'=normal, 'g'=ghost, 'x'=feathered (the whisper kick),
// 'o'=open-hat (emits hh_open + choke wherever it sits), 'f'=flam (a soft grace
// ~28 ms before the main accent), '.'/'0'=rest. Voice ids mirror the host
// lib/drums.py PIECES vocabulary (hh_closed/hh_open/hh_pedal/ride/ride_bell/
// crash_l/tom_hi…) so a Virtuoso drum event maps 1:1 onto the host kit.
// Pre-swung cells (shuffle/jazz/clave) set `preSwung` so applySwingToBundle
// skips them (no double-swing); straight cells ride the global swing warp.
// `cellBars` (default 1) lets a cell span N bars (bossa/second-line clave).
// `comp[]` is a seed-rotated 1-bar overlay (jazz snare comp — layered on the
// base so a looped ride breathes). `fillFamily`/`fillEveryBars` splice a fill
// into the phrase's last bar. buildDrumEvents tiles, fills, and humanizes
// (seeded) BEFORE makeBundle's count-in shift + swing.
/** @type {Record<string, number>} */
export const DRUM_VELOCITY = { a: 0.95, n: 0.78, g: 0.32, x: 0.12 };

// Per-piece relative gain (sound-design) — tames the hot GM ride/cymbals so a
// continuous jazz ride doesn't swamp the kit; applied in BOTH drum engines at
// schedule time (NOT in the chart, so the event velocities stay structural).
export const DRUM_PIECE_GAIN = {
  kick: 0.85, snare: 1.0, snare_xstick: 0.4,
  hh_closed: 0.5, hh_open: 0.5, hh_pedal: 0.3,
  ride: 0.5, ride_bell: 0.5, bell: 0.6,
  crash_l: 0.6, crash_r: 0.6, splash: 0.55, china: 0.6,
  tom_hi: 0.9, tom_mid: 0.9, tom_low: 0.9, tom_floor: 0.9, clap: 0.85,
};

// Jazz comp overlays (1 bar, div3) — seed-rotated snare/cross-stick jabs layered
// over the ride so an 8-bar loop doesn't sound like a typewriter. Entry 0 = lay out.
/** @type {Record<string, import('./generation-types.js').DrumLane>[]} */
export const JAZZ_COMP = [
  {},
  { snare:        '......g....n' },   // soft jab on beat 3, ghost into 4
  { snare_xstick: '...n.....n..' },   // cross-stick comp on 2 & 4
  { snare:        '..g......g.n' },   // a couple of feathered ghosts
];

/** @type {Record<string, import('./generation-types.js').DrumGroove>} */
export const DRUM_GROOVES = {
  // 8-step (4/4 ·div2) backbeat: kick 1+3, snare 2+4, straight 8th hats.
  straight_8th_rock: { div: 2, preSwung: false, fillFamily: 'rock_tom', lanes: {
    kick:      'n...n...',
    snare:     '..a...a.',
    hh_closed: 'nnnnnnnn',
  } },
  // Disco/dance: four-on-the-floor kick, backbeat snare, open hat on every "&"
  // (choked by the next closed hat — the genre-defining sizzle).
  four_on_floor: { div: 2, preSwung: false, fillFamily: 'rock_tom', fillEveryBars: 16, lanes: {
    kick:      'n.n.n.n.',
    snare:     '..a...a.',
    hh_closed: 'n.n.n.n.',
    hh_open:   '.n.n.n.n',
  } },
  // Half-time: backbeat moves to beat 3 only, lots of space.
  half_time: { div: 2, preSwung: false, fillFamily: 'rock_tom', lanes: {
    kick:      'n....n..',
    snare:     '....a...',
    hh_closed: 'nnnnnnnn',
  } },
  // 12-step (4/4 ·div3) triplet shuffle, authored pre-swung: hats play the
  // "spang" skip (downbeat + last triplet), kick 1+3, snare 2+4.
  shuffle_blues: { div: 3, preSwung: true, fillFamily: 'funk_snare', lanes: {
    kick:      'n.....n.....',
    snare:     '...a.....a..',
    hh_closed: 'n.nn.nn.nn.n',
  } },
  // ── Step-5 grooves ──────────────────────────────────────────────────────
  // Jazz spang-a-lang (the headline fix — a jazz trio no longer plays under a
  // rock drummer). Pre-swung triplet ride: quarters + the swung skip on the
  // let-of-2 / let-of-4; hi-hat FOOT on 2 & 4; kick FEATHERED on all four; NO
  // backbeat snare (the comp[] adds the colour). Quiet kit (per-lane vel).
  jazz_swing: { div: 3, preSwung: true, comp: JAZZ_COMP, fillFamily: 'jazz_tom', fillEveryBars: 12, lanes: {
    ride:     { pat: 'n..n.gn..n.g', vel: 0.6 },
    hh_pedal: { pat: '...n.....n..', vel: 0.7 },
    kick:     'x..x..x..x..',
  } },
  // ── Western swing kit (drum-pedagogy + rhythm-meter 2026-06-15) — "a jazz band you can
  // DANCE to": a swing-band ride LOUDER than the feathered jazz trio + a real 2&4 dance
  // backbeat. Pre-swung triplet grid (div:3) so the global warp never double-swings it.
  // ws_shuffle = the mid-tempo cut (driving ride 0.85); ws_two_beat = the up-tempo two-feel
  // (light floating ride 0.6). Both keep the ride going via the jazz_tom fill family.
  ws_shuffle: { div: 3, preSwung: true, fillFamily: 'jazz_tom', fillEveryBars: 8, lanes: {
    ride:     { pat: 'n..n.nn..n.n', vel: 0.85 },
    snare:    '...a.....a..',
    kick:     'n.....n.....',
    hh_pedal: '...n.....n..',
  } },
  ws_two_beat: { div: 3, preSwung: true, fillFamily: 'jazz_tom', fillEveryBars: 8, lanes: {
    ride:     { pat: 'n..n..n..n..', vel: 0.6 },
    snare:    '...a.....a..',
    kick:     'n.....n.....',
  } },
  // Reggae one-drop: beat 1 is EMPTY (the drop); kick + cross-stick together on
  // beat 3, straight 8th hats. The space IS the genre.
  reggae_one_drop: { div: 2, preSwung: false, lanes: {
    kick:         '....n...',
    snare_xstick: '....a...',
    hh_closed:    'nnnnnnnn',
  } },
  // Funk 16ths: a ghost-note web around the 2 & 4 backbeat, a syncopated kick,
  // 16th closed hats. "Play more, not louder" — the accents are the backbeat.
  funk_16th: { div: 4, preSwung: false, fillFamily: 'funk_snare', lanes: {
    kick:      'n..n..n.n..n....',
    snare:     '....a..g.g..a..g',
    hh_closed: 'nnnnnnnnnnnnnnnn',
  } },
  // Metal double-kick: a constant 16th double-bass (kick on its OWN div:4 lane)
  // under a driving 8th hat + a 2 & 4 backbeat.
  metal_double_kick: { div: 2, preSwung: false, fillFamily: 'rock_tom', fillEveryBars: 16, lanes: {
    kick:      { pat: 'nnnnnnnnnnnnnnnn', div: 4 },
    snare:     '..a...a.',
    hh_closed: 'nnnnnnnn',
  } },
  // Metal DRIVE (the groove-tier default — groove audit 2026-06-13, metal-idiom +
  // drum-pedagogy): straight_8th_rock read as a GENERIC rock beat under a metal
  // band. The iconic galloping kick (eighth + two sixteenths per beat = "DUN-da-da")
  // on its own div:4 lane, a driving 8th hat, the 2 & 4 backbeat, and a CRASH accent
  // on beat 1 for the metal edge. The full tier still escalates to the relentless
  // 16th double-bass (metal_double_kick).
  metal_drive: { div: 2, preSwung: false, fillFamily: 'rock_tom', fillEveryBars: 8, lanes: {
    // Clean per-beat gallop (a.nn ×4 — drum-pedagogy 2026-06-13): the downbeat ACCENT
    // + two ghost 16ths, identical every beat, so the kick lands onset-for-onset with
    // the gallop comp + root_gallop bass (the lock). The accent over the 16ths is what
    // makes it GALLOP instead of a 16th machine-gun.
    kick:      { pat: 'a.nna.nna.nna.nn', div: 4 },
    snare:     '..a...a.',
    hh_closed: 'nnnnnnnn',
    crash_l:   'n.......',
  } },
  // Train beat (country/newgrass): a constant 16th snare buzz of ghosts with the
  // 2 & 4 accents on top, kick on the quarters — the snare carries the time, no hat.
  train_beat: { div: 4, preSwung: false, fillFamily: 'funk_snare', fillEveryBars: 16, lanes: {
    kick:      'n...n...n...n...',
    snare:     'g.g.a.g.g.g.a.g.',
  } },
  // Country cross-stick backbeat (the moderate-tempo DEFAULT — drum-pedagogy 2026-
  // 06-13): the laid-back country/Americana verse groove — kick "boom" on 1 & 3, a
  // quiet CROSS-STICK (rim click, the woody "tick") on the 2 & 4 backbeat, steady 8th
  // hats for forward motion. The train_beat's constant 16th snare buzz was too busy/
  // relentless as a default; this opens it up. (train_beat stays the up-tempo drive.)
  country_backbeat: { div: 4, preSwung: false, fillFamily: 'rock_tom', fillEveryBars: 8, lanes: {
    kick:         'n.......n.......',
    snare_xstick: '....n.......n...',
    hh_closed:    'n.n.n.n.n.n.n.n.',
  } },
  // Gospel pocket: a deeper ghost web than funk + a laid-back gospel kick, hats
  // with a couple of gaps so the pocket breathes.
  gospel_pocket: { div: 4, preSwung: false, fillFamily: 'funk_snare', lanes: {
    kick:      'n..n.n....n.n...',
    snare:     'g.g.a.gng.g.a.g.',
    hh_closed: 'n.nnn.nnn.nnn.nn',
  } },
  // Bossa nova (2-bar cell): the surdo kick (1, &-of-2, 4) under an EVEN straight-8th
  // hat, with the 2-3 son-clave cross-stick across both bars (latin-idiom + drum-
  // pedagogy 2026-06-13). EVEN 8ths → preSwung:false so the global swing warp never
  // touches it; the whole bossa band (comp/bass) is direction-neutral 1-bar so the
  // cross-stick is the sole clave carrier (2-side bar 1, 3-side bar 2).
  bossa: { div: 2, preSwung: false, cellBars: 2, lanes: {
    hh_closed:    'nnnnnnnnnnnnnnnn',
    kick:         'n..n..n.n..n..n.',
    snare_xstick: 'a..a.a...a..a.a.',
  } },
  // New Orleans second line (2-bar cell): the syncopated street-beat — a NOLA
  // bass-drum phrase + a ghost-rolled snare with the "big four" landing late.
  // Real second-line percussion is APPROXIMATED on the kit here (panel call).
  second_line: { div: 2, preSwung: false, cellBars: 2, lanes: {
    kick:      'n..n.n..n..n.n.n',
    snare:     'g.a.g.gng.a.g.aa',
    hh_closed: 'n.n.n.n.n.n.n.n.',
  } },
  // ── World / genre drum grooves (band-intel genre batch, drum-pedagogy-vetted
  // 2026-06-13) ───────────────────────────────────────────────────────────────
  // Soul/Motown straight backbeat: kick 1+3, snare 2+4, the hh_open voice doubling
  // as the TAMBOURINE riding the backbeat (2 & 4), straight 8th hats.
  soul_backbeat: { div: 2, preSwung: false, fillFamily: 'rock_tom', lanes: {
    kick:      'n...n...',
    snare:     '..a...a.',
    hh_closed: 'nnnnnnnn',
    hh_open:   '..n...n.',
  } },
  // 12/8 soul ballad (doo-wop "slow 6/8"): a steady triplet ride wash, kick on the
  // felt main pulse (1 & 3), snare on the backbeat (2 & 4). div:3 IS the triplet grid.
  soul_12_8: { div: 3, preSwung: true, fillFamily: 'jazz_tom', lanes: {
    ride:  'nnnnnnnnnnnn',
    kick:  'n.....n.....',
    snare: '...a.....a..',
  } },
  // Afrobeat (Tony-Allen lineage, 2-bar cell): a tight unbroken 16th hat OSTINATO
  // (the spine) over a broken, ghost-laden, jazz-influenced kick/snare conversation
  // with DISPLACED backbeats — the genre lives in the syncopation, never a square
  // backbeat. Approximated on the kit (panel call, like second_line).
  afrobeat: { div: 4, preSwung: false, cellBars: 2, fillFamily: 'funk_snare', lanes: {
    hh_closed: 'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    kick:      'n....n..n.....n.n..n..n....n.n..',
    snare:     'g.g.a..g.g.a.g..g.g.a..g.g.a.gng',
  } },
};

// Self-contained 1-bar fill cells (carry their own kick). The phrase's last bar
// swaps to this cell, the time-keeping hats mute, and the engine drops a crash_l
// on the next downbeat. Tasteful — a practice loop, not a drum solo.
/** @type {Record<string, import('./generation-types.js').DrumGroove>} */
export const FILLS = {
  rock_tom: { div: 4, lanes: {                         // descending tom fill, beats 3-4
    kick:      'n...............',
    snare:     'a.n.a.n.........',
    tom_hi:    '........a.n.....',
    tom_mid:   '............a...',
    tom_low:   '..............a.',
    tom_floor: '...............a',
  } },
  funk_snare: { div: 4, lanes: {                       // a 16th snare roll turnaround
    kick:      'n.......n.......',
    snare:     'g.gng.gna.gngnaa',
  } },
  jazz_tom: { div: 3, lanes: {                         // light, triplet, ride keeps going
    ride:      'n..n..n..n..',
    snare:     '......g.n.an',
    tom_mid:   '.........n..',
    tom_low:   '...........n',
  } },
};

// Profile → groove (the reconciled style-keyed route; jazz-idiom: do NOT route a
// bare swing:'swing' to a jazz ride — only an explicit jazz audioProfile).
/** @type {Record<string, string>} */
export const GROOVE_FOR_PROFILE = { jazz: 'jazz_swing' };

// Genres that traditionally have NO drum kit opt out by audioProfile TOKEN →
// resolveGroove returns null and the comp/bass carry the time. A token earns a
// place here only once it's DISTINCT (not shared by a drummed palette): `tango`
// (piano marcato + habanera bass carry it) and `bluegrass` (boom-chuck guitar +
// upright two-feel) qualify — `bluegrass` is no longer shared (country now uses
// its own `country` profile). Per-config `drums:'none'`/`groove:'none'` still
// works for one-off drumless overrides. (folk/classical/gypsy-jazz join in Wave 3.)
export const DRUMLESS_PROFILES = new Set(['tango', 'bluegrass', 'classical', 'flamenco', 'folk', 'gypsy_jazz', 'ragtime']);

// Resolve which groove a config plays, or null for a deliberately drumless style.
// Precedence: explicit cfg.groove → shuffle feel → jazz profile → straight backbeat.
/** @param {import('./generation-types.js').GenerationConfig} cfg */
export function resolveGroove(cfg) {
  if (cfg.groove === 'none' || cfg.drums === 'none') return null;
  if (cfg.groove && DRUM_GROOVES[cfg.groove]) return cfg.groove;
  const ap = cfgAudioProfile(cfg);
  if (ap && DRUMLESS_PROFILES.has(ap)) return null;
  if (cfg.swing === 'shuffle') return 'shuffle_blues';
  const byProf = ap && GROOVE_FOR_PROFILE[ap];
  if (byProf && DRUM_GROOVES[byProf]) return byProf;
  const recDrums = resolveArrangement(cfg).picks.drums;   // band-intel B1: the genre's drummer (un-recipe'd → falls to the rock backbeat)
  if (recDrums && DRUM_GROOVES[recDrums]) return recDrums;
  return 'straight_8th_rock';
}

// Emit role:'drums' backing events for [0, duration). Pitch-less: each event is
// a kit-piece `voice` + time + structural `velocity` (+ accent/ghost flags +
// a `noSwing` flag for pre-swung cells). Concatenated into backingEvents in
// makeBundle BEFORE the count-in shift + swing, so drums get count-in silence
// and the global swing warp for free. Open hats are choked to the next hat.
/** @template {import('./generation-types.js').DrumEvent} T @param {T[]} events */
export function chokeOpenHats(events) {
  const hats = events.filter(e => e.voice === 'hh_open' || e.voice === 'hh_closed').sort((a, b) => a.t - b.t);
  for (let i = 0; i < hats.length; i++) {
    if (hats[i].voice !== 'hh_open') continue;
    const next = hats[i + 1];
    if (next) hats[i].dur = Math.max(0.04, +(next.t - hats[i].t - 0.005).toFixed(6));
  }
  return events;
}

// A lane is a string (×1.0 vel, base div) OR { pat, vel, div }.
/** @param {import('./generation-types.js').DrumLane} lane */
export function drumLaneSpec(lane) {
  return (typeof lane === 'string')
    ? { pat: lane, vel: 1, div: 0 }
    : { pat: lane.pat, vel: (lane.vel != null ? lane.vel : 1), div: (lane.div || 0) };
}

// Seeded micro-timing + velocity humanization (a salted stream so it NEVER
// correlates with the bass figure's roll). Baked into `t` BEFORE the swing map.
// The loop's "one" (the content downbeat at t≈0) is protected — no micro-shift,
// so a tiled loop never flams against its own wrap. Kit-gated: electronic 808/909
// get a fraction of the human jitter (machines are tight); acoustic gets it all.
/** @template {import('./generation-types.js').DrumEvent} T @param {T[]} events @param {import('./generation-types.js').GenerationConfig} cfg */
export function humanizeDrums(events, cfg) {
  const rng = mulberry32((resolveHumanSeed(cfg) ^ 0x4452554d) >>> 0);
  const prof = AUDIO_PROFILES[cfgAudioProfile(cfg)];
  const scale = (prof && prof.family === 'electronic') ? 0.2 : 1.0;
  for (const e of events) {
    const onOne = e.t < 1e-3;                          // protect the loop's "one"
    if (!onOne) {
      const micro = (rng() * 2 - 1) * (0.003 + rng() * 0.005) * scale;   // ±3–8 ms
      e.t = +Math.max(0, e.t + micro).toFixed(6);
    }
    const amp = e.accent ? 0.05 : e.ghost ? 0.05 : 0.08;
    let v = e.velocity + (rng() * 2 - 1) * amp * scale;
    if (e.ghost) v = Math.max(0.25, v);                // a ghost stays audible
    e.velocity = +Math.min(1, Math.max(0.02, v)).toFixed(4);
  }
  return events;
}

/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} duration @param {string | null} grooveId */
export function buildDrumEvents(cfg, duration, grooveId) {
  if (!(duration > 0)) return [];
  if (grooveId == null || grooveId === 'none') return [];   // deliberately drumless
  const groove = DRUM_GROOVES[grooveId];
  const numer = Math.max(1, cfg.meter.numerator), denom = cfg.meter.denominator;
  const baseDiv = groove ? Math.max(1, groove.div) : 2;
  const cellBars = groove ? Math.max(1, groove.cellBars || 1) : 1;
  // Authored cells are written for 4/4 (or the groove's `sig`). Any OTHER meter
  // (odd/changing — out of authored-cell v1 scope) → the grouping-based generic
  // keep, so we never wrap a 4/4 cell across an odd bar.
  const sigOk = groove && (groove.sig || '4/4') === (numer + '/' + denom);
  const lanesOk = groove && Object.values(groove.lanes).every(l => {
    const sp = drumLaneSpec(l); return sp.pat.length === numer * (sp.div || baseDiv) * cellBars;
  });
  if (!groove || !sigOk || !lanesOk) return chokeOpenHats(humanizeDrums(buildGenericDrumGroove(cfg, duration), cfg));

  const beatSec = (60 / cfg.bpm) * (4 / denom);
  const barSec = numer * beatSec, cellSec = barSec * cellBars;
  const preSwung = !!groove.preSwung;
  /** @type {import('./generation-types.js').DrumEvent[]} */
  const events = [];
  /** @param {string} voice @param {number} t @param {number} velocity @param {boolean} accent @param {boolean} ghost */
  const mkEv = (voice, t, velocity, accent, ghost) => {
    if (t >= duration - 1e-4) return;
    events.push({ t: +t.toFixed(6), end: +(t + 0.1).toFixed(6), role: 'drums', voice,
      velocity: Math.min(1, velocity), accent: !!accent, ghost: !!ghost, noSwing: preSwung });
  };
  /** @param {string} voice @param {string} tok @param {number} t @param {number} laneVel */
  const pushTok = (voice, tok, t, laneVel) => {
    if (tok === '.' || tok === '0') return;
    if (tok === 'o') { mkEv('hh_open', t, DRUM_VELOCITY.n * laneVel, false, false); return; }
    if (tok === 'f') {                                 // flam: soft grace + main accent
      mkEv(voice, Math.max(0, t - 0.028), DRUM_VELOCITY.g * laneVel, false, true);
      mkEv(voice, t, DRUM_VELOCITY.a * laneVel, true, false); return;
    }
    mkEv(voice, t, (DRUM_VELOCITY[tok] ?? 0.78) * laneVel, tok === 'a', tok === 'g');
  };
  /** @param {number} blockStart @param {Record<string, import('./generation-types.js').DrumLane>} lanes @param {boolean} muteHats */
  const emitLanes = (blockStart, lanes, muteHats) => {
    for (const voice in lanes) {
      if (muteHats && (voice === 'hh_closed' || voice === 'hh_open')) continue;
      const sp = drumLaneSpec(lanes[voice]), stepSec = beatSec / (sp.div || baseDiv);
      for (let s = 0; s < sp.pat.length; s++) pushTok(voice, sp.pat[s], blockStart + s * stepSec, sp.vel);
    }
  };

  const comp = Array.isArray(groove.comp) ? groove.comp : null;
  const compRot = comp && comp.length ? (resolveHumanSeed(cfg) % comp.length) : 0;
  const fill = (cellBars === 1 && groove.fillFamily) ? FILLS[groove.fillFamily] : null;
  const fillEvery = fill ? Math.max(0, groove.fillEveryBars != null ? groove.fillEveryBars : 8) : 0;

  if (cellBars > 1) {
    // Multi-bar clave cells: tile the whole cell; no fills/comp in v1.
    for (let cs = 0; cs < duration - 1e-4; cs += cellSec) emitLanes(cs, groove.lanes, false);
  } else {
    let barIdx = 0;
    for (let bs = 0; bs < duration - 1e-4; bs += barSec) {
      const isFill = fill && fillEvery > 0 && ((barIdx + 1) % fillEvery === 0);
      if (isFill) {
        emitLanes(bs, fill.lanes, true);               // fill replaces the bar; time-keep hats mute
        mkEv('crash_l', bs + barSec, DRUM_VELOCITY.a, true, false);   // crash on the next downbeat
      } else {
        emitLanes(bs, groove.lanes, false);
        if (comp && comp.length) {                     // jazz: layer a seed-rotated snare comp
          const ov = comp[(barIdx + compRot) % comp.length];
          if (ov && Object.keys(ov).length) emitLanes(bs, ov, false);
        }
      }
      barIdx++;
    }
  }
  return chokeOpenHats(humanizeDrums(events, cfg));
}

// Meter-agnostic generic time-keep for any meter the authored cells don't cover.
// Kick on the group-starts (the felt pulse — 7/8 = 2+2+3 kicks at beats 0,2), snare
// on the last group-start (a backbeat-ish accent), closed hat on every beat. Never
// crams a 4/4 cell into an odd bar, and follows cfg.meter.grouping so 7/8 limps as
// 2+2+3 rather than a square 4. Not pre-swung, so a global swing still applies.
/** @param {import('./generation-types.js').GenerationConfig} cfg @param {number} duration */
export function buildGenericDrumGroove(cfg, duration) {
  const numer = Math.max(1, cfg.meter.numerator);
  const beatSec = (60 / cfg.bpm) * (4 / cfg.meter.denominator);
  const grouping = (cfg.meter.grouping && cfg.meter.grouping.length) ? cfg.meter.grouping : [numer];
  const groupStarts = []; { let g = 0; for (const w of grouping) { if (g < numer) groupStarts.push(g); g += w; } }
  let kickBeats, snareBeats;
  if (groupStarts.length >= 2) { kickBeats = new Set(groupStarts.slice(0, -1)); snareBeats = new Set([groupStarts[groupStarts.length - 1]]); }
  else { kickBeats = new Set([0]); snareBeats = new Set([Math.floor(numer / 2)]); }
  const barSec = numer * beatSec;
  /** @type {import('./generation-types.js').DrumEvent[]} */
  const events = [];
  for (let barStart = 0; barStart < duration - 1e-4; barStart += barSec) {
    for (let i = 0; i < numer; i++) {
      const t = barStart + i * beatSec;
      if (t >= duration - 1e-4) break;
      /** @param {string} voice @param {number} vel @param {boolean} accent */
      const mk = (voice, vel, accent) => events.push({ t:+t.toFixed(6), end:+(t + 0.1).toFixed(6), role:'drums', voice, velocity:vel, accent:!!accent, ghost:false, noSwing:false });
      mk('hh_closed', DRUM_VELOCITY.n, false);
      if (kickBeats.has(i)) mk('kick', i === 0 ? DRUM_VELOCITY.a : DRUM_VELOCITY.n, i === 0);
      if (snareBeats.has(i)) mk('snare', DRUM_VELOCITY.a, true);
    }
  }
  return events;
}
