"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { ServiceCard } from "./ServiceCard";
import { ServiceFormModal } from "./ServiceFormModal";
import { ActivityIcon } from "./ActivityFeed";
import { PlusIcon, RefreshIcon } from "./ServicesView";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, StatusDot } from "@/components/ui/Primitives";
import type { ActivityDTO } from "@/lib/types";
import { cn, colorFor, formatRelative, serviceUrl } from "@/lib/utils";

export function OverviewView({ initialActivity }: { initialActivity: ActivityDTO[] }) {
  const { user, services, projects, appPort, runCheck, checking, lastCheckedAt, openTutorial, openLan, openSupport } = useDashboard();
  const [formOpen, setFormOpen] = useState(false);
  const [activity, setActivity] = useState(initialActivity);

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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Services", value: services.length, hint: `${projects.length} project${projects.length === 1 ? "" : "s"}`, tone: "text-slate-900" },
    { label: "Online", value: online.length, hint: "responding now", tone: "text-emerald-600" },
    { label: "Offline", value: offline.length, hint: "not listening", tone: offline.length ? "text-rose-600" : "text-slate-900" },
    { label: "Paused", value: services.length - enabled.length, hint: "routes disabled", tone: "text-slate-900" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            {greeting}, {user.name}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
            {services.length} services configured · {online.length} healthy · proxy port {appPort}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {services.length === 0 && (
            <Button variant="secondary" onClick={openTutorial}>
              Feature Tour
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={openSupport}
          >
            Become a Supporter
          </Button>
          <Button variant="secondary" onClick={openLan}>
            Mobile / LAN
          </Button>
          <Button variant="secondary" onClick={runCheck} loading={checking}>
            {!checking && <RefreshIcon />} Check now
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon /> Add service
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-3.5 sm:p-4">
            <p className="text-xs font-medium text-slate-400">{s.label}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", s.tone === "text-slate-900" ? "text-slate-900 dark:text-slate-100" : s.tone === "text-emerald-600" ? "text-emerald-600 dark:text-emerald-400" : s.tone === "text-rose-600" ? "text-rose-600 dark:text-rose-400" : s.tone)}>{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.hint}</p>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Pinned services</h2>
          <Link href="/dashboard/services" className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            View all →
          </Link>
        </div>
        {pinned.length === 0 ? (
          <EmptyState
            icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" /></svg>}
            title="Nothing pinned yet"
            description="Pin key services to keep them accessible directly on your overview dashboard."
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
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 bg-slate-50/50 dark:bg-[#0f172a]/50">
            <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Port routing map</h2>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{services.length} route{services.length === 1 ? "" : "s"}</span>
          </div>
          {services.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-slate-400 dark:text-slate-500">Add a service to populate the routing table.</div>
          ) : (
            <ul className="scrollbar-thin max-h-[420px] divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto">
              {services.map((s) => {
                const project = projects.find((p) => p.id === s.projectId);
                return (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-2 text-xs transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <StatusDot status={s.enabled ? s.lastStatus : "unknown"} />
                    <span className="w-5 text-center text-sm leading-none">{s.icon}</span>
                    <a href={serviceUrl(s.hostname, appPort)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700 dark:text-slate-200 font-medium hover:text-sky-500 dark:hover:text-sky-400 hover:underline">
                      {s.hostname}.localhost
                    </a>
                    <span className="hidden text-slate-400 dark:text-slate-600 sm:inline">→</span>
                    <span className="rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-slate-600 dark:text-slate-300 font-medium">:{s.port}</span>
                    {project && (
                      <span className={cn("hidden h-2 w-2 rounded-full sm:block", colorFor(project.color).dot)} title={project.name} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 bg-slate-50/50 dark:bg-[#0f172a]/50">
            <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Recent activity</h2>
            <Link href="/dashboard/activity" className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              See all
            </Link>
          </div>
          {activity.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-slate-400 dark:text-slate-500">No recent activity recorded.</div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {activity.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 px-4 py-2.5">
                  <ActivityIcon action={a.action} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">{a.message}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{formatRelative(a.createdAt)}</p>
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
