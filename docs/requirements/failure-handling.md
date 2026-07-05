# Failure Handling

| ID | Requirement | Status | Verification |
| --- | --- | --- | --- |
| FR-FAIL-001 | An upload or extraction failure shows an actionable error and does not create Library Books. | accepted | untested |
| FR-FAIL-002 | If extraction is unavailable or misses a book, the user can continue with Manual Add. | accepted | untested |
| FR-FAIL-003 | A metadata enrichment failure does not prevent the user from reviewing and confirming available candidate information. | accepted | untested |
| FR-FAIL-004 | A browser-storage read or write failure is reported, does not overwrite unreadable existing data, does not claim any batch item was saved, and offers Retry. | accepted | untested |
| FR-FAIL-005 | A persistence or duplicate-review failure preserves candidate edits, confirmation decisions, and conflict resolutions until retry or deliberate abandonment. | accepted | untested |
