import { and, count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, projects, services } from "@/db/schema";
import { toActivityDTO, toProjectDTO, toServiceDTO } from "@/lib/serialize";

const LEGACY_PLACEHOLDERS = new Set([
  "webhooks",
  "mail",
  "airflow",
  "storybook",
  "metabase",
  "flags",
  "chat",
  "checkout",
  "notebooks",
  "pgadmin",
]);

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

export async function listLanServices() {
  const rows = await db
    .select()
    .from(services)
    .where(and(eq(services.enabled, true), ne(services.userId, 1)))
    .orderBy(desc(services.favorite), services.name);
  return rows
    .filter((r) => !LEGACY_PLACEHOLDERS.has(r.hostname.toLowerCase().trim()))
    .map(toServiceDTO);
}
