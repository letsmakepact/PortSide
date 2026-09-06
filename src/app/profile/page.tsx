import { getProfile } from "@/lib/profile";
import { listLanServices } from "@/lib/queries";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [profile, allServices] = await Promise.all([
    getProfile(),
    listLanServices(),
  ]);

  let vanityDomain = "";
  let publicTunnelUrl = "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 350);
    const res = await fetch("http://127.0.0.1:4242/api/pro/status", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.vanityDomain) vanityDomain = data.vanityDomain;
      if (data.publicTunnelUrl) publicTunnelUrl = data.publicTunnelUrl;
    }
  } catch {}

  const activeDomain = vanityDomain || (publicTunnelUrl ? new URL(publicTunnelUrl).hostname : "");
  const visibleServices = profile.visibleServices.length > 0
    ? allServices.filter((s) => profile.visibleServices.includes(s.hostname))
    : allServices;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-sky-500 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient background glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-sky-600/15 via-indigo-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-[600px] right-0 h-[400px] w-[600px] rounded-full bg-cyan-600/10 blur-3xl" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-md px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-400 shadow-sm shadow-sky-500/10 group-hover:scale-105 transition">
              <AnchorLogo className="h-5 w-5" />
            </span>
            <div>
              <span className="text-sm font-bold tracking-tight text-white group-hover:text-sky-400 transition">
                PortSide
              </span>
              <span className="hidden sm:inline-block ml-2 font-mono text-[11px] text-slate-500">
                / {profile.handle}
              </span>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Node Online
            </span>
            <a
              href="https://buymeacoffee.com/pacts"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition shadow-xs"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
              Support Dev
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8 space-y-12 relative z-10">
        {/* Hero Section */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl overflow-hidden border-2 border-sky-400/40 shadow-xl shadow-sky-500/10 bg-slate-900 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-sky-400">
                    {profile.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white border-2 border-[#070b14] shadow-md" title="PortSide Sovereign Node">
                <AnchorLogo className="h-4 w-4" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {profile.name}
                </h1>
                <span className="font-mono text-sm text-slate-400">
                  @{profile.handle}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  PortSide Verified Supporter
                </span>
              </div>

              <p className="text-base font-medium text-sky-400">
                {profile.title}
              </p>

              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>

              {/* Skills / Tech Stack */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Social and Contact Links */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3">
                {profile.buymeacoffee && (
                  <a
                    href={profile.buymeacoffee}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
                    Buy Me a Coffee
                  </a>
                )}
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                    GitHub
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    Twitter / X
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Live Hosted Projects Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Live Hosted Projects
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Hosted directly from local development ports via PortSide edge tunnels. Open and test in real-time.
              </p>
            </div>
            <span className="text-xs font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              {visibleServices.length} Active Services Online
            </span>
          </div>

          {visibleServices.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 mb-3">
                <AnchorLogo className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-white">No projects published yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Configure your local services in the PortSide dashboard to publish them online on this showcase.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleServices.map((svc) => {
                const isOnline = svc.lastStatus === "online";
                const directPath = `/s/${svc.hostname}`;
                const fullSubdomain = activeDomain ? `https://${svc.hostname}.${activeDomain}` : "";

                return (
                  <div
                    key={svc.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-200 hover:border-sky-500/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-sky-500/5"
                  >
                    <div>
                      {/* Top bar: icon & status */}
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xl font-mono text-sky-400 group-hover:scale-105 transition">
                          {svc.icon || "⌘"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isOnline
                              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                              : "bg-slate-800 border border-slate-700 text-slate-400"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                          {isOnline ? "Live Online" : "Local Standby"}
                        </span>
                      </div>

                      {/* Project Title and Hostname */}
                      <h3 className="mt-4 text-base font-bold text-white group-hover:text-sky-300 transition">
                        {svc.name}
                      </h3>
                      <p className="font-mono text-xs text-slate-400 mt-0.5">
                        {svc.hostname}.{activeDomain || "localhost"}
                      </p>

                      {/* Description */}
                      <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {svc.description || "Local application hosted securely through PortSide edge proxy."}
                      </p>

                      {/* Tags */}
                      {svc.tags && svc.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {svc.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-white/5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Launch Action */}
                    <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                      <a
                        href={directPath}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-500 transition active:scale-98"
                      >
                        Open Live Project
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                      </a>
                      {fullSubdomain && (
                        <a
                          href={fullSubdomain}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-center font-mono text-[10px] text-slate-500 hover:text-sky-400 transition truncate"
                          title={fullSubdomain}
                        >
                          {fullSubdomain.replace("https://", "")}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* PortSide Host Information Banner */}
        <section className="rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-950/30 via-slate-900 to-slate-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AnchorLogo className="h-4 w-4 text-sky-400" />
              Sovereign Local Hosting via PortSide
            </h4>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Every project listed here is served directly from the developer&apos;s physical machine through sovereign encrypted edge tunnels. Zero third-party cloud hosting required.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://buymeacoffee.com/pacts"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400 transition"
            >
              Get PortSide
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 bg-[#070b14]/90 py-8 text-center text-xs text-slate-500 relative z-10">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AnchorLogo className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-400">PortSide Showcase</span>
            <span>·</span>
            <span>Hosted by {profile.name} (@{profile.handle})</span>
          </div>
          <p>
            Created by pact (letsmakepact · @pactwithdevil)
          </p>
        </div>
      </footer>
    </div>
  );
}
