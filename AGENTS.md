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

Do not duplicate detailed requirements across files.
Do not treat PRD as a full functional specification.

Requirement IDs are defined in `docs/requirements/README.md`. OpenSpec changes, tests, PR notes, and QA reports should reference the applicable requirement IDs. Do not duplicate the full requirement ID list in this file.

## Agent Workflow

- Do not implement application code without an approved OpenSpec change.
- Work in small vertical slices.
- Keep each change focused on one capability.
- Run available lint, typecheck, and tests before claiming work is complete.
- Separate maker and checker passes:
  - Maker creates or modifies specs/code.
  - Checker reviews against PRD, requirements, OpenSpec, and this file.

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
