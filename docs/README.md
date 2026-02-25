---
id: docs-hub-v1
ai_update_goal: "Fornecer ponto de entrada estável para o índice canônico de documentação gerado em .context."
required_inputs:
  - ".context/docs/README.md"
  - "README.md"
  - "AGENTS.md"
success_criteria:
  - "Navegação para o índice canônico funciona sem ambiguidade."
  - "O hub descreve claramente a convenção de atualização."
---

<!-- agent-update:start:docs-hub -->
# Documentation Hub

Este diretório é um atalho estável para navegação humana.  
A fonte canônica dos guias scaffolded permanece em `.context/docs/`.

## Índice Canônico

- [Context Docs Index](../.context/docs/README.md)

## Convenção Operacional

- Priorize sempre `.context/docs/README.md` em caso de divergência.
- Regenerar scaffold: `node dist/index.js init <repo-path> docs --output ./.context`
- Atualizar conteúdos com LLM: `node dist/index.js fill <repo-path> --output ./.context`
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Mantenha este arquivo curto e focado em navegação; detalhes devem ficar no índice canônico.
