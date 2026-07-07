export const HOME_LIBRARY_STORAGE_KEY = "librarian.home-library.v1";

export type LibraryBook = {
  id: string;
  title: string;
  authors: string[];
  authorUnknown: boolean;
};

export type HomeLibraryStorage = Pick<Storage, "getItem"> &
  Partial<Pick<Storage, "setItem">>;

export type LibraryBookInput = Omit<LibraryBook, "id">;

export type RemoveHomeLibraryBookResult = {
  outcome: "removed" | "already-absent";
  books: LibraryBook[];
};

export type AddHomeLibraryBookResult = {
  addedBook: LibraryBook;
  books: LibraryBook[];
};

export type UpdateHomeLibraryBookResult = {
  outcome: "updated" | "already-absent";
  books: LibraryBook[];
};

export class HomeLibraryLoadError extends Error {
  readonly retryable = true;

  constructor(options?: ErrorOptions) {
    super("Home Library could not be loaded.", options);
    this.name = "HomeLibraryLoadError";
  }
}

export class HomeLibraryWriteError extends Error {
  readonly retryable = true;

  constructor(options?: ErrorOptions) {
    super("Home Library could not be updated.", options);
    this.name = "HomeLibraryWriteError";
  }
}

type HomeLibraryEnvelope = {
  version: 1;
  books: LibraryBook[];
};

export function loadHomeLibrary(storage: HomeLibraryStorage): LibraryBook[] {
  try {
    const storedValue = storage.getItem(HOME_LIBRARY_STORAGE_KEY);

    if (storedValue === null) {
      return [];
    }

    const envelope: unknown = JSON.parse(storedValue);

    if (!isHomeLibraryEnvelope(envelope)) {
      throw new HomeLibraryLoadError();
    }

    return envelope.books;
  } catch (error) {
    if (error instanceof HomeLibraryLoadError) {
      throw error;
    }

    throw new HomeLibraryLoadError({ cause: error });
  }
}

export function saveHomeLibrary(
  storage: HomeLibraryStorage,
  existingBooks: LibraryBook[],
  candidates: LibraryBookInput[],
  createId: () => string,
): LibraryBook[] {
  if (storage.setItem === undefined) {
    throw new TypeError("Home Library storage is not writable");
  }

  const books = [
    ...existingBooks,
    ...candidates.map((candidate) => ({
      id: createId(),
      ...candidate,
    })),
  ];
  storage.setItem(
    HOME_LIBRARY_STORAGE_KEY,
    JSON.stringify({ version: 1, books }),
  );
  return books;
}

export function addHomeLibraryBook(
  storage: HomeLibraryStorage,
  draft: LibraryBookInput,
  createId: () => string,
): AddHomeLibraryBookResult {
  const latestBooks = loadHomeLibrary(storage);

  if (storage.setItem === undefined) {
    throw new HomeLibraryWriteError();
  }

  const addedBook = {
    id: createId(),
    ...draft,
  };
  const books = [...latestBooks, addedBook];

  try {
    storage.setItem(
      HOME_LIBRARY_STORAGE_KEY,
      JSON.stringify({ version: 1, books }),
    );
  } catch (error) {
    throw new HomeLibraryWriteError({ cause: error });
  }

  return { addedBook, books };
}

export function removeHomeLibraryBook(
  storage: HomeLibraryStorage,
  targetId: string,
): RemoveHomeLibraryBookResult {
  const latestBooks = loadHomeLibrary(storage);

  if (!latestBooks.some((book) => book.id === targetId)) {
    return { outcome: "already-absent", books: latestBooks };
  }

  if (storage.setItem === undefined) {
    throw new HomeLibraryWriteError();
  }

  const books = latestBooks.filter((book) => book.id !== targetId);
  try {
    storage.setItem(
      HOME_LIBRARY_STORAGE_KEY,
      JSON.stringify({ version: 1, books }),
    );
  } catch (error) {
    throw new HomeLibraryWriteError({ cause: error });
  }
  return { outcome: "removed", books };
}

export function updateHomeLibraryBook(
  storage: HomeLibraryStorage,
  targetId: string,
  updates: LibraryBookInput,
): UpdateHomeLibraryBookResult {
  const latestBooks = loadHomeLibrary(storage);

  if (!latestBooks.some((book) => book.id === targetId)) {
    return { outcome: "already-absent", books: latestBooks };
  }

  if (storage.setItem === undefined) {
    throw new HomeLibraryWriteError();
  }

  const books = latestBooks.map((book) =>
    book.id === targetId ? { ...book, ...updates } : book,
  );
  try {
    storage.setItem(
      HOME_LIBRARY_STORAGE_KEY,
      JSON.stringify({ version: 1, books }),
    );
  } catch (error) {
    throw new HomeLibraryWriteError({ cause: error });
  }
  return { outcome: "updated", books };
}

function isHomeLibraryEnvelope(value: unknown): value is HomeLibraryEnvelope {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.books)) {
    return false;
  }

  return value.books.every(isLibraryBook);
}

function isLibraryBook(value: unknown): value is LibraryBook {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    Array.isArray(value.authors) &&
    value.authors.every((author) => typeof author === "string") &&
    typeof value.authorUnknown === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
