## MODIFIED Requirements

### Requirement: Edit a saved Library Book locally
The system SHALL expose a per-book Edit action in Home Library and SHALL open a modal dialog that lets the user edit only the saved Library Book's title, author list, and explicit author-unknown state. In environments that support hover, the Home Library SHALL keep the Edit action visually hidden by default and SHALL reveal the action when the user's pointer hovers that Library Book or when keyboard focus enters that Library Book's action region. In environments that do not support hover, the Edit action SHALL remain visible. The dialog SHALL prefill the current saved values, SHALL NOT mutate the visible Home Library while open, and SHALL NOT read or write browser storage until the user activates Save changes. A valid edit draft SHALL require a non-empty trimmed title and either at least one non-empty author or explicit author-unknown acknowledgement. When author-unknown is enabled, the dialog SHALL preserve existing author chips in the draft while disabling author editing. Save changes SHALL be unavailable until the draft is both valid and different from the saved Library Book. An edit that would match another saved Library Book by normalized title and normalized author list SHALL be blocked inline as a Duplicate, while a normalized title match with different or missing author information SHALL be shown inline as a non-blocking Possible Duplicate warning. On save, the system SHALL reload and validate the latest complete browser-local collection, locate the target by stable id, replace only the editable fields for that id, and persist the complete resulting collection with exactly one versioned browser-storage write. (`FR-LIB-004`, `FR-DUP-001`, `FR-DUP-002`, `FR-DUP-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`, `NFR-A11Y-001`, `NFR-A11Y-002`)

#### Scenario: Hover-capable Home Library reveals Edit on hover or focus
- **WHEN** Home Library is rendered in an environment that supports hover and the user hovers a Library Book or moves keyboard focus into that book's action region
- **THEN** the Edit action for that Library Book becomes visible and operable without changing the saved collection

#### Scenario: No-hover Home Library keeps Edit visible
- **WHEN** Home Library is rendered in an environment that does not support hover
- **THEN** the Edit action remains visible for each Library Book without requiring an intermediate reveal interaction

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
The system SHALL expose a per-book Remove action and SHALL permanently remove a Library Book only after the user explicitly confirms a dialog that identifies the target. In environments that support hover, the Home Library SHALL keep the Remove action visually hidden by default and SHALL reveal the action when the user's pointer hovers that Library Book or when keyboard focus enters that Library Book's action region. In environments that do not support hover, the Remove action SHALL remain visible. On confirmation or Retry, the system SHALL reload and validate the latest complete browser-local collection, locate the target by stable id, and, when present, persist the remaining collection with exactly one versioned browser-storage write. It SHALL provide no Undo, recycle bin, soft deletion, or backend deletion. (`FR-LIB-005`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`, `NFR-A11Y-001`, `NFR-A11Y-002`)

#### Scenario: Hover-capable Home Library reveals Remove on hover or focus
- **WHEN** Home Library is rendered in an environment that supports hover and the user hovers a Library Book or moves keyboard focus into that book's action region
- **THEN** the Remove action for that Library Book becomes visible and operable without changing the saved collection

#### Scenario: No-hover Home Library keeps Remove visible
- **WHEN** Home Library is rendered in an environment that does not support hover
- **THEN** the Remove action remains visible for each Library Book without requiring an intermediate reveal interaction

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
The system SHALL keep Save, duplicate resolution, Retry, Back to review, Add books, initial upload cancellation, Home Library search, per-book Edit, edit dialog actions, per-book Remove, removal confirmation, and removal Retry or Cancel controls labeled, keyboard-operable, and visibly focusable, SHALL move focus to a meaningful heading or control after screen and dialog transitions, and SHALL communicate duplicate, warning, error, empty, no-results, edit-result, removal, and save-success states without color alone. Edit and removal dialogs SHALL trap keyboard focus while open. The edit dialog SHALL initially focus the Title field, and when a save attempt fails it SHALL move focus to Retry while keeping Cancel reachable. Live Home Library filtering SHALL keep focus in the search field while results update, including transitions into the no-results state. When Home Library visually hides per-book actions in hover-capable environments, keyboard focus into the relevant Library Book SHALL reveal those actions without requiring pointer hover, and no-hover environments SHALL keep the actions visible. This capability SHALL NOT add Manual Add changes, metadata enrichment, cover persistence, account, backend-library, cloud-sync, multi-tab transaction guarantees, bulk edit, bulk-removal, removal-history behavior, sorting, advanced filters, fuzzy search, or backend search. (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`, `BC-MVP-001`)

#### Scenario: Keyboard user completes local save
- **WHEN** a keyboard user moves through Save, Duplicate Review, conflict resolution, and Home Library transitions
- **THEN** every action is operable, focus remains visible, and focus moves to the resulting screen's meaningful heading or first required control

#### Scenario: Initial upload cancellation restores Home Library focus
- **WHEN** a keyboard user cancels from the initial Add books upload screen
- **THEN** focus returns to the Home Library Add books action after the screen transition

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
- **WHEN** duplicate review, possible-duplicate warning, persistence failure, empty Home Library, no-results state, edit outcome, removal outcome, or save success is displayed
- **THEN** the state is identified by text and structure rather than color alone

#### Scenario: Deferred controls remain absent
- **WHEN** this capability is rendered
- **THEN** it exposes no Manual Add changes, metadata enrichment, cover-persistence, account, backend-library, cloud-sync, multi-tab transaction guarantees, bulk edit, bulk-removal, removal-history behavior, sorting, advanced filters, fuzzy search, or backend search
