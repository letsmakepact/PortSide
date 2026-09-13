import { NextResponse } from "next/server";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("http://127.0.0.1:4242/api/pro/diagnostics", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        launcherOnline: true,
        ...data,
      });
    }
  } catch {}

  return NextResponse.json({
    launcherOnline: false,
    localPort80Ready: true,
    localPort80Status: "Listening on Port 80 (HTTP 200 OK)",
    edgePort7844Reachable: false,
    edgePort443Reachable: false,
    edgeConnections: 0,
    edgeConnected: false,
    edgeLastError: "Launcher background engine is offline or starting up.",
    vpnActive: false,
    vpnName: "",
    vpnExcluded: false,
    vanityDomain: "",
    publicUrl: "",
    tier: "supporter",
    statusSummary: "Launcher background service not detected on port 4242.",
    canAutoHeal: true,
  });
}

export async function POST() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("http://127.0.0.1:4242/api/pro/heal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        launcherOnline: true,
        ...data,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        launcherOnline: false,
        success: false,
        error: "Launcher background service unavailable: " + (err?.message || "Unknown error"),
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      launcherOnline: false,
      success: false,
      error: "Could not execute self-healing sequence on launcher.",
    },
    { status: 500 }
  );
}
