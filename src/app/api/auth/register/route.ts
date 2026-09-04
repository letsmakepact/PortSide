import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string; name?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const name = (body.name ?? "").trim();
  if (!name || name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return Response.json({ error: "An account with that email already exists." }, { status: 409 });

  const [user] = await db.insert(users).values({ email, name, passwordHash: hashPassword(password) }).returning();
  await db.insert(activityLogs).values({ userId: user.id, action: "account", message: `Welcome to Portside, ${name}!` });
  await createSession(user.id);
  return Response.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
}
