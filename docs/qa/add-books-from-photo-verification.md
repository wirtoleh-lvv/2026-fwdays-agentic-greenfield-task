# Add Books from Photo Verification

## Scope

- **OpenSpec change:** `add-books-from-photo`
- **Automated run:** 2026-07-04
- **Final result:** 12 test files and 25 tests passed.

## Requirement Evidence

| Requirement IDs | Evidence |
| --- | --- |
| `FR-UPLOAD-001`, `FR-UPLOAD-002` | `src/app/page.test.tsx`, `src/features/photo-extraction/photo-upload-validation.test.tsx`, `src/features/photo-extraction/photo-extraction-design.test.tsx`, `src/server/photo-extraction/route-handler.test.ts` |
| `FR-EXTRACT-001` | `src/features/photo-extraction/photo-extraction-tracer.test.tsx`, `src/features/photo-extraction/extraction-pending.test.tsx` |
| `FR-EXTRACT-002` | `src/server/photo-extraction/openai-provider.test.ts`, `src/features/photo-extraction/extraction-empty.test.tsx`, `src/server/photo-extraction/route-handler.test.ts` |
| `FR-EXTRACT-003` | `src/features/photo-extraction/photo-extraction-tracer.test.tsx`, `src/features/photo-extraction/extraction-empty.test.tsx`, `src/features/photo-extraction/extraction-replacement.test.tsx` |
| `FR-CONFIRM-001`, `FR-CONFIRM-002` | `src/features/photo-extraction/photo-extraction-tracer.test.tsx` verifies editable transient candidate controls. |
| `FR-FAIL-001` | Browser and API validation tests plus `src/features/photo-extraction/extraction-failure.test.tsx` and malformed-provider tests. |
| `NFR-PERF-002`, `NFR-A11Y-003` | `src/features/photo-extraction/extraction-pending.test.tsx` verifies announced progress and duplicate-submit prevention; empty, validation, and failure tests verify non-color-only messages. |
| `NFR-A11Y-001`, `NFR-A11Y-002` | `src/features/photo-extraction/extraction-accessibility.test.tsx` verifies keyboard focus order and operation; labels and the Figma-derived UI hierarchy are covered by page, tracer, and design tests; `src/app/globals.css` defines explicit visible focus treatment. |
| `NFR-PRIV-002`, `TC-AI-001` | `src/server/photo-extraction/openai-provider.test.ts` verifies server-side image extraction with Structured Outputs and `store: false`; the key is read only by the API route. |
| `TC-AI-002`, `BC-PRIVACY-001` | `src/server/photo-extraction/privacy.test.ts` verifies no success/failure content logging; source inspection found no backend persistence or cache calls. |
| `TC-STACK-001`, `TC-STACK-002`, `NFR-DX-001` | Next.js/TypeScript build passes and the dynamic `/api/extract-books` route is present; lint, typecheck, test, and build scripts pass. |

## Validation Battery

```text
npm run lint                         passed
npm run typecheck                    passed
npm test                             passed: 12 files, 25 tests
npm run build                        passed
openspec validate --all --strict     passed: 1 change, 0 failures
```

## Manual UI Evidence

On 2026-07-04, the user reported testing the app with a real eligible book
photo and provider configuration. Through the rendered UI, they selected the
upload control, selected the photo, activated **Extract books**, and observed
the expected extracted book result. This confirms the happy-path workflow for
`FR-UPLOAD-001`, `FR-EXTRACT-001`, `FR-EXTRACT-002`, and `BC-DEMO-001` from
user-reported browser behavior.

This report does not establish visible keyboard focus or the rendered pending,
empty-result, and failure states.

After the Figma restyle, the user manually exercised the rendered interface on
2026-07-04 and reported that all requested checks passed without findings. The
reported coverage included the idle, invalid-file, selected-photo, extraction
progress, and candidate-review states; visible and logical keyboard focus;
text-and-icon status communication; editable candidate fields; and responsive
layout without clipping or overlap. This completes the public-UI evidence for
`NFR-A11Y-001`, `NFR-A11Y-002`, and `NFR-A11Y-003`.

## Figma UI Implementation

On 2026-07-04, the upload-through-editable-candidate interface was restyled
against the repository-captured Figma Make states 6–10. The implementation
adds the warm editorial layout, selected-photo preview, design tokens,
responsive behavior, semantic status surfaces, and matching icon family while
preserving the approved OpenSpec boundary. Candidate confirmation, saving,
cover cropping, and Home Library navigation remain intentionally absent.

Automated behavior and build validation pass after the restyle. The user also
reported a complete manual rendered pass. Artifact-based design comparison is
recorded separately in `design-qa.md` and remains blocked because no
implementation screenshots were captured.

## Verification Gap

The automated keyboard, label, status, focus-style, and Figma-structure evidence
passes, and the user reported the required rendered behavior checks passing.
The only remaining evidence limitation is the absence of captured
implementation screenshots for repeatable artifact-based design comparison;
this does not leave an OpenSpec behavior task incomplete.

## Checker Pass

The separate OpenSpec, code, and privacy checker pass found and resolved:

- a concurrent-request path caused by changing the photo while extraction was pending
- an unhandled malformed-multipart parsing failure
- a missing output-token ceiling at the external provider boundary

Regression evidence is in `extraction-pending.test.tsx`,
`route-handler.test.ts`, and `openai-provider.test.ts`. No remaining
code, scope, or privacy finding was identified; rendered visual verification
was subsequently completed through the user-reported manual pass above. A
post-restyle checker pass found no new code, OpenSpec, scope, or privacy issue.

The required lint, typecheck, test, build, and strict OpenSpec commands passed
again on 2026-07-04. An optional `npm audit --omit=dev` query was attempted but
the npm registry was unreachable and the escalated retry timed out, so no audit
result is claimed.

## Intentionally Deferred

This change does not implement candidate confirmation or saving, Manual Add, duplicate detection, metadata enrichment, browser Home Library persistence, or library management. Those remain separate future capabilities.
