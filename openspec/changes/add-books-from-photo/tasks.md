## 1. Application Foundation and Contracts

- [ ] 1.1 Establish the minimal Next.js and TypeScript project structure plus repeatable lint, typecheck, and test commands needed for this slice (`TC-STACK-001`, `NFR-DX-001`).
- [ ] 1.2 Define shared upload constraints, the `ExtractedBookCandidate` type, runtime candidate validation, and the stable API error envelope (`FR-UPLOAD-001`, `FR-EXTRACT-002`).
- [ ] 1.3 Add safe server-only AI configuration documentation and an example environment file containing placeholders only; verify secrets cannot enter the browser bundle (`NFR-PRIV-002`).

## 2. Stateless Extraction Backend

- [ ] 2.1 Define an injectable server-only extraction adapter and implement the selected provider mapping to zero-to-five validated `ExtractedBookCandidate` records (`FR-EXTRACT-001`, `FR-EXTRACT-002`, `TC-AI-001`).
- [ ] 2.2 Implement the multipart extraction API route with authoritative file-count, 10 MiB, declared MIME, and decoded-image validation before provider invocation (`FR-UPLOAD-001`, `FR-FAIL-001`, `TC-STACK-002`).
- [ ] 2.3 Map provider unavailability and malformed provider output to the stable error envelope without returning provider internals or partial candidates (`FR-FAIL-001`, `NFR-PRIV-002`).
- [ ] 2.4 Review the route, adapter, framework configuration, and logging paths to ensure photos, raw provider output, candidates, Library Books, and credentials are never persisted or logged (`TC-AI-002`, `BC-PRIVACY-001`).

## 3. Upload and Candidate Review UI

- [ ] 3.1 Build the single-photo picker with format, size, and one-to-five-front-cover guidance plus immediate client-side validation (`FR-UPLOAD-001`, `FR-UPLOAD-002`).
- [ ] 3.2 Implement the explicit transient flow states and multipart submission, including accessible progress, duplicate-submit prevention, retry, empty-result feedback, and actionable errors (`FR-EXTRACT-001`, `FR-FAIL-001`, `NFR-PERF-002`, `NFR-A11Y-003`).
- [ ] 3.3 Render every returned candidate with labeled, keyboard-operable title and author controls whose edits remain only in transient browser state (`FR-EXTRACT-003`, `FR-CONFIRM-001`, `FR-CONFIRM-002`, `NFR-A11Y-001`, `NFR-A11Y-002`).
- [ ] 3.4 Clear prior candidates when a new extraction starts and verify that the UI contains no confirm, skip, save, Manual Add, duplicate, enrichment, or persistence behavior.

## 4. Verification and Documentation

- [ ] 4.1 Add contract and adapter tests for valid zero-to-five candidate arrays, empty and incomplete editable values, malformed provider responses, and provider failures (`FR-EXTRACT-002`, `FR-FAIL-001`).
- [ ] 4.2 Add API tests for valid multipart upload plus missing, extra, oversized, unsupported, spoofed, and undecodable file cases; assert rejected requests never invoke the adapter (`FR-UPLOAD-001`, `FR-FAIL-001`).
- [ ] 4.3 Add UI tests for file validation, pending/empty/error/retry states, candidate rendering and editing, new-request reset, keyboard operation, and non-color-only announcements (`FR-UPLOAD-001`, `FR-EXTRACT-003`, `FR-CONFIRM-001`, `FR-CONFIRM-002`, `NFR-A11Y-001`, `NFR-A11Y-003`).
- [ ] 4.4 Add focused privacy verification that request payloads, candidates, raw provider details, and secrets are absent from persistence and logs in both success and failure paths (`NFR-PRIV-002`, `TC-AI-002`, `BC-PRIVACY-001`).
- [ ] 4.5 Run lint, typecheck, and the full test suite; record verification evidence by requirement ID and document the intentionally deferred confirmation, saving, Manual Add, duplicate, enrichment, and local-library behaviors.
