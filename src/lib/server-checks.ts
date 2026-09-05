import { getCurrentUser, requireUser, type SafeUser } from "./auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrFetchSupporterSession } from "./supporter-session";

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

  // 1. First, check if we have a valid, cryptographically unforgeable session ticket from sovereign server
  const sessionResult = await getOrFetchSupporterSession(user.email);
  if (sessionResult.valid) {
    // If DB is not yet marked, sync it
    if (user.tier !== "supporter") {
      try {
        await db
          .update(users)
          .set({
            tier: "supporter",
            supporterSince: new Date(),
          })
          .where(eq(users.id, user.id));
      } catch {}
    }
    return true;
  }

  // 2. If locally marked as supporter, try fallback check
  if (user.tier === "supporter") {
    // Attempt re-verification if offline; if never had a server ticket, reject tampering
    return sessionResult.valid;
  }

  return false;
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
