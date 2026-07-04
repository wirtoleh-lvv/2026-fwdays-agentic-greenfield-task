# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-04 18:23:59 EEST (+03:00)
- **Current phase:** Phase 6 — first vertical slice archived; next-feature discovery
- **Active change:** none
- **Progress:** `add-books-from-photo` was synchronized into the main `photo-book-extraction` spec and archived as `2026-07-04-add-books-from-photo`. No active OpenSpec changes remain, and strict validation passes for the synchronized main spec.
- **Next task:** Start `$grill-openspec` for the smallest candidate-review slice before creating its OpenSpec proposal.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of:

1. `AGENTS.md` — project workflow and guardrails.
2. `openspec/specs/photo-book-extraction/spec.md` — accepted photo-extraction behavior.
3. `openspec/changes/archive/2026-07-04-add-books-from-photo/` — archived proposal, design, delta spec, and tasks.
4. `docs/requirements/*.md` — canonical detailed requirements and stable IDs.
5. `docs/PRD.md` and `docs/Vocabulary.md` — product context and domain terms.
6. `docs/adr/ADR-001-local-first-browser-persistence.md` and `docs/adr/ADR-002-thin-stateless-backend-for-ai-extraction.md` — governing architecture decisions.

## OpenSpec Status

- Active changes: none.
- Archived changes: `2026-07-04-add-books-from-photo` with all 15 tasks complete.
- `openspec validate --all --strict`: passed on 2026-07-04; 1 main spec passed and 0 failed.

## Archived Change Progress

### `2026-07-04-add-books-from-photo`

- **Implemented:** OpenAI Responses API adapter using configurable `gpt-5.5`, `store: false`, Structured Outputs, original-detail image input, and a 1,200-token output ceiling.
- **Implemented:** One-photo browser flow, 10 MiB/type validation, authoritative server decoding, editable candidates, accessible pending/empty/error states, retry, and stale-result clearing. The UI uses the Figma-derived warm editorial design system, responsive upload/review layouts, real transient photo previews, and Lucide icons.
- **Verified:** Stateless/no-log server paths, post-restyle OpenSpec/code/privacy checker passes, the full automated battery, and a user-reported rendered UI pass. Requirement evidence is in `docs/qa/add-books-from-photo-verification.md`.
- **Remaining:** No behavior task. The accepted delta was synchronized to `openspec/specs/photo-book-extraction/spec.md` before archive.
- **Intentionally deferred:** Candidate confirmation and saving, Manual Add, duplicate detection, metadata enrichment, browser library persistence, and library management.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
openspec validate --all --strict
```

Latest observed result: all commands pass. Vitest reports 12 files and 25 tests passing; the production build includes `/api/extract-books`.

## Environment and Privacy

- Runtime stack: Next.js 16.2.10, React 19.2.7, TypeScript 5.9.3, OpenAI SDK 6.45.0, and Sharp 0.35.3.
- Provider: OpenAI Responses API; default model `gpt-5.5`, configurable with `OPENAI_VISION_MODEL`.
- `.env.example` contains placeholders only. A real `OPENAI_API_KEY` must remain in uncommitted `.env.local`; the user reported a successful live-provider extraction on 2026-07-04.
- The backend has no database, cache, queue, telemetry payload, or file persistence for photos or candidates.

## Agent Rules and Gotchas

- Task 5.1 was completed from automated evidence plus the user-reported post-restyle manual rendered pass; no implementation screenshots were captured.
- `npm install` reported two moderate dependency vulnerabilities; no forced audit fix was applied.
- No application code should be added until the next grilled feature has an approved OpenSpec change.
