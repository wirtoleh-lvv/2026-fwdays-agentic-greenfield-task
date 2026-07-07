# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-07 09:10:12 EEST (+0300)
- **Current phase:** Phase 19 — `hover-reveal-library-book-actions` synced to
  main specs, archived, and ready for commit
- **Active change:** none
- **Progress:** Archived
  `openspec/changes/archive/2026-07-07-hover-reveal-library-book-actions/`
  after completing all 6 tasks. Main
  `openspec/specs/local-library-save/spec.md` now includes hover-capable
  hide/reveal behavior for per-book `Edit` and `Remove`, the no-hover fallback,
  and the related accessibility scenarios.
- **Next task:** Review the working tree, create the git commit for the archived
  hover-reveal change, then either publish the branch or start the next
  capability with `$grill-openspec`.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of
[AGENTS.md](AGENTS.md),
[openspec/changes/archive/2026-07-07-hover-reveal-library-book-actions/](openspec/changes/archive/2026-07-07-hover-reveal-library-book-actions/),
[openspec/specs/local-library-save/spec.md](openspec/specs/local-library-save/spec.md),
[docs/requirements/local-library-management.md](docs/requirements/local-library-management.md),
[docs/requirements/non-functional-requirements.md](docs/requirements/non-functional-requirements.md),
[docs/requirements/privacy-and-data-retention.md](docs/requirements/privacy-and-data-retention.md),
[docs/PRD.md](docs/PRD.md),
[docs/Vocabulary.md](docs/Vocabulary.md), and
[docs/adr/ADR-001-local-first-browser-persistence.md](docs/adr/ADR-001-local-first-browser-persistence.md).

## OpenSpec Status

- Active changes observed via `openspec list --json`: none.
- Latest archived changes:
  `openspec/changes/archive/2026-07-07-hover-reveal-library-book-actions/`,
  `openspec/changes/archive/2026-07-06-home-library-search/`, and
  `openspec/changes/archive/2026-07-06-remove-saved-library-book/`.
- `hover-reveal-library-book-actions` delta specs were synced into the main
  `local-library-save` spec before archive.
- Latest strict validation observed after archive:
  `npx openspec validate --all --strict` passed 3 / 3 items.

## Change Progress

- Completed behavior: per-book `Edit` and `Remove` actions stay in the DOM,
  hide by default only in hover-capable environments, reveal on card hover and
  keyboard focus entry, remain visible on no-hover environments, and use
  tightened sizing so the action row fits the one-line Figma layout more
  closely.
- Completion evidence: focused Home Library seam tests for hover-capable and
  no-hover states, the full Home Library regression suite, your manual Figma/UI
  verification, and a fresh full lint/typecheck/test/build/OpenSpec validation
  checkpoint before archive.
- Intentionally deferred scope still includes split `Add manually` /
  `Add from photo` entry points, fuzzy search, sorting, advanced filters,
  backend search, accounts, and cloud sync.

## Validation

```bash
npm run lint # passed
npm run typecheck # passed
npm test -- --reporter=dot # passed: 17 files / 80 tests
npm run build # passed
npx openspec validate --all --strict # passed: 4 items before archive, 3 items after archive
```

## Environment and Privacy

- Home Library persistence remains browser-local only.
- This change does not add backend library storage, URL state persistence, or
  extra data retention.
- Working tree is dirty with synced canonical spec updates, Home Library
  implementation/style/test edits, the archived change directory, and this
  handoff refresh.
- Never print or commit `.env.local` contents.

## Agent Rules and Gotchas

- There are no active OpenSpec changes now. Start the next material capability
  with `$grill-openspec` and a fresh proposal rather than reusing archived
  change folders.
- The hover reveal is presentation-only. Keep `Edit` and `Remove` in the DOM
  and preserve the existing dialog, focus, and result semantics.
- No-hover environments must keep the actions visible; do not regress to a
  hover-only affordance.
