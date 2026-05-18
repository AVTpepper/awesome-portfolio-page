import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks (must be set up before any module imports) ─────────────────

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  doc: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  collection: vi.fn(),
}));

vi.mock("@/lib/firebase/server", () => ({
  adminDb: { collection: mocks.collection },
}));

// ── Module under test ─────────────────────────────────────────────────────────

import {
  getProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getProjectById,
  getTestimonials,
  getFeaturedTestimonials,
  getServices,
  getSiteSettings,
} from "../firestore";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeProjectDoc(
  id: string,
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id,
    data: () => ({
      title: "Test Project",
      slug: id,
      shortDescription: "Short",
      longDescription: "Long",
      tags: ["React"],
      imageUrl: "https://example.com/img.png",
      liveUrl: undefined,
      githubUrl: undefined,
      featured: false,
      order: 0,
      createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(0) },
      updatedAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(0) },
      ...overrides,
    }),
  };
}

function makeTestimonialDoc(id: string) {
  return {
    id,
    data: () => ({
      name: "Alice",
      role: "CEO",
      company: "Acme",
      content: "Great work!",
      avatarUrl: undefined,
      featured: true,
      order: 0,
      createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(0) },
    }),
  };
}

function makeServiceDoc(id: string) {
  return {
    id,
    data: () => ({
      title: "Landing Page",
      description: "A fast page",
      features: ["Responsive", "SEO"],
      price: "Starting at $500",
      popular: false,
      order: 0,
      updatedAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(0) },
    }),
  };
}

// ── Mock setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Default: return an empty collection query result
  mocks.get.mockResolvedValue({ docs: [], empty: true });

  // Chain: collection().orderBy().get()
  mocks.orderBy.mockReturnValue({ get: mocks.get });

  // Chain: collection().where().orderBy().get()
  //        collection().where().limit().get()
  mocks.where.mockReturnValue({
    where: mocks.where,
    orderBy: mocks.orderBy,
    limit: mocks.limit,
    get: mocks.get,
  });

  // Chain: collection().where().limit().get()
  mocks.limit.mockReturnValue({ get: mocks.get });

  // Chain: collection().doc().get()
  mocks.doc.mockReturnValue({ get: mocks.get });

  // collection() returns an object with all query methods
  mocks.collection.mockReturnValue({
    where: mocks.where,
    orderBy: mocks.orderBy,
    doc: mocks.doc,
  });
});

// ── getProjects ───────────────────────────────────────────────────────────────

