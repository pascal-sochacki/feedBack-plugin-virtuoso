# Virtuoso — current work

Read this with [repository guidance](AGENTS.md) and [docs/index.md](docs/index.md).
Old upstream release stories, PR states and handoffs are preserved as
[nonactionable development history](docs/archive/development-history.md).

## Current source state

- **Publication completed (2026-10-21):** experimental **0.2.13-lab.1** pushed
  non-force over SSH to personal-fork `main` only, runtime revision
  `6d8ede92c607eb14d3d175766258e405e134088d`, replacing `ac8fc44…`.
  Generated SOURCE map pins local source
  `03a0c04b44c0b413018e77f81b169a43b01a07fc`; this later documentation-only
  handoff does not change that runtime provenance or require regeneration.
  **302/302 source tests, zero skips; 110/110 actual publisher-tree packaging/
  runtime tests, zero skips**. Offline npm ci, lint (18), strict core/content/
  shell/renderer types, all module syntax, DAG, docs/brand/whitespace passed.
  Knip exits 1 with exactly one full/two production intentional export findings.
  Exact candidate/publisher inventory **552 files**, native entry graph **66
  modules**; legal/vendor source and historical hashes/API40/debug91 retained,
  developer tooling and withdrawn assets excluded. Remote fetch/ls-remote match
  runtime SHA; **27 commit-pinned public resources HTTP 200, exact local bytes**,
  including both lessons, nested modules, manifest and legal/source files.
  Source/publication trees clean; dirty modules sibling untouched. No source/
  upstream push, tag/release, host start/install or migration. Windows DI and
  live-host MIME/cache/BFCache/navigation/render/audio/judging remain owed.

- **Authorized publication candidate (2026-10-21):** reviewed source **0.2.13**
  prepared experimental **0.2.13-lab.1** to replace personal-fork `main`'s
  `ac8fc44e2a3c0388dc5c936427dc6c85d492b802` / 0.2.11-lab.1. Includes complete
  modular core/content/renderer/Workout foundations, Custom format-2 variants,
  standard-six-only format-3 Ladder pilot (stable progress IDs), staff/beam and
  canceled-unload/BFCache fixes. **302 source tests**, strict core/content and
  shell-renderer types, lint 18 and Knip full1/prod2 inventory are the candidate
  gates, not live-host/Windows DI certification. Source commits stay local;
  only generated runtime may be pushed non-force to personal `main`. No Learn,
  installation, host start, migration, upstream/source push or sibling edits.
  Historical entries below record their own earlier unpublished states.

- **Workout page-lifecycle reviewer fix (2026-10-21):** beforeunload/pagehide
  retain editor DOM listeners: canceled navigation and BFCache preserve the
  document, actual destruction cleans its listeners. Confirmed SPA screen exits
  still unmount; return mounts once. Existing session flushing is unchanged; no
  pageshow remount, stop duplication or autoplay. **301→302 tests**, zero skips;
  fail-first real source/Lab canceled-unload, persisted/nonpersisted/empty page
  events, repeated restore, inactive restore and navigation-return edits assert
  exact-once handlers and preserved draft/selection/dirty/DOM state. Lint 18,
  strict types and intentional Knip full1/prod2 remain. Isolated Lab only; live
  browser BFCache/host/audio/Windows DI unverified. No stage/commit/push/install.

- **Workout caller/controller slice (0.2.13 WIP, 2026-10-20):** native
  `shell/workout-editor.js` owns cloned draft/selection/dirty state, cards,
  refresh/diff/menu, duplicate/remove/add/reorder and visit-scoped listeners;
  `core/workout-config.js` owns plain launch materialization/family-compatible
  tuning/audio/count-in/length. Entry still owns browse/routine storage and all
  launch/renderer/audio cancellation. One semantic preview callback, no proxy bag.
  Entry **16,465→16,126 (−339)**; three owners **362 LOC**, combined **+23**
  (types/lifecycle included), not deleted implementation. Direct import bindings
  **122→124**: one actual dependency removed (`lengthPresetSec`), three cohesive
  owner/display imports added. `refreshWorkout`/`applyLengthPreset` now remain only
  for synchronous public identity pins, so this is caller decluttering, **not a
  net import-count reduction**. 40 public/91 debug keys unchanged. **297→301 tests**,
  zero skips: independent dirty-entry real-event/UI/draft/full exercise capture,
  source/Lab parity, direct mutable alias/raw-index/selector/drag/teardown/stale
  visit tests and inert imports. Lint 18 warnings, strict core/content/shell/
  renderer types and Knip full1/prod2 unchanged. Same HOST CHECK Oct 20 host
  `eef58c88…`: BORROW navigation/meta-DB/public factories; MIRROR private forms,
  no generic component/modal SDK or Escape capture. No CSS/music/DSP/feature/
  version/stage/commit/push/install/sibling/publication edits. Isolated Lab
  **0.2.13-lab.1** only; browser/host audio/navigation/Windows DI still owed.

