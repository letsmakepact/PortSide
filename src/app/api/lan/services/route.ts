import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db
      .select({
        hostname: services.hostname,
        port: services.port,
        enabled: services.enabled,
      })
      .from(services)
      .where(eq(services.enabled, true));

    const hostnames = Array.from(
      new Set(list.map((s) => s.hostname.toLowerCase().trim()).filter(Boolean))
    );

    return NextResponse.json({ hostnames });
  } catch (error) {
    return NextResponse.json({ hostnames: [], error: String(error) }, { status: 500 });
  }
}
