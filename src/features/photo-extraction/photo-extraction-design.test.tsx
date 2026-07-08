import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhotoExtractionForm } from "./photo-extraction-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Figma-derived photo extraction presentation", () => {
  it("FR-UPLOAD-001 FR-UPLOAD-002 NFR-A11Y-002 presents the upload state with clear guidance and privacy context", () => {
    render(<PhotoExtractionForm />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Add books from a photo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Drop a photo here, or click to browse"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/processed temporarily.*not retained/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Find books in photo" }),
    ).toBeDisabled();
  });

  it("FR-EXTRACT-003 FR-CONFIRM-001 presents extracted candidates in an editable review layout", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json([
          {
            id: "candidate-1",
            title: "Dune",
            authors: ["Frank Herbert"],
          },
        ]),
      ),
    );
    render(<PhotoExtractionForm />);

    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    expect(screen.getByText("books.jpg")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Review detected books",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/we found 1 book in your photo/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Title for candidate 1")).toHaveValue("Dune");
    expect(screen.getByLabelText("Authors for candidate 1")).toHaveValue(
      "Frank Herbert",
    );
  });
});
