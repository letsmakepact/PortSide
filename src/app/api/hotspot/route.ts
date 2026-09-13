import { requireUser } from "@/lib/auth";
import { isServerSupporter, requireServerSupporter, supporterForbidden } from "@/lib/server-checks";
import { getOrFetchSupporterSession } from "@/lib/supporter-session";
import {
  getHotspotStatus,
  setHotspotActive,
  configureHotspot,
  getCustomHotspotHost,
} from "@/lib/hotspot";

let hotspotActive = false;
let hotspotSsid = "PortSide-DevNet";
let hotspotKey = "portside123";

async function queryLauncherState() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 400);
    const res = await fetch("http://127.0.0.1:4242/api/pro/status", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.hotspotActive === "boolean") {
        hotspotActive = data.hotspotActive;
      }
      if (data.hotspotSsid) {
        hotspotSsid = data.hotspotSsid;
      }
      return data;
    }
  } catch {}
  return null;
}

async function syncWithLauncher(enable?: boolean, ssid?: string, key?: string, userEmail?: string, customHost?: string) {
  try {
    let sessionTicket: string | null = null;
    if (userEmail) {
      const session = await getOrFetchSupporterSession(userEmail);
      if (session.valid) {
        sessionTicket = session.sessionTicket;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch("http://127.0.0.1:4242/api/pro/hotspot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enable, ssid, key, customHost, sessionTicket }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.active === "boolean") {
        hotspotActive = data.active;
      }
      return data;
    }
  } catch {}
  return null;
}

export async function GET() {
  try {
    const user = await requireUser();
    const isSupporter = await isServerSupporter(user);

    let publicTunnelUrl = "";
    if (isSupporter) {
      const launcherData = await queryLauncherState();
      if (launcherData?.publicTunnelUrl) {
        publicTunnelUrl = launcherData.publicTunnelUrl;
      }
    }

    const currentStatus = await getHotspotStatus();
    const customHost = getCustomHotspotHost();

    return Response.json({
      active: isSupporter ? currentStatus.active : false,
      ssid: isSupporter ? currentStatus.ssid : "PortSide-DevNet (Locked)",
      key: isSupporter ? currentStatus.key : "********",
      ip: isSupporter ? currentStatus.ip : null,
      customHost: isSupporter ? customHost : "portside.test",
      connectedDevices: isSupporter && currentStatus.active ? currentStatus.connectedDevices : 0,
      isSupporter,
      serverConfirmed: true,
      mdnsActive: isSupporter,
      publicTunnelUrl,
      qrDataUrl: isSupporter ? currentStatus.qrDataUrl : null,
      directLaunchUrl: isSupporter ? currentStatus.directLaunchUrl : null,
      telemetry: isSupporter ? currentStatus.telemetry : null,
    });
  } catch (e: any) {
    if (e?.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to fetch hotspot state" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let user;
    try {
      user = await requireServerSupporter();
    } catch {
      return supporterForbidden("Server confirmation required: Dev Wi-Fi Hotspot is exclusive to PortSide Supporters.");
    }

    const body = (await req.json().catch(() => ({}))) as {
      active?: boolean;
      ssid?: string;
      key?: string;
      customHost?: string;
    };

    let updatedStatus;
    if (typeof body.active === "boolean") {
      updatedStatus = await setHotspotActive(body.active, body.ssid, body.key, body.customHost);
    } else {
      await configureHotspot(body.ssid, body.key, body.customHost);
      updatedStatus = await getHotspotStatus();
    }

    hotspotActive = updatedStatus.active;
    hotspotSsid = updatedStatus.ssid;
    hotspotKey = updatedStatus.key;

    await syncWithLauncher(body.active, body.ssid, body.key, user.email, body.customHost);

    return Response.json({
      ok: true,
      active: updatedStatus.active,
      ssid: updatedStatus.ssid,
      key: updatedStatus.key,
      customHost: updatedStatus.customHost,
      ip: updatedStatus.ip,
      connectedDevices: updatedStatus.connectedDevices,
      serverConfirmed: true,
      qrDataUrl: updatedStatus.qrDataUrl,
      telemetry: updatedStatus.telemetry,
    });
  } catch (e: any) {
    if (e?.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to update hotspot" }, { status: 500 });
  }
}
