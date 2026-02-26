---
id: syn-analytics-widget-catalog-state-db-002
ai_update_goal: "Formalizar o catálogo canônico de widgets analíticos e contratos de binding para a camada Syn."
required_inputs:
  - "README.md"
  - ".context/docs/ui-pattern-normalization-plan-norma-ui-002.md"
  - "mapa-app/src/app/types/patterns.ts"
  - "mapa-app/src/app/components/syn"
success_criteria:
  - "IDs PAT-WIDGET-* publicados com uso recomendado."
  - "Regras de composição modal x rota dedicada documentadas."
  - "Contratos de binding e política de evolução versionada explícitos."
---

<!-- agent-update:start:syn-widget-catalog -->
# Syn Analytics Widget Catalog — STATE-DB-002

## Objetivo
Estabelecer o SSOT canônico dos widgets analíticos para migração de mocks para dados reais com pixel lock do design premium.

## Widget IDs Canônicos

| Pattern ID | Nome | Uso principal | Surface base |
| --- | --- | --- | --- |
| `PAT-WIDGET-001` | KPI Widget | Métricas executivas (cards curtos) | `PAT-CARD-001` |
| `PAT-WIDGET-002` | Chart Widget | Séries temporais e comparativos | `PAT-CARD-001` |
| `PAT-WIDGET-003` | Matrix/Heatmap Widget | Correlação regional/setorial | `PAT-CARD-001` |
| `PAT-WIDGET-004` | Narrative List Widget | Insights e recomendações priorizadas | `PAT-CARD-001` |
| `PAT-WIDGET-005` | Lead Widget | Lead com score/status/valor e vínculo analítico | `PAT-CARD-001` |

## Regra de Composição (+ADD)
1. Fluxo rápido: `ActionComposerModal` (`PAT-MODAL-001`) continua para ações transversais imediatas.
2. Fluxo avançado: rota dedicada `/syn/composer` para composição de widgets e binding canônico.
3. Toda composição avançada deve referenciar explicitamente o Pattern ID do widget e o domínio alvo (`kpis`, `heatmap`, `outreach`, `sector`, `leads`).

## Contratos de Binding
- Backend: `api_syn_*_v1` (RPC) e views `api_syn_*_view_v1`.
- Frontend: `types/analytics.ts` + `services/analytics/*` + `SynContext`.
- Política de evolução:
  1. Alteração breaking exige novo sufixo (`_v2`).
  2. Alteração aditiva mantém versão e exige atualização documental.
  3. Componentes não podem acoplar diretamente em tabelas base (`canonical_events`, `canonical_ingestion_runs`).

## Critérios de Conformidade Visual
- Manter `PAT-SHELL-001`, `PAT-CARD-001`, `PAT-SIDEBAR-001/002`, `PAT-STATUS-001/002`.
- `loading/empty/error` devem renderizar na mesma superfície glass (`PAT-CARD-001`) sem quebrar grid/layout.
- Não introduzir variações de token fora do Design System aprovado.

## Evidências mínimas
- Build app (`npm run build:app`) sem erro.
- RPCs `api_syn_*_v1` acessíveis para usuário autenticado com módulo `mapa-syn` ou `synapse`.
- Checklist HITL validando `/syn`, `/syn/heatmap`, `/syn/sector`, `/syn/outreach`, `/syn/composer`.

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Se algum widget novo for criado, registrar primeiro neste catálogo antes de uso em produção.
