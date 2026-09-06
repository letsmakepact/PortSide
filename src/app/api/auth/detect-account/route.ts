import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ne, desc } from "drizzle-orm";
import { DEMO_EMAIL } from "@/lib/seed";
import { getHardwareMachineId } from "@/lib/supporter-session";
import { verifySessionTicket } from "@/lib/license";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const machineId = getHardwareMachineId();
    // Strictly hardcoded sovereign URL; cannot be spoofed via environment variable
    const webPortalUrl = "https://portside.lol";

    // 1. Authoritative check: ALWAYS query the sovereign server first
    try {
      const serverRes = await fetch(
        `${webPortalUrl}/api/device/instructions?machineId=${machineId}`,
        { signal: AbortSignal.timeout(3500) }
      );
      if (serverRes.ok) {
        const inst = await serverRes.json();
        if (inst.email && inst.email.includes("@")) {
          // Verify Ed25519 cryptographic ticket: cannot be spoofed by rogue local servers or JSON mocks
          let isSupporter = false;
          if (inst.sessionTicket) {
            const verified = verifySessionTicket(inst.sessionTicket, machineId, inst.email);
            if (verified.valid && verified.payload && verified.payload.tier === "supporter") {
              isSupporter = true;
            }
          }

          return NextResponse.json({
            detected: true,
            isLinked: Boolean(inst.authorized),
            user: {
              email: inst.email,
              name: inst.email.split("@")[0],
              tier: isSupporter ? "supporter" : "free",
              isPremium: isSupporter,
              isLinked: Boolean(inst.authorized),
            },
          });
        }
      }
    } catch {}

    // 2. Fallback to local database only if server is offline
    const list = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        tier: users.tier,
      })
      .from(users)
      .where(ne(users.email, DEMO_EMAIL))
      .orderBy(desc(users.id))
      .limit(1);

    if (list.length > 0) {
      const user = list[0];
      return NextResponse.json({
        detected: true,
        isLinked: false,
        user: {
          email: user.email,
          name: user.name,
          tier: user.tier,
          isPremium: user.tier === "supporter",
          isLinked: false,
        },
      });
    }

    return NextResponse.json({ detected: false });
  } catch (error) {
    return NextResponse.json({ detected: false, error: String(error) });
  }
}
