import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  verifyAdminSession: vi.fn(),
  revalidatePath: vi.fn(),
  set: vi.fn().mockResolvedValue(undefined),
  doc: vi.fn(),
  collection: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ verifyAdminSession: mocks.verifyAdminSession }));
vi.mock("@/lib/firebase/server", () => ({ adminDb: { collection: mocks.collection } }));
vi.mock("@/lib/firebase/activity", () => ({ logActivity: vi.fn().mockResolvedValue(undefined) }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { updateSiteSettings } from "../actions";

import type { SiteSettings } from "@/lib/types";

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyAdminSession.mockResolvedValue(undefined);
  mocks.doc.mockReturnValue({ set: mocks.set });
  mocks.collection.mockReturnValue({ doc: mocks.doc });
});

// ── updateSiteSettings ────────────────────────────────────────────────────────

describe("updateSiteSettings", () => {
  const partialData: Partial<SiteSettings> = {
    hero: {
      headline: "Hello World",
      subheadline: "Welcome",
      ctaPrimaryLabel: "View work",
      ctaSecondaryLabel: "Contact",
    },
  };

  it("calls verifyAdminSession first", async () => {
    await updateSiteSettings(partialData);
    expect(mocks.verifyAdminSession).toHaveBeenCalledOnce();
  });

  it("throws without writing when auth guard rejects", async () => {
    mocks.verifyAdminSession.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(updateSiteSettings(partialData)).rejects.toThrow();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("targets the settings/site document", async () => {
    await updateSiteSettings(partialData);
    expect(mocks.collection).toHaveBeenCalledWith("settings");
    expect(mocks.doc).toHaveBeenCalledWith("site");
  });

  it("calls set with the provided data", async () => {
    await updateSiteSettings(partialData);
    expect(mocks.set).toHaveBeenCalledWith(
      partialData,
      expect.objectContaining({ merge: true }),
    );
  });

  it("uses merge: true to avoid overwriting unrelated fields", async () => {
    await updateSiteSettings({ hero: { headline: "Only this", subheadline: "", ctaPrimaryLabel: "", ctaSecondaryLabel: "" } });
    expect(mocks.set).toHaveBeenCalledWith(
      expect.anything(),
      { merge: true },
    );
  });

  it("revalidates the landing page", async () => {
    await updateSiteSettings(partialData);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });
});

// ── Firestore error propagation ───────────────────────────────────────────────

describe("Firestore error propagation", () => {
  it("updateSiteSettings propagates Firestore errors", async () => {
    mocks.set.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(updateSiteSettings({ hero: { headline: "H", subheadline: "", ctaPrimaryLabel: "", ctaSecondaryLabel: "" } })).rejects.toThrow("Firestore unavailable");
  });
});