- **Renderer spelling review fix (0.2.13 WIP):** configured tonic letters now
  remain independent of legacy non-diatonic parent signatures. F Lydian augmented,
  G Mixolydian b6 and B Locrian #2 retain F/G/B degree letters; inherited signature
  offsets are unchanged. **292→297 tests**, zero skips: three fail-first full raw
  ascending/descending canvas regressions, E#/B#/Cb octave scales and all 28 scale
  inventories (nine non-seven-step scales preserve legacy spelling, including
  pentatonic degree gaps). Historical fixtures unchanged. Strict core/shell/renderer
  types, lint 18 warnings, Knip full1/prod2, syntax/DAG/docs/brand/whitespace and
  source/Lab package checks pass. Isolated **0.2.13-lab.1** only; no extraction,
  feature, staging/publication/install/sibling edits or live-host certification.

- **Implementation-quality pass (0.2.13 WIP, 2026-10-20):** actual visual fixes,
  not another move-only claim. Minor/modal parents now preserve letter spelling:
  C minor uses Eb/three flats; standard diatonic modes use their relative major.
  Signature-aware staff spelling retains E#/B#/Cb with correct octave; unsupported
  theoretical signatures normalize to a standard ±7 spelling (double-accidental
  engraving remains unsupported). Clipped beam groups suppress flags/stems only
  for the same visible note objects actually beamed, including singleton fallback.
  Tab/Notation resize bitmap dimensions only on size/DPR change, resetting the
  transform each frame; Notation restores the formerly bitmap-reset line cap.
  `hand-marks.js` replaces duplicated candidate/spacing/simile thinning; sorting
  moves to init/note-array replacement. Tab separates fret/verdict paint from technique decorations.
  Tab **375→379**, Notation **594→571**, two pure helpers **101 LOC**: combined
  **+82**, not a net source shrink; entry remains **16,465**. Old resolveKeySig /
  beamedKeys and duplicated policy removed. `setMode`/combined/tab compatibility
  retained; removal explicitly deferred. **283→292 tests**, zero skips; four
  fail-first regressions, all-12-tonic/mode actual canvas, staff/beam/hand semantics,
  all 50 historical Tab sequences and seven unclipped G-major Notation opening
  scenes match with only approved resize/reset normalization. Historical 31 MB
  fixture is untouched evidence, NOT current full-byte identity; intentional
  spelling/beam deltas are tested separately. Current source/native/Lab equality,
  strict checkJs, lint **100 files/18 warnings**, Knip full1/prod2 pass inventory.
  Same HOST CHECK **2026-10-20 `eef58c88…` BORROW/MIRROR**; no host capabilities,
  DSP/grading/transport/CSS changes. Reserved source **0.2.13** already includes WIP
  runtime changes; no extra per-step bump. Isolated **0.2.13-lab.1** only; no stage/
  commit/push/install/sibling/published-dist edits. Browser fonts/DPR/live-host/
  MIME/cache/navigation/audio and Windows DI remain unverified; review owed.

- **Local Tab/Notation foundation (move-only, 0.2.13, 2026-10-20):** native
  `tab.js` (375 LOC), `notation.js` (594) and `display-policy.js` (75) own complete
  drawing/layout, HOPO, rhythm/beams, accidental spelling and hand-mark display.
  Entry **17,418 → 16,465 (−953)**; new owners **1,044 LOC** plus contracts **+43**,
  combined **+134**, not deleted implementation. Seven renderer files total
  **1,486 LOC**. Two live preference accessors retain entry's mutable theme/storage
  ownership; per-instance caches remain renderer-owned, transport/attachment do not.
  **280 → 283 tests**, zero skips; independently saved dirty entry pins full
  **31,361,838-byte** byte/deep-equal outputs/canvas sequences (29 generated bundles,
  21 raw annotated charts, 100 instances, 1,650 frames), direct native/source/Lab
  parity and exact **899** untouched IIFE statements/order. Strict DOM renderer
  checkJs, lint **97 files/18 unchanged warnings**, native DAG and Knip full1/prod2
  intentional findings remain. HOST CHECK **2026-10-20, host `eef58c88…`**: BORROW
  existing public viz factories; MIRROR local Tab/Notation until standalone general
  bundle-driven APIs publish. No setViz/player/WebSocket/Escape/grader/CSS/features,
  version bump or stage/commit/push/install/sibling/dist changes. Isolated temporary
  **0.2.13-lab.1** only. Live-host MIME/cache/navigation, browser fonts/Tab/Notation,
  audio and Windows DI remain unverified; review owed.

