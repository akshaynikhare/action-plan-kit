# Security policy

## Supported versions

Security fixes target the latest stable release. Upgrade older installations using the instructions
in [the installation guide](docs/INSTALLATION.md). There is no guaranteed response or patch SLA.

## Report privately

Use [Report a vulnerability](https://github.com/akshaynikhare/action-plan-kit/security/advisories/new)
for a suspected security problem. Include the affected version, relevant command or agent,
reproduction steps using synthetic data, expected behavior and potential impact.

Do not disclose vulnerabilities, credentials or private project contents in public issues. The
maintainer will review private reports and coordinate a fix and disclosure when appropriate.
For ordinary installation bugs or feature requests, use [GitHub issues](https://github.com/akshaynikhare/action-plan-kit/issues).

## Trust boundaries

The kit installs local scripts and agent instructions. Review its changes before adoption.
Verification executes commands explicitly written in a plan; plans must come from trusted authors.
Read-only reviewer prompts and file locks coordinate agents; they are not operating-system sandboxes.
Completion hashes detect changes to declared files and reports, but do not authenticate the person
who checked a box or prove the truth of a natural-language report.

The installer never runs git or a package manager. Optional browser tooling and live model
evaluations are separate commands using the operator's own environment and credentials.
