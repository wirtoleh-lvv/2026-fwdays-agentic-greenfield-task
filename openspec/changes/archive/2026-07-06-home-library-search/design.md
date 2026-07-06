## Context

Home Library already loads the full browser-local collection into `LibrarianApp`
and derives visible UI directly from that in-memory state. Edit and removal now
update the Home Library list in place without a route change, which makes local
search a natural UI-state concern rather than a storage concern.

The approved Figma search state shows a populated-library search field, an
explicit no-results state, and persistent add actions in the header. This slice
must stay narrower than the full Figma header change: it will add search only,
without splitting the current `Add books` action into separate entry points.

## Goals / Non-Goals

**Goals:**
- Let the user narrow a populated Home Library by title or author without
  changing stored Library Books.
- Keep the filter live, local, and cheap: no backend calls, no extra browser
  writes, no URL coupling.
- Preserve the current query while the user remains in the live app session and
  recompute filtered results immediately after save, edit, or removal outcomes.
- Keep the empty-library state distinct from the no-results state and preserve
  keyboard continuity by keeping focus in the search field while results update.

**Non-Goals:**
- Splitting `Add books` into `Add manually` and `Add from photo`.
- Fuzzy matching, ranking, sorting, advanced filters, highlighting, or
  cross-screen search.
- Persisting the search query to browser storage, the URL, or the backend.
- Changing duplicate normalization semantics or the library storage schema.

## Decisions

### 1. Search is derived UI state over the already-loaded Home Library

The query will live only in Home Library UI state, and visible results will be
derived from the current in-memory `books` array. This avoids extra storage
reads, keeps the behavior deterministic after in-session edits/removals/saves,
and matches the local-first architecture.

Alternative considered:
- Persist query in browser storage or URL. Rejected because it adds state
  coupling without MVP value and conflicts with the desired fresh-reload reset.

### 2. Matching uses case-insensitive substring comparison over title and author text

Search will match against visible Library Book title text and the rendered
author string, lowercased for comparison. This is more forgiving than prefix
matching and intentionally looser than duplicate normalization semantics.

Alternative considered:
- Reuse duplicate normalization exactly. Rejected because search is a discovery
  aid, not an identity rule; users benefit more from forgiving substring
  matching than precise duplicate semantics.

### 3. Search appears only in populated Home Library and keeps the total count unchanged

The search field will render only when at least one Library Book exists. The
heading count remains the total library size even while the visible results are
filtered. This keeps empty-library and no-results states distinct and matches
the Figma direction.

Alternative considered:
- Show search in the empty state or replace the count with filtered results.
  Rejected because it blurs the difference between “no books saved” and “no
  books match this query.”

### 4. Live filtering keeps focus in the search field and uses two clear affordances

Typing will update results immediately without moving focus. When there are zero
matches, the app will keep the search field visible, show a no-results state
that echoes the current query, and provide both an inline clear control and an
explicit `Clear search` action. This supports both fast pointer recovery and
clear keyboard/assistive guidance.

Alternative considered:
- Move focus to the no-results state or provide only one clear action. Rejected
  because it interrupts typing flow and makes recovery less obvious.

## Risks / Trade-offs

- [Filtered item disappears after mutation] → Recompute visible results
  immediately and keep the search field focused so the user can adjust the
  query without losing context.
- [Search semantics drift from duplicate semantics] → Treat search matching as
  explicit UI behavior in its own requirement and do not reuse duplicate copy or
  categories.
- [No-results state could be confused with an empty library] → Keep the total
  library count visible, hide search in true empty-library state, and echo the
  query in no-results copy.
- [Search capability scope can sprawl into navigation changes] → Keep `Add
  books` unchanged in this slice and defer the Figma action split to a separate
  capability.

## Migration Plan

No storage migration is required. Search introduces only transient UI state
over the existing Home Library collection. Rollback simply removes the search
state and returns the populated Home Library to its current always-show-all
behavior.

## Open Questions

None for the proposed V1 slice.
