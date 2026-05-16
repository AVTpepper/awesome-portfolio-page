import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Button from "../Button";

describe("Button", () => {
  // ── Element type ──────────────────────────────────────────────────────────
  it("renders a <button> when no href is provided", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders an <a> (Link) when href is provided", () => {
    render(<Button href="/projects">View Projects</Button>);
    expect(screen.getByRole("link", { name: "View Projects" })).toBeInTheDocument();
  });

  it("sets the href on the rendered link", () => {
    render(<Button href="/about">About</Button>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/about");
  });

  // ── Variant classes ───────────────────────────────────────────────────────
  it("applies primary variant by default", () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-accent");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-transparent", "border-border");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-muted-foreground");
  });

  // ── Size classes ──────────────────────────────────────────────────────────
  it("applies md size classes by default", () => {
    render(<Button>Medium</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-5", "py-2.5");
  });

  it("applies sm size classes", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-3", "py-1.5", "text-sm");
  });

  it("applies lg size classes", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-6", "py-3", "text-base");
  });

  // ── Additional props ──────────────────────────────────────────────────────
  it("merges a custom className", () => {
    render(<Button className="my-custom">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("my-custom");
  });

  it("forwards disabled to the button element", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
