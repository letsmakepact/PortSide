import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, services } from "@/db/schema";
import { requireUser, UnauthorizedError, unauthorized } from "@/lib/auth";
import { toServiceDTO } from "@/lib/serialize";
import { validateService } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const id = Number((await ctx.params).id);
    const [row] = await db.select().from(services).where(and(eq(services.id, id), eq(services.userId, user.id))).limit(1);
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ service: toServiceDTO(row) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const id = Number((await ctx.params).id);
    const [existing] = await db.select().from(services).where(and(eq(services.id, id), eq(services.userId, user.id))).limit(1);
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const result = await validateService(body, user.id, { partial: true, excludeId: id });
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

    const [row] = await db
      .update(services)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();

    const messages: string[] = [];
    if (result.data.port !== undefined && result.data.port !== existing.port) {
      messages.push(`Changed ${row.name} port from ${existing.port} to ${row.port}`);
    }
    if (result.data.hostname !== undefined && result.data.hostname !== existing.hostname) {
      messages.push(`Renamed ${existing.hostname}.localhost → ${row.hostname}.localhost`);
    }
    if (result.data.enabled !== undefined && result.data.enabled !== existing.enabled) {
      messages.push(`${row.enabled ? "Enabled" : "Disabled"} ${row.name} route`);
    }
    if (result.data.favorite !== undefined && result.data.favorite !== existing.favorite) {
      messages.push(`${row.favorite ? "Pinned" : "Unpinned"} ${row.name}`);
    }
    if (messages.length === 0 && Object.keys(result.data).length > 0) messages.push(`Updated ${row.name}`);
    if (messages.length) {
      await db.insert(activityLogs).values(messages.map((message) => ({ userId: user.id, serviceId: row.id, action: "updated", message })));
    }
    return Response.json({ service: toServiceDTO(row) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const id = Number((await ctx.params).id);
    const [row] = await db.delete(services).where(and(eq(services.id, id), eq(services.userId, user.id))).returning();
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    await db.insert(activityLogs).values({
      userId: user.id,
      action: "deleted",
      message: `Removed ${row.hostname}.localhost (${row.name})`,
    });
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}
