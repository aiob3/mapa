---
id: runtime-index-v1
ai_update_goal: "Centralizar os artefatos de runtime semântico para reinicialização idempotente e avaliação contínua."
required_inputs:
  - ".context/runtime/chunk-manifest.md"
  - ".context/runtime/atomic-actions.md"
  - ".context/runtime/checkpoint-template.md"
success_criteria:
  - "Operador encontra o fluxo de runtime em um único índice."
---

<!-- agent-update:start:runtime-index -->
# Runtime Semantic Index

1. [Chunk Manifest](./chunk-manifest.md)
2. [Atomic Actions](./atomic-actions.md)
3. [Checkpoint Template](./checkpoint-template.md)

Fluxo mínimo:
`normalize_input -> resolve_intent -> idempotency_guard -> execute_bundle -> write_checkpoint`.
<!-- agent-update:end -->
