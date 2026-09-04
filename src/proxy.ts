import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const hostname = host.split(":")[0];
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next")) return NextResponse.next();
  if (pathname.startsWith("/portside-proxy")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const match = hostname.match(/^([a-z0-9-]+)\.localhost$/);
  if (!match) return NextResponse.next();

  const label = match[1];
  if (label === "www" || label === "app") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/portside-proxy/${label}${pathname === "/" ? "" : pathname}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-portside-original-path", pathname);

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};