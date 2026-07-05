import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhotoExtractionForm } from "./photo-extraction-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("photo upload validation", () => {
  it("FR-UPLOAD-001 FR-UPLOAD-002 FR-FAIL-001 rejects an unsupported browser-selected file", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<PhotoExtractionForm />);

    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["not an image"], "books.pdf", {
        type: "application/pdf",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a JPEG, PNG, or WebP photo.",
    );
    expect(
      screen.getByRole("button", { name: "Find books in photo" }),
    ).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("FR-UPLOAD-001 FR-UPLOAD-002 FR-FAIL-001 rejects an oversized browser-selected photo", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<PhotoExtractionForm />);

    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File([new Uint8Array(10 * 1024 * 1024 + 1)], "books.jpg", {
        type: "image/jpeg",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a photo no larger than 10 MiB.",
    );
    expect(
      screen.getByRole("button", { name: "Find books in photo" }),
    ).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("FR-UPLOAD-001 FR-UPLOAD-002 FR-FAIL-001 rejects multiple browser-selected photos", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<PhotoExtractionForm />);
    const input = screen.getByLabelText("Book-cover photo");

    fireEvent.change(input, {
      target: {
        files: [
          new File(["first"], "first.jpg", { type: "image/jpeg" }),
          new File(["second"], "second.jpg", { type: "image/jpeg" }),
        ],
      },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose one photo at a time.",
    );
    expect(
      screen.getByRole("button", { name: "Find books in photo" }),
    ).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
