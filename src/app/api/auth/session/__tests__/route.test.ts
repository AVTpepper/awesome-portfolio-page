import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockCreateSessionCookie } = vi.hoisted(() => ({
  mockCreateSessionCookie: vi.fn(),
}));

vi.mock("@/lib/firebase/server", () => ({
  adminAuth: { createSessionCookie: mockCreateSessionCookie },
  adminDb: {},
}));

import { POST } from "../route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: unknown, badJson = false): NextRequest {
  return new Request("http://localhost/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: badJson ? "not-valid-json{{" : JSON.stringify(body),
  }) as unknown as NextRequest;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Input validation ──────────────────────────────────────────────────────
  it("returns 400 for malformed JSON body", async () => {
    const res = await POST(makeRequest(null, true));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid JSON");
  });

  it("returns 400 when idToken field is missing", async () => {
    const res = await POST(makeRequest({ notIdToken: "abc" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeDefined();
  });

  it("returns 400 when idToken is not a string", async () => {
    const res = await POST(makeRequest({ idToken: 42 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is null", async () => {
    const res = await POST(makeRequest(null));
    expect(res.status).toBe(400);
  });

  // ── Auth failure ──────────────────────────────────────────────────────────
  it("returns 401 when createSessionCookie throws (bad token)", async () => {
    mockCreateSessionCookie.mockRejectedValueOnce(new Error("Token expired"));
    const res = await POST(makeRequest({ idToken: "bad-token" }));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("Unauthorized");
  });
  it("returns 401 when idToken is an empty string (Firebase rejects empty tokens)", async () => {
    mockCreateSessionCookie.mockRejectedValueOnce(new Error("Firebase: invalid token"));
    const res = await POST(makeRequest({ idToken: "" }));
    expect(res.status).toBe(401);
  });
  // ── Success ───────────────────────────────────────────────────────────────
  it("returns 200 with { ok: true } on success", async () => {
    mockCreateSessionCookie.mockResolvedValueOnce("session-cookie-value");
    const res = await POST(makeRequest({ idToken: "valid-id-token" }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("calls createSessionCookie with the provided idToken and 14-day expiry", async () => {
    mockCreateSessionCookie.mockResolvedValueOnce("cookie");
    await POST(makeRequest({ idToken: "my-id-token" }));
    expect(mockCreateSessionCookie).toHaveBeenCalledWith("my-id-token", {
      expiresIn: 60 * 60 * 24 * 14 * 1000,
    });
  });

  it("sets the session cookie as httpOnly with SameSite=Strict", async () => {
    mockCreateSessionCookie.mockResolvedValueOnce("my-session-cookie");
    const res = await POST(makeRequest({ idToken: "valid" }));
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("my-session-cookie");
    expect(setCookie.toLowerCase()).toContain("httponly");
    expect(setCookie.toLowerCase()).toContain("samesite=strict");
  });

  it("sets the session cookie at path /", async () => {
    mockCreateSessionCookie.mockResolvedValueOnce("cookie");
    const res = await POST(makeRequest({ idToken: "valid" }));
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie.toLowerCase()).toContain("path=/");
  });

  it("does not set the Secure flag in the test/dev environment (NODE_ENV !== 'production')", async () => {
    // route.ts sets secure: process.env.NODE_ENV === 'production'
    // Vitest runs with NODE_ENV='test', so the Secure attribute must be absent.
    mockCreateSessionCookie.mockResolvedValueOnce("cookie");
    const res = await POST(makeRequest({ idToken: "valid" }));
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie.toLowerCase()).not.toContain(";secure");
    expect(setCookie.toLowerCase()).not.toContain("; secure");
  });
});
