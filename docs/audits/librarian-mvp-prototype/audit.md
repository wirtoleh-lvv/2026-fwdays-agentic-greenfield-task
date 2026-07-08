# Librarian MVP Prototype Audit

Date: 2026-07-03

Prototype sources:

- GitHub: `wirtoleh-lvv/librarian-mvp-prototype`
- Figma Make: `5Ue0WlEZEHzK0miiLNYxo7`

## Audit scope

Combined UX, requirements-alignment, and accessibility-risk audit of the desktop prototype. The audit compares observable behavior with `docs/PRD.md`, canonical requirements, `docs/Vocabulary.md`, ADR-001 through ADR-003, and the active `add-books-from-photo` OpenSpec change.

The user goal is to turn one eligible photo into reviewed Library Books while remaining in control of edits, duplicate decisions, and local persistence. The accessibility target is the repository's accepted keyboard, labeling, focus, and non-color-only status requirements.

## Captured flow

| Step | Evidence | Health | Observation |
| --- | --- | --- | --- |
| 1 | [Populated Home Library](screenshots/01-home-library-populated.png) | Mostly healthy | Clear local-storage reassurance, search, and add actions. Edit and Remove are hidden until hover or focus, reducing discoverability. |
| 2 | [Search with no results](screenshots/02-search-no-results.png) | Healthy, requirement gap | Clear recovery action, but search has no canonical `FR-LIB-*` requirement despite appearing in the PRD and OpenSpec context. |
| 3 | [Manual Add from Home Library](screenshots/03-manual-add-direct-to-library.png) | Blocking mismatch | The primary action says “Add to library” and saves directly, bypassing candidate confirmation and duplicate review. |
| 4 | [Edit Library Book](screenshots/04-edit-library-book-dialog.png) | Mostly healthy | Clear fields and actions; custom dialog focus trapping and focus restoration are not implemented. |
| 5 | [Remove Library Book](screenshots/05-remove-library-book-dialog.png) | Mostly healthy | The affected book and irreversible action are clear; the same dialog focus risks apply. |
| 6 | [Upload idle](screenshots/06-upload-idle.png) | Healthy | Single-photo guidance, supported formats, size limit, privacy copy, and disabled submission are clear. |
| 7 | [Invalid upload](screenshots/07-upload-invalid-format.png) | Healthy | Specific, non-color-only error and no submission. Oversize and multi-file behavior exist in code but were not separately pictured. |
| 8 | [Valid selected photo](screenshots/08-upload-valid-selected-photo.png) | Healthy | File name, size, preview, replace, remove, and privacy information are present. |
| 9 | [Extraction progress](screenshots/09-extraction-progress.png) | Healthy | Clear pending state and text progress support `NFR-PERF-002` and `NFR-A11Y-003`. |
| 10 | [Initial candidate review](screenshots/10-candidate-review-initial.png) | Mostly healthy | Editable candidates, status labels, and explicit confirmation align with the product model. Status is stored rather than derived, so edits can leave the badge inaccurate. |
| 11 | [Confirmed and skipped candidates](screenshots/11-candidates-confirmed-and-skipped.png) | Healthy | Confirmed and skipped states are distinct and reversible before saving. Five candidates would create a long page without persistent summary/actions. |
| 12 | [Duplicate Warning](screenshots/12-duplicate-warning.png) | Partial mismatch | The comparison and explicit decision are strong, but an exact title match is labeled “Possible duplicate,” and matching ignores author and trimming. |
| 13 | [Return from Duplicate Warning](screenshots/13-back-to-review-state-loss.png) | Blocking defect | Back to review resets confirmed and skipped states. Any candidate edits would also be lost without explanation. |
| 14 | [Save success](screenshots/14-save-success-home-library.png) | Mostly healthy | Explicit override, local save, return to library, and success status are clear. The duplicate is visibly added only after user review. |
| 15 | [Empty Home Library](screenshots/15-home-library-empty.png) | Healthy, entry-point mismatch | Privacy and next actions are clear, but Manual Add again promises direct addition rather than confirmation. |

