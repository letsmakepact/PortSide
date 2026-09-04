import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";

export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "accept-encoding",
]);

type Ctx = { params: Promise<{ host: string; path?: string[] }> };

async function handle(req: NextRequest, ctx: Ctx) {
  const { host, path = [] } = await ctx.params;
  const label = host.toLowerCase();

  const [svc] = await db.select().from(services).where(eq(services.hostname, label)).limit(1);

  if (!svc) {
    return errorPage(
      404,
      `${label}.localhost isn't registered`,
      "Add it in the Portside dashboard and it will start routing immediately.",
      label,
    );
  }
  if (!svc.enabled) {
    return errorPage(
      503,
      `${label}.localhost is paused`,
      `The route to port ${svc.port} is disabled. Enable it from the dashboard to resume traffic.`,
      label,
    );
  }

  const rawPath = req.headers.get("x-portside-original-path") || (path.length ? `/${path.map(encodeURIComponent).join("/")}` : "/");
  const search = req.nextUrl.search;
  const target = `${svc.protocol}://127.0.0.1:${svc.port}${rawPath}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("host", `localhost:${svc.port}`);
  headers.set("x-forwarded-host", req.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", "http");
  headers.set("x-forwarded-by", "portside");

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const init: RequestInit & { duplex?: "half" } = {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      redirect: "manual",
      signal: controller.signal,
      duplex: "half",
    };
    const upstream = await fetch(target, init);

    const outHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "content-encoding" || k === "content-length" || k === "transfer-encoding" || k === "connection") return;
      if (k === "location") {
        const appPort = process.env.PORT ?? "3000";
        const portSuffix = appPort === "80" ? "" : `:${appPort}`;
        const rewritten = value.replace(
          new RegExp(`^https?://(?:localhost|127\\.0\\.0\\.1):${svc.port}(/.*)?$`),
          `http://${label}.localhost${portSuffix}$1`,
        );
        outHeaders.set(key, rewritten);
        return;
      }
      outHeaders.append(key, value);
    });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  } catch {
    return errorPage(
      502,
      `${label}.localhost is offline`,
      `Nothing is listening on port ${svc.port}. Start "${svc.name}" and refresh this page.`,
      label,
    );
  } finally {
    clearTimeout(timer);
  }
}

function errorPage(status: number, title: string, body: string, label: string) {
  const port = process.env.PORT ?? "3000";
  const dashboard = `http://localhost${port === "80" ? "" : `:${port}`}/dashboard/services`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1020;color:#e2e8f0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.card{max-width:520px;padding:40px;border-radius:24px;background:#111832;border:1px solid #1f2a4d;box-shadow:0 30px 80px rgba(0,0,0,.4)}
.badge{display:inline-flex;align-items:center;gap:8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#a5b4fc;font-weight:600}
.badge i{width:8px;height:8px;border-radius:99px;background:#f43f5e;display:inline-block}
h1{margin:16px 0 8px;font-size:26px;font-weight:600;color:#fff}
p{margin:0;color:#94a3b8;line-height:1.6}
code{background:#0b1020;padding:2px 6px;border-radius:6px;color:#c7d2fe}
a{display:inline-block;margin-top:24px;color:#fff;background:#4f46e5;padding:10px 16px;border-radius:12px;text-decoration:none;font-weight:500}
</style></head><body><div class="card">
<span class="badge"><i></i> Portside · ${status}</span>
<h1>${title}</h1><p>${body}</p>
<p style="margin-top:12px;font-size:13px">Route: <code>${label}.localhost</code></p>
<a href="${dashboard}">Open dashboard</a>
</div></body></html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "x-portside": "error" },
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;