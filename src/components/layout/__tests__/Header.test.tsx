import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockUsePathname, mockUseScrollSpy } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
  mockUseScrollSpy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

vi.mock("@/hooks/useScrollSpy", () => ({
  useScrollSpy: mockUseScrollSpy,
}));

// ThemeToggle uses next-themes which has no jsdom support — stub it out.
vi.mock("../ThemeToggle", () => ({
  default: () => <button aria-label="toggle theme" />,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderHeader(pathname = "/", activeSection = "") {
  mockUsePathname.mockReturnValue(pathname);
  mockUseScrollSpy.mockReturnValue(activeSection);
  return render(<Header />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Portfolio logo link", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /portfolio/i })).toBeInTheDocument();
  });

  it("renders all 5 navigation links", () => {
    renderHeader();
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    const links = nav.querySelectorAll("a");
    expect(links).toHaveLength(5);
  });

  it("renders About, Projects, Services, Testimonials and Contact links", () => {
    renderHeader();
    ["About", "Projects", "Services", "Testimonials", "Contact"].forEach((label) => {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    });
  });

  it("passes SECTION_IDS to useScrollSpy on the home page", () => {
    renderHeader("/", "");
    const [ids] = mockUseScrollSpy.mock.calls[0];
    expect(ids).toEqual(["about", "projects", "services", "testimonials", "contact"]);
  });

  it("passes an empty array to useScrollSpy on non-home pages", () => {
    renderHeader("/projects", "");
    const [ids] = mockUseScrollSpy.mock.calls[0];
    expect(ids).toEqual([]);
  });

  it("applies active styles to the active section link on the home page", () => {
    renderHeader("/", "projects");
    const projectsLink = screen.getByRole("link", { name: "Projects" });
    expect(projectsLink.className).toContain("text-accent");
    expect(projectsLink.className).toContain("font-medium");
  });

  it("does not apply active styles to non-active links", () => {
    renderHeader("/", "projects");
    const aboutLink = screen.getByRole("link", { name: "About" });
    expect(aboutLink.className).not.toContain("text-accent");
  });

  it("does not apply active styles on non-home pages even if a section id matches", () => {
    renderHeader("/about", "about");
    const aboutLink = screen.getByRole("link", { name: "About" });
    expect(aboutLink.className).not.toContain("text-accent");
  });
});