## Strengths

- The calm editorial layout, consistent controls, and strong hierarchy make the primary path understandable without training.
- Upload guidance and privacy copy align well with `FR-UPLOAD-001`, `FR-UPLOAD-002`, `TC-AI-002`, and `BC-PRIVACY-001`.
- Candidate review makes AI output visibly assistive rather than authoritative (`FR-EXTRACT-003`, `FR-CONFIRM-001`, `FR-CONFIRM-002`, `FR-CONFIRM-006`).
- Confirm, Skip, Undo, Duplicate Warning, Save anyway, and destructive removal are explicit rather than silent.
- Progress, warning, and success states use text and icons as well as color (`NFR-A11Y-003`).
- The prototype uses browser-local persistence and exposes no account or cloud-sync behavior, consistent with ADR-001 and MVP guardrails.

## UX and requirements risks

### P0 — Manual Add bypasses the confirmation invariant

From the Home Library, Manual Add creates a Library Book directly. It does not create an editable candidate, require explicit confirmation, or run duplicate detection. This conflicts with the confirmation-based product model and with `FR-CONFIRM-005`, `FR-CONFIRM-006`, `FR-DUP-001`, and `FR-LIB-001`.

Recommendation: every Manual Add entry point should create a candidate and enter the same confirmation and duplicate pipeline as extracted candidates. If direct manual saving is intended, the canonical requirements and vocabulary must explicitly approve that exception.

### P0 — Returning from duplicate review loses user work

The Duplicate Warning comparison is useful, but Back to review remounts the Confirmation Screen from the original extraction result. Confirmed, skipped, acknowledged-unknown-author, and edited values are discarded. This undermines the PRD success criterion that user edits survive failures and creates an unannounced destructive navigation path.

Recommendation: keep the current candidate collection as the single transient workflow state until the flow is completed or deliberately abandoned.

### P0 — Duplicate categories and matching semantics are inconsistent

The fixture is an exact title-and-author match, but the UI calls it a Possible Duplicate. The implementation lowercases the title only; it does not trim whitespace, compare authors, or distinguish Duplicate from Possible Duplicate. This does not fully express `FR-DUP-001`, `FR-DUP-002`, and `FR-DUP-003`.

Recommendation: define normalized fields and deterministic exact/possible rules before implementing persistence.

### P0 — Candidate status can become stale

Needs Review and Ready for Confirmation are stored values. Editing a ready candidate to remove required information leaves it labeled ready; adding missing author information leaves it labeled Needs Review. This conflicts with `FR-CONFIRM-007`.

Recommendation: derive status from current candidate information and explicit uncertainty, not from the initial extraction result alone.

### P1 — Important failure and empty states are not reachable

An extraction-error screen exists in source but no transition enters it. Empty extraction, invalid provider output, and local-persistence failure cannot be reached through the normal prototype flow. The active OpenSpec change requires empty, retry, and malformed-response behaviors.

Recommendation: add deterministic prototype controls or fixtures for success, empty, provider failure, and malformed-result states so they can be evaluated before implementation.

### P1 — Search lacks a canonical requirement

Search appears in the PRD, OpenSpec project context, and prototype, but `local-library-management.md` contains no search requirement. Implementing it now would require inventing matching and empty-query behavior.

Recommendation: add a canonical search requirement before its implementation slice.

### P2 — Dense review flow for the five-cover maximum

Three editable candidates already produce a page about 1,800 pixels tall. At five candidates, users may lose context and the save action. Consider a sticky progress/summary area or compact completed candidates after confirmation.

### P2 — Prototype cover art is synthetic UI decoration

Book covers are colored CSS rectangles with text, not real cover images. This is acceptable for testing information architecture but is weaker for judging final visual density and recognizability. It is not a functional requirement blocker.

