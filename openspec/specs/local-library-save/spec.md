# Local Library Save

## Purpose

Define explicit, duplicate-aware saving of confirmed candidates to a
browser-local Home Library, including safe recovery and accessible workflow
transitions.

## Requirements

### Requirement: Load Home Library from browser storage
The system SHALL load a versioned Home Library from browser storage without a backend request and SHALL present the stored Library Books, or an empty Home Library when no stored collection exists. A valid stored Library Book SHALL contain a stable local id, a title, an author list, and whether the author is explicitly unknown. From Home Library, the user SHALL be able to enter the existing Add books workflow and cancel back to the unchanged Home Library from the initial upload state without any browser-storage read or write. (`FR-LIB-002`, `FR-LIB-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`)

#### Scenario: First local session has no saved books
- **WHEN** Librarian starts and no Home Library value exists in browser storage
- **THEN** it displays the empty Home Library with an Add books action

#### Scenario: Later session loads saved books
- **WHEN** Librarian starts and browser storage contains a valid Home Library
- **THEN** it displays every stored Library Book without contacting the backend

#### Scenario: Add books opens the extraction workflow
- **WHEN** the user activates Add books from Home Library
- **THEN** the app opens the existing photo upload workflow without changing stored Library Books

#### Scenario: User cancels the initial Add books upload
- **WHEN** the user activates Cancel from the initial Add books upload screen before extraction begins
- **THEN** the app returns to Home Library, preserves the visible collection, performs no browser-storage read or write, and restores focus to Add books

### Requirement: Save remains separate from confirmation
The system SHALL expose a separate Save confirmed books action only when at least one candidate is explicitly Confirmed. Activating Confirm SHALL remain transient and SHALL NOT write browser storage. The Save action SHALL exclude undecided and Skipped candidates. (`FR-CONFIRM-003`, `FR-CONFIRM-006`, `FR-LIB-001`)

#### Scenario: No candidate is confirmed
- **WHEN** the candidate review contains no Confirmed candidate
- **THEN** Save confirmed books is unavailable and no browser-storage write occurs

#### Scenario: Confirmed candidates are selected for saving
- **WHEN** the user activates Save confirmed books with one or more Confirmed candidates
- **THEN** only those Confirmed candidates enter duplicate evaluation

### Requirement: Classify deterministic duplicate conflicts
Before saving, the system SHALL normalize candidate and Library Book titles and authors by trimming leading and trailing whitespace, collapsing repeated internal whitespace, and comparing case-insensitively. Author order SHALL NOT affect equality, while punctuation and diacritics SHALL remain significant. A normalized title and author-list match SHALL be a Duplicate; a normalized title match with differing or missing author information SHALL be a Possible Duplicate. The system SHALL NOT apply fuzzy matching. (`FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`)

#### Scenario: Exact normalized information matches
- **WHEN** a Confirmed candidate and a Library Book have the same normalized title and author list in any author order
- **THEN** the candidate is classified as a Duplicate

#### Scenario: Title matches but author information differs
- **WHEN** a Confirmed candidate and a Library Book have the same normalized title but different or missing normalized author information
- **THEN** the candidate is classified as a Possible Duplicate

#### Scenario: Punctuation or diacritics differ
- **WHEN** titles differ after case and whitespace normalization because punctuation or diacritics differ
- **THEN** that pair is not classified as a Duplicate or Possible Duplicate

#### Scenario: No existing Library Book conflicts
- **WHEN** no Library Book has the same normalized title as any Confirmed candidate
- **THEN** the confirmed batch can proceed directly to local persistence

### Requirement: Resolve all conflicts before persistence
The system SHALL present every Duplicate and Possible Duplicate in one Duplicate Review state before writing any batch item. Each conflict SHALL identify the candidate, its matching Library Book, and its category, and SHALL require an explicit Save anyway or Exclude resolution. Returning to candidate review SHALL preserve candidate edits, unknown-author acknowledgements, Confirm/Skip decisions, and existing conflict resolutions. (`FR-DUP-004`, `FR-DUP-005`, `FR-FAIL-005`)

#### Scenario: Batch contains one or more conflicts
- **WHEN** duplicate evaluation finds conflicts
- **THEN** Duplicate Review lists every conflict and no Library Book is written

#### Scenario: Conflict is explicitly included
- **WHEN** the user resolves a conflict as Save anyway
- **THEN** that Confirmed candidate remains in the resolved save batch

#### Scenario: Conflict is explicitly excluded
- **WHEN** the user resolves a conflict as Exclude
- **THEN** that candidate is removed from the resolved save batch without changing its preserved review information

#### Scenario: Conflict remains unresolved
- **WHEN** at least one displayed conflict has no explicit resolution
- **THEN** the final batch-save action is unavailable

#### Scenario: User returns to candidate review
- **WHEN** the user activates Back to review from Duplicate Review
- **THEN** the app restores the preserved candidate review state without a browser-storage write

