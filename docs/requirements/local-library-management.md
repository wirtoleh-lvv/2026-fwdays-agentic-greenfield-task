# Local Library Management

| ID | Requirement | Status | Verification |
| --- | --- | --- | --- |
| FR-LIB-001 | A separate Save confirmed books action atomically persists the resolved batch of explicitly confirmed books to the browser-local Home Library; confirmation alone does not save. Home Library Manual Add is a separate explicit local-write path that reloads the latest valid collection, appends one new Library Book, and writes the complete updated collection once. | accepted | tested |
| FR-LIB-002 | After a successful local save operation, the user can view every locally stored Library Book in Home Library. Batch save returns the user to Home Library, and Home Library Manual Add closes back into the refreshed library. | accepted | tested |
| FR-LIB-003 | Home Library loads locally stored Library Books after a page reload or later session in the same browser profile. | accepted | tested |
| FR-LIB-004 | The user can edit a saved Library Book. | accepted | tested |
| FR-LIB-005 | A per-book Remove action permanently removes a Library Book only after explicit confirmation; confirmation reloads the latest valid browser-local collection, removes only the stable target id with one complete write, and treats an already-absent target as a successful no-write outcome. | accepted | tested |
| FR-LIB-006 | In a populated Home Library, the user can search saved Library Books locally by title or author with a live case-insensitive substring filter that stays in session state, keeps the total library count unchanged, and provides a recoverable no-results state without mutating stored data. | accepted | tested |
