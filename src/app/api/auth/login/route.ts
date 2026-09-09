import { eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { getHardwareMachineId } from "@/lib/supporter-session";

export async function POST(req: Request) {
  await ensureSeeded();
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
    const webPortalUrl = "https://portside.lol";
    fetch(`${webPortalUrl}/api/account/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        machineId: getHardwareMachineId(),
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
