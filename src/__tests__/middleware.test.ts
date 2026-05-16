import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// vi.mock factories are hoisted to the top of the file, so mock functions
// must also be hoisted to be accessible inside the factory.
const { mockNext, mockRedirect } = vi.hoisted(() => ({
  mockNext: vi.fn(() => ({ type: "next" as const })),
  mockRedirect: vi.fn((url: URL) => ({
    type: "redirect" as const,
    location: url.toString(),
  })),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: mockNext,
    redirect: mockRedirect,
  },
}));

// Imported after mocks are registered
import { middleware } from "../../middleware";

function makeRequest(pathname: string, sessionCookie?: string): NextRequest {
  return {
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
    cookies: {
      get: (name: string) =>
        name === "session" && sessionCookie
          ? { value: sessionCookie }
          : undefined,
    },
  } as unknown as NextRequest;
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login page passthrough", () => {
    it("allows /admin/login through without an auth check", async () => {
      const req = makeRequest("/admin/login");
      await middleware(req);
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("unauthenticated requests", () => {
    it("redirects to /admin/login when no session cookie is present", async () => {
      const req = makeRequest("/admin/dashboard");
      await middleware(req);
      expect(mockRedirect).toHaveBeenCalledOnce();
      const redirectUrl: URL = mockRedirect.mock.calls[0][0];
      expect(redirectUrl.pathname).toBe("/admin/login");
    });

    it("sets the `from` query param to the originally requested pathname", async () => {
      const req = makeRequest("/admin/dashboard");
      await middleware(req);
      const redirectUrl: URL = mockRedirect.mock.calls[0][0];
      expect(redirectUrl.searchParams.get("from")).toBe("/admin/dashboard");
    });

    it("preserves deep admin paths in the `from` param", async () => {
      const req = makeRequest("/admin/projects/edit/my-slug");
      await middleware(req);
      const redirectUrl: URL = mockRedirect.mock.calls[0][0];
      expect(redirectUrl.searchParams.get("from")).toBe(
        "/admin/projects/edit/my-slug",
      );
    });

    it("`from` param is always a relative path (open-redirect safety)", async () => {
      const req = makeRequest("/admin/settings");
      await middleware(req);
      const redirectUrl: URL = mockRedirect.mock.calls[0][0];
      const from = redirectUrl.searchParams.get("from") ?? "";
      // Must start with / but never with // (protocol-relative)
      expect(from.startsWith("/")).toBe(true);
      expect(from.startsWith("//")).toBe(false);
    });

    it("does not call NextResponse.next() for unauthenticated requests", async () => {
      const req = makeRequest("/admin/dashboard");
      await middleware(req);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("authenticated requests", () => {
    it("calls NextResponse.next() when a session cookie is present", async () => {
      const req = makeRequest("/admin/dashboard", "valid-session-token");
      await middleware(req);
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("passes through any admin path when authenticated", async () => {
      const req = makeRequest("/admin/projects/edit", "abc123");
      await middleware(req);
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });
});
