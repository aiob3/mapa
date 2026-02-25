---
id: plan-canon-plan-000-validar-init
ai_update_goal: "Define the stages, owners, and evidence required to complete CANON-PLAN-000 Validação + Init."
required_inputs:
  - "Task summary or issue link describing the goal"
  - "Relevant documentation sections from docs/README.md"
  - "Matching agent playbooks from agents/README.md"
success_criteria:
  - "Stages list clear owners, deliverables, and success signals"
  - "Plan references documentation and agent resources that exist today"
  - "Follow-up actions and evidence expectations are recorded"
related_agents:
  - "code-reviewer"
  - "bug-fixer"
  - "feature-developer"
  - "refactoring-specialist"
  - "test-writer"
  - "documentation-writer"
  - "performance-optimizer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
  - "architect-specialist"
  - "devops-specialist"
  - "database-specialist"
  - "mobile-specialist"
---

<!-- agent-update:start:plan-canon-plan-000-validar-init -->
# CANON-PLAN-000 Validação + Init Plan

> Executar bundle de validação técnica e revalidar scaffold via ai-context init no repositório mapa.

## Task Snapshot
- **Primary goal:** Estabelecer o baseline de planejamento evolutivo com `STATE-DB-001` como primeira entrega, definindo esquema inicial e decisão de banco para sustentar o estado da `mapa-app`.
- **Success signal:** Plano aprovado com decisão técnica rastreável (`PostgreSQL + Supabase`), critérios de autenticação/autorização definidos, e gate obrigatório de login frontend validado antes do acesso ao dashboard e módulos.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Architect Specialist | Oversee the `STATE-DB-001` schema design and ensure the auth model aligns with the overall system architecture. | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Backend Specialist | Set up Supabase project configurations, API contracts, and edge functions if needed for auth. | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Bug Fixer | Address any integration errors between `mapa-app` and Supabase during initial connection. | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Code Reviewer | Ensure SQL migrations, frontend auth guards, and backend contracts meet quality standards. | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Database Specialist | Write the DDL for `STATE-DB-001`, implement the RBAC schema, and apply RLS policies in PostgreSQL. | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Devops Specialist | Configure CI/CD pipelines to validate Supabase migrations and handle `.env` securely. | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Documentation Writer | Update `docs/security.md` and `docs/architecture.md` with the new schema and RBAC rules. | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Feature Developer | Implement the frontend login gate and RBAC role verification logic. | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Frontend Specialist | Build the UI for the login screen and implement the React/router navigation guards. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Mobile Specialist | Ensure the authentication flow works correctly within the `mapa-app` mobile/cross-platform environment. | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |
| Performance Optimizer | Ensure the frontend route guards and Supabase session checks do not introduce rendering bottlenecks. | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Refactoring Specialist | Clean up any existing placeholder auth code in `mapa-app` to use the new Supabase integration. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Security Auditor | Validate Supabase RLS policies, RBAC matrix, and ensure no secrets are exposed in the frontend. | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Test Writer | Create unit and E2E tests for the authentication flow, route guards, and RLS policies. | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |

## Documentation Touchpoints
| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | System diagrams, integration specs, queue topics |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | agent-update:development-workflow | Branching rules, CI config, contributing guide |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | agent-update:glossary | Business terminology, user personas, domain rules |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Security & Compliance Notes | [security.md](../docs/security.md) | agent-update:security | Auth model, secrets management, compliance requirements |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | agent-update:testing-strategy | Test configs, CI gates, known flaky suites |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | agent-update:tooling | CLI scripts, IDE configs, automation workflows |
| UI Pattern Normalization | [ui-pattern-normalization-plan-norma-ui-002.md](../docs/ui-pattern-normalization-plan-norma-ui-002.md) | agent-update:ui-pattern-normalization | Routes inventory, pattern IDs, adoption matrix, HITL checklist |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Regras RBAC incompletas liberarem módulo indevido | Medium | High | Definir matriz papel-permissão por módulo e validar com testes de autorização | Database Specialist |
| Login frontend sem bloquear acesso pré-autenticação | Medium | High | Gate de rota privada obrigatório e validação E2E antes do handoff | Frontend Specialist |
| Divergência entre schema e políticas RLS | Low | High | Revisão cruzada entre migrações SQL e policies com checklist de segurança | Security Auditor |

