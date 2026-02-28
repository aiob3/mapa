---
id: runtime-snapshots-index-v1
ai_update_goal: "Indexar snapshots de arquitetura local em YAML para replicação Docker."
required_inputs:
  - "scripts/snapshot-local-docker-architecture-v1.mjs"
success_criteria:
  - "Padrão de diretório de snapshots documentado."
  - "Operador encontra rapidamente o snapshot mais recente."
---

<!-- agent-update:start:runtime-snapshots-index -->
# Runtime Snapshots Index

Diretório de snapshots YAML da arquitetura local para replicação via Docker.

## Convenção

1. Snapshot por execução: `local-docker-<ts_sp>/`
2. `ts_sp` obrigatório no formato `yyMMdd-HHmmss`
3. Arquivos mínimos por snapshot:
   - `docker-architecture-snapshot.yaml`
   - `docker-compose.replica.v1.yaml`
   - `docker-compose.replica.override.local.yaml`
   - `docker-env.template.yaml`
   - `README.md`

## Geração

```bash
npm run snapshot:docker:local
```

## Relatório vinculado

Cada snapshot deve possuir relatório JSON em:

`.context/runtime/reports/local-docker-snapshot-<ts_sp>.json`
<!-- agent-update:end -->

