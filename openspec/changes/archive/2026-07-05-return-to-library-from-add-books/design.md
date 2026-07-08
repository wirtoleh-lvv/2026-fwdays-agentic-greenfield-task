## Context

`LibrarianApp` currently owns the loaded Home Library and the top-level switch
between Home Library and `PhotoExtractionForm`. Entering Add books from Home
Library moves the app into the photo-extraction state and passes the current
Library Books into `PhotoExtractionForm`.

The initial upload screen inside `PhotoExtractionForm` exposes a `Cancel`
button, but that control currently clears transient upload state rather than
returning to Home Library. This is acceptable once the user is already working
inside the extraction flow, but it is the wrong behavior for abandoning the
initial Home Library to Add books transition before extraction begins.

## Goals / Non-Goals

**Goals:**

- Let the user leave the initial Add books upload screen and return to the
  previously visible Home Library.
- Guarantee that this cancellation path performs no browser-storage read or
  write and no backend call.
- Restore keyboard focus to the Add books action that launched the workflow.
- Preserve existing semantics for clearing a selected photo, candidate review,
  duplicate review, and save-failure recovery.

**Non-Goals:**

- Adding generalized abandonment flows for candidate review, duplicate review,
  extraction failure, or save failure.
- Reworking local-storage loading, save semantics, or cross-tab synchronization.
- Introducing draft persistence for partially completed Add books sessions.

## Decisions

### 1. Add an explicit return-home callback for the initial upload state

`PhotoExtractionForm` will receive a dedicated callback from `LibrarianApp` for
leaving Add books and returning to Home Library. The initial upload screen's
`Cancel` control will call that callback only when the user is still on the
initial upload state.

Alternative considered: keep using `clearPhoto` for every cancel path.

Why this decision:

- The initial upload-screen cancel is navigation back to Home Library, not a
  transient form reset inside Add books.
- A dedicated callback keeps that difference explicit instead of overloading
  `clearPhoto` with two unrelated meanings.

### 2. Return to the already loaded Home Library snapshot

When cancellation happens from the initial upload state, `LibrarianApp` will
switch back to the existing in-memory Home Library state that was already loaded
before Add books opened.

Alternative considered: re-read browser storage on cancel.

Why this decision:

- The requirement for this slice is no read and no write on cancel.
- The Home Library snapshot is already available in top-level state, so no
  extra persistence boundary is needed.

### 3. Restore focus after the view switch in Home Library

Focus restoration to Add books will be handled by the Home Library view after
`LibrarianApp` transitions back from `photo-extraction` to `home`.

Alternative considered: attempt to focus the prior trigger directly from
`PhotoExtractionForm` before unmount.

Why this decision:

- The Add books control only exists again after Home Library remounts.
- Home Library already owns post-transition focus behavior, so this change fits
  that boundary.

## Risks / Trade-offs

- Focus restoration can regress if Home Library remount timing changes later ->
  cover the behavior with a keyboard-focused app seam test.
- Reusing the existing in-memory library means the view does not refresh from a
  different tab's storage writes during cancel -> acceptable for this
  non-destructive path and consistent with the change scope.
- Introducing a new callback can blur when Cancel means "leave workflow" versus
  "clear current work" if applied too broadly -> keep the new behavior limited
  to the initial upload state in this change.
