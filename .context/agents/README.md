```markdown
---
ai_update_goal: "Maintain an up-to-date index of all AI agent playbooks and their responsibilities."
required_inputs:
  - "List of available markdown files in agents/"
  - "Repository context and tech stack (mapa-app, supabase)"
success_criteria:
  - "All available agents are listed with clear descriptions aligned with the repo structure."
  - "Usage instructions incorporate the agent-update and agent-fill workflow."
  - "Links to related resources are accurate and reflect the current directory structure."
---

<!-- agent-update:start:agent_handbook_index -->
# Agent Handbook

This directory contains ready-to-customize playbooks for AI agents collaborating on the repository. These playbooks define the personas, responsibilities, and constraints for AI assistants working across our stack (including `mapa-app`, `supabase`, and shared `src`).

## Available Agents

- [Code Reviewer](./code-reviewer.md) — Review code changes for quality, style, and best practices across all repository packages.
- [Bug Fixer](./bug-fixer.md) — Analyze bug reports, trace error messages, and implement fixes.
- [Feature Developer](./feature-developer.md) — Implement new features according to specifications in both frontend and backend.
- [Refactoring Specialist](./refactoring-specialist.md) — Identify code smells, extract shared modules to `src/`, and improve maintainability.
- [Test Writer](./test-writer.md) — Write comprehensive unit and integration tests for app and database logic.
- [Documentation Writer](./documentation-writer.md) — Create and maintain clear, comprehensive documentation in the `docs/` directory.
- [Performance Optimizer](./performance-optimizer.md) — Identify performance bottlenecks in mobile rendering or database queries.
- [Security Auditor](./security-auditor.md) — Identify security vulnerabilities, particularly in Supabase RLS policies and API endpoints.
- [Backend Specialist](./backend-specialist.md) — Design and implement server-side architecture, Edge Functions, and integrations.
- [Frontend Specialist](./frontend-specialist.md) — Design and implement user interfaces and client-side logic.
- [Architect Specialist](./architect-specialist.md) — Design overall system architecture, repository structure, and integration patterns.
- [Devops Specialist](./devops-specialist.md) — Design and maintain CI/CD pipelines and manage the `scripts/` directory.
- [Database Specialist](./database-specialist.md) — Design, optimize, and migrate Supabase PostgreSQL database schemas.
- [Mobile Specialist](./mobile-specialist.md) — Develop and maintain the `mapa-app` native/cross-platform mobile application.

## How To Use These Playbooks

To ensure consistency and prevent context loss, follow these steps when deploying an AI agent:

1. **Select the Agent**: Pick the playbook that best matches your task from the list above.
2. **Review Front Matter**: Read the YAML front matter (`ai_update_goal`, `required_inputs`, `success_criteria`) at the top of the target file to ensure you have the necessary context.
3. **Fill Placeholders**: Locate any unresolved `<!-- agent-fill:... -->` markers in the playbook or target documentation and replace them with concrete project details. Remove the wrapper once filled.
4. **Edit Within Boundaries**: When updating documentation or playbooks, make changes strictly inside the matching `<!-- agent-update:start:... -->` and `<!-- agent-update:end -->` blocks.
5. **Execute**: Share the finalized playbook/prompt with your AI assistant.
6. **Capture Learnings**: Document any architectural decisions, new scripts, or prompt improvements in the relevant `docs/` or `prompts/` directory so future runs improve.

## Related Resources

- [Documentation Index](../docs/README.md)
- [Prompts Library](../prompts/)
- [Automation Scripts](../scripts/)
- [Code Snippets](../snippets/)
- [Contributor Guidelines](../CONTRIBUTING.md)
<!-- agent-update:end -->
```
