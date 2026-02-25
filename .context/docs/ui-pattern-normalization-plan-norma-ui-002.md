---
id: ui-pattern-normalization-plan-norma-ui-002
ai_update_goal: "Registrar baseline canônico de shell/sidebar/cards/modais/status para evolução progressiva do MAPA App."
required_inputs:
  - "README.md"
  - "AGENTS.md"
  - "mapa-app/src/app/routes.ts"
  - "mapa-app/src/app/components/TopNav.tsx"
  - "mapa-app/src/app/components/SidebarNav.tsx"
success_criteria:
  - "Inventário por rota publicado com IDs de pattern."
  - "Matriz de adoção e gaps documentada."
  - "Critérios de replicação para novas páginas explícitos."
---

<!-- agent-update:start:ui-pattern-normalization -->
# UI Pattern Normalization — PLAN-NORMA-UI-002

## Escopo do Ciclo

- Consolidar padrão único para `shell`, `sidebar`, `cards`, `modais` e `status panel`.
- Cobertura alvo: `/dashboard`, `/vault`, `/analytics`, `/team`, `/team/overview` (absorção do Bridge), `/syn`, `/war-room`.
- Compatibilidade legada: `/bridge` e `/bridge/*` redirecionando para `/team/overview`.

## Gate Canônico Aplicado (`CANON-PLAN-000`)

1. Inventário dos patterns atuais por camada (`mapa-app` + `.context`).
2. Definição de baseline reutilizável com IDs.
3. Classificação de gaps em bloco estrutural, navegação e refinamento visual.
4. Publicação deste registro como referência oficial da iteração.

## Catálogo de Pattern IDs

| Pattern ID | Tipo | Definição |
| --- | --- | --- |
| `PAT-SHELL-001` | Shell | Estrutura principal com `TopNav`, container central (`max-w-7xl`), fundo `#F5F5F7` e overlay de ruído no layout global. |
| `PAT-SIDEBAR-001` | Sidebar | Sidebar canônica com marca, collapse, active state e menu com `subLabel`. |
| `PAT-SIDEBAR-002` | Sidebar Status | Bloco inferior de status padronizado via `SystemStatusPanel`. |
| `PAT-CARD-001` | Card | Superfície glass com radius alto, borda leve e sombra difusa. |
| `PAT-MODAL-001` | Modal | Modal compartilhado (`ActionComposerModal`) para ações `+ADD`. |
| `PAT-STATUS-001` | Status | Insights na sidebar sem invadir área funcional principal. |
| `PAT-STATUS-002` | Status Compat | Redirecionamento de status legado do Bridge para painel lateral. |

## Inventário de Adoção por Rota

| Rota | Shell | Nav | Sidebar | Cards | Modal | Status | Exceções |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/dashboard` | `PAT-SHELL-001` | `PAT-SHELL-001` | `N/A` | `PAT-CARD-001` | `PAT-MODAL-001` | `N/A` | Página hub sem sidebar por decisão de produto. |
| `/vault` | `PAT-SHELL-001` | `PAT-SHELL-001` | `N/A` | `PAT-CARD-001` | `PAT-MODAL-001` | `N/A` | Mantém preview modal do domínio Vault. |
| `/analytics` | `PAT-SHELL-001` | `PAT-SHELL-001` | `PAT-SIDEBAR-001` | `PAT-CARD-001` | `N/A` | `PAT-STATUS-001` | Item Dashboard aponta para `/syn`. |
| `/team` | `PAT-SHELL-001` | `PAT-SHELL-001` | `PAT-SIDEBAR-001` | `PAT-CARD-001` | `PAT-MODAL-001` | `PAT-STATUS-001` | Subviews internas por rota (`/team/*`). |
| `/team/overview` | `PAT-SHELL-001` | `PAT-SHELL-001` | `PAT-SIDEBAR-001` | `PAT-CARD-001` | `PAT-MODAL-001` | `PAT-STATUS-002` | Absorve Bridge e recebe compatibilidade de `/bridge`. |
| `/syn` | `PAT-SHELL-001` | `PAT-SHELL-001` | `PAT-SIDEBAR-001` | `PAT-CARD-001` | `N/A` | `PAT-STATUS-001` | Migração de sidebar custom para sidebar canônica. |
| `/war-room` | `PAT-SHELL-001` | `PAT-SHELL-001` | `N/A` | `PAT-CARD-001` | `N/A` | `N/A` | Conformidade parcial; canvas preservado por exceção funcional. |
| `/bridge` | `PAT-SHELL-001` | `PAT-SHELL-001` | `PAT-SIDEBAR-001` | `PAT-CARD-001` | `PAT-MODAL-001` | `PAT-STATUS-002` | Redireciona para `/team/overview` (compatibilidade). |

## Matriz de Adoção por Fase

| Fase | Entrega | Estado |
| --- | --- | --- |
| Fase 0 | Inventário + IDs + registro em `.context/docs` | Concluído |
| Fase 1 | Absorção Bridge em Team + compat route + guard any-module + `+ADD` base | Concluído |
| Fase 2 | Migração ticker para sidebar status panel + ajuste analytics dashboard item | Concluído |
| Fase 3 | Refino cards/modais + alinhamento parcial War Room + checklist final | Parcial (refino contínuo) |

## Contratos de Implementação

- Rotas:
  - `/team/overview` explícito.
  - `/bridge` e `/bridge/*` como compatibilidade com redirect.
- Acesso:
  - `AnyModuleAccessGuard` para visão geral (`team-hub` ou `the-bridge`).
- Navegação:
  - Schema unificado em `moduleNavigation.ts` aplicado no `TopNav`.
- Sidebar:
  - `SidebarNav` com suporte a `subLabel` e `statusPanel`.
- Ações:
  - `ActionComposerModal` compartilhado para `+ADD`.

## Checklist Técnico de Regressão

- [x] `npm run build`
- [x] `npm run test`
- [x] `npm run build:app`
- [x] `npm run preview:app` + HTTP `200`

### Evidência técnica registrada

- Timestamp de validação: `2026-02-25 10:57 UTC`
- Preview validado em `http://127.0.0.1:4174/` com resposta `HTTP/1.1 200 OK`

## Checklist HITL

- [ ] Active states corretos em `/team`, `/team/overview`, `/analytics`, `/syn`.
- [ ] `/bridge` redireciona sem perda de contexto (query/hash).
- [ ] `+ADD` abre em `/dashboard`, `/vault`, `/team/overview`.
- [ ] Status panel não invade área principal.
- [ ] War Room preserva comportamento do canvas.

## Regras para Replicação em Novas Páginas

1. Toda nova rota deve declarar aderência aos IDs de pattern acima.
2. Se houver exceção visual/funcional, registrar no inventário antes de implementar.
3. Evitar criar sidebars customizadas quando `SidebarNav` já cobre o caso.
4. Não introduzir ticker inferior para status sistêmico; usar painel lateral.
5. Usar `ActionComposerModal` para novos fluxos de adição transversais.

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Atualize este registro sempre que uma rota mudar de pattern, mesmo em ajustes pequenos.
