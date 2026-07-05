# Home Library Design QA

- **Source visual truth:** `docs/audits/librarian-mvp-prototype/screenshots/01-home-library-populated.png` and `15-home-library-empty.png`
- **Implementation URL:** `http://localhost:3000`
- **Implementation screenshot:** not captured; the configured in-app browser was unavailable
- **Target viewports:** 1280 × 1000 desktop and a mobile width near 390 px
- **States:** empty Home Library and populated Home Library
- **Full-view comparison evidence:** blocked because no implementation screenshot could be captured
- **Focused comparison evidence:** blocked for the same reason; typography, controls, cards, and mobile wrapping could not be compared in a combined image

## Findings

- [P1] Rendered desktop and mobile comparison is unavailable.
  - **Location:** empty and populated Home Library states.
  - **Evidence:** both repository source screenshots opened successfully, but the in-app browser reported unavailable and produced no implementation capture.
  - **Impact:** responsive layout, typography, spacing, colors, icon alignment, focus visibility, and text wrapping cannot be accepted from tests and CSS inspection alone.
  - **Fix:** capture both implementation states at matched desktop/mobile viewports in an authorized browser, compare each source and implementation together, then resolve all P0–P2 differences.

## Required Fidelity Surfaces

- **Fonts and typography:** implementation reuses the existing Georgia display and system sans-serif stacks; rendered optical comparison is pending.
- **Spacing and layout rhythm:** centered empty-state and responsive populated-grid rules are implemented; rendered comparison is pending.
- **Colors and visual tokens:** existing warm canvas, neutral surfaces, green actions, borders, and focus token are reused; rendered comparison and contrast spot checks are pending.
- **Image quality and asset fidelity:** interface icons use the existing Lucide dependency. Cover images are intentionally absent because cover persistence is outside the approved scope.
- **Copy and content:** empty, privacy, count, title, author, and unknown-author text are implemented; search, Manual Add, edit, remove, metadata, and cover UI are intentionally absent.

## Patches Made

- Added the empty and populated Home Library presentation using existing project tokens and responsive breakpoints.
- Added explicit local-only privacy text and an accessible saved-books list.
- Kept Add books functional and preserved the no-write transition into photo extraction.
- Added public UI coverage for empty/populated loading, local-only presentation, and deferred-control exclusions.

## Manual Acceptance

On 2026-07-05, the user confirmed the empty and populated Home Library at
desktop and mobile widths, visible keyboard focus, Add books navigation, and
the absence of search, Manual Add, edit, and remove controls. This satisfies
the OpenSpec task's rendered evidence requirement. The Product Design artifact
remains blocked because the user declined automated screenshot capture, so no
combined source/implementation image comparison exists.

## Implementation Checklist

- Capture empty and populated states at matched desktop and mobile viewports.
- Compare full views and focused typography/control regions in combined images.
- Verify visible focus, text scaling, wrapping, and single-column mobile behavior.
- Resolve all P0–P2 findings before marking OpenSpec task 2.2 complete.

final result: blocked
