# Virtuoso architecture — current contract

Virtuoso generates practice charts and plays them **inside one contained plugin
surface**. Play does not launch FeedBack's main player. Escape remains host-owned.

## Data and ownership

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
`screen.js` is a native module entry retaining its strict IIFE; pure mutable leaves
in `src/core/` are static imports. There is **no runtime build** or custom loader.
Preserve import-time purity, dependency direction and synchronous API/debug/boot
order. See [native-module map and acceptance gates](native-modules.md).

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
