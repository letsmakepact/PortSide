import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export default function robots(): MetadataRoute.Robots {
  const allowedPaths = [
    "/",
    "/docs",
    "/docs/",
    "/comparisons",
    "/comparisons/",
    "/ngrok-alternative",
    "/ngrok-alternative/",
    "/pricing",
    "/pricing/",
    "/open-source",
    "/open-source/",
    "/lan",
    "/lan/",
    "/llms.txt",
    "/llms-full.txt",
    "/feed.xml",
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
  ];

  const disallowedPaths = [
    "/dashboard",
    "/dashboard/",
    "/profile",
    "/profile/",
    "/api/",
    "/_next/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: allowedPaths,
        disallow: disallowedPaths,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended",
          "Amazonbot",
          "Applebot-Extended",
          "Bingbot",
        ],
        allow: allowedPaths,
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
