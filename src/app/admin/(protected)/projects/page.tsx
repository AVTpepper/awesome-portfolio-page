import Link from "next/link";
import { getProjects } from "@/lib/firebase/firestore";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProject } from "./actions";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No projects yet.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.order}</td>
                  <td className="px-4 py-3">
                    {p.featured ? (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                        Yes
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/projects/${p.id}/edit`}
                        className="text-accent hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton action={deleteProject.bind(null, p.id)} />
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
