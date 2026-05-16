import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TestimonialCard from "../TestimonialCard";
import type { Testimonial } from "@/lib/types";

const ts: import("@/lib/types").Timestamp = {
  seconds: 0,
  nanoseconds: 0,
  toDate: () => new Date(0),
};

function makeTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    id: "t-1",
    name: "Alice Smith",
    role: "CEO",
    company: "Acme Corp",
    content: "Absolutely fantastic work!",
    featured: true,
    order: 0,
    createdAt: ts,
    ...overrides,
  };
}

describe("TestimonialCard", () => {
  // ── Core content ──────────────────────────────────────────────────────────
  it("renders the testimonial content inside a blockquote", () => {
    render(<TestimonialCard testimonial={makeTestimonial()} />);
    expect(screen.getByText(/absolutely fantastic work/i)).toBeInTheDocument();
  });

  it("renders the reviewer's name", () => {
    render(<TestimonialCard testimonial={makeTestimonial()} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("renders the reviewer's role", () => {
    render(<TestimonialCard testimonial={makeTestimonial()} />);
    expect(screen.getByText(/CEO/)).toBeInTheDocument();
  });

  // ── Company ───────────────────────────────────────────────────────────────
  it("includes company name with a comma separator when company is provided", () => {
    render(<TestimonialCard testimonial={makeTestimonial({ company: "Acme Corp" })} />);
    expect(screen.getByText(/CEO, Acme Corp/)).toBeInTheDocument();
  });

  it("omits the company when it is not provided", () => {
    render(<TestimonialCard testimonial={makeTestimonial({ company: undefined })} />);
    expect(screen.queryByText(/,/)).not.toBeInTheDocument();
  });

  // ── Avatar ────────────────────────────────────────────────────────────────
  it("renders an avatar image when avatarUrl is provided", () => {
    render(
      <TestimonialCard
        testimonial={makeTestimonial({ avatarUrl: "https://example.com/alice.png" })}
      />,
    );
    expect(screen.getByRole("img", { name: "Alice Smith" })).toBeInTheDocument();
  });

  it("shows the first letter of the name as a fallback when avatarUrl is absent", () => {
    render(<TestimonialCard testimonial={makeTestimonial({ avatarUrl: undefined })} />);
    // The initial "A" should be rendered; no <img> present
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("uppercases the initial in the avatar fallback", () => {
    render(
      <TestimonialCard
        testimonial={makeTestimonial({ name: "bob jones", avatarUrl: undefined })}
      />,
    );
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
