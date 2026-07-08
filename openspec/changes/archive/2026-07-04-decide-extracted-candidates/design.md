## Context

The current Confirmation Screen owns a transient array of editable candidate
drafts containing an id, title, and comma-separated author text. It renders
every candidate as an editable card but has no explicit readiness or decision
state. The next slice must establish user-controlled Confirm and Skip decisions
without introducing saving, duplicate detection, persistence, or a new backend
boundary.

The Figma reference shows editable `Ready for Confirmation` and `Needs Review`
cards, compact Confirmed and Skipped cards, Edit and Undo actions, an explicit
unknown-author acknowledgement, and text counts. The prototype audit found that
stored readiness can become stale, so this implementation must derive readiness
from current values.

## Goals / Non-Goals

**Goals:**

- Derive readiness deterministically from the candidate's current information.
- Support reversible Confirm and Skip decisions in browser memory.
- Revoke confirmation before allowing confirmed values to be edited.
- Preserve edits and acknowledgement state across decision transitions.
- Match the relevant Figma candidate-card states while meeting keyboard, focus,
  and announcement requirements.

**Non-Goals:**

- Manual Add, duplicate review, saving, or browser persistence.
- Home Library navigation or Library Book management.
- Metadata enrichment, AI confidence, or provider/API contract changes.
- Preserving transient review state across reload, tab closure, or deliberate
  abandonment of the workflow.

## Decisions

### Keep readiness derived and decisions explicit

Each candidate draft gains browser-only decision information equivalent to
`undecided`, `confirmed`, or `skipped`, plus an `authorUnknown` acknowledgement.
Readiness is a pure derivation used only while undecided:

```text
valid title && (valid author || authorUnknown)
  -> Ready for Confirmation
otherwise
  -> Needs Review
```

Title and author validity use trimmed values; comma-separated author segments
that trim to empty do not count. Adding a non-empty author clears the
unknown-author acknowledgement so contradictory information is not retained.

Alternative considered: store `Needs Review` or `Ready for Confirmation` on
the candidate. That reproduces the audited stale-status defect when fields are
edited.

### Model confirmation as approval of the current values

Confirm is available only for a ready, undecided candidate. A confirmed card
collapses to a compact read-only summary. Activating Edit first changes the
decision back to undecided and derives readiness from the preserved values;
any later changes therefore require a new explicit confirmation.

Alternative considered: keep a candidate confirmed while it is edited. That
would make confirmation ambiguous because the approved and current values
could differ.

### Make Skip reversible and non-destructive

Skip is available for any undecided candidate, including one needing review.
A skipped card collapses and shows Undo. Undo restores the preserved draft and
its derived readiness. Skipped candidates never enter the confirmed set.

Alternative considered: remove skipped candidates from the array. That loses
edits, prevents Undo, and makes count/order behavior harder to reason about.

### Keep this slice transient and browser-only

Candidate drafts, acknowledgements, and decisions remain in React state. The
existing extraction response contract and server route do not change. No local
storage key or Library Book schema is introduced until the later save and
duplicate-review change.

Alternative considered: persist review progress immediately. That expands the
privacy and lifecycle contract before the product has defined abandonment,
expiry, and recovery semantics.

### Preserve meaningful focus through card transformations

Decision transitions replace editable and compact card layouts. After Confirm,
focus moves to the resulting Edit action; after Skip, to Undo; after Edit or
Undo, to the first relevant editable control. One polite live-status region
announces the candidate number and transition. Visible badges and text labels
communicate state independently of color.

Alternative considered: allow focus to fall back to the document body after a
card rerender. That technically leaves controls keyboard reachable but breaks
workflow continuity for keyboard and assistive-technology users.

## Risks / Trade-offs

- [Five expanded candidates create a long page] → Collapse Confirmed and Skipped
  cards and keep text counts near the review controls.
- [Comma-separated authors are temporarily less structured than `authors[]`] →
  Validate non-empty trimmed segments now; defer a richer author-entry component
  unless a later approved design requires it.
- [Unknown-author acknowledgement can contradict entered authors] → Clear the
  acknowledgement whenever a non-empty author is entered.
- [Back to upload discards transient decisions] → Keep deliberate abandonment
  outside this slice and do not imply that decisions survive leaving or reload.
- [No Save action makes this an intermediate workflow slice] → Show confirmed
  and skipped counts, but do not add disabled or misleading persistence actions.

## Migration Plan

This is an additive browser-state change with no persisted data migration.
Rollback restores the existing always-editable candidate cards; no backend or
browser records require cleanup.

## Open Questions

None for this slice. Manual Add, deliberate-abandonment handling, duplicate
semantics, and persistence lifecycle remain decisions for later changes.
