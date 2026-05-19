import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  getRecentActivity: vi.fn(),
}));

vi.mock("@/lib/firebase/firestore", () => ({
  getRecentActivity: mocks.getRecentActivity,
}));

import ActivityFeed from "../ActivityFeed";
import type { ActivityEntry } from "@/lib/firebase/firestore";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEntry(
  id: string,
  overrides: Partial<ActivityEntry> = {},
): ActivityEntry {
  return {
    id,
    action: "create",
    collection: "projects",
    docId: "proj-1",
    label: "Test Project",
    createdAt: { seconds: 1700000000, nanoseconds: 0 },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getRecentActivity.mockResolvedValue([]);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ActivityFeed — empty state", () => {
  it("shows the empty state message when there are no entries", async () => {
    render(await ActivityFeed());
    expect(screen.getByText("No recent activity.")).toBeInTheDocument();
  });

  it("does not render a list when there are no entries", async () => {
    render(await ActivityFeed());
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("ActivityFeed — with entries", () => {
  const entries = [
    makeEntry("act-1", { action: "create", label: "New Project", collection: "projects" }),
    makeEntry("act-2", { action: "update", label: "About Section", collection: "settings" }),
    makeEntry("act-3", { action: "delete", label: "Old Testimonial", collection: "testimonials" }),
  ];

  beforeEach(() => {
    mocks.getRecentActivity.mockResolvedValue(entries);
  });

  it("renders one list item per entry", async () => {
    render(await ActivityFeed());
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders the label for each entry", async () => {
    render(await ActivityFeed());
    expect(screen.getByText("New Project")).toBeInTheDocument();
    expect(screen.getByText("About Section")).toBeInTheDocument();
    expect(screen.getByText("Old Testimonial")).toBeInTheDocument();
  });

  it("renders 'Created' badge for create actions", async () => {
    render(await ActivityFeed());
    expect(screen.getByText("Created")).toBeInTheDocument();
  });

  it("renders 'Updated' badge for update actions", async () => {
    render(await ActivityFeed());
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });

  it("renders 'Deleted' badge for delete actions", async () => {
    render(await ActivityFeed());
    expect(screen.getByText("Deleted")).toBeInTheDocument();
  });

  it("renders the collection name for each entry", async () => {
    render(await ActivityFeed());
    expect(screen.getByText(/in projects/)).toBeInTheDocument();
    expect(screen.getByText(/in settings/)).toBeInTheDocument();
    expect(screen.getByText(/in testimonials/)).toBeInTheDocument();
  });

  it("does not show empty-state message when entries are present", async () => {
    render(await ActivityFeed());
    expect(screen.queryByText("No recent activity.")).not.toBeInTheDocument();
  });
});

describe("ActivityFeed — relative timestamps", () => {
  it("shows 'just now' for a very recent entry", async () => {
    const now = Math.floor(Date.now() / 1000);
    mocks.getRecentActivity.mockResolvedValue([
      makeEntry("act-recent", { createdAt: { seconds: now - 10, nanoseconds: 0 } }),
    ]);
    render(await ActivityFeed());
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("shows minutes ago for an entry from a few minutes ago", async () => {
    const now = Math.floor(Date.now() / 1000);
    mocks.getRecentActivity.mockResolvedValue([
      makeEntry("act-min", { createdAt: { seconds: now - 300, nanoseconds: 0 } }),
    ]);
    render(await ActivityFeed());
    expect(screen.getByText("5m ago")).toBeInTheDocument();
  });

  it("shows 'just now' when createdAt is null", async () => {
    mocks.getRecentActivity.mockResolvedValue([
      makeEntry("act-null", { createdAt: null }),
    ]);
    render(await ActivityFeed());
    expect(screen.getByText("just now")).toBeInTheDocument();
  });
});
