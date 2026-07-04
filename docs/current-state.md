# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-04 17:40:44 EEST (+03:00)
- **Current phase:** Phase 4 — final verification of the first vertical slice
- **Active change:** `add-books-from-photo`
- **Progress:** 14 of 15 OpenSpec tasks are complete. Photo selection, browser and API validation, stateless OpenAI extraction, editable transient candidates, progress, empty, retry, replacement, malformed-output, privacy, and checker behaviors are implemented. The final automated battery passes.
- **Next task:** Complete task 5.1 by running `$verify-librarian-ui` against the rendered app to verify visible focus, legibility, and progress/empty/error states; the in-app browser was unavailable in the last run.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of:

1. `AGENTS.md` — project workflow and guardrails.
2. `openspec/changes/add-books-from-photo/` — active proposal, design, scenarios, and tasks.
3. `docs/requirements/*.md` — canonical detailed requirements and stable IDs.
4. `docs/PRD.md` and `docs/Vocabulary.md` — product context and domain terms.
5. `docs/adr/ADR-001-local-first-browser-persistence.md` and `docs/adr/ADR-002-thin-stateless-backend-for-ai-extraction.md` — governing architecture decisions.

## OpenSpec Status

- `add-books-from-photo` is in progress with 14 of 15 tasks complete.
- `openspec validate --all --strict`: passed on 2026-07-04; 1 change passed and 0 failed.
- Archived changes: none.

## Active Change Progress

### `add-books-from-photo`

- **Implemented:** OpenAI Responses API adapter using configurable `gpt-5.5`, `store: false`, Structured Outputs, original-detail image input, and a 1,200-token output ceiling.
- **Implemented:** One-photo browser flow, 10 MiB/type validation, authoritative server decoding, editable candidates, accessible pending/empty/error states, retry, and stale-result clearing.
- **Verified:** Stateless/no-log server paths and a separate OpenSpec, code, and privacy checker pass. Requirement evidence is in `docs/qa/add-books-from-photo-verification.md`.
- **Remaining:** Rendered visual verification for task 5.1 only.
- **Intentionally deferred:** Candidate confirmation and saving, Manual Add, duplicate detection, metadata enrichment, browser library persistence, and library management.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
openspec validate --all --strict
```

Latest observed result: all commands pass. Vitest reports 11 files and 23 tests passing; the production build includes `/api/extract-books`.

## Environment and Privacy

- Runtime stack: Next.js 16.2.10, React 19.2.7, TypeScript 5.9.3, OpenAI SDK 6.45.0, and Sharp 0.35.3.
- Provider: OpenAI Responses API; default model `gpt-5.5`, configurable with `OPENAI_VISION_MODEL`.
- `.env.example` contains placeholders only. A real `OPENAI_API_KEY` must remain in uncommitted `.env.local`; no live-provider request was made during verification.
- The backend has no database, cache, queue, telemetry payload, or file persistence for photos or candidates.

## Agent Rules and Gotchas

- Do not mark task 5.1 complete from automated DOM tests alone; inspect rendered focus and state presentation.
- The in-app browser surface was unavailable during the last verification attempt.
- `npm install` reported two moderate dependency vulnerabilities; no forced audit fix was applied.
- Do not archive the active change until task 5.1 and final validation pass.
