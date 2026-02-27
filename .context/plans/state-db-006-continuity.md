---
id: plan-state-db-006-continuity
ai_update_goal: "Definir continuidade operacional de STATE-DB-006 apos hardening, com foco em evidencias de producao, readiness de consumo e sincronizacao de contexto."
required_inputs:
  - "Checkpoint persistir 260226-210035"
  - "Resultado da run CI 22466558072"
  - "Catalogos PAT-SYN-v1 e PAT-SYN-SOURCE-v1"
  - "Contratos READ-CORE-001, READ-CONTRACTS-003, READ-TRIGGER-005"
success_criteria:
  - "Pendencia de CI pos-hardening encerrada e registrada em checkpoint retomar."
  - "Backlog STATE-DB-006 classificado por risco e ownership."
  - "Plano com fases executaveis e evidencias obrigatorias por fase."
related_agents:
  - "architect-specialist"
  - "backend-specialist"
  - "database-specialist"
  - "devops-specialist"
  - "security-auditor"
  - "documentation-writer"
  - "code-reviewer"
---

<!-- agent-update:start:plan-state-db-006-continuity -->
# STATE-DB-006 Continuity Plan (Pos-Hardening)

> Continuidade da trilha canônica Syn apos hardening de seguranca validado em CI.

## Task Snapshot
- **Primary goal:** Consolidar STATE-DB-006 para consumo estavel entre Supabase, middleware e frontend sem regressao de seguranca.
- **Success signal:**
  - CI pos-hardening concluido (`success`) e rastreado em checkpoint `retomar`.
  - Contratos canônicos `PAT-SYN-v1` e `PAT-SYN-SOURCE-v1` mantidos sem drift.
  - Plano de execucao com entregas por camada (`mapa`, `mapa-app`, `.context`) e gate de evidencias.
- **Key references:**
  - [Syn Canonical Pattern Catalog](../docs/syn-canonical-pattern-catalog-state-db-005.md)
  - [Security Notes](../docs/security.md)
  - [Trigger Protocol](../../prompts/trigger_protocol.md)
  - [Checkpoint persistir 260226-210035](../runtime/checkpoints/260226-210035-persistir.md)

## CANON-PLAN-000 Gate (revalidacao)
1. **Inventario por camada**
   - `mapa`: pipeline/CI com guardrails de seguranca e migracoes Syn consistentes.
   - `mapa-app`: build estavel; ainda sem fase final de consumo Syn com evidencias HITL.
   - `.context`: checkpoint e docs atualizados, faltando consolidacao de proxima janela STATE-DB-006.
2. **Baseline reutilizavel vigente**
   - Contratos `PAT-SYN-v1` e `PAT-SYN-SOURCE-v1` como SSOT.
   - Hardening obrigatorio: backend-only RPC de ingestao + token no middleware + bloqueio service key no cliente.
3. **Classificacao de gaps**
   - Bloqueante: nenhum (CI e validacoes tecnicas verdes).
   - Alto impacto: ausencia de evidencias de consumo Syn ponta-a-ponta no app.
   - Incremental: observabilidade e telemetria adicional de ingestao/correlacao.
4. **Baseline publicada nesta janela**
   - `STATE-DB-006-HARDENING-BASELINE-v1`.

## Working Phases

### Phase 0 - Close Pending CI and Runtime Sync
- **Owner:** Devops Specialist
- **Deliverables:** Registro formal da conclusao da CI pos-hardening e checkpoint `retomar`.
- **Evidence Expectations:** Run `22466558072` com `status=completed` e `conclusion=success`.
- **Git Checkpoint:** Commit `chore(runtime): register retomar checkpoint after state-db-006 hardening ci`

### Phase 1 - Data Contract Conformance
- **Owner:** Database Specialist
- **Deliverables:** Verificacao de aderencia entre RPCs, migration grants e catalogos PAT-SYN.
- **Evidence Expectations:** `npm run syn:validate:post-migration` verde + revisao de grants em migration.
- **Git Checkpoint:** Commit `test(syn): validate contract conformance for state-db-006`

### Phase 2 - Consumption Readiness (mapa-app + middleware)
- **Owner:** Backend Specialist + Frontend Specialist
- **Deliverables:** Checklist de readiness para consumo Syn no frontend sem quebra de contrato.
- **Evidence Expectations:** build `mapa-app`, smoke de endpoint middleware protegido e mapeamento DTO->UI validado.
- **Git Checkpoint:** Commit `feat(syn): align middleware and app consumption contracts`

### Phase 3 - Evidence & Handoff
- **Owner:** Documentation Writer + Code Reviewer
- **Deliverables:** Contexto e checkpoints sincronizados com status final da janela.
- **Evidence Expectations:** docs atualizados sem pendencias criticas e checkpoint final versionado.
- **Git Checkpoint:** Commit `docs(state-db): sync continuity evidence for state-db-006`

## Risk Assessment
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Drift entre SSOT (`shared/syn`) e consumidores | Medium | High | Validacao de contrato em toda mudanca e bloqueio por teste/snapshot | Database Specialist |
| Regressao de seguranca em job middleware | Low | High | Manter `security:guardrails` em CI e fail-fast por token obrigatorio | Security Auditor |
| Divergencia entre plano ativo e fila de execucao | Medium | Medium | Atualizar `.context/plans/README.md` no mesmo ciclo de checkpoint | Documentation Writer |

## Evidence & Follow-up
- **Required artefacts:**
  - Log/URL da run de CI pos-hardening.
  - Checkpoint `retomar` encerrando pendencia de CI.
  - Registro de proxima acao priorizada apos fechamento do gate.
- **Follow-up actions:**
  - Priorizar Phase 1 na proxima iteracao.
  - Revalidar necessidade de HITL quando houver mudanca visual no consumo Syn.
<!-- agent-update:end -->
