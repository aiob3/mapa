---
ai_update_goal: "Document security policies, authentication, secrets management, and compliance for the Supabase-backed application."
required_inputs: 
  - "Supabase auth config"
  - "RLS policies"
  - "CI/CD secrets"
success_criteria: 
  - "Supabase Auth and RLS are fully documented"
  - "Secret storage locations are specified for local, CI, and production"
  - "Incident response tooling and escalation paths are listed"
---

<!-- agent-update:start:security -->
# Security & Compliance Notes

Capture the policies and guardrails that keep this project secure and compliant.

## Authentication & Authorization
- **Identity Provider:** Supabase Auth manages user identity, registration, and login flows.
- **Token Format:** JSON Web Tokens (JWT) are issued by Supabase upon successful authentication and used for secure API and database access.
- **Session Strategy:** The `mapa-app` client utilizes the Supabase SDK to manage sessions securely, leveraging secure device storage for token persistence and automatic token refresh.
- **Role/Permission Model:** Authorization is enforced at the database level using **PostgreSQL Row Level Security (RLS)**. Access control policies are strictly defined in the `supabase/migrations/` directory. By default, RLS must be enabled on all public tables, restricting users to only access and mutate their own data.

## Secrets & Sensitive Data
- **Local Development:** Environment variables are stored in `.env` files. These files are excluded via `.gitignore` and must never be committed to the repository.
- **CI/CD Pipeline:** Deployment keys, Supabase access tokens, and other pipeline secrets are securely stored in GitHub Actions Secrets.
- **Production Storage:** 
  - Application secrets and API keys for backend logic are stored in **Supabase Environment Variables**.
  - Highly sensitive keys or tokens required by the database are managed using **Supabase Vault**.
- **Data Classification:** User profiles, authentication data, and location-based data (implied by `mapa-app`) are classified as Personally Identifiable Information (PII) and are encrypted at rest by the Supabase infrastructure.

## Compliance & Policies
- **Infrastructure Standard:** The project relies on Supabase's managed infrastructure, which maintains SOC2 Type II compliance and provides underlying encryption in transit (TLS) and at rest (AES-256).
- **GDPR & Privacy:** 
  - The application supports user data deletion requests. Deleting a user from the Supabase Auth system triggers a cascading delete of their associated PII in the database.
  - Data residency is bound to the specific AWS region where the Supabase project is deployed.
- **Code Policies:** Secrets scanning is enforced. Hardcoded secrets in the `src/` or `mapa-app/` directories will cause CI pipeline failures. 

## Incident Response
- **Detection & Triage:** 
  - Database and authentication anomalies are monitored via the **Supabase Dashboard Logs**.
  - Frontend exceptions in `mapa-app` are tracked using application monitoring tools (e.g., Sentry or standard crashlytics).
- **Escalation Steps:** Security vulnerabilities must be reported privately to the core maintainers via GitHub Security Advisories. Public issues should not be opened for unresolved exploits.
- **Post-Incident Analysis:** Following any security breach or critical downtime, a post-mortem document must be generated and stored in the `docs/` repository to outline root causes, impact scope, and preventative architectural changes.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Confirm security libraries and infrastructure match current deployments.
2. Update secrets management details when storage or naming changes.
3. Reflect new compliance obligations or audit findings.
4. Ensure incident response procedures include current contacts and tooling.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Security architecture docs, runbooks, policy handbooks.
- IAM/authorization configuration (code or infrastructure).
- Compliance updates from security or legal teams.

<!-- agent-update:end -->
