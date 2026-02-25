---
id: plan-janela-planejar-001
ai_update_goal: "Definir as fases, owners e evidencias para executar a Janela 001 pos-validacao com foco em testes, hardening e sincronizacao documental."
required_inputs:
  - "Checkpoint de validacao canônica mais recente"
  - "Contratos READ-* e CTX/WEB aplicaveis"
  - "Backlog tecnico aberto no workspace"
success_criteria:
  - "Backlog priorizado por risco/impacto com owner e evidencia"
  - "Fases executaveis sem TODOs bloqueantes"
  - "Critério de saida com validacao tecnica + HITL quando aplicavel"
related_agents:
  - "architect-specialist"
  - "frontend-specialist"
  - "backend-specialist"
  - "test-writer"
  - "security-auditor"
  - "documentation-writer"
  - "code-reviewer"
  - "devops-specialist"
---

<!-- agent-update:start:plan-janela-planejar-001 -->
# Janela 001 - Proximas Atividades Pos-Validacao

> Janela liberada apos validacao canônica (`build`, `test`, `build:app`, `preview:app` + `HTTP 200`) com HITL confirmado pelo operador.

## Task Snapshot
- **Primary goal:** Executar a primeira onda de consolidacao pos-auth/rotas, reduzindo risco de regressao e drift documental.
- **Success signal:**
  - Suite automatizada cobrindo autenticacao, guardas de rota e estados `401/403`.
  - Documentacao de contexto/plano sem lacunas criticas para execucao.
  - Evidencias completas registradas em checkpoint canônico.
- **Key references:**
  - [Checkpoint validar 260225-051136](../runtime/checkpoints/260225-051136-validar.md)
  - [Trigger Protocol](../../prompts/trigger_protocol.md)
  - [Workspace README](../../README.md)
  - [Canon Plan 000 Validar Init](./canon-plan-000-validar-init.md)

## CANON-PLAN-000 Gate (revalidacao)
1. **Inventario por camada**
   - `mapa`: pipeline de build/test verde e CLI de scaffold/plan funcional.
   - `mapa-app`: autenticacao e paginas de status/erro entregues.
   - `.context`: ainda ha backlog de placeholders/TODOs que afetam rastreabilidade.
2. **Baseline reutilizavel vigente**
   - Auth gate + route defense como padrao minimo para rotas privadas.
3. **Classificacao de gaps**
   - Bloqueante: cobertura automatizada de auth/rotas ainda ausente.
   - Alto impacto: TODOs em plano/contexto comprometendo handoff entre agentes.
   - Incremental: warning de chunk grande no build web.
4. **Baseline publicada nesta janela**
   - `DS-BASELINE-v1` mantida, sem alteracao de direcao visual.

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Architect Specialist | Guardar consistencia entre contratos `CTX-*` e `WEB-*` | [Architect Specialist](../agents/architect-specialist.md) | Aprovar recorte tecnico da janela e limites de camada |
| Backend Specialist | Garantir alinhamento com contratos de auth/RBAC | [Backend Specialist](../agents/backend-specialist.md) | Revisar acoplamento frontend x Supabase |
| Code Reviewer | Revisar risco de regressao e qualidade final | [Code Reviewer](../agents/code-reviewer.md) | Gate final de qualidade antes de persistir |
| Devops Specialist | Assegurar repetibilidade do bundle de validacao | [Devops Specialist](../agents/devops-specialist.md) | Estabilizar comandos e evidencias de CI/local |
| Documentation Writer | Sincronizar contexto/plano com estado real | [Documentation Writer](../agents/documentation-writer.md) | Reduzir lacunas criticas em `.context/docs` e `.context/plans` |
| Frontend Specialist | Implementar testes e ajustes de rota no `mapa-app` | [Frontend Specialist](../agents/frontend-specialist.md) | Cobrir guardas e fluxos 401/403/login/logout |
| Security Auditor | Verificar exposicao indevida de rotas/modulos | [Security Auditor](../agents/security-auditor.md) | Revisao de bypass de autorizacao |
| Test Writer | Estruturar suites e cenarios de regressao | [Test Writer](../agents/test-writer.md) | Definir matriz de testes automatizados |

## Documentation Touchpoints
| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Data Flow | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | Fluxo login/sessao/rota privada |
| Plans Index | [README.md](./README.md) | plan-queue | Ordem de execucao e prioridade |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Escopo atual e topologia canônica |
| Security Notes | [security.md](../docs/security.md) | agent-update:security | Regras de auth, sessao e permissao |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | agent-update:testing-strategy | Matriz de cobertura e comandos de validacao |

## Risk Assessment
### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Regressao em guardas de rota (acesso sem sessao) | Medium | High | Cobertura automatizada para fluxos allow/deny e smoke HITL | Frontend Specialist |
| Drift documental entre `README`, plano e runtime checkpoints | Medium | Medium | Atualizacao sincronizada no fechamento de cada fase | Documentation Writer |
| Crescimento de bundle web e perda de performance percebida | Medium | Medium | Mapear split de chunk e priorizar ajustes sem quebrar rota | Devops Specialist |

