import { describe, expect, it } from "vitest";
import type { LibraryBook } from "./storage";
import { classifyDuplicate, type DuplicateCandidate } from "./duplicate-classifier";

describe("deterministic duplicate classification", () => {
  it("FR-DUP-001 FR-DUP-002 FR-DUP-003 normalizes case, whitespace, and author order while retaining punctuation and diacritics", () => {
    const existing: LibraryBook = {
      id: "book-1",
      title: "The Left Hand of Darkness",
      authors: ["Ursula K. Le Guin", "N. K. Jemisin"],
      authorUnknown: false,
    };

    expect(
      classifyDuplicate(
        candidate("  THE   left hand OF darkness  ", [
          " n. k. jemisin ",
          "URSULA K. LE GUIN",
        ]),
        existing,
      ),
    ).toBe("duplicate");

    expect(
      classifyDuplicate(
        candidate("the left hand of darkness", ["Another Author"]),
        existing,
      ),
    ).toBe("possible-duplicate");

    expect(
      classifyDuplicate(
        candidate("the left hand of darkness", [], true),
        existing,
      ),
    ).toBe("possible-duplicate");

    expect(
      classifyDuplicate(candidate("The Left Hand of Darkness!", []), existing),
    ).toBeNull();
    expect(
      classifyDuplicate(
        candidate("Cien anos de soledad", ["Gabriel García Márquez"]),
        {
          ...existing,
          title: "Cien años de soledad",
          authors: ["Gabriel García Márquez"],
        },
      ),
    ).toBeNull();
    expect(
      classifyDuplicate(candidate("The Dispossessed", ["Ursula K. Le Guin"]), existing),
    ).toBeNull();
  });
});

function candidate(
  title: string,
  authors: string[],
  authorUnknown = false,
): DuplicateCandidate {
  return {
    id: "candidate-1",
    title,
    authors,
    authorUnknown,
  };
}
