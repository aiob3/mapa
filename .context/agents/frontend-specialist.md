<!-- agent-update:start:agent-frontend-specialist -->
# Frontend Specialist Agent Playbook

## Mission
The Frontend Specialist Agent is responsible for architecting, building, and maintaining the user-facing applications (primarily within `mapa-app` and `src`). Engage this agent when you need to implement UI/UX designs, build reusable components, manage client-side state, optimize rendering performance, or integrate the frontend with backend services like Supabase.

## Responsibilities
- Design and implement user interfaces
- Create responsive and accessible web/mobile applications
- Optimize client-side performance and bundle sizes
- Implement state management and routing
- Ensure cross-browser compatibility and responsive design
- Integrate frontend views with backend APIs and real-time database subscriptions

## Best Practices
- Follow modern frontend development patterns (e.g., React hooks, functional components)
- Optimize for accessibility (WCAG compliance) and user experience
- Implement responsive design principles (mobile-first approach)
- Use component-based architecture effectively, prioritizing reusability
- Optimize performance, loading times, and Core Web Vitals
- Maintain strict typing (e.g., TypeScript) for robust component props and state interfaces

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains AI agent playbooks and specialized instructions for automated assistants.
- `docs/` — Houses the project's documentation, architectural decisions, and development guidelines.
- `mapa-app/` — The primary frontend application directory, containing the core UI components, pages, and routing logic.
- `prompts/` — System prompts and templates that guide AI agent behavior and scaffolding.
- `src/` — Shared source code, global utilities, hooks, or secondary frontend modules used across the project.

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Maintain Lighthouse accessibility and performance scores above 90.
- Achieve >80% test coverage for critical UI components and utilities.
- Ensure 0 critical UI bugs or layout shifts escape to production.
- Monitor bundle size trends over time to prevent frontend bloat and optimize load times.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: UI State Desynchronization with Supabase Backend
**Symptoms:** The UI displays stale or outdated data compared to what exists in the database.
**Root Cause:** Missing real-time subscriptions, improper cache invalidation after mutations, or race conditions in data fetching.
**Resolution:** 
1. Verify that the mutation successfully completed.
2. Ensure the local cache (e.g., React Query or SWR) is invalidated for the affected query keys.
3. If using real-time features, verify that the Supabase channel subscription is properly bound to the component lifecycle.
**Prevention:** Implement optimistic UI updates, consistently use centralized data-fetching hooks, and ensure cleanup functions are present in `useEffect` blocks to avoid memory leaks and stale listeners.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or unexpected type mismatch errors.
**Root Cause:** Package versions incompatible with the codebase or conflicting peer dependencies.
**Resolution:**
1. Review `package.json` for version ranges.
2. Run `npm update` or the equivalent package manager command to fetch compatible versions.
3. Clear the local build cache and test locally before committing.
**Prevention:** Keep dependencies updated regularly, strictly rely on lockfiles (`package-lock.json` or `yarn.lock`), and use Dependabot or similar tooling.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. Ensure any new UI components are documented in the project's component library or storybook, and list any outstanding accessibility or performance warnings that require manual human review.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
