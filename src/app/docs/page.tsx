"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { AnchorLogo } from "@/components/AnchorLogo";

interface DocItem {
  id: string;
  title: string;
}

interface DocSection {
  id: string;
  title: string;
  items: DocItem[];
}

const SECTIONS: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      { id: "overview", title: "Overview" },
      { id: "quickstart", title: "Quickstart in 60s" },
      { id: "installation", title: "Installation" },
    ],
  },
  {
    id: "core-routing",
    title: "Core Routing",
    items: [
      { id: "localhost-subdomains", title: "Localhost Subdomains" },
      { id: "port-mapping", title: "Port Mapping & Proxying" },
      { id: "port-80-setup", title: "Running on Standard Port 80" },
    ],
  },
  {
    id: "local-network",
    title: "Local Network & Mobile",
    items: [
      { id: "mdns-discovery", title: "Zero-Config Local Access" },
      { id: "mobile-tv-portal", title: "Mobile & Smart TV Launchpad" },
      { id: "dev-hotspot", title: "Developer Wi-Fi Hotspot" },
    ],
  },
  {
    id: "edge-tunnels",
    title: "Global Edge Access",
    items: [
      { id: "vanity-domains", title: "Branded Vanity Domains" },
      { id: "remote-subdomains", title: "Multi-Service Remote Routing" },
      { id: "supporter-perks", title: "Supporter Licenses" },
    ],
  },
  {
    id: "showcase-profile",
    title: "Developer Showcase",
    items: [
      { id: "about-me-page", title: "Public About Me Profile" },
      { id: "hosting-projects", title: "Publishing Local Projects" },
      { id: "customizing-themes", title: "Custom Themes & Banners" },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    items: [
      { id: "common-questions", title: "Frequently Asked Questions" },
      { id: "firewall-access", title: "Network Discovery & Firewalls" },
    ],
  },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState<string>("overview");

  // Scrollspy: update active section as the user scrolls
  useEffect(() => {
    const allIds = SECTIONS.flatMap((s) => s.items.map((i) => i.id));

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (let i = allIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(allIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(allIds[i]);
          return;
        }
      }

      if (allIds.length > 0) {
        setActiveId(allIds[0]);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToItem = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
      setActiveId(id);
    }
  };

  const appUrl = "https://portside.lol";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does PortSide require editing the hosts file?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Modern web browsers natively recognize all *.localhost subdomains as loopback addresses (RFC 6761) without system hosts modifications.",
        },
      },
      {
        "@type": "Question",
        name: "How do I test localhost websites on mobile phones and tablets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Open http://<your-local-ip>/s/<project> on your phone or scan the high-redundancy QR code from the desktop dashboard for 100% free direct project testing across any iOS or Android browser over local Wi-Fi.",
        },
      },
      {
        "@type": "Question",
        name: "How does Smart TV 10-foot remote navigation work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Open the built-in browser on your LG webOS, Samsung Tizen, or Android TV and navigate to your LAN portal. Use the physical arrow keys on your remote control to navigate between service cards with 4px focus rings.",
        },
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Route Custom Subdomains to Dev Ports Without Editing /etc/hosts",
    description: "A step-by-step guide to configuring clean *.localhost subdomains for local development services using Portside.",
    totalTime: "PT1M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install Portside",
        text: "Download Portside.exe or install from source.",
        url: `${appUrl}/docs#installation`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Start Portside",
        text: "Launch the application. It automatically binds to Port 80.",
        url: `${appUrl}/docs#port-80-setup`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Map Service",
        text: "Map your internal dev port to a clean subdomain like api or shop.",
        url: `${appUrl}/docs#port-mapping`,
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Open in Browser",
        text: "Visit http://shop.localhost instantly without editing hosts files.",
        url: `${appUrl}/docs#overview`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060b13]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <AnchorLogo size={32} />
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-sky-400 transition">
                Portside
              </span>
            </Link>
            <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 text-xs font-mono font-semibold text-sky-400">
              Docs
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center min-h-[34px]">
              <Script
                src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
                strategy="afterInteractive"
                data-name="bmc-button"
                data-slug="pacts"
                data-color="#5F7FFF"
                data-emoji=""
                data-font="Cookie"
                data-text="Buy me a coffee"
                data-outline-color="#000000"
                data-font-color="#ffffff"
                data-coffee-color="#FFDD00"
              />
            </div>
            <a
              href="https://github.com/letsmakepact/PortSide"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white border border-white/10 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Documentation Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 w-full flex-1 flex gap-10">
        {/* Desktop Sidebar Navigation with Active Scrollspy */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-7 max-h-[calc(100vh-8rem)] overflow-y-auto pr-3 text-xs">
            {SECTIONS.map((section) => {
              const hasActiveChild = section.items.some((i) => i.id === activeId);

              return (
                <div key={section.id} className="space-y-2">
                  <p
                    className={`font-bold uppercase tracking-wider text-[11px] transition-colors ${
                      hasActiveChild ? "text-sky-400" : "text-slate-400"
                    }`}
                  >
                    {section.title}
                  </p>
                  <ul className="space-y-1 border-l border-white/10 pl-3">
                    {section.items.map((item) => {
                      const isActive = item.id === activeId;

                      return (
                        <li key={item.id} className="relative">
                          <a
                            href={`#${item.id}`}
                            onClick={(e) => scrollToItem(e, item.id)}
                            className={`block py-1.5 px-2 rounded-lg transition-all ${
                              isActive
                                ? "bg-sky-500/15 text-sky-300 font-bold -ml-3 pl-3 border-l-2 border-sky-400 shadow-xs"
                                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                            }`}
                          >
                            {item.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <article className="flex-1 min-w-0 max-w-4xl space-y-16">
          {/* SECTION 1: GETTING STARTED */}
          <section id="getting-started" className="space-y-8 scroll-mt-28">
            <div id="overview" className="border-b border-white/10 pb-6 scroll-mt-28">
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Getting Started
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
                PortSide Documentation
              </h1>
              <p className="text-base text-slate-300 mt-3 leading-relaxed">
                PortSide is a modern local reverse proxy that gives your development ports clean, memorable domain names. Replace random port numbers like <code className="text-sky-300 font-mono">:3000</code>, <code className="text-sky-300 font-mono">:8080</code>, and <code className="text-sky-300 font-mono">:5173</code> with clean subdomains like <code className="text-sky-300 font-mono">shop.localhost</code> and <code className="text-sky-300 font-mono">api.localhost</code>.
              </p>
            </div>

            {/* Quickstart Card */}
            <div id="quickstart" className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/30 via-slate-900 to-slate-950 p-6 space-y-4 scroll-mt-28">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 text-xs font-mono">01</span>
                Quickstart in 60 Seconds
              </h2>
              <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
                <li>
                  <strong className="text-white">Download the launcher:</strong> Grab <code className="font-mono text-sky-300">Portside.exe</code> from the releases page or run from source.
                </li>
                <li>
                  <strong className="text-white">Register your first service:</strong> Open the dashboard and map a hostname (e.g. <code className="font-mono text-sky-300">shop</code>) to your local server port (e.g. <code className="font-mono text-sky-300">3000</code>).
                </li>
                <li>
                  <strong className="text-white">Access immediately:</strong> Visit <code className="font-mono text-sky-300">http://shop.localhost</code> in your browser. No DNS configuration or hosts file editing required.
                </li>
              </ol>
            </div>

            {/* Installation */}
            <div id="installation" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white">Installation Options</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                PortSide runs as a lightweight native background daemon paired with a modern web dashboard:
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 font-mono text-xs text-slate-300 space-y-2">
                  <p className="text-slate-500"># Option A: Run the compiled native launcher</p>
                  <p className="text-sky-300">.\Portside.exe</p>
                  <p className="text-slate-500 pt-2"># Option B: Run via Node / source</p>
                  <p className="text-sky-300">git clone https://github.com/letsmakepact/PortSide.git</p>
                  <p className="text-sky-300">cd PortSide &amp;&amp; npm install &amp;&amp; npm run build &amp;&amp; npm start</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: CORE ROUTING */}
          <section id="core-routing" className="space-y-8 scroll-mt-28">
            <div id="localhost-subdomains" className="border-b border-white/10 pb-4 scroll-mt-28">
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Architecture
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Core Routing &amp; Localhost Subdomains
              </h2>
            </div>

            <div id="port-mapping" className="space-y-4 text-sm text-slate-300 leading-relaxed scroll-mt-28">
              <h3 className="text-lg font-bold text-white">Port Mapping &amp; Proxying</h3>
              <p>
                All modern web browsers natively resolve any subdomain of <code className="font-mono text-sky-300">*.localhost</code> to your local machine loopback address. PortSide intercepts incoming requests on port 80, inspects the requested subdomain, and transparently proxies traffic to the assigned internal port.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                  <h4 className="font-bold text-white text-sm">Browser Request</h4>
                  <p className="font-mono text-xs text-sky-300 bg-white/5 p-2 rounded-lg border border-white/5">
                    GET http://shop.localhost/cart
                  </p>
                  <p className="text-xs text-slate-400">
                    Browser resolves subdomain to 127.0.0.1 on port 80.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                  <h4 className="font-bold text-white text-sm">Proxy Upstream</h4>
                  <p className="font-mono text-xs text-emerald-300 bg-white/5 p-2 rounded-lg border border-white/5">
                    PROXY http://127.0.0.1:3000/cart
                  </p>
                  <p className="text-xs text-slate-400">
                    PortSide proxies request and rewrites headers seamlessly.
                  </p>
                </div>
              </div>
            </div>

            <div id="port-80-setup" className="space-y-3 pt-2 scroll-mt-28">
              <h3 className="text-lg font-bold text-white">Running on Standard HTTP Port 80</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                By default, PortSide binds to port 80 so URLs do not require a trailing port number. If another application occupies port 80, run the native launcher as Administrator to automatically reassign or configure an alternate application port in dashboard preferences.
              </p>
            </div>
          </section>

          {/* SECTION 3: LOCAL NETWORK & MOBILE */}
          <section id="local-network" className="space-y-8 scroll-mt-28">
            <div id="mdns-discovery" className="border-b border-white/10 pb-4 scroll-mt-28">
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Network Discovery
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Local Network &amp; Mobile / Smart TV Access
              </h2>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                Testing responsive web designs on real mobile phones, tablets, and Smart TV browsers is simplified with zero-configuration local network discovery:
              </p>

              <div className="space-y-3">
                <div id="mobile-tv-portal" className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3 scroll-mt-28">
                  <h3 className="text-base font-bold text-white flex items-center justify-between">
                    <span>Mobile &amp; Smart TV LAN Routing</span>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">Free Direct &middot; Supporter Dashboard</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Open <code className="font-mono text-sky-300">http://&lt;your-local-ip&gt;/s/&lt;project&gt;</code> on your phone or scan the QR code from the desktop dashboard for 100% free direct project testing across any iOS, Android, or Smart TV browser. Supporter accounts unlock the full interactive multi-service launchpad (<code className="font-mono text-sky-300">/lan</code>) and zero-config wildcard <code className="font-mono text-sky-300">*.local</code> Open-Air signals.
                  </p>
                </div>

                <div id="dev-hotspot" className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3 scroll-mt-28">
                  <h3 className="text-base font-bold text-white">
                    Developer Wi-Fi Hotspot Mode
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When developing on public Wi-Fi networks (coffee shops, conferences, airports) where client isolation is enabled, switch on the Developer Hotspot in dashboard settings. PortSide broadcasts an isolated local network SSID, allowing direct peer-to-peer testing between your laptop and test devices.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: GLOBAL EDGE TUNNELS */}
          <section id="edge-tunnels" className="space-y-8 scroll-mt-28">
            <div id="vanity-domains" className="border-b border-white/10 pb-4 scroll-mt-28">
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Edge Routing
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Global Edge Tunnels
              </h2>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                Supporters receive permanent branded subdomains under <code className="font-mono text-sky-300">*.portside.lol</code>. These tunnels connect your local development hardware to edge networks with global HTTPS encryption without opening router ports or exposing your home IP address:
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                  <h3 className="font-bold text-white text-sm">Root Vanity Domain</h3>
                  <p className="font-mono text-xs text-sky-300">https://&lt;handle&gt;.portside.lol/</p>
                  <p className="text-xs text-slate-400">
                    Serves your public developer showcase and live projects portfolio.
                  </p>
                </div>

                <div id="remote-subdomains" className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2 scroll-mt-28">
                  <h3 className="font-bold text-white text-sm">Service Routing</h3>
                  <p className="font-mono text-xs text-emerald-300">https://&lt;service&gt;.&lt;handle&gt;.portside.lol</p>
                  <p className="text-xs text-slate-400">
                    Routes globally to your designated local port (or via <code className="font-mono text-slate-300">/s/&lt;service&gt;</code>).
                  </p>
                </div>
              </div>

              <div id="supporter-perks" className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 mt-4 space-y-3 scroll-mt-28">
                <h3 className="text-sm font-bold text-amber-300">Unlocking Supporter Edge Perks</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Support PortSide on Buy Me a Coffee to receive your license key. Enter your key in the desktop dashboard under <strong className="text-white">Settings &rarr; Supporter &amp; Perks</strong> to activate your permanent branded domain instantly.
                </p>
                <div className="pt-1">
                  <a
                    href="https://buymeacoffee.com/pacts"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
                  >
                    Support on Buy Me a Coffee
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: DEVELOPER SHOWCASE */}
          <section id="showcase-profile" className="space-y-8 scroll-mt-28">
            <div id="about-me-page" className="border-b border-white/10 pb-4 scroll-mt-28">
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Public Portfolio
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Developer Showcase &amp; About Me Page
              </h2>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                Every supporter vanity domain comes with a customizable developer profile page. Visitors from anywhere on the internet can discover your bio, inspect your tech stack, and test your locally running projects in real-time.
              </p>

              <div className="space-y-4 pt-2">
                <div id="hosting-projects" className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-2 scroll-mt-28">
                  <h3 className="text-base font-bold text-white">
                    Publishing Local Projects
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    In dashboard settings under <strong className="text-white">Public Profile &amp; About Me</strong>, check the box next to any registered service to publish it. Visitors clicking <strong className="text-white">Open Live Project</strong> interact directly with your application over encrypted edge tunnels.
                  </p>
                </div>

                <div id="customizing-themes" className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-2 scroll-mt-28">
                  <h3 className="text-base font-bold text-white">
                    Custom Themes &amp; Banners
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Choose from six curated color palettes (Sky Blue, Matrix Emerald, Electric Violet, Golden Amber, Crimson Rose, Cyber Cyan) and five header banner presets. You can also specify custom banner URLs, social profiles, skills tags, and custom Linktree-style resource cards.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: TROUBLESHOOTING */}
          <section id="troubleshooting" className="space-y-8 scroll-mt-28">
            <div id="common-questions" className="border-b border-white/10 pb-4 scroll-mt-28">
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Support
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                <h3 className="font-bold text-white text-sm">Does PortSide require editing the hosts file?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No. Modern web browsers natively recognize all <code className="font-mono text-sky-300">*.localhost</code> subdomains as loopback addresses without system hosts modifications.
                </p>
              </div>

              <div id="firewall-access" className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2 scroll-mt-28">
                <h3 className="font-bold text-white text-sm">Why can&apos;t my phone connect to the LAN portal?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Verify that both devices are on the same Wi-Fi network and that Windows Firewall allows inbound connections to the PortSide launcher on port 80. If your router has client isolation enabled, turn on PortSide Developer Hotspot mode.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                <h3 className="font-bold text-white text-sm">Is my source code uploaded to any third-party cloud?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Never. PortSide runs locally on your physical machine. Only incoming HTTP requests pass through encrypted edge proxies directly to your designated local port.
                </p>
              </div>
            </div>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#060b13]/90 py-8 text-center text-xs text-slate-500 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AnchorLogo size={20} />
            <span className="font-semibold text-slate-400">PortSide Documentation</span>
          </div>
          <p>
            Created by pact (letsmakepact · @pactwithdevil)
          </p>
        </div>
      </footer>
    </div>
  );
}
