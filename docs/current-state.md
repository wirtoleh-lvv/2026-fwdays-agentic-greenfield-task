# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-05 20:29:56 EEST (+0300)
- **Current phase:** Phase 13 — add-books return change archived; removal
  change still awaiting manual acceptance
- **Active change:** `remove-saved-library-book`
- **Progress:** `return-to-library-from-add-books` is implemented, spec-synced,
  validated, and archived. `remove-saved-library-book` remains at 9 of 12 tasks
  complete.
- **Next task:** Complete `remove-saved-library-book` task 4.1 by manually
  verifying the rendered remove dialog and failure state against
  `05-remove-library-book-dialog.png` at desktop and mobile widths.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of `AGENTS.md`,
artifacts under `openspec/changes/remove-saved-library-book/` and
`openspec/changes/archive/2026-07-05-return-to-library-from-add-books/`, main
specs under `openspec/specs/`, `docs/requirements/local-library-management.md`,
`docs/requirements/non-functional-requirements.md`,
`docs/requirements/privacy-and-data-retention.md`, `docs/PRD.md`,
`docs/Vocabulary.md`, and `docs/adr/ADR-001-local-first-browser-persistence.md`.

## OpenSpec Status

- Active change: `remove-saved-library-book`, 9 / 12 tasks complete; planning
  artifacts are complete, implementation is present, and manual rendered-UI
  acceptance plus completion gates remain open.
- Archived changes observed: `2026-07-05-return-to-library-from-add-books`,
  `2026-07-05-save-confirmed-books-locally`,
  `2026-07-04-decide-extracted-candidates`, and
  `2026-07-04-add-books-from-photo`.
- Latest strict validation observed: `npx openspec validate --all --strict`
  passed 5 / 5 items before archiving `return-to-library-from-add-books`.

## Change Progress

- Archived in `2026-07-05-return-to-library-from-add-books`: initial Add books
  Cancel now returns to unchanged Home Library without extra storage or backend
  activity, while Remove selected photo continues to clear only the selected
  photo. Main `local-library-save` spec already includes that behavior.
- Current unfinished boundary: `remove-saved-library-book` implementation is
  still unarchived and still needs task 4.1 manual desktop/mobile dialog review
  plus tasks 5.1 and 5.2 completion/checker work.
- Main `local-library-save` spec is already synced for both the archived
  add-books return change and the still-open removal change.

## Validation

Most recent observed evidence:

```bash
npm test -- src/features/home-library/librarian-app.test.tsx --reporter=dot # passed: 1 file / 15 tests
npm test -- src/features/home-library/librarian-app.test.tsx src/features/photo-extraction/photo-upload-validation.test.tsx --reporter=dot # passed: 2 files / 18 tests
npm exec eslint -- src/features/home-library/librarian-app.tsx src/features/home-library/librarian-app.test.tsx src/features/photo-extraction/photo-extraction-form.tsx src/features/photo-extraction/photo-upload-validation.test.tsx # passed
npm run typecheck # passed
npm test -- --reporter=dot # passed: 17 files / 57 tests
npm run lint # passed
npm run build # passed
npx openspec validate --all --strict # passed: 5 items
```

Checker evidence observed for `return-to-library-from-add-books`: OpenSpec
compliance audit against the approved change, PRD, canonical requirements,
vocabulary, ADR-001, changed app seam, and focused tests found no
contradictions or scope drift.

## Environment and Privacy

- Browser-local Home Library persistence remains unchanged; the add-books return
  change touched only UI state transitions in `LibrarianApp` and
  `PhotoExtractionForm`.
- No API route or storage-module edits were made for that archived change.
- Working tree remains dirty with uncommitted application/test updates, the
  synced main spec, this handoff refresh, and the new archive directory for
  `2026-07-05-return-to-library-from-add-books`.
- `npm run build` observed `.env.local` as an environment source; never print or
  commit its contents.

## Agent Rules and Gotchas

- The initial upload-screen Cancel in `PhotoExtractionForm` is now navigation
  back to Home Library; it is no longer a synonym for clearing transient upload
  state.
- Clearing a selected photo still happens through the visible Remove selected
  photo control, not through the initial Cancel action.
- Do not confuse the archived add-books return change with the still-open
  removal change; both modify `local-library-save`, but only removal still needs
  manual acceptance and completion work.
