# Candidate Decision

## Purpose

Define how users review extracted book candidates and make reversible,
browser-transient Confirm or Skip decisions before any future save operation.

## Requirements

### Requirement: Derive candidate readiness from current information
The system SHALL derive an undecided candidate's readiness from its current information rather than store readiness independently. A candidate SHALL be `Ready for Confirmation` only when its title is non-empty after trimming and it has at least one non-empty author after trimming or the user has explicitly acknowledged that the author is unknown; otherwise it SHALL be `Needs Review`. Empty extracted values SHALL be treated as the MVP uncertainty signal. (`FR-CONFIRM-007`)

#### Scenario: Complete candidate is ready
- **WHEN** an undecided candidate has a non-empty trimmed title and at least one non-empty trimmed author
- **THEN** the screen marks the candidate `Ready for Confirmation`

#### Scenario: Missing title needs review
- **WHEN** an undecided candidate's title is empty after trimming
- **THEN** the screen marks the candidate `Needs Review` and does not allow confirmation

#### Scenario: Missing author needs acknowledgement
- **WHEN** an undecided candidate has a non-empty title but no non-empty author and the user has not acknowledged that the author is unknown
- **THEN** the screen marks the candidate `Needs Review` and does not allow confirmation

#### Scenario: Unknown author is acknowledged
- **WHEN** an undecided candidate has a non-empty trimmed title, no non-empty author, and the user explicitly acknowledges that the author is unknown
- **THEN** the screen marks the candidate `Ready for Confirmation`

#### Scenario: Editing recomputes readiness
- **WHEN** the user changes the title, authors, or unknown-author acknowledgement of an undecided candidate
- **THEN** the screen immediately recomputes and displays readiness from the changed values

#### Scenario: Entering an author clears unknown-author acknowledgement
- **WHEN** the user enters at least one non-empty author for a candidate previously acknowledged as having an unknown author
- **THEN** the system clears the unknown-author acknowledgement and derives readiness from the entered author information

### Requirement: Confirm only the current valid candidate information
The system SHALL let the user explicitly confirm a candidate only while it is `Ready for Confirmation`, SHALL retain that decision only in transient browser state, and SHALL treat only explicitly confirmed candidates as eligible for a future save operation. Confirming SHALL NOT create or persist a Library Book. (`FR-CONFIRM-003`, `FR-CONFIRM-006`)

#### Scenario: Ready candidate is confirmed
- **WHEN** the user activates Confirm for a candidate marked `Ready for Confirmation`
- **THEN** the screen marks that candidate Confirmed, presents its reviewed title and author information, and includes it in the transient confirmed count

#### Scenario: Candidate needing review cannot be confirmed
- **WHEN** a candidate is marked `Needs Review`
- **THEN** confirmation is unavailable and the screen identifies the information or acknowledgement still required

#### Scenario: Confirmation remains transient
- **WHEN** a candidate is marked Confirmed
- **THEN** no Library Book is created and no candidate decision is written to backend or browser persistence

### Requirement: Skip and restore a candidate without losing edits
The system SHALL let the user skip any undecided candidate, SHALL exclude a skipped candidate from future save eligibility, and SHALL let the user undo Skip while the review workflow remains active. Skipping and undoing SHALL preserve the candidate's edited information. (`FR-CONFIRM-004`, `FR-CONFIRM-006`, `FR-CONFIRM-008`)

#### Scenario: Candidate is skipped
- **WHEN** the user activates Skip for an undecided candidate
- **THEN** the screen marks that candidate Skipped, excludes it from the transient confirmed set, and includes it in the skipped count

#### Scenario: Skip is undone
- **WHEN** the user activates Undo for a skipped candidate
- **THEN** the candidate returns to its readiness derived from the preserved current information

### Requirement: Editing a confirmed candidate revokes confirmation
The system SHALL provide an Edit action for a confirmed candidate and SHALL revoke confirmation before making that candidate editable so confirmation never applies to values changed afterward. (`FR-CONFIRM-002`, `FR-CONFIRM-003`, `FR-CONFIRM-006`, `FR-CONFIRM-008`)

#### Scenario: Confirmed candidate returns to editing
- **WHEN** the user activates Edit for a confirmed candidate
- **THEN** the candidate returns to its readiness derived from the preserved current information and is no longer included in the confirmed count

#### Scenario: Edited values require reconfirmation
- **WHEN** the user changes information after returning a confirmed candidate to editing
- **THEN** the changed candidate remains unconfirmed until the user explicitly confirms the current valid values again

### Requirement: Communicate candidate decisions accessibly
The system SHALL expose Confirm, Skip, Edit, Undo, and unknown-author acknowledgement as labeled keyboard-operable controls with visible focus, SHALL communicate readiness and decision states without color alone, and SHALL announce each candidate decision transition. (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`)

#### Scenario: Decision controls are operated by keyboard
- **WHEN** a keyboard user navigates and activates candidate decision controls
- **THEN** focus remains visible and moves to a meaningful control in the resulting candidate state

#### Scenario: Decision transition is announced
- **WHEN** a candidate becomes Confirmed, Skipped, or returns to editing
- **THEN** the screen exposes a text status and assistive-technology announcement identifying the candidate and new state

#### Scenario: Multiple decisions are summarized
- **WHEN** one or more candidates are Confirmed or Skipped
- **THEN** the screen displays the current confirmed and skipped counts in text
