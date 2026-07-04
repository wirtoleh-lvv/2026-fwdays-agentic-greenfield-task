import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../app/page";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("photo extraction keyboard path", () => {
  it("NFR-A11Y-001 NFR-A11Y-002 operates upload, submission, and candidate editing from the keyboard", async () => {
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
    render(<HomePage />);

    await user.tab();
    const photoInput = screen.getByLabelText("Book-cover photo");
    expect(photoInput).toHaveFocus();

    await user.upload(
      photoInput,
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Remove selected photo" }),
    ).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Find books in photo" }),
    ).toHaveFocus();

    await user.keyboard("{Enter}");
    const title = await screen.findByLabelText("Title for candidate 1");

    await user.tab();
    expect(screen.getByRole("button", { name: "Back to upload" })).toHaveFocus();
    await user.tab();
    expect(title).toHaveFocus();
    await user.clear(title);
    await user.type(title, "Dune Messiah");
    expect(title).toHaveValue("Dune Messiah");

    await user.tab();
    expect(screen.getByLabelText("Authors for candidate 1")).toHaveFocus();
  });
});
