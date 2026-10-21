# Virtuoso Code Map (screen.js + routes.py)

## Entry wave6 owner reconciliation (2026-10-21; unfinished)

`core/segments.js` describes returned rolled cfg; `generation-types.js` separates
bass patterns/generators and resolved audio voices; `audio-profiles.js` returns its
actual complete defaults. `audio-graph.d.ts` distinguishes melodic carve from drum
shelf/compressor effects. `dom-ids.d.ts` lists only verified control metadata. Entry
form delegation guards only consumed structural properties before existing logic;
the source/Lab fail-first probe lives in `entry-safety.mjs`. Strict346→284 still
fails; source14,946, declarations491. No runtime module/extraction or host/judge change.

## Entry wave5 DOM reconciliation (2026-10-21; unfinished)

`eventValueElement` owns bounded LCD value checks; `eventClosest` narrows only the
listed generated widgets in `src/types/event-dom.d.ts`. Their source/Lab tests
exercise unsafe targets plus normal Enter/tempo and nested mixer clicks. DOM
selectors and generated IDs stay nullable; unrelated selectors retain native DOM
types. Chord/motif inputs now require only fields their call graph reads. Strict
entry501→346 still fails; source14,939, developer declarations473 lines. Untested
intermediate runtime changes were removed; no detector/scheduler edits retained.

## Historical entry wave4 safety reconciliation (2026-10-21; unfinished)

Optional RenderNote sustain, actual lifecycle EntryExercise and generic run bundle
contracts remove incompatible boundary assumptions. Jumping-Tab drawing passes one
explicit live context to its leaves; released resize/draw guards, once-read host
capability snapshots, absent Play binding and non-element library event handling
have fail-first source/Lab tests. Historical AST/statement pins normalize only exact
reviewed deltas; runtime music/audio/clock/API captures unchanged. Strict752→501,
entry14,916 (+15), declarations425 lines. No whole-entry or live-host pass.

## Entry typing wave3 (2026-10-21; unfinished)

`entry-data.d.ts` now describes complete EntryBundle, accompaniment member fields,
optional break/tail beats and proof/overview records. Authored cfg, host tuning/frame
data and internal progress writer contracts are separate dev declarations; storage
validation is not implied. Native mutable workouts/roles/tunings/themes are annotated
at their actual owners; no runtime import added. All313 implicit params and22/32
declaration/read diagnostics clear; strict entry **1,210→752**, still exits1. Entry
14,901 (+208), thirteen declarations405 lines. Runtime statement/API identity pins
unchanged; normal passing native/root checks still exclude entry.

## Entry typing wave2 (2026-10-21; unfinished)

`results-data.d.ts` owns internal run/score/felt/coach/share snapshot shapes;
`form-config.d.ts` keeps actual nullable form fields distinct from validated
generation inputs; `theme-data.d.ts` describes mutable authored visual recipes;
`plugin-globals.d.ts` describes existing shape/coach/keys/harness fields only.
Audio contracts now cover mutable drum/mixer records. DOM declaration includes
only exact form-scoped selectors plus normal dynamic fallback. Host power corrected
to verified setScreenAwake/Promise<void>. Runtime AST unchanged, entry14,693 (+173),
**1,210 strict errors** remain; passing native types are not a whole-entry pass.

## Developer-only entry typing foundation (2026-10-21)

`tsconfig.entry.json` checks the actual native browser entry with unchanged strict
settings; `scripts/typecheck-entry.mjs` groups ignored JSON diagnostics and exits
nonzero on errors. `src/types/` owns markup ID→nullable element contracts, optional
host/minigames/desktop/verifier subsets, entry chart/config, judgment-window records,
audio graph/sample/cache and vendored WAF consumer types. No runtime imports added.
Entry annotations preserve executable AST/publication identities; **14,520** lines
(+155), **1,647** remaining diagnostics. This is not full-entry completion or an
extraction. Normal typecheck covers the existing 81 native modules, excluding entry.

## Unused private declarations retired (2026-10-21)

Whole-entry and first-party lint/TypeScript-unused audit removes `SEQUENCE_LABELS`,
`PT_WIN_LATE`, `fretboardSystemLabel` and its sole dependency `FRETBOARD_SYSTEM_LABELS`,
private `inWindow`, `pianoPathwayActive`, `proofCardText`, dead ruler `usableW`, card
`FAINT` and the inaccessible retired `_ndCardApi`/`_resultsCardData`/`_virCardOverlay`.
No HTML/backend/public/debug/dynamic/test caller exists; the last three were dormant
proposal code, not supported host adapters. Owned card rendering, shared save-directory
key/routes and explicit Piano API selection remain. Guide-tone `keyPc` loses only
the binding: original accessor expression stays at the same evaluation position.
Entry **14,365** physical lines (−80); native graph/API identities unchanged.
Historical sections below retain their dated counts, not the current debt inventory.

## Run transport owner (2026-10-21)

| State / dependencies | Writers and readers |
| --- | --- |
| Playing/paused, pause duration, cursor/start, wall/audio anchors, resume runway | `shell/run-transport.js` private plain state; begin/pause/resume/stop/seek/anchor/advance/phase-carry methods are sole writers. Pure domain computes existing clock/runway math. Entry scheduler, draw, pitch/host-target paths, presentation, progress and debug read live getters. |
| Committed loop / authoring A-B / wrap count | Owner methods serve direct API, keys, ruler/overview gestures, section loop, reset, tick wraps and Jam seam swap. Entry validates public endpoints and emits existing host events, preserving authoring versus committed-loop distinction. |
| Pending Play/Workout/Jam | `runStart` captures lifecycle ordinal, full bundle identity and exact request object; waits readiness, warms voices, checks ownership, invokes bounded before-start hook, starts. Same-identity Play joins. Stop/new view/mode/tuning/navigation invalidate the existing lifecycle ordinal. No parallel cancellation counter. |
| Audio/targets/verdicts/credit | Entry retains gesture AudioContext/sink, synthesis/backing/chunk horizon, host note_detect arm/target/drain, exact credit consumption and run-bound selected density/tier, completion/progress stores. No new grader/timing/level gate. |
| Backend teardown and UI | Three raw audio/tracker/RAF teardown copies share `stopRunAudio`; session closure and cursor/pause/pre-roll ordering stay at their original semantic boundaries. Workout's button-only launch object is not a transport cancellation ordinal. |

Direct entry bindings **124→125**: actual `createRunTransport` caller, no barrel.
Entry **14,541→14,445**, two modules **177** physical lines, combined **+81**;
**81** native JS modules plus entry (all-source DAG **82**), entry DAG **79**, Lab **563**
runtime inventory files. Two readiness/voice approval implementations → one;
single/Workout Play branches share approval; three raw teardown copies → one;
two loop phase-carry writer pairs → one; stop state tuples share owner transitions.
Historical statement pins normalize live reads only; audited transition writers
have independent dirty-before trace/new semantic tests, not regenerated history.

