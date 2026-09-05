"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { TutorialModal } from "./TutorialModal";
import { UpdateModal } from "./UpdateModal";
import { LanModal } from "./LanModal";
import { BecomeSupporterModal } from "./BecomeSupporterModal";
import { DevHotspotModal } from "./DevHotspotModal";
import { AnchorIconBox } from "@/components/ui/AnchorLogo";
import { SupporterBadge } from "@/components/ui/SupporterBadge";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/dashboard/services", label: "Services", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/dashboard/projects", label: "Projects", icon: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" },
  { href: "/dashboard/activity", label: "Activity", icon: "M3 12h4l3-8 4 16 3-8h4" },
  { href: "/dashboard/settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    services,
    checking,
    lastCheckedAt,
    autoCheck,
    isSupporter,
    tutorialOpen,
    openTutorial,
    closeTutorial,
    lanOpen,
    openLan,
    closeLan,
    supportOpen,
    openSupport,
    closeSupport,
    hotspotOpen,
    openHotspot,
    closeHotspot,
  } = useDashboard();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const online = services.filter((s) => s.lastStatus === "online").length;

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const content = (
    <div className="flex h-full flex-col bg-brand-surface dark:bg-brand-bg-dark border-r border-slate-200 dark:border-slate-800/80">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <AnchorIconBox size="md" />
        <div>
          <p className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white">Portside</p>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">*.localhost proxy</p>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-0.5 px-2.5">
        {nav.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                active
                  ? "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700/50"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200",
              )}
            >
              <svg viewBox="0 0 24 24" className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-sky-500 dark:text-sky-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
              {item.label === "Services" && (
                <span className="ml-auto rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-600 dark:text-slate-300">{services.length}</span>
              )}
            </Link>
          );
        })}

        <div className="my-3 border-t border-slate-200 dark:border-slate-800/80 pt-2" />

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            openSupport();
          }}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
            isSupporter
              ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800/60 hover:text-amber-700 dark:hover:text-amber-300"
          )}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
          </svg>
          {isSupporter ? "Supporter Active" : "Become a Supporter"}
          {isSupporter && (
            <span className="ml-auto rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
              PRO
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            openHotspot();
          }}
          className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </svg>
          Dev Wi-Fi Hotspot
          <SupporterBadge size="xs" className="ml-auto" />
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            openLan();
          }}
          className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" />
          </svg>
          Mobile / TV LAN
          <span className="ml-auto rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 px-1.5 py-0.5 text-[9px] font-mono text-slate-500 dark:text-slate-300 uppercase">Wi-Fi</span>
        </button>

        {services.length === 0 && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openTutorial();
            }}
            className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Feature Tour
          </button>
        )}
      </nav>

      <div className="mx-2.5 mb-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-brand-bg dark:bg-slate-950/40 p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Background Monitor</span>
          <span className={cn("h-1.5 w-1.5 rounded-full", autoCheck ? (checking ? "bg-amber-400 animate-pulse" : "bg-emerald-400") : "bg-slate-300 dark:bg-slate-600")} />
        </div>
        <p className="mt-1 text-xs text-slate-900 dark:text-white">
          <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">{online}</span>
          <span className="text-slate-500 dark:text-slate-400"> / {services.length} online</span>
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500">
          {autoCheck ? (checking ? "Probing ports…" : lastCheckedAt ? `Checked ${new Date(lastCheckedAt).toLocaleTimeString()}` : "Starting…") : "Paused"}
        </p>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 p-2.5">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
            <p className="truncate text-[10px] text-slate-500">{user.email}</p>
          </div>
          <button onClick={signOut} disabled={signingOut} title="Sign out" className="rounded p-1 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
        {user.email === "demo@portside.dev" && (
          <Link
            href="/register"
            onClick={signOut}
            className="mt-2 block rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-2 py-1.5 text-center text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition"
          >
            Create Your Free Account →
          </Link>
        )}
        <div className="mt-2 rounded-md bg-brand-bg dark:bg-slate-950/60 px-2 py-1.5 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800/50">
          <span>Created by </span>
          <a
            href="https://github.com/letsmakepact"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
          >
            pact
          </a>
          <span className="text-slate-300 dark:text-slate-600"> · </span>
          <a
            href="https://t.me/pactwithdevil"
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline"
          >
            @pactwithdevil
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0b0f19]/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <AnchorIconBox size="sm" />
          <span className="font-semibold text-slate-900 dark:text-white">Portside</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white" aria-label="Open menu">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 w-64 bg-white dark:bg-[#0b0f19]">{content}</aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-white dark:bg-[#0b0f19] lg:block">{content}</aside>
      <TutorialModal forceOpen={tutorialOpen} onClose={closeTutorial} servicesCount={services.length} />
      <LanModal open={lanOpen} onClose={closeLan} />
      <DevHotspotModal open={hotspotOpen} onClose={closeHotspot} />
      <BecomeSupporterModal open={supportOpen} onClose={closeSupport} />
      <UpdateModal />
    </>
  );
}
