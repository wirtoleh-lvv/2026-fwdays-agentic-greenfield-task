## Context

The repository contains product and architecture documentation but no application implementation. This slice crosses the browser UI, a shared TypeScript contract, a Next.js API boundary, and an external AI provider. ADR-002 requires the server boundary to remain thin and stateless: a Raw Uploaded Photo and provider output exist only long enough to answer the active request.

The slice ends when editable `ExtractedBookCandidate` values are displayed. No candidate becomes a Library Book, and neither browser library persistence nor backend persistence is introduced.

## Goals / Non-Goals

**Goals:**

- Accept one JPEG, PNG, or WebP image no larger than 10 MiB and reject ineligible input before extraction.
- Repeat authoritative validation at the API boundary rather than trusting browser checks.
- Return a provider-independent `ExtractedBookCandidate[]` contract and render every returned candidate as editable, unsaved information.
- Expose pending, empty-result, and actionable failure states accessibly.
- Keep credentials server-only and retain no uploaded photo, provider response, or normalized candidate after the request completes.
- Make browser, route, and provider-adapter behavior independently testable.

**Non-Goals:**

- Confirm, skip, save, enrich, or deduplicate candidates.
- Manual Add or local Home Library persistence.
- Multi-photo uploads or support for more than five front-facing covers.
- A reusable upload service, job queue, request recovery store, analytics pipeline, or server-side history.
- Selecting a vendor as part of the public application contract; vendor-specific details remain behind the server adapter.

## Decisions

### Use OpenAI Responses API with a configurable GPT-5.5 default

The initial extraction provider is OpenAI through the server-side Responses
API. The deployment default is `gpt-5.5`, selected as the quality baseline
for reading several book covers from one image. The adapter uses image input,
Structured Outputs, `store: false`, and low reasoning effort. A later
evidence-backed optimization may configure `gpt-5.4-mini` without changing
the browser or API contract.

`OPENAI_API_KEY` supplies the server-only credential.
`OPENAI_VISION_MODEL` controls the deployment model and defaults to
`gpt-5.5` when unset. Only placeholder names and non-secret defaults belong
in committed files; real values stay in the uncommitted `.env.local`.

Alternative considered: make the provider or model part of the public request.
That would expose an implementation decision to the browser and weaken the
server-only provider boundary.

### Use one multipart request with duplicated browser/server validation

The browser sends exactly one `photo` part to the extraction API. It validates file count, MIME type, and the 10 MiB limit to provide immediate feedback. The route repeats the same checks because browser validation is not a security boundary. The UI also tells the user that an eligible photo contains one to five front-facing covers; cover orientation/count is extraction guidance, not a claim that local file validation can inspect image content.

Alternative considered: encode the image as base64 JSON. Multipart avoids base64 size overhead and is the native representation for a file upload.

### Normalize provider output at a narrow adapter boundary

The route calls a server-only extraction adapter. Provider prompts, SDK types, and raw responses stay inside that adapter. The adapter validates and maps successful output to:

```ts
type ExtractedBookCandidate = {
  id: string;
  title: string;
  authors: string[];
};
```

`id` is request-scoped UI identity, not a persisted Library Book identifier. Missing or uncertain title/author information is represented by empty values so the user can correct it. The successful route response is a JSON `ExtractedBookCandidate[]` containing zero to five candidates. Malformed provider output is an extraction failure rather than untrusted data passed into the UI.

Alternative considered: expose the provider response directly. That would couple UI behavior and tests to a vendor schema and make runtime validation weaker.

### Keep request state in memory only

The route reads the uploaded bytes for the active request, invokes the provider, maps the response, and releases references when the response finishes. It does not write files, database rows, caches, telemetry payloads, or retry jobs containing the photo or candidates. Logs may include an error category and request correlation identifier, but never photo bytes, encoded images, candidate content, provider credentials, or raw provider responses.

Alternative considered: persist requests for retries. ADR-002 rejects this because recovery storage expands the backend's privacy responsibilities; users retry with a new request instead.

### Model the browser flow as explicit transient states

The page uses `idle`, `invalid`, `extracting`, `ready`, `empty`, and `failed` states. Submission is disabled while `extracting`, a non-color-only status announces progress, and a successful response replaces prior candidate state. Candidate edits remain in page memory only. A new extraction clears the prior transient result before submitting so candidates from separate photos are not mixed.

Alternative considered: infer state from scattered booleans. Explicit states prevent contradictory progress/error/result combinations and simplify deterministic tests.

### Return a small stable error envelope

Non-success responses use `{ error: { code, message } }` with codes for invalid upload, oversized upload, provider unavailability, and invalid provider output. User-facing copy is actionable but does not expose provider internals. The browser preserves the selected photo after a remote extraction failure so the user can retry; selecting a different photo clears the error.

Alternative considered: surface raw provider errors. Raw errors can leak implementation details or secrets and do not provide a stable UI contract.

## Risks / Trade-offs

- [A 10 MiB limit or the initial MIME allowlist excludes some otherwise usable photos] → State the accepted formats and limit next to the input; keep both checks in shared constants so a future approved change can alter them consistently.
- [MIME metadata can be inaccurate or spoofed] → Validate multipart shape, declared MIME type, size, and successful image decoding before provider submission; do not trust filename extensions.
- [Provider output is incomplete or uncertain] → Preserve editable empty values and do not imply that extraction is authoritative or automatically save results.
- [External extraction is slow or unavailable] → Show pending state, reject duplicate submission while pending, and provide a retry path without retaining server state.
- [Logging or framework defaults could retain sensitive payloads] → Avoid body/candidate logging and add focused tests/review checks for the route and adapter boundary.
- [Vendor choice remains an implementation concern] → Keep one adapter interface and contract tests; the implementation change must document the selected server-only adapter and required environment variable without changing the browser/API contract.

## Migration Plan

This is the first application slice, so there is no data migration. Implementation can be rolled back by removing the page, extraction route, shared contract, and server adapter; no backend or browser records require cleanup because this slice persists none.

## Open Questions

None at the behavioral-contract level. OpenAI and the default model are
deployment choices behind the extraction adapter and do not change this spec.
