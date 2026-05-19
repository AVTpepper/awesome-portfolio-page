import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  add: vi.fn().mockResolvedValue(undefined),
  collection: vi.fn(),
  serverTimestamp: vi.fn().mockReturnValue("__server_ts__"),
}));

vi.mock("@/lib/firebase/server", () => ({
  adminDb: { collection: mocks.collection },
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: mocks.serverTimestamp },
}));

import { logActivity } from "../activity";

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mocks.collection.mockReturnValue({ add: mocks.add });
});

// ── logActivity ───────────────────────────────────────────────────────────────

describe("logActivity", () => {
  it("writes to the admin-activity collection", async () => {
    await logActivity("create", "projects", "proj-1", "My Project");
    expect(mocks.collection).toHaveBeenCalledWith("admin-activity");
  });

  it("includes all required fields in the written document", async () => {
    await logActivity("update", "testimonials", "test-42", "Jane Doe");
    expect(mocks.add).toHaveBeenCalledWith({
      action: "update",
      collection: "testimonials",
      docId: "test-42",
      label: "Jane Doe",
      createdAt: "__server_ts__",
    });
  });

  it("uses FieldValue.serverTimestamp() for createdAt", async () => {
    await logActivity("delete", "services", "svc-5", "SEO Package");
    expect(mocks.serverTimestamp).toHaveBeenCalledOnce();
  });

  it("does not throw when Firestore add() rejects (non-fatal)", async () => {
    mocks.add.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(
      logActivity("create", "projects", "p-1", "Test"),
    ).resolves.toBeUndefined();
  });

  it("returns undefined (void) on success", async () => {
    const result = await logActivity("update", "settings", "site", "Site Settings");
    expect(result).toBeUndefined();
  });

  it("silences the error via console.error when Firestore fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.add.mockRejectedValueOnce(new Error("network error"));
    await logActivity("create", "projects", "x", "X");
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
