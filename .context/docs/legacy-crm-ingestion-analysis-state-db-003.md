---
id: legacy-crm-ingestion-analysis-state-db-003
ai_update_goal: "Iniciar a analise dos exports legados do Pipedrive e propor modelo de ingestao estruturado para Supabase + camada vetorial."
required_inputs:
  - ".context/raw_db_data/deals-24018612-725.csv"
  - ".context/raw_db_data/activities-24018612-727.csv"
  - ".context/raw_db_data/leads-24018612-723.csv"
  - "supabase/migrations/20260225023531_state_db_001_auth_rbac_canonical.sql"
  - "supabase/migrations/20260226113000_state_db_002_syn_analytics_api_v1.sql"
success_criteria:
  - "Inventario de dados legado com riscos de qualidade e correlacao."
  - "Mapeamento de campos legado -> canonical_events/event_layer para analytics Syn."
  - "Plano de ingestao por fases com gates tecnicos e regras de versionamento."
  - "Proposta de uso de ClickHouse para vetor/OLAP sem quebrar contratos api_syn_*_v1."
---

<!-- agent-update:start:legacy-crm-state-db-003 -->
# Legacy CRM Ingestion Analysis (STATE-DB-003)

## Escopo e Premissas

- Escopo atual: iniciar modelagem de ingestao usando os exports em `.context/raw_db_data/`.
- Supabase continua como system of record operacional (`canonical_events`, `canonical_ingestion_runs`).
- Camada analitica Syn atual le `canonical_events` via `api_syn_*_v1`.
- Assumimos que "ClickHouve" refere-se a **ClickHouse** para parte vetorial/OLAP no middleware.
- Diretriz de produto: MAPA nao deve operar como CRM, e sim como **motor de inflexao semantica** entre fontes canonicas.

## Linha de Base de Diferenciacao (Produto)

O objetivo do modelo de dados nao e reproduzir cadastro comercial, e sim transformar sinais dispersos em inteligencia executiva acionavel.

Termos-base que devem virar contrato de dados:

1. **Causalidade**: relacoes provaveis de causa/efeito entre eventos, mudancas e resultado esperado.
2. **Contraintuitivo**: sinais que contradizem o padrao dominante e exigem leitura estrategica.
3. **Confronto Relacional**: tensoes entre atores (conta, parceiro, vendedor, sponsor, concorrente).
4. **Ponto de Inflexao**: evento/condicao que altera probabilidade de ganho/perda ou velocidade de ciclo.
5. **Embasamento Tacito**: justificativa contextual nao capturada em campo estruturado tradicional.
6. **Formula Tatica**: combinacao recomendada de acao, timing, owner e narrativa para execucao.
7. **Experiencia do Executivo**: saida final deve ser legivel para decisao, nao para operacao de CRM.

## Inventario do Export Legado (perfilado)

- `deals-24018612-725.csv`: 173 linhas, 164 colunas.
- `activities-24018612-727.csv`: 6 linhas, 196 colunas.
- `leads-24018612-723.csv`: 261 linhas, 12 colunas.
- `pipedrive_sample_data.*`: template de importacao (nao representa producao).

## Achados de Qualidade e Correlacao

1. `deals` e a fonte mais consistente para Syn no estado atual:
   - `Negócio - ID` 100% preenchido e unico (173/173).
   - Valor, etapa, status, dono e campos de org/pessoa presentes.
2. `activities` esta parcialmente desconectado do snapshot de `deals`:
   - Apenas 0/6 `Negócio - ID` de activities bate com os deals exportados.
   - Match parcial por pessoa/organizacao (4/6).
3. `leads` exportado nao traz `Lead - ID` de negocio:
   - Nao existe chave robusta para merge deterministico com deals.
   - Forte viés de origem unica (`Eventos` / `AWS Summit`).
4. Janelas temporais diferentes entre datasets:
   - Deals criados entre 2024-04 e 2026-02; activities somente jan/2026; leads de set/2025.
5. Risco funcional imediato:
   - Se ingestao inserir tudo em `canonical_events` sem distinguir entidade, as views `api_syn_*_v1` misturam deal/leads/activities e degradam KPI.

## Mapeamento Candidato (Legacy -> Canonical Syn)

### Entidade primaria recomendada para Syn v1: `deal`

| Campo Syn (`event_layer`/`raw_payload`) | Origem Pipedrive (deal export) | Regra |
| --- | --- | --- |
| `lead_name` | `Pessoa - Nome` ou `Negócio - Pessoa de contato` | `coalesce` |
| `company` | `Negócio - Organização` | direto |
| `sector` | `Organização - Setor` / `Negócio - Segmento` | fallback para `Geral` |
| `region` | `Organização - Estado de Endereço` / `Organização - Região de Endereço` | fallback `Sem região` |
| `location` | `Organização - Cidade/município/vila/localidade de Endereço` + UF | fallback `N/A` |
| `deal_value` | `Negócio - Valor` | parse numerico |
| `score` | derivado de `Negócio - Etapa` + `Negócio - Temperatura` + `Negócio - Probabilidade` | clamp `0..100` |
| `status` | derivado de score | `Quente/Morno/Frio` |
| `status_color` | derivado de score | `#C64928/#F59E0B/#6B7280` |
| `open_rate` | proxy de engajamento (`Atividades concluídas`, emails, recencia) | default seguro se ausente |
| `click_rate` | proxy de engajamento (emails + atividades) | default seguro se ausente |
| `tone` | origem/segmento (`Inbound/Outbound/Eventos`) | taxonomia controlada |
| `tone_color` | mapeado por `tone` | paleta fixa |
| `score_ia` | derivado de `score` | `score / 10` |

