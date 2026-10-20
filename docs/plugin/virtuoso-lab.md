# Virtuoso (Lab) — experimental personal fork

**Experimental, not a stable update.** Plugin ID / screen: `virtuoso_lab`;
navigation label: **Virtuoso (Lab)**. A supported released desktop version has
not yet been certified. The running host must understand `scriptType: "module"`
AND serve the plugin's `src/**` with JavaScript MIME. An older host will fail at
`import` or return 404 for a core module. Release candidate: **0.2.11-lab.1**.
This guide accompanies the authorized experimental update to the personal fork's
`main`, not a stable release or legal certification. Confirm the installed
manifest reports **0.2.11-lab.1**; the preceding publication was 0.2.9-lab.1.

This update packages **0.2.11-lab.1** (source 0.2.11),
preserving chord-theory/timing extraction and adding one Custom file practice.
This needs the complete `src/` graph plus `assets/practices/index.json` and
`assets/practices/guitar/beginner/chromatic-warmup.md`; generated artifacts include
both original AGPL lesson files. Existing contained playback is reused.
Publication does not install the update on your desktop.

This fork packages the native-module prototype based on upstream Virtuoso v0.2.6,
with source version 0.2.11 and move-only pitch, scale-interval, chord-theory and timing modules.
It **does not include the separate Learn-mode work** and is not an official
stable release. Original project: https://github.com/got-feedBack/feedBack-plugin-virtuoso.
Copyright (C) 2026 Christian Cowan (original Virtuoso).
Copyright (C) 2026 Pascal Sochacki (personal fork modifications).
Modification notice, 2026-10-20: native-module extraction, Lab namespace
isolation, attribution/source-availability update, withdrawal of uncertain
recordings and validated Markdown-backed practices with lifecycle safety fixes.
Virtuoso code is free
software under **AGPL-3.0-only**; you may use, study, modify and redistribute
under those terms. Supplied **WITHOUT ANY WARRANTY**, including implied
merchantability or fitness for a particular purpose. See `LICENSE`,
`THIRD_PARTY_NOTICES.md` and `SOURCE.md` at the installed repository root;
asset licenses are separate, not all AGPL. On 2026-10-20 the 61 unverified
8ridgelite-derived recordings and Deer Ink Studios V30 WAV were removed.
Electric DI 8 is unavailable; saved `8ridge` mixer choices select the existing
Shinyguitar Electric DI. Metal keeps its amp settings with the existing
procedural cab; user IR overrides still work. Generation is unchanged.

This guide is also copied verbatim as the generated runtime README. Its install
instructions are standalone: source-only development/docs/test paths mentioned
below are maintainer context, not links to files present in the runtime package.

## Install with Git Plugin Manager

1. Disable original **Virtuoso**, fully quit FeedBack and restart it. Keep the
   original disabled throughout Lab testing; do not run both editions together.
2. In FeedBack's Git Plugin Manager, install using this exact repository URL:

   **https://github.com/pascal-sochacki/feedBack-plugin-virtuoso.git**

   Default `main` has `plugin.json` and the complete runtime at its root.
   No branch selector, build, npm install or packaging step is required.
   The installed folder basename may differ from manifest ID `virtuoso_lab`.
3. Fully restart FeedBack after installation. Enable **Virtuoso (Lab)** if needed,
   restart again, and open its navigation entry. Confirm
   `/api/plugins/virtuoso_lab/status` and successful loading of `src/core/pitch.js`
    and the complete `src/` graph: pitch, scale intervals, chord theory, timing,
    core practice parser and shell practice loader.

Installation is user-driven; publication does not install or start anything on
Windows. Back up important data before experimental testing.

## Try Custom file practices

1. In Setup select **guitar, six strings, standard E A D G B e**
   (absolute MIDI low→high: `40,45,50,55,59,64`). Do not retune your real
   instrument to match a falsely declared Setup.
