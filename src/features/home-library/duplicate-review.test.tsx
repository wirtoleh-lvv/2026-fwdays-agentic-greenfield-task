import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhotoExtractionForm } from "../photo-extraction/photo-extraction-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Duplicate Review", () => {
  it("FR-DUP-004 FR-DUP-005 FR-FAIL-005 shows every conflict before writing and preserves candidate state on Back", async () => {
    const user = userEvent.setup();
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    const continueSave = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json([
          { id: "candidate-1", title: "  Dune  ", authors: [" Frank Herbert "] },
          { id: "candidate-2", title: "Kindred", authors: ["Octavia E. Butler"] },
          { id: "candidate-3", title: "Piranesi", authors: ["Susanna Clarke"] },
        ]),
      ),
    );
    render(
      <PhotoExtractionForm
        existingBooks={[
          {
            id: "book-1",
            title: "Dune",
            authors: ["Frank Herbert"],
            authorUnknown: false,
          },
          {
            id: "book-2",
            title: "Kindred",
            authors: ["A Different Author"],
            authorUnknown: false,
          },
        ]}
        onSaveConfirmedBooks={continueSave}
      />,
    );

    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );
    await screen.findByRole("heading", { name: "Review detected books" });
    await user.click(screen.getAllByRole("button", { name: "Confirm" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Confirm" })[0]);
    await user.click(
      screen.getByRole("button", { name: "Save confirmed books" }),
    );

    expect(
      screen.getByRole("heading", { name: "Duplicate Review" }),
    ).toBeInTheDocument();
    const duplicate = screen.getByRole("region", {
      name: "Duplicate conflict for Dune",
    });
    expect(within(duplicate).getByText("Duplicate")).toBeInTheDocument();
    expect(within(duplicate).getAllByText("Dune")).toHaveLength(2);
    expect(within(duplicate).getAllByText("Frank Herbert")).toHaveLength(2);

    const possibleDuplicate = screen.getByRole("region", {
      name: "Possible Duplicate conflict for Kindred",
    });
    expect(
      within(possibleDuplicate).getByText("Possible Duplicate"),
    ).toBeInTheDocument();
    expect(within(possibleDuplicate).getAllByText("Kindred")).toHaveLength(2);
    expect(storageWrite).not.toHaveBeenCalled();
    expect(continueSave).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Back to review" }));

    expect(
      screen.getByRole("heading", { name: "Review detected books" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Confirmed")).toHaveLength(2);
    expect(screen.getByText("2 confirmed · 0 skipped")).toBeInTheDocument();
    expect(screen.getByLabelText("Title for candidate 3")).toHaveValue(
      "Piranesi",
    );
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("FR-DUP-005 FR-LIB-001 requires every resolution and builds only the explicit non-empty batch", async () => {
    const user = userEvent.setup();
    const continueSave = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json([
          { id: "candidate-1", title: "Dune", authors: ["Frank Herbert"] },
          { id: "candidate-2", title: "Kindred", authors: ["Octavia E. Butler"] },
          { id: "candidate-3", title: "Piranesi", authors: ["Susanna Clarke"] },
        ]),
      ),
    );
    const firstView = render(
      <PhotoExtractionForm
        existingBooks={[
          {
            id: "book-1",
            title: "Dune",
            authors: ["Frank Herbert"],
            authorUnknown: false,
          },
          {
            id: "book-2",
            title: "Kindred",
            authors: ["Another Author"],
            authorUnknown: false,
          },
        ]}
        onSaveConfirmedBooks={continueSave}
      />,
    );

    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );
    await screen.findByRole("heading", { name: "Review detected books" });
    for (let index = 0; index < 3; index += 1) {
      await user.click(screen.getAllByRole("button", { name: "Confirm" })[0]);
    }
    await user.click(
      screen.getByRole("button", { name: "Save confirmed books" }),
    );

    const finalSave = screen.getByRole("button", { name: "Save resolved books" });
    expect(finalSave).toBeDisabled();
    const duplicate = screen.getByRole("region", {
      name: "Duplicate conflict for Dune",
    });
    await user.click(
      within(duplicate).getByRole("button", { name: "Save anyway for Dune" }),
    );
    expect(finalSave).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Back to review" }));
    await user.click(
      screen.getByRole("button", { name: "Save confirmed books" }),
    );
    expect(
      within(
        screen.getByRole("region", { name: "Duplicate conflict for Dune" }),
      ).getByRole("button", { name: "Save anyway for Dune" }),
    ).toHaveAttribute("aria-pressed", "true");
    const resumedFinalSave = screen.getByRole("button", {
      name: "Save resolved books",
    });

    const possibleDuplicate = screen.getByRole("region", {
      name: "Possible Duplicate conflict for Kindred",
    });
    await user.click(
      within(possibleDuplicate).getByRole("button", { name: "Exclude Kindred" }),
    );
    expect(resumedFinalSave).toBeEnabled();
    await user.click(resumedFinalSave);

    expect(continueSave).toHaveBeenCalledWith([
      {
        id: "candidate-1",
        title: "Dune",
        authors: ["Frank Herbert"],
        authorUnknown: false,
      },
      {
        id: "candidate-3",
        title: "Piranesi",
        authors: ["Susanna Clarke"],
        authorUnknown: false,
      },
    ]);

    firstView.unmount();
    continueSave.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json([
          { id: "candidate-only", title: "Dune", authors: ["Frank Herbert"] },
        ]),
      ),
    );
    render(
      <PhotoExtractionForm
        existingBooks={[
          {
            id: "book-1",
            title: "Dune",
            authors: ["Frank Herbert"],
            authorUnknown: false,
          },
        ]}
        onSaveConfirmedBooks={continueSave}
      />,
    );
    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "book.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );
    await screen.findByRole("heading", { name: "Review detected books" });
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await user.click(
      screen.getByRole("button", { name: "Save confirmed books" }),
    );
    await user.click(screen.getByRole("button", { name: "Exclude Dune" }));

    expect(
      screen.getByText("No books remain in this save batch."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save resolved books" }),
    ).toBeDisabled();
    expect(continueSave).not.toHaveBeenCalled();
  });
});
