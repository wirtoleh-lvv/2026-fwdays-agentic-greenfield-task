## MODIFIED Requirements

### Requirement: Confirm only the current valid candidate information
The system SHALL let the user explicitly confirm a candidate only while it is `Ready for Confirmation`, SHALL retain that decision only in transient browser state, and SHALL treat only explicitly confirmed candidates as eligible for the `Save confirmed books` action. Confirming SHALL NOT create or persist a Library Book. This requirement SHALL NOT prevent the separate explicit Home Library Manual Add path from writing directly to browser-local storage when that path's own requirements are satisfied. (`FR-CONFIRM-003`, `FR-CONFIRM-006`)

#### Scenario: Ready candidate is confirmed
- **WHEN** the user activates Confirm for a candidate marked `Ready for Confirmation`
- **THEN** the screen marks that candidate Confirmed, presents its reviewed title and author information, and includes it in the transient confirmed count

#### Scenario: Candidate needing review cannot be confirmed
- **WHEN** a candidate is marked `Needs Review`
- **THEN** confirmation is unavailable and the screen identifies the information or acknowledgement still required

#### Scenario: Confirmation remains transient
- **WHEN** a candidate is marked Confirmed
- **THEN** no Library Book is created and no candidate decision is written to backend or browser persistence
