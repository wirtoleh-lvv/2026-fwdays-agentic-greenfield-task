# Requirements Conventions

Detailed requirements are decomposed by capability in this directory. Each requirement has one stable ID and one canonical owning file.

Each owning file uses this format:

| ID | Requirement | Status | Verification |
| --- | --- | --- | --- |
| `<PREFIX>-<NNN>` | A concise, testable requirement. | `<status>` | `<verification>` |

## Requirement ID conventions

IDs use an uppercase category, capability prefix, and three-digit sequence number. Example: `FR-UPLOAD-001`.

| Category | Purpose |
| --- | --- |
| `FR-*` | Functional requirements |
| `NFR-*` | Non-functional requirements |
| `TC-*` | Technical constraints |
| `BC-*` | Business or UX constraints |

| Prefix | Capability |
| --- | --- |
| `FR-UPLOAD-*` | Photo upload |
| `FR-EXTRACT-*` | AI extraction |
| `FR-CONFIRM-*` | Candidate confirmation |
| `FR-DUP-*` | Duplicate detection |
| `FR-LIB-*` | Local library management |
| `FR-FAIL-*` | Failure handling |
| `NFR-PERF-*` | Performance |
| `NFR-A11Y-*` | Accessibility |
| `NFR-PRIV-*` | Privacy and security |
| `NFR-DX-*` | Developer experience |
| `TC-STACK-*` | Stack constraints |
| `TC-AI-*` | AI and backend constraints |
| `TC-STORAGE-*` | Local persistence constraints |
| `TC-METADATA-*` | Open Library constraints |
| `BC-MVP-*` | MVP scope constraints |
| `BC-PRIVACY-*` | User-facing privacy constraints |
| `BC-DEMO-*` | Homework and demo constraints |

Sequence numbers are unique within a prefix. IDs remain stable when wording changes and are never reassigned after a requirement is dropped.

## Status values

| Status | Meaning |
| --- | --- |
| `proposed` | Suggested but not yet approved for delivery |
| `accepted` | Approved and in scope |
| `shipped` | Implemented and delivered |
| `dropped` | Explicitly removed from scope; ID remains reserved |

## Verification values

| Verification | Meaning |
| --- | --- |
| `untested` | No passing verification evidence is recorded |
| `tested` | Passing automated or documented manual evidence exists |
| `blocked` | Verification cannot currently be completed; the blocker must be recorded |

Status and verification are independent. A requirement becomes `shipped` only when its implementation is delivered; `tested` records evidence, not delivery status.

## Traceability rules

- OpenSpec changes reference every requirement ID they implement, change, or retire.
- Tests reference the requirement IDs they verify in test names, metadata, or nearby comments.
- PR notes list the affected requirement IDs and any intentionally deferred verification.
- QA reports record requirement IDs with their evidence and verification outcome.
- Changes to requirement meaning are made in the canonical owning file; other documents link by ID instead of copying the requirement text.

## File ownership rules

| File | Canonical ownership |
| --- | --- |
| `add-books-from-photo.md` | `FR-UPLOAD-*`, `FR-EXTRACT-*` |
| `confirm-extracted-candidates.md` | `FR-CONFIRM-*` |
| `duplicate-detection.md` | `FR-DUP-*` |
| `local-library-management.md` | `FR-LIB-*` |
| `failure-handling.md` | `FR-FAIL-*` |
| `non-functional-requirements.md` | `NFR-PERF-*`, `NFR-A11Y-*`, `NFR-DX-*`, `TC-STACK-*`, `BC-MVP-*`, `BC-DEMO-*` |
| `privacy-and-data-retention.md` | `NFR-PRIV-*`, `TC-AI-*`, `TC-STORAGE-*`, `TC-METADATA-*`, `BC-PRIVACY-*` |

Every ID is defined in exactly one owning file. New requirements go into the narrowest relevant file; this README defines conventions, not product behavior.
