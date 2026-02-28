<!-- agent-update:start:docs-index -->
# Documentation Index

Welcome to the repository knowledge base. Start with the project overview, then dive into specific guides as needed.

## Core Guides

- [Project Overview](./project-overview.md)
- [Architecture Notes](./architecture.md)
- [Development Workflow](./development-workflow.md)
- [Testing Strategy](./testing-strategy.md)
- [Glossary & Domain Concepts](./glossary.md)
- [Data Flow & Integrations](./data-flow.md)
- [Security & Compliance Notes](./security.md)
- [Tooling & Productivity Guide](./tooling.md)
- [UI Pattern Normalization (PLAN-NORMA-UI-002)](./ui-pattern-normalization-plan-norma-ui-002.md)
- [Syn Analytics Widget Catalog (STATE-DB-002)](./syn-analytics-widget-catalog-state-db-002.md)
- [Legacy CRM Ingestion Analysis (STATE-DB-003)](./legacy-crm-ingestion-analysis-state-db-003.md)
- [ClickHouse Activation Runbook (STATE-DB-004)](./clickhouse-activation-state-db-004.md)
- [ClickHouse Role in Architecture (STATE-DB-004)](./clickhouse-role-architecture-state-db-004.md)
- [Syn Post-Migration Validation Checklist (STATE-DB-004)](./syn-post-migration-validation-checklist-state-db-004.md)
- [Syn Canonical Pattern Catalog (STATE-DB-005)](./syn-canonical-pattern-catalog-state-db-005.md)
- [Architecture Visual Portal (STATE-DB-006)](./architecture-visual-portal-state-db-006.md)
- [Ingestion Initial Post-Mortem (STATE-DB-006)](./state-db-006-ingestion-initial-postmortem.md)
- [Eligibility Criteria v1 (STATE-DB-006)](./eligibility-criteria-v1-state-db-006.md)
- [Canonical Data Norm v1 - Deals (STATE-DB-006)](./canonical-data-norm-deals-v1-state-db-006.md)
- [Manual CSV Ingestion Runbook (STATE-DB-006)](./manual-csv-ingestion-runbook-state-db-006.md)
- [GO/NO-GO Rigid Checklist (STATE-DB-006)](./go-no-go-rigid-checklist-state-db-006.md)
- [Replication Readiness v1 (STATE-DB-007)](./replication-readiness-state-db-007.md)
- [Replication Runbook v1 Hostinger (STATE-DB-007)](./replication-runbook-v1-hostinger.md)
- [Replication Reconciliation Contract v1 (STATE-DB-007)](./replication-reconciliation-contract-v1.md)
- [Local Docker Architecture Snapshot (STATE-DB-007)](./local-docker-architecture-snapshot-state-db-007.md)
- [UI Components & Pattern Catalog](./patterns/ui-components-catalog.md)

## Repository Snapshot

- `agents/` — AI agent playbooks and prompts.
- `docs/` — Living documentation produced by this tool.
- `mapa-app/` — Main application directory.
- `mapa-visual/` — Portal visual executivo para blueprint de arquitetura.
- `prompts/` — AI prompt templates and system instructions.
- `scripts/` — Utility and automation scripts.
- `snippets/` — Reusable code snippets.
- `src/` — TypeScript source files and CLI entrypoints.
- `supabase/` — Backend configurations and database migrations.
- `AGENTS.md` — AI Agent directory and overview.
- `CONTRIBUTING.md` — Guidelines for contributing to the repository.
- `package.json` / `package-lock.json` — Node.js dependencies and project scripts.
- `tsconfig.json` / `jest.config.js` — TypeScript and testing configurations.
- `README.md` — Main repository entrypoint.
- `LICENSE` — Project license information.

## Document Map

