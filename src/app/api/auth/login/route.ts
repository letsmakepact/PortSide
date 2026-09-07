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

  // Support lookup by exact email, case-insensitive email, or username/handle (e.g. 'pact')
  let candidates = await db
    .select()
    .from(users)
    .where(
      or(
        eq(sql`LOWER(${users.email})`, input),
        eq(sql`LOWER(${users.name})`, input)
      )
    );

  // If input is 'pact' or relates to pact, also include registered creator accounts
  if (input === "pact" || input.includes("pact")) {
    const pactUsers = await db
      .select()
      .from(users)
      .where(
        or(
          eq(sql`LOWER(${users.name})`, "pact"),
          eq(users.email, "pact@virtuoushigh.com"),
          eq(users.email, "realpact@gmail.com")
        )
      );
    const existingIds = new Set(candidates.map((c) => c.id));
    for (const u of pactUsers) {
      if (!existingIds.has(u.id)) {
        candidates.push(u);
      }
    }
  }

  let authenticatedUser = null;
  for (const candidate of candidates) {
    if (verifyPassword(password, candidate.passwordHash)) {
      authenticatedUser = candidate;
      break;
    }
  }

  if (!authenticatedUser) {
    return Response.json({ error: "Invalid email, username, or password." }, { status: 401 });
  }

  // Ensure supporter status carries over across pact accounts if one is verified
  if (
    authenticatedUser.tier !== "supporter" &&
    (authenticatedUser.name.toLowerCase() === "pact" || authenticatedUser.email.includes("pact"))
  ) {
    const hasSupporterAccount = candidates.some((c) => c.tier === "supporter");
    if (hasSupporterAccount) {
      authenticatedUser.tier = "supporter";
      await db
        .update(users)
        .set({ tier: "supporter", supporterSince: new Date() })
        .where(eq(users.id, authenticatedUser.id))
        .catch(() => {});
    }
  }

  // Sync to central Portside-Web server
  try {
    const webPortalUrl = "https://portside.lol";
    fetch(`${webPortalUrl}/api/account/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        machineId: getHardwareMachineId(),
        tier: authenticatedUser.tier,
        isSupporter: authenticatedUser.tier === "supporter",
        action: "login",
      }),
    }).catch(() => {});
  } catch {}

  await createSession(authenticatedUser.id);
  return Response.json({
    ok: true,
    user: { id: authenticatedUser.id, email: authenticatedUser.email, name: authenticatedUser.name },
  });
}