### Dependencies
- **Internal:** disponibilidade do time para revisar/aceitar matriz de testes e prioridades da janela.
- **External:** ambiente Supabase acessivel para cenarios autenticados quando houver teste integrado.
- **Technical:** stack de testes definida para `mapa-app` (Vitest/Jest + RTL/e2e) e fixtures de auth controladas.

### Assumptions
- Fluxo HITL validado manualmente permanece como baseline funcional.
- Nao houve alteracoes de schema que invalidem o gate de auth entregue.
- Esta janela nao inclui mudanca de arquitetura do Design System, apenas consolidacao tecnica.

## Resource Estimation
### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 0 - Gate & Scope Freeze | 0.5 person-day | 0.5 day | 1-2 people |
| Phase 1 - Discovery & Test Matrix | 1.5 person-days | 1-2 days | 2 people |
| Phase 2 - Implementation | 3.0 person-days | 2-3 days | 2-3 people |
| Phase 3 - Validation & Handoff | 1.0 person-day | 1 day | 1-2 people |
| **Total** | **6.0 person-days** | **4-6 days** | **-** |

### Required Skills
- TypeScript/React para teste e hardening de rotas.
- Conhecimento de auth/sessao/RBAC com Supabase.
- Disciplina de documentacao canônica e checkpoints de runtime.

### Resource Availability
- **Available:** equipe de frontend, testes e documentacao no ciclo atual.
- **Blocked:** sem bloqueio tecnico imediato registrado.
- **Escalation:** maintainer responsavel pelo contrato `WEB-HITL-005` em caso de divergencia.

## Working Phases

### Phase 0 - Gate Canônico & Scope Freeze
- **Owner:** Architect Specialist
- **Deliverables:** Escopo da janela congelado e contratos revalidados.
- **Evidence Expectations:** Log de revalidação dos contratos e documentação inicial confirmando o escopo da branch atual.
- **Steps:**
  1. Revalidar contratos `READ-CORE-001`, `READ-TRIGGER-005`, `READ-CONTRACTS-003` e `READ-HITL-004`.
  2. Congelar escopo da janela focando exclusivamente em testes de auth, hardening de rotas e sincronização documental no `mapa-app`.
  3. Criar a branch base para esta janela de consolidação (ex: `janela-001-pos-validacao`).
- **Git Checkpoint:** Commit `chore: freeze scope and validate contracts for janela 001`

### Phase 1 - Discovery & Test Matrix
- **Owner:** Test Writer
- **Deliverables:** Matriz de testes de autenticação/rotas e cenários de regressão mapeados.
- **Evidence Expectations:** Arquivo `docs/testing-strategy.md` atualizado com novos cenários de cobertura.
- **Steps:**
  1. **Security Auditor:** Levantar cenários de bypass de autorização (ex: acesso direto a rotas protegidas sem token).
  2. **Test Writer:** Estruturar cenários de teste automatizados cobrindo fluxos de login, logout, 401, 403 e guardas de rota.
  3. **Documentation Writer:** Atualizar o arquivo `docs/testing-strategy.md` (via marcador `agent-update:testing-strategy`) refletindo a nova matriz.
- **Git Checkpoint:** Commit `docs: define test matrix for auth and routing scenarios`

### Phase 2 - Implementation
- **Owner:** Frontend Specialist
- **Deliverables:** Testes implementados, ajustes de rota realizados e pipeline verde.
- **Evidence Expectations:** Código coberto por testes passando localmente e sem warnings de segurança ou performance crítica.
- **Steps:**
  1. **Frontend Specialist:** Implementar a suíte de testes automatizados para os fluxos de autenticação definidos na Phase 1.
  2. **Backend Specialist:** Revisar o acoplamento das chamadas Supabase no frontend, assegurando conformidade com as políticas RBAC/RLS.
  3. **Devops Specialist:** Otimizar o bundle web (split de chunk) mitigando warnings de tamanho gerados na validação canônica.
  4. **Frontend Specialist:** Rodar a suíte localmente (`build`, `test`, `build:app`), garantindo status `HTTP 200` e zero falhas nas rotas privadas.
- **Git Checkpoint:** Commit `test: implement auth tests and route hardening in mapa-app`

### Phase 3 - Validation & Handoff
- **Owner:** Code Reviewer
- **Deliverables:** Código revisado, documentação sincronizada e checkpoint canônico criado.
- **Evidence Expectations:** Aprovação final do PR, arquivos em `docs/` atualizados (sem TODOs) e novo checkpoint registrado em `runtime/checkpoints/`.
- **Steps:**
  1. **Code Reviewer:** Executar gate final de qualidade no PR, garantindo que não há regressões e que o Baseline `DS-BASELINE-v1` foi mantido intacto.
  2. **Documentation Writer:** Sincronizar contexto atualizando `docs/data-flow.md`, `docs/project-overview.md` e `docs/security.md`, resolvendo placeholders pendentes.
  3. **Documentation Writer:** Registrar o checkpoint canônico final com as evidências desta janela e resultados dos testes.
  4. **Operator (HITL):** Confirmar validação técnica e aprovar o merge da janela.
- **Git Checkpoint:** Commit `docs: sync context and finalize janela 001 handoff`
<!-- agent-update:end -->
