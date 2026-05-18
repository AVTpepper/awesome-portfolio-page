import { describe, it, expect, vi, beforeEach } from "vitest";
import robots from "../robots";
import sitemap from "../sitemap";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockGetProjects } = vi.hoisted(() => ({
  mockGetProjects: vi.fn(),
}));

vi.mock("@/lib/firebase/firestore", () => ({
  getProjects: mockGetProjects,
}));

// ── robots.ts ─────────────────────────────────────────────────────────────────

describe("robots", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows all user agents to crawl /", () => {
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rule.allow).toBe("/");
  });

  it("disallows crawling of /admin", () => {
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rule.disallow).toBe("/admin");
  });

  it("includes the sitemap URL", () => {
    const result = robots();
    expect(result.sitemap).toContain("sitemap.xml");
  });

  it("uses the default domain (awesome-portfolio-page.web.app) by default", () => {
    const result = robots();
    expect(result.sitemap).toContain("awesome-portfolio-page.web.app");
  });
});

// ── sitemap.ts ────────────────────────────────────────────────────────────────

describe("sitemap", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    mockGetProjects.mockResolvedValue([]);
  });

  it("always includes the root URL", async () => {
    const entries = await sitemap();
    expect(entries.some((e) => e.url.endsWith("/") || e.url.match(/^https?:\/\/[^/]+$/))).toBe(true);
  });

  it("always includes the /projects URL", async () => {
    const entries = await sitemap();
    expect(entries.some((e) => e.url.endsWith("/projects"))).toBe(true);
  });

  it("includes an entry for each project slug", async () => {
    mockGetProjects.mockResolvedValue([
      { id: "1", slug: "my-project", order: 0, updatedAt: { toDate: () => new Date("2025-01-01") } },
      { id: "2", slug: "another-project", order: 1, updatedAt: { toDate: () => new Date("2025-06-01") } },
    ]);
    const entries = await sitemap();
    expect(entries.some((e) => e.url.endsWith("/projects/my-project"))).toBe(true);
    expect(entries.some((e) => e.url.endsWith("/projects/another-project"))).toBe(true);
  });

  it("sets lastModified from the project's updatedAt.toDate()", async () => {
    const updatedDate = new Date("2025-03-15");
    mockGetProjects.mockResolvedValue([
      { id: "1", slug: "proj", order: 0, updatedAt: { toDate: () => updatedDate } },
    ]);
    const entries = await sitemap();
    const projEntry = entries.find((e) => e.url.endsWith("/projects/proj"));
    expect(projEntry?.lastModified).toEqual(updatedDate);
  });

  it("produces no project entries when there are no projects", async () => {
    mockGetProjects.mockResolvedValue([]);
    const entries = await sitemap();
    // Only the two static entries
    expect(entries).toHaveLength(2);
  });

  it("all URLs share the same base domain", async () => {
    mockGetProjects.mockResolvedValue([
      { id: "1", slug: "p", order: 0, updatedAt: { toDate: () => new Date() } },
    ]);
    const entries = await sitemap();
    const domains = new Set(entries.map((e) => new URL(e.url).host));
    expect(domains.size).toBe(1);
  });
});
