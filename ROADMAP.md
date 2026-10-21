# Virtuoso — current work

Read this with [repository guidance](AGENTS.md) and [docs/index.md](docs/index.md).
Old upstream release stories, PR states and handoffs are preserved as
[nonactionable development history](docs/archive/development-history.md).

## Current source state

- **Snapshot/baseline cleanup (2026-10-21; unverified):** removed committed
  extraction captures, fixture-driven golden comparisons, capture helpers, and the
  core fixture-generation command. Direct semantic, property, import-safety,
  lifecycle and packaging tests remain. Historical test-count/capture narratives
  were retired from the testing/native-module guides. Node/npm are unavailable in
  this environment, so syntax/full-suite gates have not run; `git diff --check`
  is the only completed repository gate. No commit/push requested or performed.

- **Strict entry typing continuation (2026-10-21; unfinished):** TypeScript
  5.9.3 entry diagnostics **130→80** via narrow JSDoc typing at verified guards
  and existing ownership boundaries. AST, renderer and transport golden pins
  remain unchanged and pass; focused entry-types/renderer/transport tests **54/54**,
  root core+shell typecheck, entry syntax and whitespace pass. Entry still exits 1
  with 80 diagnostics. Full `npm test` has not completed (prior run timed out after
  183 passes); this environment lacks system `zip`/`unzip`, so local temporary
  shims were used for the focused Lab tests only. No fixture/hash recapture or pin
  weakening. More diagnostics and full-suite verification remain unfinished; no
  stage/commit/push/install/publication/host actions.

- **TS18047 nullable closure/state correlation batch (2026-10-21; parent-bounded
  group):** strict entry **233→205** (−28: TS18047 **75→51**, TS2339 **29→26**,
  TS2538 **4→3**; every other code count unchanged) on TypeScript 5.9.3, exact
  per-code counts in `coverage/typecheck-entry.json`. Correlated nullable
  state/closure reads resolved with **13 single-line JSDoc casts** truthfully
  derived from the same-run guards (`s.feltResult`×3, `s.clearedTier`, `s.ladder`
  snapshots ×4, `s.chapters`×3, copy-diag `ev.target`/`ev.currentTarget`,
  `document.activeElement` blur) plus **7 audited runtime guards** (count-up
  `!el || !el.isConnected || pct === null`, pack dragstart/dragover×2/drop×2
  `dataTransfer` snapshot returns, woodshed `lv.nextAt != null` correlation);
  each guard only degrades an unreachable-path throw into a no-op, valid paths
  render/copy/drag identically, captures stay pinned, and closures keep their
  late current reads (no early stale cache). The seven guards and the casts are
  reversed in the audited `normalizeEntrySafety` recipe list, preserving the
  **5 golden pins** without recapture — typing-foundation AST `10f4e440…`,
  statement order, selection, transport, renderer pins all pass. Deferments
  hold: TS2538 7078:58/8489/13541 (nullable numeric array indexes, the `?? -1`
  rewrite stays deferred for the parent fixture-recapture round) and TS7053
  `styleVoiceFor` 5422 remain; no touched site degraded into a new code
  (pre-batch reconstruction diff verified). **408/408** full Node26.12.0 tests,
  lint 132/0 new-error/1 known warning, root core+shell tsc clean, entry
  syntax, doc-links, brand hygiene, whitespace pass. No stage/commit/push/
  install/host/sibling/dist edits; entry still exits 1 with the remaining 205.

- **Reverted TS2538 batch / verified recovery (2026-10-21; batch closed):** the four
  lookup-equivalent TS2538 edits from the deferred-index batch (TIER_LABELS/ladder
  `?? -1` narrowing, `typeof dur` drum-duration narrowing, `PROOF_TRANSFER`
  `String()` coercion) were reverted exactly after they broke the **5 golden SHA
  pins** (typing-foundation, transport-events, renderer-extraction,
  entry-statement-order, selection-order) — the pins failed because code edits were
  **not normalized with the fixtures, NOT pre-existing** in the dirty tree; the
  earlier "pre-existing" journal claim was a wrong HEAD-reconstruction reading and
  is corrected in [testing](docs/plugin/testing.md). The prior last-approved
  408-test pin-clean state is preserved without pin/fixture recapture. Re-verified:
  `npm test` **408/408**, `test:properties` **4/4** at both seeds20261021/271828
  (Node26.12.0), root core/shell tsc clean, lint 132/0 new-error/1 known warning,
  entry syntax + native module graph pass. Strict entry **233** (229+4 reopened
  TS2538 at 6741/7078/8489/13548), still exits1; TS7053 only deferred
  `styleVoiceFor` 5422. The four equivalent rewrites need a later review round
  with legitimate fixture recapture (all five pins regenerated with the fixes),
  **under the parent review workflow — not self-silently**. All other kept batch
  edits (TS7053 Record JSDoc records, approved `String(piece)` dictionary
  coercions, prior waves) unchanged. No stage/commit/push/install/publication/
  host/dist edits; no strict weakening or suppression banner.

