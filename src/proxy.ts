import { NextRequest, NextResponse } from "next/server";

interface CachedHostVerification {
  known: boolean;
  expiresAt: number;
}

const clientHostCache = new Map<string, CachedHostVerification>();
const CLIENT_POSITIVE_TTL_MS = 10 * 60 * 1000; // 10 minutes for verified hosts
const CLIENT_NEGATIVE_TTL_MS = 30 * 1000;      // 30 seconds for rejected hosts

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

  // 1. Authoritative Sovereign & Creator fast-path (0ms, offline-resilient)
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

  // 2. Ask authoritative sovereign server endpoints
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

  try {
    const res = await fetch("http://127.0.0.1/api/lan?mode=lan", {
      signal: AbortSignal.timeout(1500),
      headers: {
        "user-agent": "PortSide-Internal-Proxy",
      },
    });
    if (res.ok) {
      const data = await res.json();
      const confirmed = Boolean(data.isSupporter);
      cachedSupporterStatus = {
        isSupporter: confirmed,
        expiresAt: Date.now() + 60 * 1000,
      };
      return confirmed;
    }
  } catch {}

  return false;
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const hostname = host.split(":")[0];
  const { pathname } = request.nextUrl;

  // Static assets & internal Next.js resources fast bypass (prevents 502 Bad Gateway)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/favicon") ||
    PORTSIDE_STATIC_FILES.has(pathname)
  ) {
    return NextResponse.next();
  }

  // 1. Fast-path local network addresses (0ms latency, works offline)
  const isLocalNetwork =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    /\.(?:nip\.io|sslip\.io)$/.test(hostname) ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("127.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

  if (!isLocalNetwork) {
    // 2. Authoritative check: ask official server if this host is recognized and authorized
    const isAuthorized = await verifyHostWithServer(hostname);
    if (!isAuthorized) {
      return new NextResponse("Forbidden: Host not recognized by PortSide official server.", { status: 403 });
    }
  }

  // 3. Server-level enforcement for .local mDNS routing: only authorized Supporters can route .local
  if (hostname.endsWith(".local")) {
    const isSupporter = await verifySupporterStatus();
    if (!isSupporter) {
      return new NextResponse(
        "Forbidden: *.local mDNS routing is reserved for verified PortSide Supporters.",
        { status: 403 }
      );
    }
  }

  if (pathname.startsWith("/portside-proxy")) {
    return new NextResponse("Not found", { status: 404 });
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

  // Fallback for Single Page Apps (SPA) requesting root-relative assets (/assets/..., /logo.svg, etc.)
  if (!label) {
    const isSystemPath = PORTSIDE_SYSTEM_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(`${r}/`)
    );
    if (!isSystemPath) {
      // 1. Inspect Referer header
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

      // 2. Active service cookie fallback for sub-resources & dynamic module imports (/assets/*, *.js, *.css, etc.)
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
    return NextResponse.next();
  }

  if (!label && (pathname === "/about" || pathname === "/@me")) {
    const profileUrl = request.nextUrl.clone();
    profileUrl.pathname = "/profile";
    return NextResponse.rewrite(profileUrl);
  }

  const isRawIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isPortsideApex = hostname === "portside.lol" || hostname === "www.portside.lol";
  const isPortsideVanitySubdomain = hostname.endsWith(".portside.lol") && !isPortsideApex && hostname !== "app.portside.lol";
  const isTryCloudflare = hostname.endsWith(".trycloudflare.com");

  if (!label && pathname === "/") {
    if (isPortsideVanitySubdomain) {
      const profileUrl = request.nextUrl.clone();
      profileUrl.pathname = "/profile";
      return NextResponse.rewrite(profileUrl);
    }
    if (isRawIp || isTryCloudflare) {
      const lanUrl = request.nextUrl.clone();
      lanUrl.pathname = "/lan";
      return NextResponse.redirect(lanUrl);
    }
  }

  if (!label || label === "www" || label === "app") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/portside-proxy/${label}${targetPath === "/" ? "" : targetPath}`;
  if (isPathProxy) {
    url.searchParams.set("__ps_path", "1");
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-portside-original-path", targetPath);
  requestHeaders.set("x-portside-client-host", host);
  if (isPathProxy) {
    requestHeaders.set("x-portside-path-proxy", "true");
  }

  const response = NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });

  // Track active service in cookie so subsequent dynamic chunk imports & assets resolve cleanly
  response.cookies.set("portside_active_service", label, {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],
};
