import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../app/page";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pending extraction", () => {
  it("FR-EXTRACT-001 NFR-PERF-002 NFR-A11Y-003 announces progress and prevents duplicate submission", async () => {
    const user = userEvent.setup();
    let resolveRequest: (response: Response) => void = () => undefined;
    const request = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(request);
    vi.stubGlobal("fetch", fetchMock);
    render(<HomePage />);

    const photoInput = screen.getByLabelText(
      "Book-cover photo",
    ) as HTMLInputElement;
    await user.upload(
      photoInput,
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    const submit = screen.getByRole("button", { name: "Extract books" });
    await user.click(submit);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Extracting books from your photo.",
    );
    expect(submit).toBeDisabled();
    expect(photoInput).toBeDisabled();

    await user.upload(
      photoInput,
      new File(["second"], "second.jpg", { type: "image/jpeg" }),
    );
    expect(photoInput.files?.[0]?.name).toBe("books.jpg");

    await user.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveRequest(Response.json([]));
    await waitFor(() =>
      expect(
        screen.queryByText("Extracting books from your photo."),
      ).not.toBeInTheDocument(),
    );
  });
});
