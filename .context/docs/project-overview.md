<!-- agent-update:start:project-overview -->
# Project Overview

Mapa is an AI-integrated, full-stack application designed to provide intelligent, context-aware features powered by custom AI agents and a robust Supabase backend. The project streamlines user workflows by combining a modern frontend (`mapa-app`) with AI-driven tooling, prompts, and automated agents, ultimately benefiting end-users who need smart, scalable, and data-backed application experiences.

## Quick Facts
- Root path: `/home/papa/mapa`
- Primary languages detected:
  - .js (31291 files)
  - .ts (25927 files)
  - .map (3356 files)
  - .mjs (1708 files)
  - .mts (1239 files)

## File Structure & Code Organization
- `agents/` — AI agent playbooks, guidelines, and behavioral instructions.
- `AGENTS.md` — High-level documentation and rules for interacting with and updating the AI agents in this repository.
- `CONTRIBUTING.md` — Guidelines, code of conduct, and instructions for developers contributing to the project.
- `docs/` — Living documentation produced and maintained by AI scaffolding tools.
- `example-documentation.ts` — Example file demonstrating documentation standards and code commenting patterns.
- `jest.config.js` — Configuration settings for the Jest testing framework.
- `LICENSE` — The open-source or proprietary license terms governing the use of this project.
- `mapa-app/` — The primary frontend application code and UI components.
- `package-lock.json` — Automatically generated dependency tree ensuring reproducible npm installs.
- `package.json` — Project metadata, npm scripts, and dependency declarations.
- `prompts/` — System prompts, templates, and context files used to instruct the AI agents.
- `README.md` — The main entry point for repository documentation and onboarding.
- `scripts/` — Utility scripts for build processes, deployments, or local development scaffolding.
- `snippets/` — Reusable code fragments, templates, or AI scaffolding snippets.
- `src/` — TypeScript source files and CLI entrypoints for backend or tooling logic.
- `supabase/` — Supabase configuration, database migrations, and edge functions.
- `tsconfig.json` — TypeScript compiler configuration and project references.

## Technology Stack Summary
- **Languages**: TypeScript (Primary), JavaScript, Node.js.
- **Backend & Database**: Supabase (PostgreSQL, Auth, Edge Functions).
- **Frontend**: Modern JS/TS web framework housed within `mapa-app`.
- **Testing**: Jest for unit and integration testing.
- **Package Management**: npm.
- **AI Integration**: Custom prompt engineering and agent playbooks.

## Core Framework Stack
- **Data & Auth Layer**: Supabase handles user authentication, row-level security (RLS), and database persistence.
- **Application Layer**: `mapa-app` serves as the client-facing application, consuming Supabase APIs and agent endpoints.
- **AI/Messaging Layer**: Agent playbooks (`agents/`) and prompts (`prompts/`) dictate the logic, formatting, and interaction models for AI-driven features.

## UI & Interaction Libraries
- **Frontend UI**: Components and design system implementations are localized within `mapa-app/`.
- **Accessibility & Theming**: Contributors must ensure new UI components in `mapa-app` adhere to standard web accessibility guidelines and support the project's theming system.
- **CLI Interaction**: Terminal-based tooling in `src/` and `scripts/` utilize standard Node.js CLI helpers for scaffolding and maintenance.

## Development Tools Overview
- **Local Environment**: npm for dependency management, TypeScript compiler (`tsc`) for type-checking, and Jest for test execution.
- **Database Tooling**: Supabase CLI is recommended for local database development, running migrations, and testing edge functions.
- For deeper setup instructions, environment variables, and editor configurations, see the [Tooling & Productivity Guide](./tooling.md).

## Getting Started Checklist
1. Install dependencies with `npm install`.
2. Ensure you have the Supabase CLI installed if you need to run the local database.
3. Explore the main application by navigating to `mapa-app/` and running the local dev server (e.g., `npm run dev`).
4. Review [Development Workflow](./development-workflow.md) for day-to-day tasks, testing guidelines, and commit standards.

## Next Steps
- **Stakeholders**: *Maintainers to confirm and document primary product owners and key stakeholders here.*
- **Product Specs**: Ensure any external Figma files, Jira boards, or product requirement documents (PRDs) are linked in the `README.md`.
- **Agent Workflows**: Review the `agents/` directory to understand how AI assistants interact with this codebase.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Review roadmap items or issues labelled “release” to confirm current goals.
2. Cross-check Quick Facts against `package.json` and environment docs.
3. Refresh the File Structure & Code Organization section to reflect new or retired modules; keep guidance actionable.
4. Link critical dashboards, specs, or runbooks used by the team.
5. Flag any details that require human confirmation (e.g., stakeholder ownership).

<!-- agent-readonly:sources -->
## Acceptable Sources
- Recent commits, release notes, or ADRs describing high-level changes.
- Product requirement documents linked from this repository.
- Confirmed statements from maintainers or product leads.

<!-- agent-update:end -->
