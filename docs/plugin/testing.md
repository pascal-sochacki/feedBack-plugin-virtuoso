# Testing — the smoke-suite catalogue

Page-lifecycle reviewer fix: **301→302**, zero skips. A fail-first real-entry
source/Lab scenario dispatches canceled beforeunload, persisted/nonpersisted/empty
pagehide/pageshow and repeated pageshow, then edits exactly once. Draft identity,
selection, dirty state and DOM survive; inactive restore leaves handlers detached,
SPA return remounts once, no entry rebind or autoplay. Session flushing remains
the existing single handler on each event. Live-browser BFCache remains unverified.

Workout controller follow-up: **297→301 tests**, zero skips. Before extraction,
the real bound entry captured inline duplicate/remove, template reroll/refresh,
length/breathe edits, exact draft/card/summary output and full launched exercise
(`workout-editor-before-extraction.json`, SHA pinned in the test; historical music
fixtures untouched). Source and generated isolated Lab compare to that evidence.
Direct controller tests cover clone-before-edit, mutable aliases, refresh inline
aliases, raw unresolved indexes, drag append, null selection, blank selector,
mount de-duplication, full removal and stale visit closures; actual entry host
leave/return also checks handler counts and stale edits. Inert import/construction
traps DOM/storage/host/fetch. Existing async Workout/Jam cancellation tests stay.
The archived renderer 899-statement hash remains historical; current post-move
878 statements/order have a separate pin, not a recaptured renderer fixture.
No live browser/host audio/Windows DI certification follows from these mocks.

Spelling review follow-up: **292→297 passing tests**, zero skips. Three new
fail-first raw ascending/descending scales exercise F Lydian augmented, G
Mixolydian b6 and B Locrian #2 staff positions and note accidentals independently
of their unchanged legacy F# signature. Full C#/Cb major scales pin E#/B#/Cb
octaves in both directions. All 28 supported interval tables are inventoried;
nine non-seven-step scales retain prior sharp/flat spelling, including explicit
pentatonic letter gaps. No historical fixture recapture. Strict core/shell/renderer
types, lint 18 warnings, Knip full1/prod2, syntax/graph/docs/brand/whitespace and
source/Lab folder/ZIP checks pass; isolated Lab remains **0.2.13-lab.1**.
Browser/live-host/Windows DI certification remains outstanding.

Implementation-quality follow-up: **283→292 tests**, zero skips. Four new canvas
regressions failed before implementation (C-minor flats, clipped singleton flags,
both repeated canvas dimension setters). New direct-module semantics cover twelve
tonics × major/minor/diatonic modes, harmonic/melodic minor, blueprint conventions,
explicit Db/C#/Cb and invalid-key normalization, E#/B#/Cb staff octave positions,
visible beam 0/1/2/3 subsets, sixteenth flags, odd meter, coincident long notes,
dense hand breaks/crossings/lessons/bass low boxes/open fg/live annotation reads,
ten steady frames and container/DPR/zero-size transitions; canvas-only init and
replaced-array hand-mark compatibility. No copied subjects.
All **50 Tab historical rows** and **seven unclipped G-major Notation opening
frames** retain exact paint/property ordering after removing only bitmap writes/
explicit frame-default resets; hashes are derived from the saved BEFORE capture,
not current output. Includes guitar/bass alternate opens, lefty/inverted input,
techniques/chords/marks/judgment paint. Old `local-renderers-before-extraction.json`
remains untouched historical provenance: full current byte identity is intentionally
no longer claimed. Corrected signature/staff/beam cases have focused assertions;
current native/entry/Lab full equality remains. Existing core/session fixtures,
899 statements/order and public40/debug91 remain. Strict DOM checkJs, lint 100 files/
18 warnings and Knip full1/prod2 intentional inventory pass; isolated Lab includes
both helper modules/namespace/ZIP/legal/DAG checks. Node canvas mocks certify calls,
not actual fonts, browser DPR, running-host MIME/cache/reentry/audio or Windows DI.

The following local-renderer paragraph records the earlier **move-only** pass;
its full-byte identity claim applies to that historical step, not this cleanup.