2. Open **Custom → File practices → Chromatic warm-up → Load practice**.
   Loading previews the lesson without starting audio: four attacks on the low
   E string, frets **1, 2, 3, 4**, one per beat at the reference **60 BPM**.
3. Press **Play**; check Pause, Stop, count-in and loop using the existing
   controls. Try **30, 60 and 120 BPM**: the authored four-second chart scales to
   **8, 4 and 2 seconds** before count-in. No backing, transposition or refingering.
4. Change Setup to a nonstandard tuning or bass: expect an explicit error and
   stopped/unloaded playable chart, not silent retuning. Restore standard guitar:
   the retained file rebuilds automatically. Tempo edits also rebuild it.
5. Choose **Return to generated practice**, a normal Practice type, preset,
   Workout or Jam to leave the file. Check view changes and navigation/re-entry
   do not revive an abandoned load or start playback after Stop.

Only this reviewed lesson is supported; this is not an arbitrary-file importer
or Markdown editor. Lesson prose is displayed as plain text. Its exact JSON
notes and explicit duration remain authoritative; unsupported techniques,
instrument or tuning are rejected. All renderers and Windows DI still need
installed-host acceptance, including correct/wrong-note host judging.

## Runtime source and regeneration

The published repository contains the complete editable runtime source: plain
`screen.js`, `src/`, Python routes, HTML and licensed assets. There is no compiled
or hidden plugin bundle. The GPL WebAudioFont player also includes its preferred
TypeScript source, original build config/license and Lab reconstruction script
under `vendor/webaudiofont-src/`. `SOURCE.md` explains matching the manifest
version to its published Git revision, historical removals and review limits.
`THIRD_PARTY_NOTICES.md` and `LICENSES/` accompany every generated candidate.
Upstream development docs, tests, packaging scripts and CI that
depend on the original source layout are intentionally omitted from this runtime
edition; publication does not imply browser/desktop certification.

Extraction and packaging tooling are preserved on the author's **local-only**
`dev/modular-source` source branch (the earlier slice also exists on local
`refactor/native-modules`), not published as remote branches. Do not
try to check out that branch from this URL or run the cut tool on this already
namespaced runtime: applying it twice would rename identities twice.

For maintainers with that original-identity source checkout only:

```sh
node scripts/cut-lab.mjs
```

Outputs beside (not inside) the repositories:
`virtuoso-lab-dist/virtuoso_lab/` and `virtuoso-lab-dist/virtuoso_lab.zip`.
Regenerates modified tracked runtime files and untracked `src/*.js` / nested
modules and package JSON, without rewriting source or using the last commit.
Copies only explicit runtime files and tracked `assets/` / `static/` assets;
no `.git`, dependencies, settings, plugin data, local agent files or unreviewed
licensing assets. Font/audio attribution and licenses remain in the asset tree.
Requires Node, Git and the `zip` command on the packaging machine. No bundler.
The generator performs no commit, push, migration or installation.

## Alternative manual installation on Windows

1. Keep original **Virtuoso disabled**, then fully quit and restart FeedBack
   before testing Lab. Disabling without restarting leaves already-loaded
   scripts/routes in memory. Do not overwrite the original plugin folder.
