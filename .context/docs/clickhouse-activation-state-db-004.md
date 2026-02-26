---
id: clickhouse-activation-state-db-004
ai_update_goal: "Disponibilizar instancia ClickHouse acionavel como parte arquitetural para integracao com semantic_layer (STATE-DB-003)."
required_inputs:
  - "infra/clickhouse/docker-compose.yml"
  - "infra/clickhouse/initdb/001_state_db_003_semantic_layer.sql"
  - ".env.clickhouse.example"
  - "scripts/clickhouse-health.mjs"
  - "supabase/migrations/20260226153000_state_db_003_semantic_layer_syn.sql"
success_criteria:
  - "Instancia local do ClickHouse sobe com healthcheck positivo."
  - "Schema inicial de chunks e sinais semanticos disponivel."
  - "Fluxo de integracao Supabase -> middleware -> ClickHouse documentado."
  - "Runbook de operacao inicial definido."
---

<!-- agent-update:start:clickhouse-activation-state-db-004 -->
# ClickHouse Activation Runbook (STATE-DB-004)

## Objetivo
Habilitar o ClickHouse imediatamente como camada arquitetural acionavel para:
1. Busca vetorial de contexto semantico.
2. Analitica de sinais (`causalidade`, `contraintuitivo`, `confronto relacional`, `pontos de inflexao`, `embasamento tacito`).
3. Integração operacional com `semantic_layer` do `canonical_events` (Supabase).

## 1) Provisionamento Local (agora)

### 1.1 Preparar variaveis
```bash
cp .env.clickhouse.example .env.clickhouse
set -a; source .env.clickhouse; set +a
```

### 1.2 Subir a instancia
```bash
npm run clickhouse:up
npm run clickhouse:ps
npm run clickhouse:health
npm run clickhouse:provision-user
```

### 1.3 Validar schema inicial
```bash
npm run clickhouse:sql -- "show databases"
npm run clickhouse:sql -- "show tables from mapa_semantic"
npm run clickhouse:sql -- "describe table mapa_semantic.semantic_chunks_v1"
npm run clickhouse:sql -- "describe table mapa_semantic.semantic_signals_v1"
```

## 2) Contrato Arquitetural de Dados

### 2.1 Fonte transacional (SoR)
- Supabase permanece fonte canônica de autorização e estado:
  - `public.canonical_events`
  - `public.canonical_ingestion_runs`
  - `public.api_syn_*_v1`

### 2.2 Camada semântica operacional
- `STATE-DB-003` adiciona `semantic_layer` em `canonical_events`.
- `api_syn_leads_v1` já expõe:
  - `semanticLayer`
  - `semanticSignals`

### 2.3 Camada vetorial/OLAP
- ClickHouse recebe dados derivados:
  - `mapa_semantic.semantic_chunks_v1` (texto chunkado + embedding).
  - `mapa_semantic.semantic_signals_v1` (sinais estruturados e fórmula tática).

## 3) Pipeline de Integração (acionável)

### Fase A: Export curado do Supabase
1. Middleware consulta eventos elegíveis no Supabase (com ACL já resolvida).
2. Payload mínimo por evento:
   - `canonical_id_v2`
   - `entity_kind`
   - `semantic_layer`
   - `owner_user_id`
   - `source_ref`
   - `updated_at`

### Fase B: Enriquecimento semântico
1. Gerar chunks textuais de contexto.
2. Gerar embeddings para cada chunk.
3. Persistir em `semantic_chunks_v1`.

### Fase C: Sinais executivos
1. Mapear arrays do `semantic_layer` para colunas de `semantic_signals_v1`.
2. Upsert por (`entity_kind`, `canonical_id_v2`, `source_ts`) no MergeTree de sinais.
3. Consumir visões agregadas via `semantic_signals_summary_v1`.

## 4) Consultas Operacionais de Partida

### 4.1 Contagem de sinais por tipo
```sql
select *
from mapa_semantic.semantic_signals_summary_v1
order by inflection_points desc;
```

### 4.2 Top eventos por inflexão
```sql
select
  canonical_id_v2,
  entity_kind,
  length(inflection_points) as inflections,
  executive_summary
from mapa_semantic.semantic_signals_v1
order by inflections desc, source_ts desc
limit 20;
```

### 4.3 Base para busca vetorial (semântica)
```sql
select canonical_id_v2, chunk_id, embedding_model, length(embedding) as dims
from mapa_semantic.semantic_chunks_v1
order by created_at desc
limit 20;
```

## 4.4 Comandos operacionais do middleware Syn

```bash
# ingestão incremental via CLI
npm run syn:ingest

# middleware HTTP para dashboard Syn e trigger de ingestão
npm run syn:middleware
```

Rotas:

1. `GET /health`
2. `GET /api/syn/semantic-signals-summary`
3. `POST /api/syn/jobs/ingest-semantic-layer`

## 5) Critérios de Pronto para Integração
1. `clickhouse:health` retorna sucesso.
2. Tabelas `semantic_chunks_v1` e `semantic_signals_v1` existem.
3. Middleware consegue inserir e ler de ambas com credencial dedicada.
4. ACL continua resolvida no Supabase antes de trafegar IDs para camada vetorial.

## 6) Runbook de Produção (resumo)
1. Provisionar ClickHouse gerenciado ou cluster dedicado.
2. Criar usuário de aplicação com permissões mínimas:
   - `INSERT`, `SELECT` em `mapa_semantic.*`.
3. Rotacionar senha e armazenar segredo fora de repositório.
4. Configurar monitoramento:
   - disponibilidade (`/ping`)
   - latência de query
   - volume de inserts por minuto
   - tamanho de partições.

## 7) Riscos e Guardrails
1. Não usar ClickHouse como autoridade de permissão.
2. Não escrever PII desnecessária em `metadata_json`.
3. Não acoplar frontend diretamente no ClickHouse; sempre passar pelo middleware.
4. Usar versionamento de tabela (`*_v1`, `*_v2`) para mudanças breaking.

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Se o escopo evoluir para busca vetorial em produção, padronizar dimensão de embedding e política de retenção por partição antes de abrir `v2`.
