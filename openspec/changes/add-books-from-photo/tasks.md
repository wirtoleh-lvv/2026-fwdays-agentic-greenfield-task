## 1. Implementation Readiness

- [x] 1.1 Establish the minimal Next.js and TypeScript project structure plus repeatable lint, typecheck, and narrow/full test commands required for red-green-refactor cycles (`TC-STACK-001`, `NFR-DX-001`).
- [x] 1.2 HITL: select and document the initial server-side AI provider, model/configuration boundary, and placeholder-only environment setup without committing or exposing credentials (`NFR-PRIV-002`, `TC-AI-001`).

## 2. Successful Extraction Tracer

- [x] 2.1 Through one red-green-refactor cycle, prove that submitting one eligible photo through the browser and API with a fake provider returns one normalized candidate and renders editable title and author controls (`FR-UPLOAD-001`, `FR-EXTRACT-001`, `FR-EXTRACT-002`, `FR-EXTRACT-003`, `FR-CONFIRM-001`, `FR-CONFIRM-002`).
- [x] 2.2 Through one red-green-refactor cycle at the provider-adapter seam, implement the selected provider mapping for valid zero-to-five candidate results while keeping credentials and provider types server-only (`FR-EXTRACT-002`, `NFR-PRIV-002`, `TC-AI-001`).

## 3. Upload Validation Behaviors

- [x] 3.1 Through separate red-green-refactor examples, reject unsupported, oversized, and multiple browser-selected files with specific feedback and no extraction request (`FR-UPLOAD-001`, `FR-UPLOAD-002`, `FR-FAIL-001`).
- [x] 3.2 Through separate red-green-refactor API examples, reject missing, extra, oversized, unsupported, spoofed, and undecodable photo parts before invoking the provider adapter (`FR-UPLOAD-001`, `FR-FAIL-001`, `TC-STACK-002`).

## 4. Extraction State and Failure Behaviors

- [x] 4.1 Through a red-green-refactor cycle, announce accessible extraction progress and prevent duplicate submission while a request is pending (`FR-EXTRACT-001`, `NFR-PERF-002`, `NFR-A11Y-003`).
- [x] 4.2 Through a red-green-refactor cycle, display an actionable empty-result state when extraction validly identifies no books (`FR-EXTRACT-002`, `FR-EXTRACT-003`).
- [x] 4.3 Through a red-green-refactor cycle, map provider unavailability to a safe actionable error and allow retry of the selected eligible photo (`FR-FAIL-001`, `NFR-PRIV-002`).
- [x] 4.4 Through a red-green-refactor cycle, reject malformed provider output without exposing provider details or partial candidates (`FR-EXTRACT-002`, `FR-FAIL-001`, `NFR-PRIV-002`).
- [x] 4.5 Through a red-green-refactor cycle, clear earlier transient candidates when extraction starts for a newly selected photo (`FR-EXTRACT-003`).

## 5. Accessibility, Privacy, and Completion

- [ ] 5.1 Verify through public UI behavior that upload and candidate-editing controls are labeled, visibly focusable, keyboard-operable, and communicate progress, empty, and error states without color alone (`NFR-A11Y-001`, `NFR-A11Y-002`, `NFR-A11Y-003`).
- [x] 5.2 Verify success and failure paths retain no backend photo, raw provider output, candidate, or Library Book data and never log those contents or credentials (`TC-AI-002`, `BC-PRIVACY-001`).
- [x] 5.3 Run the full lint, typecheck, and test commands; record evidence by requirement ID and document the intentionally deferred confirmation, saving, Manual Add, duplicate, enrichment, and local-library behaviors.
- [x] 5.4 Perform a separate checker pass against the PRD, canonical requirements, vocabulary, ADR-002, OpenSpec artifacts, and `AGENTS.md`; resolve scope drift or missing acceptance behavior before completion.
