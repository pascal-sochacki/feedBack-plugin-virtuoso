# Testing — the smoke-suite catalogue

Strict-entry continuation (2026-10-21; entry debt cleared): fresh dirty-tree
baseline **72 → 0 diagnostics** in `npm run typecheck:entry` (TypeScript 5.9.3).
The ignored `coverage/typecheck-entry.json` is the fresh report. The exact
historical entry AST SHA, renderer extraction pin and transport pin pass without
expected-hash or historical fixture edits. The public `window.Virtuoso` API now
has an explicit ordered 40-key type contract; persisted progress remains unknown
until narrowed. The original dynamic `form.elements[name]` lookup is preserved
and given a local type view, without replacing its crafted-key behavior. Focused
entry-types/renderer-lifecycle/run-transport/practice-selection tests pass
**60/60**. Root typecheck, lint (132 files; 0 new/errors, 1 known warning), entry
syntax, doc links, brand scan and whitespace pass. Full `npm test` was not rerun;
the prior timeout is not counted. These source gates do not certify live host,
browser, audio, or Windows DI behavior.

Strict-entry continuation checkpoint (2026-10-21): verified fresh baseline
**72 diagnostics** → **70** after two runtime-inert `_jamMirror` non-null JSDoc
casts derived from the same function's synchronous reset guard. Only TS18047
changed (**22→20**); unchanged counts: TS2322 2, TS2339 12, TS2345 28, TS2531 1,
TS2532 1, TS2538 1, TS7015 1, TS18048 4. `tests/entry-types.mjs` passes all **15**
tests, including the historical normalized AST SHA-256
`10f4e4402b7fdff8a2d5da9286ea4ea7e922e5077e67ace9acdc185513de863c`; focused
entry-types/renderer-lifecycle/run-transport passes **48/48**. Root
`npm run typecheck`, lint (132 files; zero new/error diagnostics, one known
warning), `node --input-type=module --check < screen.js`, `npm run check:docs`,
`npm run check:brand` and `git diff --check` pass. `npm run typecheck:entry`
correctly exits 1 with **70** remaining diagnostics. Full `npm test` was not run
at this checkpoint; the previously timed-out run is not counted. No historical
fixture/hash was changed or recaptured. These source tests do not certify a live
host/browser/audio/Windows DI runtime.

Strict-entry Wave 1 (~490–6552) JSDoc cast batch (2026-10-21): strict entry
**168→130** (−38, all wave-range sites ≤6552 cleared; maxLine 14913).
Diagnostics by code now **{TS2345:32, TS18047:38, TS2339:14, TS18048:11,
TS2531:7, TS2532:7, TS18046:8, TS2722:5, TS2322:2, TS2538:3, TS7015:1,
TS18049:2}**. Fixes are typed trivia only — inner-line JSDoc casts and decl
param JSDoc (which byte-pins strip) plus one audited `tick` const-bus runtime
form following the `loop:set|clear` precedent (`hostBus().emit('virtuoso:
loop:wrap', …)`), all reversed byte-exactly in `normalizeEntrySafety` (22 cast
entries, the `loop:wrap` 10/12-indent regex, and the prior session's NoteDetect
`Required<>` cast entry applied to all 14 wrapped occurrences).
`styleVoiceFor` uses the audited double-cast `Record<string, AudioVoice|null>`
through `unknown` (rolling-piece maps lack index signatures; param retyping
rejected earlier because AudioProfile/ResolvedAudioProfile need `family`/
`humanize`), keeping the approved shape.
Pin restoration checkpoint: run-transport row pin had drifted below expectations
(`cc3d2eb…` vs `3fd36a25…`) even after every wave-1/noteDetect reversal was
re-applied and wave-1 edits were proven inert by reconstruction. A per-statement
`normalizeTransport` diff against a reconstructed cast-stripped source isolated
a single residual byte — the unreversed `(/** @type {number} */
(cfg.countInBars))` wrapper in `makeBundle`, a pre-wave-1 cast whose inline
strip left `((cfg.countInBars))` in the pinned row. Adding its byte-exact
replacement restored the full pin chain: entry rows 773/`cc3d2eb…`, renderers
historical 738/`38c64e85…`, practice-selection 748/`cab5179b…`,
renderer-lifecycle 759/`e3e06eb7…`, typing-foundation AST 773-statement
`10f4e440…` all green. Verified (Node26.12.0): `npm test` **408/408**,
`test:properties` 4/4 at seeds 20261021 and 271828, lint 132 files / 1 known
warning, root core+shell tsc clean, entry syntax check pass, doc-links/brand
pass. Deferred Wave 2/3 sites unchanged. No stage/commit/push/install or
publication/dist edits; no `any`/`@ts-ignore`/flag changes.

