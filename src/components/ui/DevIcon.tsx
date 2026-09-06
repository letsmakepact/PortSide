"use client";

import type { ComponentType, SVGProps } from "react";
import {
  Server,
  Globe,
  Database,
  Terminal,
  Code,
  Zap,
  Layers,
  Cpu,
  Box,
  Smartphone,
  Radio,
  Tv,
  Shield,
  Cloud,
  Sparkles,
  Lock,
  Activity,
  QrCode,
  Layout,
  Webhook,
  HardDrive,
  FolderGit2,
  FileCode2,
  Gauge,
  Wifi,
} from "lucide-react";

export interface DevIconMeta {
  id: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  category: "backend" | "frontend" | "data" | "system" | "network" | "ai";
  colorClass: string;
  badgeBg: string;
}

export const DEV_ICON_REGISTRY: Record<string, DevIconMeta> = {
  server: {
    id: "server",
    name: "API / Server",
    icon: Server,
    category: "backend",
    colorClass: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  globe: {
    id: "globe",
    name: "Web / Frontend",
    icon: Globe,
    category: "frontend",
    colorClass: "text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  },
  database: {
    id: "database",
    name: "Database / SQL",
    icon: Database,
    category: "data",
    colorClass: "text-violet-400",
    badgeBg: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  },
  terminal: {
    id: "terminal",
    name: "CLI / Script",
    icon: Terminal,
    category: "system",
    colorClass: "text-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  },
  code: {
    id: "code",
    name: "Code / App",
    icon: Code,
    category: "frontend",
    colorClass: "text-cyan-400",
    badgeBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  },
  zap: {
    id: "zap",
    name: "Cache / Redis",
    icon: Zap,
    category: "data",
    colorClass: "text-yellow-400",
    badgeBg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  },
  layers: {
    id: "layers",
    name: "Microservices",
    icon: Layers,
    category: "backend",
    colorClass: "text-indigo-400",
    badgeBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  },
  cpu: {
    id: "cpu",
    name: "Worker / Engine",
    icon: Cpu,
    category: "system",
    colorClass: "text-rose-400",
    badgeBg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  },
  box: {
    id: "box",
    name: "Docker / Pod",
    icon: Box,
    category: "system",
    colorClass: "text-blue-400",
    badgeBg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  smartphone: {
    id: "smartphone",
    name: "Mobile / iOS",
    icon: Smartphone,
    category: "frontend",
    colorClass: "text-pink-400",
    badgeBg: "bg-pink-500/10 border-pink-500/20 text-pink-400",
  },
  radio: {
    id: "radio",
    name: "WebSocket / SSE",
    icon: Radio,
    category: "network",
    colorClass: "text-teal-400",
    badgeBg: "bg-teal-500/10 border-teal-500/20 text-teal-400",
  },
  tv: {
    id: "tv",
    name: "Smart TV / Media",
    icon: Tv,
    category: "frontend",
    colorClass: "text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  },
  shield: {
    id: "shield",
    name: "Auth / Security",
    icon: Shield,
    category: "system",
    colorClass: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  cloud: {
    id: "cloud",
    name: "Cloud / Edge",
    icon: Cloud,
    category: "network",
    colorClass: "text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  },
  sparkles: {
    id: "sparkles",
    name: "AI / LLM Model",
    icon: Sparkles,
    category: "ai",
    colorClass: "text-purple-400",
    badgeBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  },
  lock: {
    id: "lock",
    name: "Vault / Secrets",
    icon: Lock,
    category: "system",
    colorClass: "text-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  },
  activity: {
    id: "activity",
    name: "Metrics / Probe",
    icon: Activity,
    category: "network",
    colorClass: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  qrcode: {
    id: "qrcode",
    name: "mDNS / QR LAN",
    icon: QrCode,
    category: "network",
    colorClass: "text-cyan-400",
    badgeBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  },
  layout: {
    id: "layout",
    name: "UI / Storybook",
    icon: Layout,
    category: "frontend",
    colorClass: "text-fuchsia-400",
    badgeBg: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400",
  },
  webhook: {
    id: "webhook",
    name: "Webhook / Event",
    icon: Webhook,
    category: "backend",
    colorClass: "text-orange-400",
    badgeBg: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  },
  harddrive: {
    id: "harddrive",
    name: "Storage / Bucket",
    icon: HardDrive,
    category: "data",
    colorClass: "text-slate-300",
    badgeBg: "bg-slate-500/10 border-slate-500/20 text-slate-300",
  },
  git: {
    id: "git",
    name: "Git / CI/CD",
    icon: FolderGit2,
    category: "system",
    colorClass: "text-red-400",
    badgeBg: "bg-red-500/10 border-red-500/20 text-red-400",
  },
  filecode: {
    id: "filecode",
    name: "Docs / OpenAPI",
    icon: FileCode2,
    category: "frontend",
    colorClass: "text-lime-400",
    badgeBg: "bg-lime-500/10 border-lime-500/20 text-lime-400",
  },
  gauge: {
    id: "gauge",
    name: "Benchmark / Perf",
    icon: Gauge,
    category: "system",
    colorClass: "text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  },
  wifi: {
    id: "wifi",
    name: "LAN / Hotspot",
    icon: Wifi,
    category: "network",
    colorClass: "text-cyan-400",
    badgeBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  },
};

// Aliases for common user terms or lowercase inputs
const ALIAS_MAP: Record<string, string> = {
  api: "server",
  backend: "server",
  web: "globe",
  frontend: "globe",
  db: "database",
  postgres: "database",
  mysql: "database",
  sql: "database",
  cli: "terminal",
  shell: "terminal",
  bash: "terminal",
  mobile: "smartphone",
  ios: "smartphone",
  android: "smartphone",
  redis: "zap",
  cache: "zap",
  docker: "box",
  container: "box",
  ws: "radio",
  stream: "radio",
  security: "shield",
  auth: "shield",
  ai: "sparkles",
  llm: "sparkles",
  metrics: "activity",
  health: "activity",
  qr: "qrcode",
  lan: "wifi",
  hotspot: "wifi",
};

export function resolveDevIcon(iconKey?: string | null): DevIconMeta | null {
  if (!iconKey) return null;
  const normalized = iconKey.toLowerCase().trim();
  if (DEV_ICON_REGISTRY[normalized]) return DEV_ICON_REGISTRY[normalized];
  if (ALIAS_MAP[normalized] && DEV_ICON_REGISTRY[ALIAS_MAP[normalized]]) {
    return DEV_ICON_REGISTRY[ALIAS_MAP[normalized]];
  }
  return null;
}

export function DevIcon({
  icon,
  className = "w-4 h-4",
  fallbackClassName = "text-base font-mono",
}: {
  icon?: string | null;
  className?: string;
  fallbackClassName?: string;
}) {
  const meta = resolveDevIcon(icon);
  if (meta) {
    const IconComp = meta.icon;
    return <IconComp className={className} />;
  }
  return <span className={fallbackClassName}>{icon || "⌘"}</span>;
}

export function DevIconBadge({
  icon,
  size = "md",
}: {
  icon?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const meta = resolveDevIcon(icon);

  const sizeClasses = {
    sm: "w-7 h-7 rounded-lg text-xs",
    md: "w-9 h-9 rounded-xl text-sm",
    lg: "w-11 h-11 rounded-2xl text-base",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-5.5 h-5.5",
  }[size];

  if (meta) {
    const IconComp = meta.icon;
    return (
      <div
        className={`flex shrink-0 items-center justify-center border transition-all duration-200 ${meta.badgeBg} ${sizeClasses} shadow-xs`}
        title={meta.name}
      >
        <IconComp className={iconSizes} />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 ${sizeClasses} font-mono`}
    >
      {icon || "⌘"}
    </div>
  );
}
