---
description: Build or run a static gate. A new gate is not wired until its selftest proves it fails correctly.
---

Read `.actionplan/AP.md`. Usage: `/ap:gate` (run all) · `/ap:gate <name>` · `/ap:gate new <invariant in prose>`.

- Run one: `node .actionplan/scripts/gates/<name>.cjs`. Run all: `node .actionplan/scripts/check.cjs`. Relay output verbatim.
- New: write `gates/<name>.cjs` on the `gate-lib.cjs` contract — a header comment stating purpose, why it is
  static, and its known limitation ("under-reports — a ratchet against new drift, not a census");
  `collect(root)` returning `{key, display}` with content-fingerprinted keys; a `selftest` that plants a
  violation (must FAIL) then fixes it (must PASS). Run `--selftest`. Only then mention wiring it into
  the dedicated runner — it already discovers `gates/*.cjs`, so nothing to wire.
  Never depend on an existing project Makefile to run kit gates. Ratchet mode for adopted
  debt (`--update --bootstrap --plan <id>`), absolute for never-acceptable things.
