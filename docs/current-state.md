# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-04 16:52:57 EEST (+03:00)
- **Current phase:** Phase 4 — implementing the first vertical slice
- **Active change:** `add-books-from-photo`
- **Progress:** The OpenSpec proposal, design, delta spec, and tasks are complete and validate strictly. Task 1.1 established the Next.js/TypeScript scaffold and repeatable lint, typecheck, test, and build scripts. No photo-extraction behavior is implemented yet; 1 of 15 tasks is checked.
- **Next task:** Complete HITL task 1.2 by selecting and documenting the initial server-side AI provider, model/configuration boundary, and placeholder-only environment setup.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of:

1. `AGENTS.md` — project workflow and guardrails.
2. `openspec/changes/add-books-from-photo/` — active proposal, design, scenarios, and tasks.
3. `docs/requirements/*.md` — canonical detailed requirements and stable IDs.
4. `docs/PRD.md` and `docs/Vocabulary.md` — product context and domain terms.
5. `docs/adr/ADR-001-local-first-browser-persistence.md` and `docs/adr/ADR-002-thin-stateless-backend-for-ai-extraction.md` — governing architecture decisions.

## OpenSpec Status

- `openspec list --json`: `add-books-from-photo` is in progress with 1 of 15 tasks complete.
- `openspec validate --all --strict`: passed on 2026-07-04; 1 change passed and 0 failed.
- Archived changes: none.

## Active Change Progress

### `add-books-from-photo`

- **Status:** In progress.
- **Completed:** Minimal Next.js and TypeScript project structure plus the defined development scripts (task 1.1).
- **Current boundary:** Select the provider and configuration boundary before implementing the first browser-to-API extraction tracer.
- **Intentionally deferred:** Candidate confirmation and saving, Manual Add, duplicate detection, metadata enrichment, browser library persistence, and library management.

## Validation

Available commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
openspec validate --all --strict
```

Latest observed result: OpenSpec strict validation passes. The npm validation commands were not run during this handoff update; do not infer a current pass.

## Environment and Privacy

- Runtime stack: Next.js 16.2.10, React 19.2.7, and TypeScript 5.9.3.
- The AI provider and model are not yet selected; no provider credential setup is recorded.
- The MVP has no accounts, database, cloud sync, or backend library persistence.
- Provider secrets belong only in uncommitted local environment configuration. Never print or commit `.env.local`.
- Raw photos, provider responses, extracted candidates, and Library Books must not be retained by the backend.

## Agent Rules and Gotchas

- The current page is only a placeholder; do not report extraction behavior as implemented.
- Follow `openspec/changes/add-books-from-photo/tasks.md` in order and apply implementation with `$openspec-tdd`.
- The repository does not currently define separate integration or E2E test scripts or a database smoke test.
- Do not archive the active change before all implementation, validation, privacy, and checker tasks pass.
