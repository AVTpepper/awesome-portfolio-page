import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import HeroCtas from "../HeroCtas";

const DEFAULT_PROPS = {
  primaryLabel: "View My Work",
  secondaryLabel: "Hire Me",
};

describe("HeroCtas — rendering", () => {
  it("renders the primary CTA button with the given label", () => {
    render(<HeroCtas {...DEFAULT_PROPS} />);
    expect(screen.getByRole("link", { name: "View My Work" })).toBeInTheDocument();
  });

  it("renders the secondary CTA button with the given label", () => {
    render(<HeroCtas {...DEFAULT_PROPS} />);
    expect(screen.getByRole("link", { name: "Hire Me" })).toBeInTheDocument();
  });

  it("primary CTA links to #projects", () => {
    render(<HeroCtas {...DEFAULT_PROPS} />);
    expect(screen.getByRole("link", { name: "View My Work" })).toHaveAttribute(
      "href",
      "/#projects",
    );
  });

  it("secondary CTA links to #contact", () => {
    render(<HeroCtas {...DEFAULT_PROPS} />);
    expect(screen.getByRole("link", { name: "Hire Me" })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });
});

describe("HeroCtas — gtag events", () => {
  const mockGtag = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("gtag", mockGtag);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockGtag.mockReset();
  });

  it("fires a cta_click event with the primary label when primary CTA is clicked", () => {
    render(<HeroCtas {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("link", { name: "View My Work" }));
    expect(mockGtag).toHaveBeenCalledWith("event", "cta_click", {
      event_category: "engagement",
      cta_label: "view_work",
    });
  });

  it("fires a cta_click event with the secondary label when secondary CTA is clicked", () => {
    render(<HeroCtas {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("link", { name: "Hire Me" }));
    expect(mockGtag).toHaveBeenCalledWith("event", "cta_click", {
      event_category: "engagement",
      cta_label: "hire_me",
    });
  });
});

describe("HeroCtas — gtag absent", () => {
  beforeEach(() => {
    // Ensure window.gtag is not defined
    vi.stubGlobal("gtag", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not throw when window.gtag is undefined", () => {
    render(<HeroCtas {...DEFAULT_PROPS} />);
    expect(() => {
      fireEvent.click(screen.getByRole("link", { name: "View My Work" }));
    }).not.toThrow();
  });
});
