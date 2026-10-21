# Source availability and pinned provenance

Audit update: 2026-10-20. Reviewed for the authorized experimental
**0.2.11-lab.1** update, not a stable release or legal certification.
The files below were fetched read-only
from official GitHub API/raw endpoints. A matching historical commit's license
is used for the player, not an unsupported retroactive current-license claim.

## Plugin source

Copyright (C) 2026 Christian Cowan (original Virtuoso).
Copyright (C) 2026 Pascal Sochacki (personal-fork modifications).
Fork modification notice: native-module extraction and Lab identity isolation;
2026-10-20 attribution/source-availability update and uncertain-recording
withdrawal, followed by chord-theory/timing extraction, validated Markdown
practices and lifecycle safety fixes, source 0.2.11 / Lab 0.2.11-lab.1.
AGPL-3.0-only; supplied WITHOUT ANY WARRANTY. See [LICENSE](LICENSE).

Experimental source 0.2.13 modification notice (2026-10-21): preserves 0.2.12
fixed variants and serializes the original Chromatic Warmup curriculum into an
AGPL Markdown Ladder pilot, modular core/content/renderer/Workout foundations
and reviewed staff/beam/page-lifecycle fixes. Authorized Lab candidate 0.2.13-lab.1;
no stable or installed-host certification. No new third-party assets; vendor texts unchanged.

The installation consists of editable native JS, HTML, Python and assets.
No plugin source transpilation or runtime build is required. Source for each
published install is the Git revision containing that install's `plugin.json`:
<https://github.com/pascal-sochacki/feedBack-plugin-virtuoso/commits/main/>.
Choose the revision whose manifest equals your installed version, rather than
assuming a newer `main` is matching source. Retain the installed Git revision
when hosting an older version; provide that revision's source to remote users.
The UI source link points to this version-selection procedure. No release tag
has been created and no unpublished source branch is promised as available.
The matching source and these notices are published together on the fork's
`main`; verify the installed revision rather than relying on a moving branch.
The original-identity source checkout is local-only; its upstream `main` links
are not a matching-source offer for this unpublished development candidate.

## Verified player and FluidR3 references

- Player commit: <https://github.com/surikov/webaudiofont/tree/dc9545e78fa180ba9433f89e0703bcbf6ddb84a7>.
  `npm/dist/WebAudioFontPlayer.js` SHA-256
  `f3f3bae5fa47140eecc0c72834d3b4eaed16ca108f891456aa2625b86d3fb07f`.
  Exact match to source edition's bundle. Commit `package.json` says
  GPL-3.0-or-later; LICENSE.md SHA-256
  `3972dc9744f6499f0f9b2dbf76696f2ae7ad8af9b23dde66d6af86c9dfb36986`.
  Preferred source, full graph and byte-exact rebuild:
  [vendor source instructions](vendor/webaudiofont-src/SOURCE.md).
- FluidR3 data reference: <https://github.com/surikov/webaudiofontdata/tree/23ca907d4370a04fd89ca483a92915e4d6159ab9>.
  Its README explicitly points to the MuseScore FluidR3 license document.
  All **28/28** local FluidR3 preset files were downloaded from that commit's
  `sound/` paths and compared byte for byte: 14 melodic and 14 percussion.
  The [digest inventory](static/wafonts/SHA256SUMS.txt) records those matches;
  verification did not rely on filenames alone.
- Original FluidR3 COPYING/README in the referenced document:
  <https://raw.githubusercontent.com/musescore/MuseScore/25f0d24530ad7e10243b4671519c9168fc83a545/share/sound/FluidR3Mono_License.md>.
  Retained full original document SHA-256
  `0fa7d85b3114adb91cebd42fe955e22df6b19917e9c8e19c401080c075975636`.
  [MIT-FluidR3.txt](LICENSES/MIT-FluidR3.txt) extracts Frank Wen's original
  copyright and exact permission/warranty text, not the mono-conversion credit.

## CC-BY license evidence

- <https://github.com/sfzinstruments/GregSullivan.E-Pianos/tree/8c3e581acda3594b553948ff0222d4f84a698376>:
  README says author permission with attribution and explicitly CC-BY 3.0
  Unported; LICENSE SHA-256
  `e6bc9e9c474700b708f568bac9e5a8a9bcb2b1dad53442f5ba449fcb848b8e76`.
