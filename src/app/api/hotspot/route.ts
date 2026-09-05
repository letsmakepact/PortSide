import { requireUser } from "@/lib/auth";
import { isServerSupporter, requireServerSupporter, supporterForbidden } from "@/lib/server-checks";

// Hotspot state in memory for active runtime
let hotspotActive = false;
let hotspotSsid = "PortSide-DevNet";
let hotspotKey = "portside123";

export async function GET() {
  try {
    const user = await requireUser();
    const isSupporter = await isServerSupporter(user);

    return Response.json({
      active: isSupporter ? hotspotActive : false,
      ssid: isSupporter ? hotspotSsid : "PortSide-DevNet (Locked)",
      key: isSupporter ? hotspotKey : "********",
      ip: isSupporter ? "192.168.137.1" : null,
      connectedDevices: isSupporter && hotspotActive ? 1 : 0,
      isSupporter,
      serverConfirmed: true,
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

    return Response.json({
      ok: true,
      active: hotspotActive,
      ssid: hotspotSsid,
      key: hotspotKey,
      ip: "192.168.137.1",
      connectedDevices: hotspotActive ? 1 : 0,
    });
  } catch (e: any) {
    if (e?.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to update hotspot" }, { status: 500 });
  }
}
