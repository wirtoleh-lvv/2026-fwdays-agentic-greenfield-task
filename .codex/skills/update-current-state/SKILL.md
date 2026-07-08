---
name: update-current-state
description: Create or refresh the Librarian project's persistent handoff at docs/current-state.md using verified repository, OpenSpec, task, validation, and environment evidence. Use when the user asks for a handoff, current-state update, status checkpoint, session wrap-up, context transfer, or before pausing after meaningful OpenSpec, implementation, validation, or archive progress.
---

# Update Current State

Maintain `docs/current-state.md` as a concise navigation aid for the next agent window. Never treat it as a requirement or implementation source of truth.

## Gather Fresh Evidence

1. Read `AGENTS.md` and the existing `docs/current-state.md`, if present.
2. Run `openspec list --json`. For each relevant active change, run `openspec status --change "<name>" --json` and read its `tasks.md`.
3. Inspect `git status --short`, the latest relevant commits, and changed files.
4. Read `package.json` before listing validation commands. Include only scripts that exist.
5. Use validation results from the current work. Run checks only when the user requested validation or they are required by the task; otherwise label them not run.
6. Obtain the current date, time, and project timezone from the environment.

Resolve conflicts in favor of canonical requirements, OpenSpec artifacts, tests, and repository evidence. Do not preserve a stale handoff claim merely because it already exists.

## Write the Handoff

Create the file if missing. Keep these sections compact:

1. **Last Updated** — timestamp with timezone, current phase, active change, factual progress, and one exact next action.
2. **Canonical Context** — links to `AGENTS.md`, active OpenSpec artifacts, relevant `docs/requirements/*.md`, `docs/PRD.md`, `docs/Vocabulary.md`, and relevant ADRs. State that this handoff is non-canonical.
3. **OpenSpec Status** — active and archived changes, task counts, and the latest observed validation result.
4. **Change Progress** — completed behavior, remaining boundary, and intentionally deferred scope. Summarize; do not duplicate specifications.
5. **Validation** — actual commands discovered from `package.json` and OpenSpec, with last observed results or `not run in this update`.
6. **Environment and Privacy** — only operational facts needed to resume. Never include secret values, raw photos, candidate contents, or library contents.
7. **Agent Rules and Gotchas** — only concrete repository-specific hazards a new window could otherwise repeat.

Replace stale content instead of appending a diary. Prefer 2–6 sentences or a short list per section.

## Evidence Rules

- Distinguish `observed`, `expected`, and `not run`.
- Do not invent test counts, deployments, providers, archived changes, or completion claims.
- Do not list database, integration, E2E, deployment, or smoke-test commands unless the repository actually defines them.
- Do not mark an OpenSpec task complete from prose; trust its checkbox and supporting evidence.
- Do not copy full requirement text or maintain a second requirement list.
- Do not expose `.env.local` contents or any secret.

## Update Cadence

Refresh the handoff after a proposal becomes active, a meaningful task or behavior is completed, validation status changes, a change is archived, or work is paused for another agent window. Skip updates for trivial edits that do not change the resumption point.

Report which evidence changed and the exact next task after writing the file.
