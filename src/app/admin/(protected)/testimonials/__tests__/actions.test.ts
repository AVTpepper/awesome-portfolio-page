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
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../actions";

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyAdminSession.mockResolvedValue(undefined);
  mocks.get.mockResolvedValue({ data: () => ({}) });
  mocks.doc.mockReturnValue({ update: mocks.update, delete: mocks.del, get: mocks.get });
  mocks.collection.mockReturnValue({ add: mocks.add, doc: mocks.doc });
});

// ── createTestimonial ─────────────────────────────────────────────────────────

describe("createTestimonial", () => {
  const input = {
    name: "Jane Doe",
    role: "CTO",
    company: "Acme",
    content: "Great work!",
    featured: false,
    order: 0,
  };

  it("calls verifyAdminSession first", async () => {
    await createTestimonial(input);
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws without adding when auth guard rejects", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(createTestimonial(input)).rejects.toThrow();
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it("adds to the testimonials collection", async () => {
    await createTestimonial(input);
    expect(mocks.collection).toHaveBeenCalledWith("testimonials");
    expect(mocks.add).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Jane Doe", content: "Great work!" }),
    );
  });

  it("injects createdAt server timestamp", async () => {
    await createTestimonial(input);
    expect(mocks.add).toHaveBeenCalledWith(
      expect.objectContaining({ createdAt: "__server_ts__" }),
    );
  });

  it("revalidates the landing page", async () => {
    await createTestimonial(input);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });
});

// ── updateTestimonial ─────────────────────────────────────────────────────────

describe("updateTestimonial", () => {
  it("calls verifyAdminSession first", async () => {
    await updateTestimonial("t-id", { content: "Updated" });
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws without updating when auth guard rejects", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(updateTestimonial("t-id", { content: "x" })).rejects.toThrow();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("updates the correct testimonial document", async () => {
    await updateTestimonial("t-123", { content: "Excellent!" });
    expect(mocks.collection).toHaveBeenCalledWith("testimonials");
    expect(mocks.doc).toHaveBeenCalledWith("t-123");
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Excellent!" }),
    );
  });

  it("revalidates the landing page", async () => {
    await updateTestimonial("t-id", {});
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });
});

// ── deleteTestimonial ─────────────────────────────────────────────────────────

describe("deleteTestimonial", () => {
  it("calls verifyAdminSession first", async () => {
    await deleteTestimonial("t-id");
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws without deleting when auth guard rejects", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(deleteTestimonial("t-id")).rejects.toThrow();
    expect(mocks.del).not.toHaveBeenCalled();
  });

  it("deletes the correct testimonial document", async () => {
    await deleteTestimonial("t-456");
    expect(mocks.collection).toHaveBeenCalledWith("testimonials");
    expect(mocks.doc).toHaveBeenCalledWith("t-456");
    expect(mocks.del).toHaveBeenCalledOnce();
  });

  it("revalidates the landing page", async () => {
    await deleteTestimonial("t-id");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });
});

// ── Firestore error propagation ───────────────────────────────────────────────

describe("Firestore error propagation", () => {
  const input = { name: "Jane", role: "CTO", company: "Acme", content: "Great!", featured: false, order: 0 };

  it("createTestimonial propagates Firestore errors", async () => {
    mocks.add.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(createTestimonial(input)).rejects.toThrow("Firestore unavailable");
  });

  it("updateTestimonial propagates Firestore errors", async () => {
    mocks.update.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(updateTestimonial("id", {})).rejects.toThrow("Firestore unavailable");
  });

  it("deleteTestimonial propagates Firestore errors", async () => {
    mocks.del.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(deleteTestimonial("id")).rejects.toThrow("Firestore unavailable");
  });
});
