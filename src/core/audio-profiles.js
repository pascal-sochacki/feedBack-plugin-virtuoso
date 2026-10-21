// SPDX-License-Identifier: AGPL-3.0-only

// ── Audio profiles — automated per-genre backing tone ─────────────────────
// The player never picks a cab/voice/instrument: a genre/pathway declares one
// string `audioProfile` and this resolves it to the backing voice + brightness.
// Today the realizable harmony voices are the oscillator tones (pad/epiano/
// organ); when the WebAudioFont (acoustic) + amp (distorted) tracks land, a
// profile's voice/engine maps to those without touching genre data.
// Each family declares three voices: harmony (the backing comp), notes (the
// practice voice — what the player is meant to play), and bass (the backing
// bass line, e.g. a boogie walk). notes/bass are sampled by default (real
// instrument, oscillator fallback until the async preset loads). The notes
// tone is overridden to a bass program when the instrument itself is a bass.
// Phase B (WAF for all backing): the comp is a SAMPLED instrument by default, with
// the synth pad (scheduleHarmonyPad) as the per-voice failover until the preset
// loads. A family may also declare a dedicated `pad` slot for the Keys/sustain
// layer when it should differ from the comp voice (distorted does — see below).
// notes.sg — the GUIDE voice defaults to the sampled Shinyguitar electric DI
// (Christian's by-ear gate PASSED 2026-06-12: now the default, not a pin-only
// A/B). The WAF tone stays declared as the warm-up cover + bend voice; the
// acoustic family keeps its steel-string (an electric DI under a bluegrass
// exercise would be wrong); resolveAudioProfile clears sg for bass instruments.
// harmony.sg + harmony.amp (band-intel Track C3 unlock, 2026-06-13): the
// DISTORTED family's comp is no longer the synth-pad placeholder — it's the
// sampled DI guitar through the METAL amp insert (power chords through high
// gain = the sound the genre actually has; the amp chain shipped 2026-06-12
// with a procedural cab IR, so the old "until NAM lands" gate is open). The
// WAF clean preset covers while the samples warm; the Keys SUSTAIN layer
// keeps the synth pad via the dedicated `pad` slot (a sustained DI through a
// high-gain amp would be mush, and the pad's job is glue).
/** @type {Record<string, import('./generation-types.js').AudioProfile>} */
export const AUDIO_FAMILY_DEFAULTS = {
  clean:      { harmony: { engine: 'sample', tone: 'epiano', level: 0.9 },  notes: { tone: 'clean', sg: true }, bass: { tone: 'bass'    }, brightness: 0.5 },
  acoustic:   { harmony: { engine: 'sample', tone: 'piano',  level: 0.8 },  notes: { tone: 'guitar', sg: false }, bass: { tone: 'upright' }, brightness: 0.6 },
  distorted:  { harmony: { engine: 'sample', tone: 'clean', sg: true, amp: 'metal', level: 0.6 }, pad: { tone: 'pad', level: 0.7 }, notes: { tone: 'clean', sg: true }, bass: { tone: 'bass' }, brightness: 0.42 },
  electronic: { harmony: { engine: 'sample', tone: 'epiano', level: 0.85 }, notes: { tone: 'clean', sg: true }, bass: { tone: 'bass'    }, brightness: 0.7 },
};

export const GLOBAL_AUDIO_DEFAULT = {
  family: 'clean',
  harmony: { engine: 'sample', tone: 'epiano', level: 0.9 },
  notes:   { engine: 'sample', tone: 'clean', level: 1.0, sg: true },
  bass:    { engine: 'sample', tone: 'bass',  level: 0.95 },
  brightness: 0.5,
};

