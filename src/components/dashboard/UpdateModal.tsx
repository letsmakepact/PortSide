"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseUrl: string;
  exeDownloadUrl: string;
  releaseNotes?: string;
  publishedAt?: string;
  error?: string;
}

export function UpdateModal({ forceOpen, onClose }: { forceOpen?: boolean; onClose?: () => void }) {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkUpdates = useCallback(async (manual = false) => {
    setChecking(true);
    try {
      const res = await fetch("/api/updates/check");
      if (!res.ok) return;
      const data: UpdateInfo = await res.json();
      setUpdate(data);

      if (manual) {
        setOpen(true);
      } else if (data.updateAvailable) {
        const dismissed = localStorage.getItem(`portside_update_dismissed_${data.latestVersion}`);
        if (!dismissed) {
          setOpen(true);
        }
      }
    } catch {
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setOpen(forceOpen);
    }
  }, [forceOpen]);

  useEffect(() => {
    void checkUpdates();
  }, [checkUpdates]);

  function handleDismiss() {
    if (update?.latestVersion) {
      localStorage.setItem(`portside_update_dismissed_${update.latestVersion}`, "true");
    }
    setOpen(false);
    if (onClose) onClose();
  }

  if (!update) return null;

  return (
    <Modal open={open} onClose={handleDismiss} title="" size="lg">
      <div className="relative pt-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {update.updateAvailable ? "New Version Ready" : "Up to Date"}
          </span>
          <span className="font-mono text-xs text-slate-400">
            v{update.currentVersion} → v{update.latestVersion}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /><path d="M12 9v12" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {update.updateAvailable ? `Portside v${update.latestVersion} is available` : "You're on the latest version"}
            </h2>
            <p className="text-xs text-slate-500">
              {update.updateAvailable ? "A new update has been released on GitHub" : "No new updates found at this time"}
            </p>
          </div>
        </div>

        {update.updateAvailable ? (
          <>
            <div className="mt-5 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 text-xs text-amber-900">
              <p className="font-semibold flex items-center gap-1.5">
                Running locally without the launcher?
              </p>
              <p className="mt-1 leading-relaxed text-amber-800">
                You are currently running Portside via localhost. You can update manually using{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] font-semibold text-amber-900">
                  git pull
                </code>{" "}
                or switch to the official standalone Windows launcher (<code className="font-mono text-[11px]">.exe</code>) which automatically pulls updates every time you launch!
              </p>
            </div>

            {update.releaseNotes && (
              <div className="mt-4 max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 font-mono whitespace-pre-wrap scrollbar-thin">
                {update.releaseNotes}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition"
              >
                Remind me later
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <a href={update.releaseUrl} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm">
                    View on GitHub
                  </Button>
                </a>
                <a href={update.exeDownloadUrl} target="_blank" rel="noreferrer">
                  <Button size="sm">
                    Download Auto-Update (.exe)
                  </Button>
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5">
            <p className="text-sm text-slate-600">
              You are running the latest version (v{update.currentVersion}). Portside checks GitHub automatically so you will be notified when new improvements arrive.
            </p>
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <Button size="sm" onClick={handleDismiss}>
                Awesome
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
