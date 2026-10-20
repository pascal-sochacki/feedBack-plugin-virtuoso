# Testing — the smoke-suite catalogue

> Authoritative testing reference. Read before adding or changing a suite. Historical green counts are not current host certification.

Source-only tests: `node --test tests/*.mjs`. Before documentation cleanup there were **18 tests across four suites**: pitch, scale intervals, core characterization and Lab packaging. Documentation checks now join that discovery; use runner output, not a fixed prose count. Narrow checkJs is developer-only `noEmit`; see [native modules](native-modules.md). Backend tests: `pytest` with the required dependencies. Node tests do not certify host loading, DOM, renderer, audio, navigation or Windows DI.

## Running them

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
