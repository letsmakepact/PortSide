import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Validates the Buy Me a Coffee webhook signature using timingSafeEqual.
 */
function verifyBmcSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  try {
    const computedHmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(computedHmac, "hex");

    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.BMC_WEBHOOK_SECRET?.trim();
  const signatureHeader = req.headers.get("x-bmc-signature") || req.headers.get("x-signature");

  const rawBody = await req.text();
  const { searchParams } = new URL(req.url);
  const tokenParam = searchParams.get("token");

  // Enforce server verification: require configured webhook secret
  if (!secret) {
    console.error("[BMC Webhook] BMC_WEBHOOK_SECRET is not configured on this server.");
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Verify HMAC-SHA256 signature or token parameter
  const isSignatureValid = verifyBmcSignature(rawBody, signatureHeader, secret);
  const isTokenValid = tokenParam && tokenParam.length === secret.length && crypto.timingSafeEqual(Buffer.from(tokenParam), Buffer.from(secret));

  if (!isSignatureValid && !isTokenValid) {
    return Response.json({ error: "Invalid webhook signature or token" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // BMC payload shapes: response.supporter_email, data.supporter_email, or email
  const supporterEmail = (
    event.response?.supporter_email ||
    event.data?.supporter_email ||
    event.supporter_email ||
    event.email ||
    ""
  ).trim().toLowerCase();

  if (!supporterEmail) {
    return Response.json({ error: "No supporter email in payload" }, { status: 400 });
  }

  // Match supporter email against PortSide users
  const matchedUsers = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.email, supporterEmail))
    .limit(1);

  const now = new Date();

  if (matchedUsers.length > 0) {
    const user = matchedUsers[0];
    await db
      .update(users)
      .set({
        tier: "supporter",
        supporterSince: now,
      })
      .where(eq(users.id, user.id));

    await db.insert(activityLogs).values({
      userId: user.id,
      action: "supporter_unlocked",
      message: "PortSide Supporter perks unlocked automatically via Buy Me a Coffee!",
    });

    return Response.json({
      ok: true,
      message: `Supporter perks activated for ${user.email}`,
      supporterEmail,
      userId: user.id,
    });
  }

  // Even if user hasn't created their local account yet, acknowledge webhook cleanly
  return Response.json({
    ok: true,
    message: `Received supporter event for ${supporterEmail}. User account will be upgraded when registered.`,
  });
}
