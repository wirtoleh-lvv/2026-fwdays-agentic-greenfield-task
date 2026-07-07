"use client";

import {
  BookOpen,
  HardDrive,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  PhotoExtractionForm,
  SiteHeader,
} from "../photo-extraction/photo-extraction-form";
import {
  DuplicateReview,
  duplicateConflictKey,
  type DuplicateReviewPlan,
} from "../duplicate-review/duplicate-review";
import { classifyDuplicate } from "../../lib/home-library/duplicate-classifier";
import {
  addHomeLibraryBook,
  loadHomeLibrary,
  removeHomeLibraryBook,
  saveHomeLibrary,
  updateHomeLibraryBook,
  type AddHomeLibraryBookResult,
  type HomeLibraryStorage,
  type LibraryBookInput,
  type LibraryBook,
  type RemoveHomeLibraryBookResult,
  type UpdateHomeLibraryBookResult,
} from "../../lib/home-library/storage";

function environmentSupportsHover() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover)").matches
  );
}

const MANUAL_ADD_DRAFT_ID = "manual-add-draft";

type ManualAddReviewCandidate = {
  id: typeof MANUAL_ADD_DRAFT_ID;
  title: string;
  authors: string[];
  authorUnknown: boolean;
};

type AppState =
  | { kind: "loading" }
  | {
      kind: "home";
      books: LibraryBook[];
      savedCount?: number;
      restoreAddBooksFocus?: boolean;
    }
  | { kind: "load-error" }
  | { kind: "photo-extraction"; books: LibraryBook[] };

export function LibrarianApp({
  storage,
  createLibraryBookId = () => crypto.randomUUID(),
}: {
  storage?: HomeLibraryStorage;
  createLibraryBookId?: () => string;
}) {
  const [state, setState] = useState<AppState>({ kind: "loading" });
  const [searchQuery, setSearchQuery] = useState("");

  const loadLibrary = useCallback(() => {
    try {
      setState({
        kind: "home",
        books: loadHomeLibrary(storage ?? window.localStorage),
      });
    } catch {
      setState({ kind: "load-error" });
    }
  }, [storage]);

  useEffect(() => {
    const loadTask = window.setTimeout(loadLibrary, 0);

    return () => window.clearTimeout(loadTask);
  }, [loadLibrary]);

  if (state.kind === "photo-extraction") {
    return (
      <PhotoExtractionForm
        existingBooks={state.books}
        onCancel={() => {
          setState({
            kind: "home",
            books: state.books,
            restoreAddBooksFocus: true,
          });
        }}
        onSaveConfirmedBooks={(candidates) => {
          const books = saveHomeLibrary(
            storage ?? window.localStorage,
            state.books,
            candidates.map(({ title, authors, authorUnknown }) => ({
              title,
              authors,
              authorUnknown,
            })),
            createLibraryBookId,
          );
          setState({ kind: "home", books, savedCount: candidates.length });
        }}
      />
    );
  }

  if (state.kind === "loading") {
    return (
      <main className="home-library-loading" aria-busy="true">
        <p role="status">Loading Home Library…</p>
      </main>
    );
  }

  if (state.kind === "load-error") {
    return (
      <>
        <SiteHeader />
        <main className="page-shell">
          <div className="message message-error" role="alert">
            <p>Home Library could not be loaded.</p>
          </div>
          <button className="primary-button" type="button" onClick={loadLibrary}>
            Retry
          </button>
        </main>
      </>
    );
  }

  return (
    <HomeLibrary
      books={state.books}
      savedCount={state.savedCount}
      searchQuery={searchQuery}
      restoreAddBooksFocus={state.restoreAddBooksFocus}
      onLoadBooks={() => loadHomeLibrary(storage ?? window.localStorage)}
      onSearchQueryChange={setSearchQuery}
      onAddManualBook={(draft) => {
        const result = addHomeLibraryBook(
          storage ?? window.localStorage,
          draft,
          createLibraryBookId,
        );
        setState({ kind: "home", books: result.books });
        return result;
      }}
      onEditBook={(targetId, updates) => {
        const result = updateHomeLibraryBook(
          storage ?? window.localStorage,
          targetId,
          updates,
        );
        setState({ kind: "home", books: result.books });
        return result;
      }}
      onRemoveBook={(targetId) => {
        const result = removeHomeLibraryBook(
          storage ?? window.localStorage,
          targetId,
        );
        setState({ kind: "home", books: result.books });
        return result;
      }}
      onAddBooks={() =>
        setState({ kind: "photo-extraction", books: state.books })
      }
    />
  );
}

