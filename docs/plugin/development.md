# Development procedure

Start with [repository guidance](../../AGENTS.md), [current work](../../ROADMAP.md),
[code map](code-map.md), [architecture](architecture.md) and [testing](testing.md).
This is original-identity source, not the generated personal-fork Lab runtime.
Historical version tokens and commit hashes may refer to the pre-relaunch private
archive; do not assume they resolve in this repository. Host versions are separate.

## Boundaries and file map

Renderer attachment/readiness is a native lifecycle owner, not an entry handle
mirror. Capture its monotonic operation with `currentRequest`, then check
`isCurrentRequest` after sink/ready/voice awaits; do not add a parallel generation
counter. Entry owns semantic transport stop and ordered full-scene preparation,
while lifecycle owns renderer/canvas/ready/destroy/resize resources. Never destroy
the current candidate from an old completion. Play must await published-but-not-ready
attachment before warming voices. Preserve actual fallback cfg persistence separately
from desired intent; do not silently change view policy during cleanup. SPA leave
unmounts, canceled beforeunload/pagehide does not. Factory/DOM/preferences stay live.
Independent CURRENT DIRTY source hash and 17 complete renderer operation rows are
pinned alongside prior config/selection/event captures; historical fixtures remain.

Practice selection owns its state and transition listeners together. Do not add
entry mirrors of pathway/tier/variant/pending file state. Controller request guards
 combine request identity, visit and current DOM; entry playback checks share the
 lifecycle ordinal. Keep the L1/anchor adaptation BEFORE tier realization and
preserve the separate `files`/`position`/`selection` mount positions. Only confirmed
SPA departure removes listeners; beforeunload/pagehide do not invalidate an active
document or BFCache. No host feature added: reuse the evidence-dated Oct-20 host
check. Full dirty-before cfg/selection/event captures remain approved-temp; small
source/output hashes are permanent. New native controller is measured by c8;
data-URL entry attribution is still zero, not browser coverage. Plain selection
property tests exercise real PATHWAYS sequences with metadata/mutation invariants.

Practice configuration now has one typed shell reader/writer owner and ordered
plain anti-leak defaults. Keep the final own-key overlay after sample warming;
inherited defaults and explicit null/false/zero values intentionally differ.
Preset recall keeps the existing host meta-DB URL/cache identity, but request,
visit and DOM ownership reject abandoned completion. No new save/manage UI:
the HTML explicitly cut save-preset, and the verified unreachable writer is removed
(lint **18→17**, historical baseline row retained as evidence, no ignore increase).
Cue vocabulary stays mutable/passive; selection receives explicit pathway/tier/
cfg/band. Goal-card/controller selection and L1 adaptation remain entry-owned.
Independent complete dirty-entry event and cue captures were saved before each
boundary; permanent provenance hashes are small, full captures stay approved-temp.

Tuning cache and all preset/custom-input callers move together into a typed
inner-form owner. Keep declaration and post-selection callbacks separate: setup
dispatch already runs L1/pathway recovery, while outer completion remains
independently observable. Preserve both listener clusters/order. Complete dirty
pre-edit 0.2.14 capture was compared after cleanup and after lifecycle hardening,
not regenerated. Physical lines mean `wc -l` (split-newline length minus one),
including blank lines/comments: 16,128 baseline, not historical 16,126 prose.
USERREPORTED installed 0.2.13-lab.1 smoke PASS on 2026-10-21 does not cover local
0.2.14 or independently certify audio/Windows DI; host/detector versions unknown.

`plugin.json` declares the native module entry. `screen.html` supplies markup,
styles and bootstrap; `screen.js` keeps the strict IIFE while pure leaves move
bottom-up into `src/core/`. `routes.py` owns backend persistence/assets;
`settings.html` is the settings fragment. `static/` and `assets/` carry licensed
audio, fonts and chrome. Preserve their provenance READMEs and license files.
See [native modules](native-modules.md) for the dependency map and release gates.

