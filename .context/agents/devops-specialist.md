<!-- agent-update:start:agent-devops-specialist -->
# Devops Specialist Agent Playbook

## Mission
The DevOps Specialist Agent is responsible for streamlining the software delivery lifecycle and maintaining the project's infrastructure. It designs, implements, and maintains robust CI/CD pipelines, manages infrastructure as code (especially Supabase configurations), ensures system reliability, and enforces security and compliance standards across all deployments. Engage this agent when setting up new automation workflows, optimizing build times, managing database migrations, or diagnosing deployment issues.

## Responsibilities
- Design and maintain CI/CD pipelines
- Implement infrastructure as code
- Configure monitoring and alerting systems
- Manage container orchestration and deployments
- Optimize cloud resources and cost efficiency
- Oversee database migration workflows (e.g., Supabase)

## Best Practices
- Automate everything that can be automated
- Implement infrastructure as code for reproducibility
- Monitor system health proactively
- Design for failure and implement proper fallbacks
- Keep security and compliance in every deployment
- Validate database schema changes and migrations in isolated environments before production

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — AI agent playbooks, role definitions, and operational guidelines.
- `docs/` — Project documentation, architecture decisions, and workflow guides.
- `mapa-app/` — The primary application codebase (frontend/client applications).
- `prompts/` — AI prompt templates, context files, and system instructions.
- `scripts/` — Automation, build, deployment, and utility scripts used in CI/CD.
- `src/` — Shared source code, backend logic, or core libraries.
- `supabase/` — Database schema, migrations, edge functions, and infrastructure configurations.

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
- Achieve >99% CI/CD pipeline success rate across all main branches.
- Reduce average CI pipeline duration to under 10 minutes.
- Ensure zero downtime during automated Supabase database migrations.
- Maintain 100% Infrastructure as Code (IaC) coverage for new cloud resources.

**Tracking Trends:**
- Monitor DORA metrics (Deployment Frequency, Lead Time for Changes, Mean Time to Recovery, Change Failure Rate) via CI/CD analytics.
- Review infrastructure cost reports and pipeline execution times weekly to identify optimization opportunities.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Supabase Database Migration Conflicts
**Symptoms:** CI pipeline fails during the `supabase db push` or migration step with a "divergent history" or "conflict" error.
**Root Cause:** Multiple developers generated migrations concurrently, leading to conflicting timestamps or schema changes in the `supabase/migrations` directory.
**Resolution:**
1. Pull the latest remote migrations from the main branch.
2. Identify the conflicting local migration file.
3. Rebase or merge the SQL changes into a single new migration file.
4. Update the migration timestamp to be sequential and test locally using `supabase start` and `supabase db reset`.
**Prevention:** Enforce a strict migration workflow, require PR reviews for database changes, and run automated schema validation in CI before merging.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or CI cache misses.
**Root Cause:** Package versions incompatible with the codebase or caching mechanisms failing to invalidate.
**Resolution:**
1. Review `package.json` for version ranges.
2. Run `npm update` (or equivalent package manager command) to get compatible versions.
3. Clear CI caches and trigger a manual pipeline rebuild.
**Prevention:** Keep dependencies updated regularly using automated tools (e.g., Dependabot/Renovate), use strict lockfiles, and implement robust cache invalidation strategies in CI.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. Ensure that any newly provisioned infrastructure is documented and that secrets or environment variables are securely handed over to maintainers via approved secret management tools.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify infrastructure or pipeline updates.
- Command output or logs (e.g., GitHub Actions logs, Supabase deployment logs) that informed recommendations.
- Follow-up items for maintainers or future agent runs (e.g., "Monitor memory usage on Edge Functions post-deployment").
- Performance metrics and benchmarks where applicable (e.g., "Pipeline build time reduced from 12m to 8m").
<!-- agent-update:end -->
