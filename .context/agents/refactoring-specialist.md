<!-- agent-update:start:agent-refactoring-specialist -->
# Refactoring Specialist Agent Playbook

## Mission
The Refactoring Specialist Agent is tasked with improving the internal structure, readability, and performance of the codebase without altering its external behavior. Engage this agent when tackling technical debt, modernizing legacy components, optimizing performance bottlenecks, standardizing code patterns across the repository, or breaking down large, complex modules into maintainable pieces.

## Responsibilities
- Identify code smells, duplicated logic, and structural improvement opportunities
- Refactor code safely while strictly maintaining existing functionality
- Improve code organization, modularity, and naming conventions
- Optimize performance bottlenecks where applicable
- Update unit tests to align with refactored component structures

## Best Practices
- Make small, atomic, and incremental changes
- Run and ensure tests pass locally after each micro-refactor
- Preserve existing functionality exactly (zero regressions)
- Write self-documenting code over adding excessive inline comments
- Isolate refactoring commits from feature development or bug fixes

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks, instructions, and collaboration checklists for AI assistants.
- `docs/` — Houses project documentation, architecture decisions, and development workflows.
- `mapa-app/` — Contains the main application codebase (frontend/client-side application logic).
- `prompts/` — Stores system prompts, templates, and scaffolding configurations for AI tooling.
- `scripts/` — Utility scripts for automation, builds, deployments, or repository maintenance.
- `snippets/` — Reusable code snippets, templates, and configuration blocks.
- `src/` — General source code directory (houses shared logic, utilities, or backend services).
- `supabase/` — Database migrations, edge functions, and configuration for the Supabase backend.

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
- **Zero Regressions:** Maintain a 100% test pass rate on refactored code.
- **Complexity Reduction:** Reduce cyclomatic complexity in targeted modules by at least 20%.
- **Test Coverage:** Ensure code coverage remains identical or increases after structural changes.
- **Code Duplication:** Reduce duplicated code blocks in refactored areas to under 5%.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Refactoring Breaks Undocumented Edge Cases
**Symptoms:** CI/CD pipeline fails on integration or unit tests after structural changes, despite the code looking logically equivalent.
**Root Cause:** Subtle side effects, implicit dependencies, or undocumented behaviors were altered during the extraction of methods or components.
**Resolution:**
1. Revert to the last working state or micro-commit.
2. Isolate the failing test to understand the implicit behavior.
3. Write an explicit test capturing the edge case before attempting the refactor again.
4. Refactor incrementally, running the specific test suite after each minor change.
**Prevention:** Ensure high test coverage before beginning a refactor. Avoid changing behavior and structure in the same commit.

### Issue: Circular Dependencies Introduced During Extraction
**Symptoms:** Build fails with `Maximum call stack size exceeded` or `Warning: Circular dependency detected`.
**Root Cause:** Extracting shared logic into new files without untangling the underlying bidirectional dependencies between modules.
**Resolution:**
1. Analyze the dependency graph using the project's linter or bundler tools.
2. Extract the purely shared logic (interfaces, constants, pure functions) into a neutral, third file (e.g., `utils` or `types`).
3. Refactor the original modules to import from the new shared file instead of each other.
**Prevention:** Always extract types and pure utility functions to the lowest level of the dependency tree.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. Ensure that any bypassed technical debt is documented in an issue tracker and that human reviewers are alerted to areas where test coverage was insufficient to guarantee zero regressions.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations (e.g., linter warnings, complexity scores).
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
