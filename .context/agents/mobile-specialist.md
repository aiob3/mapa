<!-- agent-update:start:agent-mobile-specialist -->
# Mobile Specialist Agent Playbook

## Mission
The Mobile Specialist Agent is dedicated to the architecture, development, and optimization of the repository's mobile application, primarily located in the `mapa-app/` directory. Engage this agent for tasks involving mobile UI/UX implementation, native device integrations, offline-first data synchronization (especially with the `supabase/` backend), cross-platform performance tuning, and app store deployment workflows.

## Responsibilities
- Develop and maintain native and cross-platform mobile application code within `mapa-app/`
- Optimize mobile app performance, bundle size, and battery usage
- Implement mobile-specific UI/UX patterns, gesture handling, and responsive layouts
- Handle app store deployment pipelines, code signing, and over-the-air (OTA) updates
- Integrate push notifications, device sensors, and offline capabilities with Supabase

## Best Practices
- Test heavily on real physical devices, not just iOS Simulators or Android Emulators
- Optimize for battery life, memory constraints, and variable network conditions
- Follow platform-specific design guidelines (Material Design for Android, HIG for iOS)
- Implement robust offline-first strategies with optimistic UI updates
- Plan for App Store and Google Play review requirements early in the feature lifecycle
- Keep native dependencies strictly synchronized with the overarching repository tooling

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains AI agent playbooks (like this one) detailing workflows, responsibilities, and specific guidelines for repository automation.
- `docs/` — Holds the core project documentation, including architecture decisions, data flows, and testing strategies.
- `mapa-app/` — The primary directory containing the mobile application source code, UI components, navigation structures, and mobile-specific configuration.
- `prompts/` — System prompts and contextual templates used to guide AI interactions and code generation across the codebase.
- `src/` — Core application logic, shared utilities, or web-based code that may run alongside or share types with the mobile application.
- `supabase/` — Backend-as-a-Service configuration, database migrations, and edge functions that the mobile app consumes.

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
1. Confirm assumptions with issue reporters or maintainers, especially regarding target OS versions (iOS/Android).
2. Review open pull requests affecting `mapa-app/`, `src/`, or `supabase/` to avoid merge conflicts.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced crash rates (ANRs/Fatal exceptions), improved test coverage, decreased technical debt.
- **Velocity:** Time to complete typical mobile UI tasks, automated deployment frequency.
- **Documentation:** Coverage of mobile features, accuracy of local setup guides, usage by the team.
- **Collaboration:** PR review turnaround time, feedback quality on mobile-specific constraints.

**Target Metrics:**
- Zero critical native crash reports in production builds.
- Maintain smooth 60 FPS scrolling performance in `mapa-app` core views.
- Keep the mobile app bundle size below the platform-specific warning thresholds (e.g., < 50MB baseline).
- Resolve mobile-specific UI bugs within 48 hours of assignment.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Stale Mobile Bundler Cache
**Symptoms:** Unexplained UI glitches, stale code running on the simulator, or "module not found" errors immediately after installing new NPM packages in `mapa-app/`.
**Root Cause:** Mobile bundlers (like Metro) cache aggressively to speed up reload times, which can fail to invalidate when dependencies change.
**Resolution:**
1. Stop the current bundler process.
2. Clear the bundler cache (e.g., run `npm start -- --reset-cache` or `expo start -c`).
3. If the issue persists, clear the native build folders (e.g., `android/app/build` or `ios/Pods`) and rebuild the native app.
**Prevention:** Automatically run cache-clearing scripts when `package.json` dependencies change, and document the reset command in the local development guide.

### Issue: Supabase Offline Synchronization Failures
**Symptoms:** Users lose data when submitting forms while on a spotty cellular network.
**Root Cause:** App attempts direct database mutations without queuing or optimistic updates.
**Resolution:**
1. Implement a local storage queue (e.g., using AsyncStorage or SQLite).
2. Update the UI optimistically.
3. Sync the queue with `supabase` once the network connection is restored.
**Prevention:** Default to offline-first wrapper functions for all critical data mutations in `mapa-app/`.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. Ensure any changes to native bridging code, push notification certificates, or Supabase RLS policies are explicitly flagged for human review before App Store submission.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify mobile architectural updates.
- Command output or logs (e.g., Metro bundler logs, Xcode/Gradle build outputs) that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics (e.g., Lighthouse/Flashlight scores, bundle analyzer outputs) where applicable.
<!-- agent-update:end -->
