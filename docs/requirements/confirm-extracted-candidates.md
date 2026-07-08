# Confirm Extracted Candidates

| ID | Requirement | Status | Verification |
| --- | --- | --- | --- |
| FR-CONFIRM-001 | The Confirmation Screen displays each extracted candidate for review. | accepted | untested |
| FR-CONFIRM-002 | The user can edit candidate book information before confirmation. | accepted | untested |
| FR-CONFIRM-003 | The user can confirm a candidate for saving. | accepted | tested |
| FR-CONFIRM-004 | The user can skip a candidate so it is not saved. | accepted | untested |
| FR-CONFIRM-005 | The user can manually add a book when extraction misses a book or is unavailable. In the current MVP, that manual entry path is provided from Home Library as a separate explicit add flow rather than as an extracted candidate inside candidate review. | accepted | tested |
| FR-CONFIRM-006 | Only candidates explicitly confirmed by the user are eligible for `Save confirmed books`; this does not block the separate explicit Home Library Manual Add path from writing directly when its own requirements are satisfied. | accepted | tested |
| FR-CONFIRM-007 | Candidate readiness is derived from current information: a non-empty trimmed title plus at least one non-empty author or explicit unknown-author acknowledgement is Ready for Confirmation; otherwise it Needs Review. | accepted | untested |
| FR-CONFIRM-008 | Confirm and Skip decisions are reversible before saving, and editing confirmed information revokes confirmation until the current valid values are explicitly confirmed again. | accepted | untested |
