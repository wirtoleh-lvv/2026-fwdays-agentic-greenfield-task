# Local Library Management

| ID | Requirement | Status | Verification |
| --- | --- | --- | --- |
| FR-LIB-001 | A separate Save action atomically persists the resolved batch of explicitly confirmed books to the browser-local Home Library; confirmation alone does not save. | accepted | tested |
| FR-LIB-002 | After a successful save, the user is taken to Home Library and can view every locally stored Library Book. | accepted | tested |
| FR-LIB-003 | Home Library loads locally stored Library Books after a page reload or later session in the same browser profile. | accepted | tested |
| FR-LIB-004 | The user can edit a saved Library Book. | accepted | untested |
| FR-LIB-005 | A per-book Remove action permanently removes a Library Book only after explicit confirmation; confirmation reloads the latest valid browser-local collection, removes only the stable target id with one complete write, and treats an already-absent target as a successful no-write outcome. | accepted | untested |
