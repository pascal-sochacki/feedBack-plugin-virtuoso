# Virtuoso — current work

Read this with [repository guidance](AGENTS.md) and [docs/index.md](docs/index.md).
Old upstream release stories, PR states and handoffs are preserved as
[nonactionable development history](docs/archive/development-history.md).

## Current source state

- Approved first [Markdown file practice](docs/plugin/practice-files.md) is a
  local combined **0.2.11** candidate on the existing extraction branch;
  prior 0.2.10 chord/timing work is preserved. Custom → File practices loads one
  standard-six-string chromatic lesson into the existing contained player.
  Explicit duration, exact JSON notes, tempo scaling, no backing/refingering;
  unsupported techniques/tuning fail. HOST CHECK: BORROW generic static assets
  (`feedBack` eef58c8, `plugins/__init__.py:2492–2520`, 2026-10-20) and current
  player/judge; BUILD strict parser/adapter, no Markdown API/editor/player.
  Flip if a documented reusable host parser/editor adapter appears.
  **2026-10-20: published reviewed 0.2.11-lab.1** to personal-fork `main` only,
  via authorized nonforce SSH, replacing `5ca4f45` with
  `ac8fc44e2a3c0388dc5c936427dc6c85d492b802`. Generated from local source
  `1a6a1ecfbeb913b72c46625045c02335b6a149e5`; SOURCE map records that revision.
  Dirty modules sibling, source `main` and upstream remain untouched.
  Host/UI/audio/DI acceptance is still owed; publication does not install.
  Review fixes: retain the authoritative file through incompatible Setup and
  auto-rebuild on compatible edits; generation/renderer ownership guards both
  resolver and ready awaits, stale cleanup and final UI/transport changes.
  Return recomputes current Advanced eligibility. Normal renderer attachment
  shares these race fixes; no scoring or version change.
  Follow-up fixes cover per-string tuning recovery and normal-type exit after
  mismatch. Jam/Workout honor canceled attachment and retain ownership through
  voice warming; Stop cancels pending starts, including ordinary Play.
  Verification: **72/72 follow-up baseline → 172/172 Node tests**, unchanged 71-case source/
  Lab corpus and 40/91 API keys; cached narrow checkJs, syntax, links, brand and
  whitespace pass. Lab folder/ZIP rebuilt. Prior browser npm test exits 2
  (no host :8765); no host start/install. Source and actual publication checks
  passed again: **172/172 each**, unchanged 71-case corpus, exact 488-file
  generated inventory, all 12 vendor files/full licenses and withdrawn assets absent.
  Remote SHA verified; 18 commit-pinned runtime/practice/source/legal resources
  return HTTP 200 and match local bytes, manifest **0.2.11-lab.1**. All three
  settings source/license/notice links return HTTP 200. No moving raw-main cache
  claim or installed-host/Windows acceptance is inferred.

- Local development branch: **`dev/modular-source`**, source ID **`virtuoso`**,
  manifest/header **0.2.11** (local combined candidate; extraction was 0.2.10), based on
  `0927091`. No stable promotion is implied.
- Native module entry retains the strict IIFE and synchronous API/debug/boot
  order. Pure mutable pitch, scale-interval, chord-theory and timing leaves are extracted into `src/`;
  no runtime build, loader or generation redesign.
- Established functionality: Ladder, Custom, Workout and Jam; one contained
  transport/audio lifecycle; four rendering choices; procedural backing;
  presets/tunings, progression and host-consumed note_detect verdicts.
- Generated personal-fork `main` is **Virtuoso (Lab)** / `virtuoso_lab` /
   published **0.2.11-lab.1**, not this complete development checkout or upstream `main`.
  Installation and isolation limits: [Lab guide](docs/plugin/virtuoso-lab.md).
  Candidate **0.2.9-lab.1** adds attribution/legal notices and preferred vendor
  source. **2026-10-20:** removed all 61 8ridgelite OGG recordings and the Deer Ink
  Studios V30 WAV; unverified scope/mapping is not claimed resolved by licensing.
  Stored DI pins migrate to Shinyguitar; Metal uses the existing procedural cab.
   **2026-10-20: review fixes were experimentally published** at `5ca4f45`.
   Reviewed **0.2.11-lab.1** combines the extraction and Markdown practice update;
   publication is complete at `ac8fc44`, with installed Windows acceptance outstanding.
  See [third-party notices](THIRD_PARTY_NOTICES.md) / [pinned evidence](SOURCE.md).
   Source commits stay local on `dev/modular-source`; source `main`, upstream
   and the dirty modules sibling remain untouched. Publication does not install.

## Verification and release gates

- Refactor 2026-10-20: **23/23 baseline → 33/33 source Node tests** passed;
  deterministic 71-case committed-baseline corpus, module/namespace/ZIP checks,
  fatal startup-assert and raw note-time mutation controls. See
  [testing authority](docs/plugin/testing.md); discover tests dynamically.
- The Windows user's installed Lab “seems to work” is **preliminary user-reported
  functional smoke**, not all-render/audio/detection regression acceptance.
