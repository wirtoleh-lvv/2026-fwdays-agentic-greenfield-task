---
name: review-librarian-privacy
description: Audit Librarian changes for raw-photo lifecycle, backend non-persistence, browser-only library storage, secret handling, upload validation, external-provider boundaries, logging, and API abuse resistance. Use when the user asks for a privacy review, security review, upload/API threat review, release privacy gate, or checker pass over extraction and persistence code.
---

# Review Librarian Privacy

Perform an evidence-based, read-only privacy and application-security review. Do not fix findings or add controls outside approved scope.

## Establish the Contract

1. Read `AGENTS.md`, `docs/requirements/privacy-and-data-retention.md`, and the relevant parts of `docs/PRD.md`.
2. Read `docs/adr/ADR-001-local-first-browser-persistence.md` and `docs/adr/ADR-002-thin-stateless-backend-for-ai-extraction.md`.
3. Read the governing OpenSpec change, affected code, configuration, and tests.
4. Trace sensitive data from selection through request, extraction, response, confirmation, and disposal.

## Audit Boundaries

- **Raw photos:** validate size and type at browser and API boundaries; prevent permanent files, caches, queues, logs, analytics payloads, and debug dumps.
- **Extracted candidates:** keep transient unless the user confirms; ensure the backend does not retain request or response records.
- **Library books:** persist only in browser storage; prevent accidental server actions, databases, telemetry, or cloud fallback.
- **Secrets:** keep provider credentials server-side; inspect public environment variables, client bundles, error messages, fixtures, and committed env files.
- **External providers:** minimize transmitted data, validate provider output, bound time and response size, and avoid leaking provider internals.
- **API abuse:** enforce bounded uploads and inputs, safe multipart handling, reasonable request limits, and non-amplifying retries.
- **Injection and content:** treat filenames, metadata, AI output, and Open Library data as untrusted; prevent HTML/script injection and unsafe path use.
- **Failure cleanup:** verify success, failure, cancellation, timeout, and retry paths release temporary data and do not log prohibited content.

Do not introduce account, authentication, tenant, or database checks unless a later approved change adds those concepts.

## Report

For each finding provide severity, applicable requirement IDs, verified `file:line`, sensitive-data flow or attack scenario, impact, and correction direction. Use:

- `critical`: prohibited backend persistence, exposed secret, or direct high-impact exploit
- `major`: realistic retention, injection, unbounded-upload, or sensitive-log path
- `minor`: defense-in-depth gap with limited impact

Conclude with a boundary-by-boundary pass/gap summary and list evidence not available. Do not call an area clean without inspecting its code path.
