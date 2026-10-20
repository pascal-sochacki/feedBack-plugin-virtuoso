# Local dogfood — confirm what is actually loaded

Virtuoso needs a running FeedBack host. Source tests do not certify the desktop,
audio interface or detector. Read [testing](testing.md) and the local
[skill](../../.claude/skills/run-virtuoso/SKILL.md) before launching anything.

## Desktop vs headless

| Target | Tool | Important distinction |
| --- | --- | --- |
| Installed desktop | `launch-desktop.ps1` in the skill directory | Changes a source `virtuoso` junction, stops known app instances and launches a selected EXE |
| Headless source host | `launch.ps1`, then `npm test` in the skill directory | Uses a separate dev plugin directory and port 8765; can pull host source, prune links and refresh dependencies |
| Installed Lab | Git Plugin Manager or complete generated folder | Use [Lab guide](virtuoso-lab.md), not the original-ID source launcher |

These Windows scripts were authored for a particular development machine; they
are not portable installers and must not be executed without confirming target,
paths and permission for their side effects. `FEEDBACK_DESKTOP_EXE` selects the
desktop executable; default remains `C:\Dev\feedback\desktop-app\feedback.exe`.
Do not infer bundled plugin versions from these old paths or `env-reference.json`.
Record actual app, note_detect and visualization versions from the running host.

## Windows plugin directory

Current preferred user directory: **`%APPDATA%\feedback-desktop\plugins\`**.
Older `%APPDATA%\slopsmith-desktop\plugins\` and other renamed-app directories
may exist but need not be active. Check the running app's actual userData path;
do not delete legacy directories or overwrite Program Files/bundled plugins.

The existing `launch-desktop.ps1` still **defaults to the legacy
`slopsmith-desktop\plugins` directory**. This docs-only cleanup does not change
launcher behavior. Explicitly select the confirmed active path before invoking:

```powershell
$env:FEEDBACK_USER_PLUGINS = Join-Path $env:APPDATA 'feedback-desktop\plugins'
$env:FEEDBACK_DESKTOP_EXE = 'C:\path\to\feedback.exe'
# Only after reviewing side effects and confirming this is original-ID source:
powershell -ExecutionPolicy Bypass -File .claude/skills/run-virtuoso/launch-desktop.ps1
```

User-installed plugins take precedence over bundled snapshots. A junction to an
old clone can silently serve committed old code instead of current edits. The
source desktop launcher self-heals its selected `virtuoso` junction to this repo,
but refuses to replace a real directory. Verify the link target, loaded manifest,
header version and network module URLs, not merely successful syntax.
`SLOPSMITH_PLUGINS_DIR` is the headless host's override, not the desktop's lever.

## Repeatable acceptance

1. Confirm whether testing original source or generated Lab. For Lab keep original
   disabled and **fully restart**; separate IDs do not isolate host singletons.
2. Back up relevant data. Install the **full matching runtime set**: manifest,
   JS/HTML/Python/settings plus `src/`, `static/`, `assets/`. A partial `screen.js`
   copy over mismatched HTML can totally break boot while syntax still passes.
3. Restart after install/enable/route changes. Reload JS/HTML during source work;
   check native-module MIME, load order, cache, same-version re-entry and navigation.
4. Exercise all renderers, transport/count-in/loop/pause/resume/Workout seams,
   mixer/output and note_detect verifier. Record real input device and low-string
   DI cases on the user's installed desktop; mocks and headless no-mic checks
   cannot certify native detector behavior.
5. Compare desktop and headless with the **same chart/config**. If only one target
   fails, inspect host/plugin/version/input drift before changing generation.
   A historical green-note problem was a host viz global rename; another was a
   stale source junction. Neither justifies a parallel local judge.

Headless suite runner defaults to port 8765; `SLOPSMITH_HOST` selects a running
host URL. Dynamic `run-all.mjs` discovery is authoritative. For a complete
sequential run use `node run-all.mjs 1`, not the incomplete `test:seq` chain.

## Packaging is separate

[Lab packaging](virtuoso-lab.md) generates an isolated runtime and ZIP without
commit/push/install. Source tests use disposable temporary output, never the
publication worktree. [Beta tooling](beta-testing.md) uses a committed source ref
and can commit/push; it is not an automatic dogfood command. No publication or
installed artifact is changed by this documentation cleanup.
