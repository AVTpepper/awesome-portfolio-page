import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockCookiesGet, mockVerifySessionCookie, mockRevokeRefreshTokens } =
  vi.hoisted(() => ({
    mockCookiesGet: vi.fn(),
    mockVerifySessionCookie: vi.fn(),
    mockRevokeRefreshTokens: vi.fn(),
  }));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({ get: mockCookiesGet }),
  ),
}));

vi.mock("@/lib/firebase/server", () => ({
  adminAuth: {
    verifySessionCookie: mockVerifySessionCookie,
    revokeRefreshTokens: mockRevokeRefreshTokens,
  },
  adminDb: {},
}));

import { POST } from "../route";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/signout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySessionCookie.mockResolvedValue({ uid: "user-123" });
    mockRevokeRefreshTokens.mockResolvedValue(undefined);
  });

  it("returns 200 with { ok: true }", async () => {
    mockCookiesGet.mockReturnValue(undefined);
    const res = await POST();
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("clears the session cookie (maxAge=0)", async () => {
    mockCookiesGet.mockReturnValue(undefined);
    const res = await POST();
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie.toLowerCase()).toContain("max-age=0");
  });

  it("sets the cleared cookie as httpOnly with SameSite=Strict", async () => {
    mockCookiesGet.mockReturnValue(undefined);
    const res = await POST();
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie.toLowerCase()).toContain("httponly");
    expect(setCookie.toLowerCase()).toContain("samesite=strict");
  });

  it("succeeds and clears cookie even when no session cookie is present", async () => {
    mockCookiesGet.mockReturnValue(undefined);
    const res = await POST();
    expect(res.status).toBe(200);
    expect(mockVerifySessionCookie).not.toHaveBeenCalled();
    expect(mockRevokeRefreshTokens).not.toHaveBeenCalled();
  });

  it("revokes refresh tokens when a valid session exists", async () => {
    mockCookiesGet.mockReturnValue({ value: "valid-session" });
    mockVerifySessionCookie.mockResolvedValueOnce({ uid: "user-abc" });
    await POST();
    expect(mockRevokeRefreshTokens).toHaveBeenCalledWith("user-abc");
  });

  it("still clears the cookie when verifySessionCookie throws (already invalid)", async () => {
    mockCookiesGet.mockReturnValue({ value: "expired-session" });
    mockVerifySessionCookie.mockRejectedValueOnce(new Error("Invalid session"));
    const res = await POST();
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie.toLowerCase()).toContain("max-age=0");
  });
});
