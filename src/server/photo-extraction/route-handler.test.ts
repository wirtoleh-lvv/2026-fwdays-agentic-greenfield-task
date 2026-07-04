// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { MAX_PHOTO_BYTES } from "../../lib/photo-extraction/upload-policy";
import { createExtractBooksHandler } from "./route-handler";
import type { BookExtractionProvider } from "./provider";
import { InvalidProviderOutputError } from "./errors";

const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

describe("extract books API upload boundary", () => {
  it("FR-UPLOAD-001 FR-FAIL-001 submits one valid decoded photo to the provider", async () => {
    const extractBooks = vi.fn().mockResolvedValue([]);
    const response = await createExtractBooksHandler({ extractBooks })(
      requestWith(
        new File([validPng], "books.png", { type: "image/png" }),
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(extractBooks).toHaveBeenCalledOnce();
  });

  it.each([
    {
      name: "missing photo",
      buildForm: () => new FormData(),
    },
    {
      name: "additional photo",
      buildForm: () => {
        const form = new FormData();
        form.append(
          "photo",
          new File([validPng], "first.png", { type: "image/png" }),
        );
        form.append(
          "photo",
          new File([validPng], "second.png", { type: "image/png" }),
        );
        return form;
      },
    },
    {
      name: "oversized photo",
      buildForm: () =>
        formWith(
          new File(
            [new Uint8Array(MAX_PHOTO_BYTES + 1)],
            "oversized.png",
            { type: "image/png" },
          ),
        ),
    },
    {
      name: "unsupported declared type",
      buildForm: () =>
        formWith(
          new File([validPng], "books.pdf", { type: "application/pdf" }),
        ),
    },
    {
      name: "spoofed declared type",
      buildForm: () =>
        formWith(
          new File([validPng], "books.jpg", { type: "image/jpeg" }),
        ),
    },
    {
      name: "undecodable photo",
      buildForm: () =>
        formWith(
          new File(["not a png"], "books.png", { type: "image/png" }),
        ),
    },
  ])(
    "FR-UPLOAD-001 FR-FAIL-001 rejects $name before invoking the provider",
    async ({ buildForm }) => {
      const extractBooks = vi.fn().mockResolvedValue([]);
      const response = await createExtractBooksHandler({
        extractBooks,
      } as BookExtractionProvider)(
        new Request("http://localhost/api/extract-books", {
          method: "POST",
          body: buildForm(),
        }),
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: {
          code: "invalid_upload",
          message: "Choose one supported book-cover photo.",
        },
      });
      expect(extractBooks).not.toHaveBeenCalled();
    },
  );

  it("FR-FAIL-001 NFR-PRIV-002 maps provider failure to a safe error", async () => {
    const extractBooks = vi
      .fn()
      .mockRejectedValue(new Error("secret provider detail"));
    const response = await createExtractBooksHandler({ extractBooks })(
      requestWith(
        new File([validPng], "books.png", { type: "image/png" }),
      ),
    );

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({
      error: {
        code: "provider_unavailable",
        message: "Book extraction is temporarily unavailable. Try again.",
      },
    });
    expect(JSON.stringify(body)).not.toContain("secret provider detail");
  });

  it("FR-UPLOAD-001 FR-FAIL-001 maps malformed multipart syntax to an invalid-upload error", async () => {
    const extractBooks = vi.fn();
    const response = await createExtractBooksHandler({
      extractBooks,
    } as BookExtractionProvider)(
      new Request("http://localhost/api/extract-books", {
        method: "POST",
        headers: {
          "content-type": "multipart/form-data; boundary=broken",
        },
        body: "not a multipart body",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "invalid_upload",
        message: "Choose one supported book-cover photo.",
      },
    });
    expect(extractBooks).not.toHaveBeenCalled();
  });

  it("FR-EXTRACT-002 FR-FAIL-001 NFR-PRIV-002 rejects invalid provider output without partial data", async () => {
    const extractBooks = vi
      .fn()
      .mockRejectedValue(new InvalidProviderOutputError());
    const response = await createExtractBooksHandler({ extractBooks })(
      requestWith(
        new File([validPng], "books.png", { type: "image/png" }),
      ),
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: {
        code: "invalid_provider_output",
        message: "The extracted book information could not be read. Try again.",
      },
    });
  });
});

function requestWith(photo: File): Request {
  return new Request("http://localhost/api/extract-books", {
    method: "POST",
    body: formWith(photo),
  });
}

function formWith(photo: File): FormData {
  const form = new FormData();
  form.set("photo", photo);
  return form;
}
