import type { LibraryBook } from "./storage";

export type DuplicateCandidate = {
  id: string;
  title: string;
  authors: string[];
  authorUnknown: boolean;
};

export type DuplicateCategory = "duplicate" | "possible-duplicate";

export function classifyDuplicate(
  candidate: DuplicateCandidate,
  libraryBook: LibraryBook,
): DuplicateCategory | null {
  if (normalizeText(candidate.title) !== normalizeText(libraryBook.title)) {
    return null;
  }

  const candidateAuthors = normalizeAuthors(candidate.authors);
  const libraryAuthors = normalizeAuthors(libraryBook.authors);

  if (
    candidateAuthors.length > 0 &&
    libraryAuthors.length > 0 &&
    candidateAuthors.length === libraryAuthors.length &&
    candidateAuthors.every(
      (author, index) => author === libraryAuthors[index],
    )
  ) {
    return "duplicate";
  }

  return "possible-duplicate";
}

function normalizeAuthors(authors: string[]): string[] {
  return authors
    .map(normalizeText)
    .filter((author) => author.length > 0)
    .sort();
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/gu, " ").toLowerCase();
}