- **Bounded nullable lookup batch (2026-10-21):** recovered supplied interrupted-wave
  checkpoint **406 tests / 254 entry diagnostics / 1 lint warning**; parent reports
  prior recovery review LGTM (not a new independent review). Actual TypeScript key/
  dictionary inspection addressed **17 of 21 TS2538**, strict entry **254→237**,
  TS2538 **21→4**, every other code count unchanged. Only known string|null/undefined
  dictionary keys now explicitly perform their existing JS string property coercion;
  null/undefined, empty, missing and inherited-key captures match. Deferred exact
  lines6739/7076 (nullable numeric array indexes),8487 (conversion exposed another
  argument diagnostic, reverted),13541 (finite proof-transfer dictionary needs wider
  key reconciliation). No fallback-empty, casts, strict weakening or audio/judge/
  articulation/timing/lifecycle feature changes. Before source SHA256 `8a5733b1…`;
  before/after normalized complete AST remains `10f4e440…`, original fixtures unchanged.
  **408/408** full Node24.19.0 tests pass; seven properties/700 cases pass default
  seed20261021 and alternate271828; focused nullable positive/negative controls pass.
  Native/root types, lint132/one existing warning, syntax/docs/brand/whitespace pass;
  full suite includes isolated Lab563/legal/ZIP/graph/parity checks. Source14, versions,
  runtime module inventory and public/debug surfaces unchanged. No stage/commit/push/
  install/host/sibling/existing dist edits. Entry remains outside root checking and
  exits1; remaining237 and live host/Windows DI are explicitly unfinished. Batch stopped.

- **Entry wave6 owner contracts + bounded form guard (2026-10-21; unfinished):**
  strict entry **346→284 (−62)**, unchanged TypeScript5.9.3 strict flags; reporter
  still exits1 and entry remains outside normal/root checking. Rolled segments
  require the cfg their owner always creates; bass figures distinguish generators
  from complete patterns; resolved audio voices distinguish defaults from authored
  partial profiles; drum FX require their actual shelf/compressor nodes. Exact
  authored control lists carry verified tag/data metadata; starter arrays describe
  the result of existing Boolean filtering. One explicit runtime delta rejects
  non-control form events before delegated queries. Fail-first source test observed
  two queries versus zero expected; source/Lab now reject them. Existing valid
  cfg/events, historical AST/public40/debug91, audio/clock/corpus and Lab legal/ZIP
  captures remain unchanged without recapture. Independent CURRENT DIRTY source
  `c024de3c…` was saved before edits; whole AST matches after exact named guard reversal.
  Source **14,939→14,946 (+7)**; declarations **473→491 (+18)**; no runtime module added.
  Remaining284:144 nullable,30 property,42 argument,47 nullable-index,2 dynamic-index
  and19 other diagnostics.
  Local verification: **405/405** at both property seeds20261021/271828, zero
  skips/cancellations, Node24.19.0 (seven properties/700 cases per seed); named/root
  native types, lint132/four unchanged warnings, core81/zero warnings, first-party
  syntax, docs/brand/whitespace and isolated Lab legal/folder/ZIP/parity pass.
  Knip full1/production2 retain their intentional nonzero findings. This is not
  remote CI, live host or Windows DI certification. Full-entry zero/root integration,
  continued contract
  reconciliation, parent review and running-host/audio/Windows DI remain owed.
  Source14/published13 and HEAD unchanged; no stage/commit/push/install/host/sibling/
  existing dist/publication edits.

