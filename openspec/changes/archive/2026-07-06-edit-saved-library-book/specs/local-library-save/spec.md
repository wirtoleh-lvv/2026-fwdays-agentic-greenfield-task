## ADDED Requirements

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

## MODIFIED Requirements

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
