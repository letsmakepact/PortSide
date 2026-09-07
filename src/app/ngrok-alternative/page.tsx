import type { Metadata } from "next";
import Link from "next/link";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export const metadata: Metadata = {
  title: "Best Free Open Source Ngrok Alternative · Portside",
  description:
    "Looking for a free open source Ngrok alternative? Portside routes custom .localhost domains to internal ports with 0 ms cloud latency, zero bandwidth limits, and no account required.",
  keywords: [
    "ngrok alternative",
    "free ngrok alternative",
    "open source ngrok alternative",
    "best ngrok alternatives 2026",
    "self hosted ngrok alternative",
    "local reverse proxy",
    "custom ports without ngrok",
  ],
  alternates: {
    canonical: `${appUrl}/ngrok-alternative`,
    languages: {
      en: `${appUrl}/ngrok-alternative`,
      "en-US": `${appUrl}/ngrok-alternative`,
      "x-default": `${appUrl}/ngrok-alternative`,
    },
  },
  openGraph: {
    title: "Best Free Open Source Ngrok Alternative · Portside",
    description:
      "Route custom ports locally with zero cloud latency, no account creation, and instant mobile Wi-Fi QR access.",
    url: `${appUrl}/ngrok-alternative`,
    siteName: "Portside",
    locale: "en_US",
    type: "article",
  },
};

export default function NgrokAlternativePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the best free open-source alternative to Ngrok?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Portside is the premier free, open-source alternative to Ngrok for local and LAN development. Unlike Ngrok which tunnels all traffic through external cloud servers with bandwidth caps and random subdomains on free tiers, Portside provides clean *.localhost domains, Port 80 reverse proxying, zero latency, and instant QR-based mobile testing without requiring any account.",
        },
      },
      {
        "@type": "Question",
        name: "Why choose Portside over Ngrok for local web development?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Portside requires zero registration, has no bandwidth or session timeout limits, keeps sensitive credentials and customer databases entirely on your local machine, and offers specialized multi-device features like Smart TV remote controls and camera QR code launchpads.",
        },
      },
      {
        "@type": "Question",
        name: "Does Portside cost money or have a paid tier like Ngrok?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Portside is 100% free and open-source for personal development, hobbyists, and local workflows under the PNC-1.0 license. There are no artificial limits on routes or tunnels.",
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

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:border-sky-400 shadow-sm transition">
              <AnchorLogo className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Portside <span className="text-xs font-medium text-sky-400 border border-sky-500/30 rounded px-1.5 py-0.2 bg-sky-950/30">alternative</span>
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
              href="/comparisons"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              Comparisons
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

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/60 border border-sky-500/30 text-sky-300">
            <AnchorLogo className="h-3.5 w-3.5 text-sky-400" />
            Tired of Ngrok Session Limits &amp; Paid Plans?
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            The Free, Open Source Ngrok Alternative for Local Development
          </h1>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-3xl">
            Ngrok has become increasingly expensive and restricted for everyday web developers. Portside gives you clean named subdomains, multi-port routing, and instant mobile device testing over Wi-Fi without cloud latency or monthly subscriptions.
          </p>
        </div>

        {/* 4 Key Comparison Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/80 pt-8">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="text-sky-400 font-bold text-xs uppercase tracking-wider">01 / Zero Accounts &amp; Privacy</div>
            <h3 className="text-base font-bold text-white">No Signups, No Telemetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ngrok requires creating an account and registering authtokens just to expose a local port. Portside runs 100% locally on your machine—no credit cards, no tracking, zero cloud data leakage.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="text-sky-400 font-bold text-xs uppercase tracking-wider">02 / Unlimited Speed &amp; Data</div>
            <h3 className="text-base font-bold text-white">Direct LAN Speed (~0ms)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ngrok tunnels every byte through distant cloud data centers, creating lag on large assets and video streaming. Portside routes directly over your local interface and Wi-Fi at Gigabit speeds.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="text-sky-400 font-bold text-xs uppercase tracking-wider">03 / Custom Subdomains Free</div>
            <h3 className="text-base font-bold text-white">No Random Jumbled URLs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Free Ngrok gives you transient URLs like <code className="text-sky-300 font-mono">928a-12-4.ngrok-free.app</code> that break when you restart. Portside gives you permanent, memorable domains like <code className="text-sky-300 font-mono">api.localhost</code> and <code className="text-sky-300 font-mono">store.localhost</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="text-sky-400 font-bold text-xs uppercase tracking-wider">04 / Multi-Device Testing</div>
            <h3 className="text-base font-bold text-white">Phone QR Codes &amp; TV Remotes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan high-redundancy QR codes with your phone or tablet camera to instantly view projects on your local network. Test responsive web apps on Smart TVs using spatial D-pad remote controls.
            </p>
          </div>
        </section>

        {/* Action / Download Box */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Switch to Portside in Under 60 Seconds</h3>
            <p className="text-xs text-slate-400 mt-1">Single portable binary for Windows, macOS, and Linux. No dependencies required.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/docs"
              className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-sm"
            >
              Get Started Free
            </Link>
            <a
              href="https://github.com/letsmakepact/PortSide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
            >
              View GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
