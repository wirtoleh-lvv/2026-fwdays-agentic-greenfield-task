# Add Books from Photo Design QA

- **Source visual truth:** `docs/audits/librarian-mvp-prototype/screenshots/06-upload-idle.png` through `10-candidate-review-initial.png`
- **Implementation URL:** `http://localhost:3000`
- **Implementation screenshot:** not captured; the in-app browser was unavailable
- **Target viewport:** 1440 × 1000 for upload, validation, selected-photo, and progress states; 1440 × 1822 for candidate review
- **States:** idle upload, invalid upload, selected photo, extraction progress, and editable candidate review
- **Final result:** blocked

## Findings

- [P1] Rendered visual comparison is unavailable.
  - **Location:** all five target states.
  - **Evidence:** the source screenshots opened successfully, but the configured in-app browser could not be acquired, so no implementation screenshot exists.
  - **Impact:** fonts, spacing, colors, image crop, icon alignment, copy wrapping, focus visibility, and responsive behavior cannot be accepted from code inspection alone.
  - **Fix:** capture the implementation at the matching viewport in an authorized browser, combine each capture with its source state, and resolve any P0–P2 differences.

## Open Questions

- The approved OpenSpec slice does not include candidate confirmation, saving, cover cropping, or Home Library navigation. Those controls and candidate cover thumbnails shown in the Figma prototype are intentionally absent.
- The user’s successful live-provider test predates this visual implementation and does not verify the restyled rendered states.

## Manual Acceptance

On 2026-07-04, the user reported manually checking the restyled interface and
confirmed that the requested Figma states, keyboard focus, status treatment,
candidate editing, and responsive layout passed without findings. This closes
the OpenSpec public-behavior verification task. The report remains blocked only
as an artifact-based design-QA record because it has no captured implementation
screenshot to compare with the source image.

## Required Fidelity Surfaces

- **Fonts and typography:** implementation uses a Georgia display stack and a system sans-serif stack; rendered optical comparison is pending.
- **Spacing and layout rhythm:** desktop and mobile rules are implemented; rendered comparison is pending.
- **Colors and tokens:** the warm canvas, neutral surfaces, green actions, and semantic error colors are implemented as CSS tokens; rendered comparison and contrast spot checks are pending.
- **Image quality and assets:** the selected-photo state uses the real transient object URL; Lucide supplies interface icons. Candidate cover thumbnails are intentionally omitted because the extraction contract does not return safe cover crops.
- **Copy and content:** upload, privacy, progress, error, empty, and editable-candidate copy remain within the approved OpenSpec boundary.

## Full-view and Focused Comparison Evidence

Blocked: no implementation screenshot could be captured. Focused comparison of typography, controls, preview crop, and candidate fields therefore could not be performed.

## Patches Made

- Added Figma-derived layout, design tokens, responsive states, real selected-photo preview, and Lucide icons.
- Preserved keyboard labels, visible focus styles, non-color-only statuses, retry behavior, and transient candidate editing.
- Added public UI regression coverage; 12 files and 25 tests pass.

## Implementation Checklist

- Capture all five states at the matching viewport.
- Compare source and implementation together, including focused control regions.
- Verify keyboard focus and mobile wrapping in rendered pixels.
- Resolve all P0–P2 findings and change `final result` to `passed` only after re-checking.
