import type { MetadataRoute } from "next";
import { categories, getCategorySlug } from "@/data/categories";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await db.story.findMany({
    where: {
      published: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      chapters: {
        where: {
          published: true,
        },
        orderBy: {
          number: "asc",
        },
      },
    },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/truyen"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/the-loai"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const storyRoutes = stories.map((story) => ({
    url: absoluteUrl(`/truyen/${story.slug}`),
    lastModified: story.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const chapterRoutes = stories.flatMap((story) =>
    story.chapters.map((chapter) => ({
      url: absoluteUrl(`/doc-truyen/${story.slug}/${chapter.id}`),
      lastModified: chapter.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  const categorySlugs = new Set([
    ...categories.map((category) => category.slug),
    ...stories.map((story) => getCategorySlug(story.category)),
  ]);

  const categoryRoutes = Array.from(categorySlugs).map(
    (slug) => ({
      url: absoluteUrl(`/the-loai/${slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...storyRoutes, ...chapterRoutes, ...categoryRoutes];
}
