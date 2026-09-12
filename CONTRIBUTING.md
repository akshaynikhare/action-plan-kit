# Contributing to ActionPlan Kit

Read the [code of conduct](CODE_OF_CONDUCT.md). Use an issue to explain a proposed workflow change
or a reproducible bug; small fixes can arrive directly as a pull request. Security reports follow
[SECURITY.md](SECURITY.md).

## Local setup

Use Bash, GNU Make and Node.js 22 or 24 on macOS or Linux. Core development needs no npm install.

```bash
git clone https://github.com/akshaynikhare/action-plan-kit.git
cd action-plan-kit
make test
```

Fork the repository for contributions, create a branch, and submit a pull request to `main`.
The [development guide](docs/DEVELOPMENT.md) describes the file layout and validation commands.

## What to change

- Edit commands, agents, scripts and templates in `kit/`, never an installed copy.
- Keep agents narrowly scoped. A prompt change should include a relevant evaluation case.
- A gate change needs a selftest that detects a planted violation and passes after its repair.
- Preserve user-owned files during installation; installation must never prompt, run git, or invoke
  a package manager. Cover behavioral changes with regression tests.
- Keep README at most 60 lines. Put detailed guides in Markdown under `docs/`; use Mermaid for diagrams.
- The website is self-contained. No external scripts, fonts, analytics or embedded services.
- Never place plan identifiers in source, comments or test names. Link from the plan to code.

## Pull requests

Explain the concrete problem, resulting behavior and how you validated it. Keep the diff focused;
list known limitations and any compatibility or migration impact. Run `make test` before submitting.
Do not describe a skipped live agent evaluation as a pass. Maintainers can request a targeted
follow-up test or revision before merging.

AI-assisted contributions are welcome. The contributor remains responsible for understanding,
reviewing and testing the submitted code and respecting third-party licenses.

By contributing, you agree that your contribution is provided under the repository's
[MIT license](LICENSE). No separate contributor agreement is required.
