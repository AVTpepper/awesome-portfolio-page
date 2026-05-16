import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HeroSection from "../HeroSection";
import type { SiteSettings } from "@/lib/types";

const mockSettings: SiteSettings = {
  hero: {
    headline: "Custom Headline",
    subheadline: "Custom subheadline text here",
    ctaPrimaryLabel: "See Work",
    ctaSecondaryLabel: "Contact Me",
  },
  about: { bio: "", skills: [], profileImageUrl: "" },
  contact: { email: "test@test.com", socials: {} },
};

describe("HeroSection", () => {
  // ── With settings ─────────────────────────────────────────────────────────
  it("renders the headline from settings", () => {
    render(<HeroSection settings={mockSettings} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Custom Headline" }),
    ).toBeInTheDocument();
  });

  it("renders the subheadline from settings", () => {
    render(<HeroSection settings={mockSettings} />);
    expect(screen.getByText("Custom subheadline text here")).toBeInTheDocument();
  });

  it("renders CTA button labels from settings", () => {
    render(<HeroSection settings={mockSettings} />);
    expect(screen.getByRole("link", { name: "See Work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact Me" })).toBeInTheDocument();
  });

  // ── Null settings (fallbacks) ─────────────────────────────────────────────
  it("falls back to a default headline when settings is null", () => {
    render(<HeroSection settings={null} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Hi, I'm a Full-Stack Developer",
    );
  });

  it("falls back to a default subheadline when settings is null", () => {
    render(<HeroSection settings={null} />);
    expect(
      screen.getByText(/fast, accessible web applications/),
    ).toBeInTheDocument();
  });

  it("falls back to default CTA labels when settings is null", () => {
    render(<HeroSection settings={null} />);
    expect(screen.getByRole("link", { name: "View My Work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hire Me" })).toBeInTheDocument();
  });

  // ── CTA links ─────────────────────────────────────────────────────────────
  it("primary CTA links to #projects", () => {
    render(<HeroSection settings={null} />);
    expect(screen.getByRole("link", { name: "View My Work" })).toHaveAttribute(
      "href",
      "/#projects",
    );
  });

  it("secondary CTA links to #contact", () => {
    render(<HeroSection settings={null} />);
    expect(screen.getByRole("link", { name: "Hire Me" })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });
});
