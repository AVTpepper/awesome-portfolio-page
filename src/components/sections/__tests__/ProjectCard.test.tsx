import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProjectCard from "../ProjectCard";
import type { Project } from "@/lib/types";

const ts: import("@/lib/types").Timestamp = {
  seconds: 0,
  nanoseconds: 0,
  toDate: () => new Date(0),
};

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    title: "My Project",
    slug: "my-project",
    shortDescription: "A great project",
    longDescription: "Very long description",
    tags: ["React", "TypeScript"],
    imageUrl: "https://example.com/image.png",
    featured: true,
    order: 1,
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

describe("ProjectCard", () => {
  // ── Core content ──────────────────────────────────────────────────────────
  it("renders the project title", () => {
    render(<ProjectCard project={makeProject()} />);
    expect(screen.getByText("My Project")).toBeInTheDocument();
  });

  it("renders the short description", () => {
    render(<ProjectCard project={makeProject()} />);
    expect(screen.getByText("A great project")).toBeInTheDocument();
  });

  it("renders a 'View Case Study' link pointing to the slug page", () => {
    render(<ProjectCard project={makeProject()} />);
    const link = screen.getByRole("link", { name: /view case study/i });
    expect(link).toHaveAttribute("href", "/projects/my-project");
  });

  // ── Tags ──────────────────────────────────────────────────────────────────
  it("renders each tag as a badge", () => {
    render(<ProjectCard project={makeProject({ tags: ["React", "TypeScript"] })} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders no tag badges when the tags array is empty", () => {
    render(<ProjectCard project={makeProject({ tags: [] })} />);
    // No badge elements from the tags section
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  // ── Optional links ────────────────────────────────────────────────────────
  it("renders a Live link when liveUrl is set", () => {
    render(<ProjectCard project={makeProject({ liveUrl: "https://live.example.com" })} />);
    expect(screen.getByRole("link", { name: /live/i })).toHaveAttribute(
      "href",
      "https://live.example.com",
    );
  });

  it("does not render a Live link when liveUrl is absent", () => {
    render(<ProjectCard project={makeProject({ liveUrl: undefined })} />);
    expect(screen.queryByRole("link", { name: /^live/i })).not.toBeInTheDocument();
  });

  it("renders a GitHub link when githubUrl is set", () => {
    render(
      <ProjectCard project={makeProject({ githubUrl: "https://github.com/example/repo" })} />,
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/example/repo",
    );
  });

  it("does not render a GitHub link when githubUrl is absent", () => {
    render(<ProjectCard project={makeProject({ githubUrl: undefined })} />);
    expect(screen.queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
  });

  // ── Image ─────────────────────────────────────────────────────────────────
  it("renders the project image when imageUrl is provided", () => {
    render(<ProjectCard project={makeProject({ imageUrl: "https://example.com/img.png" })} />);
    expect(screen.getByRole("img", { name: "My Project" })).toBeInTheDocument();
  });

  it("shows 'No image' fallback when imageUrl is an empty string", () => {
    render(<ProjectCard project={makeProject({ imageUrl: "" })} />);
    expect(screen.getByText("No image")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
