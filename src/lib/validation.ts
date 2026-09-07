import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { projects, services } from "@/db/schema";
import { isValidHostname, RESERVED_HOSTNAMES, PROJECT_COLORS } from "@/lib/utils";
import type { ServiceInput, ProjectInput } from "@/lib/types";

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function validateService(
  raw: unknown,
  userId: number,
  opts: { partial?: boolean; excludeId?: number } = {},
): Promise<ValidationResult<Partial<ServiceInput>>> {
  const body = (raw ?? {}) as Record<string, unknown>;
  const out: Partial<ServiceInput> = {};

  if (body.name !== undefined || !opts.partial) {
    const name = String(body.name ?? "").trim();
    if (name.length < 1 || name.length > 120) return { ok: false, error: "Name is required (max 120 chars)." };
    out.name = name;
  }

  if (body.hostname !== undefined || !opts.partial) {
    const hostname = String(body.hostname ?? "").trim().toLowerCase().replace(/\.localhost$/, "");
    if (!isValidHostname(hostname)) {
      return { ok: false, error: "Hostname may only contain lowercase letters, numbers and hyphens." };
    }
    if (RESERVED_HOSTNAMES.has(hostname)) return { ok: false, error: `"${hostname}" is reserved.` };
    const conflict = await db
      .select({ id: services.id })
      .from(services)
      .where(opts.excludeId ? and(eq(services.hostname, hostname), ne(services.id, opts.excludeId)) : eq(services.hostname, hostname))
      .limit(1);
    if (conflict.length) return { ok: false, error: `${hostname}.localhost is already taken.` };
    out.hostname = hostname;
  }

  if (body.port !== undefined || !opts.partial) {
    const port = Number(body.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return { ok: false, error: "Port must be between 1 and 65535." };
    const appPort = Number(process.env.PORT ?? 80);
    if (port === appPort) {
      return { ok: false, error: `Port ${port} is reserved for PortSide itself and cannot be proxied.` };
    }
    if ([5432, 3306, 27017, 6379, 22, 23, 25].includes(port)) {
      return { ok: false, error: `Port ${port} is a reserved system or database wire port and cannot be mapped as an HTTP service.` };
    }
    out.port = port;
  }

  if (body.protocol !== undefined) {
    const protocol = String(body.protocol);
    if (!["http", "https"].includes(protocol)) return { ok: false, error: "Protocol must be http or https." };
    out.protocol = protocol;
  }
  if (body.description !== undefined) out.description = String(body.description).slice(0, 500);
  if (body.icon !== undefined) out.icon = String(body.icon).slice(0, 8) || "⌘";
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) return { ok: false, error: "Tags must be a list." };
    out.tags = body.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 10);
  }
  if (body.favorite !== undefined) out.favorite = Boolean(body.favorite);
  if (body.enabled !== undefined) out.enabled = Boolean(body.enabled);
  if (body.projectId !== undefined) {
    if (body.projectId === null || body.projectId === "") {
      out.projectId = null;
    } else {
      const pid = Number(body.projectId);
      const [p] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.id, pid), eq(projects.userId, userId)))
        .limit(1);
      if (!p) return { ok: false, error: "Project not found." };
      out.projectId = pid;
    }
  }
  return { ok: true, data: out };
}

export function validateProject(raw: unknown, opts: { partial?: boolean } = {}): ValidationResult<Partial<ProjectInput>> {
  const body = (raw ?? {}) as Record<string, unknown>;
  const out: Partial<ProjectInput> = {};
  if (body.name !== undefined || !opts.partial) {
    const name = String(body.name ?? "").trim();
    if (name.length < 1 || name.length > 120) return { ok: false, error: "Project name is required." };
    out.name = name;
  }
  if (body.description !== undefined) out.description = String(body.description).slice(0, 500);
  if (body.color !== undefined) {
    const color = String(body.color);
    if (!(PROJECT_COLORS as readonly string[]).includes(color)) return { ok: false, error: "Invalid color." };
    out.color = color;
  }
  if (body.icon !== undefined) out.icon = String(body.icon).slice(0, 32) || "layers";
  if (body.category !== undefined) out.category = String(body.category).slice(0, 64) || "development";
  if (body.tags !== undefined) {
    if (Array.isArray(body.tags)) {
      out.tags = body.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 15);
    } else {
      out.tags = [];
    }
  }
  if (body.repoUrl !== undefined) out.repoUrl = String(body.repoUrl).trim().slice(0, 300);
  if (body.docsUrl !== undefined) out.docsUrl = String(body.docsUrl).trim().slice(0, 300);
  if (body.lead !== undefined) out.lead = String(body.lead).trim().slice(0, 120);
  if (body.accent !== undefined) out.accent = String(body.accent).trim().slice(0, 32) || "glow";
  return { ok: true, data: out };
}
