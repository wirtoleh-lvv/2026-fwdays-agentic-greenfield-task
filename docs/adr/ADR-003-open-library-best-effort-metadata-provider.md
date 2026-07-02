# ADR-003: Open Library as a Best-Effort Metadata Provider

## Status

Accepted

## Context

Extracted book information can be incomplete, but relying on an external catalog as an authoritative or required source would make confirmation and saving vulnerable to missing data or service failures.

## Decision

Use Open Library only for best-effort Metadata Enrichment. Enrichment may supplement available candidate information, but it is not required to review, confirm, or save a book.

## Consequences

- Candidates may gain useful metadata without making Open Library a critical dependency.
- Users can continue when Open Library is unavailable or has no matching record.
- Enriched metadata may be incomplete, inconsistent, or unavailable and still requires user review.
- The application must handle enrichment failure without blocking the confirmation flow.

## Related Requirements

- `FR-FAIL-003`
- `NFR-PERF-002`
- `TC-METADATA-001`
- `TC-METADATA-002`
