## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Keep local-save workflow accessible and within scope
The system SHALL keep Save, duplicate resolution, Retry, Back to review, Add books, per-book Remove, removal confirmation, and removal Retry or Cancel controls labeled, keyboard-operable, and visibly focusable. It SHALL move focus to a meaningful heading or control after screen and dialog transitions and SHALL communicate duplicate, error, empty, removal, and save-success states without color alone. This capability SHALL NOT add edit, search, Manual Add, metadata, cover persistence, account, backend-library, cloud-sync, bulk-removal, or removal-history behavior. (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`, `BC-MVP-001`)

#### Scenario: Keyboard user completes local save
- **WHEN** a keyboard user moves through Save, Duplicate Review, conflict resolution, and Home Library transitions
- **THEN** every action is operable, focus remains visible, and focus moves to the resulting screen's meaningful heading or first required control

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
- **WHEN** duplicate review, persistence failure, empty Home Library, removal outcome, or save success is displayed
- **THEN** the state is identified by text and structure rather than color alone

#### Scenario: Deferred controls remain absent
- **WHEN** this capability is rendered
- **THEN** it exposes no edit, search, Manual Add, metadata, cover-persistence, account, backend-library, cloud-sync, bulk-removal, or removal-history behavior
