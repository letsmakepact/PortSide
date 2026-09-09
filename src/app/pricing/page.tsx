import type { Metadata } from "next";
import Link from "next/link";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export const metadata: Metadata = {
  title: "Pricing · 100% Free & Open Source · Portside",
  description:
    "Portside pricing: 100% free and open source forever for developers. Optional Supporter license for multi-device power users and team hosting.",
  keywords: [
    "portside pricing",
    "free reverse proxy",
    "open source pricing",
    "cheap dev hosting",
    "free localhost proxy",
    "free ngrok alternative pricing",
  ],
  alternates: {
    canonical: `${appUrl}/pricing`,
    languages: {
      en: `${appUrl}/pricing`,
      "en-US": `${appUrl}/pricing`,
      "x-default": `${appUrl}/pricing`,
    },
  },
  openGraph: {
    title: "Portside Pricing · 100% Free & Open Source",
    description: "Zero fees, zero subscriptions, zero bandwidth caps for local development.",
    url: `${appUrl}/pricing`,
    siteName: "Portside",
    locale: "en_US",
    type: "website",
  },
};

export default function PricingPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Portside",
    description: "Open source local reverse proxy and multi-device development cockpit.",
    brand: {
      "@type": "Brand",
      name: "pact",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Community Edition",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "100% Free Forever for developers, hobbyists, and personal workflows.",
      },
      {
        "@type": "Offer",
        name: "Supporter Tier",
        price: "5.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "One-time contribution via BuyMeACoffee for power users and supporters.",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:border-sky-400 shadow-sm transition">
              <AnchorLogo className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Portside <span className="text-xs font-medium text-sky-400 border border-sky-500/30 rounded px-1.5 py-0.2 bg-sky-950/30">pricing</span>
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

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/60 border border-sky-500/30 text-sky-300">
            Transparent, No-BS Pricing
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            100% Free Forever for Developers
          </h1>
          <p className="text-base text-slate-400 max-w-xl mx-auto">
            No recurring monthly subscriptions. No artificial bandwidth throttles. No surprise invoices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">Community</span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded">Free Forever</span>
              </div>
              <div>
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-slate-400 ml-2">no credit card needed</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ Unlimited custom *.localhost subdomains</li>
                <li className="flex items-center gap-2">✓ Port 80 reverse proxying (RFC 6761)</li>
                <li className="flex items-center gap-2">✓ Live port health &amp; latency tracking</li>
                <li className="flex items-center gap-2">✓ Mobile Wi-Fi QR code jump links</li>
                <li className="flex items-center gap-2">✓ Smart TV 10-foot remote D-pad navigation</li>
                <li className="flex items-center gap-2">✓ Standalone binary for Windows, Mac &amp; Linux</li>
              </ul>
            </div>
            <Link
              href="/docs"
              className="block w-full text-center text-xs font-semibold py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
            >
              Get Started
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-950/30 to-slate-900 border border-sky-500/40 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-sky-300 uppercase tracking-wider font-mono">Supporter</span>
                <span className="text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-500/40 px-2 py-0.5 rounded">Optional Perk</span>
              </div>
              <div>
                <span className="text-4xl font-extrabold text-white">Buy a Coffee</span>
                <span className="text-xs text-slate-400 ml-2">one-time</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ Everything in Community</li>
                <li className="flex items-center gap-2">✓ Clean Open-Air signals hostname resolution</li>
                <li className="flex items-center gap-2">✓ Full interactive LAN Cockpit at /lan</li>
                <li className="flex items-center gap-2">✓ Dedicated badge &amp; profile customization</li>
                <li className="flex items-center gap-2">✓ Support open source independent development</li>
              </ul>
            </div>
            <a
              href="https://buymeacoffee.com/pacts"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-xs font-semibold py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-sm shadow-sky-950"
            >
              Become a Supporter
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
