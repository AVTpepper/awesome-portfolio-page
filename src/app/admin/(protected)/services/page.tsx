import Link from "next/link";
import { getServices } from "@/lib/firebase/firestore";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteService } from "./actions";

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Services</h1>
        <Link
          href="/admin/services/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
        >
          + New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No services yet.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Popular</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{s.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.price}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.order}</td>
                  <td className="px-4 py-3">
                    {s.popular ? (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/services/${s.id}/edit`} className="text-accent hover:underline">Edit</Link>
                      <DeleteButton action={deleteService.bind(null, s.id)} />
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