### Dependencies
- **Internal:** Aprovação do operador para iniciar criação de esquema e migrações.
- **External:** Disponibilidade do projeto Supabase (`yyviidkkbbdocripaoma`) e credenciais válidas no `.env`.
- **Technical:** Conectividade operacional via Supabase CLI/API, certificado `.crt` opcional para clientes SQL diretos e definição do contrato de dados entre `mapa-app` e backend.

### Assumptions
- Banco remoto está vazio e dedicado ao projeto nesta etapa.
- A escolha de banco será mantida como `PostgreSQL + Supabase` salvo bloqueio técnico crítico durante validação.
- A liberação de acesso da aplicação será condicionada ao fluxo de login funcional e políticas de acesso por módulo ativas.

## Execution Stages: STATE-DB-001

### Stage 1: Database Initialization & Schema Design
- **Owners:** Database Specialist, Architect Specialist
- **Tasks:**
  1. Initialize Supabase project configuration within the `supabase/` directory.
  2. Draft the initial DDL for `STATE-DB-001` including user profiles and RBAC role tables.
  3. Define Row Level Security (RLS) policies for the newly created tables.
  4. Update `docs/architecture.md` with the schema decisions.
- **Deliverables:** SQL migration files in `supabase/migrations/` and updated architecture docs.
- **Evidence Expected:** `supabase start` runs locally without errors and migrations apply cleanly.
- **Checkpoint:** Git commit `feat(db): initialize STATE-DB-001 schema and RBAC roles`

### Stage 2: Backend Integration & Security Audit
- **Owners:** Backend Specialist, Security Auditor
- **Tasks:**
  1. Configure application environment variables (`.env`) for Supabase connectivity securely.
  2. Implement backend service connections or API contracts in `src/` to interact with Supabase.
  3. Perform a security review of the RLS policies to ensure no unauthorized data access is possible.
  4. Document the security model and auth flows in `docs/security.md`.
- **Deliverables:** Configured `.env.example`, verified API contracts, and updated security documentation.
- **Evidence Expected:** Security Auditor sign-off on RLS policies and no secrets exposed in the frontend bundle.
- **Checkpoint:** Git commit `chore(security): configure supabase client and verify RLS policies`

### Stage 3: Frontend Login Gate Implementation
- **Owners:** Frontend Specialist, Feature Developer
- **Tasks:**
  1. Build the authentication UI (Login screen) in `mapa-app`.
  2. Implement React/Router navigation guards to enforce authentication before accessing private routes.
  3. Integrate the Supabase Auth client to manage user sessions and verify RBAC roles.
  4. Remove any existing placeholder authentication logic (assisted by Refactoring Specialist).
- **Deliverables:** Functional login page, protected route wrappers, and session management logic in `mapa-app`.
- **Evidence Expected:** Unauthenticated users attempting to access the dashboard are automatically redirected to the `/login` route.
- **Checkpoint:** Git commit `feat(ui): implement frontend login gate and supabase auth integration`

### Stage 4: Testing & CI/CD Validation
- **Owners:** Test Writer, Devops Specialist
- **Tasks:**
  1. Write unit tests for the frontend route guards and session management.
  2. Write E2E tests covering the complete login flow and RBAC module access.
  3. Configure the CI/CD pipeline in `scripts/` or `.github/workflows/` to run these tests and validate Supabase migrations on PRs.
  4. Ensure `docs/testing-strategy.md` reflects the new auth testing requirements.
- **Deliverables:** Test suites in `mapa-app`, updated CI pipeline configuration.
- **Evidence Expected:** All CI pipeline checks pass, tests report green, and test coverage meets project standards.
- **Checkpoint:** Git commit `test(auth): add unit and e2e tests for auth flow and configure CI`

## Evidence & Follow-up
- **Required Artefacts:** 
  - Links to merged PRs covering the stages above.
  - Test run logs demonstrating successful auth flow and RLS enforcement.
  - Updated `docs/architecture.md` and `docs/security.md` reflecting the live state.
- **Follow-up Actions:** 
  - Human review of the UI Pattern Normalization for the new login screens.
  - Confirm production Supabase instance readiness before the next major release plan.
<!-- agent-update:end -->