describe("getProjects", () => {
  it("queries the projects collection ordered by order asc", async () => {
    await getProjects();
    expect(mocks.collection).toHaveBeenCalledWith("projects");
    expect(mocks.orderBy).toHaveBeenCalledWith("order", "asc");
  });

  it("returns an empty array when no documents exist", async () => {
    const result = await getProjects();
    expect(result).toEqual([]);
  });

  it("maps Firestore docs to Project objects with the doc id injected", async () => {
    mocks.get.mockResolvedValueOnce({
      docs: [makeProjectDoc("proj-1", { title: "My Project" })],
    });
    const result = await getProjects();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("proj-1");
    expect(result[0].title).toBe("My Project");
  });

  it("preserves the order of returned documents", async () => {
    mocks.get.mockResolvedValueOnce({
      docs: [makeProjectDoc("a"), makeProjectDoc("b"), makeProjectDoc("c")],
    });
    const result = await getProjects();
    expect(result.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
});

// ── getFeaturedProjects ───────────────────────────────────────────────────────

describe("getFeaturedProjects", () => {
  it("filters by featured === true", async () => {
    await getFeaturedProjects();
    expect(mocks.where).toHaveBeenCalledWith("featured", "==", true);
  });

  it("sorts results by order ascending in memory", async () => {
    mocks.get.mockResolvedValueOnce({
      docs: [
        makeProjectDoc("b", { featured: true, order: 2 }),
        makeProjectDoc("a", { featured: true, order: 1 }),
      ],
    });
    const result = await getFeaturedProjects();
    expect(result[0].order).toBe(1);
    expect(result[1].order).toBe(2);
  });

  it("returns an empty array when no featured projects exist", async () => {
    const result = await getFeaturedProjects();
    expect(result).toEqual([]);
  });

  it("returns only documents returned by Firestore", async () => {
    mocks.get.mockResolvedValueOnce({
      docs: [makeProjectDoc("featured-1", { featured: true })],
    });
    const result = await getFeaturedProjects();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("featured-1");
  });
});

// ── getProjectBySlug ──────────────────────────────────────────────────────────

describe("getProjectBySlug", () => {
  it("queries by slug", async () => {
    mocks.get.mockResolvedValueOnce({ empty: true, docs: [] });
    await getProjectBySlug("my-project");
    expect(mocks.where).toHaveBeenCalledWith("slug", "==", "my-project");
  });

  it("limits query to 1 result", async () => {
    mocks.get.mockResolvedValueOnce({ empty: true, docs: [] });
    await getProjectBySlug("my-project");
    expect(mocks.limit).toHaveBeenCalledWith(1);
  });

  it("returns null when no document matches the slug", async () => {
    mocks.get.mockResolvedValueOnce({ empty: true, docs: [] });
    const result = await getProjectBySlug("nonexistent");
    expect(result).toBeNull();
  });

  it("returns the project when the slug matches", async () => {
    mocks.get.mockResolvedValueOnce({
      empty: false,
      docs: [makeProjectDoc("proj-2", { slug: "my-project" })],
    });
    const result = await getProjectBySlug("my-project");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("proj-2");
  });
});

// ── getProjectById ────────────────────────────────────────────────────────────

describe("getProjectById", () => {
  it("queries the projects collection with the given id", async () => {
    mocks.get.mockResolvedValueOnce({ exists: false });
    await getProjectById("proj-id");
    expect(mocks.collection).toHaveBeenCalledWith("projects");
    expect(mocks.doc).toHaveBeenCalledWith("proj-id");
  });

  it("returns null when the document does not exist", async () => {
    mocks.get.mockResolvedValueOnce({ exists: false });
    const result = await getProjectById("nonexistent");
    expect(result).toBeNull();
  });

  it("returns the project when the document exists", async () => {
    mocks.get.mockResolvedValueOnce({ exists: true, ...makeProjectDoc("proj-3", { title: "By ID" }) });
    const result = await getProjectById("proj-3");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("proj-3");
    expect(result?.title).toBe("By ID");
  });
});

// ── getTestimonials ───────────────────────────────────────────────────────────
describe("getTestimonials", () => {
  it("queries the testimonials collection ordered by order asc", async () => {
    await getTestimonials();
    expect(mocks.collection).toHaveBeenCalledWith("testimonials");
    expect(mocks.orderBy).toHaveBeenCalledWith("order", "asc");
  });

  it("returns an empty array when no testimonials exist", async () => {
    const result = await getTestimonials();
    expect(result).toEqual([]);
  });

  it("maps Firestore docs to Testimonial objects with id injected", async () => {
    mocks.get.mockResolvedValueOnce({
      docs: [makeTestimonialDoc("t-1")],
    });
    const result = await getTestimonials();
    expect(result[0].id).toBe("t-1");
    expect(result[0].name).toBe("Alice");
  });
});

// ── getServices ───────────────────────────────────────────────────────────────

describe("getServices", () => {
  it("queries the services collection ordered by order asc", async () => {
    await getServices();
    expect(mocks.collection).toHaveBeenCalledWith("services");
    expect(mocks.orderBy).toHaveBeenCalledWith("order", "asc");
  });

  it("returns an empty array when no services exist", async () => {
    const result = await getServices();
    expect(result).toEqual([]);
  });

  it("maps Firestore docs to Service objects with id injected", async () => {
    mocks.get.mockResolvedValueOnce({
      docs: [makeServiceDoc("svc-1")],
    });
    const result = await getServices();
    expect(result[0].id).toBe("svc-1");
    expect(result[0].title).toBe("Landing Page");
  });
});

// ── getSiteSettings ───────────────────────────────────────────────────────────

describe("getSiteSettings", () => {
  it("reads the settings/site document", async () => {
    mocks.get.mockResolvedValueOnce({ exists: false });
    await getSiteSettings();
    expect(mocks.collection).toHaveBeenCalledWith("settings");
    expect(mocks.doc).toHaveBeenCalledWith("site");
  });

  it("returns null when the settings document does not exist", async () => {
    mocks.get.mockResolvedValueOnce({ exists: false });
    const result = await getSiteSettings();
    expect(result).toBeNull();
  });

  it("returns the settings data when the document exists", async () => {
    const settings = {
      hero: { headline: "Hello", subheadline: "World", ctaPrimaryLabel: "Go", ctaSecondaryLabel: "See" },
      about: { bio: "Me", skills: [], profileImageUrl: "" },
      contact: { email: "me@me.com", socials: {} },
    };
    mocks.get.mockResolvedValueOnce({
      exists: true,
      data: () => settings,
    });
    const result = await getSiteSettings();
    expect(result).toEqual(settings);
  });
});

// ── getFeaturedTestimonials ───────────────────────────────────────────────────

describe("getFeaturedTestimonials", () => {
  it("queries the testimonials collection", async () => {
    await getFeaturedTestimonials();
    expect(mocks.collection).toHaveBeenCalledWith("testimonials");
  });

  it("filters by featured === true", async () => {
    await getFeaturedTestimonials();
    expect(mocks.where).toHaveBeenCalledWith("featured", "==", true);
  });

  it("sorts results by order ascending in memory", async () => {
    mocks.get.mockResolvedValueOnce({
      docs: [
        { id: "z", data: () => ({ name: "Z", role: "", company: "", content: "", avatarUrl: undefined, featured: true, order: 3, createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(0) } }) },
        { id: "a", data: () => ({ name: "A", role: "", company: "", content: "", avatarUrl: undefined, featured: true, order: 1, createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(0) } }) },
      ],
    });
    const result = await getFeaturedTestimonials();
    expect(result[0].order).toBe(1);
    expect(result[1].order).toBe(3);
  });

  it("returns an empty array when no featured testimonials exist", async () => {
    const result = await getFeaturedTestimonials();
    expect(result).toEqual([]);
  });

  it("maps docs to Testimonial objects with id injected", async () => {
    mocks.get.mockResolvedValueOnce({
      docs: [makeTestimonialDoc("t-featured")],
    });
    const result = await getFeaturedTestimonials();
    expect(result[0].id).toBe("t-featured");
    expect(result[0].name).toBe("Alice");
  });
});
