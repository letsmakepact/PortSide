import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Portside · Name Your Localhost",
    short_name: "Portside",
    description:
      "Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config mDNS and mobile & TV access.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f19",
    theme_color: "#0ea5e9",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
