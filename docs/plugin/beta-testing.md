# Upstream beta tooling — legacy channel, not Lab

Historical upstream channels used ID `virtuoso` on upstream `main` and
`virtuoso_beta` on `virtuoso-beta`. This is **not** the personal fork's generated
`virtuoso_lab` `main`. Use the [Lab guide](virtuoso-lab.md) for this module branch.
No current remote beta state or side-by-side runtime safety is certified here.

## Existing script contract

`scripts/cut-beta.mjs` reads the **last commit** of `--source <ref>` (default
`main`), not working-tree edits. It rewrites runtime identity and version to
`X.Y.Z-beta.N`, copies `static/` and `assets/` with licenses, and writes a renamed
snapshot to `virtuoso-beta`.

- `--dry-run <outside-directory>` writes output only; inspect it before use.
- Without `--dry-run`, the tool **commits** on a generated branch.
- `--push` additionally publishes. Commit/push only when explicitly authorized.
- `--version <X.Y.Z-beta.N>` overrides the counter.

**Module-branch blocker:** this older script does **not** copy `src/` or its
nested ESM package. It also copies the source README verbatim, whose links depend
on docs/images omitted from the runtime snapshot. Do not cut/install/promote this
native-module branch through that tool; it would have missing imports and docs.
This cleanup updates its doc pointer only, not its legacy packaging behavior.
Use `scripts/cut-lab.mjs` and the tested allowlist for an experimental module build.

Distinct IDs separate registration, routes, DOM and stores, **not** singleton
detector, host instrument/tuner/output or AudioContext interactions. Old prose
claiming "fully independent" simultaneous use is superseded. Disable the other
edition and restart before testing. Back up data and use the confirmed writable
user plugin directory (normally `%APPDATA%\feedback-desktop\plugins\` on current
Windows; inspect legacy paths rather than assume them active).

## Promotion

Upstream default-branch HEAD may be bundled or downloaded by users. Keep WIP on
branches; establish running-host gates and supported release floor before any
stable promotion. Manifest/header versions must match for shippable changes.
No command in this guide authorizes commit, push, tag, migration or installation.
Historical channel chronology is preserved in
[development history](../archive/development-history.md).
