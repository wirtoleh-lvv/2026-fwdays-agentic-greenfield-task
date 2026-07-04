# Candidate Decision Design QA

- **Source visual truth:** `docs/audits/librarian-mvp-prototype/screenshots/10-candidate-review-initial.png` and `11-candidates-confirmed-and-skipped.png`
- **Implementation URL:** `http://localhost:3000`
- **Implementation screenshot:** not captured; the in-app browser was unavailable
- **Target viewport:** source desktop viewports plus a mobile width near 390 px
- **States:** editable ready/needs-review candidates and compact confirmed/skipped candidates
- **Final result:** blocked

## Findings

- [P1] Rendered visual comparison is unavailable.
  - **Location:** candidate review at desktop and mobile widths.
  - **Evidence:** both source screenshots opened successfully, but the configured in-app browser was unavailable, so no current implementation screenshot exists.
  - **Impact:** fonts, spacing, colors, image crop, icon alignment, copy wrapping, focus visibility, and responsive behavior cannot be accepted from code inspection alone.
  - **Fix:** capture the implementation at the matching viewport in an authorized browser, combine each capture with its source state, and resolve any P0–P2 differences.

## Open Questions

- Save, Manual Add, duplicate handling, persistence, and Home Library navigation shown in or adjacent to the prototype remain intentionally absent under the approved OpenSpec boundary.
- Candidate cover thumbnails remain absent because the extraction contract does not return safe cover crops.

## Manual Acceptance

On 2026-07-04, the user confirmed the candidate interactions in the default
desktop view, the mobile layout, and visible focus across all decision-card
transformations. This satisfies the OpenSpec rendered checker, but this artifact
remains blocked because it lacks the required source-and-implementation
screenshot comparison.

## Required Fidelity Surfaces

- **Fonts and typography:** implementation uses a Georgia display stack and a system sans-serif stack; rendered optical comparison is pending.
- **Spacing and layout rhythm:** desktop and mobile rules are implemented; rendered comparison is pending.
- **Colors and tokens:** the warm canvas, neutral surfaces, green actions, and semantic error colors are implemented as CSS tokens; rendered comparison and contrast spot checks are pending.
- **Image quality and assets:** the selected-photo state uses the real transient object URL; Lucide supplies interface icons. Candidate cover thumbnails are intentionally omitted because the extraction contract does not return safe cover crops.
- **Copy and content:** readiness, missing-information guidance, unknown-author acknowledgement, decision labels, and counts are implemented; rendered comparison is pending.

## Full-view and Focused Comparison Evidence

Blocked: no implementation screenshot could be captured. Focused comparison of typography, controls, preview crop, and candidate fields therefore could not be performed.

## Patches Made

- Added derived readiness badges, missing-information guidance, unknown-author acknowledgement, explicit Confirm/Skip actions, compact Confirmed/Skipped cards, and text counts.
- Added keyboard focus restoration and a polite live announcement for decision transitions.
- Moved the unknown-author callout below the author field to match the source layout.
- Added public UI regression coverage; the current full suite passes 13 files and 32 tests.

## Implementation Checklist

- Capture editable and decided states at matching desktop and mobile viewports.
- Compare each source and implementation capture together, including badges, callout, actions, compact cards, and counts.
- Verify focus rings, focus movement, and mobile wrapping in rendered pixels.
- Resolve all P0–P2 findings and change `final result` to `passed` only after re-checking.
