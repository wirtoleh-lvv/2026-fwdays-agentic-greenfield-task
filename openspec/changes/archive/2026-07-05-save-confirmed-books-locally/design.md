## Context

The current client owns transient extraction and candidate-decision state inside
`PhotoExtractionForm`. Confirm and Skip are implemented, but Confirm deliberately
does not create a Library Book. The app has no Library Book model, browser
storage boundary, Duplicate Review state, or Home Library screen.

This slice must complete the first persistence path while preserving ADR-001's
browser-only ownership and ADR-002's stateless backend. The visual sources are
the repository-captured prototype states for populated Home Library, Duplicate
Warning, save success, and empty Home Library (`01`, `12`, `14`, and `15`),
adapted to the approved batch and duplicate semantics rather than copying known
prototype defects.

## Goals / Non-Goals

**Goals:**

- Keep Confirm transient and introduce an explicit Save action.
- Detect every deterministic conflict against the current Home Library before
  any write and preserve the complete review state across Duplicate Review.
- Persist one resolved batch atomically in versioned browser storage.
- Display the complete Home Library immediately and after reload or a later
  session in the same browser profile.
- Fail safely without overwriting unreadable data or claiming partial success.
- Match approved Figma-derived desktop/mobile states and accessibility rules.

**Non-Goals:**

- Edit, remove, search, sorting, filtering, Manual Add, or metadata enrichment.
- Candidate-review persistence before Save or recovery after deliberate
  abandonment.
- Cover-image persistence or synthetic cover generation.
- Fuzzy matching, ISBN matching, remote duplicate lookup, or batch-internal
  de-duplication beyond comparisons required by the approved spec.
- Accounts, backend library storage, cloud sync, or changes to extraction.

## Decisions

### Put app navigation and workflow ownership above extraction

Introduce a client-side Librarian application owner that loads Home Library and
switches among `home-library`, `photo-extraction`, `candidate-review`, and
`duplicate-review` states. Refactor the current extraction component only as
needed to expose candidates and transitions while preserving its public
behavior.

This keeps the transient candidate collection alive while Duplicate Review is
shown and prevents the audited state-loss defect. Alternative considered:
mounting separate pages whose navigation reconstructs candidates from the
original extraction result. That would discard edits, acknowledgements, and
decisions.

### Isolate versioned browser persistence behind a typed boundary

Use a client-only storage adapter with a key equivalent to
`librarian.home-library.v1` and an envelope equivalent to:

```text
{ version: 1, books: LibraryBook[] }

LibraryBook = {
  id: stable local id,
  title: string,
  authors: string[],
  authorUnknown: boolean
}
```

The adapter validates the complete value on read and serializes one complete
next value per save. Components receive the adapter through a narrow boundary
so tests can exercise public UI behavior with controlled read/write failures.
No browser storage is read during server rendering and no Library Book crosses
an API boundary.

Alternative considered: direct `localStorage` calls throughout UI components.
That would duplicate validation, complicate failure tests, and obscure the
privacy boundary.

### Treat malformed or unsupported storage as an error, not an empty library

A missing key is a valid empty Home Library. Invalid JSON, a wrong version, or
an invalid book record is a load failure. The app retains the unreadable value,
shows a retryable error, and blocks writes until a valid library is loaded.

Alternative considered: silently replacing malformed data with an empty array.
That creates unannounced data loss and violates the agreed fail-safe behavior.

### Normalize for comparison without mutating displayed data

Comparison helpers trim, collapse repeated whitespace, and apply locale-neutral
case normalization. Author entries are normalized individually, empty entries
are removed, and the resulting list is sorted for order-independent equality.
Punctuation and diacritics are retained. Original reviewed strings remain the
values shown and persisted.

Exact normalized title and author-list equality is Duplicate. Equal normalized
title with non-equal or missing author information is Possible Duplicate. No
edit distance or fuzzy token matching is introduced.

Alternative considered: store normalized fields alongside every Library Book.
The collection is tiny for MVP, so deriving comparison keys avoids redundant
persisted state and migration coupling.

### Resolve all conflicts before one batch write

Build a transient save plan from Confirmed candidates and the loaded library.
If conflicts exist, show all of them in one Duplicate Review state. Each plan
item records an explicit `save-anyway` or `exclude` resolution. Non-conflicting
candidates remain queued. The final action is enabled only when every conflict
is resolved and at least one item remains.

The adapter receives `existing books + resolved candidates` and performs one
`setItem` call. On failure, the save plan and candidate collection stay intact
for Retry. On success, transient review state is cleared and Home Library is
rendered from the value that was written.

Alternative considered: write non-conflicting books before asking about
conflicts. That creates partial success and makes retry semantics ambiguous.

### Keep local identity independent from extraction identity

Create a new stable local id for every saved Library Book at the storage
boundary. Extraction candidate ids remain request-scoped and are not reused as
library identity. Time/random-id generation is injectable or otherwise
controlled at the boundary for deterministic tests.

Alternative considered: persist extraction ids. Provider/request-scoped ids do
not establish durable local identity and may collide across sessions.

### Preserve explicit success and focus transitions

Save success navigates to Home Library with a polite text status containing the
saved count and focus on the Home Library heading. Duplicate Review focuses its
heading or first unresolved conflict; Back to review returns focus to the Save
action; persistence errors focus or announce the error while leaving Retry
reachable. Status badges include text/icons and never rely on color alone.

## Risks / Trade-offs

- [Browser storage can be unavailable or externally corrupted] → Validate on
  every load, fail closed, preserve unreadable data, and offer Retry.
- [One atomic JSON write rewrites the small collection] → Accept for MVP scale;
  keep the storage adapter replaceable if collection size later matters.
- [Title-only Possible Duplicate creates false positives for common titles] →
  Require explicit review and preserve Save anyway; do not silently discard.
- [No fuzzy matching misses spelling variants] → Keep matching predictable and
  defer fuzzy semantics until separately specified.
- [A large conflict batch can lengthen Duplicate Review] → List compact
  conflicts with persistent text progress and keep all resolutions reversible
  before the write.
- [Prototype contains out-of-scope search/edit/remove/manual-add controls] → Use
  only its layout and visual language; omit those controls in this slice.

## Migration Plan

This is the first Home Library storage version. A missing key initializes an
empty in-memory collection and is written only after explicit Save. Deployment
requires no server or data migration. Rollback leaves the versioned browser key
untouched; earlier code ignores it. A future schema change must introduce an
explicit reader/migration rather than silently resetting data.

## Open Questions

None for this slice.
