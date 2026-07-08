## Why

Home Library currently lets the user save and remove Library Books, but not correct mistakes after they are stored. `FR-LIB-004` is accepted but still unimplemented, and the prototype already establishes an edit dialog pattern that fits the MVP's confirmation-based, local-first model.

## What Changes

- Add a Home Library edit dialog for a saved Library Book with prefilled Title, Author(s), and explicit Author unknown controls.
- Let the user change only editable Library Book fields already present in local storage: title, authors, and author-unknown state.
- Validate edits inline: require a non-empty trimmed title, require either at least one author or Author unknown, block exact duplicates, and warn on Possible Duplicates without forcing a separate review flow.
- Save edits by reloading the latest valid browser-local collection, replacing only the matching stable id, and writing the complete updated collection once.
- Handle stale-target and storage-failure outcomes without silently losing draft edits or mutating the visible Home Library prematurely.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `local-library-save`: add saved-book editing behavior, inline duplicate handling for edits, edit-dialog accessibility, and save outcomes for stale or failed local writes.

## Impact

- Affects Home Library UI state, modal dialog behavior, live announcements, and local-storage save flows in the existing librarian app.
- Reuses the current browser-local Home Library schema and duplicate normalization semantics; no backend, API, or persistence-model expansion.
- Non-goals: search changes, cover-image display or editing, metadata enrichment, multi-tab transaction guarantees, bulk edit, and any cloud/account behavior.
