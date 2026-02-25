<!-- agent-update:start:docs-index -->
# Documentation Index

Welcome to the repository knowledge base. Start with the project overview, then dive into specific guides as needed.

## Core Guides
- [Project Overview](./project-overview.md)
- [Architecture Notes](./architecture.md)
- [Development Workflow](./development-workflow.md)
- [Testing Strategy](./testing-strategy.md)
- [Glossary & Domain Concepts](./glossary.md)
- [Data Flow & Integrations](./data-flow.md)
- [Security & Compliance Notes](./security.md)
- [Tooling & Productivity Guide](./tooling.md)
- [UI Pattern Normalization (PLAN-NORMA-UI-002)](./ui-pattern-normalization-plan-norma-ui-002.md)

## Repository Snapshot
- `agents/` — AI agent playbooks and prompts.
- `docs/` — Living documentation produced by this tool.
- `mapa-app/` — Main application directory.
- `prompts/` — AI prompt templates and system instructions.
- `scripts/` — Utility and automation scripts.
- `snippets/` — Reusable code snippets.
- `src/` — TypeScript source files and CLI entrypoints.
- `supabase/` — Backend configurations and database migrations.
- `AGENTS.md` — AI Agent directory and overview.
- `CONTRIBUTING.md` — Guidelines for contributing to the repository.
- `package.json` / `package-lock.json` — Node.js dependencies and project scripts.
- `tsconfig.json` / `jest.config.js` — TypeScript and testing configurations.
- `README.md` — Main repository entrypoint.
- `LICENSE` — Project license information.

## Document Map
| Guide | File | AI Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | `project-overview.md` | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | `architecture.md` | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Development Workflow | `development-workflow.md` | agent-update:development-workflow | Branching rules, CI config, contributing guide |
| Testing Strategy | `testing-strategy.md` | agent-update:testing-strategy | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | `glossary.md` | agent-update:glossary | Business terminology, user personas, domain rules |
| Data Flow & Integrations | `data-flow.md` | agent-update:data-flow | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | `security.md` | agent-update:security | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | `tooling.md` | agent-update:tooling | CLI scripts, IDE configs, automation workflows |
| UI Pattern Normalization (PLAN-NORMA-UI-002) | `ui-pattern-normalization-plan-norma-ui-002.md` | agent-update:ui-pattern-normalization | Routes inventory, pattern IDs, adoption matrix, HITL checklist |

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Gather context with `git status -sb` plus the latest commits touching `docs/` or `agents/`.
2. Compare the current directory tree against the table above; add or retire rows accordingly.
3. Update cross-links if guides moved or were renamed; keep anchor text concise.
4. Record sources consulted inside the commit or PR description for traceability.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Repository tree and `package.json` scripts for canonical command names.
- Maintainer-approved issues, RFCs, or product briefs referenced in the repo.
- Release notes or changelog entries that announce documentation changes.

<!-- agent-update:end -->
