## 1. Versioned Home Library Boundary

- [x] 1.1 Through one red-green-refactor cycle at the browser-storage boundary, define and validate the versioned `LibraryBook` collection, treating a missing key as an empty library and a valid value as the complete stored collection (`FR-LIB-002`, `FR-LIB-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`).
- [x] 1.2 Through one red-green-refactor cycle, reject malformed JSON, unsupported versions, and invalid book records without overwriting the stored value; expose a retryable load failure (`FR-FAIL-004`).

## 2. Home Library Entry State

- [x] 2.1 Through one red-green-refactor cycle at the public app UI seam, start in an empty or populated Home Library from the storage result and open the existing upload flow through Add books without changing stored records (`FR-LIB-002`, `FR-LIB-003`).
- [x] 2.2 Match the approved Figma-derived empty and populated Home Library states at desktop and mobile widths while omitting search, edit, remove, Manual Add, metadata, and cover-persistence controls (`FR-LIB-002`, `NFR-A11Y-003`).

## 3. Explicit Save Eligibility

- [x] 3.1 Through one red-green-refactor cycle, keep Confirm transient, expose Save confirmed books only when at least one candidate is Confirmed, and prove undecided and Skipped candidates never enter the save plan or storage (`FR-CONFIRM-003`, `FR-CONFIRM-006`, `FR-LIB-001`).

## 4. Duplicate Classification And Review

- [x] 4.1 Through one red-green-refactor cycle at the duplicate-classification seam, normalize case and whitespace, compare author lists without order, retain punctuation and diacritics, and classify exact Duplicate, title-only Possible Duplicate, and non-conflict examples (`FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`).
- [x] 4.2 Through one red-green-refactor cycle, present every conflict in one Duplicate Review state before any write, identify both records and the category, and preserve the complete candidate state and prior resolutions across Back to review (`FR-DUP-004`, `FR-DUP-005`, `FR-FAIL-005`).
- [x] 4.3 Through one red-green-refactor cycle, require Save anyway or Exclude for every conflict, keep non-conflicting candidates queued, disable final save while unresolved or empty, and build the resolved batch only from explicit choices (`FR-DUP-005`, `FR-LIB-001`).

## 5. Atomic Local Save And Reload

- [x] 5.1 Through one red-green-refactor cycle, save a conflict-free confirmed batch with one browser-storage write, create stable local Library Book ids, navigate to Home Library, announce the saved count, and display the full collection (`FR-LIB-001`, `FR-LIB-002`, `NFR-A11Y-003`, `TC-STORAGE-001`).
- [ ] 5.2 Through one red-green-refactor cycle, atomically save the resolved conflict batch after explicit overrides/exclusions and prove the saved Library Books reload in a later app session without a backend request (`FR-DUP-005`, `FR-LIB-001`, `FR-LIB-003`, `NFR-PRIV-001`, `TC-STORAGE-002`).
- [ ] 5.3 Through one red-green-refactor cycle, handle a browser-storage write failure with no partial success claim, preserve candidates and conflict resolutions, keep the user in the save workflow, and make Retry complete the same batch (`FR-FAIL-004`, `FR-FAIL-005`).

## 6. Accessible Figma-Derived Workflow

- [ ] 6.1 Through a keyboard-driven red-green-refactor cycle, keep Save, conflict resolution, Retry, Back to review, and Add books labeled and visibly focusable; restore meaningful focus and announce duplicate, failure, success, and empty states (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`).
- [ ] 6.2 Match the approved Figma-derived Duplicate Review and save-success Home Library states at relevant desktop and mobile widths, recording intentional deviations required by the approved batch semantics and scope (`FR-DUP-004`, `FR-DUP-005`, `FR-LIB-002`, `NFR-A11Y-003`).

## 7. Completion

- [ ] 7.1 Run lint, typecheck, full tests, build, and `openspec validate --all --strict`; record requirement-ID evidence and update `docs/current-state.md` without claiming deferred edit/remove/search/manual-add behavior.
- [ ] 7.2 Perform separate OpenSpec, code, privacy, and rendered-UI checker passes; resolve scope drift, data-loss, partial-write, duplicate, focus, or responsive-layout findings before completion.
