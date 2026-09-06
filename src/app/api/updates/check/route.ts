import { NextResponse } from "next/server";
import packageJson from "@/../package.json";

export const dynamic = "force-dynamic";

const REPO_OWNER = "letsmakepact";
const REPO_NAME = "PortSide";
const CURRENT_VERSION = packageJson.version || "1.0.0";

function parseVersion(v: string) {
  const clean = v.replace(/^v/, "").trim();
  return clean.split(".").map((part) => parseInt(part, 10) || 0);
}

function isNewer(latest: string, current: string): boolean {
  const l = parseVersion(latest);
  const c = parseVersion(current);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const lPart = l[i] ?? 0;
    const cPart = c[i] ?? 0;
    if (lPart > cPart) return true;
    if (lPart < cPart) return false;
  }
  return false;
}

export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Portside-App-UpdateChecker",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({
          currentVersion: CURRENT_VERSION,
          latestVersion: CURRENT_VERSION,
          updateAvailable: false,
          releaseUrl: `https://github.com/letsmakepact/PortSide`,
          exeDownloadUrl: `https://github.com/letsmakepact/PortSide/releases/latest/download/Portside.exe`,
          releaseNotes: "You are running the latest version.",
          publishedAt: new Date().toISOString(),
          checkedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json(
        { error: `GitHub API error: ${res.statusText}`, currentVersion: CURRENT_VERSION, updateAvailable: false },
        { status: 200 }
      );
    }

    const data = await res.json();
    const tagName = data.tag_name || data.name || CURRENT_VERSION;
    const updateAvailable = isNewer(tagName, CURRENT_VERSION);

    const exeAsset = Array.isArray(data.assets)
      ? data.assets.find((a: { name: string; browser_download_url: string }) =>
          a.name.toLowerCase().endsWith(".exe")
        )
      : null;

    const exeDownloadUrl = exeAsset
      ? exeAsset.browser_download_url
      : `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest/download/Portside.exe`;

    return NextResponse.json({
      currentVersion: CURRENT_VERSION,
      latestVersion: tagName.replace(/^v/, ""),
      updateAvailable,
      releaseUrl: data.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${tagName}`,
      exeDownloadUrl,
      releaseNotes: data.body || "A new update is available with enhancements and bug fixes.",
      publishedAt: data.published_at,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      currentVersion: CURRENT_VERSION,
      latestVersion: CURRENT_VERSION,
      updateAvailable: false,
      error: error instanceof Error ? error.message : "Network error checking for updates",
      checkedAt: new Date().toISOString(),
    });
  }
}
