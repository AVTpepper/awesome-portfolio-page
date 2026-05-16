import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/firebase/firestore";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <article className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/projects"
          className="text-sm font-medium text-accent hover:underline"
        >
          ← All Projects
        </Link>

        {/* Header */}
        <div className="mt-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {project.shortDescription}
          </p>

          {project.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} label={tag} />
              ))}
            </div>
          )}

          {/* CTA links — external, open in new tab */}
          <div className="mt-6 flex flex-wrap gap-3">
            {project.liveUrl && (
              <Button
                href={project.liveUrl}
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Live Site ↗
              </Button>
            )}
            {project.githubUrl && (
              <Button
                href={project.githubUrl}
                variant="secondary"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </Button>
            )}
          </div>
        </div>

        {/* Hero image */}
        {project.imageUrl && (
          <div className="relative mt-10 h-64 w-full overflow-hidden rounded-lg border border-border sm:h-96">
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
        )}

        {/* Long description */}
        <div className="mt-12 whitespace-pre-line text-base leading-7 text-foreground">
          {project.longDescription}
        </div>
      </div>
    </article>
  );
}