- <https://github.com/sfzinstruments/SalamanderGrandPiano/tree/3382bf9496bba2486f5ab0de55a264d1dfc38404>:
  README identifies Alexander Holm, links the original Internet Archive V3,
  and explicitly CC-BY 3.0 Unported; LICENSE matches the legal code above.
  This confirms jurisdiction/license evidence, not a byte reconstruction of
  the separately harvested Internet Archive OggVorbis samples.

## Removed 2026-10-20: 8ridgelite recording scope and mapping

All 61 `static/samples/8r_*.ogg` derivatives were removed at the user's request,
along with their selectable bank. Stored `8ridge` mixer pins migrate to the
existing Shinyguitar Electric DI. No replacement recordings were generated.
The evidence below is historical only: it does not license or offer these
recordings as part of the current package. Their scope/mapping was not resolved;
removal eliminates this distribution blocker rather than establishing a grant.

Pinned tree: <https://github.com/OmikronApex/8ridgelite/tree/f8742d7fa78def0f9bfb302082f2914c18d6ba98>.
Root LICENSE is GPL v3 (same SHA-256 as GPL text above). README only invites
forking; no explicit recording-specific grant was found. The source's own
`Source/Synth/GuitarSynth.cpp` starts the sorted Natural bank at MIDI 28;
the old harvest README claims `sourceIndex + 27` and notes contradictory
low-note names. Therefore exact preferred-WAV-to-OGG mapping is **not proven**.

Original source is genuinely available (not just a Git LFS pointer):
<https://raw.githubusercontent.com/OmikronApex/8ridgelite/f8742d7fa78def0f9bfb302082f2914c18d6ba98/8ridgelite_20sec_wav/Natural/0_e1.wav>
returned a 5,762,096-byte RIFF WAV; SHA-256
`1a9e05a3a2eeae067bdddd4fc102d50deb0c749bddfb0632c5e1f4a2ac866c5a`.
The `media.githubusercontent.com/media/…` alternative returned 404; do not use
it as a source offer. Full set/download integrity, scope and derivative audio
matching must be verified before a manifest/reconstruction script can be
claimed complete. No ffmpeg/audio-analysis tooling was available here.

## Removed 2026-10-20: V30 third-party capture grant

`static/irs/v30_4x12.wav` was removed at the user's request. The Metal amp retains
its drive/EQ/compressor/gain settings and uses the existing procedural cab
directly (no missing-capture fetch); user-loaded IR overrides remain available.
No AIDA-X/8ridgelite vendor source or captures are included. The only vendor
source retained is the verified WebAudioFont player. Evidence below concerns
the former asset, not a current redistribution claim.

Original file introduced at:
<https://github.com/AidaDSP/AIDA-X/tree/ea59c8964e092c76e1a545d079b69ce21e0c21d3>.
That revision's README explicitly says the **project** is GPL-3.0-or-later.
The WAV at
<https://raw.githubusercontent.com/AidaDSP/AIDA-X/41eb988f5e0fd2c20a598060f65a853cf0eb9e10/files/V30-P2-audix-i5-deerinkstudios.wav>
was exactly the formerly shipped 24,620-byte WAV, SHA-256
`1b86fb54c3b638070e619e61b60740a81485112a82fb6cc506c4170f5677fcd4`.
No audio transform occurred (rename only), so this WAV itself is the editable
preferred source. However, the root project grant has not been independently
confirmed to cover Deer Ink Studios' third-party recording. Resolve that scope
with authoritative evidence or remove/replace the asset under a reviewed plan.
Do not present merely copying GPL text as resolving this blocker.

## Remaining review limits

Both identified recording-license blockers are addressed by removal, not legal
certification. Confirmed player/FluidR3/CC-BY notices and unchanged OFL texts
remain. Other CC0 subsets retain their harvest provenance; this audit has not
independently rebuilt every sample. No new uncertain material is added to the
package. Publication review and authorization do not establish legal
certification or installed-host/desktop/DI acceptance; those remain separate gates.

## Generated runtime source map

Original-identity local source revision: `d8ed5c6d7cb90bf08687ad60f9074d9332d9c448` on
`dev/modular-source`. This is provenance, not a promise of a remote source
branch. The matching editable runtime and complete vendor preferred sources
are the publication revision containing this file and its manifest.
