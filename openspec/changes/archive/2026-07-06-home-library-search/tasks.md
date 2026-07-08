## 1. Search field visibility and local query state

- [x] 1.1 Through one red-green-refactor cycle at the Home Library seam, prove the search field renders only when one or more Library Books exist, stays absent in the empty-library state, and preserves the total saved-book count while filtering (`FR-LIB-006`, `FR-LIB-002`, `FR-LIB-003`).
- [x] 1.2 Through one red-green-refactor cycle, implement populated-state search-field rendering and session-local query state with no browser-storage, URL, or backend persistence (`FR-LIB-006`, `NFR-PRIV-001`, `TC-STORAGE-001`, `TC-STORAGE-002`).

## 2. Live filtering and no-results recovery

- [x] 2.1 Through one red-green-refactor cycle, prove Home Library filters Library Books live by case-insensitive substring match over title and author text while keeping keyboard focus in the search field (`FR-LIB-006`, `NFR-A11Y-001`, `NFR-A11Y-002`).
- [x] 2.2 Through one red-green-refactor cycle, implement live local filtering over the current Home Library collection without changing duplicate semantics or stored data (`FR-LIB-006`).
- [x] 2.3 Through one red-green-refactor cycle, prove the no-results state echoes the active query, keeps the search field available, and offers both inline clear and explicit `Clear search` recovery without storage mutation (`FR-LIB-006`, `NFR-A11Y-001`, `NFR-A11Y-003`).
- [x] 2.4 Through one red-green-refactor cycle, implement the no-results state plus both clear affordances while preserving search-field focus during live result updates (`FR-LIB-006`, `NFR-A11Y-001`, `NFR-A11Y-003`).

## 3. Query lifecycle across Home Library mutations

- [x] 3.1 Through one red-green-refactor cycle, prove the active query is preserved across in-app Home Library transitions but resets on a fresh page reload in the same browser profile (`FR-LIB-006`, `FR-LIB-003`).
- [x] 3.2 Through one red-green-refactor cycle, implement in-session query preservation and fresh-reload reset without writing the query into browser storage (`FR-LIB-006`, `NFR-PRIV-001`, `TC-STORAGE-001`).
- [x] 3.3 Through one red-green-refactor cycle, prove successful save, edit, and removal outcomes immediately recompute the visible filtered results from the current library and active query (`FR-LIB-006`, `FR-LIB-001`, `FR-LIB-004`, `FR-LIB-005`).
- [x] 3.4 Through one red-green-refactor cycle, implement immediate filtered-view recomputation after local Home Library mutations, including transitions into the no-results state (`FR-LIB-006`).

## 4. Completion and canonical updates

- [x] 4.1 Manually verify the populated search state and no-results state against the approved Figma reference at desktop and mobile widths, including field layout, query echo, clear controls, visible focus, and unchanged Add books entry (`FR-LIB-006`, `NFR-A11Y-002`, `NFR-A11Y-003`).
- [x] 4.2 Add the canonical local-library-management requirement for Home Library search (`FR-LIB-006`), update related verification markers, and refresh `docs/current-state.md` with the next exact task or archive status.
- [x] 4.3 Run focused tests during each slice, then run lint, typecheck, full tests, build, strict OpenSpec validation, and the required checker passes before claiming completion.