Data flow: `readConfig` → pure exercise/session generation → chart → `makeBundle`
→ contained renderer/transport/audio. `makeBundle` reads display preferences, so
it is shell, not core. Host verification verdicts feed downstream pedagogy/XP.
Do not restore the historical main-player launch or Escape interception.

Unpublished 0.2.14 quality work centralizes block chord geometry only (shared
templates, cloned timed records), ordered local accompaniment and incoming/wrap
count-in emission. Tiling is intentionally separate: it reuses template IDs and
preserves absent versus empty optional arrays. Keep endpoint tolerances and
per-beat subdivision reads; do not silently normalize those historical contracts.
The installed/published Windows smoke target remains 0.2.13-lab.1. Known 3NPS
fret-51, NaN-BPM backing and nonpositive ladder-step defects require explicit
behavior decisions, not incidental cleanup. No exports were removed: Knip's
full1/prod2 intentional probes remain supported.

All modes share one shell and player. Ladder retains internal `guided`/pathway
tokens; labels are not a reason to rename storage or APIs. Workout edits a cloned
draft, never `BUILT_IN_SESSIONS`. Duration filling uses whole cells; do not cut a
phrase to hit a timer. Backing follows each block's own tempo/key and is silent
through breaks. The ruler has a scrolling bars/beats lane and whole-session
overview; loop authoring belongs to the overview, not a second transport.

