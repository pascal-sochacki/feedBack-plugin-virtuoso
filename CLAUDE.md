# Repository guidance

`AGENTS.md` and `CLAUDE.md` must be identical. Keep always-loaded guidance short;
put procedures and rationale in [development](docs/plugin/development.md).

## Orientation

- Read [ROADMAP.md](ROADMAP.md) at session start and [docs/index.md](docs/index.md)
  for the reference map. Verify historical names/APIs against current source.
- Virtuoso teaches transferable guitar/bass skills, not songs: teach the grammar,
  name the device, preserve playability. Guided → Custom → Jam is the creative
  on-ramp. Gamification describes competency, never gates content or substitutes
  rank/time/rounds for mastery.
- This checkout is development source on `dev/modular-source`: ID `virtuoso`,
  version **0.2.13** (reviewed experimental publication candidate, source local;
  preserves the prior 0.2.10 WIP). See [practice files](docs/plugin/practice-files.md).
  The personal fork's `main` is a generated experimental
  runtime: ID `virtuoso_lab`, published experimental **0.2.13-lab.1** replacing
  published 0.2.11-lab.1 (2026-10-21); verify the installed manifest. Neither is a stable-release
  certification. Do not confuse source `main`, upstream `main`, and fork `main`.
- FeedBack serves plain native JS (`scriptType: "module"`). No runtime build,
  bundler, custom loader, injection, fire-and-forget boot import or transpilation.
  `src/package.json` selects ESM for Node; checkJs is developer-only `noEmit`.

## Hard invariants

- **One contained player.** Virtuoso owns transport/clock/audio/render lifecycle.
  Never reintroduce `window.playSong` handoff or a second player/WebSocket/canvas.
  `/temp-sloppak` is dormant backend machinery, not a frontend launch task.
- **Escape belongs to FeedBack.** Never capture/override it or restore the old
  sessionStorage return-marker flow. Temp charts stay outside the library index
  under `.virtuoso-temp/`.
- **Consume the host judge, no parallel grader or detector DSP.** Credit
  note_detect verdicts 1:1 (`detected`, `detectedSongTime`, `centsError`), including
  late verdicts. No local timing window, silence/level gate, calibration or level
  meter may re-judge credit. Pedagogy/XP and display-only hit paint read verdicts;
  borrowed highway scoring visuals remain host-owned.
- **Do not monkey-patch public host APIs** (`playSong`, `showScreen`,
  `createHighway`, capability bus). Use `hostBus`, `hostMinigames`, `hostDesktop`,
  `vizFactoryFor`: new `feedBack*` names first, supported legacy fallback only.
  Keep host-owned `slopsmith_notedetect` and shared card-save keys unchanged.
- **No broad AudioContext clobber.** Existing borrowed-highway click suppression
  must be active-screen scoped; background callers get a real context with
  `decodeAudioData`. Never degrade other plugins or shared browser globals.
- **Generation core stays pure.** `generateExercise`/`generateSession` and their
  dependencies consume plain cfg and return `{ version, session, chart }`.
  No `window`, `document`, storage, fetch or host globals. `readConfig` is the
  DOM→cfg funnel; `makeBundle` is the first shell step. Extract bottom-up into
  import-time-pure, acyclic leaves; no giant shared state module or speculative
  standalone adapters. Preserve synchronous public/debug publication and boot
  side-effect order. Data tables/arrays remain ordinary mutable objects.
- **Lowest string is `s=0`**, including `openMidis`. Degree-driven scale/mode/
  arpeggio shapes must never duplicate the same MIDI pitch across strings.
  Preserve no-unison and shape/fingering startup guards; no fret-window shortcut.
- Backend routes stay under `/api/plugins/virtuoso/…`. Presets/tunings use the
  host meta-DB; manifest JSON server files are export snapshots, not live storage.
- Match host UI first, then standard DAW/notation convention. Design against the
  whole pane, not an isolated replacement. Read [design-system](docs/plugin/design-system.md).
  Host prebuilt Tailwind supports common core utilities only: no arbitrary-value
  classes or CDN/JIT. Additional CSS requires the host `styles` capability,
  utilities-only/preflight-disabled `assets/plugin.css`, and a release bump.
- Keep **AGPL-3.0-only**, all source citations, copyright and asset licenses.
  Commit only reviewed compatible assets; unlicensed IR/NAM captures stay ignored.
  Run brand hygiene; competitor names belong only in ignored local research,
  except genuine source citations marked `brand-ok`.

## Workflow and gates

- Read [code-map](docs/plugin/code-map.md) before entry/routes changes,
  [architecture](docs/plugin/architecture.md) before integration changes, and
  [testing](docs/plugin/testing.md) before changing suites.
- New shell capabilities require an evidence-dated **HOST CHECK** before design:
  capability · host API/file · evidence/date · BORROW/MIRROR/BUILD · flip condition.
  Quote it at delivery. Recheck host overlap on new host releases. Detector/tuner/
  timing/level changes require review against note_detect **and the running host**.
- Cover guitar **and** bass playability, relevant genre idiom, harmony, rhythm,
  learning, UX, audio safety and operability as applicable. Specialist agents and
  memories are not present in this checkout; never claim unavailable reviews ran.
  Use the [review procedure](docs/plugin/development.md) and record outstanding review.
- Source checks from repository root:
  ```sh
  npm ci --ignore-scripts
  npm run lint
  npm run typecheck
  node --test tests/*.mjs
  node --input-type=module --check < screen.js
  node --check src/core/pitch.js
  node --check src/core/scale-intervals.js
  node --check src/core/chord-theory.js
  node --check src/core/timing.js
  node scripts/check-doc-links.mjs
  node scripts/check-brand-hygiene.mjs
  git diff --check
  ```
- Narrow typecheck: TypeScript `tsc --project tsconfig.core.json` (noEmit; see
  [native-modules](docs/plugin/native-modules.md)). Backend tests: `pytest` with
  required Python dependencies. Host smoke: `npm test` in
  `.claude/skills/run-virtuoso/` against a running host; dynamic suite discovery
  is authoritative, not the incomplete `test:seq` fallback.
- Source checks are **not** browser/desktop/DI certification. Runtime changes
  require live module MIME/cache/re-entry, navigation, all renderers, transport,
  audio and verifier checks. Windows DI must run on the installed desktop.
- Reload for JS/HTML; restart for routes and installation/enable changes.
  Read [local-dogfood](docs/plugin/local-dogfood.md) before launching: scripts can
  change links, stop apps and update host checkouts. Confirm target and consent.
- Keep source, dirty sibling worktrees and publication artifacts separate.
  Upstream/default-branch HEAD may be installed by users; WIP stays on branches.
  Bump `plugin.json` and `VIRTUOSO_VERSION` together for shippable runtime changes.
  Documentation/comment-only path edits do not require a runtime version bump.
- Update concise ROADMAP status/limits, mirror guidance, report tests actually run.
  **Commit/push only when asked** (Conventional Commits). Lab generation itself
  never commits, pushes, installs or migrates; beta cuts can commit/push, so do
  not invoke them as routine verification without authorization.
