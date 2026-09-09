import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { getHardwareMachineId } from "@/lib/supporter-session";

export async function POST(req: Request) {
  const rawHost = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase();
  const host = rawHost.split(":")[0];
  const isPortsideApex = host === "portside.lol" || host === "www.portside.lol" || host === "app.portside.lol";
  const isPublicLink = host.endsWith(".portside.lol") && !isPortsideApex;

  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string; name?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const name = (body.name ?? "").trim();
  if (!name || name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  if (isPublicLink) {
    const webPortalUrl = "https://portside.lol";
    try {
      const serverRes = await fetch(`${webPortalUrl}/api/account/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          action: "register",
        }),
      });
      const data = await serverRes.json().catch(() => ({}));
      if (!serverRes.ok) {
        return Response.json(
          { error: data.error || "Failed to register on central Portside server." },
          { status: serverRes.status }
        );
      }
      return Response.json(
        {
          ok: true,
          central: true,
          message: "Account registered successfully on Portside. Download Portside to run your own node!",
          redirectUrl: "https://portside.lol",
        },
        { status: 201 }
      );
    } catch {
      return Response.json({ error: "Could not connect to Portside central server." }, { status: 502 });
    }
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) {
    return Response.json(
      { error: "An account with that email already exists. Please link your existing account or sign in.", canLink: true },
      { status: 409 }
    );
  }

  try {
    const webPortalUrl = "https://portside.lol";
    const serverRes = await fetch(`${webPortalUrl}/api/account/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        machineId: getHardwareMachineId(),
        action: "register",
      }),
    });

    if (serverRes.status === 409) {
      const serverData = await serverRes.json().catch(() => ({}));
      return Response.json(
        {
          error: serverData.error || "This email is already registered and confirmed on the server. Please link your current account instead.",
          canLink: true,
        },
        { status: 409 }
      );
    }
  } catch {
  }

  const [user] = await db.insert(users).values({ email, name, passwordHash: hashPassword(password) }).returning();
  await db.insert(activityLogs).values({ userId: user.id, action: "account", message: `Welcome to Portside, ${name}!` });
  await createSession(user.id);
  return Response.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
}
