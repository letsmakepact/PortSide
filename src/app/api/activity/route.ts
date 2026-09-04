import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { requireUser, UnauthorizedError, unauthorized } from "@/lib/auth";
import { toActivityDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const limit = Math.min(Number(new URL(req.url).searchParams.get("limit") ?? 50), 200);
    const rows = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, user.id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
    return Response.json({ activity: rows.map(toActivityDTO) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await db.delete(activityLogs).where(eq(activityLogs.userId, user.id));
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}
