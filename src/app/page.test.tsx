import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("FR-UPLOAD-001 FR-UPLOAD-002 exposes one eligible photo selection", async () => {
    const user = userEvent.setup();
    window.localStorage.clear();

    render(<HomePage />);

    await user.click(
      await screen.findByRole("button", { name: "Add books" }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Add books from a photo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Book-cover photo"),
    ).toHaveAttribute("type", "file");
    expect(
      screen.getByText(/one to five front-facing book covers/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Find books in photo" }),
    ).toBeDisabled();

    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );

    expect(
      screen.getByRole("button", { name: "Find books in photo" }),
    ).toBeEnabled();
  });
});
