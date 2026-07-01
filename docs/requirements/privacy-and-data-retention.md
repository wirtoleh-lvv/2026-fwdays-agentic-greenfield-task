# Privacy and Data Retention

| ID | Requirement | Status | Verification |
| --- | --- | --- | --- |
| NFR-PRIV-001 | Confirmed Library Books remain in the user's browser and are not persisted by the backend. | accepted | untested |
| NFR-PRIV-002 | Secrets, API keys, and tokens are not exposed to browser code or committed to the repository. | accepted | untested |
| TC-AI-001 | AI extraction runs through a thin, stateless backend. | accepted | untested |
| TC-AI-002 | The backend does not persist Raw Uploaded Photos, extracted candidates, or Library Books. | accepted | untested |
| TC-STORAGE-001 | Confirmed Library Books use browser local persistence. | accepted | untested |
| TC-STORAGE-002 | Library persistence does not depend on an account, cloud sync, or backend storage. | accepted | untested |
| TC-METADATA-001 | Open Library is used only as a best-effort metadata provider. | accepted | untested |
| TC-METADATA-002 | Saving a confirmed book does not require successful Open Library enrichment. | accepted | untested |
| BC-PRIVACY-001 | Raw Uploaded Photos are processed temporarily and are not retained permanently. | accepted | untested |
