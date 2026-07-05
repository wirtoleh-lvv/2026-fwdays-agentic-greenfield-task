# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-05 14:38:01 EEST (+03:00)
- **Current phase:** Phase 9 — local-save complete, ready to commit/archive
- **Active change:** `save-confirmed-books-locally`
- **Progress:** 15 of 15 tasks are complete. Implementation, manual UI acceptance, full validation, and separate checker passes all finished.
- **Next task:** Review and commit the completed change, then archive `save-confirmed-books-locally` with `$openspec-archive-change` when authorized.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of `AGENTS.md`, the artifacts under `openspec/changes/save-confirmed-books-locally/`, the owning files under `docs/requirements/`, `docs/PRD.md`, `docs/Vocabulary.md`, and ADRs 001–002.

## OpenSpec Status

- Active change: `save-confirmed-books-locally`, 15 of 15 tasks complete; OpenSpec reports `complete`.
- Archived changes: `2026-07-04-decide-extracted-candidates` and `2026-07-04-add-books-from-photo`, both complete.
- `npx openspec validate --all --strict`: observed passing on 2026-07-05; 3 passed, 0 failed.

## Change Progress

- **Completed:** explicit confirmed-only saving, deterministic duplicate review, atomic browser-local persistence/reload, safe read/write Retry, stale-batch invalidation after user changes, and accessible focus/status transitions.
- **Evidence:** 17 test files / 45 tests pass with affected canonical verification fields marked `tested`. The user manually accepted the desktop/mobile Home Library, Duplicate Review, and save-success states.
- **Checker result:** OpenSpec 23/23 scenarios implemented; code and privacy passes have no remaining findings. The rendered-UI pass used the user's manual browser evidence; automated screenshot comparison remains unavailable by choice.
- **Deferred:** edit, remove, search, Manual Add, metadata, covers, fuzzy matching, accounts, backend persistence, and cloud sync.

## Validation

Observed at completion:

```bash
npm run lint                         # passed
npm run typecheck                    # passed
npm test -- --reporter=dot           # passed: 17 files / 45 tests
npm run build                        # passed
npx openspec validate --all --strict # passed: 3 / 3 items
```

## Environment and Privacy

- Home Library records remain browser-only; saving serializes one complete versioned collection with one `setItem` call.
- Candidate IDs are not persisted as Library Book IDs; local ID generation is injectable for tests.
- Completed implementation, tests, requirement evidence, QA, task, and handoff edits are uncommitted. Never print or commit `.env.local`.

## Agent Rules and Gotchas

- `PhotoExtractionForm` owns transient candidate and duplicate-plan state; `LibrarianApp` owns the loaded Home Library and successful navigation.
- Retry retains the failed batch only while candidate data and duplicate resolutions remain unchanged; any user change invalidates the stale Retry plan.
- Automated screenshot capture was declined; `design-qa.md` distinguishes passing OpenSpec manual acceptance from the blocked screenshot-comparison artifact.
- A pre-existing Next dev process may still be listening on port 3000 as PID 82181; do not terminate it without user direction.
