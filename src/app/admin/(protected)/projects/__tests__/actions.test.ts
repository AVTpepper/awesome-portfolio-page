import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  verifyAdminSession: vi.fn(),
  revalidatePath: vi.fn(),
  serverTimestamp: vi.fn().mockReturnValue("__server_ts__"),
  add: vi.fn().mockResolvedValue({ id: "new-id" }),
  update: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  doc: vi.fn(),
  collection: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ verifyAdminSession: mocks.verifyAdminSession }));
vi.mock("@/lib/firebase/server", () => ({ adminDb: { collection: mocks.collection } }));
vi.mock("@/lib/firebase/activity", () => ({ logActivity: vi.fn().mockResolvedValue(undefined) }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: mocks.serverTimestamp },
}));

import {
  createProject,
  updateProject,
  deleteProject,
} from "../actions";

import type { Project } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

function makeInput(overrides: Partial<ProjectInput> = {}): ProjectInput {
  return {
    title: "Test Project",
    slug: "test-project",
    shortDescription: "Short",
    longDescription: "Long",
    tags: [],
    imageUrl: "",
    featured: false,
    order: 0,
    ...overrides,
  };
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyAdminSession.mockResolvedValue(undefined);
  mocks.get.mockResolvedValue({ data: () => ({}) });
  mocks.doc.mockReturnValue({ update: mocks.update, delete: mocks.del, get: mocks.get });
  mocks.collection.mockReturnValue({ add: mocks.add, doc: mocks.doc });
});

// ── createProject ─────────────────────────────────────────────────────────────

describe("createProject", () => {
  it("calls verifyAdminSession first", async () => {
    await createProject(makeInput());
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws when verifyAdminSession rejects (auth guard)", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(createProject(makeInput())).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it("adds a document to the projects collection", async () => {
    await createProject(makeInput({ title: "My Project" }));
    expect(mocks.collection).toHaveBeenCalledWith("projects");
    expect(mocks.add).toHaveBeenCalledWith(
      expect.objectContaining({ title: "My Project" }),
    );
  });

  it("injects createdAt and updatedAt server timestamps", async () => {
    await createProject(makeInput());
    expect(mocks.add).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: "__server_ts__",
        updatedAt: "__server_ts__",
      }),
    );
  });

  it("revalidates the landing page and /projects", async () => {
    await createProject(makeInput());
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects");
  });
});

// ── updateProject ─────────────────────────────────────────────────────────────

describe("updateProject", () => {
  it("calls verifyAdminSession first", async () => {
    await updateProject("proj-id", "my-slug", { title: "Updated" });
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws when verifyAdminSession rejects (auth guard)", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(
      updateProject("proj-id", "my-slug", { title: "Updated" }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("updates the correct document", async () => {
    await updateProject("proj-123", "my-slug", { title: "New Title" });
    expect(mocks.collection).toHaveBeenCalledWith("projects");
    expect(mocks.doc).toHaveBeenCalledWith("proj-123");
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New Title" }),
    );
  });

  it("injects updatedAt server timestamp", async () => {
    await updateProject("proj-123", "my-slug", { title: "New" });
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ updatedAt: "__server_ts__" }),
    );
  });

  it("revalidates the landing page, /projects, and the project slug page", async () => {
    await updateProject("proj-id", "my-slug", {});
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/my-slug");
  });
});

// ── deleteProject ─────────────────────────────────────────────────────────────

describe("deleteProject", () => {
  it("calls verifyAdminSession first", async () => {
    await deleteProject("proj-id");
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws when verifyAdminSession rejects (auth guard)", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(deleteProject("proj-id")).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.del).not.toHaveBeenCalled();
  });

  it("deletes the correct document from projects", async () => {
    await deleteProject("proj-456");
    expect(mocks.collection).toHaveBeenCalledWith("projects");
    expect(mocks.doc).toHaveBeenCalledWith("proj-456");
    expect(mocks.del).toHaveBeenCalledOnce();
  });

  it("revalidates the landing page and /projects", async () => {
    await deleteProject("proj-id");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects");
  });
});

// ── Firestore error propagation ───────────────────────────────────────────────

describe("Firestore error propagation", () => {
  it("createProject propagates Firestore errors", async () => {
    mocks.add.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(createProject(makeInput())).rejects.toThrow("Firestore unavailable");
  });

  it("updateProject propagates Firestore errors", async () => {
    mocks.update.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(updateProject("id", "slug", {})).rejects.toThrow("Firestore unavailable");
  });

  it("deleteProject propagates Firestore errors", async () => {
    mocks.del.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(deleteProject("id")).rejects.toThrow("Firestore unavailable");
  });
});
