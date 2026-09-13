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
  FolderGit2,
  Send,
} from "lucide-react";
import { AnchorLogo } from "@/components/ui/AnchorLogo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useI18n } from "@/lib/i18n";

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
    a: "Yes! Supporter tunnels provision primary encrypted connections through Our high-speed edge infrastructure directly to your chosen local service. Anyone with your tunnel URL can access the build from anywhere in the world on 5G or remote Wi-Fi, without configuring router port forwarding or exposing your home IP.",
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
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState(0);
  const [downloads, setDownloads] = useState<PlatformDownloads>(DEFAULT_DOWNLOADS);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showNavDownload, setShowNavDownload] = useState(false);
  const [selectedOs, setSelectedOs] = useState<"windows" | "macos" | "linux">("windows");
  const [showcaseSubdomain, setShowcaseSubdomain] = useState("pact");
  const [showcaseBgPreset, setShowcaseBgPreset] = useState<
    "cyber-mesh" | "matrix-emerald" | "midnight-neon" | "obsidian-glow" | "pure-carbon"
  >("cyber-mesh");
  const [showcaseAccent, setShowcaseAccent] = useState<
    "sky" | "cyan" | "emerald" | "violet" | "amber" | "rose"
  >("sky");
  const [copiedCliCmd, setCopiedCliCmd] = useState<string | null>(null);

  useEffect(() => {
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

    const handleScroll = () => {
      const heroEl = document.getElementById("hero");
      const downloadsEl = document.getElementById("downloads");

      if (!heroEl || !downloadsEl) return;

      const heroRect = heroEl.getBoundingClientRect();
      const downloadsRect = downloadsEl.getBoundingClientRect();

      const heroPast = heroRect.bottom <= 80;
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

  const handleCopyCliCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCliCmd(cmd);
    setTimeout(() => setCopiedCliCmd(null), 2000);
  };

  const currentSim = SIMULATOR_TABS[activeTab];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      <header className="sticky top-0 z-50 border-b border-[#1f2937] bg-[#0b0f17]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnchorLogo size={32} />
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-white leading-none">
                Portside
              </span>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider mt-0.5">
                PORT 80 PROXY
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400 absolute left-1/2 -translate-x-1/2">
            <Link href="/docs" className="text-sky-400 hover:text-sky-300 transition font-mono flex items-center gap-1">
              <span>{t.nav.docs}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageSelector variant="header" />
            <a
              href="https://github.com/letsmakepact/PortSide"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#111827] hover:bg-[#161f30] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-[#1f2937] transition"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="hidden sm:inline">{t.nav.github}</span>
            </a>
            <a
              href="#downloads"
              className={`inline-flex items-center gap-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-xs font-medium text-white transition-all duration-300 ${
                showNavDownload
                  ? "opacity-100 scale-100 max-w-[150px] px-3 py-1.5 pointer-events-auto"
                  : "opacity-0 scale-90 max-w-0 px-0 py-1.5 pointer-events-none overflow-hidden"
              }`}
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="shrink-0 whitespace-nowrap">{t.nav.getPortside}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section id="hero" className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 sm:py-16 md:py-20 border-b border-[#1f2937]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 w-full my-auto">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111827] border border-[#1f2937] text-slate-300 text-xs font-mono">
                <span>PortSide {downloads.version}</span>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <AnchorLogo size={64} />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight">
              {t.hero.taglinePre} <span className="text-sky-400 font-mono">*.localhost</span>.
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-normal text-slate-400">
                {t.hero.taglinePost}
              </span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t.hero.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={downloads.windows.url}
                className="rounded-md bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 font-medium text-xs sm:text-sm transition flex items-center gap-2 border border-sky-500"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{t.hero.downloadWindows}</span>
                <span className="text-[11px] font-mono text-sky-200">(.exe)</span>
              </a>

              <a
                href="#downloads"
                className="rounded-md bg-[#111827] hover:bg-[#161f30] text-slate-200 border border-[#1f2937] px-4 py-2.5 font-medium text-xs sm:text-sm transition flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>{t.hero.allPlatforms}</span>
              </a>
            </div>

            <div className="mt-6 max-w-lg mx-auto">
              <div className="flex items-center justify-between rounded-md border border-[#1f2937] bg-[#0d131f] px-3.5 py-2 text-left text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400 truncate mr-3">
                  <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-200 select-all truncate text-[11px]">
                    {curlCommand}
                  </span>
                </div>
                <button
                  onClick={handleCopyCurl}
                  title={t.hero.copyInstall}
                  className="shrink-0 inline-flex items-center gap-1 rounded bg-[#161f30] hover:bg-[#1f2937] border border-[#27354a] px-2 py-1 text-[10px] font-medium text-slate-300 hover:text-white transition"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">{t.hero.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{t.hero.copyInstall}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-8 text-center">
              <a href="#features" className="inline-flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 text-xs transition">
                <span className="text-[11px] font-mono">Explore Features</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="relative py-20 sm:py-28 border-b border-[#1f2937] bg-[#0b0f17]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-950/40 text-sky-400 text-xs font-mono mb-3">
                <Zap className="w-3.5 h-3.5" />
                <span>Engineered For Speed</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                Built for developers who value their time.
              </h2>
              <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed">
                Everything required to proxy local processes, verify endpoints on real devices, and run multi-project architectures without fighting operating system friction.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1: RFC 6761 Loopback (Span 2 cols on lg) */}
              <div className="lg:col-span-2 rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#111827] to-[#0d131f] p-6 sm:p-8 flex flex-col justify-between hover:border-sky-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-sky-400 bg-sky-950/50 border border-sky-800/40 px-2.5 py-1 rounded-full font-medium">
                      RFC 6761 Compliant
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Zero-Config *.localhost on Port 80
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-xl">
                    Stop remembering if your frontend is on <code className="text-slate-300 font-mono">:3000</code> or <code className="text-slate-300 font-mono">:5173</code>. Portside binds Port 80 on loopback. Modern browser engines resolve all <code className="text-sky-300 font-mono">*.localhost</code> subdomains straight to 127.0.0.1 with zero <code className="text-slate-300 font-mono">/etc/hosts</code> editing.
                  </p>
                </div>

                {/* Visual Transform Demonstration */}
                <div className="mt-6 pt-5 border-t border-white/[0.06] grid sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1">
                    <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-semibold">
                      Without PortSide
                    </span>
                    <div className="text-slate-400 line-through">http://localhost:3000</div>
                    <div className="text-slate-400 line-through">http://localhost:8080</div>
                    <span className="text-[10px] text-rose-400 block pt-1">Port conflicts &amp; shared cookie collisions</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">
                      With PortSide
                    </span>
                    <div className="text-sky-300 font-medium">http://shop.localhost/</div>
                    <div className="text-emerald-300 font-medium">http://api.localhost/</div>
                    <span className="text-[10px] text-emerald-400 block pt-1">Clean subdomains &middot; Isolated sessions</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Mobile & Smart TV LAN Pairing (Span 1 col) */}
              <div className="rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#111827] to-[#0d131f] p-6 sm:p-8 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2.5 py-1 rounded-full font-medium">
                      Wi-Fi / LAN
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Real Device LAN Cockpit
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    Test touch targets and viewport responsiveness on physical iPhones, Androids, and Smart TVs over local Wi-Fi without installing third-party apps.
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                    <span className="text-slate-300">Camera QR Code:</span>
                    <span className="text-cyan-300 font-semibold">Auto-Scan</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                    <span className="text-slate-300">TV Remote D-Pad:</span>
                    <span className="text-cyan-300 font-semibold">10-Foot UI</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Dev Wi-Fi Hotspot (Span 1 col) */}
              <div className="rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#111827] to-[#0d131f] p-6 sm:p-8 flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Radio className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2.5 py-1 rounded-full font-medium">
                      Hardware Radio
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Dev Wi-Fi Hotspot
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    Public guest networks in hotels, trains, and cafés enforce Client Isolation firewalls. Broadcast an isolated developer network straight from your laptop.
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                    <span className="text-slate-400">Private Gateway:</span>
                    <span className="text-amber-300 font-semibold">192.168.137.1</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                    <span className="text-slate-400">Local Root Domains:</span>
                    <span className="text-sky-300">*.test &middot; *.lan</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Encrypted Remote Edge Tunnels (Span 2 cols on lg) */}
              <div className="lg:col-span-2 rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#111827] to-[#0d131f] p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded-full font-medium">
                      Supporter Edge
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Encrypted Remote Edge Tunnels &amp; Webhook Delivery
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-xl">
                    Share live builds with clients, teammates, or test on 5G cellular. Outbound encrypted edge tunnels bypass NAT and home router firewalls without opening incoming ports or exposing your physical machine IP.
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-white font-semibold block">Direct Project Routing</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Route individual services cleanly via <code className="text-emerald-300 font-mono">/s/&lt;project&gt;</code>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-white font-semibold block">Stripe &amp; GitHub Webhooks</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Receive incoming webhooks directly to local ports with instant edge delivery.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-white font-semibold block">Permanent Vanity Handles</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Keep your dedicated handle reserved under <code className="text-sky-300 font-mono">*.portside.lol</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 5: Projects & Workspaces (Span 1 col) */}
              <div className="rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#111827] to-[#0d131f] p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/50 border border-indigo-800/40 px-2.5 py-1 rounded-full font-medium">
                      Multi-Repo
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Projects &amp; Workspaces
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    Group related microservices by client or repository. Start, stop, and inspect entire development stacks with a single click.
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex items-center justify-between">
                    <span className="text-slate-300">E-Commerce Platform</span>
                    <span className="text-emerald-400 text-[10px]">2 Online</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex items-center justify-between">
                    <span className="text-slate-300">Developer Design System</span>
                    <span className="text-emerald-400 text-[10px]">1 Online</span>
                  </div>
                </div>
              </div>

              {/* Card 6: Native Engine Performance (Span 1 col) */}
              <div className="rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#111827] to-[#0d131f] p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded-full font-medium">
                      Zero Overhead
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Lightweight Native Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    Written in high-performance Go. Zero Node.js runtime required for core routing, minimal RAM consumption, and sub-millisecond packet multiplexing.
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 gap-2 font-mono text-xs text-center">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">Daemon RAM</span>
                    <span className="text-white font-semibold">~12 MB</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">Proxy Latency</span>
                    <span className="text-emerald-400 font-semibold">&lt; 0.2ms</span>
                  </div>
                </div>
              </div>

              {/* Card 7: Developer Profile Showcase (Span 1 col) */}
              <div className="rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#111827] to-[#0d131f] p-6 sm:p-8 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Palette className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-purple-400 bg-purple-950/50 border border-purple-800/40 px-2.5 py-1 rounded-full font-medium">
                      Public Showcase
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Branded Developer Portfolio
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    Turn your vanity domain (<code className="text-purple-300 font-mono text-[11px]">handle.portside.lol</code>) into a public portfolio with bio tags, running project links, and customizable themes.
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Themes Included:</span>
                  <span className="text-purple-300 font-medium">6 Built-in Styles</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="supporter" className="relative py-20 sm:py-28 border-b border-[#1f2937] bg-[#070b14]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-950/40 text-sky-400 text-xs font-mono mb-3">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Simple Transparent Plans</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                Free Forever. Supercharged for Supporters.
              </h2>
              <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed">
                Core loopback routing on Port 80 is 100% open source and free forever. Upgrade to Supporter to unlock encrypted remote tunnels, dev Wi-Fi hotspots, and interactive LAN cockpits.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-stretch mb-8">
              {/* Card 1: Community Free */}
              <div className="rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#111827] to-[#0c1220] p-6 sm:p-8 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Open Source Core
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/40 border border-white/[0.08] text-slate-300 text-xs font-mono">
                      Forever Free
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 my-2">
                    <span className="text-4xl font-extrabold text-white tracking-tight">$0</span>
                    <span className="text-xs font-mono text-slate-500">/ month</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">Portside Community</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Eliminate port numbers and run clean *.localhost subdomains locally on your computer.
                  </p>

                  <div className="mt-6 space-y-3 text-xs text-slate-300 border-t border-white/[0.06] pt-5">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Unlimited *.localhost subdomains on Port 80</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>RFC 6761 compliant loopback resolution (no /etc/hosts)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Direct Wi-Fi testing via machine IP (<code className="text-sky-300 font-mono text-[11px]">/s/&lt;project&gt;</code>)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Multi-project grouping &amp; workspace orchestration</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Real-time background port health &amp; latency monitoring</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>100% private native binary &mdash; zero telemetry or tracking</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-white/[0.06]">
                  <a
                    href="#downloads"
                    className="w-full rounded-xl bg-[#161f30] hover:bg-[#1f2937] text-white font-medium text-xs py-3 px-4 text-center flex items-center justify-center gap-2 transition border border-[#27354a] cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>Download Free Launcher</span>
                  </a>
                </div>
              </div>

              {/* Card 2: Supporter Plan (Highlighted Glow Hero) */}
              <div className="rounded-2xl border border-sky-500/40 bg-gradient-to-b from-[#131d32] via-[#0d1627] to-[#090f1d] p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl shadow-sky-500/10 ring-1 ring-sky-500/20">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Supporter Supercharged</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold">
                      Most Popular
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 my-2">
                    <span className="text-4xl font-extrabold text-white tracking-tight">$5.99</span>
                    <span className="text-xs font-mono text-slate-400">/ month &middot; cancel anytime</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">Portside Supporter</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    For power developers and teams needing remote edge tunnels, physical mobile cockpits, and off-grid hotspots.
                  </p>

                  <div className="mt-6 space-y-3 text-xs text-slate-200 border-t border-sky-500/20 pt-5">
                    <div className="flex items-center gap-2.5 font-semibold text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>All Community Free features included</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Dedicated <code className="text-sky-300 font-mono text-[11px]">*.portside.lol</code> permanent vanity handle</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Encrypted Remote Edge Tunnels for 5G &amp; webhook testing</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Direct project routing (<code className="text-sky-300 font-mono text-[11px]">https://&lt;handle&gt;.portside.lol/s/&lt;project&gt;</code>)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Interactive LAN Cockpit (<code className="text-sky-300 font-mono text-[11px]">/lan</code>) with Smart TV remote UI</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Hardware Dev Wi-Fi Hotspot with private DNS (<code className="text-sky-300 font-mono text-[11px]">192.168.137.1</code>)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Custom local root domains (<code className="text-sky-300 font-mono text-[11px]">*.test</code>, <code className="text-sky-300 font-mono text-[11px]">*.lan</code>, <code className="text-sky-300 font-mono text-[11px]">*.portside</code>)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Public Developer Portfolio &amp; Project Showcase with 6 theme styles</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-sky-500/20 space-y-2.5">
                  <a
                    href="https://buymeacoffee.com/pacts"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-xs py-3 px-4 text-center flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition cursor-pointer"
                  >
                    <span>Unlock Supporter Plan ($5.99/mo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <p className="text-center text-[11px] text-slate-400">
                    Have a promo or giveaway key?{" "}
                    <Link href="/redeem" className="text-sky-400 underline hover:text-sky-300 font-medium">
                      Redeem here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="showcase" className="relative py-20 sm:py-28 border-t border-white/5 bg-[#05080f]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-medium tracking-wide">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Supporter Superpower &middot; Full-Background Profiles</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Your identity on the edge. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-cyan-300">
                  Full-background themes. Real local ports.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Turn your vanity domain (<span className="text-slate-200 font-mono font-medium">username.portside.lol</span>) into an immersive Steam-style developer node. Showcase your live staging builds under clean <span className="text-sky-300 font-mono font-medium">/s/&lt;project&gt;</span> paths with dynamic full-page backdrops, or use authenticated <span className="text-amber-300 font-mono font-medium">/lan</span> to inspect backend daemons straight from 5G.
              </p>

              {/* Interactive Theme Controls */}
              <div className="pt-3 flex flex-col items-center gap-3">
                {/* 1. Full-Page Wallpaper Presets */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
                  <span className="text-slate-500 font-mono text-[11px] px-2.5 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-sky-400" />
                    <span>Backdrop:</span>
                  </span>
                  {[
                    { id: "cyber-mesh", label: "Cyber Mesh", dot: "bg-sky-400" },
                    { id: "matrix-emerald", label: "Matrix Emerald", dot: "bg-emerald-400" },
                    { id: "midnight-neon", label: "Midnight Neon", dot: "bg-purple-400" },
                    { id: "obsidian-glow", label: "Obsidian Glow", dot: "bg-slate-400" },
                    { id: "pure-carbon", label: "Pure Carbon", dot: "bg-zinc-400" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setShowcaseBgPreset(p.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                        showcaseBgPreset === p.id
                          ? "bg-slate-800 text-white font-semibold shadow-xs ring-1 ring-white/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* 2. 6 Accent Color Swatches */}
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-slate-500 font-mono text-[11px] px-2">Accent:</span>
                  {[
                    { id: "sky", label: "Sky", color: "bg-sky-500" },
                    { id: "cyan", label: "Cyan", color: "bg-cyan-400" },
                    { id: "emerald", label: "Emerald", color: "bg-emerald-400" },
                    { id: "violet", label: "Violet", color: "bg-violet-400" },
                    { id: "amber", label: "Amber", color: "bg-amber-400" },
                    { id: "rose", label: "Rose", color: "bg-rose-400" },
                  ].map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setShowcaseAccent(a.id as any)}
                      title={`${a.label} Accent`}
                      className={`h-5 w-5 rounded-full ${a.color} transition-all cursor-pointer flex items-center justify-center ${
                        showcaseAccent === a.id
                          ? "ring-2 ring-white scale-110 shadow-md"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      {showcaseAccent === a.id && <span className="w-1.5 h-1.5 rounded-full bg-black/80" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Showcase Viewport Container */}
            <div
              id="panel-showcase"
              className="rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden transition-all duration-500 relative group"
            >
              {/* Dynamic Full-Page Background Gradient Layer */}
              <div
                className={`absolute inset-0 z-0 pointer-events-none transition-all duration-700 bg-gradient-to-b ${
                  showcaseBgPreset === "matrix-emerald"
                    ? "from-emerald-950/70 via-[#06140e]/95 to-[#07090e]"
                    : showcaseBgPreset === "midnight-neon"
                    ? "from-purple-950/70 via-[#120a1f]/95 to-[#07090e]"
                    : showcaseBgPreset === "obsidian-glow"
                    ? "from-slate-900/70 via-[#0a0d14]/95 to-[#07090e]"
                    : showcaseBgPreset === "pure-carbon"
                    ? "from-zinc-900/70 via-[#0c0c0e]/95 to-[#07090e]"
                    : "from-sky-950/70 via-[#0a1020]/95 to-[#07090e]"
                }`}
              />

              {/* Radial Vignette Mask */}
              <div
                className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(7,9,14,0.95)_90%)] pointer-events-none"
                aria-hidden="true"
              />

              {/* Browser Address Bar */}
              <div className="px-4 sm:px-6 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-xl">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-white/[0.08] text-xs font-mono w-full focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/30 transition shadow-inner">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-500 select-none">https://</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold focus-within:bg-sky-500/20 transition">
                      <input
                        type="text"
                        value={showcaseSubdomain}
                        size={Math.max(4, showcaseSubdomain.length)}
                        onChange={(e) => setShowcaseSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="yourname"
                        className="bg-transparent text-sky-300 font-bold outline-none text-xs text-center"
                        title="Type to test custom vanity subdomain"
                      />
                    </span>
                    <span className="text-slate-300 select-none truncate font-medium">.portside.lol</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] text-slate-300">
                    <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>0.2ms Edge RTT</span>
                    <span className="text-slate-600">&middot;</span>
                    <span className="text-slate-400 font-sans">Daemon v1.4.2</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Supporter Node</span>
                  </span>
                </div>
              </div>

              {/* Steam-Style Profile Body */}
              <div className="p-6 sm:p-10 relative z-10 max-w-4xl mx-auto space-y-8">
                {/* Profile Identity Card */}
                <div className="p-6 sm:p-8 rounded-2xl bg-black/50 border border-white/[0.08] backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    {/* Node Avatar with Ring */}
                    <div className="relative shrink-0">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border border-white/20 bg-slate-900/90 shadow-2xl flex items-center justify-center font-mono font-bold text-2xl text-white ring-2 ring-white/10 ring-offset-2 ring-offset-black">
                        {(showcaseSubdomain || "p").charAt(0).toUpperCase()}
                      </div>
                      <span
                        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-[#07090e] border border-white/20 text-sky-400 shadow-md"
                        title="PortSide Node"
                      >
                        <AnchorLogo className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {showcaseSubdomain || "pact"}
                        </h3>
                        <span className="font-mono text-xs text-slate-400">
                          @{showcaseSubdomain || "pact"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            showcaseAccent === "cyan"
                              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                              : showcaseAccent === "emerald"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : showcaseAccent === "violet"
                              ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                              : showcaseAccent === "amber"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : showcaseAccent === "rose"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              : "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>verified supporter</span>
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                        Full-Stack Developer &amp; Distributed Systems Architect. Building real-time local proxies and modern web apps.
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono flex-wrap">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Node Online &amp; Active</span>
                        </span>
                        <span>&middot;</span>
                        <span>Global / Remote</span>
                        <span>&middot;</span>
                        <span className="text-slate-300">PortSide Core</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Social Buttons */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
                    <a
                      href="https://github.com/letsmakepact"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition flex items-center gap-2"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                    <a
                      href="https://t.me/pactwithdevil"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-mono text-sky-300 transition flex items-center gap-2"
                    >
                      <span>Telegram</span>
                      <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    </a>
                  </div>
                </div>

                {/* Live Forwarded Services Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs px-1">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-400" />
                        <span>Live Hosted Projects (/s/&lt;project&gt;)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        Active projects hosted directly through PortSide. Open and test in real-time.
                      </p>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px] hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>3 Services Online</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Project 1 */}
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md hover:border-white/20 transition flex flex-col justify-between space-y-3 shadow-lg">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">ecommerce-storefront</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-medium">
                            200 OK
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Next.js 15 SSR storefront with live checkout and stripe webhook testing.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2.5 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-500">127.0.0.1:3000</span>
                          <span className="text-sky-400 font-medium">/s/shop</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCliCmd(`https://${showcaseSubdomain || "pact"}.portside.lol/s/shop`)}
                          className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-slate-300 flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="truncate">https://{showcaseSubdomain || "pact"}.portside.lol/s/shop</span>
                          {copiedCliCmd === `https://${showcaseSubdomain || "pact"}.portside.lol/s/shop` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Project 2 */}
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md hover:border-white/20 transition flex flex-col justify-between space-y-3 shadow-lg">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">mobile-dashboard</span>
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-[10px] font-mono text-sky-400 font-medium">
                            HMR Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Vite + Tailwind HMR web app testing touch gestures and responsive layouts.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2.5 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-500">127.0.0.1:5173</span>
                          <span className="text-sky-400 font-medium">/s/mobile</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCliCmd(`https://${showcaseSubdomain || "pact"}.portside.lol/s/mobile`)}
                          className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-slate-300 flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="truncate">https://{showcaseSubdomain || "pact"}.portside.lol/s/mobile</span>
                          {copiedCliCmd === `https://${showcaseSubdomain || "pact"}.portside.lol/s/mobile` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Project 3 */}
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-md hover:border-white/20 transition flex flex-col justify-between space-y-3 shadow-lg">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">api-gateway</span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-[10px] font-mono text-purple-400 font-medium">
                            Healthy
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          High-concurrency Go REST &amp; WebSocket engine routing inbound webhooks.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2.5 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-500">127.0.0.1:8080</span>
                          <span className="text-sky-400 font-medium">/s/api</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCliCmd(`https://${showcaseSubdomain || "pact"}.portside.lol/s/api`)}
                          className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-slate-300 flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="truncate">https://{showcaseSubdomain || "pact"}.portside.lol/s/api</span>
                          {copiedCliCmd === `https://${showcaseSubdomain || "pact"}.portside.lol/s/api` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Showcase Action Bar */}
              <div className="px-6 sm:px-10 py-5 bg-black/70 backdrop-blur-md border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <p className="text-xs text-slate-400 text-center sm:text-left flex items-center gap-2 font-mono">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Supporters can customize full-page wallpapers, animated GIFs, or ambient dark presets.
                  </span>
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a
                    href="https://buymeacoffee.com/pacts"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 px-5 py-2.5 font-bold text-xs transition inline-flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-[0.98] min-h-[44px]"
                  >
                    <span>Claim {showcaseSubdomain || "pact"}.portside.lol ($5.99/mo)</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom 3 Architecture Highlight Cards */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              <div className="p-5 rounded-2xl bg-[#070d17] border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  <Palette className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Whole Background Wallpapers</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No boring small banners. PortSide themes the entire browser canvas with atmospheric Steam-style wallpapers, animated GIFs, or ambient dark presets.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#070d17] border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Path Routing (/s/&lt;project&gt;)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every service routes cleanly under your domain via <code className="text-emerald-300 font-mono">/s/&lt;project&gt;</code> without broken nested subdomains or DNS lag.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#070d17] border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Zero Inbound Exposure</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Encrypted outbound tunnels connect directly to our edge network. Your home IP and router stay sealed with zero open inbound ports.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="downloads" className="relative py-16 border-b border-[#1f2937] bg-[#0b0f17]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                {t.downloads.title}
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {t.downloads.title}
              </h2>
              <p className="mt-2 text-slate-400 text-xs sm:text-sm leading-relaxed">
                {t.downloads.subtitle}
              </p>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4 text-left">
              <div
                className={`p-5 rounded-lg border transition flex flex-col justify-between ${
                  selectedOs === "windows"
                    ? "border-[#27354a] bg-[#161f30]"
                    : "border-[#1f2937] bg-[#111827] hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium uppercase tracking-wider text-sky-400">
                      Windows 10 / 11
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0b0f17] text-slate-300 border border-[#1f2937]">
                      x64
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-2">{t.downloads.forWindows}</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">{downloads.windows.name}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {t.downloads.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#1f2937]">
                  <a
                    href={downloads.windows.url}
                    className="w-full rounded-md bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs py-2 px-3 text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloads.downloadBtn} (.exe)</span>
                  </a>
                </div>
              </div>

              <div
                className={`p-5 rounded-lg border transition flex flex-col justify-between ${
                  selectedOs === "macos"
                    ? "border-[#27354a] bg-[#161f30]"
                    : "border-[#1f2937] bg-[#111827] hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-300">
                      macOS 12+
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0b0f17] text-slate-300 border border-[#1f2937]">
                      Universal
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-2">macOS</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">{t.downloads.forMacArm}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {t.downloads.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#1f2937] space-y-1.5">
                  {downloads.macosArm64 && (
                    <a
                      href={downloads.macosArm64.url}
                      className="w-full rounded-md bg-[#161f30] hover:bg-[#1f2937] text-white font-medium text-xs py-1.5 px-2.5 text-center flex items-center justify-center gap-1.5 border border-[#27354a] transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloads.forMacArm}</span>
                    </a>
                  )}
                  {downloads.macosIntel && (
                    <a
                      href={downloads.macosIntel.url}
                      className="w-full rounded-md bg-[#0d131f] hover:bg-[#161f30] text-slate-300 font-medium text-xs py-1.5 px-2.5 text-center flex items-center justify-center gap-1.5 border border-[#1f2937] transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloads.forMacIntel}</span>
                    </a>
                  )}
                </div>
              </div>

              <div
                className={`p-5 rounded-lg border transition flex flex-col justify-between ${
                  selectedOs === "linux"
                    ? "border-[#27354a] bg-[#161f30]"
                    : "border-[#1f2937] bg-[#111827] hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-300">
                      Linux
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0b0f17] text-slate-300 border border-[#1f2937]">
                      x86 & ARM
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-2">Linux</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">{t.downloads.forLinuxAmd}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {t.downloads.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#1f2937] space-y-1.5">
                  {downloads.linuxAmd64 && (
                    <a
                      href={downloads.linuxAmd64.url}
                      className="w-full rounded-md bg-[#161f30] hover:bg-[#1f2937] text-white font-medium text-xs py-1.5 px-2.5 text-center flex items-center justify-center gap-1.5 border border-[#27354a] transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloads.forLinuxAmd}</span>
                    </a>
                  )}
                  {downloads.linuxArm64 && (
                    <a
                      href={downloads.linuxArm64.url}
                      className="w-full rounded-md bg-[#0d131f] hover:bg-[#161f30] text-slate-300 font-medium text-xs py-1.5 px-2.5 text-center flex items-center justify-center gap-1.5 border border-[#1f2937] transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloads.forLinuxArm}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 p-3.5 rounded-md border border-[#1f2937] bg-[#111827] max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <p className="text-xs font-semibold text-white">{t.downloads.sourceCodeBtn}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {t.hero.terminalHint}
                </p>
              </div>
              <a
                href={downloads.releaseUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-xs font-mono text-sky-400 hover:text-sky-300 transition flex items-center gap-1"
              >
                <span>{downloads.version} {t.footer.releases}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        <section className="relative py-16 border-b border-[#1f2937] bg-[#0b0f17]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                FAQ
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {t.faq.title}
              </h2>
              <p className="mt-2 text-slate-400 text-xs sm:text-sm">
                {t.faq.subtitle}
              </p>
            </div>

            <div className="space-y-2">
              {[
                { q: t.faq.q1, a: t.faq.a1 },
                { q: t.faq.q2, a: t.faq.a2 },
                { q: t.faq.q3, a: t.faq.a3 },
                { q: t.faq.q4, a: t.faq.a4 },
                { q: t.faq.q5, a: t.faq.a5 },
              ].map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-md border border-[#1f2937] bg-[#111827] overflow-hidden transition"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="font-medium text-xs sm:text-sm text-slate-200">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-[#1f2937]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative py-12 border-b border-[#1f2937] bg-[#0d131f]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {t.docsCta.title}
              </h3>
              <p className="text-xs text-slate-400">
                {t.docsCta.subtitle}
              </p>
            </div>
            <Link
              href="/docs"
              className="shrink-0 rounded-md bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 font-medium text-xs transition flex items-center gap-2 border border-sky-500"
            >
              <span>{t.docsCta.button}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-10 bg-[#0b0f17] text-xs text-slate-400 border-t border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <AnchorLogo size={24} />
                <span className="font-semibold text-white text-sm tracking-tight">Portside</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.footer.tagline}
              </p>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase text-slate-300 font-semibold mb-2.5">{t.footer.productHeading}</p>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#features" className="hover:text-white transition">{t.footer.features}</a></li>
                <li><a href="#supporter" className="hover:text-white transition">{t.footer.supporterPlan}</a></li>
                <li><a href="#downloads" className="hover:text-white transition">{t.footer.downloadList}</a></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase text-slate-300 font-semibold mb-2.5">{t.footer.resourcesHeading}</p>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/docs" className="text-sky-400 hover:text-sky-300 transition">{t.footer.documentation}</Link></li>
                <li><a href="https://github.com/letsmakepact/PortSide/releases" target="_blank" rel="noreferrer" className="hover:text-white transition">{t.footer.releases}</a></li>
                <li><a href="https://github.com/letsmakepact/PortSide" target="_blank" rel="noreferrer" className="hover:text-white transition">{t.footer.sourceCode}</a></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase text-slate-300 font-semibold mb-2.5">{t.footer.creatorHeading}</p>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a
                    href="https://buymeacoffee.com/pacts"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 hover:text-amber-200 transition flex items-center gap-1"
                  >
                    <span>{t.footer.buyMeCoffee}</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/letsmakepact" target="_blank" rel="noreferrer" className="hover:text-white transition">
                    pact (letsmakepact)
                  </a>
                </li>
                <li>
                  <a href="https://t.me/pactwithdevil" target="_blank" rel="noreferrer" className="hover:text-white transition">
                    Telegram: @pactwithdevil
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
            <div className="flex items-center gap-4">
              <LanguageSelector variant="footer" />
              <span>
                {t.footer.loopbackNative} · {t.footer.zeroTelemetry}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