## Accessibility risks

- The custom dialogs move focus into the dialog but do not trap focus, restore focus to the opener, or visibly prove background inertness. This requires keyboard and assistive-technology verification (`NFR-A11Y-001`, `NFR-A11Y-002`).
- Edit and Remove actions are visually hidden until hover or focus. They remain keyboard focusable, but their discoverability and touch behavior need review.
- Several icon-only and tertiary controls appear smaller than the recommended 44×44 target.
- The visible Author(s) label is not directly associated with the internal author input; the input relies on a separate `aria-label`.
- Candidate state transitions such as Confirmed, Skipped, and Undo are not visibly implemented as live announcements.
- Automated contrast, zoom/reflow, screen-reader naming, reduced-motion, and complete keyboard-order testing were outside this screenshot-based audit.

## Active OpenSpec boundary

The active `add-books-from-photo` change ends at editable, unsaved candidates. For that approved slice, use steps 6–10 as visual reference. Confirmation, Skip, Manual Add, duplicate resolution, saving, search, edit, and removal must not be pulled into that implementation without later approved OpenSpec changes.

The active spec already requires upload validation, pending status, empty extraction, retry, malformed-provider handling, editable candidates, and no backend persistence. The prototype supports the visual direction but is not complete behavioral evidence for the empty and failure scenarios.

## Requirements follow-up plan

Do not edit canonical requirements until these decisions are grilled and approved.

1. **Candidate validity and status** — clarify required title/author behavior, explicit unknown-author acknowledgement, uncertainty representation, and dynamic Needs Review/Ready derivation. Update `confirm-extracted-candidates.md`; likely refine `FR-CONFIRM-007` and add a new requirement if acknowledgement is retained.
2. **Manual Add invariant** — decide whether every Manual Add creates a candidate and must pass confirmation and duplicate review. Update `FR-CONFIRM-005`, `FR-CONFIRM-006`, and relevant scenarios without creating a direct-save exception by accident.
3. **Review-state preservation** — add a requirement that edits, confirm/skip choices, and acknowledgements survive duplicate review, retryable failures, and backward navigation until deliberate abandonment. Candidate owner: `confirm-extracted-candidates.md`; proposed next ID `FR-CONFIRM-008`.
4. **Duplicate semantics** — define normalized fields, exact Duplicate rules, Possible Duplicate rules, and allowed post-warning actions. Refine `FR-DUP-001` through `FR-DUP-005` before local save implementation.
5. **Search behavior** — add a canonical local search requirement covering title/author matching, normalization, immediate local results, and clear/no-result behavior. Proposed owner and ID: `local-library-management.md`, `FR-LIB-006`.
6. **Failure fixtures and evidence** — keep the current active spec's empty, extraction failure, malformed response, and retry scenarios; ensure the first implementation can exercise each deterministically without provider dependence.
7. **Accessible modal behavior** — add OpenSpec scenarios for focus containment, Escape, focus restoration, labels, and status announcements under the existing `NFR-A11Y-*` requirements rather than duplicating those requirements.

## Recommended next vertical slices

1. Finish and verify the approved `add-books-from-photo` slice using only upload, extraction, and editable-unsaved review behavior.
2. After requirements clarification, propose `complete-candidate-review` for Confirm, Skip, Manual Add as candidate, dynamic review status, and transient-state preservation—still without persistence.
3. Propose local save and duplicate review together so no saving path can bypass `FR-DUP-*`.
4. Propose Home Library browse/search, then edit/remove, as later focused slices.

## Evidence limits

- Screenshots and scripted interaction do not prove WCAG compliance.
- The Figma Make prototype simulates extraction; it does not exercise a backend, AI provider, server validation, logging, or retention behavior.
- The prototype uses seeded demo data on first load, so the empty state was captured by explicitly setting local storage to an empty collection.
- Metadata enrichment was not present and was not audited.
