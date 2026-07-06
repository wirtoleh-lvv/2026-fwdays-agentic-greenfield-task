## ADDED Requirements

### Requirement: Search a populated Home Library locally
The system SHALL expose a search field only when Home Library contains one or
more saved Library Books. The search field SHALL filter the visible Home
Library live as the user types by matching the current query against Library
Book title text and author text using case-insensitive substring comparison.
The active query SHALL be UI state only: it SHALL persist while the user stays
in the current live app session, SHALL clear on a fresh page load, and SHALL
NOT be written to browser storage, the URL, or the backend. While a query is
active, the Home Library heading count SHALL continue to show the total saved
book count rather than the filtered result count. When no Library Books match
the active query, the system SHALL keep the search field focused, show an
explicit no-results state that echoes the current query, and offer both an
inline clear control and a dedicated `Clear search` action that restore the
full visible Home Library without mutating stored Library Books. (`FR-LIB-006`,
`FR-LIB-002`, `FR-LIB-003`, `NFR-A11Y-001`, `NFR-A11Y-002`,
`NFR-A11Y-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`)

#### Scenario: Populated Home Library shows a search field
- **WHEN** Librarian loads a Home Library with one or more saved Library Books
- **THEN** the Home Library renders a search field and keeps the existing empty
  library state free of search controls

#### Scenario: Search filters by title or author as the user types
- **WHEN** the user types a query into the Home Library search field
- **THEN** the visible Library Books update live to include only books whose
  title text or author text contains the query case-insensitively

#### Scenario: Query is preserved in-session but cleared on reload
- **WHEN** the user navigates within the live app session and later returns to
  Home Library without a full page reload
- **THEN** the active search query and filtered results are preserved

#### Scenario: Fresh reload clears the query
- **WHEN** the user reloads Librarian in the same browser profile
- **THEN** Home Library loads the stored Library Books with an empty search
  query and shows the unfiltered collection

#### Scenario: No-results state echoes the active query
- **WHEN** no saved Library Books match the active query
- **THEN** Home Library keeps the search field visible, shows a no-results
  message that includes the current query, and identifies a recovery path
  without relying on color alone

#### Scenario: Both clear affordances restore the full library
- **WHEN** the user activates either the inline clear control or the dedicated
  `Clear search` action while a query is active
- **THEN** the query clears, the full visible Home Library is restored, and no
  browser-storage or backend write occurs

#### Scenario: Library mutations recompute filtered results immediately
- **WHEN** the user saves, edits, or removes a Library Book while a query is
  active in the current live app session
- **THEN** the visible Home Library recomputes immediately from the current
  saved collection and active query, even if that changes the filtered results

## MODIFIED Requirements

### Requirement: Keep local-save workflow accessible and within scope
The system SHALL keep Save, duplicate resolution, Retry, Back to review, Add
books, initial upload cancellation, Home Library search, per-book Edit, edit
dialog actions, per-book Remove, removal confirmation, and removal Retry or
Cancel controls labeled, keyboard-operable, and visibly focusable, SHALL move
focus to a meaningful heading or control after screen and dialog transitions,
and SHALL communicate duplicate, warning, error, empty, no-results, edit-result,
removal, and save-success states without color alone. Edit and removal dialogs
SHALL trap keyboard focus while open. The edit dialog SHALL initially focus the
Title field, and when a save attempt fails it SHALL move focus to Retry while
keeping Cancel reachable. Live Home Library filtering SHALL keep focus in the
search field while results update, including transitions into the no-results
state. This capability SHALL NOT add Manual Add entry changes, metadata
enrichment, cover persistence, account, backend-library, cloud-sync, multi-tab
transaction guarantees, bulk edit, bulk-removal, removal-history behavior,
sorting, advanced filters, fuzzy search, or backend search. (`NFR-A11Y-001`,
`NFR-A11Y-002`, `NFR-A11Y-003`, `BC-MVP-001`)

#### Scenario: Keyboard user completes local save
- **WHEN** a keyboard user moves through Save, Duplicate Review, conflict
  resolution, and Home Library transitions
- **THEN** every action is operable, focus remains visible, and focus moves to
  the resulting screen's meaningful heading or first required control

#### Scenario: Initial upload cancellation restores Home Library focus
- **WHEN** a keyboard user cancels from the initial Add books upload screen
- **THEN** focus returns to the Home Library Add books action after the screen
  transition

#### Scenario: Home Library search keeps typing focus
- **WHEN** a keyboard user types into the populated Home Library search field
- **THEN** focus remains in that field while visible results update, including
  transitions into and out of the no-results state

#### Scenario: Edit dialog manages focus safely
- **WHEN** a keyboard user opens saved-book editing
- **THEN** focus moves into a trapped dialog and initially rests on the Title
  field rather than a destructive or dismiss action

#### Scenario: Edit cancellation restores trigger focus
- **WHEN** the user closes a clean or explicitly discarded edit dialog
- **THEN** focus returns to the Edit action that opened the dialog

#### Scenario: Edit failure focuses recovery
- **WHEN** an edit-save read or write fails
- **THEN** the failure is announced, Retry receives focus, and Cancel remains
  keyboard reachable

#### Scenario: Edit stale-target outcome is announced
- **WHEN** edit save finds that the target is already absent
- **THEN** the no-write outcome is announced by text and focus follows the same
  adjacent-book or empty-state rule used for successful removal

#### Scenario: Removal dialog manages focus safely
- **WHEN** a keyboard user opens removal confirmation
- **THEN** focus moves into a trapped dialog and initially rests on Cancel
  rather than the destructive action

#### Scenario: Removal cancellation restores trigger focus
- **WHEN** the user cancels, closes, or presses Escape in removal confirmation
- **THEN** focus returns to the Remove action that opened the dialog

#### Scenario: Removal failure focuses recovery
- **WHEN** a confirmed removal read or write fails
- **THEN** the failure is announced, Retry receives focus, and Cancel remains
  keyboard reachable

#### Scenario: Successful removal restores adjacent focus
- **WHEN** removal succeeds and one or more Library Books remain
- **THEN** the named removal is announced and focus moves to the next remaining
  book's Remove action, or the previous remaining book's Remove action when no
  next book exists

#### Scenario: Last-book removal focuses the empty state
- **WHEN** successful removal leaves the Home Library empty
- **THEN** the named removal is announced and focus moves to the empty-library
  heading

#### Scenario: Already-absent removal is announced
- **WHEN** confirmed removal finds that the target is already absent
- **THEN** the no-write outcome is announced by text and focus follows the same
  adjacent-book or empty-state rule

#### Scenario: Save workflow states are communicated
- **WHEN** duplicate review, possible-duplicate warning, persistence failure,
  empty Home Library, no-results state, edit outcome, removal outcome, or save
  success is displayed
- **THEN** the state is identified by text and structure rather than color
  alone

#### Scenario: Deferred controls remain absent
- **WHEN** this capability is rendered
- **THEN** it exposes no Manual Add entry changes, metadata enrichment,
  cover-persistence, account, backend-library, cloud-sync, multi-tab
  transaction guarantees, bulk edit, bulk-removal, removal-history behavior,
  sorting, advanced filters, fuzzy search, or backend search
