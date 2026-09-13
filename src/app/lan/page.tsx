import type { Metadata } from "next";
import { listLanServices } from "@/lib/queries";
import { getLanIp } from "@/lib/lan";
import { AnchorLogo } from "@/components/ui/AnchorLogo";
import { isServerSupporter } from "@/lib/server-checks";
import { LanRemoteNav } from "@/components/lan/LanRemoteNav";
import { LanCockpitClient } from "@/components/lan/LanCockpitClient";

export const metadata: Metadata = {
  title: "Multi-Device LAN Launchpad",
  description:
    "Launch and test local development servers across iOS, Android, and Smart TV browsers with zero-config Open-Air signals and scannable QR codes.",
  alternates: {
    canonical: "/lan",
    languages: {
      en: "/lan",
      "en-US": "/lan",
      "x-default": "/lan",
    },
  },
  openGraph: {
    title: "Portside LAN Launchpad · Test Across All Screens",
    description:
      "Instant camera QR codes and Smart TV D-pad remote navigation for testing local web services on your Wi-Fi network.",
    url: "/lan",
  },
};

export const dynamic = "force-dynamic";

export default async function LanPortalPage() {
  const isSupporter = await isServerSupporter();
  const [allServices, lanIp] = await Promise.all([listLanServices(), Promise.resolve(getLanIp())]);
  const port = process.env.PORT || "80";
  const portSuffix = port === "80" || port === "443" ? "" : `:${port}`;

  if (!isSupporter) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center pb-safe pt-safe">
        <LanRemoteNav />
        <div className="max-w-md w-full rounded-2xl border border-sky-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-lg shadow-sky-500/20 mb-4">
            <AnchorLogo className="h-8 w-8" />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Personal Dashboard is a Supporter Feature
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            The multi-service mobile & TV launchpad dashboard is reserved for PortSide Supporters.
          </p>

          <div className="mt-5 rounded-xl bg-slate-800/80 border border-white/10 p-4 text-left text-xs text-slate-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400">
                Free Direct Access (Included)
              </span>
              <span className="text-[10px] font-mono text-slate-400">100% Free</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Free tier includes direct redirects to any project on your local network:
            </p>
            <div className="space-y-2 pt-1">
              {allServices.length > 0 ? (
                allServices.map((s) => (
                  <a
                    key={s.id}
                    href={`/s/${s.hostname}`}
                    data-lan-nav="true"
                    className="flex items-center justify-between rounded-xl bg-slate-900/90 px-3.5 py-2.5 font-mono text-xs text-sky-400 hover:text-sky-300 border border-white/5 hover:border-sky-500/30 transition tv-focus-target touch-action-manipulation"
                  >
                    <span className="font-semibold text-white truncate mr-2">{s.name}</span>
                    <span className="text-[11px] text-emerald-400 shrink-0">/s/{s.hostname} &rarr;</span>
                  </a>
                ))
              ) : (
                <p className="text-[11px] text-slate-500 italic">No services currently running on Portside.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            <a
              href="https://buymeacoffee.com/pacts"
              target="_blank"
              rel="noreferrer"
              data-lan-nav="true"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 transition tv-focus-target touch-action-manipulation"
            >
              Unlock Personal Dashboard & Supporter Perks
            </a>
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-600">
          Created by pact (letsmakepact &middot; @pactwithdevil)
        </p>
      </div>
    );
  }

  return (
    <LanCockpitClient
      initialServices={allServices}
      lanIp={lanIp}
      port={port}
      isSupporter={isSupporter}
    />
  );
}
