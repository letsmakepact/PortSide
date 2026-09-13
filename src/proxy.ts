import { NextRequest, NextResponse } from "next/server";
import { getCustomHotspotHost } from "@/lib/hotspot";

interface CachedHostVerification {
  known: boolean;
  expiresAt: number;
}

const clientHostCache = new Map<string, CachedHostVerification>();
const CLIENT_POSITIVE_TTL_MS = 10 * 60 * 1000;
const CLIENT_NEGATIVE_TTL_MS = 30 * 1000;

const PORTSIDE_SYSTEM_ROUTES = [
  "/",
  "/dashboard",
  "/profile",
  "/lan",
  "/docs",
  "/login",
  "/register",
  "/api",
  "/auth",
  "/portside-proxy",
  "/about",
  "/@me",
];

const PORTSIDE_STATIC_FILES = new Set([
  "/favicon.ico",
  "/favicon.svg",
  "/icon.svg",
  "/icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon.png",
  "/apple-touch-icon.png",
  "/og.png",
  "/anchor.png",
  "/bright_anchor.png",
  "/portside.png",
  "/portside-256.png",
  "/portside-512.png",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

async function verifyHostWithServer(hostname: string): Promise<boolean> {
  const cached = clientHostCache.get(hostname);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.known;
  }

  if (
    hostname === "portside.lol" ||
    hostname === "www.portside.lol" ||
    hostname === "app.portside.lol" ||
    hostname === "api.portside.lol" ||
    hostname === "pact.portside.lol" ||
    hostname.endsWith(".pact.portside.lol") ||
    hostname.endsWith(".vercel.app")
  ) {
    clientHostCache.set(hostname, {
      known: true,
      expiresAt: Date.now() + CLIENT_POSITIVE_TTL_MS,
    });
    return true;
  }

  const serverEndpoints = [
    "https://www.portside.lol",
    "https://portside.lol",
    "https://portside-theta.vercel.app",
  ];

  for (const base of serverEndpoints) {
    try {
      const res = await fetch(`${base}/api/host/verify?host=${encodeURIComponent(hostname)}`, {
        signal: AbortSignal.timeout(3500),
        redirect: "follow",
        headers: {
          "user-agent": "PortSide-Proxy/1.1.0",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const isKnown = Boolean(data.known);
        clientHostCache.set(hostname, {
          known: isKnown,
          expiresAt: Date.now() + (isKnown ? CLIENT_POSITIVE_TTL_MS : CLIENT_NEGATIVE_TTL_MS),
        });
        return isKnown;
      } else if (res.status === 403) {
        clientHostCache.set(hostname, {
          known: false,
          expiresAt: Date.now() + CLIENT_NEGATIVE_TTL_MS,
        });
        return false;
      }
    } catch {}
  }

  return false;
}

let cachedSupporterStatus: { isSupporter: boolean; expiresAt: number } | null = null;

async function verifySupporterStatus(): Promise<boolean> {
  if (cachedSupporterStatus && cachedSupporterStatus.expiresAt > Date.now()) {
    return cachedSupporterStatus.isSupporter;
  }

  // 1. Direct memory check for live cryptographically verified session payload
  if (
    typeof global !== "undefined" &&
    (global as any).__PORTSIDE_LIVE_SESSION_PAYLOAD__ &&
    (global as any).__PORTSIDE_LIVE_SESSION_PAYLOAD__.expiresAt > Date.now() &&
    (global as any).__PORTSIDE_LIVE_SESSION_PAYLOAD__.tier === "supporter"
  ) {
    cachedSupporterStatus = { isSupporter: true, expiresAt: Date.now() + 60 * 1000 };
    return true;
  }

  // 2. Query native core launcher daemon on port 4242
  try {
    const launcherRes = await fetch("http://127.0.0.1:4242/api/pro/status", {
      signal: AbortSignal.timeout(400),
    });
    if (launcherRes.ok) {
      const data = await launcherRes.json();
      if (data.tier === "supporter" || data.isSupporter) {
        cachedSupporterStatus = { isSupporter: true, expiresAt: Date.now() + 60 * 1000 };
        return true;
      }
    }
  } catch {}

  cachedSupporterStatus = { isSupporter: false, expiresAt: Date.now() + 15 * 1000 };
  return false;
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  return res;
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const hostname = host.split(":")[0];
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/favicon") ||
    PORTSIDE_STATIC_FILES.has(pathname)
  ) {
    return withSecurityHeaders(NextResponse.next());
  }

  const origin = request.headers.get("origin");
  const customHost = getCustomHotspotHost().toLowerCase();
  const isCustomHost =
    Boolean(customHost) &&
    (hostname === customHost || hostname.endsWith(`.${customHost}`));
  const isDevTld =
    hostname.endsWith(".portside") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".lan");

  if (origin && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    try {
      const originHost = new URL(origin).hostname.toLowerCase();
      const isAllowedOrigin =
        originHost === "localhost" ||
        originHost === "127.0.0.1" ||
        originHost === "::1" ||
        originHost.endsWith(".localhost") ||
        originHost.endsWith(".local") ||
        originHost.endsWith(".portside") ||
        originHost.endsWith(".test") ||
        originHost.endsWith(".lan") ||
        (Boolean(customHost) && (originHost === customHost || originHost.endsWith(`.${customHost}`))) ||
        originHost === hostname ||
        originHost === "portside.lol" ||
        originHost === "www.portside.lol" ||
        originHost === "app.portside.lol";

      if (!isAllowedOrigin) {
        return withSecurityHeaders(
          new NextResponse(
            JSON.stringify({ error: "Cross-Origin Request Blocked by PortSide Security Shield." }),
            { status: 403, headers: { "content-type": "application/json" } }
          )
        );
      }
    } catch {
      return withSecurityHeaders(
        new NextResponse(
          JSON.stringify({ error: "Invalid Origin header." }),
          { status: 403, headers: { "content-type": "application/json" } }
        )
      );
    }
  }

  const isPortsideApex = hostname === "portside.lol" || hostname === "www.portside.lol";
  const isPortsideVanitySubdomain = hostname.endsWith(".portside.lol") && !isPortsideApex && hostname !== "app.portside.lol";

  if (isPortsideVanitySubdomain) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/api/services") ||
      pathname.startsWith("/api/hotspot") ||
      pathname.startsWith("/api/updates")
    ) {
      return withSecurityHeaders(
        new NextResponse(
          JSON.stringify({ error: "Access Denied: Control plane and service configuration are restricted to local loopback." }),
          { status: 403, headers: { "content-type": "application/json" } }
        )
      );
    }
  }

  const isLocalNetwork =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "host.docker.internal" ||
    hostname === "gateway.docker.internal" ||
    hostname.endsWith(".host.docker.internal") ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".portside") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".lan") ||
    isCustomHost ||
    /\.(?:nip\.io|sslip\.io)$/.test(hostname) ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("127.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

  if (!isLocalNetwork) {
    const isAuthorized = await verifyHostWithServer(hostname);
    if (!isAuthorized) {
      return withSecurityHeaders(
        new NextResponse("Forbidden: Host not recognized by PortSide official server.", { status: 403 })
      );
    }
  }

  const isSystemPath = PORTSIDE_SYSTEM_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  if (hostname.endsWith(".local") && !isSystemPath && pathname !== "/") {
    const isSupporter = await verifySupporterStatus();
    if (!isSupporter) {
      return withSecurityHeaders(
        new NextResponse(
          "Forbidden: *.local mDNS routing is reserved for verified PortSide Supporters.",
          { status: 403 }
        )
      );
    }
  }

  if ((isCustomHost || isDevTld) && !isSystemPath && pathname !== "/") {
    const isSupporter = await verifySupporterStatus();
    if (!isSupporter) {
      return withSecurityHeaders(
        new NextResponse(
          "Forbidden: Custom host and local dev TLD routing (*.portside, *.test, *.lan) is reserved for verified PortSide Supporters.",
          { status: 403 }
        )
      );
    }
  }

  if (pathname.startsWith("/portside-proxy")) {
    return withSecurityHeaders(new NextResponse("Not found", { status: 404 }));
  }

  let label: string | null = null;
  let targetPath = pathname;
  let isPathProxy = false;

  if (pathname.startsWith("/s/")) {
    const segments = pathname.slice(3).split("/");
    label = segments[0]?.toLowerCase() || null;
    const rest = segments.slice(1).join("/");
    targetPath = rest ? `/${rest}` : "/";
    isPathProxy = true;
  }

  if (!label) {
    const localhostMatch = hostname.match(/^([a-z0-9-]+)\.localhost$/);
    if (localhostMatch) {
      label = localhostMatch[1];
    }
  }

  if (!label) {
    const dockerMatch = hostname.match(/^([a-z0-9-]+)\.host\.docker\.internal$/);
    if (dockerMatch) {
      label = dockerMatch[1];
    }
  }

  if (!label) {
    const serviceHeader = request.headers.get("x-portside-service")?.toLowerCase();
    if (serviceHeader && /^[a-z0-9-]+$/.test(serviceHeader)) {
      label = serviceHeader;
    }
  }

  if (!label) {
    const wildcardMatch = hostname.match(/^([a-z0-9-]+)\.(?:[0-9.-]+\.)?(?:nip\.io|sslip\.io)$/);
    if (wildcardMatch) {
      label = wildcardMatch[1];
    }
  }

  if (!label) {
    const localDomainMatch = hostname.match(/^([a-z0-9-]+)(?:\.[^.]+)?\.local$/);
    if (localDomainMatch) {
      label = localDomainMatch[1];
    }
  }

  if (!label) {
    const portsideSubdomainMatch = hostname.match(/^([a-z0-9-]+)\.[a-z0-9-]+\.portside\.lol$/);
    if (portsideSubdomainMatch) {
      label = portsideSubdomainMatch[1];
    }
  }

  if (!label && isCustomHost) {
    const escaped = customHost.replace(/\./g, "\\.");
    const customRegex = new RegExp(`^([a-z0-9-]+)\\.${escaped}$`, "i");
    const customMatch = hostname.match(customRegex);
    if (customMatch) {
      label = customMatch[1];
    }
  }

  if (!label) {
    const devTldMatch = hostname.match(/^([a-z0-9-]+)\.(?:portside|test|lan)$/i);
    if (devTldMatch) {
      label = devTldMatch[1];
    }
  }

  if (!label) {
    if (!isSystemPath) {
      const referer = request.headers.get("referer");
      if (referer) {
        try {
          const refUrl = new URL(referer);
          const refMatch = refUrl.pathname.match(/^\/s\/([a-z0-9-]+)(?:\/|$)/i);
          if (refMatch) {
            label = refMatch[1].toLowerCase();
            targetPath = pathname;
          } else {
            const refHostMatch = refUrl.hostname.match(
              /^([a-z0-9-]+)\.(?:localhost|local|[a-z0-9-]+\.portside\.lol|(?:[0-9.-]+\.)?(?:nip|sslip)\.io)$/i
            );
            if (refHostMatch && refHostMatch[1] !== "www" && refHostMatch[1] !== "app") {
              label = refHostMatch[1].toLowerCase();
              targetPath = pathname;
            }
          }
        } catch {}
      }

      if (!label) {
        const isSpaAsset =
          pathname.startsWith("/assets/") ||
          pathname.startsWith("/static/") ||
          /\.(?:js|mjs|cjs|css|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|json|map)$/i.test(pathname);

        if (isSpaAsset) {
          const cookieService = request.cookies.get("portside_active_service")?.value;
          if (cookieService && /^[a-z0-9-]+$/.test(cookieService)) {
            label = cookieService.toLowerCase();
            targetPath = pathname;
          }
        }
      }
    }
  }

  if (!label && PORTSIDE_STATIC_FILES.has(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (!label && (pathname === "/about" || pathname === "/@me")) {
    const profileUrl = request.nextUrl.clone();
    profileUrl.protocol = "http:";
    profileUrl.pathname = "/profile";
    return withSecurityHeaders(NextResponse.rewrite(profileUrl));
  }

  const isRawIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isTryCloudflare = hostname.endsWith(".trycloudflare.com");

  if (!label && pathname === "/") {
    if (isPortsideVanitySubdomain) {
      const profileUrl = request.nextUrl.clone();
      profileUrl.protocol = "http:";
      profileUrl.pathname = "/profile";
      return withSecurityHeaders(NextResponse.rewrite(profileUrl));
    }
    if (isRawIp || isTryCloudflare || (customHost && hostname === customHost) || hostname === "portside" || hostname === "portside.test" || hostname === "portside.lan") {
      const lanUrl = request.nextUrl.clone();
      lanUrl.pathname = "/lan";
      return withSecurityHeaders(NextResponse.redirect(lanUrl));
    }
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/dashboard";
      return withSecurityHeaders(NextResponse.redirect(dashUrl));
    }
  }

  if (!label || label === "www" || label === "app" || label === "router" || label === "portside") {
    if (label === "router" || label === "portside") {
      const destUrl = request.nextUrl.clone();
      destUrl.pathname = (hostname.endsWith(".localhost") || hostname === "localhost") ? "/dashboard" : "/lan";
      return withSecurityHeaders(NextResponse.rewrite(destUrl));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  const url = request.nextUrl.clone();
  url.protocol = "http:";
  url.pathname = `/portside-proxy/${label}${targetPath === "/" ? "" : targetPath}`;
  if (isPathProxy) {
    url.searchParams.set("__ps_path", "1");
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-portside-original-path", targetPath);
  requestHeaders.set("x-portside-client-host", host);
  if (isPortsideVanitySubdomain) {
    requestHeaders.set("x-portside-public-tunnel", "true");
  }
  if (isPathProxy) {
    requestHeaders.set("x-portside-path-proxy", "true");
  }

  const response = NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set("portside_active_service", label, {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
  });

  return withSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],
};
