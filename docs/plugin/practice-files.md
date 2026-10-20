# File practices — Markdown prototype

Local source candidate **0.2.11**; experimental **0.2.11-lab.1** publication
is authorized to the personal fork's `main` only. Installed-host acceptance is owed.
This does not include Learn or replace any curated/generated practice.

## Use

1. Declare your actual instrument in Setup: guitar, six strings, standard
   E A D G B e (absolute MIDI low→high: 40,45,50,55,59,64).
2. Open **Custom → File practices**, choose **Chromatic warm-up**, then
   **Load practice**. Loading previews; it does not start audio.
3. Use the existing **Play**, Pause, Stop, count-in and loop controls.
   Change Tempo (30–260 BPM) to rebuild from the cached authoritative file.
4. Choose **Return to generated practice**, a normal Practice type, preset or
   another mode to leave the file. No host setting is forced or retuned.

Wrong instrument/string count/tuning produces an explicit error. Changing Setup
after loading revalidates and stops/unloads the playable bundle on mismatch;
return to compatible Setup or leave the file. Compatible Setup or Tempo edits
automatically rebuild from the retained file, even when the mismatched playable
bundle was cleared. No reload/Play is required. Key/shape/rhythm generation fields
are disabled/irrelevant while loaded; the LCD shows file identity and static meter
instead of an editable key. Reference tempo is always visible in the lesson text
and remains unchanged when playback tempo changes. This prototype has no backing.

## Strict schema

The original lesson is
`assets/practices/guitar/beginner/chromatic-warmup.md`, listed in
`assets/practices/index.json`. The catalog has one explicitly reviewed entry;
adding a file also requires updating the pure catalog and packaging review.
IDs are independent of titles, filenames and generated practice-type enums.

Required scalar frontmatter: `id`, `title`, `instrument: guitar`,
`tuning: standard`, `meter: 4/4`, `referenceTempo: 60`. One `key: value` per
line, unquoted strings, no comments, nested YAML, multiline values or extra keys.
Exactly one fenced `json` object: `{ "duration": 4, "notes": [...] }`.
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
- Finite numeric values only; source ≤64 Ki characters, ≤4096 notes,
  title ≤120 characters. Meter/tuning/instrument are intentionally restricted.

Timing is `source seconds × referenceTempo / bpm` for `t`, `sus`, and duration.
No sorting, transposition, refingering, shape generation, backing, swing or
right-sized run tiling. The parser's notes drive `generateExercise`'s pure
file branch via transient `cfg.practiceFile`; `practiceFileId` labels the result.
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
small Custom selector, not a Markdown API/editor/player/detector. Flip condition:
a documented reusable host practice parser/editor adapter may replace this
boundary. Running-host route/MIME behavior remains unverified here.

The shell fetches same-origin index/Markdown with redirects rejected; the index
must exactly match reviewed local paths/IDs/titles (no URLs, encoded traversal or
unknown entries). Successfully validated files are cached until page refresh.
Pending loads are aborted/identity-guarded on generation, selection, modes and
navigation; they cannot overwrite a new generated chart. Prose is plain
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