- **Entry wave5 audit + DOM reconciliation (2026-10-21; unfinished):** strict entry
  **501→346 (−155)**; `typecheck:entry` still exits1 and remains outside normal/root
  checking. An intermediate166-diagnostic attempt was **not accepted**: its untested
  runtime changes were removed after provenance failures and a detector-fallback/
  nullable-articulation audit. Retained runtime deltas are only fail-first LCD
  target/value/blur guards and transient delegated widget target guards. Real source
  and isolated Lab tests cover absent/text/non-control targets, normal Enter/tempo
  commits and nested mixer toggle clicks. Historical AST, public40/debug91 and
  normal audio/clock/corpus pins are unchanged after exact safety reversal; no
  detector/DSP/credit/scheduling changes remain from this wave. Type-only changes
  reconcile numeric/null shape IDs, narrow actual chord/motif inputs, form
  `shapeNotes` ownership, DOM tag overloads/generated widget metadata, nullable
  stored coach focus and numeric mutable tables. DOM.Iterable supplies genuine
  browser iterator declarations without weakening strict flags. Source
  **14,916→14,939 (+23)**; fourteen developer declaration files **425→473 (+48)**,
  excluded from runtime packaging. Remaining346:178 nullable,39 property,55
  argument,47 nullable-index,6 dynamic-index and21 other diagnostics. Verification:
  **402/402**, zero skips/cancellations, Node24.19.0 at seeds
  20261021/271828 (seven properties/700 cases per seed); named/root native types,
  lint132/four unchanged warnings, core81/zero warnings, first-party syntax,
  docs/brand/whitespace and isolated Lab legal/folder/ZIP/parity pass. Knip
  full1/production2 intentional findings still exit1. The first full run timed
  out at20s; two subsequent runs exposed a negative-control count mismatch and
  concurrent-source-edit packaging mismatch. Final reruns pass without fixture
  replacement or relaxed assertions. These are static/source tests, not live QA.
  Full-entry zero/root integration, parent review and running-host/audio/Windows DI are still
  owed. Source HEAD and unpublished0.2.14 are unchanged; no stage/commit/push/
  install/publication/host/sibling/existing dist changes.

- **Entry wave4, contract + bounded safety reconciliation (2026-10-21; unfinished):**
  strict entry **752→501 (−251)**, cumulative **2,272→501 (77.9%)**, flags unchanged,
  command still exits1. RenderNote sustain is genuinely optional; lifecycle requires
  actual EntryExercise; transport preserves caller bundle type via generics; meter
  show-state/span metadata are discriminated. Source/Lab fail-first tests reproduce
  released canvas/context during resize, host navigation capability withdrawal,
  missing Play control and non-element delegated clicks. Explicit context parameters,
  bounded guards and once-read optional capability snapshots repair these paths.
  Normal paint/audio/event/corpus/API40/debug91/historical fixture outputs remain
  pinned; whole AST reversal is limited to exact reviewed safety edits. Undefined
  comparison guards only make existing no-op outcomes explicit; no DSP/judge/credit/
  timing policy changes or late-verdict filtering. **393→398 tests**, zero skips,
  full suites at both seeds20261021/271828 (seven properties/700 cases each);
  native/root types/lint132/four unchanged warnings and isolated Lab563/legal/ZIP pass.
  Entry **14,901→14,916 (+15)**, thirteen declarations425 lines. Remaining501 errors
  include252 nullable diagnostics,109 properties,80 arguments; no whole-entry pass.
  Full completion, parent review and live host/audio/DI remain owed. No stage/commit/
  push/install/version/host/sibling/existing publication/dist changes.

- **Entry typing wave3 (2026-10-21; unfinished):** exact baseline **1,210→752
  (−458)**, cumulative **2,272→752 (−1,520, 66.9%)**, unchanged strict configuration.
  Remaining implicit parameters **313→0**, implicit declarations/reads **22/32→0**,
  indexed accesses **78→25**, missing properties **233→116**. Explicit entry bundle/
  accompaniment/beat metadata, authored pre-form cfg, internal ledger writer and
  host tuning/frame contracts; audio/scheduler/transport/geometry/UI callbacks
  annotated coherently. Mutable workouts/roles/tuning/theme registries retain actual
  numeric/string record contracts. Literal DOM ID/selector/list overloads preserve
  nullable lookup and dynamic fallback. No guessed nonnull assertions, suppressions,
  any types, DSP/credit/timing/runtime statements or new imports/globals.
  **752 errors remain**, including **392 null/undefined diagnostics**, reported by the
  ignored entry report; command **exits1**, normal native/root types exclude entry.
  **392→393 tests**, no skips, both property seeds20261021/271828; full Node24 suites
  (seven properties/700 cases each) and source/Lab AST/statement/API/
  legal/ZIP pins pass. Entry **14,693→14,901 (+208)**; thirteen declarations **405
  lines**, not a shrink claim. Further extraction remains blocked on full typing;
  parent review/live-host/version floor remain owed. No stage/commit/push/install,
  version/publication/host/sibling/existing dist changes.

