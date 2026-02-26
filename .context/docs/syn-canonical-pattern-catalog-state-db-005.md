---
id: syn-canonical-pattern-catalog-state-db-005
ai_update_goal: "Publicar catálogo versionado PAT-SYN-* com contratos canônicos reutilizáveis entre mapa-app, middleware e validação pós-migration."
required_inputs:
  - "shared/syn/pat-syn-v1.mjs"
  - "mapa-app/src/app/services/analytics/mappers.ts"
  - "mapa-app/src/app/services/analytics/analyticsApi.ts"
  - "scripts/lib/syn-semantic-runtime.mjs"
  - "scripts/validate-syn-post-migration.mjs"
success_criteria:
  - "Patterns PAT-SYN-* publicados com versão e política de evolução."
  - "Matriz pattern -> origem publicada com trilha Supabase RPC, ClickHouse summary e middleware transform."
  - "Contrato de score/status, taxonomia de sinais e lista de RPCs consolidado em SSOT único."
---

<!-- agent-update:start:syn-canonical-pattern-catalog-state-db-005 -->
# Syn Canonical Pattern Catalog (STATE-DB-005)

## 1) Versão canônica

- Versão ativa: `PAT-SYN-v1`
- Fonte única de regras: `shared/syn/pat-syn-v1.mjs`
- Escopo: contratos de DTO, score/status, taxonomia semântica, RPCs Syn e transformações middleware/app.

## 2) Catálogo PAT-SYN-* (versionado)

| Pattern ID | Categoria | Contrato canônico |
| --- | --- | --- |
| `PAT-SYN-DTO-001` | DTO | `SynLeadDto` (entrada de `api_syn_leads_v1`) |
| `PAT-SYN-DTO-002` | DTO | `SynSemanticLayerDto` normalizado (snake_case/camelCase) |
| `PAT-SYN-DTO-003` | DTO | `SynSemanticSignalsSummaryDto` (middleware -> app) |
| `PAT-SYN-STATUS-001` | Status | cor de status derivada da semântica de score |
| `PAT-SYN-SCORE-001` | Score | `score >= 80` => `Quente` + `#C64928` |
| `PAT-SYN-SCORE-002` | Score | `60 <= score < 80` => `Morno` + `#F59E0B` |
| `PAT-SYN-SCORE-003` | Score | `score < 60` => `Frio` + `#6B7280` |
| `PAT-SYN-SIGNAL-001` | Taxonomia | `causalHypotheses` |
| `PAT-SYN-SIGNAL-002` | Taxonomia | `counterintuitiveSignals` |
| `PAT-SYN-SIGNAL-003` | Taxonomia | `relationalConflicts` |
| `PAT-SYN-SIGNAL-004` | Taxonomia | `inflectionPoints` |
| `PAT-SYN-SIGNAL-005` | Taxonomia | `tacitBasis` |
| `PAT-SYN-RPC-001` | RPC Contract | lista única `api_syn_*_v1` usada por app + validador |
| `PAT-SYN-TRANSFORM-001` | Transform | conversão `snake_case -> camelCase` para summary semântico |

## 3) Contrato de score/status e score IA

| Faixa | Status | Cor |
| --- | --- | --- |
| `80..100` | `Quente` | `#C64928` |
| `60..79.9999` | `Morno` | `#F59E0B` |
| `0..59.9999` | `Frio` | `#6B7280` |

Regras adicionais:

1. `score` sempre clampado em `0..100`.
2. `scoreIA` canônico: `clamp(scoreIA || score/10, 0, 10)`.
3. `scoreColor` canônico: `>= 8` usa `#2E4C3B`; abaixo disso usa `#C64928`.

## 4) Taxonomia canônica de sinais (semantic layer)