Workout caller extraction now has a bounded draft/timeline controller, not a
shared state module. Pass one preview callback and plain current launch options;
do not inject core helpers back from entry. `replace/select/add` own write paths;
entry persistence reads the live draft. Listener mounts stay at original bind
clusters; SPA screen leave tears them down, return remounts without discarding edits.
Browser unload/hide retains listeners for canceled navigation/BFCache; actual
document destruction cleans them. Do not detach on cancellable beforeunload.
Imports retained solely for public identity are documented in the
[ownership map](code-map.md#workout-draft-controller-2026-10-20), not disguised as
an import reduction. Browser/host navigation/audio and Windows DI remain owed.

## Adding content

### Pathway

1. Add a `PATHWAYS` entry with label, named skill/goal, scales, tempo tiers, base
   cfg and variations. `instAgnostic` adapts pure-time work to the selected
   instrument. Anti-leak defaults must reset per-pathway overrides.
2. Technique on the lowest string uses `anchor: 'open_lowest'` and `anchorFret`,
   **not a co-coded key**; `applyAnchorPolicy` derives key from actual tuning.
   Genuinely keyed lessons keep keys. Custom tuning overrides must not leak.
3. Add the HTML option, band membership and prerequisite edge. Read
   [vocabulary playbook](riff-vocabulary-playbook.md) for genre packs and
   [band playbook](genre-band-authoring-playbook.md) for backing-band work.
4. Extend assertions in the owning system suite; don't create per-exercise suites.

### Generator

Add the practice-type option, implement a pure `buildXExercise(cfg)` matching
[exercise schema](exercise-schema.md), wire the dispatch, and cover realistic
instrument/tuning cases. No backend change is needed unless a new route is
actually required. Preserve mutable table identities and no-unison/fingering
guards. Do not improve algorithms during a move-only extraction.

## Review lenses (availability is explicit)

Historical specs describe panels and ignored local memories. This checkout does
**not** contain those specialist agent definitions; tools/environments may not
support spawning them. Never report a panel as run merely because an old doc
names it. Apply the lenses below, request expert review when needed, and record
which reviews remain owed. If definitions are later supplied, read their memory
first and verify every named API/file against current source.

- Exercise/fingering/instrument changes: **both guitar and bass pedagogy**;
  piano/drum/other instrument expertise when in scope. New instruments need a
  matching playability reviewer, not guitar assumptions applied blindly.
- Genre pathways/vocabulary: matching genre idiom; harmony for voicings,
  progressions and pitch; rhythm/meter for subdivisions, swing, count-in/tiling.
  One idiom lane per genre, not a new agent per rung.
- Shell/integration: host compatibility; detector expertise for pitch/chord
  detection, verifier, tuner, timing inheritance, levels/silence and external
  grading contributions. Verify the user's **running** detector, not just upstream.
- Audio: instrument sourcing/engine method separately from sound design,
  normalization, limiting and transient safety.
- Curriculum/engagement: learning design and competency-based progression;
  UX/accessibility and whole-pane consistency; operability/tests/release safety.

For cross-cutting design, the most relevant expert chairs; content lenses shape,
instrument lenses verify playability. The main thread synthesizes disagreements
into one spec/decision log and explicitly lists missing input. No standing PM
agent or automatically loaded project memory is assumed.

## HOST CHECK — before building shell capability

Inspect current host source/API before design. Record this five-line artifact in
the spec or ROADMAP, and quote it at delivery:

1. Capability being added.
2. What the host has (file/API, or what was searched and not found).
3. Evidence and date, including running host/detector when relevant.
4. Verdict: **BORROW / MIRROR / BUILD**.
5. Host change that would flip the verdict.

Pure generation work does not need a shell host check; ordinary fixes to shipped
capabilities do not restart a design gate. Detection/judging changes still need
detector-scope review. Never build polyphonic/chord detector DSP or a local timing
judge. Repeat the host-overlap sweep on new host releases; old evidence can drift.
The historical card-renderer consume proposal was dropped: current code keeps
Virtuoso's renderer/fallback data model; do not resurrect a dead handoff task.
Generic host achievements may consume activity events, never relabel a contextual
competency as an attendance count; Virtuoso stays out of a public count-wall.

## Verify, run, deliver

### Current IDE type coverage (2026-10-21)

Wave6 current entry is **284**, still nonzero; normal/root integration remains
blocked on zero. Resolved cfg/audio/bass/FX ownership and authored control metadata
are developer contracts, not storage or host schema validation. The one form-event
runtime guard is separately fail-first tested in source/Lab; exact named reversal
preserves historical pins. No detector fallback/articulation/audio scheduling policy
was changed. Continue from the complete ignored report, not an error-count budget.

Wave5 current entry is **346**, still nonzero; do not integrate it into normal/root
checking before genuine zero. Runtime changes retained from this wave are LCD and
delegated widget target guards, covered fail-first in source/Lab. Untested broad
changes from an intermediate166-diagnostic attempt were reverted. The exact
inventory is ignored `coverage/typecheck-entry.json`; see ROADMAP for verification.

Historical wave4 entry was **501**, still nonzero. Runtime safety work is now explicitly
separate from declarations: four fail-first real-entry source/Lab probes cover
released renderer context, withdrawn host navigation, absent Play and non-element
delegated clicks. `tests/helpers/entry-safety.mjs` reverses only exact reviewed safety
edits for historical AST/statement pins, not arbitrary functions or comments. Actual
valid-path captures stay immutable. Transport's generic contract preserves caller
bundle shape; optional sustain and discriminated meter/span metadata are honest.
Further event/nullable/argument reconciliation remains, no full-entry completion.

Wave3 current strict entry is **752**; reporter exits1. All implicit parameter and
declaration/read diagnostics clear; nullable state/DOM, renderer-versus-entry bundle,
argument and remaining indexed/global debt still need resolution before extraction.
`entry-data.d.ts` defines actual complete bundles plus optional beat/proof metadata;
`authored-config.d.ts` keeps CSV pre-form tuning distinct from realized cfg;
`host-data.d.ts` keeps settings parse fields unknown; `progress-data.d.ts` describes
internal writer records, not a validated storage reader. Native registries stay
ordinary mutable records. Exact DOM IDs/selectors/list overloads keep nullable and
dynamic fallback types. No blanket EventTarget narrowing or false mounted-panel claim.

Wave2 current strict entry count is **1,210** (power correction 1,647→1,645, then
1,645→1,210); `typecheck:entry` remains **nonzero**. Results-data contracts describe
internal generated snapshots, **not** validated storage/fetch payloads. FormConfig
explicitly retains nullable shape/custom tuning/display name rather than pretending
the form is a fully validated generator cfg. Exact `#virtuoso-controls [name=…]`
selectors preserve nullability; dynamic selectors retain the DOM fallback. New
plugin globals describe only existing shape/coach/keys/harness fields, never new
runtime publication. Desktop power is verified from both preload **and IPC handler**:
`setScreenAwake(boolean): Promise<void>` at `00653cf4`; `setPreventSleep` is rejected.
Do not infer a boolean from a method name or trust IPC's broadly inferred return.

Whole-entry foundation has a separate honest failing command:
`npm run typecheck:entry` (or `tsc --project tsconfig.entry.json`). It inherits all
strict/checkJs/noEmit/unused flags and the same ES2022+DOM library from root; no
suppression, debt budget or weakened null/implicit-any policy. The development-only
TypeScript API reporter groups by code/file, prints root-cause examples and writes
complete ignored `coverage/typecheck-entry.json`. Initial **2,272**, current **1,647**;
the command exits **1**, not a green milestone. Keep further extraction behind this
unfinished typing work. `npm run typecheck` and root IDE checks still exclude entry
and must not be presented as whole-entry success.

`src/types/*.d.ts` are developer-only JSDoc contracts (not runtime imports). The
Lab allowlist excludes declarations, tsconfigs, helper and reports. DOM ID precision
is verified against uncommented screen/settings markup by `tests/entry-types.mjs`;
dynamic/unknown IDs return `HTMLElement|null`, fixed IDs retain nullability. Host
capabilities remain optional and call-time; typings do not repair existing repeated
availability reads or confer a running-host version floor. Verify APIs against
source, never broaden `Window` to hide unknown properties. The unsuppressed
remaining diagnostics include those genuine unsafe accesses for follow-up review.

Root `tsconfig.json` extends `tsconfig.shell.json` for IDE discovery and explicitly
combines core/content with the same selected shell/renderer roots (79 roots, 81
native modules including imports). `extends` replaces rather than merges `include`.
`npm run typecheck` still checks the named core and shell projects separately,
preserving the core's non-DOM boundary; `tsc --project tsconfig.json` checks the
combined DOM-aware IDE scope. No emit, bundler or runtime package-mode change.

`screen.js` remains outside the normal passing project, not suppressed with
`@ts-nocheck` or a new exclusion. Its imported `PATHWAYS` now has the shared
`Pathway` contract: optional density arrays, catalog metadata and precise partial
authored cfg fields (text meter/numeric-or-text shape, before `readConfig`). The
registry and nested values stay mutable and unchanged. Other entry diagnostics
remain; the targeted property fix is not whole-entry typecheck certification.

Local Tab/Notation follow-up: all seven renderer JS files pass strict DOM checkJs
via `tsconfig.renderer.json`; `tsconfig.shell.json` remains a compatibility alias.
No runtime compiler or global any contract. Two live preference accessors preserve
entry's theme/storage ownership; complete drawing/caches/listeners are native.
Lint **97 files/18 warnings**, Knip full1/prod2 intentional exports unchanged.
Entry **16,465 LOC**, renderer subsystem **1,486 LOC**; 283 source tests. Actual
browser fonts, host MIME/cache/reentry/render/audio/Windows DI remain separate gates.

Renderer foundation follow-up (2026-10-20): strict noEmit additionally covers
`src/shell/renderers/*.js` through `tsconfig.shell.json` with DOM types; core's
non-DOM configuration is unchanged. Entry and other shell modules remain untyped.
Only the verified private unused Classic palette `SBRIGHT` was removed, with its
lint allowance; current debt is **18** rows (13 entry unused locals + five other
warnings). Historical initial inventory below remains dated evidence, not the
current count. Knip full **one** / production **two** intentional exports remain,
zero new findings; JSDoc contracts are recognized without entry-glob masking.

### Developer tooling and lint

Current unused-declaration audit: **zero** first-party unused bindings, imports,
locals/functions and unintended parameters. All 128 lint files enforce the rule
at error severity, including entry and guide-tones. Only four unchanged non-unused
warnings remain (three duplicate debug keys and the filename control regex).
The complete browser-entry TypeScript unused probe also passes; other entry type
errors are outside this claim. Named/root checkJs enables both unused compiler flags.
Private dead card delegation adapters are retired, not replaced with public exports
or dummy reads. Guide-tone key lookup retains original accessor effects/order as an
expression, with a regression. Exact removed names/nested edits normalize only the
saved before-source statement pins; historical generation/render/runtime fixtures
remain immutable. See [current removal inventory](code-map.md#unused-private-declarations-retired-2026-10-21).

Unused parameters are checked across all first-party entry/native/tool/test files
with `args: 'all'`: `after-used` would miss the first callback slot before a used
index. Use `argsIgnorePattern: '^_'` only for deliberate positional/signature slots,
not as a blanket cleanup; unused locals/imports are still checked. Catch parameters
retain `caughtErrors: 'none'`. Unused errors cannot consume the warning baseline.
Installed config regressions cover constants, locals, functions, imports,
first/trailing parameters and intentional positional slots across every scope.

Use Node 24 LTS for the root workflow; the verified ESLint 10.6.0 engine accepts
`^20.19.0 || ^22.13.0 || >=24`. Local verification used Node 26.12.0. Run:

```sh
npm ci --ignore-scripts
npm run lint
npm run lint:core
npm run typecheck
npm test
npm run check:docs
npm run check:brand
git diff --check
```

Root `package.json` is private and has only pinned devDependencies: ESLint 10.6.0,
the cached official `@eslint/js` 9.28.0 recommended rule set, globals 17.11.0 and
TypeScript 5.9.3. The plugin-kit override pins compatible cached 0.7.2 rather
than requesting uncached 0.7.3. The lock was verified with offline `npm ci`;
there is no runtime dependency, build/transpile step or root ESM-mode change.
The historical dependency-free suite ran directly without npm dependencies; only the actual installed
ESLint negative-control row skips when tooling is absent. Typecheck remains
strict noEmit on the existing core/content scope, not the entry or shell.

### Coverage reporting and bounded properties

Transport follow-up: `tests/run-transport.mjs` adds one bounded async property;
with existing core/selection/renderer properties there are seven ×100 = **700**
generated cases per seed. Run `node --test tests/property-core.mjs
tests/practice-selection.mjs tests/renderer-lifecycle.mjs tests/run-transport.mjs`
with `PROPERTY_SEED=20261021` and `271828`. Current transport ownership/QA is
summarized in [code map](code-map.md#run-transport-owner-2026-10-21) and
[testing](testing.md); older dated counts below are historical evidence.

Run `npm ci --ignore-scripts` before source tests: the four property rows now
require pinned developer-only fast-check **4.10.2** (Node >=12.17). Coverage uses
pinned developer-only c8 **12.0.0** (Node ^20.19 / ^22.12 / >=23), compatible with
the existing root engines and Node **24** CI. No runtime dependency, source loader,
transpilation, version bump or publication change is involved.

```sh
npm run test:properties
PROPERTY_SEED=271828 npm run test:properties
npm run test:coverage
```

`test:coverage` runs the entire ordinary source suite once. c8 supplies
`NODE_V8_COVERAGE` to Node and inherited child environments, merges child reports,
and writes `coverage/index.html`, `coverage/lcov.info`, `coverage/coverage-summary.json`
and a terminal summary. CI uploads reports even on test failure (not raw
`coverage/tmp`); failures still fail the job. No percentage threshold or badge:
test count and coverage are different evidence. `/coverage/` is ignored and the
Lab runtime allowlist excludes reports, root packages and tests; packaging checks
verify folder/ZIP exclusion. Each run cleans raw coverage; raw files can be large
(about 560 MB locally). Remove `coverage/tmp` after reporting if not needed for
`npx --no-install c8 report` regeneration.

The root package's explicit c8 allowlist includes only `screen.js` and native
`src/core`, `src/content`, `src/shell` JS, including never-loaded files at zero.
Vendor, tests, fixtures, scripts/tooling, assets/static and generated dist are
excluded. External temporary source/Lab copies and data URLs are not attributed
back to first-party source: no invented maps or double-counted renamed runtime.
Real native leaf file-URL imports in child runners **are** counted. Crucially the
complete mocked entry is transformed/imported as a data URL, so `screen.js` is
listed at **zero measured coverage**, not asserted untested or fully covered.
JSDoc-only type files also count as zero. Unloaded files have synthetic single
function/branch denominators: overall function/branch percentages do **not**
measure all entry functions/branches. V8 line/statement counts include comments
and blank lines; table coverage is not content correctness. Reports are source
visibility, never browser/host/audio/judge/Windows DI certification.

Node 24's official CLI docs support `--experimental-test-coverage`,
`--test-coverage-include` and `--test-coverage-exclude` (include/exclude since
22.5/20.18); local Node 26.12.0 also exposes them. c8 is used instead to explicitly
merge arbitrary nested subprocesses and produce HTML/LCOV plus never-loaded-file
visibility; do not combine the two collectors. Node 24 CI execution remains a
remote gate, not a claim that it ran locally.

`tests/property-core.mjs` imports real modules. Four bounded properties cover
format-2 parser/builder tempo scaling with exact written string/fret/finger/stroke
preservation; seeded random-position scale determinism and frozen-cfg nonmutation;
chromatic whole-cycle/orientation/fret/string/onset/sustain bounds; Open/CAGED
no-unison MIDI selection (CAGED guitar only). Generated config domains include all seven
built-in guitar/bass setups; format-2 stays standard six-string guitar by schema.
Tempo 30–260, bars 1–4 and limited valid fret frames keep runs small; they do not
promise all builders, altered custom tunings, 3NPS, invalid/nonterminating inputs
or fix the known deferred defects. No mutable registry or global RNG writes.

Default **seed 20261021**, **100 runs per property = 400 generated cases**, reported
as **four Node tests**, with normal shrinking. `PROPERTY_NUM_RUNS` accepts 1–10000;
`PROPERTY_SEED` accepts signed 32-bit integers. fast-check failure output includes
seed, shrink path and counterexample. Replay only the named property, e.g.:

```sh
PROPERTY_SEED=20261021 PROPERTY_PATH='reported:path' node --test --test-name-pattern='format-2 tempo' tests/property-core.mjs
```

Replace the placeholders with the failure's seed/path; omit `PROPERTY_PATH` for
normal whole-suite runs. Settings are per assertion, not global fast-check state.
Verification on Node 26.12.0: ordinary suite **337/337** in **26.82 s**;
coverage suite **337/337** in **36.93 s** (test-runner durations, not a benchmark).
Properties alone take about **84 ms** total including runner startup. Offline
`npm ci --ignore-scripts`, strict types, lint (17 unchanged warnings), links,
brand and whitespace pass; Knip retains exactly full1/prod2 intentional findings.
Native entry DAG **74**, all-source **76**; isolated **0.2.14-lab.1** remains
**558 files**, with folder/ZIP/legal/module checks in the passing source suite.

`eslint.config.mjs` covers `screen.js`, native `src/**/*.js`, developer
`scripts/**/*.mjs` and `tests/**/*.mjs`, plus the config itself. Vendored parsers,
vendor preferred sources, static scripts/assets and host-browser smoke tooling
are outside this first-party gate. ECMAScript 2022 modules match graph checking.
Core/content receive no browser globals; shell/entry use browser globals and
entry's verified lazy-loaded `WebAudioFontPlayer` is readonly. Two Node harness
files get only their explicitly stubbed `window`/`document` globals. `$` in entry
is a local native `document.getElementById` helper, not a jQuery dependency.

Recommended correctness rules include undefined names, duplicate arguments/keys/
classes, unreachable code, constructor/super errors, unsafe finally and constant
binary expressions. Unused variables/imports are checked with `vars: all`,
`args: all`, `argsIgnorePattern: '^_'`, `caughtErrors: none`; only deliberate
positional/signature parameters and catch names are exempt. Intentional empty
catches are allowed, not every empty block.
No formatter/style rewrite or auto-fix belongs in this move-only pass.

`npm run lint` fails every error and every **new** warning. There are four explicit
debt rows in `scripts/lint-baseline.json`: three duplicate publication keys and
one filename control-character regex. They are not claims of fixed bugs. The core-only
command uses the same ratchet with zero known warnings. Entry only downgrades
these two non-unused debt-bearing rules;
all other recommended correctness rules remain errors. Each allowance includes
file, rule, diagnostic, SHA-256 of its source statement and occurrence count,
not moving line numbers. New unused imports, extra copies, changed statements
or warnings in another file cannot consume unrelated debt. Removal is allowed;
remove corresponding rows when reviewed cleanup lands. Do not regenerate or
expand the baseline to make a failure green. Inspect native ESLint diagnostics
with `npx --no-install eslint screen.js src scripts tests` when reviewing debt.

Cleanup removed 198 verified unused entry import bindings and two test imports.
Empty imports retain every original module specifier and evaluation order; the
characterization harness imports removed helper bindings only for requested
historical probes. No runtime initializer/body/API/guard was deleted. The parser's
ASCII-control check has one rationale-bearing rule exception; one redundant
regex escape was removed without changing its matched characters.

### Dead-code inventory (report first)

Knip **6.42.1** is pinned as a root devDependency, never a runtime dependency.
No cached Knip was available initially; the registry version/engine metadata was
checked before installing only root dev tooling. Its Node engine is
`^20.19.0 || >=22.12.0`, compatible with the root engine range and Node 24 CI.

```sh
npm run deadcode
npm run deadcode:production
# Machine-readable inventory, without npm's script banner:
./node_modules/.bin/knip --config knip.json --no-progress --reporter json
```

These commands do not fix or delete anything. They exit **1** for open findings;
the CI inventory step is advisory (`continue-on-error`), unlike blocking lint,
typecheck and source tests. Do not use `--fix`, `--allow-remove-files`, raise an
issue budget or globally suppress exports/dependencies to manufacture green.
JSON output may be redirected to an approved temporary directory, not committed.

`knip.json` configures root `.` and the nested ESM-only `src` package separately
(it is not an npm workspace or a published API). `screen.js!` is the only native
runtime entry; `src/**/*.js!` is project inventory, **not** an entry glob. Root
entries name the capture, docs, brand, lint, Lab and beta commands plus actual
`tests/*.mjs` discovery. Helpers are reached through imports, not all promoted to
entries. ESLint's config/plugin and package-script CLI inference account for
devDependencies. No declared root dependency is exempted. `includeEntryExports`
also checks entry exports; `ignoreExportsUsedInFile` preserves locally used
exports instead of mistaking a still-running function for dead implementation.

Scope is first-party JS/MJS. Vendor preferred sources, the vendored Acorn parser,
static/generated assets and the independent `.claude` host-smoke package are not
project inventory. This is not permission to delete them: Python routes,
manifest/native entry registration, HTML bootstrap/inline handlers, string asset
references in generators, lazy browser scripts and host APIs are separate roots.
Keep `window.Virtuoso`'s 40 and debug publication's 91 keys and synchronous guard/
initialization order. Review property/string references and module side effects,
not just import counts. VM/data-URL harnesses assemble imports from string lists;
static analysis cannot prove those unused. No broad export ignore hides this debt.

#### Initial reviewed inventory (2026-10-20)

Historical report-first decisions below are superseded by the bounded Oct-21
unused-declaration cleanup above; none of those private candidates remains unused
in current source. Knip's intentional regression exports remain supported.

Full report: **one export**, zero files/dependencies/unlisted/unresolved/duplicates.
Production report: **two exports**, zero other findings. These are open analyzer
findings, **not verified deletions**:

| Finding | Classification / decision |
| --- | --- |
| `src/core/positions.js` → `startAtRootPc` | Intentional regression-only export: `tests/helpers/generation-foundation.mjs` lists it; `core-runner.mjs` dynamically injects the import and calls the complete entry probe. Retain function **and export**; deleting either breaks independent historical characterization despite no static import. |
| `src/core/practice-files.js` → `practicePathwaySelection` (production only) | Intentional test/host-smoke helper: direct Node tests, the VM runner and `smoke-generators.mjs` use it. Not a claim that the runtime currently calls it, nor grounds to remove regression coverage. |

ESLint, not Knip, owns entry-IIFE private locals. All 14 unused entry bindings
were reviewed against current source, HTML, backend, scripts/tests and published
objects. Orbit skipped the >1 MiB entry, so a full-file Acorn AST/source reference
scan was used there; indexed “no callers” alone is not proof. No function, import,
initializer or file was removed in this report-first pass:

| Entry candidates | Classification / remaining review |
| --- | --- |
| `fretboardSystemLabel`, `inWindow` | Pure private helpers with no current identifier/string caller found; genuine cleanup candidates, not public/debug keys. Keep until a bounded behavior-preserving cleanup (and adjacent now-unused dependencies) is reviewed. |
| `SEQUENCE_LABELS`, `PT_WIN_LATE`, `SBRIGHT`, `FAINT`, the unused local `usableW` | Inert table/literal/arithmetic debt, no current use of these bindings; do not delete other same-named `usableW` locals that are used. Cleanup candidates, retained here. |
| `pianoPathwayActive`, `syncCagedButtonStrip`, `proofCardText` | Explicit disabled-feature/no-op/back-compat history, no current caller found. Compatibility intent still needs a decision; no deletion justified merely by a warning. |
| `savePreset` | Explicit dormant future preset reuse; contains backend persistence, not a pure helper. Retain pending owner review. |
| `_ndCardApi`, `_resultsCardData`, `_virCardOverlay` | Explicit dormant host-card adapter; current source documents retaining it. Host/public-API/lifecycle review required, especially overlay DOM effects. |

The other five lint warnings are three duplicate publication keys, one filename
control regex and one guide-tone initializer. They are correctness/behavior debt,
not an unused-function deletion list. The **19-row lint ratchet is unchanged**.
Knip's report is not a browser, Python asset, host, audio or Windows DI oracle.

The existing reusable CI is preserved. Separate `source-checks.yml` runs this
root workflow on source branch pushes/PRs with Node 24 and Python for packaging
AST checks, not browser/desktop tests. Remote CI execution is not inferred from
local checks. Lab's explicit runtime allowlist excludes root package/lock/config,
node_modules, caches and scripts; durable folder/ZIP tests enforce exclusion.

Run source tests/syntax/checkJs and doc/brand/whitespace checks; see
[testing](testing.md). Browser tests require a live host and do not replace
installed desktop/DI checks. Record exact commands and limitations, not old green
counts. [Local dogfood](local-dogfood.md) explains launcher targets, side effects
and stale-link diagnosis; read the local [skill](../../.claude/skills/run-virtuoso/SKILL.md)
before launching. Reload JS/HTML, restart routes; install the full matching
runtime set including `src/`, never just `screen.js` over mismatched HTML.

Keep source worktree, generated Lab output and installed plugin separate. The
[Lab guide](virtuoso-lab.md) is also the standalone generated README: do not add
links to source-only docs that are absent in the allowlisted artifact.
[Beta tooling](beta-testing.md) uses committed source and can commit/push; it is
not an automatic verification step. Only commit/push with explicit authorization.
Mirror AGENTS/CLAUDE, keep current handoff concise, and preserve historical rationale
in [archive](../archive/index.md) rather than reviving superseded instructions.
