import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProjectsSection from "../ProjectsSection";
import type { Project } from "@/lib/types";

const ts: import("@/lib/types").Timestamp = {
  seconds: 0,
  nanoseconds: 0,
  toDate: () => new Date(0),
};

function makeProject(id: string, order = 0): Project {
  return {
    id,
    title: `Project ${id}`,
    slug: `project-${id}`,
    shortDescription: "Short desc",
    longDescription: "Long desc",
    tags: [],
    imageUrl: "",
    featured: true,
    order,
    createdAt: ts,
    updatedAt: ts,
  };
}

describe("ProjectsSection", () => {
  // ── Empty state ───────────────────────────────────────────────────────────
  it("shows empty-state text when the projects array is empty", () => {
    render(<ProjectsSection projects={[]} />);
    expect(screen.getByText(/projects coming soon/i)).toBeInTheDocument();
  });

  it("does not render project cards in the empty state", () => {
    render(<ProjectsSection projects={[]} />);
    expect(screen.queryByText(/view case study/i)).not.toBeInTheDocument();
  });

  // ── With projects ─────────────────────────────────────────────────────────
  it("renders a card for each project", () => {
    const projects = [makeProject("a"), makeProject("b"), makeProject("c")];
    render(<ProjectsSection projects={projects} />);
    expect(screen.getByText("Project a")).toBeInTheDocument();
    expect(screen.getByText("Project b")).toBeInTheDocument();
    expect(screen.getByText("Project c")).toBeInTheDocument();
  });

  it("renders at most 3 projects even when given more", () => {
    const projects = [
      makeProject("a"),
      makeProject("b"),
      makeProject("c"),
      makeProject("d"),
      makeProject("e"),
    ];
    render(<ProjectsSection projects={projects} />);
    expect(screen.queryByText("Project d")).not.toBeInTheDocument();
    expect(screen.queryByText("Project e")).not.toBeInTheDocument();
  });

  // ── Navigation ────────────────────────────────────────────────────────────
  it("renders a 'View all projects' link", () => {
    render(<ProjectsSection projects={[makeProject("a")]} />);
    const links = screen.getAllByRole("link", { name: /view all projects/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", "/projects");
  });

  it("does not show empty-state message when projects are present", () => {
    render(<ProjectsSection projects={[makeProject("a")]} />);
    expect(screen.queryByText(/projects coming soon/i)).not.toBeInTheDocument();
  });
});
