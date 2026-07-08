---
name: audit-openspec-compliance
description: Audit a Librarian implementation or diff against an approved OpenSpec change, canonical requirement IDs, tasks, ADRs, and MVP guardrails. Use when the user asks for a spec audit, compliance review, scope-drift check, implementation completeness check, or the checker pass required before an OpenSpec change is considered complete.
---

# Audit OpenSpec Compliance

Act as the checker. Inspect and report; do not modify specs, requirements, tasks, tests, or application code.

## Establish Scope

1. Read `AGENTS.md`, `docs/PRD.md`, `docs/requirements/README.md`, and `docs/Vocabulary.md`.
2. Identify the named change or infer it from the requested diff. Use `openspec list --json` and `openspec status --change "<name>" --json` when available.
3. Read the complete proposal, design, tasks, and delta specs for that change.
4. Read every canonical requirement and ADR referenced by the change. Follow requirement links instead of copying requirement text into new documents.
5. Inspect the implementation diff, affected public seams, and relevant tests.

Stop and report the ambiguity if no approved change governs application code in scope.

## Build the Evidence Matrix

For every OpenSpec scenario, record:

- scenario and applicable requirement IDs
- implementation location
- automated or manual verification evidence
- status: `implemented`, `partial`, `missing`, or `contradicted`

Then check:

- every affected canonical requirement is represented by a scenario
- tests cite applicable requirement IDs
- checked tasks have real implementation and verification evidence
- no unapproved feature or behavior crossed the MVP guardrails
- browser persistence, stateless backend, confirmation, and photo-retention rules remain intact
- intentionally deferred behavior is explicit and unticked

Do not treat file existence or a passing unrelated test as scenario evidence.

## Report

Lead with findings ordered by severity:

- `critical`: contradicted behavior, privacy violation, unapproved application code, or required scenario missing
- `major`: partial or unverified required behavior, false task completion, or requirement-ID traceability gap
- `minor`: undocumented but non-contradictory scope drift or weak evidence

For each finding include title, severity, requirement/scenario, verified `file:line` evidence, impact, and concrete correction direction. Finish with:

- scenario totals by status
- requirement IDs reviewed
- commands or evidence inspected
- explicit verification gaps

If no findings exist, say so and still provide the coverage summary. Never claim compliance for evidence that was unavailable.
