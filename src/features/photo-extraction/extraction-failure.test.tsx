import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../app/page";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("failed extraction", () => {
  it("FR-FAIL-001 NFR-PRIV-002 shows a safe error and retries the selected photo", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json(
          {
            error: {
              code: "provider_unavailable",
              message: "Book extraction is temporarily unavailable. Try again.",
            },
          },
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json([
          {
            id: "candidate-1",
            title: "Dune",
            authors: ["Frank Herbert"],
          },
        ]),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<HomePage />);
    const input = screen.getByLabelText("Book-cover photo") as HTMLInputElement;

    await user.upload(
      input,
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Book extraction is temporarily unavailable. Try again.",
    );
    expect(input.files?.[0]?.name).toBe("books.jpg");

    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );

    expect(await screen.findByLabelText("Title for candidate 1")).toHaveValue(
      "Dune",
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
