# Cab impulse responses (`static/irs/`)

Real guitar-cab impulse responses for the amp inserts (`AMP_PRESETS[*].ir` in
`screen.js`). The convolver loads `static/irs/<name>.wav` via the
`/api/plugins/virtuoso/ir/<name>` route; if a file is absent, the chain falls
back to the **procedural** cab (`cabIrBuffer`) — so a missing IR is never silent.

## No shipped capture files (2026-10-20)

The former `v30_4x12.wav` (Deer Ink Studios V30 / Audix i5 P2 from
[AIDA-X](https://github.com/AidaDSP/AIDA-X)) was removed: the project's GPL
statement did not independently establish permission for this third-party
capture. Its old license description was not clearance. Historical evidence:
[SOURCE.md](../../SOURCE.md). Metal keeps its preset settings and now uses the
existing procedural cab directly, with no fetch for the removed WAV. User IR
uploads still override the cab. No new captured/generated audio asset is shipped.

## Local-only (gitignored — NOT shipped)

The clean + overdrive cabs are **commercial** captures from a personal library,
used for local dogfooding only. The public build falls back to the procedural cab
for these two presets. To audition them, drop a cab IR WAV at these names:

| file | preset | currently (local) |
|------|--------|-------------------|
| `cab_clean.wav` | **Clean** | GGD Zilla "Boutique Clean" (commercial — local only) |
| `cab_drive.wav` | **Overdrive** | Marshall JMP2203 capture (commercial — local only) |

Replacing a local file is a hot-swap — no code change (the preset references the
stable role-name `cab_clean` / `cab_drive`). When a genuinely redistributable
(CC0/CC-BY/GPL) clean and Marshall/Greenback IR is found, drop it in + un-gitignore
it here only after recording-specific license/source review.

> Format: short mono cab IR WAV (44.1/48 kHz, a few hundred–~2k samples). The
> double-tracking supplies the stereo, so mono is correct.
