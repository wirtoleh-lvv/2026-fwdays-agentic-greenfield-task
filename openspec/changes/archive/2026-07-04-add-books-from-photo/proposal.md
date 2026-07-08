## Why

Librarian needs its first end-to-end slice: turn one eligible book-cover photo into editable AI-extracted candidates while keeping the user in control and retaining no request data on the backend. This establishes the privacy boundary and request contract that later confirmation and local-library slices can build on.

## What Changes

- Add a single-photo upload flow with client-side eligibility validation for one extraction operation (`FR-UPLOAD-001`, `FR-UPLOAD-002`).
- Submit the validated photo to a Next.js API route and show progress while extraction is pending (`FR-EXTRACT-001`, `NFR-PERF-002`, `TC-STACK-002`).
- Define a typed extraction boundary that returns `ExtractedBookCandidate[]`, independent of the AI provider's response shape (`FR-EXTRACT-002`).
- Render every returned candidate as editable book information on the Confirmation Screen, without automatically saving anything (`FR-EXTRACT-003`, `FR-CONFIRM-001`, `FR-CONFIRM-002`).
- Reject invalid requests and surface actionable upload or extraction errors without creating Library Books (`FR-FAIL-001`).
- Keep provider credentials server-side and process photos and candidates only for the active request, without backend persistence (`NFR-PRIV-002`, `TC-AI-001`, `TC-AI-002`, `BC-PRIVACY-001`).

### Non-goals

- Confirming, skipping, or saving candidates.
- Manual Add, duplicate detection, metadata enrichment, or browser library persistence.
- Accounts, authentication, cloud sync, backend library storage, or permanent Raw Uploaded Photo storage.
- Multiple-photo upload, barcode scanning, or extraction from spines, back covers, or interior pages.

## Capabilities

### New Capabilities

- `photo-book-extraction`: Select and validate one photo, extract book candidates through a thin stateless backend, and present the returned candidates as editable, unsaved information.

### Modified Capabilities

None.

## Impact

- Establishes the browser upload and candidate-review UI boundary.
- Establishes a Next.js API route and shared TypeScript request/result contracts for AI extraction.
- Introduces a server-only AI provider integration point and corresponding environment configuration, with no secrets in browser code or committed files.
- Requires automated coverage for upload validation, API validation and response mapping, candidate editing, error/progress states, and backend non-persistence constraints.
