import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LibrarianApp } from "./librarian-app";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Home Library entry state", () => {
  it("FR-FAIL-004 reports a local load failure without overwriting data and retries", async () => {
    const user = userEvent.setup();
    const storedBook = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const storage = {
      getItem: vi
        .fn()
        .mockImplementationOnce(() => {
          throw new DOMException("Storage unavailable", "SecurityError");
        })
        .mockReturnValue(JSON.stringify({ version: 1, books: [storedBook] })),
      setItem: vi.fn(),
    };
    render(<LibrarianApp storage={storage} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Home Library could not be loaded",
    );
    expect(storage.setItem).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("heading", { name: "Home Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Kindred")).toBeInTheDocument();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("NFR-A11Y-001 NFR-A11Y-002 NFR-A11Y-003 restores meaningful focus through keyboard save, failure, and retry transitions", async () => {
    const user = userEvent.setup();
    const existingBook = {
      id: "book-dune",
      title: "Dune",
      authors: ["Frank Herbert"],
      authorUnknown: false,
    };
    let storedValue = JSON.stringify({ version: 1, books: [existingBook] });
    const storage = {
      getItem: vi.fn(() => storedValue),
      setItem: vi
        .fn()
        .mockImplementationOnce(() => {
          throw new DOMException("Storage full", "QuotaExceededError");
        })
        .mockImplementation((_key: string, value: string) => {
          storedValue = value;
        }),
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json([
          { id: "candidate-dune", title: "Dune", authors: ["Frank Herbert"] },
        ]),
      ),
    );
    render(
      <LibrarianApp
        storage={storage}
        createLibraryBookId={() => "local-dune"}
      />,
    );

    const addBooks = await screen.findByRole("button", { name: "Add books" });
    addBooks.focus();
    await user.keyboard("{Enter}");
    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "book.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );
    await screen.findByRole("heading", { name: "Review detected books" });
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    const saveConfirmed = screen.getByRole("button", {
      name: "Save confirmed books",
    });
    saveConfirmed.focus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("heading", { name: "Duplicate Review" }),
    ).toHaveFocus();

    const saveAnyway = screen.getByRole("button", {
      name: "Save anyway for Dune",
    });
    saveAnyway.focus();
    await user.keyboard("{Enter}");
    expect(saveAnyway).toHaveAttribute("aria-pressed", "true");

    const backToReview = screen.getByRole("button", { name: "Back to review" });
    backToReview.focus();
    await user.keyboard("{Enter}");
    const restoredSave = screen.getByRole("button", {
      name: "Save confirmed books",
    });
    expect(restoredSave).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("heading", { name: "Duplicate Review" }),
    ).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "Save anyway for Dune" }),
    ).toHaveAttribute("aria-pressed", "true");

    const saveResolved = screen.getByRole("button", {
      name: "Save resolved books",
    });
    saveResolved.focus();
    await user.keyboard("{Enter}");
    const retry = screen.getByRole("button", { name: "Retry" });
    expect(screen.getByRole("alert")).toHaveTextContent("No books were saved");
    expect(retry).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(
      await screen.findByRole("heading", { name: "Home Library" }),
    ).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("1 book saved");
  });

  it("FR-DUP-005 FR-FAIL-004 FR-FAIL-005 invalidates a failed batch when its duplicate resolution changes", async () => {
    const user = userEvent.setup();
    const existingBook = {
      id: "book-dune",
      title: "Dune",
      authors: ["Frank Herbert"],
      authorUnknown: false,
    };
    const initialValue = JSON.stringify({ version: 1, books: [existingBook] });
    let storedValue = initialValue;
    const storage = {
      getItem: vi.fn(() => storedValue),
      setItem: vi
        .fn()
        .mockImplementationOnce(() => {
          throw new DOMException("Storage full", "QuotaExceededError");
        })
        .mockImplementation((_key: string, value: string) => {
          storedValue = value;
        }),
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json([
          { id: "candidate-dune", title: "Dune", authors: ["Frank Herbert"] },
          {
            id: "candidate-piranesi",
            title: "Piranesi",
            authors: ["Susanna Clarke"],
          },
        ]),
      ),
    );
    let createdIdCount = 0;
    render(
      <LibrarianApp
        storage={storage}
        createLibraryBookId={() => `local-retry-book-${++createdIdCount}`}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Add books" }));
    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );
    await screen.findByRole("heading", { name: "Review detected books" });
    await user.click(screen.getAllByRole("button", { name: "Confirm" })[0]);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await user.click(
      screen.getByRole("button", { name: "Save confirmed books" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Save anyway for Dune" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Save resolved books" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No books were saved",
    );
    expect(
      screen.getByRole("heading", { name: "Duplicate Review" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save anyway for Dune" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText(/books? saved\./)).not.toBeInTheDocument();
    expect(storedValue).toBe(initialValue);
    expect(storage.setItem).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Exclude Dune" }));
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Save resolved books" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Home Library" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 book saved");
    expect(screen.getAllByText("Dune")).toHaveLength(1);
    expect(screen.getByText("Piranesi")).toBeInTheDocument();
    expect(storage.setItem).toHaveBeenCalledTimes(2);
    expect(JSON.parse(storedValue).books).toHaveLength(2);
  });

  it("FR-DUP-005 FR-LIB-001 FR-LIB-003 NFR-PRIV-001 TC-STORAGE-002 saves a resolved batch once and reloads it locally in a later session", async () => {
    const user = userEvent.setup();
    const existingBooks = [
      {
        id: "book-dune",
        title: "Dune",
        authors: ["Frank Herbert"],
        authorUnknown: false,
      },
      {
        id: "book-kindred",
        title: "Kindred",
        authors: ["A Different Author"],
        authorUnknown: false,
      },
    ];
    let storedValue = JSON.stringify({ version: 1, books: existingBooks });
    const storage = {
      getItem: vi.fn(() => storedValue),
      setItem: vi.fn((_key: string, value: string) => {
        storedValue = value;
      }),
    };
    const fetchSpy = vi.fn().mockResolvedValue(
      Response.json([
        { id: "candidate-dune", title: "Dune", authors: ["Frank Herbert"] },
        {
          id: "candidate-kindred",
          title: "Kindred",
          authors: ["Octavia E. Butler"],
        },
        {
          id: "candidate-piranesi",
          title: "Piranesi",
          authors: ["Susanna Clarke"],
        },
      ]),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const ids = ["local-dune", "local-piranesi"];
    const firstSession = render(
      <LibrarianApp
        storage={storage}
        createLibraryBookId={() => ids.shift() ?? "unexpected-id"}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Add books" }));
    await user.upload(
      screen.getByLabelText("Book-cover photo"),
      new File(["photo"], "books.jpg", { type: "image/jpeg" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Find books in photo" }),
    );
    await screen.findByRole("heading", { name: "Review detected books" });
    for (let index = 0; index < 3; index += 1) {
      await user.click(screen.getAllByRole("button", { name: "Confirm" })[0]);
    }
    await user.click(
      screen.getByRole("button", { name: "Save confirmed books" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Save anyway for Dune" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Exclude Kindred" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Save resolved books" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent("2 books saved");
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storedValue)).toEqual({
      version: 1,
      books: [
        ...existingBooks,
        {
          id: "local-dune",
          title: "Dune",
          authors: ["Frank Herbert"],
          authorUnknown: false,
        },
        {
          id: "local-piranesi",
          title: "Piranesi",
          authors: ["Susanna Clarke"],
          authorUnknown: false,
        },
      ],
    });

    firstSession.unmount();
    fetchSpy.mockClear();
    render(<LibrarianApp storage={storage} />);

    expect(
      await screen.findByRole("heading", { name: "Home Library" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Dune")).toHaveLength(2);
    expect(screen.getByText("Kindred")).toBeInTheDocument();
    expect(screen.getByText("Piranesi")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

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
