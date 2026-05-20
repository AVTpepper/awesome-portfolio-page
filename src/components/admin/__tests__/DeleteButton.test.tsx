import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import DeleteButton from "../DeleteButton";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("DeleteButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button with the default label "Delete"', () => {
    render(<DeleteButton action={vi.fn().mockResolvedValue(undefined)} />);
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders a button with a custom label", () => {
    render(
      <DeleteButton
        action={vi.fn().mockResolvedValue(undefined)}
        label="Remove item"
      />,
    );
    expect(screen.getByRole("button", { name: "Remove item" })).toBeInTheDocument();
  });

  it("opens a confirmation modal when clicked", () => {
    render(<DeleteButton action={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete this item?")).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it("closes the modal without calling the action when Cancel is clicked", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    render(<DeleteButton action={action} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("calls the action when the Delete button inside the modal is clicked", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    render(<DeleteButton action={action} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(action).toHaveBeenCalledOnce());
  });

  it("shows 'Deleting…' while the action is in-flight", async () => {
    let resolveAction!: () => void;
    const action = vi.fn(
      () => new Promise<void>((res) => { resolveAction = res; }),
    );
    render(<DeleteButton action={action} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Deleting…" })).toBeInTheDocument(),
    );
    resolveAction();
  });

  it("disables the button while the action is in-flight", async () => {
    let resolveAction!: () => void;
    const action = vi.fn(
      () => new Promise<void>((res) => { resolveAction = res; }),
    );
    render(<DeleteButton action={action} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled(),
    );
    resolveAction();
  });

  it("includes the irreversible warning in the modal", () => {
    render(<DeleteButton action={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      within(screen.getByRole("dialog")).getByText(/cannot be undone/i),
    ).toBeInTheDocument();
  });
});

