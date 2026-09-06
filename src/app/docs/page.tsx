import type { Metadata } from "next";
import Link from "next/link";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config mDNS and mobile & TV access.",
  openGraph: {
    title: "Portside Documentation · Name Your Localhost",
    description:
      "Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config mDNS and mobile & TV access.",
    url: "https://portside.lol/docs",
  },
  twitter: {
    title: "Portside Documentation · Name Your Localhost",
    description:
      "Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config mDNS and mobile & TV access.",
  },
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
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

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-sm"
            >
              Open Dashboard
            </Link>
            <a
              href="https://github.com/letsmakepact/PortSide"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/60 border border-sky-500/30 text-sky-300">
            <AnchorLogo className="h-3.5 w-3.5 text-sky-400" />
            Developer Documentation
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Portside · Name Your Localhost
          </h1>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Route custom <code className="text-sky-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">.localhost</code> and <code className="text-sky-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">.local</code> domains directly to your dev servers without port numbers. Zero-config mDNS and mobile &amp; TV access.
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> What is Portside?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Portside is a local development reverse proxy and cockpit that maps memorable subdomains directly to your internal local ports on port 80. Instead of typing <code className="text-slate-300 font-mono">http://localhost:3000</code> or <code className="text-slate-300 font-mono">http://localhost:8080</code>, give every service its own clean hostname like <code className="text-sky-300 font-mono">http://api.localhost</code> or <code className="text-sky-300 font-mono">http://shop.localhost</code>.
          </p>
        </section>

        {/* Section 2: Quick Start */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> Quick Start
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-slate-300">Run the automated standalone installer:</p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto">
              curl -fsSL https://raw.githubusercontent.com/letsmakepact/PortSide/main/install.sh | bash
            </div>
            <p className="text-xs text-slate-400">
              Works across macOS, Linux, and Windows (via PowerShell / WSL).
            </p>
          </div>
        </section>

        {/* Section 3: Mobile & TV Access */}
        <section className="space-y-4 border-t border-slate-800/80 pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-sky-400">#</span> Mobile &amp; Smart TV Access
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Test responsive web apps and services directly on iOS devices, smart TVs, or external screens using zero-config mDNS routing:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 pl-2">
            <li>Connect your phone or device to the same Wi-Fi network.</li>
            <li>Navigate to <code className="text-sky-300 font-mono">http://portside.local</code> in Safari or Chrome.</li>
            <li>Open mapped services directly at <code className="text-sky-300 font-mono">http://&lt;service-name&gt;.local</code>.</li>
          </ul>
        </section>

        {/* Attribution Footer */}
        <footer className="border-t border-slate-800/80 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AnchorLogo className="h-4 w-4 text-sky-400" />
            <span>Portside · Created by <strong className="text-slate-400 font-semibold">pact</strong> (<a href="https://github.com/letsmakepact" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">letsmakepact</a>)</span>
          </div>
          <div>
            <a href="https://buymeacoffee.com/pacts" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition">
              Support Portside
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
