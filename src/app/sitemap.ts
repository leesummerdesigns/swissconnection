import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { locales } from "@/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://swissconnection.vercel.app";

  const staticPaths = [
    { path: "", changeFrequency: "daily" as const, priority: 1 },
    { path: "/search", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/login", changeFrequency: "monthly" as const, priority: 0.3 },
    { path: "/register", changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  // Generate locale variants for static pages
  const staticPages: MetadataRoute.Sitemap = staticPaths.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${page.path}`])
        ),
      },
    }))
  );

  // Dynamic provider pages with locale variants
  let providerPages: MetadataRoute.Sitemap = [];
  try {
    const providers = await prisma.user.findMany({
      where: { role: "PROVIDER", providerProfile: { services: { some: {} } } },
      select: { id: true, updatedAt: true },
    });

    providerPages = providers.flatMap((p) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/providers/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/providers/${p.id}`])
          ),
        },
      }))
    );
  } catch {
    // If DB fails, return static pages only
  }

  return [...staticPages, ...providerPages];
}
