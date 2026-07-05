## 1. Fresh-Read Removal Boundary

- [x] 1.1 Through one red-green-refactor cycle at the browser-storage boundary, reload the latest valid collection, remove only the stable target id, preserve every unrelated fresh record, and serialize the complete remaining collection with exactly one versioned write (`FR-LIB-005`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`).
- [x] 1.2 Through one red-green-refactor cycle, return the latest collection as an already-absent outcome without calling `setItem` when the stable target id is no longer present (`FR-LIB-005`, `TC-STORAGE-001`).
- [x] 1.3 Through one red-green-refactor cycle, expose retryable fresh-read and removal-write failures without replacing unreadable data or returning a successful collection (`FR-FAIL-004`).

## 2. Named Confirmation And Cancellation

- [x] 2.1 Through one red-green-refactor cycle at the public Home Library UI seam, expose a Remove action for each Library Book and open a confirmation dialog that identifies the selected title and author while performing no storage access (`FR-LIB-005`, `NFR-A11Y-002`).
- [x] 2.2 Through one keyboard-driven red-green-refactor cycle, initially focus Cancel, trap focus inside the dialog, and prove Cancel, close, and Escape perform no storage access and return focus to the triggering Remove action (`FR-LIB-005`, `NFR-A11Y-001`, `NFR-A11Y-002`).

## 3. Removal Outcomes And Recovery

- [x] 3.1 Through one red-green-refactor cycle, confirm a present target, keep Home Library on screen, display the freshly preserved collection, announce the removed title, and focus the next remaining Remove action or the previous one when no next item exists (`FR-LIB-005`, `NFR-A11Y-003`).
- [x] 3.2 Through one red-green-refactor cycle, remove the last Library Book with one write, render the existing empty Home Library, announce the removed title, and focus the empty-state heading (`FR-LIB-005`, `NFR-A11Y-003`).
- [x] 3.3 Through one red-green-refactor cycle, handle an already-absent target as a no-write success, refresh from the latest collection, announce that the named book is no longer present, and apply the same adjacent-or-empty focus rule (`FR-LIB-005`, `NFR-A11Y-003`).
- [x] 3.4 Through one red-green-refactor cycle, keep the dialog and visible collection unchanged after a fresh-read or write failure, announce that the named book was not removed, focus Retry, retain Cancel, and prove Retry re-reads before completing the same target removal (`FR-FAIL-004`, `NFR-A11Y-001`, `NFR-A11Y-003`).

## 4. Approved Remove-Dialog Presentation

- [ ] 4.1 Match repository reference `05-remove-library-book-dialog.png` at desktop and mobile widths, including the modal overlay, named irreversible warning, destructive/cancel hierarchy, failure state, visible focus, and responsive layout; record intentional deviations and omit edit, search, bulk removal, Undo, and removal history (`FR-LIB-005`, `NFR-A11Y-002`, `NFR-A11Y-003`).

## 5. Completion

- [ ] 5.1 Run lint, typecheck, full tests, build, and `openspec validate --all --strict`; record requirement-ID evidence, mark verified canonical requirements `tested`, and update `docs/current-state.md` without claiming deferred edit/search/Manual Add behavior.
- [ ] 5.2 Perform separate OpenSpec, code, privacy, and rendered-UI checker passes; resolve destructive-write, stale-read, idempotency, dialog-focus, retry, scope, or responsive-layout findings before completion.
