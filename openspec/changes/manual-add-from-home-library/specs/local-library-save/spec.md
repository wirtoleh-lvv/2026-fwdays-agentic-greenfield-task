## ADDED Requirements

### Requirement: Manually add a Library Book from Home Library
The system SHALL expose an `Add manually` action in Home Library that opens a modal dialog aligned to the approved Figma state. The dialog SHALL let the user enter a title, an author list, and an explicit `Author unknown` acknowledgement. The `Add to library` action SHALL remain unavailable until the draft has a non-empty trimmed title and either at least one non-empty trimmed author or the explicit `Author unknown` acknowledgement. Activating `Add to library` with a valid conflict-free draft SHALL reload and validate the latest complete browser-local collection, append exactly one new Library Book with a stable local id, and persist the complete resulting collection with exactly one versioned browser-storage write. (`FR-CONFIRM-005`, `FR-LIB-001`, `FR-LIB-002`, `FR-LIB-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`)

#### Scenario: Home Library opens the Manual Add modal
- **WHEN** the user activates `Add manually` from Home Library
- **THEN** a modal dialog opens with empty Manual Add inputs and no browser-storage read or write

#### Scenario: Validity requires title and author or explicit unknown author
- **WHEN** the Manual Add draft lacks a non-empty trimmed title or has neither an author nor explicit `Author unknown`
- **THEN** `Add to library` remains unavailable

#### Scenario: Clean draft closes without side effects
- **WHEN** the user cancels, closes, or presses Escape while the Manual Add draft is still clean
- **THEN** the modal closes, no browser-storage read or write occurs, and focus returns to the `Add manually` action

#### Scenario: Dirty draft requires discard confirmation
- **WHEN** the user cancels, closes, or presses Escape after changing the Manual Add draft
- **THEN** the system requires explicit discard confirmation before closing and performs no browser-storage read or write unless the user later activates `Add to library`

#### Scenario: Conflict-free Manual Add writes one complete collection
- **WHEN** the user activates `Add to library` with a valid draft and the latest valid browser-local collection contains no duplicate conflicts for that draft
- **THEN** the system writes one complete updated collection, closes the modal, refreshes Home Library from the saved collection, and announces that the named book was added

#### Scenario: Manual Add failure preserves the draft
- **WHEN** reading or writing the latest browser-local collection fails after the user activates `Add to library`
- **THEN** the system keeps the modal open with the draft unchanged, reports that the named book was not added, and offers Retry or Cancel without claiming success

## MODIFIED Requirements

### Requirement: Load Home Library from browser storage
The system SHALL load a versioned Home Library from browser storage without a backend request and SHALL present the stored Library Books, or an empty Home Library when no stored collection exists. A valid stored Library Book SHALL contain a stable local id, a title, an author list, and whether the author is explicitly unknown. From Home Library, the user SHALL be able to enter the existing Add books workflow and the Home Library Manual Add modal. Cancelling from the initial Add books upload state or cancelling a clean Manual Add modal draft SHALL return the user to the unchanged Home Library without any browser-storage read or write. (`FR-LIB-002`, `FR-LIB-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`)

#### Scenario: First local session has no saved books
- **WHEN** Librarian starts and no Home Library value exists in browser storage
- **THEN** it displays the empty Home Library with Add books and Add manually actions

#### Scenario: Later session loads saved books
- **WHEN** Librarian starts and browser storage contains a valid Home Library
- **THEN** it displays every stored Library Book without contacting the backend

#### Scenario: Add books opens the extraction workflow
- **WHEN** the user activates Add books from Home Library
- **THEN** the app opens the existing photo upload workflow without changing stored Library Books

#### Scenario: Add manually opens the Manual Add modal
- **WHEN** the user activates Add manually from Home Library
- **THEN** the app opens the Manual Add modal without changing stored Library Books

#### Scenario: User cancels the initial Add books upload
- **WHEN** the user activates Cancel from the initial Add books upload screen before extraction begins
- **THEN** the app returns to Home Library, preserves the visible collection, performs no browser-storage read or write, and restores focus to Add books

