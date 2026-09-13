"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  ArrowUpRight,
  FolderGit2,
} from "lucide-react";

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyButton({
  textToCopy,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12] active:scale-95 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition-all duration-150 cursor-pointer select-none touch-action-manipulation min-h-[36px] sm:min-h-0 ${className}`}
      title={`Copy "${textToCopy}"`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-slate-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export interface ProfileServiceItem {
  id: string;
  name: string;
  hostname: string;
  port: number;
  lastStatus: string;
  description?: string;
  tags?: string[];
  override?: {
    title?: string;
    description?: string;
    tags?: string[];
    featured?: boolean;
    repoUrl?: string;
    docsUrl?: string;
  };
  directPath: string;
  fullSubdomain: string;
}

interface ServicesShowcaseProps {
  services: ProfileServiceItem[];
  accentColor?: string;
  activeDomain: string;
}

export function ServicesShowcase({
  services,
}: ServicesShowcaseProps) {
  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-8 text-center bg-white/[0.01]">
        <p className="text-xs font-mono text-slate-500">No active services published.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((svc) => {
        const isOnline = svc.lastStatus === "online";
        const isFeatured = svc.override?.featured;
        const tags = svc.override?.tags || svc.tags || [];

        return (
          <div
            key={svc.id}
            className="group relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/15 p-4 sm:p-5 transition-all duration-200"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      isOnline
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                        : "bg-slate-500"
                    }`}
                  />
                  <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-sky-300 transition truncate">
                    {svc.override?.title || svc.name}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isFeatured && (
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isOnline
                      ? "text-emerald-400/90 bg-emerald-400/10 border-emerald-400/25"
                      : "text-slate-500 bg-slate-800/50 border-slate-700/50"
                  }`}>
                    {isOnline ? "live" : "standby"}
                  </span>
                </div>
              </div>

              {(svc.override?.description || svc.description) && (
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed break-words">
                  {svc.override?.description || svc.description}
                </p>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-3 mt-3 border-t border-white/[0.04]">
              {svc.override?.repoUrl ? (
                <a
                  href={svc.override.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 active:bg-white/10 transition touch-action-manipulation"
                  title="Source repository"
                >
                  <FolderGit2 className="h-3.5 w-3.5" />
                  <span>source</span>
                </a>
              ) : <div className="sm:hidden" />}

              <a
                href={`/s/${svc.hostname}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12] px-3.5 py-1.5 text-xs font-mono text-slate-200 hover:text-white transition-all duration-150 active:scale-[0.98] touch-action-manipulation"
              >
                <span>/s/{svc.hostname}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
