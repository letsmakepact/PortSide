"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { ServiceCard } from "./ServiceCard";
import { ServiceFormModal } from "./ServiceFormModal";
import {
  Server,
  Activity,
  Plus,
  RefreshCw,
  Zap,
  AlertCircle,
  PauseCircle,
  Pin,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, StatusDot } from "@/components/ui/Primitives";
import { ActivityIcon } from "./ActivityFeed";
import type { ActivityDTO } from "@/lib/types";
import { cn, colorFor, formatRelative, serviceUrl } from "@/lib/utils";

export function OverviewView({ initialActivity }: { initialActivity: ActivityDTO[] }) {
  const { user, services, projects, appPort, runCheck, checking, lastCheckedAt, openTutorial, openLan, openSupport } = useDashboard();
  const [formOpen, setFormOpen] = useState(false);
  const [activity, setActivity] = useState(initialActivity);
  const [greeting, setGreeting] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    if (!lastCheckedAt) return;
    fetch("/api/activity?limit=8")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setActivity(d.activity))
      .catch(() => {});
  }, [lastCheckedAt, services]);

  const enabled = services.filter((s) => s.enabled);
  const online = enabled.filter((s) => s.lastStatus === "online");
  const offline = enabled.filter((s) => s.lastStatus === "offline");
  const pinned = services.filter((s) => s.favorite);

  const stats = [
    {
      label: "CONFIGURED SERVICES",
      value: services.length,
      hint: `${projects.length} project${projects.length === 1 ? "" : "s"} assigned`,
      icon: Server,
      iconColor: "text-slate-400 bg-[#161f30] border-[#27354a]",
      tone: "text-white",
    },
    {
      label: "ONLINE SERVICES",
      value: online.length,
      hint: "actively responding",
      icon: Zap,
      iconColor: "text-emerald-400 bg-emerald-950/30 border-emerald-800/40",
      tone: "text-emerald-400",
    },
    {
      label: "OFFLINE SERVICES",
      value: offline.length,
      hint: "no listener on port",
      icon: AlertCircle,
      iconColor: offline.length ? "text-rose-400 bg-rose-950/30 border-rose-800/40" : "text-slate-500 bg-[#161f30] border-[#1f2937]",
      tone: offline.length ? "text-rose-400" : "text-slate-400",
    },
    {
      label: "PROXY PORT",
      value: appPort,
      hint: "listening on 127.0.0.1",
      icon: PauseCircle,
      iconColor: "text-sky-400 bg-sky-950/30 border-sky-800/40",
      tone: "text-sky-400 font-mono",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#1f2937]">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            {greeting}, {user.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {services.length} services configured · {online.length} healthy · proxy port {appPort}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {services.length === 0 && (
            <Button variant="secondary" onClick={openTutorial}>
              <Bookmark className="h-3.5 w-3.5 mr-1 text-amber-400" /> Feature Tour
            </Button>
          )}
          <Button variant="secondary" onClick={runCheck} loading={checking}>
            {!checking && <RefreshCw className="h-3.5 w-3.5 mr-1 text-slate-400" />} Check ports
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add service
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const IconComp = s.icon;
          return (
            <Card key={s.label} className="p-4 bg-[#111827] border-[#1f2937] hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium tracking-wide text-slate-400">{s.label}</p>
                <span className={cn("flex h-6 w-6 items-center justify-center rounded border", s.iconColor)}>
                  <IconComp className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className={cn("mt-2 text-2xl font-bold tabular-nums", s.tone)}>{s.value}</p>
              <p className="mt-1 text-[11px] text-slate-500 font-mono">{s.hint}</p>
            </Card>
          );
        })}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Pinned services</h2>
          <Link href="/dashboard/services" className="text-xs font-mono text-slate-400 hover:text-sky-400">
            View all ({services.length}) →
          </Link>
        </div>
        {pinned.length === 0 ? (
          <EmptyState
            icon={<Pin className="h-5 w-5 text-slate-500" />}
            title="No services pinned"
            description="Star or pin frequently used services to keep them in this quick access grid."
            action={
              <Link href="/dashboard/services">
                <Button variant="secondary">Browse services</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pinned.map((s) => (
              <ServiceCard key={s.id} service={s} compact />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3 overflow-hidden bg-[#111827] border-[#1f2937]">
          <div className="flex items-center justify-between border-b border-[#1f2937] px-4 py-3 bg-[#0d131f]">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Routing map</h2>
            <span className="font-mono text-xs text-slate-500">{services.length} active routes</span>
          </div>
          {services.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-slate-500 font-mono">No routing rules mapped yet.</div>
          ) : (
            <ul className="scrollbar-thin max-h-[420px] divide-y divide-[#1f2937] overflow-y-auto">
              {services.map((s) => {
                const project = projects.find((p) => p.id === s.projectId);
                return (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-2.5 text-xs transition hover:bg-[#161f30]">
                    <StatusDot status={s.enabled ? s.lastStatus : "unknown"} />
                    <span className="w-5 text-center text-sm leading-none">{s.icon}</span>
                    <a href={serviceUrl(s.hostname, appPort)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-xs text-slate-200 font-medium hover:text-sky-400">
                      {s.hostname}.localhost
                    </a>
                    <span className="hidden text-slate-600 sm:inline font-mono">→</span>
                    <span className="rounded border border-[#1f2937] bg-[#0b0f17] px-2 py-0.5 font-mono text-xs text-slate-300">:{s.port}</span>
                    {project && (
                      <span className={cn("hidden h-2 w-2 rounded-full sm:block", colorFor(project.color).dot)} title={project.name} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2 overflow-hidden bg-[#111827] border-[#1f2937]">
          <div className="flex items-center justify-between border-b border-[#1f2937] px-4 py-3 bg-[#0d131f]">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Recent events</h2>
            <Link href="/dashboard/activity" className="text-xs font-mono text-slate-400 hover:text-sky-400">
              Activity log →
            </Link>
          </div>
          {activity.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-slate-500 font-mono">No event telemetry recorded.</div>
          ) : (
            <ul className="divide-y divide-[#1f2937]">
              {activity.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-[#161f30] transition">
                  <ActivityIcon action={a.action} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-200">{a.message}</p>
                    <p suppressHydrationWarning className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {mounted ? formatRelative(a.createdAt) : "recently"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ServiceFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
