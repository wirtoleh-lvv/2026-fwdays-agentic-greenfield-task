## Why

Extracted candidates are currently editable but cannot be explicitly accepted
or rejected. Librarian needs a transient, reversible decision step so user
control is established before duplicate review or local saving can be added.

## What Changes

- Derive each candidate's `Needs Review` or `Ready for Confirmation` status
  from its current title, authors, and explicit unknown-author acknowledgement
  (`FR-CONFIRM-007`).
- Let the user explicitly confirm a valid candidate or skip any candidate, and
  let them reverse either choice before leaving the review workflow
  (`FR-CONFIRM-003`, `FR-CONFIRM-004`, `FR-CONFIRM-006`,
  `FR-CONFIRM-008`).
- Revoke confirmation when the user edits confirmed information so only the
  currently reviewed values can remain confirmed (`FR-CONFIRM-002`,
  `FR-CONFIRM-006`, `FR-CONFIRM-008`).
- Announce candidate-state changes and keep all decision controls labeled,
  visibly focusable, and keyboard-operable (`NFR-A11Y-001`, `NFR-A11Y-002`,
  `NFR-A11Y-003`).
- Keep candidate information and decisions transient; this change does not
  create or persist Library Books.

### Non-goals

- Manual Add or recovery from extraction failure through Manual Add.
- Duplicate or Possible Duplicate detection and resolution.
- Saving, browser persistence, Home Library navigation, or Library Book
  management.
- Metadata enrichment or changes to the extraction provider/API contract.
- AI confidence scores or a new uncertainty field; empty extracted values are
  the MVP uncertainty signal.

## Capabilities

### New Capabilities

- `candidate-decision`: Derive candidate readiness and support reversible,
  explicit confirm and skip decisions without persistence.

### Modified Capabilities

None.

## Impact

- Extends the existing browser-only candidate review state and Figma-derived
  candidate cards.
- Adds a candidate validity rule: trimmed title plus at least one non-empty
  author, or an explicit unknown-author acknowledgement.
- Adds public UI behavior tests for dynamic readiness, confirm, skip, reversal,
  edit-after-confirmation, focus, and announcements.
- Does not change the extraction API, backend, provider integration, or privacy
  boundary.
