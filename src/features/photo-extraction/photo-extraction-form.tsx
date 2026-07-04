"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { ExtractedBookCandidate } from "../../lib/photo-extraction/contracts";
import {
  isSupportedPhotoType,
  MAX_PHOTO_BYTES,
  SUPPORTED_PHOTO_TYPES,
} from "../../lib/photo-extraction/upload-policy";

type CandidateDraft = Omit<ExtractedBookCandidate, "authors"> & {
  authorsText: string;
};

type ExtractionState = "idle" | "extracting" | "ready" | "empty" | "failed";

export function PhotoExtractionForm() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<CandidateDraft[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionState, setExtractionState] =
    useState<ExtractionState>("idle");
  const isExtracting = extractionState === "extracting";

  function selectPhoto(files: FileList | null) {
    if (files === null || files.length === 0) {
      setPhoto(null);
      setValidationError(null);
      return;
    }

    if (files.length > 1) {
      setPhoto(null);
      setValidationError("Choose one photo at a time.");
      return;
    }

    const selectedPhoto = files[0];

    if (!isSupportedPhotoType(selectedPhoto.type)) {
      setPhoto(null);
      setValidationError("Choose a JPEG, PNG, or WebP photo.");
      return;
    }

    if (selectedPhoto.size > MAX_PHOTO_BYTES) {
      setPhoto(null);
      setValidationError("Choose a photo no larger than 10 MiB.");
      return;
    }

    setPhoto(selectedPhoto);
    setValidationError(null);
    setExtractionError(null);
    setExtractionState("idle");
  }

  async function submitPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (photo === null || isExtracting) {
      return;
    }

    setCandidates([]);
    setExtractionState("extracting");
    setExtractionError(null);
    const formData = new FormData();
    formData.set("photo", photo);

    try {
      const response = await fetch("/api/extract-books", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setExtractionError(await safeExtractionError(response));
        setExtractionState("failed");
        return;
      }

      const extracted = (await response.json()) as ExtractedBookCandidate[];
      setCandidates(
        extracted.map((candidate) => ({
          id: candidate.id,
          title: candidate.title,
          authorsText: candidate.authors.join(", "),
        })),
      );
      setExtractionState(extracted.length === 0 ? "empty" : "ready");
    } catch {
      setExtractionError(
        "Book extraction is temporarily unavailable. Try again.",
      );
      setExtractionState("failed");
    }
  }

  function updateCandidate(
    id: string,
    field: "title" | "authorsText",
    value: string,
  ) {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id ? { ...candidate, [field]: value } : candidate,
      ),
    );
  }

  return (
    <>
      <form onSubmit={submitPhoto} aria-busy={isExtracting}>
        <label htmlFor="book-cover-photo">Book-cover photo</label>
        <input
          id="book-cover-photo"
          name="photo"
          type="file"
          disabled={isExtracting}
          accept={SUPPORTED_PHOTO_TYPES.join(",")}
          aria-describedby={
            validationError === null
              ? "book-cover-photo-guidance"
              : "book-cover-photo-guidance book-cover-photo-error"
          }
          onChange={(event) => selectPhoto(event.target.files)}
        />
        <p id="book-cover-photo-guidance">
          Choose one JPEG, PNG, or WebP photo no larger than 10 MiB containing
          one to five front-facing book covers.
        </p>
        {validationError === null ? null : (
          <p id="book-cover-photo-error" role="alert">
            {validationError}
          </p>
        )}
        <button type="submit" disabled={photo === null || isExtracting}>
          Extract books
        </button>
      </form>

      {isExtracting ? (
        <p role="status">Extracting books from your photo.</p>
      ) : null}

      {extractionState === "empty" ? (
        <p role="status">
          No books were identified. Choose another photo or retry this photo.
        </p>
      ) : null}

      {extractionState === "failed" && extractionError !== null ? (
        <p role="alert">{extractionError}</p>
      ) : null}

      {candidates.map((candidate, index) => {
        const position = index + 1;
        const titleId = `candidate-${candidate.id}-title`;
        const authorsId = `candidate-${candidate.id}-authors`;

        return (
          <section
            key={candidate.id}
            aria-labelledby={`candidate-${candidate.id}-heading`}
          >
            <h2 id={`candidate-${candidate.id}-heading`}>
              Candidate {position}
            </h2>
            <label htmlFor={titleId}>Title for candidate {position}</label>
            <input
              id={titleId}
              value={candidate.title}
              onChange={(event) =>
                updateCandidate(candidate.id, "title", event.target.value)
              }
            />
            <label htmlFor={authorsId}>Authors for candidate {position}</label>
            <input
              id={authorsId}
              value={candidate.authorsText}
              onChange={(event) =>
                updateCandidate(candidate.id, "authorsText", event.target.value)
              }
            />
          </section>
        );
      })}
    </>
  );
}

async function safeExtractionError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "object" &&
      body.error !== null &&
      "code" in body.error
    ) {
      switch (body.error.code) {
        case "invalid_upload":
          return "Choose one supported book-cover photo.";
        case "invalid_provider_output":
          return "The extracted book information could not be read. Try again.";
        case "provider_unavailable":
          return "Book extraction is temporarily unavailable. Try again.";
      }
    }
  } catch {
    // Use the same safe fallback for non-JSON and network-layer failures.
  }

  return "Book extraction is temporarily unavailable. Try again.";
}
