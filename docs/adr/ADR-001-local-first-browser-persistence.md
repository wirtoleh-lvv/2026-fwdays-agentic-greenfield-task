# ADR-001: Local-First Browser Persistence

## Status

Accepted

## Context

Librarian MVP needs confirmed books to survive page reloads while keeping the Home Library private, account-free, and independent of backend storage or cloud sync.

## Decision

Persist confirmed Library Books in the user's browser. The backend does not store or synchronize Home Library data.

## Consequences

- Library data remains on the user's device and local operations do not require backend availability.
- The MVP avoids accounts, cloud persistence, and synchronization complexity.
- Data is limited to the current browser profile and may be lost if the user clears browser storage.
- Cross-device access and server-side recovery are unavailable.

## Related Requirements

- `FR-LIB-001`
- `FR-LIB-003`
- `NFR-PRIV-001`
- `TC-STORAGE-001`
- `TC-STORAGE-002`
- `BC-MVP-001`
