import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card hoverable className="flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative h-48 w-full bg-muted">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
          {project.shortDescription}
        </p>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* Links */}
        <div className="mt-5 flex items-center gap-3">
          <Link
            href={`/projects/${project.slug}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            View Case Study →
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Live ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
