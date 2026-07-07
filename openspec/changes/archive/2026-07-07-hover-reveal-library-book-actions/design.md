## Context

Home Library currently renders each saved Library Book with always-visible
`Edit` and `Remove` actions. That behavior is functionally correct, but it
does not match the approved Figma desktop state where actions appear only when
the user engages a card. This change is intentionally narrow: it adjusts when
card actions are shown, without changing edit/remove semantics, storage rules,
search, or dialog behavior.

The main constraint is accessibility. A hover-only reveal would hide controls
from keyboard users and would not translate to touch environments. The design
therefore has to distinguish between hover-capable and no-hover environments.

## Goals / Non-Goals

**Goals:**

- Align Home Library card-action visibility with the approved desktop UI.
- Preserve keyboard discovery and operability for per-book `Edit` and
  `Remove`.
- Preserve discoverability on touch and other no-hover environments.
- Keep implementation scoped to Home Library presentation and related tests.

**Non-Goals:**

- Redesigning edit or removal dialogs.
- Changing search, save, duplicate, or persistence behavior.
- Introducing gesture-only interactions or long-press affordances.
- Reworking the broader Home Library layout beyond action visibility states.

## Decisions

### 1. Reveal card actions only in hover-capable environments

Home Library will hide `Edit` and `Remove` visually by default only when the
environment supports hover. The actions will become visible when the user
hovers the card or when keyboard focus enters the card/action region.

Rationale:

- Matches the Figma desktop interaction more closely.
- Reduces persistent visual noise across a populated library.
- Avoids requiring pointer interaction for keyboard users.

Alternatives considered:

- Always hide actions until hover everywhere. Rejected because touch users do
  not have hover and keyboard users need a non-pointer reveal path.
- Keep actions always visible everywhere. Rejected because it preserves the
  current Figma mismatch and misses the UX intent of quieter cards.

### 2. Keep actions visible in no-hover environments

On touch or other no-hover environments, Home Library will continue to show the
actions without requiring an interaction reveal.

Rationale:

- Preserves discoverability where hover does not exist.
- Avoids adding hidden controls without an obvious reveal mechanism.

Alternatives considered:

- Replace hover with tap-to-reveal. Rejected because it changes interaction
  semantics, complicates focus/state management, and is larger than this slice.

### 3. Implement reveal as presentation state, not conditional rendering

The action controls should remain in the DOM and remain part of the existing
Home Library card structure. The change should be driven by CSS and semantic
state hooks rather than by mounting/unmounting the buttons.

Rationale:

- Minimizes regression risk in existing edit/remove logic and focus return.
- Keeps test seams stable because action semantics do not change.
- Supports focus-driven reveal without extra data state.

Alternatives considered:

- Conditional rendering per hover/focus state. Rejected because it adds avoidable
  state management and can destabilize focus behavior.

## Risks / Trade-offs

- [Hidden controls reduce immediate discoverability on desktop] → Limit the
  reveal behavior to hover-capable environments and preserve visible controls on
  no-hover devices.
- [Keyboard users could miss actions if only hover triggers reveal] → Treat
  card focus or focus-within as an equal reveal trigger and keep visible focus
  styling on the actions themselves.
- [CSS-only reveal could drift from test expectations] → Add seam coverage for
  hover-capable and no-hover visibility states without changing edit/remove
  outcome tests.
