# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-05 09:12:22 EEST (+03:00)
- **Current phase:** Phase 9 — local-save implementation
- **Active change:** `save-confirmed-books-locally`
- **Progress:** Tasks 1.1, 1.2, and 2.1 are complete (3 of 15). The app now validates and loads versioned browser storage, reports invalid reads as retryable without overwriting data, renders empty/populated Home Library states, and opens the existing photo flow through Add books without a write.
- **Next task:** Complete task 2.2 by capturing and comparing empty/populated Home Library states at matched desktop and mobile viewports; the in-app browser was unavailable, so standalone Playwright requires explicit user approval or equivalent user-provided rendered evidence.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of:

1. `AGENTS.md` — project workflow, design-source rules, and guardrails.
2. `openspec/changes/save-confirmed-books-locally/` — active proposal, design, delta spec, and tasks.
3. `docs/requirements/local-library-management.md`, `duplicate-detection.md`, `failure-handling.md`, `privacy-and-data-retention.md`, and `non-functional-requirements.md` — canonical behavior.
4. `openspec/specs/candidate-decision/spec.md` and `openspec/specs/photo-book-extraction/spec.md` — accepted upstream behavior.
5. `docs/PRD.md`, `docs/Vocabulary.md`, and `docs/adr/ADR-001-local-first-browser-persistence.md` — product context, terms, and browser-only persistence decision.

## OpenSpec Status

- Active change: `save-confirmed-books-locally`, with 3 of 15 tasks complete and all four planning artifacts complete.
- Archived changes: `2026-07-04-decide-extracted-candidates` and `2026-07-04-add-books-from-photo`, both complete.
- `npx openspec validate --all --strict`: observed passing on 2026-07-05; 3 items passed and 0 failed.

## Change Progress

### `save-confirmed-books-locally`

- **Completed:** versioned browser-storage reads, retryable non-destructive load failures, Home Library startup from empty/populated storage, and no-write Add books navigation.
- **Evidence:** storage and app UI tests trace `FR-LIB-002`, `FR-LIB-003`, `FR-FAIL-004`, `NFR-PRIV-001`, `NFR-A11Y-003`, `TC-STORAGE-001`, and `TC-STORAGE-002`.
- **Implemented but not accepted:** responsive empty/populated styling and deferred-control exclusions are covered by tests, but task 2.2 remains unchecked because rendered desktop/mobile comparison is blocked. `design-qa.md` records `final result: blocked`.
- **Remaining after task 2.2:** explicit Save eligibility, duplicate classification/review, atomic writes/retry, accessibility, save-success design verification, and checker passes. Edit, remove, search, Manual Add, metadata, covers, fuzzy matching, accounts, backend persistence, and cloud sync remain deferred.

## Validation

Observed in this update:

```bash
npm run lint       # passed
npm run typecheck  # passed
npm test           # passed: 15 files / 36 tests
npx openspec validate --all --strict  # passed: 3 / 3 items
```

`npm run build` was not run; the active change's completion task still requires it. Rendered UI QA is blocked because the configured in-app browser was unavailable.

## Environment and Privacy

- Runtime stack remains Next.js 16.2.10, React 19.2.7, TypeScript 5.9.3, OpenAI SDK 6.45.0, and Sharp 0.35.3.
- Home Library records remain browser-only; no Library Book, candidate, or duplicate decision crosses a server boundary.
- Planning and implementation changes are uncommitted. `.env.local` may contain a real provider key and must never be printed or committed.

## Agent Rules and Gotchas

- Do not mark task 2.2 complete without matched desktop/mobile rendered evidence; the current `design-qa.md` is explicitly blocked.
- The in-app browser reported unavailable on 2026-07-05. Browser workflow rules require user approval before using standalone Playwright.
- Missing storage is empty; malformed, unsupported, or unavailable storage must remain untouched and retryable.
- Use screenshots `01`, `12`, `14`, and `15` as visual references while omitting out-of-scope search/edit/remove/Manual Add and cover-persistence UI.
