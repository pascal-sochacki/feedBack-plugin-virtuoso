# Virtuoso

A FeedBack plugin for guitar and bass practice: learn scales, arpeggios, chord
changes, rhythm and technique, then apply them over a procedural backing band.
Practice stays inside one contained player; Virtuoso is not a standalone app.

![Virtuoso's practice shell and 3D Highway](docs/images/highway.png)

## Development source vs installation

**This checkout is development source**, branch `dev/modular-source`, plugin ID
`virtuoso`, version **0.2.13** (reviewed experimental candidate; source stays local).
Only Ladder **Chromatic Warmup** (`chromatic_warmup`) now reads authored Markdown:
six variations, four tempo tiers, twelve fixed charts; existing progress IDs stay.
This rung intentionally requires standard six-string guitar and blocks alternate
tunings without retuning Setup. The separate Custom demo below remains unchanged.
Normal modes bind while the catalog loads; file requests have bounded deadlines.
Renderer preferences/fallbacks survive rebuilds. Warmup progress credits the
rendered run's selected density, not a stale picker or BPM-only inference.
[Custom → File practices](docs/plugin/practice-files.md) previews one authoritative
Markdown/JSON chromatic lesson with two named fixed variants through the existing
player. Variant selection/Next stops and reloads at zero, preserves tempo and
count-in, and never autoplays. Format version 2 requires variants; the old root
notes/duration form is intentionally rejected. Pure pitch, scale,
exercise/session generation, content and renderers are native modules; the entry
still owns boot, host integration and the contained player. FeedBack
must support `scriptType: "module"` and serve `src/**` with JavaScript MIME.
There is no runtime build or npm installation step.

Local Tab/Notation now include an implementation-quality pass: corrected minor/
modal signature and staff spelling, clipped-beam singleton stems/flags, shared
hand-mark thinning and resize-on-size/DPR-change canvases. This intentionally
goes beyond the earlier move-only extraction; source tests pass, but browser
fonts/DPR, live-host rendering/audio and Windows DI acceptance remain owed.
The reserved **0.2.13** version covers this experimental testing candidate.

The personal fork's **`main` is a different, generated installable runtime**:
**Virtuoso (Lab)**, ID `virtuoso_lab`; authorized candidate **0.2.13-lab.1**
(2026-10-21), prepared to replace published 0.2.11-lab.1. Confirm the installed manifest.
It is experimental, not
an upstream stable update, and does not include the separate Learn-mode work.
Use this URL in FeedBack's Git Plugin Manager (no branch selector required):

**https://github.com/pascal-sochacki/feedBack-plugin-virtuoso.git**

Keep original Virtuoso disabled and fully restart before testing Lab. Separate
IDs/stores do not make simultaneous playback safe: both use host singletons.
See the [Lab installation and rollback guide](docs/plugin/virtuoso-lab.md).

For original/stable Virtuoso, use the host's bundled plugin or the
[upstream project](https://github.com/got-feedBack/feedBack-plugin-virtuoso).
Do not mistake this local source branch for that published channel.

Manual installations go in the host's **configured writable plugin directory**,
not Program Files. Current Windows desktops normally use
`%APPDATA%\feedback-desktop\plugins\`; older directories may not be active.
Copy the complete runtime including `src/`, `assets/` and `static/`, then restart.
Back up settings before experimental testing or config resets.

## Practice overview

- **Ladder:** curated skill pathways and opt-in concept, genre and bass packs.
- **Custom:** choose key, scale, shape, tuning, meter, progression and tempo.
- **Workout:** editable multi-block routines with pacing, saved workouts and recap.
- **Jam:** apply vocabulary over a looping band with chord/guide-tone hints;
  descriptive feedback, not a score-to-beat.
- **One chart, four views:** borrowed 3D Highway, 2D Highway, Tab and Notation.
- **Practice controls:** count-in, A/B loops, mixer, instrument/amp choices,
  extended-range/custom tunings, presets and optional competency progress.
- **Host judging:** detection and verdicts come from note_detect, not a second
  local grader. Availability depends on the installed host and detector.

![Workout](docs/images/workout.png)
![Jam](docs/images/jam.png)

Screenshots show the established upstream interface; they are not evidence that
every renderer/audio/detection path is certified on this module branch. The user
reports preliminary Windows Lab operation; full runtime acceptance is still owed.
Piano generation and structured multi-week Programs remain future work.

## Develop and read

```sh
npm ci --ignore-scripts
npm run lint
npm run typecheck
npm test
node --input-type=module --check < screen.js
npm run check:docs
npm run check:brand
```

These npm dependencies are **private developer tooling only**, not a plugin
installation or runtime build. Use Node 24 LTS (supported engine ranges are in
`package.json`). First-party ESLint rules reject unused imports and correctness
regressions; a small explicit legacy-debt baseline prevents new warnings while
preserving unreviewed initializers. See [lint policy](docs/plugin/development.md#developer-tooling-and-lint).

Start at [docs/index.md](docs/index.md):
[plugin development](docs/plugin/development.md),
[testing](docs/plugin/testing.md), [musical references](docs/theory/index.md),
and [historical decisions](docs/archive/index.md).
[ROADMAP.md](ROADMAP.md) tracks current work and unresolved verification, not old
handoffs. Historical upstream feature announcements are retained in the
[archive](docs/archive/upstream-feature-history.md); their old version labels
must not be interpreted as this source/Lab release sequence.

## License

Copyright (C) 2026 Christian Cowan.
Copyright (C) 2026 Pascal Sochacki (fork modifications, 2026-10-20).

Virtuoso is [AGPL-3.0-only](LICENSE). Retain source attribution and the separate
font/audio licenses under `assets/` and `static/` when redistributing or modifying.
Supplied WITHOUT ANY WARRANTY. See [third-party notices](THIRD_PARTY_NOTICES.md)
and [matching source / review limits](SOURCE.md). On 2026-10-20, the 61
8ridgelite-derived samples and Deer Ink Studios V30 capture were removed rather
than claiming unverified recording permission. Electric DI 8 is no longer an
option; saved `8ridge` mixer choices fall back to Shinyguitar/Electric DI. Metal
retains its amp settings and uses the existing procedural cab; user IR uploads
still work. Historical generation fixtures remain pinned; source 0.2.13 combines
modular foundations, authored variants/Ladder content and reviewed renderer fixes.
The 0.2.13-lab.1 candidate is authorized to the personal fork's `main` only,
with matching public runtime source;
these changes are not legal or installed-host certification.
