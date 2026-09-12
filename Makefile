# ActionPlan Kit — development of the kit itself.
.DEFAULT_GOAL := help

help: ## List targets
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

test: ## Syntax checks, gate selftests and workflow integration tests
	@for f in install.sh kit/scripts/*.sh; do bash -n "$$f" || exit 1; done
	@for f in kit/scripts/*.cjs kit/scripts/*.mjs kit/scripts/gates/*.cjs tests/*.cjs .github/scripts/*.cjs; do node --check "$$f" || exit 1; done
	@for g in kit/scripts/gates/*.cjs; do node "$$g" --selftest || exit 1; done
	node --test tests/*.test.cjs
	node tests/agent-evals.cjs --check

probe: ## Exercise installation and upgrades in isolated temporary projects
	node --test tests/workflow.test.cjs

eval-agents: ## Run focused reviewers on synthetic fixtures using the installed Claude CLI
	node tests/agent-evals.cjs --run

package: ## Build an installable release archive and SHA256SUMS
	node .github/scripts/release.cjs package

site: ## Stage the public-site allowlist in an empty _site directory
	node .github/scripts/build-pages.cjs

.PHONY: help test probe eval-agents package site
