import { eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { getHardwareMachineId } from "@/lib/supporter-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  await ensureSeeded();
  const clientIp = getClientIp(req);
  const ipLimit = checkRateLimit(`login-ip:${clientIp}`, 15, 60 * 1000);
  if (!ipLimit.allowed) {
    return Response.json(
      { error: "Too many login attempts from this network. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(ipLimit.retryAfterSec),
          "X-RateLimit-Limit": String(ipLimit.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    identifier?: string;
    password?: string;
  };
  const rawInput = (body.email ?? body.identifier ?? "").trim();
  const input = rawInput.toLowerCase();
  const password = body.password ?? "";

  if (!input || !password) {
    return Response.json({ error: "Email or username and password are required." }, { status: 400 });
  }

  const acctLimit = checkRateLimit(`login-acct:${input}`, 5, 60 * 1000);
  if (!acctLimit.allowed) {
    return Response.json(
      { error: `Too many failed login attempts for this account. Please wait ${acctLimit.retryAfterSec} seconds.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(acctLimit.retryAfterSec),
          "X-RateLimit-Limit": String(acctLimit.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(
      or(
        eq(sql`LOWER(${users.email})`, input),
        eq(sql`LOWER(${users.name})`, input)
      )
    )
    .limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: "Invalid email, username, or password." }, { status: 401 });
  }

  try {
    const { getLanIp } = await import("@/lib/lan");
    const wifiIp = getLanIp();
    const webPortalUrl = "https://portside.lol";
    fetch(`${webPortalUrl}/api/account/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        machineId: getHardwareMachineId(),
        wifiIp,
        tier: user.tier,
        isSupporter: user.tier === "supporter",
        action: "login",
      }),
    }).catch(() => {});
  } catch {}

  await createSession(user.id);
  return Response.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
