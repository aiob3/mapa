---
id: trigger-protocol-v1
ai_update_goal: "Definir gatilhos canônicos de prompt e roteamento de ações/skills para o ciclo agêntico do projeto."
required_inputs:
  - "Mensagem do operador"
  - "Estado atual do repositório"
  - "Contratos READ-* vigentes"
success_criteria:
  - "Toda mensagem relevante é classificada em um gatilho canônico"
  - "Ação resultante referencia contratos, skills e critérios HITL"
  - "Saída do agente permanece rastreável e auditável"
---

# Prompt Trigger Protocol (Canônico)

<!-- agent-readonly:guidance -->
Este protocolo define como interpretar comandos do operador e converter intenção em ação estruturada, com validação persistente de contratos e padrões do projeto.

## 1) Regra de Precedência

1. Aplicar `CANON-PLAN-000` quando a mudança for relevante para arquitetura/padrões.
2. Cumprir contratos de leitura obrigatória (`READ-*`) antes de executar.
3. Classificar a mensagem em um gatilho canônico (seções 2-6).
4. Selecionar skills e plano de execução conforme roteamento definido.
5. Exigir critérios de aprovação quando o gatilho pedir calibração.

## 2) Gatilho de Retomada

### `{{reiniciar}}`

Objetivo:
- Retomar sessão de desenvolvimento com rastreabilidade completa.

Saída mínima obrigatória:
1. Resumo das últimas atividades executadas.
2. Lista de pendências técnicas e operacionais.
3. Arquivos/instruções órfãos no contexto atual.
4. Itens que exigem validação HITL.
5. Matriz decisória para próxima ação evolutiva.

Checklist de execução:
- Revisar `git status`, mudanças não commitadas e artefatos gerados.
- Revisar contratos `CTX-*`/`WEB-*` impactados.
- Verificar conformidade com Design System e loop semântico.
- Registrar recomendação de próximo passo com risco/impacto.

## 3) Gatilhos de Ação Direcionada

### `{{#atualizar}}`, `{{#refatorar}}`, `{{#corrigir}}`

Objetivo:
- Executar mudança orientada por ação com critério explícito de aprovação.

Contrato de calibração:
- Requer resposta/estado de aprovação:
  - `aprovado`
  - `negado: <feedback para iteracao-inferencia-orientada-pelo-operador>`

Comportamento obrigatório:
- Apresentar escopo da ação antes de editar.
- Executar mudança com validação técnica.
- Retornar resultado + evidência + status de aprovação.
- Se `negado`, abrir nova iteração orientada pelo feedback.

## 4) Gatilhos de Atenção a Contratos

### `{{#adicione}}`, `{{#precisamos}}`, `{{#necessario}}`, `{{#garanta}}`, `{{#certifique}}`

Objetivo:
- Reforçar necessidade de revisitar contratos e padrões estabelecidos.

Comportamento obrigatório:
- Revalidar `READ-CORE-001`, `READ-CONTRACTS-003`, `READ-DESIGN-002` (quando UI), `READ-HITL-004` (quando HITL).
- Declarar explicitamente quais contratos foram revisitados.
- Indicar se há risco de drift e qual mitigação foi aplicada.

## 5) Gatilhos Investigativos

### `{{#revise}}`, `{{#analise}}`, `{{#conduza}}`, `{{#busque}}`

Objetivo:
- Ativar modo investigativo para desvios, homologação, validação prévia e análise de impacto.

Comportamento obrigatório:
- Priorizar achados objetivos (bugs, riscos, regressões, lacunas de teste).
- Produzir matriz de evidências para tomada de decisão.
- Indicar necessidade (ou não) de HITL antes de mudanças finais.

## 6) Gatilhos de Persistência Histórica e Sincronização

### `{{#salve}}`, `{{#crie}}`, `{{#atualize}}`, `{{#sincronize}}`

Objetivo:
- Estabelecer critérios prévios obrigatórios antes de nova intervenção em código/estado.
- Garantir preservação histórica local e sincronização canônica com o repositório remoto.
- Reforçar cultura cross com equivalência semântica aos gatilhos `{{#atualizar}}`, `{{#adicione}}`, `{{#revise}}`.

Dois comandos operacionais finais da iteração:

1. `CMD-LOCAL-SAVE` (acionado por `{{#salve}}`, `{{#crie}}`, `{{#atualize}}`)
2. `CMD-REMOTE-SYNC` (acionado por `{{#sincronize}}`)

#### `CMD-LOCAL-SAVE` (pré-intervenção e pré-commit)

Critérios obrigatórios:
- Consolidar tracking de atividades: executadas, pendentes e órfãs.
- Revalidar contratos `READ-*` aplicáveis ao escopo.
- Definir matriz decisória para itens que dependem de HITL.
- Preparar checkpoint local versionável (mudanças prontas para commit convencional).

Saída esperada:
- `pronto-para-commit`
- `bloqueado: <motivo e ação corretiva>`

#### `CMD-REMOTE-SYNC` (sincronização canônica)

Critérios obrigatórios:
- Garantir que o estado local versionado está íntegro e rastreável.
- Sincronizar branch local com o remoto do GitHub.
- Registrar evidência mínima: hash local, branch e status de sincronização.

Saída esperada:
- `sincronizado`
- `divergente: <motivo e ação corretiva>`

Regra de segurança:
- Não executar sincronização remota se houver pendências críticas de contrato, validação técnica ou HITL obrigatória.

## 7) Roteamento de Skills (Melhor Prática)

Skills globais instaladas e recomendação por cenário:

- `md-docs`: atualizar `README.md`, `AGENTS.md`, `CONTRIBUTING.md`.
- `refine-prompt`: evoluir prompts e contratos de instrução.
- `playwright` + `screenshot`: validação visual/HITL e evidências.
- `frontend-design`/`tailwind-css`: evolução de UI no `mapa-app`.
- `figma`/`figma-implement-design`: tarefas com URL/node do Figma.
- `gh-fix-ci`/`gh-address-comments`: manutenção de PR/checks.

Política de adoção:
- Escolher o menor conjunto de skills que cobre o escopo.
- Declarar skills ativadas no início da execução.
- Não ativar skill sem aderência ao tipo de tarefa.

## 8) Template de Saída Canônica do Agente

Use o seguinte formato para respostas orientadas por gatilho:

```md
Trigger: <gatilho identificado>
Objetivo: <resultado esperado>
Contratos lidos: <READ-* aplicáveis>
Skills usadas: <lista>
Plano: <passos curtos>
Evidências: <build/test/hitl/logs/arquivos>
Status: aprovado | negado: <feedback>
Próxima iteração: <ação recomendada>
```

## 9) Regra Persistente de Validação Semântica

Toda iteração deve fechar o ciclo:
1. Leitura de contratos.
2. Execução orientada por gatilho.
3. Validação técnica + HITL (quando aplicável).
4. Registro de evidências e métricas do ciclo.
5. Sincronização documental (`README`, `AGENTS`, contratos em `prompts/`).