### Requirement: Persist the resolved batch atomically
The system SHALL append the complete resolved batch to the current Home Library with one versioned browser-storage write. If loading or writing browser storage fails, the system SHALL report that the library was not saved, preserve candidate and conflict state, offer Retry, and SHALL NOT overwrite unreadable existing data or claim partial success. (`FR-LIB-001`, `FR-FAIL-004`, `FR-FAIL-005`, `NFR-PRIV-001`, `TC-STORAGE-001`)

#### Scenario: Resolved batch is written successfully
- **WHEN** at least one resolved candidate remains and the browser-storage write succeeds
- **THEN** every resolved candidate becomes a Library Book in one updated Home Library value

#### Scenario: Browser-storage write fails
- **WHEN** writing the resolved Home Library value throws or otherwise fails
- **THEN** the app remains in the save workflow, reports that no book was saved, preserves all review and conflict state, and offers Retry

#### Scenario: Stored Home Library is unreadable
- **WHEN** the stored value cannot be parsed or validated as the supported version
- **THEN** the app reports that Home Library cannot be loaded, offers Retry, and does not replace the unreadable value

#### Scenario: Every conflict is excluded
- **WHEN** conflict resolution leaves no candidate in the resolved batch
- **THEN** no browser-storage write occurs and the app offers a return to candidate review

### Requirement: Show saved books after success and in later sessions
After a successful batch write, the system SHALL navigate to Home Library, announce the number of books saved, and display the complete stored collection. The same Library Books SHALL remain visible after reload in the same browser profile. (`FR-LIB-002`, `FR-LIB-003`, `NFR-A11Y-003`)

#### Scenario: Save succeeds
- **WHEN** the resolved batch is persisted successfully
- **THEN** Home Library displays the saved books and a non-color-only success status with the saved count

#### Scenario: Page is reloaded after save
- **WHEN** the user reloads Librarian in the same browser profile
- **THEN** Home Library loads and displays the previously saved Library Books

### Requirement: Edit a saved Library Book locally
The system SHALL expose a per-book Edit action in Home Library and SHALL open a modal dialog that lets the user edit only the saved Library Book's title, author list, and explicit author-unknown state. The dialog SHALL prefill the current saved values, SHALL NOT mutate the visible Home Library while open, and SHALL NOT read or write browser storage until the user activates Save changes. A valid edit draft SHALL require a non-empty trimmed title and either at least one non-empty author or explicit author-unknown acknowledgement. When author-unknown is enabled, the dialog SHALL preserve existing author chips in the draft while disabling author editing. Save changes SHALL be unavailable until the draft is both valid and different from the saved Library Book. An edit that would match another saved Library Book by normalized title and normalized author list SHALL be blocked inline as a Duplicate, while a normalized title match with different or missing author information SHALL be shown inline as a non-blocking Possible Duplicate warning. On save, the system SHALL reload and validate the latest complete browser-local collection, locate the target by stable id, replace only the editable fields for that id, and persist the complete resulting collection with exactly one versioned browser-storage write. (`FR-LIB-004`, `FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`)

#### Scenario: Edit opens a prefilled dialog without storage access
- **WHEN** the user activates Edit for a saved Library Book
- **THEN** a modal dialog opens with that Library Book's current title, authors, and author-unknown state prefilled, without reading or writing browser storage

#### Scenario: Clean draft closes without side effects
- **WHEN** the user cancels, closes, or presses Escape while the edit draft still matches the saved Library Book
- **THEN** the dialog closes, no browser-storage read or write occurs, the visible Home Library remains unchanged, and focus returns to the Edit action that opened the dialog

#### Scenario: Dirty draft requires discard confirmation
- **WHEN** the user cancels, closes, or presses Escape after changing the draft
- **THEN** the system requires explicit discard confirmation before closing and performs no browser-storage read or write unless the user later activates Save changes

#### Scenario: Author unknown preserves disabled author chips
- **WHEN** the user enables Author unknown after entering or reviewing author chips
- **THEN** the existing author chips remain visible in the draft while author editing controls become disabled and Save changes can remain available if the draft is otherwise valid and changed

#### Scenario: Exact duplicate is blocked inline
- **WHEN** the edited draft would exactly match another saved Library Book after duplicate normalization
- **THEN** the dialog shows an inline Duplicate error, keeps Save changes unavailable, and performs no browser-storage read or write

#### Scenario: Possible Duplicate warns inline
- **WHEN** the edited draft matches another saved Library Book by normalized title but author information differs or is missing
- **THEN** the dialog shows an inline Possible Duplicate warning while leaving Save changes available if the draft is otherwise valid and changed

#### Scenario: Successful edit writes one complete updated collection
- **WHEN** the user activates Save changes and the latest valid browser-local collection still contains the target id
- **THEN** the system updates only that Library Book's editable fields, writes the complete updated collection exactly once, closes the dialog, refreshes Home Library from the saved collection, and announces that the named book was updated

