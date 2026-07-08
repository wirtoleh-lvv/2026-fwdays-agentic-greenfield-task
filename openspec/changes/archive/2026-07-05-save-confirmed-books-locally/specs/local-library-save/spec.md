## ADDED Requirements

### Requirement: Load Home Library from browser storage
The system SHALL load a versioned Home Library from browser storage without a backend request and SHALL present the stored Library Books, or an empty Home Library when no stored collection exists. A valid stored Library Book SHALL contain a stable local id, a title, an author list, and whether the author is explicitly unknown. (`FR-LIB-002`, `FR-LIB-003`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`)

#### Scenario: First local session has no saved books
- **WHEN** Librarian starts and no Home Library value exists in browser storage
- **THEN** it displays the empty Home Library with an Add books action

#### Scenario: Later session loads saved books
- **WHEN** Librarian starts and browser storage contains a valid Home Library
- **THEN** it displays every stored Library Book without contacting the backend

#### Scenario: Add books opens the extraction workflow
- **WHEN** the user activates Add books from Home Library
- **THEN** the app opens the existing photo upload workflow without changing stored Library Books

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

### Requirement: Keep local-save workflow accessible and within scope
The system SHALL keep Save, duplicate resolution, Retry, Back to review, and Add books controls labeled, keyboard-operable, and visibly focusable, SHALL move focus to a meaningful heading or control after screen transitions, and SHALL communicate duplicate, error, empty, and success states without color alone. This capability SHALL NOT add edit, remove, search, Manual Add, metadata, cover persistence, account, backend-library, or cloud-sync behavior. (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`, `BC-MVP-001`)

#### Scenario: Keyboard user completes local save
- **WHEN** a keyboard user moves through Save, Duplicate Review, conflict resolution, and Home Library transitions
- **THEN** every action is operable, focus remains visible, and focus moves to the resulting screen's meaningful heading or first required control

#### Scenario: Save workflow states are communicated
- **WHEN** duplicate review, persistence failure, empty Home Library, or save success is displayed
- **THEN** the state is identified by text and structure rather than color alone

#### Scenario: Deferred controls remain absent
- **WHEN** this capability is rendered
- **THEN** it exposes no edit, remove, search, Manual Add, metadata, cover-persistence, account, backend-library, or cloud-sync behavior
