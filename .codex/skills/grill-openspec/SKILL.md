---
name: grill-openspec
description: Stress-test and refine product ideas, feature requests, requirements, and technical plans against this project's vocabulary, canonical requirements, ADRs, MVP guardrails, and active OpenSpec changes. Use when the user says "grill me", asks to challenge or clarify an idea, explores a next feature, or wants to determine whether work is ready for an OpenSpec proposal.
---

# Grill OpenSpec

Turn a fuzzy idea into shared, testable understanding before implementation planning. Stay in discovery: read and reason freely, but never write application code.

## Establish Context

1. Read `AGENTS.md`, `openspec/config.yaml`, `docs/PRD.md`, `docs/requirements/README.md`, and `docs/Vocabulary.md`.
2. Run `openspec list --json`.
3. If an active or named change is relevant, run `openspec status --change "<name>" --json` and read artifacts only from the returned paths.
4. Read the narrowest relevant requirement files and ADRs.
5. Inspect the repository to answer discoverable questions instead of asking the user.

## Grill One Decision at a Time

- State the current assumption or ambiguity.
- Ask one focused question and wait for the answer.
- Include a recommended answer with concrete reasoning and trade-offs.
- Use specific scenarios and counterexamples to expose boundary cases.
- Challenge vague words such as "valid", "simple", "fast", "duplicate", "confirmed", "private", and "done" until they become observable behavior.
- Follow dependencies between decisions: settle upstream domain and scope questions before downstream implementation choices.
- Do not dump a questionnaire or ask questions already answered by canonical documents.

Probe only relevant dimensions:

- user problem, outcome, and success evidence
- MVP scope and explicit non-goals
- canonical domain terms and record identity
- states, transitions, invariants, and lifecycle
- data ownership, retention, privacy, and security
- failure, retry, empty, partial, and concurrency behavior
- accessibility and user control
- integration boundaries and hard-to-reverse decisions
- acceptance scenarios and verification

## Respect Documentation Ownership

Route resolved information to the existing source of truth:

- shared term or definition → `docs/Vocabulary.md`
- product context, MVP outcome, or out-of-scope boundary → `docs/PRD.md`
- detailed behavior or requirement meaning → the owning `docs/requirements/*.md` file
- hard-to-reverse, surprising trade-off → `docs/adr/*.md`
- proposed implementation scope and behavior → OpenSpec proposal, spec, design, or tasks

Do not create `CONTEXT.md`, duplicate requirement text, turn the PRD into a functional specification, or create an ADR for a reversible choice.

## Capture Only With Permission

Do not modify documentation or OpenSpec artifacts automatically. When a decision crystallizes, identify the correct target and ask whether the user wants it captured. Creating or updating planning artifacts is allowed after explicit approval; application implementation is not.

## Finish With a Readiness Check

When the idea is sufficiently resolved or the user stops, summarize:

- decisions made
- unresolved questions and contradictions
- affected requirement IDs or missing canonical requirements
- risks and explicit non-goals
- recommended smallest vertical slice
- whether the idea is ready for `/opsx:propose`

Do not claim proposal readiness while a decision would materially change scope, data semantics, privacy, or acceptance behavior.
