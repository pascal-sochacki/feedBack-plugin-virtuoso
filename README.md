# Virtuoso

A FeedBack plugin for guitar and bass practice: learn scales, arpeggios, chord
changes, rhythm and technique, then apply them over a procedural backing band.
Practice stays inside one contained player; Virtuoso is not a standalone app.

![Virtuoso's practice shell and 3D Highway](docs/images/highway.png)

## Development source vs installation

**This checkout is development source**, branch `dev/modular-source`, plugin ID
`virtuoso`, version **0.2.9** (unpublished candidate). Native-module extraction is in progress. FeedBack
must support `scriptType: "module"` and serve `src/**` with JavaScript MIME.
There is no runtime build or npm installation step.

The personal fork's **`main` is a different, generated installable runtime**:
**Virtuoso (Lab)**, ID `virtuoso_lab`; published **0.2.8-lab.1**, candidate
**0.2.9-lab.1** is authorized for publication after review fixes (2026-10-20). It is experimental, not
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
node --test tests/*.mjs
node --input-type=module --check < screen.js
node scripts/check-doc-links.mjs
```

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
still work. Generation/core behavior and version 0.2.9 are unchanged. Publication
is authorized to the personal fork's `main` only, with matching public source;
these changes are not legal or installed-host certification.
