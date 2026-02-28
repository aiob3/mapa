# Local Docker Snapshot (260228-073341)

Arquivos gerados para replicar a arquitetura local validada.

## Arquivos

1. `docker-architecture-snapshot.yaml`: inventário da stack local e contexto de gate.
2. `docker-compose.replica.v1.yaml`: compose base para réplica local.
3. `docker-compose.replica.override.local.yaml`: override de portas locais detectadas.
4. `docker-env.template.yaml`: variáveis mínimas em formato YAML.

## Uso

```bash
docker compose -f docker-compose.replica.v1.yaml -f docker-compose.replica.override.local.yaml --env-file .env up -d
```
