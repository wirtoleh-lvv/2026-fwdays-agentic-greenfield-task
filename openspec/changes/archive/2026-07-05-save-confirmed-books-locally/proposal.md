## Why

Confirmed candidates currently remain transient, so users cannot complete the
core MVP outcome or see their books in a later browser session. Librarian needs
one explicit, duplicate-aware save path that turns only user-approved candidates
into browser-local Library Books.

## What Changes

- Add a separate `Save confirmed books` action; Confirm remains reversible and
  does not itself persist data (`FR-CONFIRM-003`, `FR-CONFIRM-006`,
  `FR-LIB-001`).
- Compare every confirmed candidate with the current Home Library using the
  approved deterministic normalization and classify exact and possible
  duplicates (`FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`).
- Present all conflicts before any write, require a `Save anyway` or `Exclude`
  resolution for each, and preserve review state when returning to candidates
  (`FR-DUP-004`, `FR-DUP-005`, `FR-FAIL-005`).
- Persist the resolved batch atomically in browser storage, report failures
  without false success or destructive overwrite, and support retry
  (`FR-LIB-001`, `FR-FAIL-004`, `NFR-PRIV-001`, `TC-STORAGE-001`,
  `TC-STORAGE-002`).
- Navigate to Home Library after success and load locally stored Library Books
  on reload or a later session in the same browser profile (`FR-LIB-002`,
  `FR-LIB-003`).
- Match the approved Figma-derived Duplicate Review, save-success Home Library,
  populated Home Library, and empty Home Library states while preserving
  keyboard, focus, and non-color-only status requirements (`NFR-A11Y-001`,
  `NFR-A11Y-002`, `NFR-A11Y-003`).

### Non-goals

- Editing or removing saved Library Books.
- Search, sort, filters, analytics, or metadata enrichment.
- Manual Add or changes to extraction/provider behavior.
- Persisting candidate review progress before an explicit Save.
- Cover-image persistence, accounts, backend library storage, or cloud sync.
- Fuzzy duplicate matching beyond the approved normalized exact-title rules.
- Destructive recovery for unreadable browser storage.

## Capabilities

### New Capabilities

- `local-library-save`: Explicit duplicate-aware batch saving, browser-local
  persistence, failure recovery, and immediate/later-session Home Library
  display.

### Modified Capabilities

None.

## Impact

- Adds a versioned browser-storage boundary and Library Book model in client
  code; no server route, provider contract, secret, or backend persistence is
  added.
- Extends the current candidate review workflow with Save and Duplicate Review
  states and introduces populated/empty Home Library presentation.
- Adds public UI and storage-boundary tests for normalization, conflict
  resolution, atomic failure, reload persistence, navigation, accessibility,
  and MVP scope exclusions.
