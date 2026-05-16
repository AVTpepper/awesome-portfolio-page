import { getProjects } from "@/lib/firebase/firestore";
import ProjectCard from "@/components/sections/ProjectCard";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "A full listing of my portfolio projects.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="All Projects"
          subtitle="Everything I've shipped."
        />

        {projects.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-muted-foreground">Projects coming soon.</p>
        )}
      </div>
    </div>
  );
}
