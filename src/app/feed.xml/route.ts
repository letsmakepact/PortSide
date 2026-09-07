import { NextResponse } from "next/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portside.lol";

export async function GET() {
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2000/Atom">
<channel>
  <title>Portside Releases &amp; Architecture Updates</title>
  <link>${appUrl}</link>
  <description>The open-source local development reverse proxy and multi-device cockpit that routes clean *.localhost subdomains without editing hosts files.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${appUrl}/feed.xml" rel="self" type="application/rss+xml" />

  <item>
    <title>Portside v1.1.0 — Smart TV Remote D-Pad Navigation &amp; Open-Air Signals</title>
    <link>${appUrl}/docs</link>
    <guid>${appUrl}/docs#v1-1-0</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>Introduced full spatial D-pad remote navigation for Smart TVs (LG webOS, Samsung Tizen, Android TV), high-redundancy QR codes, and RFC 6761 fast-path proxying.</description>
  </item>

  <item>
    <title>Portside Comparisons: Free Ngrok Alternative &amp; Custom Port Routing</title>
    <link>${appUrl}/comparisons</link>
    <guid>${appUrl}/comparisons</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>Full benchmark comparing Portside against Ngrok, Cloudflare Tunnels, and manual /etc/hosts configurations.</description>
  </item>
</channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
