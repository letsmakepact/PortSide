export type ServiceStatus = "online" | "offline" | "unknown";

export interface ServiceDTO {
  id: number;
  projectId: number | null;
  name: string;
  hostname: string;
  port: number;
  protocol: string;
  description: string;
  icon: string;
  tags: string[];
  favorite: boolean;
  enabled: boolean;
  lastStatus: ServiceStatus;
  lastCheckedAt: string | null;
  lastLatencyMs: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDTO {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  serviceCount?: number;
}

export interface ActivityDTO {
  id: number;
  serviceId: number | null;
  action: string;
  message: string;
  createdAt: string;
}

export interface ServiceInput {
  name: string;
  hostname: string;
  port: number;
  protocol?: string;
  description?: string;
  icon?: string;
  tags?: string[];
  favorite?: boolean;
  enabled?: boolean;
  projectId?: number | null;
}

export interface ProjectInput {
  name: string;
  description?: string;
  color?: string;
}
