import type { Metadata } from "next";
import Link from "next/link";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export const metadata: Metadata = {
  title: "Open Source Developer Cockpit · Portside by pact",
  description:
    "Discover why Portside is one of the coolest open source projects for web developers. Route custom ports, test on mobile via QR, and navigate on Smart TVs.",
  keywords: [
    "open source cool projects",
    "open source developer tools",
    "best open source projects 2026",
    "custom ports open source",
    "cheap websites to host on",
    "local reverse proxy github",
    "portside github",
  ],
  alternates: {
    canonical: `${appUrl}/open-source`,
    languages: {
      en: `${appUrl}/open-source`,
      "en-US": `${appUrl}/open-source`,
      "x-default": `${appUrl}/open-source`,
    },
  },
  openGraph: {
    title: "Open Source Developer Cockpit · Portside",
    description:
      "A developer-first open source reverse proxy that eliminates port numbers and connects phones, tablets, and Smart TVs.",
    url: `${appUrl}/open-source`,
    siteName: "Portside",
    locale: "en_US",
    type: "article",
  },
};

export default function OpenSourcePage() {
  const openSourceSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "Portside",
    codeRepository: "https://github.com/letsmakepact/PortSide",
    programmingLanguage: "TypeScript, JavaScript",
    author: {
      "@type": "Person",
      name: "pact",
      url: "https://github.com/letsmakepact",
      sameAs: ["https://t.me/pactwithdevil"],
    },
    description:
      "A lightweight open source local development reverse proxy and multi-device cockpit that routes clean *.localhost subdomains to internal dev ports without editing hosts files.",
    license: "https://github.com/letsmakepact/PortSide/blob/main/LICENSE",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(openSourceSchema) }}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:border-sky-400 shadow-sm transition">
              <AnchorLogo className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Portside <span className="text-xs font-medium text-sky-400 border border-sky-500/30 rounded px-1.5 py-0.2 bg-sky-950/30">open-source</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">by pact</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/docs"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              Docs
            </Link>
            <Link
              href="/comparisons"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              Comparisons
            </Link>
            <a
              href="https://github.com/letsmakepact/PortSide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-sm"
            >
              GitHub Repo
            </a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/60 border border-sky-500/30 text-sky-300">
            <AnchorLogo className="h-3.5 w-3.5 text-sky-400" />
            Cool Open Source Projects · 2026 Showcase
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Why Portside is Among the Coolest Open Source Dev Utilities
          </h1>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-3xl">
            Created by <a href="https://github.com/letsmakepact" className="text-sky-400 font-medium hover:underline">pact</a>, Portside transforms clumsy port management into a seamless, elegant workflow designed specifically for modern full-stack web and multi-device engineering.
          </p>
        </div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/80 pt-8">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="text-sky-400 font-bold text-sm uppercase tracking-wider">01 / Zero-Config</div>
            <h3 className="text-lg font-bold text-white">Custom Ports Solved</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maps clean subdomains to internal port numbers using standard RFC 6761 localhost resolution. Never touch an /etc/hosts file again.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="text-sky-400 font-bold text-sm uppercase tracking-wider">02 / Zero Cost</div>
            <h3 className="text-lg font-bold text-white">Cheap Hosting Alternative</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Why pay for cloud hosting or tunnel subscriptions? Test live websites on phones and laptops over Wi-Fi with instant camera QR codes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="text-sky-400 font-bold text-sm uppercase tracking-wider">03 / Multi-Screen</div>
            <h3 className="text-lg font-bold text-white">Smart TV 10-Foot UI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built-in spatial D-pad remote navigation for testing responsive web apps directly on living room displays and smart televisions.
            </p>
          </div>
        </section>

        {/* Community & Attribution */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> Community &amp; Open Source Attribution
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Portside is built with love and maintained by <strong>pact</strong> (<a href="https://github.com/letsmakepact" className="text-sky-400 hover:underline">@letsmakepact</a> on GitHub, <a href="https://t.me/pactwithdevil" className="text-sky-400 hover:underline">@pactwithdevil</a> on Telegram).
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              GitHub: https://github.com/letsmakepact/PortSide
            </div>
            <a
              href="https://github.com/letsmakepact/PortSide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition"
            >
              View on GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
