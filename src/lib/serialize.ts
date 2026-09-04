import type { ActivityLog, Project, Service } from "@/db/schema";
import type { ActivityDTO, ProjectDTO, ServiceDTO, ServiceStatus } from "@/lib/types";

export function toServiceDTO(s: Service): ServiceDTO {
  return {
    id: s.id,
    projectId: s.projectId,
    name: s.name,
    hostname: s.hostname,
    port: s.port,
    protocol: s.protocol,
    description: s.description,
    icon: s.icon,
    tags: s.tags ?? [],
    favorite: s.favorite,
    enabled: s.enabled,
    lastStatus: (s.lastStatus as ServiceStatus) ?? "unknown",
    lastCheckedAt: s.lastCheckedAt ? s.lastCheckedAt.toISOString() : null,
    lastLatencyMs: s.lastLatencyMs,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function toProjectDTO(p: Project, serviceCount?: number): ProjectDTO {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    color: p.color,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    serviceCount,
  };
}

export function toActivityDTO(a: ActivityLog): ActivityDTO {
  return {
    id: a.id,
    serviceId: a.serviceId,
    action: a.action,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
  };
}