#### Scenario: Target is already absent during edit save
- **WHEN** the user activates Save changes and the latest valid browser-local collection no longer contains the target id
- **THEN** the system performs no write, closes the dialog, replaces the visible Home Library with the freshly loaded collection, and announces that the named book is no longer in the library

#### Scenario: Fresh collection cannot be loaded for edit save
- **WHEN** reading or validating the latest browser-local collection fails after the user activates Save changes
- **THEN** the system writes nothing, keeps the dialog open with the current draft unchanged, reports that the named book was not updated, and offers Retry or Cancel

#### Scenario: Edit save write fails
- **WHEN** writing the complete updated browser-local collection fails
- **THEN** the system keeps the dialog open with the current draft unchanged, reports that the named book was not updated, and offers Retry or Cancel without claiming success

### Requirement: Remove a saved Library Book permanently
The system SHALL expose a per-book Remove action and SHALL permanently remove a Library Book only after the user explicitly confirms a dialog that identifies the target. On confirmation or Retry, the system SHALL reload and validate the latest complete browser-local collection, locate the target by stable id, and, when present, persist the remaining collection with exactly one versioned browser-storage write. It SHALL provide no Undo, recycle bin, soft deletion, or backend deletion. (`FR-LIB-005`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`)

#### Scenario: Remove opens named confirmation without storage access
- **WHEN** the user activates Remove for a Library Book
- **THEN** a confirmation dialog identifies that book and explains that removal cannot be undone, without reading or writing browser storage

#### Scenario: Cancellation preserves the collection
- **WHEN** the user cancels, closes, or presses Escape in the confirmation dialog
- **THEN** the dialog closes, no browser-storage read or write occurs, and the visible Home Library remains unchanged

#### Scenario: Present target is removed from the latest collection
- **WHEN** the user confirms removal and the latest valid browser collection contains the target id
- **THEN** the system removes only that id, preserves every other freshly loaded Library Book, and writes the complete remaining collection exactly once

#### Scenario: Last Library Book is removed
- **WHEN** successful removal leaves no Library Book in the latest collection
- **THEN** the system displays the existing empty Home Library without performing any additional write

#### Scenario: Target is already absent
- **WHEN** the latest valid browser collection no longer contains the confirmed target id
- **THEN** the system performs no write, closes the dialog, refreshes Home Library from that collection, and reports that the named book is no longer in the library

#### Scenario: Fresh collection cannot be loaded
- **WHEN** reading or validating the latest browser collection fails during confirmed removal
- **THEN** the system writes nothing, keeps the dialog and visible Library Book unchanged, reports that the named book was not removed, and offers Retry or Cancel

#### Scenario: Removal write fails
- **WHEN** writing the complete remaining collection fails
- **THEN** the system keeps the dialog and visible Library Book unchanged, reports that the named book was not removed, and offers Retry or Cancel without claiming success

#### Scenario: Removal Retry succeeds
- **WHEN** the user activates Retry and the fresh read plus complete write succeed
- **THEN** the system completes the same target removal using the newly loaded collection and exits the dialog as a successful removal

### Requirement: Keep local-save workflow accessible and within scope
The system SHALL keep Save, duplicate resolution, Retry, Back to review, Add books, initial upload cancellation, per-book Edit, edit dialog actions, per-book Remove, removal confirmation, and removal Retry or Cancel controls labeled, keyboard-operable, and visibly focusable, SHALL move focus to a meaningful heading or control after screen and dialog transitions, and SHALL communicate duplicate, warning, error, empty, edit-result, removal, and save-success states without color alone. Edit and removal dialogs SHALL trap keyboard focus while open. The edit dialog SHALL initially focus the Title field, and when a save attempt fails it SHALL move focus to Retry while keeping Cancel reachable. This capability SHALL NOT add search changes, Manual Add changes, metadata enrichment, cover persistence, account, backend-library, cloud-sync, multi-tab transaction guarantees, bulk edit, bulk-removal, or removal-history behavior. (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`, `BC-MVP-001`)

#### Scenario: Keyboard user completes local save
- **WHEN** a keyboard user moves through Save, Duplicate Review, conflict resolution, and Home Library transitions
- **THEN** every action is operable, focus remains visible, and focus moves to the resulting screen's meaningful heading or first required control

#### Scenario: Initial upload cancellation restores Home Library focus
- **WHEN** a keyboard user cancels from the initial Add books upload screen
- **THEN** focus returns to the Home Library Add books action after the screen transition

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
- **WHEN** duplicate review, possible-duplicate warning, persistence failure, empty Home Library, edit outcome, removal outcome, or save success is displayed
- **THEN** the state is identified by text and structure rather than color alone

#### Scenario: Deferred controls remain absent
- **WHEN** this capability is rendered
- **THEN** it exposes no search changes, Manual Add changes, metadata enrichment, cover-persistence, account, backend-library, cloud-sync, multi-tab transaction guarantees, bulk edit, bulk-removal, or removal-history behavior
