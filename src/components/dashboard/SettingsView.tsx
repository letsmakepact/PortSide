"use client";

import { useState, type FormEvent } from "react";
import { useDashboard } from "./DashboardProvider";
import { Button } from "@/components/ui/Button";
import { Card, Input, Label, PageHeader } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const { user, setUser, appPort, autoCheck, setAutoCheck, services } = useDashboard();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

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

  const example = services[0];
  const portSuffix = appPort !== "80" ? `:${appPort}` : "";

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Your profile, the background monitor, and how the proxy works." />

      <Card className="p-6">
        <h2 className="text-base font-semibold text-slate-900">Background monitor</h2>
        <p className="mt-1 text-sm text-slate-500">Portside probes each registered port every 15 seconds while the dashboard is open and logs status changes.</p>
        <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
          <span>
            <span className="block text-sm font-medium text-slate-800">Automatic health checks</span>
            <span className="block text-xs text-slate-500">Turn off to only check when you press “Check now”.</span>
          </span>
          <span
            role="switch"
            aria-checked={autoCheck}
            onClick={() => setAutoCheck(!autoCheck)}
            className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition", autoCheck ? "bg-indigo-600" : "bg-slate-300")}
          >
            <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition", autoCheck ? "translate-x-5.5" : "translate-x-0.5")} />
          </span>
        </label>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-slate-900">How routing works</h2>
        <ol className="mt-3 space-y-3 text-sm text-slate-600">
          <li className="flex gap-3">
            <Step n={1} />
            <span>
              Modern browsers resolve any <code className="rounded bg-slate-100 px-1 font-mono text-[12px]">*.localhost</code> name to your own machine — no <code className="rounded bg-slate-100 px-1 font-mono text-[12px]">/etc/hosts</code> edits needed.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={2} />
            <span>
              Portside listens on <code className="rounded bg-slate-100 px-1 font-mono text-[12px]">localhost{portSuffix}</code>. When a request arrives for{" "}
              <code className="rounded bg-slate-100 px-1 font-mono text-[12px]">{example?.hostname ?? "api"}.localhost{portSuffix}</code>, it looks up the mapped port and reverse-proxies the request.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={3} />
            <span>Paused or unregistered hostnames get a friendly explainer page instead of a connection error.</span>
          </li>
        </ol>
        <div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300">
          <p className="text-slate-500"># try it</p>
          <p>curl -i http://{example?.hostname ?? "api"}.localhost{portSuffix}/</p>
          <p className="mt-2 text-slate-500"># run Portside on port 80 to drop the suffix entirely</p>
          <p>PORT=80 npm start</p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900">Profile</h2>
          <form onSubmit={saveName} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <Button type="submit" loading={savingName} disabled={name.trim() === user.name}>
              Save profile
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900">Password</h2>
          <form onSubmit={savePassword} className="mt-4 space-y-4">
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

      <Card className="p-6">
        <h2 className="text-base font-semibold text-slate-900">About & Credits</h2>
        <p className="mt-1 text-sm text-slate-500">Portside was conceived and created by pact.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <a
            href="https://github.com/letsmakepact"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-medium text-slate-800 transition hover:bg-slate-100"
          >
            <span>GitHub:</span>
            <span className="text-indigo-600">letsmakepact</span>
          </a>
          <a
            href="https://t.me/pactwithdevil"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-medium text-slate-800 transition hover:bg-slate-100"
          >
            <span>Telegram:</span>
            <span className="text-indigo-600">@pactwithdevil</span>
          </a>
        </div>
      </Card>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{n}</span>;
}
