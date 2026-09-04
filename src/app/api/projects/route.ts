import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, projects } from "@/db/schema";
import { requireUser, UnauthorizedError, unauthorized } from "@/lib/auth";
import { toProjectDTO } from "@/lib/serialize";
import { listProjects } from "@/lib/queries";
import { slugify } from "@/lib/utils";
import { validateProject } from "@/lib/validation";

export const dynamic = "force-dynamic";

async function uniqueSlug(userId: number, base: string, excludeId?: number) {
  let slug = base || "project";
  let i = 2;
  for (;;) {
    const [hit] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.slug, slug), excludeId ? sql`${projects.id} <> ${excludeId}` : sql`true`))
      .limit(1);
    if (!hit) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({ projects: await listProjects(user.id) });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const result = validateProject(await req.json().catch(() => ({})));
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    const d = result.data;
    const slug = await uniqueSlug(user.id, slugify(d.name!));
    const [row] = await db
      .insert(projects)
      .values({ userId: user.id, name: d.name!, slug, description: d.description ?? "", color: d.color ?? "indigo" })
      .returning();
    await db.insert(activityLogs).values({ userId: user.id, action: "project", message: `Created project "${row.name}"` });
    return Response.json({ project: toProjectDTO(row, 0) }, { status: 201 });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}
