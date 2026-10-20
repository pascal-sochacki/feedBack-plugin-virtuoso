# Third-party notices and publication gate

Virtuoso's original code is AGPL-3.0-only ([LICENSE](LICENSE)). This is not a
blanket relicensing of the following assets. Preserve their separate notices,
permissions and preferred sources when distributing either edition.

**Both blocked recording groups were removed on 2026-10-20; experimental
0.2.9-lab.1 publication is authorized after review fixes.** See [SOURCE.md](SOURCE.md).
Bundling a license text does not establish that a
third-party recording was granted under that license. These notices do not
certify legal clearance, installed-host operation or Windows DI acceptance.

## WebAudioFont player — GPL-3.0-or-later

WebAudioFont by Sergey Surikov (`surikov/webaudiofont`). The exact bundled
`static/wafonts/WebAudioFontPlayer.js` matches official commit
`dc9545e78fa180ba9433f89e0703bcbf6ddb84a7`, whose `package.json` explicitly grants
GPL-3.0-or-later, not MIT. [GPL text](LICENSES/GPL-3.0.txt), original license,
preferred TypeScript sources, build configuration and original generated JS
are included in [vendor/webaudiofont-src/](vendor/webaudiofont-src/).
[Rebuild and modification notice](vendor/webaudiofont-src/SOURCE.md).
Lab changes only player constructor/global and preset-prefix namespaces (Pascal Sochacki,
2026-10-19); upstream files and notices in `vendor/` stay unmodified.

## FluidR3 GM sound data — MIT

Fluid (R3) SoundFont. Copyright (c) 2000-2002, 2008 Frank Wen
<getfrank@gmail.com>. WebAudioFont renders by Sergey Surikov. The 14 melodic
and 14 percussion preset files are the FluidR3 GM renders, not JCLive.
[Copyright, permission and warranty text](LICENSES/MIT-FluidR3.txt).
The referenced MuseScore document includes the original FluidR3 README and
COPYING; its full original bytes are retained as
[provenance](LICENSES/FluidR3-provenance.md), not a claim that these are
MS_General or FluidR3Mono samples. Upstream contributor acknowledgements there
are retained. Lab renames preset globals only; embedded sound data is unchanged.
Pinned source and byte verification: [SOURCE.md](SOURCE.md).

## Creative Commons Attribution 3.0 Unported samples

License URI: <https://creativecommons.org/licenses/by/3.0/>;
[complete legal code](LICENSES/CC-BY-3.0.txt). Attribution does not imply
endorsement by the original authors.

- `static/samples/sal_*.ogg`: **Salamander Grand Piano V3 by Alexander Holm**.
  Original source: <https://archive.org/details/SalamanderGrandPianoV3>.
  Subset keeps velocity layers 4, 9 and 14, mono 44.1 kHz Vorbis q4, trimmed
  to 4.5 seconds with a 0.4-second fade-out; filenames mapped to MIDI.
- `static/samples/wur_*.ogg`: **Wurlitzer EP200 from Greg Sullivan's E-Pianos
  by Greg Sullivan**, SFZ/FLAC mapping and fixes by kinwie.
  Source: <https://github.com/sfzinstruments/GregSullivan.E-Pianos>.
  Subset keeps the `mp` layer, mono 44.1 kHz Vorbis q4, trimmed to 4.5 seconds
  with a 0.4-second fade-out. Original detuning retained; MIDI filenames.
- `static/samples/cp_*.ogg`: **Yamaha CP-80 electric grand from Greg Sullivan's
  E-Pianos by Greg Sullivan**, SFZ/FLAC mapping and fixes by kinwie.
  Same source; `mp`, `f` and `ff` layers, mono 44.1 kHz Vorbis q4, trimmed to
  4.5 seconds with a 0.4-second fade-out; MIDI/dynamic filenames.

These modification descriptions are the existing harvest record, not a newly
verified byte-exact reconstruction. The pinned upstream license is explicitly
3.0 **Unported**, not a national port. See [SOURCE.md](SOURCE.md) for evidence.

## Other sample libraries — recorded as CC0 1.0 Universal

License URI: <https://creativecommons.org/publicdomain/zero/1.0/>.
Sources and processing are recorded in [sample provenance](static/samples/README.md):
Shinyguitar (`sg_`) and Emily (`em_`) by Karoryfer Samples / D. Smolken,
ganjo (`bj_`), and virtuosity_drums (`dk_`) by Versilian Studios & Karoryfer
Samples. Preserve that provenance; this audit has not independently rebuilt
all these subsets. Banjo was pitch-corrected on the original harvest's
2026-06-15 re-export; drums were normalized, trimmed, faded and filtered.

## Removed recordings — historical provenance, not shipped licenses

- `static/samples/8r_*.ogg`: derived 8ridgelite Natural WAV subset,
  <https://github.com/OmikronApex/8ridgelite>. Root LICENSE contains GPL v3,
  but the recording scope and exact derivative mapping still need resolution.
- `static/irs/v30_4x12.wav`: Deer Ink Studios V30 / Audix i5 P2 capture from
  AIDA-X, <https://github.com/AidaDSP/AIDA-X>. Original WAV is byte-identical
  and publicly downloadable; the project states GPL-3.0-or-later, but an
  explicit grant covering this third-party capture has not been established.

All 61 OGG files and the one WAV above were removed on 2026-10-20, together with
the selectable DI bank and Metal preset capture reference. No related upstream
vendor copies are included. Historical licenses/links are not claims that these
recordings may be redistributed. Old `8ridge` mixer preferences now select
Shinyguitar; Metal uses the existing procedural cab (user IR overrides unchanged).
[GPL text](LICENSES/GPL-3.0.txt) remains for WebAudioFont, not recording clearance.
Commercial local IRs/NAM captures and alternate fonts
remain ignored and must never enter the publication allowlist.

## Fonts — SIL Open Font License 1.1

Black Ops One, Orbitron, Rajdhani and Russo One WOFF2 assets retain the full
original copyright and OFL texts in `assets/fonts/OFL-*.txt`. No font/license
bytes or reserved font names are changed by Lab packaging.
