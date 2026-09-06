import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, verifyPassword } from "@/lib/auth";
import { getHardwareMachineId, getOrFetchSupporterSession } from "@/lib/supporter-session";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const machineId = getHardwareMachineId();
    const [user] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);

    if (!user) {
      return NextResponse.json({ error: "Account not found on this machine." }, { status: 404 });
    }

    const webPortalUrl = process.env.PORTSIDE_WEB_URL || "https://portside.lol";

    // 1. Check if this account is linked to a premium supporter account on the server or locally
    let isPremiumAccount = user.tier === "supporter" || cleanEmail.startsWith("pact@");

    try {
      const serverCheckRes = await fetch(
        `${webPortalUrl}/api/device/instructions?email=${encodeURIComponent(cleanEmail)}&machineId=${machineId}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (serverCheckRes.ok) {
        const inst = await serverCheckRes.json();
        if (inst.authorized && (inst.tier === "supporter" || inst.tier === "premium")) {
          isPremiumAccount = true;
        }
      }
    } catch {}

    // 2. If the account is linked to a premium account on the server, the password is NOT optional
    if (isPremiumAccount) {
      if (!password || password.trim().length === 0) {
        return NextResponse.json(
          {
            error: "Password is required. This account is linked to a verified Supporter account on the server and must be authenticated with your password.",
          },
          { status: 400 }
        );
      }
    }

    // 3. Verify password against local stored credentials
    if (password && password.trim().length > 0) {
      if (!verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ error: "Incorrect password for this account." }, { status: 401 });
      }
    } else if (isPremiumAccount) {
      return NextResponse.json(
        { error: "Password is required for verified Supporter accounts." },
        { status: 401 }
      );
    }

    // 4. Confirm on the sovereign server
    let serverConfirmed = false;
    let sessionTicket: string | null = null;

    try {
      const confirmRes = await fetch(`${webPortalUrl}/api/account/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          name: user.name,
          machineId,
          tier: isPremiumAccount ? "supporter" : user.tier,
          isSupporter: isPremiumAccount,
          action: "link",
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (confirmRes.ok) {
        serverConfirmed = true;
      }
    } catch {}

    // If premium, strictly require sovereign server confirmation & cryptographic session ticket
    if (isPremiumAccount) {
      const sessionResult = await getOrFetchSupporterSession(cleanEmail, undefined, true);
      if (!sessionResult.valid || !sessionResult.sessionTicket) {
        return NextResponse.json(
          {
            error: "Server confirmation failed: Could not verify active Supporter entitlement on the sovereign server. Please check your network connection or active subscription.",
          },
          { status: 403 }
        );
      }
      sessionTicket = sessionResult.sessionTicket;
      serverConfirmed = true;

      // Update local database tier to supporter
      if (user.tier !== "supporter") {
        await db
          .update(users)
          .set({ tier: "supporter", supporterSince: new Date() })
          .where(eq(users.id, user.id));
      }

      // Sync active ticket to launcher control server on port 4242
      try {
        await fetch("http://127.0.0.1:4242/api/pro/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket: sessionTicket, machineId }),
          signal: AbortSignal.timeout(800),
        }).catch(() => {});
      } catch {}

    }

    await db.insert(activityLogs).values({
      userId: user.id,
      action: "account",
      message: `Account confirmed on server and linked to local machine for ${user.name || cleanEmail}`,
    });

    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      serverConfirmed,
      isPremium: isPremiumAccount,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: isPremiumAccount ? "supporter" : user.tier,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to link account." }, { status: 500 });
  }
}
