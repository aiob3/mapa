<!-- agent-update:start:agent-test-writer -->
# Test Writer Agent Playbook

## Mission
The Test Writer Agent is responsible for ensuring the robustness, reliability, and correctness of the project's codebase through comprehensive automated testing. Engage this agent when adding new features, refactoring existing logic, fixing bugs, or when CI pipelines indicate a drop in test coverage. Its primary goal is to catch regressions early and serve as executable documentation for the system's intended behavior.

## Responsibilities
- Write comprehensive unit, integration, and end-to-end tests
- Ensure high test coverage across the codebase, particularly for core business logic
- Create robust test utilities, mocks, and data fixtures
- Maintain and update existing tests as application requirements evolve
- Identify and resolve flaky tests in the CI/CD pipeline

## Best Practices
- Write tests that are clear, deterministic, and maintainable
- Test both the happy path and edge cases (including error states and boundaries)
- Use descriptive test names that explain the "what" and "why" (e.g., `should display error message when API call fails`)
- Keep tests isolated; do not share mutable state between test cases
- Mock external dependencies (like Supabase or third-party APIs) appropriately to ensure fast and reliable unit tests

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — AI agent playbooks detailing roles, responsibilities, and workflows for automated contributors.
- `docs/` — Project documentation, including testing strategies, architectural decisions, and development workflows.
- `mapa-app/` — The primary application codebase requiring UI component tests, custom hooks testing, and application state integration tests.
- `prompts/` — System prompts and templates used for AI integrations and scaffolding.
- `src/` — Core source code, shared libraries, and utility functions requiring rigorous unit testing.
- `supabase/` — Backend configurations, database migrations, and edge functions requiring targeted integration and API testing.
- `scripts/` — Build, deployment, and automation scripts that may require utility testing.

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Achieve and maintain >80% test coverage for core business logic in `mapa-app` and `src`.
- Ensure 100% of resolved bugs include a corresponding regression test to prevent recurrence.
- Keep test suite execution fast (e.g., unit tests under 2 minutes) by optimizing mocks and fixtures.
- Monitor CI/CD test failure rates over time to identify, isolate, and eliminate flaky tests.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Flaky Tests due to Asynchronous State Updates
**Symptoms:** Tests pass locally but occasionally fail in CI/CD pipelines, often with warnings about state updates happening outside of `act()`.
**Root Cause:** Missing `await` statements, improper mocking of asynchronous API calls, or race conditions in UI rendering where the test assertions run before the DOM has fully updated.
**Resolution:** 
1. Identify the failing async operation or API call.
2. Ensure proper use of asynchronous queries (e.g., `findBy` or `waitFor` in React Testing Library) instead of synchronous ones (`getBy`).
3. Verify that all external network requests (like Supabase queries) are consistently mocked.
**Prevention:** Enforce strict linting rules for testing libraries (e.g., `eslint-plugin-testing-library`), and avoid arbitrary `setTimeout` delays in tests.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or type mismatches in CI.
**Root Cause:** Package versions incompatible with codebase or differing environments.
**Resolution:**
1. Review `package.json` for version ranges.
2. Run `npm update` to get compatible versions.
3. Test locally before committing.
**Prevention:** Keep dependencies updated regularly, strictly utilize lockfiles (`package-lock.json` or `pnpm-lock.yaml`), and ensure CI uses clean install commands (`npm ci`).

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. Ensure any newly introduced testing utilities or custom matchers are documented in the `Testing Strategy` guide.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify test updates.
- Command output or logs (e.g., coverage reports) that informed recommendations.
- Follow-up items for maintainers or future agent runs (e.g., "Integration tests for Supabase Edge Functions still needed").
- Performance metrics and benchmarks for the test suite where applicable.
<!-- agent-update:end -->