- **Entry typing wave 2 + power review correction (2026-10-21; unfinished):**
  removed invented `setPreventSleep`; verified desktop `00653cf4` exposes
  `setScreenAwake(keep)` and its main IPC handler returns nothing (**Promise<void>**,
  not the requested boolean). Correction **1,647→1,645**; continued unchanged-strict
  entry typing **1,645→1,210 (−435)**, cumulative **2,272→1,210 (−1,062, 46.7%)**.
  Internal session/results/felt/coach/share snapshots, mixer/drum/theme registries,
  form nullable cfg, exact form selectors and plugin-owned shape/coach debug fields
  now have explicit contracts. External persisted JSON is **not** certified/typed
  as validated state. Implicit params **605→313**, indexed accesses **159→78**;
  null/availability and inferred boundary mismatches stay visible, no suppressions.
  Full entry command still **exits1**, all 1,210 errors are in screen.js; normal
  native/root typechecks pass but exclude entry. **390→392 tests**, both seeds,
  zero skips; lint130/4 unchanged, core81/0, named/root types, isolated Lab563/legal/
  ZIP/parity and historical executable/statement/API pins pass. Entry **14,520→14,693
  (+173)**; ten declarations **333 lines**. No runtime statements/DSP/judge/audio/
  timing/publication changes, no stage/commit/push/install/host/sibling/dist edits.
  Further extraction remains deferred; full-entry zero, parent review and running
  host/version-floor validation remain owed.

- **Entry typing foundation (local 0.2.14, 2026-10-21; unfinished):** exact strict
  TypeScript 5.9.3 browser-entry diagnostics **2,272→1,647 (−625, 27.5%)**, same
  inherited flags/lib. `npm run typecheck:entry` now reproduces the complete check,
  exits **1** while errors remain and writes grouped full diagnostics to ignored
  `coverage/typecheck-entry.json`. Normal named/root typechecks still cover the 81
  native modules, **not** whole entry. Precise nullable literal DOM IDs, optional
  host/minigames/desktop/note_detect, bundle/chart, audio graph/cache and judgment
  records replace major implicit-state fan-out; no production suppressions or `any`.
  Complete executable AST equals independently saved dirty-before source; historical
  statement pins remove only new JSDoc trivia, not behavior/comments. Entry grows
  **14,365→14,520 (+155)** plus 171 declaration lines, not a shrink claim.
  Remaining **605 implicit parameters, 85 implicit reads, 41 implicit declarations,
  159 indexed accesses, 329 null/undefined and 276 missing-property diagnostics**
  require continued coherent typing before further extraction; this is **not** the
  requested zero-diagnostic milestone. Public40/debug91, synchronous publication,
  judging/audio/transport behavior and source14/published13 identities unchanged.
  **390/390 tests** pass both seeds 20261021/271828 (seven properties/700 cases per
  seed), zero skips; lint130/4 unchanged warnings, core lint/typechecks/root IDE,
  syntax/graph/docs/brand/whitespace and isolated Lab563/legal/ZIP gates pass.
  Host source evidence only; running host/version floor and parent review remain owed.

- **Complete unused-declaration cleanup (local 0.2.14, 2026-10-21):** all 128
  first-party lint files audited; 12 initial unused findings plus one newly exposed
  private label table removed. Entry unused diagnostics **11→0**, native **1→0**;
  full browser-entry TypeScript unused probe **12→0** (2,272 unrelated diagnostics
  remain; no full-entry typecheck claim). Unused bindings/parameters now errors
  everywhere; no underscore-local exemption, dummy reads or unused debt allowance.
  Lint debt **16→4** (only existing duplicate keys/control regex); core lint zero.
  Retired private card delegation adapters, kept owned card/save paths and public40/
  debug91 unchanged. Guide-tone key accessor evaluation retained without its binding.
  Entry **14,445→14,365 (−80)**; exact named statement removals pin saved dirty-before
  source, historical runtime fixtures unchanged. **383→386 tests**, zero skips;
  seven properties/700 cases pass both seeds, named/root types/syntax/docs/brand
  and isolated Lab14/563-file legal/folder/ZIP gates pass. Source-only verification
  and host limits are recorded in [testing](docs/plugin/testing.md); no publication/install/
  version/stage/commit/push/host/sibling changes. Parent review remains owed.

