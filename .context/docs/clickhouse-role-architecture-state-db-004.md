---
id: clickhouse-role-architecture-state-db-004
ai_update_goal: "Formalizar o papel do ClickHouse como camada vetorial/OLAP incorporada ao Syn, com limites claros e contrato de integração com Supabase e middleware."
required_inputs:
  - "infra/clickhouse/initdb/001_state_db_003_semantic_layer.sql"
  - "scripts/lib/syn-semantic-runtime.mjs"
  - "scripts/syn-middleware.mjs"
  - "scripts/syn-ingest-semantic-layer.mjs"
  - "mapa-app/src/app/services/analytics/analyticsApi.ts"
success_criteria:
  - "Papel arquitetural do ClickHouse documentado sem ambiguidade de ownership."
  - "Limites de responsabilidade entre Supabase, middleware e ClickHouse explícitos."
  - "Contrato operacional atual do Syn registrado (ingestão + endpoint)."
---

<!-- agent-update:start:clickhouse-role-architecture-state-db-004 -->
# Papel do ClickHouse no Projeto (STATE-DB-004)

## 1) Decisão arquitetural vigente

O ClickHouse está oficialmente incorporado ao projeto como **camada de performance semântica** para o Syn, com dois objetivos operacionais:

1. Persistir sinais executivos derivados do `semantic_layer` em formato analítico.
2. Suportar recuperação vetorial/contextual por chunks sem comprometer a fonte canônica.

Ele **não substitui** o Supabase como sistema transacional de verdade.

## 2) Responsabilidades por camada

### Supabase (SoR transacional e autorização)

Responsável por:

1. Estado canônico (`public.canonical_events`).
2. Contratos de API transacional do Syn (`api_syn_*`).
3. Controle de acesso e regras de autorização/RLS.

Não responsável por:

1. Busca vetorial de alto volume.
2. Agregações analíticas de baixa latência em escala de telemetria semântica.

### Middleware Syn (orquestração)

Responsável por:

1. Ler eventos canônicos elegíveis no Supabase.
2. Normalizar e transformar `semantic_layer` em estrutura analítica.
3. Escrever no ClickHouse com checkpoint incremental.
4. Expor endpoint de consumo para o frontend Syn.

Não responsável por:

1. Ser fonte de autorização final.
2. Entregar credenciais de banco diretamente ao frontend.

### ClickHouse (vetorial + OLAP semântico)

Responsável por:

1. Armazenar chunks e embeddings (`semantic_chunks_v1`).
2. Armazenar sinais executivos (`semantic_signals_v1`).
3. Entregar resumo agregado por tipo de entidade (`semantic_signals_summary_v1`).

Não responsável por:

1. Governança de identidade de usuário.
2. Regras de permissão de negócio.
3. Escrita transacional primária da plataforma.

## 3) Contrato de dados atualmente ativo

### Entrada (Supabase -> middleware)

Campos mínimos utilizados:

1. `canonical_id_v2`
2. `event_layer`
3. `raw_payload`
4. `iam_layer`
5. `updated_at`
6. `semantic_layer` (quando disponível; com fallback quando a coluna não existe no remoto)

### Saída (middleware -> ClickHouse)

Tabelas:

1. `mapa_semantic.semantic_signals_v1`
2. `mapa_semantic.semantic_chunks_v1`

View:

1. `mapa_semantic.semantic_signals_summary_v1`

### Consumo (middleware -> Syn)

Endpoint:

1. `GET /api/syn/semantic-signals-summary`

Uso no app:

1. `mapa-app/src/app/services/analytics/analyticsApi.ts` carrega `semanticSignalsSummary` e incorpora em `sector`.
2. `mapa-app/src/app/components/syn/SectorAnalysis.tsx` exibe a lente semântica consolidada.

## 4) Fluxo operacional incorporado

1. Ingestão incremental: `npm run syn:ingest`.
2. Checkpoint persistido em `.context/runtime/checkpoints/supabase-clickhouse-semantic.json`.
3. Middleware HTTP: `npm run syn:middleware`.
4. Frontend Syn consome o middleware via `VITE_SYN_MIDDLEWARE_URL`.

Resultado: o Syn passa a ter leitura de sinais semânticos agregados sem consulta direta ao ClickHouse.

## 5) Guardrails mandatórios

1. O frontend nunca acessa ClickHouse diretamente.
2. O middleware usa credencial dedicada com mínimo privilégio (`SELECT`, `INSERT` em `mapa_semantic.*`).
3. A autorização continua derivada do Supabase antes da exposição final ao usuário.
4. Mudanças breaking no schema devem ser versionadas (`*_v2`) sem quebrar consumidores existentes.

## 6) Implicações para evolução

Com essa incorporação, o projeto ganha uma trilha clara para evolução em IA operacional:

1. Escalar busca semântica por chunk com latência previsível.
2. Evoluir scoring executivo com sinais `causalidade`, `contraintuitivo`, `confronto relacional`, `pontos de inflexão`, `embasamento tácito`.
3. Manter separação entre **verdade canônica (Supabase)** e **aceleração analítica (ClickHouse)**, evitando deriva de responsabilidade.

## 7) Comandos de referência rápida

```bash
# infraestrutura ClickHouse
npm run clickhouse:up
npm run clickhouse:health
npm run clickhouse:provision-user

# ingestão e API do middleware
npm run syn:ingest
npm run syn:middleware
```

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Sempre que houver alteração de ownership entre Supabase, middleware e ClickHouse, este documento deve ser atualizado antes de promover nova versão de contrato para o Syn.
