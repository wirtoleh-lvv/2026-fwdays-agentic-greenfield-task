## Why

The current Home Library always shows per-book `Edit` and `Remove` actions,
which diverges from the approved Figma interaction and adds constant visual
weight to every Library Book. This change narrows that gap by making action
visibility stateful without weakening keyboard access or touch discoverability.

## What Changes

- Change Home Library card behavior so per-book `Edit` and `Remove` actions are
  hidden by default when the environment supports hover, then revealed on card
  hover and keyboard focus within the card.
- Preserve discoverability and operability on touch or no-hover environments by
  keeping the actions visible there instead of requiring an unavailable hover
  interaction.
- Keep current action labels, focusability, dialog entry points, announcements,
  and remove/edit outcomes unchanged; this slice changes presentation timing,
  not action semantics.
- Add canonical spec coverage for the hover/focus reveal behavior and its
  accessibility boundary.
- Non-goals: changing edit or removal flows, changing search behavior, changing
  mobile information density beyond action visibility, or introducing gesture-
  only controls.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `local-library-save`: refine Home Library card-action visibility so desktop
  hover/focus reveal matches the approved UI while preserving keyboard and
  touch access within existing local-library behaviors.

## Impact

- Affected code: Home Library card rendering, card-action styling, and
  interaction tests for pointer, keyboard-focus, and touch/no-hover states.
- No API, storage, extraction, or backend changes.
- Main requirement area: `FR-LIB-003`, `FR-LIB-004`, `FR-LIB-005`,
  `NFR-A11Y-001`, and `NFR-A11Y-002`.
