import type { Metadata } from "next";
import Link from "next/link";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export const metadata: Metadata = {
  title: "Documentation · Name Your Localhost Reverse Proxy",
  description:
    "Comprehensive developer guide for Portside: zero-config *.localhost reverse proxy, port 80 routing without /etc/hosts, Open-Air signals mobile access, and 10-foot Smart TV testing.",
  keywords: [
    "localhost reverse proxy documentation",
    "clean localhost subdomains",
    "reverse proxy port 80",
    "local development Open-Air signals",
    "smart tv remote testing",
    "test localhost on iphone android",
    "zero config local domains",
  ],
  alternates: {
    canonical: `${appUrl}/docs`,
    languages: {
      en: `${appUrl}/docs`,
      "en-US": `${appUrl}/docs`,
      "x-default": `${appUrl}/docs`,
    },
  },
  openGraph: {
    title: "Portside Documentation · Name Your Localhost",
    description:
      "Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config Open-Air signals and mobile & TV access.",
    url: `${appUrl}/docs`,
    siteName: "Portside",
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portside Documentation · Name Your Localhost",
    description:
      "Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config Open-Air signals and mobile & TV access.",
    creator: "@pactwithdevil",
  },
};

export default function DocsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does Portside require editing /etc/hosts or C:\\Windows\\System32\\drivers\\etc\\hosts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Modern web browsers and operating systems natively resolve any domain ending in .localhost to 127.0.0.1 (RFC 6761). Portside listens on port 80 and inspects the HTTP Host header to reverse-proxy traffic directly to your target internal ports.",
        },
      },
      {
        "@type": "Question",
        name: "How do I test localhost services on mobile phones and tablets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Portside provides Error Correction Level H camera QR codes in the LAN dashboard modal. Connecting your smartphone to the same local Wi-Fi allows instant direct access via http://<lan-ip>/s/<project> or http://<project>.<lan-ip>.nip.io without manual proxy configuration.",
        },
      },
      {
        "@type": "Question",
        name: "How does Smart TV 10-foot remote navigation work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Open the built-in browser on LG webOS, Samsung Tizen, or Android TV and navigate to http://<lan-ip>/lan. Use the physical arrow keys on your TV remote (ArrowUp, ArrowDown, ArrowLeft, ArrowRight) to navigate cards with 4px sky-blue focus rings and press Enter/OK to launch services full screen.",
        },
      },
      {
        "@type": "Question",
        name: "Is Portside free for personal development?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Portside is 100% free forever for individual developers, hobbyists, and personal workflows under the Portside Non-Commercial Public License (PNC-1.0).",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: appUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Documentation",
        item: `${appUrl}/docs`,
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Route Custom Subdomains to Dev Ports Without Editing /etc/hosts",
    description:
      "A step-by-step guide to configuring clean *.localhost subdomains for local development services using Portside.",
    totalTime: "PT1M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install Portside",
        text: "Download the standalone launcher executable or install via curl script: curl -fsSL https://raw.githubusercontent.com/letsmakepact/PortSide/main/install.sh | bash",
        url: `${appUrl}/docs#quick-start`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Start Portside Proxy",
        text: "Launch the application. Portside automatically binds to Port 80 and begins listening for HTTP Host headers.",
        url: `${appUrl}/docs#architecture`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Map Your Custom Subdomain",
        text: "Open the dashboard and click New Service. Enter your desired subdomain (e.g. api) and internal dev port (e.g. 8080).",
        url: `${appUrl}/docs#features`,
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Access Without Port Numbers",
        text: "Open http://api.localhost directly in any modern browser. Traffic routes seamlessly without modifying hosts files.",
        url: `${appUrl}/docs#what-is-portside`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:border-sky-400 shadow-sm shadow-sky-950/50 transition">
              <AnchorLogo className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Portside <span className="text-xs font-medium text-sky-400 border border-sky-500/30 rounded px-1.5 py-0.2 bg-sky-950/30">docs</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">name your localhost</span>
            </div>
          </Link>

          <nav aria-label="Documentation quick links" className="flex items-center gap-3">
            <Link
              href="/comparisons"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              Comparisons
            </Link>
            <Link
              href="/ngrok-alternative"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              Ngrok Alternative
            </Link>
            <Link
              href="/pricing"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-sm"
            >
              Open Dashboard
            </Link>
            <a
              href="https://github.com/letsmakepact/PortSide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero & Documentation Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/60 border border-sky-500/30 text-sky-300">
            <AnchorLogo className="h-3.5 w-3.5 text-sky-400" />
            Developer Documentation &amp; Architecture
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Portside · Localhost Reverse Proxy &amp; Multi-Device Cockpit
          </h1>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Route custom <code className="text-sky-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">*.localhost</code> and <code className="text-sky-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">*.local</code> domains directly to your dev servers without port numbers. Zero-config Open-Air signals, camera QR codes, and Smart TV remote controls.
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8" id="what-is-portside">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> What is Portside?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Portside is a local development reverse proxy, cockpit, and multi-device launchpad. By running on HTTP port 80, it maps human-memorable subdomains directly to your internal local ports (such as <code className="text-slate-300 font-mono">:3000</code>, <code className="text-slate-300 font-mono">:8080</code>, or <code className="text-slate-300 font-mono">:5173</code>).
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Instead of juggling cumbersome port numbers in browser history, every microservice or app gets a clean, dedicated hostname:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">API Service</div>
              <div className="text-sm font-semibold text-sky-300">http://api.localhost</div>
              <div className="text-[11px] text-slate-500 mt-1">Routes to :8081</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">Web Storefront</div>
              <div className="text-sm font-semibold text-sky-300">http://shop.localhost</div>
              <div className="text-[11px] text-slate-500 mt-1">Routes to :3000</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">Admin Dashboard</div>
              <div className="text-sm font-semibold text-sky-300">http://admin.localhost</div>
              <div className="text-[11px] text-slate-500 mt-1">Routes to :4000</div>
            </div>
          </div>
        </section>

        {/* Section 2: Quick Start & Installation */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8" id="quick-start">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> Quick Start &amp; Standalone Launcher
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Portside provides pre-compiled standalone executables for Windows, macOS (Apple Silicon &amp; Intel), and Linux that configure dependencies and check GitHub releases for automated updates:
          </p>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-300">One-Line Terminal Setup (macOS &amp; Linux):</p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto">
              curl -fsSL https://raw.githubusercontent.com/letsmakepact/PortSide/main/install.sh | bash
            </div>
            <p className="text-xs text-slate-400">
              On Windows, download <code className="text-sky-300 font-mono">Portside.exe</code> directly from GitHub Releases or run via WSL / PowerShell.
            </p>
          </div>
        </section>

        {/* Section 3: Cross-Device Testing */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8" id="multi-device-testing">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> Multi-Device Testing: Mobile &amp; Smart TV
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Eliminate HDMI cables and complicated mobile proxy setups. Test responsive websites across multiple screens directly on your local network:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                Mobile Phones &amp; Tablets (iOS / Android)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan high-redundancy QR codes (Error Correction Level H) with your phone camera to jump directly to mapped services over Wi-Fi without typing IP addresses.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                Smart TVs &amp; 10-Foot Displays
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built-in spatial D-pad navigation for TV remotes (LG webOS, Samsung Tizen, Android TV, Fire TV). Use arrow keys to glide between cards with 4px glowing sky-blue focus indicators.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Frequently Asked Questions (FAQ) */}
        <section className="space-y-6 border-t border-slate-800/80 pt-8" id="frequently-asked-questions">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> Frequently Asked Questions (FAQ)
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
              <h3 className="text-sm font-bold text-white">
                Does Portside require editing my hosts file?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No. Modern operating systems and browsers natively resolve any <code className="text-sky-300 font-mono">*.localhost</code> hostname directly to loopback (<code className="text-slate-400 font-mono">127.0.0.1</code>) per RFC 6761 specifications. Portside binds to port 80 and reverse-proxies your requests automatically based on the Host header.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
              <h3 className="text-sm font-bold text-white">
                How does Portside avoid port 80 conflicts?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Portside includes automated diagnostic checks for existing port 80 listeners (like Apache, IIS, or system proxies). If port 80 is occupied, you can configure a custom fallback port in <code className="text-sky-300 font-mono">.env</code> while still leveraging Portside&apos;s multi-device launchpad.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
              <h3 className="text-sm font-bold text-white">
                Is Portside free for personal and hobbyist use?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Yes, Portside is completely free for individual developers, students, and hobbyists under the Portside Non-Commercial Public License (PNC-1.0).
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Link to Portside / Developer Badges */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8" id="developer-badge">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> Link to Portside in Your Project
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Building a multi-service repo or microservice toolkit? Add the Portside badge to your README to let contributors know they can route clean <code className="text-sky-300 font-mono">*.localhost</code> domains without editing hosts files:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="font-mono text-xs text-sky-300 overflow-x-auto select-all">
              {`[![Powered by Portside](https://img.shields.io/badge/Dev_Router-Portside-38bdf8?style=flat-square)](https://portside.lol)`}
            </div>
            <p className="text-[11px] text-slate-400">
              Renders as: <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-sky-500 text-slate-950 rounded">Dev_Router | Portside</span>
            </p>
          </div>
        </section>

        {/* Attribution & Creator Footer */}
        <footer className="border-t border-slate-800/80 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AnchorLogo className="h-4 w-4 text-sky-400" />
            <span>
              Portside · Created by <strong className="text-slate-400 font-semibold">pact</strong> (
              <a
                href="https://github.com/letsmakepact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline"
              >
                letsmakepact
              </a>
              )
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/lan" className="hover:text-sky-400 transition">
              LAN Launchpad
            </Link>
            <a
              href="https://buymeacoffee.com/pacts"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition"
            >
              Support Portside
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
