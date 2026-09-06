import { getProfile, PublicProfile } from "@/lib/profile";
import { listLanServices } from "@/lib/queries";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

export const dynamic = "force-dynamic";

// Color theme helper
function getThemeStyles(accent: PublicProfile["accentColor"]) {
  switch (accent) {
    case "emerald":
      return {
        accentText: "text-emerald-400",
        accentBg: "bg-emerald-500",
        accentBgSubtle: "bg-emerald-500/10",
        accentBorder: "border-emerald-500/30",
        accentGlow: "from-emerald-600/15 via-teal-600/10",
        buttonBg: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20",
        pillBg: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
      };
    case "violet":
      return {
        accentText: "text-violet-400",
        accentBg: "bg-violet-500",
        accentBgSubtle: "bg-violet-500/10",
        accentBorder: "border-violet-500/30",
        accentGlow: "from-violet-600/15 via-purple-600/10",
        buttonBg: "bg-violet-600 hover:bg-violet-500 shadow-violet-600/20",
        pillBg: "border-violet-500/30 bg-violet-500/15 text-violet-300",
      };
    case "amber":
      return {
        accentText: "text-amber-400",
        accentBg: "bg-amber-500",
        accentBgSubtle: "bg-amber-500/10",
        accentBorder: "border-amber-500/30",
        accentGlow: "from-amber-600/15 via-orange-600/10",
        buttonBg: "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20",
        pillBg: "border-amber-500/30 bg-amber-500/15 text-amber-300",
      };
    case "rose":
      return {
        accentText: "text-rose-400",
        accentBg: "bg-rose-500",
        accentBgSubtle: "bg-rose-500/10",
        accentBorder: "border-rose-500/30",
        accentGlow: "from-rose-600/15 via-pink-600/10",
        buttonBg: "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20",
        pillBg: "border-rose-500/30 bg-rose-500/15 text-rose-300",
      };
    case "cyan":
      return {
        accentText: "text-cyan-400",
        accentBg: "bg-cyan-500",
        accentBgSubtle: "bg-cyan-500/10",
        accentBorder: "border-cyan-500/30",
        accentGlow: "from-cyan-600/15 via-sky-600/10",
        buttonBg: "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20",
        pillBg: "border-cyan-500/30 bg-cyan-500/15 text-cyan-300",
      };
    case "sky":
    default:
      return {
        accentText: "text-sky-400",
        accentBg: "bg-sky-500",
        accentBgSubtle: "bg-sky-500/10",
        accentBorder: "border-sky-500/30",
        accentGlow: "from-sky-600/15 via-indigo-600/10",
        buttonBg: "bg-sky-600 hover:bg-sky-500 shadow-sky-600/20",
        pillBg: "border-sky-500/30 bg-sky-500/15 text-sky-300",
      };
  }
}

