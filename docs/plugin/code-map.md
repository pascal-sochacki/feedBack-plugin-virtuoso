# Virtuoso Code Map (screen.js + routes.py)

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
- **Renderer factory system** — `resolveRendererFactory(kind)` selects between renderers, borrowing host visualization plugins via the shared `borrowHostViz(globalName, scriptPath)` helper (lazy-load + poll for deferred `window.slopsmithViz_<id>` registration, with built-in fallback): `highway_3d` (host's `window.slopsmithViz_highway_3d`), `builtin_2d` (the **Jumping Tab** slot — borrows `window.slopsmithViz_jumpingtab`; the in-tree `makeBuiltin2DRenderer` is now only its last-resort fallback), `tab_2d` (Tab), `notation_2d` (Notation), and `piano_roll` (**groundwork only** — borrows `window.slopsmithViz_piano`, gated behind `pianoPathwayActive()` which returns `false`; the Piano Roll view button is `hidden`+`disabled`). User selection persisted via `localStorage['virtuoso.renderer']`. Note: the host 3D highway renders **4–8 strings** (its `resolveStringCount` + 8-entry palette), so it is the default for guitar AND bass; `attachRenderer()` only force-falls-back to `builtin_2d` for counts it can't handle (>8 — not currently producible in Virtuoso). `attachRenderer()` also calls `syncViewSwitcher(cfg.renderer)` after the saved-pref restore + any force, so the highlighted view button always matches the actual render. Borrowed viz plugins mount their own wrap as a sibling of `#virtuoso-canvas`; `stopRenderer()` calls their `destroy()` on switch, and `.virtuoso-render-host .jumpingtab-wrap` is sized to fill the host.
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