| Pattern ID | DTO key | Storage key | Summary key | Summary column |
| --- | --- | --- | --- | --- |
| `PAT-SYN-SIGNAL-001` | `causalHypotheses` | `causal_hypotheses` | `causalitySignals` | `causality_signals` |
| `PAT-SYN-SIGNAL-002` | `counterintuitiveSignals` | `counterintuitive_signals` | `counterintuitiveSignals` | `counterintuitive_signals` |
| `PAT-SYN-SIGNAL-003` | `relationalConflicts` | `relational_conflicts` | `relationalConflicts` | `relational_conflicts` |
| `PAT-SYN-SIGNAL-004` | `inflectionPoints` | `inflection_points` | `inflectionPoints` | `inflection_points` |
| `PAT-SYN-SIGNAL-005` | `tacitBasis` | `tacit_basis` | `tacitBasisSignals` | `tacit_basis_signals` |

## 5) Contrato único de RPCs Syn

`PAT-SYN-RPC-001` define a lista obrigatória (ordem estável):

1. `api_syn_leads_v1`
2. `api_syn_heatmap_v1`
3. `api_syn_outreach_v1`
4. `api_syn_sector_v1`
5. `api_syn_kpis_v1`

## 6) Matriz Pattern -> Origem

| Pattern ID | Padrão | Origem primária | Camada |
| --- | --- | --- | --- |
| `PAT-SYN-DTO-001` | `SynLeadDto` | Supabase RPC `api_syn_leads_v1` | RPC -> App DTO |
| `PAT-SYN-DTO-002` | `SynSemanticLayerDto` | `semantic_layer` (Supabase) + normalizador compartilhado | Supabase -> Middleware/App |
| `PAT-SYN-DTO-003` | `SynSemanticSignalsSummaryDto` | ClickHouse `semantic_signals_summary_v1` via middleware | ClickHouse -> Middleware -> App |
| `PAT-SYN-STATUS-001` | `statusColor` | regra de score canônica | Mapper/Transform |
| `PAT-SYN-SCORE-001..003` | semântica de status por score | fallback da view Supabase + módulo compartilhado | Supabase + App |
| `PAT-SYN-SIGNAL-001..005` | taxonomia de sinais | `semantic_layer` + `semantic_signals_v1` + summary | Supabase + ClickHouse + App |
| `PAT-SYN-RPC-001` | lista de RPCs | `analyticsApi.ts` + `validate-syn-post-migration.mjs` | App + Gate homolog |
| `PAT-SYN-TRANSFORM-001` | summary transform | resposta middleware `snake_case` -> app `camelCase` | Middleware transform |

## 7) Pontos de consumo (implementação)

1. `shared/syn/pat-syn-v1.mjs` (SSOT de rules + IDs + contratos)
2. `mapa-app/src/app/services/analytics/mappers.ts` (normalização e status/score no app)
3. `mapa-app/src/app/services/analytics/analyticsApi.ts` (RPC names e summary mapping)
4. `scripts/lib/syn-semantic-runtime.mjs` (normalização para ingestão ClickHouse)
5. `scripts/validate-syn-post-migration.mjs` (lista de RPCs para gate de contrato)

## 8) Política de evolução

1. Mudança aditiva: incrementa catálogo mantendo `PAT-SYN-v1`.
2. Mudança breaking (renomeio/remoção de campo): abrir `PAT-SYN-v2` e versionar consumidores.
3. Todo ajuste de regra canônica exige atualização deste catálogo e dos testes de contrato.

## 9) Registro VITAL no pipeline (continuidade)

Este catálogo e o módulo `shared/syn/pat-syn-v1.mjs` estão marcados como **VITAIS** para a próxima etapa de desenvolvimento de consulta e exibição no frontend.

Guardrail obrigatório:

1. Nenhuma evolução de query/consumo do frontend Syn deve avançar sem aderência aos contratos `PAT-SYN-*`.
2. Toda mudança em `api_syn_*`, `semantic_layer` ou transform de summary deve atualizar primeiro o SSOT `PAT-SYN-v1`.
3. O gate homolog (`npm run syn:validate:post-migration`) permanece bloqueante quando habilitado em CI.

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Antes de alterar score/status, taxonomia ou lista de RPCs do Syn, atualizar primeiro o SSOT `shared/syn/pat-syn-v1.mjs` e sincronizar este catálogo.
