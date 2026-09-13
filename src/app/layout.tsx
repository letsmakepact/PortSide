import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { JsonLd } from "@/components/seo/JsonLd";
import { I18nProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#060b13" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Portside · Name Your Localhost", template: "%s · Portside" },
  description:
    "Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config mDNS and mobile & TV access.",
  keywords: [
    "custom ports",
    "custom port routing",
    "cheap websites to host on",
    "free hosting alternative for developers",
    "open source cool projects",
    "open source reverse proxy",
    "localhost reverse proxy",
    "clean localhost subdomains",
    "local development port manager",
    "zero config reverse proxy",
    "ngrok alternative open source",
    "test dev server on mobile",
    "smart tv web testing",
    "mDNS local routing",
    "no etc hosts",
    "port 80 proxy",
    "portside",
  ],
  authors: [{ name: "pact", url: "https://github.com/letsmakepact" }],
  creator: "pact (letsmakepact)",
  category: "technology",
  classification: "Developer Tools",
  alternates: {
    canonical: appUrl,
    languages: {
      en: appUrl,
      "en-US": appUrl,
      "en-GB": `${appUrl}?lang=en-GB`,
      sv: `${appUrl}?lang=sv`,
      "zh-CN": `${appUrl}?lang=zh-CN`,
      nl: `${appUrl}?lang=nl`,
      hi: `${appUrl}?lang=hi`,
      "en-IN": `${appUrl}?lang=en-IN`,
      "x-default": appUrl,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Portside · Name Your Localhost",
    description:
      "Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config mDNS and mobile & TV access.",
    url: appUrl,
    siteName: "Portside",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Portside · Name Your Localhost",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portside · Name Your Localhost",
    description:
      "Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config mDNS and mobile & TV access.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <JsonLd appUrl={appUrl} />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2032%2032%27%20width%3D%2732%27%20height%3D%2732%27%3E%3Crect%20width%3D%2732%27%20height%3D%2732%27%20rx%3D%278%27%20fill%3D%27%230f172a%27%2F%3E%3Ccircle%20cx%3D%2716%27%20cy%3D%276%27%20r%3D%272.5%27%20stroke%3D%27%2338bdf8%27%20stroke-width%3D%272.2%27%20fill%3D%27none%27%2F%3E%3Crect%20x%3D%278.5%27%20y%3D%2710.5%27%20width%3D%2715%27%20height%3D%273%27%20rx%3D%271.5%27%20fill%3D%27%2338bdf8%27%20opacity%3D%270.9%27%2F%3E%3Crect%20x%3D%2714.5%27%20y%3D%278%27%20width%3D%273%27%20height%3D%2716%27%20rx%3D%271.5%27%20fill%3D%27%2338bdf8%27%2F%3E%3Cpath%20d%3D%27M7%2016C7%2021%2010.5%2025%2016%2025C21.5%2025%2025%2021%2025%2016%27%20stroke%3D%27%2338bdf8%27%20stroke-width%3D%272.8%27%20stroke-linecap%3D%27round%27%20fill%3D%27none%27%2F%3E%3Cpolygon%20points%3D%273.5%2C16.5%207.5%2C12%209.5%2C17%27%20fill%3D%27%2338bdf8%27%2F%3E%3Cpolygon%20points%3D%2728.5%2C16.5%2024.5%2C12%2022.5%2C17%27%20fill%3D%27%2338bdf8%27%2F%3E%3C%2Fsvg%3E"
        />
        <link rel="icon" href="/icon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/icon.png?v=2" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="alternate" type="application/rss+xml" title="Portside RSS Feed" href="/feed.xml" />
        <link rel="help" href="/llms.txt" title="Portside AI Reference" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("portside:theme");if(t==="light"){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans bg-slate-50/70 text-slate-900 dark:bg-[#0b0f19] dark:text-slate-100 antialiased selection:bg-slate-900 selection:text-white dark:selection:bg-sky-500">
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