HOST CHECK reused: **2026-10-20**, host
`eef58c88c315b59375926bbfc8740cd18cb958f9`. **BUILD** existing contained Virtuoso
transport; **BORROW** host note_detect verdicts 1:1, public navigation and renderer
factories; no new capability or host inspection. Flip only if a documented contained
transport contract becomes available. RUNNING HOST remains unavailable: no audio
latency, judging timing or Windows DI certification claimed.

## Renderer attachment/readiness owner (2026-10-21)

QA2 follow-up: entry `rendererReadyForPlay` catches only readiness failure, reports
only for its current ordinal and returns before voice warming/start. It does not
blanket-catch sink/audio/generation errors. Lifecycle assimilates and observes
candidate readiness immediately after handle publication, before draw validation
or init/getter access, then awaits the observed promise after init. Getter/validation
failure still rejects and destroys exactly once. Current source/Lab single/Workout
Play rejection and old-after-new-Play status/resource tests plus five malformed
borrowed cases reproduce the failures independently. Current physical entry
**14,541**, owner **264**, combined **+148** versus pre-owner14,657; bindings124.

Writer/read audit before extraction:

| State | Writers / readers after extraction |
| --- | --- |
| Active handle, candidate, supplied canvas, ready promise | `shell/renderer-lifecycle.js`: resolve → replace canvas → factory → publish candidate → init → await ready → identity check → mode/resize → commit. Entry draw/tick/theme/debug read the live getter, never a mirror. |
| Renderer bundle | Lifecycle creates the highway-only chord-free/bgReactive view; attach and Jam seam swap share `setBundle`. Entry retains full `activeBundle` for audio, note_detect targets, grading and progress. |
| Desired / actual view | Lifecycle records request intent separately from accepted view, syncs view classes/dropdown and preserves legacy fallback cfg/form/storage writes. Existing fallback survives tempo regeneration; this does not change preference policy. |
| Playback operation ordinal | Lifecycle is the single monotonic source: generation, attachment, explicit Stop, selection reset and SPA leave invalidate it. Entry captures `currentRequest` and uses `isCurrentRequest` across sink, ready and voice awaits. No separate attachment/generation booleans or A→B→A equality by view. |
| Full bundle / last exercise | Entry publishes summary/lastExercise before attachment; scene hook retains stop → Play labels → bundle → cursor/loop reset → mixer → fretboard order. Current file failure clears the scene while selection keeps variant intent. Stale completion cannot reset a newer loop/cursor. |
| Transport / audio clock / run | Entry owns playing/paused, session/wake lock, audio nodes, scheduling anchors, RAF tick, loop points, note_detect and credit. `onBeforeAttach` stops these at the existing boundary, not from a renderer destroy callback. |
| File request / visit | Selection still owns bounded fetch, catalog/variant identity and DOM/visit guards; its stop hook invalidates lifecycle before cfg validation. Catalog timeout remains 10 seconds; borrowed factory registration polling remains 3 seconds after script load. |
| Resize / teardown | Lifecycle owns renderer reset/exact-once WeakSet destroy, debounced window listener and layout transition/next-frame RAF cancellation. Renderer factories retain their own supplied-canvas synchronous resize listeners; lifecycle redraw follows after 120 ms. Confirmed SPA leave unmounts; return mounts once. Canceled unload/BFCache retains listeners. |

```text
selection intent ──stop/reset──► lifecycle operation ordinal
entry generation ──attach─────► lifecycle candidate / readiness / resize
  scene hook ◄───────────────── stop + full bundle/cursor/mixer/fretboard
  commit hook ◄──────────────── ready/current → status + draw
entry sink / voices ──────────► isCurrentRequest → contained start
entry draw/tick/debug ─────────► live renderer / renderer-bundle getters
SPA leave ────────────────────► stop transport; unmount/reset lifecycle
```

Native controller has explicit local factory dependencies and five semantic
edges (before attach, scene preparation, committed renderer, layout redraw,
window-overlay measurement), plus a live playing predicate; no generic helper
bag, global state module or entry import. Public40/debug91 exposed expressions
remain identical except the debug active-handle getter. Factory registration,
host window, canvas, lefty/theme and DOM preferences remain call-time/live.
Initial generation ResizeObserver, fullscreen UI, transport, mode/storage/L1
persistence remain entry responsibilities; no beforeunload renderer teardown.

Two explicit safety deltas, not move-only claims: a fail-first real-entry test
proved Play could start while a published candidate was still awaiting ready;
Play now awaits the owner's pending attachment before voice warming/start.
Readiness created by a throwing init is observed to prevent an unhandled rejection.
Current rejection still propagates; stale rejection returns false and destroys
only its candidate. Direct tests capture the unhandled-rejection channel.

Physical entry **14,657→14,530 (−127)**; controller **256**, combined **+129**,
including strict contracts/resource guards, not a source-size win. Bindings
**124→124**: selection import removed, lifecycle import added (no barrel).
Two chord-free derivations → one; three host-fit resize implementations → one;
attachment/generation guard tuples → one semantic ordinal predicate. Controller
complexity is explicit: attachment transaction, request gate and layout resources,
not merely a thin destroy wrapper. Transport/progress extraction remains deferred.

HOST CHECK reused, not a new running-host inspection: **2026-10-20** host
`eef58c88c315b59375926bbfc8740cd18cb958f9`; **BORROW** `feedBackViz_*` preferred,
supported legacy `slopsmithViz_*`, factory reads at call time; **MIRROR** local
fallback renderers. Host private 2D stays local until a documented public bundle
factory exists. No new standalone API/player/WebSocket/global setViz/host patch.
Installed 0.2.13-lab.1 smoke is separate from user-unverified local 0.2.14.

## Joint practice selection and loaded-practice owner (2026-10-21)

Before extraction, writers were inventoried across initial/saved mode selection,
direct rung/Position/tier/modal/downshift actions, Custom file selection/load/Next,
type exit, tuning recovery, config/share application, generation/renderer stop,
Workout launch and navigation/reentry. Selection no longer aliases entry variables.

| Owner | State and flow |
| --- | --- |
| `core/practice-selection.js` (44 LOC) | Plain next selection; new rung resets Slow, same rung preserves tier; modulo variation; one ordered tier field realization; live mutable applicability + offerable predicate |
| `shell/practice-selection.js` (375 LOC) | Rung/variation/tier/band; pending first lesson; file/variant/request/visit/catalog; mode storage and choice, catalog UI, fixed fields, scale/shape/anchor lock and owned listener teardown |
| entry | L1/anchor adaptation, selected cfg/preset application and mode panels; generation/attachment/ready/voices/playback/clock/credit/progress/host shared persistence |

