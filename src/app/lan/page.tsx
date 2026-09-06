import { listLanServices } from "@/lib/queries";
import { getLanIp, getLanUrls } from "@/lib/lan";
import { AnchorLogo } from "@/components/ui/AnchorLogo";
import { isServerSupporter } from "@/lib/server-checks";

export const dynamic = "force-dynamic";

export default async function LanPortalPage() {
  const isSupporter = await isServerSupporter();
  const [allServices, lanIp] = await Promise.all([listLanServices(), Promise.resolve(getLanIp())]);
  const port = process.env.PORT || "80";
  const portSuffix = port === "80" || port === "443" ? "" : `:${port}`;

  let publicTunnelUrl = "";
  let vanityDomain = "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 350);
    const launcherRes = await fetch("http://127.0.0.1:4242/api/pro/status", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (launcherRes.ok) {
      const data = await launcherRes.json();
      if (data.publicTunnelUrl) {
        publicTunnelUrl = data.publicTunnelUrl;
      }
      if (data.vanityDomain) {
        vanityDomain = data.vanityDomain;
      }
    }
  } catch {}

  if (!isSupporter) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-2xl border border-amber-500/30 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 mb-4">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Supporter Perk Required
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Zero-configuration mobile & Smart TV LAN routing requires a verified PortSide Supporter license.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Activate Supporter status on the PortSide host dashboard or support monthly on Buy Me a Coffee to unlock this screen instantly.
          </p>
          <div className="mt-6 pt-5 border-t border-white/10">
            <a
              href="https://buymeacoffee.com/pacts"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition"
            >
              Support PortSide on Buy Me a Coffee
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-600">
          Created by pact (letsmakepact · @pactwithdevil)
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
                All custom local services registered on this computer are available across your Wi-Fi network and globally from anywhere. Tap any service below to open it directly.
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
              {publicTunnelUrl && (
                <span className="rounded-lg bg-sky-500/10 border border-sky-500/30 px-3 py-2 flex items-center gap-1.5 text-sky-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  Global 5G / Remote Access
                </span>
              )}
            </div>
          </div>

          {vanityDomain ? (
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-500/10 rounded-xl p-3 border border-sky-500/25">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                <div>
                  <p className="text-xs font-semibold text-white">Permanent Branded Access (*.portside.lol)</p>
                  <p className="font-mono text-[11px] text-sky-300 break-all">https://{vanityDomain}/lan</p>
                </div>
              </div>
              <a
                href={`https://${vanityDomain}/lan`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-400 transition"
              >
                Open Branded URL
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            </div>
          ) : publicTunnelUrl ? (
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-500/5 rounded-xl p-3 border border-sky-500/15">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                <div>
                  <p className="text-xs font-semibold text-white">Global Encrypted Tunnel (5G / Remote)</p>
                  <p className="font-mono text-[11px] text-sky-300 break-all">{publicTunnelUrl}</p>
                </div>
              </div>
              <a
                href={publicTunnelUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-400 transition"
              >
                Open Remotely
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            </div>
          ) : null}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Available Services ({allServices.length})
          </h3>
          <span className="text-xs text-slate-500">
            Wi-Fi Gateway: {lanIp}
          </span>
        </div>

        {allServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
            <div className="flex justify-center mb-3">
              <AnchorLogo className="h-10 w-10 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-white">No services active yet</h4>
            <p className="text-sm text-slate-400 mt-1">
              Add services in your Portside desktop dashboard to access them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allServices.map((svc) => {
              const urls = getLanUrls(svc.hostname, port, lanIp);
              const isOnline = svc.lastStatus === "online";

              return (
                <div
                  key={svc.id}
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-sky-500/40 hover:bg-white/[0.07]"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 group-hover:scale-105 transition shadow-xs">
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isOnline
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                            : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-rose-400"}`} />
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>

                    <h4 className="mt-4 text-base font-bold text-white group-hover:text-sky-300 transition">
                      {svc.name}
                    </h4>
                    <p className="font-mono text-xs text-slate-400 mt-0.5">
                      Port :{svc.port} · {svc.hostname}.localhost
                    </p>

                    {svc.description && (
                      <p className="mt-2.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {svc.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                    <a
                      href={`/s/${svc.hostname}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-600/30 hover:bg-sky-500 active:scale-98 transition text-center"
                    >
                      Launch on this device →
                    </a>
                    <a
                      href={urls.subdomainUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-center font-mono text-[11px] text-slate-500 hover:text-sky-300 transition truncate"
                      title={urls.subdomainUrl}
                    >
                      {svc.hostname}.{lanIp}.nip.io
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p>Portside LAN Portal · Created by pact (letsmakepact · @pactwithdevil)</p>
      </footer>
    </div>
  );
}
