import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("does not call the action when the user cancels the confirm dialog", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const action = vi.fn().mockResolvedValue(undefined);
    render(<DeleteButton action={action} />);
    fireEvent.click(screen.getByRole("button"));
    expect(action).not.toHaveBeenCalled();
  });

  it("calls the action when the user confirms the dialog", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const action = vi.fn().mockResolvedValue(undefined);
    render(<DeleteButton action={action} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(action).toHaveBeenCalledOnce());
  });

  it("shows 'Deleting…' while the action is in-flight", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let resolveAction!: () => void;
    const action = vi.fn(
      () => new Promise<void>((res) => { resolveAction = res; }),
    );
    render(<DeleteButton action={action} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Deleting…" })).toBeInTheDocument(),
    );
    // Resolve the action to clean up the component
    resolveAction();
  });

  it("disables the button while the action is in-flight", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let resolveAction!: () => void;
    const action = vi.fn(
      () => new Promise<void>((res) => { resolveAction = res; }),
    );
    render(<DeleteButton action={action} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByRole("button")).toBeDisabled(),
    );
    resolveAction();
  });

  it("includes the irreversible warning in the confirm message", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<DeleteButton action={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.click(screen.getByRole("button"));
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining("cannot be undone"),
    );
  });
});
