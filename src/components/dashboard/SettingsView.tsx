"use client";

import { useState, type FormEvent } from "react";
import { useDashboard } from "./DashboardProvider";
import { Button } from "@/components/ui/Button";
import { Card, Input, Label, PageHeader } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const { user, setUser, appPort, autoCheck, setAutoCheck, theme, setTheme, services } = useDashboard();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "account" | "routing" | "about">("general");
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

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

  const tabs = [
    { id: "general", label: "Preferences & Health" },
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
                    ? "border-slate-900 bg-slate-100 text-slate-900 dark:border-sky-500/60 dark:bg-[#0f172a] dark:text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-800/40",
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
                    ? "border-slate-900 bg-slate-100 text-slate-900 dark:border-sky-500/60 dark:bg-[#0f172a] dark:text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-800/40",
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

      {/* TAB 2: ACCOUNT & PROFILE */}
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
