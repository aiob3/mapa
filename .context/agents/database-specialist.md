```markdown
<!-- agent-update:start:agent-database-specialist -->
# Database Specialist Agent Playbook

## Mission
The Database Specialist Agent is responsible for managing the data layer, specifically focusing on PostgreSQL schema design, Supabase configuration, migrations, Row Level Security (RLS), and performance optimization. Engage this agent when introducing new data models, modifying existing schemas, writing complex queries, configuring security policies, or troubleshooting database performance bottlenecks.

## Responsibilities
- Design, normalize, and optimize PostgreSQL database schemas.
- Create, sequence, and manage database migrations (specifically Supabase migrations).
- Optimize query performance, analyze `EXPLAIN` plans, and implement indexing strategies.
- Ensure data integrity, referential consistency, and robust constraint enforcement.
- Implement backup, recovery strategies, and data seeding scripts.
- Design and audit Row Level Security (RLS) policies to ensure data privacy and security.

## Best Practices
- Always benchmark complex queries before and after optimization using `EXPLAIN ANALYZE`.
- Plan migrations with safe, backward-compatible steps and clear rollback strategies.
- Use appropriate indexing strategies (e.g., B-tree, GIN for JSONB) tailored to actual read/write workloads.
- Maintain data consistency across transactions and avoid long-running locks.
- Document schema changes, their business impact, and update the Data Flow documentation.
- Never bypass RLS in the client application; always enforce authorization at the database level.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains AI agent playbooks, roles, and instructions (including this one).
- `docs/` — Project documentation, architecture diagrams, data flow guides, and schema references.
- `mapa-app/` — Frontend application code containing client-side database queries and Supabase integrations.
- `prompts/` — System prompts and templates used to orchestrate AI workflows.
- `scripts/` — Utility scripts for database seeding, local environment setup, and CI/CD operations.
- `src/` — Backend services or shared logic that interacts with the database.
- `supabase/` — Core directory for this agent. Contains PostgreSQL migrations (`supabase/migrations`), seed data (`supabase/seed.sql`), configuration (`config.toml`), and Edge Functions.

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
1. Confirm assumptions with issue reporters or maintainers (e.g., expected data volume, read/write ratios).
2. Review open pull requests affecting the database schema or Supabase configuration.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.
5. Verify local tests and migrations run successfully (`supabase start`, `supabase db reset`) before requesting a review.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- **Zero broken migrations** deployed to production environments.
- **100% coverage** of Row Level Security (RLS) policies on all public-facing tables.
- **Query Performance:** Maintain execution times below 50ms for 95th percentile (P95) reads.
- **Security:** Zero critical data exposure vulnerabilities reported in audits.

## Troubleshooting Common Issues

### Issue: Supabase Migration Conflicts
**Symptoms:** `supabase db push` or local `supabase start` fails with "migration history diverges" or duplicate timestamp errors.
**Root Cause:** Multiple developers created migrations concurrently, or remote schema changes were made directly via the Supabase Dashboard without syncing to local files.
**Resolution:**
1. Identify the conflicting local migration file in `supabase/migrations/`.
2. Run `supabase db pull` to fetch remote changes if the dashboard was modified.
3. Rename the local migration file to a newer timestamp.
4. Run `supabase db reset` to verify the new migration sequence applies cleanly.
**Prevention:** Coordinate schema changes, strictly avoid direct dashboard edits in production/staging, and always pull remote changes before creating new local migrations.

### Issue: RLS Policy Denying Valid Requests
**Symptoms:** Frontend queries return empty arrays `[]` or `403 Forbidden`/`401 Unauthorized` errors despite data existing in the database.
**Root Cause:** Row Level Security (RLS) is enabled but the policy is missing, misconfigured, or fails to correctly evaluate the `auth.uid()` or JWT claims.
**Resolution:**
1. Temporarily test the query using the service role key to confirm the data exists and the query structure is valid.
2. Review the RLS policy definition for the target table.
3. Verify that the client is passing the correct authentication headers.
4. Update the policy via a new migration to accurately reflect the required access rules.
**Prevention:** Always write `pgTAP` database tests for new RLS policies to verify both permitted and denied access scenarios.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. Ensure any new environment variables required by database extensions or edge functions are documented. Note if any long-running migrations require downtime planning.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify schema updates.
- `EXPLAIN ANALYZE` output or Supabase Dashboard query logs that informed index recommendations.
- Follow-up items for maintainers or future agent runs (e.g., "Monitor index usage after 1 week").
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
```
