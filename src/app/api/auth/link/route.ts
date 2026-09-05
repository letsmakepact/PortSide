import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, verifyPassword } from "@/lib/auth";
import { getHardwareMachineId } from "@/lib/supporter-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [user] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Incorrect password for this account." }, { status: 401 });
    }

    // Confirm and link with PortSide central server
    try {
      const webPortalUrl = process.env.PORTSIDE_WEB_URL || "https://portside-theta.vercel.app";
      await fetch(`${webPortalUrl}/api/account/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          name: user.name,
          machineId: getHardwareMachineId(),
          action: "link",
        }),
      });
    } catch {
      // Offline fallback
    }

    await db.insert(activityLogs).values({
      userId: user.id,
      action: "account",
      message: `Account linked to local machine for ${user.name || cleanEmail}`,
    });

    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to link account." }, { status: 500 });
  }
}
