import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminNav from "../AdminNav";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockPathname, mockRouterPush } = vi.hoisted(() => ({
  mockPathname: vi.fn().mockReturnValue("/admin/dashboard"),
  mockRouterPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockPathname,
  useRouter: vi.fn(() => ({ push: mockRouterPush })),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AdminNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/admin/dashboard");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  it("renders all five navigation links", () => {
    render(<AdminNav />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Testimonials" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Services" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("renders a Sign out button", () => {
    render(<AdminNav />);
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("applies active class to the exact matching nav item", () => {
    mockPathname.mockReturnValue("/admin/projects");
    render(<AdminNav />);
    const projectsLink = screen.getByRole("link", { name: "Projects" });
    expect(projectsLink).toHaveClass("bg-muted");
    expect(projectsLink).toHaveClass("font-medium");
  });

  it("does not apply active class to non-matching nav items", () => {
    mockPathname.mockReturnValue("/admin/projects");
    render(<AdminNav />);
    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink).not.toHaveClass("bg-muted");
  });

  it("applies active class to a parent item when on a sub-path", () => {
    mockPathname.mockReturnValue("/admin/projects/new");
    render(<AdminNav />);
    const projectsLink = screen.getByRole("link", { name: "Projects" });
    expect(projectsLink).toHaveClass("bg-muted");
  });

  it("does not activate Projects for a different sub-path like /admin/projectsfoo", () => {
    // /admin/projectsfoo does NOT start with /admin/projects/
    mockPathname.mockReturnValue("/admin/projectsfoo");
    render(<AdminNav />);
    const projectsLink = screen.getByRole("link", { name: "Projects" });
    expect(projectsLink).not.toHaveClass("bg-muted");
  });

  it("calls POST /api/auth/signout on sign out click", async () => {
    render(<AdminNav />);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/signout", { method: "POST" });
    });
  });

  it("redirects to /admin/login after signing out", async () => {
    render(<AdminNav />);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/admin/login");
    });
  });
});