Five semantic hooks (`getContext`, `applySelectedConfig`, `changeModeView`,
`stopAndInvalidatePlayback`, `regenerateSelectedConfig`) plus the separate
presentation dependency. Band metadata is passed as its live ordinary reference;
PATHWAYS hydration remains authoritative. No cyclic state facade/helper bag or
general state-machine framework. Tiny existing entry selection/band adapters
retain lexical callers; public40/debug91 synchronous helpers unchanged.

One tier policy now serves pathway apply, buttons, results/downshift CTAs and debug
adapter. One clear/reset path distinguishes preserving cursor, clearing cursor and
clearing cursor+loop; one file request predicate guards success AND errors with
identity/visit/current DOM. Renderer stop still cancels pending file loads at its
original boundary. Failed replacement clears the prior file, as before. No autoplay.
805 untouched statements pin normalized access only; 794 historical-order statements
retain the older display normalization. Old source hash and full temp capture are
independent, not regenerated fixtures. All 151 static pathways, 24 Warmup combinations,
40 Custom configs and seven setups remain covered; real entry has three listener
actor cycles plus canceled page events, mismatch recovery and ready rejection.

Physical entry **15,196→14,657 (−539)**; new owners **419** combined, existing
loader/catalog **+30** strict contracts; combined **−90**. Imports **127→124**;
shape helpers still exposed synchronously remain honest entry imports. Dead no-op
`syncCagedButtonStrip` has no caller/HTML/global/debug/dynamic reference and is removed.
Progress/modal tier display, storage and transport/attachment ownership remain
deferred; this is not a fully thin entry. Native entry DAG 76; all source 79.
HOST CHECK reused: 2026-10-20 `eef58c88c315b59375926bbfc8740cd18cb958f9`,
BORROW public navigation/settings/meta-DB; MIRROR private inner forms; flip only
on a documented reusable public controller. No new host version/capability check.
Local 0.2.14 user-unverified; installed 0.2.13 smoke is separate evidence.

## Practice presentation controller (2026-10-21)

`shell/practice-presentation.js` owns goal-card recognition/disclosure, live authored
hint, cue/backing/tuning/PB/supports lines, Position/variation readout, START labels,
content description and Custom file prose/variant option display. Entry callers
use its methods directly; `positionStepperIsShapeMode` is shared with the original
config-changing step handler. One typed view-scoped `getCurrentPractice` snapshot
supplies cfg, selection indices/band, plain progress affordance and saved instrument
readouts. Start/Position/file display never reads cfg/progress stores. No listeners,
IO at import/construction, state cache, metadata mutation or generation authority.
Passive PATHWAYS and tuning tables are live mutable identities, not cloned snapshots.
Authored strings use textContent; known tier HTML remains in entry with its listeners.
The old `displayPracticeProse` test helper moves to the actual presentation owner.

Entry retains mode/selection/eligibility, fixed-field disabling, rung/variant/Next
handlers, catalog/load cancellation, instrument store, progress and ready/audio
lifecycle. State reads stay with their owner; UI does not create progress nodes.
Physical entry 15,443→15,196 (−247), new owner 222, old file owner 60→55; combined
−30. Import bindings 128→127: remove cue selector/catalog selection/prose dependencies,
add controller/shared shape predicate. Optional line show/hide branches consolidate;
three potentially repeated cfg reads become one goal snapshot.
HOST CHECK reused: 2026-10-20 host `eef58c88c315b59375926bbfc8740cd18cb958f9`;
BORROW existing public navigation/settings/meta-DB; MIRROR private forms. No general
component SDK/private helper import or Escape handling. Flip on documented public
reusable controller API. This is untested local 0.2.14, not installed 0.2.13 smoke.

## Practice configuration and preset recall (2026-10-21)

| Owner | Responsibility |
| --- | --- |
| `shell/practice-config.js` | Sole live `readConfig`, associated silent field writes, advanced disabling, ordered cfg apply; explicit instrument/profile/completion boundaries, no controller bag |
| `core/practice-form-defaults.js` | Ordered anti-leak prewrites; inherited defaults remain readable, own-key null/false/zero overlays remain caller ordered |
| `shell/practice-presets.js` | Existing GET/meta-DB recall, compatibility cache identity, one shared option append, Custom select listener, latest-request/visit/DOM ownership |
| `content/form-cues.js` | Mutable guitar/bass cue vocabulary and rung/band candidates; catalog validation shares the exact object |
| `core/practice-form-cue.js` | Explicit pathway/cfg/tier/band cue priority and rotation; no detection/DOM/IO |

Entry retains pending catalog/file cancellation before config application, L1/host
instrument adaptation, eligibility/shape display, sample warmup and contained
generation/transport. Recall never auto-plays or auto-applies fetched presets.
Save-preset was explicitly cut in `screen.html` (2026-06-02); the unreachable
private writer has no HTML/global/public/debug/dynamic caller and is now removed.
Workout CRUD and host shared fields/URLs are unchanged. Parent QA should review
the separately identified async guard improvement: old late GET completion could
append into an abandoned visit; new real-entry/direct regressions require no write.

Physical entry **15,881→15,443 (−438)**; five new owners **346** combined
(form 171, presets 69, defaults 24, cue policy 31, vocabulary 51),
entry-plus-owners **−92**. Imports **123→128**: remove two shape/default helpers
whose real callers moved, add four form bindings, one controller and two cue
bindings. Existing public/debug identity dependencies stay explicit. Two option
construction implementations become one (seven duplicate construction lines
removed); configuration comments/history are not counted as duplicate algorithms.

HOST CHECK reused: host `eef58c88c315b59375926bbfc8740cd18cb958f9`,
2026-10-20; BORROW existing navigation/settings/meta-DB/public factories;
MIRROR private inner forms. No new general SDK/modal/private host API or Escape
handling. Flip only on a documented reusable controller API; installed host
version remains unknown. Local 0.2.14 is not the user-reported 0.2.13 smoke target.

## Tuning settings controller (2026-10-21)

`shell/tuning-settings.js` owns saved cache, GET/POST meta-DB interaction,
ordered preset groups/first-match selection, canonical versus hidden CSV writes,
custom-input validation/seeding/commit and visit listener removers. Nine former
entry functions/state declarations are removed, not wrapped. Both original bind
clusters remain separate (`mount`, `mountDisplay`) to preserve dispatch order.
Dynamic replacement invalidates old handlers; SPA exit unmounts, return mounts
once; canceled unload/pagehide retains them. Late cache completion reads current
family/count/host catalog, never declares L1/launches audio, and cannot install
input listeners while inactive. Five hooks: live host entries, player declaration,
custom-change recovery, selection completion, Setup display. Entry keeps durable
L1/host writes, file/pathway eligibility, readiness/player and `readConfig`.
Core still consumes plain cfg, no second DOM→cfg funnel.

Three option loops consolidate to one, preserving duplicate-host suppression,
built-in→host→saved priority, saved empty arrays and numeric CSV conversion.
Physical entry 16,128→15,881; owner 194; combined −53. Imports 124→123:
parseNoteName/midiToNoteName lose actual entry callers (historical test probes
import explicitly); createTuningSettings adds one real binding. Existing API
identity imports elsewhere remain deliberately unchanged, not barrel-hidden.

