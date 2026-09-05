export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const PROJECT_COLORS = [
  "indigo",
  "violet",
  "sky",
  "emerald",
  "amber",
  "rose",
  "teal",
  "orange",
] as const;

export type ProjectColor = (typeof PROJECT_COLORS)[number];

export const colorClasses: Record<string, { dot: string; bg: string; text: string; ring: string }> = {
  indigo: { dot: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-200" },
  violet: { dot: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200" },
  sky: { dot: "bg-sky-500", bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200" },
  emerald: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  amber: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  rose: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200" },
  teal: { dot: "bg-teal-500", bg: "bg-teal-50", text: "text-teal-700", ring: "ring-teal-200" },
  orange: { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-200" },
};

export function colorFor(color: string) {
  return colorClasses[color] ?? colorClasses.indigo;
}

export const SERVICE_ICONS = ["⌘", "◈", "◉", "⚙", "⌗", "✦", "◫", "▤", "⌥", "▣", "▲", "◆", "●", "⬡", "❖", "★"];

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
