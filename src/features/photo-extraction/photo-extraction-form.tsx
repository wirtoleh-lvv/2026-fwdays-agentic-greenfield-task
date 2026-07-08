"use client";

import {
  ArrowLeft,
  Check,
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
import type { LibraryBook } from "../../lib/home-library/storage";
import {
  classifyDuplicate,
} from "../../lib/home-library/duplicate-classifier";
import {
  DuplicateReview,
  duplicateConflictKey,
  type DuplicateReviewPlan,
} from "../duplicate-review/duplicate-review";
import {
  isSupportedPhotoType,
  MAX_PHOTO_BYTES,
  SUPPORTED_PHOTO_TYPES,
} from "../../lib/photo-extraction/upload-policy";

type CandidateDraft = Omit<ExtractedBookCandidate, "authors"> & {
  authorsText: string;
  authorUnknown: boolean;
  decision: "undecided" | "confirmed" | "skipped";
};

type ExtractionState = "idle" | "extracting" | "ready" | "empty" | "failed";

export type ConfirmedCandidate = {
  id: string;
  title: string;
  authors: string[];
  authorUnknown: boolean;
};

export function PhotoExtractionForm({
  onCancel = () => undefined,
  onSaveConfirmedBooks = () => undefined,
  existingBooks = [],
}: {
  onCancel?: () => void;
  onSaveConfirmedBooks?: (candidates: ConfirmedCandidate[]) => void;
  existingBooks?: LibraryBook[];
} = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const saveRetryRef = useRef<HTMLButtonElement>(null);
  const restoreSaveFocusRef = useRef(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateDraft[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionState, setExtractionState] =
    useState<ExtractionState>("idle");
  const [duplicatePlan, setDuplicatePlan] =
    useState<DuplicateReviewPlan<ConfirmedCandidate> | null>(null);
  const [isDuplicateReview, setIsDuplicateReview] = useState(false);
  const [failedSaveCandidates, setFailedSaveCandidates] = useState<
    ConfirmedCandidate[] | null
  >(null);
  const isExtracting = extractionState === "extracting";
  const isReady = extractionState === "ready";

  useEffect(() => {
    if (failedSaveCandidates !== null) {
      saveRetryRef.current?.focus();
    }
  }, [failedSaveCandidates]);

  useEffect(() => {
    if (!isDuplicateReview && restoreSaveFocusRef.current) {
      document.getElementById("save-confirmed-books")?.focus();
      restoreSaveFocusRef.current = false;
    }
  }, [isDuplicateReview]);

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
    setFailedSaveCandidates(null);

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
    setFailedSaveCandidates(null);
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
    setFailedSaveCandidates(null);
    setCandidates([]);
    setDuplicatePlan(null);
    setIsDuplicateReview(false);
    setExtractionState("idle");
  }

  function requestSaveConfirmed(confirmedCandidates: ConfirmedCandidate[]) {
    setFailedSaveCandidates(null);
    const conflicts = confirmedCandidates.flatMap((candidate) =>
      existingBooks.flatMap((libraryBook) => {
        const category = classifyDuplicate(candidate, libraryBook);

        return category === null
          ? []
          : [{ candidate, libraryBook, category }];
      }),
    );

    if (conflicts.length > 0) {
      setDuplicatePlan((current) => ({
        candidates: confirmedCandidates,
        conflicts,
        resolutions: Object.fromEntries(
          conflicts.flatMap((conflict) => {
            const key = duplicateConflictKey(conflict);
            const resolution = current?.resolutions[key];
            return resolution === undefined ? [] : [[key, resolution]];
          }),
        ),
      }));
      setIsDuplicateReview(true);
      return;
    }

    attemptSave(confirmedCandidates);
  }

  function attemptSave(confirmedCandidates: ConfirmedCandidate[]) {
    setFailedSaveCandidates(null);

    try {
      onSaveConfirmedBooks(confirmedCandidates);
    } catch {
      setFailedSaveCandidates(confirmedCandidates);
    }
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
          authorUnknown: false,
          decision: "undecided",
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
    setFailedSaveCandidates(null);
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              [field]: value,
              authorUnknown:
                field === "authorsText" && hasNonEmptyAuthor(value)
                  ? false
                  : candidate.authorUnknown,
            }
          : candidate,
      ),
    );
  }

  function updateAuthorUnknown(id: string, authorUnknown: boolean) {
    setFailedSaveCandidates(null);
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id ? { ...candidate, authorUnknown } : candidate,
      ),
    );
  }

  function confirmCandidate(id: string) {
    setFailedSaveCandidates(null);
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id && deriveCandidateReadiness(candidate).kind === "ready"
          ? { ...candidate, decision: "confirmed" }
          : candidate,
      ),
    );
  }

  function editCandidate(id: string) {
    setFailedSaveCandidates(null);
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id ? { ...candidate, decision: "undecided" } : candidate,
      ),
    );
  }

  function skipCandidate(id: string) {
    setFailedSaveCandidates(null);
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id && candidate.decision === "undecided"
          ? { ...candidate, decision: "skipped" }
          : candidate,
      ),
    );
  }

  function undoSkip(id: string) {
    setFailedSaveCandidates(null);
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id ? { ...candidate, decision: "undecided" } : candidate,
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
      <main
        className={
          isDuplicateReview && duplicatePlan !== null
            ? "page-shell duplicate-review-shell"
            : isReady
              ? "page-shell review-shell"
              : "page-shell"
        }
      >
        {failedSaveCandidates === null ? null : (
          <div className="message message-error" role="alert">
            <CircleAlert aria-hidden="true" />
            <div>
              <p>No books were saved. Browser storage is unavailable.</p>
              <button
                ref={saveRetryRef}
                className="text-button"
                type="button"
                onClick={() => attemptSave(failedSaveCandidates)}
              >
                Retry
              </button>
            </div>
          </div>
        )}
        {isDuplicateReview && duplicatePlan !== null ? (
          <DuplicateReview
            plan={duplicatePlan}
            onBack={() => {
              setFailedSaveCandidates(null);
              restoreSaveFocusRef.current = true;
              setIsDuplicateReview(false);
            }}
            onResolve={(conflict, resolution) => {
              setFailedSaveCandidates(null);
              setDuplicatePlan((current) =>
                current === null
                  ? null
                  : {
                      ...current,
                      resolutions: {
                        ...current.resolutions,
                        [duplicateConflictKey(conflict)]: resolution,
                      },
                    },
              )
            }}
            onContinue={attemptSave}
          />
        ) : isReady ? (
          <CandidateReview
            candidates={candidates}
            onBack={returnToUpload}
            onUpdate={updateCandidate}
            onUpdateAuthorUnknown={updateAuthorUnknown}
            onConfirm={confirmCandidate}
            onEdit={editCandidate}
            onSkip={skipCandidate}
            onUndo={undoSkip}
            onSaveConfirmedBooks={requestSaveConfirmed}
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
                <button className="text-button" type="button" onClick={onCancel}>
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

export function SiteHeader() {
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
  onUpdateAuthorUnknown,
  onConfirm,
  onEdit,
  onSkip,
  onUndo,
  onSaveConfirmedBooks,
}: {
  candidates: CandidateDraft[];
  onBack: () => void;
  onUpdate: (
    id: string,
    field: "title" | "authorsText",
    value: string,
  ) => void;
  onUpdateAuthorUnknown: (id: string, authorUnknown: boolean) => void;
  onConfirm: (id: string) => void;
  onEdit: (id: string) => void;
  onSkip: (id: string) => void;
  onUndo: (id: string) => void;
  onSaveConfirmedBooks: (candidates: ConfirmedCandidate[]) => void;
}) {
  const bookWord = candidates.length === 1 ? "book" : "books";
  const pendingFocusId = useRef<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const confirmedCount = candidates.filter(
    (candidate) => candidate.decision === "confirmed",
  ).length;
  const skippedCount = candidates.filter(
    (candidate) => candidate.decision === "skipped",
  ).length;

  useEffect(() => {
    if (pendingFocusId.current === null) {
      return;
    }

    document.getElementById(pendingFocusId.current)?.focus();
    pendingFocusId.current = null;
  }, [candidates]);

  function transitionCandidate(
    candidate: CandidateDraft,
    position: number,
    transition: "confirm" | "edit" | "skip" | "undo",
  ) {
    switch (transition) {
      case "confirm":
        pendingFocusId.current = `candidate-${candidate.id}-edit`;
        setAnnouncement(`Candidate ${position} confirmed.`);
        onConfirm(candidate.id);
        break;
      case "edit":
        pendingFocusId.current = `candidate-${candidate.id}-title`;
        setAnnouncement(`Candidate ${position} returned to editing.`);
        onEdit(candidate.id);
        break;
      case "skip":
        pendingFocusId.current = `candidate-${candidate.id}-undo`;
        setAnnouncement(`Candidate ${position} skipped.`);
        onSkip(candidate.id);
        break;
      case "undo":
        pendingFocusId.current = `candidate-${candidate.id}-title`;
        setAnnouncement(`Candidate ${position} returned to editing.`);
        onUndo(candidate.id);
        break;
    }
  }

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

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <div className="candidate-list">
        {candidates.map((candidate, index) => {
          const position = index + 1;
          const titleId = `candidate-${candidate.id}-title`;
          const authorsId = `candidate-${candidate.id}-authors`;
          const readiness = deriveCandidateReadiness(candidate);

          if (candidate.decision === "confirmed") {
            return (
              <section
                className="candidate-card candidate-card-decided candidate-card-confirmed"
                key={candidate.id}
                aria-labelledby={`candidate-${candidate.id}-heading`}
              >
                <h2
                  className="sr-only"
                  id={`candidate-${candidate.id}-heading`}
                >
                  Candidate {position}
                </h2>
                <div className="decided-candidate-summary">
                  <span className="decided-status">
                    <Check aria-hidden="true" />
                    Confirmed
                  </span>
                  <strong>{candidate.title}</strong>
                  <span>
                    {hasNonEmptyAuthor(candidate.authorsText)
                      ? candidate.authorsText
                      : "Author unknown"}
                  </span>
                </div>
                <button
                  id={`candidate-${candidate.id}-edit`}
                  className="inline-action"
                  type="button"
                  onClick={() =>
                    transitionCandidate(candidate, position, "edit")
                  }
                >
                  Edit
                </button>
              </section>
            );
          }

          if (candidate.decision === "skipped") {
            return (
              <section
                className="candidate-card candidate-card-decided candidate-card-skipped"
                key={candidate.id}
                aria-labelledby={`candidate-${candidate.id}-heading`}
              >
                <h2
                  className="sr-only"
                  id={`candidate-${candidate.id}-heading`}
                >
                  Candidate {position}
                </h2>
                <div className="decided-candidate-summary">
                  <span className="decided-status decided-status-skipped">
                    Skipped
                  </span>
                  <strong>{candidate.title || "Untitled candidate"}</strong>
                </div>
                <button
                  id={`candidate-${candidate.id}-undo`}
                  className="inline-action"
                  type="button"
                  onClick={() =>
                    transitionCandidate(candidate, position, "undo")
                  }
                >
                  Undo
                </button>
              </section>
            );
          }

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
                <span className={`candidate-status candidate-status-${readiness.kind}`}>
                  {readiness.kind === "ready" ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <CircleAlert aria-hidden="true" />
                  )}
                  {readiness.label}
                </span>
              </div>

              {readiness.message === null ? null : (
                <p className="candidate-guidance">{readiness.message}</p>
              )}

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

              {hasNonEmptyAuthor(candidate.authorsText) ? null : (
                <div className="unknown-author-callout">
                  <CircleAlert aria-hidden="true" />
                  <div>
                    <strong>No author entered.</strong>
                    <span>
                      If the author is truly unknown, acknowledge that below to
                      continue.
                    </span>
                    <label className="unknown-author-control">
                      <input
                        type="checkbox"
                        checked={candidate.authorUnknown}
                        onChange={(event) =>
                          onUpdateAuthorUnknown(candidate.id, event.target.checked)
                        }
                      />
                      The author of this book is unknown to me
                    </label>
                  </div>
                </div>
              )}

              <div className="candidate-actions">
                <button
                  className="primary-button"
                  type="button"
                  disabled={readiness.kind !== "ready"}
                  onClick={() =>
                    transitionCandidate(candidate, position, "confirm")
                  }
                >
                  <Check aria-hidden="true" />
                  Confirm
                </button>
                <button
                  className="candidate-skip-button"
                  type="button"
                  onClick={() =>
                    transitionCandidate(candidate, position, "skip")
                  }
                >
                  Skip
                </button>
              </div>
            </section>
          );
        })}
      </div>

      <p className="decision-summary">
        {confirmedCount} confirmed · {skippedCount} skipped
      </p>

      {confirmedCount > 0 ? (
        <button
          id="save-confirmed-books"
          className="primary-button save-confirmed-action"
          type="button"
          onClick={() =>
            onSaveConfirmedBooks(
              candidates
                .filter((candidate) => candidate.decision === "confirmed")
                .map(toConfirmedCandidate),
            )
          }
        >
          Save confirmed books
        </button>
      ) : null}

      <p className="unsaved-note">
        These candidates are editable and have not been saved to your library.
      </p>
    </>
  );
}

function toConfirmedCandidate(candidate: CandidateDraft): ConfirmedCandidate {
  return {
    id: candidate.id,
    title: candidate.title,
    authors: candidate.authorsText
      .split(",")
      .map((author) => author.trim())
      .filter((author) => author.length > 0),
    authorUnknown: candidate.authorUnknown,
  };
}

function deriveCandidateReadiness(candidate: CandidateDraft) {
  const hasTitle = candidate.title.trim().length > 0;
  const hasAuthor = hasNonEmptyAuthor(candidate.authorsText);

  if (hasTitle && (hasAuthor || candidate.authorUnknown)) {
    return {
      kind: "ready" as const,
      label: "Ready for Confirmation",
      message: null,
    };
  }

  return {
    kind: "needs-review" as const,
    label: "Needs Review",
    message: !hasTitle
      ? "A title is required before this candidate can be confirmed."
      : "An author is required unless the author is genuinely unknown.",
  };
}

function hasNonEmptyAuthor(authorsText: string) {
  return authorsText
    .split(",")
    .some((author) => author.trim().length > 0);
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
