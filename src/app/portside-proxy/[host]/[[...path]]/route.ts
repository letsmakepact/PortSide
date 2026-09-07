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
  const parsedReqUrl = new URL(req.url);
  const searchParams = new URLSearchParams(req.nextUrl.searchParams);
  const isPathProxy =
    searchParams.get("__ps_path") === "1" ||
    parsedReqUrl.searchParams.get("__ps_path") === "1" ||
    req.headers.get("x-portside-path-proxy") === "true";
  searchParams.delete("__ps_path");
  parsedReqUrl.searchParams.delete("__ps_path");
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const target = `${svc.protocol}://127.0.0.1:${svc.port}${rawPath}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "upgrade" && value.toLowerCase() === "websocket") {
      headers.set(key, value);
      headers.set("connection", "Upgrade");
      return;
    }
    if (!HOP_BY_HOP.has(k)) headers.set(key, value);
  });
  headers.set("host", `localhost:${svc.port}`);
  headers.set("x-forwarded-host", req.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", "http");
  headers.set("x-forwarded-by", "portside");
  if (isPathProxy) {
    headers.set("accept-encoding", "identity");
  }

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
        const clientHost = req.headers.get("x-portside-client-host") || `${label}.localhost${portSuffix}`;
        if (isPathProxy) {
          let targetLocation = value.replace(
            new RegExp(`^https?://(?:localhost|127\\.0\\.0\\.1):${svc.port}(/.*)?$`),
            `$1`,
          );
          if (targetLocation.startsWith("/") && !targetLocation.startsWith(`/s/${label}`)) {
            targetLocation = `/s/${label}${targetLocation}`;
          }
          outHeaders.set(key, targetLocation);
        } else {
          const rewritten = value.replace(
            new RegExp(`^https?://(?:localhost|127\\.0\\.0\\.1):${svc.port}(/.*)?$`),
            `http://${clientHost}$1`,
          );
          outHeaders.set(key, rewritten);
        }
        return;
      }
      if (k === "set-cookie" && isPathProxy) {
        const rewrittenCookie = value.replace(/path=\/[^;]*/i, `Path=/s/${label}/`);
        outHeaders.append(key, rewrittenCookie);
        return;
      }
      outHeaders.append(key, value);
    });

    const contentType = upstream.headers.get("content-type") || "";
    if (isPathProxy && contentType.includes("text/html")) {
      let html = await upstream.text();
      // Inject base tag if not already present
      if (!html.includes("<base ") && !html.includes("<base/")) {
        html = html.replace(/<head>/i, `<head><base href="/s/${label}/">`);
      }
      // Inject client-side fetch & XHR interceptor
      const clientPatch = `<script data-portside-runtime="1">(function(){var p="/s/${label}";var of=window.fetch;if(of){window.fetch=function(u,o){if(typeof u==="string"&&u.startsWith("/")&&!u.startsWith(p)&&!u.startsWith("/_next")){u=p+u;}return of.call(this,u,o);};}var oo=XMLHttpRequest.prototype.open;if(oo){XMLHttpRequest.prototype.open=function(m,u){if(typeof u==="string"&&u.startsWith("/")&&!u.startsWith(p)&&!u.startsWith("/_next")){u=p+u;}return oo.apply(this,arguments);};}})();</script>`;
      html = html.replace(/<head>/i, `<head>${clientPatch}`);

      // Rewrite root-relative asset attributes to stay strictly namespaced under /s/:service/
      html = html.replace(/(src|href)=["']\/(assets\/[^"']+)["']/gi, `$1="/s/${label}/$2"`);
      html = html.replace(/(src|href)=["']\/(static\/[^"']+)["']/gi, `$1="/s/${label}/$2"`);
      html = html.replace(/(src|href)=["']\/(favicon\.[^"']+)["']/gi, `$1="/s/${label}/$2"`);
      html = html.replace(/(src|href)=["']\/(logo\.[^"']+)["']/gi, `$1="/s/${label}/$2"`);

      outHeaders.delete("content-length");
      return new Response(html, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: outHeaders,
      });
    }

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
<div style="margin-top:20px;padding-top:16px;border-top:1px solid #1f2a4d;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#64748b">
  <span>Created by <a href="https://github.com/letsmakepact" target="_blank" style="margin:0;padding:0;background:none;color:#818cf8;text-decoration:underline">pact (letsmakepact)</a></span>
  <a href="https://t.me/pactwithdevil" target="_blank" style="margin:0;padding:0;background:none;color:#94a3b8;text-decoration:none">telegram @pactwithdevil</a>
</div>
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