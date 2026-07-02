# ADR-002: Thin Stateless Backend for AI Extraction

## Status

Accepted

## Context

AI extraction requires server-side access to protected credentials, but Librarian must not turn the backend into storage for photos, candidates, or the user's Home Library.

## Decision

Use Next.js API routes as a thin, stateless backend for AI extraction. Process each Raw Uploaded Photo only for the active request, return extracted candidates, and persist none of the request or result data on the backend.

## Consequences

- Provider credentials remain outside browser code.
- Backend responsibilities and retained user data stay minimal.
- Extraction depends on network and AI-provider availability.
- Failed requests cannot be recovered from server-side state and require retry or Manual Add.

## Related Requirements

- `FR-EXTRACT-001`
- `FR-FAIL-001`
- `FR-FAIL-002`
- `NFR-PRIV-002`
- `TC-STACK-002`
- `TC-AI-001`
- `TC-AI-002`
- `BC-PRIVACY-001`
