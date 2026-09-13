"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  Sparkles,
  Zap,
  Globe,
  Wifi,
  Radio,
  Tv,
  Smartphone,
  ShieldCheck,
  Server,
  KeyRound,
  Check,
  ArrowRight,
  ExternalLink,
  Laptop,
  Terminal,
  Lock,
  Layers,
  Palette,
  Clock,
  HelpCircle,
} from "lucide-react";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

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
      { id: "installation", title: "Installation Options" },
    ],
  },
  {
    id: "core-routing",
    title: "Core Routing",
    items: [
      { id: "localhost-subdomains", title: "Localhost Subdomains (RFC 6761)" },
      { id: "port-mapping", title: "Port Mapping & Proxying" },
      { id: "port-80-setup", title: "Running on Standard Port 80" },
      { id: "docker-containers", title: "Docker & Container Gateway Sync" },
    ],
  },
  {
    id: "local-network",
    title: "Local Network & Mobile",
    items: [
      { id: "mdns-discovery", title: "Zero-Config Local Access (Free)" },
      { id: "lan-cockpit", title: "Interactive LAN Cockpit & TV (/lan)" },
      { id: "dev-hotspot", title: "Developer Wi-Fi Hotspot Mode" },
      { id: "hotspot-dns", title: "Private Hotspot DNS Gateway" },
      { id: "custom-local-domains", title: "Custom Local Root Domains (*.test, *.lan)" },
      { id: "open-air-mdns", title: "Zero-Config *.local Open-Air Signals" },
    ],
  },
  {
    id: "supporter-perks",
    title: "Supporter Tier & Perks",
    items: [
      { id: "perks-overview", title: "Supporter Perks Matrix" },
      { id: "vanity-domains", title: "Dedicated *.portside.lol Subdomains" },
      { id: "remote-tunnels", title: "Encrypted Edge Tunnels (Remote 5G)" },
      { id: "remote-projects", title: "Direct Project Edge Routing (/s/<project>)" },
      { id: "how-to-unlock", title: "How to Unlock & Redeem Perks" },
    ],
  },
  {
    id: "showcase-profile",
    title: "Developer Showcase",
    items: [
      { id: "about-me-page", title: "Public About Me Portfolio" },
      { id: "hosting-projects", title: "Publishing Local Projects" },
      { id: "customizing-themes", title: "Custom Themes & Banners" },
    ],
  },
  {
    id: "security-architecture",
    title: "Zero-Trust Security",
    items: [
      { id: "database-protection", title: "Air-Gapped Local Database" },
      { id: "registration-firewall", title: "Cloud Registration Firewall" },
      { id: "path-sandboxing", title: "Control Plane & Path Sandboxing" },
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
        name: "What perks are included in the PortSide Supporter tier?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Supporters receive dedicated *.portside.lol vanity subdomains, encrypted remote edge tunnels for 5G & webhook testing, direct project edge routing (/s/<project>), interactive LAN Cockpit (/lan) with Smart TV navigation, isolated Dev Wi-Fi Hotspot with private DNS gateway (192.168.137.1), custom local root domains (*.test, *.lan, *.portside), zero-config *.local mDNS routing, and public developer showcase profiles with custom themes.",
        },
      },
      {
        "@type": "Question",
        name: "How do I test localhost websites on mobile phones and tablets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Open http://<your-local-ip>/s/<project> on your phone or scan the high-redundancy QR code from the desktop dashboard for 100% free direct project testing across any iOS or Android browser over local Wi-Fi. Supporters can also access the full multi-service interactive LAN Cockpit at /lan.",
        },
      },
      {
        "@type": "Question",
        name: "How does the Private Hotspot DNS Gateway work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "When physical devices connect to the PortSide Dev Wi-Fi Hotspot, Windows assigns your workstation (192.168.137.1) as their Primary DNS server and gateway. PortSide catches queries for your custom domain and routes traffic directly to local servers with zero cloud hops, even if disconnected from the internet.",
        },
      },
      {
        "@type": "Question",
        name: "How does PortSide protect the developer's local database from public internet visitors?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PortSide's local database binds exclusively to loopback (127.0.0.1) and is never exposed through edge tunnels. Furthermore, registrations originating from public vanity links bypass local database insertion completely and are forwarded to the central cloud platform.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

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

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/pricing" className="text-slate-300 hover:text-white transition">
              Pricing
            </Link>
            <Link href="/redeem" className="text-slate-300 hover:text-white transition">
              Redeem Key
            </Link>
            <Link href="/comparisons" className="text-slate-300 hover:text-white transition">
              Comparisons
            </Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 w-full flex-1 flex gap-10">
        {/* Table of Contents Sidebar */}
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

        {/* Main Article Content */}
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

            <div id="quickstart" className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/30 via-slate-900 to-slate-950 p-6 space-y-4 scroll-mt-28">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 text-xs font-mono">01</span>
                Quickstart in 60 Seconds
              </h2>
              <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
                <li>
                  <strong className="text-white">Download the launcher:</strong> Grab <code className="font-mono text-sky-300">Portside.exe</code> from releases or clone from GitHub.
                </li>
                <li>
                  <strong className="text-white">Register your first service:</strong> Open the dashboard and map a hostname (e.g. <code className="font-mono text-sky-300">shop</code>) to your local server port (e.g. <code className="font-mono text-sky-300">3000</code>).
                </li>
                <li>
                  <strong className="text-white">Access immediately:</strong> Visit <code className="font-mono text-sky-300">http://shop.localhost</code> in your browser. No DNS configuration or hosts file editing required.
                </li>
              </ol>
            </div>

            <div id="installation" className="space-y-4 scroll-mt-28">
              <h2 className="text-xl font-bold text-white">Installation Options</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                PortSide runs as a lightweight native background daemon paired with a modern web cockpit:
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 font-mono text-xs text-slate-300 space-y-2">
                  <p className="text-slate-500"># Option A: Run the compiled native launcher (Windows, macOS, Linux)</p>
                  <p className="text-sky-300">.\Portside.exe</p>
                  <p className="text-slate-500 pt-2"># Option B: Run via one-line bash installer</p>
                  <p className="text-sky-300">curl -fsSL https://raw.githubusercontent.com/letsmakepact/PortSide/main/install.sh | bash</p>
                  <p className="text-slate-500 pt-2"># Option C: Run via Node from source</p>
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
              <h3 className="text-lg font-bold text-white">Port Mapping &amp; Proxying (RFC 6761)</h3>
              <p>
                Under RFC 6761, all standards-compliant browsers natively resolve any subdomain of <code className="font-mono text-sky-300">*.localhost</code> directly to your computer loopback address (<code className="font-mono text-slate-300">127.0.0.1</code>). PortSide intercepts incoming requests on port 80, inspects the requested subdomain, and transparently proxies traffic to the assigned internal port.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                  <h4 className="font-bold text-white text-sm">Browser Request</h4>
                  <p className="font-mono text-xs text-sky-300 bg-white/5 p-2 rounded-lg border border-white/5">
                    GET http://shop.localhost/cart
                  </p>
                  <p className="text-xs text-slate-400">
                    Browser resolves subdomain to 127.0.0.1 on standard port 80.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                  <h4 className="font-bold text-white text-sm">Proxy Upstream</h4>
                  <p className="font-mono text-xs text-emerald-300 bg-white/5 p-2 rounded-lg border border-white/5">
                    PROXY http://127.0.0.1:3000/cart
                  </p>
                  <p className="text-xs text-slate-400">
                    PortSide proxies the request and rewrites headers seamlessly with sub-millisecond overhead.
                  </p>
                </div>
              </div>
            </div>

            <div id="port-80-setup" className="space-y-3 pt-2 scroll-mt-28">
              <h3 className="text-lg font-bold text-white">Running on Standard HTTP Port 80</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                By default, PortSide binds to port 80 so URLs never require a trailing port number like <code className="font-mono text-slate-400">:3000</code> or <code className="font-mono text-slate-400">:8080</code>. If another application occupies port 80 (such as IIS, Apache, or Skype), run the native launcher as Administrator to automatically free or reassign the port, or configure an alternate port in dashboard preferences.
              </p>
            </div>

            <div id="docker-containers" className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 space-y-4 scroll-mt-28">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-sky-400" />
                  Docker &amp; Container Gateway Sync
                </h3>
                <span className="text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Zero-Config Sync
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                PortSide provides first-class support for containerized workflows including Docker Compose, devcontainers, Sub2API, Ollama, and microservices. When applications run inside isolated Linux container namespaces, they can dial all PortSide short URLs directly without connection failures.
              </p>

              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-mono font-semibold uppercase text-sky-400 tracking-wider">
                  How PortSide Resolves Docker Short URLs
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-white">Automatic Container Sync:</strong> The PortSide daemon synchronizes all registered <code className="font-mono text-sky-300">*.localhost</code> routes to the host gateway (<code className="font-mono text-sky-300">192.168.65.254</code>) inside running Docker containers.
                  </li>
                  <li>
                    <strong className="text-white">Docker Gateway Bridge:</strong> Requests from <code className="font-mono text-sky-300">host.docker.internal</code> and internal container subnets are recognized as local network traffic and routed immediately.
                  </li>
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-mono font-semibold uppercase text-sky-400 tracking-wider">
                  Docker Compose Setup (Recommended)
                </h4>
                <p className="text-xs text-slate-400">
                  Add <code className="font-mono text-sky-300">extra_hosts</code> to map your services to the host gateway:
                </p>
                <div className="rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-emerald-300 space-y-1 overflow-x-auto">
                  <p className="text-slate-500"># In your docker-compose.yml service definition:</p>
                  <p className="text-slate-300">services:</p>
                  <p className="text-slate-300">&nbsp;&nbsp;my-service:</p>
                  <p className="text-slate-300">&nbsp;&nbsp;&nbsp;&nbsp;image: my-app:latest</p>
                  <p className="text-sky-300">&nbsp;&nbsp;&nbsp;&nbsp;extra_hosts:</p>
                  <p className="text-emerald-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- &quot;host.docker.internal:host-gateway&quot;</p>
                  <p className="text-emerald-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- &quot;router.localhost:host-gateway&quot;</p>
                  <p className="text-emerald-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- &quot;api.localhost:host-gateway&quot;</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: LOCAL NETWORK & MULTI-DEVICE */}
          <section id="local-network" className="space-y-8 scroll-mt-28">
            <div id="mdns-discovery" className="border-b border-white/10 pb-4 scroll-mt-28">
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Multi-Device Testing
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Local Network, Hotspots &amp; Mobile / Smart TV Access
              </h2>
            </div>

            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <p>
                Testing responsive web designs on real physical phones, tablets, and Smart TV browsers is built directly into PortSide. Choose between free direct project links or advanced supporter launchpads:
              </p>

              <div className="space-y-4">
                {/* Free direct access */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      <span>Zero-Config Local Access &amp; QR Quick Launch</span>
                    </h3>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                      100% Free Forever
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Open <code className="font-mono text-sky-300">http://&lt;your-local-ip&gt;/s/&lt;project&gt;</code> on your phone or scan the high-redundancy QR code from the desktop dashboard. Traffic is routed straight to your local server over standard Wi-Fi without third-party accounts, cookies, or cloud hops.
                  </p>
                </div>

                {/* Supporter perk: LAN Cockpit */}
                <div id="lan-cockpit" className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-5 space-y-3 scroll-mt-28">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Tv className="h-4 w-4 text-sky-400" />
                      <span>Interactive Multi-Device LAN Launchpad &amp; TV Cockpit (/lan)</span>
                    </h3>
                    <span className="text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Supporter Perk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Supporter accounts unlock the full interactive multi-service cockpit at <code className="font-mono text-sky-300">/lan</code>. Navigate between running services, monitor real-time latency, toggle port tunnels, and use full 10-foot remote D-pad navigation on LG webOS, Samsung Tizen, or Android TV browsers with high-contrast accessibility focus rings.
                  </p>
                </div>

                {/* Supporter perk: Dev Hotspot */}
                <div id="dev-hotspot" className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3 scroll-mt-28">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Radio className="h-4 w-4 text-amber-400" />
                      <span>Developer Wi-Fi Hotspot Mode (Isolated AP)</span>
                    </h3>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Supporter Perk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When developing on restrictive public Wi-Fi networks (coffee shops, conferences, airports, co-working spaces) where client isolation blocks peer-to-peer connections, turn on Developer Hotspot mode in PortSide settings. PortSide commands your machine's wireless hardware to broadcast an isolated WPA2-Personal (AES) network (e.g. <code className="font-mono text-amber-300">PortSide-DevNet</code>) for direct device testing.
                  </p>
                </div>

                {/* Supporter perk: Hotspot DNS Gateway */}
                <div id="hotspot-dns" className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3 scroll-mt-28">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      <span>Private Hotspot DNS Gateway (192.168.137.1)</span>
                    </h3>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Supporter Perk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When physical phones connect to your Dev Wi-Fi Hotspot, Windows assigns your workstation (<code className="font-mono text-emerald-400">192.168.137.1</code>) as their Primary DNS server and default gateway. Because you control the network, PortSide catches all DNS queries and routes traffic straight to your local servers with zero cloud hops—even completely offline without internet!
                  </p>
                </div>

                {/* Supporter perk: Custom Local Root Domains */}
                <div id="custom-local-domains" className="rounded-2xl border border-sky-500/30 bg-slate-900/50 p-5 space-y-3 scroll-mt-28">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Globe className="h-4 w-4 text-sky-400" />
                      <span>Custom Local Root Domains (*.portside, *.test, *.lan)</span>
                    </h3>
                    <span className="text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Supporter Perk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Configure any custom local root domain in Settings (such as <code className="font-mono text-sky-300">portside.test</code>, <code className="font-mono text-sky-300">mybrand.dev</code>, or <code className="font-mono text-sky-300">dev.lan</code>). Connected phones and computers can access your projects via memorable URLs like <code className="font-mono text-white">http://&lt;service&gt;.portside.test</code> instead of typing IP addresses.
                  </p>
                </div>

                {/* Supporter perk: Open-Air mDNS */}
                <div id="open-air-mdns" className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5 space-y-3 scroll-mt-28">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Radio className="h-4 w-4 text-purple-400" />
                      <span>Zero-Config *.local Open-Air Signals</span>
                    </h3>
                    <span className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Supporter Perk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    PortSide continuously advertises multicast DNS (mDNS) signals across your physical network. Any Apple or Android device on the same Wi-Fi can resolve clean <code className="font-mono text-purple-300">*.local</code> addresses natively without manual IP configuration.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: SUPPORTER TIER & PERKS */}
          <section id="supporter-perks" className="space-y-8 scroll-mt-28">
            <div id="perks-overview" className="border-b border-white/10 pb-4 scroll-mt-28">
              <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
                Premium Superpowers
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Supporter Tier &amp; Perks
              </h2>
            </div>

            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <p>
                PortSide's core local loopback proxy is 100% free and open source forever. An optional Supporter subscription ($5.99/mo) or valid promo key unlocks our global cloud infrastructure and advanced hardware networking:
              </p>

              {/* PERKS COMPARISON TABLE */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-slate-950/70 flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-sky-400" />
                    Community Edition vs. Supporter Tier
                  </h3>
                  <span className="text-xs text-sky-400 font-semibold">$5.99 / mo</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-mono">
                        <th className="py-3 px-4 font-medium">Capability / Feature</th>
                        <th className="py-3 px-4 font-medium text-center w-36">Community ($0)</th>
                        <th className="py-3 px-4 font-medium text-center w-40 text-sky-400">Supporter ($5.99)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-200">Unlimited *.localhost subdomains (RFC 6761)</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-200">Direct Port 80 loopback proxying</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-200">Real-time port health &amp; latency telemetry</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-200">Mobile Wi-Fi QR Code Quick Launch (/s/&lt;project&gt;)</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-200">Smart TV 10-foot D-Pad remote navigation on direct links</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-200">Docker &amp; Container Gateway Auto-Sync</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                        <td className="py-2.5 px-4 text-center text-emerald-400 font-bold">&#10003; Included</td>
                      </tr>
                      <tr className="bg-sky-500/[0.04]">
                        <td className="py-2.5 px-4 font-medium text-white">Dedicated *.portside.lol vanity namespace</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">&mdash;</td>
                        <td className="py-2.5 px-4 text-center text-sky-400 font-bold">&#10003; Unlocked</td>
                      </tr>
                      <tr className="bg-sky-500/[0.04]">
                        <td className="py-2.5 px-4 font-medium text-white">Encrypted Remote Edge Tunnels (Remote 5G &amp; Webhooks)</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">&mdash;</td>
                        <td className="py-2.5 px-4 text-center text-sky-400 font-bold">&#10003; Unlocked</td>
                      </tr>
                      <tr className="bg-sky-500/[0.04]">
                        <td className="py-2.5 px-4 font-medium text-white">Direct Project Edge Routing (/s/&lt;project&gt;)</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">&mdash;</td>
                        <td className="py-2.5 px-4 text-center text-sky-400 font-bold">&#10003; Unlocked</td>
                      </tr>
                      <tr className="bg-sky-500/[0.04]">
                        <td className="py-2.5 px-4 font-medium text-white">Interactive LAN Cockpit Launchpad (/lan)</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">&mdash;</td>
                        <td className="py-2.5 px-4 text-center text-sky-400 font-bold">&#10003; Unlocked</td>
                      </tr>
                      <tr className="bg-sky-500/[0.04]">
                        <td className="py-2.5 px-4 font-medium text-white">Isolated Dev Wi-Fi Hotspot Broadcast</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">&mdash;</td>
                        <td className="py-2.5 px-4 text-center text-sky-400 font-bold">&#10003; Unlocked</td>
                      </tr>
                      <tr className="bg-sky-500/[0.04]">
                        <td className="py-2.5 px-4 font-medium text-white">Private Hotspot DNS Gateway (192.168.137.1)</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">&mdash;</td>
                        <td className="py-2.5 px-4 text-center text-sky-400 font-bold">&#10003; Unlocked</td>
                      </tr>
                      <tr className="bg-sky-500/[0.04]">
                        <td className="py-2.5 px-4 font-medium text-white">Custom Local Root Domains (*.portside, *.test, *.lan)</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">&mdash;</td>
                        <td className="py-2.5 px-4 text-center text-sky-400 font-bold">&#10003; Unlocked</td>
                      </tr>
                      <tr className="bg-sky-500/[0.04]">
                        <td className="py-2.5 px-4 font-medium text-white">Zero-Config *.local mDNS Cross-Device Routing</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">&mdash;</td>
                        <td className="py-2.5 px-4 text-center text-sky-400 font-bold">&#10003; Unlocked</td>
                      </tr>
                      <tr className="bg-sky-500/[0.04]">
                        <td className="py-2.5 px-4 font-medium text-white">Public Developer Showcase &amp; Portfolio with Custom Themes</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">&mdash;</td>
                        <td className="py-2.5 px-4 text-center text-sky-400 font-bold">&#10003; Unlocked</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DETAILED PERKS BREAKDOWN */}
              <div className="space-y-6 pt-4">
                <div id="vanity-domains" className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3 scroll-mt-28">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-sky-400" />
                    <span>Dedicated *.portside.lol Vanity Subdomains</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Claim a permanent branded namespace under <code className="font-mono text-sky-300">*.portside.lol</code> (e.g. <code className="font-mono text-white">https://alex.portside.lol</code>). Your vanity handle remains permanently tied to your supporter account and provisions automatic SSL/TLS certificates through our global edge network.
                  </p>
                </div>

                <div id="remote-tunnels" className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3 scroll-mt-28">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-400" />
                    <span>Encrypted Remote Edge Tunnels (Remote 5G / Webhooks)</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tunnel your local development servers to the global internet without opening firewall ports, configuring port forwarding, or exposing your physical machine IP. Ideal for testing Stripe, GitHub, or Shopify webhooks, sharing live previews with clients, or testing on mobile 5G/LTE networks outside your home.
                  </p>
                </div>

                <div id="remote-projects" className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3 scroll-mt-28">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <span>Direct Project Edge Routing (/s/&lt;project&gt;)</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Allow clients or collaborators to test individual local dev services directly over your vanity tunnel via <code className="font-mono text-emerald-300">https://&lt;handle&gt;.portside.lol/s/&lt;project&gt;</code>. Each service routes to its designated local port seamlessly without exposing your local network or other applications.
                  </p>
                </div>

                <div id="how-to-unlock" className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 to-slate-900 p-6 space-y-4 scroll-mt-28">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-sky-400" />
                    <span>How to Unlock &amp; Redeem Supporter Perks</span>
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 text-xs text-slate-300">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>Option 1: Buy Me a Coffee ($5.99/mo)</span>
                      </h4>
                      <p className="text-slate-400">
                        Subscribe monthly at buymeacoffee.com/pacts. In the desktop application, click <strong className="text-white">Become a Supporter &rarr; Claim with Email</strong> and enter your receipt ID or email for instant activation.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-sky-400" />
                        <span>Option 2: Redeem Promo or Giveaway Key</span>
                      </h4>
                      <p className="text-slate-400">
                        Received a promo or giveaway key from Discord or developer events? Visit <Link href="/redeem" className="text-sky-400 underline font-mono">/redeem</Link> or paste your supporter license key in desktop settings to unlock all perks without a credit card.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <a
                      href="https://buymeacoffee.com/pacts/membership"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm"
                    >
                      Subscribe for $5.99/mo on Buy Me a Coffee
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                    <Link
                      href="/redeem"
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 border border-slate-700 transition"
                    >
                      Redeem License Key
                    </Link>
                  </div>
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

          {/* SECTION 6: ZERO-TRUST SECURITY */}
          <section id="security-architecture" className="space-y-8 scroll-mt-28">
            <div id="database-protection" className="border-b border-white/10 pb-4 scroll-mt-28">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Zero-Trust Defense
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Security Architecture &amp; Database Protection
              </h2>
            </div>

            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <p>
                When you share a live project or your vanity showcase (<code className="font-mono text-sky-300">alex.portside.lol</code>), PortSide enforces strict boundaries between public internet traffic, your dev server processes, and your machine's local operating system and databases.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <h3 className="font-bold text-white text-base">Air-Gapped Local Database</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The desktop application's embedded database (<code className="font-mono text-emerald-300">portside_db</code> / PostgreSQL) binds strictly to <code className="font-mono text-slate-200">127.0.0.1</code>. It is never exposed over edge tunnels or LAN bridges. Remote visitors cannot query, modify, or inject data into your database.
                  </p>
                </div>

                <div id="registration-firewall" className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] p-5 space-y-3 scroll-mt-28">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                    <h3 className="font-bold text-white text-base">Cloud Registration Firewall</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If an internet visitor attempts to register or sign up via your public showcase link (<code className="font-mono text-sky-300">*.portside.lol/register</code>), PortSide intercepts the request. It <strong>never</strong> provisions a local user, local folders, or workspace directories on your computer. Instead, the request is safely forwarded to the central cloud platform (<code className="font-mono text-sky-300">portside.lol</code>).
                  </p>
                </div>
              </div>

              <div id="path-sandboxing" className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-3 scroll-mt-28">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  Control Plane &amp; Path Sandboxing
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  PortSide maintains strict separation between your application routes and the desktop control plane:
                </p>
                <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                  <li><strong className="text-slate-200">Protected Control Routes:</strong> Paths such as <code className="font-mono text-amber-300">/dashboard</code>, <code className="font-mono text-amber-300">/settings</code>, <code className="font-mono text-amber-300">/api/services</code>, and administrative panels are locked to local loopback sessions and rejected when requested over public vanity tunnels.</li>
                  <li><strong className="text-slate-200">Isolated Service Proxying:</strong> Public visitors requesting mapped services (<code className="font-mono text-sky-300">/s/&lt;project&gt;</code> or subdomains) are forwarded exclusively to that designated internal dev port. The proxy cannot traverse to neighboring ports, system directories, or local disk paths.</li>
                  <li><strong className="text-slate-200">Process &amp; Workspace Isolation:</strong> Requests from external edge connections never execute system shell commands or spawn background daemon processes on your development host.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 7: TROUBLESHOOTING */}
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
                <h3 className="font-bold text-white text-sm">Can I test devices offline without an active internet connection?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Yes! Developer Wi-Fi Hotspot mode and the built-in private local DNS gateway (<code className="font-mono text-emerald-400">192.168.137.1</code>) operate completely off-grid without touching external servers or requiring internet connectivity.
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

      <footer className="border-t border-white/10 bg-[#060b13]/90 py-8 text-center text-xs text-slate-500 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AnchorLogo size={20} />
            <span className="font-semibold text-slate-400">PortSide Documentation</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <span>&middot;</span>
            <Link href="/redeem" className="hover:text-white transition">Redeem</Link>
            <span>&middot;</span>
            <Link href="/comparisons" className="hover:text-white transition">Comparisons</Link>
          </div>
          <p>
            Created by pact (letsmakepact &middot; @pactwithdevil)
          </p>
        </div>
      </footer>
    </div>
  );
}
