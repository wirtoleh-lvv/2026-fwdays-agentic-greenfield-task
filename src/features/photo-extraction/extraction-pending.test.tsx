import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhotoExtractionForm } from "./photo-extraction-form";

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
    render(<PhotoExtractionForm />);

    const photoInput = screen.getByLabelText(
      "Book-cover photo",
    ) as HTMLInputElement;
    await user.upload(
      photoInput,
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    const submit = screen.getByRole("button", {
      name: "Find books in photo",
    });
    await user.click(submit);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Extracting books from your photo.",
    );
    const pendingSubmit = screen.getByRole("button", {
      name: "Find books in photo",
    });
    const pendingPhotoInput = screen.getByLabelText("Book-cover photo");
    expect(pendingSubmit).toBeDisabled();
    expect(pendingPhotoInput).toBeDisabled();

    await user.upload(
      pendingPhotoInput,
      new File(["second"], "second.jpg", { type: "image/jpeg" }),
    );
    expect(photoInput.files?.[0]?.name).toBe("books.jpg");

    await user.click(pendingSubmit);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveRequest(Response.json([]));
    await waitFor(() =>
      expect(
        screen.queryByText("Extracting books from your photo."),
      ).not.toBeInTheDocument(),
    );
  });
});
