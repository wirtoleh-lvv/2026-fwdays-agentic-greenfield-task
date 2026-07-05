## 1. Initial Upload Cancellation

- [x] 1.1 Through one red-green-refactor cycle at the app seam, prove that
  cancelling from the initial Add books upload screen returns to the same empty
  or populated Home Library without any additional browser-storage read or
  write and without a backend request. (`FR-LIB-002`, `FR-LIB-003`,
  `TC-STORAGE-001`)
- [x] 1.2 Through one red-green-refactor cycle in the upload workflow, add an
  explicit return-to-library path for the initial upload-screen Cancel action
  while preserving existing selected-photo clearing and later workflow
  behavior. (`FR-LIB-002`, `FR-LIB-003`)

## 2. Focus And Accessibility

- [x] 2.1 Through one keyboard-driven red-green-refactor cycle, restore focus
  to the Home Library Add books action after initial upload cancellation and
  keep the relevant controls labeled, keyboard-operable, and visibly focusable.
  (`NFR-A11Y-001`, `NFR-A11Y-002`)

## 3. Validation And Handoff

- [x] 3.1 Run the focused test, lint, and typecheck commands needed for the
  changed Home Library and Add books surfaces, and confirm the change does not
  alter API routes or browser-storage schema behavior. (`NFR-DX-001`,
  `TC-STACK-001`, `TC-STACK-002`, `TC-STORAGE-001`)
- [x] 3.2 Refresh `docs/current-state.md` with verified progress on
  `return-to-library-from-add-books`, note the still-open removal change, and
  record the exact next task before handoff. (`TC-STACK-003`)
