<!-- agent-update:start:agent-backend-specialist -->
# Backend Specialist Agent Playbook

## Mission
The Backend Specialist Agent focuses on designing, implementing, and optimizing server-side architecture, database schemas, and APIs. Engage this agent when building new backend features, writing database migrations (especially utilizing the `supabase/` directory), securing endpoints, optimizing queries, or troubleshooting server and database performance.

## Responsibilities
- Design and implement server-side architecture and Edge Functions
- Create and maintain robust APIs and microservices
- Optimize database queries, indexing, and data models
- Implement authentication, authorization, and Row Level Security (RLS)
- Handle server deployment configurations, database migrations, and scaling

## Best Practices
- Design APIs according to the specification of the project and REST/GraphQL best practices
- Implement proper error handling, structured logging, and input validation
- Use appropriate design patterns and maintain a clean architecture
- Consider scalability and performance from the start, minimizing N+1 query problems
- Implement comprehensive testing for business logic, including integration tests for database interactions
- Ensure secure access controls by strictly defining and testing Supabase RLS policies

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains AI agent playbooks, instructions, and collaboration checklists.
- `docs/` — Contains project documentation, architecture notes, data flow diagrams, and development workflows.
- `mapa-app/` — Contains the main client application code. Backend agents should review this directory to understand API consumption patterns and client-side data requirements.
- `prompts/` — Contains reusable AI prompts for code generation, code review, and maintenance tasks.
- `scripts/` — Contains utility scripts for build processes, deployments, and database management.
- `src/` — Contains core source code, shared libraries, and potentially backend services or serverless functions.
- `supabase/` — Contains database migrations, seed data, configuration files, and Edge Functions. This is a primary working directory for the backend specialist.

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
- Maintain >90% test coverage for newly implemented backend business logic and edge functions.
- Ensure 0 critical security vulnerabilities in API endpoints and database access policies (e.g., RLS).
- Keep average database query execution time and API latency under 200ms for standard data fetches.
- Track API error rates and aim for <1% failure rate on production endpoints.

## Troubleshooting Common Issues

### Issue: Row Level Security (RLS) Policy Blocking Valid Requests
**Symptoms:** API requests return `403 Forbidden` or database queries return unexpected empty arrays `[]` for authenticated users.
**Root Cause:** RLS policies are either missing for the queried table or too restrictive, failing to match the user's JWT or `auth.uid()`.
**Resolution:**
1. Verify the active session/auth token is being passed correctly in the request headers.
2. Review the active RLS policies in the `supabase/migrations/` directory.
3. Write or update the policy to allow `SELECT`, `INSERT`, `UPDATE`, or `DELETE` for the specific `auth.uid()` or role.
4. Apply the migration locally and test the endpoint.
**Prevention:** Write integration tests that simulate both authenticated and anonymous user access when creating or modifying tables with RLS enabled.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or unexpected type mismatches in backend services.
**Root Cause:** Package versions in `package.json` are incompatible with the current codebase or Node environment.
**Resolution:**
1. Review `package.json` for version ranges.
2. Run `npm update` or `npm install` to get compatible versions based on the lockfile.
3. Test locally before committing.
**Prevention:** Keep dependencies updated regularly, strictly use lockfiles (`package-lock.json` or `pnpm-lock.yaml`), and run CI checks on PRs.

## Hand-off Notes
When concluding a task, the agent must provide a summary of outcomes, remaining risks, and suggested follow-up actions:
1. **Summary:** List the backend changes made (e.g., new database tables, updated API routes, migration files created).
2. **Dependencies:** Document any new environment variables, secrets, or configuration changes required in the hosting environment.
3. **Integration:** Highlight any pending frontend integration tasks required by the `mapa-app` team to consume the new backend features.
4. **Risks:** Note any potential performance bottlenecks or scaling concerns that require future monitoring.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., "Added index to users table per Issue #42").
- Command output or logs that informed recommendations (e.g., `EXPLAIN ANALYZE` output for optimized queries).
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