- **Unused callback guard (local 0.2.14, 2026-10-21):** results ladder `b` →
  `_tier` preserves the index slot; ESLint now checks **all** parameters with only
  intentional `_` argument slots exempted (catch policy unchanged). Eight newly
  exposed findings repaired: one private trailing parameter removed, seven
  positional/render/audio/mock signature slots marked. Existing 16-warning
  baseline and historical fixtures unchanged; narrow parameter normalization
  retains statement pins. **383 tests**, strict named/root types and lint pass;
  no version/publication/install/host/sibling/stage/commit/push changes. Parent
  review and live-host validation remain separate.

- **Bounded Pathway IDE fix (local 0.2.14, 2026-10-21):** authoritative mutable
  `PATHWAYS` has a shared JSDoc contract for all 151 static lessons plus hydrated
  Warmup, optional density arrays and precise partial authored base/variation cfg.
  Root `tsconfig.json` discovers the existing checked core/content/selected shell
  scope; main `screen.js` remains unchecked as a whole. Isolated strict browser
  diagnostics **2,366→2,282**, reported line1731 fields and all related missing
  density-property errors clear; unrelated entry typing debt is not hidden/fixed.
  **381→382 passing tests**, zero skips; strict named/root types, lint16, existing
  Knip1/2 findings and isolated Lab14/563-file packaging verified. Entry stays14,445;
  no runtime values/identity/version, stage/commit/push/install or host/sibling/
  existing publication/dist changes. Parent review remains owed.

- **Run transport foundation (local 0.2.14, 2026-10-21):** pure clock/run domain
  plus native `shell/run-transport.js` own playing/paused, cursor/start/dual-clock
  anchors, pause duration, resume runway, committed/authoring loop points and
  pending readiness→voices→start approval. All writers moved; entry reads live
  getters and keeps audio scheduling, host targets/verdicts, session credit/storage,
  wake lock and draw/RAF. Play/Workout/Jam share one start contract and lifecycle
  operation identity; no parallel cancellation counter. Fail-first repeated Play
  reproduced two voice preparations; one pending request now warms/starts once.
  Independent saved-dirty **15 rows / 70,054 bytes** retain exact audio calls,
  clock/target/status state; source/Lab parity and **782** normalized untouched
  statements pinned. **373→381 tests**, zero skips; seven properties/700 cases at
  both seeds. Entry **14,541→14,445**, owners **69+108**, combined **+81**;
  direct bindings **124→125**, native entry DAG79/all-source82, Lab **563** files.
  Strict types, lint16, Knip1/2 and coverage pass; no judging/DSP/timing/XP policy
  changes or host launch. Same Oct-20 HOST CHECK, transport BUILD/host judge BORROW.
  Source14 stays unpublished; installed13 smoke remains separate. Parent review
  and RUNNING HOST audio/cache/navigation/Windows DI validation are outstanding.
  No stage/commit/push/install, siblings or existing publication/dist edits.

- **QA2 renderer readiness corrections (local 0.2.14, 2026-10-21):** fail-first
  real source/Lab tests reproduce current held Play rejection escaping its handler;
  request-owned readiness catch now reports `Renderer failed`, remains stopped and
  never warms voices/starts targets. Old rejection after Stop/new render/new Play
  cannot overwrite status or destroy the new renderer/loop. Borrowed ready promises
  are observed immediately before draw/init validation/getters; malformed objects,
  throwing ready/init/draw/then getters retain rejecting attachment and exact-once
  cleanup, without unhandled rejection. Baseline **369→373 passing**, zero skips;
  six properties/600 cases pass both seeds. Strict types, lint16, Knip1/2, syntax/
  DAG77/all-source80, links/brand/whitespace and isolated Lab14/561-file gates pass.
  c8 **14,209/29,091 lines (48.84%)**, native owner **261/264 (98.86%)**, branches
  **128/149 (85.9%)**. Entry **14,541**, owner **264**, combined **+148** versus
  pre-owner 14,657 (bindings124 unchanged). No version/publication/install/host/
  sibling/stage/commit/push changes. Review-ready source fixes; live browser/audio/
  Windows DI acceptance remains outstanding, installed13 user smoke is separate.

