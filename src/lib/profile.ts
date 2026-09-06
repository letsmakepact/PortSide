import fs from "fs";
import path from "path";
import os from "os";
import { listLanServices } from "./queries";

export interface PublicProfile {
  handle: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  location: string;
  skills: string[];
  github: string;
  twitter: string;
  buymeacoffee: string;
  website: string;
  visibleServices: string[]; // empty means all enabled services are visible
  customLinks: { label: string; url: string }[];
  updatedAt?: string;
}

const DEFAULT_PROFILE: PublicProfile = {
  handle: "pact",
  name: "pact",
  title: "Full-Stack Developer & Systems Architect",
  bio: "Building sovereign local infrastructure, distributed network routing, and modern web applications. Powered by PortSide.",
  avatarUrl: "https://github.com/letsmakepact.png",
  location: "Global / Remote",
  skills: ["TypeScript", "Next.js", "Go", "Cloudflare", "Tailwind CSS", "PostgreSQL", "Edge Tunnels"],
  github: "https://github.com/letsmakepact",
  twitter: "https://x.com/pactwithdevil",
  buymeacoffee: "https://buymeacoffee.com/pacts",
  website: "https://pact.portside.lol",
  visibleServices: [],
  customLinks: [],
};

function getProfileFilePath(): string {
  const home = os.homedir();
  const dir = path.join(home, "Portside");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, "profile.json");
}

export async function getProfile(): Promise<PublicProfile> {
  const filePath = getProfileFilePath();
  let saved: Partial<PublicProfile> = {};

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      saved = JSON.parse(content);
    } catch {}
  }

  // Fetch launcher status to sync vanity domain or supporter handle if available
  let vanityDomain = "";
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

  const handle = saved.handle || (vanityDomain ? vanityDomain.split(".")[0] : DEFAULT_PROFILE.handle);

  return {
    ...DEFAULT_PROFILE,
    ...saved,
    handle,
    website: saved.website || (vanityDomain ? `https://${vanityDomain}` : DEFAULT_PROFILE.website),
  };
}

export async function saveProfile(data: Partial<PublicProfile>): Promise<PublicProfile> {
  const current = await getProfile();
  const updated: PublicProfile = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const filePath = getProfileFilePath();
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
