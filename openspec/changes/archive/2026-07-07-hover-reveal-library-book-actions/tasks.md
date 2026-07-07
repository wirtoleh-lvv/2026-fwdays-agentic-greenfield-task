## 1. Define and prove the visibility states

- [x] 1.1 Through one red-green-refactor cycle at the Home Library seam, prove that hover-capable environments keep per-book Edit and Remove actions visually hidden until the user hovers the book card or moves keyboard focus into that book's action region (`FR-LIB-004`, `FR-LIB-005`, `NFR-A11Y-001`, `NFR-A11Y-002`).
- [x] 1.2 Through one red-green-refactor cycle, prove that no-hover environments keep per-book Edit and Remove actions visibly available without requiring an intermediate reveal interaction (`FR-LIB-004`, `FR-LIB-005`, `NFR-A11Y-001`, `NFR-A11Y-002`).

## 2. Implement hover/focus reveal without changing action semantics

- [x] 2.1 Through one red-green-refactor cycle, implement Home Library card-action presentation so hover-capable environments reveal Edit and Remove on card hover and focus-within while preserving existing action labels, targets, and result flows (`FR-LIB-004`, `FR-LIB-005`, `NFR-A11Y-001`, `NFR-A11Y-002`).
- [x] 2.2 Through one red-green-refactor cycle, implement the no-hover fallback so touch environments keep actions visible and existing Edit/Remove interaction tests continue to pass unchanged (`FR-LIB-004`, `FR-LIB-005`, `NFR-A11Y-001`, `NFR-A11Y-002`).

## 3. Verify UI parity and refresh handoff

- [x] 3.1 Manually verify the Home Library action-visibility states against the approved Figma behavior at desktop and touch/mobile widths, including hover reveal, keyboard-focus reveal, and visible actions on no-hover layouts (`FR-LIB-004`, `FR-LIB-005`, `NFR-A11Y-001`, `NFR-A11Y-002`).
- [x] 3.2 Refresh `docs/current-state.md` with the active change, completed verification evidence, and the next exact task once this slice reaches its completion checkpoint.