#### Scenario: User cancels a clean Manual Add draft
- **WHEN** the user closes a clean Manual Add modal draft
- **THEN** the app returns to the unchanged Home Library, performs no browser-storage read or write, and restores focus to Add manually

### Requirement: Save remains separate from confirmation
The system SHALL expose a separate Save confirmed books action only when at least one candidate is explicitly Confirmed. Activating Confirm SHALL remain transient and SHALL NOT write browser storage. The Save action SHALL exclude undecided and Skipped candidates. Home Library Manual Add SHALL be a separate explicit write path and SHALL NOT create or confirm a candidate before writing. (`FR-CONFIRM-003`, `FR-CONFIRM-006`, `FR-LIB-001`)

#### Scenario: No candidate is confirmed
- **WHEN** the candidate review contains no Confirmed candidate
- **THEN** Save confirmed books is unavailable and no browser-storage write occurs

#### Scenario: Confirmed candidates are selected for saving
- **WHEN** the user activates Save confirmed books with one or more Confirmed candidates
- **THEN** only those Confirmed candidates enter duplicate evaluation

#### Scenario: Manual Add does not create a confirmed candidate
- **WHEN** the user opens or submits Home Library Manual Add
- **THEN** the flow does not create a confirmed candidate and does not expose the `Save confirmed books` action as part of Manual Add

### Requirement: Classify deterministic duplicate conflicts
Before saving, the system SHALL normalize candidate, Home Library Manual Add draft, and Library Book titles and authors by trimming leading and trailing whitespace, collapsing repeated internal whitespace, and comparing case-insensitively. Author order SHALL NOT affect equality, while punctuation and diacritics SHALL remain significant. A normalized title and author-list match SHALL be a Duplicate; a normalized title match with differing or missing author information SHALL be a Possible Duplicate. The system SHALL NOT apply fuzzy matching. (`FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`)

#### Scenario: Exact normalized information matches
- **WHEN** a Confirmed candidate or Home Library Manual Add draft and a Library Book have the same normalized title and author list in any author order
- **THEN** that item is classified as a Duplicate

#### Scenario: Title matches but author information differs
- **WHEN** a Confirmed candidate or Home Library Manual Add draft and a Library Book have the same normalized title but different or missing normalized author information
- **THEN** that item is classified as a Possible Duplicate

#### Scenario: Punctuation or diacritics differ
- **WHEN** titles differ after case and whitespace normalization because punctuation or diacritics differ
- **THEN** that pair is not classified as a Duplicate or Possible Duplicate

#### Scenario: No existing Library Book conflicts
- **WHEN** no Library Book has the same normalized title as any Confirmed candidate or Home Library Manual Add draft
- **THEN** that item can proceed directly to local persistence

### Requirement: Resolve all conflicts before persistence
The system SHALL present every Duplicate and Possible Duplicate in one Duplicate Review state before writing any batch item. Each conflict SHALL identify the candidate or Home Library Manual Add draft, its matching Library Book, and its category, and SHALL require an explicit Save anyway or Exclude resolution. Returning from Duplicate Review SHALL preserve candidate edits, unknown-author acknowledgements, Confirm/Skip decisions, existing conflict resolutions, and any Home Library Manual Add draft that entered duplicate review. (`FR-DUP-004`, `FR-DUP-005`, `FR-FAIL-005`)

#### Scenario: Batch contains one or more conflicts
- **WHEN** duplicate evaluation finds conflicts
- **THEN** Duplicate Review lists every conflict and no Library Book is written

#### Scenario: Conflict is explicitly included
- **WHEN** the user resolves a conflict as Save anyway
- **THEN** that Confirmed candidate or Home Library Manual Add draft remains in the resolved save batch

#### Scenario: Conflict is explicitly excluded
- **WHEN** the user resolves a conflict as Exclude
- **THEN** that Confirmed candidate or Home Library Manual Add draft is removed from the resolved save batch without changing its preserved review information