- **Renderer attachment/readiness owner (unpublished 0.2.14, 2026-10-21):** native
  `shell/renderer-lifecycle.js` owns candidate/canvas/active handle, init/ready/commit,
  view readouts, exact-once destroy and resize/debounce/layout RAF teardown. One
  monotonic operation identity serves entry sink/voices/generation/start cancellation;
  selection still owns catalog/file/visit, entry retains full bundle/lastExercise,
  transport/audio clock/note_detect/credit/progress/L1. Existing UI publication and
  actual fallback cfg persistence unchanged. Fail-first Play race fixed explicitly:
  published candidate readiness must finish before voice warm/start. Throwing init
  readiness rejection observed; stale completion cleans only its own candidate.
  Baseline/checkpoint **348**, final **369 passing**, zero skips; 21 new tests,
  six bounded properties/600 cases at both seeds. Independent **17 operation rows /
  446,780 bytes** and previous cfg/selection/event captures match source/Lab;
  791 untouched statements pinned, all historical/API fixtures retained. c8 **80
  files**, **14,201/29,072 lines (48.84%)**; native owner 98.82% lines/86.09% branches,
  entry still zero-measured. Lint **16**, strict types/Knip1/2/syntax/graph/docs/
  legal/folder/ZIP pass. Entry **14,657→14,530**, owner **256**, combined **+129**;
  bindings **124→124**, real selection import replaced, not a size-win claim.
  Shared bundle derivation/host-fit resize and operation predicate remove duplication.
  Same Oct-20 `eef58c88…` HOST CHECK: BORROW preferred/legacy host viz factories at
  call time; MIRROR local fallbacks, private host 2D not a standalone API. DAG77/
  all-source80, isolated Lab **561** runtime files. No stage/commit/push/install,
  host/sibling/existing dist/publication edits. Published/installed **0.2.13-lab.1**
  unchanged; Oct-21 user smoke PASS does not cover local14. Parent review and live
  browser/font/cache/audio/host/Windows DI remain outstanding; clock extraction deferred.

- **Joint practice selection/load boundary (unpublished 0.2.14, 2026-10-21):**
  `shell/practice-selection.js` owns mode intent, rung/variation/tier/band state,
  pending first lesson, catalog/file requests, fixed-field eligibility, shape/scale
  controls and visit listeners. Plain `core/practice-selection.js` owns deterministic
  rung transitions, tier field realization and the shared mutable applicability
  table. Five semantic entry hooks plus the existing presentation dependency;
  no generic state machine/helper bag. Entry retains L1 adaptation/persistence,
  mode panels, renderer/ready/voice/clock/credit and progress storage.
  Independent dirty-before **24 cfg rows / 83,739 bytes**, **3,044 selection rows /
  9,850,708 bytes**, **10 event rows / 76,298 bytes** match full bytes and parsed
  output; source/Lab hashes and 805 untouched-statement pin retain provenance.
  Baseline **337**, checkpoint **347**, final coverage suite **348 passing**, zero
  skips. Five bounded properties/500 cases pass both seeds. Coverage **79 files**,
  lines **13,946/28,941 (48.18%)**; native controller 97.86% lines/78% branches;
  entry still zero-measured, not browser evidence. Lint **16** warnings, strict
  types/syntax/links/brand/whitespace pass; Knip full1/prod2 unchanged. Isolated
  0.2.14-lab.1 **560** runtime inventory files, DAG76/all-source79; ZIP verified.
  No autoplay; incompatible tuning keeps variant for recovery; failed file
  replacement still clears the old file. Request identity + visit + DOM ownership
  reject stale A→B→A; canceled unload/BFCache does not detach, confirmed SPA leave
  does. Physical entry **15,196→14,657 (−539)**, owners **375+44**, existing loader/
  catalog **+30**, combined **−90**. Bindings **127→124**, not one-line boot.
  Shared tier realization removes duplicate BPM/subdivision/bars policy; shared
  clear/reset and request guard remove repeated cancellation branches. Verified
  callerless `syncCagedButtonStrip` removed; no Knip-driven deletion.
  Same Oct-20 `eef58c88…` HOST CHECK: BORROW public navigation/settings/meta-DB,
  MIRROR inner forms. No new capability, Escape handling or host monkey-patch.
  Published/installed **0.2.13-lab.1 unchanged**; this local 0.2.14 is user-unverified.
  Parent ownership review and browser/host/audio/Windows DI remain outstanding.
  No stage/commit/push/install, host/sibling or existing publication/dist edits.

