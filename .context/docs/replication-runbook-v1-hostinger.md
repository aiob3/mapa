---
id: replication-runbook-v1-hostinger
ai_update_goal: "Documentar execução ponta a ponta da replicação v1 para Hostinger VPS com evidências e contenção."
required_inputs:
  - "scripts/replication-preflight-v1.mjs"
  - "scripts/replication-snapshot-export-v1.mjs"
  - "scripts/replication-import-hostinger-v1.mjs"
  - "scripts/replication-reconcile-v1.mjs"
  - "scripts/replication-go-no-go-v1.mjs"
success_criteria:
  - "Fluxo operacional executável sem decisões ad hoc."
  - "Cada etapa gera evidência rastreável."
  - "Contenção e rollback definidos para falhas."
---

<!-- agent-update:start:replication-runbook-v1-hostinger -->
# Replication Runbook v1 (Hostinger)

## Pré-requisitos

1. Ambiente com Node.js 20+, `psql` disponível no PATH.
2. Variáveis de ambiente definidas no `.env`:
   - `SUPABASE_PROJECT_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_PUBLISHABLE_KEY` (ou `SUPABASE_ANOM_PUBLIC_KEY`)
   - `REPLICA_TARGET_DB_URL` (com TLS habilitado)
3. Schema alvo aplicado no destino:
   - `infra/postgres/hostinger/20260228070000_replication_target_v1.sql`

## Fluxo obrigatório

### 1) Preflight bloqueante

```bash
npm run rep:preflight:v1
```

Critério de avanço:
1. `readiness_status=READY`.
2. Sem migration pendente entre local/remoto.
3. `syn:go-no-go:v1` em `GO`.

### 2) Export snapshot (origem)

```bash
npm run rep:snapshot:export:v1 -- --watermark-start <ISO> --watermark-end <ISO>
```

Saída esperada:
1. `.context/runtime/evidence/replication-<ts>/snapshot.csv`
2. `.context/runtime/evidence/replication-<ts>/manifest.json`
3. `.context/runtime/reports/replication-v1-export-<ts>.json`

### 3) Import no Hostinger (primeiro dry-run, depois apply)

Dry-run:

```bash
npm run rep:import:hostinger:v1 -- --snapshot <snapshot.csv> --manifest <manifest.json>
```

Apply:

```bash
npm run rep:import:hostinger:v1 -- --snapshot <snapshot.csv> --manifest <manifest.json> --apply
```

Saída esperada:
1. SQL gerado para auditoria (`replication-import-<run_id>.sql`).
2. Relatório de import (`replication-v1-import-<ts>.json`).

### 4) Reconciliação origem x destino

```bash
npm run rep:reconcile:v1 -- --snapshot <snapshot.csv> --manifest <manifest.json> --run-id <run_id>
```

Critério de avanço:
1. `classification=ok`.
2. `entity_kind_drift_count=0`.
3. `only_source_unexpected_ids=0` e `only_target_unexpected_ids=0`.

### 5) Gate final de promoção

```bash
npm run rep:go-no-go:v1 -- \
  --preflight-report <replication-v1-preflight-*.json> \
  --export-report <replication-v1-export-*.json> \
  --import-report <replication-v1-import-*.json> \
  --reconcile-report <replication-v1-reconcile-*.json>
```

Critério de promoção:
1. Status final `GO`.
2. `replication-v1-import-*.json` em `mode=apply` e `success=true`.

## Pacote de evidências

Diretório padrão:

```text
.context/runtime/evidence/replication-<ts>/
```

Mínimo obrigatório:
1. `snapshot.csv`
2. `manifest.json`
3. `reconciliation.json`
4. Relatórios em `.context/runtime/reports/replication-v1-*.json`

### Governança de evidências (obrigatório)

1. Neste projeto, `snapshot.csv` e os relatórios de replicação são tratados como **dados operacionais de auditoria não sensíveis**.
2. Os arquivos de evidência (`snapshot.csv`, `manifest.json`, `reconciliation.json` e `replication-v1-*.json`) devem ser **versionados no Git remoto** para preservar memória operacional.
3. Não mascarar payloads de evidência por padrão; a rastreabilidade integral é requisito para diagnóstico e continuidade entre sessões.
4. Segredos continuam fora dos artefatos de evidência (tokens, chaves e credenciais devem permanecer somente em `.env`/secrets manager).
5. Retenção mínima recomendada em repositório: manter histórico completo da trilha v1 até fechamento formal da fase de replicação externa.

## Contenção e rollback

Abortar execução se:
1. Preflight `NOT_READY`.
2. Hash do snapshot divergir do manifesto.
3. Reconciliação classificada como `anomalia`.

Ações de contenção:
1. Marcar run como `failed` em `public.replication_runs_v1`.
   - SQL determinístico:

```sql
update public.replication_runs_v1
set status = 'failed',
    ended_at = now(),
    metadata = coalesce(metadata, '{}'::jsonb)
      || jsonb_build_object('containment_reason', '<motivo>')
where run_id = '<run_id>';
```

2. Abrir checkpoint runtime com `status=corrigir`.
3. Restaurar snapshot/PITR no destino se houve efeito parcial.
4. Manter decisão formal em `NO-GO` até novo ciclo completo.

## Operação recorrente

1. Cadência diária automática + execução on-demand.
2. Janela de promoção para carga real externa somente após:
   - 2 ciclos consecutivos com `GO`.
   - zero anomalias não classificadas.

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Não executar `--apply` sem preflight READY e sem reconciliação pré-validada no mesmo lote.
