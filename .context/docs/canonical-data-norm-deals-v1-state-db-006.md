---
id: canonical-data-norm-deals-v1-state-db-006
ai_update_goal: "Congelar norma canônica v1 para ingestão manual de deals com regras de origem, derivação, qualidade e segurança."
required_inputs:
  - "scripts/syn-ingest-raw-db.mjs"
  - "shared/syn/pat-syn-v1.mjs"
  - "shared/syn/pat-syn-source-v1.mjs"
  - "supabase/migrations/20260225023531_state_db_001_auth_rbac_canonical.sql"
  - "supabase/migrations/20260226190000_state_db_006_canonical_source_registry.sql"
  - "supabase/migrations/20260226203000_state_db_006_ingestion_rpcs_backend_only.sql"
success_criteria:
  - "Contrato canônico v1 para deals definido com campos obrigatórios e regras determinísticas."
  - "Mapeamento fonte->canônico publicado."
  - "SLOs de qualidade e invariantes de segurança definidos."
---

<!-- agent-update:start:canonical-data-norm-deals-v1-state-db-006 -->
# Canonical Data Norm v1 - Deals (STATE-DB-006)

## 1) Objetivo e não-objetivos

Objetivo:

1. Definir o padrão obrigatório para ingestão manual de `deals` no ciclo inicial.
2. Garantir rastreabilidade de origem, idempotência, compatibilidade de publicação e segurança por role.

Não-objetivos:

1. Cobrir `leads` e `activities` nesta versão.
2. Introduzir breaking change em `api_syn_*_v1`.

## 2) Modelo canônico v1 (deals)

Unidade canônica:

1. Um `deal` da fonte gera evento canônico identificado por `canonical_id_v2`.
2. A trilha de origem obrigatória é representada por:
   1. `event_layer.source_contract`,
   2. `raw_payload.source_contract`,
   3. `canonical_source_registry_v1`.

## 3) Dicionário canônico mínimo (obrigatório)

| Campo canônico | Tipo | Obrigatório | Default | Domínio | Descrição |
| --- | --- | --- | --- | --- | --- |
| `canonical_id_v2` | text | sim | derivado | `cv2_src_*` | ID canônico por origem |
| `idempotency_key` | text | sim | derivado | md5 | chave de idempotência |
| `event_layer.entity_kind` | text | sim | `deal` | `deal` | tipo da entidade na v1 |
| `event_layer.canonical_subject_id` | text | sim | derivado | `csv1_*` | sujeito canônico da origem |
| `event_layer.source_ref` | text | sim | derivado | `<source_system>:<source_entity>:<source_id>` | referência curta de origem |
| `event_layer.source_contract` | jsonb | sim | derivado | `PAT-SYN-SOURCE-v1` | contrato de origem |
| `raw_payload.source_contract` | jsonb | sim | derivado | `PAT-SYN-SOURCE-v1` | redundância rastreável |
| `iam_layer.owner_user_id` | text | sim | `unknown` | uuid/string | owner para ACL |
| `event_layer.score` | integer | sim | derivado | `0..100` | score normalizado |
| `event_layer.status` | text | sim | derivado | `Quente\|Morno\|Frio` | status por score |
| `event_layer.status_color` | text | sim | derivado | hex | cor por score |

## 4) Mapeamento fonte -> canônico (deals)

| Fonte (CSV deals) | Campo canônico | Transformação | Fallback | Validação |
| --- | --- | --- | --- | --- |
| `Negócio - ID` | `source_id` | trim string | rejeitar linha | obrigatório |
| `Negócio - Título`/`Pessoa - Nome` | `event_layer.lead_name` | `pickValue` | `Lead <source_id>` | string não vazia |
| `Negócio - Organização` | `event_layer.company` | trim | `Conta sem nome` | string |
| `Negócio - Segmento`/`Organização - Setor` | `event_layer.sector` | trim | `Geral` | string |
| `Organização - Região/Estado` | `event_layer.region` | trim | `Sem região` | string |
| cidade+estado | `event_layer.location` | composição | `N/A` | string |
| `Negócio - Valor` | `event_layer.deal_value` | parse numérico | `0` | >= 0 |
| `Negócio - Probabilidade` + metadados | `event_layer.score` | regra derivada + clamp | `0` | `0..100` |
| score derivado | `event_layer.status/status_color` | bandas `PAT-SYN-SCORE-*` | `Frio/#6B7280` | coerência score/status |
| origem/oportunidade | `event_layer.tone/tone_color` | normalização de tom | `ANALÍTICO/#4A6FA5` | enum controlada |
| datas de atualização | `source_updated_at` | parse ISO | null | formato válido |

## 5) Regras de chave e idempotência (v1)

1. `canonical_subject_id`:
   1. `csv1_${md5(source_system + ':' + subject_key_normalized)}`.
2. `idempotency_key`:
   1. `md5(source_system + ':' + source_entity + ':' + source_id + ':' + payload_hash)`.
3. `canonical_id_v2`:
   1. `cv2_src_${md5(source_system + ':' + source_entity + ':' + source_id)}`.
4. `source_contract.requiredFields` deve conter:
   1. `sourceSystem`,
   2. `sourceEntity`,
   3. `sourceId`,
   4. `subjectKey`,
   5. `sourceUpdatedAt`,
   6. `payloadHash`,
   7. `ingestionBatchId`.

## 6) Qualidade de dados e SLO operacional (v1)

| Métrica | Regra v1 | Tipo |
| --- | --- | --- |
| Cobertura dry-run | `coverage_percent >= 90` | bloqueante pré-carga |
| Rejeição em execução efetiva | `rows_rejected = 0` | bloqueante |
| Erros de execução | `errors.length = 0` | bloqueante |
| Contrato pós-migration | `syn:validate:post-migration` sucesso | bloqueante |
| Conformidade de padrões | `syn-pattern-contracts` sucesso | bloqueante |
| Reconciliação origem/publicação | delta classificado e aceito | bloqueante |

## 7) Conformidade e segurança

Invariantes obrigatórios:

1. `upsert_canonical_event_v2` e `upsert_canonical_source_registry_v1` executáveis somente por `service_role`.
2. `canonical_source_registry_v1` não é tabela de leitura para cliente `authenticated`.
3. Camada publicada para app permanece em `api_syn_*_v1` e endpoint middleware autorizado.
4. `SUPABASE_SERVICE_ROLE_KEY` nunca pode estar no contexto de cliente.

## 8) Compatibilidade e evolução de versão

1. Versão ativa: `DealsNorm-v1`.
2. Qualquer expansão para `leads`/`activities` abre `DealsNorm-v2` ou norma específica por entidade.
3. Mudanças breaking exigem atualização conjunta:
   1. `shared/syn/pat-syn-v1.mjs` (ou versão nova),
   2. catálogo de padrões Syn,
   3. runbook e checklist Go/No-Go.
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Este documento é SSOT para ingestão manual inicial de deals. Não aceitar carga real fora destas regras.
