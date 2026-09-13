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
    <div className="flex h-full flex-col bg-[#0b0f17] border-r border-[#1f2937]">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-[#1f2937]/60">
        <AnchorIconBox size="md" />
        <div>
          <p className="text-[13px] font-semibold tracking-tight text-white">Portside</p>
          <p className="text-[11px] font-mono text-slate-400">*.localhost proxy</p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          const IconComp = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "bg-[#161f30] text-white border border-[#27354a]"
                  : "text-slate-400 hover:bg-[#111827] hover:text-slate-200 border border-transparent",
              )}
            >
              <IconComp
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active
                    ? "text-sky-400"
                    : "text-slate-400 group-hover:text-slate-300",
                )}
              />
              {item.label}
              {item.label === "Services" && (
                <span className="ml-auto rounded bg-[#111827] border border-[#1f2937] px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  {services.length}
                </span>
              )}
            </Link>
          );
        })}

        {!isSupporter && (
          <>
            <div className="my-3 border-t border-[#1f2937]/80 pt-2" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openSupport();
              }}
              className="group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-amber-300 hover:bg-[#111827] border border-transparent hover:border-amber-500/20 transition-colors"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
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
          className="group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-[#111827] hover:text-white border border-transparent"
        >
          <Smartphone className="h-4 w-4 shrink-0 text-sky-400" />
          Mobile / TV LAN
          <span className="ml-auto rounded bg-[#111827] border border-[#1f2937] px-1.5 py-0.5 text-[9px] font-mono text-slate-400 uppercase">
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
            className="group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-[#111827] hover:text-slate-200 border border-transparent"
          >
            <Compass className="h-4 w-4 shrink-0 text-amber-400" />
            Feature Tour
          </button>
        )}
      </nav>

      <div className="mx-3 mb-3 rounded-md border border-[#1f2937] bg-[#111827] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium tracking-wide uppercase text-slate-400">Background Monitor</span>
          <span className={cn("h-2 w-2 rounded-full", autoCheck ? (checking ? "bg-amber-400" : "bg-emerald-500") : "bg-slate-600")} />
        </div>
        <p className="mt-1.5 text-xs text-white">
          <span className="font-semibold font-mono text-emerald-400">{online}</span>
          <span className="text-slate-400"> / {services.length} online</span>
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500 font-mono">
          {autoCheck ? (checking ? "Probing ports…" : lastCheckedAt ? `Checked ${new Date(lastCheckedAt).toLocaleTimeString()}` : "Starting…") : "Paused"}
        </p>
      </div>

      <div className="border-t border-[#1f2937] p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 bg-[#111827] border border-[#1f2937]">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-[#161f30] border border-[#27354a] text-xs font-semibold text-slate-200">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-200">{user.name}</p>
            <p className="truncate text-[10px] text-slate-400 font-mono">{user.email}</p>
          </div>
          <button onClick={signOut} disabled={signingOut} title="Sign out" className="rounded p-1 text-slate-400 transition hover:bg-[#161f30] hover:text-white disabled:opacity-50">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        {user.email === "demo@portside.dev" && (
          <Link
            href="/register"
            onClick={signOut}
            className="mt-2 block rounded bg-[#111827] border border-[#1f2937] px-2 py-1.5 text-center text-[11px] font-medium text-slate-200 hover:bg-[#161f30] transition"
          >
            Create Free Account →
          </Link>
        )}
        <div className="mt-2 rounded bg-[#0e1420] px-2 py-1.5 text-[10px] text-slate-400 border border-[#1f2937]">
          <span>Created by </span>
          <a
            href="https://github.com/letsmakepact"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-300 hover:text-white hover:underline"
          >
            pact
          </a>
          <span className="text-slate-600"> · </span>
          <a
            href="https://t.me/pactwithdevil"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-slate-200 hover:underline"
          >
            @pactwithdevil
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#1f2937] bg-[#0b0f17]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <AnchorIconBox size="sm" />
          <span className="font-semibold text-white">Portside</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-md p-2 text-slate-400 hover:bg-[#111827] hover:text-white" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 w-64 bg-[#0b0f17]">{content}</aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-[#0b0f17] lg:block">{content}</aside>
      <TutorialModal forceOpen={tutorialOpen} onClose={closeTutorial} servicesCount={services.length} />
      <LanModal open={lanOpen} onClose={closeLan} />
      <DevHotspotModal open={hotspotOpen} onClose={closeHotspot} />
      <BecomeSupporterModal open={supportOpen} onClose={closeSupport} />
      <UpdateModal />
    </>
  );
}
