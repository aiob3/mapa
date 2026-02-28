---
id: replication-reconciliation-contract-v1
ai_update_goal: "Definir contrato canônico de reconciliação para replicação v1 deals-only (origem vs Hostinger)."
required_inputs:
  - "scripts/replication-snapshot-export-v1.mjs"
  - "scripts/replication-reconcile-v1.mjs"
  - "infra/postgres/hostinger/20260228070000_replication_target_v1.sql"
success_criteria:
  - "Métricas e classificação determinísticas."
  - "Critérios de bloqueio explícitos para GO/NO-GO."
  - "Contrato reutilizável por operação e auditoria."
---

<!-- agent-update:start:replication-reconciliation-contract-v1 -->
# Replication Reconciliation Contract v1

## Escopo

1. Entidade: `deal`.
2. Origem: snapshot exportado do canônico (`snapshot.csv`).
3. Destino: `replica_live.canonical_events_deals_v1`.

## Chaves canônicas obrigatórias

1. `canonical_id_v2`
2. `source_id`
3. `canonical_subject_id`
4. `idempotency_key`
5. `entity_kind='deal'`

## Métricas de reconciliação

1. `source_ids`: quantidade de IDs únicos no snapshot.
2. `target_ids`: quantidade de IDs únicos no destino.
3. `overlap_ids`: interseção origem/destino.
4. `only_source_ids`: IDs apenas na origem.
5. `only_target_ids`: IDs apenas no destino.
6. `entity_kind_drift_count`: linhas no destino com `entity_kind != 'deal'`.
7. `idempotency_mismatch_count`: IDs em overlap com `idempotency_key` divergente entre origem e destino.
8. `status_mismatch_count`: IDs em overlap com `status` divergente entre origem e destino.

## Classificação

`ok` quando todas as condições abaixo forem verdadeiras:
1. `entity_kind_drift_count = 0`
2. `only_source_unexpected_ids = []`
3. `only_target_unexpected_ids = []`
4. `idempotency_mismatch_count = 0`

`anomalia` caso contrário.

## Regras de whitelist

1. IDs aceitos excepcionalmente devem ser declarados em `REPLICATION_RECONCILIATION_WHITELIST`.
2. A whitelist é temporária e deve conter justificativa em checkpoint/runtime.
3. Sem whitelist explícita, todo delta é tratado como anomalia.

## Bloqueios automáticos (NO-GO)

1. `classification = anomalia`
2. `entity_kind_drift_count > 0`
3. Divergência de hash snapshot/manifest.
4. `idempotency_mismatch_count > 0`
5. `only_source_ids > 0` ou `only_target_ids > 0` sem whitelist válida.

## Saída de contrato (JSON)

Arquivo padrão:

```text
.context/runtime/reports/replication-v1-reconcile-<ts>.json
```

Campos mínimos:
1. `ts_sp`
2. `run_id`
3. `source_ids`
4. `target_ids`
5. `overlap_ids`
6. `only_source_ids`
7. `only_target_ids`
8. `entity_kind_drift_count`
9. `idempotency_mismatch_count`
10. `status_mismatch_count`
11. `classification`
12. `only_source_unexpected_ids`
13. `only_target_unexpected_ids`

## SLO operacional v1

1. Reconciliação com classificação `ok` em 100% dos lotes promovidos.
2. Tempo máximo de classificação por lote: 15 minutos.
3. Nenhuma promoção com divergência não classificada.

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Toda alteração de métrica/classificação exige atualização simultânea dos scripts de reconciliação e do gate final.
