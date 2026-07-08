"use client";

import { ArrowLeft, TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import type { DuplicateCategory } from "../../lib/home-library/duplicate-classifier";
import type { LibraryBook } from "../../lib/home-library/storage";

export type DuplicateReviewRecord = {
  id: string;
  title: string;
  authors: string[];
  authorUnknown: boolean;
};

export type DuplicateResolution = "save-anyway" | "exclude";

export type DuplicateConflict<TCandidate extends DuplicateReviewRecord = DuplicateReviewRecord> = {
  candidate: TCandidate;
  libraryBook: LibraryBook;
  category: DuplicateCategory;
};

export type DuplicateReviewPlan<TCandidate extends DuplicateReviewRecord = DuplicateReviewRecord> = {
  candidates: TCandidate[];
  conflicts: DuplicateConflict<TCandidate>[];
  resolutions: Record<string, DuplicateResolution>;
};

export function DuplicateReview<TCandidate extends DuplicateReviewRecord>({
  candidateLabel = "Confirmed candidate",
  plan,
  onBack,
  onResolve,
  onContinue,
}: {
  candidateLabel?: string;
  plan: DuplicateReviewPlan<TCandidate>;
  onBack: () => void;
  onResolve: (
    conflict: DuplicateConflict<TCandidate>,
    resolution: DuplicateResolution,
  ) => void;
  onContinue: (candidates: TCandidate[]) => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const allResolved = plan.conflicts.every(
    (conflict) => plan.resolutions[duplicateConflictKey(conflict)] !== undefined,
  );
  const resolvedCandidates = plan.candidates.filter((candidate) => {
    const candidateConflicts = plan.conflicts.filter(
      (conflict) => conflict.candidate.id === candidate.id,
    );

    return (
      candidateConflicts.length === 0 ||
      candidateConflicts.every(
        (conflict) =>
          plan.resolutions[duplicateConflictKey(conflict)] === "save-anyway",
      )
    );
  });
  const isEmpty = allResolved && resolvedCandidates.length === 0;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <>
      <div className="duplicate-review-alert" role="status">
        <TriangleAlert aria-hidden="true" />
        <div>
          <h1 ref={headingRef} tabIndex={-1}>Duplicate Review</h1>
          <p>
            {plan.conflicts.length}{" "}
            {plan.conflicts.length === 1 ? "conflict" : "conflicts"} found.
            Review every match before saving.
          </p>
        </div>
      </div>

      <div className="duplicate-conflict-list">
        {plan.conflicts.map((conflict) => {
          const categoryLabel =
            conflict.category === "duplicate"
              ? "Duplicate"
              : "Possible Duplicate";
          const key = duplicateConflictKey(conflict);
          const resolution = plan.resolutions[key];
          const candidateTitle = conflict.candidate.title.trim();

          return (
            <section
              className="duplicate-conflict"
              key={key}
              aria-label={`${categoryLabel} conflict for ${candidateTitle}`}
            >
              <span className="duplicate-category">{categoryLabel}</span>
              <div className="duplicate-records">
                <div>
                  <small>{candidateLabel}</small>
                  <strong>{candidateTitle}</strong>
                  <span>{displayAuthors(conflict.candidate)}</span>
                </div>
                <div>
                  <small>Already in your library</small>
                  <strong>{conflict.libraryBook.title}</strong>
                  <span>{displayAuthors(conflict.libraryBook)}</span>
                </div>
              </div>
              <div
                className="duplicate-resolution"
                role="group"
                aria-label={`Resolution for ${candidateTitle}`}
              >
                <button
                  type="button"
                  aria-label={`Save anyway for ${candidateTitle}`}
                  aria-pressed={resolution === "save-anyway"}
                  onClick={() => onResolve(conflict, "save-anyway")}
                >
                  Save anyway
                </button>
                <button
                  type="button"
                  aria-label={`Exclude ${candidateTitle}`}
                  aria-pressed={resolution === "exclude"}
                  onClick={() => onResolve(conflict, "exclude")}
                >
                  Exclude
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {isEmpty ? (
        <p className="message message-neutral">No books remain in this save batch.</p>
      ) : null}

      <div className="duplicate-review-actions">
        <button className="back-action" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Back to review
        </button>
        <button
          className="primary-button"
          type="button"
          disabled={!allResolved || resolvedCandidates.length === 0}
          onClick={() => onContinue(resolvedCandidates)}
        >
          Save resolved books
        </button>
      </div>
    </>
  );
}

export function duplicateConflictKey(
  conflict: DuplicateConflict<DuplicateReviewRecord>,
): string {
  return `${conflict.candidate.id}-${conflict.libraryBook.id}`;
}

function displayAuthors(record: {
  authors: string[];
  authorUnknown: boolean;
}): string {
  return record.authorUnknown || record.authors.length === 0
    ? "Author unknown"
    : record.authors.join(", ");
}
