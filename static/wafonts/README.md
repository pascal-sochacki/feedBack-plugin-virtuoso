# Bundled WebAudioFont assets — provenance & licensing

Re-audited 2026-10-19. See [root notices](../../THIRD_PARTY_NOTICES.md) and
[pinned provenance/preferred source](../../SOURCE.md). Publication remains blocked
pending the complete asset review; earlier blanket clearance wording is not authority.

| Asset | Source | License |
|---|---|---|
| `WebAudioFontPlayer.js` | the WebAudioFont project (surikov/webaudiofont), exact historical commit `dc9545e78fa180ba9433f89e0703bcbf6ddb84a7` | GPL-3.0-or-later (not MIT); preferred TS source/build config in `vendor/webaudiofont-src/` |
| `NNNN_FluidR3_GM_sf2_file.js` (14 melodic GM programs) | WebAudioFont preset renders of **FluidR3_GM** by Frank Wen | MIT (FluidR3 GM is MIT-licensed; see the license document referenced by the webaudiofontdata README, hosted in the MuseScore project repository) |
| `128NN_0_FluidR3_GM_sf2_file.js` (drum one-shots) | same — FluidR3_GM percussion | MIT |

Notes:

- Full GPL, original FluidR3 copyright/permission/warranty and referenced
  provenance are shipped in `LICENSES/`. Player rebuild is byte-identical;
  Lab namespaces do not alter the preserved vendor source/license files.

- The melodic set was originally the `JCLive` WebAudioFont variants. They were
  **removed 2026-06-12**: the upstream webaudiofontdata repository declares MIT
  but does not document the JCLive sound data's source, and an open upstream
  issue asking whether the MIT grant covers the sound data has no maintainer
  answer. FluidR3_GM has clear MIT provenance, so the whole bundled set now
  comes from it. Do not reintroduce JCLive (or any other undocumented-source
  font) into the committed set.
- `alt/` (gitignored) holds alternate fonts for local A/B auditioning only —
  nothing in it ships.
- The committed Shinyguitar sample subset lives in `static/samples/` with its
  own provenance README (CC0).
