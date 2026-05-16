import Link from "next/link";
import { adminDb } from "@/lib/firebase/server";

async function getCounts() {
  const [projects, testimonials, services] = await Promise.all([
    adminDb.collection("projects").count().get(),
    adminDb.collection("testimonials").count().get(),
    adminDb.collection("services").count().get(),
  ]);
  return {
    projects: projects.data().count,
    testimonials: testimonials.data().count,
    services: services.data().count,
  };
}

const sections = [
  { label: "Projects", href: "/admin/projects", newHref: "/admin/projects/new" },
  { label: "Testimonials", href: "/admin/testimonials", newHref: "/admin/testimonials/new" },
  { label: "Services", href: "/admin/services", newHref: "/admin/services/new" },
  { label: "Settings", href: "/admin/settings", newHref: null },
] as const;

export default async function DashboardPage() {
  const counts = await getCounts();

  const stats = [
    { label: "Projects", count: counts.projects, href: "/admin/projects" },
    { label: "Testimonials", count: counts.testimonials, href: "/admin/testimonials" },
    { label: "Services", count: counts.services, href: "/admin/services" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{stat.count}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Links
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {sections.map((s) => (
            <div key={s.label} className="flex gap-2">
              <Link
                href={s.href}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                {s.label}
              </Link>
              {s.newHref && (
                <Link
                  href={s.newHref}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  + New
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
