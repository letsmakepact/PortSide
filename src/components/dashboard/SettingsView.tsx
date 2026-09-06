"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  Sliders,
  User,
  Sparkles,
  Wifi,
  Shield,
  Network,
  Info,
  CheckCircle2,
  XCircle,
  QrCode,
  Globe,
  Server,
  Lock,
  Radio,
  Tv,
} from "lucide-react";
import { useDashboard } from "./DashboardProvider";
import { Button } from "@/components/ui/Button";
import { Card, Input, Label, PageHeader } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { SupporterBadge } from "@/components/ui/SupporterBadge";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const {
    user,
    setUser,
    isSupporter,
    activateLicense,
    verifyServerSupporter,
    openSupport,
    appPort,
    autoCheck,
    setAutoCheck,
    theme,
    setTheme,
    services,
  } = useDashboard();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "profile" | "supporter" | "hotspot" | "account" | "routing" | "about">("general");
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [isOnApp, setIsOnApp] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [activatingKey, setActivatingKey] = useState(false);
  const [rechecking, setRechecking] = useState(false);

  // Profile states
  const [profileHandle, setProfileHandle] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [profileBannerUrl, setProfileBannerUrl] = useState("");
  const [profileBannerPreset, setProfileBannerPreset] = useState<"cyber-mesh" | "matrix-emerald" | "obsidian-glow" | "midnight-neon" | "pure-carbon">("cyber-mesh");
  const [profileAccentColor, setProfileAccentColor] = useState<"sky" | "emerald" | "violet" | "amber" | "rose" | "cyan">("sky");
  const [profileLocation, setProfileLocation] = useState("");
  const [profilePronouns, setProfilePronouns] = useState("");
  const [profileOrganization, setProfileOrganization] = useState("");
  const [profileStatusText, setProfileStatusText] = useState("Node Online & Active");
  const [profileStatusIndicator, setProfileStatusIndicator] = useState<"online" | "building" | "busy" | "away">("online");
  const [profileVerifiedBadgeText, setProfileVerifiedBadgeText] = useState("PortSide Verified Supporter");
  const [profileGithub, setProfileGithub] = useState("");
  const [profileTwitter, setProfileTwitter] = useState("");
  const [profileBmc, setProfileBmc] = useState("");
  const [profileWebsite, setProfileWebsite] = useState("");
  const [profileDiscord, setProfileDiscord] = useState("");
  const [profileTelegram, setProfileTelegram] = useState("");
  const [profileLinkedin, setProfileLinkedin] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSkills, setProfileSkills] = useState("");
  const [profileVisibleServices, setProfileVisibleServices] = useState<string[]>([]);
  const [profileProjectOverrides, setProfileProjectOverrides] = useState<Record<string, { title?: string; description?: string; tags?: string[]; featured?: boolean; repoUrl?: string }>>({});
  const [profileCustomLinks, setProfileCustomLinks] = useState<Array<{ id: string; label: string; url: string; description?: string }>>([]);
  const [profileShowProjects, setProfileShowProjects] = useState(true);
  const [profileProjectsTitle, setProfileProjectsTitle] = useState("Live Hosted Projects");
  const [profileProjectsSubtitle, setProfileProjectsSubtitle] = useState("Active projects hosted directly through PortSide. Open and test in real-time.");
  const [profileShowCta, setProfileShowCta] = useState(true);
  const [profileCtaTitle, setProfileCtaTitle] = useState("Sovereign Local Hosting via PortSide");
  const [profileCtaDescription, setProfileCtaDescription] = useState("Every project listed here is connected directly through PortSide. Zero third-party cloud hosting required.");
  const [profileCtaButtonText, setProfileCtaButtonText] = useState("Get PortSide");
  const [profileCtaButtonUrl, setProfileCtaButtonUrl] = useState("https://buymeacoffee.com/pacts");
  const [profileSubTab, setProfileSubTab] = useState<"identity" | "theme" | "skills" | "socials" | "projects" | "links" | "cta">("identity");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Hotspot states
  const [hotspotActive, setHotspotActive] = useState(false);
  const [hotspotSsid, setHotspotSsid] = useState("PortSide-DevNet");
  const [hotspotKey, setHotspotKey] = useState("portside123");
  const [showHotspotKey, setShowHotspotKey] = useState(false);
  const [copiedHotspotKey, setCopiedHotspotKey] = useState(false);
  const [loadingHotspot, setLoadingHotspot] = useState(false);
  const [savingHotspot, setSavingHotspot] = useState(false);
  const [savedHotspotMsg, setSavedHotspotMsg] = useState("");
  const [serverConfirmedHotspot, setServerConfirmedHotspot] = useState(false);
  const [publicTunnelUrl, setPublicTunnelUrl] = useState<string>("");
  const [copiedTunnel, setCopiedTunnel] = useState(false);

  useEffect(() => {
    if (activeTab !== "hotspot") return;
    setLoadingHotspot(true);
    fetch("/api/hotspot")
      .then((r) => r.json())
      .then((d) => {
        setServerConfirmedHotspot(Boolean(d.isSupporter && d.serverConfirmed));
        if (d.active !== undefined) setHotspotActive(d.active);
        if (d.ssid) setHotspotSsid(d.ssid);
        if (d.key && d.key !== "********") setHotspotKey(d.key);
        if (d.publicTunnelUrl) setPublicTunnelUrl(d.publicTunnelUrl);
      })
      .catch(() => {
        setServerConfirmedHotspot(false);
      })
      .finally(() => setLoadingHotspot(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "profile") return;
    setLoadingProfile(true);
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          const p = d.profile;
          setProfileHandle(p.handle || "");
          setProfileName(p.name || "");
          setProfileTitle(p.title || "");
          setProfileBio(p.bio || "");
          setProfileAvatarUrl(p.avatarUrl || "");
          setProfileBannerUrl(p.bannerUrl || "");
          setProfileBannerPreset(p.bannerPreset || "cyber-mesh");
          setProfileAccentColor(p.accentColor || "sky");
          setProfileLocation(p.location || "");
          setProfilePronouns(p.pronouns || "");
          setProfileOrganization(p.organization || "");
          setProfileStatusText(p.statusText || "Node Online & Active");
          setProfileStatusIndicator(p.statusIndicator || "online");
          setProfileVerifiedBadgeText(p.verifiedBadgeText || "PortSide Verified Supporter");
          setProfileGithub(p.github || "");
          setProfileTwitter(p.twitter || "");
          setProfileBmc(p.buymeacoffee || "");
          setProfileWebsite(p.website || "");
          setProfileDiscord(p.discord || "");
          setProfileTelegram(p.telegram || "");
          setProfileLinkedin(p.linkedin || "");
          setProfileEmail(p.email || "");
          setProfileSkills(Array.isArray(p.skills) ? p.skills.join(", ") : "");
          setProfileVisibleServices(p.visibleServices || []);
          setProfileProjectOverrides(p.projectOverrides || {});
          setProfileCustomLinks(p.customLinks || []);
          setProfileShowProjects(p.showProjects !== false);
          setProfileProjectsTitle(p.projectsTitle || "Live Hosted Projects");
          setProfileProjectsSubtitle(p.projectsSubtitle || "Active projects hosted directly through PortSide. Open and test in real-time.");
          setProfileShowCta(p.showCta !== false);
          setProfileCtaTitle(p.ctaTitle || "Sovereign Local Hosting via PortSide");
          setProfileCtaDescription(p.ctaDescription || "Every project listed here is connected directly through PortSide. Zero third-party cloud hosting required.");
          setProfileCtaButtonText(p.ctaButtonText || "Get PortSide");
          setProfileCtaButtonUrl(p.ctaButtonUrl || "https://buymeacoffee.com/pacts");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [activeTab]);

  async function savePublicProfile(e?: FormEvent) {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const skillsArray = profileSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        handle: profileHandle,
        name: profileName,
        title: profileTitle,
        bio: profileBio,
        avatarUrl: profileAvatarUrl,
        bannerUrl: profileBannerUrl,
        bannerPreset: profileBannerPreset,
        accentColor: profileAccentColor,
        location: profileLocation,
        pronouns: profilePronouns,
        organization: profileOrganization,
        statusText: profileStatusText,
        statusIndicator: profileStatusIndicator,
        verifiedBadgeText: profileVerifiedBadgeText,
        github: profileGithub,
        twitter: profileTwitter,
        buymeacoffee: profileBmc,
        website: profileWebsite,
        discord: profileDiscord,
        telegram: profileTelegram,
        linkedin: profileLinkedin,
        email: profileEmail,
        skills: skillsArray,
        visibleServices: profileVisibleServices,
        projectOverrides: profileProjectOverrides,
        customLinks: profileCustomLinks,
        showProjects: profileShowProjects,
        projectsTitle: profileProjectsTitle,
        projectsSubtitle: profileProjectsSubtitle,
        showCta: profileShowCta,
        ctaTitle: profileCtaTitle,
        ctaDescription: profileCtaDescription,
        ctaButtonText: profileCtaButtonText,
        ctaButtonUrl: profileCtaButtonUrl,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast({ tone: "success", title: "Public Profile Saved", description: "Your custom showcase changes are live immediately." });
      } else {
        toast({ tone: "error", title: "Failed to save profile" });
      }
    } catch {
      toast({ tone: "error", title: "Failed to save profile" });
    } finally {
      setSavingProfile(false);
    }
  }

  function toggleServiceVisibility(hostname: string) {
    setProfileVisibleServices((prev) => {
      if (prev.includes(hostname)) {
        return prev.filter((h) => h !== hostname);
      } else {
        return [...prev, hostname];
      }
    });
  }

  function updateProjectOverride(hostname: string, field: string, val: any) {
    setProfileProjectOverrides((prev) => ({
      ...prev,
      [hostname]: {
        ...(prev[hostname] || {}),
        [field]: val,
      },
    }));
  }

  function addCustomLink() {
    setProfileCustomLinks((prev) => [
      ...prev,
      { id: Date.now().toString(), label: "New Resource Link", url: "https://", description: "" },
    ]);
  }

  function removeCustomLink(id: string) {
    setProfileCustomLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function updateCustomLink(id: string, field: "label" | "url" | "description", val: string) {
    setProfileCustomLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: val } : l))
    );
  }

  async function toggleHotspot() {
    setSavingHotspot(true);
    setSavedHotspotMsg("");
    try {
      const res = await fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !hotspotActive, ssid: hotspotSsid, key: hotspotKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 || data.requiresSupporter) {
          setServerConfirmedHotspot(false);
          openSupport();
          return;
        }
      } else {
        setHotspotActive(data.active);
        setServerConfirmedHotspot(true);
        setSavedHotspotMsg(data.active ? "Hotspot broadcasting live!" : "Hotspot stopped.");
        toast({
          tone: "success",
          title: data.active ? "Hotspot Active" : "Hotspot Stopped",
          description: data.active ? `Broadcasting SSID "${hotspotSsid}"` : "Hotspot disabled.",
        });
        setTimeout(() => setSavedHotspotMsg(""), 3000);
      }
    } catch {
      toast({ tone: "error", title: "Failed to toggle hotspot" });
    } finally {
      setSavingHotspot(false);
    }
  }

  async function saveHotspotSettings(e: FormEvent) {
    e.preventDefault();
    if (hotspotKey.length < 8) {
      toast({ tone: "error", title: "Wi-Fi password must be at least 8 characters long." });
      return;
    }
    setSavingHotspot(true);
    setSavedHotspotMsg("");
    try {
      const res = await fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: hotspotActive, ssid: hotspotSsid, key: hotspotKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedHotspotMsg("Settings saved to machine.");
        toast({ tone: "success", title: "Wi-Fi Hotspot configuration saved" });
        setTimeout(() => setSavedHotspotMsg(""), 3000);
      } else {
        toast({ tone: "error", title: data.error ?? "Failed to save hotspot settings" });
      }
    } catch {
      toast({ tone: "error", title: "Failed to save hotspot settings" });
    } finally {
      setSavingHotspot(false);
    }
  }

  function copyHotspotPassword() {
    navigator.clipboard.writeText(hotspotKey);
    setCopiedHotspotKey(true);
          toast({ tone: "info", title: "Password copied to clipboard" });
    setTimeout(() => setCopiedHotspotKey(false), 2000);
  }

  const example = services[0];
  useEffect(() => {
    const isLocal = typeof window !== "undefined" && (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".localhost") ||
      window.location.hostname.endsWith(".local")
    );
    fetch("/api/updates/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.isExe !== undefined) {
          setIsOnApp(Boolean(d.isExe || isLocal));
        } else {
          setIsOnApp(isLocal);
        }
      })
      .catch(() => {
        setIsOnApp(isLocal);
      });
  }, []);

  const portSuffix = appPort !== "80" ? `:${appPort}` : "";

  async function checkForUpdates() {
    setCheckingUpdate(true);
    setUpdateStatus(null);
    try {
      const res = await fetch("/api/updates/check");
      const data = await res.json();
      if (data.updateAvailable) {
        setUpdateStatus(`Update available: v${data.latestVersion}! Click below to view.`);
        toast({ tone: "info", title: `New version v${data.latestVersion} available!` });
      } else {
        setUpdateStatus(`You are on the latest version (v${data.currentVersion}).`);
        toast({ tone: "success", title: "Portside is up to date." });
      }
    } catch {
      setUpdateStatus("Could not reach update server.");
      toast({ tone: "error", title: "Error checking for updates" });
    } finally {
      setCheckingUpdate(false);
    }
  }

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    const prev = user;
    setUser({ ...user, name });
    const res = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (!res.ok) {
      setUser(prev);
      toast({ tone: "error", title: data.error ?? "Couldn't update profile" });
    } else {
      toast({ tone: "success", title: "Profile updated" });
    }
    setSavingName(false);
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setSavingPw(true);
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) toast({ tone: "error", title: data.error ?? "Couldn't change password" });
    else {
      toast({ tone: "success", title: "Password changed" });
      setCurrentPassword("");
      setNewPassword("");
    }
    setSavingPw(false);
  }

  async function handleActivate(e: FormEvent) {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    setActivatingKey(true);
    const res = await activateLicense(licenseKey.trim());
    if (res.ok) {
      setLicenseKey("");
    }
    setActivatingKey(false);
  }

  async function handleReverify() {
    setRechecking(true);
    const confirmed = await verifyServerSupporter();
    if (confirmed) {
      toast({ tone: "success", title: "Server Confirmed", description: "Supporter license verified by the server." });
    } else {
      toast({ tone: "info", title: "Free Tier Confirmed", description: "Server verified instance is on Free tier." });
    }
    setRechecking(false);
  }

  const tabs = [
    { id: "general", label: "Preferences", icon: Sliders },
    { id: "profile", label: "Public Profile", icon: User },
    { id: "supporter", label: "Supporter Perks", icon: Sparkles },
    { id: "hotspot", label: "Wi-Fi Hotspot", icon: Wifi },
    { id: "account", label: "Account", icon: Shield },
    { id: "routing", label: "Proxy Routing", icon: Network },
    { id: "about", label: "Updates & About", icon: Info },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your dashboard preferences, account security, and routing configuration." />

      {/* Tab Navigation Bar - responsive segmented pills that naturally wrap and fit without scrolling */}
      <nav aria-label="Settings Tabs" className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all touch-action-manipulation shrink-0 sm:shrink",
                isActive
                  ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700/80"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/40 border border-transparent",
              )}
            >
              <IconComp className={cn("h-3.5 w-3.5", isActive ? "text-sky-500 dark:text-sky-400" : "text-slate-400 dark:text-slate-500")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* TAB 1: GENERAL / PREFERENCES & HEALTH */}
      {activeTab === "general" && (
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose your preferred dashboard interface style.</p>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-lg border p-3.5 text-left transition-colors",
                  theme === "light"
                    ? "border-brand-primary bg-brand-surface text-slate-900 dark:border-sky-500/60 dark:bg-brand-surface-dark dark:text-white"
                    : "border-slate-200 bg-brand-surface text-slate-600 hover:bg-brand-bg dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-800/40",
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-800 border border-slate-200 shadow-xs dark:bg-slate-900 dark:text-amber-400 dark:border-slate-800">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                </span>
                <div>
                  <p className="text-xs font-semibold">Light Mode</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Default high-contrast light theme</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-lg border p-3.5 text-left transition-colors",
                  theme === "dark"
                    ? "border-brand-primary bg-brand-surface text-slate-900 dark:border-sky-500/60 dark:bg-brand-surface-dark dark:text-white"
                    : "border-slate-200 bg-brand-surface text-slate-600 hover:bg-brand-bg dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-800/40",
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sky-400 border border-slate-800">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                </span>
                <div>
                  <p className="text-xs font-semibold">Bluish Black Dark</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">High-contrast dark theme</p>
                </div>
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Background Health Monitor</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Portside periodically probes each registered local port every 15 seconds to log latency and connectivity transitions.</p>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-lg border border-slate-200/90 bg-slate-50/50 p-3.5 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-[#0f172a]/50 dark:hover:bg-slate-800/40">
              <div>
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Automatic health checks</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Turn off to only check ports when you explicitly click “Check now”.</span>
              </div>
              <span
                role="switch"
                aria-checked={autoCheck}
                onClick={() => setAutoCheck(!autoCheck)}
                className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", autoCheck ? "bg-slate-900 dark:bg-sky-500" : "bg-slate-300 dark:bg-slate-800")}
              >
                <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform", autoCheck ? "translate-x-4.5" : "translate-x-0.5")} />
              </span>
            </label>
          </Card>
        </div>
      )}

      {/* TAB: PUBLIC PROFILE & ABOUT ME */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Top Live URL & Actions Banner */}
          <Card className="p-5 border-sky-500/30 bg-gradient-to-r from-sky-950/30 via-slate-900 to-slate-950 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Public Developer Showcase Live
                  </h2>
                  <SupporterBadge size="xs" />
                </div>
                <p className="text-xs text-slate-400">
                  Your customized About Me profile and live hosted projects are instantly accessible globally.
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="font-mono text-xs text-sky-400 font-semibold bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                    {publicTunnelUrl || (profileHandle ? `https://${profileHandle}.portside.lol` : "https://pact.portside.lol")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const url = publicTunnelUrl || (profileHandle ? `https://${profileHandle}.portside.lol` : "https://pact.portside.lol");
                      navigator.clipboard.writeText(url);
                      toast({ tone: "info", title: "Showcase URL copied to clipboard" });
                    }}
                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={publicTunnelUrl || "/profile"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition"
                >
                  Preview Page
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
                <Button onClick={() => savePublicProfile()} loading={savingProfile}>
                  Save All Changes
                </Button>
              </div>
            </div>
          </Card>

          {loadingProfile ? (
            <Card className="p-12 text-center text-xs text-slate-500">
              Loading profile settings...
            </Card>
          ) : (
            <div className="space-y-5">
              {/* Profile Sub-Tab Navigation Bar */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                {[
                  { id: "identity", label: "Identity & Bio" },
                  { id: "theme", label: "Theme & Visuals" },
                  { id: "skills", label: "Skills & Stacks" },
                  { id: "socials", label: "Socials & Contacts" },
                  { id: "projects", label: "Projects & Services" },
                  { id: "links", label: "Custom Links" },
                  { id: "cta", label: "Call To Action" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setProfileSubTab(st.id as any)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      profileSubTab === st.id
                        ? "bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 font-bold shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-white/5"
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* SUBTAB 1: IDENTITY & BIO */}
              {profileSubTab === "identity" && (
                <Card className="p-6 space-y-5">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Developer Identity & Status</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control how your personal profile, credentials, and real-time status appear.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="profName">Display Name</Label>
                      <Input
                        id="profName"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="e.g. pact"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="profHandle">Vanity Subdomain Handle</Label>
                      <Input
                        id="profHandle"
                        value={profileHandle}
                        onChange={(e) => setProfileHandle(e.target.value)}
                        placeholder="e.g. pact (pact.portside.lol)"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="profTitle">Professional Title / Headline</Label>
                      <Input
                        id="profTitle"
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                        placeholder="e.g. Full-Stack Developer & Systems Architect"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="profBio">About Me / Long Bio</Label>
                      <textarea
                        id="profBio"
                        rows={4}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        placeholder="Write your developer story, what you build, and what technologies excite you..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="profLoc">Location</Label>
                      <Input
                        id="profLoc"
                        value={profileLocation}
                        onChange={(e) => setProfileLocation(e.target.value)}
                        placeholder="e.g. San Francisco, CA or Global / Remote"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profOrg">Organization / Company</Label>
                      <Input
                        id="profOrg"
                        value={profileOrganization}
                        onChange={(e) => setProfileOrganization(e.target.value)}
                        placeholder="e.g. PortSide Core or Independent"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profPronouns">Pronouns</Label>
                      <Input
                        id="profPronouns"
                        value={profilePronouns}
                        onChange={(e) => setProfilePronouns(e.target.value)}
                        placeholder="e.g. he/him or she/her"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profBadge">Verified Badge Label</Label>
                      <Input
                        id="profBadge"
                        value={profileVerifiedBadgeText}
                        onChange={(e) => setProfileVerifiedBadgeText(e.target.value)}
                        placeholder="e.g. PortSide Verified Supporter"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <Label>Live Status Indicator</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "online", label: "Online", color: "bg-emerald-400" },
                          { id: "building", label: "In Dev / Building", color: "bg-amber-400" },
                          { id: "busy", label: "Deep Focus", color: "bg-rose-400" },
                          { id: "away", label: "Standby", color: "bg-slate-400" },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setProfileStatusIndicator(st.id as any)}
                            className={cn(
                              "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition",
                              profileStatusIndicator === st.id
                                ? "border-sky-500 bg-sky-500/10 text-white"
                                : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700"
                            )}
                          >
                            <span className={cn("h-2.5 w-2.5 rounded-full", st.color)} />
                            <span>{st.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="profStatusText">Custom Status Message</Label>
                      <Input
                        id="profStatusText"
                        value={profileStatusText}
                        onChange={(e) => setProfileStatusText(e.target.value)}
                        placeholder="e.g. Node Online & Active"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* SUBTAB 2: THEME & VISUALS */}
              {profileSubTab === "theme" && (
                <Card className="p-6 space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Theme & Visual Styling</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize your page palette, ambient glows, header banners, and avatar.</p>
                  </div>

                  {/* Accent Color Selection */}
                  <div className="space-y-3">
                    <Label>Profile Accent Palette</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                      {[
                        { id: "sky", label: "Sky Blue", bg: "bg-sky-500" },
                        { id: "emerald", label: "Matrix Emerald", bg: "bg-emerald-500" },
                        { id: "violet", label: "Electric Violet", bg: "bg-violet-500" },
                        { id: "amber", label: "Golden Amber", bg: "bg-amber-500" },
                        { id: "rose", label: "Crimson Rose", bg: "bg-rose-500" },
                        { id: "cyan", label: "Cyber Cyan", bg: "bg-cyan-500" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setProfileAccentColor(c.id as any)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition text-left",
                            profileAccentColor === c.id
                              ? "border-white/50 bg-white/10 text-white ring-2 ring-white/20"
                              : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700"
                          )}
                        >
                          <span className={cn("h-3 w-3 rounded-full shrink-0", c.bg)} />
                          <span className="truncate">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Banner Presets */}
                  <div className="space-y-3">
                    <Label>Header Banner Style Preset</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: "cyber-mesh", label: "Cyber Mesh", desc: "Sky & Indigo glow" },
                        { id: "matrix-emerald", label: "Matrix Emerald", desc: "Dark green & teal" },
                        { id: "midnight-neon", label: "Midnight Neon", desc: "Violet & purple aura" },
                        { id: "obsidian-glow", label: "Obsidian Glow", desc: "Monochrome silver" },
                        { id: "pure-carbon", label: "Pure Carbon", desc: "Dark graphite weave" },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setProfileBannerPreset(b.id as any)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition",
                            profileBannerPreset === b.id
                              ? "border-sky-500 bg-sky-500/10 text-white ring-2 ring-sky-500/20"
                              : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700"
                          )}
                        >
                          <p className="text-xs font-bold text-white">{b.label}</p>
                          <p className="text-[10px] text-slate-500">{b.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Banner & Avatar URLs with Live Previews */}
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="profBanner">Custom Banner Image URL (Optional)</Label>
                      <Input
                        id="profBanner"
                        value={profileBannerUrl}
                        onChange={(e) => setProfileBannerUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or image link"
                      />
                      <p className="text-[11px] text-slate-500">Leave empty to use the selected banner preset.</p>
                      {profileBannerUrl && (
                        <div className="h-20 w-full rounded-xl overflow-hidden border border-white/10 mt-2">
                          <img src={profileBannerUrl} alt="Banner Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profAvatar">Avatar Image URL</Label>
                      <Input
                        id="profAvatar"
                        value={profileAvatarUrl}
                        onChange={(e) => setProfileAvatarUrl(e.target.value)}
                        placeholder="https://github.com/letsmakepact.png"
                      />
                      <p className="text-[11px] text-slate-500">Supports GitHub avatar URLs or any image URL.</p>
                      {profileAvatarUrl && (
                        <div className="flex items-center gap-3 pt-1">
                          <div className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-sky-400/50 bg-slate-900">
                            <img src={profileAvatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                          </div>
                          <span className="text-xs text-slate-400">Live avatar preview</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* SUBTAB 3: SKILLS & STACKS */}
              {profileSubTab === "skills" && (
                <Card className="p-6 space-y-5">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tech Stack & Developer Skills</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Highlight the programming languages, frameworks, systems, and protocols you work with.</p>
                  </div>

                  <div>
                    <Label htmlFor="profSkills">Skills & Technologies (comma separated)</Label>
                    <Input
                      id="profSkills"
                      value={profileSkills}
                      onChange={(e) => setProfileSkills(e.target.value)}
                      placeholder="TypeScript, Next.js, Go, Tailwind CSS, PostgreSQL, Docker"
                    />
                  </div>

                  {/* Tag preview chips */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-slate-400">Current Skill Tags:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profileSkills.split(",").map((s) => s.trim()).filter(Boolean).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-mono text-sky-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick-add suggestions */}
                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <p className="text-xs text-slate-500">Quick-add popular technologies:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Rust", "Python", "C++", "Docker", "GraphQL", "Redis", "Linux", "Kubernetes", "WebSockets", "Kafka"].map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => {
                            const current = profileSkills.split(",").map((s) => s.trim()).filter(Boolean);
                            if (!current.includes(tech)) {
                              setProfileSkills([...current, tech].join(", "));
                            }
                          }}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition"
                        >
                          + {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* SUBTAB 4: SOCIALS & CONTACTS */}
              {profileSubTab === "socials" && (
                <Card className="p-6 space-y-5">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Social & Developer Channels</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Links displayed directly on your public hero header.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="profBmc">Buy Me a Coffee URL</Label>
                      <Input
                        id="profBmc"
                        value={profileBmc}
                        onChange={(e) => setProfileBmc(e.target.value)}
                        placeholder="https://buymeacoffee.com/pacts"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profGithub">GitHub Profile URL</Label>
                      <Input
                        id="profGithub"
                        value={profileGithub}
                        onChange={(e) => setProfileGithub(e.target.value)}
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profTwitter">Twitter / X URL</Label>
                      <Input
                        id="profTwitter"
                        value={profileTwitter}
                        onChange={(e) => setProfileTwitter(e.target.value)}
                        placeholder="https://x.com/username"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profWebsite">Personal Website URL</Label>
                      <Input
                        id="profWebsite"
                        value={profileWebsite}
                        onChange={(e) => setProfileWebsite(e.target.value)}
                        placeholder="https://pact.portside.lol"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profDiscord">Discord Username / Invite</Label>
                      <Input
                        id="profDiscord"
                        value={profileDiscord}
                        onChange={(e) => setProfileDiscord(e.target.value)}
                        placeholder="https://discord.gg/... or username"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profTelegram">Telegram URL / Handle</Label>
                      <Input
                        id="profTelegram"
                        value={profileTelegram}
                        onChange={(e) => setProfileTelegram(e.target.value)}
                        placeholder="https://t.me/username"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profLinkedin">LinkedIn URL</Label>
                      <Input
                        id="profLinkedin"
                        value={profileLinkedin}
                        onChange={(e) => setProfileLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <Label htmlFor="profEmail">Public Contact Email</Label>
                      <Input
                        id="profEmail"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="dev@example.com"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* SUBTAB 5: PROJECTS & PER-SERVICE OVERRIDES */}
              {profileSubTab === "projects" && (
                <Card className="p-6 space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Hosted Projects & Service Overrides</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize how each local service is presented and which ones are published.</p>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profileShowProjects}
                        onChange={(e) => setProfileShowProjects(e.target.checked)}
                        className="h-4 w-4 rounded-sm border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      Enable Projects Section
                    </label>
                  </div>

                  {profileShowProjects && (
                    <div className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="profProjTitle">Section Headline</Label>
                          <Input
                            id="profProjTitle"
                            value={profileProjectsTitle}
                            onChange={(e) => setProfileProjectsTitle(e.target.value)}
                            placeholder="Live Hosted Projects"
                          />
                        </div>
                        <div>
                          <Label htmlFor="profProjSub">Section Subtitle</Label>
                          <Input
                            id="profProjSub"
                            value={profileProjectsSubtitle}
                            onChange={(e) => setProfileProjectsSubtitle(e.target.value)}
                            placeholder="Hosted directly from local hardware..."
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Registered Services ({services.length})
                        </p>

                        {services.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">
                            No services registered yet. Add services to PortSide to showcase them.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {services.map((svc) => {
                              const isVisible = profileVisibleServices.length === 0 || profileVisibleServices.includes(svc.hostname);
                              const override = profileProjectOverrides[svc.hostname] || {};

                              return (
                                <div
                                  key={svc.id}
                                  className={cn(
                                    "p-4 rounded-2xl border transition space-y-3",
                                    isVisible
                                      ? "border-white/15 bg-white/[0.04]"
                                      : "border-slate-200/40 dark:border-slate-800/40 bg-slate-900/20 opacity-60"
                                  )}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                                    <div className="flex items-center gap-3">
                                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 font-mono text-sm">
                                        ⌘
                                      </span>
                                      <div>
                                        <p className="text-xs font-bold text-white">{svc.name}</p>
                                        <p className="font-mono text-[11px] text-slate-400">
                                          :{svc.port} · {svc.hostname}.localhost
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(override.featured)}
                                          onChange={(e) => updateProjectOverride(svc.hostname, "featured", e.target.checked)}
                                          className="h-3.5 w-3.5 rounded-sm border-slate-300 text-amber-500 focus:ring-amber-500"
                                        />
                                        Featured Badge
                                      </label>

                                      <button
                                        type="button"
                                        onClick={() => toggleServiceVisibility(svc.hostname)}
                                        className={cn(
                                          "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                                          isVisible
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                            : "bg-slate-800 text-slate-400 border border-slate-700"
                                        )}
                                      >
                                        {isVisible ? "Visible Online" : "Hidden"}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Custom overrides for this service */}
                                  <div className="grid gap-3 sm:grid-cols-3 pt-1">
                                    <div>
                                      <Label className="text-[11px]">Display Title Override</Label>
                                      <Input
                                        className="text-xs"
                                        value={override.title || ""}
                                        onChange={(e) => updateProjectOverride(svc.hostname, "title", e.target.value)}
                                        placeholder={svc.name}
                                      />
                                    </div>

                                    <div>
                                      <Label className="text-[11px]">GitHub / Repo Link</Label>
                                      <Input
                                        className="text-xs"
                                        value={override.repoUrl || ""}
                                        onChange={(e) => updateProjectOverride(svc.hostname, "repoUrl", e.target.value)}
                                        placeholder="https://github.com/..."
                                      />
                                    </div>

                                    <div className="sm:col-span-3">
                                      <Label className="text-[11px]">Custom Description</Label>
                                      <Input
                                        className="text-xs"
                                        value={override.description || ""}
                                        onChange={(e) => updateProjectOverride(svc.hostname, "description", e.target.value)}
                                        placeholder={svc.description || "Brief description for visitors..."}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* SUBTAB 6: CUSTOM LINKS */}
              {profileSubTab === "links" && (
                <Card className="p-6 space-y-5">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Custom Resource Links</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Add Linktree-style highlighted links, docs, articles, or resources to your showcase.</p>
                    </div>
                    <Button variant="secondary" onClick={addCustomLink}>
                      + Add Link
                    </Button>
                  </div>

                  {profileCustomLinks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">
                      No custom links added yet. Click &quot;+ Add Link&quot; above to create one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profileCustomLinks.map((link) => (
                        <div key={link.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-300">Custom Link</span>
                            <button
                              type="button"
                              onClick={() => removeCustomLink(link.id)}
                              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <Label className="text-[11px]">Link Label</Label>
                              <Input
                                value={link.label}
                                onChange={(e) => updateCustomLink(link.id, "label", e.target.value)}
                                placeholder="e.g. Read My Architecture Guide"
                              />
                            </div>
                            <div>
                              <Label className="text-[11px]">Destination URL</Label>
                              <Input
                                value={link.url}
                                onChange={(e) => updateCustomLink(link.id, "url", e.target.value)}
                                placeholder="https://..."
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <Label className="text-[11px]">Optional Subtitle / Description</Label>
                              <Input
                                value={link.description || ""}
                                onChange={(e) => updateCustomLink(link.id, "description", e.target.value)}
                                placeholder="Detailed write-up on zero-config LAN routing"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* SUBTAB 7: CALL TO ACTION */}
              {profileSubTab === "cta" && (
                <Card className="p-6 space-y-5">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bottom Call To Action (CTA) Banner</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Promote your project, freelance availability, or PortSide sponsorship.</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profileShowCta}
                        onChange={(e) => setProfileShowCta(e.target.checked)}
                        className="h-4 w-4 rounded-sm border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      Show CTA Banner
                    </label>
                  </div>

                  {profileShowCta && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="ctaTitle">Banner Headline</Label>
                        <Input
                          id="ctaTitle"
                          value={profileCtaTitle}
                          onChange={(e) => setProfileCtaTitle(e.target.value)}
                          placeholder="Sovereign Local Hosting via PortSide"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="ctaDesc">Banner Body Description</Label>
                        <textarea
                          id="ctaDesc"
                          rows={2}
                          value={profileCtaDescription}
                          onChange={(e) => setProfileCtaDescription(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                          placeholder="Description explaining your project or offer..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="ctaBtnText">Button Label</Label>
                        <Input
                          id="ctaBtnText"
                          value={profileCtaButtonText}
                          onChange={(e) => setProfileCtaButtonText(e.target.value)}
                          placeholder="Get PortSide or Hire Me"
                        />
                      </div>

                      <div>
                        <Label htmlFor="ctaBtnUrl">Button URL</Label>
                        <Input
                          id="ctaBtnUrl"
                          value={profileCtaButtonUrl}
                          onChange={(e) => setProfileCtaButtonUrl(e.target.value)}
                          placeholder="https://buymeacoffee.com/pacts"
                        />
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Bottom Sticky Save Button */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  Changes save directly to your persistent PortSide profile configuration.
                </p>
                <Button onClick={() => savePublicProfile()} loading={savingProfile}>
                  Save All Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: SUPPORTER & PERKS */}
      {activeTab === "supporter" && (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Current Tier Status</h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Your current PortSide instance license</p>
                </div>
                {isSupporter ? (
                  <SupporterBadge size="md" />
                ) : (
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Free Tier
                  </span>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {isSupporter
                    ? "Supporter tier is active on this instance."
                    : "You are currently on the Free tier."}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {isSupporter
                    ? "All perks are unlocked: zero-config Mobile & TV LAN access, Dev Wi-Fi hotspot broadcasting, and unlimited routes."
                    : "Support PortSide with any monthly amount on Buy Me a Coffee to unlock all supporter perks, or enter a license key below."}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {!isSupporter ? (
                    <button
                      type="button"
                      onClick={openSupport}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition"
                    >
                      Become a Supporter on Buy Me a Coffee
                    </button>
                  ) : null}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReverify}
                    loading={rechecking}
                  >
                    Verify with Server
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Activate License Key</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Enter your supporter license key or Buy Me a Coffee code.
              </p>
              <form onSubmit={handleActivate} className="mt-4 space-y-3.5">
                <div>
                  <Label htmlFor="licenseKey">Cryptographic License Key</Label>
                  <Input
                    id="licenseKey"
                    placeholder="PSL1.eyJlbWFpbCI6... (Cryptographically signed key)"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    Keys are cryptographically signed and bound to your account email ({user.email}).
                  </p>
                </div>
                <Button type="submit" loading={activatingKey} disabled={!licenseKey.trim()}>
                  Activate Supporter Status
                </Button>
              </form>
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Supporter Perks & Features</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                </span>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Mobile & Smart TV LAN</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Instant launchpad and custom routing for testing on phones, tablets, and TV screens.
                </p>
                <span className="mt-3 inline-block font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isSupporter ? "Unlocked" : "Locked for Free tier"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
                </span>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Dev Wi-Fi Hotspot</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Spawn an isolated private network directly from your workstation.
                </p>
                <span className="mt-3 inline-block font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isSupporter ? "Unlocked" : "Locked for Free tier"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                </span>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Official Desktop App</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Standalone workstation app for background management and seamless operation.
                </p>
                <span className="mt-3 inline-block font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isSupporter ? "Unlocked" : "Included with monthly support"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: DEV WI-FI HOTSPOT */}
      {activeTab === "hotspot" && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 font-bold">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Dev Wi-Fi Hotspot</h2>
                    <SupporterBadge size="xs" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Spawn a private isolated network directly from your workstation.
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center self-start sm:self-auto rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                  hotspotActive
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-700"
                }`}
              >
                {hotspotActive ? "● Hotspot Active" : "○ Hotspot Off"}
              </span>
            </div>

            {!isSupporter ? (
              <div className="mt-6 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-white dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900 p-6 text-center shadow-xs">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/20">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  Supporter Feature
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Hotspot networking features require an active Supporter plan to create dedicated environments for physical device testing.
                </p>
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={openSupport}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
                  >
                    Become a Supporter to Unlock
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {/* Zero-Config LAN info */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Local Network Routing</p>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Nearby devices on your current Wi-Fi can access your active projects.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Global Remote Access card */}
                {publicTunnelUrl && (
                  <div className="rounded-2xl border border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Remote Access</p>
                            <span className="rounded-full bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                              REMOTE LINK LIVE
                            </span>
                          </div>
                          <p className="font-mono text-xs text-sky-700 dark:text-sky-400 mt-0.5 break-all">
                            {publicTunnelUrl}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(publicTunnelUrl);
                            setCopiedTunnel(true);
                            setTimeout(() => setCopiedTunnel(false), 2000);
                          }}
                          className="rounded-lg border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-50 transition"
                        >
                          {copiedTunnel ? "Copied!" : "Copy Link"}
                        </button>
                        <a
                          href={publicTunnelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-sky-600 hover:bg-sky-500 px-2.5 py-1 text-xs font-semibold text-white transition"
                        >
                          Open Remote
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hotspot controls */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Isolated Wi-Fi Access Point</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            hotspotActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {hotspotActive ? "BROADCASTING" : "STOPPED"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Start or stop broadcasting your private hotspot directly from Windows.
                      </p>
                    </div>
                    <Button
                      variant={hotspotActive ? "secondary" : "primary"}
                      onClick={toggleHotspot}
                      loading={savingHotspot}
                      size="sm"
                    >
                      {hotspotActive ? "Stop Hotspot" : "Start Hotspot"}
                    </Button>
                  </div>

                  <form onSubmit={saveHotspotSettings} className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="hotspot-ssid">Network Name (SSID)</Label>
                      <input
                        id="hotspot-ssid"
                        type="text"
                        value={hotspotSsid}
                        onChange={(e) => setHotspotSsid(e.target.value)}
                        maxLength={32}
                        className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g. PortSide-DevNet"
                      />
                      <p className="mt-1 text-[11px] text-slate-400">The Wi-Fi name that appears when searching on your phone or laptop.</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hotspot-key">WPA2 Password</Label>
                        <button
                          type="button"
                          onClick={copyHotspotPassword}
                          className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-medium"
                        >
                          {copiedHotspotKey ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="mt-1 relative flex items-center">
                        <input
                          id="hotspot-key"
                          type={showHotspotKey ? "text" : "password"}
                          value={hotspotKey}
                          onChange={(e) => setHotspotKey(e.target.value)}
                          minLength={8}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 pr-14"
                          placeholder="Min 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowHotspotKey(!showHotspotKey)}
                          className="absolute right-3 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showHotspotKey ? "Hide" : "Show"}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">Must be at least 8 characters long.</p>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between pt-1">
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{savedHotspotMsg}</span>
                      <Button type="submit" size="sm" variant="secondary" loading={savingHotspot}>
                        Save Wi-Fi Config
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/20 p-3.5 text-xs text-amber-950 dark:text-amber-200">
                  <span className="font-semibold">Instant Access:</span> Once connected to this network, open any browser on your device and navigate directly to <code className="rounded bg-amber-100/80 dark:bg-amber-900/60 px-1.5 py-0.5 font-mono text-[11px] font-bold">http://portside.local</code> or any configured local subdomain.
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: ACCOUNT & PROFILE */}
      {activeTab === "account" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Update your account display name.</p>
            <form onSubmit={saveName} className="mt-4 space-y-3.5">
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" value={user.email} disabled />
              </div>
              <Button type="submit" loading={savingName} disabled={name.trim() === user.name}>
                Save profile
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Password & Security</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Change your password for this instance.</p>
            <form onSubmit={savePassword} className="mt-4 space-y-3.5">
              <div>
                <Label htmlFor="cur">Current password</Label>
                <Input id="cur" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              <div>
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
              </div>
              <Button type="submit" variant="secondary" loading={savingPw}>
                Change password
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 3: ROUTING & PROXY */}
      {activeTab === "routing" && (
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Proxy Configuration</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Listening Port</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">:{appPort}</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Registered Routes</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">{services.length} active</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Host Routing Pattern</p>
                <p className="mt-1 font-mono text-xs font-bold text-sky-600 dark:text-sky-400">*.localhost{portSuffix}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">How Reverse Proxy Routing Works</h2>
            <ol className="mt-3 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex gap-2.5">
                <Step n={1} />
                <span>
                  Modern browsers automatically resolve any <code className="rounded bg-slate-100 border border-slate-200 px-1 font-mono text-[11px] text-sky-600 dark:bg-slate-900 dark:border-slate-800 dark:text-sky-400">*.localhost</code> hostname to <code className="font-mono text-[11px]">127.0.0.1</code> — no <code className="font-mono text-[11px]">/etc/hosts</code> configuration required.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Step n={2} />
                <span>
                  Portside listens on <code className="rounded bg-slate-100 border border-slate-200 px-1 font-mono text-[11px] dark:bg-slate-900 dark:border-slate-800">localhost{portSuffix}</code>. When a browser visits{" "}
                  <code className="rounded bg-slate-100 border border-slate-200 px-1 font-mono text-[11px] text-sky-600 dark:bg-slate-900 dark:border-slate-800 dark:text-sky-400">{example?.hostname ?? "api"}.localhost{portSuffix}</code>, Portside reads the hostname header and transparently proxies traffic to port <code className="font-mono font-bold">:{example?.port ?? 3000}</code>.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Step n={3} />
                <span>Unbound or paused routes render an explainer fallback page with shortcut links to resume or map the port.</span>
              </li>
            </ol>

            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-slate-300">
              <p className="text-slate-500"># Verify routing in terminal</p>
              <p>curl -i http://{example?.hostname ?? "api"}.localhost{portSuffix}/</p>
              <p className="mt-2.5 text-slate-500"># Run Portside on standard HTTP port 80 to remove port suffix</p>
              <p>PORT=80 npm start</p>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: UPDATES & ABOUT */}
      {activeTab === "about" && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Version & Application Updates</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Current version: <span className="font-mono font-semibold text-slate-900 dark:text-sky-400">v1.0.0</span>
                </p>
                {updateStatus && <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">{updateStatus}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={checkForUpdates} loading={checkingUpdate}>
                  Check for updates
                </Button>
                {isOnApp ? (
                  <Button
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold cursor-default hover:bg-emerald-500/10 hover:text-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-1.5" />
                    You are on the app!
                  </Button>
                ) : (
                  <a
                    href="https://github.com/letsmakepact/PortSide/releases/latest/download/Portside.exe"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button>
                      Get Portside (.exe)
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">About & Attribution</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Portside is an open-source local proxy tool created by pact.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <a
                href="https://github.com/letsmakepact"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-[#0f172a]/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <span>GitHub:</span>
                <span className="font-semibold text-slate-900 dark:text-sky-400">letsmakepact</span>
              </a>
              <a
                href="https://t.me/pactwithdevil"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-[#0f172a]/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <span>Telegram:</span>
                <span className="font-semibold text-slate-900 dark:text-sky-400">@pactwithdevil</span>
              </a>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Step({ n }: { n: number }) {
  return <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-sky-400">{n}</span>;
}
