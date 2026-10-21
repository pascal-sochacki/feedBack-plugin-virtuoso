# Native modules — dependency map and staged extraction

**WIP / NOT RELEASE-READY (2026-10-20).** This branch opts into native modules.
The user reports the installed Windows Lab “seems to work”: preliminary
user-reported functional smoke ONLY, not renderer/audio/detection regression
certification or a verified supported-host floor. Do not
merge to upstream's published default branch or distribute this as a stable update yet.
User authorization separately permits experimental isolated Lab runtime publication
to the personal fork's `main` for Git Plugin Manager installation. This is not
host certification or upstream/stable promotion; full source stays committed locally.

## Baseline and scope

### Current working tree (2026-10-20)

**Implementation-quality follow-up (not move-only):** pure lower-shell
`hand-marks.js` centralizes simile selection (init/array-change stable sort); pure
`notation-pitch.js` resolves letter-correct minor/modal parents and staff spelling
from existing pitch/interval data. Tab fret/verdict/technique paint is separated;
Notation beam suppression shares actual visible note identities. Both canvases
resize only on size/DPR changes with explicit per-frame transform reset.
Nine renderer files **1,568 LOC** (**+82**, not net source shrink), entry **16,465**
unchanged; strict DOM noEmit includes all helpers. DAG: Tab/Notation→hand-marks→
display-policy/tuning; Notation→notation-pitch→pitch/intervals; no core→shell.
**292 tests**, zero skips. Historical full 31 MB fixture untouched; approved-delta
Tab/unclipped Notation scenes retain paint identity, intentional key/staff/beam
fixes have direct semantics; source/native/Lab current output matches. `setMode`
compatibility retained/deletion deferred. Source 0.2.13 reserved WIP, isolated
0.2.13-lab.1 only; no publication/install or live browser/audio/DI certification.

The next paragraph records the earlier move-only extraction before these fixes.

**Local Tab/Notation follow-up:** entry **17,418 → 16,465 (−953)**; Tab 375,
Notation 594, display-policy 75 = **1,044 LOC**, plus contracts +43, combined +134.
Full seven-file renderer subsystem **1,486 LOC**. Entry wrappers pass only two live
preference readers; initialization/caches/listeners belong to independent renderers,
not attachment/clock/audio. All new renderer functions pass strict DOM checkJs via
`tsconfig.renderer.json` (`tsconfig.shell.json` compatibility alias); no any/skip/
suppression. Native DAG adds entry→Tab/Notation/display-policy; Tab/Notation→display
policy/tuning, Notation→pitch, display-policy→pitch. Core→shell stays forbidden.
**283 tests**, independent full 31,361,838-byte saved-dirty before/after outputs,
direct imports/source/Lab and 899 exact untouched IIFE statements/order pass.
No runtime build, feature, version bump or host install; browser fonts/MIME/cache/
audio/Windows DI and live Tab/Notation remain owed. [Owners](code-map.md).

