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
4. [Validação MCP Docker (Agente)](#validacao-mcp-docker-camada-do-agente)

Fluxo mínimo:
`normalize_input -> resolve_intent -> idempotency_guard -> execute_bundle -> write_checkpoint`.
<!-- agent-update:end -->

<!-- agent-update:start:mcp-docker-validation -->
## Validação MCP Docker (Camada do Agente)

Objetivo operacional:
Destravar o uso de recursos MCP via Docker no agente, priorizando funcionalidade real da abstração (`MCP_DOCKER`) sobre paridade entre CLIs Linux/Windows.

Critério de aceite:
`Resolvido` quando a Camada A (abstração do agente) passa em duas rodadas consecutivas sem erro. Falha parcial da Camada B é classificada como degradação local de CLI, não blocker do agente.

### Pré-condições de sessão saudável

1. Configuração ativa inclui servidor MCP Docker em `~/.codex/config.toml`:

```toml
[mcp_servers.MCP_DOCKER]
command = 'docker.exe'
args = ['mcp', 'gateway', 'run']
```

2. Pelo menos uma chamada `MCP_DOCKER` retorna payload estruturado (JSON/texto).
3. Smokes A/C passam em duas rodadas seguidas.

### Evidência de execução (UTC)

Data-base da validação:
`2026-02-27T04:18:26Z`

Resultado por camada:

| Camada | Prova | Resultado |
|---|---|---|
| A (rodada 1) | `MCP_DOCKER.get_current_time(UTC)` | OK: sucesso (`datetime` retornado) |
| A (rodada 1) | `MCP_DOCKER.convert_time(UTC -> America/Sao_Paulo)` | OK: sucesso (`-3.0h`) |
| A (rodada 1) | `MCP_DOCKER.fetch(https://example.com)` | OK: sucesso (conteúdo textual retornado) |
| B (gateway/catalog) | `docker.exe mcp tools ls` | OK: sucesso (`53 tools`) |
| B (auxiliar Linux) | `docker mcp tools ls` | WARN: degradação local (`Docker Desktop is not running`) |
| C (rodada 2) | Repetição integral da Camada A em `2026-02-27T04:18:54Z` | OK: sucesso (3/3) |

Diagnóstico final:
`DESBLOQUEADO` para uso do agente. Divergência de CLI Linux permanece como item operacional não bloqueante.

### Comandos e provas canônicas

Camada A/C (abstração do agente): usar tools `MCP_DOCKER` diretamente.

Camada B (gateway/catalog):

```bash
docker.exe mcp client ls
docker.exe mcp tools ls
docker mcp client ls
docker mcp tools ls
```

Interpretação padrão:
se `docker.exe mcp` passar e `MCP_DOCKER` no agente passar, considerar ambiente funcional para execução do agente.

### Checklist operacional mínimo (início de sessão)

1. Confirmar `MCP_DOCKER` no `~/.codex/config.toml`.
2. Executar `MCP_DOCKER.get_current_time(UTC)`.
3. Executar `MCP_DOCKER.convert_time(UTC -> America/Sao_Paulo)`.
4. Executar `MCP_DOCKER.fetch(https://example.com)`.
5. Executar `docker.exe mcp tools ls` e registrar contagem de tools.

### Sinais de regressão e ação

1. Sinal: falha em qualquer tool da Camada A.
Ação: repetir rodada A completa; se persistir, classificar como blocker do agente.
2. Sinal: `docker.exe mcp tools ls` falha.
Ação: validar Docker Desktop/Toolkit e reconectar cliente (`docker.exe mcp client connect codex --global`).
3. Sinal: somente `docker mcp` (Linux) falha.
Ação: registrar como degradação local de CLI e seguir com `MCP_DOCKER` + `docker.exe mcp` como fonte canônica.

### Procedimento de revalidação

1. Rodar Camada A (3 smokes).
2. Rodar Camada B (CLI canônico + auxiliar Linux).
3. Aguardar curto intervalo.
4. Repetir Camada A (Camada C).
5. Publicar diagnóstico com status `BLOQUEADO` ou `DESBLOQUEADO`.
<!-- agent-update:end -->
