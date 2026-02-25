```markdown
---
ai_update_goal: "Refresh testing strategy to reflect current Mapa App and Supabase backend testing conventions."
required_inputs: ["package.json scripts", "supabase/ tests", "mapa-app/ tests", "CI configurations"]
success_criteria: ["Test types clearly defined for frontend and backend", "Quality gates specified", "Troubleshooting steps updated for Supabase and frontend environments"]
---

<!-- agent-update:start:testing-strategy -->
# Testing Strategy

This document outlines how quality, reliability, and performance are maintained across the repository, specifically covering the `mapa-app` frontend and the `supabase` backend environments.

## Test Types

### 1. Unit Testing
- **Frontend (`mapa-app`)**: We use **Jest** alongside **React Testing Library** for component and utility testing.
  - **Naming Convention**: Test files must be colocated with the code they test and named `*.test.ts` or `*.test.tsx`.
- **Backend / Shared (`src`, `scripts`)**: Standard Jest tests for shared TypeScript business logic.
- **Supabase Edge Functions**: We use **Deno's built-in test runner** (`deno test`) for edge function logic.

### 2. Integration Testing
- **Database & RLS**: We use **pgTAP** within the `supabase/tests` directory to validate PostgreSQL Row Level Security (RLS) policies, triggers, and database functions.
- **API Integration**: Integration tests verify the interaction between the `mapa-app` services and the Supabase local emulator. 

### 3. End-to-End (E2E) Testing
- **Tooling**: We use **Playwright** for end-to-end browser testing.
- **Scope**: E2E tests cover critical user journeys (e.g., Authentication, Core Map Interactions, Data Submission). Tests are located in `mapa-app/e2e/`.

## Running Tests

### Frontend (`mapa-app`)
- **Run all unit tests**: `npm run test` (from within the `mapa-app` directory).
- **Watch mode (local development)**: `npm run test:watch`.
- **Coverage report**: `npm run test:coverage`.
- **Run E2E tests**: `npm run test:e2e` (Ensure the local dev server is running first).

### Backend (`supabase`)
- **Run database tests**: `supabase test db` (Requires the local Supabase stack to be running via `supabase start`).
- **Run edge function tests**: `supabase functions test`.

### Global Execution
- A top-level script is available to run all CI-bound tests sequentially: `npm run test:all`.

## Quality Gates

To maintain code quality, the following gates are enforced locally via Husky pre-commit hooks and remotely via our GitHub Actions CI pipeline:

- **Minimum Coverage**: We enforce a strict **80% global branch and statement coverage** threshold for the `mapa-app` frontend.
- **Linting & Formatting**: 
  - Code must pass `npm run lint` (ESLint) with zero warnings or errors.
  - Code must be formatted using Prettier (`npm run format:check`).
- **Database Migrations**: CI will fail if `supabase db lint` detects anomalous migrations or if `supabase test db` fails on the generated schema.

## Troubleshooting

### Known Flaky Areas
- **E2E Timeout Issues**: Playwright tests occasionally timeout on the CI runner due to map rendering delays. We have configured `retries: 2` in the `playwright.config.ts` for CI environments to mitigate this.
- **Supabase Local State Sync**: If database tests fail locally but pass in CI, your local Supabase instance might be out of sync. 
  - *Fix*: Run `supabase db reset` to apply a clean schema and seed data.

### Environment Quirks
- **Node Versions**: Ensure you are using the Node version specified in `.nvmrc` (v18+). Mismatched Node versions can cause Jest to fail on native bindings.
- **Deno Cache**: If Supabase edge function tests fail to resolve imports, run `deno cache` on the function's `index.ts` to refresh the module graph.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Review test scripts and CI workflows to confirm command accuracy.
2. Update Quality Gates with current thresholds (coverage %, lint rules, required checks).
3. Document new test categories or suites introduced since the last update.
4. Record known flaky areas and link to open issues for visibility.
5. Confirm troubleshooting steps remain valid with current tooling.

<!-- agent-readonly:sources -->
## Acceptable Sources
- `package.json` scripts and testing configuration files.
- CI job definitions (GitHub Actions, CircleCI, etc.).
- Issue tracker items labelled “testing” or “flaky” with maintainer confirmation.

<!-- agent-update:end -->
```
