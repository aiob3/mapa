---
id: agents-hub-v1
ai_update_goal: "Fornecer ponto de entrada estável para o índice canônico de playbooks gerado em .context."
required_inputs:
  - ".context/agents/README.md"
  - "README.md"
  - "AGENTS.md"
success_criteria:
  - "Navegação para o índice canônico de agentes funciona sem ambiguidade."
  - "O hub descreve claramente a convenção de atualização."
---

<!-- agent-update:start:agents-hub -->
# Agent Hub

Este diretório é um atalho estável para navegação humana.  
A fonte canônica dos playbooks scaffolded permanece em `.context/agents/`.

## Índice Canônico

- [Agent Handbook](../.context/agents/README.md)

## Convenção Operacional

- Priorize sempre `.context/agents/README.md` em caso de divergência.
- Regenerar scaffold: `node dist/index.js init <repo-path> agents --output ./.context`
- Atualizar conteúdos com LLM: `node dist/index.js fill <repo-path> --output ./.context`
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Mantenha este arquivo curto e focado em navegação; detalhes devem ficar no índice canônico.
