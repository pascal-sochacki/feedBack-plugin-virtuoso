# Native modules — dependency map and staged extraction

**WIP / NOT RELEASE-READY (2026-10-19).** This branch opts into native modules,
but no running supported host or installed desktop has been certified. Do not
merge to upstream's published default branch or distribute this as a stable update yet.
User authorization separately permits experimental isolated Lab runtime publication
to the personal fork's `main` for Git Plugin Manager installation. This is not
host certification or upstream/stable promotion; full source stays committed locally.

## Baseline and scope

### Separately installable Lab (2026-10-19)

`node scripts/cut-lab.mjs` generates the **current working tree**, including the
pitch extraction, into sibling `virtuoso-lab-dist/virtuoso_lab/` and
`virtuoso-lab-dist/virtuoso_lab.zip`. Manifest ID/screen `virtuoso_lab`, label
`Virtuoso (Lab)`, version/header `0.2.7-lab.1`. Source retains upstream identity;
no fork-wide source rewrite, migration, original-install or user settings changes.
The generator itself does not commit or push; separately authorized publication
places generated runtime at the personal fork's repository root. `src/` and its
nested ESM package are included. See `docs/virtuoso-lab.md` for Git Plugin Manager
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
- Slice version: v0.2.7 in both `plugin.json` and `VIRTUOSO_VERSION`.
  This is a branch-local reservation, not a release. If Learn or another branch
  lands first, integrate on a fresh branch, reconcile the shared root-entry
  edits, and choose a new version from the then-current trunk. Do not overwrite
  Learn's v0.3.0 or merge its uncommitted changes as part of extraction.
- Only `NOTE_NAMES`, `NOTE_ALIASES`, `pcName`, and `midiToFreq` move to
  `src/core/pitch.js`. No generator, renderer, audio, state, or lifecycle redesign.
- Root `screen.js` statically imports that dependency, then executes the original
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
| Theory tables, §1 (next) | `SCALE_INTERVALS` 172–200 → scale pitch classes, shape resolver, chord-scale/harmony. `CHORD_FORMULAS` 210–231 → template-quality gate, chord-depth engine, voicing/arpeggios/backing. | Separate scale and chord-data moves are possible; retain intervals above octave (14/17/21). Do not move `STRING_COLORS`, scheduler or detector constants into theory. |
| Instrument/tuning data and pure helpers | `STRING_SETUPS`, `TUNING_PRESETS`, `TUNING_TO_SETUP` 84–170 → open-MIDI config, shapes, sessions AND DOM setup/tuning sync. | Split data from storage/UI; preserve low-string-first indexes, offset intent tags, per-config overrides and bass/guitar distinctions. |
| Shape layer, §4 / interleaved helpers | Unified `CAGED_SHAPES` 2780+; `resolveCAGEDShape` 3003; 3NPS/Open resolvers → scale/arpeggio builders and form position UI. Depends on theory + tuning/pitch helpers. | Keep unified shape table; move pure resolver cluster only after its transitive helpers. Keep no-unison startup asserts at their original point until explicitly initialized by boot. DOM selector helpers in the span are NOT core. |
| Timing / seed / chart utility leaves | `parseMeter` 4361; `secondsPerDivision`, `rhythmSteps`, `measureSeconds` 6478–6507; RNG helpers near 6610; beats/anchors/fill helpers → exercise/session builders, backing and shell clock. | Next small helper slices, not one general-purpose util dump. `chartBeatSeconds` consumes bundle metadata; keep renderer/display helpers out of core timing. |
| Harmony / voicing / backing | §5 6908+, `voiceChord` 7199, `compileChordTimeline` 7469, `buildBackingEvents` 8355; palettes 4800+, comp/bass/drum recipes. | Shared harmonic timeline must remain the source of truth; preserve cfg+seed determinism. Palette validation references scale/progression/audio registries: definitions can move before guard calls, but do not move guards ahead of initialization. Audio profile selection mixes shell and core-facing data. |
| Exercise + session orchestration | §7 9171+, `generateExercise` 12012 → single/key-cycle/jam chart + timing/timeline; `buildSessionChart` 12469 and `generateSession` 12612 → segment defaults/materialization, builders, per-block backing/tempo. | Extract individual builders after dependencies. Preserve plain `{version:1,session,chart}` contracts; entry version badge is unrelated to chart schema version. Avoid cycles between `buildSegmentConfig`, dispatch and content registries. |
| Content / curriculum | §2 PATHWAYS; §3 BUILT_IN_SESSIONS; `STYLE_PALETTES`; `rollSegment` 5524, `refreshWorkout` 5561, `materializeSegment` 5583 → session builders and shell lists/workout draft. | Data registries are not UI controllers. Preserve shared references / IDs and clone-before-edit workout behavior. Cross-registry validators are boot orchestration, not implicit module IO. |
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

1. **This slice**: static entry + pitch leaf + real-import tests + selective
   JSDoc. No side effects in the leaf, no extra exported globals.
2. **Independent leaf moves**: scale intervals, chord formulas, then meter/beat
   helpers and seeded random utilities in separate move-only slices. Carry
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
No `import-x` dependency introduced for this one-edge DAG; cycle enforcement can
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
npm exec --yes --package=typescript@5.9.3 -- tsc -p tsconfig.core.json
node scripts/check-brand-hygiene.mjs
git diff --check
```

TypeScript is **developer-only noEmit checking of JSDoc in plain JS**, never
served/transpiled TypeScript. The narrow config excludes the monolith, tests,
browser globals and sampler blobs; it needs no Node typings. The pinned ephemeral
checker avoids dependency/lockfile churn; a maintainer can instead use an already
installed compatible `tsc`. No test subject uses source text slicing.

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