TS18047 nullable closure/state correlation batch (2026-10-21): strict entry
**233→205** (TS18047 75→51, TS2339 29→26, TS2538 4→3; all other codes unchanged).
Correlated state reads fixed by 13 single-line truthy JSDoc casts (runtime-zero)
plus 7 audited runtime guards: the showResultsModal count-up closure
`if (!el || !el.isConnected || pct === null) return;`, the pack dragstart /
dragover×2 / drop×2 `dataTransfer` snapshot returns, and the woodshed
`lv.nextAt != null` correlation. Fail-first repro confirmed each guard's
before effect (null-deref throw inside the callback) and after effect (silent
no-op); valid paths are behaviorally identical and captures unchanged. All seven
guards and the casts are reversed byte-exactly in the audited `normalizeEntrySafety`
recipe list; the parent's 5 golden SHA pins still hold without recapture, and a
before-batch reconstruction diff confirmed every removed diagnostic sat on a
touched site (three TS2339 `textContent`/`getAttribute`/`blur` clears came from
the truthful casts). Deferments unchanged: TS2538 7078:58/8489/13541 (`?? -1`
rewrite deferred with fixture recapture) and TS7053 `styleVoiceFor` 5422.
Re-verified 408/408 full tests (Node26.12.0), properties default+alternate
seeds, lint 132/0 new-error/1 known warning, root tsc, entry syntax,
doc-links/brand/whitespace. No stage/commit/push/install/publication edits.