#### Scenario: Conflict remains unresolved
- **WHEN** at least one displayed conflict has no explicit resolution
- **THEN** the final batch-save action is unavailable

#### Scenario: User returns to candidate review
- **WHEN** the user activates Back to review from Duplicate Review after arriving there from candidate review
- **THEN** the app restores the preserved candidate review state without a browser-storage write

#### Scenario: User returns to a preserved Manual Add draft
- **WHEN** the user activates Back to review from Duplicate Review after arriving there from Home Library Manual Add
- **THEN** the app reopens the Manual Add modal with the preserved draft and no browser-storage write

### Requirement: Persist the resolved batch atomically
The system SHALL append the complete resolved batch to the current Home Library with one versioned browser-storage write. If loading or writing browser storage fails, the system SHALL report that the library was not saved, preserve candidate and conflict state or the Home Library Manual Add draft and conflict state, offer Retry, and SHALL NOT overwrite unreadable existing data or claim partial success. (`FR-LIB-001`, `FR-FAIL-004`, `FR-FAIL-005`, `NFR-PRIV-001`, `TC-STORAGE-001`)

#### Scenario: Resolved batch is written successfully
- **WHEN** at least one resolved candidate or Home Library Manual Add draft remains and the browser-storage write succeeds
- **THEN** every resolved item becomes a Library Book in one updated Home Library value

#### Scenario: Browser-storage write fails
- **WHEN** writing the resolved Home Library value throws or otherwise fails
- **THEN** the app remains in the save workflow, reports that no book was saved, preserves all review or Manual Add and conflict state, and offers Retry

#### Scenario: Stored Home Library is unreadable
- **WHEN** the stored value cannot be parsed or validated as the supported version
- **THEN** the app reports that Home Library cannot be loaded, offers Retry, and does not replace the unreadable value

#### Scenario: Every conflict is excluded
- **WHEN** conflict resolution leaves no candidate or Manual Add draft in the resolved batch
- **THEN** no browser-storage write occurs and the app offers a return to the originating review state

