---
id: local-docker-architecture-snapshot-state-db-007
ai_update_goal: "Documentar snapshot YAML da arquitetura local para replicação Docker com rastreabilidade operacional."
required_inputs:
  - "scripts/snapshot-local-docker-architecture-v1.mjs"
  - "infra/clickhouse/docker-compose.yml"
  - "supabase/migrations/*"
success_criteria:
  - "Snapshot local em YAML gerado com comando único."
  - "Arquivos docker-compose e env template publicados no pacote de snapshot."
  - "Processo de replicação local descrito com passos determinísticos."
---

<!-- agent-update:start:local-docker-architecture-snapshot-state-db-007 -->
# Local Docker Architecture Snapshot (STATE-DB-007)

## Objetivo

Gerar e versionar um snapshot operacional da arquitetura local (Supabase + ClickHouse + middleware Syn) em arquivos `.yaml`, para permitir replicação consistente do ambiente via Docker.

## Comando canônico

```bash
npm run snapshot:docker:local
```

Saída esperada:

1. `.context/runtime/snapshots/local-docker-<ts_sp>/docker-architecture-snapshot.yaml`
2. `.context/runtime/snapshots/local-docker-<ts_sp>/docker-compose.replica.v1.yaml`
3. `.context/runtime/snapshots/local-docker-<ts_sp>/docker-compose.replica.override.local.yaml`
4. `.context/runtime/snapshots/local-docker-<ts_sp>/docker-env.template.yaml`
5. `.context/runtime/snapshots/local-docker-<ts_sp>/README.md`
6. `.context/runtime/reports/local-docker-snapshot-<ts_sp>.json`

## Conteúdo do snapshot

### 1) `docker-architecture-snapshot.yaml`

Inclui:

1. endpoints locais Supabase (`api/rest/graphql/studio`);
2. resolução de porta publicada do ClickHouse (detectada via Docker);
3. contexto de gate (paridade de migrations local/remoto);
4. segredos mascarados para auditoria sem exposição.

### 2) `docker-compose.replica.v1.yaml`

Stack base de replicação:

1. `postgres:16` para base transacional;
2. `clickhouse:24.8` para camada semântica/sinais;
3. `syn-middleware` (`node:20-alpine`) para integração Supabase -> ClickHouse.

### 3) `docker-compose.replica.override.local.yaml`

Override com porta HTTP real do ClickHouse no host local (ex.: `18123` quando `8123` já estiver em uso).

### 4) `docker-env.template.yaml`

Template de variáveis obrigatórias em YAML para bootstrap reproduzível.

## Execução de réplica local

Dentro da pasta do snapshot:

```bash
docker compose \
  -f docker-compose.replica.v1.yaml \
  -f docker-compose.replica.override.local.yaml \
  --env-file .env up -d
```

## Regras operacionais

1. Snapshot sempre deve ser gerado após validação de reconstrução (`db reset`, ingestão e sync semântico).
2. Não versionar segredos puros; apenas referências e valores mascarados.
3. Se houver migration local pendente de remoto, marcar o snapshot como `parity=pending_remote`.
4. Associar snapshot ao checkpoint runtime da iteração (`ts_sp` canônico).

## Evidência mínima para `#salve` + `#sincronize`

1. report `local-docker-snapshot-<ts_sp>.json`;
2. diretório `local-docker-<ts_sp>/` completo;
3. checkpoint runtime referenciando o snapshot.
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Este documento cobre snapshot arquitetural local para replicação Docker e não substitui o runbook de replicação externa Hostinger.
