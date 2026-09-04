import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export async function POST(req: Request) {
  await ensureSeeded();
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }
  await createSession(user.id);
  return Response.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
}
