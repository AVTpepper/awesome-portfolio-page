import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/types";

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="py-24 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="flex items-end justify-between">
            <SectionHeading
              title="Projects"
              subtitle="A selection of things I've built."
            />
            <Link
              href="/projects"
              className="hidden text-sm font-medium text-accent hover:underline sm:block"
            >
              View all projects →
            </Link>
          </div>
        </RevealOnScroll>

        {projects.length > 0 ? (
          <>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((project, i) => (
                <RevealOnScroll
                  key={project.id}
                  delay={i === 1 ? "delay-150" : i === 2 ? "delay-300" : ""}
                >
                  <ProjectCard project={project} />
                </RevealOnScroll>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/projects"
                className="text-sm font-medium text-accent hover:underline"
              >
                View all projects →
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-12 text-muted-foreground">
            Projects coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
