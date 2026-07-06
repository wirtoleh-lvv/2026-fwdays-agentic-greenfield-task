import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LibrarianApp } from "./librarian-app";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Home Library entry state", () => {
  it("FR-LIB-004 NFR-A11Y-001 NFR-A11Y-002 opens Edit with prefilled saved values and clean close returns focus without storage access", async () => {
    const user = userEvent.setup();
    const books = [
      {
        id: "book-1",
        title: "Kindred",
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
    const storage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify({ version: 1, books })),
      setItem: vi.fn(),
    };
    render(<LibrarianApp storage={storage} />);

    const edit = await screen.findByRole("button", { name: "Edit Kindred" });
    expect(
      screen.getByRole("button", { name: "Edit The Employees" }),
    ).toBeInTheDocument();
    storage.getItem.mockClear();

    await user.click(edit);

    const dialog = screen.getByRole("dialog", { name: "Edit book" });
    expect(within(dialog).getByRole("textbox", { name: "Title" })).toHaveValue(
      "Kindred",
    );
    expect(within(dialog).getByText("Octavia E. Butler")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("checkbox", { name: "Author unknown" }),
    ).not.toBeChecked();
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(edit).toHaveFocus();

    await user.click(edit);
    await user.click(screen.getByRole("button", { name: "Close edit dialog" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(edit).toHaveFocus();

    await user.click(edit);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(edit).toHaveFocus();
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("FR-LIB-004 requires explicit discard confirmation before closing a dirty edit draft", async () => {
    const user = userEvent.setup();
    const book = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const storage = {
      getItem: vi
        .fn()
        .mockReturnValue(JSON.stringify({ version: 1, books: [book] })),
      setItem: vi.fn(),
    };
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    render(<LibrarianApp storage={storage} />);

    const edit = await screen.findByRole("button", { name: "Edit Kindred" });
    storage.getItem.mockClear();
    await user.click(edit);

    const title = screen.getByRole("textbox", { name: "Title" });
    await user.clear(title);
    await user.type(title, "Kindred (Edited)");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog", { name: "Edit book" })).toBeInTheDocument();
    expect(title).toHaveValue("Kindred (Edited)");

    await user.click(screen.getByRole("button", { name: "Close edit dialog" }));
    expect(confirmSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("dialog", { name: "Edit book" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(confirmSpy).toHaveBeenCalledTimes(3);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(edit).toHaveFocus();
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("FR-LIB-004 enables Save changes only for valid dirty drafts and preserves disabled authors when Author unknown is checked", async () => {
    const user = userEvent.setup();
    const book = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    render(
      <LibrarianApp
        storage={{
          getItem: vi
            .fn()
            .mockReturnValue(JSON.stringify({ version: 1, books: [book] })),
          setItem: vi.fn(),
        }}
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: "Edit Kindred" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Edit book" });
    const title = within(dialog).getByRole("textbox", { name: "Title" });
    const authorInput = within(dialog).getByRole("textbox", {
      name: "Author name",
    });
    const addAuthor = within(dialog).getByRole("button", { name: "Add author" });
    const save = within(dialog).getByRole("button", { name: "Save changes" });
    const authorUnknown = within(dialog).getByRole("checkbox", {
      name: "Author unknown",
    });

    expect(save).toBeDisabled();

    await user.clear(title);
    await user.type(title, "   ");
    expect(save).toBeDisabled();

    await user.clear(title);
    await user.type(title, "Kindred Revised");
    expect(save).toBeEnabled();

    await user.click(authorUnknown);
    expect(within(dialog).getByText("Octavia E. Butler")).toBeInTheDocument();
    expect(authorInput).toBeDisabled();
    expect(addAuthor).toBeDisabled();
    expect(
      within(dialog).getByRole("button", {
        name: "Remove author Octavia E. Butler",
      }),
    ).toBeDisabled();
    expect(save).toBeEnabled();
  });

  it("FR-DUP-001 FR-DUP-002 FR-LIB-004 blocks exact duplicates inline during edit", async () => {
    const user = userEvent.setup();
    const books = [
      {
        id: "book-1",
        title: "Kindred",
        authors: ["Octavia E. Butler"],
        authorUnknown: false,
      },
      {
        id: "book-2",
        title: "Dune",
        authors: ["Frank Herbert"],
        authorUnknown: false,
      },
    ];
    render(
      <LibrarianApp
        storage={{
          getItem: vi.fn().mockReturnValue(JSON.stringify({ version: 1, books })),
          setItem: vi.fn(),
        }}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Edit Kindred" }));

    const dialog = screen.getByRole("dialog", { name: "Edit book" });
    await user.clear(within(dialog).getByRole("textbox", { name: "Title" }));
    await user.type(within(dialog).getByRole("textbox", { name: "Title" }), "  dune  ");
    await user.click(
      within(dialog).getByRole("button", {
        name: "Remove author Octavia E. Butler",
      }),
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: "Author name" }),
      "Frank Herbert",
    );
    await user.click(within(dialog).getByRole("button", { name: "Add author" }));

    expect(within(dialog).getByRole("alert")).toHaveTextContent("Duplicate");
    expect(
      within(dialog).getByRole("button", { name: "Save changes" }),
    ).toBeDisabled();
  });

  it("FR-DUP-001 FR-DUP-003 FR-LIB-004 shows a non-blocking possible-duplicate warning during edit", async () => {
    const user = userEvent.setup();
    const books = [
      {
        id: "book-1",
        title: "Kindred",
        authors: ["Octavia E. Butler"],
        authorUnknown: false,
      },
      {
        id: "book-2",
        title: "Piranesi",
        authors: ["Susanna Clarke"],
        authorUnknown: false,
      },
    ];
    render(
      <LibrarianApp
        storage={{
          getItem: vi.fn().mockReturnValue(JSON.stringify({ version: 1, books })),
          setItem: vi.fn(),
        }}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Edit Kindred" }));

    const dialog = screen.getByRole("dialog", { name: "Edit book" });
    await user.clear(within(dialog).getByRole("textbox", { name: "Title" }));
    await user.type(
      within(dialog).getByRole("textbox", { name: "Title" }),
      " piranesi ",
    );
    await user.click(
      within(dialog).getByRole("checkbox", { name: "Author unknown" }),
    );

    expect(within(dialog).getByRole("status")).toHaveTextContent(
      "Possible duplicate",
    );
    expect(
      within(dialog).getByRole("button", { name: "Save changes" }),
    ).toBeEnabled();
  });

  it("NFR-A11Y-001 NFR-A11Y-002 initially focuses Title and traps keyboard focus inside the edit dialog", async () => {
    const user = userEvent.setup();
    const book = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    render(
      <LibrarianApp
        storage={{
          getItem: vi
            .fn()
            .mockReturnValue(JSON.stringify({ version: 1, books: [book] })),
          setItem: vi.fn(),
        }}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Edit Kindred" }));

    const title = screen.getByRole("textbox", { name: "Title" });
    expect(title).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Close edit dialog" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close edit dialog" })).toHaveFocus();
  });

  it("FR-LIB-004 TC-STORAGE-001 TC-STORAGE-002 saves an edited book from the fresh collection with one complete write", async () => {
    const user = userEvent.setup();
    const target = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const otherBook = {
      id: "book-2",
      title: "Beloved",
      authors: ["Toni Morrison"],
      authorUnknown: false,
    };
    const freshBook = {
      id: "book-3",
      title: "Piranesi",
      authors: ["Susanna Clarke"],
      authorUnknown: false,
    };
    let storedValue = JSON.stringify({ version: 1, books: [target, otherBook] });
    const storage = {
      getItem: vi
        .fn()
        .mockImplementationOnce(() => storedValue)
        .mockImplementation(() =>
          JSON.stringify({
            version: 1,
            books: [target, otherBook, freshBook],
          }),
        ),
      setItem: vi.fn((_key: string, value: string) => {
        storedValue = value;
      }),
    };
    render(<LibrarianApp storage={storage} />);

    await user.click(await screen.findByRole("button", { name: "Edit Kindred" }));
    await user.clear(screen.getByRole("textbox", { name: "Title" }));
    await user.type(screen.getByRole("textbox", { name: "Title" }), "Kindred Revised");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText(/^Kindred$/)).not.toBeInTheDocument();
    expect(screen.getByText("Kindred Revised")).toBeInTheDocument();
    expect(screen.getByText("Beloved")).toBeInTheDocument();
    expect(screen.getByText("Piranesi")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "“Kindred Revised” was updated.",
    );
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storedValue)).toEqual({
      version: 1,
      books: [
        {
          ...target,
          title: "Kindred Revised",
        },
        otherBook,
        freshBook,
      ],
    });
  });

  it("FR-LIB-004 performs no write and refreshes Home Library when the edited target is already absent", async () => {
    const user = userEvent.setup();
    const target = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const otherBook = {
      id: "book-2",
      title: "Beloved",
      authors: ["Toni Morrison"],
      authorUnknown: false,
    };
    const freshBook = {
      id: "book-3",
      title: "Piranesi",
      authors: ["Susanna Clarke"],
      authorUnknown: false,
    };
    const storage = {
      getItem: vi
        .fn()
        .mockReturnValueOnce(JSON.stringify({ version: 1, books: [target, otherBook] }))
        .mockReturnValue(
          JSON.stringify({ version: 1, books: [otherBook, freshBook] }),
        ),
      setItem: vi.fn(),
    };
    render(<LibrarianApp storage={storage} />);

    await user.click(await screen.findByRole("button", { name: "Edit Kindred" }));
    await user.clear(screen.getByRole("textbox", { name: "Title" }));
    await user.type(screen.getByRole("textbox", { name: "Title" }), "Kindred Revised");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText(/^Kindred$/)).not.toBeInTheDocument();
    expect(screen.queryByText("Kindred Revised")).not.toBeInTheDocument();
    expect(screen.getByText("Beloved")).toBeInTheDocument();
    expect(screen.getByText("Piranesi")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "“Kindred” is no longer in your library.",
    );
    expect(screen.getByRole("button", { name: "Remove Beloved" })).toHaveFocus();
  });

  it("FR-LIB-004 focuses the empty-state heading when a stale edit target leaves Home Library empty", async () => {
    const user = userEvent.setup();
    const target = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const storage = {
      getItem: vi
        .fn()
        .mockReturnValueOnce(JSON.stringify({ version: 1, books: [target] }))
        .mockReturnValue(JSON.stringify({ version: 1, books: [] })),
      setItem: vi.fn(),
    };
    render(<LibrarianApp storage={storage} />);

    await user.click(await screen.findByRole("button", { name: "Edit Kindred" }));
    await user.clear(screen.getByRole("textbox", { name: "Title" }));
    await user.type(screen.getByRole("textbox", { name: "Title" }), "Kindred Revised");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your library is empty" }),
    ).toHaveFocus();
  });

  it("FR-LIB-004 keeps the dirty draft open after a fresh-read failure and retries the same update", async () => {
    const user = userEvent.setup();
    const book = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    let storedValue = JSON.stringify({ version: 1, books: [book] });
    const storage = {
      getItem: vi
        .fn()
        .mockImplementationOnce(() => storedValue)
        .mockImplementationOnce(() => {
          throw new DOMException("Storage unavailable", "SecurityError");
        })
        .mockImplementation(() => storedValue),
      setItem: vi.fn((_key: string, value: string) => {
        storedValue = value;
      }),
    };
    render(<LibrarianApp storage={storage} />);

    await user.click(await screen.findByRole("button", { name: "Edit Kindred" }));
    await user.clear(screen.getByRole("textbox", { name: "Title" }));
    await user.type(screen.getByRole("textbox", { name: "Title" }), "Kindred Revised");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    const dialog = screen.getByRole("dialog", { name: "Edit book" });
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "“Kindred” was not updated.",
    );
    expect(within(dialog).getByRole("button", { name: "Retry" })).toBeEnabled();
    expect(within(dialog).getByRole("button", { name: "Retry" })).toHaveFocus();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(within(dialog).getByRole("textbox", { name: "Title" })).toHaveValue(
      "Kindred Revised",
    );
    expect(storage.setItem).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Retry" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Kindred Revised")).toBeInTheDocument();
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it("FR-LIB-004 keeps the dirty draft open after a write failure and retries the same update", async () => {
    const user = userEvent.setup();
    const book = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    let storedValue = JSON.stringify({ version: 1, books: [book] });
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
    render(<LibrarianApp storage={storage} />);

    await user.click(await screen.findByRole("button", { name: "Edit Kindred" }));
    await user.clear(screen.getByRole("textbox", { name: "Title" }));
    await user.type(screen.getByRole("textbox", { name: "Title" }), "Kindred Revised");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    const dialog = screen.getByRole("dialog", { name: "Edit book" });
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "“Kindred” was not updated.",
    );
    expect(within(dialog).getByRole("textbox", { name: "Title" })).toHaveValue(
      "Kindred Revised",
    );
    expect(storage.setItem).toHaveBeenCalledTimes(1);

    await user.click(within(dialog).getByRole("button", { name: "Retry" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Kindred Revised")).toBeInTheDocument();
    expect(storage.setItem).toHaveBeenCalledTimes(2);
  });

  it("FR-LIB-005 NFR-A11Y-003 removes from the fresh collection and focuses the next remaining book", async () => {
    const user = userEvent.setup();
    const target = {
      id: "book-1",
      title: "The Left Hand of Darkness",
      authors: ["Ursula K. Le Guin"],
      authorUnknown: false,
    };
    const nextBook = {
      id: "book-2",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const freshlyAddedBook = {
      id: "book-3",
      title: "Piranesi",
      authors: ["Susanna Clarke"],
      authorUnknown: false,
    };
    let storedValue = JSON.stringify({ version: 1, books: [target, nextBook] });
    const storage = {
      getItem: vi
        .fn()
        .mockImplementationOnce(() => storedValue)
        .mockImplementation(() =>
          JSON.stringify({
            version: 1,
            books: [target, nextBook, freshlyAddedBook],
          }),
        ),
      setItem: vi.fn((_key: string, value: string) => {
        storedValue = value;
      }),
    };
    render(<LibrarianApp storage={storage} />);

    await user.click(
      await screen.findByRole("button", {
        name: "Remove The Left Hand of Darkness",
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "Remove book" });
    await user.click(within(dialog).getByRole("button", { name: "Remove" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("The Left Hand of Darkness")).not.toBeInTheDocument();
    expect(screen.getByText("Kindred")).toBeInTheDocument();
    expect(screen.getByText("Piranesi")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "“The Left Hand of Darkness” removed from your library.",
    );
    expect(screen.getByRole("button", { name: "Remove Kindred" })).toHaveFocus();
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storedValue)).toEqual({
      version: 1,
      books: [nextBook, freshlyAddedBook],
    });
  });

  it("FR-LIB-005 NFR-A11Y-003 removes the last book and focuses the empty-state heading", async () => {
    const user = userEvent.setup();
    const book = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    let storedValue = JSON.stringify({ version: 1, books: [book] });
    const storage = {
      getItem: vi.fn(() => storedValue),
      setItem: vi.fn((_key: string, value: string) => {
        storedValue = value;
      }),
    };
    render(<LibrarianApp storage={storage} />);

    await user.click(
      await screen.findByRole("button", { name: "Remove Kindred" }),
    );
    await user.click(screen.getByRole("button", { name: "Remove" }));

    const emptyHeading = screen.getByRole("heading", {
      name: "Your library is empty",
    });
    expect(emptyHeading).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "“Kindred” removed from your library.",
    );
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storedValue)).toEqual({ version: 1, books: [] });
  });

  it("FR-LIB-005 NFR-A11Y-003 refreshes without writing when the target is already absent", async () => {
    const user = userEvent.setup();
    const target = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const nextBook = {
      id: "book-2",
      title: "Piranesi",
      authors: ["Susanna Clarke"],
      authorUnknown: false,
    };
    const freshBook = {
      id: "book-3",
      title: "Beloved",
      authors: ["Toni Morrison"],
      authorUnknown: false,
    };
    const storage = {
      getItem: vi
        .fn()
        .mockReturnValueOnce(
          JSON.stringify({ version: 1, books: [target, nextBook] }),
        )
        .mockReturnValue(
          JSON.stringify({ version: 1, books: [nextBook, freshBook] }),
        ),
      setItem: vi.fn(),
    };
    render(<LibrarianApp storage={storage} />);

    await user.click(
      await screen.findByRole("button", { name: "Remove Kindred" }),
    );
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Kindred")).not.toBeInTheDocument();
    expect(screen.getByText("Piranesi")).toBeInTheDocument();
    expect(screen.getByText("Beloved")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "“Kindred” is no longer in your library.",
    );
    expect(screen.getByRole("button", { name: "Remove Piranesi" })).toHaveFocus();
  });

  it("FR-FAIL-004 NFR-A11Y-001 NFR-A11Y-003 keeps the dialog unchanged after a read failure and retries the same removal", async () => {
    const user = userEvent.setup();
    const book = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    let storedValue = JSON.stringify({ version: 1, books: [book] });
    const storage = {
      getItem: vi
        .fn()
        .mockImplementationOnce(() => storedValue)
        .mockImplementationOnce(() => {
          throw new DOMException("Storage unavailable", "SecurityError");
        })
        .mockImplementation(() => storedValue),
      setItem: vi.fn((_key: string, value: string) => {
        storedValue = value;
      }),
    };
    render(<LibrarianApp storage={storage} />);

    await user.click(
      await screen.findByRole("button", { name: "Remove Kindred" }),
    );
    await user.click(screen.getByRole("button", { name: "Remove" }));

    const dialog = screen.getByRole("dialog", { name: "Remove book" });
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "“Kindred” was not removed.",
    );
    expect(within(dialog).getByRole("button", { name: "Retry" })).toHaveFocus();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(screen.getByRole("list", { name: "Saved books" })).toHaveTextContent(
      "Kindred",
    );
    expect(storage.setItem).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Retry" }));

    expect(storage.getItem).toHaveBeenCalledTimes(3);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your library is empty" })).toHaveFocus();
  });

  it("FR-FAIL-004 keeps the visible library unchanged after a write failure", async () => {
    const user = userEvent.setup();
    const book = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const storedValue = JSON.stringify({ version: 1, books: [book] });
    const storage = {
      getItem: vi.fn(() => storedValue),
      setItem: vi.fn(() => {
        throw new DOMException("Storage full", "QuotaExceededError");
      }),
    };
    render(<LibrarianApp storage={storage} />);

    await user.click(
      await screen.findByRole("button", { name: "Remove Kindred" }),
    );
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.getByRole("dialog", { name: "Remove book" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Saved books" })).toHaveTextContent(
      "Kindred",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "“Kindred” was not removed.",
    );
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it("FR-LIB-005 NFR-A11Y-001 NFR-A11Y-002 traps dialog focus and cancels without storage access", async () => {
    const user = userEvent.setup();
    const book = {
      id: "book-1",
      title: "Kindred",
      authors: ["Octavia E. Butler"],
      authorUnknown: false,
    };
    const storage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify({ version: 1, books: [book] }),
      ),
      setItem: vi.fn(),
    };
    render(<LibrarianApp storage={storage} />);

    const remove = await screen.findByRole("button", { name: "Remove Kindred" });
    storage.getItem.mockClear();
    await user.click(remove);

    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close remove dialog" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(cancel).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(remove).toHaveFocus();

    await user.click(remove);
    await user.click(screen.getByRole("button", { name: "Close remove dialog" }));
    expect(remove).toHaveFocus();

    await user.click(remove);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(remove).toHaveFocus();
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("FR-LIB-005 NFR-A11Y-002 opens a named irreversible confirmation for each book without storage access", async () => {
    const user = userEvent.setup();
    const books = [
      {
        id: "book-1",
        title: "The Left Hand of Darkness",
        authors: ["Ursula K. Le Guin"],
        authorUnknown: false,
      },
      {
        id: "book-2",
        title: "The Employees",
        authors: [],
        authorUnknown: true,
      },
    ];
    const storage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify({ version: 1, books })),
      setItem: vi.fn(),
    };
    render(<LibrarianApp storage={storage} />);

    await screen.findByRole("heading", { name: "Home Library" });
    expect(screen.getAllByRole("button", { name: /^Remove / })).toHaveLength(2);
    storage.getItem.mockClear();

    await user.click(
      screen.getByRole("button", {
        name: "Remove The Left Hand of Darkness",
      }),
    );

    const dialog = screen.getByRole("dialog", { name: "Remove book" });
    expect(within(dialog).getByText("The Left Hand of Darkness")).toBeInTheDocument();
    expect(within(dialog).getByText("Ursula K. Le Guin")).toBeInTheDocument();
    expect(within(dialog).getByText("This cannot be undone.")).toBeInTheDocument();
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

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

  it("FR-LIB-002 FR-LIB-003 TC-STORAGE-001 returns from the initial Add books upload without extra reads, writes, or fetches", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
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
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      await screen.findByRole("heading", { name: "Your library is empty" }),
    ).toBeInTheDocument();
    expect(emptyStorage.getItem).toHaveBeenCalledTimes(1);
    expect(emptyStorage.setItem).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();

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

    render(<LibrarianApp storage={populatedStorage} />);

    expect(
      await screen.findByRole("heading", { name: "Home Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Parable of the Sower")).toBeInTheDocument();
    expect(screen.getByText("Octavia E. Butler")).toBeInTheDocument();
    expect(screen.getByText("The Employees")).toBeInTheDocument();
    expect(screen.getByText("Author unknown")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add books" }));
    expect(
      screen.getByRole("heading", { name: "Add books from a photo" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      await screen.findByRole("heading", { name: "Home Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Parable of the Sower")).toBeInTheDocument();
    expect(screen.getByText("Octavia E. Butler")).toBeInTheDocument();
    expect(screen.getByText("The Employees")).toBeInTheDocument();
    expect(screen.getByText("Author unknown")).toBeInTheDocument();
    expect(populatedStorage.getItem).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(populatedStorage.setItem).not.toHaveBeenCalled();
  });

  it("NFR-A11Y-001 NFR-A11Y-002 restores focus to Add books after initial upload cancellation", async () => {
    const user = userEvent.setup();
    render(
      <LibrarianApp
        storage={{
          getItem: vi.fn().mockReturnValue(null),
          setItem: vi.fn(),
        }}
      />,
    );

    const addBooks = await screen.findByRole("button", { name: "Add books" });
    await user.click(addBooks);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      await screen.findByRole("heading", { name: "Your library is empty" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add books" })).toHaveFocus();
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
