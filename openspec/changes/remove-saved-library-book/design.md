## Context

Home Library is loaded into `LibrarianApp` and stored as one versioned browser
collection. The storage boundary currently validates full reads and performs
complete writes for saving, while the populated Home Library renders records
without management controls. This change adds the accepted `FR-LIB-005`
removal outcome without changing the storage schema or introducing a backend.

The visual source is the repository-captured remove-dialog state
`05-remove-library-book-dialog.png`, adapted to the current text-only Library
Book presentation and the approved focus, retry, and fresh-read semantics.

## Goals / Non-Goals

**Goals:**

- Require explicit confirmation before permanent removal.
- Preserve unrelated records from the latest valid browser collection and
  remove only the stable target id with one complete write.
- Make already-absent removal idempotent and safe without a redundant write.
- Keep read/write failures non-destructive, retryable, and honest.
- Provide predictable dialog, announcement, and post-removal focus behavior.

**Non-Goals:**

- Undo, recycle bin, soft deletion, history, or bulk removal.
- Edit, search, sort, filters, metadata, or cover persistence.
- Backend deletion, accounts, cloud sync, or server persistence.
- Real-time storage-event synchronization, cross-tab locking, revisions, or
  transactional guarantees across the read-to-write interval.

## Decisions

### Use a fresh validated read before every destructive write

The removal boundary will reload and validate the complete browser collection
when the user confirms or retries, locate the target by stable Library Book id,
derive the remaining collection, and perform exactly one versioned write. The
UI will update only from the boundary's successful result.

This preserves unrelated records already written by another tab before the
fresh read and reuses the existing fail-closed validation contract. Alternative
considered: filter the app's in-memory collection and write it directly. That
can erase records added after the current screen loaded.

### Treat an absent target as an idempotent no-write outcome

If the latest valid collection no longer contains the target id, the boundary
will return that latest collection without calling `setItem`. The dialog closes,
the screen refreshes from the returned collection, and status text says that
the named book is no longer in the library.

Alternative considered: show a conflict error. The requested end state is
already true, so an error would create a retry that can never remove anything.

### Keep confirmation and failure state in the Home Library owner

Opening Remove stores the target Library Book and triggering control, but does
not access storage. Cancel, close, and Escape clear the dialog without a read or
write. A failed confirmed attempt keeps the target and visible collection
unchanged, renders an alert inside the dialog, and replaces or augments the
destructive action with Retry while retaining Cancel.

No optimistic list update occurs. Alternative considered: remove the row first
and restore it on failure. That creates false success, unstable focus, and a
brief mismatch with browser storage.

### Apply deterministic focus transitions

The modal traps focus and initially focuses Cancel rather than the destructive
action. Cancellation returns focus to the triggering Remove control. Failure
focuses Retry. After success, focus moves to the next remaining book's Remove
control, otherwise the previous book's Remove control; removing the last book
focuses the existing empty-state heading. Text status identifies the removed
title without relying on color.

Alternative considered: always focus Home Library after removal. That forces a
keyboard user to traverse the page again when removing several individual
records.

### Accept a narrow remaining cross-tab race

Fresh-read preservation covers changes completed before removal begins, but
browser storage provides no compare-and-swap transaction across the subsequent
read-to-write interval. This slice will document that limitation rather than
add locking, revision fields, or real-time synchronization.

## Risks / Trade-offs

- [Permanent removal is destructive] → Require a named confirmation dialog,
  initially focus Cancel, and provide no direct one-click deletion.
- [Storage becomes unreadable or unavailable] → Leave the collection and
  dialog unchanged, write nothing, and offer Retry or Cancel.
- [Another tab writes between fresh read and write] → Accept the narrow race as
  an explicit non-goal; preserve every record present in the fresh read.
- [The target disappears in another tab] → Treat it as an idempotent no-write
  result and refresh from the latest valid collection.
- [Removing a row destroys its focus target] → Precompute the adjacent target
  by stable id and apply the specified next/previous/empty focus order.

## Migration Plan

No storage migration is required. Removal rewrites the existing version-1
envelope with fewer records. Rollback leaves the resulting valid collection
readable by the current application.

## Open Questions

None for this slice.
