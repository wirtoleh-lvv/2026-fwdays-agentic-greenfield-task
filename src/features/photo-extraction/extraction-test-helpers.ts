import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";
import type { ExtractedBookCandidate } from "../../lib/photo-extraction/contracts";

export function stubExtractionFetch(candidates: ExtractedBookCandidate[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json(candidates)),
  );
}

export function uploadTestPhoto(
  user: UserEvent,
  target: HTMLElement = screen.getByLabelText("Book-cover photo"),
) {
  return user.upload(
    target,
    new File(["photo"], "books.jpg", { type: "image/jpeg" }),
  );
}
