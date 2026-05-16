"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Project } from "@/lib/types";

type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

interface ProjectFormProps {
  initial?: Partial<ProjectInput> & { id?: string };
  onSubmit: (data: ProjectInput) => Promise<void>;
}

export default function ProjectForm({ initial, onSubmit }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [longDescription, setLongDescription] = useState(initial?.longDescription ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [order, setOrder] = useState(String(initial?.order ?? 0));

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: ProjectInput = {
      title: title.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim(),
      longDescription: longDescription.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      imageUrl: imageUrl.trim(),
      liveUrl: liveUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      featured,
      order: Number(order) || 0,
    };

    if (!data.title || !data.slug || !data.shortDescription) {
      setError("Title, slug, and short description are required.");
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit(data);
        router.push("/admin/projects");
      } catch {
        setError("Save failed. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Field label="Title *">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!initial?.slug) setSlug(autoSlug(e.target.value));
          }}
          className={inputClass}
          placeholder="My Awesome Project"
        />
      </Field>

      <Field label="Slug *" hint="URL-safe identifier (auto-generated from title)">
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={inputClass}
          placeholder="my-awesome-project"
        />
      </Field>

      <Field label="Short Description *">
        <textarea
          rows={2}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className={inputClass + " resize-none"}
          placeholder="1–2 sentence preview"
        />
      </Field>

      <Field label="Long Description">
        <textarea
          rows={8}
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          className={inputClass + " resize-y"}
          placeholder="Full case study content"
        />
      </Field>

      <Field label="Tags" hint="Comma-separated">
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={inputClass}
          placeholder="Next.js, Firebase, TypeScript"
        />
      </Field>

      <Field label="Project Image">
        <ImageUpload
          storagePath="projects"
          currentUrl={imageUrl || undefined}
          onUpload={setImageUrl}
        />
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={inputClass + " mt-2"}
          placeholder="Or paste URL directly"
        />
      </Field>

      <Field label="Live URL">
        <input
          type="url"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          className={inputClass}
          placeholder="https://example.com"
        />
      </Field>

      <Field label="GitHub URL">
        <input
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className={inputClass}
          placeholder="https://github.com/..."
        />
      </Field>

      <Field label="Order">
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className={inputClass}
          min={0}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="rounded border-border"
        />
        Featured on landing page
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save Project"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="rounded-md border border-border px-5 py-2.5 text-sm text-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent";
