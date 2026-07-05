"use client";

import { BookOpen, HardDrive, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PhotoExtractionForm,
  SiteHeader,
} from "../photo-extraction/photo-extraction-form";
import {
  loadHomeLibrary,
  saveHomeLibrary,
  type HomeLibraryStorage,
  type LibraryBook,
} from "../../lib/home-library/storage";

type AppState =
  | { kind: "loading" }
  | { kind: "home"; books: LibraryBook[]; savedCount?: number }
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
      onAddBooks={() =>
        setState({ kind: "photo-extraction", books: state.books })
      }
    />
  );
}

function HomeLibrary({
  books,
  savedCount,
  onAddBooks,
}: {
  books: LibraryBook[];
  savedCount?: number;
  onAddBooks: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (savedCount !== undefined) {
      headingRef.current?.focus();
    }
  }, [savedCount]);

  if (books.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="empty-library-shell">
          <BookOpen aria-hidden="true" />
          <h1>Your library is empty</h1>
          <p>
            Add books to start cataloging your home library. Confirmed books
            stay on this device — no account needed.
          </p>
          <p className="empty-library-privacy">
            <HardDrive aria-hidden="true" />
            Your data never leaves this browser.
          </p>
          <button className="primary-button" type="button" onClick={onAddBooks}>
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
          <button className="primary-button" type="button" onClick={onAddBooks}>
            <Plus aria-hidden="true" />
            Add books
          </button>
        </div>
        {savedCount === undefined ? null : (
          <p className="message message-neutral" role="status">
            {savedCount} {savedCount === 1 ? "book" : "books"} saved.
          </p>
        )}
        <ul className="home-library-list" aria-label="Saved books">
          {books.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong>
              <span>
                {book.authorUnknown ? "Author unknown" : book.authors.join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
