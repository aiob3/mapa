---
id: runtime-checkpoint-template-v1
ai_update_goal: "Padronizar checkpoint persistente para retomada determinística entre sessões."
required_inputs:
  - ".context/runtime/chunk-manifest.md"
  - ".context/runtime/atomic-actions.md"
success_criteria:
  - "Checkpoint contém campos mínimos para idempotência e avaliação de eficácia."
  - "Formato é curto e versionável."
---

<!-- agent-update:start:checkpoint-template -->
# Checkpoint Template (Persistente)

Use este template ao fechar cada iteração relevante:

```md
ts_sp: <yyMMdd-HHmmss>
branch: <branch>
head_hash: <short-hash>
intent_token: <retomar|estruturar|enriquecer|planejar|validar|persistir>
scope_key: <escopo-normalizado>
idem_key: <intent_token>:<scope_key>:<head_hash>
guard_result: <executado|ja_aplicado>

metrics:
  reset_duplication_rate: <0..1>
  ambiguity_escalation_rate: <0..1>
  context_reload_token_cost: <0..1>
  session_carryover_success: <0..1>
  efficacy_score_E: <0..1>

status: <estavel|monitorar|corrigir>
evidences:
  - <build/test/hitl/log/arquivo>
next_intent: <token previsto>
notes: <observações curtas>
```
<!-- agent-update:end -->

<!-- agent-readonly:guidance -->
Mantenha o checkpoint enxuto. Não duplicar narrativas longas; apenas dados úteis para retomada idempotente.
