"use client";

import { useState, useEffect, type FormEvent } from "react";
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
  const [activeTab, setActiveTab] = useState<"general" | "supporter" | "hotspot" | "account" | "routing" | "about">("general");
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [activatingKey, setActivatingKey] = useState(false);
  const [rechecking, setRechecking] = useState(false);

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
      })
      .catch(() => {
        setServerConfirmedHotspot(false);
      })
      .finally(() => setLoadingHotspot(false));
  }, [activeTab]);

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
    { id: "general", label: "Preferences & Health" },
    { id: "supporter", label: "Supporter & Perks" },
    { id: "hotspot", label: "Dev Wi-Fi Hotspot" },
    { id: "account", label: "Account & Profile" },
    { id: "routing", label: "Proxy & How Routing Works" },
    { id: "about", label: "Updates & About" },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your dashboard preferences, account security, and routing configuration." />

      {/* Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-slate-900 text-slate-900 font-semibold dark:border-sky-400 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                  Instant QR code launchpad and wildcard .local routing for testing on phones, tablets, and TV browsers.
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
                  Broadcast an isolated private wireless network straight from your development PC with zero router setup.
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
                  Standalone multi-OS launcher for Windows, macOS, and Linux that auto-activates all supporter capabilities.
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
                    Broadcast a private hardware-encrypted Wi-Fi access point right from your development machine.
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
                  Dev Wi-Fi Hotspot broadcasting requires a verified Supporter license. Once active, you can spin up isolated Wi-Fi networks for physical mobile, tablet, and smart TV testing anywhere.
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
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Zero-Config LAN (mDNS)</p>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          ACTIVE · NO ROUTER CONFIG NEEDED
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Any phone or PC on your current Wi-Fi can already reach your services at <code className="font-mono text-emerald-700 dark:text-emerald-400">http://portside.local</code>.
                      </p>
                    </div>
                  </div>
                </div>

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
                <a
                  href="https://github.com/letsmakepact/PortSide/releases/latest/download/Portside-Launcher.exe"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button>
                    Get Auto-Update Launcher (.exe)
                  </Button>
                </a>
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
