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

- At the start of a new agent window, read `docs/current-state.md` if it exists, then verify its claims against OpenSpec, tests, and the repository before acting.
- Start new feature discovery and material requirement changes with `$grill-openspec`.
- Use the grilling session to resolve scope, vocabulary, behavior, edge cases, and acceptance evidence before proposing implementation.
- Capture resolved decisions only in their canonical owner; do not create competing context or requirement documents.
- Create an OpenSpec proposal after the grill concludes that the smallest vertical slice is ready.
- Do not implement application code without an approved OpenSpec change.
- Work in small vertical slices.
- Keep each change focused on one capability.
- Apply approved changes with `$openspec-tdd`: one failing behavior test, minimal implementation, then behavior-preserving refactoring before the next scenario.
- Test through public seams, mock only external system boundaries, and reference applicable requirement IDs in verification evidence.
- Run available lint, typecheck, and tests before claiming work is complete.
- Separate maker and checker passes:
  - Maker creates or modifies specs/code.
  - Checker reviews against PRD, requirements, OpenSpec, and this file.
- Use `$update-current-state` when an active change, meaningful task progress, validation result, blocker, archive status, or exact next task changes, and before handing work to another agent window.
- Keep `docs/current-state.md` concise and replace stale status instead of appending a session diary. Never copy detailed requirements into it.

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
- Refresh `docs/current-state.md` when completion changes the verified progress or next task.
