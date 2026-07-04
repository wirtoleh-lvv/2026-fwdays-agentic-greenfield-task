# Add Books from Photo Verification

## Scope

- **OpenSpec change:** `add-books-from-photo`
- **Automated run:** 2026-07-04
- **Final result:** 11 test files and 23 tests passed.

## Requirement Evidence

| Requirement IDs | Evidence |
| --- | --- |
| `FR-UPLOAD-001`, `FR-UPLOAD-002` | `src/app/page.test.tsx`, `src/features/photo-extraction/photo-upload-validation.test.tsx`, `src/server/photo-extraction/route-handler.test.ts` |
| `FR-EXTRACT-001` | `src/features/photo-extraction/photo-extraction-tracer.test.tsx`, `src/features/photo-extraction/extraction-pending.test.tsx` |
| `FR-EXTRACT-002` | `src/server/photo-extraction/openai-provider.test.ts`, `src/features/photo-extraction/extraction-empty.test.tsx`, `src/server/photo-extraction/route-handler.test.ts` |
| `FR-EXTRACT-003` | `src/features/photo-extraction/photo-extraction-tracer.test.tsx`, `src/features/photo-extraction/extraction-empty.test.tsx`, `src/features/photo-extraction/extraction-replacement.test.tsx` |
| `FR-CONFIRM-001`, `FR-CONFIRM-002` | `src/features/photo-extraction/photo-extraction-tracer.test.tsx` verifies editable transient candidate controls. |
| `FR-FAIL-001` | Browser and API validation tests plus `src/features/photo-extraction/extraction-failure.test.tsx` and malformed-provider tests. |
| `NFR-PERF-002`, `NFR-A11Y-003` | `src/features/photo-extraction/extraction-pending.test.tsx` verifies announced progress and duplicate-submit prevention; empty, validation, and failure tests verify non-color-only messages. |
| `NFR-A11Y-001`, `NFR-A11Y-002` | `src/features/photo-extraction/extraction-accessibility.test.tsx` verifies keyboard focus order and operation; labels are covered by page and tracer tests; `src/app/globals.css` defines an explicit `:focus-visible` outline. |
| `NFR-PRIV-002`, `TC-AI-001` | `src/server/photo-extraction/openai-provider.test.ts` verifies server-side image extraction with Structured Outputs and `store: false`; the key is read only by the API route. |
| `TC-AI-002`, `BC-PRIVACY-001` | `src/server/photo-extraction/privacy.test.ts` verifies no success/failure content logging; source inspection found no backend persistence or cache calls. |
| `TC-STACK-001`, `TC-STACK-002`, `NFR-DX-001` | Next.js/TypeScript build passes and the dynamic `/api/extract-books` route is present; lint, typecheck, test, and build scripts pass. |

## Validation Battery

```text
npm run lint                         passed
npm run typecheck                    passed
npm test                             passed: 11 files, 23 tests
npm run build                        passed
openspec validate --all --strict     passed: 1 change, 0 failures
```

## Verification Gap

The automated keyboard, label, status, and focus-style evidence passes. Pixel-level rendered focus and legibility verification remains pending because the in-app browser surface was unavailable during this run.

## Checker Pass

The separate OpenSpec, code, and privacy checker pass found and resolved:

- a concurrent-request path caused by changing the photo while extraction was pending
- an unhandled malformed-multipart parsing failure
- a missing output-token ceiling at the external provider boundary

Regression evidence is in `extraction-pending.test.tsx`,
`route-handler.test.ts`, and `openai-provider.test.ts`. No remaining
code, scope, or privacy finding was identified; rendered visual verification
remains the explicit gap above.

## Intentionally Deferred

This change does not implement candidate confirmation or saving, Manual Add, duplicate detection, metadata enrichment, browser Home Library persistence, or library management. Those remain separate future capabilities.
