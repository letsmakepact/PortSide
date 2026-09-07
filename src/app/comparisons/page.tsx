import type { Metadata } from "next";
import Link from "next/link";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export const metadata: Metadata = {
  title: "Portside Comparisons · Custom Ports, Cheap Hosting & Open Source Proxies",
  description:
    "How Portside compares to Ngrok, Cloudflare Tunnels, Traefik, Caddy, and manual /etc/hosts for managing custom ports and free local website hosting.",
  keywords: [
    "custom ports",
    "cheap websites to host on",
    "open source cool projects",
    "ngrok vs portside",
    "free ngrok alternative",
    "custom port routing",
    "local reverse proxy comparison",
  ],
  alternates: {
    canonical: `${appUrl}/comparisons`,
    languages: {
      en: `${appUrl}/comparisons`,
      "en-US": `${appUrl}/comparisons`,
      "x-default": `${appUrl}/comparisons`,
    },
  },
  openGraph: {
    title: "Portside Comparisons · Custom Ports, Cheap Hosting & Open Source Proxies",
    description:
      "Direct feature and cost comparison: Portside vs Ngrok, Cloudflare Tunnels, and manual hosts file editing.",
    url: `${appUrl}/comparisons`,
    siteName: "Portside",
    locale: "en_US",
    type: "article",
  },
};

