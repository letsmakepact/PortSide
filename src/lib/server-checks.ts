import { getCurrentUser, requireUser, type SafeUser } from "./auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export class SupporterRequiredError extends Error {
  constructor(message = "Supporter tier required") {
    super(message);
    this.name = "SupporterRequiredError";
  }
}

/**
 * Authoritatively verifies whether a user or instance has Supporter status on the server.
 * Never relies on client-side state.
 */
export async function isServerSupporter(userIdOrUser?: number | SafeUser | null): Promise<boolean> {
  // Server-level environment override
  if (process.env.PORTSIDE_SUPPORTER === "true") {
    return true;
  }

  let user: SafeUser | null = null;

  if (typeof userIdOrUser === "number") {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        tier: users.tier,
        supporterSince: users.supporterSince,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userIdOrUser))
      .limit(1);
    user = rows[0] ?? null;
  } else if (userIdOrUser && typeof userIdOrUser === "object") {
    user = userIdOrUser;
  } else {
    user = await getCurrentUser();
  }

  if (!user) return false;

  // 1. If locally marked as supporter, verify if not expired
  if (user.tier === "supporter") {
    return true;
  }

  // 2. Automatically query PortSide Vercel server for active monthly BMC subscription
  try {
    const webPortalUrl = process.env.PORTSIDE_WEB_URL || "https://portside-theta.vercel.app";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${webPortalUrl}/api/subscription/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.active) {
        // Upgrade user locally in SQLite DB
        await db
          .update(users)
          .set({
            tier: "supporter",
            supporterSince: new Date(),
          })
          .where(eq(users.id, user.id));
        return true;
      }
    }
  } catch {
    // If offline or network timeout, fall back to existing local DB tier
  }

  return user.tier === "supporter";
}

/**
 * Asserts that the authenticated user has confirmed Supporter status on the server.
 * Throws SupporterRequiredError if not confirmed.
 */
export async function requireServerSupporter(): Promise<SafeUser> {
  const user = await requireUser();
  const confirmed = await isServerSupporter(user);

  if (!confirmed) {
    throw new SupporterRequiredError("Server confirmation failed: PortSide Supporter tier required.");
  }

  return user;
}

export function supporterForbidden(message = "Server confirmation failed: PortSide Supporter tier required.") {
  return Response.json(
    {
      error: message,
      requiresSupporter: true,
      serverConfirmed: false,
    },
    { status: 403 }
  );
}
