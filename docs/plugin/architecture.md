# Virtuoso architecture — current contract

Virtuoso generates practice charts and plays them **inside one contained plugin
surface**. Play does not launch FeedBack's main player. Escape remains host-owned.

Developer-only entry typing contracts live in `src/types/*.d.ts`; JSDoc does not
add runtime dependencies or globals. Literal DOM IDs are markup-backed but nullable;
unknown IDs retain `HTMLElement|null`. Host APIs are optional capabilities read at
call time. Full-entry strict typing is **unfinished (2,272→1,647 diagnostics)** and
has its own nonzero `typecheck:entry` command; passing native typechecks exclude it.
No transport/DSP/judging/renderer behavior changes accompany this foundation.

## Data and ownership

Wave6 strict entry **346→284** still fails. RollSegment owns complete returned cfg;
bass pattern/generator variants and resolved audio defaults are separate contracts.
Drum FX are complete shelves/compressor records rather than unrelated optional
nodes. Exact form-control list types preserve real tag/data and nullable fallback.
A bounded structural value/name/closest guard rejects malformed delegated form
events; it does not certify a complete HTMLElement or change judge/audio policy.

Wave4 reconciles optional renderer sustain, actual lifecycle exercise and generic
transport bundle identity. Entry's Jumping-Tab draw leaves now receive an explicit
context; resize/draw bail after synchronous teardown rather than touching released
resources. Host navigation snapshots its optional call-time bus once; partial DOM
binding skips absent Play and library delegation rejects non-element event targets.
These are bounded safety corrections, not DSP/judging/timing policy changes. Normal
paint/audio/core/clock/API behavior remains captured; wave4 strict entry501 failed.
Wave5 retains only tested LCD/delegated DOM safety guards plus type-only contract
reconciliation; current strict entry346 still fails. An intermediate broad runtime
attempt was reverted rather than accepting detector fallback or audio changes.

Wave3 entry contracts describe complete bundles, optional proof/break/tail metadata
and accompaniment member vocabulary without adding runtime fields. Authored CSV cfg,
nullable form cfg and realized generation cfg remain distinct; settings parse fields
remain unknown. Registry annotations retain ordinary mutable identity. Type-only
parameters do not move scheduler/DSP/credit/transport ownership. Current full-entry
debt **752**, no implicit parameter/declaration/read errors but unresolved nullable
and entry/native compatibility errors; `typecheck:entry` still fails.

Wave2 types distinguish internal generated results/session/felt/coach snapshots
from unvalidated persisted JSON, and nullable FormConfig from generator inputs.
Exact form selector typing retains nullability/dynamic DOM fallback. Plugin-owned
shape/coach debug fields are declarations only; runtime global names/identities
and publication order remain unchanged. Current full-entry debt **1,210**, command
still fails. Verified desktop screen-awake IPC returns **Promise<void>**; there is
no setPreventSleep host capability.

`core/run-transport.js` carries explicit plain run/clock state and the unchanged
dual-domain clock/resume-runway math. `shell/run-transport.js` owns that private
state, transitions and pending starts; entry has no writable mirror. Live getters
serve rendering, scheduling and public debug readouts. Paused remains playing;
Stop rewind, sideways stop, finite completion and Reset keep distinct semantics.
The lifecycle operation identity also guards ready/voice start approval; a repeated
Play joins the pending request without invalidating its generation. Play, Workout
and Jam share actual warm/current-check/start implementation, with Jam's bounded
before-start loop hook. False/stale ready never warms, stale voice rejection cannot
report a current failure. Current ready rejection still uses the reviewed Play
status handler. AudioContext creation/resume stays inside the gesture.

Audio nodes, backing/chunk scheduling and lookahead constants remain entry-owned;
the owner samples clocks through one call-time contract. Entry retains bundle,
host note_detect arm/targets/drain/credit, session begin/end/progression/storage,
wake lock, draw-only rewind and RAF/visibility guards. No target reset moved, no
judge window, DSP or musical XP rule changed. This is ownership plus a reproduced
duplicate-pending-Play correction, not running-host timing certification.

