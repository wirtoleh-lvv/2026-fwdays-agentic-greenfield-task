# AGENTS.md

## Project

Librarian MVP — a local-first web application for organizing a personal home library from book cover photos.

Chosen stack:

- Next.js
- TypeScript
- API routes
- Browser local persistence
- OpenSpec

## Source of Truth

OpenSpec is the implementation source of truth.

Documentation responsibilities:

- `docs/PRD.md` defines product context, MVP scope, success criteria, and out of scope.
- `docs/requirements/*.md` defines detailed feature behavior.
- `docs/Vocabulary.md` defines shared domain terms.
- `docs/adr/*.md` explains high-impact technical/product decisions.
- `docs/current-state.md` records a concise, evidence-based handoff and exact next task; it is not a source of requirements.

Do not duplicate detailed requirements across files.
Do not treat PRD as a full functional specification.

Requirement IDs are defined in `docs/requirements/README.md`. OpenSpec changes, tests, PR notes, and QA reports should reference the applicable requirement IDs. Do not duplicate the full requirement ID list in this file.

## Agent Workflow

- At the start of a new agent window, read `docs/current-state.md` if it exists and use it as an index. Verify the active change, exact next task, and working-tree state before acting; verify broader historical claims only when they affect the task or appear stale or inconsistent.
- Start new feature discovery and material requirement changes with `$grill-openspec`.
- Use the grilling session to resolve scope, vocabulary, behavior, edge cases, and acceptance evidence before proposing implementation.
- Capture resolved decisions only in their canonical owner; do not create competing context or requirement documents.
- Create an OpenSpec proposal after the grill concludes that the smallest vertical slice is ready.
- Do not implement application code without an approved OpenSpec change.
- Work in small vertical slices.
- Keep each change focused on one capability.
- Apply approved changes with `$openspec-tdd`: one failing behavior test, minimal implementation, then behavior-preserving refactoring before the next scenario.
- Test through public seams, mock only external system boundaries, and reference applicable requirement IDs in verification evidence.
- Run focused tests during each TDD cycle. Run the full lint, typecheck, test, OpenSpec validation, and build gates at the completion checkpoint defined below, not after every small task.
- Separate maker and checker passes:
  - Maker creates or modifies specs/code.
  - Checker reviews against PRD, requirements, OpenSpec, and this file.
- Use `$update-current-state` at a checkpoint: before pausing or handing work to another agent window, when the exact next task or active change changes, when a blocker changes execution, after a full-validation result, or when archive status changes. Batch consecutive completed subtasks into one refresh when work continues in the same window.
- Keep `docs/current-state.md` concise and replace stale status instead of appending a session diary. Never copy detailed requirements into it.

## Efficient Execution

- Continue an approved active change autonomously in task order until a checkpoint, blocker, scope decision, or user-requested pause.
- Use the smallest set of project skills required for the current action; do not repeat overlapping review or handoff workflows unless their distinct gate is due.
- Read only the OpenSpec artifacts, canonical requirements, ADR sections, and source files needed for the current task. Do not repeatedly reload unchanged background documents in the same window.
- Treat a task-level TDD cycle as: one focused failing behavior test, minimal implementation, focused passing test, then refactor if needed. Prefer concise test reporters or targeted test files so failures do not emit large DOM dumps unless the dump is needed for diagnosis.
- Use validation tiers:
  - **Per behavior:** run the focused test that proves the behavior.
  - **Per related task group (normally two to three tasks):** run affected tests plus lint or typecheck when the edits can affect them.
  - **Completion checkpoint:** run the full test suite, lint, typecheck, strict OpenSpec validation, and production build before claiming the change implementation complete.
- Consolidate visual QA after all related UI states for the active change exist. Run an earlier visual check only when layout evidence is needed to guide implementation or a task explicitly requires it.
- Do not rerun a passing full validation command when neither its inputs nor relevant configuration changed; record the most recent applicable evidence in `docs/current-state.md`.
- Keep progress updates concise: report completed behavior, validation evidence, and the next task. Avoid repeating unchanged project context.

## UI Design Source

- Implement user-facing UI from the approved Figma designs and their design system when a matching design exists.
- Treat Figma and design-system artifacts as the visual source of truth; OpenSpec and canonical requirements remain the behavioral source of truth.
- Before implementation, identify the exact Figma frame or repository-captured design state and keep the implementation within the active OpenSpec boundary.
- Verify rendered implementation against the matching design state at the same viewport. Record intentional deviations caused by accessibility, privacy, or approved scope constraints.

## MVP Guardrails

Preserve the agreed MVP scope.

The app is local-first, no-account, and confirmation-based.

Do not add these unless a future OpenSpec change explicitly approves them:

- accounts or authentication
- cloud sync or backend library persistence
- wishlist
- recommendations
- sharing
- barcode scanning
- advanced analytics
- fully automatic saving without user confirmation
- permanent raw photo storage

## Privacy and Data Rules

- Uploaded photos are processed temporarily for AI extraction.
- The backend must not persist uploaded photos, extracted candidates, or user library records.
- Confirmed books are stored locally in the browser.
- Never commit secrets, API keys, tokens, or `.env.local`.

## Quality Bar

Before marking a task complete:

- Confirm the change matches the approved OpenSpec scope.
- Confirm no out-of-scope features were added.
- Add or update tests for changed behavior.
- Document intentionally deferred behavior.
- Refresh `docs/current-state.md` at the next checkpoint when completion changes verified progress; refresh immediately when it changes the exact next task before a pause or handoff.
