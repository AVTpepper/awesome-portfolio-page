"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Testimonial } from "@/lib/types";

type TestimonialInput = Omit<Testimonial, "id" | "createdAt">;

interface TestimonialFormProps {
  initial?: Partial<TestimonialInput>;
  onSubmit: (data: TestimonialInput) => Promise<void>;
}

export default function TestimonialForm({
  initial,
  onSubmit,
}: TestimonialFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [order, setOrder] = useState(String(initial?.order ?? 0));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: TestimonialInput = {
      name: name.trim(),
      role: role.trim(),
      company: company.trim() || undefined,
      content: content.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
      featured,
      order: Number(order) || 0,
    };

    if (!data.name || !data.role || !data.content) {
      setError("Name, role, and content are required.");
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit(data);
        router.push("/admin/testimonials");
      } catch {
        setError("Save failed. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Field label="Name *">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Jane Smith" />
      </Field>
      <Field label="Role *">
        <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} placeholder="CEO" />
      </Field>
      <Field label="Company">
        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} placeholder="Acme Corp" />
      </Field>
      <Field label="Content *">
        <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} className={inputClass + " resize-none"} placeholder="Quote text…" />
      </Field>
      <Field label="Avatar">
        <ImageUpload storagePath="testimonials" currentUrl={avatarUrl || undefined} onUpload={setAvatarUrl} />
        <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className={inputClass + " mt-2"} placeholder="Or paste URL" />
      </Field>
      <Field label="Order">
        <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputClass} min={0} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-border" />
        Featured on landing page
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
          {isPending ? "Saving…" : "Save Testimonial"}
        </button>
        <button type="button" onClick={() => router.push("/admin/testimonials")} className="rounded-md border border-border px-5 py-2.5 text-sm text-foreground hover:bg-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent";
