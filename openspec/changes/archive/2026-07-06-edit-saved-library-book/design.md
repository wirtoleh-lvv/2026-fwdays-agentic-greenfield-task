## Context

Home Library already supports local load, duplicate-aware batch save, and safe per-book removal. The remaining accepted library-management gap is `FR-LIB-004`: editing a saved Library Book after it has already been stored locally. The prototype provides a clear modal direction for this flow (`04-edit-library-book-dialog.png`), and the current app already has adjacent patterns for local draft state, browser-only persistence, duplicate normalization, modal focus handling, and reload-before-write safety in removal.

The edit slice needs to stay on Home Library. It should not introduce new saved-book fields, server persistence, duplicate-review routing, or full real-time multi-tab coordination. It does need to preserve the MVP's existing invariants: explicit user control, browser-local writes only, deterministic duplicate semantics, and non-color-only feedback.

## Goals / Non-Goals

**Goals:**
- Let the user edit a saved Library Book from Home Library using a focused modal dialog.
- Reuse existing title/author/author-unknown data semantics rather than creating new saved-book shape.
- Detect exact duplicates and possible duplicates during edit without forcing the existing batch Duplicate Review flow.
- Save through a fresh-read, stable-id patch, single-write path so edits preserve unrelated books already present in storage.
- Keep the flow keyboard-safe and resilient to stale targets or browser-storage failures.

**Non-Goals:**
- Adding search, cover thumbnails, metadata enrichment, bulk editing, or inline card editing.
- Changing duplicate rules or the existing batch Duplicate Review flow for candidate saves.
- Guaranteeing cross-tab transactional safety beyond the existing read-then-single-write approach.
- Adding backend persistence, syncing, or account-scoped data.

## Decisions

### 1. Use a Home Library modal dialog with isolated draft state

The edit interaction will be a modal layered over the existing Home Library list, matching the prototype and keeping the current library visible but unchanged behind the dialog. The dialog state should store a draft copy of the target book plus metadata such as dirty state, validation state, and the triggering element for focus restoration.

Alternative considered:
- Inline card editing. Rejected because it complicates focus order, makes error and warning messages harder to localize, and diverges from the existing visual direction.

### 2. Limit edit scope to existing saved fields

The dialog will only edit `title`, `authors`, and `authorUnknown`. This keeps the change aligned with the current local-storage schema and avoids inventing cover, notes, or metadata behaviors that are not yet specified.

Alternatives considered:
- Add cover or metadata editing now. Rejected as out of scope and unsupported by canonical requirements.

### 3. Reuse duplicate normalization but not the batch duplicate-review UI

The edit flow should call the same normalization logic already used for `FR-DUP-001` through `FR-DUP-003`, excluding the currently edited stable id from comparison. Exact duplicates become inline blocking errors because saving them would create an indistinguishable duplicate Library Book. Possible duplicates remain warnings only, because the user is intentionally editing an existing saved record and should not be forced through the heavier candidate-review conflict flow.

Alternatives considered:
- Route edit saves through Duplicate Review. Rejected because that state is designed for batch candidate resolution before first save, not a single already-saved book.
- Ignore possible duplicates entirely. Rejected because it would hide a meaningful data-quality warning already defined by canonical duplicate semantics.

### 4. Preserve author chips when Author unknown is enabled

When the user turns on Author unknown, existing author chips should remain in the draft but the author input and chip removal controls should become disabled. This preserves accidental work while still making the active semantic state explicit. On save, the persisted book should continue to reflect the existing schema's explicit author-unknown field together with the chosen author list semantics implemented by the app.

Alternative considered:
- Clear author chips immediately on toggle. Rejected because it is harsher on accidental toggles and loses user work.

### 5. Save through fresh read, stable-id patch, and one complete write

Immediately before applying an edit, the app should reload and validate the latest stored Home Library, find the target by stable id, patch only the editable fields, and then persist the full updated collection once. This matches the safety posture already adopted for removal: preserve everything present in the fresh read, but do not claim full protection against another tab writing during the narrow read→write interval.

Alternatives considered:
- Mutate the in-memory visible library without a fresh read. Rejected because it can overwrite newer stored data.
- Add revisions/locking now. Rejected as a separate capability with broader architectural impact.

### 6. Treat a missing target on save as a successful no-write replacement outcome

If the fresh read succeeds but the target id is absent, the dialog should close, Home Library should refresh to that fresh collection, and the app should announce that the named book is no longer in the library. This mirrors the safe-destructive behavior chosen for removal and avoids trapping the user in an edit dialog for a record that no longer exists.

Alternative considered:
- Keep the dialog open with an error. Rejected because there is no longer a valid target to save against.

### 7. Mirror failure recovery patterns from removal for edit-save failures

If the fresh read or final write fails during Save changes, the app should keep the dialog open, preserve the current draft, announce that the book was not updated, and offer Retry and Cancel. Focus should move to Retry. This gives the user a direct recovery path without losing draft work.

Alternative considered:
- Close the dialog on failure and force the user to re-open it. Rejected because it needlessly discards active context and draft edits.

## Risks / Trade-offs

- [Author-unknown semantics with preserved chips] → The UI can momentarily show disabled authors alongside an active unknown-author state. Mitigation: make the checkbox state authoritative in validation and save copy, and visually indicate that authors are preserved but inactive.
- [Edit and removal dialogs may compete in shared modal infrastructure] → Refactoring dialog primitives can affect already-implemented removal behavior. Mitigation: cover focus, announcements, and restore paths with behavior tests at the `LibrarianApp` seam.
- [Possible duplicate warning copy may be interpreted as blocking] → Users may hesitate unnecessarily. Mitigation: distinguish warning styling/copy from exact-duplicate error styling and keep Save changes enabled.
- [Read→write race remains possible] → Another tab can still write between fresh read and complete write. Mitigation: state this as an accepted limitation of the MVP and defer stronger concurrency controls to a separate capability.
