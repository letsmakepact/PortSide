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

export async function isServerSupporter(userIdOrUser?: number | SafeUser | null): Promise<boolean> {
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

  if (!user) {
    try {
      const supporterRows = await db
        .select({
          id: users.id,
          email: users.email,
          tier: users.tier,
        })
        .from(users)
        .where(eq(users.tier, "supporter"))
        .limit(1);

      if (supporterRows.length > 0) {
        const nodeSupporter = supporterRows[0];
        const sessionResult = await getOrFetchSupporterSession(nodeSupporter.email);
        if (sessionResult.valid && sessionResult.payload?.tier === "supporter") {
          return true;
        }
      }
    } catch {}
    return false;
  }

  const sessionResult = await getOrFetchSupporterSession(user.email);
  if (sessionResult.valid && sessionResult.payload?.tier === "supporter") {
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

  if (user.tier === "supporter" && !sessionResult.valid) {
    try {
      await db
        .update(users)
        .set({
          tier: "free",
          supporterSince: null,
        })
        .where(eq(users.id, user.id));
    } catch {}
  }

  return false;
}

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
