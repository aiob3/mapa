## ⚠️ PROPÓSITO DESTE REPOSITÓRIO

**Este repositório é um Escritório de Agentes (Agentics Development Office).**

Ele atua como uma **fábrica de contexto** que gera scaffolding, documentação e playbooks para alimentar o desenvolvimento do ecossistema MAPA.

---

### 🏗️ ESTRUTURA DO ECOSISTEMA

| Camada | Repositório | Propósito |
|--------|-------------|-----------|
| **ESCRITÓRIO** | `mapa/` (este repositório) | Motor de Context Engineering em TypeScript/CLI (`ai-context`). Gera contexto estruturado para agentes e mantenedores. |
| **PRODUTO** | [`mapa-app/`](./mapa-app) | Plataforma web executiva de Sales Consulting (React/Vite). Importada do Figma, integrada com Supabase (Postgres) + **ClickHouse**. |
| **GUIA** | [`mapa-visual/`](./mapa-visual) | Portal de evidências arquiteturais. Fornece blueprints visuais para agentes não se perderem durante o desenvolvimento. |

---

### 🎯 PRODUTO: MAPA DE VENDAS

**O que é:** Plataforma estratégica de consultoria de vendas para liderança executiva.

**Público-Alvo:**
- C-Levels, CROs, Diretores
- Líderes de Equipe de Vendas
- Comitês de Decisão Estratégica em Tecnologia e Derivados

**O que NÃO é:**
- ❌ **NÃO é um CRM** - Não substitui registradores de pipeline tradicionais
- ❌ **NÃO é operacional** - Não gerencia atividades diárias de SDRs/AEs

**O que faz:**
- ✅ **Reconciliação de dados** - Correlaciona justificativas cadastradas no CRM com dados fatos de múltiplas fontes
- ✅ **Previsibilidade** - Gera forecast e projeções de risco fundamentadas em análise fatorial
- ✅ **SSOT (Single Source of Truth)** - Atua como middleware que valida dados justificativos contra dados reais
- ✅ **Ingestão incremental** - Importa dados apenas durante análises para vetorização e reconstrução de contexto
- ✅ **ClickHouse estratégico** - Armazena dados para iteração e retomada de contexto, gerando insumos para inferência e decisão executiva

**Propósito final:** Fornecer embasamento executivo para tomada de decisão assertiva, confrontando dados justificados (subjetivos) com dados observados (objetivos).

---

# MAPA Workspace - Arquitetura Operacional e Diretrizes de UI

Este repositório possui dois contextos técnicos complementares:

1. `mapa/` (raiz): motor de context engineering em TypeScript/CLI (`ai-context`).
2. `mapa-app/` (OBJETIVO DESTE PROJETO): aplicação web React/Vite para desenvolvimento das conexões e camadas de dados incluindo validação visual/HITL.

Use este README como referência funcional para agentes de código e mantenedores humanos.

---

## Topologia Canônica

```text
mapa/
├── src/                  # Código-fonte do CLI/context engine
├── prompts/              # Prompts base usados por fill/plan
├── dist/                 # Build do CLI (gerado por tsc)
├── docs/                 # Hub estável de navegação para documentação
├── agents/               # Hub estável de navegação para playbooks de agentes
├── .context/             # Scaffold canônico (docs/, agents/, plans/, runtime/)
├── mapa-app/             # Aplicação web (React + Vite)
│   ├── src/
│   └── dist/             # Build web (gerado por vite build)
├── mapa-visual/          # Portal visual executivo da arquitetura (React + Vite)
│   ├── src/
│   └── dist/             # Build web (gerado por vite build)
├── AGENTS.md             # Regras operacionais para agentes
└── README.md             # Este documento
```

## Limites de Contexto (Importante)

