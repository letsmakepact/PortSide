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
  const { user, services, projects, appPort, runCheck, checking, lastCheckedAt, openTutorial } = useDashboard();
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{greeting}, {user.name.split(" ")[0]} 👋</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Your localhost, at a glance</h1>
        </div>
        <div className="flex items-center gap-2">
          {services.length === 0 && (
            <Button variant="secondary" onClick={openTutorial}>
              ✨ Feature Tour
            </Button>
          )}
          <Button variant="secondary" onClick={runCheck} loading={checking}>
            {!checking && <RefreshIcon />} Check now
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon /> Add service
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
            <p className={cn("mt-2 text-3xl font-semibold tabular-nums", s.tone)}>{s.value}</p>
            <p className="mt-1 text-xs text-slate-400">{s.hint}</p>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Pinned</h2>
          <Link href="/dashboard/services" className="text-sm font-medium text-sky-600 hover:text-sky-500">
            View all →
          </Link>
        </div>
        {pinned.length === 0 ? (
          <EmptyState
            icon="📌"
            title="Nothing pinned yet"
            description="Pin the services you open most so they're always one click away."
            action={
              <Link href="/dashboard/services">
                <Button variant="secondary">Browse services</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pinned.map((s) => (
              <ServiceCard key={s.id} service={s} compact />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Port map</h2>
            <span className="text-xs text-slate-400">{services.length} route{services.length === 1 ? "" : "s"}</span>
          </div>
          {services.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">Add a service to see it here.</div>
          ) : (
            <ul className="scrollbar-thin max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
              {services.map((s) => {
                const project = projects.find((p) => p.id === s.projectId);
                return (
                  <li key={s.id} className="flex items-center gap-3 px-5 py-2.5 text-sm transition hover:bg-slate-50">
                    <StatusDot status={s.enabled ? s.lastStatus : "unknown"} />
                    <span className="w-6 text-center">{s.icon}</span>
                    <a href={serviceUrl(s.hostname, appPort)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-[13px] text-sky-600 hover:underline">
                      {s.hostname}.localhost
                    </a>
                    <span className="hidden text-slate-300 sm:inline">→</span>
                    <span className="rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] text-slate-100">:{s.port}</span>
                    {project && (
                      <span className={cn("hidden h-2 w-2 rounded-full sm:block", colorFor(project.color).dot)} title={project.name} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
            <Link href="/dashboard/activity" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              See all
            </Link>
          </div>
          {activity.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">No activity yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activity.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <ActivityIcon action={a.action} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-slate-800">{a.message}</p>
                    <p className="text-[11px] text-slate-400">{formatRelative(a.createdAt)}</p>
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
