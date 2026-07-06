## Why

Home Library now lets the user save, edit, and remove Library Books, but the
visible list becomes harder to use as it grows. The approved Figma direction
introduces a search-first way to narrow saved books by title or author without
changing the library itself, and the current main spec still explicitly defers
search.

## What Changes

- Add a populated-state Home Library search field that filters Library Books by
  title or author as the user types.
- Keep filtering local to the current browser session only: do not persist the
  query to browser storage, the URL, or the backend.
- Add a no-results state that echoes the current query, keeps the search field
  focused, and offers both inline clear and explicit `Clear search` recovery.
- Recompute visible results immediately after local save, edit, and removal
  outcomes while preserving the active query in the live app session.
- Introduce a new canonical local-library-management requirement for Home
  Library search (`FR-LIB-006`) and update the local-save accessibility/scope
  requirement to stop deferring search in this slice.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `local-library-save`: add populated Home Library search behavior, no-results
  recovery, session-local query lifecycle, and accessibility rules for live
  filtering.

## Impact

- Affects the Home Library UI state and rendering logic in `LibrarianApp`.
- Requires new behavior tests at the public Home Library seam plus completion
  updates to canonical local-library-management requirements and the main
  `local-library-save` spec.
- Non-goals: splitting `Add books` into `Add manually` / `Add from photo`,
  search persistence in browser storage or URL, fuzzy matching, sorting,
  filters, candidate-review search, and backend search.
