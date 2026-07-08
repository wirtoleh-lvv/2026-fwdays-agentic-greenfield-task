---
name: verify-librarian-ui
description: Verify Librarian UI requirements from rendered browser behavior and screenshots, including workflow state, legibility, keyboard access, focus, status messaging, empty and error states, and responsive layout. Use when the user asks for visual QA, UI verification, screenshot review, browser acceptance evidence, accessibility spot checks, or a fresh-eyes checker pass. Do not use for design ideation or implementation.
---

# Verify Librarian UI

Act as a fresh-eyes UI checker. Inspect actual rendered pixels and observable behavior; do not modify the implementation.

## Establish Evidence

1. Read the requested requirement IDs and their canonical definitions.
2. Read the governing OpenSpec scenarios and expected states.
3. Use an already-running application or supplied screenshots when available. Start a local application only when verification requires it and the user authorized the review.
4. Exercise behavior through accessible user interactions. Capture settled states rather than loading or transitional frames unless those frames are the subject of the requirement.

## Verify Each Scenario

- Confirm the expected state is visibly present, not merely represented in the DOM.
- Check controls and copy are legible, labeled, and visually distinguishable.
- Check keyboard reachability, logical focus order, visible focus, dialog focus handling, and return focus.
- Check progress, success, warnings, and errors are understandable without color alone and exposed to assistive technology where observable.
- Check user edits survive the transitions required by the scenario.
- Check empty, failure, retry, duplicate, and persistence states when they are in scope.
- Check relevant desktop viewport widths independently; do not infer responsiveness from one screenshot.

Never infer hidden behavior from a screenshot. Mark evidence insufficient when focus, keyboard behavior, announcements, persistence, or transitions were not actually observed.

## Report

For each scenario return:

- requirement ID and scenario
- `met`, `not-met`, or `insufficient-evidence`
- evidence source: screenshot path or tested browser state
- exact visible or behavioral observation
- defect severity and correction direction when not met

Finish with evidence coverage and untested states. A visually attractive screen does not pass if it fails the specified workflow or accessibility behavior.
