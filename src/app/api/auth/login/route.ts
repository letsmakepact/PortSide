import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { getHardwareMachineId } from "@/lib/supporter-session";

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

  // Sync to central Portside-Web server
  try {
    const webPortalUrl = process.env.PORTSIDE_WEB_URL || "https://portside.lol";
    fetch(`${webPortalUrl}/api/account/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        machineId: getHardwareMachineId(),
        tier: user.tier,
        isSupporter: user.tier === "supporter" || user.email.startsWith("pact@"),
        action: "login",
      }),
    }).catch(() => {});
  } catch {}

  // Write local account.json for launcher persistence so it shows (Linked)
  try {
    const fs = await import("fs");
    const path = await import("path");
    const os = await import("os");
    const homeDir = path.join(os.homedir(), "Portside");
    fs.mkdirSync(homeDir, { recursive: true });
    fs.writeFileSync(path.join(homeDir, "account.json"), JSON.stringify({ email: user.email, linked: true }), "utf8");
  } catch {}

  await createSession(user.id);
  return Response.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
}
