# Virtuoso architecture — current contract

Virtuoso generates practice charts and plays them **inside one contained plugin
surface**. Play does not launch FeedBack's main player. Escape remains host-owned.

## Data and ownership

Workout draft/timeline state now belongs to `shell/workout-editor.js`: clone on
starter/routine load, mutable edits, refresh, card rendering and visit listener
teardown. Its only callback is semantic preview; entry retains transport and
async approval. `core/workout-config.js` materializes plain launch cfg from draft
and explicit current audio/setup/tuning/count-in inputs; no DOM/storage/host.
Browse/preset persistence, launch/readiness, renderer attachment and clock stay
entry-owned. Public helper identity imports remain explicit, not barrel-hidden.

Renderer integration now has explicit lower-shell owners in
`src/shell/renderers/`: call-time host capability/factory reads + shared script
loading, selection with explicit local factory dependencies, and independent
Classic 2D and local Tab/Notation geometry/paint/listener lifecycle. Shared
display-policy owns mutable palettes/lesson sets and display-only beat/label/glyph
rules; `hand-marks.js` owns shared display-only simile selection, with sorted
note references cached at init/array replacement and mutable annotations read per draw.
`notation-pitch.js` owns pure display signature/staff spelling; quantization/beam
caches remain local, not generation theory. Visible beam groups use the same
note-identity set as head painting. Canvas backing stores change only on size/
DPR changes; draw resets its transform and paints the full background each frame.
Tab/Notation accept only live `getRenderTheme`/`handMarksOn` preference readers.
Entry owns the active theme binding/storage writes and factory wrappers; caches
are initialized at the same original init boundary (not refreshed on draw).
Imports/construction are inert;
late host publication/replacement stays visible. Entry retains attachment,
generation/ready cancellation, transport/audio/credit and synchronous public/debug
publication. Classic owns only its supplied canvas, never creates another player
or canvas. Tab/Notation also use only the supplied canvas, resize listener and
`init/draw/resize/destroy` (Notation retains `setMode`); no song/time/show/ready API
was invented. Borrowed renderer capabilities remain attachment-owned.
Combined/tab `setMode` compatibility is retained, even though attachment currently
selects notation-only; deleting that public surface is explicitly deferred.
[Exact owners and dated HOST CHECK](code-map.md#current-owned-renderer-modules).

```text
UI → readConfig → generateExercise / generateSession (pure cfg → chart)
   → makeBundle (first shell step, display preferences)
   → attachRenderer → startPlayback (contained clock / RAF / Web Audio)
   → host verifier verdicts → downstream pedagogy / progress
```

Ladder, Custom, Workout and Jam share the shell, transport and renderer lifecycle.
Custom's [file-practice prototype](practice-files.md) fetches validated static
Markdown in the shell, then passes transient parsed `cfg.practiceFile` into a
pure branch of `generateExercise`. The same bundle/player/host judge consume it;
no separate Markdown API, player or scoring path exists.
Only Ladder `chromatic_warmup` now uses format-3 authored charts. The sole catalog
index hydrates file metadata independently of normal DOM binding; pure generation receives parsed
plain cfg synchronously. Existing progress IDs, run-target tiling, count-in and
host judge remain. Alternate tunings are intentionally blocked for this fixed
standard-six-string lesson. Other generated builders are unchanged.
`screen.js` is a native module entry retaining its strict IIFE; pure mutable leaves
in `src/core/` are static imports. There is **no runtime build** or custom loader.
Preserve import-time purity, dependency direction and synchronous API/debug/boot
order. See [native-module map and acceptance gates](native-modules.md).

The extracted generation DAG now includes seeded streams, sequence emission,
positions/fingering, metric grids, functional harmony/chord geometry and complete
scale/arpeggio/technique/tapping/guide-tone/bass builders. Original cfg is passed
directly; modules have explicit imports, mutable data and no import-time guards
or IO. Synthetic qualities retain shared memoized `CHORD_FORMULAS` identity.
Guard calls stay at their original entry order. Session/Workout assembly/defaults/
materialization and pure length/refresh operations are native too. No `state.js`,
new public API, host adapter or standalone-completion claim. See [owners](code-map.md).

**Current completion:** native `core/exercise.js` now owns complete exercise
generation, dispatch, key-cycle/Jam assembly and all motif/strum/backing dependencies.
`core/session.js` owns complete sessions through explicit segment/config/chart
owners and passive content. Draft/edit/refresh UI, stores, readiness/caches,
live-tier run targets, `readConfig` and `makeBundle` remain shell-owned. Pure
audio-profile metadata is lower core data, not WebAudio/host access. All guard
calls are entry-owned; imported tables retain ordinary shared mutable identity.
No new public API or behavioral change; `generateExercise` is published by exact
native function identity, as is `generateSession`. Shared source/Lab graph checking
uses developer-only vendored Acorn (ECMAScript 2022), inspecting all nested import/
reexport/literal-dynamic edges; computed imports/new syntax/upward cycles reject.
Core may import passive content; content cannot import core/shell. The parser is
not served runtime; no compiler cache/install is needed by tests.

- Virtuoso owns generated chart data, contained transport/audio scheduling,
  looping and render lifecycle. The chart is portable; generation never reads
  host/DOM/storage/network globals.
- Borrow host renderer factories via `vizFactoryFor`, navigation/capabilities
  via `hostBus`, SDK via `hostMinigames`, desktop bridge via `hostDesktop`.
  Prefer `feedBack*` names with supported legacy fallbacks. No monkey-patching
  public APIs; borrowed-highway AudioContext suppression stays screen-scoped.
- Detection/judging is host territory. Consume note_detect verdicts **1:1**;
  no parallel timing judge, DSP, level/silence veto or local calibration gate.
  Display-only live hints never become credit authority. Mocked verdict tests
  are not installed-desktop DI certification.

## Host loading and backend

`plugin.json` declares ID `virtuoso`, module entry, HTML, settings and routes.
Host screen DOM is `plugin-virtuoso`; plugin UI IDs are `virtuoso-*`.
The running host must await module loading and serve `src/**` with JS MIME.
Source-host inspection does not establish a supported released-host floor.

Routes remain under `/api/plugins/virtuoso/…`. Preset/tuning CRUD uses the host
meta-DB (`virtuoso_presets`, `virtuoso_tunings`). `settings.server_files` JSON
files are export/import snapshots, **not the live store**. Asset routes serve
licensed audio/fonts from `static/` and `assets/`; retain all license/provenance
files. [Code map](code-map.md) lists the backend surface.

## Dormant Sloppak writer — not a launch instruction

`POST /temp-sloppak` remains backend machinery. No current frontend Play path
posts to it or calls `window.playSong`. Do not wire it up or add Escape handling
without an explicit reversal of the contained-playback decision.

The writer stores directory-form `.sloppak` packages below
`<DLC_DIR>/.virtuoso-temp/`, outside library indexing, with a `manifest.yaml`,
arrangement JSON and manifest-indexed audio stem. It normalizes frontend
`chordTemplates`/`handShapes` to on-disk `templates`/`handshapes`. Optional payload
audio flags synthesize notes/metronome, otherwise a silent transport stem.
The exact old file-format rationale and launch design are retained in
[historical architecture](../archive/architecture-history.md), explicitly
**nonactionable**; they are not a shipped optional "Open in full player" control.

## Related references

[Exercise schema](exercise-schema.md) · [Session schema](session-schema.md) ·
[Tuning model](tuning-model.md) · [Audio output](audio-output.md) ·
[Backing pipeline](backing-pipeline.md) · [Testing](testing.md) ·
[Development / host checks](development.md)
