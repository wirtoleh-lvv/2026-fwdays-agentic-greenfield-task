import { describe, expect, it, vi } from "vitest";
import {
  HOME_LIBRARY_STORAGE_KEY,
  loadHomeLibrary,
  removeHomeLibraryBook,
  updateHomeLibraryBook,
} from "./storage";

describe("Home Library browser-storage boundary", () => {
  it("FR-FAIL-004 exposes removal read and write failures as retryable without destructive replacement", () => {
    const unreadableValue = "not json";
    const unreadableStorage = {
      getItem: vi.fn().mockReturnValue(unreadableValue),
      setItem: vi.fn(),
    };

    expect(() =>
      removeHomeLibraryBook(unreadableStorage, "book-target"),
    ).toThrowError(
      expect.objectContaining({
        name: "HomeLibraryLoadError",
        retryable: true,
      }),
    );
    expect(unreadableStorage.setItem).not.toHaveBeenCalled();
    expect(unreadableStorage.getItem()).toBe(unreadableValue);

    const target = {
      id: "book-target",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const storedValue = JSON.stringify({ version: 1, books: [target] });
    const unavailableWriteStorage = {
      getItem: vi.fn().mockReturnValue(storedValue),
      setItem: vi.fn(() => {
        throw new DOMException("Storage full", "QuotaExceededError");
      }),
    };

    expect(() =>
      removeHomeLibraryBook(unavailableWriteStorage, target.id),
    ).toThrowError(
      expect.objectContaining({
        name: "HomeLibraryWriteError",
        retryable: true,
      }),
    );
    expect(unavailableWriteStorage.setItem).toHaveBeenCalledTimes(1);
    expect(unavailableWriteStorage.getItem()).toBe(storedValue);
  });

  it("FR-LIB-005 TC-STORAGE-001 returns the latest collection without writing when the target is already absent", () => {
    const latestBooks = [
      {
        id: "book-still-present",
        title: "Kindred",
        authors: ["Octavia E. Butler"],
        authorUnknown: false,
      },
    ];
    const storage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ version: 1, books: latestBooks }),
      ),
      setItem: vi.fn(),
    };

    expect(removeHomeLibraryBook(storage, "book-already-removed")).toEqual({
      outcome: "already-absent",
      books: latestBooks,
    });
    expect(storage.getItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("FR-LIB-005 NFR-PRIV-001 TC-STORAGE-001 TC-STORAGE-002 removes only the stable target from the latest collection with one complete write", () => {
    const target = {
      id: "book-target",
      title: "The Left Hand of Darkness",
      authors: ["Ursula K. Le Guin"],
      authorUnknown: false,
    };
    const freshlyAddedBook = {
      id: "book-added-in-another-tab",
      title: "Ancillary Justice",
      authors: ["Ann Leckie"],
      authorUnknown: false,
    };
    const storedValue = JSON.stringify({
      version: 1,
      books: [target, freshlyAddedBook],
    });
    const storage = {
      getItem: vi.fn().mockReturnValue(storedValue),
      setItem: vi.fn(),
    };

    expect(removeHomeLibraryBook(storage, target.id)).toEqual({
      outcome: "removed",
      books: [freshlyAddedBook],
    });
    expect(storage.getItem).toHaveBeenCalledTimes(1);
    expect(storage.getItem).toHaveBeenCalledWith(HOME_LIBRARY_STORAGE_KEY);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      HOME_LIBRARY_STORAGE_KEY,
      JSON.stringify({ version: 1, books: [freshlyAddedBook] }),
    );
  });

  it("FR-LIB-004 TC-STORAGE-001 returns the latest collection without writing when an edited target is already absent", () => {
    const latestBooks = [
      {
        id: "book-still-present",
        title: "Beloved",
        authors: ["Toni Morrison"],
        authorUnknown: false,
      },
    ];
    const storage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ version: 1, books: latestBooks }),
      ),
      setItem: vi.fn(),
    };

    expect(
      updateHomeLibraryBook(storage, "book-already-removed", {
        title: "Kindred Revised",
        authors: ["Octavia E. Butler"],
        authorUnknown: false,
      }),
    ).toEqual({
      outcome: "already-absent",
      books: latestBooks,
    });
    expect(storage.getItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("FR-LIB-004 NFR-PRIV-001 TC-STORAGE-001 TC-STORAGE-002 updates only the stable target from the latest collection with one complete write", () => {
    const target = {
      id: "book-target",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const freshlyAddedBook = {
      id: "book-added-in-another-tab",
      title: "Piranesi",
      authors: ["Susanna Clarke"],
      authorUnknown: false,
    };
    const storedValue = JSON.stringify({
      version: 1,
      books: [target, freshlyAddedBook],
    });
    const storage = {
      getItem: vi.fn().mockReturnValue(storedValue),
      setItem: vi.fn(),
    };

    expect(
      updateHomeLibraryBook(storage, target.id, {
        title: "Kindred Revised",
        authors: ["Octavia E. Butler"],
        authorUnknown: false,
      }),
    ).toEqual({
      outcome: "updated",
      books: [
        {
          ...target,
          title: "Kindred Revised",
        },
        freshlyAddedBook,
      ],
    });
    expect(storage.getItem).toHaveBeenCalledTimes(1);
    expect(storage.getItem).toHaveBeenCalledWith(HOME_LIBRARY_STORAGE_KEY);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      HOME_LIBRARY_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        books: [
          {
            ...target,
            title: "Kindred Revised",
          },
          freshlyAddedBook,
        ],
      }),
    );
  });

  it("FR-LIB-002 FR-LIB-003 NFR-PRIV-001 TC-STORAGE-001 TC-STORAGE-002 loads a missing key as empty and a valid versioned collection in full", () => {
    const missingStorage = {
      getItem: vi.fn().mockReturnValue(null),
    };

    expect(loadHomeLibrary(missingStorage)).toEqual([]);
    expect(missingStorage.getItem).toHaveBeenCalledWith(
      HOME_LIBRARY_STORAGE_KEY,
    );

    const books = [
      {
        id: "book-1",
        title: "The Left Hand of Darkness",
        authors: ["Ursula K. Le Guin"],
        authorUnknown: false,
      },
      {
        id: "book-2",
        title: "Ancillary Justice",
        authors: [],
        authorUnknown: true,
      },
    ];
    const populatedStorage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ version: 1, books }),
      ),
    };

    expect(loadHomeLibrary(populatedStorage)).toEqual(books);
    expect(populatedStorage.getItem).toHaveBeenCalledWith(
      HOME_LIBRARY_STORAGE_KEY,
    );
  });

  it("FR-FAIL-004 exposes invalid or unavailable storage as retryable without overwriting it", () => {
    const invalidValues = [
      "not json",
      JSON.stringify({ version: 2, books: [] }),
      JSON.stringify({
        version: 1,
        books: [
          {
            id: "book-1",
            title: "Kindred",
            authors: "Octavia E. Butler",
            authorUnknown: false,
          },
        ],
      }),
    ];

    for (const invalidValue of invalidValues) {
      let storedValue = invalidValue;
      const storage = {
        getItem: vi.fn(() => storedValue),
        setItem: vi.fn((_key: string, value: string) => {
          storedValue = value;
        }),
      };

      expect(() => loadHomeLibrary(storage)).toThrowError(
        expect.objectContaining({
          name: "HomeLibraryLoadError",
          retryable: true,
        }),
      );
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storedValue).toBe(invalidValue);
    }

    const unavailableStorage = {
      getItem: vi.fn(() => {
        throw new DOMException("Storage unavailable", "SecurityError");
      }),
      setItem: vi.fn(),
    };

    expect(() => loadHomeLibrary(unavailableStorage)).toThrowError(
      expect.objectContaining({
        name: "HomeLibraryLoadError",
        retryable: true,
      }),
    );
    expect(unavailableStorage.setItem).not.toHaveBeenCalled();
  });

  it("FR-LIB-004 FR-FAIL-004 exposes edit read and write failures as retryable without destructive replacement", () => {
    const unreadableValue = "not json";
    const unreadableStorage = {
      getItem: vi.fn().mockReturnValue(unreadableValue),
      setItem: vi.fn(),
    };

    expect(() =>
      updateHomeLibraryBook(unreadableStorage, "book-target", {
        title: "Kindred Revised",
        authors: ["Octavia E. Butler"],
        authorUnknown: false,
      }),
    ).toThrowError(
      expect.objectContaining({
        name: "HomeLibraryLoadError",
        retryable: true,
      }),
    );
    expect(unreadableStorage.setItem).not.toHaveBeenCalled();
    expect(unreadableStorage.getItem()).toBe(unreadableValue);

    const target = {
      id: "book-target",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const storedValue = JSON.stringify({ version: 1, books: [target] });
    const unavailableWriteStorage = {
      getItem: vi.fn().mockReturnValue(storedValue),
      setItem: vi.fn(() => {
        throw new DOMException("Storage full", "QuotaExceededError");
      }),
    };

    expect(() =>
      updateHomeLibraryBook(unavailableWriteStorage, target.id, {
        title: "Kindred Revised",
        authors: ["Octavia E. Butler"],
        authorUnknown: false,
      }),
    ).toThrowError(
      expect.objectContaining({
        name: "HomeLibraryWriteError",
        retryable: true,
      }),
    );
    expect(unavailableWriteStorage.setItem).toHaveBeenCalledTimes(1);
    expect(unavailableWriteStorage.getItem).toHaveBeenCalledTimes(1);
  });
});
