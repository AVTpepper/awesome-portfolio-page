import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Badge from "../Badge";

describe("Badge", () => {
  it("renders the label text", () => {
    render(<Badge label="TypeScript" />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders as a <span>", () => {
    const { container } = render(<Badge label="React" />);
    expect(container.firstChild?.nodeName).toBe("SPAN");
  });

  it("has pill (rounded-full) styling", () => {
    render(<Badge label="Tag" />);
    expect(screen.getByText("Tag")).toHaveClass("rounded-full");
  });

  it("merges a custom className", () => {
    render(<Badge label="Custom" className="extra-class" />);
    expect(screen.getByText("Custom")).toHaveClass("extra-class");
  });

  it("passes through extra HTML attributes", () => {
    render(<Badge label="Accessible" data-testid="my-badge" />);
    expect(screen.getByTestId("my-badge")).toBeInTheDocument();
  });
});
