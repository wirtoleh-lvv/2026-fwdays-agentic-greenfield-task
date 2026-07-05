# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-05 15:18:16 EEST (+03:00)
- **Current phase:** Phase 11 — removal implementation, visual acceptance pending
- **Active change:** `remove-saved-library-book`
- **Progress:** 9 of 12 tasks complete; storage, confirmation, focus, success, already-absent, and failure/retry behavior are implemented and covered by focused tests.
- **Next task:** Complete task 4.1 by manually verifying the rendered remove dialog and failure state against `05-remove-library-book-dialog.png` at desktop and mobile widths.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of `AGENTS.md`, artifacts under `openspec/changes/remove-saved-library-book/`, main specs, the owning files under `docs/requirements/`, `docs/PRD.md`, `docs/Vocabulary.md`, and ADR-001.

## OpenSpec Status

- Active change: `remove-saved-library-book`, 9 of 12 tasks complete; all planning artifacts complete.
- Archived changes: `2026-07-05-save-confirmed-books-locally`, `2026-07-04-decide-extracted-candidates`, and `2026-07-04-add-books-from-photo`.
- Main specs: `candidate-decision`, `local-library-save`, and `photo-book-extraction`.
- `npx openspec validate --all --strict`: observed passing; 4 passed, 0 failed.

## Change Progress

- **Implemented:** permanent named confirmation; fresh-read stable-id removal with one complete write; already-absent no-write refresh; non-destructive Retry; and adjacent/empty-state focus.
- **Remaining:** manual desktop/mobile presentation acceptance, the completion validation gate, and separate checker passes.
- **Canonical update:** `FR-LIB-005` now records explicit confirmation, fresh-read removal, one complete write, and the already-absent no-write outcome; verification remains `untested` until implementation evidence exists.
- **Deferred:** Undo/recycle bin, bulk removal, edit, search, Manual Add, metadata, covers, real-time cross-tab synchronization, accounts, backend persistence, and cloud sync.

## Validation

Latest focused implementation evidence:

```bash
npm test -- src/features/home-library/librarian-app.test.tsx src/lib/home-library/storage.test.ts --reporter=dot # passed: 2 files / 19 tests
npm exec eslint -- src/features/home-library/librarian-app.tsx src/features/home-library/librarian-app.test.tsx src/lib/home-library/storage.ts src/lib/home-library/storage.test.ts # passed
npm run typecheck # passed
```

The full test, lint, build, and strict OpenSpec completion gate has not run since implementation; it is task 5.1. Latest planning validation before implementation: `npx openspec validate --all --strict` passed 4 / 4 items.

## Environment and Privacy

- Home Library records remain browser-only; saving serializes one complete versioned collection with one `setItem` call.
- Candidate IDs are not persisted as Library Book IDs; local ID generation is injectable for tests.
- Removal artifacts, implementation, tests, canonical requirement refinement, and this handoff are uncommitted. Never print or commit `.env.local`.

## Agent Rules and Gotchas

- `PhotoExtractionForm` owns transient candidate and duplicate-plan state; `LibrarianApp` owns the loaded Home Library and successful navigation.
- Removal must re-read and validate storage on every Confirm or Retry; opening or cancelling the dialog performs no storage access.
- Fresh-read preservation does not provide cross-tab locking across the subsequent read-to-write interval; that race is an explicit non-goal.
- Reference visual: `docs/audits/librarian-mvp-prototype/screenshots/05-remove-library-book-dialog.png`.
- A pre-existing Next dev process may still be listening on port 3000 as PID 82181; do not terminate it without user direction.