HOST CHECK reused (no new capability): host `eef58c88c315b59375926bbfc8740cd18cb958f9`,
2026-10-20; BORROW existing navigation/settings/meta-DB and preferred `feedBack*`
public accessors with legacy fallback; MIRROR private inner forms. No generic
public form/modal SDK found; flip when a documented reusable controller API
appears. No Escape handling, private host modal or public API monkey-patch.

## Workout draft controller (2026-10-20)

`src/shell/workout-editor.js` (324 LOC) owns draft, draft ID, selected starter,
dirty bit, drag index and listener removers. `select` preserves same-ID edits;
`replace` deep-clones starter/routine input. Structural edits preserve draft/array
aliases; refresh replaces refs/session while preserving inline aliases. Raw card
indexes retain unresolved-template holes. `mount('timeline'|'options')` runs at
the original bind positions; unmount on SPA screen leave, remount on return with
visit guards and current document lookup. No storage access or import-time DOM.
Browser beforeunload/pagehide retain listeners for canceled unload/BFCache;
destroyed documents clean themselves. No pageshow remount or inactive rebinding.
One preview callback owns the transport edge; entry guards the post-await jump.

`core/workout-config.js` (24 LOC) materializes refs, matches instrument families,
patches audio/tuning/count-in and applies length last, returning ordinary plain
cfg. Playback never receives controller state. `shell/workout-display.js` (14 LOC)
owns shared mutable kind labels/colors used by cards AND remaining entry displays.
Entry browse/routine IO reads `draft` but writes through `replace/select/add`;
launch guards/readiness/audio/clock/credit remain entry-owned, not injected back.
`refreshWorkout` and `applyLengthPreset` are now entry-imported solely for the
existing synchronous public function identities; materializeSegment/rollSegment/
segmentEstDuration still have real browse/guard callers. Import bindings 122→124
(remove lengthPresetSec; add controller + two display tables), not net reduction.
Entry 16,465→16,126; owners 362, combined +23. No private function deleted based
on Knip; repeated edit completion and voice labels consolidated during move.

HOST CHECK reused: 2026-10-20 host `eef58c88c315b59375926bbfc8740cd18cb958f9`,
BORROW existing navigation/meta-DB mounting/public renderer factories; MIRROR
private inner forms. No generic public component/modal helpers found; flip only
when a documented reusable form/controller API appears. Never capture Escape.

> The per-section walkthrough of Virtuoso's two code files. CLAUDE.md / AGENTS.md
> point here instead of carrying this detail in always-loaded context. Read this
> before working inside `screen.js` or `routes.py`. For host-integration design
> see `docs/plugin/architecture.md`; for the exercise/chart JSON schema see
> `docs/plugin/exercise-schema.md`.

## screen.js structure

### Current owned renderer modules

2026-10-20 move-only integration batch: entry **17,758 → 17,418 (−340)**;
four new modules **399 LOC**, combined **+59** (contracts/JSDoc, not code deletion).
Follow-up local Tab/Notation: entry **17,418 → 16,465 (−953)**; three owners
**1,044 LOC**, existing contracts **+43**, combined **+134**. Seven renderer files
then totaled **1,486 LOC**; historical move-only evidence, not current byte identity.
Implementation-quality follow-up: Tab 379, Notation 571, hand-marks 45 and
notation-pitch 56; subsystem **1,568 LOC**, **+82** combined (not net code deletion).
Entry stays 16,465; old resolveKeySig/beamedKeys and duplicate mark policy removed.

| Owner | API / state / dependencies |
| --- | --- |
| `src/shell/renderers/host-factories.js` | `hostBus`, `hostMinigames`, `hostDesktop`, `vizFactoryFor`, `loadScriptOnce`, `borrowHostViz`; call-time preferred/legacy reads, shared script DOM-ID cache, 50 ms/3 s polling, error removal and contract-drift diagnostic; no imports/initialization IO |
| `src/shell/renderers/selection.js` | `selectRendererFactory(kind, builtin, tab, notation)`; explicit uninvoked local factory dependencies, exact labels/3D fallback kind; imports host-factories + Classic only |
| `src/shell/renderers/classic-2d.js` | `makeClassic2DHighwayRenderer()` → `init/draw/resize/destroy`; per-instance canvas/context, size, fret smoothing and last chart time; projection/anchors/rails/beats/strings/sustains/gems/readable lefty text; no imports/host factory/player; context passed explicitly to paint helpers |
| `src/shell/renderers/renderer-types.js` | Developer-only JSDoc bundle/note/renderer/factory/selection contracts; no runtime values; selective strict DOM checkJs |
| `src/shell/renderers/tab.js` | `makeBuiltin2DTabRenderer(preferences)`; Tab layout/string labels, bars/chords/sections, separate fret/verdict and technique paint, sustains/HOPO, renderer-owned mark placement; cached ordered note references; size/DPR-change canvas/listener; 379 LOC |
| `src/shell/renderers/notation.js` | `makeBuiltin2DNotationRenderer(preferences)`; clef/signature/ledger/head/stem/flag/beam/rest engraving and mark placement; visible identity-based beam suppression; init-time key/beat/beam caches + compatibility setMode; size/DPR-change canvas/listener; 571 LOC |
| `src/shell/renderers/display-policy.js` | Mutable light/dark palettes and lesson sets, chartBeatSeconds/stringLabelForMidi/bendLabel/handMarkLessonMode/rhGlyph; shell display-only, imports pitch only; 75 LOC |
| `src/shell/renderers/hand-marks.js` | Pure ordered-note and visible candidate/spacing/simile thinning policy shared by Tab/Notation; imports display-policy + tuning; Tab omits fg0, Notation retains it; 45 LOC |
| `src/shell/renderers/notation-pitch.js` | Pure major/minor/modal relative-parent spelling, bounded standard signatures and tonic-degree staff spelling; imports pitch + intervals; no generation mutation or external library; 56 LOC |

**HOST CHECK — 2026-10-20, read-only host HEAD
`eef58c88c315b59375926bbfc8740cd18cb958f9`:** existing renderer reuse, no new
capability. Host `static/js/viz.js:217,370,473–490` registers preferred factories
and selects the **main player**; do not call its `setViz`. Host
`plugins/highway_3d/screen.js:16605` publishes `feedBackViz_highway_3d`;
Jumping Tab/Piano source folders absent in this checkout, optional load failure
retained. `static/highway.js:72,641` keeps Classic 2D private in `createHighway`.
Verdict **BORROW** existing registered factories/navigation/theme where already
used; **MIRROR** existing local Classic/Tab/Notation/controls. Flip Classic to
BORROW only when a standalone bundle-driven `feedBackViz_highway_2d` publishes;
no speculative fetch, private helper import or public host API patch. Generic
modal/tab/dropdown SDK was not found in the prior host sweep; no UI redesign.

