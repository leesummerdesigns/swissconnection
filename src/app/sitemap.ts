import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://swissconnection.vercel.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  // Dynamic provider pages
  let providerPages: MetadataRoute.Sitemap = [];
  try {
    const providers = await prisma.user.findMany({
      where: { role: "PROVIDER", providerProfile: { services: { some: {} } } },
      select: { id: true, updatedAt: true },
    });

    providerPages = providers.map((p) => ({
      url: `${baseUrl}/providers/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // If DB fails, return static pages only
  }

  return [...staticPages, ...providerPages];
}
