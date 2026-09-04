import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, projects, services } from "@/db/schema";
import { toActivityDTO, toProjectDTO, toServiceDTO } from "@/lib/serialize";

export async function listProjects(userId: number) {
  const rows = await db
    .select({ project: projects, serviceCount: count(services.id) })
    .from(projects)
    .leftJoin(services, eq(services.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .groupBy(projects.id)
    .orderBy(projects.name);
  return rows.map((r) => toProjectDTO(r.project, Number(r.serviceCount)));
}

export async function listServices(userId: number) {
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.userId, userId))
    .orderBy(desc(services.favorite), services.name);
  return rows.map(toServiceDTO);
}

export async function listActivity(userId: number, limit = 50) {
  const rows = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
  return rows.map(toActivityDTO);
}
