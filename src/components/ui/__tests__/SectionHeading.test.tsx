import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SectionHeading from "../SectionHeading";

describe("SectionHeading", () => {
  it("renders the title as an h2", () => {
    render(<SectionHeading title="My Section" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "My Section" }),
    ).toBeInTheDocument();
  });

  it("renders the subtitle when provided", () => {
    render(<SectionHeading title="Title" subtitle="A helpful subtitle" />);
    expect(screen.getByText("A helpful subtitle")).toBeInTheDocument();
  });

  it("does not render a subtitle element when subtitle is omitted", () => {
    const { container } = render(<SectionHeading title="Title Only" />);
    expect(container.querySelector("p")).toBeNull();
  });

  it("applies text-center class when centered is true", () => {
    const { container } = render(<SectionHeading title="Title" centered />);
    expect(container.firstChild).toHaveClass("text-center");
  });

  it("does not apply text-center when centered is false (default)", () => {
    const { container } = render(<SectionHeading title="Title" />);
    expect(container.firstChild).not.toHaveClass("text-center");
  });

  it("merges a custom className on the wrapper", () => {
    const { container } = render(
      <SectionHeading title="Title" className="mt-16" />,
    );
    expect(container.firstChild).toHaveClass("mt-16");
  });
});
