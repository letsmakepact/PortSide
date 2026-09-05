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

  async function copyLan() {
    try {
      const res = await fetch(`/api/lan?hostname=${encodeURIComponent(service.hostname)}`);
      const data = await res.json();
      if (data.urls?.directUrl) {
        await navigator.clipboard.writeText(data.urls.directUrl);
        toast({ tone: "success", title: "Copied LAN URL", description: data.urls.directUrl });
      }
    } catch {
      toast({ tone: "error", title: "Couldn't copy LAN URL" });
    }
  }

  async function copyLocal() {
    setMenuOpen(false);
    const portSuffix = appPort === "80" || appPort === "443" ? "" : `:${appPort}`;
    const localUrl = `http://${service.hostname}.local${portSuffix}`;
    try {
      await navigator.clipboard.writeText(localUrl);
      toast({ tone: "success", title: "Copied .local domain", description: localUrl });
    } catch {
      toast({ tone: "error", title: "Couldn't copy .local URL" });
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-white dark:bg-[#0f172a]/70 p-4 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-[#0f172a] backdrop-blur-xs",
        service.enabled ? "border-slate-200/80 dark:border-slate-800/80" : "border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-75",
        pending && "animate-pulse",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/60 text-lg border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200">
          {service.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{service.name}</h3>
            {service.favorite && (
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor"><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" /></svg>
            )}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
          >
            {service.hostname}.localhost
            <svg viewBox="0 0 20 20" className="h-3 w-3 shrink-0 opacity-0 transition group-hover:opacity-100 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 3h6v6M17 3l-8 8M14 11v5H4V6h5" /></svg>
          </a>
        </div>
        <div className="flex items-center gap-1">
          <StatusBadge status={status} />
          {(onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="More options"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor"><path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /></svg>
              </button>
              {menuOpen && (
                <div className="animate-fade-up absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] py-1 text-xs shadow-xl">
                  <MenuItem onClick={() => window.open(url, "_blank")}>Open in new tab</MenuItem>
                  <MenuItem onClick={copy}>Copy URL</MenuItem>
                  <MenuItem onClick={copyLocal}>Copy .local domain</MenuItem>
                  <MenuItem onClick={copyLan}>Copy LAN link</MenuItem>
                  <MenuItem onClick={() => updateService(service.id, { favorite: !service.favorite })}>
                    {service.favorite ? "Unpin service" : "Pin service"}
                  </MenuItem>
                  <MenuItem onClick={() => updateService(service.id, { enabled: !service.enabled })}>
                    {service.enabled ? "Pause route" : "Resume route"}
                  </MenuItem>
                  {onEdit && <MenuItem onClick={() => onEdit(service)}>Edit service</MenuItem>}
                  {onDelete && (
                    <MenuItem onClick={() => onDelete(service)} className="text-rose-400 hover:bg-rose-500/10">
                      Delete service
                    </MenuItem>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!compact && service.description && (
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{service.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:text-slate-300">
          :{service.port}
        </span>
        {project && (
          <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium border border-slate-700/40", colorFor(project.color).bg, colorFor(project.color).text)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", colorFor(project.color).dot)} />
            {project.name}
          </span>
        )}
        {!compact && service.tags.map((t) => (
          <span key={t} className="rounded border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-[10px] text-slate-400 dark:text-slate-500">
        <span>
          {service.enabled
            ? service.lastCheckedAt
              ? `Checked ${formatRelative(service.lastCheckedAt)}`
              : "Awaiting first check"
            : "Route paused"}
        </span>
        {service.lastStatus === "online" && service.lastLatencyMs != null && service.enabled && (
          <span className="font-mono font-medium text-emerald-400">{service.lastLatencyMs}ms</span>
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
      className={cn("block w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white", className)}
    >
      {children}
    </button>
  );
}
