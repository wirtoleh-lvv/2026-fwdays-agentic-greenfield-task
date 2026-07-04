# Photo Book Extraction

## Purpose

Define the approved behavior and privacy boundary for turning one eligible
book-cover photo into editable, unsaved book candidates.

## Requirements

### Requirement: Select one eligible photo
The system SHALL allow the user to select exactly one JPEG, PNG, or WebP photo no larger than 10 MiB for a single extraction operation and SHALL explain that supported photo content contains one to five front-facing book covers. (`FR-UPLOAD-001`, `FR-UPLOAD-002`)

#### Scenario: Eligible photo is selected
- **WHEN** the user selects one JPEG, PNG, or WebP file no larger than 10 MiB
- **THEN** the system accepts the photo as eligible for submission

#### Scenario: Ineligible photo is selected
- **WHEN** the user selects an unsupported file type, a file larger than 10 MiB, or more than one file
- **THEN** the system shows a specific validation error and does not send an extraction request

### Requirement: Validate the upload at the API boundary
The extraction API SHALL accept one multipart `photo` part and SHALL reject a missing photo, additional files, an unsupported declared or decoded image type, or a photo larger than 10 MiB before invoking the AI provider. (`FR-UPLOAD-001`, `FR-FAIL-001`)

#### Scenario: Server receives a valid upload
- **WHEN** the API receives exactly one decodable JPEG, PNG, or WebP `photo` part no larger than 10 MiB
- **THEN** it submits that photo to the extraction adapter

#### Scenario: Server rejects a malformed upload
- **WHEN** the API receives a missing, extra, oversized, unsupported, or undecodable `photo` part
- **THEN** it returns an invalid-upload error and does not invoke the extraction adapter

### Requirement: Submit extraction with visible progress
The system SHALL submit an eligible photo for AI-assisted extraction through a Next.js API route, SHALL expose a non-color-only pending status while the request is active, and SHALL prevent duplicate submission of that request. (`FR-EXTRACT-001`, `NFR-PERF-002`, `NFR-A11Y-003`, `TC-STACK-002`)

#### Scenario: Extraction is pending
- **WHEN** the user submits an eligible photo and the request has not completed
- **THEN** the system announces that extraction is in progress and disables another submission

#### Scenario: User retries after failure
- **WHEN** a remote extraction request fails and the user retries the still-selected eligible photo
- **THEN** the system starts a new stateless extraction request

### Requirement: Return normalized extracted candidates
The extraction API SHALL return a successful JSON `ExtractedBookCandidate[]` containing zero to five request-scoped candidates, where each candidate has an `id` string, editable `title` string, and editable `authors` string array. It SHALL reject malformed provider output rather than returning it to the browser. (`FR-EXTRACT-002`)

#### Scenario: Provider identifies books
- **WHEN** the provider returns valid information for one or more books
- **THEN** the API returns one normalized candidate per identified book, up to five candidates

#### Scenario: Provider identifies no books
- **WHEN** the provider returns a valid result containing no identified books
- **THEN** the API returns an empty `ExtractedBookCandidate[]`

#### Scenario: Provider output is malformed
- **WHEN** the provider result cannot be validated as zero to five candidate records
- **THEN** the API returns an extraction error and returns no candidate data

### Requirement: Present editable candidates without saving
The Confirmation Screen SHALL display every returned Extracted Book Candidate in editable title and author controls, and editing those controls SHALL update only transient browser state. The system SHALL NOT automatically confirm, save, or otherwise turn a candidate into a Library Book. (`FR-EXTRACT-003`, `FR-CONFIRM-001`, `FR-CONFIRM-002`)

#### Scenario: Candidates are displayed for review
- **WHEN** extraction returns one or more candidates
- **THEN** the screen shows editable title and author controls for each returned candidate

#### Scenario: User edits candidate information
- **WHEN** the user changes a displayed candidate title or author
- **THEN** the changed value remains available for the current review session without creating a Library Book

#### Scenario: Extraction returns no candidates
- **WHEN** extraction succeeds with an empty candidate array
- **THEN** the screen reports that no books were identified and offers the user a way to choose or retry a photo

### Requirement: Handle upload and extraction failures safely
The system SHALL present an actionable error when upload validation or extraction fails, SHALL return no candidate data for a failed request, and SHALL create no Library Book. (`FR-FAIL-001`)

#### Scenario: Remote extraction fails
- **WHEN** the provider is unavailable or the extraction request otherwise fails
- **THEN** the screen explains that extraction failed, permits retry, and displays no candidates from the failed request

#### Scenario: A later extraction replaces transient results
- **WHEN** the user starts extraction for a newly selected eligible photo after viewing earlier candidates
- **THEN** the system clears the earlier transient candidates before submitting the new request

### Requirement: Keep extraction server-side and stateless
The system SHALL access AI provider credentials only in server code and SHALL process each Raw Uploaded Photo and its candidate data only for the active request. The backend SHALL NOT persist photo bytes, raw provider output, Extracted Book Candidates, or Library Books, and SHALL NOT include their contents or credentials in application logs. (`NFR-PRIV-002`, `TC-AI-001`, `TC-AI-002`, `BC-PRIVACY-001`)

#### Scenario: Successful request completes
- **WHEN** the backend returns normalized candidates for an extraction request
- **THEN** it retains no backend copy of the photo, raw provider output, or candidates after completing the response

#### Scenario: Failed request completes
- **WHEN** validation or provider extraction fails
- **THEN** the backend retains no uploaded photo or partial extraction data and exposes no provider credential or raw provider detail to the browser or logs
