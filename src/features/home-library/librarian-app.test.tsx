import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LibrarianApp } from "./librarian-app";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Home Library entry state", () => {
  it("FR-LIB-001 FR-LIB-002 NFR-A11Y-003 TC-STORAGE-001 saves one conflict-free batch and shows the complete library", async () => {
    const user = userEvent.setup();
    const existingBook = {
      id: "book-existing",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const storage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ version: 1, books: [existingBook] }),
      ),
      setItem: vi.fn(),
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json([
          {
            id: "request-scoped-candidate",
            title: "Piranesi",
            authors: ["Susanna Clarke"],
          },
        ]),
      ),
    );
    render(
      <LibrarianApp
        storage={storage}
        createLibraryBookId={() => "local-book-1"}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Add books" }));
    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "book.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );
    await screen.findByRole("heading", { name: "Review detected books" });
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await user.click(
      screen.getByRole("button", { name: "Save confirmed books" }),
    );

    const homeHeading = await screen.findByRole("heading", {
      name: "Home Library",
    });
    expect(screen.getByRole("status")).toHaveTextContent("1 book saved");
    expect(screen.getByText("Kindred")).toBeInTheDocument();
    expect(screen.getByText("Piranesi")).toBeInTheDocument();
    expect(homeHeading).toHaveFocus();
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.setItem.mock.calls[0][1])).toEqual({
      version: 1,
      books: [
        existingBook,
        {
          id: "local-book-1",
          title: "Piranesi",
          authors: ["Susanna Clarke"],
          authorUnknown: false,
        },
      ],
    });
  });

  it("FR-LIB-002 FR-LIB-003 loads empty and populated local libraries and opens Add books without a write", async () => {
    const user = userEvent.setup();
    const emptyStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    };
    const emptyView = render(<LibrarianApp storage={emptyStorage} />);

    expect(
      await screen.findByRole("heading", { name: "Your library is empty" }),
    ).toBeInTheDocument();
    expect(emptyStorage.setItem).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Add books" }));

    expect(
      screen.getByRole("heading", { name: "Add books from a photo" }),
    ).toBeInTheDocument();
    expect(emptyStorage.setItem).not.toHaveBeenCalled();

    emptyView.unmount();

    const books = [
      {
        id: "book-1",
        title: "Parable of the Sower",
        authors: ["Octavia E. Butler"],
        authorUnknown: false,
      },
      {
        id: "book-2",
        title: "The Employees",
        authors: [],
        authorUnknown: true,
      },
    ];
    const populatedStorage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ version: 1, books }),
      ),
      setItem: vi.fn(),
    };
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    render(<LibrarianApp storage={populatedStorage} />);

    expect(
      await screen.findByRole("heading", { name: "Home Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Parable of the Sower")).toBeInTheDocument();
    expect(screen.getByText("Octavia E. Butler")).toBeInTheDocument();
    expect(screen.getByText("The Employees")).toBeInTheDocument();
    expect(screen.getByText("Author unknown")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(populatedStorage.setItem).not.toHaveBeenCalled();
  });

  it("FR-LIB-002 NFR-A11Y-003 presents an explicit local-only empty state without deferred controls", async () => {
    render(
      <LibrarianApp
        storage={{
          getItem: vi.fn().mockReturnValue(null),
        }}
      />,
    );

    expect(
      await screen.findByRole("heading", { name: "Your library is empty" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your data never leaves this browser."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /manually|edit|remove/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
