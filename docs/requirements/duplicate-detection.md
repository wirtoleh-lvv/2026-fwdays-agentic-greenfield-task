# Duplicate Detection

| ID | Requirement | Status | Verification |
| --- | --- | --- | --- |
| FR-DUP-001 | Before saving, each confirmed candidate is compared with Library Books after trimming and collapsing whitespace and comparing case-insensitively; author order is ignored while punctuation and diacritics remain significant. | accepted | untested |
| FR-DUP-002 | A confirmed candidate is a Duplicate when its normalized title and normalized author list match an existing Library Book. | accepted | untested |
| FR-DUP-003 | A confirmed candidate is a Possible Duplicate when its normalized title matches an existing Library Book but author information differs or is missing. | accepted | untested |
| FR-DUP-004 | Before any batch write, Duplicate Review identifies every conflicting candidate, its matching Library Book, and whether it is a Duplicate or Possible Duplicate. | accepted | untested |
| FR-DUP-005 | Each conflict must be explicitly resolved as Save anyway or Exclude before the resolved batch can be saved; no conflict is added silently. | accepted | untested |
