import { getProfile, PublicProfile } from "@/lib/profile";
import { listLanServices } from "@/lib/queries";
import { AnchorLogo } from "@/components/ui/AnchorLogo";
import { getCurrentUser } from "@/lib/auth";
import { isServerSupporter } from "@/lib/server-checks";
import { cn } from "@/lib/utils";
import {
  CopyButton,
  ServicesShowcase,
  type ProfileServiceItem,
} from "@/components/profile/ProfileClientControls";
import {
  ShieldCheck,
  ArrowUpRight,
  Coffee,
  Globe,
  Radio,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const isSupporter = await isServerSupporter(user);
  const [profile, allServices] = await Promise.all([
    getProfile(user),
    listLanServices(),
  ]);

  let vanityDomain = "";
  let publicTunnelUrl = "";
  if (isSupporter) {
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
  }

  const activeDomain = vanityDomain || (publicTunnelUrl ? new URL(publicTunnelUrl).hostname : "");

  const visibleServices = (profile.visibleServices || []).length > 0
    ? allServices.filter((s) => (profile.visibleServices || []).includes(s.hostname))
    : [];

  const sortedServices: ProfileServiceItem[] = [...visibleServices]
    .sort((a, b) => {
      const aFeatured = profile.projectOverrides?.[a.hostname]?.featured ? 1 : 0;
      const bFeatured = profile.projectOverrides?.[b.hostname]?.featured ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      return a.name.localeCompare(b.name);
    })
    .map((s) => ({
      id: String(s.id),
      name: s.name,
      hostname: s.hostname,
      port: s.port,
      lastStatus: s.lastStatus || "online",
      description: s.description,
      tags: s.tags,
      override: profile.projectOverrides?.[s.hostname],
      directPath: `/s/${s.hostname}`,
      fullSubdomain: `/s/${s.hostname}`,
    }));

  const fullShareUrl = activeDomain
    ? `https://${activeDomain}`
    : `https://${profile.handle}.portside.lol`;

  const statusColor = {
    online: "bg-emerald-400",
    building: "bg-amber-400",
    busy: "bg-rose-400",
    away: "bg-slate-500",
  }[profile.statusIndicator || "online"];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 selection:bg-white selection:text-black font-sans antialiased overflow-x-hidden relative">
      {/* Steam-Style Full-Page Background Artwork Layer */}
      {profile.bannerUrl ? (
        <div
          className="fixed inset-0 z-0 bg-cover bg-top bg-no-repeat pointer-events-none transition-all duration-700"
          style={{ backgroundImage: `url(${profile.bannerUrl})`, backgroundAttachment: "fixed" }}
        />
      ) : (
        <div
          className={cn(
            "fixed inset-0 z-0 pointer-events-none transition-all duration-700",
            profile.bannerPreset === "matrix-emerald" && "bg-gradient-to-b from-emerald-950/70 via-[#07090e]/95 to-[#07090e]",
            profile.bannerPreset === "midnight-neon" && "bg-gradient-to-b from-purple-950/70 via-[#07090e]/95 to-[#07090e]",
            profile.bannerPreset === "obsidian-glow" && "bg-gradient-to-b from-slate-900/70 via-[#07090e]/95 to-[#07090e]",
            profile.bannerPreset === "pure-carbon" && "bg-gradient-to-b from-zinc-900/70 via-[#07090e]/95 to-[#07090e]",
            (!profile.bannerPreset || profile.bannerPreset === "cyber-mesh") && "bg-gradient-to-b from-sky-950/70 via-[#07090e]/95 to-[#07090e]"
          )}
        />
      )}

      {/* Steam Profile Atmospheric Overlay & Darkening Tint for Text Contrast */}
      <div
        className="fixed inset-0 z-0 bg-[#07090e]/80 backdrop-blur-[1px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(7,9,14,0.95)_85%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Frosted Sticky Navigation Bar */}
      <header className="border-b border-white/[0.08] px-4 sm:px-6 py-3 sm:py-3.5 sticky top-0 z-30 bg-[#07090e]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono min-w-0">
            <a href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition shrink-0 touch-action-manipulation">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 shadow-xs">
                <AnchorLogo className="h-3.5 w-3.5" />
              </span>
              <span className="font-semibold text-white tracking-tight">portside</span>
            </a>
            <span className="text-slate-600 select-none">/</span>
            <span className="text-slate-500 hidden sm:inline">nodes</span>
            <span className="text-slate-600 hidden sm:inline select-none">/</span>
            <span className="text-slate-300 font-medium truncate max-w-[140px] sm:max-w-none">@{profile.handle}</span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {profile.statusText && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] font-mono text-[11px] text-slate-300">
                <span className={`h-1.5 w-1.5 rounded-full ${statusColor} shadow-[0_0_6px_rgba(52,211,153,0.5)]`} />
                <span>{profile.statusText}</span>
              </div>
            )}

            {user && (
              <a
                href="/dashboard/settings?tab=profile"
                className="font-mono text-xs text-slate-400 hover:text-white transition px-2.5 py-1 rounded-md border border-white/5 bg-white/[0.02] hover:bg-white/10 touch-action-manipulation"
              >
                edit
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container with Steam Profile Glass Framing */}
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-14 space-y-9 sm:space-y-12 relative z-10">
        {/* Profile Hero Header */}
        <section className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
              {/* Avatar with Primary Bezel */}
              <div className="relative shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border border-white/15 bg-slate-900 shadow-xl flex items-center justify-center ring-1 ring-white/10 ring-offset-2 ring-offset-[#07090e]">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl font-mono font-bold text-slate-300">
                      {profile.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span
                  className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md bg-[#07090e] border border-white/15 text-sky-400 shadow-xs"
                  title="PortSide Node"
                >
                  <AnchorLogo className="h-3 w-3" />
                </span>
              </div>

              {/* Name, Title, and Metadata */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                    {profile.name}
                  </h1>
                  <span className="font-mono text-xs text-slate-400">
                    @{profile.handle}
                  </span>
                  {isSupporter && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-[10px] font-mono text-sky-300 shrink-0 font-medium shadow-xs">
                      <ShieldCheck className="h-3 w-3 text-sky-400" />
                      verified
                    </span>
                  )}
                </div>

                {profile.title && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-snug break-words">
                    {profile.title}
                    {profile.organization && (
                      <span className="text-sky-400/90 font-medium"> @ {profile.organization}</span>
                    )}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400 pt-0.5">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {profile.location}
                    </span>
                  )}
                  {profile.location && profile.pronouns && <span>·</span>}
                  {profile.pronouns && <span>({profile.pronouns})</span>}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <CopyButton
                textToCopy={fullShareUrl}
                label="Share"
                copiedLabel="Copied"
              />
            </div>
          </div>

          {/* Narrative Bio */}
          {profile.bio && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl break-words whitespace-pre-line">
              {profile.bio}
            </p>
          )}

          {/* Connected Comms - Tactile Mobile-Friendly Command Dock */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {profile.buymeacoffee && (
              <a
                href={profile.buymeacoffee}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-mono font-semibold text-amber-300 hover:bg-amber-500/25 active:bg-amber-500/35 active:scale-95 transition-all shadow-xs touch-action-manipulation"
              >
                <Coffee className="h-3.5 w-3.5" />
                <span>Support Dev</span>
              </a>
            )}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12] active:scale-95 px-3 py-1.5 text-xs font-mono text-slate-200 hover:text-white transition-all shadow-xs touch-action-manipulation"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                <span>GitHub</span>
              </a>
            )}
            {profile.twitter && (
              <a
                href={profile.twitter}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12] active:scale-95 px-3 py-1.5 text-xs font-mono text-slate-200 hover:text-white transition-all shadow-xs touch-action-manipulation"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                <span>X</span>
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12] active:scale-95 px-3 py-1.5 text-xs font-mono text-slate-200 hover:text-white transition-all shadow-xs touch-action-manipulation"
              >
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                <span>Website</span>
              </a>
            )}
            {profile.discord && (
              <a
                href={profile.discord}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12] active:scale-95 px-3 py-1.5 text-xs font-mono text-slate-200 hover:text-white transition-all shadow-xs touch-action-manipulation"
              >
                <Radio className="h-3.5 w-3.5 text-indigo-400" />
                <span>Discord</span>
              </a>
            )}
            {profile.telegram && (
              <a
                href={profile.telegram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12] active:scale-95 px-3 py-1.5 text-xs font-mono text-slate-200 hover:text-white transition-all shadow-xs touch-action-manipulation"
              >
                <ArrowUpRight className="h-3.5 w-3.5 text-sky-400" />
                <span>Telegram</span>
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12] active:scale-95 px-3 py-1.5 text-xs font-mono text-slate-200 hover:text-white transition-all shadow-xs touch-action-manipulation"
              >
                <span>Contact</span>
              </a>
            )}
          </div>

          {/* Clean Technical Stack Matrix */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-xs font-mono text-slate-300 shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Live Hosted Deployments / Services */}
        {profile.showProjects !== false && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                {profile.projectsTitle || "Live Hosted Deployments"}
              </h2>
              <span className="font-mono text-xs text-slate-500">
                {sortedServices.length} {sortedServices.length === 1 ? "service" : "services"}
              </span>
            </div>

            <ServicesShowcase
              services={sortedServices}
              activeDomain={activeDomain}
            />
          </section>
        )}

        {/* Featured Resources & Links */}
        {profile.customLinks && profile.customLinks.length > 0 && (
          <section className="space-y-3.5">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Featured Links & Resources
            </h2>
            <div className="space-y-2.5">
              {profile.customLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/15 active:bg-white/[0.05] active:scale-[0.99] transition-all duration-150 touch-action-manipulation min-h-[48px]"
                >
                  <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                    <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition truncate">
                      {link.label}
                    </h3>
                    {link.description && (
                      <p className="text-xs text-slate-400 leading-snug break-words">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white transition shrink-0" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Direct Edge Node Telemetry Strip */}
        <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-200 font-medium truncate">{fullShareUrl.replace(/^https?:\/\//, "")}</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-500 hidden sm:inline shrink-0">encrypted tunnel</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="text-slate-500 text-[11px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5">TLS 1.3</span>
            <CopyButton textToCopy={fullShareUrl} label="copy" copiedLabel="copied" />
          </div>
        </section>

        {/* Minimal Mobile-Safe Footer */}
        <footer className="pt-8 pb-safe border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500 text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <AnchorLogo className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400">powered by portside</span>
          </div>
          <p>Zero third-party cloud hosting</p>
        </footer>
      </main>
    </div>
  );
}