Local Tab/Notation follow-up: **280 → 283 Node tests**, zero skips. The same
renderer system suite calls complete saved dirty entry, current entry and actual
native modules, not copied subjects. `local-renderers-before-extraction.json`
pins dirty SHA, initial pre-move 29,419,746-byte capture, and expanded saved-source
**31,361,838-byte** full bundle/canvas/property/dimension sequence; approved-temp
byte and parsed deep equality pass. **29 successful generated bundles** (five
practice kinds where offered; bass excludes guitar-only comp/fingerstyle), **21
raw annotated charts**, **100 instances / 1,650 frames** across all seven setups,
4/5/6/7/8 strings, altered opens, notes at fret24/40, chords/overlaps/count-in/
backing/config/times. Covers FG/PKD/RH/slap, sustains/HOPO/slides/bends/dead/palm/
vibrato/harmonics/tap/accent, sharp/flat/modal signatures, rhythm/beams/ledger,
lefty/inversion input, both skins, hand marks on/off, internal Notation modes,
backward time, resize/fallback size, post-destroy inert draw/resize, re-init and
listener cleanup. Canvas text widths are bounded deterministic approximations;
font metrics/rasterization are not browser certification. Neither local renderer
has pointer/zoom/reduced-motion controls or a ready promise; no new feature tests
invent those. Imports/construction trap globals/preferences; draws trap player RAF
and use only supplied canvas/window resize listener. Exact **899** untouched IIFE
statements/order, old fixtures/public40/debug91 and existing source/Lab resolver/
ready/stale-generation/navigation/credit rows remain. Strict renderer noEmit uses
DOM types; lint **97 files/18 unchanged warnings**, Knip full1/prod2 unchanged.
Lab verifies full output parity and every module's folder/ZIP/namespace transform;
root `tsconfig.renderer.json` is excluded. Live optional-renderer cache, MIME/reentry,
browser fonts/Tab/Notation/audio and Windows DI still require installed-host review.

Renderer integration foundation: **275 → 280 Node tests**, zero skips. New
renderer-system rows drive complete real entry functions and direct native
Classic construction/draw, not copied subjects. The pre-move CURRENT DIRTY entry
SHA and independently captured **275,034-byte** host/selection/canvas snapshot are
pinned in `renderers-before-extraction.json`; full approved-temp before/after
bytes match, old fixtures unchanged. Preferred/legacy/absent/invalid/wrong-ID/
dynamic replacement, delayed publication, bounded 60-tick drift, quiet script
error, DOM-ID cache/error removal/in-flight race, every existing selection label
and fallback kind are covered. Classic full canvas call/property sequence covers
eight/four/one strings, sustain/open/dead/technique/hit/miss/anchors, backward time,
lefty/inversion, resize fallback, destroy-inert draw and re-init/listener cleanup.
Import/factory IO traps and exact **909** remaining IIFE statement bytes/order
are durable gates. Source/Lab namespace/registry/ZIP/full snapshot match; existing
async renderer/file-tier/voice/navigation/credit and public40/debug91 rows remain.
Lint **93 files, 18 known warnings**, strict core/content + selective renderer
checkJs, DAG, Knip (full one/production two unchanged intentional findings), legal,
withdrawn assets, syntax/docs/brand/whitespace pass. No live-host/module-cache/
browser/audio or Windows DI certification; source 0.2.13 unchanged.

