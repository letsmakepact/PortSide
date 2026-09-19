import fs from "fs";
import path from "path";
import os from "os";
import { getCurrentUser, type SafeUser } from "./auth";
import { isServerSupporter } from "./server-checks";
import { validateUsername, sanitizeUsernameFallback } from "./username";

export interface ProjectOverride {
  title?: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
  repoUrl?: string;
  docsUrl?: string;
}

export interface CustomLink {
  id: string;
  label: string;
  url: string;
  description?: string;
  icon?: string;
}

export interface PublicProfile {
  handle: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  bannerPreset: "cyber-mesh" | "matrix-emerald" | "obsidian-glow" | "midnight-neon" | "pure-carbon";
  accentColor: "sky" | "emerald" | "violet" | "amber" | "rose" | "cyan";
  location: string;
  pronouns: string;
  organization: string;
  statusText: string;
  statusIndicator: "online" | "building" | "busy" | "away";
  verifiedBadgeText: string;
  vanityChangesUsed?: number;
  extraVanityPurchased?: number;

  skills: string[];

  github: string;
  twitter: string;
  buymeacoffee: string;
  website: string;
  discord: string;
  telegram: string;
  linkedin: string;
  email: string;

  customLinks: CustomLink[];

  showProjects: boolean;
  projectsTitle: string;
  projectsSubtitle: string;
  visibleServices: string[];
  projectOverrides: Record<string, ProjectOverride>;

  showCta: boolean;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonUrl: string;

  updatedAt?: string;
}

export const PACT_DEFAULT_PROFILE: PublicProfile = {
  handle: "pact",
  name: "pact",
  title: "Founder & Systems Architect",
  bio: "Building local infrastructure, distributed network routing, and edge tunnels.",
  avatarUrl: "/pact-avatar.png",
  bannerUrl: "",
  bannerPreset: "cyber-mesh",
  accentColor: "sky",
  location: "Primary Node #1",
  pronouns: "he/him",
  organization: "PortSide",
  statusText: "Building Portside Edge Tunnels",
  statusIndicator: "online",
  verifiedBadgeText: "Verified",
  skills: [
    "TypeScript",
    "Next.js",
    "Go",
    "Cloudflare",
    "Tailwind CSS",
    "PostgreSQL",
    "Edge Tunnels",
    "Docker",
  ],
  github: "https://github.com/letsmakepact",
  twitter: "https://x.com/pactwithdevil",
  buymeacoffee: "https://buymeacoffee.com/pacts",
  website: "https://pact.portside.lol",
  discord: "https://discord.gg/portside",
  telegram: "https://t.me/pactwithdevil",
  linkedin: "",
  email: "pact@virtuoushigh.com",
  customLinks: [
    {
      id: "link-1",
      label: "Documentation & Guides",
      url: "https://portside.lol/docs",
      description: "Zero-config local hostname proxy guide",
    },
  ],
  showProjects: true,
  projectsTitle: "Live Hosted Projects",
  projectsSubtitle: "Active projects hosted directly through PortSide.",
  visibleServices: [],
  projectOverrides: {},
  showCta: true,
  ctaTitle: "Core Local Hosting via PortSide",
  ctaDescription: "Every project listed here is connected directly through PortSide. Zero third-party cloud hosting required.",
  ctaButtonText: "Get PortSide",
  ctaButtonUrl: "https://buymeacoffee.com/pacts",
};

export function getBlankProfile(user?: SafeUser | null): PublicProfile {
  const cleanHandle = sanitizeUsernameFallback(user?.name || user?.email?.split("@")[0] || "");

  return {
    handle: cleanHandle,
    name: user?.name || "Developer",
    title: "",
    bio: "",
    avatarUrl: "",
    bannerUrl: "",
    bannerPreset: "cyber-mesh",
    accentColor: "sky",
    location: "",
    pronouns: "",
    organization: "",
    statusText: "Node Online & Active",
    statusIndicator: "online",
    verifiedBadgeText: user?.tier === "supporter" ? "PortSide Verified Supporter" : "Developer",
    vanityChangesUsed: 0,
    extraVanityPurchased: 0,
    skills: [],
    github: "",
    twitter: "",
    buymeacoffee: "",
    website: "",
    discord: "",
    telegram: "",
    linkedin: "",
    email: user?.email || "",
    customLinks: [],
    showProjects: true,
    projectsTitle: "Live Hosted Projects",
    projectsSubtitle: "Active projects hosted directly through PortSide.",
    visibleServices: [],
    projectOverrides: {},
    showCta: false,
    ctaTitle: "",
    ctaDescription: "",
    ctaButtonText: "",
    ctaButtonUrl: "",
  };
}

export function getProfileFilePath(userId?: number | string | null): string {
  const home = os.homedir();
  const dir = path.join(home, "Portside");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  if (userId) {
    return path.join(dir, `profile_${userId}.json`);
  }
  return path.join(dir, "profile.json");
}

