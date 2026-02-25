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
| Frontend Specialist | Implementar testes e ajustes de rota no `mapa-app` | [Frontend Specialist](../agents/frontend-specialist.md) | Cobrir guardas e fluxos 401/403/login/logout |
| Backend Specialist | Garantir alinhamento com contratos de auth/RBAC | [Backend Specialist](../agents/backend-specialist.md) | Revisar acoplamento frontend x Supabase |
| Test Writer | Estruturar suites e cenarios de regressao | [Test Writer](../agents/test-writer.md) | Definir matriz de testes automatizados |
| Security Auditor | Verificar exposicao indevida de rotas/modulos | [Security Auditor](../agents/security-auditor.md) | Revisao de bypass de autorizacao |
| Documentation Writer | Sincronizar contexto/plano com estado real | [Documentation Writer](../agents/documentation-writer.md) | Reduzir lacunas criticas em `.context/docs` e `.context/plans` |
| Code Reviewer | Revisar risco de regressao e qualidade final | [Code Reviewer](../agents/code-reviewer.md) | Gate final de qualidade antes de persistir |
| Devops Specialist | Assegurar repetibilidade do bundle de validacao | [Devops Specialist](../agents/devops-specialist.md) | Estabilizar comandos e evidencias de CI/local |

## Documentation Touchpoints
| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Plans Index | [README.md](./README.md) | plan-queue | Ordem de execucao e prioridade |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Escopo atual e topologia canônica |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | agent-update:testing-strategy | Matriz de cobertura e comandos de validacao |
| Security Notes | [security.md](../docs/security.md) | agent-update:security | Regras de auth, sessao e permissao |
| Data Flow | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | Fluxo login/sessao/rota privada |

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
### Phase 0 - Gate Canônico
**Steps**
1. Revalidar `READ-CORE-001`, `READ-TRIGGER-005`, `READ-CONTRACTS-003` e `READ-HITL-004`.
2. Congelar escopo da janela: testes auth/rotas + sincronizacao documental critica.

**Commit Checkpoint**
- `chore(plan): freeze janela-001 scope and gate`

### Phase 1 - Discovery & Alignment
**Steps**
1. Definir matriz de cenarios: login valido, sem sessao, sessao expirada, sem permissao, rota invalida.
2. Mapear arquivos-alvo e lacunas de teste no `mapa-app`.
3. Priorizar placeholders/TODOs criticos para handoff na documentacao `.context`.

**Commit Checkpoint**
- `chore(plan): complete janela-001 discovery`

### Phase 2 - Implementation & Iteration
**Steps**
1. Implementar suites automatizadas para fluxos de auth/route defense.
2. Corrigir falhas detectadas e manter contratos `WEB-*` intactos.
3. Atualizar docs/plans com o estado real removendo lacunas bloqueantes.

**Commit Checkpoint**
- `feat(testing): add auth-route regression coverage`

### Phase 3 - Validation & Handoff
**Steps**
1. Executar bundle de validacao canônica: `npm run build`, `npm run test`, `npm run build:app`, `npm run preview:app` e `HTTP 200`.
2. Registrar evidencias (hash, branch, ts_sp, logs e resultado HITL quando aplicavel).
3. Fechar checkpoint runtime com `next_intent` decidido (`persistir` ou novo `planejar`).

**Commit Checkpoint**
- `chore(validation): close janela-001 with canonical evidence`

## Rollback Plan
### Rollback Triggers
- Falha de regressao em autenticao/roteamento apos merge da janela.
- Quebra de build/test no root ou no `mapa-app`.
- Divergencia de contrato que afete gate de acesso.

### Rollback Procedures
#### Phase 0/1 Rollback
- **Action:** Reverter commits de escopo/descoberta e restaurar plano anterior.
- **Data Impact:** Nenhum.
- **Estimated Time:** < 1 hora.

#### Phase 2 Rollback
- **Action:** Reverter commits de implementacao de testes/hardening que causarem regressao.
- **Data Impact:** Baixo (codigo apenas).
- **Estimated Time:** 1-2 horas.

#### Phase 3 Rollback
- **Action:** Restaurar estado anterior a validacao e rerodar bundle para confirmar estabilizacao.
- **Data Impact:** Nenhum em dados de producao nesta janela.
- **Estimated Time:** 1 hora.

### Post-Rollback Actions
1. Registrar causa raiz no plano e no checkpoint runtime.
2. Atualizar matriz de risco com nova mitigacao.
3. Replanejar fase afetada antes de nova tentativa.

<!-- agent-readonly:guidance -->
## Agent Playbook Checklist
1. Pick the agent that matches your task.
2. Enrich the template with project-specific context or links.
3. Share the final prompt with your AI assistant.
4. Capture learnings in the relevant documentation file so future runs improve.

## Evidence & Follow-up
- Logs dos comandos canônicos de validação.
- Lista de arquivos de teste adicionados/atualizados.
- Evidência de revisão de segurança para rotas privadas.
- Link para checkpoint runtime da janela.

<!-- agent-update:end -->
