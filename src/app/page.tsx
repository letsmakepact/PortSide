"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Server,
  Globe,
  Wifi,
  QrCode,
  Tv,
  Smartphone,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Radio,
  Layers,
  Lock,
  Zap,
  Download,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Palette,
  Activity,
  Crown,
  Shield,
  ShieldCheck,
  KeyRound,
  Database,
  Cpu,
  Laptop,
  Eye,
  EyeOff,
} from "lucide-react";
import { AnchorLogo } from "@/components/AnchorLogo";

interface ReleaseAsset {
  name: string;
  url: string;
  size: string;
}

interface PlatformDownloads {
  version: string;
  releaseUrl: string;
  windows: ReleaseAsset;
  macosArm64?: ReleaseAsset;
  macosIntel?: ReleaseAsset;
  linuxAmd64?: ReleaseAsset;
  linuxArm64?: ReleaseAsset;
}

const DEFAULT_DOWNLOADS: PlatformDownloads = {
  version: "v1.0.0",
  releaseUrl: "https://github.com/letsmakepact/PortSide/releases/tag/v1.0.0",
  windows: {
    name: "Portside.exe",
    url: "https://github.com/letsmakepact/PortSide/releases/download/v1.0.0/Portside.exe",
    size: "26.3 MB",
  },
  macosArm64: {
    name: "Portside-darwin-arm64",
    url: "https://github.com/letsmakepact/PortSide/releases/download/v1.0.0/Portside-darwin-arm64",
    size: "25.1 MB",
  },
  macosIntel: {
    name: "Portside-darwin-amd64",
    url: "https://github.com/letsmakepact/PortSide/releases/download/v1.0.0/Portside-darwin-amd64",
    size: "26.7 MB",
  },
  linuxAmd64: {
    name: "Portside-linux-amd64",
    url: "https://github.com/letsmakepact/PortSide/releases/download/v1.0.0/Portside-linux-amd64",
    size: "25.8 MB",
  },
  linuxArm64: {
    name: "Portside-linux-arm64",
    url: "https://github.com/letsmakepact/PortSide/releases/download/v1.0.0/Portside-linux-arm64",
    size: "24.1 MB",
  },
};

const SIMULATOR_TABS = [
  {
    id: "localhost",
    label: "Localhost Proxy",
    badge: "Core Free",
    icon: Server,
    color: "sky",
    title: "Clean *.localhost on Port 80",
    desc: "Direct RFC 6761 loopback mapping. Say goodbye to messy port numbers and tab confusion forever.",
    url: "http://shop.localhost",
    target: "127.0.0.1:8080",
    protocol: "RFC 6761 Loopback",
    latency: "0.2ms",
    scope: "Local PC Only",
  },
  {
    id: "tunnel",
    label: "Global Tunnel",
    badge: "Supporter Tier",
    icon: Globe,
    color: "emerald",
    title: "Our Encrypted Remote Tunnels",
    desc: "Broadcast your local build globally over Our secure edge tunnels. Share with teammates, clients, or test mobile data instantly.",
    url: "https://pact.portside.lol/shop",
    target: "127.0.0.1:8080",
    protocol: "Our Secure Edge Tunnels",
    latency: "28ms (Global CDN)",
    scope: "Worldwide Access",
  },
  {
    id: "lan",
    label: "Mobile & Smart TV",
    badge: "Universal LAN",
    icon: Smartphone,
    color: "cyan",
    title: "Universal Local Wi-Fi & QR Camera Pairing",
    desc: "Instant camera QR codes and direct /s/ routing for any iPhone, Android, or Smart TV on your Wi-Fi (100% free), plus zero-config *.local Open-Air signals for Supporters.",
    url: "http://192.168.1.168/s/shop",
    target: "192.168.1.168:80",
    protocol: "Direct Wi-Fi / Open-Air Signals",
    latency: "1.2ms (Wi-Fi Direct)",
    scope: "Phones, Tablets & Smart TVs",
  },
  {
    id: "hotspot",
    label: "Dev Wi-Fi Hotspot",
    badge: "Hardware AP",
    icon: Radio,
    color: "amber",
    title: "Dedicated Isolated Wireless AP",
    desc: "Bypass restrictive corporate firewalls and coffee shop guest networks by broadcasting an isolated dev hotspot right from your machine.",
    url: "http://192.168.137.1/lan",
    target: "192.168.137.1:80",
    protocol: "WPA2 Private DevNet",
    latency: "0.8ms",
    scope: "Dedicated Hardware Network",
  },
  {
    id: "profile",
    label: "Branded Showcase",
    badge: "Supporter Vanity",
    icon: Palette,
    color: "purple",
    title: "Developer Public Profile & Vanity Domain",
    desc: "Host your interactive About Me portfolio and live project showcase on a custom branded domain like pact.portside.lol.",
    url: "https://pact.portside.lol",
    target: "Verified Supporter Profile",
    protocol: "Custom Vanity Showcase",
    latency: "Edge Cached",
    scope: "Public Web Profile",
  },
];

