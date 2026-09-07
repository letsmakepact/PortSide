export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const PROJECT_COLORS = [
  "indigo",
  "violet",
  "sky",
  "cyan",
  "emerald",
  "amber",
  "rose",
  "teal",
  "orange",
  "fuchsia",
  "crimson",
  "blue",
  "lime",
  "purple",
  "slate",
  "sunset",
] as const;

export type ProjectColor = (typeof PROJECT_COLORS)[number];

export interface ColorDefinition {
  dot: string;
  bg: string;
  text: string;
  ring: string;
  border: string;
  gradient: string;
  glow: string;
}

export const colorClasses: Record<string, ColorDefinition> = {
  indigo: {
    dot: "bg-indigo-500",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    ring: "ring-indigo-500/30",
    border: "border-indigo-500/30",
    gradient: "from-indigo-600 to-violet-600",
    glow: "shadow-indigo-500/15",
  },
  violet: {
    dot: "bg-violet-500",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    ring: "ring-violet-500/30",
    border: "border-violet-500/30",
    gradient: "from-violet-600 to-fuchsia-600",
    glow: "shadow-violet-500/15",
  },
  sky: {
    dot: "bg-sky-500",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    ring: "ring-sky-500/30",
    border: "border-sky-500/30",
    gradient: "from-sky-500 to-blue-600",
    glow: "shadow-sky-500/15",
  },
  cyan: {
    dot: "bg-cyan-400",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    ring: "ring-cyan-500/30",
    border: "border-cyan-500/30",
    gradient: "from-cyan-500 to-teal-500",
    glow: "shadow-cyan-500/15",
  },
  emerald: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    ring: "ring-emerald-500/30",
    border: "border-emerald-500/30",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/15",
  },
  amber: {
    dot: "bg-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    ring: "ring-amber-500/30",
    border: "border-amber-500/30",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/15",
  },
  rose: {
    dot: "bg-rose-500",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    ring: "ring-rose-500/30",
    border: "border-rose-500/30",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/15",
  },
  teal: {
    dot: "bg-teal-500",
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    ring: "ring-teal-500/30",
    border: "border-teal-500/30",
    gradient: "from-teal-500 to-emerald-600",
    glow: "shadow-teal-500/15",
  },
  orange: {
    dot: "bg-orange-500",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    ring: "ring-orange-500/30",
    border: "border-orange-500/30",
    gradient: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/15",
  },
  fuchsia: {
    dot: "bg-fuchsia-500",
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-400",
    ring: "ring-fuchsia-500/30",
    border: "border-fuchsia-500/30",
    gradient: "from-fuchsia-500 to-pink-600",
    glow: "shadow-fuchsia-500/15",
  },
  crimson: {
    dot: "bg-red-500",
    bg: "bg-red-500/10",
    text: "text-red-400",
    ring: "ring-red-500/30",
    border: "border-red-500/30",
    gradient: "from-red-600 to-rose-700",
    glow: "shadow-red-500/15",
  },
  blue: {
    dot: "bg-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    ring: "ring-blue-500/30",
    border: "border-blue-500/30",
    gradient: "from-blue-600 to-indigo-600",
    glow: "shadow-blue-500/15",
  },
  lime: {
    dot: "bg-lime-400",
    bg: "bg-lime-500/10",
    text: "text-lime-400",
    ring: "ring-lime-500/30",
    border: "border-lime-500/30",
    gradient: "from-lime-500 to-emerald-500",
    glow: "shadow-lime-500/15",
  },
  purple: {
    dot: "bg-purple-500",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    ring: "ring-purple-500/30",
    border: "border-purple-500/30",
    gradient: "from-purple-600 to-indigo-700",
    glow: "shadow-purple-500/15",
  },
  slate: {
    dot: "bg-slate-400",
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    ring: "ring-slate-500/30",
    border: "border-slate-500/30",
    gradient: "from-slate-600 to-slate-800",
    glow: "shadow-slate-500/15",
  },
  sunset: {
    dot: "bg-gradient-to-r from-amber-400 to-rose-500",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    ring: "ring-rose-500/30",
    border: "border-rose-500/30",
    gradient: "from-amber-500 via-rose-500 to-purple-600",
    glow: "shadow-rose-500/20",
  },
};

export function colorFor(color: string): ColorDefinition {
  return colorClasses[color] ?? colorClasses.indigo;
}

export const PROJECT_CATEGORIES = [
  { id: "development", name: "Development", color: "sky" },
  { id: "production", name: "Production", color: "emerald" },
  { id: "staging", name: "Staging", color: "amber" },
  { id: "api", name: "API & Microservices", color: "violet" },
  { id: "tools", name: "Internal Tooling", color: "cyan" },
  { id: "client", name: "Client Project", color: "rose" },
  { id: "personal", name: "Personal Labs", color: "indigo" },
] as const;

export const PROJECT_ACCENTS = [
  { id: "glow", name: "Top Glow", description: "Glowing top edge border" },
  { id: "gradient", name: "Full Banner", description: "Subtle top gradient wash" },
  { id: "bordered", name: "Accent Border", description: "Full colored border ring" },
  { id: "solid", name: "Clean Minimal", description: "Standard subtle border" },
] as const;

export const PROJECT_ICONS = [
  "layers",
  "box",
  "globe",
  "server",
  "terminal",
  "code",
  "zap",
  "cpu",
  "database",
  "shield",
  "cloud",
  "sparkles",
  "harddrive",
  "git",
  "layout",
  "activity",
  "smartphone",
  "wifi",
] as const;

export const DEV_SERVICE_ICONS = [
  "server",
  "globe",
  "database",
  "terminal",
  "code",
  "zap",
  "layers",
  "cpu",
  "box",
  "smartphone",
  "radio",
  "tv",
  "shield",
  "cloud",
  "sparkles",
  "lock",
  "activity",
  "qrcode",
  "layout",
  "webhook",
  "harddrive",
  "git",
  "filecode",
  "wifi",
] as const;

export const LEGACY_SERVICE_ICONS = ["⌘", "◈", "◉", "⚙", "⌗", "✦", "◫", "▤", "⌥", "▣", "▲", "◆", "●", "⬡", "❖", "★"];

export const SERVICE_ICONS = [...DEV_SERVICE_ICONS, ...LEGACY_SERVICE_ICONS];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function isValidHostname(label: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(label);
}

export const RESERVED_HOSTNAMES = new Set(["www", "app", "localhost", "api-internal", "_proxy"]);

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "never";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const s = Math.round(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function serviceUrl(hostname: string, appPort: string): string {
  return `http://${hostname}.localhost${appPort && appPort !== "80" ? `:${appPort}` : ""}`;
}
