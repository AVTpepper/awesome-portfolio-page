import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ServiceCard from "../ServiceCard";
import type { Service } from "@/lib/types";

const ts: import("@/lib/types").Timestamp = {
  seconds: 0,
  nanoseconds: 0,
  toDate: () => new Date(0),
};

function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: "svc-1",
    title: "Landing Page",
    description: "A fast, conversion-focused page",
    features: ["Responsive", "SEO-optimised", "Analytics"],
    price: "Starting at $500",
    popular: false,
    order: 0,
    updatedAt: ts,
    ...overrides,
  };
}

describe("ServiceCard", () => {
  // ── Core content ──────────────────────────────────────────────────────────
  it("renders the service title", () => {
    render(<ServiceCard service={makeService()} />);
    expect(screen.getByText("Landing Page")).toBeInTheDocument();
  });

  it("renders the service description", () => {
    render(<ServiceCard service={makeService()} />);
    expect(screen.getByText("A fast, conversion-focused page")).toBeInTheDocument();
  });

  it("renders the price", () => {
    render(<ServiceCard service={makeService()} />);
    expect(screen.getByText("Starting at $500")).toBeInTheDocument();
  });

  // ── Features ──────────────────────────────────────────────────────────────
  it("renders each feature in a list", () => {
    render(<ServiceCard service={makeService()} />);
    expect(screen.getByText("Responsive")).toBeInTheDocument();
    expect(screen.getByText("SEO-optimised")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("renders no feature list items when features is empty", () => {
    render(<ServiceCard service={makeService({ features: [] })} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  // ── Popular state ─────────────────────────────────────────────────────────
  it("shows the 'Most Popular' badge when popular is true", () => {
    render(<ServiceCard service={makeService({ popular: true })} />);
    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("does not show the 'Most Popular' badge when popular is false", () => {
    render(<ServiceCard service={makeService({ popular: false })} />);
    expect(screen.queryByText("Most Popular")).not.toBeInTheDocument();
  });

  it("applies accent ring class when popular is true", () => {
    const { container } = render(<ServiceCard service={makeService({ popular: true })} />);
    // The Card root div should have the ring highlight
    expect(container.firstChild).toHaveClass("ring-accent");
  });

  it("does not apply accent ring class when popular is false", () => {
    const { container } = render(<ServiceCard service={makeService({ popular: false })} />);
    expect(container.firstChild).not.toHaveClass("ring-accent");
  });
});
