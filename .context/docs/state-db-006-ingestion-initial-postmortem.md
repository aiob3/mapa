---
id: state-db-006-ingestion-initial-postmortem
ai_update_goal: "Registrar post-mortem forense da ingestão inicial STATE-DB para diagnosticar falhas operacionais, de processo, pipeline e workflow."
required_inputs:
  - ".context/plans/state-db-006-continuity.md"
  - ".context/runtime/checkpoints/*.md"
  - "supabase/migrations/20260225023531_state_db_001_auth_rbac_canonical.sql"
  - "supabase/migrations/20260226190000_state_db_006_canonical_source_registry.sql"
  - "supabase/migrations/20260226203000_state_db_006_ingestion_rpcs_backend_only.sql"
  - "scripts/syn-ingest-raw-db.mjs"
  - "scripts/validate-syn-post-migration.mjs"
success_criteria:
  - "Linha do tempo única documentada com decisão, justificativa, evidência e lacuna."
  - "Falhas classificadas por taxonomia fixa com causa raiz e prevenção."
  - "Ações corretivas atribuídas com ownership."
---

<!-- agent-update:start:state-db-006-ingestion-initial-postmortem -->
# Post-Mortem Forense da Ingestão Inicial (STATE-DB)

## 1) Objetivo

Consolidar, de forma rastreável, o que foi implementado na trilha inicial de ingestão, por que foi implementado, e quais falhas operacionais/processuais surgiram até o estado atual.

Escopo desta análise:

1. Pipeline inicial de ingestão `raw csv -> canonical_events`.
2. Evolução de segurança e contratos de ingestão/publicação.
3. Handoffs entre plano, execução, checkpoint e validação.

## 2) Linha do tempo única (evidência consolidada)

| Marco | Decisão tomada | Justificativa existente | Evidência rastreável | Lacuna identificada |
| --- | --- | --- | --- | --- |
| `STATE-DB-001` | Criar base canônica com `canonical_events` e `canonical_ingestion_runs` + RPC `upsert_canonical_event_v2` | Estabelecer SoR em Supabase com gate de homologação | `supabase/migrations/20260225023531_state_db_001_auth_rbac_canonical.sql` | Critérios formais de elegibilidade transacional não foram publicados nesse momento |
| `STATE-DB-001 strict gate` | Reforçar gate de homologação | Reduzir payload inconsistente em ingestão | `supabase/migrations/20260225024110_state_db_001_gate_homologation_strict.sql` | Sem matriz explícita de impacto por consumidores downstream |
| `STATE-DB-002` | Publicar API analítica `api_syn_*_v1` | Disponibilizar consumo app sem acoplamento direto em tabelas base | `supabase/migrations/20260226113000_state_db_002_syn_analytics_api_v1.sql` | Sem reconciliação formal origem vs publicado |
| `STATE-DB-003` | Evoluir camada semântica para sinais | Aumentar capacidade de leitura executiva | `supabase/migrations/20260226153000_state_db_003_semantic_layer_syn.sql` | Falta de runbook de ingestão manual formalizado |
| `STATE-DB-006 source registry` | Introduzir `canonical_source_registry_v1` e RPC de upsert | Garantir idempotência e rastreabilidade por origem | `supabase/migrations/20260226190000_state_db_006_canonical_source_registry.sql`, checkpoint `260226-203922-persistir` | Inicialmente exposto para `authenticated`, gerando ambiguidade de fronteira de acesso |
| `STATE-DB-006 hardening` | Tornar ingestão e registry backend-only (`service_role`) | Eliminar risco de exposição indevida de ingestão/registro de origem | `supabase/migrations/20260226203000_state_db_006_ingestion_rpcs_backend_only.sql`, checkpoint `260226-210035-persistir` | Mudança correta, porém sem checklist Go/No-Go formal para próxima carga real |
| `Pós-hardening` | Fechar pendência de CI e elevar continuidade ao topo da fila | Confirmar estabilidade técnica antes de próxima etapa | checkpoint `260226-235407-retomar`, CI `22466558072` | Não havia artefato único de lições aprendidas e critérios de aprovação operacional |

## 3) Diagnóstico de falhas por taxonomia

| Categoria | Falha observada | Causa raiz | Impacto | Como foi detectada | Prevenção obrigatória | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| Operacional | Ausência de checklist único para autorizar nova carga manual real | Execução por marcos técnicos sem gate operacional final consolidado | Risco de iniciar carga real com critérios incompletos | Revisão de planos/checkpoints sem artefato de Go/No-Go | Adotar checklist rígido versionado e comando de validação único | DevOps + Database |
| Processo/Governança | Critérios de elegibilidade de tabelas/fontes não formalizados no início | Foco inicial em entrega de pipeline e segurança antes da governança de dados | Ambiguidade sobre “o que já está pronto para produção inicial” | Gap explícito levantado na revisão da trilha | Publicar matriz de elegibilidade transacional v1 com status por ativo | Architect + Documentation |
| Pipeline Técnico | Fase inicial permitia acesso `authenticated` ao registry/RPC de origem | Modelo inicial priorizou velocidade de instrumentação | Superfície de risco de acesso indevido à trilha de origem | Hardening `STATE-DB-006` e guardrails | Manter grants backend-only + `security:guardrails` bloqueante em gate | Security + Database |
| Workflow/Handoff | Handoff entre decisões e critérios operacionais ocorreu em múltiplos artefatos dispersos | Planejamento e execução foram versionados, mas sem consolidação normativa v1 | Alto custo de retomada e auditoria | Revisão cruzada em `.context/plans`, checkpoints e migrations | Consolidar pacote normativo único (post-mortem + norma + runbook + gate) | Documentation Writer |

## 4) Lições aprendidas (aplicáveis imediatamente)

1. Segurança de ingestão deve ser definida como fronteira de arquitetura desde o início (`backend-only`), não como correção posterior.
2. Todo ganho técnico de pipeline precisa vir acompanhado de critérios operacionais explicitados para evitar “falso pronto”.
3. A rastreabilidade por origem (`source_contract` + `canonical_source_registry_v1`) é necessária, mas não suficiente sem reconciliação formal com a camada publicada.
4. Checkpoints canônicos funcionam bem para continuidade, porém exigem um artefato normativo de síntese para auditoria operacional.

## 5) Ações corretivas mandatórias (pré-carga real)

1. Publicar matriz de elegibilidade transacional v1 por ativo canônico.
2. Congelar norma canônica v1 para ingestão manual de `deals`.
3. Operar apenas com runbook oficial de carga manual CSV.
4. Aplicar gate rígido de Go/No-Go antes de qualquer nova carga real.
5. Registrar evidências mínimas por execução e checkpoint final com status `GO|NO-GO`.

## 6) Critério de fechamento deste post-mortem

Este post-mortem só é considerado fechado quando:

1. `eligibility-criteria-v1-state-db-006.md` estiver aprovado.
2. `canonical-data-norm-deals-v1-state-db-006.md` estiver aprovado.
3. `manual-csv-ingestion-runbook-state-db-006.md` estiver aprovado.
4. `go-no-go-rigid-checklist-state-db-006.md` estiver aprovado e aplicado.
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Atualize este relatório sempre que uma nova janela alterar a fronteira entre origem cadastrada e camada disponibilizada.