### Requirement: Keep local-save workflow accessible and within scope
The system SHALL keep Save, duplicate resolution, Retry, Back to review, Add books, Add manually, initial upload cancellation, Home Library Manual Add dialog actions, Home Library search, per-book Edit, edit dialog actions, per-book Remove, removal confirmation, and removal Retry or Cancel controls labeled, keyboard-operable, and visibly focusable, SHALL move focus to a meaningful heading or control after screen and dialog transitions, and SHALL communicate duplicate, warning, error, empty, no-results, manual-add-result, edit-result, removal, and save-success states without color alone. Manual Add, edit, and removal dialogs SHALL trap keyboard focus while open. The Manual Add dialog SHALL initially focus the Title field, SHALL require discard confirmation only when its draft is dirty, and when a Manual Add save attempt fails it SHALL move focus to Retry while keeping Cancel reachable. Live Home Library filtering SHALL keep focus in the search field while results update, including transitions into the no-results state. When Home Library visually hides per-book actions in hover-capable environments, keyboard focus into the relevant Library Book SHALL reveal those actions without requiring pointer hover, and no-hover environments SHALL keep the actions visible. This capability SHALL NOT add extraction-screen Manual Add, metadata enrichment, cover persistence, account, backend-library, cloud-sync, multi-tab transaction guarantees, bulk edit, bulk-removal, removal-history behavior, sorting, advanced filters, fuzzy search, or backend search. (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`, `BC-MVP-001`)

#### Scenario: Keyboard user completes local save
- **WHEN** a keyboard user moves through Save, Duplicate Review, conflict resolution, and Home Library transitions
- **THEN** every action is operable, focus remains visible, and focus moves to the resulting screen's meaningful heading or first required control

#### Scenario: Initial upload cancellation restores Home Library focus
- **WHEN** a keyboard user cancels from the initial Add books upload screen
- **THEN** focus returns to the Home Library Add books action after the screen transition

#### Scenario: Manual Add dialog manages focus safely
- **WHEN** a keyboard user opens Home Library Manual Add
- **THEN** focus moves into a trapped dialog and initially rests on the Title field rather than a dismiss or destructive action

#### Scenario: Manual Add cancellation restores trigger focus
- **WHEN** the user closes a clean or explicitly discarded Manual Add dialog
- **THEN** focus returns to the Add manually action that opened the dialog

#### Scenario: Manual Add save failure focuses recovery
- **WHEN** a Manual Add read or write fails
- **THEN** the failure is announced, Retry receives focus, and Cancel remains keyboard reachable

#### Scenario: Manual Add success focuses the new book
- **WHEN** a Home Library Manual Add write succeeds
- **THEN** the named addition is announced and focus moves to the new Library Book's Edit action

#### Scenario: Home Library search keeps typing focus
- **WHEN** a keyboard user types into the populated Home Library search field
- **THEN** focus remains in that field while visible results update, including transitions into and out of the no-results state

#### Scenario: Keyboard focus reveals hidden book actions
- **WHEN** a keyboard user tabs into a Library Book whose per-book actions are visually hidden in a hover-capable environment
- **THEN** the Edit and Remove actions for that Library Book become visible before activation is required

#### Scenario: No-hover environments keep book actions visible
- **WHEN** Home Library is rendered in an environment without hover support
- **THEN** each saved Library Book keeps its Edit and Remove actions visible without requiring a reveal interaction

#### Scenario: Edit dialog manages focus safely
- **WHEN** a keyboard user opens saved-book editing
- **THEN** focus moves into a trapped dialog and initially rests on the Title field rather than a destructive or dismiss action

#### Scenario: Edit cancellation restores trigger focus
- **WHEN** the user closes a clean or explicitly discarded edit dialog
- **THEN** focus returns to the Edit action that opened the dialog

#### Scenario: Edit failure focuses recovery
- **WHEN** an edit-save read or write fails
- **THEN** the failure is announced, Retry receives focus, and Cancel remains keyboard reachable

#### Scenario: Edit stale-target outcome is announced
- **WHEN** edit save finds that the target is already absent
- **THEN** the no-write outcome is announced by text and focus follows the same adjacent-book or empty-state rule used for successful removal

#### Scenario: Removal dialog manages focus safely
- **WHEN** a keyboard user opens removal confirmation
- **THEN** focus moves into a trapped dialog and initially rests on Cancel rather than the destructive action

#### Scenario: Removal cancellation restores trigger focus
- **WHEN** the user cancels, closes, or presses Escape in removal confirmation
- **THEN** focus returns to the Remove action that opened the dialog

#### Scenario: Removal failure focuses recovery
- **WHEN** a confirmed removal read or write fails
- **THEN** the failure is announced, Retry receives focus, and Cancel remains keyboard reachable

#### Scenario: Successful removal restores adjacent focus
- **WHEN** removal succeeds and one or more Library Books remain
- **THEN** the named removal is announced and focus moves to the next remaining book's Remove action, or the previous remaining book's Remove action when no next book exists

#### Scenario: Last-book removal focuses the empty state
- **WHEN** successful removal leaves the Home Library empty
- **THEN** the named removal is announced and focus moves to the empty-library heading

#### Scenario: Already-absent removal is announced
- **WHEN** confirmed removal finds that the target is already absent
- **THEN** the no-write outcome is announced by text and focus follows the same adjacent-book or empty-state rule

#### Scenario: Save workflow states are communicated
- **WHEN** duplicate review, possible-duplicate warning, persistence failure, empty Home Library, no-results state, manual-add outcome, edit outcome, removal outcome, or save success is displayed
- **THEN** the state is identified by text and structure rather than color alone

#### Scenario: Deferred controls remain absent
- **WHEN** this capability is rendered
- **THEN** it exposes no extraction-screen Manual Add, metadata enrichment, cover-persistence, account, backend-library, cloud-sync, multi-tab transaction guarantees, bulk edit, bulk-removal, removal-history behavior, sorting, advanced filters, fuzzy search, or backend search
