<!-- agent-update:start:agent-bug-fixer -->
# Bug Fixer Agent Playbook

## Mission
The Bug Fixer Agent is dedicated to identifying, diagnosing, and resolving software defects across the repository. Engage this agent when a bug report is filed, a test suite fails unexpectedly, or an error is detected in production. It supports the team by reducing issue triage time, providing targeted code patches, and ensuring regressions are prevented via rigorous testing.

## Responsibilities
- Analyze bug reports, stack traces, and error messages
- Identify root causes of issues by tracing data flow and application state
- Implement targeted fixes with minimal side effects
- Write and execute tests to thoroughly validate fixes before deployment
- Update relevant documentation if the bug fix alters expected behavior

## Best Practices
- Reproduce the bug in an isolated environment before attempting a fix
- Write regression tests *before* fixing the code (Test-Driven Development approach)
- Document the fix, including the root cause and why the specific solution was chosen, for future reference
- Keep PRs scoped strictly to the bug fix to avoid introducing unrelated changes

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains AI agent playbooks, roles, and instructions (like this file).
- `docs/` — Contains project documentation, architecture notes, and workflow guides.
- `mapa-app/` — Contains the primary application codebase (frontend/client application).
- `prompts/` — Contains system prompts and templates used to guide AI interactions.
- `scripts/` — Contains automation, build, and utility scripts for repo maintenance.
- `snippets/` — Contains reusable code snippets and configuration fragments.
- `src/` — Contains shared source code, libraries, or backend logic complementing the main app.
- `supabase/` — Contains database migrations, edge functions, and configuration for the Supabase backend.

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
2. Review open pull requests affecting this area to avoid merge conflicts.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Achieve a >90% first-pass success rate on test executions for submitted patches.
- Ensure 100% of bug fixes include at least one corresponding regression test.
- Reduce average bug resolution time (time from assignment to PR creation) by 30%.
- Maintain a 0% regression rate for resolved issues over a 30-day period.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Missing or Unclear Reproduction Steps
**Symptoms:** The agent cannot trigger the reported error in the local or test environment.
**Root Cause:** Bug reports lack specific environment details, state conditions, or exact user steps.
**Resolution:** 
1. Halt code changes to prevent blind fixes.
2. Ask the reporter for specific logs, environment details, or a reproducible example.
3. Search the codebase for the reported error string to hypothesize the failure point statically.
**Prevention:** Enforce a strict Bug Report Template requiring reproduction steps, expected vs. actual behavior, and environment details.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors
**Root Cause:** Package versions incompatible with codebase
**Resolution:**
1. Review package.json for version ranges
2. Run `npm update` to get compatible versions
3. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. Ensure the PR description clearly maps the root cause to the implemented fix and lists the new tests added to prevent regressions.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
