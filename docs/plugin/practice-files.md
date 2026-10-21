# File practices — Markdown prototype

Local source WIP **0.2.13** / generated **0.2.13-lab.1**, not published.
The personal fork still publishes **0.2.11-lab.1**. Installed-host acceptance is owed.
This does not include Learn. Only Ladder `chromatic_warmup` is migrated;
all other curated practices and the shared chromatic generator remain.

## Ladder pilot (format 3)

**Chromatic Warmup** keeps progress/prerequisite ID `chromatic_warmup`. Its file
is `guitar/beginner/chromatic-warmup-ladder.md`, resolved through the sole
`assets/practices/index.json`. Standard six-string guitar only: alternate-tuning
compatibility is intentionally lost. Selection never retunes Setup; mismatch
stops/unloads the chart and compatible Setup rebuilds without autoplay.

The file owns goal, form-cue references (the shared dictionary supplies wording),
base config, six named variations and explicit four-tier chart references.
Twelve fully serialized charts: 1234/4321/1324/1342 at frets 1–4, then 1234
at 5–8 and 9–12; quarter and eighth versions each. Tiers remain 60/70/80/90 BPM,
quarter/quarter/quarter/eighth, nominal bars 4/6/8/8. Core outputs are actually
48 notes at tiers 0–2 and 96 at tier 3, each 48 source seconds at 60 BPM.
Existing whole-pass shell run-target tiling remains (Slow repeats its pass),
as do count-in offsets. No runtime pattern generator creates these notes.

Format 3 adds a required strict JSON `pathway`: `goal`, `formCues`, `base`,
`tiers` (`bpm`, `subdivision`, `bars`), `variations` (`id`, `title`, `config`,
`charts`). Every sibling/reference validates before exposure. Format 2 excludes
pathway metadata and retains the separate Custom demo `chromatic-warmup`
(hyphen, not underscore). IDs accept lowercase alphanumeric components separated
by single hyphens/underscores. No progress migration/reset.

The sole catalog carries `id`, `title`, `path`, `use: custom|pathway`. Code keeps
only an exact reviewed asset-path security inventory, not duplicate definitions.
Normal UI binds immediately; only the file-backed lesson awaits hydration.
Warmup is disabled/loading until ready, then its metadata is registered without
rebinding events or replacing current content. Each fetch/body read has a 10-second
abort deadline; navigation cancels pending catalog work. Public/debug APIs still
publish synchronously. Failure explicitly reports
Chromatic Warmup unavailable and leaves generated lessons usable, with no hidden
generator fallback. A small shell catalog module owns hydration, immutable internal
snapshots and preference-preserving selection. Public generation still validates
every caller-provided file; only internal goal/selector reads avoid repeated copying.
Tempo/tuning recovery retains selected Tab/Notation or the actual renderer fallback.
Lesson renderer hints never override current shell preferences.

Progress now captures practiced identity from the rendered bundle at session begin,
not a stale picker. Authored warmup credit is capped by selected tier/density and
validated variant mapping: quarter notes at 90 BPM cannot clear the eighth-note
Push tier. Eighth Push at 90 BPM retains credit. Subsequent picker edits cannot
redirect a run's credit; generated Custom exercises never fuzzy-credit this authored
rung. This fixes pedigree only, with unchanged host verdict judging and storage keys.

The Ladder adapter restores only existing inactive technique defaults
(`sl/slu:-1`, `bn/bt:0`, booleans false), preserving authored finger/pick fields.
It retains the old accumulated division clock and six-decimal onsets. Custom's
format-2 scaling is unchanged; active techniques remain rejected. All 24 original
live raw charts, relevant session cfg and bundled notes were captured before
registry removal with fixed cfg/seed; ordinary tests never recapture from Markdown.
Exact chart comparisons include anchors, beats, timeline, duration and humanSeed.

**HOST CHECK reused (2026-10-20):** BORROW generic host asset serving at
`feedBack` eef58c8 `plugins/__init__.py:2492–2520` and existing contained player/
renderer/judge; BUILD parser/catalog adapter only, no new host capability.
Flip on a documented reusable host parser/editor adapter. Live host module MIME,
cache/re-entry, navigation, render/audio, Windows DI and specialist review remain
owed; source/Lab mocks are not installed-host proof.

## Use

1. Declare your actual instrument in Setup: guitar, six strings, standard
   E A D G B e (absolute MIDI low→high: 40,45,50,55,59,64).
2. Open **Custom → File practices**, choose **Chromatic warm-up**, then
   **Load practice**. Loading previews; it does not start audio.
3. Select **Variant** or **Next variant**: first position (low E frets 1–4)
   and fifth position (low E frets 5–8). Next wraps from last to first.
   Both stop playback and load from zero, clearing the previous loop/cursor
   immediately before validation/readiness (also on failure),
   retaining Tempo and count-in. They never autoplay, including same selection.
   Use the existing **Play**, Pause, Stop, count-in and loop controls.
   Change Tempo (30–260 BPM) to rebuild from the cached authoritative file.
4. Choose **Return to generated practice**, a normal Practice type, preset or
   another mode to leave the file. No host setting is forced or retuned.

Wrong instrument/string count/tuning produces an explicit error. Changing Setup
after loading revalidates and stops/unloads the playable bundle on mismatch;
all variants are blocked. The selector remains usable and retains the selected
ID/hint through mismatch; compatible Setup rebuilds that variant without autoplay.
return to compatible Setup or leave the file. Compatible Setup or Tempo edits
automatically rebuild from the retained file, even when the mismatched playable
bundle was cleared. No reload/Play is required. Key/shape/rhythm generation fields
are disabled/irrelevant while loaded; the LCD shows file identity and static meter
instead of an editable key. Reference tempo is always visible in the lesson text
and remains unchanged when playback tempo changes. This prototype has no backing.

