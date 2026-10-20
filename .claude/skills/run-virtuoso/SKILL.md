---
name: run-virtuoso
description: Launch a confirmed Windows FeedBack host, drive Virtuoso and capture screenshots or run browser smoke. Requires explicit target/path review; not a standalone app or portable installer.
---

# Run Virtuoso — host required

Read `docs/plugin/local-dogfood.md`, `docs/plugin/testing.md` and
`docs/plugin/development.md` first. Paths in prose are repository-root relative.
This harness targets original ID `virtuoso`; installed **Lab** uses a different
namespace and must follow `docs/plugin/virtuoso-lab.md`, not this source launcher.

## Before launching

- Confirm consent for launcher side effects: processes may be stopped, plugin
  junctions replaced/pruned, host checkout pulled and dependencies refreshed.
- Confirm actual installed EXE, userData/plugins path, host/detector/viz versions
  and input/output devices. Old bundled versions are not a current support floor.
- Current Windows normally uses `%APPDATA%\feedback-desktop\plugins\`.
  `launch-desktop.ps1` still defaults to **legacy**
  `%APPDATA%\slopsmith-desktop\plugins\`; set `FEEDBACK_USER_PLUGINS` to the
  confirmed active directory and `FEEDBACK_DESKTOP_EXE` to the actual executable.
  Do not delete legacy directories or copy into Program Files.
- `launch.ps1` is a **headless** host on port 8765 with a separate dev directory.
  Inspect its `SLOPSMITH_SOURCE`, `SLOPSMITH_CHECKOUT`, `SLOPSMITH_VENV` and
  `SLOPSMITH_PLUGINS_BASE` overrides. It defaults to checkout mode; bundled mode
  is a legacy install, not evidence of current FeedBack compatibility.
- Need Node and Playwright/Chromium for browser tooling; Python host dependencies
  must exist for the selected runtime. Installing dependencies is not a runtime
  plugin build step and is not automatically authorized.

## Commands (only after target review)

```powershell
powershell -ExecutionPolicy Bypass -File .claude/skills/run-virtuoso/launch.ps1
# Or real desktop with FEEDBACK_USER_PLUGINS / FEEDBACK_DESKTOP_EXE set:
powershell -ExecutionPolicy Bypass -File .claude/skills/run-virtuoso/launch-desktop.ps1
```

Headless logs: `%TEMP%\virtuoso\server.log`. Source JS/HTML changes need reload;
routes/install/enable changes need a full restart. Install the complete matching
runtime set including `src/`, `assets/`, `static/`; partial copies can break DOM boot.

From this skill directory with a running host (`SLOPSMITH_HOST` overrides URL):

```sh
npm test                  # run-all.mjs dynamically discovers smoke-*.mjs
node run-all.mjs 1         # complete sequential discovery
node smoke-renderers.mjs
node smoke-generators.mjs
node driver.mjs all-renderers
node driver.mjs screenshot tab_2d
```

Inventory at documentation cleanup: **21 browser smoke files**, not the original
two. `npm run test:seq` is a hand-maintained fallback that omits Gold; it is not
the authoritative full suite. `driver.mjs` captures screenshots, not acceptance
assertions. Screenshots/failure captures go to ignored `.virtuoso-shots/`.
Source unit/characterization/packaging/doc checks also exist:
`node --test tests/*.mjs` from root. See testing reference for checkJs and pytest.

## Driver and verification gotchas

- Host screen wrapper is `plugin-virtuoso`, not `virtuoso`; wait for attachment
  before navigating via `showScreen('plugin-virtuoso')`, since screens start hidden.
- Regenerate is hidden in Ladder. Use a tier button, Custom, or public API.
  Manual generation cfg should set both `mode` and `practiceType` to avoid dispatch
  choosing the wrong builder. Strings are lowest-first (`s=0`).
- A stale user plugin junction can shadow the bundled/source copy. Verify target,
  manifest/header parity and fetched module URLs before diagnosing drift.
- Some viz or audio paths fall back when host plugins are absent. Do not equate
  fallback behavior with certification of borrowed rendering/detection.
- Contained verifier smoke uses mocks; synthesized browser mic tests do not prove
  Windows native-interface/DI behavior. Never claim installed-host acceptance from
  Node/syntax/headless checks. Keep the host judge authoritative; no local grader.
- `/api/plugins/virtuoso/status`, `/presets`, `/tunings` can be checked directly
  while host runs. `/temp-sloppak` is dormant backend machinery, not Play's path.
- Do not suppress arbitrary host console errors as "benign" or invoke old
  launcher/session files that are absent. Record unavailable checks honestly.

No launcher was executed during the documentation cleanup. Commit/push/install
and dependency changes require their own authorization.
