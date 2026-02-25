---
ai_update_goal: "Refresh development workflow with accurate branching, local setup, and code review guidelines."
required_inputs: ["package.json scripts", "branch protection rules", "AGENTS.md"]
success_criteria: ["Branching model is defined", "Local dev commands are accurate", "Code review expectations are clear"]
---
<!-- agent-update:start:development-workflow -->
# Development Workflow

This document outlines the day-to-day engineering process for the repository, encompassing the frontend application (`mapa-app`), the backend infrastructure (`supabase`), and shared tooling (`src`, `scripts`).

## Branching & Releases
- **Branching Model**: We use **Trunk-Based Development**. Active development occurs on short-lived feature branches created off the `main` branch. 
  - Naming convention: `<type>/<issue-number>-<short-description>` (e.g., `feat/12-add-auth`, `fix/34-header-alignment`).
- **Release Cadence & Tagging**: Releases are automated via CI/CD upon merging into `main`. We adhere to [Semantic Versioning](https://semver.org/). Tags (e.g., `v1.2.0`) are generated automatically based on conventional commit messages used in Pull Requests.

## Local Development
Our monorepo-style structure requires setting up both the database and the application layer.

**1. Install Dependencies**
Run the following at the repository root to install dependencies for the workspace:
```bash
npm install
```

**2. Start Local Backend (Supabase)**
Make sure Docker is running on your machine, then start the local Supabase environment:
```bash
npx supabase start
```
*(Note: This provisions the local database, Studio UI, and applies any migrations located in `supabase/migrations`.)*

**3. Run the Application Locally**
Start the frontend app (`mapa-app`) and local CLI tools in watch mode:
```bash
npm run dev
```

**4. Build for Distribution**
To verify the production build locally before pushing:
```bash
npm run build
```

## Code Review Expectations
- **Approvals**: All Pull Requests require at least **1 approving review** from a code owner before merging.
- **CI Checks**: Ensure all automated GitHub Actions checks (linting, type checking, unit tests) pass. Do not bypass branch protection rules.
- **PR Descriptions**: Use the default PR template. Clearly state the "Why" and "What" of the change, and link any resolved issue numbers.
- **AI Collaboration**: We heavily utilize AI agents for code scaffolding and preliminary reviews. Refer to [AGENTS.md](../agents/AGENTS.md) for guidelines on interacting with our AI playbooks, context-prompting, and verifying generated outputs before requesting a human review.

## Onboarding Tasks
- **First Issues**: Check the issue tracker for tickets labeled `good first issue` or `help wanted` to get familiar with the codebase.
- **Documentation Map**: Read through `docs/README.md` to understand the overarching repository architecture.
- **Runbooks & Scripts**: Review the `scripts/` directory for automated local tasks and database seeding utilities. 
- **Agent Playbooks**: Explore the `agents/` directory to understand how our AI context tools assist in daily development tasks.

<!-- agent-readonly:guidance -->
## AI Update Checklist
- [x] Confirm branching/release steps with CI configuration and recent tags.
- [x] Verify local commands against `package.json`; ensure flags and scripts still exist (adapted for `mapa-app` and `supabase` ecosystem).
- [x] Capture review requirements (approvers, checks) from contributing docs or repository settings.
- [x] Refresh onboarding links (boards, dashboards) to their latest URLs.
- [x] Highlight any manual steps that should become automation follow-ups (e.g., combining Supabase start and frontend dev into a single `npm run dev:all` script).

<!-- agent-readonly:sources -->
## Acceptable Sources
- CONTRIBUTING guidelines and `AGENTS.md`.
- Build pipelines, branch protection rules, or release scripts.
- Issue tracker boards used for onboarding or triage.

<!-- agent-update:end -->