export default function ComparisonsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the best open source tool for managing custom ports locally?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Portside is the premier open-source tool for managing custom dev ports. It runs on HTTP Port 80, binds human-readable subdomains (e.g. api.localhost, app.localhost) to custom internal ports (:3000, :8080) according to RFC 6761, and requires zero hosts file modification.",
        },
      },
      {
        "@type": "Question",
        name: "How can I host dev websites cheaply or for free without paying for cloud subscriptions?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Instead of paying for expensive preview environments or subscription tunnels like Ngrok Pro, Portside offers a 100% free local and LAN hosting solution. You can preview websites on phones, tablets, and smart TVs over local Wi-Fi with high-speed zero-latency QR codes and mDNS.",
        },
      },
      {
        "@type": "Question",
        name: "Why is Portside considered one of the coolest open source projects for web developers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Portside combines zero-config RFC 6761 local reverse proxying with high-redundancy QR codes for mobile devices and a dedicated 10-foot spatial D-pad remote interface for Smart TVs, providing a complete multi-device development cockpit in a single lightweight binary.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
                Portside <span className="text-xs font-medium text-sky-400 border border-sky-500/30 rounded px-1.5 py-0.2 bg-sky-950/30">comparisons</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">name your localhost</span>
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
              href="/open-source"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              Open Source
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-sm"
            >
              Open Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/60 border border-sky-500/30 text-sky-300">
            <AnchorLogo className="h-3.5 w-3.5 text-sky-400" />
            Architectural Benchmark &amp; Feature Matrix
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            How Portside Compares: Custom Ports &amp; Zero-Cost Hosting
          </h1>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-3xl">
            Whether you are wrestling with conflicting custom ports, seeking cheap website hosting alternatives for client previews, or exploring cool open source projects, see how Portside stacks up against traditional workflows and paid tunnels.
          </p>
        </div>

        {/* Comparison Matrix Table */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> Feature Matrix: Portside vs. Alternatives
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-200 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Feature</th>
                  <th className="p-3 text-sky-300 font-bold">Portside</th>
                  <th className="p-3">Ngrok (Free / Paid)</th>
                  <th className="p-3">Manual /etc/hosts</th>
                  <th className="p-3">Cloudflare Tunnel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <tr>
                  <td className="p-3 font-semibold text-white">Cost / Licensing</td>
                  <td className="p-3 text-sky-400 font-bold">100% Free / Open Source</td>
                  <td className="p-3">$10-$20+/mo for custom domains</td>
                  <td className="p-3">Free (Manual)</td>
                  <td className="p-3">Free / Cloud Account Required</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Custom Port Routing</td>
                  <td className="p-3 text-emerald-400">Automatic (RFC 6761)</td>
                  <td className="p-3 text-amber-400">CLI command per port</td>
                  <td className="p-3 text-rose-400">Cannot route port numbers</td>
                  <td className="p-3 text-slate-400">Requires public DNS setup</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Zero Root / Admin Needed</td>
                  <td className="p-3 text-emerald-400">Yes (Port 80 binding)</td>
                  <td className="p-3 text-emerald-400">Yes</td>
                  <td className="p-3 text-rose-400">Requires root / Admin edits</td>
                  <td className="p-3 text-amber-400">Requires daemon installation</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Mobile Wi-Fi QR Access</td>
                  <td className="p-3 text-emerald-400">Built-in (Error Correction H)</td>
                  <td className="p-3 text-slate-400">Via public tunnel URL</td>
                  <td className="p-3 text-rose-400">No</td>
                  <td className="p-3 text-slate-400">Via public tunnel URL</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Smart TV 10-Foot Remote UI</td>
                  <td className="p-3 text-emerald-400">Yes (Spatial D-pad)</td>
                  <td className="p-3 text-rose-400">No</td>
                  <td className="p-3 text-rose-400">No</td>
                  <td className="p-3 text-rose-400">No</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Latency &amp; Bandwidth</td>
                  <td className="p-3 text-emerald-400">LAN Speed (~0ms latency, unlimited)</td>
                  <td className="p-3 text-amber-400">Internet hop, speed throttled</td>
                  <td className="p-3 text-emerald-400">Local</td>
                  <td className="p-3 text-amber-400">Internet hop through cloud Edge</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Deep Dive: Custom Ports */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8" id="custom-ports">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> 1. Managing Custom Ports Without The Friction
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Full-stack web applications quickly become a mess of custom ports: your Next.js frontend is on <code className="text-sky-300 font-mono">:3000</code>, GraphQL or REST API on <code className="text-sky-300 font-mono">:8080</code>, Stripe webhook listener on <code className="text-sky-300 font-mono">:4242</code>, and admin portal on <code className="text-sky-300 font-mono">:5173</code>.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            With Portside, every service gets a clean URL like <code className="text-sky-300 font-mono">http://api.localhost</code> or <code className="text-sky-300 font-mono">http://billing.localhost</code>. Portside handles the reverse proxying locally on Port 80 with real-time port latency metrics and health status checks.
          </p>
        </section>

        {/* Deep Dive: Cheap / Free Hosting Alternative */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8" id="cheap-hosting">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> 2. Cheap Websites to Host On? Try Zero-Cost Local &amp; LAN Hosting
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Developers frequently search for &quot;cheap websites to host on&quot; or &quot;cheap cloud hosting&quot; just to showcase progress to clients or QA mobile views. Portside eliminates cloud hosting costs for local workflows entirely:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li><strong>Zero monthly hosting fees</strong>: Run directly on your machine or an old office Mac mini / Linux box.</li>
            <li><strong>Instant LAN Sharing</strong>: Any device on the same Wi-Fi can scan the LAN QR code to test your site.</li>
            <li><strong>Zero External Data Leaks</strong>: Your client credentials and test databases never leave your private network.</li>
          </ul>
        </section>

        {/* Deep Dive: Open Source Cool Projects */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8" id="open-source-project">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> 3. Cool Open Source Projects: Why Portside Stands Out
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            In an ecosystem of heavy enterprise proxies and proprietary SaaS tunnels, Portside stands out as a genuine developer-first open-source utility created by <a href="https://github.com/letsmakepact" className="text-sky-400 hover:underline">pact</a>.
          </p>
          <div className="flex gap-4 pt-2">
            <Link
              href="/docs"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition"
            >
              Read The Docs
            </Link>
            <a
              href="https://github.com/letsmakepact/PortSide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-white transition"
            >
              Star on GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
