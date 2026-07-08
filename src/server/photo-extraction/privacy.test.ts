// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { createExtractBooksHandler } from "./route-handler";

const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

describe("stateless extraction boundary", () => {
  it("TC-AI-002 BC-PRIVACY-001 logs no photo or candidate content on success or failure", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const success = createExtractBooksHandler({
      extractBooks: vi.fn().mockResolvedValue([
        {
          id: "candidate-1",
          title: "Private candidate content",
          authors: ["Private author content"],
        },
      ]),
    });
    const failure = createExtractBooksHandler({
      extractBooks: vi
        .fn()
        .mockRejectedValue(new Error("private provider response")),
    });

    await success(validRequest());
    await failure(validRequest());

    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});

function validRequest(): Request {
  const form = new FormData();
  form.set(
    "photo",
    new File([validPng], "books.png", { type: "image/png" }),
  );
  return new Request("http://localhost/api/extract-books", {
    method: "POST",
    body: form,
  });
}
