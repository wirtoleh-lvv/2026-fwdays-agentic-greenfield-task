## 1. Edit dialog shell and clean-close behavior

- [x] 1.1 Add or update Home Library behavior tests for opening Edit with prefilled saved values, no storage access on open, and clean cancel/close/Escape focus restoration (`FR-LIB-004`, `NFR-A11Y-001`, `NFR-A11Y-002`)
- [x] 1.2 Implement the Home Library Edit action, modal dialog shell, prefilled draft state, and clean-close behavior with no browser-storage mutation (`FR-LIB-004`)
- [x] 1.3 Add or update behavior tests for dirty-draft discard confirmation before close (`FR-LIB-004`)
- [x] 1.4 Implement dirty tracking and discard-confirmation behavior for Cancel, close, and Escape (`FR-LIB-004`)

## 2. Draft validation and duplicate feedback

- [x] 2.1 Add or update behavior tests for trimmed title validation, Author unknown handling, preserved disabled author chips, and Save changes enabled only when valid and dirty (`FR-LIB-004`)
- [x] 2.2 Implement edit-draft validation, explicit Author unknown control, and preserved-but-disabled author editing state (`FR-LIB-004`)
- [x] 2.3 Add or update behavior tests for inline exact-duplicate blocking and non-blocking Possible Duplicate warnings during edit (`FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`, `FR-LIB-004`)
- [x] 2.4 Implement edit duplicate classification against other saved Library Books using existing normalization semantics and excluding the current stable id (`FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`)

## 3. Fresh-read save path and recovery outcomes

- [x] 3.1 Add or update behavior tests for successful edit save: fresh read, stable-id patch, one complete write, Home Library refresh, and success announcement (`FR-LIB-004`, `TC-STORAGE-001`, `TC-STORAGE-002`)
- [x] 3.2 Implement the edit-save flow with fresh collection reload, target-id patching, and one complete browser-local write (`FR-LIB-004`, `NFR-PRIV-001`)
- [x] 3.3 Add or update behavior tests for stale-target, read-failure, and write-failure outcomes including Retry and preserved draft state (`FR-LIB-004`, `TC-STORAGE-001`, `TC-STORAGE-002`, `NFR-A11Y-003`)
- [x] 3.4 Implement stale-target replacement behavior plus read/write failure recovery with Retry and Cancel (`FR-LIB-004`)

## 4. Accessibility, visual verification, and completion gates

- [x] 4.1 Add or update behavior tests for edit-dialog focus trapping, initial Title focus, failure Retry focus, and adjacent-item or empty-state focus after stale-target outcomes (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`)
- [x] 4.2 Implement edit-dialog focus management and live announcement behavior without regressing removal-dialog accessibility (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`)
- [x] 4.3 Manually verify the rendered edit dialog and key warning/error states against `docs/audits/librarian-mvp-prototype/screenshots/04-edit-library-book-dialog.png` at desktop and mobile widths; record any approved deviations
- [x] 4.4 Run lint, typecheck, targeted tests, full test suite, OpenSpec validation, required checker passes, and refresh `docs/current-state.md` with the next exact task or archive status
