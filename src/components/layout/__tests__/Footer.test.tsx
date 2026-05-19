import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";
import type { SiteSettings } from "@/lib/types";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockGetSiteSettings } = vi.hoisted(() => ({
  mockGetSiteSettings: vi.fn(),
}));

vi.mock("@/lib/firebase/firestore", () => ({
  getSiteSettings: mockGetSiteSettings,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSettings(
  overrides: Partial<SiteSettings["contact"]["socials"]> = {},
): SiteSettings {
  return {
    hero: {
      headline: "",
      subheadline: "",
      ctaPrimaryLabel: "",
      ctaSecondaryLabel: "",
    },
    about: { bio: "", skills: [], profileImageUrl: "" },
    contact: { email: "", socials: overrides },
  };
}

async function renderFooter(settings: SiteSettings | null = null) {
  mockGetSiteSettings.mockResolvedValue(settings);
  const jsx = await Footer();
  return render(jsx);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the copyright notice", async () => {
    await renderFooter();
    expect(screen.getByText(/portfolio\. all rights reserved/i)).toBeInTheDocument();
  });

  it("renders the Projects navigation link", async () => {
    await renderFooter();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/#projects",
    );
  });

  it("renders the Contact navigation link", async () => {
    await renderFooter();
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });

  it("does not render social links when settings is null", async () => {
    await renderFooter(null);
    expect(screen.queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /linkedin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /twitter/i })).not.toBeInTheDocument();
  });

  it("does not render social links when socials object is empty", async () => {
    await renderFooter(makeSettings({}));
    expect(screen.queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
  });

  it("renders GitHub link with correct href and aria-label", async () => {
    await renderFooter(makeSettings({ github: "https://github.com/testuser" }));
    const link = screen.getByRole("link", { name: /github profile/i });
    expect(link).toHaveAttribute("href", "https://github.com/testuser");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders LinkedIn link with correct href and aria-label", async () => {
    await renderFooter(makeSettings({ linkedin: "https://linkedin.com/in/testuser" }));
    const link = screen.getByRole("link", { name: /linkedin profile/i });
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/testuser");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders Twitter link with correct href and aria-label", async () => {
    await renderFooter(makeSettings({ twitter: "https://x.com/testuser" }));
    const link = screen.getByRole("link", { name: /twitter/i });
    expect(link).toHaveAttribute("href", "https://x.com/testuser");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders all three social links when all are set", async () => {
    await renderFooter(
      makeSettings({
        github: "https://github.com/testuser",
        linkedin: "https://linkedin.com/in/testuser",
        twitter: "https://x.com/testuser",
      }),
    );
    expect(screen.getByRole("link", { name: /github profile/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /linkedin profile/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /twitter/i })).toBeInTheDocument();
  });

  it("only renders social links that are set", async () => {
    await renderFooter(makeSettings({ github: "https://github.com/testuser" }));
    expect(screen.getByRole("link", { name: /github profile/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /linkedin profile/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /twitter/i })).not.toBeInTheDocument();
  });
});
