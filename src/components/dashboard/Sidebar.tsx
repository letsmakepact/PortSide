"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { TutorialModal } from "./TutorialModal";
import { UpdateModal } from "./UpdateModal";
import { AnchorIconBox } from "@/components/ui/AnchorLogo";
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
  const { user, services, checking, lastCheckedAt, autoCheck, tutorialOpen, openTutorial, closeTutorial } = useDashboard();
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
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5">
        <AnchorIconBox size="md" />
        <div>
          <p className="text-[15px] font-semibold leading-tight text-white">Portside</p>
          <p className="text-[11px] text-sky-400/80">name your localhost</p>
        </div>
      </div>

      <nav className="mt-7 flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-white/10 text-white shadow-inner" : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <svg viewBox="0 0 24 24" className={cn("h-[18px] w-[18px]", active ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
              {item.label === "Services" && (
                <span className="ml-auto rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold text-slate-300">{services.length}</span>
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            openTutorial();
          }}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-400/10 hover:text-amber-200"
        >
          <span className="flex h-[18px] w-[18px] items-center justify-center text-sm">✨</span>
          Feature Tour
          <span className="ml-auto rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">Guide</span>
        </button>
      </nav>

      <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Background monitor</span>
          <span className={cn("h-2 w-2 rounded-full", autoCheck ? (checking ? "animate-pulse bg-amber-400" : "bg-emerald-400") : "bg-slate-500")} />
        </div>
        <p className="mt-1.5 text-sm text-white">
          <span className="font-semibold text-emerald-300">{online}</span>
          <span className="text-slate-400"> / {services.length} online</span>
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {autoCheck ? (checking ? "Probing ports…" : lastCheckedAt ? `Checked ${new Date(lastCheckedAt).toLocaleTimeString()}` : "Starting…") : "Paused in settings"}
        </p>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold text-white ring-2 ring-white/10">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-[11px] text-slate-500">{user.email}</p>
          </div>
          <button onClick={signOut} disabled={signingOut} title="Sign out" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
        <div className="mt-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-slate-400">
          <span>Created by </span>
          <a
            href="https://github.com/letsmakepact"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-sky-400 hover:text-sky-300 hover:underline"
          >
            pact
          </a>
          <span className="text-slate-600"> · </span>
          <a
            href="https://t.me/pactwithdevil"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white hover:underline"
          >
            @pactwithdevil
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <AnchorIconBox size="sm" />
          <span className="font-semibold text-slate-900">Portside</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Open menu">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 w-72 bg-slate-950">{content}</aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-slate-950 lg:block">{content}</aside>
      <TutorialModal forceOpen={tutorialOpen} onClose={closeTutorial} />
      <UpdateModal />
    </>
  );
}
