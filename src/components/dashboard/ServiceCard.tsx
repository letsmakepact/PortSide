"use client";

import { useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { StatusBadge } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import type { ServiceDTO } from "@/lib/types";
import { cn, colorFor, formatRelative, serviceUrl } from "@/lib/utils";

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  compact = false,
}: {
  service: ServiceDTO;
  onEdit?: (s: ServiceDTO) => void;
  onDelete?: (s: ServiceDTO) => void;
  compact?: boolean;
}) {
  const { projects, appPort, updateService } = useDashboard();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const project = projects.find((p) => p.id === service.projectId);
  const url = serviceUrl(service.hostname, appPort);
  const pending = service.id < 0;
  const status = service.enabled ? service.lastStatus : "unknown";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast({ tone: "success", title: "Copied to clipboard", description: url });
    } catch {
      toast({ tone: "error", title: "Couldn't copy" });
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md",
        service.enabled ? "border-slate-200" : "border-dashed border-slate-300 opacity-75",
        pending && "animate-pulse",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-xl ring-1 ring-slate-200">
          {service.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-slate-900">{service.name}</h3>
            {service.favorite && (
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" /></svg>
            )}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-[13px] text-indigo-600 hover:underline"
          >
            {service.hostname}.localhost
            <svg viewBox="0 0 20 20" className="h-3 w-3 shrink-0 opacity-0 transition group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 3h6v6M17 3l-8 8M14 11v5H4V6h5" /></svg>
          </a>
        </div>
        <div className="flex items-center gap-1">
          <StatusBadge status={status} />
          {(onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="More"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor"><path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /></svg>
              </button>
              {menuOpen && (
                <div className="animate-fade-up absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl">
                  <MenuItem onClick={() => window.open(url, "_blank")}>Open in new tab</MenuItem>
                  <MenuItem onClick={copy}>Copy URL</MenuItem>
                  <MenuItem onClick={() => updateService(service.id, { favorite: !service.favorite })}>
                    {service.favorite ? "Unpin" : "Pin to top"}
                  </MenuItem>
                  <MenuItem onClick={() => updateService(service.id, { enabled: !service.enabled })}>
                    {service.enabled ? "Pause route" : "Resume route"}
                  </MenuItem>
                  {onEdit && <MenuItem onClick={() => onEdit(service)}>Edit</MenuItem>}
                  {onDelete && (
                    <MenuItem onClick={() => onDelete(service)} className="text-rose-600 hover:bg-rose-50">
                      Delete
                    </MenuItem>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!compact && service.description && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{service.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-100">
          :{service.port}
        </span>
        {project && (
          <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium", colorFor(project.color).bg, colorFor(project.color).text)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", colorFor(project.color).dot)} />
            {project.name}
          </span>
        )}
        {!compact && service.tags.map((t) => (
          <span key={t} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        <span>
          {service.enabled
            ? service.lastCheckedAt
              ? `Checked ${formatRelative(service.lastCheckedAt)}`
              : "Awaiting first check"
            : "Route paused"}
        </span>
        {service.lastStatus === "online" && service.lastLatencyMs != null && service.enabled && (
          <span className="font-mono text-emerald-600">{service.lastLatencyMs}ms</span>
        )}
      </div>
    </div>
  );
}

function MenuItem({ onClick, children, className }: { onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("block w-full px-3 py-1.5 text-left text-slate-700 transition hover:bg-slate-50", className)}
    >
      {children}
    </button>
  );
}
