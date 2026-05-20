import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

function renderHeader(pathname = "/", activeSection = "", isAdmin = false) {
  mockUsePathname.mockReturnValue(pathname);
  mockUseScrollSpy.mockReturnValue(activeSection);
  return render(<Header isAdmin={isAdmin} />);
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

  it("renders all 6 navigation links", () => {
    renderHeader();
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    const links = nav.querySelectorAll("a");
    expect(links).toHaveLength(6);
  });

  it("renders Home, About, Projects, Services, Testimonials and Contact links", () => {
    renderHeader();
    ["Home", "About", "Projects", "Services", "Testimonials", "Contact"].forEach((label) => {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    });
  });

  it("passes SECTION_IDS to useScrollSpy on the home page", () => {
    renderHeader("/", "");
    const [ids] = mockUseScrollSpy.mock.calls[0];
    expect(ids).toEqual(["hero", "about", "projects", "services", "testimonials", "contact"]);
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

describe("Header — mobile burger menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a burger button with 'Open menu' label", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
  });

  it("opens the mobile menu when the burger button is clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("navigation", { name: /mobile navigation/i })).toBeInTheDocument();
  });

  it("changes burger button label to 'Close menu' when open", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
  });

  it("closes the mobile menu when the burger button is clicked again", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /close menu/i }));
    expect(
      screen.queryByRole("navigation", { name: /mobile navigation/i }),
    ).not.toBeInTheDocument();
  });

  it("closes the mobile menu when Escape is pressed", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("navigation", { name: /mobile navigation/i }),
    ).not.toBeInTheDocument();
  });

  it("closes the mobile menu when a nav link is clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
    fireEvent.click(mobileNav.querySelectorAll("a")[0]);
    expect(
      screen.queryByRole("navigation", { name: /mobile navigation/i }),
    ).not.toBeInTheDocument();
  });

  it("shows all 6 links in the mobile menu", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
    expect(mobileNav.querySelectorAll("a")).toHaveLength(6);
  });

  it("applies active styles to the active section link in the mobile menu", () => {
    renderHeader("/", "about");
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
    const aboutLink = mobileNav.querySelector("a[href='/#about']") as HTMLElement;
    expect(aboutLink.className).toContain("text-accent");
    expect(aboutLink.className).toContain("font-medium");
  });
});

// ── isAdmin prop ──────────────────────────────────────────────────────────────

describe("Header — isAdmin prop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Desktop
  it("shows the Admin panel link in the desktop nav when isAdmin is true", () => {
    renderHeader("/", "", true);
    expect(screen.getByRole("link", { name: "Admin panel" })).toBeInTheDocument();
  });

  it("does not show the Admin panel link when isAdmin is false (default)", () => {
    renderHeader();
    expect(screen.queryByRole("link", { name: "Admin panel" })).not.toBeInTheDocument();
  });

  it("Admin panel link points to /admin/dashboard", () => {
    renderHeader("/", "", true);
    expect(screen.getByRole("link", { name: "Admin panel" })).toHaveAttribute(
      "href",
      "/admin/dashboard",
    );
  });

  // Mobile
  it("shows the Admin panel link in the mobile menu when isAdmin is true", () => {
    renderHeader("/", "", true);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
    expect(
      mobileNav.querySelector("a[href='/admin/dashboard']"),
    ).toBeInTheDocument();
  });

  it("does not show the Admin panel link in the mobile menu when isAdmin is false", () => {
    renderHeader("/", "", false);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
    expect(
      mobileNav.querySelector("a[href='/admin/dashboard']"),
    ).not.toBeInTheDocument();
  });
});
