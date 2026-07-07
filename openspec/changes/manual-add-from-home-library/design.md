## Context

Librarian currently requires the photo-based candidate workflow before a user
can add any new Library Book. The product vocabulary and PRD already recognize
Manual Add, but the current canonical wording and prior audit assumed a
candidate-based path. This change deliberately introduces a narrower exception:
from Home Library only, the user can open a Figma-aligned modal and explicitly
write a book directly to browser-local storage.

That exception cannot bypass existing duplicate semantics, local-storage
guarantees, or accessibility expectations. The design therefore has to fit the
new modal into the existing Home Library, duplicate review, and storage result
flows without creating a separate duplicate policy or a partial-write path.

## Goals / Non-Goals

**Goals:**

- Add a Home Library Manual Add modal that matches the approved Figma direction.
- Allow direct save only when the draft is valid and conflict-free.
- Reuse existing duplicate classification and duplicate-resolution behavior for
  conflicts before any write.
- Preserve Manual Add draft state when duplicate review sends the user back to
  review or when local persistence fails.
- Keep focus, announcements, and browser-local persistence consistent with the
  existing Home Library behaviors.

**Non-Goals:**

- Adding Manual Add from extraction failure or candidate review in this slice.
- Changing the existing candidate-based `Save confirmed books` flow.
- Adding metadata enrichment, cover upload, or bulk Manual Add.
- Introducing backend persistence, cloud sync, or account behavior.

## Decisions

### 1. Manual Add is a Home Library-only direct-save exception

The Home Library will expose an `Add manually` action that opens a modal dialog.
Submitting a valid conflict-free draft will write directly to the browser-local
Home Library without creating or confirming an extracted candidate.

Rationale:

- Matches the Figma Home Library interaction the user selected.
- Reduces friction for books the user already knows.
- Keeps the exception contained to one screen instead of redefining every
  extraction and candidate-review entry point in the same change.

Alternatives considered:

- Manual Add as a candidate only. Rejected because the user explicitly chose a
  direct-save UX for this slice.
- Manual Add from both Home Library and extraction failure immediately. Rejected
  because it broadens the slice across multiple screens and origin states.

### 2. Duplicate detection remains shared across all save paths

Manual Add will use the same duplicate normalization and classification rules as
the existing save flow. Conflict-free drafts write directly; Duplicate or
Possible Duplicate drafts leave the modal and enter the existing duplicate
review flow before any write occurs.

Rationale:

- Prevents Manual Add from becoming a silent-duplicate loophole.
- Preserves one meaning for Duplicate, Possible Duplicate, Save anyway, and
  Exclude.
- Avoids inventing an inline duplicate UI that would drift from the current
  review model.

Alternatives considered:

- Inline duplicate handling inside the modal. Rejected because it creates a
  second conflict-resolution model and overloads the modal.
- Skipping duplicate checks for Manual Add. Rejected because it violates the
  existing library trust model.

### 3. Duplicate review must round-trip back to the preserved modal draft

When Manual Add triggers duplicate review, the app will close the modal and
store the draft in transient state. If the user activates Back to review, the
app will reopen the Manual Add modal with the same title, authors, and
unknown-author choice preserved.

Rationale:

- Keeps the modal and duplicate-review responsibilities separate.
- Prevents destructive loss of typed information.
- Reuses the existing duplicate-review screen while adding an origin-aware
  return target.

Alternatives considered:

- Keep the modal open behind duplicate review and mutate it in place. Rejected
  because it complicates focus, layering, and state ownership.

### 4. Manual Add mirrors edit-dialog draft semantics for cancellation and failure

The Manual Add modal will close immediately only when its draft is clean.
Cancel, close, or Escape on a dirty draft will require discard confirmation. If
the browser-local read or write fails after `Add to library`, the modal stays
open with the draft unchanged, announces that the named book was not added, and
offers Retry and Cancel.

Rationale:

- Matches existing Home Library dialog expectations.
- Protects user-entered text from accidental dismissal.
- Keeps failure recovery local and explicit without partial writes.

Alternatives considered:

- Always close on cancel. Rejected because it discards typed data too easily.
- Fail by leaving the user in duplicate review only. Rejected because
  conflict-free and conflicted writes should both preserve the user’s draft
  recovery path.

### 5. Successful save returns focus to the new book’s Edit action

After a successful Manual Add save, the modal will close, Home Library will
refresh from the saved collection, a success status will announce the added
title, and focus will move to the new book’s `Edit` action.

Rationale:

- Orients the user to the exact saved record.
- Makes immediate correction available if they spot an issue.
- Uses a safer follow-up target than `Remove`.

Alternatives considered:

- Focus the Home Library heading. Rejected because it is less specific and less
  helpful for immediate verification or correction.

## Risks / Trade-offs

- [Manual Add creates a second persistence path] → Limit the exception to Home
  Library only and explicitly preserve the existing candidate-based save rules.
- [Direct save could conflict with duplicate semantics] → Require the same
  duplicate classification and duplicate review before any conflicting write.
- [State could be lost between modal and duplicate review] → Preserve the Manual
  Add draft in transient state and restore it on Back to review or failure.
- [Figma modal does not show `Author unknown`] → Add the explicit control as a
  requirement-driven deviation to preserve the existing Library Book data model.
