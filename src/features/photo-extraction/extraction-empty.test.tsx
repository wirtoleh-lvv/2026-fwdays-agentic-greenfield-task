import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhotoExtractionForm } from "./photo-extraction-form";
import { stubExtractionFetch, uploadTestPhoto } from "./extraction-test-helpers";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("empty extraction result", () => {
  it("FR-EXTRACT-002 FR-EXTRACT-003 reports no identified books and keeps retry available", async () => {
    const user = userEvent.setup();
    stubExtractionFetch([]);
    render(<PhotoExtractionForm />);

    await uploadTestPhoto(user);
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "No books were identified. Choose another photo or retry this photo.",
    );
    expect(
      screen.getByRole("button", { name: "Find books in photo" }),
    ).toBeEnabled();
    expect(screen.queryByRole("heading", { name: /candidate/i })).not.toBeInTheDocument();
  });
});
