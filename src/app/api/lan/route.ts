import { NextResponse } from "next/server";
import { getLanIp, getLanUrls } from "@/lib/lan";
import QRCode from "qrcode";
import { getCurrentUser } from "@/lib/auth";
import { isServerSupporter } from "@/lib/server-checks";
import { requestPairToken } from "@/lib/supporter-session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const isSupporter = await isServerSupporter(user);
  const { searchParams } = new URL(req.url);
  const hostname = searchParams.get("hostname") || "";
  const target = searchParams.get("target") || "";
  const requestedDomain = searchParams.get("domain")?.trim() || "";

  const lanIp = getLanIp();
  const port = process.env.PORT || "80";

  const rawUrls = hostname ? getLanUrls(hostname, port, lanIp) : null;
  const portalUrl = `http://${lanIp}${port === "80" || port === "443" ? "" : `:${port}`}/lan`;

  // Server-level security: strictly omit .local URLs for non-supporters
  const urls = rawUrls
    ? {
        lanIp: rawUrls.lanIp,
        directUrl: rawUrls.directUrl,
        portalUrl: rawUrls.portalUrl,
        subdomainUrl: rawUrls.subdomainUrl,
        localMdnsUrl: isSupporter ? rawUrls.localMdnsUrl : null,
        portalLocalUrl: isSupporter ? rawUrls.portalLocalUrl : null,
      }
    : null;

  // Optional server-signed pairing token if supporter session is present
  let pairToken: string | null = null;
  const supporterEmail = isSupporter && user?.email ? user.email : null;
  if (supporterEmail) {
    try {
      const pairRes = await requestPairToken(supporterEmail);
      if (pairRes.valid) {
        pairToken = pairRes.pairToken;
      }
    } catch {}
  }

  let publicTunnelUrl = "";
  let vanityDomain = "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 400);
    const launcherRes = await fetch("http://127.0.0.1:4242/api/pro/status", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (launcherRes.ok) {
      const data = await launcherRes.json();
      if (data.publicTunnelUrl) {
        publicTunnelUrl = data.publicTunnelUrl;
      }
      if (data.vanityDomain) {
        vanityDomain = data.vanityDomain;
      }
    }
  } catch {}

  // Supporter domain resolution: guaranteed portside.lol domain ONLY for supporters
  if (isSupporter && !vanityDomain) {
    if (requestedDomain) {
      vanityDomain = requestedDomain.includes(".") ? requestedDomain : `${requestedDomain}.portside.lol`;
    } else {
      const handle = (user?.name || user?.email?.split("@")[0] || "pact")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");
      vanityDomain = `${handle || "pact"}.portside.lol`;
    }
    if (!publicTunnelUrl) {
      publicTunnelUrl = `https://${vanityDomain}`;
    }
  }

  // Non-supporters do not get vanity domain or custom 5G tunnel
  if (!isSupporter) {
    vanityDomain = "";
    publicTunnelUrl = "";
  }

  const brandedUrl = vanityDomain ? `https://${vanityDomain}` : "";
  const mode = searchParams.get("mode") || "lan";
  const hasCustomUrl = Boolean(vanityDomain || publicTunnelUrl);
  const requiresCustomUrl = mode === "tunnel" && !hasCustomUrl;

  let qrTarget = target;
  if (!qrTarget) {
    if (mode === "tunnel" || mode === "branded") {
      if (isSupporter && (brandedUrl || publicTunnelUrl)) {
        const baseUrl = brandedUrl || publicTunnelUrl;
        qrTarget = hostname ? `${baseUrl}/s/${hostname}` : `${baseUrl}/lan`;
        if (pairToken) {
          const delimiter = qrTarget.includes("?") ? "&" : "?";
          qrTarget = `${qrTarget}${delimiter}pst=${encodeURIComponent(pairToken)}`;
        }
      } else {
        qrTarget = "";
      }
    } else {
      // Local Wi-Fi (lan) mode: Supporter gets .local iOS resolution; non-supporter gets direct IP URL
      if (isSupporter && rawUrls?.localMdnsUrl) {
        qrTarget = hostname ? rawUrls.localMdnsUrl : rawUrls.portalLocalUrl || portalUrl;
      } else {
        qrTarget = rawUrls ? rawUrls.directUrl || rawUrls.subdomainUrl : portalUrl;
      }
    }
  }

  let qrDataUrl = "";
  if (qrTarget) {
    try {
      qrDataUrl = await QRCode.toDataURL(qrTarget, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 320,
        color: {
          dark: "#0369a1",
          light: "#ffffff",
        },
      });
    } catch {}
  }

  return NextResponse.json({
    lanIp,
    port,
    portalUrl,
    publicTunnelUrl,
    vanityDomain,
    brandedUrl,
    urls,
    qrDataUrl,
    qrTarget,
    pairToken,
    requiresCustomUrl,
    isSupporter: Boolean(isSupporter),
    serverConfirmed: true,
  });
}