function HomeLibrary({
  books,
  savedCount,
  searchQuery,
  restoreAddBooksFocus = false,
  onLoadBooks,
  onAddBooks,
  onSearchQueryChange,
  onAddManualBook,
  onEditBook,
  onRemoveBook,
}: {
  books: LibraryBook[];
  savedCount?: number;
  searchQuery: string;
  restoreAddBooksFocus?: boolean;
  onLoadBooks: () => LibraryBook[];
  onAddBooks: () => void;
  onSearchQueryChange: (nextQuery: string) => void;
  onAddManualBook: (draft: LibraryBookInput) => AddHomeLibraryBookResult;
  onEditBook: (
    targetId: string,
    updates: LibraryBookInput,
  ) => UpdateHomeLibraryBookResult;
  onRemoveBook: (targetId: string) => RemoveHomeLibraryBookResult;
}) {
  const addBooksButtonRef = useRef<HTMLButtonElement>(null);
  const addManualButtonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const manualAddDialogRef = useRef<HTMLElement>(null);
  const manualAddPrimaryActionRef = useRef<HTMLButtonElement>(null);
  const manualAddDuplicateRetryRef = useRef<HTMLButtonElement>(null);
  const manualAddTitleRef = useRef<HTMLInputElement>(null);
  const manualAddTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreManualAddFocusRef = useRef(false);
  const pendingManualAddFocusIdRef = useRef<string | null>(null);
  const editDialogRef = useRef<HTMLElement>(null);
  const editPrimaryActionRef = useRef<HTMLButtonElement>(null);
  const editTitleRef = useRef<HTMLInputElement>(null);
  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreEditFocusRef = useRef(false);
  const removalDialogRef = useRef<HTMLElement>(null);
  const removalCancelRef = useRef<HTMLButtonElement>(null);
  const removalRetryRef = useRef<HTMLButtonElement>(null);
  const removalTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreRemovalFocusRef = useRef(false);
  const pendingRemovalFocusIdRef = useRef<string | null>(null);
  const pendingEmptyStateFocusRef = useRef(false);
  const [editTarget, setEditTarget] = useState<LibraryBook | null>(null);
  const [editDraft, setEditDraft] = useState<LibraryBookInput | null>(null);
  const [editAuthorInput, setEditAuthorInput] = useState("");
  const [editFailed, setEditFailed] = useState(false);
  const [manualAddDraft, setManualAddDraft] = useState<LibraryBookInput | null>(
    null,
  );
  const [manualAddAuthorInput, setManualAddAuthorInput] = useState("");
  const [manualAddReviewDraft, setManualAddReviewDraft] =
    useState<LibraryBookInput | null>(null);
  const [manualAddDuplicatePlan, setManualAddDuplicatePlan] =
    useState<DuplicateReviewPlan<ManualAddReviewCandidate> | null>(null);
  const [manualAddFailed, setManualAddFailed] = useState(false);
  const [manualAddDuplicateFailed, setManualAddDuplicateFailed] = useState(false);
  const [actionsRequireReveal] = useState(environmentSupportsHover);
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);
  const [focusedBookId, setFocusedBookId] = useState<string | null>(null);
  const [removalTarget, setRemovalTarget] = useState<LibraryBook | null>(null);
  const [removalStatus, setRemovalStatus] = useState<string | null>(null);
  const [removalFailed, setRemovalFailed] = useState(false);
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();
  const hasActiveSearch = normalizedSearchQuery !== "";
  const visibleBooks =
    !hasActiveSearch
      ? books
      : books.filter((book) => {
          const authorText = book.authorUnknown
            ? "Author unknown"
            : book.authors.join(", ");

          return (
            book.title.toLocaleLowerCase().includes(normalizedSearchQuery) ||
            authorText.toLocaleLowerCase().includes(normalizedSearchQuery)
          );
        });
  const editDuplicateCategory =
    editTarget === null || editDraft === null
      ? null
      : books
          .filter((book) => book.id !== editTarget.id)
          .reduce<"duplicate" | "possible-duplicate" | null>(
            (currentCategory, book) => {
              if (currentCategory === "duplicate") {
                return currentCategory;
              }

              const nextCategory = classifyDuplicate(
                {
                  id: editTarget.id,
                  title: editDraft.title,
                  authors: editDraft.authorUnknown ? [] : editDraft.authors,
                  authorUnknown: editDraft.authorUnknown,
                },
                book,
              );

              return nextCategory ?? currentCategory;
            },
            null,
          );

  useEffect(() => {
    if (savedCount !== undefined) {
      headingRef.current?.focus();
    }
  }, [savedCount]);

  useEffect(() => {
    if (restoreAddBooksFocus) {
      addBooksButtonRef.current?.focus();
    }
  }, [restoreAddBooksFocus]);

  useEffect(() => {
    if (manualAddDraft !== null) {
      if (manualAddFailed) {
        manualAddPrimaryActionRef.current?.focus();
      } else {
        manualAddTitleRef.current?.focus();
      }
      return;
    }

    if (restoreManualAddFocusRef.current) {
      manualAddTriggerRef.current?.focus();
      restoreManualAddFocusRef.current = false;
    }
  }, [manualAddDraft, manualAddFailed]);

  useEffect(() => {
    if (manualAddDuplicatePlan !== null && manualAddDuplicateFailed) {
      manualAddDuplicateRetryRef.current?.focus();
    }
  }, [manualAddDuplicateFailed, manualAddDuplicatePlan]);

  useEffect(() => {
    if (editTarget !== null) {
      if (editFailed) {
        editPrimaryActionRef.current?.focus();
      } else {
        editTitleRef.current?.focus();
      }
      return;
    }

    if (restoreEditFocusRef.current) {
      editTriggerRef.current?.focus();
      restoreEditFocusRef.current = false;
    }
  }, [editFailed, editTarget]);

  useEffect(() => {
    if (removalTarget !== null) {
      if (removalFailed) {
        removalRetryRef.current?.focus();
      } else {
        removalCancelRef.current?.focus();
      }
      return;
    }

    if (restoreRemovalFocusRef.current) {
      removalTriggerRef.current?.focus();
      restoreRemovalFocusRef.current = false;
    }
  }, [removalFailed, removalTarget]);

  useEffect(() => {
    if (pendingManualAddFocusIdRef.current !== null) {
      document
        .getElementById(`edit-book-${pendingManualAddFocusIdRef.current}`)
        ?.focus();
      pendingManualAddFocusIdRef.current = null;
      return;
    }

    if (pendingEmptyStateFocusRef.current && books.length === 0) {
      headingRef.current?.focus();
      pendingEmptyStateFocusRef.current = false;
      return;
    }

    if (pendingRemovalFocusIdRef.current === null) {
      return;
    }

    document
      .getElementById(`remove-book-${pendingRemovalFocusIdRef.current}`)
      ?.focus();
    pendingRemovalFocusIdRef.current = null;
  }, [books]);

  function closeRemovalDialog() {
    restoreRemovalFocusRef.current = true;
    setRemovalFailed(false);
    setRemovalTarget(null);
  }

  function openManualAddDialog(trigger: HTMLButtonElement) {
    manualAddTriggerRef.current = trigger;
    setManualAddAuthorInput("");
    setManualAddFailed(false);
    setManualAddDuplicateFailed(false);
    setManualAddDraft({
      title: "",
      authors: [],
      authorUnknown: false,
    });
  }

  function closeManualAddDialog(restoreFocus = true) {
    restoreManualAddFocusRef.current = restoreFocus;
    setManualAddAuthorInput("");
    setManualAddFailed(false);
    setManualAddDraft(null);
  }

  function requestCloseManualAddDialog() {
    if (
      manualAddDraft !== null &&
      isManualAddDraftDirty(manualAddDraft, manualAddAuthorInput) &&
      !window.confirm("Discard unsaved changes?")
    ) {
      return;
    }

    closeManualAddDialog();
  }

  function confirmManualAdd() {
    if (manualAddDraft === null) {
      return;
    }

    try {
      const latestBooks = onLoadBooks();
      const reviewCandidate = toManualAddReviewCandidate(manualAddDraft);
      const conflicts = latestBooks.flatMap((libraryBook) => {
        const category = classifyDuplicate(reviewCandidate, libraryBook);

        return category === null
          ? []
          : [{ candidate: reviewCandidate, libraryBook, category }];
      });

      if (conflicts.length > 0) {
        setManualAddFailed(false);
        setManualAddDuplicateFailed(false);
        setManualAddReviewDraft(manualAddDraft);
        setManualAddDuplicatePlan({
          candidates: [reviewCandidate],
          conflicts,
          resolutions: {},
        });
        closeManualAddDialog(false);
        return;
      }

      const result: AddHomeLibraryBookResult = onAddManualBook(manualAddDraft);
      pendingManualAddFocusIdRef.current = result.addedBook.id;
      setRemovalStatus(`“${result.addedBook.title}” added to your library.`);
      closeManualAddDialog(false);
    } catch {
      setManualAddFailed(true);
      return;
    }
  }

  function addManualAuthor() {
    const nextAuthor = manualAddAuthorInput.trim();

    if (
      manualAddDraft === null ||
      manualAddDraft.authorUnknown ||
      nextAuthor.length === 0
    ) {
      return;
    }

    setManualAddFailed(false);
    setManualAddDraft({
      ...manualAddDraft,
      authors: [...manualAddDraft.authors, nextAuthor],
    });
    setManualAddAuthorInput("");
  }

  function trapManualAddDialogFocus(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      requestCloseManualAddDialog();
      return;
    }

    if (event.key === "Tab") {
      const controls = Array.from(
        manualAddDialogRef.current?.querySelectorAll<
          HTMLButtonElement | HTMLInputElement
        >("button:not(:disabled), input:not(:disabled)") ?? [],
      );
      const firstControl = controls[0];
      const lastControl = controls.at(-1);

      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl?.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl?.focus();
        return;
      }
    }

    if (
      event.key === "Enter" &&
      document.activeElement instanceof HTMLInputElement &&
      document.activeElement.id === "manual-add-book-author-input"
    ) {
      event.preventDefault();
      addManualAuthor();
    }
  }

  function closeEditDialog(restoreFocus = true) {
    restoreEditFocusRef.current = restoreFocus;
    setEditAuthorInput("");
    setEditFailed(false);
    setEditDraft(null);
    setEditTarget(null);
  }

  function clearSearch() {
    onSearchQueryChange("");
    searchInputRef.current?.focus();
  }

  function requestCloseEditDialog() {
    if (
      editTarget !== null &&
      editDraft !== null &&
      isLibraryBookInputDirty(editTarget, editDraft) &&
      !window.confirm("Discard unsaved changes?")
    ) {
      return;
    }

    closeEditDialog();
  }

  function trapEditDialogFocus(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      requestCloseEditDialog();
      return;
    }

    if (event.key === "Tab") {
      const controls = Array.from(
        editDialogRef.current?.querySelectorAll<
          HTMLButtonElement | HTMLInputElement
        >("button:not(:disabled), input:not(:disabled)") ?? [],
      );
      const firstControl = controls[0];
      const lastControl = controls.at(-1);

      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl?.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl?.focus();
        return;
      }
    }

    if (
      event.key === "Enter" &&
      document.activeElement instanceof HTMLInputElement &&
      document.activeElement.id === "edit-book-author-input"
    ) {
      event.preventDefault();
      addEditAuthor();
    }
  }

  function addEditAuthor() {
    const nextAuthor = editAuthorInput.trim();

    if (editDraft === null || editDraft.authorUnknown || nextAuthor.length === 0) {
      return;
    }

    setEditFailed(false);
    setEditDraft({
      ...editDraft,
      authors: [...editDraft.authors, nextAuthor],
    });
    setEditAuthorInput("");
  }

  function trapRemovalDialogFocus(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeRemovalDialog();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const controls = Array.from(
      removalDialogRef.current?.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      ) ?? [],
    );
    const firstControl = controls[0];
    const lastControl = controls.at(-1);

    if (event.shiftKey && document.activeElement === firstControl) {
      event.preventDefault();
      lastControl?.focus();
    } else if (!event.shiftKey && document.activeElement === lastControl) {
      event.preventDefault();
      firstControl?.focus();
    }
  }

  function confirmRemoval() {
    if (removalTarget === null) {
      return;
    }

    const targetIndex = books.findIndex(
      (book) => book.id === removalTarget.id,
    );
    let result: RemoveHomeLibraryBookResult;
    try {
      result = onRemoveBook(removalTarget.id);
    } catch {
      setRemovalFailed(true);
      return;
    }
    const focusIndex = Math.min(
      Math.max(targetIndex, 0),
      result.books.length - 1,
    );
    pendingRemovalFocusIdRef.current = result.books[focusIndex]?.id ?? null;
    pendingEmptyStateFocusRef.current = result.books.length === 0;
    setRemovalStatus(
      result.outcome === "removed"
        ? `“${removalTarget.title}” removed from your library.`
        : `“${removalTarget.title}” is no longer in your library.`,
    );
    setRemovalTarget(null);
  }

  function confirmEdit() {
    if (editTarget === null || editDraft === null) {
      return;
    }

    let result: UpdateHomeLibraryBookResult;
    try {
      result = onEditBook(editTarget.id, editDraft);
    } catch {
      setEditFailed(true);
      return;
    }

    if (result.outcome === "already-absent") {
      const targetIndex = books.findIndex((book) => book.id === editTarget.id);
      const focusIndex = Math.min(
        Math.max(targetIndex, 0),
        result.books.length - 1,
      );
      pendingRemovalFocusIdRef.current = result.books[focusIndex]?.id ?? null;
      pendingEmptyStateFocusRef.current = result.books.length === 0;
    }

    setRemovalStatus(
      result.outcome === "updated"
        ? `“${editDraft.title.trim() || editTarget.title}” was updated.`
        : `“${editTarget.title}” is no longer in your library.`,
    );
    closeEditDialog(result.outcome !== "already-absent");
  }

  function continueManualAddDuplicateReview(
    candidates: ManualAddReviewCandidate[],
  ) {
    if (manualAddReviewDraft === null || candidates.length === 0) {
      return;
    }

    try {
      const result = onAddManualBook(manualAddReviewDraft);
      pendingManualAddFocusIdRef.current = result.addedBook.id;
      setRemovalStatus(`“${result.addedBook.title}” added to your library.`);
      setManualAddDuplicateFailed(false);
      setManualAddDuplicatePlan(null);
      setManualAddReviewDraft(null);
    } catch {
      setManualAddDuplicateFailed(true);
      return;
    }
  }

  function renderManualAddDialog() {
    if (manualAddDraft === null) {
      return null;
    }

    return (
      <div className="remove-dialog-backdrop">
        <section
          ref={manualAddDialogRef}
          className="remove-dialog edit-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-add-dialog-title"
          onKeyDown={trapManualAddDialogFocus}
        >
          <header>
            <h2 id="manual-add-dialog-title">Add a book manually</h2>
            <button
              type="button"
              aria-label="Close manual add dialog"
              onClick={requestCloseManualAddDialog}
            >
              <X aria-hidden="true" />
            </button>
          </header>
          <div className="remove-dialog-body edit-dialog-body">
            <div className="edit-dialog-field">
              <label htmlFor="manual-add-book-title">
                Title <span aria-hidden="true">*</span>
              </label>
              <input
                ref={manualAddTitleRef}
                id="manual-add-book-title"
                className="edit-dialog-input"
                value={manualAddDraft.title}
                onChange={(event) => {
                  setManualAddDraft((current) =>
                    current === null
                      ? current
                      : { ...current, title: event.target.value },
                  );
                  setManualAddFailed(false);
                }}
              />
            </div>
            <div className="edit-dialog-field">
              <label htmlFor="manual-add-book-author-input">Author(s)</label>
              {manualAddDraft.authors.length === 0 ? null : (
                <div className="edit-dialog-chip-list">
                  {manualAddDraft.authors.map((author, index) => (
                    <span className="edit-dialog-chip" key={`${author}-${index}`}>
                      {author}
                      <button
                        type="button"
                        className="edit-dialog-chip-remove"
                        aria-label={`Remove author ${author}`}
                        disabled={manualAddDraft.authorUnknown}
                        onClick={() => {
                          setManualAddFailed(false);
                          setManualAddDraft((current) =>
                            current === null
                              ? current
                              : {
                                  ...current,
                                  authors: current.authors.filter(
                                    (_currentAuthor, authorIndex) =>
                                      authorIndex !== index,
                                  ),
                                },
                          );
                        }}
                      >
                        <X aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="edit-dialog-author-row">
                <input
                  id="manual-add-book-author-input"
                  aria-label="Author name"
                  className="edit-dialog-input"
                  placeholder="Type a name and press Enter…"
                  value={manualAddAuthorInput}
                  disabled={manualAddDraft.authorUnknown}
                  onChange={(event) => {
                    setManualAddFailed(false);
                    setManualAddAuthorInput(event.target.value);
                  }}
                />
                <button
                  type="button"
                  className="edit-dialog-add-author"
                  aria-label="Add author"
                  disabled={
                    manualAddDraft.authorUnknown ||
                    manualAddAuthorInput.trim().length === 0
                  }
                  onClick={addManualAuthor}
                >
                  Add
                </button>
              </div>
            </div>
            <label className="edit-dialog-checkbox">
              <input
                type="checkbox"
                checked={manualAddDraft.authorUnknown}
                onChange={(event) => {
                  setManualAddFailed(false);
                  setManualAddDraft((current) =>
                    current === null
                      ? current
                      : {
                          ...current,
                          authorUnknown: event.target.checked,
                        },
                  );
                }}
              />
              Author unknown
            </label>
            {manualAddFailed ? (
              <p className="message message-error" role="alert">
                “{manualAddDraft.title.trim()}” was not added.
              </p>
            ) : null}
            <div className="remove-dialog-actions edit-dialog-actions">
              <button
                ref={manualAddPrimaryActionRef}
                className="primary-button"
                type="button"
                disabled={!isLibraryBookInputValid(manualAddDraft)}
                onClick={confirmManualAdd}
              >
                {manualAddFailed ? "Retry" : "Add to library"}
              </button>
              <button
                className="text-button"
                type="button"
                onClick={requestCloseManualAddDialog}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="empty-library-shell">
          <BookOpen aria-hidden="true" />
          <h1 ref={headingRef} tabIndex={-1}>Your library is empty</h1>
          {removalStatus === null ? null : (
            <p className="message message-neutral" role="status">
              {removalStatus}
            </p>
          )}
          <p>
            Add books to start cataloging your home library. Confirmed books
            stay on this device — no account needed.
          </p>
          <p className="empty-library-privacy">
            <HardDrive aria-hidden="true" />
            Your data never leaves this browser.
          </p>
          <button
            ref={addBooksButtonRef}
            className="primary-button"
            type="button"
            onClick={onAddBooks}
          >
            <Upload aria-hidden="true" />
            Add books from a photo
          </button>
          <button
            ref={addManualButtonRef}
            className="secondary-button"
            type="button"
            onClick={(event) => openManualAddDialog(event.currentTarget)}
          >
            Add manually
          </button>
        </main>
        {renderManualAddDialog()}
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="home-library-shell">
        <div className="home-library-heading">
          <div className="home-library-heading-copy">
            <h1 ref={headingRef} tabIndex={-1}>Home Library</h1>
            <p>
              {books.length} {books.length === 1 ? "book" : "books"}
            </p>
          </div>
          <div className="home-library-header-actions">
            <div className="home-library-search">
              <label className="sr-only" htmlFor="search-saved-books">
                Search saved books
              </label>
              <div className="home-library-search-field">
                <Search aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  id="search-saved-books"
                  type="search"
                  name="search-saved-books"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                />
                {hasActiveSearch ? (
                  <button
                    className="home-library-search-clear"
                    type="button"
                    aria-label="Clear search query"
                    onClick={clearSearch}
                  >
                    <X aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
            <button
              ref={addManualButtonRef}
              className="secondary-button"
              type="button"
              onClick={(event) => openManualAddDialog(event.currentTarget)}
            >
              <Plus aria-hidden="true" />
              Add manually
            </button>
            <button
              ref={addBooksButtonRef}
              className="primary-button"
              type="button"
              onClick={onAddBooks}
            >
              <Upload aria-hidden="true" />
              Add from photo
            </button>
          </div>
        </div>
        {removalStatus !== null ? (
          <p className="message message-neutral" role="status">
            {removalStatus}
          </p>
        ) : savedCount === undefined ? null : (
          <p className="message message-neutral" role="status">
            {savedCount} {savedCount === 1 ? "book" : "books"} saved.
          </p>
        )}
        {manualAddDuplicatePlan !== null ? (
          <>
            {manualAddDuplicateFailed && manualAddReviewDraft !== null ? (
              <div className="message message-error" role="alert">
                <p>“{manualAddReviewDraft.title.trim()}” was not added.</p>
                <button
                  ref={manualAddDuplicateRetryRef}
                  className="text-button"
                  type="button"
                  onClick={() =>
                    continueManualAddDuplicateReview(
                      getResolvedManualAddCandidates(manualAddDuplicatePlan),
                    )
                  }
                >
                  Retry
                </button>
              </div>
            ) : null}
            <DuplicateReview
              candidateLabel="Manual Add draft"
              plan={manualAddDuplicatePlan}
              onBack={() => {
                setManualAddDuplicateFailed(false);
                setManualAddDuplicatePlan(null);
                if (manualAddReviewDraft !== null) {
                  setManualAddDraft(manualAddReviewDraft);
                }
                setManualAddReviewDraft(null);
              }}
              onResolve={(conflict, resolution) =>
                {
                  setManualAddDuplicateFailed(false);
                  setManualAddDuplicatePlan((current) =>
                    current === null
                      ? null
                      : {
                          ...current,
                          resolutions: {
                            ...current.resolutions,
                            [duplicateConflictKey(conflict)]: resolution,
                          },
                        },
                  );
                }
              }
              onContinue={continueManualAddDuplicateReview}
            />
          </>
        ) : visibleBooks.length === 0 ? (
          <section className="home-library-no-results" aria-live="polite">
            <Search aria-hidden="true" />
            <h2>{`No results for "${searchQuery}"`}</h2>
            <p>Try a different title or author name.</p>
            <button className="text-button" type="button" onClick={clearSearch}>
              Clear search
            </button>
          </section>
        ) : (
          <ul className="home-library-list" aria-label="Saved books">
            {visibleBooks.map((book, index) => {
              const actionsVisible =
                !actionsRequireReveal ||
                hoveredBookId === book.id ||
                focusedBookId === book.id;

              return (
              <li
                key={book.id}
                onMouseEnter={() => {
                  if (actionsRequireReveal) {
                    setHoveredBookId(book.id);
                  }
                }}
                onMouseLeave={() => {
                  if (actionsRequireReveal) {
                    setHoveredBookId((currentId) =>
                      currentId === book.id ? null : currentId,
                    );
                  }
                }}
                onFocusCapture={() => {
                  if (actionsRequireReveal) {
                    setFocusedBookId(book.id);
                  }
                }}
                onBlurCapture={(event) => {
                  if (
                    actionsRequireReveal &&
                    !event.currentTarget.contains(
                      event.relatedTarget as Node | null,
                    )
                  ) {
                    setFocusedBookId((currentId) =>
                      currentId === book.id ? null : currentId,
                    );
                  }
                }}
              >
                <div
                  aria-hidden="true"
                  className={`home-library-book-cover home-library-book-cover-${index % 4}`}
                  data-title={book.title}
                  data-author={
                    book.authorUnknown ? "Unknown author" : book.authors.join(", ")
                  }
                />
                <div className="home-library-book-copy">
                  <strong className="home-library-book-title">{book.title}</strong>
                  <span className="home-library-book-author">
                    {book.authorUnknown
                      ? "Author unknown"
                      : book.authors.join(", ")}
                  </span>
                </div>
                <div
                  className="home-library-book-actions"
                  style={
                    actionsRequireReveal && !actionsVisible
                      ? { opacity: 0, pointerEvents: "none" }
                      : { opacity: 1, pointerEvents: "auto" }
                  }
                >
                  <button
                    id={`edit-book-${book.id}`}
                    className="edit-book-action"
                    type="button"
                    aria-label={`Edit ${book.title}`}
                    onClick={(event) => {
                      editTriggerRef.current = event.currentTarget;
                      setEditTarget(book);
                      setEditDraft({
                        title: book.title,
                        authors: [...book.authors],
                        authorUnknown: book.authorUnknown,
                      });
                      setEditAuthorInput("");
                      setEditFailed(false);
                    }}
                  >
                    <Pencil aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    id={`remove-book-${book.id}`}
                    className="remove-book-action"
                    type="button"
                    aria-label={`Remove ${book.title}`}
                    onClick={(event) => {
                      removalTriggerRef.current = event.currentTarget;
                      setRemovalFailed(false);
                      setRemovalStatus(null);
                      setRemovalTarget(book);
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </li>
            )})}
          </ul>
        )}
        {editTarget === null || editDraft === null ? null : (
          <div className="remove-dialog-backdrop">
            <section
              ref={editDialogRef}
              className="remove-dialog edit-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-dialog-title"
              onKeyDown={trapEditDialogFocus}
            >
              <header>
                <h2 id="edit-dialog-title">Edit book</h2>
                <button
                  type="button"
                  aria-label="Close edit dialog"
                  onClick={requestCloseEditDialog}
                >
                  <X aria-hidden="true" />
                </button>
              </header>
              <div className="remove-dialog-body edit-dialog-body">
                <div className="edit-dialog-field">
                  <label htmlFor="edit-book-title">
                    Title <span aria-hidden="true">*</span>
                  </label>
                <input
                  ref={editTitleRef}
                  id="edit-book-title"
                  className="edit-dialog-input"
                  value={editDraft.title}
                  onChange={(event) => {
                    setEditFailed(false);
                    setEditDraft((current) =>
                      current === null
                        ? current
                        : { ...current, title: event.target.value },
                    );
                  }}
                />
                </div>
                <div className="edit-dialog-field">
                  <label htmlFor="edit-book-author-input">Author(s)</label>
                  {editDraft.authors.length === 0 ? null : (
                    <div className="edit-dialog-chip-list">
                      {editDraft.authors.map((author, index) => (
                        <span className="edit-dialog-chip" key={`${author}-${index}`}>
                          {author}
                          <button
                            type="button"
                            className="edit-dialog-chip-remove"
                            aria-label={`Remove author ${author}`}
                            disabled={editDraft.authorUnknown}
                            onClick={() => {
                              setEditFailed(false);
                              setEditDraft((current) =>
                                current === null
                                  ? current
                                  : {
                                      ...current,
                                      authors: current.authors.filter(
                                        (_currentAuthor, authorIndex) =>
                                          authorIndex !== index,
                                      ),
                                    },
                              );
                            }}
                          >
                            <X aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="edit-dialog-author-row">
                    <input
                      id="edit-book-author-input"
                      aria-label="Author name"
                      className="edit-dialog-input"
                      placeholder="Type a name and press Enter…"
                      value={editAuthorInput}
                      disabled={editDraft.authorUnknown}
                      onChange={(event) => {
                        setEditFailed(false);
                        setEditAuthorInput(event.target.value);
                      }}
                    />
                    <button
                      type="button"
                      className="edit-dialog-add-author"
                      aria-label="Add author"
                      disabled={
                        editDraft.authorUnknown ||
                        editAuthorInput.trim().length === 0
                      }
                      onClick={addEditAuthor}
                    >
                      Add
                    </button>
                  </div>
                </div>
                <label className="edit-dialog-checkbox">
                  <input
                    type="checkbox"
                    checked={editDraft.authorUnknown}
                    onChange={(event) => {
                      setEditFailed(false);
                      setEditDraft((current) =>
                        current === null
                          ? current
                          : {
                              ...current,
                              authorUnknown: event.target.checked,
                            },
                      );
                    }}
                  />
                  Author unknown
                </label>
                {editFailed ? (
                  <p className="message message-error" role="alert">
                    “{editTarget.title}” was not updated.
                  </p>
                ) : null}
                {editDuplicateCategory === "duplicate" ? (
                  <p className="message message-error" role="alert">
                    Duplicate: another saved book already matches this title and
                    author.
                  </p>
                ) : editDuplicateCategory === "possible-duplicate" ? (
                  <p className="message message-neutral" role="status">
                    Possible duplicate: another saved book already has this
                    title.
                  </p>
                ) : null}
                <div className="remove-dialog-actions edit-dialog-actions">
                  <button
                    ref={editPrimaryActionRef}
                    className="primary-button"
                    type="button"
                    onClick={confirmEdit}
                    disabled={
                      editDuplicateCategory === "duplicate" ||
                      !isLibraryBookInputDirty(editTarget, editDraft) ||
                      !isLibraryBookInputValid(editDraft)
                    }
                  >
                    {editFailed ? "Retry" : "Save changes"}
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    onClick={requestCloseEditDialog}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
        {renderManualAddDialog()}
        {removalTarget === null ? null : (
          <div className="remove-dialog-backdrop">
            <section
              ref={removalDialogRef}
              className="remove-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="remove-dialog-title"
              onKeyDown={trapRemovalDialogFocus}
            >
              <header>
                <h2 id="remove-dialog-title">Remove book</h2>
                <button
                  type="button"
                  aria-label="Close remove dialog"
                  onClick={closeRemovalDialog}
                >
                  <X aria-hidden="true" />
                </button>
              </header>
              <div className="remove-dialog-body">
                <p>
                  Remove <strong>{removalTarget.title}</strong> by{" "}
                  <span>{displayLibraryBookAuthors(removalTarget)}</span> from
                  your library?
                </p>
                <p className="remove-dialog-warning">This cannot be undone.</p>
                {removalFailed ? (
                  <p className="message message-error" role="alert">
                    “{removalTarget.title}” was not removed.
                  </p>
                ) : null}
                <div className="remove-dialog-actions">
                  <button
                    ref={removalRetryRef}
                    className="destructive-button"
                    type="button"
                    onClick={confirmRemoval}
                  >
                    {removalFailed ? null : <Trash2 aria-hidden="true" />}
                    {removalFailed ? "Retry" : "Remove"}
                  </button>
                  <button
                    ref={removalCancelRef}
                    className="text-button"
                    type="button"
                    onClick={closeRemovalDialog}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

function displayLibraryBookAuthors(book: LibraryBook): string {
  return book.authorUnknown || book.authors.length === 0
    ? "Author unknown"
    : book.authors.join(", ");
}

function isLibraryBookInputDirty(
  original: LibraryBook,
  draft: LibraryBookInput,
): boolean {
  return (
    original.title !== draft.title ||
    original.authorUnknown !== draft.authorUnknown ||
    original.authors.length !== draft.authors.length ||
    original.authors.some((author, index) => author !== draft.authors[index])
  );
}

function isLibraryBookInputValid(draft: LibraryBookInput): boolean {
  return (
    draft.title.trim().length > 0 &&
    (draft.authorUnknown ||
      draft.authors.some((author) => author.trim().length > 0))
  );
}

function isManualAddDraftDirty(
  draft: LibraryBookInput,
  authorInput: string,
): boolean {
  return (
    draft.title.length > 0 ||
    draft.authorUnknown ||
    draft.authors.length > 0 ||
    authorInput.length > 0
  );
}

function toManualAddReviewCandidate(
  draft: LibraryBookInput,
): ManualAddReviewCandidate {
  return {
    id: MANUAL_ADD_DRAFT_ID,
    title: draft.title,
    authors: draft.authorUnknown ? [] : draft.authors,
    authorUnknown: draft.authorUnknown,
  };
}

function getResolvedManualAddCandidates(
  plan: DuplicateReviewPlan<ManualAddReviewCandidate>,
): ManualAddReviewCandidate[] {
  return plan.candidates.filter((candidate) => {
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
}
