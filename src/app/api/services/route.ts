import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, services } from "@/db/schema";
import { requireUser, UnauthorizedError, unauthorized } from "@/lib/auth";
import { toServiceDTO } from "@/lib/serialize";
import { validateService } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db.select().from(services).where(eq(services.userId, user.id)).orderBy(desc(services.favorite), services.name);
    return Response.json({ services: rows.map(toServiceDTO) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const result = await validateService(body, user.id);
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    const d = result.data;
    const [row] = await db
      .insert(services)
      .values({
        userId: user.id,
        name: d.name!,
        hostname: d.hostname!,
        port: d.port!,
        protocol: d.protocol ?? "http",
        description: d.description ?? "",
        icon: d.icon ?? "🚀",
        tags: d.tags ?? [],
        favorite: d.favorite ?? false,
        enabled: d.enabled ?? true,
        projectId: d.projectId ?? null,
      })
      .returning();
    await db.insert(activityLogs).values({
      userId: user.id,
      serviceId: row.id,
      action: "created",
      message: `Registered ${row.hostname}.localhost → :${row.port}`,
    });
    return Response.json({ service: toServiceDTO(row) }, { status: 201 });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}
