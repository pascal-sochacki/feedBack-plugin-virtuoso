# Native modules — dependency map and staged extraction

QA2 follow-up: request-owned Play readiness reporting and immediate borrowed
ready observation precede validation/getters. **373 tests**, zero skips; entry
**14,541**, owner **264**, native DAG77/all-source80, Lab561; same reserved local
0.2.14 and published13 identity. No runtime dependencies or broad error swallowing.

Renderer lifecycle boundary (2026-10-21, unpublished 0.2.14):
`shell/renderer-lifecycle.js` → existing renderer selection → host factories/local
Classic; no core→shell or reverse entry import. Strict DOM checkJs covers the whole
controller and optional borrowed renderer capabilities. Active candidate, canvas,
ready and resize resources plus shared operation identity have one owner; entry
retains full chart/player clock/audio/credit/progress/L1 and synchronous APIs.
Call-time factory/preference/host reads remain; no runtime dependencies or bundling.
Entry **14,530**, controller **256**, combined **+129** from 14,657; bindings
**124→124** (real selection dependency replaced, not hidden). Entry DAG **77**,
all-source **80**, isolated Lab **561** runtime inventory files. Full tests **369**,
zero skips; local 0.2.14 still not browser/host/user certified. Historical counts
below refer to earlier checkpoints.

Latest presentation boundary (2026-10-21, unpublished 0.2.14): typed
Current selection/load boundary (2026-10-21): native
`shell/practice-selection.js` → pure `core/practice-selection.js`, existing
config/presentation/catalog/file loader and live PATHWAYS. Mode/rung/variation/
tier/file intent, eligibility and listener visits are owned together; entry retains
L1 adaptation and contained generation/attachment/ready/clock/voice/credit. Entire
new owner plus loader/catalog strict DOM checkJs; no callback bag/state facade,
import-time IO or async API publication. Five semantic entry hooks and one existing
presentation dependency. Entry **14,657**, imports **124**, native entry DAG **76**,
all-source **79**, isolated Lab **560 runtime inventory files**. Historical counts
below describe previous checkpoints, not the current tree.

`shell/practice-presentation.js` owns goal/selection/START/content/file display.
Nine explicit lower-core/passive-content imports, one view-scoped plain read-state
hook, no entry import, reexport barrel, listener or cached registry copy. Actual
entry display callers now use owner methods; config-changing rung/variant/Next,
mode/eligibility/progress and transport remain cohesive entry owners. Authored
goal/title/hint/prose uses textContent, including late hydrated catalog metadata.
Entry 15,443→15,196, owner222, previous prose owner60→55; combined−30, bindings
128→127. Native entry DAG74/all-source76, isolated Lab558 files; **333 tests**, zero
skips, strict core/content/shell/renderer types, lint17, intentional Knip full1/prod2.
Direct display semantics remain covered; saved display/event comparisons are removed.
Local0.2.14 remains untested by the user; installed/published0.2.13 target unchanged.

Configuration/preset/cue boundary (2026-10-21, unpublished 0.2.14):
`shell/practice-config.js` is now the sole DOM→cfg funnel plus ordered silent
application; `core/practice-form-defaults.js` owns plain anti-leak prewrites.
`shell/practice-presets.js` owns existing meta-DB recall/cache/listeners, with
latest-request/visit/DOM guards. Passive `content/form-cues.js` shares mutable
catalog vocabulary; `core/practice-form-cue.js` consumes explicit cfg/tier/band.
Entry retains L1/host shared writes, eligibility, full goal-card/controller,
catalog cancellation, audio warming and contained transport. **326 tests**, zero
skips; strict new modules, lint17, Knip full1/prod2 intentional findings. Physical
entry 15,881→15,443; owners346, combined−92; bindings123→128 (honest API refs).
Native entry DAG73, source/Lab parity and isolated0.2.14-lab.1 folder/ZIP/legal
checks pass. Direct cue/config semantics replace saved event/cue comparisons; no
live-host certification is implied.

**WIP / NOT RELEASE-READY (2026-10-20).** This branch opts into native modules.
USERREPORTED smoke PASS (2026-10-21): “all works” for installed 0.2.13-lab.1
Windows Play/audio/detection, views/Tab/Notation minor flats, Markdown variants,
Ladder tuning and Workout navigation. Exact host/detector versions unknown;
not independent/exhaustive, Windows DI certification or a supported-host floor.
Local 0.2.14 has not been user-tested. Do not
merge to upstream's published default branch or distribute this as a stable update yet.
User authorization separately permits experimental isolated Lab runtime publication
to the personal fork's `main` for Git Plugin Manager installation. This is not
host certification or upstream/stable promotion; full source stays committed locally.

## Current module map and regression policy

The generation core is import-time pure and consumes plain configuration. `readConfig`
is the DOM-to-config funnel and `makeBundle` is the first shell step. Native entry
imports are relative, acyclic, and preserve synchronous public/debug publication.
The current source suite enforces semantic behavior, host-free imports, graph
boundaries, lifecycle ownership and Lab packaging directly.

Historical extraction snapshots, saved before/after captures, fixture corpora and
golden-output/hash comparisons have been removed. No capture or regeneration command
remains. See [testing](testing.md) for current checks and [architecture](architecture.md)
for ownership boundaries. None of the source checks certify live-host MIME/cache,
browser audio, navigation, or installed Windows DI behavior.

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

### Regression test policy

Historical snapshot fixtures and golden-output comparisons are removed. Use direct semantic, property, import-safety, lifecycle, and packaging tests; no fixture recapture command exists.
