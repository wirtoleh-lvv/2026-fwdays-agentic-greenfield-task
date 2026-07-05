import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExtractedBookCandidate } from "../../lib/photo-extraction/contracts";
import { PhotoExtractionForm } from "./photo-extraction-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderCandidates(candidates: ExtractedBookCandidate[]) {
  const user = userEvent.setup();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json(candidates)),
  );
  render(<PhotoExtractionForm />);

  await user.upload(
    screen.getByLabelText("Book-cover photo"),
    new File(["photo"], "books.jpg", { type: "image/jpeg" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Find books in photo" }),
  );
  await screen.findByRole("heading", { name: "Review detected books" });

  return user;
}

function candidateCard(position: number) {
  return screen.getByRole("region", { name: `Candidate ${position}` });
}

describe("candidate decisions", () => {
  it("FR-CONFIRM-003 FR-CONFIRM-006 FR-LIB-001 keeps confirmation transient and selects only confirmed candidates for Save", async () => {
    const user = userEvent.setup();
    const onSaveConfirmedBooks = vi.fn();
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json([
          { id: "candidate-1", title: "Dune", authors: ["Frank Herbert"] },
          {
            id: "candidate-2",
            title: "Kindred",
            authors: ["Octavia E. Butler"],
          },
          {
            id: "candidate-3",
            title: "Piranesi",
            authors: ["Susanna Clarke"],
          },
        ]),
      ),
    );
    render(
      <PhotoExtractionForm
        onSaveConfirmedBooks={onSaveConfirmedBooks}
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

    expect(
      screen.queryByRole("button", { name: "Save confirmed books" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Confirm" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Skip" })[0]);

    expect(storageWrite).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", { name: "Save confirmed books" }),
    );

    expect(onSaveConfirmedBooks).toHaveBeenCalledWith([
      {
        id: "candidate-1",
        title: "Dune",
        authors: ["Frank Herbert"],
        authorUnknown: false,
      },
    ]);
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("FR-CONFIRM-007 derives readiness from trimmed title and author values", async () => {
    await renderCandidates([
      { id: "ready", title: " Dune ", authors: [" Frank Herbert "] },
      { id: "missing-author", title: "The Book", authors: ["   "] },
      { id: "missing-title", title: "   ", authors: ["An Author"] },
    ]);

    const ready = candidateCard(1);
    const missingAuthor = candidateCard(2);
    const missingTitle = candidateCard(3);

    expect(within(ready).getByText("Ready for Confirmation")).toBeInTheDocument();
    expect(within(ready).getByRole("button", { name: "Confirm" })).toBeEnabled();

    expect(within(missingAuthor).getByText("Needs Review")).toBeInTheDocument();
    expect(
      within(missingAuthor).getByText(
        "An author is required unless the author is genuinely unknown.",
      ),
    ).toBeInTheDocument();
    expect(
      within(missingAuthor).getByRole("button", { name: "Confirm" }),
    ).toBeDisabled();

    expect(within(missingTitle).getByText("Needs Review")).toBeInTheDocument();
    expect(within(missingTitle).getByText(/title.*required/i)).toBeInTheDocument();
    expect(
      within(missingTitle).getByRole("button", { name: "Confirm" }),
    ).toBeDisabled();
  });

  it("FR-CONFIRM-007 NFR-A11Y-001 NFR-A11Y-002 supports an explicit unknown-author acknowledgement", async () => {
    const user = await renderCandidates([
      { id: "unknown-author", title: "The Book", authors: [] },
    ]);
    const card = candidateCard(1);
    const acknowledgement = within(card).getByRole("checkbox", {
      name: "The author of this book is unknown to me",
    });

    expect(acknowledgement).not.toBeChecked();
    expect(within(card).getByText("Needs Review")).toBeInTheDocument();

    await user.click(acknowledgement);

    expect(acknowledgement).toBeChecked();
    expect(within(card).getByText("Ready for Confirmation")).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: "Confirm" })).toBeEnabled();

    const authors = within(card).getByLabelText("Authors for candidate 1");
    await user.type(authors, "Octavia Butler");

    expect(within(card).getByText("Ready for Confirmation")).toBeInTheDocument();

    await user.clear(authors);

    expect(
      within(card).getByRole("checkbox", {
        name: "The author of this book is unknown to me",
      }),
    ).not.toBeChecked();
    expect(within(card).getByText("Needs Review")).toBeInTheDocument();
  });

  it("FR-CONFIRM-003 FR-CONFIRM-006 confirms only transiently without creating a Library Book", async () => {
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    const user = await renderCandidates([
      { id: "ready", title: "Dune", authors: ["Frank Herbert"] },
    ]);
    const card = candidateCard(1);

    await user.click(within(card).getByRole("button", { name: "Confirm" }));

    expect(within(card).getByText("Confirmed")).toBeInTheDocument();
    expect(within(card).getByText("Dune")).toBeInTheDocument();
    expect(within(card).getByText("Frank Herbert")).toBeInTheDocument();
    expect(within(card).queryByLabelText("Title for candidate 1")).not.toBeInTheDocument();
    expect(within(card).getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByText("1 confirmed · 0 skipped")).toBeInTheDocument();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("FR-CONFIRM-002 FR-CONFIRM-003 FR-CONFIRM-006 FR-CONFIRM-008 revokes confirmation before editing", async () => {
    const user = await renderCandidates([
      { id: "ready", title: "Dune", authors: ["Frank Herbert"] },
    ]);
    const card = candidateCard(1);

    await user.click(within(card).getByRole("button", { name: "Confirm" }));
    await user.click(within(card).getByRole("button", { name: "Edit" }));

    const title = within(card).getByLabelText("Title for candidate 1");
    expect(title).toHaveValue("Dune");
    expect(within(card).getByLabelText("Authors for candidate 1")).toHaveValue(
      "Frank Herbert",
    );
    expect(screen.getByText("0 confirmed · 0 skipped")).toBeInTheDocument();

    await user.clear(title);
    await user.type(title, "Dune Messiah");

    expect(within(card).queryByText("Confirmed")).not.toBeInTheDocument();
    expect(screen.getByText("0 confirmed · 0 skipped")).toBeInTheDocument();

    await user.click(within(card).getByRole("button", { name: "Confirm" }));

    expect(within(card).getByText("Confirmed")).toBeInTheDocument();
    expect(within(card).getByText("Dune Messiah")).toBeInTheDocument();
    expect(screen.getByText("1 confirmed · 0 skipped")).toBeInTheDocument();
  });

  it("FR-CONFIRM-004 FR-CONFIRM-006 skips any undecided candidate and keeps counts independent", async () => {
    const user = await renderCandidates([
      { id: "ready", title: "Dune", authors: ["Frank Herbert"] },
      { id: "needs-review", title: "The Book", authors: [] },
    ]);
    const ready = candidateCard(1);
    const needsReview = candidateCard(2);

    await user.click(within(ready).getByRole("button", { name: "Confirm" }));
    await user.click(within(needsReview).getByRole("button", { name: "Skip" }));

    expect(within(needsReview).getByText("Skipped")).toBeInTheDocument();
    expect(within(needsReview).getByText("The Book")).toBeInTheDocument();
    expect(
      within(needsReview).queryByLabelText("Title for candidate 2"),
    ).not.toBeInTheDocument();
    expect(
      within(needsReview).getByRole("button", { name: "Undo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 confirmed · 1 skipped")).toBeInTheDocument();
  });

  it("FR-CONFIRM-004 FR-CONFIRM-008 undoes Skip with edits and derived readiness preserved", async () => {
    const user = await renderCandidates([
      { id: "candidate", title: "Original title", authors: [] },
    ]);
    const card = candidateCard(1);
    const title = within(card).getByLabelText("Title for candidate 1");

    await user.clear(title);
    await user.type(title, "Edited title");
    await user.click(
      within(card).getByRole("checkbox", {
        name: "The author of this book is unknown to me",
      }),
    );
    await user.click(within(card).getByRole("button", { name: "Skip" }));
    await user.click(within(card).getByRole("button", { name: "Undo" }));

    expect(within(card).getByLabelText("Title for candidate 1")).toHaveValue(
      "Edited title",
    );
    expect(
      within(card).getByRole("checkbox", {
        name: "The author of this book is unknown to me",
      }),
    ).toBeChecked();
    expect(within(card).getByText("Ready for Confirmation")).toBeInTheDocument();
    expect(screen.getByText("0 confirmed · 0 skipped")).toBeInTheDocument();
  });

  it("NFR-A11Y-001 NFR-A11Y-002 NFR-A11Y-003 preserves keyboard focus and announces decision transitions", async () => {
    const user = await renderCandidates([
      { id: "candidate", title: "Dune", authors: ["Frank Herbert"] },
    ]);
    const card = candidateCard(1);
    const confirm = within(card).getByRole("button", { name: "Confirm" });

    confirm.focus();
    await user.keyboard("{Enter}");

    const edit = within(card).getByRole("button", { name: "Edit" });
    expect(edit).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Candidate 1 confirmed.",
    );

    await user.keyboard("{Enter}");

    const title = within(card).getByLabelText("Title for candidate 1");
    expect(title).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Candidate 1 returned to editing.",
    );

    const skip = within(card).getByRole("button", { name: "Skip" });
    skip.focus();
    await user.keyboard("{Enter}");

    const undo = within(card).getByRole("button", { name: "Undo" });
    expect(undo).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Candidate 1 skipped.");

    await user.keyboard("{Enter}");

    expect(within(card).getByLabelText("Title for candidate 1")).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Candidate 1 returned to editing.",
    );
  });
});
