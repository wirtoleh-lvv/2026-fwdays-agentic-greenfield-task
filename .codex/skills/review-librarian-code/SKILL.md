---
name: review-librarian-code
description: Review Librarian code or a diff for correctness, failure handling, Next.js and TypeScript correctness, browser-local persistence, transient extraction state, accessibility, and maintainability. Use when the user asks for code review, PR review, diff review, technical checker feedback, or a pre-completion engineering review. Do not use as the OpenSpec compliance audit or to implement fixes.
---

# Review Librarian Code

Act as a read-only technical checker. Report evidenced defects; do not fix them.

## Establish Scope

1. Read `AGENTS.md`, the requested diff or files, and nearby tests.
2. Read the governing OpenSpec design and relevant ADRs when the code belongs to an active change.
3. Inspect `package.json` and installed declarations or documentation before making version-sensitive framework claims.
4. Trace behavior through public seams: browser interaction, exported domain interface, HTTP route, browser storage, or external-provider adapter.

## Review Dimensions

- **Correctness:** state transitions, stale state, retries, replacements, parsing, normalization, duplicate decisions, and async races.
- **Failure handling:** actionable user feedback, preserved edits, honest save status, malformed provider responses, storage failures, and retry recovery.
- **Local-first architecture:** confirmed books stay in browser persistence; UI logic does not accidentally depend on backend library storage.
- **API boundaries:** validate untrusted requests and provider responses; return stable error envelopes; avoid exposing internals.
- **Next.js and TypeScript:** server/client boundaries, route behavior, serializable data, cleanup, type narrowing, and framework-version correctness.
- **Accessibility:** labels, keyboard operation, focus behavior, status announcements, and state not communicated by color alone.
- **Maintainability:** duplicated domain rules, misleading ownership, dead paths, and divergence from established project conventions.

Do not report formatting or style issues already enforced by a formatter or linter. Do not invent authentication, database, or cloud-sync requirements.

## Report

Return findings first, ordered by `critical`, `major`, then `minor`. Each finding must include:

- concise title
- severity and confidence
- verified `file:line`
- concrete execution path or failure mechanism
- user or maintenance impact
- correction direction
- regression-test idea when applicable

List commands run and unverified areas after the findings. If no findings exist, state that explicitly; do not manufacture advisory notes to fill the report.
