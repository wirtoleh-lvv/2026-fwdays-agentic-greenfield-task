# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-06 22:00:59 EEST (+0300)
- **Current phase:** Phase 18 — `home-library-search` synced to main specs,
  completion gate passed, and the change is archived
- **Active change:** none
- **Progress:** Archived
  `openspec/changes/archive/2026-07-06-home-library-search/` after completing
  all 13 tasks. Main `openspec/specs/local-library-save/spec.md` now includes
  `FR-LIB-006` Home Library search behavior and the updated accessibility/scope
  requirement. The implementation includes live local search, no-results
  recovery, in-session query preservation, fresh-reload reset, mutation-aware
  recomputation, and the Figma-aligned Home Library style pass.
- **Next task:** Review the working tree, create the git commit for the archived
  search change, then either publish the branch or start the next capability
  with `$grill-openspec`.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of
[AGENTS.md](AGENTS.md),
`openspec/changes/archive/2026-07-06-home-library-search/`,
`openspec/specs/local-library-save/spec.md`,
`docs/requirements/local-library-management.md`,
`docs/requirements/non-functional-requirements.md`,
`docs/requirements/privacy-and-data-retention.md`, `docs/PRD.md`,
`docs/Vocabulary.md`, `docs/adr/ADR-001-local-first-browser-persistence.md`,
and `docs/adr/ADR-002-thin-stateless-backend-for-ai-extraction.md`.

## OpenSpec Status

- Active changes observed via `openspec list --json`: none.
- Latest archived changes:
  `openspec/changes/archive/2026-07-06-home-library-search/`,
  `openspec/changes/archive/2026-07-06-remove-saved-library-book/`, and
  `openspec/changes/archive/2026-07-06-edit-saved-library-book/`.
- `home-library-search` delta specs were synced into the main
  `local-library-save` spec before archive.
- Latest strict validation observed after archive:
  `npx openspec validate --all --strict` passed 3 / 3 items.

## Change Progress

- Completed behavior: populated Home Library search field, case-insensitive
  local title/author substring filtering, distinct no-results recovery with
  inline clear plus `Clear search`, in-session query preservation, fresh-reload
  reset, filtered-result recomputation after save/edit/remove, and the approved
  Home Library search styling pass.
- Completion evidence: your manual Figma/state verification, focused Home
  Library seam tests, full lint/typecheck/test/build gate, strict OpenSpec
  validation before and after archive, plus checker review over compliance,
  code correctness, and privacy boundaries found no critical, major, or minor
  contradictions within approved scope.
- Intentionally deferred scope still includes split `Add manually` / `Add from
  photo` entry points, fuzzy search, sorting, advanced filters, search
  persistence in storage or URL, backend search, accounts, and cloud sync.

## Validation

```bash
npm run lint # passed
npm run typecheck # passed
npm test -- --reporter=dot # passed: 17 files / 78 tests
npm run build # passed
npx openspec validate --all --strict # passed: 4 items before archive, 3 items after archive
```

## Environment and Privacy

- Home Library persistence remains browser-local only.
- The Home Library search query remains transient UI state; it is not written to
  browser storage, the URL, or the backend.
- Working tree is dirty with the archived search change directory, synced
  canonical docs/specs, implementation/test/style changes, and this handoff
  refresh. `next-env.d.ts` remains modified in the worktree and should be
  reviewed before commit.
- Never print or commit `.env.local` contents.

## Agent Rules and Gotchas

- There are no active OpenSpec changes now. Start the next material capability
  with `$grill-openspec` and a fresh proposal rather than reusing archived
  change folders.
- Search must remain absent in the true empty-library state; no-results is a
  distinct populated-library state with the total count unchanged.
- The current Home Library implementation intentionally keeps a single
  `Add books` action; the Figma split-button variant is still deferred scope.
