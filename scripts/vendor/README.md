# Developer-only Acorn parser

`acorn.mjs` is the unmodified Acorn **8.18.0** ESM distribution, copied from
already installed Renovate development tooling; no install was performed.
Upstream: <https://github.com/acornjs/acorn/tree/8.18.0>.
SHA-256: `953573b8fdab71599749ea5f2b33d3e760c2116178f9423ee7458dbe39d59453`.
[MIT license](acorn-LICENSE.txt), [contributors](acorn-AUTHORS.txt).

Only `scripts/native-module-graph.mjs` imports it. It is outside the runtime
allowlist and absent from generated Lab folders/ZIPs. This checked-in development
dependency makes graph tests portable without a compiler cache or package install.
The graph accepts ECMAScript 2022 modules; invalid/newer syntax fails closed.
AST import declarations, reexports and import expressions are inspected at every
nesting level. Only literal-string dynamic specifiers are supported by policy.
