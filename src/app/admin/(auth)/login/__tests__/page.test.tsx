import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLoginPage from "../page";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockRouterPush, mockGetSearchParam, mockSignIn } = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockGetSearchParam: vi.fn().mockReturnValue(null),
  mockSignIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockRouterPush })),
  useSearchParams: vi.fn(() => ({ get: mockGetSearchParam })),
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: mockSignIn,
}));

vi.mock("@/lib/firebase/client", () => ({
  auth: {},
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCredential(idToken = "fake-id-token") {
  return {
    user: { getIdToken: vi.fn().mockResolvedValue(idToken) },
  };
}

async function fillAndSubmit(email = "admin@test.com", password = "secret") {
  await userEvent.type(screen.getByLabelText(/email/i), email);
  await userEvent.type(screen.getByLabelText(/password/i), password);
  fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AdminLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSearchParam.mockReturnValue(null);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    );
  });

  // ── Rendering ─────────────────────────────────────────────────────────────
  it("renders an email input", () => {
    render(<AdminLoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders a password input", () => {
    render(<AdminLoginPage />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a submit button with text 'Sign in'", () => {
    render(<AdminLoginPage />);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("does not show an error alert on initial render", () => {
    render(<AdminLoginPage />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // ── Loading state ─────────────────────────────────────────────────────────
  it("shows 'Signing in…' while the form is submitting", async () => {
    let resolveSignIn!: (value: unknown) => void;
    mockSignIn.mockReturnValue(new Promise((res) => { resolveSignIn = res; }));
    render(<AdminLoginPage />);
    await fillAndSubmit();
    expect(await screen.findByRole("button", { name: "Signing in…" })).toBeInTheDocument();
    resolveSignIn(makeCredential());
  });

  // ── Happy path ────────────────────────────────────────────────────────────
  it("redirects to /admin/dashboard when no 'from' param is present", async () => {
    mockSignIn.mockResolvedValue(makeCredential());
    mockGetSearchParam.mockReturnValue(null);
    render(<AdminLoginPage />);
    await fillAndSubmit();
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("redirects to a safe 'from' path after login", async () => {
    mockSignIn.mockResolvedValue(makeCredential());
    mockGetSearchParam.mockReturnValue("/admin/projects");
    render(<AdminLoginPage />);
    await fillAndSubmit();
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/admin/projects");
    });
  });

  it("POSTs the idToken to /api/auth/session", async () => {
    mockSignIn.mockResolvedValue(makeCredential("my-id-token"));
    render(<AdminLoginPage />);
    await fillAndSubmit();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/auth/session",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ idToken: "my-id-token" }),
        }),
      );
    });
  });

  // ── SECURITY: open-redirect prevention ───────────────────────────────────
  it("redirects to /admin/dashboard when 'from' is an external URL (//evil.com)", async () => {
    mockSignIn.mockResolvedValue(makeCredential());
    mockGetSearchParam.mockReturnValue("//evil.com");
    render(<AdminLoginPage />);
    await fillAndSubmit();
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/admin/dashboard");
      expect(mockRouterPush).not.toHaveBeenCalledWith("//evil.com");
    });
  });

  it("redirects to /admin/dashboard when 'from' is http://evil.com", async () => {
    mockSignIn.mockResolvedValue(makeCredential());
    mockGetSearchParam.mockReturnValue("http://evil.com");
    render(<AdminLoginPage />);
    await fillAndSubmit();
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("redirects to /admin/dashboard when 'from' is a javascript: URI", async () => {
    mockSignIn.mockResolvedValue(makeCredential());
    mockGetSearchParam.mockReturnValue("javascript:alert(1)");
    render(<AdminLoginPage />);
    await fillAndSubmit();
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────
  it("shows 'Invalid email or password.' for auth/invalid-credential error", async () => {
    mockSignIn.mockRejectedValue(new Error("Firebase: auth/invalid-credential"));
    render(<AdminLoginPage />);
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
  });

  it("shows 'Invalid email or password.' for auth/wrong-password error", async () => {
    mockSignIn.mockRejectedValue(new Error("Firebase: auth/wrong-password"));
    render(<AdminLoginPage />);
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
  });

  it("shows 'Too many attempts.' message for auth/too-many-requests error", async () => {
    mockSignIn.mockRejectedValue(new Error("Firebase: auth/too-many-requests"));
    render(<AdminLoginPage />);
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many attempts",
    );
  });

  it("shows a generic error for unexpected errors", async () => {
    mockSignIn.mockRejectedValue(new Error("Network error"));
    render(<AdminLoginPage />);
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Sign-in failed");
  });

  it("shows a generic error when session creation fails (res.ok=false)", async () => {
    mockSignIn.mockResolvedValue(makeCredential());
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }),
    );
    render(<AdminLoginPage />);
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
