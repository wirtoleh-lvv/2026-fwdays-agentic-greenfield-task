## MODIFIED Requirements

### Requirement: Load Home Library from browser storage
The system SHALL load a versioned Home Library from browser storage without a
backend request and SHALL present the stored Library Books, or an empty Home
Library when no stored collection exists. A valid stored Library Book SHALL
contain a stable local id, a title, an author list, and whether the author is
explicitly unknown. From Home Library, the user SHALL be able to enter the
existing Add books workflow and cancel back to the unchanged Home Library from
the initial upload state without any browser-storage read or write.
(`FR-LIB-002`, `FR-LIB-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`)

#### Scenario: First local session has no saved books
- **WHEN** Librarian starts and no Home Library value exists in browser storage
- **THEN** it displays the empty Home Library with an Add books action

#### Scenario: Later session loads saved books
- **WHEN** Librarian starts and browser storage contains a valid Home Library
- **THEN** it displays every stored Library Book without contacting the backend

#### Scenario: Add books opens the extraction workflow
- **WHEN** the user activates Add books from Home Library
- **THEN** the app opens the existing photo upload workflow without changing
  stored Library Books

#### Scenario: User cancels the initial Add books upload
- **WHEN** the user activates Cancel from the initial Add books upload screen
  before extraction begins
- **THEN** the app returns to Home Library, preserves the visible collection,
  performs no browser-storage read or write, and restores focus to Add books

### Requirement: Keep local-save workflow accessible and within scope
The system SHALL keep Save, duplicate resolution, Retry, Back to review, Add
books, and initial upload cancellation controls labeled, keyboard-operable, and
visibly focusable, SHALL move focus to a meaningful heading or control after
screen transitions, and SHALL communicate duplicate, error, empty, and success
states without color alone. This capability SHALL NOT add remove, edit, search,
Manual Add, metadata, cover persistence, account, backend-library, or
cloud-sync behavior. (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`,
`BC-MVP-001`)

#### Scenario: Keyboard user completes local save
- **WHEN** a keyboard user moves through Save, Duplicate Review, conflict
  resolution, and Home Library transitions
- **THEN** every action is operable, focus remains visible, and focus moves to
  the resulting screen's meaningful heading or first required control

#### Scenario: Initial upload cancellation restores Home Library focus
- **WHEN** a keyboard user cancels from the initial Add books upload screen
- **THEN** focus returns to the Home Library Add books action after the screen
  transition

#### Scenario: Save workflow states are communicated
- **WHEN** duplicate review, persistence failure, empty Home Library, or save
  success is displayed
- **THEN** the state is identified by text and structure rather than color
  alone

#### Scenario: Deferred controls remain absent
- **WHEN** this capability is rendered
- **THEN** it exposes no remove, edit, search, Manual Add, metadata,
  cover-persistence, account, backend-library, or cloud-sync behavior