### IDs e rastreabilidade

- `legacy_id_iov`: `Negócio - ID` (recomendado no curto prazo).
- `legacy_io_opp`: reservado para id externo de oportunidade (se houver no middleware).
- `legacy_iv_vdd`: reservado para id externo de vendedor/vertical.
- `raw_payload`: JSON homologado completo do registro original (sem perda de colunas).

## Contrato Semantico Minimo (novo)

Para refletir a proposta de valor, cada evento promovido para canonical deve aceitar uma camada semantica padrao:

```json
{
  "semantic_layer": {
    "causal_hypotheses": [],
    "counterintuitive_signals": [],
    "relational_conflicts": [],
    "inflection_points": [],
    "tacit_basis": [],
    "tactical_formula": {
      "action": "",
      "owner": "",
      "timing": "",
      "expected_outcome": ""
    },
    "executive_summary": ""
  }
}
```

Regras:

1. `semantic_layer` pode iniciar vazio na Fase 1, mas o schema deve existir.
2. `executive_summary` deve ser obrigatorio quando houver `inflection_points`.
3. Itens do `semantic_layer` precisam de `source_ref` (origem do sinal) na evolucao v2.
4. Essa camada nao substitui `event_layer`; ela qualifica decisao executiva.

## Proposta de Modelo de Ingestao por Fases

### Fase 1 (rapida, baixo risco)

1. Ingestao **apenas de deals** para alimentar Syn.
2. Persistir payload bruto + `event_layer` normalizado no `canonical_events`.
3. Registrar `entity_kind='deal'` dentro de `event_layer`.
4. Atualizar views `api_syn_*_v1` para filtrar explicitamente `entity_kind='deal'`.

### Fase 2 (consolidacao relacional)

1. Criar staging tables dedicadas:
   - `staging_pipedrive_deals_v1`
   - `staging_pipedrive_activities_v1`
   - `staging_pipedrive_leads_v1`
2. Adicionar tabela de reconciliação:
   - `staging_pipedrive_entity_links_v1` (`deal_id`, `activity_id`, `person_id`, `org_id`, `confidence`).
3. Só promover para canonical quando passar gate de integridade/chave.
4. Iniciar enrich de `semantic_layer` via pipeline de inferencia (rules + IA).

### Fase 3 (analytics + IA avançada)

1. Criar snapshots analiticos derivados para Syn por janela temporal.
2. Publicar versão de contrato `api_syn_*_v2` se houver breaking changes.
3. Materializar painéis de decisao executiva por `inflection_points` e `tactical_formula`.

## Gates de Qualidade Obrigatorios

1. **Schema gate**: colunas obrigatorias presentes (`deal_id`, valor, etapa, org/pessoa).
2. **Type gate**: campos monetarios e datas convertiveis sem erro.
3. **Identity gate**: `deal_id` unico no lote; duplicates em quarantine.
4. **Owner gate**: política de `owner_user_id` definida para RLS (evitar invisibilidade acidental).
5. **Semantic gate**: score/status coerentes com faixa esperada.
6. **Inflexion gate**: eventos com alta criticidade sem `executive_summary` entram em `requires_operator_review`.

## ClickHouse (vetorial + middleware IA) - recomendacao inicial

### Papel recomendado do ClickHouse

- Armazenar chunks textuais e embeddings de contexto comercial (alto volume).
- Executar busca vetorial + filtros analiticos de baixa latência.
- Não substituir Supabase como fonte transacional principal de RBAC/estado.

### Topologia sugerida

1. Supabase (`canonical_events`) emite dataset curado.
2. Middleware gera chunks e embeddings por entidade canonical.
3. ClickHouse recebe:
   - `canonical_id_v2`
   - `entity_kind`
   - `chunk_id`
   - `chunk_text`
   - `embedding`
   - `metadata` (org, setor, owner, timestamps)
4. Resultado vetorial retorna `canonical_id_v2`; middleware revalida ACL no Supabase antes de responder.

## Decisoes tecnicas para proxima iteracao

1. Definir formalmente taxonomia de `entity_kind` no canonical (`deal|lead|activity`).
2. Fechar formula de score deterministico para deal stage/temperature.
3. Aprovar migration incremental para filtros de entidade em `api_syn_*_v1` (ou abrir `v2`).
4. Definir chave canonica de owner (`owner_user_id`) compativel com auth.
5. Decidir se ClickHouse entra primeiro para vetor, OLAP, ou ambos.
6. Formalizar DDL da `semantic_layer` (JSONB inicial ou tabelas normalizadas) e politicas de curadoria.

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Esta analise e inicial e deve ser revalidada com um export maior antes de congelar contrato de producao.
