"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useToast } from "@/components/ui/Toast";
import type { ProjectDTO, ProjectInput, ServiceDTO, ServiceInput } from "@/lib/types";
import type { SafeUser } from "@/lib/auth";

export type ClientUser = Omit<SafeUser, "createdAt"> & { createdAt: string };

interface DashboardContextValue {
  user: ClientUser;
  setUser: (u: ClientUser) => void;
  services: ServiceDTO[];
  projects: ProjectDTO[];
  appPort: string;
  checking: boolean;
  lastCheckedAt: string | null;
  autoCheck: boolean;
  setAutoCheck: (v: boolean) => void;
  runCheck: () => Promise<void>;
  createService: (input: ServiceInput) => Promise<ServiceDTO | null>;
  updateService: (id: number, patch: Partial<ServiceInput>) => Promise<boolean>;
  deleteService: (id: number) => Promise<boolean>;
  createProject: (input: ProjectInput) => Promise<ProjectDTO | null>;
  updateProject: (id: number, patch: Partial<ProjectInput>) => Promise<boolean>;
  deleteProject: (id: number) => Promise<boolean>;
  tutorialOpen: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;
}

const Ctx = createContext<DashboardContextValue | null>(null);

const POLL_MS = 15_000;

const subscribe = () => () => {};

function getClientPort() {
  if (typeof window === "undefined") return "3000";
  return window.location.port || (window.location.protocol === "https:" ? "443" : "80");
}

function getAutoCheckSnapshot() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem("portside:autoCheck") !== "0";
}