| Guide | File | AI Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | `project-overview.md` | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | `architecture.md` | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Development Workflow | `development-workflow.md` | agent-update:development-workflow | Branching rules, CI config, contributing guide |
| Testing Strategy | `testing-strategy.md` | agent-update:testing-strategy | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | `glossary.md` | agent-update:glossary | Business terminology, user personas, domain rules |
| Data Flow & Integrations | `data-flow.md` | agent-update:data-flow | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | `security.md` | agent-update:security | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | `tooling.md` | agent-update:tooling | CLI scripts, IDE configs, automation workflows |
| UI Pattern Normalization (PLAN-NORMA-UI-002) | `ui-pattern-normalization-plan-norma-ui-002.md` | agent-update:ui-pattern-normalization | Routes inventory, pattern IDs, adoption matrix, HITL checklist |
| Syn Analytics Widget Catalog (STATE-DB-002) | `syn-analytics-widget-catalog-state-db-002.md` | agent-update:syn-widget-catalog | Widget IDs PAT-WIDGET-*, composição modal/rota e contratos de binding `api_syn_*_v1` |
| Legacy CRM Ingestion Analysis (STATE-DB-003) | `legacy-crm-ingestion-analysis-state-db-003.md` | agent-update:legacy-crm-state-db-003 | Exports Pipedrive (`deals/leads/activities`), schema `canonical_events`, estratégia Supabase + ClickHouse |
| ClickHouse Activation Runbook (STATE-DB-004) | `clickhouse-activation-state-db-004.md` | agent-update:clickhouse-activation-state-db-004 | Bootstrap de instância ClickHouse, schema vetorial/sinais e fluxo de integração com `semantic_layer` |
| ClickHouse Role in Architecture (STATE-DB-004) | `clickhouse-role-architecture-state-db-004.md` | agent-update:clickhouse-role-architecture-state-db-004 | Papel arquitetural incorporado, limites de responsabilidade e contrato operacional Supabase -> Middleware -> ClickHouse -> Syn |
| Syn Post-Migration Validation Checklist (STATE-DB-004) | `syn-post-migration-validation-checklist-state-db-004.md` | agent-update:syn-post-migration-validation-checklist-state-db-004 | Checklist/script único para validar migrations e RPCs `api_syn_*_v1` com token `authenticated` e mitigação automática de inconsistências |
| Syn Canonical Pattern Catalog (STATE-DB-005) | `syn-canonical-pattern-catalog-state-db-005.md` | agent-update:syn-canonical-pattern-catalog-state-db-005 | Catálogo PAT-SYN-* versionado, matriz pattern->origem, SSOT de score/status, taxonomia semântica e contratos de RPC |
| Architecture Visual Portal (STATE-DB-006) | `architecture-visual-portal-state-db-006.md` | agent-update:architecture-visual-portal-state-db-006 | Portal `mapa-visual` com 3 vistas executivas (dados, mapa-app e mapa-app x dados) e snapshot arquitetural gerado por script |
| Ingestion Initial Post-Mortem (STATE-DB-006) | `state-db-006-ingestion-initial-postmortem.md` | agent-update:state-db-006-ingestion-initial-postmortem | Linha do tempo forense, falhas por taxonomia e ações corretivas obrigatórias para pré-carga real |
| Eligibility Criteria v1 (STATE-DB-006) | `eligibility-criteria-v1-state-db-006.md` | agent-update:eligibility-criteria-v1-state-db-006 | Hard gates/soft gates de elegibilidade transacional com status por ativo canônico |
| Canonical Data Norm v1 - Deals (STATE-DB-006) | `canonical-data-norm-deals-v1-state-db-006.md` | agent-update:canonical-data-norm-deals-v1-state-db-006 | SSOT de contrato de dados para ingestão manual de deals, mapeamentos e SLOs |
| Manual CSV Ingestion Runbook (STATE-DB-006) | `manual-csv-ingestion-runbook-state-db-006.md` | agent-update:manual-csv-ingestion-runbook-state-db-006 | Fluxo operacional completo (pré-check, dry-run, ingestão, reconciliação e contenção) |
| GO/NO-GO Rigid Checklist (STATE-DB-006) | `go-no-go-rigid-checklist-state-db-006.md` | agent-update:go-no-go-rigid-checklist-state-db-006 | Gate bloqueante para autorização de carga real com evidências e decisão formal |
| Replication Readiness v1 (STATE-DB-007) | `replication-readiness-state-db-007.md` | agent-update:replication-readiness-state-db-007 | Critérios bloqueantes para elegibilidade de replicação externa (Hostinger VPS) |
| Replication Runbook v1 Hostinger (STATE-DB-007) | `replication-runbook-v1-hostinger.md` | agent-update:replication-runbook-v1-hostinger | Execução ponta a ponta do ciclo snapshot->import->reconciliação->gate |
| Replication Reconciliation Contract v1 (STATE-DB-007) | `replication-reconciliation-contract-v1.md` | agent-update:replication-reconciliation-contract-v1 | Métricas/cortes determinísticos para classificar delta de replicação |
| Local Docker Architecture Snapshot (STATE-DB-007) | `local-docker-architecture-snapshot-state-db-007.md` | agent-update:local-docker-architecture-snapshot-state-db-007 | Snapshot YAML da arquitetura local e bundle docker-compose para replicação |

<!-- agent-readonly:guidance -->
## AI Update Checklist

1. Gather context with `git status -sb` plus the latest commits touching `docs/` or `agents/`.
2. Compare the current directory tree against the table above; add or retire rows accordingly.
3. Update cross-links if guides moved or were renamed; keep anchor text concise.
4. Record sources consulted inside the commit or PR description for traceability.

<!-- agent-readonly:sources -->
## Acceptable Sources

- Repository tree and `package.json` scripts for canonical command names.
- Maintainer-approved issues, RFCs, or product briefs referenced in the repo.
- Release notes or changelog entries that announce documentation changes.

<!-- agent-update:end -->
