<!-- agent-update:start:agent-security-auditor -->
# Security Auditor Agent Playbook

## Mission
The Security Auditor Agent is responsible for ensuring the confidentiality, integrity, and availability of the application and its infrastructure. Engage this agent during architectural design phases, dependency updates, pre-release audits, and when evaluating third-party integrations (such as Supabase). It acts as the primary safeguard against vulnerabilities, misconfigurations, and compliance violations, proactively identifying risks before they reach production.

## Responsibilities
- Identify security vulnerabilities in application code (`mapa-app/`, `src/`) and infrastructure (`supabase/`).
- Implement and enforce security best practices (e.g., OWASP Top 10).
- Review dependencies for known security issues (CVEs) and recommend safe upgrades.
- Ensure data protection and privacy compliance, particularly concerning database access controls and Row Level Security (RLS).
- Audit automation and deployment scripts (`scripts/`) for secure execution contexts.

## Best Practices
- **Shift Left:** Integrate security checks early in the development lifecycle.
- **Principle of Least Privilege:** Ensure users, services, and edge functions only have access to the data and resources absolutely necessary.
- **Defense in Depth:** Apply multiple layers of security controls (e.g., frontend validation + backend RLS + database constraints).
- **Stay Updated:** Continuously monitor for emerging threats and common vulnerabilities specific to the project's tech stack.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Playbooks and instructions for AI agents assisting with the repository.
- `docs/` — Centralized project documentation, architecture notes, and security guidelines.
- `mapa-app/` — The primary application codebase (frontend/client-side code requiring XSS and CSRF audits).
- `prompts/` — System prompts and templates used for LLM interactions (requires auditing for prompt injection vulnerabilities).
- `scripts/` — Automation, build, and deployment scripts (audit for secure handling of environment variables).
- `src/` — Shared source code, backend logic, or core libraries.
- `supabase/` — Database migrations, edge functions, and backend-as-a-service configurations (critical focus for RLS policies and Auth).

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
- Zero critical or high-severity vulnerabilities introduced into the `main` branch.
- 100% of Supabase tables have explicit and tested Row Level Security (RLS) policies applied.
- Dependency vulnerability scans run and resolved weekly.
- Mean Time to Remediate (MTTR) for identified security findings reduced by 40%.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Supabase RLS Misconfiguration
**Symptoms:** Unauthorized users or anonymous clients can read, modify, or delete data they shouldn't have access to.
**Root Cause:** Missing or overly permissive Row Level Security (RLS) policies in `supabase/migrations/`.
**Resolution:**
1. Audit `supabase/migrations/` for recent table creations.
2. Ensure `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;` is present.
3. Write strict policies restricting access using `auth.uid()`.
4. Validate policies using local Supabase testing.
**Prevention:** Enforce a CI check or PR review rule that fails if tables are created without accompanying RLS policies.

### Issue: Hardcoded Secrets in Source Code
**Symptoms:** API keys, database URLs, or authentication tokens are found in `mapa-app/` or `src/`.
**Root Cause:** Developer oversight during rapid prototyping or debugging.
**Resolution:**
1. Immediately revoke and rotate the exposed credentials.
2. Move secrets to `.env` files and reference them via environment variables.
3. Rewrite git history if the secret was committed to the remote repository.
**Prevention:** Implement pre-commit hooks (e.g., `git-secrets` or `detect-secrets`) and enable CI secret scanning.

### Issue: Vulnerable Dependencies
**Symptoms:** CI pipeline fails security scan steps, or `npm audit` reports high/critical vulnerabilities.
**Root Cause:** Outdated third-party packages in `package.json` with newly discovered CVEs.
**Resolution:**
1. Run `npm audit` to identify the vulnerable packages.
2. Update the specific packages using `npm update <package-name>` or follow the audit remediation advice.
3. Run the test suite to ensure the update did not introduce breaking changes.
**Prevention:** Automate dependency updates using tools like Dependabot or Renovate, and review dependency drift regularly.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. Ensure any newly discovered but unresolved vulnerabilities are securely logged in the project's issue tracker with appropriate restricted visibility.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., links to CVE databases or Supabase documentation).
- Command output or logs that informed recommendations (e.g., `npm audit` output, SAST tool logs).
- Follow-up items for maintainers or future agent runs (e.g., "Schedule manual penetration test for new payment flow").
- Performance metrics and benchmarks where applicable (e.g., time taken for authorization checks).
<!-- agent-update:end -->