**Deferred joint ownership:** entry `resolveRendererFactory` retains its debug
probe, `attachRenderer` writes `activeBundle`, `rendererBundle`, view/preferences
and owns resolver/ready generation checks and canvas replacement;
`stopRenderer` writes attach identity/play/RAF and tears down audio/scoring/wake
state; `destroyRenderer` owns exactly-once WeakSet destruction. Playback/voice
warming, hot-swap, file-tier readiness and navigation have additional writers.
These must move together only after a full writer inventory. Entry alone initializes
and writes `currentRenderTheme` (startup + `setRenderTheme`, theme-button reader);
`handMarksOn` reads persisted storage per frame (toggle writes stay entry).
Both pass live accessors, never snapshots. Mutable palettes/lesson sets have no
current runtime writers but retain ordinary shared identity. Tab HOPO pairs and
Notation key/clef/beat/beam caches write only at original init; draw refreshes theme,
window/layout/size, setMode writes only Notation mode. Destroy removes only its own
resize listener and clears canvas/context; no rAF/document/host/global listener owner.
There are no pointer/zoom controls in these local renderers. No callback bag/state.js.
Notation's combined/tab modes remain compatibility API; deletion deferred. Keys
are exact cfg aliases (the UI supplies sharp pitch-class names, authored cfg may
retain Db/Cb). Standard major parents preserve the requested letter where possible;
theoretical >7 signatures normalize to the least-accidental standard enharmonic.
Natural/harmonic/melodic minor use relative-major signatures; diatonic modes use
letter-relative major parents. Non-diatonic blueprint offsets and pentatonic/blues
tonic signatures retain prior conventions; this is not full engraving redesign.
Seven-degree staff spelling preserves single accidentals; double accidentals,
chromatic contextual spelling and full rest/dotted/mixed-beam engraving remain
limitations. In-place time/order mutation requires init; beam/HOPO caches still
require init for chart replacement. Mark ordering refreshes on note-array identity
change (retaining canvas-only init/draw compatibility); annotations and theme/
mark preference reads remain live.

### Current owned generation modules

Unpublished 0.2.14 cleanup: `core/chart-assembly.js` owns shared timed chord/
hand-shape cloning with block template-ID offsets (ladder, session, key cycle,
Jam). `backing.js` supplies ordered `buildAccompanimentEvents` to those four
paths plus motif; swing/filtering stays caller-owned. `count-in.js` now depends
on chart-grid and owns incoming/wrap breath emission. Tiling deliberately does
not use block geometry: repeated cells retain IDs and shared template arrays.
Existing cfg/chart/note JSDoc contracts are reused; no new contract module.

Both synchronous generators now live outside entry: `exercise.js` and
`session.js`. Latest entry **18,813 → 17,758**; nine new owners **1,110 LOC**
(largest 439; combined source +55 including imports/JSDoc).

| Session owner | Contents / dependencies |
| --- | --- |
| `content/segments.js` | All 65 mutable templates, roles/bands; passive, no executable imports/guards |
| `core/config-defaults.js` | Instrument/count defaults, cfg shape resolution and palette merge; shapes/pitch/palettes |
| `core/count-in.js` | Incoming subdivision preview grid; plain meter/subdivision only |
| `core/segments.js` | Roll/materialize/data-only refresh, roles/competencies/estimated durations; content/defaults/timing |
| `core/workout-length.js` | Pure add-arc/length dosing/context transposition; segments/content |
| `core/session-config.js` | Session/segment defaults, CSV tuning length guards/shape resolution; tuning/timing/defaults |
| `core/session-chart.js` | BPM ladder, incoming/wrap breaks, whole-target tiling, block-local backing/timeline/grid offsets |
| `core/session.js` | cfg→`{version,session,chart}` and built-in identity metadata; chart/config/passive workouts |
| `core/session-types.js` | Strict developer-only authored segment/session contracts; no runtime initialization |

`screen.js` now imports native **`exercise.js → generateExercise(cfg)`**:
complete synchronous cfg→`{version,session,chart}` generation, including all 40
dispatch choices and authored-file adapter. Entry **22,083 → 18,813** this batch.
`exercise-dispatch.js` owns all builder dispatch; `key-cycle.js` and `jam-chart.js`
assemble local timing/backing/timeline per key/pass; `chart-tiling.js` repeats
whole cells without changing original ids/tail duration. `style-palettes.js`
owns mutable style/progression-label data, shared with entry UI/public refs.

| New lower owner | Contents / direct dependencies |
| --- | --- |
| `strum-grips.js` | Power/CAGED/extended grip selection and mutable shapes; tuning/harmony/chord positions |
| `builders/strum.js` | Strum cells/emission and PIMA fingerstyle; grips/timing/notes/harmony |
| `motif.js` | Mutable motif cells and pitch/window/stack placement; timeline/positions/theory |
| `builders/motif.js` | Full motif call/response chart with its own harmony/backing; motif/backing/drums/feel |
| `chord-timeline.js` | Functional/Roman labels, shared chord slots, anticipation/offset; harmony/timing/theory |
| `voicing.js` | Register, avoid-note, guide-tone selection and voice-leading; dependency-free |
| `arrangement.js` | Mutable recipes and pure density/feel resolution; dependency-free |
| `audio-profiles.js` | Mutable profile/family data and pure voice metadata resolution—not audio IO |
| `comp-cells.js` | Mutable cells, banjo drones, keyboard comp, hit emission; arrangement/voicing/timing/RNG |
| `bass-figures.js` | Mutable figures, walking/Motown/pattern emission; arrangement/comp/voicing |
| `drum-grooves.js` | Mutable grooves/fills, humanization/choking/generic meters; arrangement/profiles/RNG |
| `backing.js` | Track desugaring/full accompaniment/legacy boogie; lower recipes/figures/timeline/voicing |
| `feel.js` | Mutable swing/lean tables and pure shared timing transformations; arrangement |
| `generation-types.js` | Developer-only cfg/chart/event contracts, no runtime initialization |

**Remaining entry ownership:** `makeBundle`, DOM `readConfig`, live-tier run-target
policy, Workout draft/edit/refresh UI handlers/stores, launch/readiness/cache and
contained playback/render/audio/progress lifecycle. Pure `refreshWorkout` is not
its UI controller. No shared state module or callback factory was introduced.
Guards remain entry-side at their original order, not import-time validation.
All native core/content JS is in checkJs; shell and the IIFE are not.

The following table describes the preceding foundation owners (counts historical).