export async function getProfile(userParam?: SafeUser | null): Promise<PublicProfile> {
  let user = userParam;
  if (user === undefined) {
    try {
      user = await getCurrentUser();
    } catch {
      user = null;
    }
  }

  const isPact =
    !user ||
    user.email === "pact@virtuoushigh.com" ||
    user.email === "demo@portside.dev" ||
    user.name === "pact" ||
    !user.email;
  const defaultProfile = isPact ? PACT_DEFAULT_PROFILE : getBlankProfile(user);

  const filePath = getProfileFilePath(user?.id);
  const globalPath = getProfileFilePath(null);
  let saved: Partial<PublicProfile> = {};

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      saved = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse profile JSON", err);
    }
  } else if (fs.existsSync(globalPath)) {
    try {
      const content = fs.readFileSync(globalPath, "utf-8");
      saved = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse global profile JSON", err);
    }
  }

  let vanityDomain = "";
  const isSupporter = await isServerSupporter(user).catch(() => false);
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
        if (data.vanityDomain) {
          vanityDomain = data.vanityDomain;
        }
      }
    } catch {}
  }
  const handle = vanityDomain ? vanityDomain.split(".")[0] : (saved.handle || defaultProfile.handle);
  const website = vanityDomain ? `https://${vanityDomain}` : (saved.website || defaultProfile.website || (handle ? `https://${handle}.portside.lol` : ""));
  const verifiedBadgeText = isSupporter ? "Verified Supporter" : defaultProfile.verifiedBadgeText;
  const vanityChangesUsed = typeof saved.vanityChangesUsed === "number" ? saved.vanityChangesUsed : 0;
  const extraVanityPurchased = typeof saved.extraVanityPurchased === "number" ? saved.extraVanityPurchased : (isPact ? 999 : 0);

  return {
    ...defaultProfile,
    ...saved,
    handle,
    name: saved.name || defaultProfile.name,
    title: saved.title || defaultProfile.title,
    bio: saved.bio || defaultProfile.bio,
    avatarUrl: saved.avatarUrl || defaultProfile.avatarUrl,
    location: saved.location || defaultProfile.location,
    pronouns: saved.pronouns || defaultProfile.pronouns,
    statusText: saved.statusText || defaultProfile.statusText,
    skills: (saved.skills && saved.skills.length > 0) ? saved.skills : defaultProfile.skills,
    github: saved.github || defaultProfile.github,
    twitter: saved.twitter || defaultProfile.twitter,
    buymeacoffee: saved.buymeacoffee || defaultProfile.buymeacoffee,
    website,
    discord: saved.discord || defaultProfile.discord,
    telegram: saved.telegram || defaultProfile.telegram,
    customLinks: (saved.customLinks && saved.customLinks.length > 0) ? saved.customLinks : defaultProfile.customLinks,
    verifiedBadgeText,
    vanityChangesUsed,
    extraVanityPurchased,
    projectOverrides: {
      ...defaultProfile.projectOverrides,
      ...(saved.projectOverrides || {}),
    },
  };
}

export function getVanityChangeCost(changesUsed: number): number {
  if (changesUsed < 1) return 0;
  if (changesUsed === 1) return 10;
  if (changesUsed === 2) return 15;
  return 20;
}

export async function saveProfile(data: Partial<PublicProfile>, userParam?: SafeUser | null): Promise<PublicProfile> {
  let user = userParam;
  if (user === undefined) {
    try {
      user = await getCurrentUser();
    } catch {
      user = null;
    }
  }

  const current = await getProfile(user);
  const isSupporter = await isServerSupporter(user).catch(() => false);
  const isPact = user?.email === "pact@virtuoushigh.com";

  let newHandle = current.handle;
  let vanityChangesUsed = current.vanityChangesUsed || 0;
  const extraVanityPurchased = current.extraVanityPurchased || 0;
  const maxAllowedChanges = 1 + extraVanityPurchased;

  if (typeof data.handle === "string") {
    const trimmed = data.handle.trim();
    if (trimmed && trimmed.toLowerCase() !== current.handle.toLowerCase()) {
      if (!isSupporter && !isPact) {
        throw new Error("Custom vanity subdomains (*.portside.lol) require an active Supporter plan.");
      }

      const validation = validateUsername(trimmed, { isPact });
      if (!validation.valid) {
        throw new Error(validation.error || "Invalid username.");
      }

      const rawInput = validation.clean;

      if (!isPact && vanityChangesUsed >= maxAllowedChanges) {
        const nextCost = getVanityChangeCost(vanityChangesUsed);
        const changeOrdinal = vanityChangesUsed === 1 ? "2nd" : vanityChangesUsed === 2 ? "3rd" : vanityChangesUsed === 3 ? "4th" : "5th";
        throw new Error(`You have already used your ${vanityChangesUsed === 1 ? "1 free vanity change" : `${vanityChangesUsed} vanity changes`}. The ${changeOrdinal} vanity change costs $${nextCost}.`);
      }

      newHandle = rawInput;
      if (!isPact) {
        vanityChangesUsed += 1;
      }
    }
  }

  const sanitizedInput = { ...data };
  delete (sanitizedInput as any).handle;
  delete (sanitizedInput as any).website;
  delete (sanitizedInput as any).verifiedBadgeText;
  delete (sanitizedInput as any).vanityChangesUsed;
  delete (sanitizedInput as any).extraVanityPurchased;

  const website = isSupporter && newHandle ? `https://${newHandle}.portside.lol` : current.website;

  const updated: PublicProfile = {
    ...current,
    ...sanitizedInput,
    handle: newHandle,
    website,
    vanityChangesUsed,
    extraVanityPurchased,
    verifiedBadgeText: isSupporter ? "Verified Supporter" : "Developer",
    projectOverrides: {
      ...(current.projectOverrides || {}),
      ...(sanitizedInput.projectOverrides || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  const filePath = getProfileFilePath(user?.id);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
