"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@/lib/types";

type ServiceInput = Omit<Service, "id" | "updatedAt">;

interface ServiceFormProps {
  initial?: Partial<ServiceInput>;
  onSubmit: (data: ServiceInput) => Promise<void>;
}

export default function ServiceForm({ initial, onSubmit }: ServiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [features, setFeatures] = useState((initial?.features ?? []).join("\n"));
  const [price, setPrice] = useState(initial?.price ?? "");
  const [popular, setPopular] = useState(initial?.popular ?? false);
  const [order, setOrder] = useState(String(initial?.order ?? 0));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: ServiceInput = {
      title: title.trim(),
      description: description.trim(),
      features: features.split("\n").map((f) => f.trim()).filter(Boolean),
      price: price.trim(),
      popular,
      order: Number(order) || 0,
    };

    if (!data.title || !data.description || !data.price) {
      setError("Title, description, and price are required.");
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit(data);
        router.push("/admin/services");
      } catch {
        setError("Save failed. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Field label="Title *">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Web Development" />
      </Field>
      <Field label="Description *">
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " resize-none"} placeholder="What this service includes…" />
      </Field>
      <Field label="Features" hint="One feature per line">
        <textarea rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} className={inputClass + " resize-y"} placeholder="Responsive design&#10;SEO optimised&#10;CMS integration" />
      </Field>
      <Field label="Price *">
        <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="From $2,000" />
      </Field>
      <Field label="Order">
        <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputClass} min={0} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} className="rounded border-border" />
        Mark as "Most Popular"
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
          {isPending ? "Saving…" : "Save Service"}
        </button>
        <button type="button" onClick={() => router.push("/admin/services")} className="rounded-md border border-border px-5 py-2.5 text-sm text-foreground hover:bg-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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
