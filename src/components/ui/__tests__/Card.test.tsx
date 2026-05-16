import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Card from "../Card";

describe("Card", () => {
  it("renders its children", () => {
    render(<Card>Hello Card</Card>);
    expect(screen.getByText("Hello Card")).toBeInTheDocument();
  });

  it("has base border and background classes", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("rounded-lg", "border-border", "bg-card");
  });

  it("adds hover shadow classes when hoverable is true", () => {
    const { container } = render(<Card hoverable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("hover:shadow-md");
  });

  it("does not add hover shadow classes when hoverable is false (default)", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass("hover:shadow-md");
  });

  it("merges a custom className", () => {
    const { container } = render(<Card className="p-4">Content</Card>);
    expect(container.firstChild).toHaveClass("p-4");
  });

  it("renders multiple children", () => {
    render(
      <Card>
        <span>First</span>
        <span>Second</span>
      </Card>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