- **Renderer integration foundation (0.2.13 preserved, 2026-10-20):** lower-shell
  `host-factories.js` owns call-time preferred/legacy capability/factory reads and
  the shared DOM-ID script loader + bounded publication polling; `selection.js`
  owns all existing factory/label/fallback decisions with explicit local factory
  dependencies. Independent `classic-2d.js` owns canvas geometry/paint and its
  resize listener, not attachment/transport. No new player/canvas, feature or CSS.
  Entry **17,758 → 17,418 (−340)**; four modules **399 LOC**, combined **+59**
  including contracts/JSDoc, not overall code deletion. Only verified inert
  `SBRIGHT` removed; lint debt **19 → 18**, dormant adapters retained.
  **275 → 280 tests**, zero skips: independent current-dirty **275,034-byte**
  host/selection/canvas before/after equality; exact **909** remaining IIFE
  statements/order; source/Lab public40/debug91 and existing lifecycle/hashes.
  Strict core/content + selective renderer checkJs, native DAG, lint/Knip inventory,
  syntax/docs/brand/legal/folder/ZIP gates pass. HOST CHECK: read-only host
  `eef58c88c315b59375926bbfc8740cd18cb958f9`, 2026-10-20 — **BORROW** registered
  factories; **MIRROR** private Classic 2D until a bundle-driven factory publishes
  ([evidence/owners](docs/plugin/code-map.md#current-owned-renderer-modules)).
  Attachment/clock/audio/credit/navigation remain jointly entry-owned. Isolated
  temporary Lab **0.2.13-lab.1** only; no stage/commit/push/install, siblings/dist
  edits or live-host/browser/audio/Windows DI certification. Review remains owed.

- **Developer-only dead-code foundation (0.2.13 preserved):** pinned Knip 6.42.1,
  explicit root/native-ESM workspace inventory, report-only full/production scripts
  and advisory source CI. Full report has **one export** (`startAtRootPc`, dynamic
  historical probe); production adds `practicePathwaySelection` (test/host-smoke
  helper). Zero other findings; neither export is safe to delete. All 14 entry
  unused locals audited; inert/pure candidates and dormant compatibility/host
  adapters distinguished in [development](docs/plugin/development.md#dead-code-inventory-report-first).
  **No runtime functions/imports/files or LOC removed**, no blanket ignores or fix.
  **273 → 275 tests**, zero skips; installed negative controls detect unused file,
  entry/module exports and root runtime/dev dependencies, retaining local use,
  lazy/side-effect imports and distinguishing regression-only production exports.
  Offline ci, lint (87 files, unchanged 19-row debt), core lint/checkJs, independent
  hashes/public40/debug91, source/Lab graph/legal/folder/ZIP, syntax/docs/brand/
  whitespace pass. No stage/commit/push/host install, sibling/dist edits or
  live-host/audio/Windows DI/remote-CI certification.

- **Developer-only lint foundation (0.2.13 preserved):** private pinned root
  tooling/lock, ECMAScript-2022 flat config and separate source CI; no runtime
  build/dependency or host installation. **198 unused entry import bindings +
  two test imports** removed; empty imports retain original module specifiers/order.
  Initializers, entry body, startup/public40/debug91 and existing independent
  generation/session hashes unchanged. **270 → 273 Node tests** pass; offline
  npm ci, lint (86 first-party files), core lint, strict noEmit typecheck and
  docs/brand/whitespace gates pass. Lint blocks new diagnostics, retaining 19
  explicit debt rows (14 entry unused non-import bindings, three duplicate keys,
  one filename regex, one guide-tone initializer). No blanket warning-only pass
  or auto-fix; reviewed debt cleanup remains separate. Lab folder/ZIP excludes
  npm/config/scripts/caches. Dirty work preserved; no stage/commit/push/install,
  sibling/dist/publication edits or remote CI/live-host/audio/Windows DI claim.

- **Complete session foundation (move-only, 0.2.13):** native `session.js`
  owns generation through segment/default/BPM-ladder/per-block backing/timeline
  and length-preset owners; passive content owns all 65 mutable templates.
  Pure data-only `refreshWorkout` moved, UI draft/edit/refresh handlers did not.
  Entry **18,813 → 17,758 (−1,055)**; nine new modules **1,110 LOC**, largest 439;
  combined source **+55** including imports/JSDoc, not overall code deletion.
  All **51 core + three content JS** pass strict cached checkJs; **264 → 270 tests**.
  Independent dirty-entry **42,443,466-byte** capture remains byte/deep equal:
  356 session/bundle attempts (354 successful, two preserved empty/unknown-ref
  errors), all 25 built-ins, 277 variants across 65 templates, 31 palettes,
  12 guitar/bass mixed ladder/cycle/target/break/seed cases, eight tuning cases,
  three edges and 595 helper calls. Old fixtures unchanged; source/Lab pin full
  hashes, direct native identity and per-block timing/backing/offset semantics.
  Shared graph uses vendored MIT Acorn 8.18.0 (dev only, never packaged), fixing
  both exact call-then-block/object-division review misses. ECMAScript 2022;
  unsupported syntax/computed imports fail closed. Core→passive-content allowed,
  content→core/shell forbidden. No runtime dependency/build or new features.
  `makeBundle`, `readConfig`, live-tier run targets, draft/store/UI, launch/cache/
  lifecycle and guards/public40/debug91 publication remain entry-owned.
  Known NaN-BPM backing and nonpositive ladder-step loops may not terminate:
  not invoked/fixed here. Syntax/DAG/checkJs/docs/brand/whitespace/legal/package
  gates pass; isolated temporary Lab **0.2.13-lab.1**, existing dist/siblings untouched.
  No stage/commit/push/install/Markdown migration or live-host/audio/Windows DI claim.

- **Complete exercise-core batch (move-only, 0.2.13):** `generateExercise(cfg)`
  now lives in native `src/core/exercise.js` with all 40-type dispatch, individual
  builders, key-cycle/Jam assembly, motif/strum/fingerstyle engines, shared chord
  timeline, voicing, comp/bass/drum backing, arrangement/profile data and feel.
  No host/DOM/storage/fetch, upward imports, state owner or callback factory.
  Session/Workout materialization/orchestration remains in entry; `makeBundle`
  is still the first shell step. All guard calls and public40/debug91 publication
  remain synchronous and in original order. **22,083 → 18,813 (−3,270)** entry
  lines; 20 new modules **3,735 LOC** plus prior-module JSDoc refinements.
  **260 baseline → 264 Node tests**, exact current-dirty before/after captures:
  unchanged 961 charts/exercises/bundles + 25 Workouts; 1,512 grip/196 builder/
  252 motif/120 timeline/60 voicing/7 edge rows; 186 backing configurations,
  all 71 comp/bass/drum variants and **93 valid Jam charts (31 styles × 3 band
  modes, switch-up/spotlight)**. Older fixtures never recaptured.
  All **43 core JS + two content JS files** now enter strict cached checkJs;
  entry/shell remain untyped. Shared developer-only cfg/chart contracts have no
  runtime initialization. Source/Lab graph checks share a dependency-free lexical
  scanner covering side-effect imports, reexports, literal dynamic imports and
  template interpolation; computed imports/non-relative/upward/cycles reject.
  No installed parser/compiler is required by tests. Existing NaN-BPM backing
  loops can fail to terminate: deliberately excluded from new backing calls,
  observed separate defect—not fixed here (nor known 3NPS fret-51 behavior).
  No version bump/stage/commit/push/install/publication/sibling edits; existing
  dist untouched, isolated local Lab **0.2.13-lab.1** verification only.
  Live-host/module-cache/navigation/audio/Windows DI certification remains owed.
  Final module syntax, cached checkJs, source/Lab DAG, docs/brand/whitespace,
  mirrored guidance, exact snapshots and isolated Lab folder/ZIP rebuild pass.

- **Generation foundation batch (move-only, 0.2.13):** thirteen native core modules
  own seeded randomness, sequence emission, positions/bass fingering, chart grids,
  harmonic quality/root resolution and chord geometry, plus complete scale,
  chord-scale, arpeggio/sweep, technique, tapping, guide-tone and bass builders.
  **36 exercise builders** moved plus the internal harmony-run helper;
  existing chromatic Custom/Workout and authored Warmup remain unchanged.
  Entry **24,657 → 22,083 (−2,574)**; new modules **2,759 LOC**, net **+185**
  (imports/JSDoc/spacing, not deleted implementation), largest module 422 lines.
  **256 baseline → 260 Node tests**; independent dirty-entry capture covers
  **961 raw charts + 961 exercises/bundles** (931 valid each, 30 preserved errors),
  all 40 types/seven setups, guitar shapes, bass positions, key cycles, six Jam
  runs and all 25 Workouts. Direct native imports cover 37 dispatch cases.
  Older fixtures and **40 public / 91 debug keys** unchanged. Five new modules
  join strict cached checkJs; other moved modules still owe full JSDoc checking.
  **Remaining:** dispatch/session/key-cycle/Jam orchestration, backing/timeline,
  motif and strum/fingerstyle. These are pure dependency debt, not
  inherently host-coupled; no callback factory hides their unmoved dependencies.
  `makeBundle`, readConfig, state/player, guard calls and synchronous publication
  stay in entry. No features/version bump/stage/commit/push/install/sibling edits;
  live-host/audio/Windows DI certification remains owed. See the current
  [owned module map](docs/plugin/code-map.md) and [tests](docs/plugin/testing.md).
  Syntax, cached checkJs, source/Lab DAG, links, brand/whitespace and isolated
  temporary **0.2.13-lab.1** folder/ZIP rebuild pass; existing dist is untouched.

- **Move-only chromatic builder (0.2.13 preserved, not published):**
  `src/core/builders/chromatic.js` (71 lines) owns the exact builder and two mutable
  pattern tables; shared `notes.js` (14), `stroke-policy.js` (164) and timing's
  `wholeCycleStepCount` supply pure prerequisites. No RNG/generic fingering/chord
  dependencies; Custom/Workout still share it despite authored Ladder Warmup.
  Entry **24,875 → 24,657 (−218)**; new modules 249 + timing 11 gives **+42 combined**
  this slice. HEAD 27,248 → 24,657 (**−2,591 combined dirty WIP**, not deleted LOC).
  **253/253 → 256/256 Node**: independently captured 218 raw charts + 218 whole
  exercises/bundles, 10 Workouts, 28 helper/19 edge calls match exact bytes/deep
  snapshots and pinned hashes. Older 71/24/shape fixtures and 40/91 keys unchanged.
  CheckJs, syntax, DAG, links, brand/whitespace and local **0.2.13-lab.1** folder/ZIP
  pass. Dispatch, bundling, guards, RNG/grid/fingering and other builders stay in
  entry; no fixes/features, version bump, sibling edits, stage/commit/push/install.
  Live-host/browser/audio/Windows DI acceptance remains owed.

- **Move-only fretboard-shape core (0.2.13 preserved, not published):** whole
  unified five-shape CAGED table, seven 3NPS definitions/cycles and 16 pure
  helpers/resolvers moved to `src/core/fretboard-shapes.js` (417 lines), importing
  only scale intervals. Entry **25,261 → 24,875 (−386)**; entry + module **+31**
  this slice; HEAD 27,248 → 24,875 (**−2,373 combined dirty WIP**).
  Actual dirty pre-move runtime: **2,600 resolver + 385 helper/edge cases and 76
  scale/arpeggio exercises** match exact serialized/deep snapshots and pinned hashes.
  **249/249 baseline → 253/253 Node**; unchanged 71-case corpus, 24 Warmup charts,
  40/91 keys, synchronous shape pointers and boot guards. Narrow checkJs, syntax,
  module DAG, links, brand/whitespace, legal/withdrawn assets and local
  **0.2.13-lab.1** folder/ZIP pass. Form sync, current-shape adapter, instrument
  defaults, labels, state/cache helpers and chord-template/voicing consumers stay
  in entry; no player/backend/Markdown migration. Bass remains position-based.
  No new behavior fix, staging/commit/push/install or sibling/publication edits;
  live-host/browser/audio/Windows DI review remains owed. Existing raw low-level
  3NPS reaches above fret 24 in 195 captured cases (max 51); preserved, separate
  review/fix only if approved, not blanket unusual-scale/tuning playability certification.

- **Move-only instrument/tuning core (0.2.13 preserved, not published):** seven
  `STRING_SETUPS`, 26 `TUNING_PRESETS` and seven `TUNING_TO_SETUP` mappings plus six
  pure helpers moved to dependency-free `src/core/instrument-tuning.js` (152 lines).
  `screen.js` **25,396 → 25,261 (−135)**; HEAD 27,248 → 25,261
  (**−1,987 combined dirty WIP**); entry + new module **+17 lines** this slice.
  Independently captured dirty-runtime table/helper hashes and full snapshots match;
  **246/246 baseline → 249/249 Node**, unchanged 71-case corpus, 24 Warmup charts
  and 40/91 API keys. CheckJs, syntax, links, brand/whitespace and local
  **0.2.13-lab.1** folder/ZIP pass. DOM/storage/fetch/defaults and state-coupled
  tuning adaptation remain in entry; no Python/backend/shape/schema migration.
  Existing fractional `midiToNoteName` returns numeric NaN: preserved, separate fix
  only if approved. No staging/commit/push/install or sibling/publication edits;
  live-host/browser/audio/Windows DI review remains owed.

- **Move-only Workout registry (0.2.13 preserved, not published):** all 25
  `BUILT_IN_SESSIONS` entries moved verbatim to dependency-free
  `src/content/workouts.js` (339 lines). Fixed exported binding, ordinary mutable
  data; template materialization, draft cloning and synchronous publication stay
  in the entry. `screen.js` **25,732 → 25,396 (−336)** this slice;
  committed HEAD 27,248 → 25,396 (**−1,852 combined dirty WIP**).
  Dirty pre-move entry/data SHA and ordered IDs pinned; independent full snapshots
  match exactly. **243/243 baseline → 246/246 Node**, unchanged 71-case corpus,
  all 25 session outputs, 24 Warmup charts and 40/91 API keys. Narrow checkJs,
  syntax, links, brand/whitespace and local **0.2.13-lab.1** rebuild pass.
  No Markdown workout migration, version bump, staging/commit/push/install or
  sibling/publication edit; live-host/browser/audio/Windows DI review remains owed.

- **Move-only registry extraction (0.2.13 preserved, not published):** all 151
  remaining static PATHWAYS definitions moved unchanged to dependency-free
  `src/content/pathways.js` (1,651 lines). Exported mutable object identity survives
  existing Warmup hydration; guards, closures, publication and initialization
  order remain in the entry. `screen.js` **27,378 → 25,732 (−1,646)** this slice;
  committed HEAD 27,248 → current 25,732 (**−1,516 combined dirty WIP**, including
  prior Markdown/reviewer changes). Pre-move dirty-entry SHA/151 IDs/full data hash
  pinned; full managed-temp snapshots match exactly. **240/240 → 243/243 Node**,
  unchanged 71-case corpus and 24-case Warmup fixture; checkJs, syntax, docs, brand
  and whitespace pass. Local Lab target remains **0.2.13-lab.1**; no new migration,
  version bump, commit/push/install or sibling/publication edits. Live-host review owed.

- **0.2.13 one-Ladder Markdown pilot (not published):** preserves all dirty 0.2.12
  fixed-variant work. Only `chromatic_warmup` is hydrated from the authoritative
  practice index and format-3 Markdown (goal, cue references, six variations,
  four tiers, twelve fully serialized charts). Existing progress/prerequisite IDs
  and shared Custom/Workout chromatic builder remain. Standard six-string guitar
  ONLY: alternate-tuning compatibility is intentionally lost, never auto-retuned.
  Captured all 24 original live pre-migration raw charts/bundled notes before edits;
  comparisons preserve every note flag, exact timing, grid, duration and metadata.
  The existing shell run-target tiling/count-in remains; no new player/judge.
  Async catalog hydration is independent of DOM binding; public/debug publication remains
  synchronous. Catalog failure omits the unavailable lesson with an explicit status,
  leaving generated practices usable. Source/Lab mocked lifecycle tests cover
  actual boot stalled/error/timeout/navigation, all chart selections, view/tuning
  recovery and stale readiness. Requests/body reads abort after 10 seconds. Warmup
  is disabled until ready; normal modes bind immediately. Credit captures rendered
  run identity/density: quarter90 cannot clear eighth Push; stale pickers cannot
  redirect credit and Custom BPM matching excludes this authored rung.
   Final reviewer fixes preserve pending default/saved Warmup without persisting a
   substitute; hydration applies once only while the visit/selection still owns it.
   Failure keeps saved intent; navigation/error retries catalog IO on re-entry,
   stale completion cannot poison retries, and successful hydration is cached.
   **191/191 baseline → 205/205 pilot → 221/221 → 240/240 reviewer fixes**; checkJs, syntax,
  doc links, brand and whitespace pass. Live-host/specialist review stays owed. No staging,
  commits, pushes, install or sibling/publication edits; Lab target 0.2.13-lab.1.

- **0.2.12 fixed-variant WIP (not published):** formatVersion 2 requires an
  authoritative variants array; old root notes/duration intentionally rejected.
  Chromatic warm-up retains its ID/title with low-E frets 1–4 and 5–8, finger
  and alternating-pick hints. Variant selector + wrapping Next stop/load at zero,
  retain tempo/count-in, never autoplay, and preserve selected ID through tuning
  mismatch. All siblings validate before loading; stale readiness cannot reclaim
  the current chart/hint. Existing loader/player HOST CHECK below is reused,
  no new capability, scoring/XP tier or Learn work. Source starts clean at
  `485f657`; publication `ac8fc44` and dirty modules sibling remain untouched.
  Local Lab rebuild targets **0.2.12-lab.1** only; no commit/push/install.
  Reviewer follow-up: screen return regenerates normal current config once per
  visit after clearing abandoned file ownership, never auto-starting audio.
  Variant switching clears cursor/A–B state before validation/readiness; renderer
  completion no longer clears a newer user loop. Real source/Lab host-event
  leave→return and delayed re-entry/failure regressions cover these boundaries.
  Verification: **172/172 baseline → 185/185 → 191/191 Node tests**, unchanged 71-case
  source/Lab corpus and 40/91 API keys. Live-host/browser/audio/DI and specialist
  review remain owed; no host was started or installed.

- Approved first [Markdown file practice](docs/plugin/practice-files.md) is a
  local combined **0.2.11** candidate on the existing extraction branch;
  prior 0.2.10 chord/timing work is preserved. Custom → File practices loads one
  standard-six-string chromatic lesson into the existing contained player.
  Explicit duration, exact JSON notes, tempo scaling, no backing/refingering;
  unsupported techniques/tuning fail. HOST CHECK: BORROW generic static assets
  (`feedBack` eef58c8, `plugins/__init__.py:2492–2520`, 2026-10-20) and current
  player/judge; BUILD strict parser/adapter, no Markdown API/editor/player.
  Flip if a documented reusable host parser/editor adapter appears.
  **2026-10-20: published reviewed 0.2.11-lab.1** to personal-fork `main` only,
  via authorized nonforce SSH, replacing `5ca4f45` with
  `ac8fc44e2a3c0388dc5c936427dc6c85d492b802`. Generated from local source
  `1a6a1ecfbeb913b72c46625045c02335b6a149e5`; SOURCE map records that revision.
  Dirty modules sibling, source `main` and upstream remain untouched.
  Host/UI/audio/DI acceptance is still owed; publication does not install.
  Review fixes: retain the authoritative file through incompatible Setup and
  auto-rebuild on compatible edits; generation/renderer ownership guards both
  resolver and ready awaits, stale cleanup and final UI/transport changes.
  Return recomputes current Advanced eligibility. Normal renderer attachment
  shares these race fixes; no scoring or version change.
  Follow-up fixes cover per-string tuning recovery and normal-type exit after
  mismatch. Jam/Workout honor canceled attachment and retain ownership through
  voice warming; Stop cancels pending starts, including ordinary Play.
  Verification: **72/72 follow-up baseline → 172/172 Node tests**, unchanged 71-case source/
  Lab corpus and 40/91 API keys; cached narrow checkJs, syntax, links, brand and
  whitespace pass. Lab folder/ZIP rebuilt. Prior browser npm test exits 2
  (no host :8765); no host start/install. Source and actual publication checks
  passed again: **172/172 each**, unchanged 71-case corpus, exact 488-file
  generated inventory, all 12 vendor files/full licenses and withdrawn assets absent.
  Remote SHA verified; 18 commit-pinned runtime/practice/source/legal resources
  return HTTP 200 and match local bytes, manifest **0.2.11-lab.1**. All three
  settings source/license/notice links return HTTP 200. No moving raw-main cache
  claim or installed-host/Windows acceptance is inferred.

- Local development branch: **`dev/modular-source`**, source ID **`virtuoso`**,
  manifest/header **0.2.13** (local Ladder pilot WIP), based on
  `485f657`. No stable promotion is implied.
- Native module entry retains the strict IIFE and synchronous API/debug/boot
  order. Pure mutable pitch, scale-interval, chord-theory and timing leaves are extracted into `src/`;
  no runtime build, loader or generation redesign.
- Established functionality: Ladder, Custom, Workout and Jam; one contained
  transport/audio lifecycle; four rendering choices; procedural backing;
  presets/tunings, progression and host-consumed note_detect verdicts.
- Generated personal-fork `main` is **Virtuoso (Lab)** / `virtuoso_lab` /
   published **0.2.13-lab.1**, not this complete development checkout or upstream `main`.
  Installation and isolation limits: [Lab guide](docs/plugin/virtuoso-lab.md).
  Candidate **0.2.9-lab.1** adds attribution/legal notices and preferred vendor
  source. **2026-10-20:** removed all 61 8ridgelite OGG recordings and the Deer Ink
  Studios V30 WAV; unverified scope/mapping is not claimed resolved by licensing.
  Stored DI pins migrate to Shinyguitar; Metal uses the existing procedural cab.
   **2026-10-20: review fixes were experimentally published** at `5ca4f45`.
   Reviewed **0.2.11-lab.1** combines the extraction and Markdown practice update;
    prior publication was `ac8fc44`; latest is `6d8ede9` / 0.2.13-lab.1,
    with installed Windows acceptance outstanding.
  See [third-party notices](THIRD_PARTY_NOTICES.md) / [pinned evidence](SOURCE.md).
   Source commits stay local on `dev/modular-source`; source `main`, upstream
   and the dirty modules sibling remain untouched. Publication does not install.

## Verification and release gates

- Refactor 2026-10-20: **23/23 baseline → 33/33 source Node tests** passed;
  deterministic 71-case committed-baseline corpus, module/namespace/ZIP checks,
  fatal startup-assert and raw note-time mutation controls. See
  [testing authority](docs/plugin/testing.md); discover tests dynamically.
- The Windows user's installed Lab “seems to work” is **preliminary user-reported
  functional smoke**, not all-render/audio/detection regression acceptance.
- Still owed: installed-host module MIME/loading/cache/re-entry, navigation,
  renderers, loop/transport, audio/output and verifier acceptance; Windows
  audio-interface/DI checks on the actual installed desktop; a verified released
  host support floor. Source inspection and mocked scoring cannot certify these.
- Browser suites require a running host and Playwright; Python route-runtime
  tests require their dependencies. Report unavailable checks, never infer green.
- No merge/upstream stable promotion until running-host gates pass. Keep manifest
  and header versions equal for any subsequent shippable runtime change.

## Next work

1. User updates Lab and confirms installed **0.2.13-lab.1**. Test Custom → File
   practices → Chromatic warm-up on standard six-string guitar: low E frets 1–4,
   both variants/Next, tempos 30/60/120, Play/Pause/Stop/count-in/loop, tuning recovery,
   Return/normal type/Jam/Workout/view/navigation transitions and host judging.
   Ladder Warmup variations/tiers and Workout edit/navigation-return/BFCache.
   See the standalone [Lab guide](docs/plugin/virtuoso-lab.md). Windows DI remains owed.
2. Complete installed Lab runtime acceptance and record host/detector versions
   and evidence before selecting a supported release floor.
3. Review the remaining host-coupled entry after the completed exercise/session,
   content, renderer and Workout foundations; do not repeat already completed
   random/tuning/shape extraction. Startup guards stay in entry. Preserve ordinary mutability,
   core purity, no-unison, dependency direction and baseline behavior.
4. Reconcile integration with current upstream and the separate Learn work only
   with authorization; do not touch dirty sibling branches as part of docs work.

## Retained design backlog (not automatic build authorization)

Unfinished and mixed-status specs remain in [plugin/design](docs/plugin/design/index.md):
Programs, Ear mode, role-aware tracks, genre/vocabulary/realism improvements,
theme framework and mixed shipped/deferred Jam, rhythm, triad and bass work.
Read each status and verify current source before acting. Do not reinstate the
obsolete local judging or main-player/Escape launch proposals in the archive.
Gold improv conformity/gained-only passport plumbing exists, but `GOLD_BAR`
values remain placeholders pending on-device detector-owner tuning. Real desktop
badge/profile behavior, open-tuning fingering quality, extended-range CAGED
continuation and future piano generation likewise need explicit follow-on review,
not inferred completion from old handoffs. The old consume-note_detect-card task
was dropped; current code keeps Virtuoso's local renderer.

Standing boundaries: borrow-before-build host checks; competency, not a public
count-wall; source citations/licensing retained; public name clearance remains
a historical governance question to recheck before wider promotion. No current
claim of trademark clearance, remote PR state or release certification is made.

## Session handoff

Removal verification (2026-10-20): **23/23 Node tests**, including the
71-case source/Lab characterization corpus, package/ZIP/source-graph checks,
verbatim legal/vendor-source retention, player reconstruction and legal UI links.
New rows assert no withdrawn recordings in source/Lab/ZIP and exercise the real
source/Lab mixer restore, bank lookup, amp selection and procedural cab chain.
Local Markdown links, module/tool syntax, cached TypeScript checkJs, mirrored
guidance and brand/whitespace checks pass. TypeScript 5.9.3 rebuilds the pinned
WebAudioFont preferred sources byte for byte; all 28 FluidR3 presets exactly
match pinned official upstream downloads. OFL files remain unchanged.

Publication plan approved 2026-10-20: regenerate
`../virtuoso-lab-dist/virtuoso_lab/` and its ZIP from committed source, replace
the prior publication tree at `cde5bb8939`, remove all **62 uncertain assets**,
and publish **0.2.9-lab.1** to the personal fork's `main` only. Narrow vendor
dist ignore exceptions retain the reviewed player alongside all preferred sources.
Browser `npm test` previously exited 2: no host reachable on port 8765.
Python route-runtime/desktop/DI gates remain owed; no launcher or installation
is authorized. Python `pytest` previously could not collect because
`fastapi` is absent. Recording scope/mapping blockers in
[SOURCE.md](SOURCE.md) are now addressed by removal (2026-10-20), not a grant.
Published 2026-10-20 via nonforce SSH to personal-fork `main`:
`5ca4f45564daf5a2b05808546a0ce9e46354553b`, generated from local source
`afacd2fa1a003b5d90b9e3c20a535daf48af3d3a`. Remote SHA verified. Publication
tree has all 12 vendor files and complete license/source notices; 62 withdrawn
assets are absent. Publication 71-case corpus, real audio migration/cab probes,
exact generated inventory and TypeScript 5.9.3 vendor/Lab rebuild passed.
All three settings GitHub links return HTTP 200; eight commit-pinned public
runtime/legal files match local bytes, including manifest 0.2.9-lab.1. Raw
`main` source/legal/settings/README/player files match; raw `main/plugin.json`
remains cached at 0.2.8-lab.1 after one targeted retry. Removed commit-pinned
OGG/WAV URLs return 404. Source `main` and modules sibling remain unchanged.
No legal or live-runtime/desktop/DI certification is made.

Keep current state/next work here, durable technical procedures in plugin docs,
and completed session narrative in the archive. Commit/push only when asked.
