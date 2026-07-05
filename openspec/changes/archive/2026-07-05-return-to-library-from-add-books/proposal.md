## Why

Users can enter Add books from Home Library, but the initial upload screen does
not currently provide a way to abandon that transition and return to Home
Library. This leaves the workflow asymmetric and makes a mistaken entry into Add
books feel like a dead end until the page is reloaded.

## What Changes

- Add a Home Library return path from the initial Add books upload screen before
  any extraction request starts.
- Keep the visible Home Library collection unchanged when the user cancels from
  that initial upload state, with no browser-storage read or write.
- Restore focus to the Home Library Add books action after cancellation so the
  transition remains keyboard coherent.
- Preserve the existing extraction, candidate review, duplicate review, and save
  behaviors outside this initial upload-state cancellation path.

Non-goals:

- Adding cancellation or abandonment flows for candidate review, duplicate
  review, extraction failure, or save-failure states.
- Changing browser-local storage formats or save semantics.
- Introducing cross-tab sync, draft persistence, or any account/cloud behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `local-library-save`: Define how a user can cancel the initial Add books
  upload screen and return to unchanged Home Library with focus restored to Add
  books. (`FR-LIB-002`, `FR-LIB-003`, `NFR-A11Y-001`, `NFR-A11Y-002`)

## Impact

- Affected UI state ownership between `LibrarianApp` and `PhotoExtractionForm`.
- Affected Home Library to Add books transition tests and keyboard-focus
  coverage.
- No API route, extraction adapter, or browser-storage schema changes.