| Module under `src/core/` | Owner / dependencies |
| --- | --- |
| `random.js` | FNV seed identity, per-track Mulberry32 streams, shuffle; no imports |
| `sequence.js` | Mutable patterns/annotation whitelist, direction/repetition/reflection, exact cycle emission; random/timing/notes |
| `positions.js` | Scale positions, shape→position adapter, no-unison and in-place bass box fingers; pitch/scale/tuning |
| `chart-grid.js` | Metric beats/group accents and fret anchors; timing |
| `harmony.js` | Mutable progressions/overrides, chord depth, memoized synthetic qualities, functional roots/substitutions/names; pitch/scale/chord theory |
| `chord-positions.js` | CAGED chord geometry/root anchors/templates, chord-tone/chord-scale positions, coverage-first sweeps/turnarounds; harmony/shapes/positions/tuning/theory |
| `builders/scale.js` | Scale/Connect chord-scale, thirds/sixths/dyads, skipping/shift/displacement, bebop/hybrid/triadic/pentatonic/octave lines |
| `builders/arpeggio.js` | Arpeggios/CAGED shape runs, sweep, enclosures and inversions |
| `builders/technique.js` | Spider, bending, legato, vibrato, call/response, tremolo, herta, pulse, pedal point |
| `builders/tapping.js` | Tap/pull articulation and complete chord-tone cascade |
| `builders/bass.js` | Root grip/low fifth, walking approaches/line, right-hand motor, root–5–8, octave/dead/slap grooves |
| `builders/guide-tones.js` | Voice-led guide tones and shell lines |
| `builders/pedal-riff.js` | Group-start power chords with tonic pedal chugs; tuning/timing/harmony/notes |
| `builders/chromatic.js` | Existing chromatic builder/mutable tables; tuning/timing/notes/stroke policy |

Builders import explicit lower core dependencies, not entry callbacks or shared
state. The original plain cfg and schema remain unchanged; no new public API.
This batch moves 36 exercise builders/prerequisites into thirteen modules (2,759
LOC, largest 422), reducing entry **24,657 → 22,083** without changing outputs.

Those previous dispatch/backing blockers are now resolved by the owners above.
`makeBundle` remains the first shell step; guards/publication retain entry order.

### Earlier extraction evidence (line counts below are historical)

`src/core/builders/chromatic.js` owns `buildChromaticExercise` and both mutable
chromatic tables (71 lines). Its DAG uses tuning/timing plus shared `notes.js`
(14) and `stroke-policy.js` (164); whole-cycle rounding joins timing (+11).
No RNG/generic fingering/chord dependency. Entry **24,875 → 24,657 (−218)**;
combined slice **+42**; HEAD 27,248 → 24,657 (**−2,591 combined dirty WIP**).
Custom/Workout still dispatch to the same builder; generated schema/annotations
remain unchanged. Dispatch, `makeBundle`, startup guards and other builders stay
in entry. Shared RNG/grid/fingering prerequisites remain candidates for later
bounded moves, not a giant dependency bag.

`src/core/fretboard-shapes.js` owns the WHOLE unified five-shape `CAGED_SHAPES`,
both cycles, seven `THREE_NPS_POSITION_DEFS` and 16 pure functions: pitch/degree/
finger helpers, CAGED/3NPS/Open resolution, dispatch, Open eligibility, order/cycle
and default shape. Imports only `scale-intervals.js`; ordinary mutable data and
same synchronous shape/debug pointers survive. Latest move: **25,261 → 24,875
(−386)** entry lines; module **417**, combined **+31**; HEAD 27,248 → 24,875
(**−2,373 combined dirty WIP**). Startup guards/publication, `resolveCurrentShape`,
`defaultFretboardSystem`, labels/DOM dropdown sync, current-family/cache/config
ownership and chord-template/voicing consumers remain in entry. The cfg adapter
is plain-data today but deliberately retained with form/session orchestration;
no callback bag/factory is needed. Chord-template leaves still require their
template-quality/theory dependencies, not the player or shared state.

`src/core/instrument-tuning.js` owns seven setups, 26 presets, seven setup mappings
and `openMidisForConfig`, `tuningOffsetsForConfig`, `isBassCfg`,
`hostStandardMidisFor`, `parseNoteName`, `midiToNoteName`. No imports/IO; exact
mutable data, low-string-first order, config precedence and edge behavior remain.
Latest slice: **25,396 → 25,261 (−135)** entry lines; module 152 lines,
entry + module **+17**; committed HEAD 27,248 → 25,261 (**−1,987 combined WIP**).
Setup controls, storage, preset fetch, host tuning caches and L1 adaptation remain
in entry; no state parameter bag or Python/backend migration.

`src/content/workouts.js` now owns the complete 25-entry `BUILT_IN_SESSIONS`
literal (339 lines, no imports/IO). Its fixed export shares the original mutable
data with the synchronous public API. String template refs still resolve against
the real entry's `SEGMENT_TEMPLATES`; helpers and clone-before-edit drafts remain
in the shell/entry. Latest move: **25,732 → 25,396 lines (−336)**;
versus committed HEAD 27,248: **−1,852 combined dirty WIP**.

File-practice prototype: `src/core/practice-files.js` owns strict parsing,
pure index validation and chart building; `src/shell/practice-files.js` owns
same-origin fetch/cache and text-only prose. Entry Custom load state passes the
parsed file to `generateExercise` before normal generation; existing transport
consumes the result. See [schema and limits](practice-files.md).

Only `chromatic_warmup` is now file-backed: `src/shell/practice-catalog.js`
loads the authoritative index/Markdown independently of normal DOM binding and hydrates its
mutable PATHWAYS entry. File metadata owns goal/cue references/tiers/variations;
existing band/edge registries retain progress IDs. The other 151 definitions live
in dependency-free `src/content/pathways.js`, exporting the same ordinary mutable
PATHWAYS object consumed by the entry and its debug reference. Warmup is absent
from that static registry and inserted by the existing catalog hydration. The
  shared Custom/Workout chromatic builder is imported from core; guards and hydration closures stay in the entry.

2026-10-20 move-only slice: moved the exact 1,648-line registry binding (comments
and values unchanged) into a 1,651-line passive module. `screen.js`: **27,378 →
25,732 lines (−1,646)**. Committed HEAD is 27,248 lines: combined dirty WIP is
**−1,516 overall**, including the preceding Markdown/reviewer work, not just this move.

`screen.js` is a native module entry retaining its strict IIFE during bottom-up extraction. It statically imports four dependency-free leaves: `src/core/pitch.js`, `scale-intervals.js`, `chord-theory.js` and `timing.js`; `plugin.json` opts into `scriptType:"module"`. Chord/diatonic tables and rhythm cells/meter helpers now live in those leaves; their consumers and startup guards remain in the entry. Leaves never import upward. See `docs/plugin/native-modules.md` for dependency map and running-host gates. Sections retain `§N` banners and §1–§15 TOC. This dated topical map is not in § order; verify names against source.

