<!-- agent-update:start:tooling -->
# Tooling & Productivity Guide

Collect the scripts, automation, and editor settings that keep contributors efficient.

## Required Tooling
- **Node.js (v18+ LTS)** — Required for running the frontend (`mapa-app`) and executing build scripts in `src`. Install via [nvm](https://github.com/nvm-sh/nvm) or your preferred version manager.
- **Package Manager (npm/pnpm/yarn)** — Check the lockfile in `mapa-app` or the project root to ensure you are using the correct package manager for dependency installation.
- **Supabase CLI** — Essential for local backend development, managing database migrations, and edge functions within the `supabase/` directory. Install via Homebrew (`brew install supabase/tap/supabase`) or npm (`npm install -g supabase`).
- **Docker (Desktop or OrbStack)** — Required by the Supabase CLI to run the local database and authentication emulators.

## Recommended Automation
- **Custom Scripts (`/scripts`)**: Repository-specific automation, build steps, and scaffolding utilities are located in the `scripts/` directory.
- **AI Agent Workflows (`/agents` & `/prompts`)**: Leverage our AI context scaffolding. Use the playbooks in `agents/` and templates in `prompts/` to automate documentation updates, code scaffolding, and routine repository maintenance.
- **Linting & Formatting**: Standard `lint` and `format` commands are available in the `package.json`. It is highly recommended to configure your editor to run these automatically on save.

## IDE / Editor Setup
We recommend **Visual Studio Code (VS Code)** for the best out-of-the-box experience.

- **Workspace Snippets**: Take advantage of the shared team snippets located in the `snippets/` directory to speed up boilerplate generation.
- **Recommended Extensions**:
  - *ESLint & Prettier*: For real-time code formatting and linting.
  - *Tailwind CSS IntelliSense*: (If applicable) for rapid UI styling in `mapa-app`.
  - *Supabase*: For syntax highlighting and autocomplete in Postgres SQL files.

## Productivity Tips
- **Local Emulation**: Run `supabase start` in the root (or wherever your `supabase/` folder is initialized) to spin up a complete local instance of the backend, including the database, Auth, Storage, and Edge Functions.
- **Database Resets**: Use `supabase db reset` to quickly wipe your local database and re-apply all migrations and seed data when testing destructive changes.
- **AI-Assisted Development**: Familiarize yourself with the `agents/` directory. These playbooks are designed to help you generate PR descriptions, update documentation, and scaffold new features with high context accuracy.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Verify commands align with the latest scripts and build tooling.
2. Remove instructions for deprecated tools and add replacements.
3. Highlight automation that saves time during reviews or releases.
4. Cross-link to runbooks or README sections that provide deeper context.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Onboarding docs, internal wikis, and team retrospectives.
- Script directories, package manifests, CI configuration.
- Maintainer recommendations gathered during pairing or code reviews.

<!-- agent-update:end -->
