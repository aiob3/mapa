---
id: eligibility-criteria-v1-state-db-006
ai_update_goal: "Formalizar critérios objetivos de elegibilidade transacional v1 para ingestão manual de deals antes de nova carga real."
required_inputs:
  - "supabase/migrations/20260225023531_state_db_001_auth_rbac_canonical.sql"
  - "supabase/migrations/20260226113000_state_db_002_syn_analytics_api_v1.sql"
  - "supabase/migrations/20260226190000_state_db_006_canonical_source_registry.sql"
  - "supabase/migrations/20260226203000_state_db_006_ingestion_rpcs_backend_only.sql"
  - "scripts/syn-ingest-raw-db.mjs"
  - "scripts/validate-syn-post-migration.mjs"
  - "shared/syn/pat-syn-v1.mjs"
success_criteria:
  - "Cada ativo crítico possui status de elegibilidade com justificativa e evidência."
  - "Critérios hard gate e soft gate estão definidos e auditáveis."
  - "Condição GO/NO-GO transacional é determinística."
---

<!-- agent-update:start:eligibility-criteria-v1-state-db-006 -->
# Eligibility Criteria v1 (STATE-DB-006)

## 1) Objetivo e escopo

Definir, de forma auditável, quando os ativos transacionais da trilha Syn estão aptos para suportar nova carga real manual (`CSV`) no escopo v1 (`deals` somente).

Ativos avaliados:

1. `public.canonical_events`
2. `public.canonical_ingestion_runs`
3. `public.canonical_source_registry_v1`
4. Camada publicada (`api_syn_*_v1` + middleware `/api/syn/semantic-signals-summary`)

## 2) Definições canônicas

1. `Hard gate`: critério bloqueante. Falha em qualquer hard gate implica `não elegível`.
2. `Soft gate`: critério de maturidade/robustez. Não bloqueia sozinho, mas afeta classificação de risco.
3. `Evidência`: comando, migration, doc ou checkpoint versionado que prova conformidade.
4. `Elegível`: todos hard gates aprovados e score soft gate >= 85.
5. `Elegível com ressalvas`: hard gates aprovados e score soft gate entre 70 e 84.
6. `Não elegível`: qualquer hard gate reprovado ou score soft gate < 70.

## 3) Matriz de elegibilidade (hard gates)

| criterion_id | Dimensão | Regra | Tipo | Threshold | Owner | Evidência |
| --- | --- | --- | --- | --- | --- | --- |
| `ELIG-HARD-001` | Identidade estável | Existe vínculo determinístico `source_id -> canonical_id_v2` para ingestão v1 | hard | obrigatório | Database Specialist | `scripts/syn-ingest-raw-db.mjs` + `canonical_source_registry_v1` |
| `ELIG-HARD-002` | Rastreabilidade | `source_contract` persiste origem em `event_layer` e `raw_payload` | hard | obrigatório | Data Engineer | `scripts/syn-ingest-raw-db.mjs` |
| `ELIG-HARD-003` | Idempotência | `idempotency_key` e dedupe por origem/payload ativos | hard | obrigatório | Database Specialist | migration `20260226190000_*_canonical_source_registry.sql` |
| `ELIG-HARD-004` | Segurança por role | Ingestão/registry backend-only (`service_role`) | hard | obrigatório | Security Auditor | migration `20260226203000_*_backend_only.sql` + `security:guardrails` |
| `ELIG-HARD-005` | Compatibilidade de publicação | Contratos `api_syn_*_v1` válidos para token `authenticated` | hard | obrigatório | Backend Specialist | `scripts/validate-syn-post-migration.mjs` |
| `ELIG-HARD-006` | Integridade de execução | Pipeline emite relatório de execução com `rows_valid`, `rows_rejected`, `errors` | hard | obrigatório | DevOps Specialist | saída JSON do `syn:ingest:raw` |

## 4) Matriz de scoring (soft gates)

| criterion_id | Dimensão | Regra | Tipo | Peso |
| --- | --- | --- | --- | --- |
| `ELIG-SOFT-001` | Cobertura | Cobertura de linhas válidas >= 90% no dry-run | soft | 25 |
| `ELIG-SOFT-002` | Qualidade | Rejeições = 0 na execução efetiva | soft | 20 |
| `ELIG-SOFT-003` | Reconciliação | Overlap origem/publicação >= 95% ou delta classificado | soft | 25 |
| `ELIG-SOFT-004` | Observabilidade | Pacote de evidências completo por execução | soft | 15 |
| `ELIG-SOFT-005` | Governança | Checkpoint runtime + checklist GO/NO-GO preenchidos | soft | 15 |

## 5) Faixas de decisão (score_total)

| score_total | Classe | Ação |
| --- | --- | --- |
| `85..100` | elegível | Pode seguir para carga real controlada |
| `70..84` | elegível com ressalvas | Carga real bloqueada até fechar ressalvas críticas |
| `< 70` | não elegível | Proibido executar nova carga real |

## 6) Aplicação no estado atual do sistema

| Ativo | Hard gate | Soft score | Status | Risco principal | Ação corretiva obrigatória |
| --- | --- | --- | --- | --- | --- |
| `canonical_events` | aprovado | 76 | elegível com ressalvas | Histórico legado pode conter linhas sem cobertura uniforme de `source_contract` | Reconciliar lote-alvo antes da carga real e documentar delta esperado |
| `canonical_ingestion_runs` | aprovado | 78 | elegível com ressalvas | Métrica operacional não classificada por waiver formal de execução | Exigir pacote de evidência e checklist por execução |
| `canonical_source_registry_v1` | aprovado | 90 | elegível | Depende de disciplina operacional para manter semântica da origem | Validar dedupe/anomalias por lote no pós-carga |
| `api_syn_*_v1` + middleware summary | aprovado | 74 | elegível com ressalvas | Publicação não prova, sozinha, completude da trilha de origem | Rodar reconciliação origem vs publicado como gate bloqueante |

## 7) Exceções e waivers

| waiver_id | Critério | Motivo | Aprovador | Expiração | Status |
| --- | --- | --- | --- | --- | --- |
| `N/A` | `N/A` | Não há waiver autorizado para carga real v1 até fechamento do gate rígido | `N/A` | `N/A` | aberto para futuro |

Regra:

1. Waiver nunca substitui hard gate.
2. Waiver só pode atuar em soft gate e precisa de data de expiração.

## 8) Governança e versionamento

1. Versão ativa: `Eligibility-v1`.
2. Mudanças em hard gates exigem revisão conjunta `Database + Security + Architecture`.
3. Toda decisão GO/NO-GO deve referenciar este documento e o checklist rígido.

## 9) Evidências obrigatórias por execução

1. JSON do `syn:ingest:raw` (dry-run e execução efetiva).
2. Resultado do `npm run syn:validate:post-migration`.
3. Resultado do `npm run security:guardrails`.
4. Resultado do `npm run test -- syn-pattern-contracts.test.ts`.
5. Registro de reconciliação origem vs publicação.
6. Checkpoint runtime com `status: estavel|monitorar|corrigir`.
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Este documento é gate de produção inicial manual. Não execute nova carga real sem revalidar os hard gates.