## Strict schema

The original lesson is
`assets/practices/guitar/beginner/chromatic-warmup.md`, listed in
`assets/practices/index.json`. The catalog now has two reviewed entries;
adding a file requires index and packaging security-inventory review.
IDs are independent of titles, filenames and generated practice-type enums.

Custom format-2 scalar frontmatter: `formatVersion: 2`, `id`, `title`, `instrument: guitar`,
`tuning: standard`, `meter: 4/4`, `referenceTempo: 60`. One `key: value` per
line, unquoted strings, no comments, nested YAML, multiline values or extra keys.
Exactly one fenced `json` object: `{ "variants": [{ "id": "first-position",
"title": "First position", "hint": "Optional plain text", "duration": 4,
"notes": [...] }] }`. Shared metadata belongs solely in frontmatter, never
duplicated in JSON. This intentionally breaks the old root `duration`/`notes`
form: add `formatVersion: 2` and wrap each authored chart in a named variant.
Every variant is validated before exposing any; invalid siblings reject the file.
Not arbitrary YAML, Markdown, alphaTex or a tablature-table importer.

- `t`: source seconds at reference tempo; `s`: integer 0–5, **0 is lowest**;
  `f`: integer 0–24; `sus`: nonnegative source seconds, all required.
- `duration`: positive source seconds, bounded to 600; must cover every note's
  onset+sustain **and extend past the final onset**. It explicitly retains the
  final beat when the last note has zero sustain. No inferred note lengths.
- Optional existing `fg` (0=open, 1–4 fingers) and `pkd` (0=down, 1=up) are
  retained, display-only, never scored. `fn` is not the actual schema field.
- Onsets strictly increase. Sustain overlaps on any strings are rejected:
  single notes with rest gaps only. Chords, bends, HOPO, slides, all other
  technique fields, unknown keys and duplicate JSON keys explicitly fail.
- Finite numeric values only; source ≤64 KiB UTF-8, 1–32 variants,
  ≤4096 notes total, title ≤120 characters, optional hint 1–500 characters.
  File and variant IDs are lowercase alphanumeric components separated by single
  hyphens/underscores, ≤64 characters; variant IDs unique.
  Titles/hints are nonempty single-line plain text, no control characters,
  displayed via textContent (HTML-like text is inert, never interpreted).
  Meter/tuning/instrument are intentionally restricted.

Timing is `source seconds × referenceTempo / bpm` for `t`, `sus`, and duration.
No sorting, transposition, refingering, shape generation, backing, swing or
right-sized run tiling. The parser's notes drive `generateExercise`'s pure
file branch via transient `cfg.practiceFile` and `cfg.practiceVariantId`.
Omitting selection chooses the first; an unknown ID errors, never falls back.
Session metadata includes `practiceFileId`, `practiceFileVariantId`,
`practiceFileVariantTitle`, `practiceFileVariantHint` and `practiceVariantId`
for tempo regeneration. Parsed arrays remain ordinary mutable data; builders
copy notes without altering inputs. No host IO enters the core.
It returns the existing chart schema, then uses **makeBundle/startPlayback**.
The normal shell adds count-in offsets (six-decimal rounding) and `_tail`
lookahead copies; chart source time stays count-in-free. These are deliberate
engine presentation differences, not edits to source rhythm. Zero sustain is
retained for targets; existing audio voice/envelope behavior is not redefined.

## Ownership and safety

**HOST CHECK (2026-10-20):** capability: static lesson assets and contained chart
playback. Read-only sibling FeedBack `eef58c8`,
`plugins/__init__.py:2492–2520`: generic sandboxed plugin `assets/` serving,
no-cache/ETag refresh, plus existing source-module routes. Existing Virtuoso
`makeBundle`, `attachRenderer`, `startPlayback` own playback. **BORROW** host
assets, renderer and judge; **BUILD** strict IO-neutral parser/chart adapter and
small Custom selector, not a Markdown API/editor/player/detector. Fixed variants
reuse this already-confirmed loader/player boundary; no new host capability.
Flip condition:
a documented reusable host practice parser/editor adapter may replace this
boundary. Running-host route/MIME behavior remains unverified here.

The shell fetches same-origin index/Markdown with redirects rejected; the index
must use reviewed local paths and unique validated IDs/titles (no URLs, encoded traversal or
unknown entries). Successfully validated files are cached until page refresh.
Pending loads are aborted/identity-guarded on generation, selection, modes and
navigation; they cannot overwrite a new generated chart. Starting a load clears
owned file/variant controls and the old playable bundle; failure/cancellation
cannot resurrect them. Navigation/Return/type/preset/mode exit clears variant
state. Selection generations use existing renderer/generation identity guards,
including rapid A→B→A and late readiness success/failure. Prose is plain
`textContent`. Returning to the plugin after navigation generates normal current
config once per visit, without restoring the abandoned file or autoplaying.
Late renderer completion cannot clear a newer user loop. Common prose is plain
`textContent` with line breaks/headings/list markers preserved, never raw HTML
or clickable links. No dependency or CDN. Packaging admits just the two reviewed
original practice files from the working tree, checks their realpaths and index,
and rejects symlink escapes; no broad untracked/ignored asset scan.

Direct Node parser/loader and real source/Lab dispatch/bundle tests cover this
path without changing the 71-case committed generation fixture or public keys.
The generators browser suite has an asset/parser/dispatch row, **not run-host
certification**. Still owed: actual Custom load, tempo edit, mismatch, race and
navigation smoke; all renderers, transport, audio, module MIME/cache/re-entry,
and installed Windows DI/host judge. No new scoring logic, main-player handoff,
temp-sloppak launch, transport or Learn UI is included.