- `mapa` (raiz) não é app web; é CLI para geração e preenchimento de contexto.
- `mapa-app` é o alvo correto para tarefas visuais, interface e validação HITL por URL.
- `mapa-visual` é o alvo correto para blueprint arquitetural executivo e leitura de arquitetura vigente.
- Nome legado `mapa-extracted` está descontinuado e não deve ser reutilizado.

## Fluxos Principais

### 1) Context Engineering (CLI)

Pré-requisito:

```bash
npm install
```

Comandos principais no root:

```bash
npm run build
npm run test
npm run dev
```

Uso do CLI (após build):

```bash
node dist/index.js init <repo-path> [docs|agents|both]
node dist/index.js fill <repo-path> --output ./.context
node dist/index.js plan <plan-name> --output ./.context
```

### 2) Web App e HITL (`mapa-app`)

No root:

```bash
npm run build:app
npm run dev:app
npm run preview:app
```

Observação operacional:

- `npm run dev:app` e `npm run preview:app` iniciam automaticamente o middleware Syn antes do app e validam `GET /health`.
- `VITE_SYN_MIDDLEWARE_URL` é preenchida automaticamente pelo `sync:env:app` (default local `http://127.0.0.1:8787`).

Alternativamente dentro de `mapa-app/`:

```bash
npm install
npm run build
npm run dev
npm run preview
```

URL padrão de validação HITL:

```text
http://localhost:4173/
```

### 3) Portal Visual de Arquitetura (`mapa-visual`)

Portal executivo independente para leitura arquitetural da plataforma (fora de `mapa-app`), com snapshot gerado a partir do estado real do repositório.

No root:

```bash
npm run visual:refresh
npm run dev:visual
npm run build:visual
npm run preview:visual
```

URL padrão:

```text
http://localhost:4273/
```

Escopo visual atual:

- Arquitetura de Dados (Supabase + Syn Middleware + ClickHouse)
- Arquitetura do `mapa-app` (módulos, rotas e menus)
- Arquitetura `mapa-app` x Dados (bindings e contratos)

## Mapa de Decisão para Agentes

- Pedido sobre `docs`, `agents`, `.context`, prompts, scaffolding: atuar no root (`mapa`).
- Pedido sobre páginas, componentes, estilos, UX, rotas, captura visual: atuar em `mapa-app`.
- Pedido sobre blueprint arquitetural visual e apresentação executiva: atuar em `mapa-visual`.
- Sempre explicitar no PR/commit qual contexto foi alterado para evitar drift arquitetural.

## Convenções de Documentação para Agentes

- Preservar marcadores `agent-update`, `agent-fill`, `agent-readonly` quando existirem.
- Atualizar `AGENTS.md` e este `README.md` ao alterar topologia, comandos ou nomenclatura.
- Evitar instruções ambíguas: sempre referenciar paths completos (`mapa` vs `mapa-app`).
- `docs/README.md` e `agents/README.md` são hubs de entrada estáveis para navegação humana.
- A fonte canônica do scaffold gerado por CLI é `.context/docs/README.md` e `.context/agents/README.md`.

## Protocolo de Gatilhos de Prompt

Documento canônico:

- [`prompts/trigger_protocol.md`](/home/papa/mapa/prompts/trigger_protocol.md)

Uso:

- Interpretar intenção do operador por gatilho (`{{#reiniciar}}`, `{{#atualizar}}`, `{{#salve}}`, `{{#sincronize}}`, etc.).
- Acionar contratos de leitura obrigatória e skills recomendadas.
- Padronizar matriz decisória, validação HITL e loop semântico persistente.
- Aplicar o algoritmo de loopback persistente para medir eficácia (`E`) e decidir `estavel|monitorar|corrigir`.

Matriz de convergência semântica (determinística):

- Intenções canônicas fechadas: `retomar`, `estruturar`, `enriquecer`, `planejar`, `validar`, `persistir`.
- Toda execução deve mapear primeiro para uma intenção canônica e só depois para comandos.
- Toda saída operacional deve incluir `ts_sp` no padrão `yyMMdd-HHmmss` com timezone `America/Sao_Paulo`.
- Inicialização canônica centralizada: [`.context/runtime/chunk-manifest.md`](/home/papa/mapa/.context/runtime/chunk-manifest.md).

