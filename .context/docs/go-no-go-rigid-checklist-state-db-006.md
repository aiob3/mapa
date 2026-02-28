---
id: go-no-go-rigid-checklist-state-db-006
ai_update_goal: "Definir checklist rígido de decisão GO/NO-GO para nova carga manual real de deals."
required_inputs:
  - ".context/docs/eligibility-criteria-v1-state-db-006.md"
  - ".context/docs/canonical-data-norm-deals-v1-state-db-006.md"
  - ".context/docs/manual-csv-ingestion-runbook-state-db-006.md"
  - ".context/docs/state-db-006-ingestion-initial-postmortem.md"
  - "scripts/validate-syn-go-no-go-v1.mjs"
success_criteria:
  - "Todos os gates bloqueantes formalizados com evidência."
  - "Decisão final GO/NO-GO é determinística."
  - "Checklist suporta auditoria e assinatura operacional."
---

<!-- agent-update:start:go-no-go-rigid-checklist-state-db-006 -->
# GO/NO-GO Rigid Checklist (STATE-DB-006)

## 1) Política de bloqueio

Regra mandatória:

1. `GO` somente se 100% dos gates bloqueantes estiverem `PASS`.
2. Qualquer `FAIL` bloqueante => `NO-GO`.
3. Warnings não convertidos em ação corretiva documentada também resultam em `NO-GO`.

## 2) Gate matrix

| gate_id | Descrição | Tipo | Evidência exigida | Status atual |
| --- | --- | --- | --- | --- |
| `GATE-001` | Post-mortem aprovado com ações corretivas e owners | blocker | documento post-mortem atualizado | `PASS` |
| `GATE-002` | Matriz de elegibilidade transacional v1 aprovada | blocker | doc de elegibilidade com status por ativo | `PASS` |
| `GATE-003` | Norma canônica v1 (deals) aprovada | blocker | doc de norma canônica | `PASS` |
| `GATE-004` | Runbook de ingestão manual aprovado | blocker | runbook + fluxo executável | `PASS` |
| `GATE-005` | Segurança de fronteira validada (`backend-only`) | blocker | `npm run security:guardrails` | `PASS` |
| `GATE-006` | Contratos de publicação válidos (`api_syn_*_v1`) | blocker | `npm run syn:validate:post-migration` | `PASS` |
| `GATE-007` | Reconciliação origem vs publicado aceita | blocker | saída de reconciliação por lote | `PASS_COM_RESSALVA` |
| `GATE-008` | Isolamento semântico para escopo v1 deals (`entity_kind='deal'`) | blocker | evidência de filtro/contrato na camada publicada | `BLOCKED_INFRA` |
| `GATE-009` | Pacote de evidências completo e checkpoint final | blocker | diretório de evidências + checkpoint runtime | `PASS` |

Ressalvas ativas:

1. `GATE-007`: reconciliação retornou `only_published_ids=1` (`cv2_gate_test_ok_1771997908`), classificado como artefato histórico de teste.
2. `GATE-008`: bloqueado por impossibilidade de aplicar migration remota `20260228053500` enquanto o pooler está em `Circuit breaker open`.

## 3) Evidence matrix (mínima)

| Artefato | Origem | Timestamp | Owner | Link/checksum |
| --- | --- | --- | --- | --- |
| `01-security-guardrails.log` | `npm run security:guardrails` | `260228-054254` | Security | `.context/runtime/evidence/deals-go-no-go-260228-054254/01-security-guardrails.log` |
| `05-syn-pattern-contracts.log` | `npm run test -- syn-pattern-contracts.test.ts` | `260228-054254` | Backend | `.context/runtime/evidence/deals-go-no-go-260228-054254/05-syn-pattern-contracts.log` |
| `10-raw-dry-run.json` | `npm run syn:ingest:raw -- --dry-run` | `260228-054254` | Data Ops | `.context/runtime/evidence/deals-go-no-go-260228-054254/10-raw-dry-run.json` |
| `20-raw-ingest.json` | `npm run syn:ingest:raw` | `260228-054254` | Data Ops | `.context/runtime/evidence/deals-go-no-go-260228-054254/20-raw-ingest.json` |
| `31-reconciliation.json` | reconciliação lote | `260228-054254` | Database | `.context/runtime/evidence/deals-go-no-go-260228-054254/31-reconciliation.json` |
| `50-post-migration-final.json` | validação final pós-ingestão | `260228-054254` | Backend | `.context/runtime/evidence/deals-go-no-go-260228-054254/50-post-migration-final.json` |
| `55-deal-scope-validation.json` | `npm run syn:validate:deal-scope` | `260228-054254` | Database | `.context/runtime/evidence/deals-go-no-go-260228-054254/55-deal-scope-validation.json` |
| `60-go-no-go-full.json` | `npm run syn:go-no-go:v1` | `260228-054254` | DevOps | `.context/runtime/evidence/deals-go-no-go-260228-054254/60-go-no-go-full.json` |
| migration apply blocker | tentativas `supabase db push` | `260228-054254` | DevOps | `.context/runtime/evidence/deals-go-no-go-260228-054254/15-migration-apply-blocker.txt` |
| `go-no-go-v1-*.json` | relatório do gate | `260228-054829` | DevOps | `.context/runtime/reports/go-no-go-v1-260228-054829.json` |
| `checkpoint runtime` | `.context/runtime/checkpoints` | `260228-054841` | Operação | `.context/runtime/checkpoints/260228-054841-validar.md` |

## 4) Decisão formal (estado atual)

| Decisão | Data-hora | Responsáveis | Observações |
| --- | --- | --- | --- |
| `NO-GO` | `2026-02-28 05:48:41 -0300` | Operação + Database + Security | Gate completo reexecutado e bloqueado por migration pendente no remoto (`20260228053500`), mantendo `GATE-008` em `BLOCKED_INFRA` |

## 5) Plano de reversão/containment

Se houver falha após início da carga:

1. Bloquear promoção para próxima etapa.
2. Classificar incidente e causa raiz.
3. Abrir checkpoint `retomar` com `status=corrigir`.
4. Executar limpeza/rollback conforme runbook.
5. Reexecutar gate completo do início.

## 6) Assinaturas operacionais

| Papel                | Nome | Data | Assinatura |
|----------------------|------|------|------------|
| Operação             |      |      |            |
| Database Specialist  |      |      |            |
| Security Auditor     |      |      |            |
| Architect Specialist |      |      |            |
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Não abrir janela de carga real sem atualizar este checklist com evidências da execução corrente.
