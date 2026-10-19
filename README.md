# Virtuoso (Lab) — experimental personal fork

**Experimental, not a stable update.** Plugin ID / screen: `virtuoso_lab`;
navigation label: **Virtuoso (Lab)**. A supported released desktop version has
not yet been certified. The running host must understand `scriptType: "module"`
AND serve the plugin's `src/**` with JavaScript MIME. An older host will fail at
`import` or return 404 for the pitch module. Version: **0.2.7-lab.1**.

This fork packages the native-module prototype from upstream Virtuoso v0.2.6.
It **does not include the separate Learn-mode work** and is not an official
stable release. Original project: https://github.com/got-feedBack/feedBack-plugin-virtuoso.
Virtuoso remains licensed **AGPL-3.0-only**; see `LICENSE` and retained asset
licenses/attribution under `assets/` and `static/`.

## Install with Git Plugin Manager

1. Disable original **Virtuoso**, fully quit FeedBack and restart it. Keep the
   original disabled throughout Lab testing; do not run both editions together.
2. In FeedBack's Git Plugin Manager, install using this exact repository URL:

   **https://github.com/pascal-sochacki/feedBack-plugin-virtuoso.git**

   Default `main` has `plugin.json` and the complete runtime at its root.
   No branch selector, build, npm install or packaging step is required.
   The installed folder basename may differ from manifest ID `virtuoso_lab`.
3. Fully restart FeedBack after installation. Enable **Virtuoso (Lab)** if needed,
   restart again, and open its navigation entry. Confirm
   `/api/plugins/virtuoso_lab/status` and successful loading of `src/core/pitch.js`.

Installation is user-driven; publication does not install or start anything on
Windows. Back up important data before experimental testing.

## Runtime source and regeneration

The published repository contains the complete editable runtime source: plain
`screen.js`, `src/`, Python routes, HTML and licensed assets. There is no compiled
or hidden bundle. Upstream development docs, tests, packaging scripts and CI that
depend on the original source layout are intentionally omitted from this runtime
edition; publication does not imply browser/desktop certification.

Extraction and packaging tooling are preserved on the author's **local-only**
`refactor/native-modules` source branch, not published as a remote branch.
Source snapshot: `c37dc632cd0dcfca1576ff82ac238c72e48cae42` (local provenance
only; this hash is not available from the fork's remote history).
Do not try to check out that branch from this URL or run the cut tool on this already
namespaced runtime: applying it twice would rename identities twice.

For maintainers with that original-identity source checkout only:

```sh
node scripts/cut-lab.mjs
```

Outputs beside (not inside) the repositories:
`virtuoso-lab-dist/virtuoso_lab/` and `virtuoso-lab-dist/virtuoso_lab.zip`.
Regenerates modified tracked runtime files and untracked `src/*.js` / nested
modules and package JSON, without rewriting source or using the last commit.
Copies only explicit runtime files and tracked `assets/` / `static/` assets;
no `.git`, dependencies, settings, plugin data, local agent files or unreviewed
licensing assets. Font/audio attribution and licenses remain in the asset tree.
Requires Node, Git and the `zip` command on the packaging machine. No bundler.
The generator performs no commit, push, migration or installation.

## Alternative manual installation on Windows

1. Keep original **Virtuoso disabled**, then fully quit and restart FeedBack
   before testing Lab. Disabling without restarting leaves already-loaded
   scripts/routes in memory. Do not overwrite the original plugin folder.
2. In the current v3 UI open the **Plugins page (Pedalboard)** to check enabled
   plugins. The local host documentation does not establish a ZIP-upload control:
   **extract the ZIP manually** into the desktop's writable user plugin directory.
   Preferred current location: `%APPDATA%\feedback-desktop\plugins\`
   (`app.setName('feedback-desktop')`, with plugins under `userData/plugins`).
   Legacy `%APPDATA%\slopsmith-desktop\plugins\` and
   `%APPDATA%\fee[dB]ack\plugins\` directories may exist but need not be active;
   do not delete them. Verify the active installed desktop version and its actual
   userData/plugin location before copying; do not write into Program Files or
   the bundled stable plugin.
3. The result must be `plugins\virtuoso_lab\plugin.json`, with `screen.js`,
   `screen.html`, `routes.py`, `settings.html`, `src\package.json`,
   `src\core\pitch.js`, `static\` and `assets\` in that same plugin folder.
   Avoid `plugins\virtuoso_lab\virtuoso_lab\plugin.json` nesting.
4. Restart FeedBack, enable **Virtuoso (Lab)** if needed, restart again and open
   its navigation entry. Check `/api/plugins/virtuoso_lab/status` reports OK.
   Browser DevTools should show a module entry and successful `src/core/pitch.js`.
5. To update: fully quit, replace only the Lab runtime folder with a freshly
   generated folder, then restart/reload. To remove: disable Lab, quit, remove
   only `virtuoso_lab`, and restart. Original Virtuoso data stays unchanged.

For a web host, put the whole folder in that host's configured user plugin
directory instead, then restart it. The ZIP is a manual-install artifact, not
the Git Plugin Manager input. Use the repository URL above for Git installation.

## Identity isolation and limits

Lab owns its API/custom routes, DOM IDs/classes, CSS variables/data attributes,
animations, font faces, localStorage/progress keys, `plugin_data/virtuoso_lab`
export snapshots, `virtuoso_lab_presets` / `virtuoso_lab_tunings` DB tables,
temp-chart directory and outbound events. Public API: `window.VirtuosoLab`.
Harness opt-in: `__VIRTUOSO_LAB_HARNESS__`; debug: `__virtuoso_lab_debug` and
sample counters: `__virtuoso_lab_sgStats`. Audio font constructors and mutable
GM/drum preset globals are Lab-private; audio filenames and license text stay intact.
No original presets, tunings or progress are copied into Lab.

**Separate installation/storage is NOT proof of simultaneous runtime safety.**
Both editions still consume the host singleton `noteDetect` verifier/target slot,
shared input/output, host instrument/profile/tuner settings and visualization
factories. Boot instrument synchronization may write host settings. Host events
(`screen:changed`, `instrument:changed`, etc.) and legacy host-owned storage keys
(`slopsmith_notedetect`, shared card-save directory) deliberately stay unchanged.
Lab's AudioContext bridge is screen-scoped but can still chain with an original
edition's wrapper: keep original disabled and restart; don't run both together.
Shared host globals (`feedBack*`, `noteDetect`, tuner, host legacy aliases) are
not renamed or replaced with private fake host APIs.

## Acceptance status (2026-10-19)

Source-only validation: 11 Node tests (pitch and packaging), real module import,
manifest/source graph/ZIP integrity, private audio globals, Python AST + SQLite
schema/endpoints, repeatability and committed-baseline comparison (40 public keys,
91 debug keys, byte-identical outputs for all 25 built-in sessions). Syntax,
narrow JSDoc checking, brand hygiene and whitespace gates are checked as well.
The host smoke runner cannot reach a host on port 8765; browser smoke and Python
route-runtime tests need host/dependencies unavailable in this environment.
Real installed-host module loading/cache/navigation, renderers, transport,
audio and verifier acceptance remain required. **Windows audio-interface / DI
testing must be performed on the user's installed desktop**, not inferred from
Node tests or a source checkout. Do not merge or ship as stable until those pass.