/** @type {Record<string, import('./generation-types.js').AudioProfile>} */
export const AUDIO_PROFILES = {
  blues:      { family: 'clean',      harmony: { engine: 'sample', tone: 'organ',  level: 0.85 }, brightness: 0.5 },
  // jazz combo (panel 2026-06-13): walking UPRIGHT bass (was the generic electric)
  // + the comp routed to the Keys bus as a PIANO (pad.role:'comp' — un-orphans Keys
  // and makes the comper a piano, not the Rhodes). drums kit_jazz already correct.
  jazz:       { family: 'clean',      harmony: { engine: 'sample', tone: 'epiano', level: 0.85 }, bass: { tone: 'upright', level: 0.9 }, pad: { engine: 'sample', tone: 'piano', bank: 'salamander', role: 'comp', level: 0.85 }, brightness: 0.55, drums: { kit: 'kit_jazz' } },
  rock:       { family: 'clean',      harmony: { engine: 'sample', tone: 'organ',  level: 0.8 },  brightness: 0.55 },
  metal:      { family: 'distorted',  harmony: { engine: 'sample', tone: 'clean', sg: true, amp: 'metal', level: 0.6 }, bass: { tone: 'bass', amp: 'bass_drive', level: 0.85 }, brightness: 0.42 },
  djent:      { family: 'distorted',  harmony: { engine: 'sample', tone: 'clean', sg: true, amp: 'metal', level: 0.55 }, brightness: 0.38 },
  gospel:     { family: 'clean',      harmony: { engine: 'sample', tone: 'organ',  level: 0.9 },  brightness: 0.55 },
  bluegrass:  { family: 'acoustic',   harmony: { engine: 'sample', tone: 'guitar', bank: 'banjo', level: 0.78 }, brightness: 0.62, drums: { kit: 'kit_acoustic_soft' } },
  // city-pop's defining keyboard IS the Yamaha CP-80 electric grand → bank:'cp80'
  // (a real fully-sampled e-grand, was the GM Rhodes; the Wurli stayed soul-only only
  // because it's sparse/single-layer — that bar doesn't apply to the 3-layer CP-80).
  // city-pop: the CP-80 sample is the comp; a subtle FM-EP ('fmep') glass layer on the
  // Keys bus adds the iconic DX7 shimmer the CP-80 doesn't cover (synth palette, 2026-06-15).
  'city-pop': { family: 'electronic', harmony: { engine: 'sample', tone: 'epiano', bank: 'cp80', level: 0.8 }, pad: { engine: 'synth', tone: 'fmep', role: 'sustain', level: 0.4 }, brightness: 0.68 },
  // Genre profiles for the B1 batch (so the recipe can key off them + the comp
  // plays an idiomatic VOICE): funk = clavinet, pop = e-piano, country = clean
  // electric (tele). These were null/shared before → a bare funk/pop/country
  // Jam now sounds like its instrument, not a generic pad.
  funk:       { family: 'clean',      harmony: { engine: 'sample', tone: 'clav',   level: 0.8 },  brightness: 0.6 },
  // pop: + a soft PWM string-machine ('pwmpad') bed on the Keys bus — the new-wave/synth-
  // pop pad under the CP-80 comp (synth palette, 2026-06-15; subtle, dogfood-tunable).
  pop:        { family: 'clean',      harmony: { engine: 'sample', tone: 'epiano', bank: 'cp80', level: 0.8 }, pad: { engine: 'synth', tone: 'pwmpad', role: 'sustain', level: 0.32 }, brightness: 0.62 },
  // country band (panel 2026-06-13): the bed is a steel-string ACOUSTIC (the clean
  // electric is the Tele LEAD, a later track), a round UPRIGHT-ish bass, a soft
  // ACOUSTIC kit (was sharing kit_rock with metal), + a SYNTH pedal-steel voice on
  // the Keys track (role:'sustain'; tone:'steel' — volume-pedal swell + Q~4 "cry" +
  // OBLIQUE pitch glide: common tones hold while only the changed voices slide in). The
  // acoustic family also flips the warm defaults. Arrangement (country_chuck/two_feel/
  // train_beat) is already correct — this is the timbre fix.
  country:    { family: 'acoustic',   harmony: { engine: 'sample', tone: 'guitar', bank: 'emily', level: 0.76 }, bass: { tone: 'upright', level: 0.9 }, pad: { engine: 'synth', tone: 'steel', role: 'sustain', level: 0.5 }, drums: { kit: 'kit_acoustic_soft' }, brightness: 0.55 },
  // World/genre batch (band-intel, 2026-06-13): reggae = bright clean skank;
  // disco = clean 16th scratch guitar; latin = nylon (bossa); soul = warm Rhodes;
  // afrobeat = clean percussive interlock. One comp VOICE each (the engine plays a
  // single comp lane) — the most identifiable instrument of the genre's groove.
  reggae:     { family: 'clean',      harmony: { engine: 'sample', tone: 'clean',  level: 0.78 }, brightness: 0.58 },
  disco:      { family: 'clean',      harmony: { engine: 'sample', tone: 'clean',  level: 0.78 }, brightness: 0.66 },
  latin:      { family: 'acoustic',   harmony: { engine: 'sample', tone: 'nylon',  level: 0.78 }, brightness: 0.6 },
  soul:       { family: 'clean',      harmony: { engine: 'sample', tone: 'epiano', bank: 'wurli', level: 0.82 }, brightness: 0.56 },
  afrobeat:   { family: 'clean',      harmony: { engine: 'sample', tone: 'clean',  level: 0.78 }, brightness: 0.62 },
  // World/genre Wave 2 (band-intel, 2026-06-13): tango = bandoneón-on-keys via a
  // marcato piano (drumless); norteño = the bajo-sexto clean guitar (accordion is
  // the player's lead); new-orleans = the tack/upright R&B piano. (bluegrass +
  // city-pop reuse their existing profiles.)
  tango:       { family: 'acoustic',   harmony: { engine: 'sample', tone: 'piano', bank: 'salamander', level: 0.8 },  brightness: 0.5 },
  norteno:     { family: 'clean',      harmony: { engine: 'sample', tone: 'clean',  level: 0.78 }, brightness: 0.6 },
  new_orleans: { family: 'clean',      harmony: { engine: 'sample', tone: 'piano', bank: 'salamander', level: 0.82 }, brightness: 0.5 },
  // World/genre Wave 3a (band-intel, 2026-06-13) — the DRUMLESS solo/technique
  // idioms. classical/flamenco = nylon; folk/gypsy-jazz = steel-string acoustic.
  classical:   { family: 'acoustic',   harmony: { engine: 'sample', tone: 'nylon',  level: 0.78 }, brightness: 0.5 },
  flamenco:    { family: 'acoustic',   harmony: { engine: 'sample', tone: 'nylon',  level: 0.8 },  brightness: 0.58 },
  // folk / Americana: + the synth pedal-steel BED on the Keys bus (pedal-steel-pedagogy
  // 2026-06-15 — the crying sustain pad behind acoustic Americana; same voice as country).
  folk:        { family: 'acoustic',   harmony: { engine: 'sample', tone: 'guitar', bank: 'emily', level: 0.78 }, pad: { engine: 'synth', tone: 'steel', role: 'sustain', level: 0.42 }, brightness: 0.6 },
  gypsy_jazz:  { family: 'acoustic',   harmony: { engine: 'sample', tone: 'guitar', bank: 'emily', level: 0.78 }, brightness: 0.62 },
  ragtime:     { family: 'acoustic',   harmony: { engine: 'sample', tone: 'piano', bank: 'salamander', level: 0.8 },  brightness: 0.55 },
  // World/genre Wave 3b (band-intel, 2026-06-13) — rock-family bands + prog. Mostly
  // clean electric, differentiated by brightness; punk is bright distorted (DI→metal
  // amp, less scooped than metal). The signature reverb/effects/lead tone is a
  // sound-design lane we only approximate here (the band STRUCTURE is honest).
  surf:        { family: 'clean',      harmony: { engine: 'sample', tone: 'clean',  level: 0.78 }, brightness: 0.66 },
  shoegaze:    { family: 'clean',      harmony: { engine: 'sample', tone: 'clean',  level: 0.8 },  brightness: 0.7 },
  emo:         { family: 'clean',      harmony: { engine: 'sample', tone: 'clean',  level: 0.78 }, brightness: 0.66 },
  punk:        { family: 'distorted',  harmony: { engine: 'sample', tone: 'clean', sg: true, amp: 'metal', level: 0.62 }, bass: { tone: 'bass', amp: 'bass_drive', level: 0.82 }, brightness: 0.55 },
  prog:        { family: 'clean',      harmony: { engine: 'sample', tone: 'clean',  level: 0.78 }, brightness: 0.62 },
  // ── Western swing (panel 2026-06-15) — a jazz dance band in a cowboy hat: the four-to-
  // the-bar SOCK-RHYTHM acoustic guitar (closed 6th chords — the engine), a walking/two-
  // beat UPRIGHT, a SWING kit (it HAS drums, unlike bluegrass), + a jazz PIANO comping on
  // the Keys bus (pad.role:'comp', like jazz). The electric "takeoff" lead + twin fiddles
  // are the PLAYER's seat. NOT in DRUMLESS_PROFILES.
  western_swing: { family: 'acoustic', harmony: { engine: 'sample', tone: 'guitar', bank: 'emily', level: 0.74 }, bass: { tone: 'upright', level: 0.9 }, pad: { engine: 'sample', tone: 'piano', bank: 'salamander', role: 'comp', level: 0.7 }, drums: { kit: 'kit_jazz' }, brightness: 0.58 },
  // ── Synthwave / outrun (panel 2026-06-15) — an all-synth electronic band from the new
  // classic-synth palette: the 16th ARP plays as a 'pluck' on the harmony bus, the lush
  // detuned-saw 'sawpad' is the Keys sustain wash, the analog 'synthbass' (saw+sub, env-to-
  // cutoff, mono glide) pulses over a 909 four-on-the-floor. The soaring neon LEAD is the
  // PLAYER's seat → no band lead voice.
  synthwave: { family: 'electronic', harmony: { engine: 'synth', tone: 'pluck', level: 0.78 }, pad: { engine: 'synth', tone: 'sawpad', role: 'sustain', level: 0.62 }, bass: { engine: 'synth', tone: 'synthbass', level: 0.9 }, drums: { kit: 'kit_909' }, brightness: 0.72 },
};

