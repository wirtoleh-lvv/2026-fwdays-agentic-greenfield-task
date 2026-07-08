# Librarian MVP — Lean PRD

## Problem

People who own physical books often lack a simple, low-effort way to create a personal digital catalog. Entering every title and author manually is slow, while image-based recognition can be incomplete or wrong and therefore needs human confirmation.

## Target users

- A person beginning or maintaining a small personal catalog of physical books.
- A user who wants fast capture from book-cover photos but remains in control of the saved data.
- A privacy-conscious user who expects their confirmed library to remain on their device.

## MVP scope

The MVP lets a user:

1. Upload one photo containing one to five front-facing book covers.
2. Use AI-assisted extraction to produce editable book candidates from the photo.
3. Review each candidate and confirm, edit, or skip it.
4. Add a book manually when extraction misses a cover or is unavailable.
5. See a duplicate warning before a book is saved.
6. Save confirmed books to a library stored locally in the browser.
7. View and manage the locally stored library.

AI extraction is assistive rather than authoritative: no extracted candidate is saved without user confirmation.

## Non-functional requirements summary

- **Privacy:** confirmed library data remains in the user's browser; uploaded images and extraction data are retained only as required to complete extraction.
- **Resilience:** users receive actionable feedback when upload, extraction, metadata lookup, or local persistence fails.
- **Usability:** the primary flow is understandable without training and supports correcting AI output before saving.
- **Performance:** the interface remains responsive during local operations and clearly communicates progress during remote extraction.
- **Accessibility:** core workflows are keyboard-operable and use clear labels, focus states, and status messaging.
- **Compatibility:** the MVP supports current major desktop browsers.

## Success criteria

- A user can turn one eligible photo into one or more confirmed library records.
- A user can correct, skip, or manually replace inaccurate extraction results before saving.
- Potential duplicates are surfaced before persistence and never silently added.
- Saved books remain available after a page reload in the same browser profile.
- Extraction and persistence failures do not discard confirmed user edits without explanation.

## Out of scope

- User accounts, authentication, and cross-device synchronization.
- Cloud-hosted personal libraries or server-side retention of confirmed books.
- Native mobile applications.
- Batch upload of multiple photos in one operation.
- Recognition of spines, back covers, interior pages, or more than five covers per photo.
- Guaranteed bibliographic accuracy or exhaustive metadata enrichment.
- Social features, sharing, lending workflows, recommendations, and reading-progress tracking.
