// SPDX-License-Identifier: AGPL-3.0-only

// The audio profile lives at cfg.audio.profile on the readConfig path but at a
// top-level cfg.audioProfile on palette/pathway/session partials — read both.
/** @param {Pick<import('./generation-types.js').GenerationConfig, 'audioProfile' | 'audio'>} cfg */
export function cfgAudioProfile(cfg) { return cfg.audioProfile || (cfg.audio && cfg.audio.profile) || ''; }

// ── ARRANGEMENT_RECIPES — band-intelligence Track B1 (2026-06-13) ────────────
// "The band knows the genre." A recipe is PURE DATA — pointers onto the existing
// tables (COMP_GROOVES / BASS_FIGURES / DRUM_GROOVES) + ensemble role flags +
// register hints — keyed `style:feel:densityTier`. `resolveArrangement` mirrors
// `resolveAudioProfile`; its `picks` are consumed as DEFAULTS by the comp/bass/
// drum resolvers, placed AFTER every existing rule so an authored cfg.backing*
// and the boogie/swing/profile routes ALWAYS win — additive, never a regression
// (an un-recipe'd style returns empty picks → the old logic runs unchanged). The
// density tier (sparse|groove|full) is also the alive-band SECTION mask the
// Jam/section FSM will consume. Phase 1 ships ONLY metal/djent (the just-built,
// vetted styles), matching today's picks; the full genre matrix is the genre-
// idiom authoring batch (each style's recipe is its idiom agent's call — e.g.
// metal's drummer SHOULD upgrade straight_8th_rock → metal_double_kick, ratified
// by metal-idiom + drum-pedagogy, NOT changed silently here mid-dogfood).
export const ARRANGEMENT_TIERS = ['sparse', 'groove', 'full'];