- Still owed: installed-host module MIME/loading/cache/re-entry, navigation,
  renderers, loop/transport, audio/output and verifier acceptance; Windows
  audio-interface/DI checks on the actual installed desktop; a verified released
  host support floor. Source inspection and mocked scoring cannot certify these.
- Browser suites require a running host and Playwright; Python route-runtime
  tests require their dependencies. Report unavailable checks, never infer green.
- No merge/upstream stable promotion until running-host gates pass. Keep manifest
  and header versions equal for any subsequent shippable runtime change.

## Next work

1. User updates Lab and confirms installed **0.2.11-lab.1**. Test Custom → File
   practices → Chromatic warm-up on standard six-string guitar: low E frets 1–4,
   tempos 30/60/120, Play/Pause/Stop/count-in/loop, incompatible tuning recovery,
   Return/normal type/Jam/Workout/view/navigation transitions and host judging.
   See the standalone [Lab guide](docs/plugin/virtuoso-lab.md). Windows DI remains owed.
2. Complete installed Lab runtime acceptance and record host/detector versions
   and evidence before selecting a supported release floor.
3. Continue move-only core extraction: seeded random utilities or tuning data;
   broader shapes later; globals/main last. Chord/diatonic and meter/rhythm leaves
   are extracted, with startup guards still in entry. Preserve ordinary mutability,
   core purity, no-unison, dependency direction and baseline behavior.
4. Reconcile integration with current upstream and the separate Learn work only
   with authorization; do not touch dirty sibling branches as part of docs work.

## Retained design backlog (not automatic build authorization)

Unfinished and mixed-status specs remain in [plugin/design](docs/plugin/design/index.md):
Programs, Ear mode, role-aware tracks, genre/vocabulary/realism improvements,
theme framework and mixed shipped/deferred Jam, rhythm, triad and bass work.
Read each status and verify current source before acting. Do not reinstate the
obsolete local judging or main-player/Escape launch proposals in the archive.
Gold improv conformity/gained-only passport plumbing exists, but `GOLD_BAR`
values remain placeholders pending on-device detector-owner tuning. Real desktop
badge/profile behavior, open-tuning fingering quality, extended-range CAGED
continuation and future piano generation likewise need explicit follow-on review,
not inferred completion from old handoffs. The old consume-note_detect-card task
was dropped; current code keeps Virtuoso's local renderer.

Standing boundaries: borrow-before-build host checks; competency, not a public
count-wall; source citations/licensing retained; public name clearance remains
a historical governance question to recheck before wider promotion. No current
claim of trademark clearance, remote PR state or release certification is made.

## Session handoff

Removal verification (2026-10-20): **23/23 Node tests**, including the
71-case source/Lab characterization corpus, package/ZIP/source-graph checks,
verbatim legal/vendor-source retention, player reconstruction and legal UI links.
New rows assert no withdrawn recordings in source/Lab/ZIP and exercise the real
source/Lab mixer restore, bank lookup, amp selection and procedural cab chain.
Local Markdown links, module/tool syntax, cached TypeScript checkJs, mirrored
guidance and brand/whitespace checks pass. TypeScript 5.9.3 rebuilds the pinned
WebAudioFont preferred sources byte for byte; all 28 FluidR3 presets exactly
match pinned official upstream downloads. OFL files remain unchanged.

Publication plan approved 2026-10-20: regenerate
`../virtuoso-lab-dist/virtuoso_lab/` and its ZIP from committed source, replace
the prior publication tree at `cde5bb8939`, remove all **62 uncertain assets**,
and publish **0.2.9-lab.1** to the personal fork's `main` only. Narrow vendor
dist ignore exceptions retain the reviewed player alongside all preferred sources.
Browser `npm test` previously exited 2: no host reachable on port 8765.
Python route-runtime/desktop/DI gates remain owed; no launcher or installation
is authorized. Python `pytest` previously could not collect because
`fastapi` is absent. Recording scope/mapping blockers in
[SOURCE.md](SOURCE.md) are now addressed by removal (2026-10-20), not a grant.
Published 2026-10-20 via nonforce SSH to personal-fork `main`:
`5ca4f45564daf5a2b05808546a0ce9e46354553b`, generated from local source
`afacd2fa1a003b5d90b9e3c20a535daf48af3d3a`. Remote SHA verified. Publication
tree has all 12 vendor files and complete license/source notices; 62 withdrawn
assets are absent. Publication 71-case corpus, real audio migration/cab probes,
exact generated inventory and TypeScript 5.9.3 vendor/Lab rebuild passed.
All three settings GitHub links return HTTP 200; eight commit-pinned public
runtime/legal files match local bytes, including manifest 0.2.9-lab.1. Raw
`main` source/legal/settings/README/player files match; raw `main/plugin.json`
remains cached at 0.2.8-lab.1 after one targeted retry. Removed commit-pinned
OGG/WAV URLs return 404. Source `main` and modules sibling remain unchanged.
No legal or live-runtime/desktop/DI certification is made.

Keep current state/next work here, durable technical procedures in plugin docs,
and completed session narrative in the archive. Commit/push only when asked.
