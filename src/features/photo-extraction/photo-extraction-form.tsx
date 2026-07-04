"use client";

import {
  ArrowLeft,
  ChevronRight,
  CircleAlert,
  HardDrive,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DragEvent, FormEvent } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateDraft[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionState, setExtractionState] =
    useState<ExtractionState>("idle");
  const isExtracting = extractionState === "extracting";
  const isReady = extractionState === "ready";

  useEffect(() => {
    return () => {
      if (
        previewUrlRef.current !== null &&
        typeof URL.revokeObjectURL === "function"
      ) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function selectPhoto(files: FileList | null) {
    if (files === null || files.length === 0) {
      clearPhoto();
      return;
    }

    if (files.length > 1) {
      setPhoto(null);
      replacePreviewUrl(null);
      setValidationError("Choose one photo at a time.");
      return;
    }

    const selectedPhoto = files[0];

    if (!isSupportedPhotoType(selectedPhoto.type)) {
      setPhoto(null);
      replacePreviewUrl(null);
      setValidationError("Choose a JPEG, PNG, or WebP photo.");
      return;
    }

    if (selectedPhoto.size > MAX_PHOTO_BYTES) {
      setPhoto(null);
      replacePreviewUrl(null);
      setValidationError("Choose a photo no larger than 10 MiB.");
      return;
    }

    setPhoto(selectedPhoto);
    replacePreviewUrl(selectedPhoto);
    setCandidates([]);
    setValidationError(null);
    setExtractionError(null);
    setExtractionState("idle");
  }

  function clearPhoto() {
    setPhoto(null);
    replacePreviewUrl(null);
    setCandidates([]);
    setValidationError(null);
    setExtractionError(null);
    setExtractionState("idle");
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = "";
    }
  }

  function returnToUpload() {
    setCandidates([]);
    setExtractionState("idle");
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (!isExtracting) {
      selectPhoto(event.dataTransfer.files);
    }
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

  if (isExtracting) {
    return (
      <main className="extraction-progress-shell">
        <div className="extraction-progress" role="status" aria-live="polite">
          <LoaderCircle className="progress-spinner" aria-hidden="true" />
          <h1>Finding books in your photo...</h1>
          <p>Extracting books from your photo.</p>
          <span>This usually takes a few seconds.</span>
        </div>
        <form className="pending-controls" aria-busy="true">
          <input
            ref={fileInputRef}
            aria-label="Book-cover photo"
            type="file"
            disabled
          />
          <button type="submit" disabled>
            Find books in photo
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className={isReady ? "page-shell review-shell" : "page-shell"}>
        {isReady ? (
          <CandidateReview
            candidates={candidates}
            onBack={returnToUpload}
            onUpdate={updateCandidate}
          />
        ) : (
          <>
            <div className="page-introduction">
              <h1>Add books from a photo</h1>
              <p>
                Take or select a photo showing 1–5 book covers facing the camera.
                <br />
                Nothing is saved until you review and confirm each book.
              </p>
            </div>

            <form
              className="photo-form"
              onSubmit={submitPhoto}
              aria-busy="false"
            >
              <input
                ref={fileInputRef}
                className="visually-hidden-file"
                id="book-cover-photo"
                name="photo"
                type="file"
                aria-label="Book-cover photo"
                accept={SUPPORTED_PHOTO_TYPES.join(",")}
                aria-describedby={
                  validationError === null
                    ? "book-cover-photo-guidance"
                    : "book-cover-photo-guidance book-cover-photo-error"
                }
                onChange={(event) => selectPhoto(event.target.files)}
              />

              {photo === null ? (
                <label
                  className="photo-dropzone"
                  htmlFor="book-cover-photo"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <Upload aria-hidden="true" />
                  <strong>Drop a photo here, or click to browse</strong>
                  <span id="book-cover-photo-guidance">
                    JPEG, PNG, or WebP · up to 10 MiB · 1–5 front-facing covers
                  </span>
                  <span className="sr-only">
                    Book-cover photo. Choose one photo containing one to five
                    front-facing book covers.
                  </span>
                </label>
              ) : (
                <div className="selected-photo">
                  <div className="selected-photo-preview">
                    {previewUrl === null ? null : (
                      // The object URL is scoped to this transient browser session.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Selected book-cover photo preview" />
                    )}
                    <button
                      className="remove-photo"
                      type="button"
                      aria-label="Remove selected photo"
                      onClick={clearPhoto}
                    >
                      <X aria-hidden="true" />
                    </button>
                  </div>
                  <div className="selected-photo-details">
                    <span>
                      <strong>{photo.name}</strong>
                      <small>{formatFileSize(photo.size)}</small>
                    </span>
                    <label htmlFor="book-cover-photo">Replace photo</label>
                  </div>
                  <p id="book-cover-photo-guidance" className="sr-only">
                    JPEG, PNG, or WebP up to 10 MiB containing one to five
                    front-facing book covers.
                  </p>
                </div>
              )}

              {validationError === null ? null : (
                <div
                  className="message message-error"
                  id="book-cover-photo-error"
                  role="alert"
                >
                  <CircleAlert aria-hidden="true" />
                  <p>{validationError}</p>
                </div>
              )}

              {extractionState === "empty" ? (
                <div className="message message-neutral" role="status">
                  <CircleAlert aria-hidden="true" />
                  <p>
                    No books were identified. Choose another photo or retry this
                    photo.
                  </p>
                </div>
              ) : null}

              {extractionState === "failed" && extractionError !== null ? (
                <div className="message message-error" role="alert">
                  <CircleAlert aria-hidden="true" />
                  <p>{extractionError}</p>
                </div>
              ) : null}

              <p className="privacy-note">
                <HardDrive aria-hidden="true" />
                Your photo is processed temporarily to identify book titles and
                is not retained after extraction completes.
              </p>

              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={photo === null}
                >
                  <ChevronRight aria-hidden="true" />
                  Find books in photo
                </button>
                <button className="text-button" type="button" onClick={clearPhoto}>
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </>
  );

  function replacePreviewUrl(selectedPhoto: File | null) {
    if (
      previewUrlRef.current !== null &&
      typeof URL.revokeObjectURL === "function"
    ) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextPreviewUrl =
      selectedPhoto !== null && typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(selectedPhoto)
        : null;
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
  }
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand-lockup">
          <strong>Librarian</strong>
          <span>Home Library</span>
        </div>
        <span className="device-note">
          <HardDrive aria-hidden="true" />
          Stored on this device
        </span>
      </div>
    </header>
  );
}

function CandidateReview({
  candidates,
  onBack,
  onUpdate,
}: {
  candidates: CandidateDraft[];
  onBack: () => void;
  onUpdate: (
    id: string,
    field: "title" | "authorsText",
    value: string,
  ) => void;
}) {
  const bookWord = candidates.length === 1 ? "book" : "books";

  return (
    <>
      <button className="back-action" type="button" onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
        Back to upload
      </button>
      <div className="page-introduction review-introduction">
        <h1>Review detected books</h1>
        <p>
          We found {candidates.length} {bookWord} in your photo. Edit each entry
          before continuing — nothing is saved automatically.
        </p>
      </div>

      <div className="candidate-list">
        {candidates.map((candidate, index) => {
          const position = index + 1;
          const titleId = `candidate-${candidate.id}-title`;
          const authorsId = `candidate-${candidate.id}-authors`;

          return (
            <section
              className="candidate-card"
              key={candidate.id}
              aria-labelledby={`candidate-${candidate.id}-heading`}
            >
              <div className="candidate-card-heading">
                <h2 id={`candidate-${candidate.id}-heading`}>
                  Candidate {position}
                </h2>
                <span>Editable candidate</span>
              </div>

              <label htmlFor={titleId}>Title</label>
              <input
                id={titleId}
                aria-label={`Title for candidate ${position}`}
                value={candidate.title}
                onChange={(event) =>
                  onUpdate(candidate.id, "title", event.target.value)
                }
              />

              <label htmlFor={authorsId}>Author(s)</label>
              <input
                id={authorsId}
                aria-label={`Authors for candidate ${position}`}
                value={candidate.authorsText}
                onChange={(event) =>
                  onUpdate(candidate.id, "authorsText", event.target.value)
                }
              />
            </section>
          );
        })}
      </div>

      <p className="unsaved-note">
        These candidates are editable and have not been saved to your library.
      </p>
    </>
  );
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
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
