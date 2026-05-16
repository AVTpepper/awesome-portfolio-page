import Link from "next/link";
import { getTestimonials } from "@/lib/firebase/firestore";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteTestimonial } from "./actions";

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
        <Link
          href="/admin/testimonials/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
        >
          + New Testimonial
        </Link>
      </div>

      {testimonials.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No testimonials yet.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {testimonials.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.role}{t.company ? `, ${t.company}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {t.featured ? (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/testimonials/${t.id}/edit`} className="text-accent hover:underline">Edit</Link>
                      <DeleteButton action={deleteTestimonial.bind(null, t.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
