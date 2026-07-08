---
name: openspec-tdd
description: Implement an approved OpenSpec change test-first, one observable behavior at a time. Use when the user asks to apply or continue an approved change with TDD, says "red-green-refactor", or requests implementation of an OpenSpec scenario while preserving requirement-ID traceability, privacy rules, and maker/checker separation.
---

# OpenSpec TDD

Drive implementation from approved OpenSpec scenarios through small red-green-refactor cycles. Do not use this skill for discovery, proposal creation, or behavior that is not covered by an approved change.

## Gate Implementation

1. Read `AGENTS.md` and the complete `.codex/skills/openspec-apply-change/SKILL.md` before changing application code.
2. Confirm that the user authorized implementation and that the OpenSpec change is approved. If approval is not evident, stop and request it.
3. Run `openspec status --change "<name>" --json` and read the proposal, specs, design, and tasks from the returned artifact paths.
4. Read the canonical requirement definitions and ADRs referenced by the next behavior.
5. Stop if the spec is contradictory or a missing product decision would materially change behavior. Return to `$grill-openspec` or update the OpenSpec artifacts before coding.

## Select a Public Seam

Choose the narrowest public interface that proves the behavior:

- browser behavior through accessible user interactions
- API behavior through HTTP request and response
- domain behavior through an exported domain interface
- external AI behavior through a server-side provider adapter

State the chosen seam before the first cycle. Ask the user only when competing seams create a material architectural trade-off.

Mock only external system boundaries such as the AI provider, time, or randomness. Do not mock internal application collaborators merely to make a test easy. Prefer dependency injection at the external seam and verify outcomes through the public interface.

## Run One Red-Green-Refactor Cycle

Work on one OpenSpec scenario or one tightly related observable behavior at a time.

### Red

1. Write one failing behavior test through the chosen public seam.
2. Put applicable requirement IDs in the test name, metadata, or a nearby comment.
3. Use expected values taken directly from the spec or a fixed worked example; never recompute expectations with implementation logic.
4. Run the narrow test and confirm that it fails for the intended missing behavior. A compile failure or unrelated failure is not a valid red state.

### Green

1. Add only enough production code to satisfy the failing behavior.
2. Do not anticipate later scenarios or add adjacent features.
3. Run the same narrow test and confirm it passes.

### Refactor

1. Refactor only while the narrow test is green.
2. Preserve the public interface and observable behavior.
3. Re-run the narrow test after cleanup.
4. Run the relevant broader suite before starting the next behavior.

Never batch all tests before implementation or add tests only after a feature is built.

## Complete a Task Honestly

Mark an OpenSpec checkbox complete only when:

- every behavior named by that task has a passing test or documented manual evidence
- relevant requirement IDs are traceable from the evidence
- lint and typecheck pass for the affected code
- no out-of-scope behavior was introduced
- privacy-sensitive paths do not persist or log prohibited data

After all maker tasks, perform a separate checker pass against the PRD, canonical requirements, vocabulary, ADRs, OpenSpec artifacts, and `AGENTS.md`. The checker must look for missing behavior and scope drift, not merely rerun tests.

## Report Each Cycle

Keep progress concise:

- behavior and requirement IDs
- public seam
- observed red failure
- minimal green implementation
- verification run
- next scenario or blocker

Do not claim the change complete until the full required lint, typecheck, test, documentation, and checker passes succeed.