Reverted lookup-equivalent TS2538 batch (2026-10-21): the four edits from this deferred-line
batch — showResultsModal `TIER_LABELS[s.clearedTier ?? -1]`, `ladder.tiers[primary.idx ?? -1]`,
the `typeof dur === 'number'`-narrowed `DRUM_NATURAL_DUR[String(piece)]` duration pick, and the
session `PROOF_TRANSFER[String(_activeSession.pathway_id)]` key conversion — were reverted
exactly on 2026-10-21 after the **5 golden SHA pins (typing-foundation AST, transport-events,
renderer-extraction, entry-statement-order, selection-order) FAILED**, and all pins now pass.
Earlier CORRECTION of a wrong journal claim: the pin failures were **not pre-existing** in the
dirty tree. They were caused by these code edits not being normalized with the submitted
fixtures; the "pre-existing" reading came from reconstructing the baseline against HEAD, which
is older than the current source-version-14 dirty tree and is not the saved dirty-before the
pins compare against. The prior last-approved 408-test pin-clean state is preserved.
Verified post-revert state (Node26.12.0): `npm test` **408 run / 408 pass / 0 fail** with no
fixture or pin recapture, `test:properties` **4/4** at both seeds 20261021 and 271828, root
core/shell tsc clean, lint 132 files / 0 new-error / 1 known warning, entry syntax check and
the native module graph variant pass, `git diff --check` clean, doc-links/brand hygiene pass.
`typecheck:entry` remains **exit 1** at **233 diagnostics** (the reverted batch took 229→233:
exactly the four reopened TS2538 sites at 6741/7078/8489/13548), TS7053 remains only the
deferred `styleVoiceFor` (5422). All other kept batch edits are unchanged (TS7053
`Record<string,…>` JSDoc records, the approved `b.src`/`kit.pieces`/`DRUM_PIECE_GAIN`
`String(piece)` coercions pinned by the nullable dictionary captures in tests/entry-types.mjs,
and prior waves' allowlisted named reversals). The kept batch halves still stand: TS7053
**5→1** (4028/10015/10017/14922 reconciled as runtime-confirmed `Record<string,string|number>`
annotations) and the kept TS2538 dictionary coercions pass their negative-value capture pins.
The four lookup-equivalent rewrites remain
legitimate fixes for the TS2538 debt and are deferred for later review **with legitimate
fixture recapture/normalization ownership over the five pins** — the pins must be regenerated
with the fixes, not rewritten to match arbitrary output. No stage/commit/push/install/
publication/host/broadcast dist edits; no strict weakening, no suppression banner.

Bounded nullable lookup checkpoint (2026-10-21): supplied interrupted-wave recovery
baseline406/254/1 (parent-reported prior review LGTM), final **408/408 tests**, strict
entry **254→237**, TS2538 **21→4**, other code counts unchanged; lint132/one known
warning, zero new/errors. Node24.19.0 full suite/default seed20261021 and seven
properties/700 cases at alternate271828 pass, as do focused negative type controls,
native/root types and syntax/docs/brand/whitespace. Full suite retains source/Lab
corpus/audio/clock/public/debug/563-runtime/legal/ZIP/graph pins without recapture.
Seventeen known nullable string dictionary indexes use existing JS property coercion;
captures preserve null17/undefined23/empty31/authored47/missing undefined/inherited
toString. No arbitrary unknown/object/symbol key conversion. Independent current-dirty
before SHA256 `8a5733b181e342c1f1beea69a1f08609c4765f9b8fdb7bbda1c06c8406d03e92`;
complete normalized AST before/after remains `10f4e440…`, historical hash unchanged.
Deferred TS2538 lines6739/7076 (numeric arrays),8487 (conversion exposed argument
debt; reverted),13541 (finite dictionary ownership). No new runtime module, audio/
judge/articulation/timing/lifecycle policy, suppression or strict weakening. Entry
still exits1, outside root check; this bounded batch is done, not entry completion
or live host/Windows DI certification. No publication/install/stage/commit/push.

Entry wave6 (2026-10-21; unfinished): strict **346→284**, still exits1; no flag
weakening, new production suppressions/any or normal/root entry integration.
**402→405 tests**, **405/405** at both property seeds20261021/271828 on Node24.19.0,
zero skips/cancellations (seven properties/700 cases per seed). Fresh before run
was402/402 on the initially selected Node26.12.0; final runs use configured Node24.
Resolved segment cfg, audio defaults, bass patterns/generators and drum FX ownership
have positive/unsuppressed negative controls; exact authored button metadata is
checked against uncommented HTML. One new runtime form guard rejects non-controls
before delegated queries (fail-first observed2 versus0); source/Lab now pass and
existing valid form/generation/transport/corpus/API40/debug91 captures remain exact.
Historical AST fixture unchanged; exact named guard reversal also matches the
independently saved CURRENT DIRTY source `c024de3cf114c37c453cf26cd15c29a8ce672ad9d8b1fdf051096699b5019d8c`.
Byte pins normalize only three exact type-parenthesis expressions, never arbitrary
statements. A focused run initially failed the starter-array byte pin; that exact
parenthesis normalization repaired it without fixture recapture. The new owner
negative test initially expected TS2322 for absent FX nodes; actual TS2739 is now
asserted alongside the other unsuppressed codes. Final suites pass. Lint132/4,
core81/0, named/root native types, first-party syntax, docs/brand/whitespace and
isolated Lab legal/folder/ZIP/parity pass; Knip full1/production2 remain nonzero.
Remaining284:144 nullable,30 properties,42 arguments,47 nullable-index,2 dynamic
indexes,19 other. Zero/root integration, parent review and live host/audio/Windows
DI remain owed; no remote CI/backend/coverage certification claimed. No new runtime
module, extraction, detector/articulation/DSP/credit/timing change or publication.

Entry wave5 (2026-10-21; unfinished): **402/402 passing** at both seeds20261021/
271828, zero skips/cancellations, Node24.19.0. Strict entry **501→346** still
exits1; named/root native checking passes but excludes the entry. Two fail-first
source/Lab categories add LCD value/blur and transient delegated target guards;
normal Enter/tempo, nested mixer toggles, historical AST, public40/debug91,
paint/audio/clock/corpus and Lab legal/folder/ZIP pins pass without recapture.
Generated selector tags/data and positive/negative type controls are checked.
Untested broad runtime edits from the intermediate166-diagnostic attempt were
removed, including a detector early-return change; that count is not progress.
Lint132/four unchanged warnings, core81/zero warnings, syntax/docs/brand and Knip
full1/production2 intentional findings are unchanged. Remaining346 includes178
nullable diagnostics,39 properties,55 arguments,47 nullable indexes and6 dynamic
indexes. Live host/browser/audio/Windows DI and parent review remain outstanding.

Historical entry wave4 (2026-10-21): **393→398 passing**, zero skips, Node24.19.0, full suites
at both seeds20261021/271828 (seven properties/700 cases each). Exact
strict entry **752→501**, cumulative2,272→501 (77.9%). Reporter **exits1**, all501
errors in screen.js; normal named/root strict checks still exclude entry. Optional
sustain, actual lifecycle exercise, generic caller-owned transport bundle, meter
state/span metadata and existing optional browser sink capability are explicit.
Four real-entry fail-first tests captured actual exceptions before fixes: renderer
teardown during resize, host disappearance between navigation reads, missing Play
button and delegated click with a Text-like target. Guards now pass source and
isolated Lab: rendering never paints a released context; optional navigation uses
one call-time snapshot; partial binding skips absent Play; non-element events no-op.
New type regression rejects missing visible-meter/span data and preserves concrete
transport bundle shape. Valid source/Lab paint, generation, audio/transport clocks,
cfg/selection/event captures and all historical fixtures/API40/debug91 remain exact.
AST/old statement comparisons reverse only named reviewed guard/context edits;
source-only evidence is not browser rendering/audio/DI certification. No grading,
silence/DSP/timing policy or late verdict consumption change. Nullable comparison
guards retain old undefined comparison outcomes; no false nonnull assertion.
Lint132/four unchanged warnings, core81/0, named/root types and Lab563 legal/folder/
ZIP/declaration-exclusion, syntax/graph82/entry79, docs/brand/whitespace/mirrored guidance
pass. Knip full1/prod2 intentional findings still exit1. Entry14,901→14,916 (+15),
declarations405→425 lines.
Remaining501: nullable252, properties109, arguments80, indexed25, plus other visible
codes. Completion and parent review remain owed; no stage/commit/push/install/
version/publication/host/sibling/existing dist edits.

Entry typing wave3 (2026-10-21): **392→393 passing**, zero skips, complete suites
at seeds20261021/271828 (seven properties/700 cases each). Exact strict
browser entry **1,210→752 (−458)**; cumulative2,272→752 (66.9%). The command still
**exits1**; native named/root types exclude entry and passing them does not certify
the full entry. Implicit params313→0, declarations22→0/reads32→0, indexes78→25 and
properties233→116; new precise mismatches remain visible. **392** nullable errors
and **109** argument mismatches remain; no policy weakening, suppressions or new any.
Bundle/accompaniment/beat metadata, pre-form authored cfg, host tuning/frame payloads
and internal ledger writer contracts complement actual audio/scheduler/transport/
geometry/UI parameter annotations. Incoming settings fields remain unknown until
existing narrowing; storage reader validation is not claimed. Read-only host source
eef58c88 corroborates tuning endpoint, tuner frame/namespace and progression getter;
no _tunerReloadConfig publisher found, so only its guarded legacy call is typed with
unknown return, not invented asynchronous guarantees. WAF gain verified from the
vendored findEnvelope implementation (actual GainNode).
New strict negative test accepts numeric mutable registries and nullable tuning,
rejects seven invented/mistyped bundle/host/authored/registry/drum fields. Whole entry
executable AST still equals the saved dirty-before pin, historical fixtures/API40/
debug91 unchanged. Exact parentheses introduced solely to attach JSDoc normalize at
named audited expressions; no arbitrary syntax/behavior comments ignored. Existing
full source/Lab lifecycle, corpus/render/cfg/event/transport and Lab563 legal/ZIP/
declaration-exclusion gates pass. Entry14,693→14,901 (+208); thirteen .d.ts files405
lines. Node24.19.0, lint130/four unchanged warnings, core81/0, named/root types,
syntax/native graph82/entry79, docs/brand/whitespace and mirrored guidance pass.
Knip full1/prod2 remain intentional exports and exit1, not a clean claim.
Full-entry zero, remaining native/entry contract reconciliation, parent review and
RUNNING HOST audio/DI/version floor remain owed. No runtime behavior/credit/timing
changes, stage/commit/push/install/version/publication/host/sibling/dist edits.

Entry typing wave2 / power review (2026-10-21): **390→392 passing**, zero skips,
full suites at Node24.19.0 with seeds20261021/271828 (seven properties/700 cases each).
Corrected actual desktop power name removes two false TS2339 errors **1,647→1,645**;
source `00653cf4` preload603 invokes IPC, main1384–1386 returns nothing, so the honest
contract is **Promise<void>**, not boolean. New positive/negative test accepts guarded
awaited action and rejects invented sleep API, unguarded optional calls and a boolean
result; unsuppressed control codes are asserted. No runtime power call changed.
Further coherent typing reduces **1,645→1,210**, cumulative **2,272→1,210 (46.7%)**.
Implicit params605→313, indexed accesses159→78, implicit reads85→32/declarations41→22;
nullable and precise boundary errors remain. Complete entry **still exits1**, normal
named/root types exclude it. No suppression, new any, flag/lib weakening or debt budget.
New results/form/plugin-global negative controls reject seven bad properties/types;
real markup validates literal form selector tags and nullable fallback behavior.
Runtime AST/hash, all historical fixtures/statement pins, public40/debug91 and
isolated Lab563 folder/ZIP/legal/source-parity checks pass; declarations excluded.
Full lint130/4 unchanged, core81/0, named/root types pass. Knip full1/prod2 intentional
findings exit1 unchanged. Entry14,520→14,693 (+173); declarations171→333 across ten
files. No claimed storage validation, running-host/backend/DI/coverage certification.
Full-entry completion and parent review remain owed; source14/published13 unchanged,
no stage/commit/push/install/host/sibling/existing publication/dist edits.

Entry typing foundation (2026-10-21): **386→390 passing**, zero skips. Baseline
suite used available Node26.12.0; final full suite used installed **Node24.19.0**.
Final **390/390** also passes seed271828; seven properties/700 cases run at both
20261021/271828 with zero skips. Native graph remains entry79/all-source82; Lab563.
TypeScript **5.9.3**, exact inherited strict ES2022+DOM entry diagnostics **2,272→1,647**
(625 fewer; 27.5%). `npm run typecheck:entry` exits **1**, writes complete ignored
`coverage/typecheck-entry.json` grouped by code/file and prints representative causes.
No debt budget or false full-entry pass; native named/root types still exclude entry.
New 4 tests pin the independently saved whole executable AST (including declaration
grouping/order), real host helper AST, markup-backed literal ID types and actual
reporter exit/counts. Seven negative typed probes are also rerun without suppression:
eight real diagnostics reject unavailable bus/navigation, invented APIs, nonnumeric
verifier targets, canvas/input cross-properties and fixed/dynamic nullable lookups.
Historical fixtures unchanged; only new type JSDoc trivia is normalized in old byte
pins, with negative controls preserving executable differences/behavior comments.
Existing corpus, transport, renderer/config/selection/event and isolated Lab folder/
ZIP/legal/source-parity suites pass. Declarations, entry tsconfig/helper/reports are
asserted absent from Lab; no runtime imports, public40/debug91 or behavior changes.
Full lint **130 files / 4 unchanged warnings**, core **81 / zero warnings**; strict
named/root types, syntax, links/brand/whitespace and mirrored guidance pass. Knip
full1/prod2 retain exactly the intentional exports and exit1, not a clean claim.
Entry **14,365→14,520 (+155)**; six development declarations **171 lines**.

Remaining errors include **605 implicit parameters / 85 implicit reads / 41 implicit
declarations / 159 indexed accesses / 329 nullable accesses / 276 missing properties**;
some newly exposed nullable/capability errors were previously hidden by implicit any.
No null guards, detector timing, late verdict consumption or audio algorithms changed.
Host-source evidence: core `eef58c88`, desktop `00653cf4`, note_detect `412433de`,
read-only 2026-10-21; running-host and detector versions/floor remain unknown. No
live-host/backend/Windows DI or coverage run claimed. Source14 remains unpublished;
published/installed13 USERREPORTED smoke does not validate this local work. Parent
review and continued full-entry typing remain owed; no stage/commit/push/install,
host/sibling/existing publication/dist edits.

Complete unused audit (2026-10-21): baseline **383/383**, final **386/386**, zero skips. Installed
ESLint scans all 128 first-party files; initial 12 unused declarations plus the
now-callerless private label table are removed, **zero unused diagnostics** remain.
Unused bindings and all non-positional parameters are errors even in entry and
guide-tones; four unchanged non-unused warnings remain. New negative controls cover
constants, local/functions/imports/underscore locals and every parameter position;
actual full-scope lint and whole-entry TypeScript unused probes gate future residue.
Named/root types enable `noUnusedLocals`/`noUnusedParameters`; the whole-entry probe
filters only unused diagnostic codes, not a claim its 2,272 unrelated errors pass.
Saved dirty-before SHA `3e37e151…` yields exact named-removal statement hashes;
all previous runtime fixtures stay immutable. Independent before/after corpus,
transport, attachment, presentation events, Workout, tuning and selection captures
match exactly. Entry **14,445→14,365**; active host verdict/timing, owned card/save,
public40/debug91 and unpublished version unchanged. No host/browser/Windows DI
certification, install/publication or sibling changes follow from these checks.
Full/core lint, named/root strict types, entry/81-native syntax, links/brand/whitespace
and mirrored guidance pass. Seven properties/700 cases pass seeds 20261021/271828.
Isolated Lab14/563-file build and full suite legal/folder/ZIP/module gates pass;
Knip full1/prod2 still exit 1 for the same intentional regression exports. No
coverage run or live-host/backend-runtime test is claimed in this cleanup.

Unused callback guard (2026-10-21): **382→383 tests**, zero skips. Actual installed
ESLint config rejects unused first callback slots and trailing parameters across
entry/native/tool/test scopes; deliberate `_value, index` remains valid without
exempting unused underscore locals/imports. New legacy argument warnings fail the
real baseline ratchet; existing **16** non-argument warnings are unchanged. Eight
findings repaired (one private trailing parameter removed, seven deliberate
positional/signature slots renamed); catch policy unchanged. Immutable before-source
hashes normalize only four exact entry parameter edits, not bodies/fixtures.
Public/debug identity, generation/renderer/transport evidence and source/Lab tests
remain pinned. No runtime policy/version change or host certification claimed.

Pathway IDE typing (2026-10-21): baseline **381/381**, final **382/382**, zero skips. Shared registry
annotations cover all 151 static entries and actual hydrated Warmup fields without
normalizing/copying/freezing data. An in-memory strict TypeScript regression accepts
authored hydration, optional density arrays and common base/variation cfg access;
four negative probes reject a density typo, invented root/cfg fields and string
bars. No probe file is written. Root IDE config covers core/content and the existing
selected shell/renderer scope; `screen.js` remains unchecked as a whole. An isolated
strict browser-entry probe drops **2,366→2,282** diagnostics: both reported fields
at line **1731** and all related missing-density-field diagnostics clear, but
unrelated entry typing debt remains. Named core/shell and combined root strict types,
lint16 (no new warnings), core lint, syntax/DAG79/all-source82, links/brand/whitespace
pass. Knip full1/prod2 retain their intentional findings (nonzero exit), not a clean
unused-code pass. Isolated Lab14 folder/ZIP/legal/source-parity checks pass with
**563** runtime files and all tsconfigs excluded. Entry stays **14,445** lines;
runtime values, public40/debug91 fixtures and version are unchanged. No stage/commit/
push/install, host/sibling or existing publication/dist edits. This is not a
full-entry or host pass; parent review remains outstanding.

Run transport foundation (2026-10-21): baseline **373/373**, final **381/381**,
zero skips; eight new Node rows. Saved CURRENT DIRTY entry SHA-256
`958f0ebcc0c24278e99ec05d3514d1020fec3c1f8ba2975ec91f7e0a3ce00373`.
The real unsliced entry harness captures **15 rows / 70,054 bytes**, including raw
fake-audio start/stop calls, count-in lookahead, audio versus wall advance, pause
duration, paused seek, resume runway, A-B crossing/clear, Stop/Reset/replay and
hidden-root stop, plus target fields/status. Exact source and namespace-only Lab
parity; full before trace remains approved-temp, small committed hash only.
**782** untouched statements pin before-source order after live-read normalization;
older music/renderer/cfg/API fixtures remain immutable. Fake AudioContext is not
real scheduler latency evidence and this trace does not simulate host verdicts.

Fail-first repeated pending Play ran against saved dirty entry: **2 warm-ups versus
1 expected**. Current source/Lab joins and starts once. Native tests cover frozen
audio/wall fallback, resume/loop/start/Stop laws, canceled/false/rejected readiness,
current versus stale voice failure and newer request survival. Seven bounded
properties (**700 cases**, seeds **20261021/271828**) include valid async transport
commands with independent operation-log expectations and clock arithmetic.

c8: **14,386/29,172 lines (49.31%)**, **4,806/5,694 branches (84.4%)**,
**580/605 functions (95.86%)**. Native domain **69/69 lines, 24/28 branches**;
controller **108/108 lines, 66/69 branches, 33/34 functions**. Missing branches
remain visible; entry still data-URL zero-measured, no threshold/badge. Strict
types/lint16/core lint/Knip full1/prod2 intentional inventory pass. One existing
duplicate debug key's source-line hash changed solely for live getters; same rule,
message and count retained, no ignored rule/budget added. Historical test adapters
now read injected plain presentation state rather than writing removed locals.
RUNNING HOST/font/cache/reentry/audio/judge/Windows DI and parent review remain owed.

QA2 readiness correction (2026-10-21): **369→373 passing**, zero skips. Four new
tests cover source/Lab current held-ready Play rejection in single and loaded
Workout modes, old rejection after newer rendered/played intent, and a direct
native-owner subprocess with five malformed borrowed cases: missing draw, throwing
draw/init/ready getters and throwing then getter. Fail-first runs captured actual
`unhandledRejection` before fixes. Current failure reports status and remains
stopped; no voice warm/start/targets. Stale failure leaves newer status/handle/loop
unchanged. Validation/getter errors still reject attachment, observed readiness
does not convert failure to success; exact-once cleanup asserted.
Full coverage run **373/373**; six properties/600 cases pass both fixed seeds.
c8 **80 files**, **14,209/29,091 lines (48.84%)**, **4,718/5,599 branches (84.26%)**,
**542/566 functions (95.75%)**; lifecycle **261/264 lines (98.86%)**, **128/149
branches (85.9%)**, **29/29 functions**. Entry remains zero-measured **14,541**.
Strict types/lint16/core lint/Knip1/2/syntax/DAG/docs/brand/whitespace and isolated
Lab14/561-file gates pass; existing fixtures and source version unchanged. Browser/
font/cache/host audio/Windows DI remain unverified; parent QA re-review is owed.

Renderer lifecycle (2026-10-21): baseline **348**, internal extraction checkpoint
**348**, final coverage run **369/369**, zero skips. **21 new tests** include direct
native owner semantics, real source/Lab held-ready Play and Stop/new-generation
cancellation (including late rejection and voice warming), candidate publication/
commit order, stale resolver/ready A→B→A success/error, exact-once destroy, malformed
borrowed shapes and optional methods, factory/init/ready errors, unhandled-rejection
channel, fallback cfg versus desired intent, owned resize debounce/RAF/visit teardown
and inert import/construction. Fail-first held Play reproduced the old race before
adding readiness gating; init-created rejecting readiness is an explicit safety delta.

Independent full CURRENT DIRTY entry saved before extraction SHA-256
`5519959a43138b8dc47d59bcde9ba95dceed38571e0e4bf9f9f17275628ec6a5`.
**17 renderer operation rows / 446,780 bytes** compare pending/current/stale handles,
full exercise/config/summary/status/loop/time and resource counters. Source matches
saved full bytes AND parsed output; Lab matches namespace-only transformation.
Prior **24 cfg / 83,739 bytes**, **3,044 selection / 9,850,708 bytes**, **10 event /
76,298 bytes** remain exact. New **791** untouched statements pin saved source order;
older immutable 805/794 pins retain provenance, now explicitly exclude audited
renderer writers. Historical music, 31 MB renderer and public40/debug91 fixtures
are unchanged. No mutation testing added.

Six bounded properties / **600 generated cases** pass seeds **20261021 / 271828**;
new property uses actual native owner, valid visible modes, bounded manual promises,
reverse completion, last action intent and exact-once resource assertions, not a
copied implementation. c8 **80 files**, lines/statements **14,201/29,072 (48.84%)**,
branches **4,720/5,601 (84.27%)**, functions **541/565 (95.75%)**. New native owner
**253/256 lines (98.82%)**, **130/151 branches (86.09%)**, **28/28 functions**.
Entry is still zero-measured **14,530 lines** through data URLs; better native
attribution is not browser certification. Uncovered native branches remain visible.

Strict core/content/shell/renderer types, lint **16** unchanged warnings, core lint,
Knip full1/prod2 intentional findings, syntax/DAG/links/brand/whitespace pass.
Isolated 0.2.14-lab.1 legal/folder/ZIP checks pass; no existing publication/dist/
host/sibling edits or stage/commit/push/install. Browser MIME/cache/fonts/reentry,
active host sound/detection, Windows DI and parent ownership review remain owed.
Published/installed **0.2.13-lab.1** USERREPORTED Oct-21 smoke PASS is separate;
exact host/detector versions unknown, local 0.2.14 user-unverified.

Joint practice selection/load (2026-10-21): independently reran baseline
**337/337**, extraction checkpoint **347/347**, final **348/348**, zero skips,
including final `npm run test:coverage`. Eleven new tests cover real source/Lab
listener cycles, canceled page lifecycle, pending Warmup intent, all seven setups
×24 authored choices, mutable applicability, shape/scale controls, variant reset/
Next wrap, mismatch/recovery, failed replacement clearing, request/visit/DOM stale
completion and ready rejection. Five bounded properties total **500 generated
cases** at seeds 20261021 and 271828; the selection property uses real PATHWAYS
sequences and checks last intent/tier reset/metadata invariants, not copied code.

Independent complete CURRENT DIRTY entry saved before edits: SHA-256
`6f34d7ee04377c9ecc56b2ed5ca285b1154c301deb741d63fd1c6320bf83c600`;
24 cfg rows/83,739 bytes, 3,044 selection rows/9,850,708 bytes and 10 actual event
rows/76,298 bytes compare full bytes AND parsed data in approved temp, with small
permanent provenance hashes. Historical generation/renderer fixtures unchanged.
805 untouched statements (794 older normalized-order subset) derive from saved
before source; public/debug exposed expressions remain identical. Navigation test
now returns through the real host event rather than invoking abandoned listeners.
No test claims inactive controllers may reclaim the visit.

Final Node26 c8 scope **79 files**: lines/statements **13,946/28,941 (48.18%)**,
branches **4,585/5,446 (84.19%)**, functions **513/537 (95.53%)**.
Native selection core **44/44 lines, 28/29 branches**; controller **367/375 lines
(97.86%), 227/291 branches (78%), 48/54 functions**. Missing branch/function
coverage remains visible, not hidden behind a threshold. Entry stays zero-measured
**14,657 lines** through the data-URL harness; aggregate function/branch statistics
are NOT authentic entry coverage. Native-only lines **13,946/14,284 (97.63%)**
are not whole-plugin/browser acceptance. Coverage is ignored, never staged.

Strict core/content/controller/loader/catalog/renderer checkJs, syntax all 78
native modules + entry, lint **17→16** warnings (dead no-op removal; no new
diagnostics), links, mirrored guidance, tracked+untracked brand scan and whitespace
pass. Knip full1/prod2 intentional findings unchanged; no automatic fixes.
Isolated **0.2.14-lab.1** source/legal/native DAG/folder/ZIP gates pass (**560**
runtime inventory files; entry DAG76/all-source79); temporary build deleted.
No existing dist/publication/host/sibling edits, stage/commit/push/install.
Same read-only Oct-20 `eef58c88…` HOST CHECK, no new capability. Local 0.2.14
remains user-unverified; parent ownership review and real browser/host/Windows DI
are outstanding. Published/installed 0.2.13-lab.1 user smoke remains separate.

Coverage/properties (2026-10-21): independently reran **333 baseline tests**, then
**337/337 passing**, zero skips, with four fast-check properties (**400 generated
cases**, not 400 additional Node tests). Both seeds 20261021 and 271828 pass.
Developer-only c8 reports native first-party core/content/shell plus zero-measured
`screen.js`; child native imports are merged, transformed data-URL entry and
external source/Lab copies are not falsely attributed. Initial Node 26.12.0 report:
**77 files, 13,508/29,034 lines/statements (46.52%)**, **4,325/5,121 branches
(84.45%)**, **461/478 functions (96.44%)**. The zero-measured entry contributes
15,196 lines but only synthetic one-function/branch placeholders: aggregate
function/branch percentages are not full entry coverage. Native-only lines are
13,508/13,838 (97.61%), not whole-plugin coverage; JSDoc-only files are included.
Next evidence priorities: authentic entry coverage attribution and tapping paths,
then branch gaps (Workout editor/arpeggio), plus separate live-host/Windows DI.
No threshold; CI reports are advisory visibility while test failures still gate.
See [commands, scope and reproducible shrinking](development.md#coverage-reporting-and-bounded-properties).

Practice presentation (2026-10-21): **326→333 passing source tests**, zero skips.
Before editing, the complete CURRENT DIRTY entry independently captured **3,044
rows / 9,850,708 bytes** across all 151 static pathways, all 24 hydrated Warmup
selection/tier combinations, 40 Custom configs and PB/supports/plain-text cases.
 Ten real-entry event rows (**76,298 bytes**) were captured from that saved source:
selection before readiness, rung click, Custom load/select/Next, failed load clearing
the file (existing behavior), canceled unload, navigation/return. Full byte + parsed equality passed
in approved temp; source and isolated Lab pin hashes, historical fixtures unchanged.
Direct owner tests cover live registry replacement/hydration, selected authored
hint/title, lesson/bass cue priority, disclosure/PB/transport, negative variation
wrap, file controls/prose clearing, inert import/construction and missing panels.
The 843-statement untouched-order pin derives from saved before source, normalizing
only delegated display calls; public40/debug91 remain. Lint 17, strict shell/core/
content/renderer types, Knip full1/prod2 intentional findings. No live-host/browser/
audio/Windows DI acceptance claimed; installed 0.2.13 smoke is not local 0.2.14 QA.

Configuration/preset/cue ownership (2026-10-21): baseline **315**, checkpoints
**319 / 323 / 325 / 326 passing source tests**, zero skips. Owning tuning/settings suite
adds direct cfg/control/default/priority/coercion/NaN/null/family/count rows,
ordered application and inherited-versus-own overlays, real source/Lab preset
select/preview and canceled-unload/SPA reentry, direct latest-request/abandoned
visit and inert imports. Complete independently saved CURRENT DIRTY entries
pin **24 config rows / 83,739 bytes**, **6 preset rows / 13,864 bytes** and
**3,776 cue rows / 593,644 bytes** before each move. Full approved-temp captures
match bytes after changes; small hash/provenance fixture only. Historical fixtures
remain untouched; unmoved statement guard derives from saved before source,
normalizing only explicit delegated calls/badge. Strict core/content/shell/renderer
checkJs, lint **17**, Knip full1/prod2 intentional findings. No new feature/API;
old abandoned preset GET write was separately reproduced and guarded. Native/Lab
module/legal/ZIP gates are source evidence, not live-host or Windows DI acceptance.
USERREPORTED installed 0.2.13 smoke remains separate from untested local 0.2.14.

Unpublished 0.2.14 pure-core cleanup adds seven direct semantic rows in
`core-assembly.mjs`: guitar/bass rung and session timing math, unknown-mode
arpeggio fallback, template IDs, shared/cloned nested aliases, whole-cell epsilon
and empty arrays, pitched-before-drums output, odd-meter breath endpoint tolerance
and live subdivision reads, whole-cycle note/annotation and distinct turn/RNG
contracts, plus native import/execution IO traps. Original pre-edit complete
foundation/session/backing/cluster captures compare exact bytes in approved temp,
not recaptured fixtures. Manifest/header equality is separately asserted before
normalizing only the version statement to the historical entry-order pin.
Published 0.2.13-lab.1 Windows smoke remains the test target, not this candidate;
no live browser/audio/detection/BFCache/DI certification follows from source tests.
Full source suite: **309/309, zero skips**; all permanent historical fixtures
unchanged. Lint retains 18 warnings, Knip full1/prod2 intentional findings.

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

Tuning ownership (2026-10-21): **309→315 source tests**, zero skips. Fixture
`tuning-settings-before-extraction.json` pins actual dirty unpublished 0.2.14
entry SHA, 24 real-event config/control/bundle rows (83,739 UTF-8 bytes), and
unmoved statement hash. Complete entry/output was independently saved in approved
temp before editing; full bytes/deep equality pass after cleanup and hardening.
Durable source/Lab tests compare the same real events (Lab namespace only).
All seven setups/four modes, Drop D/DADGAD/standard/custom/saved, invalid/blur,
save/refetch, file mismatch/recovery, tempo and unload are covered. Direct real
controller tests cover live host groups/duplicate priority, late family change,
failed/rejected/canceled save/load, stale dynamic/visit callbacks and inert import.
Real source/Lab screen events cover SPA reentry and canceled unload, no Escape.
Existing full Markdown tiers/variants/readiness/navigation and historical
generation/API fixtures remain unchanged; no copied original-function subjects.

USERREPORTED smoke PASS: user answered “all works” on 2026-10-21 for installed
0.2.13-lab.1 to Windows Play/audio/detection, views/Tab/Notation minor flats,
Markdown variants, Ladder tuning and Workout navigation checklist. Host/detector
versions unknown; not independent/exhaustive or Windows DI certification.
Local 0.2.14 has not been tested by the user.

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