/** @type {Record<string, string>} */
export const DRUM_KIT_FAMILY_DEFAULT = { electronic: 'kit_909', acoustic: 'kit_acoustic_soft', clean: 'kit_rock', distorted: 'kit_rock' };

// Best-effort family inference for pathways that don't (yet) declare a profile,
// so an untagged pathway gets a sensible family default — never silence or a
// wrong-family voice.
/** @param {{pathway?: string, chordOverride?: string}} cfg */
export function inferAudioFamily(cfg) {
  const p = (cfg && cfg.pathway) || '';
  if (cfg && cfg.chordOverride === '5') return 'distorted';
  if (/chug|gallop|djent|metal|death/.test(p)) return 'distorted';
  return 'clean';
}

// Resolve the effective backing profile: GLOBAL ← family ← genre profile ←
// brightness slider ← manual voice override. Never throws; always returns a
// complete profile so the backing voice + brightness are always defined.
/** @param {Partial<Pick<import('./generation-types.js').GenerationConfig, 'audio' | 'pathway' | 'chordOverride' | 'instrument'>>} cfg @returns {import('./generation-types.js').ResolvedAudioProfile} */
export function resolveAudioProfile(cfg) {
  const a = (cfg && cfg.audio) || {};
  const profDef = a.profile && AUDIO_PROFILES[a.profile];
  const fam = (profDef && profDef.family) || inferAudioFamily(cfg || {});
  const famDef = AUDIO_FAMILY_DEFAULTS[fam] || {};
  const out = {
    family: fam,
    harmony: { ...GLOBAL_AUDIO_DEFAULT.harmony, ...famDef.harmony, ...(profDef ? profDef.harmony : {}) },
    notes:   { ...GLOBAL_AUDIO_DEFAULT.notes,   ...famDef.notes,   ...(profDef ? profDef.notes   : {}) },
    bass:    { ...GLOBAL_AUDIO_DEFAULT.bass,    ...famDef.bass,    ...(profDef ? profDef.bass    : {}) },
    // Dedicated Keys/sustain-layer voice when declared (distorted family);
    // absent = null and the pad bus follows the harmony voice (back-compat).
    pad:     (famDef.pad || (profDef && profDef.pad)) ? { ...famDef.pad, ...(profDef ? profDef.pad : {}) } : null,
    // Ensemble drums slot (Phase D): a kit id resolved profile ← family default;
    // resolveDrumKit() applies the mixer override + the unregistered→kit_909 fallback.
    drums:   { kit: (profDef && profDef.drums && profDef.drums.kit) || DRUM_KIT_FAMILY_DEFAULT[fam] || 'kit_909',
               level: (profDef && profDef.drums && Number.isFinite(profDef.drums.level)) ? /** @type {number} */ (profDef.drums.level) : 1 },
    brightness: (profDef && profDef.brightness != null) ? profDef.brightness
              : (famDef.brightness != null) ? famDef.brightness
              : GLOBAL_AUDIO_DEFAULT.brightness,
  };
  // The practice voice tracks the instrument, not the genre: a bass exercise's
  // notes should sound like a bass regardless of the backing's family — and
  // never the sampled GUITAR DI (its keycenters bottom out at MIDI 37).
  if (cfg && cfg.instrument === 'bass') { out.notes.tone = 'bass'; out.notes.sg = false; }
  if (Number.isFinite(a.brightness)) out.brightness = /** @type {number} */ (a.brightness);           // slider overrides
  // (backing-voice override moved to the Mixer's per-channel instrument select — Phase C)
  return out;
}
