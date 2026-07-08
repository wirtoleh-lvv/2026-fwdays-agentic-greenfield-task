# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-07 14:34 EEST (+0300)
- **Current phase:** Phase 20 — `manual-add-from-home-library` implemented and
  through the automated completion checkpoint
- **Active change:** `manual-add-from-home-library`
- **Progress:** 11 / 12 OpenSpec tasks complete. Manual Add now exists from
  Home Library with direct local save, duplicate-review reuse, retry/cancel
  failure recovery, and canonical requirement-owner updates.
- **Next task:** Manually verify the Home Library Manual Add modal and
  duplicate-review round-trip against the approved Figma behavior at desktop
  and mobile widths, then either fix any mismatch or sync/archive the change if
  verification passes.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of
[AGENTS.md](AGENTS.md),
[openspec/changes/manual-add-from-home-library/proposal.md](openspec/changes/manual-add-from-home-library/proposal.md),
[openspec/changes/manual-add-from-home-library/design.md](openspec/changes/manual-add-from-home-library/design.md),
[openspec/changes/manual-add-from-home-library/specs/local-library-save/spec.md](openspec/changes/manual-add-from-home-library/specs/local-library-save/spec.md),
[openspec/changes/manual-add-from-home-library/specs/candidate-decision/spec.md](openspec/changes/manual-add-from-home-library/specs/candidate-decision/spec.md),
[openspec/changes/manual-add-from-home-library/tasks.md](openspec/changes/manual-add-from-home-library/tasks.md),
[docs/requirements/local-library-management.md](docs/requirements/local-library-management.md),
[docs/requirements/confirm-extracted-candidates.md](docs/requirements/confirm-extracted-candidates.md),
[docs/requirements/non-functional-requirements.md](docs/requirements/non-functional-requirements.md),
[docs/PRD.md](docs/PRD.md),
[docs/Vocabulary.md](docs/Vocabulary.md), and
[docs/adr/ADR-001-local-first-browser-persistence.md](docs/adr/ADR-001-local-first-browser-persistence.md).

## OpenSpec Status

- Active changes observed via `openspec list --json`:
  `manual-add-from-home-library` (`in-progress`, 11 / 12 tasks complete).
- `openspec status --change "manual-add-from-home-library" --json` shows the
  spec-driven proposal, design, specs, and tasks artifacts are all present and
  done; only implementation task `4.4` remains unchecked.
- Latest strict validation observed:
  `npx openspec validate --all --strict` passed 4 / 4 items with the active
  change still unarchived.

## Change Progress

- Completed behavior: Home Library exposes `Add manually`; the modal uses title
  plus author chips or explicit `Author unknown`; dirty close confirms discard;
  conflict-free manual adds fresh-read the latest collection and persist one
  complete updated collection; duplicate conflicts reuse the existing Duplicate
  Review with draft preservation on `Back to review`; and read/write failures
  keep state intact with `Retry` and `Cancel`.
- Remaining boundary: manual visual verification against the approved Figma
  modal and duplicate-review states at desktop and mobile widths before archive
  work.
- Intentionally deferred scope remains extraction-screen Manual Add,
  metadata enrichment, cover persistence, sorting, advanced filters, fuzzy
  search, backend search, accounts, and cloud sync.

## Validation

```bash
npm run lint # passed
npm run typecheck # passed
npm test -- --reporter=dot # passed: 17 files / 90 tests
npm run build # passed
npx openspec validate --all --strict # passed: 4 / 4 items
```

## Environment and Privacy

- Home Library persistence remains browser-local only.
- This change adds no backend library storage, no raw-photo retention, and no
  URL persistence for Manual Add draft state.
- Working tree is dirty with active Manual Add implementation files, canonical
  requirement-owner updates, the new shared duplicate-review component, this
  handoff refresh, and the unarchived change directory.
- Never print or commit `.env.local` contents.

## Agent Rules and Gotchas

- Do not mark task `4.4` complete until manual Figma verification is explicitly
  observed.
- The latest full automated checkpoint already passed; do not rerun it unless
  relevant inputs change after manual QA or follow-up fixes.
- Manual Add is a Home Library path only in this slice. Do not backfill
  extraction-screen Manual Add without a new approved change.