- **Constants** — `NOTE_NAMES`, `STRING_SETUPS`, `SCALE_INTERVALS`, `CHORD_FORMULAS`, `DIATONIC_QUALITIES`, `COMMON_PROGRESSIONS`, `SEQUENCE_PATTERNS`, `CHROMATIC_PATTERNS`, `RHYTHM_CELLS`, etc. `RHYTHM_CELLS` is the rhythm-cell table (gallop / dotted-snap / tresillo / clave as per-onset **beat**-arrays fed to `rhythmSteps`); a startup guard (`assertRhythmCellsValid`) rejects any cell that doesn't sum to whole beats (it would phase the bar). `CHORD_FORMULAS` carries the **full interval stack** for each quality (including extensions past the octave for 9/11/13 chords); it is intentionally complete so the voicing engine decides what to actually play.
- **`CAGED_SHAPES`** — unified source of truth for CAGED shape data. Contains `rootStringIdx`, `scaleFretSpanFromRoot`, and `chordTemplates` per quality. **Do not split this into separate tables.** (Historical note: a previous version had two diverged tables; they were unified on 2026-05-26.) Scale/arpeggio shapes are resolved by degree-driven, no-unison selection (`resolveCAGEDShape` and the run-seam dedupe), not naive fret-window blocks — see the no-unison constraint in CLAUDE.md Part 3.
- **`PATHWAYS`** — `src/content/pathways.js`: curated pathway definitions, `label`, `goal`, `scales[]`, `tempoTiers[]`, `base` config, and `vary[]` list for Next Variation cycling. No imports, IO, freezing or implicit validation; §2 retains storage/default boundaries.
- **`BUILT_IN_SESSIONS`** — `src/content/workouts.js`: **25 session presets**, twelve inline and thirteen template-ref sessions spanning goal × level × genre × instrument. `starter_arc` is the first/default entry and launch fallback. Template-ref slots materialize from `SEGMENT_TEMPLATES` at launch. `onLaunchSession` inherits the form's `stringSetup` only within the same instrument family; guitar-only techniques never land on bass. `_selectedStarterId` is the selection state; the Workout UI edits a cloned draft, never the imported registry.
- **Exercise builders** — `buildScaleExercise`, `buildChordScaleExercise`, `buildArpeggioExercise`, `buildSweepArpeggioExercise`, `buildChromaticExercise`, `buildGuideTonesExercise` return exercise objects. `buildChordScaleExercise` supports Park / Connect / Connect+approach (`chord_tone_emphasis` / `mode_of_moment`): Connect threads `prevMidi` through `connectStartIdx` to nearest guide tones, not root restarts. `smoke-connect.mjs` guards it. `chart.timeline` harmonic-rhythm infrastructure exists; remaining backing ideas are in `docs/plugin/design/backing-engine-roundtable.md`. `buildRhythmPulseExercise` (`rhythm_pulse`) strikes one palm-muted low-string pitch over a click with movable `pulseAccent`; see `docs/plugin/design/rhythm-ladder-roundtable.md` and the owning generator smoke.
- **`generateExercise(cfg)`** — single-exercise dispatch; routes to the correct builder based on `cfg.practiceType`.
- **Session builders** — `buildSegmentConfig`, `buildBpmLadderChart`, `buildSessionChart`, `generateSession`. `generateSession()` is parallel to `generateExercise()`; both return the same `{ version, session, chart }` shape so the downstream `makeBundle` path is unchanged.
- **Jazz harmony engine** — `chordQualityForDegree()` resolves quality/depth/override/context; `cfg.tritoneSub` supports `off` / `dominant_v` / `all_dominants`. `voiceChord(rootPc, intervals, opts)` turns interval stacks into playable voicings (voice count, register, drop/omit decisions). See `docs/theory/musicality-guardrails.md`.
- **`makeBundle(exercise)`** — wraps an exercise into a renderer-ready bundle.
- **Renderer factory system** — `resolveRendererFactory(kind)` delegates to the native lifecycle/selection owners and borrows preferred/legacy host factories with local fallbacks. Choices remain `highway_3d`, `builtin_2d` (Jumping Tab), `tab_2d`, `notation_2d`, and explicitly requested `piano_roll`. Piano's authored button remains `hidden`+`disabled`; the unused private false predicate was never a runtime gate and is retired. Renderer preference, extended-string fallback and contained lifecycle remain unchanged.
- **Built-in renderers** — `makeBuiltin2DRenderer`, `makeBuiltin2DTabRenderer`, `makeBuiltin2DNotationRenderer`, plus their draw helpers, driving `#virtuoso-canvas`. Note spacing is **time-linear** (`xForDt(dt)` maps a note's time-offset from the playhead linearly to x — constant-speed scroll). The visible window (`AHEAD`/`BEHIND`, set per-draw) is **beat-relative** via `chartBeatSeconds(bundle)` (≈6.8 beats across the view, clamped), so note density stays comfortable/consistent across tempos instead of cramming at fast BPM; it's constant within a chart so the scroll speed is unchanged.
- **Live fretboard strip** — `drawFretboardFrame()` (+ `fretboardActiveNotes`, `fretboardSyncRange`, `fretboardStringCount`) draws a horizontal neck diagram on `#virtuoso-fretboard` (docked under the render-host). It draws the exercise's whole pattern (`fbPattern`, unique string/fret positions) as **hollow circles**, and notes sounding within ~80ms of the playhead **glow filled** on top. The neck is **zoomed to the pattern's fret window** (`fbFretLo`/`fbFretHi`, ±1 fret with a min span) so the shape fills/centres the strip rather than floating on a full neck. Ported/generalised from the host Fretboard View plugin; any string count. Called from `drawOnce()` each frame, renderer-independently (early-returns when its canvas is hidden) — so it works under any active renderer. **Offered on every stringed-instrument view: 3D Highway, Jumping Tab (`builtin_2d`), Tab, and Notation** — gated by the `.virtuoso-fb-capable` root class (set in `syncViewSwitcher`) AND a user toggle (`.virtuoso-fb-on`, button `#virtuoso-fretboard-toggle`, persisted in `localStorage['virtuoso.fretboard']`, default off, `syncFretboardUI()`). Always hidden only for the Piano instrument (`.virtuoso-piano-instrument … !important`).
- **Exercise title** — `exerciseTitle(cfg)` sets `bundle.songInfo.title` to the descriptive name (e.g. "C minor pentatonic"; session name for sessions). Each renderer draws this as its own in-canvas header in its native style (the built-in Tab/Notation `drawHud` draw title-only — no in-canvas timer; that lives in the HUD).
- **Player HUD** — `#virtuoso-hud` overlay floating over the highway: time on the right (single timer, all views), and a title on the left **only for 3D Highway** (`.virtuoso-hud-title-on`, set in `syncViewSwitcher`) since every other renderer draws the title in-canvas. Time set in `syncTransportTime()`, title in `syncTransport()`.
- **Audio engine (§14 — the largest single section, ~1,700 lines)** — a Web Audio graph built by `ensureAudioBus(ctx)`: **per-track buses → a master safety limiter** (a `DynamicsCompressor` that guards against stacked-note peaks for safe, normalized output — no clipping) → destination; grab a per-track sub-bus (notes / harmony / click / bass / drums) with `trackBus(ctx, name)`. This bus/limiter layer landed in the recent audio pass (see git log + ROADMAP audio handoff). **Instrument voices**: sample-based via **WebAudioFont** (`wafPlayer`, self-hosted under `static/wafonts/`, served by the `/wafont` route) on the `engine:'sample'` path, otherwise the synthesized **oscillator** voice. `AUDIO_PROFILES` maps a genre/style → `{ family, harmony:{engine,tone,level}, brightness }` (families: clean / acoustic / distorted / electronic); the resolver applies profile → family → `GLOBAL_AUDIO_DEFAULT`, with the **brightness slider** overriding. The **distorted family's NAM amp-model + cab IR chain** (`/nam` + `/ir` routes; NAM *engine* borrowed from the host `nam_tone` plugin at runtime, not bundled) is **in progress**. **Drums (Phase D, shipped — `a67ec29`/`b6504c6`):** pitch-less `role:'drums'` backing events (`buildDrumEvents`, odd-meter-aware via `buildGenericDrumGroove`) play on their own **drums bus compressed *before* the master limiter**, voiced by `scheduleDrumHit` → `resolveDrumKit` (sampled FluidR3 GM one-shots via `wafDrumVoice`, with a synth-808/909 fallback). §14 also owns the playback clock (`currentPracticeTime`, RAF `tick`), count-in clicks, the metronome, and note scheduling. Lanes: `sound-design-architect` (mix/aesthetics) + `audio-engine-architect` (sourcing method).
- **FeedBack Minigames SDK integration** — pitch tracker via `window.slopsmithMinigames.scoring.createContinuous(...)`. Used as a scoring consumer only; **the plugin is not registered as a FeedBack minigame.**
- **Public surface** — `window.Virtuoso = { generateExercise, generateSession, makeBundle, resolveRendererFactory, readConfig, setSegmentLoop, clearSegmentLoop, getSegmentLoop, STYLE_PALETTES, stylePaletteConfig, SEGMENT_TEMPLATES, SEGMENT_ROLES, BUILT_IN_SESSIONS, rollSegment, refreshWorkout, progressLoad, progressSave, progressSetMode, advanceDepthLadder, nodeProgressState }` (near the end of the file). `BUILT_IN_SESSIONS` was exposed 2026-06-05 so the generators smoke can build + validate every session in-page (read-only data, same convention as `SEGMENT_TEMPLATES`).
- **Segment-template + variation engine** (just after `stylePaletteConfig`) — the Workout library substrate. `SEGMENT_TEMPLATES` is a registry of templates `{ role, competency, band, style?, kind (1 of the 29 primitives), base, vary[] }` (a generalization of `PATHWAYS[].vary[]` + the palette index-picker). `rollSegment(template,{variantIdx,locks})` materializes one into a normal session segment; `refreshWorkout(session,{scope})` re-rolls template-ref slots. **Browse / Pick / Refresh are three reads of one object.** A workout segment may be an **inline** `{kind,config}` (legacy) OR a **template-ref** `{templateId, variantIdx, locks}` (materialized at the top of `buildSessionChart`'s loop). `validateSegmentTemplates()` is the startup guard enforcing the four refresh invariants (same-band / length-locked / style-locked / no-row-gate). See memory `project_segment_library_and_refresh`.
- **`offerable(primitive, instrument)` + `PRACTICE_APPLICABILITY`** (just after the segment-template guard) — the **single source of truth for which practice types an instrument is offered**, with a ternary tag: `native` / `adapted` (transfers but the generator changes behaviour — e.g. bass legato = HO/PO only) / `n-a`. `syncInstrumentClass()` drives the instrument-aware practice-type list from it (replacing the old bending-only hide). Builders themselves stay robust on either instrument (the all-4ths bass groove generators run on a guitar's low strings too) — `offerable()` gates the **offering**, not the build. **Bass groove primitives** (`root_fifth_octave`/`octave_groove`/`dead_note_groove`/`right_hand_technique`/`slap_pop`, bass-native) use the all-4ths grip (root `(s,f)` → 5th `(s+1)` → octave `(s+2)`, found by pitch); slap/pop/ghost are encoded via existing `ac`/`mt` (no new field). See memory `project_cross_instrument_workout_structure` + the bass-pedagogy agent-memory specs.
- **`bind()`** — wires all DOM events; called once on DOMContentLoaded.

## routes.py structure

FastAPI routes registered via `setup(app, context)`. All routes are under `/api/plugins/virtuoso/`:

- `GET /status` — health check
- `GET /presets` / `POST /presets` / `DELETE /presets/{id}` — preset CRUD
- `GET /tunings` / `POST /tunings` / `DELETE /tunings/{id}` — custom-tuning CRUD (frontend posts a tuning by name + family + string count + MIDI list; id is an autoincrement INTEGER)
- `POST /temp-sloppak` — `_normalise_chart` writes a directory-form package under DLC and returns `{ ok, filename, title, duration }`. **Dormant on the live path**: Play never posts here or calls `playSong`. See `docs/plugin/architecture.md` for containment and `docs/archive/architecture-history.md` for historical format/translation/stem rationale.
- **Self-hosted audio assets** (offline-safe; mirror the same guard — declared extension only, path-traversal rejected): `GET /wafont/{name}.js` serves WebAudioFont player + GM presets from `static/wafonts/` (the sampler backing); `GET /ir/{name}.wav` serves cab impulse responses from `static/irs/`; `GET /nam/{name}.nam` serves NAM amp captures (JSON) from `static/nam/`. `static/irs/` + `static/nam/` are **gitignored** (commercial IRs / GPL-3 community captures pending licensing clearance); the NAM *engine* (worklet+WASM) is **borrowed from the host's `nam_tone` plugin at runtime** (`/api/plugins/nam_tone/worklet/…`), not bundled. (The distorted-track chain that consumes the IR/NAM routes is in progress — see ROADMAP audio handoff.)

**Storage is DB-backed, not flat files.** Presets and tunings live in the shared FeedBack meta-DB obtained via `context["meta_db"]` (a `sqlite3.Connection` on `.conn` guarded by `._lock`), in two dedicated tables `virtuoso_presets` (TEXT id, preserves legacy slug ids) and `virtuoso_tunings` (INTEGER autoincrement id). `_ensure_tables()` creates them on `setup()`. The legacy `<CONFIG_DIR>/plugin_data/virtuoso/presets.json` is migrated into the DB once via `_migrate_presets_from_json()` (idempotent; runs only when the presets table is empty) and then left in place as an audit breadcrumb — it is **no longer the live store**, so don't edit it expecting changes to show up.

Temp sloppaks live under `<DLC_DIR>/.virtuoso-temp/<slug>.sloppak/`. They are cleaned up on the next build call (entries older than 24h, or beyond 20 total).
