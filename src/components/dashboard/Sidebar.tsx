"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Server,
  Layers,
  Activity,
  Settings,
  Sparkles,
  Smartphone,
  Compass,
  LogOut,
  Menu,
} from "lucide-react";
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
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/services", label: "Services", icon: Server },
  { href: "/dashboard/projects", label: "Projects", icon: Layers },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
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
          const IconComp = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
                active
                  ? "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700/50 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200",
              )}
            >
              <IconComp
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active
                    ? "text-sky-500 dark:text-sky-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                )}
              />
              {item.label}
              {item.label === "Services" && (
                <span className="ml-auto rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-600 dark:text-slate-300">
                  {services.length}
                </span>
              )}
            </Link>
          );
        })}

        {!isSupporter && (
          <>
            <div className="my-3 border-t border-slate-200 dark:border-slate-800/80 pt-2" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openSupport();
              }}
              className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-transparent hover:border-amber-500/20 transition-colors"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
              Become a Supporter
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            openLan();
          }}
          className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
        >
          <Smartphone className="h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400" />
          Mobile / TV LAN
          <span className="ml-auto rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 px-1.5 py-0.5 text-[9px] font-mono text-slate-500 dark:text-slate-300 uppercase">
            Wi-Fi
          </span>
        </button>

        {services.length === 0 && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openTutorial();
            }}
            className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
          >
            <Compass className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
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
          <button onClick={signOut} disabled={signingOut} title="Sign out" className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50">
            <LogOut className="h-3.5 w-3.5" />
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
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#060b13]/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <AnchorIconBox size="sm" />
          <span className="font-semibold text-slate-900 dark:text-white">Portside</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 w-64 bg-white dark:bg-[#060b13]">{content}</aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-white dark:bg-[#060b13] lg:block">{content}</aside>
      <TutorialModal forceOpen={tutorialOpen} onClose={closeTutorial} servicesCount={services.length} />
      <LanModal open={lanOpen} onClose={closeLan} />
      <DevHotspotModal open={hotspotOpen} onClose={closeHotspot} />
      <BecomeSupporterModal open={supportOpen} onClose={closeSupport} />
      <UpdateModal />
    </>
  );
}