## Inicialização Canônica Centralizada (Ações Atômicas)

Menu de referência para reduzir deriva e garantir idempotência de retomada:

1. Manifesto de chunks: [`.context/runtime/chunk-manifest.md`](/home/papa/mapa/.context/runtime/chunk-manifest.md)
2. Catálogo de ações atômicas: [`.context/runtime/atomic-actions.md`](/home/papa/mapa/.context/runtime/atomic-actions.md)
3. Template de checkpoint persistente: [`.context/runtime/checkpoint-template.md`](/home/papa/mapa/.context/runtime/checkpoint-template.md)

Regra:

- Reinicialização deve carregar somente os chunks declarados no manifesto conforme `intent_token` e `scope_key`.
- A execução deve seguir a sequência atômica e registrar checkpoint ao final.

## Contratos de Integração (`mapa` x `mapa-app`)

| Contrato | Produtor | Consumidor | Entradas | Saídas | Ownership |
|---|---|---|---|---|---|
| `CTX-SCAFFOLD-001` | CLI `ai-context init` (`mapa/src/services/init`) | Operador, Agentes, Revisores | `<repo-path>`, `type`, filtros include/exclude | Estrutura em `./.context` (`docs/`, `agents/`) | Equipe Context Engineering (`mapa`) |
| `CTX-FILL-002` | CLI `ai-context fill` (`mapa/src/services/fill`) | Operador e Agentes de documentação | Scaffolds em `.context`, prompt, provider/model, API key | Markdown enriquecido em `.context/docs` e `.context/agents` | Equipe Context Engineering (`mapa`) |
| `CTX-PLAN-003` | CLI `ai-context plan` (`mapa/src/services/plan`) | Operador, PM, Agentes executores | Nome do plano, título/resumo, prompt, repo alvo | Plano versionável em `.context/plans` | Equipe Context Engineering (`mapa`) |
| `WEB-BUILD-004` | `mapa-app` (`vite build`) | Operador HITL, QA visual | Código React/Vite + assets | `mapa-app/dist` pronto para preview | Equipe Frontend (`mapa-app`) |
| `WEB-HITL-005` | `mapa-app` (`vite preview`) | Operador HITL | Build existente em `mapa-app/dist` | URL local de validação (`http://localhost:4173/`) | Equipe Frontend + Operação HITL |
| `NOME-CANONICO-006` | Maintainers/Agentes | Todo o repositório | Alterações de docs/scripts/automação | Uso exclusivo do nome `mapa-app` | Maintainers |
| `HIST-SYNC-007` | Operador/Agentes | Maintainers e repositório remoto | Estado local validado + aprovação da iteração | Commit local rastreável e sincronização no GitHub | Operação + Maintainers |

Regras de integração:

- Não alterar código de `mapa-app` para corrigir comportamento do CLI sem definir contrato explícito.
- Não acoplar rotas/componentes web diretamente ao runtime do CLI.
- Sempre documentar em PR qual contrato foi impactado e quais evidências foram geradas.

## Matriz de Comandos por Perfil