function getBannerGradient(preset: PublicProfile["bannerPreset"]) {
  switch (preset) {
    case "matrix-emerald":
      return "from-emerald-950/60 via-slate-950/80 to-[#070b14]";
    case "midnight-neon":
      return "from-purple-950/60 via-indigo-950/50 to-[#070b14]";
    case "obsidian-glow":
      return "from-slate-900/60 via-slate-950 to-[#070b14]";
    case "pure-carbon":
      return "from-zinc-900/40 via-slate-950 to-[#070b14]";
    case "cyber-mesh":
    default:
      return "from-sky-950/50 via-indigo-950/40 to-[#070b14]";
  }
}

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
  const theme = getThemeStyles(profile.accentColor || "sky");
  const bannerGradient = getBannerGradient(profile.bannerPreset || "cyber-mesh");

  // Filter services
  const visibleServices = profile.visibleServices && profile.visibleServices.length > 0
    ? allServices.filter((s) => profile.visibleServices.includes(s.hostname))
    : allServices;

  // Sort services: featured first, then name
  const sortedServices = [...visibleServices].sort((a, b) => {
    const aFeatured = profile.projectOverrides?.[a.hostname]?.featured ? 1 : 0;
    const bFeatured = profile.projectOverrides?.[b.hostname]?.featured ? 1 : 0;
    if (bFeatured !== aFeatured) return bFeatured - aFeatured;
    return a.name.localeCompare(b.name);
  });

  // Status indicator config
  const statusColor = {
    online: "bg-emerald-400",
    building: "bg-amber-400",
    busy: "bg-rose-400",
    away: "bg-slate-400",
  }[profile.statusIndicator || "online"];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-sky-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic ambient background glow */}
      <div
        className={`pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-gradient-to-tr ${theme.accentGlow} to-transparent blur-3xl`}
      />
      <div className="pointer-events-none absolute top-[700px] right-0 h-[450px] w-[650px] rounded-full bg-sky-900/10 blur-3xl" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070b14]/85 backdrop-blur-md px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.accentBgSubtle} border ${theme.accentBorder} ${theme.accentText} shadow-xs group-hover:scale-105 transition`}>
              <AnchorLogo className="h-5 w-5" />
            </span>
            <div>
              <span className={`text-sm font-bold tracking-tight text-white group-hover:${theme.accentText} transition`}>
                PortSide
              </span>
              <span className="hidden sm:inline-block ml-2 font-mono text-[11px] text-slate-500">
                / {profile.handle}
              </span>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              <span className={`h-2 w-2 rounded-full ${statusColor} animate-pulse`} />
              {profile.statusText || "Node Online"}
            </span>
            {profile.buymeacoffee && (
              <a
                href={profile.buymeacoffee}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition shadow-xs"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
                Support Dev
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 space-y-12 relative z-10">
        {/* Profile Card Container with Custom Banner */}
        <section className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl bg-slate-900/40">
          {/* Banner Header */}
          <div className="relative h-44 sm:h-56 w-full overflow-hidden">
            {profile.bannerUrl ? (
              <img
                src={profile.bannerUrl}
                alt="Profile Banner"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${bannerGradient} relative`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_70%)]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          </div>

          {/* Hero Profile Body */}
          <div className="px-6 pb-8 pt-0 sm:px-10 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-20 sm:-mt-24 mb-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`h-28 w-28 sm:h-36 sm:w-36 rounded-3xl overflow-hidden border-4 border-[#070b14] shadow-2xl bg-slate-900 flex items-center justify-center ring-2 ${theme.accentBorder}`}>
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className={`text-4xl font-black ${theme.accentText}`}>
                      {profile.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span
                  className={`absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl ${theme.accentBg} text-white border-2 border-[#070b14] shadow-md`}
                  title="PortSide Sovereign Node"
                >
                  <AnchorLogo className="h-4 w-4" />
                </span>
              </div>

              {/* Status and Primary Action */}
              <div className="flex flex-wrap items-center gap-2.5">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {profile.location}
                  </span>
                )}
                {profile.organization && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                    {profile.organization}
                  </span>
                )}
                {profile.pronouns && (
                  <span className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-slate-400">
                    {profile.pronouns}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {profile.name}
                </h1>
                <span className="font-mono text-sm text-slate-400">
                  @{profile.handle}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border ${theme.pillBg} px-3 py-0.5 text-xs font-semibold`}>
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  {profile.verifiedBadgeText || "PortSide Verified Supporter"}
                </span>
              </div>

              <p className={`text-base font-semibold ${theme.accentText}`}>
                {profile.title}
              </p>

              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">
                {profile.bio}
              </p>

              {/* Skills / Tech Stack */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
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
                {profile.discord && (
                  <a
                    href={profile.discord}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><path d="M7.5 7.5c3.5-1 5.5-1 9 0" /><path d="M7 16.5c3.5 1 6.5 1 10 0" /><path d="M15.5 17c0 1 1.5 2 2 2 1.5 0 2.8-3.2 3.5-7.5-.5-.5-2-1.5-3.5-1.5-.5 1-1 2-1 2" /><path d="M8.5 17c0 1-1.5 2-2 2-1.5 0-2.8-3.2-3.5-7.5.5-.5 2-1.5 3.5-1.5.5 1 1 2 1 2" /></svg>
                    Discord
                  </a>
                )}
                {profile.telegram && (
                  <a
                    href={profile.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    Telegram
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                    LinkedIn
                  </a>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Custom Showcase Links (Linktree-style) */}
        {profile.customLinks && profile.customLinks.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${theme.accentBg}`} />
              Featured Links & Resources
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.customLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 hover:bg-white/[0.06] transition"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white group-hover:text-sky-400 transition">
                      {link.label}
                    </p>
                    {link.description && (
                      <p className="text-xs text-slate-400">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-slate-500 group-hover:text-white transition">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Live Hosted Projects Section */}
        {profile.showProjects !== false && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${theme.accentBg}`} />
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {profile.projectsTitle || "Live Hosted Projects"}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {profile.projectsSubtitle || "Hosted directly from local development ports via PortSide edge tunnels. Open and test in real-time."}
                </p>
              </div>
              <span className={`text-xs font-mono ${theme.accentText} ${theme.accentBgSubtle} border ${theme.accentBorder} px-2.5 py-1 rounded-lg self-start sm:self-auto`}>
                {sortedServices.length} Active Services Online
              </span>
            </div>

            {sortedServices.length === 0 ? (
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
                {sortedServices.map((svc) => {
                  const override = profile.projectOverrides?.[svc.hostname] || {};
                  const isOnline = svc.lastStatus === "online";
                  const directPath = `/s/${svc.hostname}`;
                  const fullSubdomain = activeDomain ? `https://${svc.hostname}.${activeDomain}` : "";

                  const displayName = override.title || svc.name;
                  const displayDesc = override.description || svc.description || "Local application hosted securely through PortSide edge proxy.";
                  const displayTags = override.tags && override.tags.length > 0 ? override.tags : svc.tags;
                  const isFeatured = override.featured;

                  return (
                    <div
                      key={svc.id}
                      className={`group relative flex flex-col justify-between rounded-2xl border ${
                        isFeatured ? `${theme.accentBorder} bg-white/[0.05]` : "border-white/10 bg-white/[0.03]"
                      } p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/[0.07] hover:shadow-xl`}
                    >
                      <div>
                        {/* Top bar: icon & status */}
                        <div className="flex items-start justify-between gap-3">
                          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.accentBgSubtle} border ${theme.accentBorder} ${theme.accentText} group-hover:scale-105 transition shadow-xs`}>
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                              <line x1="8" y1="21" x2="16" y2="21" />
                              <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isFeatured && (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${theme.pillBg} border`}>
                                Featured
                              </span>
                            )}
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
                        </div>

                        {/* Project Title and Hostname */}
                        <h3 className={`mt-4 text-base font-bold text-white group-hover:${theme.accentText} transition`}>
                          {displayName}
                        </h3>
                        <p className="font-mono text-xs text-slate-400 mt-0.5">
                          {svc.hostname}.{activeDomain || "localhost"}
                        </p>

                        {/* Description */}
                        <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {displayDesc}
                        </p>

                        {/* Tags */}
                        {displayTags && displayTags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {displayTags.slice(0, 4).map((tag, idx) => (
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

                      {/* Launch Actions */}
                      <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                        <a
                          href={directPath}
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${theme.buttonBg} px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-98`}
                        >
                          Open Live Project
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </a>

                        <div className="flex items-center justify-between gap-2 pt-1 text-[11px] font-mono">
                          {override.repoUrl ? (
                            <a
                              href={override.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-white transition flex items-center gap-1"
                            >
                              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                              Source Code
                            </a>
                          ) : <span />}

                          {fullSubdomain && (
                            <a
                              href={fullSubdomain}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-sky-400 transition truncate max-w-[160px]"
                              title={fullSubdomain}
                            >
                              {fullSubdomain.replace("https://", "")}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Custom Call To Action Banner */}
        {profile.showCta !== false && (
          <section className={`rounded-2xl border ${theme.accentBorder} bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900/90 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5`}>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <AnchorLogo className={`h-5 w-5 ${theme.accentText}`} />
                {profile.ctaTitle || "Sovereign Local Hosting via PortSide"}
              </h4>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {profile.ctaDescription || "Every project listed here is served directly from physical hardware through sovereign encrypted edge tunnels. Zero third-party cloud hosting required."}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={profile.ctaButtonUrl || "https://buymeacoffee.com/pacts"}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-xl ${theme.buttonBg} px-5 py-2.5 text-xs font-bold text-white shadow-md transition`}
              >
                {profile.ctaButtonText || "Get PortSide"}
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            </div>
          </section>
        )}
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
