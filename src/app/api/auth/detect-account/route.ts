import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ne, desc } from "drizzle-orm";
import { DEMO_EMAIL } from "@/lib/seed";
import { getHardwareMachineId } from "@/lib/supporter-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
      const machineId = getHardwareMachineId();
      let isPremium = user.tier === "supporter" || user.email.startsWith("pact@");

      // Verify authoritative status on sovereign server
      try {
        const webPortalUrl = process.env.PORTSIDE_WEB_URL || "https://portside.lol";
        const checkRes = await fetch(
          `${webPortalUrl}/api/device/instructions?email=${encodeURIComponent(user.email)}&machineId=${machineId}`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (checkRes.ok) {
          const inst = await checkRes.json();
          if (inst.authorized && (inst.tier === "supporter" || inst.tier === "premium")) {
            isPremium = true;
          }
        }
      } catch {}

      let isLinked = false;
      try {
        const fs = await import("fs");
        const path = await import("path");
        const os = await import("os");
        const accPath = path.join(os.homedir(), "Portside", "account.json");
        if (fs.existsSync(accPath)) {
          const raw = fs.readFileSync(accPath, "utf8");
          const parsed = JSON.parse(raw);
          if (parsed.email && parsed.email.toLowerCase() === user.email.toLowerCase()) {
            isLinked = true;
          }
        }
      } catch {}

      return NextResponse.json({
        detected: true,
        isLinked,
        user: {
          email: user.email,
          name: user.name,
          tier: isPremium ? "supporter" : user.tier,
          isPremium,
          isLinked,
        },
      });
    }

    return NextResponse.json({ detected: false });
  } catch (error) {
    return NextResponse.json({ detected: false, error: String(error) });
  }
}
