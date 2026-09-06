import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
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