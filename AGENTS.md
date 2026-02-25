# Repository Guidelines

## Project Structure & Module Organization
`src/index.ts` owns the Commander CLI and now scaffolds documentation and agent playbooks without hitting any LLM endpoints. Generators live under `src/generators`, utilities (CLI helpers, file mapping, git support) stay in `src/utils`, and type contracts in `src/types.ts`. Built artefacts land in `dist/` after `npm run build`, while generated assets are saved to `./.context`. Treat `docs/README.md` as the navigation hub for documentation deliverables and `agents/README.md` as the index for agent playbooks. The canonical scaffold source of truth remains `.context/docs/README.md` and `.context/agents/README.md`.

### Workspace Topology (Canonical Names)
- `mapa/` (root) is the CLI/context-engineering project.
- `mapa-app/` is the exported Figma web application (React/Vite) used for visual/HITL validation.
- The legacy name `mapa-extracted` is deprecated in this repository and must not be reintroduced in docs, scripts, or commands.

## Canonical Iteration Governance (Mandatory)

Every relevant iteration must execute the canonical planning stop (`CANON-PLAN-000`) before implementation. This stop establishes or revalidates the reusable baseline pattern set for all active layers (`mapa`, `mapa-app`, `.context`).

Mandatory read contracts for agents and maintainers:

- `READ-CORE-001`: read `AGENTS.md` and `README.md` before planning.
- `READ-DESIGN-002`: read the Design System section in `README.md` for UI-facing changes.
- `READ-CONTRACTS-003`: read integration contracts in `README.md` for cross-layer changes.
- `READ-HITL-004`: read the HITL checklist in `README.md` for visual validation cycles.
- `READ-TRIGGER-005`: read `prompts/trigger_protocol.md` when prompt-trigger directives are present.
- `READ-SYNC-006`: read section 6 of `prompts/trigger_protocol.md` for `{{#salve}}`, `{{#crie}}`, `{{#atualize}}`, `{{#sincronize}}`.

Persistent semantic loop (must be followed):

1. Read applicable `READ-*` contracts.
2. Plan against the current canonical baseline.
3. Implement with explicit layer boundaries.
4. Validate (technical + HITL when applicable).
5. Record metrics/evidence and sync docs/contracts.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Run `npm run dev` for an interactive TypeScript session via `tsx`, and `npm run build` to emit the executable CommonJS bundle in `dist/`. Execute the suite with `npm run test`; append `-- --watch` for iterative loops. For the web app, use `npm run build:app`, `npm run dev:app`, and `npm run preview:app` from the repository root. Publish helpers (`npm run release`, `release:minor`, `release:major`) still bump the package version and push to npm—use them only from a clean main branch.

## Coding Style & Naming Conventions
The project relies on strict TypeScript; keep new files inside `src` and leave compiler checks enabled. Follow the prevailing two-space indentation, single quotes, and trailing commas for multi-line literals. Prefer named exports for modules, using PascalCase for classes, camelCase for variables and functions, and SCREAMING_SNAKE_CASE for constants. When you add scaffolding examples, cross-link them in `docs/README.md` and `agents/README.md` so contributors can discover the updates quickly.

## Testing Guidelines
Place Jest specs alongside the files they cover with the `*.test.ts` suffix. Validate CLI behaviours against the compiled binary (`dist/index.js`) to mirror how end-users invoke the tool. Run `npm run build && npm run test` before sending a PR, and include `npm run test -- --coverage` when you touch critical flows or generators.

## Documentation Markers & AI Tags
Scaffolded guides now include:
- YAML front matter describing the AI task (`id`, `ai_update_goal`, `required_inputs`, `success_criteria`).
- Update wrappers such as `<!-- agent-update:start:project-overview -->` ... `<!-- agent-update:end -->` that bound sections an agent may rewrite.
- Placeholders like `<!-- agent-fill:directory-src -->` signalling content that still needs human-provided context.
- Guard rails such as `<!-- agent-readonly:guidance -->` marking sections that should remain instructional unless a maintainer says otherwise.

When editing docs or adding new ones, preserve existing markers and introduce new ones where agents should focus future updates. Reference these markers from agent playbooks when you create specialised workflows.

### LLM-assisted Updates
- Use `ai-context fill <repo>` to apply the shared prompt (`prompts/update_scaffold_prompt.md`) across the scaffold.
- Use a small `--limit` while validating new instructions.
- Always review the generated Markdown before committing; adjust the prompt if the model misinterprets success criteria.

## Commit & Pull Request Guidelines
Stick to Conventional Commits (`feat(scaffolding): ...`, `fix(cli): ...`, `chore:`). Keep messages imperative and scope names aligned with folder structure. In pull requests, describe the user impact, link related issues, and attach sample output from the new scaffolds (`docs/README.md`, `agents/README.md`) whenever behaviour changes. Confirm CI status and call out any manual follow-up for reviewers.

## Environment & Release Tips
No API keys are required for scaffolding; remove stale tokens from local `.env` files. Ensure `dist/` reflects the latest build before publishing and double-check that `package.json`'s version matches the intended release tag. If you modify the scaffold templates, refresh `docs/README.md` and `agents/README.md` in your commit so downstream teams receive the latest references.
## AI Context References
- Documentation hub: `docs/README.md`
- Agent hub: `agents/README.md`
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`

## AI Agent Environment & Skill Management
The Copilot/agent runtime relies on per‑user data stored under the home directory. On this machine you'll find:

- `~/.codex/` – primary MCP storage; contains **skills**, sessions, rules, models cache and configuration.
- `~/.copilot/` – IDE‑specific metadata used by the VS Code extension.

Inspecting `~/.codex/skills` reveals dozens of global helpers (e.g. `doc`, `gh-fix-ci`, `playwright`, `spreadsheet`, `security-*`, etc.). These are available to any workspace unless overridden.

### Recommended setup for this repository
1. **Ensure `agent-customization` is enabled** – allows us to read/modify `<repo>/AGENTS.md`, `.copilot-instructions.md`, and create workspace‑specific skills, prompts and hooks.
2. **Install or refresh domain‑relevant skills** (if missing):
   - `typescript`, `jest`, `nodejs` (for building/testing the CLI)
   - `generator`/`scaffold` helpers (we already have some in the workspace, but a global stub can accelerate common patterns)
   - `git`/`gh` utilities for PRs and issue management

3. Periodically run `copilot skill install <name>` (or the equivalent CLI command) to fetch updates for these skills from the central registry.
4. When adding new features, consider bundling accompanying workspace skills under `./src/generators` to tailor behaviour to this project.

> **Note:** nothing in the repo must be published to activate these skills; they are managed by the global agent runtime and simply live in `~/.codex/skills`.

By following the above action plan you'll give the AI agent full visibility into our build/test tools, repository conventions, and domain-specific scaffolding – maximising its effectiveness during both execution and planning.

---
