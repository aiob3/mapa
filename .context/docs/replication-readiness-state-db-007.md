---
id: replication-readiness-state-db-007
ai_update_goal: "Formalizar critérios bloqueantes para tornar a instância local elegível à replicação externa v1 (Hostinger VPS)."
required_inputs:
  - ".context/docs/go-no-go-rigid-checklist-state-db-006.md"
  - ".context/docs/manual-csv-ingestion-runbook-state-db-006.md"
  - "scripts/replication-preflight-v1.mjs"
  - "scripts/replication-go-no-go-v1.mjs"
success_criteria:
  - "Readiness determinística com status READY|NOT_READY."
  - "Critérios técnicos, semânticos e de segurança explícitos."
  - "Evidência mínima versionável em runtime reports/evidence."
---

<!-- agent-update:start:replication-readiness-state-db-007 -->
# Replication Readiness v1 (STATE-DB-007)

## Objetivo

Definir gate bloqueante para habilitar replicação externa v1 da base canônica (`deals-only`) para PostgreSQL 16 em Hostinger VPS.

## Escopo v1

1. Origem SoR transitória: ambiente canônico atual (Supabase/local).
2. Destino externo: Hostinger VPS.
3. Estratégia: snapshot + reconciliação.
4. Cadência: diária + on-demand.
5. Recuperação: PITR 7 dias + snapshots.

## Gates bloqueantes

| Gate | Regra | Evidência obrigatória | Status inicial |
| --- | --- | --- | --- |
| `RPL-GATE-001` | `syn:go-no-go:v1` em `GO` | `.context/runtime/reports/go-no-go-v1-*.json` | `NO-GO` |
| `RPL-GATE-002` | Migration local/remota alinhada | saída de `supabase migration list` sem pendências | `NO-GO` |
| `RPL-GATE-003` | Preflight de replicação com `readiness_status=READY` | `.context/runtime/reports/replication-v1-preflight-*.json` | `NO-GO` |
| `RPL-GATE-004` | Dataset mínimo não vazio para deals | campo `datasetCheck.deals >= 1` no preflight | `NO-GO` |
| `RPL-GATE-005` | SQL de schema alvo versionado | `infra/postgres/hostinger/20260228070000_replication_target_v1.sql` | `PASS` |
| `RPL-GATE-006` | Import idempotente validado | `.context/runtime/reports/replication-v1-import-*.json` (`mode=apply`, `success=true`) | `NO-GO` |
| `RPL-GATE-007` | Reconciliação classificada como `ok` | `.context/runtime/reports/replication-v1-reconcile-*.json` | `NO-GO` |
| `RPL-GATE-008` | `entity_kind` drift igual a zero no destino | `entity_kind_drift_count=0` | `NO-GO` |
| `RPL-GATE-009` | Pacote de evidência completo, consistente por `run_id` e sem snapshot truncado | `.context/runtime/evidence/replication-<ts>/` + reports correlacionados | `NO-GO` |

## Decisão de liberação

1. `GO` somente com 100% dos gates em `PASS`.
2. Qualquer gate em `NO-GO` mantém bloqueio de replicação externa.
3. Se anomalia não classificada em reconciliação, decisão padrão é `NO-GO`.
4. A fonte de verdade da decisão final é o relatório do comando `npm run rep:go-no-go:v1`.

## Artefatos mínimos obrigatórios

1. `replication-v1-preflight-<ts>.json`
2. `replication-v1-export-<ts>.json`
3. `replication-v1-import-<ts>.json`
4. `replication-v1-reconcile-<ts>.json`
5. `replication-v1-go-no-go-<ts>.json`
6. `snapshot.csv`
7. `manifest.json`
8. `reconciliation.json`

## Estado atual consolidado

1. Readiness inicial: `NOT_READY` até desbloqueio de migration remota pendente (`SYN-GATE-008` da trilha anterior).
2. Replicação externa não pode ser promovida enquanto `syn:go-no-go:v1` permanecer `NO-GO`.

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Sempre executar `rep:preflight:v1` antes de qualquer export/import para destino externo.
