## 1. Candidate Readiness

- [x] 1.1 Through one red-green-refactor cycle at the public candidate-review seam, derive `Ready for Confirmation` only from a non-empty trimmed title plus a non-empty trimmed author; prove missing or whitespace-only values remain `Needs Review` and cannot be confirmed (`FR-CONFIRM-007`).
- [x] 1.2 Through one red-green-refactor cycle, support explicit unknown-author acknowledgement for a titled candidate and clear that acknowledgement when a non-empty author is entered (`FR-CONFIRM-007`, `NFR-A11Y-001`, `NFR-A11Y-002`).

## 2. Explicit Confirmation

- [x] 2.1 Through one red-green-refactor cycle, let the user confirm a ready candidate, render its compact Confirmed state, update the transient confirmed count, and prove that no Library Book or persistence write occurs (`FR-CONFIRM-003`, `FR-CONFIRM-006`).
- [x] 2.2 Through one red-green-refactor cycle, return a confirmed candidate to editing with its values preserved, revoke confirmation before edits, and require explicit reconfirmation of the current valid values (`FR-CONFIRM-002`, `FR-CONFIRM-003`, `FR-CONFIRM-006`, `FR-CONFIRM-008`).

## 3. Reversible Skip

- [x] 3.1 Through one red-green-refactor cycle, let the user skip any undecided candidate, render its compact Skipped state, exclude it from the confirmed set, and update the skipped count (`FR-CONFIRM-004`, `FR-CONFIRM-006`).
- [x] 3.2 Through one red-green-refactor cycle, Undo a skipped decision without losing edited information and restore the readiness derived from the preserved values (`FR-CONFIRM-004`, `FR-CONFIRM-008`).

## 4. Accessible Figma-Derived Decision States

- [x] 4.1 Through a keyboard-driven red-green-refactor cycle, keep Confirm, Skip, Edit, Undo, and unknown-author controls labeled and visibly focusable; after each card transformation move focus to a meaningful replacement control and announce the candidate's new state (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`).
- [x] 4.2 Match the approved Figma candidate-review and confirmed/skipped states at relevant desktop and mobile widths, preserving non-color-only badges, compact decided cards, and readable text counts without adding Save, Manual Add, duplicate, or persistence behavior (`FR-CONFIRM-003`, `FR-CONFIRM-004`, `NFR-A11Y-003`).

## 5. Completion

- [x] 5.1 Run lint, typecheck, full tests, build, and `openspec validate --all --strict`; record requirement-ID evidence and update `docs/current-state.md` without claiming deferred behavior.
- [x] 5.2 Perform separate OpenSpec, code, privacy, and rendered-UI checker passes; resolve missing behavior, scope drift, persistence, focus, or announcement findings before completion.
