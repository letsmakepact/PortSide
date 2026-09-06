import { listLanServices } from "@/lib/queries";
import { getLanIp } from "@/lib/lan";
import { AnchorLogo } from "@/components/ui/AnchorLogo";
import { isServerSupporter } from "@/lib/server-checks";

export const dynamic = "force-dynamic";

export default async function LanPortalPage() {
  const isSupporter = await isServerSupporter();
  const [allServices, lanIp] = await Promise.all([listLanServices(), Promise.resolve(getLanIp())]);
  const port = process.env.PORT || "80";
  const portSuffix = port === "80" || port === "443" ? "" : `:${port}`;

  if (!isSupporter) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-2xl border border-sky-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
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
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Free Direct Access (Included)
              </span>
              <span className="text-[10px] font-mono text-slate-400">100% Free</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Free tier includes direct redirects to any project on your local network:
            </p>
            <div className="space-y-1.5 pt-1">
              {allServices.length > 0 ? (
                allServices.map((s) => (
                  <a
                    key={s.id}
                    href={`/s/${s.hostname}`}
                    className="flex items-center justify-between rounded-lg bg-slate-900/90 px-3 py-2 font-mono text-xs text-sky-400 hover:text-sky-300 border border-white/5 hover:border-sky-500/30 transition"
                  >
                    <span className="font-semibold text-white">{s.name}</span>
                    <span className="text-[11px] text-emerald-400">/s/{s.hostname} &rarr;</span>
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 transition"
            >
              Unlock Personal Dashboard & .local Routing
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-600">
          Created by pact (letsmakepact &middot; @pactwithdevil)
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-sky-500 selection:text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-400/40 shadow-lg shadow-sky-500/20">
              <AnchorLogo className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight sm:text-lg">Portside</h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                  LAN Live
                </span>
              </div>
              <p className="text-xs text-sky-400/80">Local Network Launchpad</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">http://{lanIp}{portSuffix}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-950 p-6 shadow-xl mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Connected from your Mobile or TV
              </h2>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                All custom local services registered on this computer are available across your Wi-Fi network. Tap any service below to open it directly.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                Phones & Tablets
              </span>
              <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>
                Smart TVs
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Available Services ({allServices.length})
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allServices.map((service) => (
            <a
              key={service.id}
              href={`/s/${service.hostname}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-sky-500/50 hover:bg-slate-900/90 transition shadow-lg backdrop-blur-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-base text-white group-hover:text-sky-400 transition">
                    {service.name}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Online
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-400 break-all">
                  http://{service.hostname}.localhost
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-sky-400 font-semibold">
                <span>Launch Service</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