| Perfil | Contexto | Objetivo | Comandos base |
|---|---|---|---|
| Operador HITL | `mapa-app` | Validar comportamento visual e fluxo de tela | `npm run build:app` ; `npm run preview:app` ; abrir `http://localhost:4173/` |
| Desenvolvedor CLI | `mapa` | Evoluir geradores/serviços do context engineering | `npm run build` ; `npm run test` ; `npm run dev` |
| Desenvolvedor Frontend | `mapa-app` | Evoluir UI, rotas e estilos | `npm run dev:app` ; `npm run build:app` |
| Operador Executivo | `mapa-visual` | Ler blueprint arquitetural vigente | `npm run dev:visual` ; `npm run build:visual` ; `npm run preview:visual` |
| Agente de documentação | `mapa` | Atualizar contexto para execução assistida | `node dist/index.js init <repo> both` ; `node dist/index.js fill <repo> --output ./.context` |
| Agente de planejamento | `mapa` | Criar/atualizar planos operacionais | `node dist/index.js plan <plan-name> --output ./.context` |
| Revisor técnico | `mapa` + `mapa-app` | Verificar consistência estrutural entre camadas | `npm run build` ; `npm run build:app` ; revisão de contratos neste README |

## Checklist HITL Padronizado

### Build e Preview

- [ ] Executar `npm run build` no root e confirmar sucesso sem erro de TypeScript.
- [ ] Executar `npm run build:app` e confirmar geração de `mapa-app/dist`.
- [ ] Executar `npm run preview:app`.
- [ ] Validar resposta HTTP da URL (`http://localhost:4173/`) com status `200`.

### Evidências Obrigatórias

- [ ] Registrar hash/branch e timestamp da validação.
- [ ] Anexar pelo menos uma evidência visual (screenshot) da tela inicial.
- [ ] Anexar logs curtos de build (root + app) com status final.
- [ ] Informar contrato(s) impactado(s) (`CTX-*` ou `WEB-*`).

### Critérios de Aceite

- [ ] Nenhuma referência nova ao nome legado `mapa-extracted`.
- [ ] Build do CLI concluída.
- [ ] Build da web concluída.
- [ ] Preview acessível pelo operador.
- [ ] Evidências anexadas e rastreáveis no PR/registro da execução.

## Plano Fundacional de Evolução (Loop Semântico Persistente)

Este projeto adota um ciclo agêntico obrigatório para preservar contexto, estabilizar padrões e permitir evolução contínua com baixo drift.

### Parada Canônica Obrigatória (Gate `CANON-PLAN-000`)

Antes de qualquer nova frente relevante, executar uma parada curta de planejamento canônico para:

1. Inventariar padrões atuais por camada (`mapa` CLI, `mapa-app` UI, `.context` documentação).
2. Consolidar padrões válidos como baseline reutilizável do Design System.
3. Classificar gaps em: `bloqueante`, `alto impacto`, `incremental`.
4. Publicar baseline versionada (ex.: `DS-BASELINE-v1`) no registro do ciclo.

Sem essa parada, a iteração não é considerada válida para continuidade evolutiva.

### Contratos de Leitura Obrigatória (Acionamento)

| Contrato | Leitura mínima obrigatória | Quando aciona | Objetivo |
|---|---|---|---|
| `READ-CORE-001` | `AGENTS.md` + este `README.md` | Todo início de iteração | Alinhar regras operacionais e topologia canônica |
| `READ-DESIGN-002` | [`mapa-app/guidelines/Guidelines.md`](./mapa-app/guidelines/Guidelines.md) | Mudanças em UI/UX/components | Preservar linguagem visual e tokens canônicos |
| `READ-CONTRACTS-003` | seção "Contratos de Integração (`mapa` x `mapa-app`)" | Mudanças cross-layer | Garantir input/output/ownership explícitos |
| `READ-HITL-004` | seção "Checklist HITL Padronizado" | Entregas com validação visual | Padronizar evidência e aceite |
| `READ-TRIGGER-005` | `prompts/trigger_protocol.md` | Mensagens com gatilhos de prompt | Padronizar roteamento semântico e acionamento de skills |
| `READ-SYNC-006` | seção 6 de `prompts/trigger_protocol.md` | Mensagens `{{#salve}}/{{#crie}}/{{#atualize}}/{{#sincronize}}` | Padronizar checkpoint local e sincronização remota |

### Loop de Rotina Semântica (Regra Persistente)

