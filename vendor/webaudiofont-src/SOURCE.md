# WebAudioFont preferred source

By Sergey Surikov. GPL-3.0-or-later; [original license](LICENSE.md).
All upstream files here are copied verbatim from official commit
<https://github.com/surikov/webaudiofont/tree/dc9545e78fa180ba9433f89e0703bcbf6ddb84a7>.
`package.json` at that commit declares GPL-3.0-or-later.

The complete preferred source graph is `npm/src/tsconfig.json` and its six
explicit `files`: channel, loader, player, reverberator, ticker, otypes.
No imports, minifier or runtime dependency is needed to rebuild the player.
The original package build uses `tsc --build npm/src/tsconfig.json`.

From this directory, using TypeScript **5.9.3**, run:

```sh
tsc --project npm/src/tsconfig.json --outFile /your/output/WebAudioFontPlayer.js
```

Verified 2026-10-19: this recreates `npm/dist/WebAudioFontPlayer.js` **byte for
byte**, SHA-256
`f3f3bae5fa47140eecc0c72834d3b4eaed16ca108f891456aa2625b86d3fb07f`.
It also matches `static/wafonts/WebAudioFontPlayer.js` in the source edition.
Do not run the vendor package's unrelated prepublish workflow to install the
plugin; the TS compiler is needed only if you edit/rebuild this vendor library.

## Lab modification and reproduction

Pascal Sochacki, 2026-10-19: generated Lab changes constructor/class names
matching `/\bWebAudioFont\w*/g` to `VirtuosoLab` + the original name, and preset
prefix strings `_tone_` / `_drum_` to `_virtuoso_lab_tone_` /
`_virtuoso_lab_drum_` (only when not preceded by an identifier character),
preventing mutable sampler globals from colliding with another edition. The original
source and notices here remain unchanged. Reproduce the installed Lab player:

```sh
node rebuild-lab.mjs /your/output/WebAudioFontPlayer.js /your/output/LabPlayer.js
```

The script reads the rebuilt upstream file, applies only those namespace edits
and writes the requested output. For a complete upstream recompile, edit the
preferred TS sources above and repeat both steps. For immediate JS edits,
the installed runtime JS remains readable/editable without recompilation.
