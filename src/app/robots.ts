import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/docs",
          "/docs/",
          "/lan",
          "/lan/",
          "/favicon.ico",
          "/icon.svg",
          "/icon.png",
          "/icon-192.png",
          "/icon-512.png",
          "/apple-icon.png",
          "/apple-touch-icon.png",
          "/manifest.webmanifest",
          "/opengraph-image",
          "/twitter-image",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/profile",
          "/profile/",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