- **Developer coverage + properties (2026-10-21):** no prior partial tooling edits
  found; baseline **333**, now **337 passing Node tests**, zero skips. Four bounded
  properties / **400 generated cases** at fixed seed 20261021 and alternate 271828;
  real parser/generation/shape modules, no runtime or fixture changes. Pinned
  dev-only c8 12.0.0 / fast-check 4.10.2, ignored HTML/LCOV/JSON/terminal reporting
  and Node24 CI artifact visibility without a percentage gate. Local Node26 initial
  scope **77 files**, lines/statements **13,508/29,034 (46.52%)**, branches
  **4,325/5,121 (84.45%)**, functions **461/478 (96.44%)**. Data-URL entry stays
  zero-measured **15,196 lines** with synthetic function/branch placeholders;
  do not read native-only 97.61% lines as whole-plugin or entry coverage.
  External generated copies excluded, real child native imports merged; source
  provenance/type-only lines retained. Authentic entry attribution/tapping/branch
  gaps remain priorities. See [method and replay](docs/plugin/development.md#coverage-reporting-and-bounded-properties).
  Offline npm ci, strict types, lint **17** unchanged warnings, links/brand/whitespace
  pass; Knip full1/prod2 intentional findings unchanged. Native entry DAG **74**,
  all-source **76**, isolated candidate **558 files** with legal/folder/ZIP gates.
  No source/version/host/sibling/dist/publication, stage/commit/push/install changes;
  local unpublished 0.2.14 remains untested by user, remote Node24 CI and browser/
  host/audio/Windows DI unverified. Prior reviews are not repeated/claimed here.

- **Practice presentation owner (unpublished 0.2.14, 2026-10-21):** typed native
  `shell/practice-presentation.js` owns goal recognition/disclosure, cue/backing/
  tuning/PB/supports display, Position/variation readout, START transport labels,
  content description and Custom file prose/options/selected hint. All actual entry
  callers delegate directly; one view-scoped plain snapshot hook, no state/tools bag.
  Mutable PATHWAYS hydration stays live; authored titles/goals/hints remain textContent.
  Eligibility, form disabling, config-changing rung/variant/Next listeners, storage,
  grading/progression and ready/audio lifecycle remain entry-owned. No autoplay.
  Independent dirty source **3,044 rows / 9,850,708 bytes** (all 151 static pathways,
  24 hydrated Warmup combinations, 40 Custom configs) and **10 real-event rows /
  76,298 bytes** match full source and isolated Lab. **326→333 tests**, zero skips;
  strict types, lint **17**, Knip full1/prod2 intentional findings retained.
  Physical entry **15,443→15,196 (−247)**, owner **222**, existing prose owner
  **60→55**; combined **−30**, not just relocation. Optional-line writes share one
  implementation; repeated form cfg reads become one goal snapshot. Bindings
  **128→127** (three real dependencies removed, two owner bindings added).
  Latest native entry DAG **74**, all-source **76**, isolated Lab **558 files**.
  Same Oct-20 `eef58c88…` HOST CHECK: BORROW existing public navigation/settings,
  MIRROR private forms; no new SDK/CSS/API/security policy. Prior public40/debug91
  and historical fixtures retained. Local 0.2.14 remains untested by the user;
  installed/published 0.2.13 target unchanged. Browser/host/Windows DI and parent
  ownership review outstanding. No stage/commit/push/install or sibling/dist edits.

- **Configuration/preset/cue boundary (unpublished 0.2.14, 2026-10-21):** three
  internal checkpoints **315→319→323→325→326 source tests**, zero skips. Typed shell
  owns sole DOM→cfg reader, silent associated form writes/advanced disabling and
  ordered apply; plain core owns anti-leak prewrites and explicit cue selection,
  passive content owns mutable vocabulary. Saved-practice recall owns GET cache,
  both option destinations and visit listeners, no save/manage feature or autoplay.
  Explicitly cut HTML save button proves dormant private writer removal;
  lint **18→17**, strict core/content/shell/renderer types, Knip full1/prod2
  intentional findings. Separate async safety fix rejects old-request/abandoned
  visit/DOM writes; real source/Lab canceled-unload/reentry regression covers it.
  Independent dirty complete-entry **24 config/event rows (83,739 bytes)**,
  **6 preset rows (13,864 bytes)** and **3,776 cue rows (593,644 bytes)** match;
  small provenance fixture only, historical music/renderer/API40/debug91 retained.
  Physical entry **15,881→15,443 (−438)**, five owners **346**, combined **−92**;
  bindings **123→128**, actual dependencies explicit (no barrel/public-ref masking).
  Two preset option builders become one; L1/host shared writes, eligibility,
  full goal-card selection, readiness/audio/transport remain cohesive entry owners.
  Local 0.2.14 is unverified by the user; published/installed 0.2.13 target unchanged.
  No stage/commit/push/install, host/sibling or existing dist/publication edits.
  Final isolated **0.2.14-lab.1** folder/ZIP/legal checks pass; native entry DAG
  **73 modules**, including all five new owners; all-source inventory **75**,
  artifact **557 files**. Browser MIME/cache/BFCache/audio/Windows DI and parent ownership review
  remain outstanding; no independent running-host certification is claimed.

- **Tuning-settings ownership (unpublished 0.2.14, 2026-10-21):** native
  `shell/tuning-settings.js` owns saved cache/load/save, ordered preset groups,
  canonical/CSV selection, custom validation/seeding/writes and both original
  listener clusters. All entry callers use the owner, no proxy wrappers/barrels.
  Three option builders become one with exact built-in→host→saved priority.
  Five semantic hooks; entry retains L1/host persistence, eligibility, pathway
  recovery, `readConfig` and contained transport. SPA exit unmounts, return mounts
  once; stale dynamic inputs cannot write, canceled unload keeps listeners.
  Independent dirty pre-edit **0.2.14** complete-entry **24-row / 83,739 UTF-8
  byte** event capture matches full source and isolated Lab output after cleanup
  and lifecycle hardening; historical generation/Markdown/renderer/API pins stay.
  Physical newline counts (`wc -l`, split-newline length minus one): entry
  **16,128→15,881 (−247)**, owner **194**, combined **−53**. Prior 16,126 prose
  was historical, not this baseline. Import bindings **124→123**: remove two
  actual tuning-helper dependencies, add one controller; API-only imports elsewhere
  remain honest/explicit. **309→315 tests**, zero skips; strict controller DOM
  checkJs, lint 18, Knip full1/prod2 intentional inventory. Isolated candidate only;
  no staging/commit/push/install, host/sibling or existing dist/publication edits.

- **USERREPORTED smoke PASS (2026-10-21):** user answered “all works” to the
  Windows checklist for installed **0.2.13-lab.1**: basic Play/audio/detection,
  views/Tab/Notation minor flats, Markdown variants, Ladder tuning, Workout
  navigation. Exact FeedBack desktop/detector versions unknown. This is not
  independently observed testing, exhaustive regression or Windows DI certification.
  Published runtime `6d8ede92…` / source `03a0c04…` stay unchanged. Local
  **0.2.14 was not tested by the user**; its live-host acceptance remains owed.

- **Pure-core quality cleanup (unpublished 0.2.14, 2026-10-21):** four block
  assemblers share chord geometry cloning/template-ID offsets; five local backing
  builds share pitched-before-drums ordering; incoming and wrap breaths share
  count-in emission. Whole-cell tiling deliberately retains its distinct ID and
  optional-array contracts. No UI/player/navigation/lifecycle/music-policy change;
  entry's historical **16,126 LOC** figure is not authoritative (physical newline count is
  **16,128 before and after**; only paired manifest/header version reservation).
  Independent pre-edit captures retain exact **61,309,037 foundation / 42,443,466
  session / 13,777,002 backing / 5,028,817 cluster UTF-8 bytes**, including after
  the badge bump; historical fixtures are untouched. Seven direct semantic tests cover
  guitar/bass rung math, IDs, shared/cloned aliases, empty-array handling, ordering,
  count-in endpoint tolerance/live reads, sequence turns/annotations/RNG counts and
  inert native imports. Published personal `main` remains **0.2.13-lab.1**;
  **302→309 source tests, zero skips**, lint **106 files / 18 unchanged warnings**,
  strict core/content/shell/renderer types, syntax, all-source/Lab **70-module DAG**,
  docs/brand/whitespace and legal/withdrawn-assets/folder/ZIP checks pass. Knip
  remains full1/prod2 intentional findings; no speculative exports were deleted.
  Core combined LOC **841→877 (+36)** including shared contracts/comments, not source shrink;
  duplicated geometry implementations **4→1**, accompaniment builds **5→1**,
  breath emission **2→1**; no benchmark/performance improvement is claimed.
  0.2.14-lab.1 is an isolated temporary candidate only. No stage/commit/push,
  installation, host/sibling or existing publication/dist changes. Known fret-51
  3NPS, NaN-BPM backing and nonpositive ladder-step behavior remains deferred.
  Windows DI and browser MIME/cache/BFCache/navigation/render/audio/detection smoke
  remain owed; pure source checks cannot certify them.

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
  Shared graph uses the existing TypeScript compiler API (developer tooling only),
  covering nested static/dynamic imports, reexports, graph boundaries and cycles.
  Computed imports and dynamic import options reject. Core→passive-content allowed,
  content→core/shell forbidden. No plugin runtime dependency/build was added.
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
  manifest/header **unpublished 0.2.14** (pure-core quality WIP), based on
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
