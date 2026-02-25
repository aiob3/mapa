---
id: runtime-chunk-manifest-v1
ai_update_goal: "Centralizar chunking canônico para carregamento determinístico de contexto e reinicialização idempotente."
required_inputs:
  - "README.md"
  - "prompts/trigger_protocol.md"
  - "AGENTS.md"
success_criteria:
  - "Cada intenção canônica aponta para um conjunto mínimo de chunks."
  - "A carga de contexto para reinício segue mapeamento determinístico."
---

<!-- agent-update:start:chunk-manifest -->
# Chunk Manifest (Canônico)

## Objetivo

Definir o conjunto mínimo de chunks por intenção canônica para evitar sobrecarga de contexto e reduzir deriva entre sessões.

## Chunks Primários

| Chunk | Escopo | Fonte primária |
|---|---|---|
| `CHUNK-BOOT` | inicialização, prioridade de intents, idempotência | `prompts/trigger_protocol.md` |
| `CHUNK-CONTRACTS` | contratos READ-*, CTX-*, WEB-* | `README.md`, `AGENTS.md` |
| `CHUNK-CLI` | superfície ativa `init/fill/plan` | `README.md`, `src/index.ts` |
| `CHUNK-HITL` | checklist de build/preview/evidências | `README.md` |
| `CHUNK-RUNTIME` | loopback, checkpoint, predição | `prompts/trigger_protocol.md`, `./checkpoint-template.md` |
| `CHUNK-DS` | design system/UI rules | `README.md` |

## Mapeamento Intenção -> Carga Mínima

| intent_token | Chunks obrigatórios | Chunks condicionais |
|---|---|---|
| `retomar` | `CHUNK-BOOT`, `CHUNK-CONTRACTS`, `CHUNK-RUNTIME` | `CHUNK-HITL` |
| `estruturar` | `CHUNK-BOOT`, `CHUNK-CONTRACTS`, `CHUNK-CLI` | `CHUNK-RUNTIME` |
| `enriquecer` | `CHUNK-BOOT`, `CHUNK-CONTRACTS`, `CHUNK-CLI` | `CHUNK-RUNTIME` |
| `planejar` | `CHUNK-BOOT`, `CHUNK-CONTRACTS`, `CHUNK-RUNTIME` | `CHUNK-HITL`, `CHUNK-DS` |
| `validar` | `CHUNK-BOOT`, `CHUNK-CONTRACTS`, `CHUNK-HITL` | `CHUNK-DS`, `CHUNK-RUNTIME` |
| `persistir` | `CHUNK-BOOT`, `CHUNK-CONTRACTS`, `CHUNK-RUNTIME` | `CHUNK-HITL` |

## Regra de Idempotência

1. Calcular `idem_key = <intent_token>:<scope_key>:<head_hash>`.
2. Se `idem_key` igual ao último checkpoint e dentro da janela de idempotência, não reexecutar bundle.
3. Responder com `ja_aplicado` e `ts_sp` do último checkpoint.
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Atualize este manifesto sempre que a superfície de comandos ou contratos mudar.
