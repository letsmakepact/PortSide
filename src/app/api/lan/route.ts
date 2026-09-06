import { NextResponse } from "next/server";
import { getLanIp, getLanUrls } from "@/lib/lan";
import QRCode from "qrcode";
import { getCurrentUser } from "@/lib/auth";
import { isServerSupporter } from "@/lib/server-checks";
import { requestPairToken } from "@/lib/supporter-session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const isSupporter = await isServerSupporter(user);
  const { searchParams } = new URL(req.url);
  const hostname = searchParams.get("hostname") || "";
  const target = searchParams.get("target") || "";

  const lanIp = getLanIp();
  const port = process.env.PORT || "80";

  // Mobile & Smart TV LAN routing is a standard core feature in the public version
  const urls = hostname ? getLanUrls(hostname, port, lanIp) : null;
  const portalUrl = `http://${lanIp}${port === "80" || port === "443" ? "" : `:${port}`}/lan`;

  // Optional server-signed pairing token if supporter session is present
  let pairToken: string | null = null;
  const supporterEmail = user?.email || (global as any).__PORTSIDE_LIVE_SESSION_PAYLOAD__?.email;
  if (supporterEmail) {
    const pairRes = await requestPairToken(supporterEmail);
    if (pairRes.valid) {
      pairToken = pairRes.pairToken;
    }
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

  const brandedUrl = vanityDomain ? `https://${vanityDomain}` : "";
  const mode = searchParams.get("mode") || (brandedUrl ? "branded" : publicTunnelUrl ? "tunnel" : "lan");
  let qrTarget = target;
  if (!qrTarget) {
    if (mode === "branded" && brandedUrl) {
      qrTarget = hostname ? `${brandedUrl}/s/${hostname}` : `${brandedUrl}/lan`;
    } else if (mode === "tunnel" && publicTunnelUrl) {
      qrTarget = hostname ? `${publicTunnelUrl}/s/${hostname}` : `${publicTunnelUrl}/lan`;
    } else {
      qrTarget = urls ? urls.subdomainUrl : portalUrl;
    }
  }

  if (pairToken) {
    const delimiter = qrTarget.includes("?") ? "&" : "?";
    qrTarget = `${qrTarget}${delimiter}pst=${encodeURIComponent(pairToken)}`;
  }

  let qrDataUrl = "";
  try {
    // Generate high-resolution QR with Error Correction Level 'H' (30% redundancy)
    // to ensure instantaneous phone camera scannability with the center PortSide anchor emblem
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
    isSupporter: Boolean(isSupporter),
    serverConfirmed: true,
  });
}
