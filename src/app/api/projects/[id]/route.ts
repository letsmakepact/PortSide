import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, projects, services } from "@/db/schema";
import { requireUser, UnauthorizedError, unauthorized } from "@/lib/auth";
import { toProjectDTO } from "@/lib/serialize";
import { validateProject } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const id = Number((await ctx.params).id);
    const [existing] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, user.id))).limit(1);
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
    const result = validateProject(await req.json().catch(() => ({})), { partial: true });
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    const [row] = await db
      .update(projects)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    await db.insert(activityLogs).values({ userId: user.id, action: "project", message: `Updated project "${row.name}"` });
    const [{ n }] = await db
      .select({ n: services.id })
      .from(services)
      .where(eq(services.projectId, id))
      .then((rows) => [{ n: rows.length }]);
    return Response.json({ project: toProjectDTO(row, n) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const id = Number((await ctx.params).id);
    const [row] = await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, user.id))).returning();
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    await db.insert(activityLogs).values({ userId: user.id, action: "project", message: `Deleted project "${row.name}"` });
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}
