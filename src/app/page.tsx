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
  const [activeShowcaseMode, setActiveShowcaseMode] = useState<"public" | "lan">("public");
  const [showcaseSubdomain, setShowcaseSubdomain] = useState("pact");
  const [showcaseViewMode, setShowcaseViewMode] = useState<"preview" | "wire">("preview");
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

        <section id="supporter" className="relative py-16 border-b border-[#1f2937] bg-[#0b0f17]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                {t.supporter.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {t.supporter.title}
              </h2>
              <p className="mt-2 text-slate-400 text-xs sm:text-sm leading-relaxed">
                {t.supporter.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 items-stretch mb-12">
              <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      {t.supporter.freeTierHeading}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#0b0f17] border border-[#1f2937] text-slate-300 text-xs font-mono">
                      $0
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-2">Portside Community</h3>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {t.supporter.freeTierDesc}
                  </p>

                  <div className="mt-6 space-y-2.5 text-xs text-slate-300 border-t border-[#1f2937] pt-5">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.simulator.titleLocalhost}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.simulator.protocolLocalhost}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.downloads.subtitle}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.features.feature2Title}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.features.feature3Title}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{t.supporter.perk1}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{t.supporter.perk2}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{t.supporter.perk3}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#1f2937]">
                  <a
                    href="#downloads"
                    className="w-full rounded-md bg-[#161f30] hover:bg-[#1f2937] text-white font-medium text-xs py-2.5 px-4 text-center block transition border border-[#27354a] cursor-pointer"
                  >
                    {t.downloads.downloadBtn}
                  </a>
                </div>
              </div>

              <div className="rounded-lg border border-[#27354a] bg-[#111827] p-6 sm:p-7 flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.supporter.badge}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#161f30] border border-[#27354a] text-sky-300 text-xs font-mono font-medium">
                      {t.supporter.price} / {t.supporter.period}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-2">Portside Supporter</h3>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {t.supporter.description}
                  </p>

                  <div className="mt-6 space-y-2.5 text-xs text-slate-200 border-t border-[#1f2937] pt-5">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.supporter.freeTierHeading}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{t.supporter.perk1}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{t.supporter.perk2}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{t.supporter.perk3}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{t.supporter.perk4}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{t.supporter.perk5}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#1f2937]">
                  <a
                    href="https://buymeacoffee.com/pacts"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-md bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs py-2.5 px-4 text-center block transition border border-sky-500 cursor-pointer"
                  >
                    {t.supporter.ctaButton} ({t.supporter.price}) →
                  </a>
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
                <span>Supporter Feature &middot; Custom Vanity Domains</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Your name on the web. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-cyan-300">
                  Public showcase. Private back door.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Claim <span className="text-slate-200 font-mono font-medium">username.portside.lol</span>. Anyone visiting your root URL gets a fast, branded showcase of your live staging projects. Add <span className="text-sky-300 font-mono font-medium">/lan</span> to reach your private databases, AI endpoints, and dev services—authenticated and reachable from your phone on 5G.
              </p>

              <div className="pt-2 flex items-center justify-center">
                <div
                  role="tablist"
                  aria-label="Showcase gateway mode"
                  className="inline-flex p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl max-w-full gap-1 sm:gap-1.5"
                >
                  <button
                    type="button"
                    role="tab"
                    id="tab-public"
                    aria-selected={activeShowcaseMode === "public" && showcaseViewMode === "preview"}
                    aria-controls="panel-showcase"
                    onClick={() => {
                      setActiveShowcaseMode("public");
                      setShowcaseViewMode("preview");
                    }}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeShowcaseMode === "public" && showcaseViewMode === "preview"
                        ? "bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/25 ring-1 ring-sky-300"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span>Public Showcase</span>
                    <span className="hidden sm:inline text-[10px] font-mono opacity-80">(/)</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="tab-lan"
                    aria-selected={activeShowcaseMode === "lan" && showcaseViewMode === "preview"}
                    aria-controls="panel-showcase"
                    onClick={() => {
                      setActiveShowcaseMode("lan");
                      setShowcaseViewMode("preview");
                    }}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeShowcaseMode === "lan" && showcaseViewMode === "preview"
                        ? "bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/25 ring-1 ring-amber-200"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Private Gateway</span>
                    <span className="hidden sm:inline text-[10px] font-mono opacity-80">(/lan)</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="tab-wire"
                    aria-selected={showcaseViewMode === "wire"}
                    aria-controls="panel-showcase"
                    onClick={() => setShowcaseViewMode(showcaseViewMode === "wire" ? "preview" : "wire")}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      showcaseViewMode === "wire"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-300"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                    }`}
                    title="Inspect raw HTTP stream & wire protocol"
                  >
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    <span>Wire Protocol</span>
                  </button>
                </div>
              </div>
            </div>

            <div
              id="panel-showcase"
              role="tabpanel"
              aria-labelledby={
                showcaseViewMode === "wire" ? "tab-wire" : activeShowcaseMode === "public" ? "tab-public" : "tab-lan"
              }
              className="rounded-2xl border border-slate-800 bg-[#070d17] shadow-2xl overflow-hidden transition-all duration-300 relative group"
            >
              <div className="px-4 sm:px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-xl">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono w-full focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/30 transition shadow-inner">
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
                    <span className="text-slate-300 select-none truncate font-medium">
                      .portside.lol{showcaseViewMode === "wire" ? "/api/v1/health" : activeShowcaseMode === "lan" ? "/lan" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-slate-300 shadow-xs">
                    <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>1.2ms RTT</span>
                    <span className="text-slate-600">&middot;</span>
                    <span className="text-slate-400 font-sans">Daemon v1.4.2</span>
                  </div>

                  {activeShowcaseMode === "public" && showcaseViewMode !== "wire" ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 font-medium shadow-xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Live Edge Route</span>
                    </span>
                  ) : activeShowcaseMode === "lan" && showcaseViewMode !== "wire" ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center gap-1.5 font-medium shadow-xs">
                      <KeyRound className="w-3 h-3" />
                      <span>Session Verified</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 flex items-center gap-1.5 font-medium shadow-xs">
                      <Terminal className="w-3 h-3" />
                      <span>Direct Stream</span>
                    </span>
                  )}
                </div>
              </div>

              {showcaseViewMode === "wire" ? (
                <div className="p-5 sm:p-7 bg-[#05080f] font-mono text-xs text-slate-300 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Terminal className="w-4 h-4" />
                      <span className="font-bold">Raw Wire Protocol Inspection</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCliCmd(`curl -I https://${showcaseSubdomain || "pact"}.portside.lol`)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedCliCmd === `curl -I https://${showcaseSubdomain || "pact"}.portside.lol` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy cURL</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
                    <p className="text-slate-500"># Direct HTTP/2 Edge Handshake stream</p>
                    <p className="text-sky-400 font-semibold">$ curl -I https://{showcaseSubdomain || "pact"}.portside.lol</p>
                    <p className="text-emerald-400">HTTP/2 200 OK</p>
                    <p><span className="text-slate-500">server:</span> portside-edge-ingress/1.4.2</p>
                    <p><span className="text-slate-500">date:</span> Thu, 10 Sep 2026 22:25:00 GMT</p>
                    <p><span className="text-slate-500">content-type:</span> text/html; charset=utf-8</p>
                    <p><span className="text-slate-500">x-portside-daemon-pid:</span> 8492</p>
                    <p><span className="text-slate-500">x-portside-local-port:</span> 3000</p>
                    <p><span className="text-slate-500">x-portside-tunnel-latency:</span> 1.2ms (direct-wire)</p>
                    <p><span className="text-slate-500">x-portside-auth:</span> verified-supporter-token</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-8">
                  {activeShowcaseMode === "public" ? (
                    <div className="space-y-6">
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-950/80 border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 via-sky-500/10 to-transparent border border-sky-500/30 flex items-center justify-center font-mono font-bold text-xl text-sky-400 shrink-0 shadow-inner">
                            {(showcaseSubdomain || "p").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg font-bold text-white tracking-tight">{showcaseSubdomain || "pact"}</span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-sky-300 bg-sky-500/15 border border-sky-500/30 font-medium">
                                PortSide Verified
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Full-Stack Developer &middot; Distributed Systems &middot; {showcaseSubdomain || "pact"}@virtuoushigh.com
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                          <a
                            href="https://github.com/letsmakepact"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition flex items-center justify-center gap-2 shadow-xs"
                          >
                            <span>GitHub</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          </a>
                          <a
                            href="https://t.me/pactwithdevil"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 min-h-[44px] rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-xs font-mono text-sky-300 transition flex items-center justify-center gap-2 shadow-xs"
                          >
                            <span>Telegram</span>
                            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                          </a>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="font-semibold text-slate-200 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-sky-400" />
                            <span>Live Hosted Projects</span>
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            Forwarded from local dev environment
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 snap-x snap-mandatory flex overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3 min-w-[280px] md:min-w-0 snap-start shadow-md">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">web-portfolio</span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-medium">
                                  200 OK
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Interactive personal portfolio built with Next.js 15 and Tailwind CSS.
                              </p>
                            </div>
                            <div className="space-y-2 pt-2.5 border-t border-slate-800/80">
                              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <span className="text-slate-500">127.0.0.1:3000</span>
                                <span className="text-sky-400 font-medium">/ (Root)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyCliCmd(`portside share :3000 --as ${showcaseSubdomain || "pact"}`)}
                                className="w-full py-1.5 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between transition cursor-pointer"
                              >
                                <span className="truncate">$ portside share :3000</span>
                                {copiedCliCmd === `portside share :3000 --as ${showcaseSubdomain || "pact"}` ? (
                                  <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3 min-w-[280px] md:min-w-0 snap-start shadow-md">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">client-staging</span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-medium">
                                  HMR Active
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Real-time client design review environment with live hot-reloading.
                              </p>
                            </div>
                            <div className="space-y-2 pt-2.5 border-t border-slate-800/80">
                              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <span className="text-slate-500">127.0.0.1:5173</span>
                                <span className="text-sky-400 font-medium">/demo</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyCliCmd(`portside share :5173 --as ${showcaseSubdomain || "pact"}`)}
                                className="w-full py-1.5 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between transition cursor-pointer"
                              >
                                <span className="truncate">$ portside share :5173</span>
                                {copiedCliCmd === `portside share :5173 --as ${showcaseSubdomain || "pact"}` ? (
                                  <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3 min-w-[280px] md:min-w-0 snap-start shadow-md">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">portside-engine</span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-medium">
                                  Go Proxy
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                High-throughput reverse proxy API daemon written in Go.
                              </p>
                            </div>
                            <div className="space-y-2 pt-2.5 border-t border-slate-800/80">
                              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <span className="text-slate-500">127.0.0.1:8081</span>
                                <span className="text-sky-400 font-medium">/api</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyCliCmd(`portside share :8081 --as ${showcaseSubdomain || "pact"}`)}
                                className="w-full py-1.5 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between transition cursor-pointer"
                              >
                                <span className="truncate">$ portside share :8081</span>
                                {copiedCliCmd === `portside share :8081 --as ${showcaseSubdomain || "pact"}` ? (
                                  <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.04] to-slate-950/80 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white tracking-tight">Zero-Trust Developer Gateway</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-medium">
                                Active Passkey Session
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Encrypted wire tunnel directly into your workstation. Isolated from public web traffic.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3.5 py-2 rounded-xl shrink-0 shadow-xs">
                          <Smartphone className="w-4 h-4 text-amber-400" />
                          <span>Cellular 5G Paired</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="font-semibold text-slate-200 flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Active Backend Daemons</span>
                          </span>
                          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Zero Public Ingress</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/80 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3 shadow-md">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                                  <Database className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white font-mono">postgres-pgadmin</h4>
                                  <span className="text-[10px] font-mono text-slate-400">127.0.0.1:5432</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/30 text-amber-300 text-[10px] font-mono shrink-0">
                                /lan/db
                              </span>
                            </div>
                            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-400">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Connection Pool:</span>
                                <span className="text-emerald-400">8 active</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Internal Latency:</span>
                                <span className="text-slate-300">0.2ms</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/80 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3 shadow-md">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                                  <Cpu className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white font-mono">ollama-ai-engine</h4>
                                  <span className="text-[10px] font-mono text-slate-400">127.0.0.1:11434</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/30 text-amber-300 text-[10px] font-mono shrink-0">
                                /lan/ai
                              </span>
                            </div>
                            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-400">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Loaded Model:</span>
                                <span className="text-violet-300 truncate max-w-[110px]">llama3.3:70b</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Token Stream:</span>
                                <span className="text-emerald-400">38 tok/s</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/80 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3 shadow-md">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                  <Server className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white font-mono">redis-commander</h4>
                                  <span className="text-[10px] font-mono text-slate-400">127.0.0.1:6379</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/30 text-amber-300 text-[10px] font-mono shrink-0">
                                /lan/redis
                              </span>
                            </div>
                            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-400">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Allocated RAM:</span>
                                <span className="text-slate-300">24.6 MB</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Cache Hit Ratio:</span>
                                <span className="text-emerald-400">99.4%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="px-5 sm:px-8 py-4 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 text-center sm:text-left flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {activeShowcaseMode === "public"
                      ? `Anyone can explore your live projects and bio directly at ${showcaseSubdomain || "pact"}.portside.lol.`
                      : "Protected /lan routes are encrypted via local session token. Unreachable without credentials."}
                  </span>
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a
                    href="https://buymeacoffee.com/pacts/membership"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 px-5 py-2.5 font-bold text-xs transition inline-flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-[0.98] min-h-[44px]"
                  >
                    <span>Claim {showcaseSubdomain || "pact"}.portside.lol ($5.99/mo)</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <a
                    href={`https://${showcaseSubdomain || "pact"}.portside.lol`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-4 py-2.5 font-medium text-xs transition inline-flex items-center justify-center active:scale-[0.98] min-h-[44px]"
                  >
                    Live Demo
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              <div className="p-5 rounded-2xl bg-[#070d17] border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Zero Port Forwarding</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Encrypted edge tunnels mean your home IP and router stay sealed. No public port exposure or NAT configuration required.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#070d17] border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Single Hostname Routing</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  One custom domain (<code className="text-slate-300 font-mono">username.portside.lol</code>) serves public client demos at root and auth-gated tools at <code className="text-amber-300 font-mono">/lan</code>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#070d17] border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Remote 5G Access</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Open your private development tools and services right from your phone browser while away from your desk, even on mobile cellular data.
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
