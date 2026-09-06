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

  // If not confirmed by the server as a supporter, do not compute or expose mobile/TV routing or QR codes
  if (!isSupporter) {
    return NextResponse.json({
      lanIp,
      port,
      portalUrl: "",
      urls: null,
      qrDataUrl: "",
      qrTarget: "",
      isSupporter: false,
      serverConfirmed: true,
      requiresSupporter: true,
      error: "Server confirmation required: Mobile & Smart TV LAN routing is a PortSide Supporter perk.",
    });
  }

  const urls = hostname ? getLanUrls(hostname, port, lanIp) : null;
  const portalUrl = `http://${lanIp}${port === "80" || port === "443" ? "" : `:${port}`}/lan`;

  // Generate server-signed pairing token so mobile/TV pairing cannot be spoofed
  let pairToken: string | null = null;
  const supporterEmail = user?.email || global.__PORTSIDE_LIVE_SESSION_PAYLOAD__?.email;
  if (supporterEmail) {
    const pairRes = await requestPairToken(supporterEmail);
    if (pairRes.valid) {
      pairToken = pairRes.pairToken;
    }
  }

  let publicTunnelUrl = "";
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
    }
  } catch {}

  const mode = searchParams.get("mode") || (publicTunnelUrl ? "tunnel" : "lan");
  let qrTarget = target;
  if (!qrTarget) {
    if (mode === "tunnel" && publicTunnelUrl) {
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
    qrDataUrl = await QRCode.toDataURL(qrTarget, {
      margin: 2,
      width: 280,
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
    urls,
    qrDataUrl,
    qrTarget,
    pairToken,
    isSupporter: true,
    serverConfirmed: true,
  });
}
