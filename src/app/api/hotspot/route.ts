import { requireUser } from "@/lib/auth";
import { isServerSupporter, requireServerSupporter, supporterForbidden } from "@/lib/server-checks";
import { getOrFetchSupporterSession } from "@/lib/supporter-session";

// Hotspot state in memory for active runtime
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

async function syncWithLauncher(enable?: boolean, ssid?: string, key?: string, userEmail?: string) {
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
      body: JSON.stringify({ enable, ssid, key, sessionTicket }),
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

    if (isSupporter) {
      await queryLauncherState();
    }

    return Response.json({
      active: isSupporter ? hotspotActive : false,
      ssid: isSupporter ? hotspotSsid : "PortSide-DevNet (Locked)",
      key: isSupporter ? hotspotKey : "********",
      ip: isSupporter ? "192.168.x.x" : null,
      connectedDevices: isSupporter && hotspotActive ? 1 : 0,
      isSupporter,
      serverConfirmed: true,
      mdnsActive: isSupporter, // Zero-config LAN active by default
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
    };

    if (body.ssid) hotspotSsid = body.ssid.trim().slice(0, 32);
    if (body.key && body.key.length >= 8) hotspotKey = body.key;
    if (typeof body.active === "boolean") {
      hotspotActive = body.active;
    }

    await syncWithLauncher(body.active, body.ssid, body.key, user.email);

    return Response.json({
      ok: true,
      active: hotspotActive,
      ssid: hotspotSsid,
      key: hotspotKey,
      ip: "192.168.x.x",
      connectedDevices: hotspotActive ? 1 : 0,
      serverConfirmed: true,
    });
  } catch (e: any) {
    if (e?.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to update hotspot" }, { status: 500 });
  }
}
