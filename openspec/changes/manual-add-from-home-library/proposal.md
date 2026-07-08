## Why

Home Library currently requires the photo-based candidate flow to add every new
book, even when the user already knows the title and author details. A
Figma-backed Manual Add modal can reduce friction for known books while keeping
duplicate handling, browser-local persistence, and explicit user control.

## What Changes

- Add a Home Library `Add manually` entry point that opens a Figma-aligned
  modal for entering title, authors, and explicit unknown-author acknowledgement.
- Let the modal save directly to Home Library only when the draft is valid and
  no duplicate conflicts exist; this is an explicit write path, not a
  candidate-confirmation path.
- Reuse the existing duplicate-classification and duplicate-resolution flow when
  the manual draft conflicts with the current Home Library, including returning
  from duplicate review to the preserved modal draft.
- Add Manual Add success, cancellation, discard-confirmation, failure, focus,
  and result-announcement behavior for the Home Library path.
- **BREAKING:** clarify that explicitly confirmed candidates remain the only
  inputs to `Save confirmed books`, while Home Library Manual Add becomes a
  separate explicit save exception outside the candidate-confirmation workflow.
- Non-goals: adding Manual Add from extraction failure or candidate review in
  this slice, metadata enrichment, cover upload/persistence, bulk manual add,
  backend persistence, or changing the existing candidate-based save flow.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `candidate-decision`: clarify that confirmed candidates remain the only
  inputs to the candidate-based `Save confirmed books` path, while Home Library
  Manual Add is a separate explicit write path.
- `local-library-save`: add the Home Library Manual Add modal, direct-save
  success path, duplicate-review transition and draft restoration, failure
  recovery, and accessibility/result behavior.

## Impact

- Affected code: Home Library header actions, modal form state and validation,
  duplicate-review entry/return flow, local-storage write path, and Home
  Library focus/result handling.
- No API or backend changes; persistence remains browser-local only.
- Main requirement areas: `FR-CONFIRM-005`, `FR-CONFIRM-006`, `FR-LIB-001`,
  `FR-LIB-002`, `FR-DUP-001` through `FR-DUP-005`, `FR-FAIL-004`,
  `FR-FAIL-005`, `NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`,
  `TC-STORAGE-001`, and `TC-STORAGE-002`.