1. **Ler contratos obrigatórios** (`READ-*`) e registrar escopo da iteração.
2. **Planejar** com referência explícita ao baseline canônico vigente.
3. **Implementar** mantendo separação de concerns (`mapa` vs `mapa-app`).
4. **Validar padrões** com checklist técnico e checklist HITL.
5. **Medir** indicadores do ciclo (métricas abaixo).
6. **Atualizar contexto** (`README.md`, `AGENTS.md`, contratos) antes de encerrar.

### Métricas do Ciclo Agêntico

| Métrica | Fórmula | Meta inicial |
|---|---|---|
| `Pattern Conformance Rate` | `% de mudanças aderentes ao baseline` | `>= 90%` |
| `Contract Coverage Rate` | `% de mudanças mapeadas a contrato` | `100%` |
| `Context Drift Rate` | `% de itens com divergência entre docs e código` | `<= 5%` |
| `HITL Pass Rate` | `% de validações HITL aprovadas na 1ª execução` | `>= 85%` |
| `Evidence Completeness` | `% de execuções com evidências completas` | `100%` |

### Concerns Canônicos por Camada

| Camada | Concern primordial | Regra |
|---|---|---|
| `mapa` (CLI) | Confiabilidade de scaffolding/contexto | Não quebrar contratos `CTX-*` sem atualização documental |
| `mapa-app` (UI) | Fidelidade de padrões visuais e fluxo | Não introduzir variações fora do Design System baseline |
| `.context` (docs/agentes) | Preservação semântica e acionabilidade | Manter marcadores e contratos rastreáveis |

### Regra de Continuidade Evolutiva

Uma iteração só pode ser considerada concluída quando:

1. `CANON-PLAN-000` foi cumprido (quando aplicável ao escopo).
2. Contratos `READ-*` acionados foram efetivamente lidos.
3. Métricas mínimas foram registradas com evidências.
4. Contratos e documentação foram sincronizados com o estado final.

---

## MAPA UI Design System (Source of Truth Visual)

**Localização:** [`mapa-app/guidelines/Guidelines.md`](./mapa-app/guidelines/Guidelines.md)

> O `MAPA UI Design System (Source of Truth Visual)` completo do `MAPA Narrative Ecosystem` está documentado no repositório do produto (`./mapa-app/*`).

**Para quê serve:**
- ✅ Tokens de design (cores, tipografia, efeitos)
- ✅ Componentes e padrões de UI
- ✅ Regras de layout e navegação global
- ✅ Guia de build e stack técnico

**Quando consultar:**
- `READ-DESIGN-002`: Mudanças em UI/UX/components no `mapa-app`
- `READ-CONTRACTS-003`: Validação de aderência ao baseline visual
- `READ-HITL-004`: Checklist de validação visual

> ⚠️ **Importante:** Este documento (`mapa-app/guidelines/Guidelines.md`) é a **Source of Truth** para agentes de UI e Figma. Instruções conflitantes em outros locais devem ser sobrescritas por este documento.

---

### Seções movidas para `mapa-app/guidelines/Guidelines.md`:

1. GENERAL & LANGUAGE GUIDELINES (CRITICAL)
2. PRODUCT OVERVIEW & DESIGN DIRECTION
3. STRICT DESIGN SYSTEM GUIDELINES (NORMALIZED)
   - 3.1 Design Tokens (Variables & Palette)
   - 3.2 Typography Rules (Strict Hierarchy)
   - 3.3 Structure, Radii & Effects (The Physics of MAPA)
4. COMPONENTS & EXECUTION GUIDELINES
   - 4.1 Buttons & Inputs
   - 4.2 Global Navigation (Consolidating the Patchwork)
   - 4.3 Card Alignment & Sizing Constraints
   - 4.4 Specific Screen Elements & Widgets
5. BUILD GUIDE & STACK

**ESTA LEITURA de `Guidelines.md` NAO É OPCIONAL, É OBRIGATÓRIA**