2. In the current v3 UI open the **Plugins page (Pedalboard)** to check enabled
   plugins. The local host documentation does not establish a ZIP-upload control:
   **extract the ZIP manually** into the desktop's writable user plugin directory.
   Preferred current location: `%APPDATA%\feedback-desktop\plugins\`
   (`app.setName('feedback-desktop')`, with plugins under `userData/plugins`).
   Legacy `%APPDATA%\slopsmith-desktop\plugins\` and
   `%APPDATA%\fee[dB]ack\plugins\` directories may exist but need not be active;
   do not delete them. Verify the active installed desktop version and its actual
   userData/plugin location before copying; do not write into Program Files or
   the bundled stable plugin.
3. The result must be `plugins\virtuoso_lab\plugin.json`, with `screen.js`,
    `screen.html`, `routes.py`, `settings.html`, the complete `src\` graph,
    `static\` and `assets\` (including the practice index and Markdown lesson)
    in that same plugin folder.
   Avoid `plugins\virtuoso_lab\virtuoso_lab\plugin.json` nesting.
4. Restart FeedBack, enable **Virtuoso (Lab)** if needed, restart again and open
   its navigation entry. Check `/api/plugins/virtuoso_lab/status` reports OK.
    Browser DevTools should show a module entry and successful loads of all
    imported modules and `/api/plugins/virtuoso_lab/assets/practices/index.json`.
5. To update: fully quit, replace only the Lab runtime folder with a freshly
   generated folder, then restart/reload. To remove: disable Lab, quit, remove
   only `virtuoso_lab`, and restart. Original Virtuoso data stays unchanged.

For a web host, put the whole folder in that host's configured user plugin
directory instead, then restart it. The ZIP is a manual-install artifact, not
the Git Plugin Manager input. Use the repository URL above for Git installation.

## Identity isolation and limits

Lab owns its API/custom routes, DOM IDs/classes, CSS variables/data attributes,
animations, font faces, localStorage/progress keys, `plugin_data/virtuoso_lab`
export snapshots, `virtuoso_lab_presets` / `virtuoso_lab_tunings` DB tables,
temp-chart directory and outbound events. Public API: `window.VirtuosoLab`.
Harness opt-in: `__VIRTUOSO_LAB_HARNESS__`; debug: `__virtuoso_lab_debug` and
sample counters: `__virtuoso_lab_sgStats`. Audio font constructors and mutable
GM/drum preset globals are Lab-private; audio filenames and license text stay intact.
No original presets, tunings or progress are copied into Lab.

**Separate installation/storage is NOT proof of simultaneous runtime safety.**
Both editions still consume the host singleton `noteDetect` verifier/target slot,
shared input/output, host instrument/profile/tuner settings and visualization
factories. Boot instrument synchronization may write host settings. Host events
(`screen:changed`, `instrument:changed`, etc.) and legacy host-owned storage keys
(`slopsmith_notedetect`, shared card-save directory) deliberately stay unchanged.
Lab's AudioContext bridge is screen-scoped but can still chain with an original
edition's wrapper: keep original disabled and restart; don't run both together.
Shared host globals (`feedBack*`, `noteDetect`, tuner, host legacy aliases) are
not renamed or replaced with private fake host APIs.

## Acceptance status (2026-10-20)

Reviewed source-only validation: **172/172 Node tests** (pure leaves, practice
parser/loader, mocked real-entry lifecycle, characterization, packaging and documentation), real module import,
manifest/source graph/ZIP integrity, private audio globals, Python AST + SQLite
schema/endpoints, repeatability and a deterministic **71-case** corpus captured
from committed pre-extraction source `c37dc632` (40 public keys, 91 debug keys,
all 28 scales, genuine guitar 3NPS and position-box setup coverage, representative
generation variants and all 25 built-in sessions). Raw exercise SHA-256 values
match in source and isolated Lab imports; fatal startup-assert and raw note-time
mutation controls pass. Syntax,
narrow JSDoc checking, brand hygiene and whitespace gates are checked as well.
The user's earlier installed Windows Lab “seems to work” report is preliminary
functional smoke only, not regression certification for this update.
Tests also verify complete legal/vendor-source retention, exact player
reconstruction, legal UI links, withdrawal of all **62 assets** (61 OGGs and one
WAV), saved-bank migration and the procedural Metal cab. Use current runner
output rather than treating this dated count as the full suite forever.
The host smoke runner cannot reach a host on port 8765; browser smoke and Python
route-runtime tests need host/dependencies unavailable in this environment.
Real installed-host module loading/cache/navigation, renderers, transport,
audio and verifier acceptance remain required. **Windows audio-interface / DI
testing must be performed on the user's installed desktop**, not inferred from
Node tests or a source checkout. Do not merge or ship as stable until those pass.
