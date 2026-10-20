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