/** @type {Record<string, import('./generation-types.js').ArrangementRecipe>} */
export const ARRANGEMENT_RECIPES = {
  // Metal lead-over-backing: power-5th chug + root-pump bass + a rock backbeat.
  // groove = today's metal-lead picks; full = the heavier djent texture; sparse
  // = a held root. (The metal lead pathways still hand-wire comp/bass, so the
  // recipe is the default an UN-wired metal context inherits for free.)
  // Rhythm-deepening (panel 2026-06-13): the constant straight-8th metal_chug_8 was the
  // "metronome" — escalate gallop (sparse) → the breathing syncopated chug+stab riff
  // (groove default) → djent 16ths (full); root_gallop bass + the a.nna kick LOCK to it.
  'metal:default:sparse': { picks: { comp: 'metal_gallop',    bass: 'root_gallop', drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'off' } },
  'metal:default:groove': { picks: { comp: 'metal_chug_stab', bass: 'root_gallop', drums: 'metal_drive' },       ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'off' } },
  'metal:default:full':   { picks: { comp: 'metal_pedal_16',  bass: 'root_gallop', drums: 'metal_double_kick' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'off' } },
  'djent:default:groove': { picks: { comp: 'metal_pedal_16', bass: 'root_pump',      drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'off' } },
  'djent:default:full':   { picks: { comp: 'metal_pedal_16', bass: 'root_pump',      drums: 'metal_double_kick' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'off' } },
  // ── Genre recipes (band-intel B1 authoring batch, panel 2026-06-13) — each its
  // idiom agent's call. The DEFAULT band a bare style config / Jam inherits
  // (authored cfg.backing* + the boogie/swing routes still win → additive, so
  // this mainly lights up Jam mode + bare configs). blues = the shipped boogie
  // backing; jazz = the swing pilot; rock + gospel genre-vetted (rock-idiom:
  // rock_chug's beat-3 ring IS the rock signature, not the heavier metal chug;
  // gospel-idiom: the charleston push + a walking bass over the gospel_pocket).
  // Only groove is authored where sparse/full == groove (the resolver falls back).
  'blues:default:groove':  { picks: { comp: 'boogie_stab', bass: 'bass_ostinato',  drums: 'shuffle_blues' },     ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'jazz:default:groove':   { picks: { comp: 'charleston',  bass: 'walking',        drums: 'jazz_swing' },        ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'rock:default:sparse':   { picks: { comp: 'vamp_half',   bass: 'two_feel',       drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'rock:default:groove':   { picks: { comp: 'rock_chug',   bass: 'root_pump',      drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'gospel:default:sparse': { picks: { comp: 'vamp_half',   bass: 'sustained_root', drums: 'gospel_pocket' },     ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'gospel:default:groove': { picks: { comp: 'charleston',  bass: 'walking',        drums: 'gospel_pocket' },     ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  // gospel full: the shout/praise-break energy — root_pump + the charleston push
  // until a real gospel_shout double-time drum cell lands (gospel-idiom GAP-1).
  'gospel:default:full':   { picks: { comp: 'charleston',  bass: 'root_pump',      drums: 'gospel_pocket' },     ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  // ── B1 batch 2 (panel 2026-06-13): funk / country / pop — each instrument in
  // its idiomatic role (funk-idiom: NEVER a straight-8th/four-floor kit; pop-
  // idiom: the DEFAULT pop is 8th-strum, NOT four-on-the-floor — that's the
  // dance SUB-style; country split bass-ped's way: bass booms (two_feel), guitar
  // chucks). New cells funk_chank_16 / funk_pocket_16 / country_chuck.
  'funk:default:sparse':    { picks: { comp: 'pop_push',      bass: 'two_feel',       drums: 'half_time' },        ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'funk:default:groove':    { picks: { comp: 'funk_chank_16', bass: 'funk_pocket_16', drums: 'funk_16th' },        ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'funk:default:full':      { picks: { comp: 'funk_chank_16', bass: 'funk_pocket_16', drums: 'gospel_pocket' },    ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  // Rhythm-deepening (panel 2026-06-13): the comp now lands ON the backbeat (was the
  // reggae skank), the bass walks into the change (two_feel_walk), and the default
  // drummer plays the laid-back cross-stick backbeat (train_beat = the up-tempo drive).
  'country:default:sparse': { picks: { comp: 'country_chuck', bass: 'two_feel',      drums: 'country_backbeat' }, ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'country:default:groove': { picks: { comp: 'country_chuck', bass: 'two_feel_walk', drums: 'country_backbeat' }, ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'country:default:full':   { picks: { comp: 'country_chuck', bass: 'two_feel_walk', drums: 'train_beat' },       ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'pop:default:sparse':     { picks: { comp: 'vamp_half',     bass: 'two_feel',       drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'pop:default:groove':     { picks: { comp: 'pop_push',      bass: 'root_pump',      drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  // Dance-pop sub-feel (cfg.arrangementFeel:'dance') — the four-on-the-floor
  // sizzle, deliberately NOT the bare-pop default. (octave_jump_bass deferred —
  // root_pump stands in.)
  'pop:dance:groove':       { picks: { comp: 'pop_push',      bass: 'root_pump',      drums: 'four_on_floor' },     ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  // ── World / genre recipes (band-intel Wave 1, panel 2026-06-13) — each its idiom
  // agent's call, with bass-pedagogy (bass figures) + drum-pedagogy (drum cells) +
  // harmony (tokens) sign-off. groove is the DEFAULT every Jam/bare config inherits;
  // sparse/full fall back to groove via the resolver. Each genre's instruments play
  // their idiomatic ROLE (the mandate: never whole-note chords + four-on-the-floor).
  //   reggae — the offbeat skank over the round one-drop riddim (bass IS the hook).
  //   disco — 16th scratch guitar + octave bass locked to four-on-the-floor.
  //   latin — nylon bossa comp + surdo root–5 bass under the 2-3 son-clave kit.
  //   soul — the backbeat chank + a melodic Motown counter-line over the tambourine
  //          backbeat; the `ballad` feel swaps in the 12/8 triplet drummer.
  //   afrobeat — the two-guitar interlock + the hypnotic ostinato over Tony Allen.
  'reggae:default:groove':   { picks: { comp: 'reggae_skank',       bass: 'reggae_riddim',    drums: 'reggae_one_drop' }, ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'disco:default:groove':    { picks: { comp: 'disco_scratch_16',   bass: 'octave_jump_bass', drums: 'four_on_floor' },   ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'latin:default:groove':    { picks: { comp: 'bossa_comp',         bass: 'bossa_bass',       drums: 'bossa' },           ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'soul:default:groove':     { picks: { comp: 'soul_stab_16',       bass: 'motown_counter',   drums: 'soul_backbeat' },   ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'soul:ballad:groove':      { picks: { comp: 'vamp_half',          bass: 'sustained_root',   drums: 'soul_12_8' },       ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'afrobeat:default:groove': { picks: { comp: 'afrobeat_interlock', bass: 'afro_ostinato',    drums: 'afrobeat' },        ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  // ── World / genre recipes Wave 2 (band-intel, panel 2026-06-13) — each its idiom
  // agent's call + bass-pedagogy sign-off on the 4 new bass figures. tango +
  // bluegrass are DRUMLESS (their profiles are in DRUMLESS_PROFILES → resolveGroove
  // returns null; ensemble.drums:'off' documents it). The others reuse existing kits.
  //   norteño — bajo-sexto offbeat chop ("pah") + tuba oom-pah ("oom" on 1 & 3) over
  //     a polka kick-on-1&3 (straight_8th_rock shares the lock); full walks the bass.
  //   tango — the every-beat marcato over the 3-3-2 habanera bass; piano + bass only.
  //   bluegrass — boom-chuck guitar (owns boom+chuck) over the upright two-feel;
  //     full tier walks the bass between changes.
  //   city-pop — lush maj9 stabs + the busy 16th fusion bass over a tight backbeat.
  //   new-orleans — Professor-Longhair rhumba-boogie keys + the tresillo "big four"
  //     bass over the second-line street beat.
  'norteno:default:groove':     { picks: { comp: 'bajo_chop',       bass: 'oompah_polka',   drums: 'straight_8th_rock' }, ensemble: { drums: 'on',  bass: 'on', comp: 'on' } },
  'norteno:default:full':       { picks: { comp: 'bajo_chop',       bass: 'oompah_walk',    drums: 'straight_8th_rock' }, ensemble: { drums: 'on',  bass: 'on', comp: 'on' } },
  'tango:default:groove':       { picks: { comp: 'marcato4',        bass: 'habanera_332' },                              ensemble: { drums: 'off', bass: 'on', comp: 'on' } },
  'bluegrass:default:groove':   { picks: { comp: 'banjo_roll',      bass: 'two_feel' },                                  ensemble: { drums: 'off', bass: 'on', comp: 'on' }, tracks: [{ id: 'guitar', cell: 'boom_chuck', bus: 'comp2', voice: 'guitar', label: 'Guitar' }] },
  'bluegrass:default:full':     { picks: { comp: 'banjo_roll',      bass: 'walking' },                                   ensemble: { drums: 'off', bass: 'on', comp: 'on' }, tracks: [{ id: 'guitar', cell: 'boom_chuck', bus: 'comp2', voice: 'guitar', label: 'Guitar' }] },
  'city-pop:default:groove':    { picks: { comp: 'citypop_maj9_16', bass: 'funk_pocket_16', drums: 'straight_8th_rock' }, ensemble: { drums: 'on',  bass: 'on', comp: 'on' } },
  'new_orleans:default:groove': { picks: { comp: 'rhumba_boogie',   bass: 'tresillo_nola',  drums: 'second_line' },      ensemble: { drums: 'on',  bass: 'on', comp: 'on' } },
  // ── World / genre recipes Wave 3a (band-intel, panel 2026-06-13) — the DRUMLESS
  // solo/technique idioms (all profiles in DRUMLESS_PROFILES → resolveGroove null;
  // ensemble.drums:'off' documents it). The fingerstyle/stride comp is the whole
  // rhythm bed; a light bass (sustained_root / two_feel) anchors the harmony.
  //   classical — a let-ring broken-chord arpeggio over a sustained root.
  //   flamenco — the rasgueado tangos strum (Phrygian) over a sustained tonic.
  //   folk — Travis alternating-thumb fingerpicking over the upright two-feel.
  //   gypsy-jazz — la pompe over the manouche two-feel.
  //   ragtime — the stride oom-pah left hand over two_feel; the `boogie` feel rolls
  //     the eight-to-the-bar boogie-woogie (boogie_stab + bass_ostinato).
  'classical:default:groove':   { picks: { comp: 'classical_arp',    bass: 'sustained_root' }, ensemble: { drums: 'off', bass: 'on', comp: 'on' } },
  'flamenco:default:groove':    { picks: { comp: 'rasgueado_tangos', bass: 'sustained_root' }, ensemble: { drums: 'off', bass: 'on', comp: 'on' } },
  'folk:default:groove':        { picks: { comp: 'travis_pick',      bass: 'two_feel' },       ensemble: { drums: 'off', bass: 'on', comp: 'on' } },
  'gypsy_jazz:default:groove':  { picks: { comp: 'la_pompe',         bass: 'two_feel' },       ensemble: { drums: 'off', bass: 'on', comp: 'on' } },
  'ragtime:default:groove':     { picks: { comp: 'stride_oompah',    bass: 'two_feel' },       ensemble: { drums: 'off', bass: 'on', comp: 'on' } },
  'ragtime:boogie:groove':      { picks: { comp: 'boogie_stab',      bass: 'bass_ostinato' },  ensemble: { drums: 'off', bass: 'on', comp: 'on' } },
  // ── World / genre recipes Wave 3b (band-intel, panel 2026-06-13) — the rock-family
  // bands + meter-driven prog. REUSE-FIRST: the signature is each genre's LEAD
  // technique + TONE (sound-design), not the band, so surf/prog reuse rock cells
  // outright; shoegaze/emo/punk add one distinct comp each. The ODD METER that
  // defines prog is a rhythm-meter/pathway concern — these cells stay 4/4.
  //   surf — exotic-key all-8th muted power chords (metal_chug_8) + driving 8th bass.
  //   shoegaze — the open drone wash (re-rung) + a prominent melodic bass; sparse =
  //     half-time + vamp_half (the dream-pop float).
  //   emo — the twinkle arpeggio + a melodic counter-line bass.
  //   punk — the all-downstroke wall + the driving pick bass, fast.
  //   prog — a syncopated jazzy comp + a fusion counter-line bass; `fusion` feel = a
  //     busy 16th pocket.
  'surf:default:groove':     { picks: { comp: 'metal_chug_8', bass: 'root_pump',      drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'off' } },
  'shoegaze:default:sparse': { picks: { comp: 'vamp_half',    bass: 'sustained_root', drums: 'half_time' },         ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'off' } },
  'shoegaze:default:groove': { picks: { comp: 'drone_wash',   bass: 'root_pump',      drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'off' } },
  'emo:default:groove':      { picks: { comp: 'emo_twinkle',  bass: 'motown_counter', drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'punk:default:groove':     { picks: { comp: 'punk_down8',   bass: 'root_pump',      drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'off' } },
  'prog:default:groove':     { picks: { comp: 'charleston',   bass: 'motown_counter', drums: 'straight_8th_rock' }, ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  'prog:fusion:groove':      { picks: { comp: 'charleston',   bass: 'funk_pocket_16', drums: 'funk_16th' },         ensemble: { drums: 'on', bass: 'on', comp: 'on' } },
  // ── Western swing (panel 2026-06-15) — a jazz dance band over country forms. The SOCK-
  // RHYTHM guitar (even 4-to-the-bar closed chords) is the engine; the tenor-banjo CHOP is
  // an extra rhythm-section lane (tracks[]); the jazz PIANO comps via the profile pad.role:
  // 'comp'; the upright walks/two-beats; the kit SWINGS. NOT drumless. sparse = sock +
  // two-beat; groove = + walking bass + the shuffle ride + tenor banjo; full = up-tempo.
  'western_swing:default:sparse': { picks: { comp: 'sock_rhythm', bass: 'two_feel',      drums: 'ws_two_beat' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'on' } },
  'western_swing:default:groove': { picks: { comp: 'sock_rhythm', bass: 'walking',       drums: 'ws_shuffle' },  ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'on' },
    tracks: [{ id: 'banjo', cell: 'tenor_banjo_chop', bus: 'comp2', voice: 'guitar', label: 'Tenor banjo' }] },
  'western_swing:default:full':   { picks: { comp: 'sock_rhythm', bass: 'two_feel_walk', drums: 'ws_two_beat' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'on' },
    tracks: [{ id: 'banjo', cell: 'tenor_banjo_chop', bus: 'comp2', voice: 'guitar', label: 'Tenor banjo' }] },
  // ── Synthwave / outrun (panel 2026-06-15) — the night-drive machine. The 16th ARP is the
  // PRIMARY comp; the lush saw PAD rides the Keys bus via the profile pad.role:'sustain';
  // the analog synthbass pulses octaves locked to four_on_floor. NO lead track — the soaring
  // neon lead is the PLAYER's seat. sparse = root pump intro float; groove = the full arp
  // engine; full = + a brass STAB lane (GM brass on comp2 — lanes voice via TONE_GM).
  'synthwave:default:sparse': { picks: { comp: 'synth_arp_16', bass: 'root_pump',        drums: 'four_on_floor' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'on' } },
  'synthwave:default:groove': { picks: { comp: 'synth_arp_16', bass: 'octave_jump_bass', drums: 'four_on_floor' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'on' } },
  'synthwave:default:full':   { picks: { comp: 'synth_arp_16', bass: 'octave_jump_bass', drums: 'four_on_floor' }, ensemble: { drums: 'on', bass: 'on', comp: 'on', pad: 'on' },
    tracks: [{ id: 'stab', cell: 'synth_stab', bus: 'comp2', voice: 'brass', label: 'Brass stab' }] },
};

export const ARRANGEMENT_BASE = { picks: {}, ensemble: { drums: 'auto', bass: 'auto', comp: 'auto', pad: 'auto', lead: 'auto' }, registers: {}, tier: 'groove' };

// Which density tier a cfg sits in: authored cfg.densityTier wins; else derive
// from backingDensity (0/1 = sparse, 3 = full, else groove).
/** @param {Pick<import('./generation-types.js').GenerationConfig, 'densityTier' | 'backingDensity'>} cfg */
export function arrangementTier(cfg) {
  if (cfg.densityTier && ARRANGEMENT_TIERS.includes(cfg.densityTier)) return cfg.densityTier;
  if (cfg.backingDensity === 0 || cfg.backingDensity === 1) return 'sparse';
  if (cfg.backingDensity === 3) return 'full';
  return 'groove';
}

// Resolve the arrangement recipe for a cfg (mirrors resolveAudioProfile). Walks
// style:feel:tier → style:default:tier → style:default:groove. An un-recipe'd
// style returns ARRANGEMENT_BASE (empty picks → the resolvers fall through to
// their existing logic; this never regresses a shipped style).
/** @param {Pick<import('./generation-types.js').GenerationConfig, 'densityTier' | 'backingDensity' | 'audioProfile' | 'audio' | 'arrangementFeel'>} cfg */
export function resolveArrangement(cfg) {
  const style = cfgAudioProfile(cfg || {}) || '';
  const feel = (cfg && cfg.arrangementFeel) || 'default';
  const tier = arrangementTier(cfg || {});
  /** @type {import('./generation-types.js').Arrangement} */
  const out = { picks: {}, ensemble: Object.assign({}, ARRANGEMENT_BASE.ensemble), registers: {}, tier };
  if (!style) return out;
  let rec = null;
  for (const k of [`${style}:${feel}:${tier}`, `${style}:default:${tier}`, `${style}:default:groove`, `${style}:${feel}:groove`]) {
    if (ARRANGEMENT_RECIPES[k]) { rec = ARRANGEMENT_RECIPES[k]; break; }
  }
  if (rec) {
    Object.assign(out.picks, rec.picks);
    Object.assign(out.ensemble, rec.ensemble);
    Object.assign(out.registers, rec.registers);
    if (rec.tracks) out.tracks = rec.tracks;   // track-arch stage 3b: a genre's OPT-IN extra comp lanes
  }
  return out;
}
