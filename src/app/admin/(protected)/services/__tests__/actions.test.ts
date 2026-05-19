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
  createService,
  updateService,
  deleteService,
} from "../actions";

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyAdminSession.mockResolvedValue(undefined);
  mocks.get.mockResolvedValue({ data: () => ({}) });
  mocks.doc.mockReturnValue({ update: mocks.update, delete: mocks.del, get: mocks.get });
  mocks.collection.mockReturnValue({ add: mocks.add, doc: mocks.doc });
});

// ── createService ─────────────────────────────────────────────────────────────

describe("createService", () => {
  const input = {
    title: "Web Development",
    description: "Build fast sites",
    price: "$1000",
    features: ["TypeScript", "React"],
    popular: false,
    order: 0,
  };

  it("calls verifyAdminSession first", async () => {
    await createService(input);
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws without adding when auth guard rejects", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(createService(input)).rejects.toThrow();
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it("adds to the services collection", async () => {
    await createService(input);
    expect(mocks.collection).toHaveBeenCalledWith("services");
    expect(mocks.add).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Web Development" }),
    );
  });

  it("injects updatedAt server timestamp", async () => {
    await createService(input);
    expect(mocks.add).toHaveBeenCalledWith(
      expect.objectContaining({ updatedAt: "__server_ts__" }),
    );
  });

  it("revalidates the landing page", async () => {
    await createService(input);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });
});

// ── updateService ─────────────────────────────────────────────────────────────

describe("updateService", () => {
  it("calls verifyAdminSession first", async () => {
    await updateService("svc-id", { title: "Updated" });
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws without updating when auth guard rejects", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(updateService("svc-id", {})).rejects.toThrow();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("updates the correct service document", async () => {
    await updateService("svc-123", { title: "New Title" });
    expect(mocks.collection).toHaveBeenCalledWith("services");
    expect(mocks.doc).toHaveBeenCalledWith("svc-123");
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New Title" }),
    );
  });

  it("injects updatedAt server timestamp on update", async () => {
    await updateService("svc-id", { title: "x" });
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ updatedAt: "__server_ts__" }),
    );
  });

  it("revalidates the landing page", async () => {
    await updateService("svc-id", {});
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });
});

// ── deleteService ─────────────────────────────────────────────────────────────

describe("deleteService", () => {
  it("calls verifyAdminSession first", async () => {
    await deleteService("svc-id");
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws without deleting when auth guard rejects", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(deleteService("svc-id")).rejects.toThrow();
    expect(mocks.del).not.toHaveBeenCalled();
  });

  it("deletes the correct service document", async () => {
    await deleteService("svc-789");
    expect(mocks.collection).toHaveBeenCalledWith("services");
    expect(mocks.doc).toHaveBeenCalledWith("svc-789");
    expect(mocks.del).toHaveBeenCalledOnce();
  });

  it("revalidates the landing page", async () => {
    await deleteService("svc-id");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });
});

// ── Firestore error propagation ───────────────────────────────────────────────

describe("Firestore error propagation", () => {
  const input = { title: "Web Dev", description: "Build fast sites", price: "$1000", features: [], popular: false, order: 0 };

  it("createService propagates Firestore errors", async () => {
    mocks.add.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(createService(input)).rejects.toThrow("Firestore unavailable");
  });

  it("updateService propagates Firestore errors", async () => {
    mocks.update.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(updateService("id", {})).rejects.toThrow("Firestore unavailable");
  });

  it("deleteService propagates Firestore errors", async () => {
    mocks.del.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(deleteService("id")).rejects.toThrow("Firestore unavailable");
  });
});
