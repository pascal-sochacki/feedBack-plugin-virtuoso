# Development procedure

Start with [repository guidance](../../AGENTS.md), [current work](../../ROADMAP.md),
[code map](code-map.md), [architecture](architecture.md) and [testing](testing.md).
This is original-identity source, not the generated personal-fork Lab runtime.
Historical version tokens and commit hashes may refer to the pre-relaunch private
archive; do not assume they resolve in this repository. Host versions are separate.

## Boundaries and file map

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
Node tests still run directly without npm dependencies; only the actual installed
ESLint negative-control row skips when tooling is absent. Typecheck remains
strict noEmit on the existing core/content scope, not the entry or shell.

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
`args: none`, `caughtErrors: none`; unused parameters/catch names are deliberately
not a cleanup target. Intentional empty catches are allowed, not every empty block.
No formatter/style rewrite or auto-fix belongs in this move-only pass.

`npm run lint` fails every error and every **new** warning. There are 19 explicit
debt rows in `scripts/lint-baseline.json`: 14 entry non-import unused bindings,
three duplicate publication keys, one filename control-character regex and the
guide-tone `keyPc` initializer. They are not claims of fixed bugs. The core-only
command uses the same ratchet (one known warning), with recommended rules at
error severity elsewhere. Entry only downgrades the three debt-bearing rules;
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
