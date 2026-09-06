import fs from "fs";
import path from "path";
import os from "os";
import { getCurrentUser, type SafeUser } from "./auth";
import { isServerSupporter } from "./server-checks";

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
  // Identity & Branding
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

  // Skills
  skills: string[];

  // Social & Contact
  github: string;
  twitter: string;
  buymeacoffee: string;
  website: string;
  discord: string;
  telegram: string;
  linkedin: string;
  email: string;

  // Custom links
  customLinks: CustomLink[];

  // Project showcase controls
  showProjects: boolean;
  projectsTitle: string;
  projectsSubtitle: string;
  visibleServices: string[];
  projectOverrides: Record<string, ProjectOverride>;

  // Call to Action
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
  title: "Full-Stack Developer & Systems Architect",
  bio: "Building sovereign local infrastructure, distributed network routing, and modern web applications. Powered by PortSide.",
  avatarUrl: "https://github.com/letsmakepact.png",
  bannerUrl: "",
  bannerPreset: "cyber-mesh",
  accentColor: "sky",
  location: "Global / Remote",
  pronouns: "he/him",
  organization: "PortSide",
  statusText: "Node Online & Active",
  statusIndicator: "online",
  verifiedBadgeText: "PortSide Verified Supporter",
  skills: ["TypeScript", "Next.js", "Go", "Tailwind CSS", "PostgreSQL", "Docker"],
  github: "https://github.com/letsmakepact",
  twitter: "https://x.com/pactwithdevil",
  buymeacoffee: "https://buymeacoffee.com/pacts",
  website: "https://pact.portside.lol",
  discord: "",
  telegram: "https://t.me/pactwithdevil",
  linkedin: "",
  email: "pact@virtuoushigh.com",
  customLinks: [],
  showProjects: true,
  projectsTitle: "Live Hosted Projects",
  projectsSubtitle: "Active projects hosted directly through PortSide. Open and test in real-time.",
  visibleServices: [],
  projectOverrides: {},
  showCta: true,
  ctaTitle: "Sovereign Local Hosting via PortSide",
  ctaDescription: "Every project listed here is connected directly through PortSide. Zero third-party cloud hosting required.",
  ctaButtonText: "Get PortSide",
  ctaButtonUrl: "https://buymeacoffee.com/pacts",
};

export function getBlankProfile(user?: SafeUser | null): PublicProfile {
  const cleanHandle = (user?.name || user?.email?.split("@")[0] || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

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

  const isPact = user?.email === "pact@virtuoushigh.com";
  const defaultProfile = isPact ? PACT_DEFAULT_PROFILE : getBlankProfile(user);

  const filePath = getProfileFilePath(user?.id);
  let saved: Partial<PublicProfile> = {};

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      saved = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse profile JSON", err);
    }
  }

  let vanityDomain = "";
  if (user?.tier === "supporter") {
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

  const isSupporter = (await isServerSupporter(user).catch(() => false)) || user?.tier === "supporter";
  const handle = vanityDomain ? vanityDomain.split(".")[0] : (saved.handle || defaultProfile.handle);
  const website = vanityDomain ? `https://${vanityDomain}` : (saved.website || (handle ? `https://${handle}.portside.lol` : ""));
  const verifiedBadgeText = isSupporter ? "Verified Supporter" : "Developer";
  const vanityChangesUsed = typeof saved.vanityChangesUsed === "number" ? saved.vanityChangesUsed : 0;
  const extraVanityPurchased = typeof saved.extraVanityPurchased === "number" ? saved.extraVanityPurchased : (isPact ? 999 : 0);

  return {
    ...defaultProfile,
    ...saved,
    handle,
    website,
    verifiedBadgeText,
    vanityChangesUsed,
    extraVanityPurchased,
    projectOverrides: {
      ...defaultProfile.projectOverrides,
      ...(saved.projectOverrides || {}),
    },
  };
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
  const isSupporter = (await isServerSupporter(user).catch(() => false)) || user?.tier === "supporter";
  const isPact = user?.email === "pact@virtuoushigh.com";

  let newHandle = current.handle;
  let vanityChangesUsed = current.vanityChangesUsed || 0;
  const extraVanityPurchased = current.extraVanityPurchased || 0;
  const maxAllowedChanges = 1 + extraVanityPurchased; // 1 free change, extra must be purchased

  // Check if caller is requesting a vanity handle change
  if (typeof data.handle === "string") {
    const rawInput = data.handle.toLowerCase().trim().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    if (rawInput && rawInput !== current.handle) {
      if (!isSupporter && !isPact) {
        throw new Error("Custom vanity subdomains (*.portside.lol) require an active Supporter plan.");
      }

      const RESERVED_HANDLES = new Set([
        "pact",
        "letsmakepact",
        "admin",
        "administrator",
        "api",
        "portside",
        "support",
        "root",
        "auth",
        "billing",
        "app",
        "www",
        "dev",
        "internal",
      ]);
      if (RESERVED_HANDLES.has(rawInput) && !isPact) {
        throw new Error(`The handle '${rawInput}' is reserved by the PortSide platform.`);
      }

      if (rawInput.length < 3) {
        throw new Error("Vanity handle must be at least 3 characters long.");
      }

      // Rule: There should be one vanity change, and the rest cost money
      if (!isPact && vanityChangesUsed >= maxAllowedChanges) {
        throw new Error("You have already used your 1 free vanity change. Additional vanity changes cost money ($5).");
      }

      newHandle = rawInput;
      if (!isPact) {
        vanityChangesUsed += 1;
      }
    }
  }

  // Security: Handle, Website, and Verified Badge are strictly server-managed.
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
