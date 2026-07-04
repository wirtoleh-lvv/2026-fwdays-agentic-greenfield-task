import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../app/page";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("empty extraction result", () => {
  it("FR-EXTRACT-002 FR-EXTRACT-003 reports no identified books and keeps retry available", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([])));
    render(<HomePage />);

    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    await user.click(screen.getByRole("button", { name: "Extract books" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "No books were identified. Choose another photo or retry this photo.",
    );
    expect(
      screen.getByRole("button", { name: "Extract books" }),
    ).toBeEnabled();
    expect(screen.queryByRole("heading", { name: /candidate/i })).not.toBeInTheDocument();
  });
});
