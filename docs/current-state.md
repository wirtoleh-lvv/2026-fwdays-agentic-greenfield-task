# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-04 19:17:21 EEST (+03:00)
- **Current phase:** Phase 8 — between vertical slices
- **Active change:** none
- **Progress:** `decide-extracted-candidates` is implemented, validated, synchronized to the main `candidate-decision` spec, and archived with all ten tasks complete. The user manually confirmed candidate interactions, mobile layout, and visible focus; no persistence or API behavior was added.
- **Next task:** Review the working-tree diff and commit the completed candidate-decision feature and archive.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of:

1. `AGENTS.md` — project workflow, design-source rules, and guardrails.
2. `openspec/changes/archive/2026-07-04-decide-extracted-candidates/` — archived proposal, design, delta spec, and tasks.
3. `docs/requirements/confirm-extracted-candidates.md` and `docs/requirements/non-functional-requirements.md` — canonical behavior and accessibility requirements.
4. `openspec/specs/candidate-decision/spec.md` and `openspec/specs/photo-book-extraction/spec.md` — synchronized accepted behavior.
5. `docs/PRD.md` and `docs/Vocabulary.md` — product context and terms.
6. `docs/adr/ADR-001-local-first-browser-persistence.md` and `docs/adr/ADR-002-thin-stateless-backend-for-ai-extraction.md` — governing boundaries.

## OpenSpec Status

- Active changes: none.
- Archived changes: `2026-07-04-decide-extracted-candidates` with 10 of 10 tasks complete, and `2026-07-04-add-books-from-photo` with 15 of 15 tasks complete.
- Main-spec sync: all five `candidate-decision` requirements are present in `openspec/specs/candidate-decision/spec.md`.
- `npx openspec validate --all --strict`: observed passing after archive on 2026-07-04; 2 main specs passed, 0 failed.

## Change Progress

### `2026-07-04-decide-extracted-candidates`

- **Implemented:** trimmed-value readiness; unknown-author acknowledgement and clearing; transient Confirm, Skip, Edit, and Undo; preserved edits; independent counts; compact decided states; focus continuity; and assistive-technology announcements.
- **Verified:** requirement-ID UI tests, storage/request non-persistence assertions, lint, typecheck, 13 test files / 32 tests, production build, strict OpenSpec validation, and diff checks.
- **Manually observed:** the user reported successful Confirm, Skip, Edit, Undo, unknown-author interactions, mobile layout, and visible focus on 2026-07-04.
- **Checked:** separate OpenSpec, engineering, privacy, and rendered-UI reviews found no remaining OpenSpec defects or scope drift after one source-order correction.
- **Artifact gap:** `design-qa.md` remains blocked under its stricter screenshot-comparison standard because the configured in-app browser was unavailable; this does not leave an OpenSpec task incomplete.
- **Deferred by scope:** Save, Manual Add, duplicate handling, browser library persistence, metadata enrichment, and API/provider changes.
- **Status:** archived; no implementation task remains.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx openspec validate --all --strict
```

All commands above passed on 2026-07-04. Requirement evidence and the manual
rendered checklist are in `docs/qa/decide-extracted-candidates-verification.md`.

## Environment and Privacy

- Runtime stack remains Next.js 16.2.10, React 19.2.7, TypeScript 5.9.3, OpenAI SDK 6.45.0, and Sharp 0.35.3.
- Candidate decisions and acknowledgement state exist only in React memory. Confirming sends no request, writes no browser storage, and creates no Library Book.
- The extraction backend remains stateless. Never print or commit `.env.local` or its secrets.

## Agent Rules and Gotchas

- The in-app browser was unavailable during this pass; user-reported rendered acceptance completed the OpenSpec checks, but no implementation screenshot was captured.
- Port 3000 was already occupied when a temporary dev server was started; Next.js selected port 3001 for that process, which was then stopped.
- `design-qa.md` is intentionally `final result: blocked` until source and implementation captures can be compared at matching states and viewports.
- `npm install` previously reported two moderate dependency vulnerabilities; no forced audit fix was applied.
