---
id: architecture-visual-portal-state-db-006
ai_update_goal: "Registrar a arquitetura e operação do portal visual executivo para leitura do blueprint vigente da plataforma."
required_inputs:
  - "scripts/generate-architecture-visual-snapshot.mjs"
  - "mapa-visual/"
  - "README.md"
success_criteria:
  - "Portal visual fora de mapa-app com 3 vistas executivas documentadas."
  - "Fluxo de atualização por snapshot explícito e reproduzível."
  - "Checklist HITL visual definido para homologação incremental."
---

<!-- agent-update:start:architecture-visual-portal-state-db-006 -->
# Architecture Visual Portal (STATE-DB-006)

## 1) Objetivo

O `mapa-visual/` é um portal executivo independente para dar visibilidade arquitetural ao operador durante homologação feature a feature, sem acoplar o blueprint ao runtime do `mapa-app`.

## 2) Escopo atual (MVP)

Três vistas principais:

1. Arquitetura de Dados (Supabase + Syn Middleware + ClickHouse)
2. Arquitetura do `mapa-app` (módulos, rotas, menus)
3. Arquitetura `mapa-app` x Dados (bindings + contratos)

## 3) Comandos canônicos

No root do repositório:

```bash
npm run visual:refresh
npm run dev:visual
npm run build:visual
npm run preview:visual
```

URL padrão de preview:

```text
http://localhost:4273/
```

## 4) Fonte de verdade do conteúdo visual

O conteúdo é gerado por snapshot (sem consulta live externa) usando:

1. `mapa-app/src/app/routes.ts`
2. `mapa-app/src/app/navigation/moduleNavigation.ts`
3. `mapa-app/src/app/navigation/sidebarNavigation.ts`
4. `mapa-app/src/app/services/analytics/analyticsApi.ts`
5. `scripts/syn-middleware.mjs`
6. `.context/docs/clickhouse-role-architecture-state-db-004.md`
7. `.context/docs/syn-canonical-pattern-catalog-state-db-005.md`
8. `.context/docs/syn-analytics-widget-catalog-state-db-002.md`

Saída gerada:

- `mapa-visual/src/data/architecture-snapshot.generated.json`

## 5) Operação e guardrails

1. `visual:refresh` deve falhar com erro explícito se faltar input obrigatório.
2. `build:visual` e `dev:visual` devem sempre operar com snapshot atualizado.
3. O portal não substitui monitoria operacional; ele consolida leitura executiva de arquitetura.
4. Mudanças em contratos `PAT-SYN-*` exigem refresh e revisão visual da vista `mapa-app x Dados`.

## 6) Checklist HITL visual

1. Validar carregamento das 3 vistas sem erro de render.
2. Confirmar timestamp e versão do snapshot visíveis no header.
3. Confirmar presença de Mermaid + Canvas em pelo menos uma vista.
4. Conferir se bindings críticos incluem `api_syn_*_v1` e `/api/syn/semantic-signals-summary`.
5. Registrar evidência (screenshot) da navegação entre as 3 vistas.

## 7) Ownership

- Implementação do portal: Frontend (`mapa-visual`)
- Fonte arquitetural e contratos: Context Engineering (`.context/docs` + `shared/syn`)
- Validação final: Operador HITL

<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Sempre que houver mudança de rotas, contratos ou pipeline de dados, atualizar snapshot e revisar este documento antes de avançar fase de homologação.
