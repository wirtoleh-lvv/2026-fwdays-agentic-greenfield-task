## 1. Establish the Manual Add entry and draft rules

- [x] 1.1 Through one red-green-refactor cycle at the Home Library seam, prove that Home Library exposes an `Add manually` action, opens a Manual Add modal without browser-storage access, and restores focus to the trigger when a clean draft is cancelled (`FR-CONFIRM-005`, `FR-LIB-002`, `FR-LIB-003`, `NFR-A11Y-001`, `NFR-A11Y-002`).
- [x] 1.2 Through one red-green-refactor cycle, implement the Figma-aligned Manual Add modal shell, clean-draft cancellation, trapped focus, and trigger-focus restoration from Home Library (`FR-CONFIRM-005`, `FR-LIB-002`, `FR-LIB-003`, `NFR-A11Y-001`, `NFR-A11Y-002`).
- [x] 1.3 Through one red-green-refactor cycle, prove that `Add to library` remains unavailable until the draft has a non-empty trimmed title and either at least one author or explicit `Author unknown`, and that dirty close/cancel/Escape requires discard confirmation (`FR-CONFIRM-005`, `FR-CONFIRM-006`, `NFR-A11Y-001`, `NFR-A11Y-002`).
- [x] 1.4 Through one red-green-refactor cycle, implement Manual Add draft validation, the explicit `Author unknown` control, author-chip editing, and dirty-draft discard confirmation without any browser-storage write (`FR-CONFIRM-005`, `FR-CONFIRM-006`, `NFR-A11Y-001`, `NFR-A11Y-002`).

## 2. Implement the conflict-free direct-save path

- [x] 2.1 Through one red-green-refactor cycle, prove that a valid conflict-free Manual Add draft reloads the latest collection, writes exactly one complete updated Home Library value, closes the modal, announces `“<title>” added to your library.`, and focuses the new book’s `Edit` action (`FR-LIB-001`, `FR-LIB-002`, `FR-LIB-003`, `TC-STORAGE-001`, `TC-STORAGE-002`, `NFR-A11Y-003`).
- [x] 2.2 Through one red-green-refactor cycle, implement the conflict-free Manual Add write path with stable-id creation, immediate Home Library refresh, success announcement, and result focus on the new book’s `Edit` action (`FR-LIB-001`, `FR-LIB-002`, `FR-LIB-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`, `NFR-A11Y-003`).

## 3. Reuse duplicate review and preserve the draft

- [x] 3.1 Through one red-green-refactor cycle, prove that Manual Add uses the existing duplicate-classification rules, closes the modal before entering duplicate review when a Duplicate or Possible Duplicate exists, and reopens the modal with the preserved draft when the user activates Back to review (`FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`, `FR-DUP-004`, `FR-DUP-005`, `FR-FAIL-005`).
- [x] 3.2 Through one red-green-refactor cycle, implement the Manual Add duplicate-review transition, origin-aware Back to review behavior, and preserved-draft restoration without inventing a second conflict model (`FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`, `FR-DUP-004`, `FR-DUP-005`, `FR-FAIL-005`).

## 4. Failure recovery, canonical docs, and verification

- [x] 4.1 Through one red-green-refactor cycle, prove that Manual Add read/write failures keep the modal open with the unchanged draft, announce `“<title>” was not added.`, focus Retry, and offer Cancel without claiming success or performing a partial write (`FR-FAIL-004`, `FR-FAIL-005`, `TC-STORAGE-001`, `NFR-A11Y-001`, `NFR-A11Y-003`).
- [x] 4.2 Through one red-green-refactor cycle, implement Manual Add Retry/Cancel failure recovery for both direct-save and duplicate-resolution persistence paths (`FR-FAIL-004`, `FR-FAIL-005`, `TC-STORAGE-001`, `NFR-A11Y-001`, `NFR-A11Y-003`).
- [x] 4.3 Update the canonical requirement owners for the Manual Add direct-save exception and Home Library behavior (`docs/requirements/confirm-extracted-candidates.md`, `docs/requirements/local-library-management.md`) and refresh any related verification markers (`FR-CONFIRM-005`, `FR-CONFIRM-006`, `FR-LIB-*`).
- [ ] 4.4 Manually verify the Home Library Manual Add modal and duplicate-review round-trip against the approved Figma behavior at desktop and mobile widths, then run the completion checkpoint (`npm run lint`, `npm run typecheck`, `npm test -- --reporter=dot`, `npm run build`, `npx openspec validate --all --strict`) and refresh `docs/current-state.md` with the next exact task or archive status.
