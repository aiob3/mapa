<!-- agent-update:start:glossary -->
# Glossary & Domain Concepts

This document defines project-specific terminology, acronyms, domain entities, and user personas for the Mapa App ecosystem, including its AI scaffolding and Supabase backend.

## Core Terms
- **Mapa App** — The primary client-facing application. It encompasses the user interface and core business logic, primarily located in the `mapa-app/` and `src/` directories.
- **Agent Playbook** — Markdown-based instruction sets that define the roles, workflows, and constraints of AI assistants operating within the repository. Located in the `agents/` directory.
- **Scaffolding Tool** — The AI-driven system responsible for generating, updating, and maintaining project documentation and boilerplate code (managed via `scripts/` and `prompts/`).
- **Snippet** — Reusable fragments of code, prompts, or configuration used to standardize AI and developer outputs. Stored in the `snippets/` directory.

## Acronyms & Abbreviations
- **RLS** — Row Level Security. A PostgreSQL/Supabase feature used to restrict data access at the database level based on the authenticated user's session. Managed within the `supabase/` directory.
- **ADR** — Architecture Decision Record. Documentation capturing architectural choices, context, and consequences.
- **PR** — Pull Request. The standard mechanism for proposing and reviewing code or documentation changes.

## Personas / Actors
- **End User** — Interacts with the Mapa App interface. Their primary goals include navigating the app, managing their data, and utilizing the core application features smoothly and securely.
- **Developer / Maintainer** — Human engineers who write code, review AI-generated pull requests, manage Supabase database migrations, and define agent playbooks.
- **AI Agent** — An automated, LLM-driven actor responsible for reading playbooks, executing scaffolding scripts, and keeping documentation (like this glossary) perfectly synced with the repository state.

## Domain Rules & Invariants
- **Database Security:** All direct database interactions must be secured via Supabase Row Level Security (RLS) policies. No direct table access is permitted without matching user authentication context.
- **AI Documentation Boundaries:** AI agents must strictly modify documentation within explicitly defined `<!-- agent-update:start:... -->` and `<!-- agent-update:end -->` blocks to prevent accidental overwrites of human-curated content.
- **Playbook Synchronization:** Any change to repository architecture, directory structure, or documentation must be immediately reflected in the corresponding agent playbooks in the `agents/` directory.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Harvest terminology from recent PRs, issues, and discussions.
2. Confirm definitions with product or domain experts when uncertain.
3. Link terms to relevant docs or modules for deeper context.
4. Remove or archive outdated concepts; flag unknown terms for follow-up.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Product requirement docs, RFCs, user research, or support tickets.
- Service contracts, API schemas, data dictionaries.
- Conversations with domain experts (summarize outcomes if applicable).

<!-- agent-update:end -->
