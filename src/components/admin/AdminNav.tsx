"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "Services", href: "/admin/services" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <nav className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-1">
        <span className="mr-4 text-sm font-semibold text-foreground">
          Admin
        </span>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <button
        onClick={handleSignOut}
        className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Sign out
      </button>
      <a
        href={process.env.NEXT_PUBLIC_BASE_URL ?? "/"}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        View site ↗
      </a>
    </nav>
  );
}
