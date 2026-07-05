"use client";

import { BookOpen, HardDrive, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  PhotoExtractionForm,
  SiteHeader,
} from "../photo-extraction/photo-extraction-form";
import {
  loadHomeLibrary,
  removeHomeLibraryBook,
  saveHomeLibrary,
  type HomeLibraryStorage,
  type LibraryBook,
  type RemoveHomeLibraryBookResult,
} from "../../lib/home-library/storage";

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
      restoreAddBooksFocus={state.restoreAddBooksFocus}
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
  restoreAddBooksFocus = false,
  onAddBooks,
  onRemoveBook,
}: {
  books: LibraryBook[];
  savedCount?: number;
  restoreAddBooksFocus?: boolean;
  onAddBooks: () => void;
  onRemoveBook: (targetId: string) => RemoveHomeLibraryBookResult;
}) {
  const addBooksButtonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const removalDialogRef = useRef<HTMLElement>(null);
  const removalCancelRef = useRef<HTMLButtonElement>(null);
  const removalRetryRef = useRef<HTMLButtonElement>(null);
  const removalTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreRemovalFocusRef = useRef(false);
  const pendingRemovalFocusIdRef = useRef<string | null>(null);
  const pendingEmptyStateFocusRef = useRef(false);
  const [removalTarget, setRemovalTarget] = useState<LibraryBook | null>(null);
  const [removalStatus, setRemovalStatus] = useState<string | null>(null);
  const [removalFailed, setRemovalFailed] = useState(false);

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
            <Plus aria-hidden="true" />
            Add books
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="home-library-shell">
        <div className="home-library-heading">
          <div>
            <h1 ref={headingRef} tabIndex={-1}>Home Library</h1>
            <p>
              {books.length} {books.length === 1 ? "book" : "books"}
            </p>
          </div>
          <button
            ref={addBooksButtonRef}
            className="primary-button"
            type="button"
            onClick={onAddBooks}
          >
            <Plus aria-hidden="true" />
            Add books
          </button>
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
        <ul className="home-library-list" aria-label="Saved books">
          {books.map((book) => (
            <li key={book.id}>
              <div className="home-library-book-copy">
                <strong>{book.title}</strong>
                <span>
                  {book.authorUnknown
                    ? "Author unknown"
                    : book.authors.join(", ")}
                </span>
              </div>
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
            </li>
          ))}
        </ul>
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