**Renderer integration foundation:** four lower-shell modules, **399 LOC**;
entry **17,758 → 17,418**, combined **+59**. No core→shell edges. Runtime DAG:
entry→host-factories/selection; selection→host-factories/Classic; Classic and
host-factories have no executable imports. JSDoc-only renderer-types supplies
selective strict DOM checkJs via `tsconfig.shell.json`, not a browser-global any
escape or whole-shell certification. Exact **909** remaining IIFE statements and
their order match independently captured dirty source. Host globals read only at
calls; construction/import trap tests, full canvas sequence and source/Lab factory
contracts join discovery. Attachment/transport remain entry-owned; see
[owners/HOST CHECK](code-map.md#current-owned-renderer-modules).

**Complete session foundation:** `session.js` owns `generateSession` with native
segment materialization/defaults/refresh, BPM ladder, per-block timing/backing/
timeline, incoming/wrap breaks and length-preset add-arc. Passive content owns all
65 templates; shared defaults/count-in helpers are pure, not DOM adapters.
Nine modules **1,110 LOC** (largest 439); entry **18,813 → 17,758**, combined
source +55 including JSDoc/imports. All 51 core + three content JS pass strict
cached checkJs. Template-ID injection/guards and synchronous public40/debug91
publication remain entry; both generators share exact native function identity.

**264 → 270 tests**. Before moving subjects, complete dirty entry ran independently:
**42,443,466-byte** JSON remains byte/deep equal after extraction. Compact fixture
pins full/section/per-case hashes: 356 session/bundle attempts (354 successful,
two preserved empty/unknown-ref errors), 25 built-ins, 277 variants across all 65
templates, 31 palettes, 12 mixed guitar/bass timing/seed/ladder/cycle/target/break
cases, eight tunings, three edges and 595 helpers. Older fixtures unchanged.
Source/Lab match after solely asserted private bundle-format normalization;
direct imports trap IO/RNG/guards and assert offsets/backing silence/incoming
timing/whole-target overflow/tuning/mutability. See [testing](testing.md).

**Graph review fix:** shared AST scanner uses unmodified vendored MIT Acorn 8.18.0
in `scripts/vendor`, never runtime inventory. No install/compiler cache required.
ECMAScript 2022 parses contextually: import methods vs calls then blocks, object
division vs regex, return regex and nested template interpolation. Both exact
major-review forbidden-edge cases reject. Invalid/new syntax fails closed;
only literal-string dynamic imports supported. Core→passive content allowed;
content→core/shell forbidden; every edge remains cycle checked.

**Remaining shell:** `makeBundle`, `readConfig`, live-tier run targets, Workout
draft/edit/refresh handlers/storage, launch/readiness/caches and contained player
lifecycle. No callback bag/state module/features or live-host/DI certification.
Known NaN-BPM backing/nonpositive ladder steps may not terminate: excluded, not
fixed during this pure move. Isolated temporary Lab 0.2.13-lab.1 only; source
version unchanged, existing dist/siblings untouched.

**Complete exercise core:** `generateExercise`/all dispatch/key-cycle/Jam plus
motif, strum/fingerstyle, timeline/voicing/backing/recipe/profile/feel owners are
outside entry. 20 new modules total 3,735 LOC (largest 511); entry 22,083 → 18,813.
Session defaults/materialization/Workout/bpm-ladder assembly remain entry-owned;
makeBundle/readConfig, lifecycle/state/publication and guard calls never moved.
Full owner map: [code-map](code-map.md). All 43 core + two content JS files enter
strict cached noEmit checkJs; no skipped new functions/any/suppression. Existing
practice-file parser permissive validation contracts are unchanged. The authored
duplicate progression-label assignment is expressed by a typed spread preserving
its original final value/order; no behavioral cleanup.

Independent CURRENT DIRTY 22,083-line entry bytes were saved before this batch
(SHA `313a8627…`), with fresh snapshots before every subsequent cluster. Complete
generation JSON remains byte/deep equal across 961 raw charts/exercises/bundles,
25 Workouts and 74 helper rows. New fixture additionally pins original-entry
1,512 grips, 196 strum/PIMA builders, 252 motif placements, 120 timelines,
60 voicings, seven edges; 186 backing configs, all 71 cell/figure/groove variants,
93 valid Jam charts across all 31 styles/three band modes/spotlight/switch-up.
Subjects are complete saved entry or actual native imports, never copied/sliced
functions. No old fixture was regenerated. Source/Lab pin the same full hashes,
asserting private bundle format before that sole namespace normalization.

Graph policy uses shared dependency-free lexical scanner (comments/strings/regex/
templates/interpolation), side-effect/named imports, reexports and literal dynamics.
Computed dynamic imports are actionable errors; only relative lower-core edges
are allowed. Negative fixtures prove hidden upward/reexport-cycle/node/computed
edges reject. Tests require no parser package or cached compiler. The compiler
is developer-only for checkJs, never needed to load native runtime or test graph.
Existing NaN-BPM backing can loop without terminating (observed in original saved
entry and current): excluded from that callable corpus, separate bug, not fixed.

**Generation foundation batch:** thirteen modules, 2,759 LOC, largest 422; entry
24,657 → 22,083. `random`, `sequence`, `positions`, `chart-grid`, `harmony`,
`chord-positions` and scale/arpeggio/technique/tapping/bass/guide-tone/pedal-riff builders.
Explicit imports preserve the lower DAG; guard calls/publication, `readConfig`,
`makeBundle` and shell state stay in entry. [Code-map](code-map.md) lists owners
and remaining dispatch/backing dependencies. No runtime build/new API/version bump.

Before either cluster, the complete CURRENT DIRTY entry was independently
captured in approved temporary storage. The permanent fixture records original
entry SHA-256 `da6458ee…` and full/section hashes; normal tests never recapture it.
Full before/after 61 MB JSON matches bytes/deep equality: 961 raw chart attempts,
961 exercise/bundle attempts (931 valid each), 25 Workouts and 74 helper rows.
All 40 types, seven setups, three keys/scales/directions/timing combinations,
resolved guitar CAGED/3NPS/Open, bass position/full-neck, overrides/key cycles and
six genuine Jam runs. Thirty errors preserve unsupported/empty/malformed inputs,
not successful playability coverage. Source/Lab compare complete output after
asserting the sole private bundle-format namespace change. Direct imports match
37 practice dispatch cases (modal scale alias included); fresh import/calls trap
IO, startup guards and ambient RNG. Old fixtures and 40/91 keys are untouched.

Strict cached checkJs expands to random/sequence/positions/grid and all nine
technique builders with explicit cfg/event types; no any/skip/transpilation.
Harmony/chord geometry and other moved builders owe full JSDoc checking; syntax,
behavioral imports and automated source/Lab DAG checks cover them now.
Scale/arpeggio is extracted, **not all generation orchestration**: remaining
motif/strum/fingerstyle and timeline/backing/recipe clusters must move
coherently before dispatch/session assembly. No upward imports/factory facade.

### Earlier slice evidence

**Latest chromatic slice:** `src/core/builders/chromatic.js` (71 lines) exports
`buildChromaticExercise` and the two ordinary mutable pattern tables. Imports
instrument tuning, timing, `notes.js` (14 lines) and `stroke-policy.js` (164 lines);
stroke policy imports only tuning/timing. Nine shared note/stroke functions move
without their startup guard; `wholeCycleStepCount` joins timing (+11 lines).
No upward imports, factory, generic fingering/chord cluster or RNG consumption.
Custom/Workout dispatch remains in entry; authored Ladder Warmup is unchanged.
Entry **24,875 → 24,657 (−218)**; new modules **249**, combined with timing **+42**;
HEAD 27,248 → 24,657 (**−2,591 combined dirty WIP**, includes prior slices).
**253 → 256** Node tests; exact independent dirty pre/post snapshots cover 218 raw
charts/whole exercises/bundles, ten Workouts, 28 helper and 19 edge calls. All
older fixtures and synchronous 40/91 publication survive. Import/call IO traps,
frozen cfg, mutable output/table identity, note-grid/final sustain/whole-cycle
overflow and narrow checkJs pass; Lab checks the full static DAG/ZIP and only
normalizes its explicitly asserted private bundle format prefix. Source **0.2.13**
and local Lab **0.2.13-lab.1** remain. Other actual builders (scale/chord-scale/
arpeggio/sweep, guide tones, spider, technique and bass grooves) retain their
entry dependencies: generic fingering, RNG/path/grid and harmony/voicing leaves
are deferred, not smuggled through callbacks. No host/audio/DI certification.

**Latest fretboard-shape slice:** `src/core/fretboard-shapes.js` (417 lines)
exports the whole unified five-shape CAGED registry (15 quality templates), seven
3NPS definitions, both cycles and 16 pure functions. Transitive dependencies are
contained: open pitch/fret, scale/degree, box/3NPS fingering, three resolvers,
Open eligibility, dispatch/order/cycle, shape-awareness and default shape.
Only import: scale intervals; pitch aliases/tuning are supplied by callers, no
chord dependency is needed by scalar resolution. No upward dependency, factory,
IO, guard execution or new init step. Original chord-fingering/no-unison guards
and synchronous shape/debug publication remain at their entry positions.
Mutable table/array identities, top-six CAGED/Open anchoring, all-string 3NPS,
lower-string-wins dedupe and raw malformed/inherited-key/numeric behavior remain.
Entry **25,261 → 24,875 (−386)**; new module **417**, combined **+31**;
HEAD 27,248 → 24,875 (**−2,373 combined dirty WIP**). **249 → 253** Node tests;
source **0.2.13**, local Lab **0.2.13-lab.1** unchanged. Independent dirty-runtime
2,600 resolver/385 helper/76 generated-exercise snapshots match, unchanged older
71/24 fixtures and 40/91 keys. Deferred explicitly: DOM dropdown/labels,
instrument defaults/current-shape cfg adapter, active config/family/count/cache,
chord-template quality/root/voicing and run-seam consumers. Adapter is currently
plain-data but stays with orchestration in this bounded move; no closure smuggling.
Further chord extraction needs template-quality/theory → chord-template leaves.
No live host/audio/DI or blanket unusual-tuning 3NPS playability certification.
Existing low-level 3NPS produces frets above 24 in 195 captured cases (max 51);
these raw outputs remain exact. Any support/ergonomics correction is separate work.

**Latest instrument/tuning slice:** dependency-free `src/core/instrument-tuning.js`
exports exact `STRING_SETUPS` (7), `TUNING_PRESETS` (26 in 6 groups),
`TUNING_TO_SETUP` (7) and six helpers: `openMidisForConfig`,
`tuningOffsetsForConfig`, `isBassCfg`, `hostStandardMidisFor`, `parseNoteName`,
`midiToNoteName`. No IO/import side effects/cycles; native static entry imports,
shared debug reference, synchronous 40/91 publication and boot order survive.
Narrow checkJs uses explicit cfg/field types, no suppression; ordinary mutable
tables and returned-copy versus shared-standard-array contracts remain.
Entry **25,396 → 25,261 (−135)**; new module **152**, combined **+17** this slice;
HEAD 27,248 → 25,261 (**−1,987 combined dirty WIP**). Source **0.2.13**, local
Lab **0.2.13-lab.1** unchanged; **246 → 249** Node tests pass.
Deferred: `hostTuningEntries`/name lookup use host caches/reference pitch;
`effectiveMidisNow`, current family/count and Setup sync use DOM; L1 adaptation
uses instrument storage and selection state. No giant parameter bag, shape/schema
or Python/backend migration. Fractional `midiToNoteName`'s numeric NaN is captured
and preserved for a separately approved fix, not corrected during this move.

**Latest move-only Workout slice:** `src/content/workouts.js` exports the exact
25-entry `BUILT_IN_SESSIONS` literal, with no imports, host access or factories.
The 338-line binding becomes a 339-line passive module; inferred data joins narrow
checkJs without whole-table annotations. Entry static import preserves the exact
public object identity, first/default starter, ordinary mutability and template
string refs; generation, clone-before-edit draft and boot ordering remain unchanged.
`screen.js` **25,732 → 25,396 (−336)**; committed HEAD 27,248 → 25,396
(**−1,852 combined dirty WIP**). No cycles/upward imports, workout Markdown
migration, new API, version bump or publication/install changes.

**Move-only PATHWAYS slice on the existing dirty 0.2.13 candidate:** the entire
remaining 151-entry literal registry now exports `PATHWAYS` from
`src/content/pathways.js`. No closure dependencies, imports or IO; ordinary mutable
objects/arrays remain shared. The entry statically imports the binding; no factory,
upward dependency or binding reassignment. Startup guards, catalog hydration,
public/debug publication and storage/default boundaries stay in their original order.
Warmup remains absent until the single authoritative catalog inserts it into that
same object. Full inferred registry joins narrow checkJs without type suppression.
Exact 1,648-line binding moved (new module 1,651 lines); `screen.js` **27,378 →
25,732 (−1,646)**. Versus committed HEAD's 27,248: **−1,516 combined dirty WIP**,
including the earlier feature/reviewer work. This module exceeds the aspirational
1,500-line target to preserve the one whole registry in a move-only slice.
No version bump, new lesson migration, commit, push, install or publication edit.

Latest unpublished combined candidate is **0.2.13 / 0.2.13-lab.1**; preserves
dirty 0.2.12 format-2 variants and adds the one-rung [Ladder pilot](practice-files.md).
`src/shell/practice-catalog.js` hydrates data independently of normal DOM binding;
static module evaluation/public-debug publication remains synchronous. No
dynamic import, second player, runtime build or generation IO. This is integration,
not a move-only slice. Publication stays 0.2.11-lab.1 at ac8fc44 unchanged.

Combined next WIP is now **0.2.11 / 0.2.11-lab.1**: preserves the entire
uncommitted 0.2.10 chord/timing extraction and adds the separately approved
[Markdown file-practice prototype](practice-files.md). The new core imports
timing only; shell imports core; entry imports both. Plain native JS, no runtime
build or new public/debug keys. The move-only 33-test evidence below belongs to
the preserved prior slice, not a claim the combined change is move-only.

Source **0.2.10** reserves an unpublished move-only slice; generated local Lab
is **0.2.10-lab.1**. Published personal-fork `main` remains **0.2.9-lab.1** at
`5ca4f45`; no new commit/push/install is authorized by this refactor.
The entry statically imports four dependency-free, import-time-pure leaves:
pitch, scale intervals, chord theory and timing. Chord theory owns all 27
`CHORD_FORMULAS` and nine `DIATONIC_QUALITIES` rows. Timing owns nine
`RHYTHM_CELLS` plus `parseMeter`, `secondsPerDivision`, `rhythmSteps` and
`measureSeconds`; moving the cell table contains rhythmSteps' sole closure
dependency. All arrays/objects remain mutable, including memoized synthetic
chord entries. Rhythm validation stays at its original entry startup point;
count-in/display/swing application, state, audio and public/debug publication
are unchanged. No tuning/shape extraction or empty scaffolding is included.

Healthy baseline **23/23**, after extraction **33/33 Node tests**; the unchanged
71-case fixture from committed `c37dc632` matches full source and generated Lab.
Direct imports cover exact registries, extended stacks 14/17/21, mutable
identity, simple/compound/odd meters, tuplets and existing malformed/default/
NaN/inherited-key behavior. Leaf durations intentionally do not apply swing;
the seeded pipeline corpus still covers complete generation. All four leaves
are in narrow checkJs. Packaging includes their static imports and ZIP files,
real imports, private namespaces and verbatim legal/vendor sources.
These are source checks, not browser/desktop/audio/DI acceptance.

### Historical first Lab evidence (2026-10-19; not current status)

`node scripts/cut-lab.mjs` generates the **current working tree**, including the
pitch and scale-interval extraction, into sibling `virtuoso-lab-dist/virtuoso_lab/` and
`virtuoso-lab-dist/virtuoso_lab.zip`. Manifest ID/screen `virtuoso_lab`, label
`Virtuoso (Lab)`, version/header `0.2.8-lab.1`. Source retains upstream identity;
no fork-wide source rewrite, migration, original-install or user settings changes.
The generator itself does not commit or push; separately authorized publication
places generated runtime at the personal fork's repository root. `src/` and its
nested ESM package are included. See `docs/plugin/virtuoso-lab.md` for Git Plugin Manager
and manual Windows folder installation and limitations.

**HOST CHECK — capability:** separately installable prototype identity/storage.
**Host has:** ID-keyed plugin registration and user-directory precedence
(`plugins/__init__.py:1170,1283`), Pedalboard enable/restart semantics
(`docs/plugin-v3-ui.md:127–168`), module injection and sandboxed source routes
(evidence below); no locally verified ZIP-upload UI.
**Evidence + date:** read-only sibling `feedBack` at `eef58c8`, 2026-10-19;
existing `cut-beta.mjs` namespace mirror and desktop local-dogfood runbook.
**Verdict:** BORROW host registration/loading; BUILD working-tree allowlisted
artifact transformation, not a new loader, installer or detector.
**Flip conditions:** a supported installed host with both native-module rails
plus verified package-import UI could replace manual installation. Source audit
alone does not establish desktop compatibility or simultaneous-runtime safety.

Lab additionally renames public/debug globals, all plugin-owned CSS prefixes/font
faces and mutable WebAudioFont player/preset globals; preserves filenames/licenses
and host APIs/storage keys. Host singleton verifier targets, instrument/tuner
settings writes, visualization factories and AudioContext wrapper chaining remain
shared risks: original must be disabled **and host restarted** before Lab tests.
No Lab data is populated from original stores.

Validation: 11 Node tests pass (five pitch, six packaging tests); generated
manifest/ZIP/source graph, private audio script evaluation, Python AST + SQLite
schema/endpoint checks, repeatable output and real Lab module import are covered.
Committed baseline comparison passes startup guards, **40 public / 91 debug
keys and byte-identical outputs for all 25 built-in sessions**. DOM boot is
deliberately deferred in the Node harness, so this is not browser certification.
Generated entry/leaf/audio module syntax, brand/whitespace checks pass.

Host test attempt: existing `npm test` aborts on unreachable `127.0.0.1:8765`.
No sibling host `.venv`, bundled Windows Python, Playwright or Chromium tooling
is provisioned here; system Python lacks FastAPI, uvicorn, httpx and pytest.
`python3 -m pytest` is blocked by missing pytest. No packages installed, host
started, user config modified or original checkout touched. Python route runtime
tests, all browser smoke and Windows DI remain **BLOCKED / owed**.

- Plugin baseline: committed `8436194ce45d745902513b2c576031bd2e4db1c9`,
  v0.2.6, ~27,215 lines in `screen.js`. The dirty `feat/learn-mode` checkout
  was not used as source and is not part of this branch.
- Historical first-slice reservation: v0.2.8 in both `plugin.json` and `VIRTUOSO_VERSION`.
  This is a branch-local reservation, not a release. If Learn or another branch
  lands first, integrate on a fresh branch, reconcile the shared root-entry
  edits, and choose a new version from the then-current trunk. Do not overwrite
  Learn's v0.3.0 or merge its uncommitted changes as part of extraction.
- `NOTE_NAMES`, `NOTE_ALIASES`, `pcName`, and `midiToFreq` live in
  `src/core/pitch.js`; `SCALE_INTERVALS` now lives in the 30-line
  `src/core/scale-intervals.js`. No chord/timing/tuning/shape move in this slice;
  no generator, renderer, audio, state, or lifecycle redesign.
- Root `screen.js` statically imports those dependencies, then executes the original
  strict IIFE. The host awaits the static graph; there is no asynchronous boot
  bridge, custom injection, build, or dynamic-import race.

## Host evidence and release gate

Read-only audit of sibling `feedBack` at
`eef58c88c315b59375926bbfc8740cd18cb958f9` on 2026-10-19:

| Requirement | Source evidence |
| --- | --- |
| Manifest opt-in reaches browser | `plugins/__init__.py:1425–1430,2150–2151` publishes `scriptType` as `script_type` and `minHost` as `min_host`. |
| Await static graph before next plugin | `static/js/plugin-loader.js:650–681` sets `script.type = 'module'` at 666 and resolves on `onload`, preserving `_loadingPluginId`. |
| Plain source files served with JS MIME and refresh validation | `plugins/__init__.py:2521–2546` serves sandboxed `src/**` through `_plugin_file_response` / `_plugin_media_type` (no-cache, ETag/304). |
| Generation-prefixed URLs | Loader uses `_pluginScriptUrl`; backend generation-prefix middleware at `plugins/__init__.py:2420–2433` preserves relative graph paths. Validate this too during runtime smoke. |
| Rules | Host `docs/plugin-modules.md`, constitution Principle II/V and Operating Constraints module-load contract. Host `AGENTS.md` is absent in this checkout; `CLAUDE.md` was read instead. |

**Exact released host floor UNKNOWN.** This host clone is shallow (one visible
commit), has no local tags, and `git log -S` / blame only reach the shallow
boundary `eef58c8` (2026-07-23), not the introduction of R0. `VERSION` reads
`0.3.0-alpha.1`; that is snapshot metadata, **not proof of the earliest released
desktop containing these rails**. The constitution's amendment date and the
playbook's word "shipped" are not a release-to-binary mapping. No guessed
`minHost` was added. The field is currently advisory, not an enforcement barrier.

Before release: identify a supported host release containing BOTH injection and
source routes, verify the running build (not merely an upstream checkout), then
declare the verified floor in the manifest. An old host treating this entry as a
classic script will fail at `import`; a module host without `src/` will 404. This
is why opting in on this isolated WIP branch is not permission to release it.

## Observed dependency map

References below are **baseline** `screen.js` line anchors, not promised stable
line numbers. Based on the TOC, targeted source reads and symbol/usage searches;
this is a subsystem map, not a claim that every closure edge has been enumerated.
Orbit returned incomplete monolith definitions, so direct source inspection was
used to verify the anchors and first slice.

| Candidate / layer | Inputs and observed dependents | Extraction constraint |
| --- | --- | --- |
| **Pitch leaf (done)**: names/aliases 58–59; helpers 4347–4348 | `pcName` reads only `NOTE_NAMES`; `midiToFreq` only Math. Alias users: shape selection 3269/3327, `scalePcs` 6477, chord roots/builders 6800/7024/9734+, notation 13801+, tuning/anchor adaptation 22518+, tuner 23821/24078. | No imports, host IO or closure state. Keep exact values, sharp spelling, A440 formula and numeric edge behavior. Alias table is also on `__ss_debug`; preserve its object identity and ordinary mutable-object contract, do not freeze it during a move. |
| **Scale intervals / chord theory (done)**, §1 | `src/core/scale-intervals.js` → entry scale pitch classes, shape resolver, chord-scale/harmony. `src/core/chord-theory.js` → template-quality gate, chord-depth engine, voicing/arpeggios/backing. | Both leaves have no imports or IO; preserve all 28 scale arrays, full chord stacks above octave (14/17/21), diatonic rows and ordinary mutable references. Synthetic chord registration remains in the entry. |
| **Instrument/tuning core (done)** | `src/core/instrument-tuning.js`: three tables and six pure helpers → open-MIDI config, shapes, sessions AND DOM setup/tuning sync. | Storage/UI/host caches and L1 adaptation stay in entry; low-string-first indexes, intent tags, overrides and bass/guitar distinctions preserved. |
| **Shape core (done)** / interleaved consumers | `src/core/fretboard-shapes.js` → scale/arpeggio builders and form position UI; imports scale intervals only, explicit low-string-first open MIDI inputs. | Whole unified CAGED data and pure transitive resolver helpers moved. No-unison/fingering guards, cfg adapter, defaults/labels/DOM sync and chord-template/voicing consumers stay in entry. |
| **Meter/rhythm timing (done)** / seed/chart utilities (later) | `src/core/timing.js` owns meter parsing, division/bar seconds and rhythm cells/steps → exercise/session builders, backing and shell clock. RNG helpers, beats/anchors/fill helpers remain in entry. | Timing is a dependency-free leaf; its cell validation stays in boot orchestration. `chartBeatSeconds` consumes bundle metadata; keep renderer/display helpers out of core timing. |
| Harmony / voicing / backing | §5 6908+, `voiceChord` 7199, `compileChordTimeline` 7469, `buildBackingEvents` 8355; palettes 4800+, comp/bass/drum recipes. | Shared harmonic timeline must remain the source of truth; preserve cfg+seed determinism. Palette validation references scale/progression/audio registries: definitions can move before guard calls, but do not move guards ahead of initialization. Audio profile selection mixes shell and core-facing data. |
| Exercise + session orchestration | §7 9171+, `generateExercise` 12012 → single/key-cycle/jam chart + timing/timeline; `buildSessionChart` 12469 and `generateSession` 12612 → segment defaults/materialization, builders, per-block backing/tempo. | Extract individual builders after dependencies. Preserve plain `{version:1,session,chart}` contracts; entry version badge is unrelated to chart schema version. Avoid cycles between `buildSegmentConfig`, dispatch and content registries. |
| Content / curriculum | **PATHWAYS done:** dependency-free `src/content/pathways.js`; §3 BUILT_IN_SESSIONS, `STYLE_PALETTES`, `rollSegment`, `refreshWorkout`, `materializeSegment` remain in entry → session builders and shell lists/workout draft. | Data registries are not UI controllers. Preserve shared references / IDs and clone-before-edit workout behavior. Cross-registry validators and authored hydration stay in boot/shell orchestration, not implicit module IO. |
| **Shell boundary** `makeBundle` 12752 | Exercise chart → renderer metadata; reads inversion/lefty/render prefs and backing/audio choices. | Not core. Do not extract §1–§10 wholesale: shell helpers, WAF loading, AudioContext patch and state are interleaved there. |
| Shell render / audio / progress / input | §11–§15; state near 3500+, progression between fretboard and §14, audio/transport §14, workout draft 25699+, `readConfig` 4370, `bind` 26160. | `activeBundle`, playback clock, verifier, mixer, jam and progression stores have multiple writers/readers. Keep ownership cohesive; never solve this with a giant shared `state.js`. Host judge remains consumed, not reimplemented. |
| Boot and deliberate globals | `boot` 27153; `window.Virtuoso` 27196; conditional `globalThis.__ss_debug` 27212; readyState dispatch 27215. | Public surface published synchronously during entry evaluation, before DOM boot. Event handler at 27107 reattaches on `screen:changed`; readyState fallback handles modules evaluating after DOMContentLoaded. Preserve registration/order and debug closures. |

Target direction (arrows mean imports/dependencies):

```text
screen.js → src/main.js                         (eventual one-line entry)
main/globals → input + shell controllers → core orchestration
core orchestration → builders + content → harmony/shapes → theory/timing/pitch
shell render/audio/io → core data/helpers       (never the reverse)
```

`globals.js` will become the only writer of `window.*` (including the existing
scoped AudioContext bridge); `main.js` will own explicit init ordering and
navigation registration. They do not exist in this slice: the original IIFE is
the documented transitional exception. Do not create empty scaffolding or
relocate all state merely to imitate the host example. Aim for modules under
1,500 lines; the remaining monolith is migration debt, not a new size exemption.

## Concrete stages and gates

1. **First slice (done)**: static entry + pitch leaf + real-import tests + selective
   JSDoc. No side effects in the leaf, no extra exported globals.
2. **Independent leaf moves**: scale intervals, chord theory and meter/rhythm
   helpers done; seeded random utilities remain for a later move-only slice. Carry
   assertions and expand the narrow checkJs file list with each extracted file.
3. **Instrument + shape cluster**: tuning data/helpers first; then CAGED/3NPS/Open
   pure resolvers together with their already-extracted imports. Keep unified
   shape data, import-time purity and no-unison checks. Do not pull form sync in.
4. **Harmony/backing/builders**: theory depth/voicing → timeline/recipe generation
   → individual builders → exercise/session dispatch. Migrate tests with subject
   using real imports, validate all practice types, seeds and per-block timing.
5. **Content and shell ownership**: move passive curriculum registries when
   dependency-ready. Inventory each shell state writer before separating
   render/audio/io/progress/input. Explicit function parameters or cohesive
   owner accessors only; no speculative standalone adapter framework.
6. **Boot/global seam last**: centralize global publication, lift IO into explicit
   init called by `main.js`, and reduce `screen.js` to the static main import.
   Maintain synchronous publication relative to module evaluation, inline-handler
   compatibility, once-per-version load and per-visit `screen:changed` behavior.

Each stage: no cycles or upward core→shell imports; no behavioral fixes bundled
with moves; Node real-import tests and checkJs; host smoke before promotion.
No `import-x` dependency introduced for this four-leaf DAG; cycle enforcement can
be added when a graph actually needs it, without introducing runtime tooling.

## Module compatibility audit (separate from extraction)

- The **entire original IIFE already uses `'use strict'`**. No change to sloppy
  assignment/delete rules, octal parsing, free-call `this`, or block-function
  semantics is required. Retain the IIFE so closure initialization is unchanged.
- No executable `document.currentScript`, direct `eval`, `with`, or
  `arguments.callee` use found. Asset routes are already explicit host URLs;
  no mechanical URL fix is needed. Future moved asset consumers use
  `import.meta.url` or existing absolute plugin routes, never currentScript.
- Root module top-level `this` is undefined, but no root `this` is read. Existing
  deliberate `window`/`globalThis` assignments and conditional harness publication
  are unchanged. Imports are read-only bindings; all moved bindings were const
  declarations or unreassigned functions, and table usages remain reads.
- Module fetch/evaluation may be later than a classic script. The existing
  readyState test calls boot directly when DOM is already ready; the host awaits
  graph load and the existing screen re-entry listener is retained. Browser
  ordering is still an owed runtime check, not proven by Node mocks.
- **Necessary mechanical compatibility fixes: none found.** Packaging opt-in is
  the only runtime change besides binding relocation; no unrelated fix hidden in
  this refactor.

## Node setup and verification

`src/package.json` contains only `type:module`, allowing direct Node imports of
plain `.js` leaves without changing package interpretation outside `src/`.
Root developer scripts are `.mjs`; the smoke skill has its own explicit
`type:commonjs`; `static/wafonts/*.js` are classic browser assets, not module
subjects. No root package.json, install/build step, lockfile or runtime dependency
was added. Tests are `tests/*.mjs`. The root entry is browser-selected as module;
check its syntax unambiguously via stdin module mode rather than depending on
Node's version-dependent `.js` syntax detection.

```sh
node --test tests/*.mjs
node --input-type=module --check < screen.js
node --check src/core/pitch.js
node --check src/core/scale-intervals.js
node --check src/core/chord-theory.js
node --check src/core/timing.js
npm exec --yes --package=typescript@5.9.3 -- tsc -p tsconfig.core.json
node scripts/check-brand-hygiene.mjs
git diff --check
```

TypeScript is **developer-only noEmit checking of JSDoc in plain JS**, never
served/transpiled TypeScript. The narrow config excludes the monolith, tests,
browser globals and sampler blobs; it needs no Node typings. The pinned ephemeral
checker avoids dependency/lockfile churn; a maintainer can instead use an already
installed compatible `tsc`. No test subject uses source text slicing.

### Historical characterization setup (2026-10-19; fixture still authoritative)

The old in-memory 25-session/API comparison below was ephemeral evidence.
It is superseded by `tests/core-characterization.mjs` and the packaging suite's
shared corpus, originally **67 cases**, captured from **committed c37dc632**, not from two
copies of the modified working tree. Capture ran and all 13 then-existing Node
tests passed **before** moving the scale table; after extraction all **17** pass.
Review correction expanded it to **71 cases** and **18 passing tests**. The
compact fixture was explicitly recaptured using the corrected harness from
**c37dc632cd0dcfca1576ff82ac238c72e48cae42** (original pre-task entry with inline
scale table, never modified/extracted source). Normal tests need no historical git ref.

```sh
# Explicit maintenance command ONLY; review fixture diffs, never run in CI:
node scripts/capture-core-fixtures.mjs c37dc632cd0dcfca1576ff82ac238c72e48cae42
# Ordinary local/CI regression command (no fixture writes):
node --test tests/*.mjs
```

`tests/fixtures/core-characterization.json` pins SHA-256 of the complete raw
`JSON.stringify` exercise for 28 scales, seven built-in string setups (4–8
strings) as position boxes, four genuine guitar 3NPS runs (6-string standard,
Drop D, 7- and 8-string), structural Drop-C tuning, random/thirds sequence, extended arpeggios,
Connect chord scales, 7/8 gallop, herta, fourths key-cycle and **all 25 sessions**.
Small readable duration/count/tuning/open-MIDI summaries plus three two-note
examples make diffs inspectable without giant snapshots. Hashes retain every
note time, flag, tuning, timeline and session value, not rounded comparisons.
**No version exclusion:** exercise `version:1` is a schema contract; manifest/header
versions are not present in exercise output and therefore need no normalization.

Every run uses a fresh Node subprocess/native ESM environment, seeded LCG
`Math.random` (0x51ca1e, reset per case/replay), fixed Date/Date.now and real
imports of complete source leaves. Only the root's static import URL wiring is
rewritten for a data-URL ESM entry (baseline leaves read via `git show`; working
leaves imported from actual file URLs). No regex function extraction or sliced
pure-module subject. The current captured baseline has dependency-free leaves;
this capture helper is not a general historical graph loader.

DOM boot is deferred with only readyState/listener/null-element/storage stubs;
no fake host public API. After synchronous public/debug publication and startup
guards, throwing getters trap host/DOM/storage/fetch for all generation calls.
The runner now overrides console.assert to throw on false: Node's default only
logged failures, so the earlier "startup guards passed" claim was not enforced.
A durable control forces the first actual startup assertion false and requires
exit 1 and empty stdout. Browser console/assert behavior is unchanged.
Tests pin the 40 public / 91 debug key lists, synchronous schema, finite nonempty
chart output, note string bounds, setup tuning counts, deterministic replay and
adjacent MIDI no-unison for **one-way scalar runs**. Genuine 3NPS configs carry
numeric shape 1, resolver notes/display name/fret bounds just as readConfig does;
tests require the generated run's first pass and fingering to match the resolver
and three distinct frets on every string. The original seven setup cases omitted
shapeNotes and silently used position boxes; they are now labeled as position
coverage, with four additional guitar-only 3NPS cases. Bass stays position-based
as the real form deliberately does not resolve guitar shapes for bass.
Repeated turns, pedal drills,
chords and session seams are deliberately not misclassified as scalar failures.
Fresh leaf import traps, exact 28-table values, ordered/unique semitones, diatonic
mode rotations and shared mutable object/array identity are direct-import tests.

Generated Lab executes the same corpus in its own process and compares to the
committed fixture; source/Lab table values match but identities are distinct.
ZIP and static graph tests require the new leaf. The existing runtime allowlist
already includes untracked `src` leaves; only its required-file guard expanded.
The corrected durable negative control mutates a real generated first note by
+0.001 s **before serialization/hashing**, verifies the SHA changed, then restores
the readable firstNotes summary to prove comparison rejects the SHA difference
alone. Previously it only mutated the summary after hashing, so the earlier
raw-output negative-control claim was inaccurate. Final source is not mutated.

Historical second-slice limits: one RNG seed and representative configs, not exhaustive inputs or
all template variants; public **keys**, not every shell API behavior. Data-URL
Node loading cannot certify browser source-route MIME/module caching/load order,
DOM binding, render/audio/transport/detection/real DI. Narrow checkJs (both
leaves), module syntax, hygiene and generation pass without installing packages.
No host started or dependencies installed. That snapshot's publication approval
was subsequently exercised; it is historical evidence, not authorization to
publish the current 0.2.10 candidate. Dirty siblings, publication and source
`main` remain separate. Windows/host behavior and upstream/stable promotion
are not certified.

2026-10-19 validation:

- Five pitch real-import tests pass on Node v26.12.0: exact names/aliases,
  negative/octave wrapping, A440/fractional pitches, existing invalid-number
  behavior, shared table identity and original mutable contract.
- Module syntax checks and TypeScript 5.9.3 narrow checkJs pass.
- Additional in-memory comparison (no generated files): original committed IIFE
  evaluated in a Node VM versus real import of the new entry with minimal
  browser stubs and deferred DOM boot. Startup guards passed; **40 public keys,
  91 debug keys and all 25 built-in session outputs match** (serialized outputs
  byte-identical). This baseline comparison is session evidence, not a new
  regex/extractFunction harness. No affected source-extraction tests were found
  in this committed baseline; existing Playwright suites use the public surface.
- No host listening on the documented :8000 / :8765 ports was found. No host,
  installed app, plugin link, user config or library was started or changed.
  **Playwright smoke, real DOM bind, audio, renderer and navigation certification
  are blocked** until a safely provisioned supported running host is available.

Owed host acceptance: inspect injected type and successful source-route MIME;
verify `_loadingPluginId` ordering and globals after load; all generator/core
purity and renderer/transport/verifier suites; leave/re-enter without duplicate
listeners or stale renderers; edit pitch source → browser refresh → new content
and ETag/304 behavior; verify installed desktop release floor and copy/deploy the
**whole runtime set including `src/`**, not just screen.js over old HTML.
Same-tab version upgrades may retain bare-URL dependency modules in the browser
module map; certify the host's generation-prefixed load path rather than assuming
entry `?v=` propagates to imports. Fresh refresh remains the supported edit loop.
