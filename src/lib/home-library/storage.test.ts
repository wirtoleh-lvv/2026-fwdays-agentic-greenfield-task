import { describe, expect, it, vi } from "vitest";
import {
  HOME_LIBRARY_STORAGE_KEY,
  loadHomeLibrary,
} from "./storage";

describe("Home Library browser-storage boundary", () => {
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
});
