import { NextResponse } from "next/server";
import { getLanIp, getLanUrls } from "@/lib/lan";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hostname = searchParams.get("hostname") || "";
  const target = searchParams.get("target") || "";

  const lanIp = getLanIp();
  const port = process.env.PORT || "80";
  const urls = hostname ? getLanUrls(hostname, port, lanIp) : null;
  const portalUrl = `http://${lanIp}${port === "80" || port === "443" ? "" : `:${port}`}/lan`;

  let qrDataUrl = "";
  const qrTarget = target || (urls ? urls.subdomainUrl : portalUrl);

  try {
    qrDataUrl = await QRCode.toDataURL(qrTarget, {
      margin: 2,
      width: 280,
      color: {
        dark: "#0369a1",
        light: "#ffffff",
      },
    });
  } catch {
  }

  return NextResponse.json({
    lanIp,
    port,
    portalUrl,
    urls,
    qrDataUrl,
    qrTarget,
  });
}
