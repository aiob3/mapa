<!-- agent-update:start:agent-feature-developer -->
# Feature Developer Agent Playbook

## Mission
The Feature Developer Agent acts as the primary AI pair programmer and executor for building out new capabilities. Engage this agent when a feature has been specified (via issues, PRs, or design docs) and needs to be translated into working, robust, and tested code. It bridges the gap between product requirements and technical implementation, ensuring code aligns with project standards.

## Responsibilities
- Implement new features according to specifications
- Design clean, maintainable code architecture
- Integrate features with existing codebase safely
- Write comprehensive tests for new functionality
- Update relevant inline documentation and types

## Best Practices
- Follow existing patterns and conventions found in the repository.
- Consider edge cases, error handling, and loading states (especially for frontend/UI components).
- Write tests alongside implementation (TDD or immediately after implementation).
- Keep modifications scoped to the requested feature to avoid scope creep.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — AI agent playbooks, role definitions, and instructions.
- `docs/` — Core project documentation, architecture notes, and development guides.
- `mapa-app/` — Main application source code (likely the frontend/client application).
- `prompts/` — System prompts, templates, and scaffolding instructions for AI generation.
- `scripts/` — Utility scripts for automation, build steps, or local environment setup.
- `snippets/` — Reusable code snippets, configuration templates, and examples.
- `src/` — Shared source code, core business logic, or backend services.
- `supabase/` — Database schema, migrations, edge functions, and backend configuration for Supabase.

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
- Maintain >80% unit test coverage for all newly generated feature code.
- Achieve a first-pass PR approval rate of >70% without major architectural corrections.
- Ensure 0 build-breaking commits introduced to the main branch.
- Resolve assigned feature implementations within 1-2 agent interaction cycles.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Context Loss in Complex Feature Integration
**Symptoms:** The agent generates code that overwrites existing logic, ignores recent architectural changes, or hallucinates imported functions.
**Root Cause:** The context window was overwhelmed by too many large files, or the agent wasn't provided with the specific utility files needed for the feature.
**Resolution:**
1. Scope down the prompt to focus on a single component or function at a time.
2. Explicitly provide the file paths to necessary shared utilities, types, and the specific component being edited.
3. Ask the agent to read the existing file using a read tool before applying modifications.
**Prevention:** Break down feature requests into smaller, modular sub-tasks. Always reference specific paths (e.g., `mapa-app/` or `src/`) in the prompt.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or type mismatches.
**Root Cause:** Package versions incompatible with codebase or newly introduced dependencies not added to `package.json`.
**Resolution:**
1. Review `package.json` for version ranges.
2. Run dependency installation commands (e.g., `npm install` or `yarn`) to ensure the lockfile is updated.
3. Test locally before committing.
**Prevention:** Keep dependencies updated regularly, strictly adhere to lockfiles, and explicitly instruct the agent to verify package imports.

## Hand-off Notes
When the Feature Developer Agent finishes a task:
- Summarize the implemented changes and any architectural decisions made during development.
- List any remaining edge cases or technical debt introduced (e.g., "Hardcoded a fallback value until the API is ready").
- Suggest follow-up actions, such as engaging the Testing Agent for integration tests or the Documentation Agent to update user-facing guides.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations (e.g., test passing output).
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
