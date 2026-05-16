import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockRedirect, mockCookiesGet, mockVerifySessionCookie } = vi.hoisted(() => ({
  // Mirrors real Next.js behaviour: redirect() throws to abort rendering
  mockRedirect: vi.fn().mockImplementation(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  mockCookiesGet: vi.fn(),
  mockVerifySessionCookie: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockCookiesGet })),
}));
vi.mock("@/lib/firebase/server", () => ({
  adminAuth: { verifySessionCookie: mockVerifySessionCookie },
  adminDb: {},
}));

import { verifyAdminSession } from "../auth";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("verifyAdminSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySessionCookie.mockResolvedValue({ uid: "user-123" });
  });

  it("redirects to /admin/login when no session cookie is present", async () => {
    mockCookiesGet.mockReturnValue(undefined);
    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("redirects to /admin/login when the cookie value is an empty string", async () => {
    mockCookiesGet.mockReturnValue({ value: "" });
    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("redirects to /admin/login when verifySessionCookie throws", async () => {
    mockCookiesGet.mockReturnValue({ value: "expired-session" });
    mockVerifySessionCookie.mockRejectedValueOnce(new Error("Firebase: session expired"));
    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("does not redirect when the session is valid", async () => {
    mockCookiesGet.mockReturnValue({ value: "valid-session-token" });
    mockVerifySessionCookie.mockResolvedValueOnce({ uid: "user-123" });
    await expect(verifyAdminSession()).resolves.toBeUndefined();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("calls verifySessionCookie with checkRevoked=true", async () => {
    mockCookiesGet.mockReturnValue({ value: "some-token" });
    await verifyAdminSession();
    expect(mockVerifySessionCookie).toHaveBeenCalledWith("some-token", true);
  });

  it("passes the session cookie value to verifySessionCookie", async () => {
    mockCookiesGet.mockReturnValue({ value: "specific-token-value" });
    await verifyAdminSession();
    expect(mockVerifySessionCookie).toHaveBeenCalledWith("specific-token-value", true);
  });
});
