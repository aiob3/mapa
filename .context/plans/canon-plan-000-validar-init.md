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
| Code Reviewer | TODO: Describe why this agent is involved. | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | TODO: Describe why this agent is involved. | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | TODO: Describe why this agent is involved. | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | TODO: Describe why this agent is involved. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | TODO: Describe why this agent is involved. | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | TODO: Describe why this agent is involved. | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | TODO: Describe why this agent is involved. | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | TODO: Describe why this agent is involved. | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | TODO: Describe why this agent is involved. | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | TODO: Describe why this agent is involved. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | TODO: Describe why this agent is involved. | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | TODO: Describe why this agent is involved. | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | TODO: Describe why this agent is involved. | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | TODO: Describe why this agent is involved. | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

## Documentation Touchpoints
| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | agent-update:development-workflow | Branching rules, CI config, contributing guide |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | agent-update:testing-strategy | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | agent-update:glossary | Business terminology, user personas, domain rules |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | [security.md](../docs/security.md) | agent-update:security | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | agent-update:tooling | CLI scripts, IDE configs, automation workflows |

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

## STATE-DB-001 — Critérios de Schema (Auth + RBAC)
### Camada de autenticação
1. Supabase Auth será a fonte única de identidade.
2. `public.profiles` deve referenciar `auth.users(id)` com chave primária espelhada.
3. É proibido persistir senha ou segredo de autenticação em tabelas de domínio da aplicação.

### Camada de autorização (RBAC)
1. Criar modelo mínimo com `roles`, `permissions`, `role_permissions` e `user_roles`.
2. Permissões devem usar escopo explícito por módulo e ação (`read`, `write`, `admin`).
3. Atribuição de papel deve ser auditável (quem concedeu, quando concedeu, status ativo/inativo).

### Camada de acesso por módulo
1. Registrar módulos em tabela canônica (`mapa-syn`, `war-room`, `the-bridge`, `team-hub`, `synapse`, `the-vault`).
2. Todo acesso de leitura/escrita deve passar por policy RLS baseada em papel e módulo.
3. Usuário autenticado sem permissão explícita no módulo deve receber bloqueio (`403`) e não pode acessar rotas privadas.

### Gate obrigatório de liberação
1. Implementar integração de login frontend com Supabase como etapa mandatória.
2. Sem login validado e sessão ativa, dashboard e módulos permanecem indisponíveis.
3. Somente após validação de login + RBAC por módulo a etapa segue para handoff.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | TODO: e.g., 2 person-days | 3-5 days | 1-2 people |
| Phase 2 - Implementation | TODO: e.g., 5 person-days | 1-2 weeks | 2-3 people |
| Phase 3 - Validation | TODO: e.g., 2 person-days | 3-5 days | 1-2 people |
| **Total** | **TODO: total** | **TODO: total** | **-** |

### Required Skills
- TODO: List required expertise (e.g., "React experience", "Database optimization", "Infrastructure knowledge")
- TODO: Identify skill gaps and training needs

### Resource Availability
- **Available:** TODO: List team members and their availability
- **Blocked:** TODO: Note any team members with conflicting priorities
- **Escalation:** TODO: Name of person to contact if resources are insufficient

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. `STATE-DB-001` (primeiro item do `#planejar`): desenhar o esquema com foco em autenticação, autorização RBAC e segmentação de acesso por módulo.
2. Definir matriz papel x módulo x ação e mapear restrições de segurança esperadas para cada módulo da aplicação.
3. Consolidar matriz de decisão de banco com recomendação formal (`PostgreSQL + Supabase`) e critérios: consistência transacional, RLS, realtime, custo operacional e facilidade de evolução.
4. Classificar atividades órfãs em cinco grupos: gatilho, contrato, evidência, ownership e contexto; priorizar as bloqueantes para a fase de implementação.
5. Capturar perguntas abertas de execução (política de RLS por papel, estratégia de auditoria, naming conventions SQL, limites de realtime e retenção de logs).

**Commit Checkpoint**
- After completing this phase, capture the agreed context and create a commit (for example, `git commit -m "chore(plan): complete phase 1 discovery"`).

### Phase 2 — Implementation & Iteration
**Steps**
1. Converter `STATE-DB-001` em artefatos executáveis: migração inicial SQL com tabelas de identidade complementar, RBAC, módulos e políticas RLS.
2. Implementar integração de login no frontend com Supabase (sessão, guarda de rota, redirecionamento e estado autenticado).
3. Implementar bloqueio obrigatório de dashboard/módulos quando não autenticado ou sem permissão RBAC adequada.
4. Definir camada de acesso a dados para a `mapa-app` com contratos tipados, separação de responsabilidades e guarda de erro para chamadas ao Supabase.
5. Atualizar documentação operacional com as decisões tomadas e vínculos de contrato (`CTX-*`/`WEB-*`) impactados.

**Commit Checkpoint**
- Summarize progress, update cross-links, and create a commit documenting the outcomes of this phase (for example, `git commit -m "chore(plan): complete phase 2 implementation"`).

### Phase 3 — Validation & Handoff
**Steps**
1. Validar critérios técnicos: `npm run build`, `npm run test`, `npm run build:app`, `npm run preview:app` e resposta HTTP `200`.
2. Validar trilha de dados: conectividade Supabase (CLI/API), execução de migração e verificação de integridade de esquema.
3. Validar fluxo obrigatório de login frontend e negar acesso ao dashboard/módulos sem sessão e sem permissão.
4. Executar testes de autorização por papel/módulo (cenários `allow` e `deny`) com evidência rastreável.
5. Registrar evidências com `ts_sp`, `head_hash`, contratos impactados e resultado final (`aprovado` ou `negado` com ação corretiva).

**Commit Checkpoint**
- Record the validation evidence and create a commit signalling the handoff completion (for example, `git commit -m "chore(plan): complete phase 3 validation"`).

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Critical bugs affecting core functionality
- Performance degradation beyond acceptable thresholds
- Data integrity issues detected
- Security vulnerabilities introduced
- User-facing errors exceeding alert thresholds

### Rollback Procedures
#### Phase 1 Rollback
- Action: Discard discovery branch, restore previous documentation state
- Data Impact: None (no production changes)
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: TODO: Revert commits, restore database to pre-migration snapshot
- Data Impact: TODO: Describe any data loss or consistency concerns
- Estimated Time: TODO: e.g., 2-4 hours

#### Phase 3 Rollback
- Action: TODO: Full deployment rollback, restore previous version
- Data Impact: TODO: Document data synchronization requirements
- Estimated Time: TODO: e.g., 1-2 hours

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

<!-- agent-readonly:guidance -->
## Agent Playbook Checklist
1. Pick the agent that matches your task.
2. Enrich the template with project-specific context or links.
3. Share the final prompt with your AI assistant.
4. Capture learnings in the relevant documentation file so future runs improve.

## Evidence & Follow-up
- Artefatos obrigatórios: saída de build/test, prova de preview HTTP 200, comandos Supabase executados, diff da migração SQL, evidência de login frontend integrado e relatório de validação RBAC por módulo.
- Owners de follow-up:
  - `Database Specialist`: evolução de esquema e políticas RLS.
  - `Backend Specialist`: integração de acesso a dados, regras de autorização e tratamento de erro.
  - `Frontend Specialist`: fluxo de login, guarda de rotas e validação de acesso por módulo.
  - `Documentation Writer`: atualização de `.context/docs` e rastreabilidade da decisão.

<!-- agent-update:end -->
