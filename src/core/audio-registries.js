// SPDX-License-Identifier: AGPL-3.0-only

export const ACOUSTIC_PIECES = {
    kick:36, snare:38, snare_xstick:37,
    hh_closed:42, hh_open:46, hh_pedal:44,
    ride:51, ride_bell:53, bell:80,
    crash_l:49, crash_r:57, splash:55, china:52,
    tom_hi:50, tom_mid:47, tom_low:43, tom_floor:41,
    clap:39,
  };
  /** @param {number} note @param {string | undefined} font @param {number | undefined} variant */
export const drumFile = (note, font, variant) => `128${note}_${variant}_${font}_sf2_file.js`;
  /** @param {number} note @param {string | undefined} font @param {number | undefined} variant @returns {`_virtuoso_lab_drum_${string}`} */
export const drumVar  = (note, font, variant) => `_virtuoso_lab_drum_${note}_${variant}_${font}_sf2_file`;
  // GM notes that ACTUALLY ship a committed FluidR3 one-shot under static/wafonts.
  // The step-5 extended pieces (snare_xstick 37, tom_floor 41, china 52, ride_bell
  // 53, splash 55, crash_r 57, bell 80) have NO sample yet → they take the synth
  // voice instead of a per-hit 404 (loadWafPreset retries on 'failed'). ADD a note
  // here only when its sample file lands. (Drum curation pass = a later phase.)
export const SAMPLED_DRUM_NOTES = new Set([35, 36, 38, 39, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]);
  // REAL acoustic drum kit (Versilian/Karoryfer "virtuosity_drums", CC0) — a curated
  // lightweight subset replacing the GM FluidR3 one-shots (the drum-side of the melodic
  // sample-bank upgrade). Single medium-velocity layer per piece + round-robins (the #1
  // anti-machine-gun lever per the drum-pedagogy panel); dynamics come from `vol` scaling.
  // `src` maps an engine piece → the harvested source token (the 4 tom slots alias the 2
  // harvested toms); `rr` is the take count per token; missing pieces (ride_bell/splash/
  // china/crash_r/bell/clap) fall through to FluidR3 then synth. Files dk_<token>_<n>.ogg
  // in static/samples (the /sample route). Provenance: static/samples/README.md.
export const DRUMKIT_BANKS = {
    virtuosity: {
      src: { kick:'kick', snare:'snare', snare_xstick:'xstick', hh_closed:'hhclosed',
             hh_open:'hhopen', hh_pedal:'hhpedal', ride:'ride', crash_l:'crash',
             tom_hi:'htom', tom_mid:'htom', tom_low:'ltom', tom_floor:'ltom' },
      rr: { kick:3, snare:3, xstick:2, hhclosed:4, hhopen:2, hhpedal:2, ride:3, crash:2, htom:2, ltom:2 },
       file: (/** @type {string} */ token, /** @type {number} */ n) => `dk_${token}_${n}.ogg`,
    },
  };
export const KIT_REGISTRY = {
    kit_909: { engine: 'synth', preset: '909' },   // tight/punchy default electronic
    kit_808: { engine: 'synth', preset: '808' },   // sub-heavy, long kick tail
    // Sampled acoustic kits — REAL virtuosity_drums samples, FluidR3_GM = per-piece
    // fallback for the pieces the curated subset drops. Share the piece set; differ by level.
    kit_rock:          { engine: 'sample', bank: 'virtuosity', font: 'FluidR3_GM', variant: 0, level: 1.0,  pieces: ACOUSTIC_PIECES },
    kit_acoustic_soft: { engine: 'sample', bank: 'virtuosity', font: 'FluidR3_GM', variant: 0, level: 0.82, pieces: ACOUSTIC_PIECES },
    kit_jazz:          { engine: 'sample', bank: 'virtuosity', font: 'FluidR3_GM', variant: 0, level: 0.8,  pieces: ACOUSTIC_PIECES },  // brush sample set = later curation
    // kit_latin / kit_afro (percussion-led) → Phase D6
  };
export const TONE_GM = {
    piano: 0, epiano: 4, clav: 7, organ: 19, nylon: 24, guitar: 25, clean: 27,
    upright: 32, bass: 33, strings: 48, brass: 61, synthlead: 81, synthpad: 88, pad: 89,
  };
export const BJ_KCS = [39, 40, 41, 42, 43, 44, 45, 46, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 61, 63, 67, 68, 70, 71];
