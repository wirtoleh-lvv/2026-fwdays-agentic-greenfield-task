# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-05 12:27:30 EEST (+03:00)
- **Current phase:** Phase 9 — local-save implementation
- **Active change:** `save-confirmed-books-locally`
- **Progress:** 9 of 15 tasks are complete. Versioned loading, safe read failures, Home Library entry states, explicit Save eligibility, deterministic duplicate classification, all-conflict review/resolution, and conflict-free atomic saving are implemented.
- **Next task:** Apply task 5.2 with `$openspec-tdd`: save a resolved conflict batch atomically and prove it reloads in a later browser session without a backend request.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of `AGENTS.md`, the artifacts under `openspec/changes/save-confirmed-books-locally/`, the owning files under `docs/requirements/`, `docs/PRD.md`, `docs/Vocabulary.md`, and `docs/adr/ADR-001-local-first-browser-persistence.md`.

## OpenSpec Status

- Active change: `save-confirmed-books-locally`, 9 of 15 tasks complete; all planning artifacts complete.
- Archived changes: `2026-07-04-decide-extracted-candidates` and `2026-07-04-add-books-from-photo`, both complete.
- `npx openspec validate --all --strict`: observed passing on 2026-07-05; 3 passed, 0 failed.

## Change Progress

- **Completed:** browser-local reads; non-destructive retryable read errors; empty/populated Home Library; transient Confirm plus explicit Save; normalized duplicate classification; all-conflict Duplicate Review; preserved choices across Back; explicit Save anyway/Exclude; one-write conflict-free saving with new local IDs, saved-count status, and Home Library focus.
- **Evidence:** 17 test files / 41 tests pass with requirement IDs covering the completed tasks. The user manually accepted empty/populated desktop/mobile layouts, visible focus, Add books navigation, and scope exclusions for task 2.2.
- **Remaining:** resolved-conflict reload, write-failure Retry, keyboard/focus completion, Duplicate Review/save-success visual acceptance, full validation/build, and separate checker passes.
- **Deferred:** edit, remove, search, Manual Add, metadata, covers, fuzzy matching, accounts, backend persistence, and cloud sync.

## Validation

Observed in this update:

```bash
npm run lint       # passed
npm run typecheck  # passed
npm test           # passed: 17 files / 41 tests
npx openspec validate --all --strict  # passed: 3 / 3 items
```

`npm run build` was not run; task 7.1 still requires it.

## Environment and Privacy

- Home Library records remain browser-only; saving serializes one complete versioned collection with one `setItem` call.
- Candidate IDs are not persisted as Library Book IDs; local ID generation is injectable for tests.
- Planning and implementation changes are uncommitted. Never print or commit `.env.local`.

## Agent Rules and Gotchas

- `PhotoExtractionForm` owns transient candidate and duplicate-plan state; `LibrarianApp` owns the loaded Home Library and successful navigation.
- Duplicate resolutions are keyed by candidate/library IDs and survive Back; non-conflicting confirmed candidates remain queued automatically.
- `design-qa.md` remains blocked for combined screenshot comparison because automated capture was declined, although user-provided manual evidence satisfies task 2.2.
- Task 5.3 must catch write failures without unmounting the save workflow or losing candidate/conflict state.
