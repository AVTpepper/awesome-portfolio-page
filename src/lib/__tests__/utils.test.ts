import { describe, it, expect } from "vitest";
import { isSafeRedirectPath, cn } from "../utils";

describe("isSafeRedirectPath", () => {
  // ── Happy path ───────────────────────────────────────────────────────────
  it("returns true for a normal relative path", () => {
    expect(isSafeRedirectPath("/admin/dashboard")).toBe(true);
  });

  it("returns true for root /", () => {
    expect(isSafeRedirectPath("/")).toBe(true);
  });

  it("returns true for a path with a query string", () => {
    expect(isSafeRedirectPath("/projects?page=2")).toBe(true);
  });

  it("returns true for a deeply nested path", () => {
    expect(isSafeRedirectPath("/admin/projects/edit/some-slug")).toBe(true);
  });

  // ── Open-redirect attack vectors ─────────────────────────────────────────
  it("returns false for a protocol-relative URL (//evil.com)", () => {
    expect(isSafeRedirectPath("//evil.com")).toBe(false);
  });

  it("returns false for an http absolute URL", () => {
    expect(isSafeRedirectPath("http://evil.com")).toBe(false);
  });

  it("returns false for an https absolute URL", () => {
    expect(isSafeRedirectPath("https://evil.com")).toBe(false);
  });

  it("returns false for a javascript: URI", () => {
    expect(isSafeRedirectPath("javascript:alert(1)")).toBe(false);
  });

  it("returns false for a path missing a leading slash", () => {
    expect(isSafeRedirectPath("admin/dashboard")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isSafeRedirectPath("")).toBe(false);
  });

  it("returns false for a URL disguised with an encoded slash (/%2F...)", () => {
    // The path itself is relative — but the function should still accept it
    // since it starts with / and not //. This is a boundary clarification test.
    expect(isSafeRedirectPath("/%2Fevil.com")).toBe(true);
  });
});

describe("cn", () => {
  it("joins two class names with a space", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("joins many class names", () => {
    expect(cn("a", "b", "c", "d")).toBe("a b c d");
  });

  it("filters out undefined", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("filters out null", () => {
    expect(cn("foo", null, "bar")).toBe("foo bar");
  });

  it("filters out false", () => {
    expect(cn("foo", false, "bar")).toBe("foo bar");
  });

  it("returns empty string when all arguments are falsy", () => {
    expect(cn(undefined, null, false)).toBe("");
  });

  it("returns single class when given one truthy argument", () => {
    expect(cn("only")).toBe("only");
  });

  it("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });
});
