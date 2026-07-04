import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../app/page";
import { createExtractBooksHandler } from "../../server/photo-extraction/route-handler";
import type { BookExtractionProvider } from "../../server/photo-extraction/provider";

const validPng = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  ),
);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("photo extraction tracer", () => {
  it("FR-EXTRACT-001 FR-EXTRACT-002 FR-EXTRACT-003 FR-CONFIRM-001 FR-CONFIRM-002 sends an eligible photo through the API and renders editable candidates", async () => {
    const user = userEvent.setup();
    const provider: BookExtractionProvider = {
      extractBooks: vi.fn().mockResolvedValue([
        {
          id: "candidate-1",
          title: "Dune",
          authors: ["Frank Herbert"],
        },
      ]),
    };
    const handleRequest = createExtractBooksHandler(provider);

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const submittedForm = init?.body as FormData;
        const submittedPhoto = submittedForm.get("photo") as File;
        const routePhoto = {
          type: submittedPhoto.type,
          size: validPng.byteLength,
          async arrayBuffer() {
            return validPng.buffer;
          },
        };
        const routeForm = {
          get(name: string) {
            return name === "photo" ? routePhoto : null;
          },
          getAll(name: string) {
            return name === "photo" ? [routePhoto] : [];
          },
          entries() {
            return [["photo", routePhoto]][Symbol.iterator]();
          },
        };

        return handleRequest({
          formData: async () => routeForm,
        } as unknown as Request);
      }),
    );

    render(<HomePage />);

    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File([validPng], "books.png", { type: "image/png" }),
    );
    await user.click(screen.getByRole("button", { name: "Extract books" }));

    const title = await screen.findByLabelText("Title for candidate 1");
    const authors = screen.getByLabelText("Authors for candidate 1");

    expect(title).toHaveValue("Dune");
    expect(authors).toHaveValue("Frank Herbert");
    const providerInput = vi.mocked(provider.extractBooks).mock.calls[0][0];
    expect(providerInput.mimeType).toBe("image/png");
    expect(Array.from(providerInput.bytes)).toEqual(Array.from(validPng));

    await user.clear(title);
    await user.type(title, "Dune Messiah");
    await user.clear(authors);
    await user.type(authors, "Frank Herbert, Brian Herbert");

    expect(title).toHaveValue("Dune Messiah");
    expect(authors).toHaveValue("Frank Herbert, Brian Herbert");
  });
});
