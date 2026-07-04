# Current State

> Persistent handoff for future agent windows. This is a quick map, not a
> source of requirements or implementation truth. Verify it against OpenSpec,
> tests, and the repository before acting.

## Last Updated

- **Date and time:** 2026-07-04 18:15:45 EEST (+03:00)
- **Current phase:** Phase 5 — completed first vertical slice, ready to archive
- **Active change:** `add-books-from-photo`
- **Progress:** All 15 OpenSpec tasks are complete. The upload-through-editable-candidate interface follows repository-captured Figma Make states 6–10, the full automated battery passes, and the user reported all requested rendered, keyboard-focus, status, editing, and responsive checks passing without findings.
- **Next task:** Archive `add-books-from-photo` with `$openspec-archive-change` after the completed implementation commit is pushed.

## Canonical Context

This handoff is non-canonical. Resolve conflicts in favor of:

1. `AGENTS.md` — project workflow and guardrails.
2. `openspec/changes/add-books-from-photo/` — active proposal, design, scenarios, and tasks.
3. `docs/requirements/*.md` — canonical detailed requirements and stable IDs.
4. `docs/PRD.md` and `docs/Vocabulary.md` — product context and domain terms.
5. `docs/adr/ADR-001-local-first-browser-persistence.md` and `docs/adr/ADR-002-thin-stateless-backend-for-ai-extraction.md` — governing architecture decisions.

## OpenSpec Status

- `add-books-from-photo` is complete with 15 of 15 tasks checked; it remains active until archived.
- `openspec validate --all --strict`: passed on 2026-07-04; 1 change passed and 0 failed.
- Archived changes: none.

## Active Change Progress

### `add-books-from-photo`

- **Implemented:** OpenAI Responses API adapter using configurable `gpt-5.5`, `store: false`, Structured Outputs, original-detail image input, and a 1,200-token output ceiling.
- **Implemented:** One-photo browser flow, 10 MiB/type validation, authoritative server decoding, editable candidates, accessible pending/empty/error states, retry, and stale-result clearing. The UI uses the Figma-derived warm editorial design system, responsive upload/review layouts, real transient photo previews, and Lucide icons.
- **Verified:** Stateless/no-log server paths, post-restyle OpenSpec/code/privacy checker passes, the full automated battery, and a user-reported rendered UI pass. Requirement evidence is in `docs/qa/add-books-from-photo-verification.md`.
- **Remaining:** No OpenSpec behavior task. `design-qa.md` still records the absence of captured screenshots for repeatable artifact comparison.
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
- The active change is ready to archive after its implementation commit is pushed.
