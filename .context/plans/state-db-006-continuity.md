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
  - [Ingestion Initial Post-Mortem](../docs/state-db-006-ingestion-initial-postmortem.md)
  - [Eligibility Criteria v1](../docs/eligibility-criteria-v1-state-db-006.md)
  - [Canonical Data Norm v1 - Deals](../docs/canonical-data-norm-deals-v1-state-db-006.md)
  - [Manual CSV Ingestion Runbook](../docs/manual-csv-ingestion-runbook-state-db-006.md)
  - [GO/NO-GO Rigid Checklist](../docs/go-no-go-rigid-checklist-state-db-006.md)

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

### Phase 1.1 - Execution Blueprint (Data Contract Conformance)

- **Execution window:** Iteracao `260227-121425` (planejar).
- **Layer boundaries:**
  - `mapa`: scripts de validacao, catalogos compartilhados e testes canônicos.
  - `mapa-app`: somente leitura para verificar aderencia de consumo (`analyticsApi`/mappers), sem mudanca visual.
  - `.context`: registro de evidencias e checkpoint da fase.
- **Mandatory contracts:** `READ-CORE-001`, `READ-CONTRACTS-003`, `READ-TRIGGER-005`.

#### Step A - Preconditions and guardrails

- Confirmar `.env` com `SUPABASE_PROJECT_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_PUBLISHABLE_KEY` (ou `SUPABASE_ANOM_PUBLIC_KEY`).
- Confirmar baseline canônica ativa: `PAT-SYN-v1`, `PAT-SYN-SOURCE-v1` e migration backend-only `20260226203000_state_db_006_ingestion_rpcs_backend_only.sql`.
- Rodar guardrail de seguranca para evitar regressao de grants:

```bash
npm run security:guardrails
```

#### Step B - Contract validation gate

- Executar gate principal de conformidade pós-migration:

```bash
npm run syn:validate:post-migration
```

- Critério de sucesso do gate:
  - `success: true` no JSON final do script.
  - `semanticLayerColumn.ok = true`.
  - `authenticatedRpcValidation.ok = true` para todos RPCs em `SYN_ANALYTICS_RPCS`.
- Em falha:
  - Capturar `mitigation.serviceRoleDiagnostics`.
  - Classificar causa: `schema-cache`, `grant`, `auth`, `contract drift`.
  - Abrir correção apenas na camada afetada e repetir Step B.

#### Step C - Catalog and fixture conformance

- Validar consistencia do catalogo/fixtures e adoção de normalizadores compartilhados:

```bash
npm run test -- syn-pattern-contracts.test.ts
```

- Critério de sucesso:
  - Snapshot de `PAT-SYN` estável.
  - `rpcContracts` alinhado ao fixture e aos imports compartilhados.

#### Step D - Grant matrix review (manual + diffable)

- Revisar grants efetivos nas migrations:
  - `supabase/migrations/20260226203000_state_db_006_ingestion_rpcs_backend_only.sql`
  - `supabase/migrations/20260226190000_state_db_006_canonical_source_registry.sql`
- Regra obrigatória da fase:
  - Ingestão (`upsert_canonical_event_v2`, `upsert_canonical_source_registry_v1`) executável apenas por `service_role`.
  - Leitura de `canonical_source_registry_v1` restrita a `service_role`.

#### Step E - Evidence package and exit gate

- Evidencias minimas da fase:
  - Log JSON resumido do `syn:validate:post-migration` com timestamp.
  - Resultado do teste `syn-pattern-contracts`.
  - Registro de revisão de grants com conclusão (`conforme`/`nao conforme`).
- Exit status da fase:
  - `phase1=done` quando Steps A-E concluirem com sucesso.
  - `phase1=blocked:<motivo>` quando qualquer gate critico falhar.

#### Step F - Rollback and containment

- Se houver regressao de contrato:
  - Reverter apenas mudancas da iteração na camada responsável.
  - Manter `shared/syn` como SSOT e evitar hotfix direto em consumidor sem atualização de contrato.
  - Registrar checkpoint `retomar` com causa-raiz e próxima ação priorizada.

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

### Phase 4 - Pre-Real-Load Governance Gate

- **Owner:** Architect Specialist + Database Specialist + Devops Specialist
- **Deliverables:**
  - Pacote normativo v1 fechado para ingestão manual de `deals`.
  - Gate rígido `GO/NO-GO` executável via `npm run syn:go-no-go:v1`.
  - Critérios de elegibilidade e reconciliação origem/publicação aplicados antes de nova carga real.
- **Evidence Expectations:**
  - `state-db-006-ingestion-initial-postmortem.md` atualizado.
  - `eligibility-criteria-v1-state-db-006.md` com status por ativo.
  - `canonical-data-norm-deals-v1-state-db-006.md` aprovado.
  - `manual-csv-ingestion-runbook-state-db-006.md` aprovado.
  - `go-no-go-rigid-checklist-state-db-006.md` preenchido com decisão formal.
- **Git Checkpoint:** Commit `docs(state-db): enforce pre-real-load governance gate for state-db-006`

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