export function DashboardProvider({
  user: initialUser,
  initialServices,
  initialProjects,
  children,
}: {
  user: ClientUser;
  initialServices: ServiceDTO[];
  initialProjects: ProjectDTO[];
  children: ReactNode;
}) {
  const toast = useToast();
  const [user, setUser] = useState(initialUser);
  const [services, setServices] = useState(initialServices);
  const [projects, setProjects] = useState(initialProjects);
  const [checking, setChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const appPort = useSyncExternalStore(subscribe, getClientPort, () => "3000");
  const storedAutoCheck = useSyncExternalStore(subscribe, getAutoCheckSnapshot, () => true);
  const [autoCheck, setAutoCheckState] = useState(storedAutoCheck);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const inFlight = useRef(false);

  const openTutorial = useCallback(() => setTutorialOpen(true), []);
  const closeTutorial = useCallback(() => setTutorialOpen(false), []);

  const setAutoCheck = useCallback((v: boolean) => {
    setAutoCheckState(v);
    window.localStorage.setItem("portside:autoCheck", v ? "1" : "0");
  }, []);

  const runCheck = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setChecking(true);
    try {
      const res = await fetch("/api/services/check", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { services: ServiceDTO[]; checkedAt: string; transitions: number };
        setServices((prev) => {
          const byId = new Map(data.services.map((s) => [s.id, s]));
          const merged = prev.filter((p) => p.id < 0);
          return [...data.services.map((s) => byId.get(s.id)!), ...merged];
        });
        setLastCheckedAt(data.checkedAt);
        if (data.transitions > 0) {
          toast({ tone: "info", title: `${data.transitions} service${data.transitions > 1 ? "s" : ""} changed status` });
        }
      }
    } catch {
    } finally {
      inFlight.current = false;
      setChecking(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!autoCheck) return;
    const timer = setTimeout(() => {
      void runCheck();
    }, 0);
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void runCheck();
    }, POLL_MS);
    return () => {
      clearTimeout(timer);
      clearInterval(id);
    };
  }, [autoCheck, runCheck]);

  const sortServices = (list: ServiceDTO[]) =>
    [...list].sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name));

  const createService = useCallback(
    async (input: ServiceInput) => {
      const tempId = -Date.now();
      const now = new Date().toISOString();
      const optimistic: ServiceDTO = {
        id: tempId,
        projectId: input.projectId ?? null,
        name: input.name,
        hostname: input.hostname,
        port: input.port,
        protocol: input.protocol ?? "http",
        description: input.description ?? "",
        icon: input.icon ?? "🚀",
        tags: input.tags ?? [],
        favorite: input.favorite ?? false,
        enabled: input.enabled ?? true,
        lastStatus: "unknown",
        lastCheckedAt: null,
        lastLatencyMs: null,
        createdAt: now,
        updatedAt: now,
      };
      setServices((prev) => sortServices([...prev, optimistic]));
      setProjects((prev) => prev.map((p) => (p.id === input.projectId ? { ...p, serviceCount: (p.serviceCount ?? 0) + 1 } : p)));
      try {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create service");
        setServices((prev) => sortServices(prev.map((s) => (s.id === tempId ? data.service : s))));
        toast({ tone: "success", title: `${input.hostname}.localhost is live`, description: `Routing to port ${input.port}` });
        void runCheck();
        return data.service as ServiceDTO;
      } catch (e) {
        setServices((prev) => prev.filter((s) => s.id !== tempId));
        setProjects((prev) => prev.map((p) => (p.id === input.projectId ? { ...p, serviceCount: Math.max(0, (p.serviceCount ?? 1) - 1) } : p)));
        toast({ tone: "error", title: "Couldn't create service", description: (e as Error).message });
        return null;
      }
    },
    [toast, runCheck],
  );

  const updateService = useCallback(
    async (id: number, patch: Partial<ServiceInput>) => {
      let snapshot: ServiceDTO | undefined;
      setServices((prev) => {
        snapshot = prev.find((s) => s.id === id);
        return sortServices(prev.map((s) => (s.id === id ? { ...s, ...patch, tags: patch.tags ?? s.tags } as ServiceDTO : s)));
      });
      if (snapshot && patch.projectId !== undefined && patch.projectId !== snapshot.projectId) {
        const from = snapshot.projectId;
        const to = patch.projectId;
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id === from) return { ...p, serviceCount: Math.max(0, (p.serviceCount ?? 1) - 1) };
            if (p.id === to) return { ...p, serviceCount: (p.serviceCount ?? 0) + 1 };
            return p;
          }),
        );
      }
      try {
        const res = await fetch(`/api/services/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Update failed");
        setServices((prev) => sortServices(prev.map((s) => (s.id === id ? data.service : s))));
        if (patch.port !== undefined || patch.enabled !== undefined || patch.protocol !== undefined) void runCheck();
        return true;
      } catch (e) {
        if (snapshot) setServices((prev) => sortServices(prev.map((s) => (s.id === id ? snapshot! : s))));
        toast({ tone: "error", title: "Couldn't save changes", description: (e as Error).message });
        return false;
      }
    },
    [toast, runCheck],
  );

  const deleteService = useCallback(
    async (id: number) => {
      let snapshot: ServiceDTO | undefined;
      setServices((prev) => {
        snapshot = prev.find((s) => s.id === id);
        return prev.filter((s) => s.id !== id);
      });
      if (snapshot?.projectId) {
        const pid = snapshot.projectId;
        setProjects((prev) => prev.map((p) => (p.id === pid ? { ...p, serviceCount: Math.max(0, (p.serviceCount ?? 1) - 1) } : p)));
      }
      try {
        const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        toast({ tone: "success", title: "Service removed" });
        return true;
      } catch (e) {
        if (snapshot) setServices((prev) => sortServices([...prev, snapshot!]));
        toast({ tone: "error", title: "Couldn't delete", description: (e as Error).message });
        return false;
      }
    },
    [toast],
  );

  const createProject = useCallback(
    async (input: ProjectInput) => {
      const tempId = -Date.now();
      const now = new Date().toISOString();
      const optimistic: ProjectDTO = {
        id: tempId,
        name: input.name,
        slug: input.name.toLowerCase().replace(/\s+/g, "-"),
        description: input.description ?? "",
        color: input.color ?? "indigo",
        createdAt: now,
        updatedAt: now,
        serviceCount: 0,
      };
      setProjects((prev) => [...prev, optimistic].sort((a, b) => a.name.localeCompare(b.name)));
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create project");
        setProjects((prev) => prev.map((p) => (p.id === tempId ? data.project : p)));
        toast({ tone: "success", title: `Project "${input.name}" created` });
        return data.project as ProjectDTO;
      } catch (e) {
        setProjects((prev) => prev.filter((p) => p.id !== tempId));
        toast({ tone: "error", title: "Couldn't create project", description: (e as Error).message });
        return null;
      }
    },
    [toast],
  );

  const updateProject = useCallback(
    async (id: number, patch: Partial<ProjectInput>) => {
      let snapshot: ProjectDTO | undefined;
      setProjects((prev) => {
        snapshot = prev.find((p) => p.id === id);
        return prev.map((p) => (p.id === id ? { ...p, ...patch } : p)).sort((a, b) => a.name.localeCompare(b.name));
      });
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Update failed");
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...data.project, serviceCount: p.serviceCount } : p)));
        return true;
      } catch (e) {
        if (snapshot) setProjects((prev) => prev.map((p) => (p.id === id ? snapshot! : p)));
        toast({ tone: "error", title: "Couldn't save project", description: (e as Error).message });
        return false;
      }
    },
    [toast],
  );

  const deleteProject = useCallback(
    async (id: number) => {
      let snapshot: ProjectDTO | undefined;
      setProjects((prev) => {
        snapshot = prev.find((p) => p.id === id);
        return prev.filter((p) => p.id !== id);
      });
      setServices((prev) => prev.map((s) => (s.projectId === id ? { ...s, projectId: null } : s)));
      try {
        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        toast({ tone: "success", title: "Project deleted", description: "Its services were kept and ungrouped." });
        return true;
      } catch (e) {
        if (snapshot) setProjects((prev) => [...prev, snapshot!].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ tone: "error", title: "Couldn't delete project", description: (e as Error).message });
        return false;
      }
    },
    [toast],
  );

  const value = useMemo<DashboardContextValue>(
    () => ({
      user,
      setUser,
      services,
      projects,
      appPort,
      checking,
      lastCheckedAt,
      autoCheck,
      setAutoCheck,
      runCheck,
      createService,
      updateService,
      deleteService,
      createProject,
      updateProject,
      deleteProject,
      tutorialOpen,
      openTutorial,
      closeTutorial,
    }),
    [
      user,
      services,
      projects,
      appPort,
      checking,
      lastCheckedAt,
      autoCheck,
      setAutoCheck,
      runCheck,
      createService,
      updateService,
      deleteService,
      createProject,
      updateProject,
      deleteProject,
      tutorialOpen,
      openTutorial,
      closeTutorial,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}