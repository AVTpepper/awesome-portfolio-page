import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/firebase/firestore";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://awesome-portfolio-page.web.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE_URL}/projects/${p.slug}`,
    lastModified: p.updatedAt.toDate(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/projects`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...projectEntries,
  ];
}
