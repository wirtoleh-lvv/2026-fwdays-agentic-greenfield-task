import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhotoExtractionForm } from "./photo-extraction-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("later extraction", () => {
  it("FR-EXTRACT-003 clears earlier transient candidates before submitting the new photo", async () => {
    const user = userEvent.setup();
    let resolveSecondRequest: (response: Response) => void = () => undefined;
    const secondRequest = new Promise<Response>((resolve) => {
      resolveSecondRequest = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json([
          {
            id: "candidate-1",
            title: "Old candidate",
            authors: ["Old author"],
          },
        ]),
      )
      .mockReturnValueOnce(secondRequest);
    vi.stubGlobal("fetch", fetchMock);
    render(<PhotoExtractionForm />);
    const input = screen.getByLabelText("Book-cover photo");

    await user.upload(
      input,
      new File(["first"], "first.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );
    expect(await screen.findByDisplayValue("Old candidate")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back to upload" }));
    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["second"], "second.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );

    expect(screen.queryByDisplayValue("Old candidate")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Extracting books from your photo.",
    );

    resolveSecondRequest(Response.json([]));
  });
});