`shell/renderer-lifecycle.js` now owns active renderer/canvas identity, candidate
attachment, readiness, actual/desired view readouts, exact-once disposal and owned
resize/debounce/layout RAF resources. One monotonic operation ordinal is shared
with entry sink/voice/start and generation guards; selection invalidates it via
the existing semantic stop/reset hook. No second generation/attachment counter.
Candidate publication precedes ready as before, but Play must await that pending
attachment before voice warming/start (separately reproduced pre-existing race).
Play reports a current readiness error and stays stopped; old failure cannot write
over newer intent. Borrowed readiness observation precedes capability validation
and getter access; observation preserves rejecting attachment, never grants Play.
Late resolver/ready success or rejection cannot commit, reset a newer timeline or
destroy the current renderer. Throwing init readiness is observed without hiding
the current error. Confirmed SPA leave unmounts; canceled unload/BFCache does not.
Entry retains full bundle/lastExercise publication order, contained audio/host
judge/progress and L1 storage; transport/clock state belongs to the run owner above.
Scene/commit/layout hooks are bounded
semantic edges, not circular imports or a shared helper bag.
See [writer/read audit](code-map.md#renderer-attachmentreadiness-owner-2026-10-21).

`shell/practice-selection.js` is the joint selection/loaded-practice owner. Its
private plain selection state carries rung, variation, tier and browsed band;
pending initial intent and catalog/file request identity/visit remain shell-owned.
`core/practice-selection.js` is import-time pure: deterministic selection outputs,
shared tier-field policy and mutable applicability vocabulary only. The controller
owns mode/selection/file/Position listeners, shape/scale options and anchor-key
interaction lock, fixed-field eligibility, catalog UI and current file cfg overlay.
It reads the sole `readConfig` contract, live PATHWAYS and existing loader/catalog;
no catalog clone or second type/lesson registry. Five semantic entry hooks cover
current family/bundle context, selected cfg application, host mode view, stop/reset,
and generation; presentation remains a separate explicit owner dependency.

Entry applies L1/anchor/instrument adaptation before shared tier overlay, preserving
statement order, then config writes and shape selection. Clear/file/variant intent
stops and invalidates before generation; variant Next resets cursor/loop before
compatibility validation. File replacement intentionally clears the previous file
on failure. Identity, visit and current DOM guards prevent abandoned success/error
writes (including A→B→A); catalog retries retain the existing 10-second loader.
Initial saved Warmup waits without persisting a fallback. Confirmed SPA leave
detaches owned listeners; reentry mounts once; canceled unload/pagehide/BFCache
 retain the active document. Shared lifecycle operation guards, actual run-bound
 grading/tier credit, progress stores, manual host shared settings and L1
 persistence remain entry-owned. Renderer resources/readiness belong to lifecycle;
 no new renderer/player, autoplay or Escape handler.

`shell/practice-presentation.js` owns goal recognition/disclosure, plain authored
hint/prose, cue/backing/tuning/PB/supports lines, selection readout, START labels
and content description. One typed view-scoped plain snapshot comes from entry;
no injected helper bag, store writes, events or transport callback. PATHWAYS is a
live passive shared registry, including later catalog hydration. Presentation
never changes cfg, creates progress nodes or starts playback; selection owns
rung/variant/Next and form eligibility; lifecycle owns readiness, run transport owns
start approval and clock state, and entry retains grading.
All actual display callers use owner methods directly. Missing panels no-op without
snapshot reads; import/construction are inert. No HTML parsing of authored strings.

`shell/practice-config.js` owns the single live DOM→cfg reader, silent associated
form writes, advanced disabling and ordered configuration application. Three
semantic application boundaries preserve instrument eligibility before type writes,
sample-profile warming before the own-key overlay and final shape/display sync.
`core/practice-form-defaults.js` owns ordered anti-leak prewrites from plain cfg;
explicit own null/false/zero values still overwrite them. L1 tuning adaptation,
catalog cancellation and contained generation/transport remain entry-owned.

`shell/practice-presets.js` owns saved-practice recall loading, cache publication,
both option destinations and visit listeners. Existing `__virtuosoFavorites`
identity remains compatible; loading never applies cfg or starts playback.
Latest-request/visit/DOM checks reject abandoned async writes. Canceled page
unload retains listeners; confirmed SPA leave detaches and return mounts once.
The unreachable save writer was removed only after verifying the explicit HTML
save-button removal; no save/manage feature or Workout persistence change was added.
`content/form-cues.js` retains mutable vocabulary shared with catalog validation;
`core/practice-form-cue.js` selects a sentence from explicit cfg/pathway/tier/band,
 never DOM, verdicts or a new learning policy.

`shell/tuning-settings.js` owns tuning cache/preset/custom-input writes and
visit listeners through five semantic hooks. Current form/host entries are read
at action time; cache completion never persists player setup or launches audio.
Entry retains L1 setup/host sync, pathway/file eligibility and the
contained generator/player. No second cfg funnel or generic UI adapter. Import
and construction are inert; canceled unload retains hooks, confirmed SPA leave
removes them and rejects stale callbacks. Two original listener clusters retain
dispatch order; repeated option construction shares one ordered implementation.

Workout draft/timeline state now belongs to `shell/workout-editor.js`: clone on
starter/routine load, mutable edits, refresh, card rendering and visit listener
teardown. Its only callback is semantic preview; run transport owns async start
approval. `core/workout-config.js` materializes plain launch cfg from draft
and explicit current audio/setup/tuning/count-in inputs; no DOM/storage/host.
Browse/preset persistence stays entry-owned; launch approval and clock are run-owned; renderer
attachment/readiness belongs to lifecycle. Public identities remain explicit.

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
late host publication/replacement stays visible. Lifecycle owns attachment/ready
and shared cancellation identity; entry retains transport/audio/credit and synchronous
public/debug publication. Classic owns only its supplied canvas, never creates another player
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