Developer-only dead-code inventory: **273 → 275 passing Node tests, zero skips**.
`tests/deadcode.mjs` checks explicit nested-workspace scope and invokes installed
Knip twice on one disposable fixture, not the entire checkout per case. Negative
controls cover dead file, entry/module exports and root runtime/dev dependencies;
positive controls retain internally used exports, side-effect/literal dynamic
imports and test-only exports in the full view (production still reports them).
Lab folder/ZIP exclusion also covers `knip.json`. Full inventory reports one
intentional dynamic regression export; production reports two regression helpers,
with zero other findings. Both commands exit 1 without editing source; CI is
advisory. See [policy and reviewed inventory](development.md#dead-code-inventory-report-first).
Offline `npm ci`, lint (87 files, unchanged 19 known warnings), strict core noEmit,
unchanged independent hashes/API keys and all existing source/Lab gates pass.
The installed Knip control explicitly skips only if dev tooling is absent; the
scope check and other dependency-free source tests still run. No runtime cleanup
or live-host/browser/audio/Windows DI certification is inferred.

Developer-only lint foundation: **270 → 273 passing Node tests**, including
warning-ratchet negative controls, actual installed ESLint controls for unused
imports/undefined pure-core globals/duplicate keys and Lab folder/ZIP tooling
exclusion. `npm ci --offline --ignore-scripts` succeeds from the local cache;
`npm run lint` gates 86 first-party files with 19 explicitly baselined warnings,
and `npm run lint:core` gates native modules with one legacy initializer warning.
`npm run typecheck` uses pinned TypeScript 5.9.3 strict noEmit. Root `npm test`
is source-only Node discovery, distinct from the live-host skill's npm test.
See [lint policy](development.md#developer-tooling-and-lint). Unchanged independent
generation/session hashes and public40/debug91 checks pass after removing 198
unused entry imports; no initializer or historical fixture was recaptured.
Remote CI/live-host/browser/audio/Windows DI are not certified by these gates.

**Current session foundation: 264 → 270 tests**, strict cached noEmit checkJs
for all 51 core + three content JS; no old fixture recapture. Independent dirty
18,813-line entry SHA and compact per-case/full hashes are pinned in
`session-generation-before-extraction.json`; full **42,443,466-byte** approved-temp
before/after JSON matches bytes/deep equality. Actual counts: 356 session/bundle
attempts (354 successful, two empty/unknown-ref errors), 25 built-ins, all 277
variants across 65 templates, 31 palettes, 12 mixed guitar/bass ladder/cycle/
target/break/seed cases, eight tuning cases, three edges and 595 helper calls.
Source/isolated Lab share the corpus, asserting private bundle format before its
sole normalization. Direct imports match full session charts and trap host/DOM/
storage/fetch/RNG/guards. Semantic checks cover incoming meter/subdivision breaks,
wrap breath, backing silence, local rung tempo, note/anchor/timeline offsets,
whole-cycle target overflow, tuning, pure refresh and mutable registry identity.

Shared graph tests use vendored MIT Acorn 8.18.0, not installed dependencies or
a compiler cache. AST context distinguishes methods from calls followed by blocks
and object division from regex (both exact major-review cases). Comments/strings,
regex charclasses/return regex, nested templates/interpolation, imports/reexports
are covered. ECMAScript 2022 only; syntax errors/new syntax/computed dynamics fail
closed. Core→passive content allowed, content→core/shell forbidden. Parser absent
from Lab inventory. All prior source/Lab boot/failure/credit/renderer/navigation/
package/legal/withdrawn-asset checks remain. Known NaN-BPM backing/nonpositive
ladder-step loops may not terminate: not invoked/fixed here. No live-host/DI claim.

Complete exercise-core batch: **260 → 264 Node tests**, no old fixture recapture.
New `generation-cluster-before-extraction.json` pins actual saved CURRENT DIRTY
22,083-line entry SHA and generation/cluster/backing hashes; independently run
complete original definitions, never sliced subjects. Full approved-temp before/
after bytes and deep equality cover old 961 charts/exercises/bundles + 25 Workouts,
1,512 grips/196 builders/252 motif placements/120 timelines/60 voicings/7 edges,
186 backing configs (all profiles × densities × guitar/bass), all 71 comp/bass/
drum variants and **93 valid Jam runs: 31 styles × full/no-bass/drums-only**, with
spotlight and progression switch-up. Actual direct native imports match fixtures;
fresh complete exercise import/calls trap host, RNG and startup guards and drive
all 40 types. Existing malformed/error fixture rows are preserved, not blessed.

Shared source/Lab graph scanner covers side-effect imports, named imports,
reexports/literal dynamic imports/template interpolation; comments/strings/regex
are ignored. Adversarial fixtures reject computed/non-relative/upward edges and
reexport cycles. No installed compiler/parser dependency in tests. All core and
content JS enter strict cached checkJs; entry/shell are outside that contract.
All new Lab module/ZIP identities, legal/withdrawn assets and unchanged startup/
boot/navigation/file/tuning/renderer/credit mocked regressions pass. Existing
NaN-BPM backing loops can fail to terminate, deliberately not invoked in new
backing corpus; separate known defect, no move-only fix. No live-host/audio/DI
certification, packages/install/publication or sibling modifications.

Generation-foundation batch: **256 baseline → 260 Node tests**. Permanent
`generation-foundation-before-extraction.json` pins the independently captured
CURRENT DIRTY 0.2.13 entry SHA plus full/section output hashes, before moving any
subject. Full approved-temp 61 MB before/after JSON matches bytes/deep equality.
961 raw charts + 961 exercise/bundle attempts (931 valid each, 30 preserved
unsupported/empty/malformed failures), all 40 types/all seven guitar/bass setups,
three key/scale/direction/tempo/bar/meter/seed combinations, resolved guitar
CAGED/3NPS/Open, bass position/full-neck, tuning overrides, key cycles, six Jam
runs, all 25 Workouts and 74 helper rows. Direct native-import output matches 37
dispatch cases; no copied function subjects. Fresh imports/calls trap host IO,
ambient RNG and startup guards; frozen cfg, fresh output, in-place bass fingers,
mutable registries and synthetic-quality memo identity pass. Source and Lab
automatically enforce acyclic lower core imports; Lab checks every new ZIP module,
complete output after asserting private bundle format, legal/withdrawn assets.
Older 71/24/2,600/385/76/218 fixtures and public40/debug91 keys stay untouched.
Strict cached checkJs adds five modules (including nine technique builders);
remaining moved harmony/geometry/scale/arpeggio/bass/tapping/guide-tone JSDoc is
explicitly owed. Mocked complete-entry boot/navigation/files/tuning/renderer/
credit regressions remain discovery-driven. These are not live-host/browser/audio
or Windows DI acceptance; no packages/host/install/publication changes.

Latest chromatic-builder slice: **253/253 baseline → 256/256 Node tests**.
`tests/fixtures/chromatic-builder-before-extraction.json` pins the actual dirty
entry SHA and full snapshot/section hashes, captured BEFORE moving any subject.
Managed-temp full before/after JSON matches bytes and deep equality independently.
Owning core-system rows call real imports and complete entry: **218 raw charts +
218 exercises/bundles**, all seven setups and three override cases, five patterns,
three directions, nine extra divisions, seven stroke choices, odd meter, seed,
tempo/bars/windows/default/NaN/inherited cases; **10 Workouts, 28 helper calls,
19 edge calls**. Direct semantic checks cover exact grid/final sustain, complete
cycle overflow, repeated turnaround, bass fret floor/plucking and finger/pick
marks. Fresh dependency import/calls trap IO, boot assertions and RNG; frozen cfg,
fresh mutable output, shared table identity and in-place stroke annotation pass.
Lab asserts private bundle format before that sole namespace normalization; full
snapshot equality, real imports, acyclic relative core DAG, folder/ZIP, legal and
withdrawn assets pass. Older 71/24 and 2,600/385/76 shape fixtures are unchanged.
CheckJs/syntax/links/brand/whitespace pass; source **0.2.13**, local Lab
**0.2.13-lab.1** unchanged. No live-host/browser/audio/Windows DI certification.

Latest shape-core slice: **249/249 baseline → 253/253 Node tests**.
`tests/fixtures/fretboard-shapes-before-extraction.json` pins actual dirty pre-move
entry/table/full-runtime SHA-256 and counts; full managed-temp before/after JSON
matches byte-for-byte and parsed deep equality. Shared test inputs call complete
real entry before/after and durable direct module imports, never copied resolvers.
**2,600 resolver cases:** ten configs (all seven setups, guitar Drop-C override,
bass-five override, synthetic unison tuning) × four keys (C/Db/G/A) × five scales
(major/natural minor/harmonic minor/minor pentatonic/blues) × five CAGED/seven
3NPS/Open. Raw bass low-level outputs are characterization, NOT offered support.
**385 helper/edge calls:** ordering/cycle/defaults, numeric/string IDs, invalid/
inherited keys, empty arrays, NaN and degree/finger helpers. **76 complete generated
exercises:** nine actual guitar/bass configs, Bb natural minor, scale/arpeggio,
up/down; guitar CAGED E/3NPS 1/Open, bass position ONLY. Real entry verifies every
bass setup rejects all guitar shape systems. Bounds checks cover all 76 charts;
direct supported guitar rows verify pitch uniqueness, top-six anchors, windows,
degree membership, three notes/string and interval-based fingers. Unusual raw
3NPS scale/tuning cases are not all certified within fret 24: 195 captured raw
resolver cases exceed it (max 51), existing behavior retained, separate review/fix.
No new shape support.
Fresh imports trap host access and startup asserts; mutable data/scale dependency
sharing and real-entry invalid-fingering startup failure are durable checks.
Lab verifies relative DAG/no core-upward imports, namespace pointers, complete
snapshot equality, ZIP inclusion, existing legal/withdrawn-assets checks. Source
0.2.13/local Lab 0.2.13-lab.1 unchanged; older 71/24 fixtures never recaptured.
CheckJs/syntax/links/brand/whitespace pass; no live-host/browser/audio/Windows DI.

Latest instrument/tuning slice: **246/246 baseline → 249/249 Node tests**.
`tests/fixtures/instrument-tuning-before-extraction.json` pins the actual dirty
pre-move entry SHA, ordered table/preset IDs and full runtime table/six-helper
snapshot hashes; managed-temp serialized/deep before/after equality also passes.
Core-system rows exercise all 26 presets across guitar 6/7/8 and bass 4/5/6,
Drop-D offset differences, config overrides, intent tags, copy/shared-array and
mutable-data contracts, malformed/inherited keys and fractional numeric behavior.
Test-only lexical probes evaluate the complete real entry, never sliced subjects;
direct imports trap host globals. Lab verifies equal data/helper results, distinct
table identities, synchronous debug reference, static import and ZIP inclusion.
Unchanged 71-case generation and 24 Warmup fixtures are not recaptured. CheckJs,
syntax, links, brand/whitespace and local 0.2.13-lab.1 rebuild pass; no live-host,
browser/audio or Windows DI certification.

Latest Workout registry slice: **243/243 baseline → 246/246 Node tests**.
`tests/fixtures/workouts-before-extraction.json` pins all 25 ordered IDs and full
JSON.stringify SHA-256, independently captured from the actual dirty 0.2.13 entry
before moving the registry. Full managed-temp before/after snapshots pass serialized
and parsed deep equality. Core-system rows cover real direct import host traps,
mutable nested objects/arrays/registry with restoration in a fresh process, and
synchronous public identity with real template lookup. Source/Lab packaging verifies
module equality, distinct namespace identities and ZIP inclusion. The existing
71-case committed corpus (including all 25 session outputs), 24 Warmup charts and
40/91 API keys remain unchanged; no fixtures are recaptured by tests.
Syntax, cached narrow checkJs, links, brand/whitespace and local Lab rebuild pass;
these checks do not certify live-host/browser/audio/Windows DI.

2026-10-20 passive registry extraction: **240/240 baseline → 243/243** source
Node tests. `tests/fixtures/pathways-before-extraction.json` pins all 151 ordered
IDs and a full JSON.stringify SHA-256, captured from the current dirty 0.2.13
real entry BEFORE moving the registry, with DOM boot deferred/no hydration. It
records the old entry SHA-256 (not git HEAD, whose Warmup data differs). No test
recaptures/overwrites this fixture; aggregate hashing covers every base/vary/tier,
goal, hint and other nested value without duplicating the definitions. Managed-temp
full before/after snapshots also passed exact serialized and parsed deep equality.
Direct import tests trap host globals and mutate/restore nested data plus an
ephemeral registry property in a fresh process. Source and generated Lab real-entry
tests assert exported/debug object identity before and after actual index/Markdown
hydration, preserve all existing row pointers and reuse cached Warmup. Packaging
checks real module import, identical Lab data and ZIP inclusion. The unchanged
71-case committed corpus, 24-case authored migration fixture and 40/91 enumerable
API keys remain gated. No live-host/browser/audio/Windows DI certification implied.

2026-10-20 Ladder pilot: pre-edit baseline **191/191**, pilot **205/205**,
reviewer follow-up **221/221 → 240/240**. Final real source/Lab boot regressions
cover first/default and saved pending Warmup, preserved storage on failure,
other saved/user lessons and control edits, navigation retry with late rejection,
error re-entry and successful hydration reuse. A catalog owner regression also
checks old rejection/finally against the still-pending newer promise.
The independently captured live 0.2.12 fixture
`tests/fixtures/chromatic-warmup-before-migration.json` pins all 24 raw charts,
session cfg and bundled notes; never regenerate it from the migrated Markdown.
Reviewer follow-up drives the actual registered DOMContentLoaded boot with pending,
failed, timed-out and navigation-cancelled catalog requests. Source/Lab tests cover
normal-mode binding, once-only event handlers, view/fallback retention, type exit,
real sessionBegin/advance pedigree and quarter90 versus eighth90 credit.
Source and generated Lab compare entire charts (no normalization), plus real-entry
mocked catalog pending/failure, all selections, tuning recovery and stale readiness.
The prior 71-case committed corpus and 40/91 enumerable API keys stay unchanged.
These checks do not certify a live host, audio or installed Windows DI.

> Authoritative testing reference. Read before adding or changing a suite. Historical green counts are not current host certification.

Source-only tests: `node --test tests/*.mjs`. Before documentation cleanup there were **18 tests across four suites**: pitch, scale intervals, core characterization and Lab packaging. Documentation checks now join that discovery; use runner output, not a fixed prose count. Narrow checkJs is developer-only `noEmit`; see [native modules](native-modules.md). Backend tests: `pytest` with the required dependencies. Node tests do not certify host loading, DOM, renderer, audio, navigation or Windows DI.

## Running them

Fixed-variant 0.2.12 WIP: **172/172 baseline → 185/185 → 191/191 passing Node tests**. Adds strict
version-two/all-sibling/selection validation and source/Lab real-entry variant
Play/select/Next/wrap, tuning recovery, deferred readiness ownership and failed
load scenarios. Existing committed 71-case fixtures and 40/91 API keys are not
recaptured. These minimal-DOM/audio-node tests are not live-host certification.
Reviewer follow-up uses real `screen:changed` host callbacks for repeated visits
and canceled re-entry readiness, plus immediate loop/cursor reset before invalid
Setup or readiness failure. Late renderer completion preserves newer user loops.
No live host was started or installed; browser/audio/DI acceptance remains owed.

File-practice combined WIP: **72/72 follow-up baseline → 172/172 passing Node tests**;
direct strict-parser/validation/tempo/loader/text-safety tests plus real source
and Lab dispatch→bundle checks join discovery. The committed 71-case fixture is
unchanged. `smoke-generators` now has a file asset/parser/dispatch row; runtime
Custom/tempo/mismatch/race/navigation/audio checks remain owed without a host.
Cached narrow TypeScript, syntax, local links, brand/whitespace and local Lab
rebuild pass. Browser `npm test` attempted 2026-10-20: exit 2, no host at :8765;
no app/host was started or installed. The reviewed candidate is now authorized
for local source commit and personal-fork Lab `main` publication only.

Review regressions add 14 lifecycle scenarios each against the complete real
source and generated Lab entries (28 tests): actual bind/form/file-button
events with a minimal DOM and stub host renderer, not extracted/copied logic.
Cover incompatible→compatible Setup, tempo recovery, Advanced toggles, canceled
fetch, delayed resolver success/rejection, ready success/rejection after newer
file/Return/view/stop, and current failure recovery. Assert bundle ownership,
exactly-once destruction, no replacement resize/destruction or stale status/
transport reset. These are mocked lifecycle checks, not browser certification.

Follow-up adds 50 scenarios each against source and Lab (100 tests): exact
standard CSV recovery via real per-string blur wiring, normal-type exit after
mismatch, and Jam/Workout button launches delayed at resolver/readiness/voice
warming. Mode/navigation/Stop cancellation, late success/rejection and current
failure must never start abandoned playback; valid completion invokes the
playback boundary exactly once. Audio/start and voice-loading boundaries are
stubbed; the complete real launch/attach/controller code executes unchanged.

2026-10-20 chord/timing slice: **23 baseline → 33 passing Node tests**. Direct
imports pin all 27 chord formulas, nine diatonic rows and nine rhythm cells;
meter/default/NaN/inherited-key quirks, tuplets, odd meters, swing-independent
leaf durations and ordinary mutability are covered. Source and generated Lab
still match the unchanged 71-case committed fixture. All four leaves use narrow checkJs.

`node --test tests/*.mjs` also runs Lab packaging checks (manifest/ZIP/module
graph, namespace ownership, private audio globals, Python AST/SQLite schema,
real entry import with deferred DOM boot and committed-baseline session
equivalence, repeatable generation). These are source-only packaging-system
tests, not a replacement for any live-host smoke suite. Generate the manual
test artifact with `node scripts/cut-lab.mjs`; installation/limitations are in
[the Lab guide](virtuoso-lab.md). Packaging tests generate only disposable temporary artifacts, not the publication worktree.

Audio removal regressions (2026-10-20) in this owning suite check source and Lab
folders/ZIPs for withdrawn recordings and use the complete real entry's debug
functions to restore saved `8ridge` mixer pins, resolve Shinyguitar sample files
and build Metal's existing procedural cab chain without a capture fetch. The
small AudioContext stub checks wiring, not audible quality or desktop acceptance.

The core-system corpus covers 71 deterministic cases (all 28 scales, seven
position-box tuning/string-count configs, four resolved guitar 3NPS configs,
representative theory/rhythm/technique and all 25 sessions) in
isolated real Node ESM subprocesses with generation host-access traps. Complete
raw output hashes and small readable summaries were captured from committed
pre-extraction `c37dc632`; ordinary tests never regenerate or read git history.
Only maintainers explicitly reviewing new behavior should run
`node scripts/capture-core-fixtures.mjs <committed-pre-extraction-ref>`.
Startup console.assert failures throw in the runner; a durable control forces
the first real entry assertion false and requires exit 1 with no corpus output.
The note-time negative control mutates a raw exercise before hashing by +0.001 s,
then restores its readable summary so rejection proves the SHA gate alone.
Baseline provenance, host-stub/loader limits and repeatable checks are documented
in [native modules](native-modules.md). Existing reusable CI workflow is unchanged; the
source corpus command above is ready to add to a source-check job, not a claim
that the shared workflow already runs it.

- `npm test` in `.claude/skills/run-virtuoso/` runs `run-all.mjs`, dynamically discovering `smoke-*.mjs`. Inventory at cleanup: **21 browser files**. This discovery is authoritative.
- For a complete sequential run use `node run-all.mjs 1` in the skill directory. The hand-maintained `npm run test:seq` fallback **omits `smoke-gold.mjs`**; it is not the full suite. Package scripts are unchanged in this docs-only task.
- Most suites have a `smoke:*` alias; Gold currently runs directly with `node smoke-gold.mjs`.
- Read [local dogfood](local-dogfood.md) and the local skill before launching; Windows launchers can stop apps, alter links and pull host source. No launcher is run by source tests.

These plus the startup regression guards baked into `screen.js` (e.g. the no-unison check, which throws on load if a resolved shape doubles a pitch) are the safety net before/after any `screen.js` change.

## Growth rule

**Suites are PER-SYSTEM, never per-exercise/per-feature.** New content is covered for free by enumeration (`smoke-generators` drives every practice type + every `BUILT_IN_SESSIONS` entry, with a drawer⇄registry drift guard) and by the startup guards; a new **durable semantic assert** lands as a **row in the suite that owns the system** (e.g. the djent engine semantics live in `smoke-generators` Phase 5; the tuning/instAgnostic plumbing rows in `smoke-strings` §7) — NOT as a new suite file. A new suite file needs a new *system*. Merge the legacy per-rung suites (herta, over-barline, connect, meter-subdiv) only opportunistically when already touching them.

## Browser suite catalogue

- **`smoke-renderers.mjs`** (`npm run smoke`) — walks all four renderers; asserts each attaches, draws, advances the playback clock, and throws no errors. Also owns the **transport-split row** (2026-06-06: dedicated Stop + Play/Pause toggle — pause freezes the clock in place, resume re-anchors, Stop returns the playhead to the run start and is disabled when no run is alive) and the **jam-transport row** (2026-06-14: the A-B segment loop is GAPLESS — it loops via the rolling-window scheduler wrapping B→A on the same ctx clock + phase-carry, so `scheduledUntilCtx` stays ahead of the ctx clock at every frame incl. wraps, never the old stopAudio()+reschedule that made jams stutter; and a queued jam change lands at the wrap IN-PLACE via `jamHotSwapAtWrap` — the bundle is swapped without tearing down the renderer, so the canvas DOM node survives, the chart changes, and playback never stops).
- **`smoke-generators.mjs`** (`npm run smoke:gen`) — drives `generateExercise()` across every practice type + scale, a bass pass, and all built-in sessions; validates chart structure.
- **`smoke-highway-settings.mjs`** (`npm run smoke:hwy-settings`) — guards that the borrowed 3D Highway inherits the host's `h3d_bg_*` look settings (and never writes them); see the "3D Highway inherits host settings" memory.
- **`smoke-strings.mjs`** (`npm run smoke:strings`) — drives the real form → `readConfig` path to guard that generated charts adjust for **string count** (4–8) and **tuning** (the displayed pattern + notes change), so the 2026-06-01 string/tuning plumbing bugs can't silently return; see the "stringed-instrument tuning/count framework" memory.
- **`smoke-meter-subdiv.mjs`** (`npm run smoke:meter`) — guards the 2026-06-03 meter-aware **Division default**: a user meter change bumps a too-coarse subdivision up to the pulse (quarter→eighth under any /8) but never touches a /4 meter or a finer pick, an explicit pick survives a regenerate (a default, not a clamp), and the live pulse caption names the felt pulse / frames the cross-pulse phasing. Fixes the "quarter notes don't follow my tempo in 7/8" trap; the generation engine is intentionally unchanged (it is DAW/notation-correct — `secondsPerDivision`/`measureSeconds` untouched).
- **`smoke-over-barline.mjs`** (`npm run smoke:overbar`) — guards the Tier-2 capstone rung `rhy_over_barline` ("Over the Barline"): selecting the pathway presets quarter-in-7/8 and that preset **survives the Tier-1 meter-aware bump** (the trap-as-lesson interaction — pathways set fields silently), it generates a valid phasing chart (quarter notes that don't divide the 7/8 bar), and the option/band/goal-card are wired. The deliberate metric-superimposition drill that *teaches* the phasing Tier 1 steers beginners away from.
- **`smoke-herta.mjs`** (`npm run smoke:herta`) — guards the Tier-3 **guitar herta** drill (`buildHertaExercise` / `practiceType:'herta'` / the `pick_herta` Picking-band node): the cell is pick→hammer→pull→pick on one string (accent on note 0 by default), even sixteenths, a whole-step trill, with `hertaAccent` moving the accent (incl. the authentic accent-last) and `hertaWalk` walking the base through the scale. The authentic `R R L R` accent-last **drum** herta is a separate node (Tier-3 follow-on).
- **`smoke-audioctx.mjs`** (`npm run smoke:audioctx`) — owns **AudioContext behavior**: the `window.AudioContext` patch (the highway-click stub) stays scoped to Virtuoso's **own active screen** (stub while visible, **real** ctx with `decodeAudioData` when backgrounded — the v0.5.0 cross-plugin bug; see the "AudioContext patch must be screen-scoped" memory), **plus the host output-device follow** (2026-06-07: web-host no-op, the `pickSinkMatch` JUCE-name→Chromium-label semantics, and a faked desktop bridge at Play → never blocks playback + the honest ⚠ mismatch).
- **`smoke-connect.mjs`** (`npm run smoke:connect`) — guards the v0.6.0 "play the changes" voice-leading in `buildChordScaleExercise`: a ii–V–I in Connect mode must land each new chord's run on the nearest guide tone (3rd/7th), with **0 root-restarts** and bounded chord-seam leaps; see the "Playing-the-changes initiative" memory.
- **`smoke-variation.mjs`** (`npm run smoke:variation`) — guards the Workout variation engine: rolls **every variant of every `SEGMENT_TEMPLATE`** through `generateSession` (a one-slot template-ref workout), validates chart structure, and asserts the **length-locked** refresh invariant (all variants of a template share one duration — refresh varies content, never difficulty) plus `refreshWorkout` advancing; the no-row / style-lock / no-unison invariants throw at load via `validateSegmentTemplates`. See the "Segment library + Refresh" memory.
- **`smoke-session-sync.mjs`** (`npm run smoke:sync`) — guards multi-block Workout playback **alignment**: backing/notes/click must stay phase-locked across blocks. Builds sessions (tempo-varied blocks, a forced inter-block break, a bpm-ladder block, a key-cycle block) and asserts the **backing tracks each block's/rung's own tempo + key**, is **silent during the break**, and that single-config modes (Pathways/Custom/Jam) are unaffected. Regression guard for the 2026-06-02 backing-desync fix (backing had been synthesized from the *first* block's cfg over the whole session — `makeBundle` now prefers the per-block `chart.backingEvents` assembled by `buildSessionChart` + the rung builders).
- **`smoke-progress.mjs`** (`npm run smoke:progress`) — guards the Depth Ladder + XP store (`virtuoso.progress`): XP accrues (gained-only); the **Travel axis** credits a clean Push pass in a not-yet-credited key **only once the Speed climb is cleared** (the rung flips on the 2nd distinct key, no double-credit, unclean runs rejected); **Off mode** collapses the whole layer. The store is **shell** (localStorage), not core. See the "Segment library + Refresh" memory (Phase 8).
- **`smoke-core-purity.mjs`** (`npm run smoke:core`) — guards the core/shell host-independence boundary (see "Core/shell boundary" under Key constraints): traps `window`/`document`/`localStorage`/`fetch`/`slopsmith*` and runs every exercise/session builder to assert the generation path never touches the host surface.
- **`smoke-backing-engine.mjs`** (`npm run smoke:backing`) — owns the **backing-engine system** (per the per-system growth rule, new backing-engine asserts land as rows here): `chart.timeline` structural validity for every style palette (slot-sorted, contiguous, covers the chart, the bar-locked degenerate case), sub-bar harmonic rhythm (`2/bar`), `applyTimelinePush` anticipation semantics, **seeded determinism** (same cfg ⇒ byte-identical chart, even for `direction:'random'`; `humanSeed` reproduces/varies the roll), key-cycle charts carrying a per-rung timeline, session charts assembling the timeline **per-block** (the desync rule), and the **rolling-window scheduler node ceiling** (Play on a 30-min Woodshed creates a bounded number of audio nodes — was 39k whole-pass — with no second-long main-thread block). Guards backing-engine steps 0–4 (rows added for step-3 `COMP_GROOVES` pad-kill/density/suppression and step-4 `BASS_FIGURES` walking/kick-lock/lift/mute); see the "Backing engine" memory.
- **`smoke-gems.mjs`** (`npm run smoke:gems`) — the #254 per-note gem hook + the timing-model acceptance: a synthetic correct pitch through a FAKE scorer lights note[0], and an on-time player must credit EVERY note of a 160 BPM chromatic 16th run; target-independent.
- **`smoke-scoring-e2e.mjs`** (`npm run smoke:scoring-e2e`) — the only REAL-audio test: a synthesized A2 WAV streamed as the mic via Chromium fake-media flags through the HOST's actual detector, with a wrong-key negative control; hard-FAILS on an SDK-less host by design.
- **`smoke-contained-verifier.mjs`** (`npm run smoke:contained`) — the desktop contained-playback grading path: the engine harmonic-comb `NoteVerifier` / 3D-highway route, exercised via a MOCK `window.noteDetect` contained API since the native engine is desktop-only; guards Byron's #9.
- **`smoke-level-gate-async.mjs`** (`npm run smoke:level-gate`) — historical async desktop-level/legacy verifier-fallback regression. This fixture is not authority to add a level veto to contained-verifier credit; current credit remains host-verdict-only. Mocked bridges cannot certify real DI.
- **`smoke-host-surface.mjs`** (`npm run smoke:host-surface`) — guards the §12 host-global accessors after the FeedBack re-chrome renamed `window.slopsmith*`→`feedBack*`: asserts `vizFactoryFor()` resolves the **new** `feedBackViz_<id>` name first (the v0.3.0 break that silently dropped the 3D highway to 2D and killed the green hit-flare — viz + desktop have NO legacy alias) and that `hostBus()`/`hostMinigames()`/`hostDesktop()`/`vizFactoryFor()` read new-name-first with legacy fallback. Fixed in 0.1.1; see the "FeedBack re-chrome globals" memory.

- **`smoke-coach-rx.mjs`** (`npm run smoke:coach`) — fault-to-next-drill mapping and valid pathway destinations; pure mapping fixtures, not real detector certification.
- **`smoke-gold.mjs`** (`node smoke-gold.mjs`) — Gold improv gate axes, gained-only store and MIDI-to-position mapping. Gate tuning on a real device remains separate acceptance work.

## Ad-hoc probes & shots

Ad-hoc `probe-*.mjs` and `shot-*.mjs` files are ignored session tools, not part of `npm test`, and may be absent or stale. Promote durable assertions to the owning system suite. `run-all.mjs` discovers suites automatically; only optional solo aliases and the legacy sequential chain need manual maintenance.

## Documentation and syntax gates

From the repository root:

```sh
node scripts/check-doc-links.mjs
node --input-type=module --check < screen.js
node --check scripts/cut-lab.mjs
node --check scripts/cut-beta.mjs
node scripts/check-brand-hygiene.mjs
git diff --check
```

The dependency-free link checker validates local Markdown/image/HTML-attribute
targets, ignoring anchors, external URLs and template examples. Source-doc tests
also check mirrored guidance and stale moved paths. Lab packaging validates the
standalone generated README against files actually packaged.
