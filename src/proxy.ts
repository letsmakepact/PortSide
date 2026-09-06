import { NextRequest, NextResponse } from "next/server";

interface CachedHostVerification {
  known: boolean;
  expiresAt: number;
}

const clientHostCache = new Map<string, CachedHostVerification>();
const CLIENT_POSITIVE_TTL_MS = 10 * 60 * 1000; // 10 minutes for verified hosts
const CLIENT_NEGATIVE_TTL_MS = 30 * 1000;      // 30 seconds for rejected hosts

async function verifyHostWithServer(hostname: string): Promise<boolean> {
  const cached = clientHostCache.get(hostname);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.known;
  }

  // Ask authoritative sovereign servers
  const serverEndpoints = [
    "https://portside-theta.vercel.app",
    "https://portside.lol",
  ];

  for (const base of serverEndpoints) {
    try {
      const res = await fetch(`${base}/api/host/verify?host=${encodeURIComponent(hostname)}`, {
        signal: AbortSignal.timeout(2500),
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
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/manifest") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$/.test(pathname)
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
    // 2. Authoritative check: ask the sovereign server if this host is recognized and authorized
    const isKnown = await verifyHostWithServer(hostname);
    if (!isKnown) {
      return new NextResponse("Forbidden: Host not recognized by PortSide sovereign server.", { status: 403 });
    }
  }

  if (pathname.startsWith("/portside-proxy")) {
    return new NextResponse("Not found", { status: 404 });
  }

  let label: string | null = null;
  let targetPath = pathname;

  if (pathname.startsWith("/s/")) {
    const segments = pathname.slice(3).split("/");
    label = segments[0]?.toLowerCase() || null;
    const rest = segments.slice(1).join("/");
    targetPath = rest ? `/${rest}` : "/";
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

  if (!label && (pathname === "/about" || pathname === "/@me")) {
    const profileUrl = request.nextUrl.clone();
    profileUrl.pathname = "/profile";
    return NextResponse.rewrite(profileUrl);
  }

  const isRawIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isPortsideDomain = hostname.endsWith(".portside.lol");
  const isTryCloudflare = hostname.endsWith(".trycloudflare.com");

  if (!label && pathname === "/") {
    if (isPortsideDomain) {
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

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-portside-original-path", targetPath);
  requestHeaders.set("x-portside-client-host", host);

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|twitter-image|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)).*)",
  ],
};