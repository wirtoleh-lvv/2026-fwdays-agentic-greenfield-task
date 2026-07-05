## Why

Home Library currently preserves saved books but cannot remove records that are
incorrect or no longer owned, leaving the MVP's library-management outcome
incomplete. Users need a deliberate, failure-safe removal path that remains
browser-local. (`FR-LIB-005`, `FR-FAIL-004`)

## What Changes

- Add a per-book Remove action and explicit irreversible confirmation dialog
  that identifies the target Library Book. (`FR-LIB-005`)
- Before confirming deletion, reload and validate the latest browser-local
  collection, remove only the stable target id, and persist the resulting
  collection with one complete write. (`FR-LIB-005`, `NFR-PRIV-001`,
  `TC-STORAGE-001`, `TC-STORAGE-002`)
- Treat a target already absent from the fresh collection as a successful
  no-write outcome and refresh the visible Home Library from that collection.
- Preserve the book and dialog when reading or writing browser storage fails;
  report that the book was not removed and offer Retry or Cancel.
  (`FR-FAIL-004`)
- Announce successful and no-op outcomes, restore meaningful focus, and match
  the approved remove-dialog design at desktop and mobile widths.
  (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`)

### Non-goals

- Undo, recycle bin, soft deletion, or removal history.
- Bulk removal, edit, search, sort, filters, or metadata changes.
- Backend deletion, accounts, cloud synchronization, or server persistence.
- Real-time multi-tab synchronization, locking, or transactional guarantees
  across the browser-storage read-to-write interval.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `local-library-save`: Add permanent, confirmed, browser-local removal with
  fresh-read preservation, idempotent already-absent handling, failure Retry,
  and accessible focus/status transitions.

## Impact

- Extends the client-side Home Library and storage boundary; no API route,
  backend persistence, provider, account, or new dependency is introduced.
- Adds public UI and storage-boundary tests for confirmation, cancellation,
  atomic removal, fresh-read preservation, no-op removal, failure recovery,
  focus, status messaging, responsive layout, and scope exclusions.
