import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${appUrl}/docs`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${appUrl}/docs`,
          "en-US": `${appUrl}/docs`,
          "x-default": `${appUrl}/docs`,
        },
      },
    },
    {
      url: `${appUrl}/comparisons`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
      alternates: {
        languages: {
          en: `${appUrl}/comparisons`,
          "en-US": `${appUrl}/comparisons`,
          "x-default": `${appUrl}/comparisons`,
        },
      },
    },
    {
      url: `${appUrl}/open-source`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${appUrl}/open-source`,
          "en-US": `${appUrl}/open-source`,
          "x-default": `${appUrl}/open-source`,
        },
      },
    },
    {
      url: `${appUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: {
        languages: {
          en: `${appUrl}/`,
          "en-US": `${appUrl}/`,
          "x-default": `${appUrl}/`,
        },
      },
    },
    {
      url: `${appUrl}/lan`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${appUrl}/lan`,
          "en-US": `${appUrl}/lan`,
          "x-default": `${appUrl}/lan`,
        },
      },
    },
    {
      url: `${appUrl}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          en: `${appUrl}/login`,
          "en-US": `${appUrl}/login`,
          "x-default": `${appUrl}/login`,
        },
      },
    },
  ];
}
