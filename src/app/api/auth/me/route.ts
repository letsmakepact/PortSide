import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  const updates: Partial<{ name: string; passwordHash: string }> = {};
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length < 2) return Response.json({ error: "Name is too short." }, { status: 400 });
    updates.name = name;
  }
  if (body.newPassword) {
    if (body.newPassword.length < 8) return Response.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    const [row] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!row || !verifyPassword(body.currentPassword ?? "", row.passwordHash)) {
      return Response.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    updates.passwordHash = hashPassword(body.newPassword);
  }
  if (Object.keys(updates).length === 0) return Response.json({ error: "Nothing to update." }, { status: 400 });

  const [updated] = await db.update(users).set(updates).where(eq(users.id, user.id)).returning({
    id: users.id,
    email: users.email,
    name: users.name,
    createdAt: users.createdAt,
  });
  return Response.json({ user: updated });
}
