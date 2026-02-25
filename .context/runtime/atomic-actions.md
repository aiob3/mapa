---
id: runtime-atomic-actions-v1
ai_update_goal: "Definir ações atômicas determinísticas para execução idempotente por intenção canônica."
required_inputs:
  - ".context/runtime/chunk-manifest.md"
  - "prompts/trigger_protocol.md"
success_criteria:
  - "Toda execução canônica é decomposta em ações atômicas com I/O explícito."
  - "A ordem de execução permanece estável entre sessões."
---

<!-- agent-update:start:atomic-actions -->
# Atomic Actions (Canônico)

## Pipeline Determinístico

| Ordem | Action ID | Entrada | Saída |
|---|---|---|---|
| 1 | `ATOM-001 normalize_input` | mensagem bruta do operador | `normalized_input` |
| 2 | `ATOM-002 resolve_intent` | `normalized_input` | `intent_token` |
| 3 | `ATOM-003 compute_scope_key` | `intent_token`, contexto ativo | `scope_key` |
| 4 | `ATOM-004 idempotency_guard` | `intent_token`, `scope_key`, `head_hash` | `idem_key`, `guard_result` |
| 5 | `ATOM-005 load_chunk_set` | `intent_token`, manifesto | `chunk_set` |
| 6 | `ATOM-006 execute_bundle` | `intent_token`, `chunk_set` | `evidences`, `metrics` |
| 7 | `ATOM-007 write_checkpoint` | `idem_key`, `metrics`, `evidences` | `checkpoint_record` |
| 8 | `ATOM-008 emit_canonical_output` | `checkpoint_record` | resposta canônica |

## Regras Operacionais

1. Não pular ações intermediárias.
2. Não executar `ATOM-006` quando `guard_result = ja_aplicado`.
3. Toda saída de `ATOM-008` deve incluir `ts_sp`.
4. Toda execução deve registrar `status` em `estavel|monitorar|corrigir`.
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Se uma ação nova for adicionada, atualize a ordem e o contrato de entrada/saída de toda a cadeia.
