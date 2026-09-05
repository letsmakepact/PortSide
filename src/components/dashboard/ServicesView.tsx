"use client";

import { useMemo, useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { ServiceCard } from "./ServiceCard";
import { ServiceFormModal } from "./ServiceFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState, Input, PageHeader, Select } from "@/components/ui/Primitives";
import type { ServiceDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "online" | "offline" | "paused";

export function ServicesView({ initialProject = "all" }: { initialProject?: string }) {
  const { services, projects, deleteService, runCheck, checking, openTutorial } = useDashboard();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [projectId, setProjectId] = useState<string>(initialProject);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceDTO | null>(null);
  const [deleting, setDeleting] = useState<ServiceDTO | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (q && !`${s.name} ${s.hostname} ${s.port} ${s.tags.join(" ")} ${s.description}`.toLowerCase().includes(q)) return false;
      if (projectId === "none" && s.projectId !== null) return false;
      if (projectId !== "all" && projectId !== "none" && s.projectId !== Number(projectId)) return false;
      if (status === "paused") return !s.enabled;
      if (status === "online") return s.enabled && s.lastStatus === "online";
      if (status === "offline") return s.enabled && s.lastStatus === "offline";
      return true;
    });
  }, [services, query, status, projectId]);

  const counts = {
    all: services.length,
    online: services.filter((s) => s.enabled && s.lastStatus === "online").length,
    offline: services.filter((s) => s.enabled && s.lastStatus === "offline").length,
    paused: services.filter((s) => !s.enabled).length,
  };

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="Every local process with its own *.localhost address."
        actions={
          <>
            <Button variant="secondary" onClick={runCheck} loading={checking}>
              {!checking && <RefreshIcon />}
              Check now
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <PlusIcon /> Add service
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="6" /><path d="M14 14l3.5 3.5" strokeLinecap="round" /></svg>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, hostname, port or tag…" className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-brand-bg dark:bg-[#0f172a]/60 p-0.5 shadow-xs">
            {(["all", "online", "offline", "paused"] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatus(f)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  status === f
                    ? "bg-brand-surface dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700/60 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:bg-brand-bg dark:hover:bg-slate-800/40 hover:text-slate-700 dark:hover:text-slate-200",
                )}
              >
                {f} <span className={cn("ml-1 font-mono text-[11px] tabular-nums", status === f ? "text-slate-500 dark:text-slate-300" : "text-slate-400 dark:text-slate-500")}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-44">
            <option value="all">All projects</option>
            <option value="none">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>}
          title="No services registered"
          description="Register your local development processes with hostname routing to access them effortlessly."
          action={
            <div className="flex items-center gap-2.5">
              <Button onClick={() => setFormOpen(true)}>
                <PlusIcon /> Add your first service
              </Button>
              <Button variant="secondary" onClick={openTutorial}>
                Feature Tour
              </Button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}
          title="No matching services"
          description="Try modifying your search term or adjusting status and project filters."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setStatus("all");
                setProjectId("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              onEdit={(svc) => {
                setEditing(svc);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <ServiceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        service={editing}
        defaultProjectId={projectId !== "all" && projectId !== "none" ? Number(projectId) : null}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteService(deleting.id)}
        title={`Delete ${deleting?.name}?`}
        description={`${deleting?.hostname}.localhost will stop routing to port ${deleting?.port}. This can't be undone.`}
      />
    </div>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg>
  );
}
export function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-3-6.7M21 3v6h-6" /></svg>
  );
}
