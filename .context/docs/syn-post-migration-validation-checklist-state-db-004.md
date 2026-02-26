---
id: syn-post-migration-validation-checklist-state-db-004
ai_update_goal: "Padronizar execução única de validação pós-migration do Syn com diagnóstico e mitigação automáticos."
required_inputs:
  - "supabase/migrations/20260226113000_state_db_002_syn_analytics_api_v1.sql"
  - "supabase/migrations/20260226153000_state_db_003_semantic_layer_syn.sql"
  - "scripts/validate-syn-post-migration.mjs"
success_criteria:
  - "Migrations aplicadas no alvo com sucesso."
  - "semantic_layer validado em canonical_events."
  - "RPCs api_syn_*_v1 validadas com token authenticated."
  - "Mitigações automáticas executadas quando houver inconsistência de cache/schema."
---

<!-- agent-update:start:syn-post-migration-validation-checklist-state-db-004 -->
# Syn Post-Migration Validation Checklist (STATE-DB-004)

## Objetivo
Executar um único fluxo robusto que:

1. Verifica estado das migrations no alvo.
2. Valida presença de `semantic_layer` em `canonical_events`.
3. Valida RPCs `api_syn_*_v1` com usuário `authenticated` (não service role).
4. Roda mitigação automática de inconsistência de cache do PostgREST quando necessário.

## Pré-requisitos

1. `.env` com:
   - `SUPABASE_PROJECT_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_PUBLISHABLE_KEY` (ou `SUPABASE_ANOM_PUBLIC_KEY`)
2. Projeto Supabase linkado no diretório `supabase/`.
3. Migrations Syn presentes em `supabase/migrations/`.

## Script único (execução padrão)

```bash
npm run syn:validate:post-migration
```

## O que o script faz internamente

1. Lê `supabase migration list` para evidência de versionamento local/remoto.
2. Testa `select semantic_layer` via REST no `canonical_events`.
3. Cria usuário efêmero de validação via Admin Auth.
4. Faz login desse usuário para obter token `authenticated`.
5. Chama as RPCs:
   - `api_syn_leads_v1`
   - `api_syn_heatmap_v1`
   - `api_syn_outreach_v1`
   - `api_syn_sector_v1`
   - `api_syn_kpis_v1`
6. Se detectar `PGRST202` (schema cache miss), tenta mitigação automática:
   - RPC `pgrst_reload_schema`
   - fallback `reload_schema`
   - retries configuráveis
7. Faz diagnóstico adicional com service role quando persistir falha.
8. Remove usuário efêmero ao final.

## Resultado esperado

1. `success: true` no JSON final.
2. `semanticLayerColumn.ok: true`.
3. Todas as RPCs com `status=200` usando token `authenticated`.

## Variáveis opcionais

1. `SYN_VALIDATION_RETRIES` (default `3`)
2. `SYN_VALIDATION_RETRY_DELAY_MS` (default `2000`)
3. `SUPABASE_VALIDATION_EMAIL` / `SUPABASE_VALIDATION_PASSWORD`
   - Se não definidos, o script usa usuário efêmero.

## Gate CI (homolog)

Workflow ativo:

1. `.github/workflows/ci.yml` job `syn-post-migration-gate`
2. `environment: homolog`
3. execução obrigatória: `npm run syn:validate:post-migration`

Regras:

1. O gate é habilitado por `vars.SYN_HOMOLOG_GATE_ENABLED == 'true'`.
2. Se o script falhar, o job falha e o merge deve ser bloqueado por branch protection.
3. Segredos exigidos no ambiente homolog:
   - `SUPABASE_PROJECT_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_PUBLISHABLE_KEY`

## Falhas comuns e mitigação já coberta

1. **Schema cache desatualizado (PostgREST)**:
   - Mitigação automática com tentativa de reload + retry.
2. **Função não encontrada após deploy parcial**:
   - Diagnóstico cruzado entre `authenticated` e `service_role`.
3. **`semantic_layer` ausente**:
   - Reporta falha de migration e encerra com `exit 1`.

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Sempre executar este checklist após qualquer mudança em migrations `api_syn_*` ou em contratos de `semantic_layer`.
