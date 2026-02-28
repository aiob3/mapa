---
id: manual-csv-ingestion-runbook-state-db-006
ai_update_goal: "Padronizar execução manual de ingestão CSV (deals) com pré-checks, gates técnicos, reconciliação e contenção."
required_inputs:
  - "scripts/syn-ingest-raw-db.mjs"
  - "scripts/validate-syn-post-migration.mjs"
  - "scripts/validate-security-guardrails.mjs"
  - "src/canonical/syn-pattern-contracts.test.ts"
  - ".context/docs/eligibility-criteria-v1-state-db-006.md"
  - ".context/docs/canonical-data-norm-deals-v1-state-db-006.md"
success_criteria:
  - "Procedimento ponta-a-ponta reproduzível com comandos explícitos."
  - "Pacote mínimo de evidências definido."
  - "Regras de abort/rollback e escalonamento formalizadas."
---

<!-- agent-update:start:manual-csv-ingestion-runbook-state-db-006 -->
# Manual CSV Ingestion Runbook (STATE-DB-006)

## 1) Pré-requisitos

1. Escopo autorizado: `deals` somente.
2. Norma canônica v1 aprovada.
3. Gate rígido habilitado (`GO/NO-GO`).
4. `.env` com:
   1. `SUPABASE_PROJECT_URL`,
   2. `SUPABASE_SERVICE_ROLE_KEY`,
   3. `SUPABASE_PUBLISHABLE_KEY` (ou `SUPABASE_ANOM_PUBLIC_KEY`).
5. Arquivo CSV de entrada validado para fonte `deals`.

## 2) Checklist pré-execução

| Item | Comando/Ação | Critério OK |
| --- | --- | --- |
| Segurança de fronteira | `npm run security:guardrails` | `OK` sem regressão |
| Contrato Syn | `npm run test -- syn-pattern-contracts.test.ts` | `PASS` |
| RPCs publicados | `npm run syn:validate:post-migration` | `success=true` |
| Elegibilidade v1 | revisar doc de elegibilidade | status não pode ser `não elegível` |
| Norma v1 deals | revisar norma canônica | regras e mapeamentos aprovados |

## 3) Procedimento passo a passo (execução)

| Step | Comando | Entrada | Saída esperada |
| --- | --- | --- | --- |
| 1 | `npm run syn:ingest:raw -- --file <csv> --dry-run --min-coverage 90` | CSV de deals | JSON com `coverage_percent >= 90` |
| 2 | `npm run syn:go-no-go:v1 -- --static-only` | repo atual | valida docs/migrations/scripts críticos |
| 3 | `npm run syn:ingest:raw -- --file <csv> --min-coverage 90` | CSV validado em dry-run | JSON com `rows_rejected=0` e `errors=0` |
| 4 | `npm run syn:validate:post-migration` | estado pós-ingestão | RPCs `api_syn_*_v1` válidos |
| 5 | `npm run syn:go-no-go:v1` | estado final | relatório de gate `GO\|NO-GO` |

## 4) Reconciliação origem vs disponibilização

Após Step 3, executar reconciliação (SQL editor/cliente administrativo) e anexar saída:

```sql
with src as (
  select distinct canonical_id_v2
  from public.canonical_source_registry_v1
),
pub as (
  select distinct canonical_id_v2
  from public.canonical_events
  where status = 'active'
)
select
  (select count(*) from src) as source_ids,
  (select count(*) from pub) as published_ids,
  (select count(*) from src s join pub p using (canonical_id_v2)) as overlap_ids,
  (select count(*) from src s left join pub p using (canonical_id_v2) where p.canonical_id_v2 is null) as only_source_ids,
  (select count(*) from pub p left join src s using (canonical_id_v2) where s.canonical_id_v2 is null) as only_published_ids;
```

Regra:

1. `only_published_ids > 0` sem justificativa => `NO-GO`.
2. `only_source_ids` deve ser classificado (`esperado`/`anomalia`) antes de fechar gate.

## 5) Pacote mínimo de evidências

Obrigatório por execução:

1. JSON do dry-run.
2. JSON da ingestão efetiva.
3. Saída de `security:guardrails`.
4. Saída de `syn-pattern-contracts`.
5. Saída de `syn:validate:post-migration`.
6. Resultado da reconciliação SQL.
7. Relatório `syn:go-no-go:v1`.
8. Checkpoint runtime com `ts_sp`, `status` e `next_intent`.

## 6) Critérios de abort e contenção

Abortar imediatamente se:

1. `coverage_percent < 90` no dry-run.
2. `rows_rejected > 0` ou `errors > 0` na ingestão efetiva.
3. validações de segurança/contrato falharem.
4. reconciliação gerar anomalia sem classificação.

Contenção:

1. Classificar incidente (`operacional|processo|pipeline|workflow`).
2. Registrar causa raiz e evidência.
3. Abrir checkpoint `retomar` com status `corrigir`.
4. Bloquear nova tentativa até ação corretiva aprovada.

## 7) Incident matrix (troubleshooting)

| Erro | Causa provável | Mitigação imediata | Escalonamento |
| --- | --- | --- | --- |
| Falha em `security:guardrails` | regressão de grants/segredo no cliente | corrigir migration/config e repetir gate | Security Auditor |
| Falha em `syn:validate:post-migration` | schema cache, auth, drift de contrato | coletar `mitigation.serviceRoleDiagnostics` e corrigir camada alvo | Backend + Database |
| `coverage_percent` baixo | CSV com campos críticos ausentes | corrigir arquivo/transformações antes de carga real | Data Ops |
| `rows_rejected > 0` | quebra de regra canônica | tratar linhas, reprocessar lote e repetir dry-run | Data Engineer |
| Reconciliação inconsistente | divergence origem/publicação | classificar delta e bloquear GO até consenso | Architect + Database |

## 8) Registro operacional obrigatório

Registrar no fechamento:

1. `ts_sp`,
2. `branch` e `head_hash`,
3. lote (`ingestionBatchId`),
4. resultado final (`GO|NO-GO`),
5. owner responsável.
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Este runbook é obrigatório para carga manual inicial. Execuções fora deste fluxo são inválidas para homologação.