const FAQS = [
  {
    q: "How does *.localhost work without modifying /etc/hosts?",
    a: "Under RFC 6761, all standards-compliant browsers (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge) natively resolve any subdomain ending in .localhost to 127.0.0.1 without querying external DNS servers or reading your hosts file. Portside simply binds to standard HTTP port 80 and routes incoming Host headers to your internal dev servers.",
  },
  {
    q: "What is the Supporter Tier and how does it work?",
    a: "Portside Supporter unlocks premium superpowers including Global Remote Access via Our encrypted tunnels, custom branded vanity domains (e.g. username.portside.lol), developer public showcase profiles, wildcard *.local Open-Air signals, and personal multi-service mobile dashboards (/lan). Free tier users enjoy unlimited localhost subdomains and direct local Wi-Fi project redirects (http://<ip>/s/<project>) with instant QR camera pairing.",
  },
  {
    q: "Can I use Global Tunnels to share work with clients or test on 5G?",
    a: "Yes! Supporter tunnels provision sovereign encrypted connections through Our high-speed edge infrastructure directly to your chosen local service. Anyone with your tunnel URL can access the build from anywhere in the world on 5G or remote Wi-Fi, without configuring router port forwarding or exposing your home IP.",
  },
  {
    q: "How does the standalone desktop launcher work?",
    a: "The launcher is a native binary written in Go for Windows, macOS (Apple Silicon & Intel), and Linux. It automatically sets up your ~/Portside directory, verifies dependencies, starts the PostgreSQL database in Docker if needed, syncs schemas, checks GitHub for new releases, and boots Portside on Port 80 with zero setup friction.",
  },
  {
    q: "Can I host my personal developer portfolio on Portside?",
    a: "Yes. Supporter accounts include custom vanity subdomains (such as pact.portside.lol) where you can publish a rich developer profile featuring your bio, skills tags, social links, custom themes (Cyberpunk, Midnight Obsidian, Sunset, etc.), and an interactive live showcase of your running projects.",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [downloads, setDownloads] = useState<PlatformDownloads>(DEFAULT_DOWNLOADS);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showNavDownload, setShowNavDownload] = useState(false);
  const [selectedOs, setSelectedOs] = useState<"windows" | "macos" | "linux">("windows");
  const [activeShowcaseMode, setActiveShowcaseMode] = useState<"public" | "lan">("public");

  useEffect(() => {
    // Detect OS
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("mac")) {
        setSelectedOs("macos");
      } else if (ua.includes("linux")) {
        setSelectedOs("linux");
      } else {
        setSelectedOs("windows");
      }
    }

    // Fetch latest GitHub release
    fetch("/api/releases")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: PlatformDownloads | null) => {
        if (data && data.windows?.url) {
          setDownloads(data);
        }
      })
      .catch(() => {});

    // Scroll listener: Only show navbar download button when hero and bottom downloads are out of view
    const handleScroll = () => {
      const heroEl = document.getElementById("hero");
      const downloadsEl = document.getElementById("downloads");

      if (!heroEl || !downloadsEl) return;

      const heroRect = heroEl.getBoundingClientRect();
      const downloadsRect = downloadsEl.getBoundingClientRect();

      // Hero download buttons are past once hero bottom is scrolled above the header
      const heroPast = heroRect.bottom <= 80;
      // Downloads section is currently visible if its top is inside viewport and bottom hasn't scrolled completely past
      const downloadsVisible = downloadsRect.top <= window.innerHeight - 80 && downloadsRect.bottom >= 80;

      setShowNavDownload(heroPast && !downloadsVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const curlCommand = "curl -fsSL https://raw.githubusercontent.com/letsmakepact/PortSide/main/install.sh | bash";

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const currentSim = SIMULATOR_TABS[activeTab];

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060b13]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnchorLogo size={36} />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white leading-none">
                Portside
              </span>
              <span className="text-[10px] font-mono text-sky-400 tracking-wider">
                PORT 80 SUITE
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium absolute left-1/2 -translate-x-1/2">
            <a href="#features" className="hover:text-white transition">Features</a>
            <Link href="/docs" className="text-sky-400 hover:text-sky-300 transition font-medium flex items-center gap-1">
              <span>Docs</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/letsmakepact/PortSide"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white border border-white/10 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="#downloads"
              className={`inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-[#060b13] transition-all duration-300 shadow-md shadow-sky-500/20 cursor-pointer ${
                showNavDownload
                  ? "opacity-100 scale-100 max-w-[140px] px-3.5 py-1.5 pointer-events-auto"
                  : "opacity-0 scale-90 max-w-0 px-0 py-1.5 pointer-events-none overflow-hidden"
              }`}
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="shrink-0 whitespace-nowrap">Get Portside</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="hero" className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-6 sm:py-8 md:py-10 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 w-full my-auto">
            {/* Single Dynamic Version Badge */}
            <div className="flex justify-center mb-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-medium backdrop-blur-sm shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>PortSide {downloads.version} is Live</span>
              </div>
            </div>

            {/* Floating Logo */}
            <div className="flex justify-center mb-5">
              <div className="animate-float">
                <AnchorLogo size={80} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Name your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-cyan-300">localhost</span>.
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-300">
                Broadcast to the world.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Stop memorizing <code className="text-rose-300 font-mono bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20">:3000</code>, <code className="text-rose-300 font-mono bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20">:8080</code>, or <code className="text-rose-300 font-mono bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20">:5173</code>. Portside routes custom subdomains on standard Port 80, broadcasts wildcard <code className="text-cyan-300 font-mono bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">*.local</code> to phones & TVs, and deploys encrypted global tunnels.
            </p>

            {/* Hero CTAs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href={downloads.windows.url}
                className="rounded-xl bg-sky-500 hover:bg-sky-400 text-[#060b13] px-6 py-3 font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/25 transition transform active:scale-95 flex items-center gap-2 group cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#060b13] group-hover:translate-y-0.5 transition-transform" />
                <span>Download for Windows</span>
                <span className="text-[11px] font-mono font-normal opacity-80">(.exe)</span>
              </a>

              <a
                href="#downloads"
                className="rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-sky-400" />
                <span>All Platforms</span>
              </a>
            </div>

            {/* Quick Terminal Copy */}
            <div className="mt-5 max-w-lg mx-auto">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0a101d] px-3.5 py-2 text-left text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400 truncate mr-3">
                  <Terminal className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-sky-300 select-all truncate text-[11px]">
                    {curlCommand}
                  </span>
                </div>
                <button
                  onClick={handleCopyCurl}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 px-2 py-1 text-[10px] font-medium text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-6 pb-2 text-center">
              <a href="#simulator" className="inline-flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 text-xs transition">
                <span className="text-[11px]">Explore the Interactive Engine</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              </a>
            </div>
          </div>
        </section>

        {/* INTERACTIVE ROUTING & TUNNEL SIMULATOR */}
        <section id="simulator" className="relative py-20 border-t border-white/5 bg-[#080e18]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
                <Zap className="w-3.5 h-3.5" />
                <span>Interactive Architecture Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                One Unified Suite. Five Powerful Modes.
              </h2>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Click across the different modes below to see how Portside transforms messy ports into clean domains, global tunnels, and living room launchpads.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {SIMULATOR_TABS.map((tab, idx) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === idx;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(idx)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer border ${
                      isActive
                        ? "bg-sky-500/15 border-sky-500/40 text-sky-200 shadow-lg shadow-sky-500/10"
                        : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-sky-500/20 text-sky-300"
                          : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Showcase Box */}
            <div className="rounded-2xl border border-white/10 bg-[#060b13] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                {/* Left Description */}
                <div className="lg:col-span-5 space-y-5">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                      {currentSim.badge}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {currentSim.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      {currentSim.desc}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Internal Target</span>
                      <span className="text-xs font-mono text-rose-300 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/20">
                        {currentSim.target}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">Public Clean Address</span>
                      <button
                        onClick={() => handleCopyUrl(currentSim.url)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sky-200 hover:text-white transition cursor-pointer"
                      >
                        <span>{currentSim.url}</span>
                        {copiedUrl ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-sky-400" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Routing Protocol</span>
                        <span className="text-xs font-semibold text-slate-300 mt-0.5 block">{currentSim.protocol}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Typical Latency</span>
                        <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">{currentSim.latency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Mockup / Terminal */}
                <div className="lg:col-span-7">
                  <div className="rounded-xl border border-white/10 bg-[#0a101f] p-5 font-mono text-xs shadow-inner">
                    {/* Window Controls */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500/60 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-amber-500/60 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500/60 inline-block" />
                        <span className="ml-2 text-slate-500 text-[11px]">portside live proxy daemon</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    </div>

                    {/* Console Logs */}
                    <div className="space-y-2.5 text-slate-300 leading-relaxed">
                      <p className="text-emerald-400">
                        $ portside proxy --bind 0.0.0.0:80
                      </p>
                      <p className="text-slate-400">
                        [HTTP] Reverse proxy listening on 0.0.0.0:80 (IPv4 & IPv6)
                      </p>
                      <p className="text-slate-400">
                        [ROUTE] Registered service: <span className="text-white font-bold">shop</span> &rarr; 127.0.0.1:8080
                      </p>

                      {currentSim.id === "localhost" && (
                        <>
                          <p className="text-sky-300">
                            [RFC 6761] Browser request Host: <span className="underline">shop.localhost</span>
                          </p>
                          <p className="text-emerald-300">
                            [OK] Proxying HTTP 1.1 Host header &rarr; 127.0.0.1:8080 (0.2ms)
                          </p>
                          <p className="text-slate-500">
                            ✓ No /etc/hosts modification required · Loopback native
                          </p>
                        </>
                      )}

                      {currentSim.id === "tunnel" && (
                        <>
                          <p className="text-amber-300">
                            [TUNNEL] Our secure edge tunnel established
                          </p>
                          <p className="text-sky-300">
                            [EDGE] Public URL: <span className="underline">https://pact.portside.lol/shop</span>
                          </p>
                          <p className="text-emerald-300">
                            [ENCRYPT] End-to-end TLS active · Zero router port forwarding needed
                          </p>
                          <p className="text-slate-500">
                            ✓ Accessible on 5G mobile networks worldwide
                          </p>
                        </>
                      )}

                      {currentSim.id === "lan" && (
                        <>
                          <p className="text-cyan-300">
                            [LAN] Universal route: <span className="underline">http://192.168.1.168/s/shop</span> (100% Free)
                          </p>
                          <p className="text-emerald-300">
                            [QR] Camera scanned &middot; Mobile browser connected via Wi-Fi (1.2ms)
                          </p>
                          <p className="text-amber-300">
                            [SIGNAL] Open-Air signals active: <span className="underline">shop.local</span> (iOS Supporter)
                          </p>
                          <p className="text-slate-500">
                            ✓ Smart TV D-pad remote launchpad ready at http://192.168.1.168/s/shop
                          </p>
                        </>
                      )}

                      {currentSim.id === "hotspot" && (
                        <>
                          <p className="text-amber-300">
                            [HOTSPOT] Wi-Fi Direct SSID: <span className="font-bold">PortSide-DevNet</span>
                          </p>
                          <p className="text-emerald-300">
                            [DHCP] Hardware AP gateway assigned: 192.168.137.1
                          </p>
                          <p className="text-slate-500">
                            ✓ Completely isolated sandbox from public Wi-Fi firewalls
                          </p>
                        </>
                      )}

                      {currentSim.id === "profile" && (
                        <>
                          <p className="text-purple-300">
                            [VANITY] Domain mapped: <span className="underline">pact.portside.lol</span>
                          </p>
                          <p className="text-emerald-300">
                            [SHOWCASE] Developer profile loaded · 4 projects active · Theme: Cyberpunk
                          </p>
                          <p className="text-slate-500">
                            ✓ Custom About Me bio, skills tags, and interactive demo launchpad
                          </p>
                        </>
                      )}
                    </div>

                    {/* Quick Browser URL bar preview */}
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="rounded-lg bg-black/60 border border-white/10 px-3 py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-400 truncate">
                          {currentSim.url.startsWith("https://") ? (
                            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="text-white font-mono truncate">{currentSim.url}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 shrink-0">200 OK</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES GRID */}
        <section id="features" className="relative py-20 border-t border-white/5 bg-[#060b13]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-400">
                Developer Ergonomics
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
                Built for Speed, Privacy, and Elegance
              </h2>
              <p className="mt-3 text-slate-400 text-sm">
                Everything you need to manage modern microservices, test on real devices, and present work to stakeholders.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#090f1d] hover:border-sky-500/30 transition space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">RFC 6761 Loopback Proxy</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Binds standard Port 80 on loopback. Chrome, Safari, and Firefox resolve all *.localhost subdomains straight to 127.0.0.1 with zero DNS hacks.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#090f1d] hover:border-emerald-500/30 transition space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Global Remote Encrypted Tunnels</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Supporter feature powered by Our encrypted tunnels. Expose local services to clients and mobile carriers with zero port forwarding.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#090f1d] hover:border-cyan-500/30 transition space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Tv className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Mobile & Smart TV LAN Launchpad</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scan a QR code on your phone or open your host IP on your living room Smart TV for a remote-friendly launchpad with wildcard *.local Open-Air signals.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#090f1d] hover:border-amber-500/30 transition space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Isolated Dev Wi-Fi Hotspot</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Broadcast an isolated wireless network straight from your computer hardware. Perfect for testing without corporate firewall blocks.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#090f1d] hover:border-purple-500/30 transition space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Vanity Domains & Public Showcase</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Showcase your developer identity at <code className="text-purple-300 font-mono">username.portside.lol</code> with custom themes, bio, and live service previews.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#090f1d] hover:border-sky-500/30 transition space-y-3 group">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Real-Time Port Health Monitor</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Active background probes ping internal ports, track latency, and log online/offline state changes with audit trails.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SUPPORTER TIER & COMPARISON TABLE */}
        <section id="supporter" className="relative py-20 border-t border-white/5 bg-[#080d17]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
                <Crown className="w-3.5 h-3.5" />
                <span>Tier Comparison</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Free Forever or Supporter Supercharged
              </h2>
              <p className="mt-3 text-slate-400 text-sm">
                Portside is 100% open-source for core localhost workflows. The Supporter tier unlocks cloud edge infrastructure and multi-device hardware features.
              </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-8 items-stretch mb-12">
              {/* Free Tier */}
              <div className="rounded-2xl border border-white/10 bg-[#060b13] p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Open Source Core
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-mono">
                      $0 Free
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-2">Portside Community</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Everything you need to eliminate port numbers and run clean subdomains on your local PC.
                  </p>

                  <div className="mt-6 space-y-3 text-xs text-slate-300 border-t border-white/5 pt-6">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Unlimited *.localhost subdomains on Port 80</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>RFC 6761 compliant loopback routing</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Automated Cross-Platform Desktop Launcher</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Real-time background port & latency monitor</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Projects, service tags, and audit activity feed</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Mobile & Smart TV Wi-Fi direct redirects with QR camera scan</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Zero-Config *.local Open-Air Signals & Multi-Service /lan Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Encrypted Global Portside Tunnels (5G / Remote)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Custom Branded Vanity Subdomain (username.portside.lol)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Developer Public Profile & Project Showcase</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Dev Wi-Fi Hotspot hardware broadcast</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <a
                    href="#downloads"
                    className="w-full rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3 px-4 text-center block transition border border-white/10 cursor-pointer"
                  >
                    Download Free Launcher
                  </a>
                </div>
              </div>

              {/* Supporter Tier */}
              <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[#060b13] to-[#060b13] p-8 flex flex-col justify-between relative shadow-2xl shadow-amber-500/5">
                <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-amber-400 text-[#060b13] text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Recommended For Devs
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                      <Crown className="w-4 h-4" />
                      <span>Supporter Superpowers</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                      $4.99 / month
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-2">Portside Supporter</h3>
                  <p className="text-xs text-slate-300 mt-2">
                    For developers, agencies, and teams who share live builds globally with clients, want custom branded vanity domains, and isolated dev hotspots.
                  </p>

                  <div className="mt-6 space-y-3 text-xs text-slate-200 border-t border-amber-500/20 pt-6">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>All Community Free features included</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-medium text-white">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Zero-Config *.local Open-Air Signals & Multi-Service /lan Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-medium text-white">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Global Remote Access via Our Encrypted Edge Tunnels</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-medium text-white">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Custom Branded Vanity Subdomain (e.g. pact.portside.lol)</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-medium text-white">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Developer Public Profile & Project Showcase with custom themes</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Hardware Dev Wi-Fi Hotspot isolation network</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Direct support for open-source development</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-amber-500/20">
                  <a
                    href="https://buymeacoffee.com/pacts"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#060b13] font-bold text-xs py-3 px-4 text-center block transition shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Become a Supporter for $4.99/mo on Buy Me a Coffee &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEVELOPER SHOWCASE PREVIEW (pact.portside.lol) */}
        <section id="showcase" className="relative py-20 sm:py-28 border-t border-white/5 bg-[#05080f]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-medium tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ROUTING & ACCESS CONTROL MATRIX</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                One Vanity Subdomain. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">
                  Dual Privacy Realms.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Route live public demos globally on your custom <span className="text-slate-200 font-mono">username.portside.lol</span> vanity domain, while locking internal databases and microservices behind your Portside database credentials at <span className="text-sky-300 font-mono">/lan</span>—accessible anywhere, including cellular 5G.
              </p>

              {/* Precision Segmented Route Switcher */}
              <div className="pt-2 flex items-center justify-center">
                <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner max-w-full overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveShowcaseMode("public")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                      activeShowcaseMode === "public"
                        ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span>Public Showcase (/)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveShowcaseMode("lan")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                      activeShowcaseMode === "lan"
                        ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Auth-Gated LAN & 5G (/lan)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Inspector Console */}
            <div className="rounded-2xl border border-slate-800/80 bg-[#070d17] shadow-2xl overflow-hidden transition-all duration-300">
              {/* Console Chrome / Titlebar */}
              <div className="px-4 sm:px-6 py-3 bg-slate-900/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                {/* Traffic lights & Hostname pill */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-950/90 border border-slate-800 text-xs font-mono">
                    <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">
                      https://pact.portside.lol{activeShowcaseMode === "lan" ? "/lan" : ""}
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  {activeShowcaseMode === "public" ? (
                    <>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        EDGE ONLINE (18ms)
                      </span>
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        TLS 1.3 ECDSA
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">
                        PUBLIC VISITOR
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center gap-1.5">
                        <KeyRound className="w-3 h-3" />
                        PORTSIDE AUTH REQUIRED
                      </span>
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        5G / REMOTE REACHABLE
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        SESSION ACTIVE
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Console Body */}
              <div className="p-5 sm:p-8">
                {activeShowcaseMode === "public" ? (
                  /* PUBLIC SHOWCASE VIEW */
                  <div className="space-y-6">
                    {/* Developer Profile Header Card */}
                    <div className="p-4 sm:p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 border border-sky-500/30 flex items-center justify-center font-mono font-bold text-lg text-sky-400">
                          P
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-white">pact</span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/30">
                              official creator
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Systems Architect &middot; Full-Stack Core</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 text-[11px] font-mono border border-slate-800">
                          TypeScript
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 text-[11px] font-mono border border-slate-800">
                          Next.js 15
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 text-[11px] font-mono border border-slate-800">
                          Go Engine
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 text-[11px] font-mono border border-slate-800">
                          Cloudflare Tunnels
                        </span>
                      </div>
                    </div>

                    {/* Publicly Routed Endpoints Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                        <span className="flex items-center gap-2 text-sky-400 font-semibold uppercase tracking-wider">
                          <Globe className="w-3.5 h-3.5" />
                          Publicly Exposed Endpoints (Zero Auth Needed)
                        </span>
                        <span className="text-slate-500 text-[11px]">Crawlable &middot; Global Edge CDN</span>
                      </div>

                      <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                        <div className="p-3.5 sm:px-4 sm:py-3 flex items-center justify-between gap-4 text-xs font-mono">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-white">web-portfolio</span>
                              <span className="text-slate-500 ml-2 text-[11px]">mapped to localhost:3000</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30 text-sky-300 text-[11px]">
                              / (Root)
                            </span>
                            <span className="hidden sm:inline-block text-[10px] text-emerald-400">HTTP 200</span>
                          </div>
                        </div>

                        <div className="p-3.5 sm:px-4 sm:py-3 flex items-center justify-between gap-4 text-xs font-mono">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-white">portside-api</span>
                              <span className="text-slate-500 ml-2 text-[11px]">mapped to localhost:8081</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30 text-sky-300 text-[11px]">
                              /api
                            </span>
                            <span className="hidden sm:inline-block text-[10px] text-emerald-400">REST API</span>
                          </div>
                        </div>

                        <div className="p-3.5 sm:px-4 sm:py-3 flex items-center justify-between gap-4 text-xs font-mono">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-white">client-staging-demo</span>
                              <span className="text-slate-500 ml-2 text-[11px]">mapped to localhost:5173</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30 text-sky-300 text-[11px]">
                              /demo
                            </span>
                            <span className="hidden sm:inline-block text-[10px] text-emerald-400">LIVE PREVIEW</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PRIVATE /LAN AUTHENTICATED VIEW */
                  <div className="space-y-6">
                    {/* Portside Database Auth Banner */}
                    <div className="p-4 sm:p-5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono text-amber-400 shrink-0">
                          <KeyRound className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-white">Authenticated Developer Gateway</span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30">
                              Portside DB Verified
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Authenticated with your existing Portside account (<span className="text-amber-300 font-mono font-semibold">letsmakepact</span>). No new passwords or separate logins.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-lg shrink-0">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Accessible on 5G & Remote</span>
                      </div>
                    </div>

                    {/* Authenticated Internal Service Matrix */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                        <span className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider">
                          <Lock className="w-3.5 h-3.5" />
                          Gated Services (Hidden Behind /lan Login)
                        </span>
                        <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Zero Public Ingress
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                        <div className="p-3.5 sm:px-4 sm:py-3 flex items-center justify-between gap-4 text-xs font-mono">
                          <div className="flex items-center gap-3 min-w-0">
                            <Database className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-white">postgres-pgadmin</span>
                              <span className="text-slate-500 ml-2 text-[11px]">internal port :5432</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-300 text-[11px]">
                              /lan/db
                            </span>
                            <span className="hidden sm:inline-block text-[10px] text-slate-400">GATED DB</span>
                          </div>
                        </div>

                        <div className="p-3.5 sm:px-4 sm:py-3 flex items-center justify-between gap-4 text-xs font-mono">
                          <div className="flex items-center gap-3 min-w-0">
                            <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-white">ollama-ai-engine</span>
                              <span className="text-slate-500 ml-2 text-[11px]">internal port :11434 &middot; llama3.3</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-300 text-[11px]">
                              /lan/ai
                            </span>
                            <span className="hidden sm:inline-block text-[10px] text-slate-400">GATED API</span>
                          </div>
                        </div>

                        <div className="p-3.5 sm:px-4 sm:py-3 flex items-center justify-between gap-4 text-xs font-mono">
                          <div className="flex items-center gap-3 min-w-0">
                            <Server className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-white">redis-commander</span>
                              <span className="text-slate-500 ml-2 text-[11px]">internal port :6379 &middot; cache manager</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-300 text-[11px]">
                              /lan/redis
                            </span>
                            <span className="hidden sm:inline-block text-[10px] text-slate-400">GATED GUI</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Console Action Bar */}
              <div className="px-5 sm:px-8 py-4 bg-slate-900/60 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 text-center sm:text-left">
                  {activeShowcaseMode === "public"
                    ? "Anyone on the internet can explore your public projects, bio, and live client staging demos."
                    : "Only you can access /lan by logging in with your Portside credentials—even from your phone on 5G."}
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a
                    href="https://pact.portside.lol"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2.5 font-bold text-xs transition inline-flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 active:scale-[0.98]"
                  >
                    <span>Visit Live Showcase</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <a
                    href="https://buymeacoffee.com/pacts"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 font-semibold text-xs transition inline-flex items-center justify-center active:scale-[0.98]"
                  >
                    Claim Subdomain ($4.99/mo)
                  </a>
                </div>
              </div>
            </div>

            {/* Architecture Engineering Spec Strip */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-5 rounded-2xl bg-[#080e18] border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Single Hostname Routing</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  One custom hostname (<code className="text-slate-200 font-mono">username.portside.lol</code>) handles public web showcase traffic at root while routing authenticated private tools directly through <code className="text-sky-300 font-mono">/lan</code>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#080e18] border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Native Portside Auth</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No passwords to generate or separate auth services to configure. Any request to <code className="text-amber-300 font-mono">/lan</code> validates against your primary Portside account session in our database.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#080e18] border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5G & Cellular Mobility</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect from coffee shop Wi-Fi or directly from your phone on 5G. Zero router port forwarding or UPnP holes required—internal ports stay sealed from public scans.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DOWNLOADS SECTION */}
        <section id="downloads" className="relative py-20 border-t border-white/5 bg-[#080e18]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <Download className="w-3.5 h-3.5" />
              <span>Cross-Platform Standalone Binaries</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Get Portside for Your Machine
            </h2>
            <p className="mt-3 text-slate-400 text-sm max-w-lg mx-auto">
              Direct binary downloads pulled straight from GitHub Releases. Zero installer hassle, auto-updates included.
            </p>

            {/* OS Selectors */}
            <div className="mt-10 grid sm:grid-cols-3 gap-5 text-left">
              {/* Windows Card */}
              <div
                className={`p-6 rounded-2xl border transition flex flex-col justify-between ${
                  selectedOs === "windows"
                    ? "border-sky-500/50 bg-sky-500/10 shadow-xl shadow-sky-500/10"
                    : "border-white/10 bg-[#060b13] hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                      Windows 10 / 11
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      x64
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">Windows</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">{downloads.windows.name}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Standalone executable that provisions ~/Portside/updates and checks releases automatically.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <a
                    href={downloads.windows.url}
                    className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 text-[#060b13] font-bold text-xs py-2.5 px-4 text-center flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.exe)</span>
                  </a>
                </div>
              </div>

              {/* macOS Card */}
              <div
                className={`p-6 rounded-2xl border transition flex flex-col justify-between ${
                  selectedOs === "macos"
                    ? "border-sky-500/50 bg-sky-500/10 shadow-xl shadow-sky-500/10"
                    : "border-white/10 bg-[#060b13] hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                      macOS 12+
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      Universal
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">macOS</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">Apple Silicon & Intel</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Native pre-compiled Go binaries for M1/M2/M3/M4 Apple Silicon and Intel Macs.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                  {downloads.macosArm64 && (
                    <a
                      href={downloads.macosArm64.url}
                      className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2 px-3 text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Apple Silicon (M1/M2/M3/M4)</span>
                    </a>
                  )}
                  {downloads.macosIntel && (
                    <a
                      href={downloads.macosIntel.url}
                      className="w-full rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs py-2 px-3 text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Intel x86_64</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Linux Card */}
              <div
                className={`p-6 rounded-2xl border transition flex flex-col justify-between ${
                  selectedOs === "linux"
                    ? "border-sky-500/50 bg-sky-500/10 shadow-xl shadow-sky-500/10"
                    : "border-white/10 bg-[#060b13] hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                      Linux
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      x86 & ARM
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">Linux</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">Ubuntu, Debian, Fedora, Arch</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Zero external runtime dependencies. Runs standalone or in systemd service configurations.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                  {downloads.linuxAmd64 && (
                    <a
                      href={downloads.linuxAmd64.url}
                      className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2 px-3 text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Linux x86_64</span>
                    </a>
                  )}
                  {downloads.linuxArm64 && (
                    <a
                      href={downloads.linuxArm64.url}
                      className="w-full rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs py-2 px-3 text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Linux ARM64</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Release notes & GitHub */}
            <div className="mt-10 p-4 rounded-xl border border-white/10 bg-[#060b13] max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div>
                <p className="text-xs font-semibold text-white">Latest GitHub Release Tag</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  View changelog, checksums, and source commits on GitHub.
                </p>
              </div>
              <a
                href={downloads.releaseUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-xs font-mono font-bold text-sky-400 hover:text-sky-300 transition flex items-center gap-1"
              >
                <span>{downloads.version} Changelog</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="relative py-20 border-t border-white/5 bg-[#060b13]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-400">
                Frequently Asked Questions
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">
                Everything You Need to Know
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-[#090f1d] overflow-hidden transition"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="font-semibold text-sm sm:text-base text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-sky-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DOCUMENTATION CTA BANNER */}
        <section className="relative py-16 border-t border-white/5 bg-gradient-to-r from-sky-950/30 via-[#091122] to-cyan-950/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Looking for architecture deep-dives?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Explore setup guides, iOS mobile instructions, RFC specifications, and launcher operations.
              </p>
            </div>
            <Link
              href="/docs"
              className="shrink-0 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#060b13] px-6 py-3 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-sky-500/25"
            >
              <span>Explore Official Docs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 bg-[#050910] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <AnchorLogo size={28} />
                <span className="font-bold text-white text-base tracking-tight">Portside</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Name your localhost. Direct Port 80 routing, encrypted global tunnels, and multi-device LAN access.
              </p>
            </div>

            <div>
              <p className="font-mono text-xs uppercase text-slate-400 font-bold mb-3">Product</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#simulator" className="hover:text-white transition">Interactive Engine</a></li>
                <li><a href="#supporter" className="hover:text-white transition">Supporter Tier</a></li>
                <li><a href="#showcase" className="hover:text-white transition">Vanity Domains</a></li>
                <li><a href="#downloads" className="hover:text-white transition">Downloads</a></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs uppercase text-slate-400 font-bold mb-3">Resources</p>
              <ul className="space-y-2 text-xs">
                <li><Link href="/docs" className="text-sky-400 hover:text-sky-300 transition">Official Documentation</Link></li>
                <li><a href="https://pact.portside.lol" target="_blank" rel="noreferrer" className="hover:text-white transition">Live Showcase (pact.portside.lol)</a></li>
                <li><a href="https://github.com/letsmakepact/PortSide/releases" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub Releases</a></li>
                <li><a href="https://github.com/letsmakepact/PortSide" target="_blank" rel="noreferrer" className="hover:text-white transition">Source Code</a></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs uppercase text-slate-400 font-bold mb-3">Creator & Support</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://buymeacoffee.com/pacts"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-medium transition flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Buy Me a Coffee</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/letsmakepact" target="_blank" rel="noreferrer" className="hover:text-white transition">
                    Created by pact
                  </a>
                </li>
                <li>
                  <a href="https://t.me/pactwithdevil" target="_blank" rel="noreferrer" className="hover:text-white transition">
                    Telegram: @pactwithdevil
                  </a>
                </li>
                <li>
                  <a href="https://portside.lol" className="text-sky-400 hover:text-sky-300 font-mono font-medium transition">
                    portside.lol
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Portside. Open-source local development reverse proxy.</p>
            <p className="text-[11px] text-slate-600">
              Designed with zero tracking · No DNS tampering · Zero external telemetry
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
