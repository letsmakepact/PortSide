"use client";

import { isDesktopApp } from "@/lib/desktop-client";
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

export type ClientUser = Omit<SafeUser, "createdAt" | "supporterSince"> & {
  createdAt: string;
  supporterSince?: string | null;
};

export type ThemeMode = "dark" | "light";

interface DashboardContextValue {
  user: ClientUser;
  setUser: (u: ClientUser) => void;
  isSupporter: boolean;
  services: ServiceDTO[];
  projects: ProjectDTO[];
  appPort: string;
  checking: boolean;
  lastCheckedAt: string | null;
  autoCheck: boolean;
  setAutoCheck: (v: boolean) => void;
  isDesktop: boolean;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
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
  lanOpen: boolean;
  openLan: () => void;
  closeLan: () => void;
  supportOpen: boolean;
  openSupport: () => void;
  closeSupport: () => void;
  hotspotOpen: boolean;
  openHotspot: () => void;
  closeHotspot: () => void;
  activateLicense: (key: string) => Promise<{ ok: boolean; error?: string }>;
  verifyServerSupporter: () => Promise<boolean>;
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

function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("portside:theme");
  if (stored === "light" || stored === "dark") return stored;
  return "light";
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
  const storedTheme = useSyncExternalStore(subscribe, getThemeSnapshot, () => "light" as ThemeMode);
  const [theme, setThemeState] = useState<ThemeMode>(storedTheme);
  const [isDesktop, setIsDesktop] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [lanOpen, setLanOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [hotspotOpen, setHotspotOpen] = useState(false);
  const inFlight = useRef(false);

  // Strictly server-authoritative tier
  const isSupporter = user.tier === "supporter";

  const openTutorial = useCallback(() => setTutorialOpen(true), []);
  const closeTutorial = useCallback(() => setTutorialOpen(false), []);
  const openLan = useCallback(() => setLanOpen(true), []);
  const closeLan = useCallback(() => setLanOpen(false), []);
  const openSupport = useCallback(() => setSupportOpen(true), []);
  const closeSupport = useCallback(() => setSupportOpen(false), []);
  const openHotspot = useCallback(() => setHotspotOpen(true), []);
  const closeHotspot = useCallback(() => setHotspotOpen(false), []);

  const verifyServerSupporter = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/supporter/check");
      if (!res.ok) return false;
      const data = await res.json();
      if (data.serverConfirmed) {
        if (data.tier !== user.tier) {
          setUser((prev) => ({
            ...prev,
            tier: data.tier,
            supporterSince: data.supporterSince,
          }));
        }
        return Boolean(data.isSupporter);
      }
      return false;
    } catch {
      return false;
    }
  }, [user.tier]);

  // Live server verification handshake on mount
  useEffect(() => {
    void verifyServerSupporter();
  }, [verifyServerSupporter]);

  const activateLicense = useCallback(
    async (licenseKey: string) => {
      try {
        const res = await fetch("/api/supporter/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ licenseKey }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast({ tone: "error", title: data.error ?? "Activation failed" });
          return { ok: false, error: data.error };
        }

        // Immediately verify with server to guarantee authoritative confirmation
        await verifyServerSupporter();

        toast({
          tone: "success",
          title: "Supporter Perks Unlocked! ⭐",
          description: "Server confirmed: all Pro features, zero-config LAN & Wi-Fi hotspot are active.",
        });
        return { ok: true };
      } catch (e: any) {
        toast({ tone: "error", title: "Activation error", description: e.message });
        return { ok: false, error: e.message };
      }
    },
    [toast, verifyServerSupporter]
  );

  const setAutoCheck = useCallback((v: boolean) => {
    setAutoCheckState(v);
    window.localStorage.setItem("portside:autoCheck", v ? "1" : "0");
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("portside:theme", t);
      if (t === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  useEffect(() => {
    void isDesktopApp().then(setIsDesktop);
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
        if (typeof window !== "undefined") {
          window.localStorage.setItem("portside_tutorial_seen", "true");
        }
        setTutorialOpen(false);
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
      isSupporter,
      services,
      projects,
      appPort,
      checking,
      lastCheckedAt,
      autoCheck,
      setAutoCheck,
      isDesktop,
      theme,
      setTheme,
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
      lanOpen,
      openLan,
      closeLan,
      supportOpen,
      openSupport,
      closeSupport,
      hotspotOpen,
      openHotspot,
      closeHotspot,
      activateLicense,
      verifyServerSupporter,
    }),
    [
      user,
      isSupporter,
      services,
      projects,
      appPort,
      checking,
      lastCheckedAt,
      autoCheck,
      setAutoCheck,
      isDesktop,
      theme,
      setTheme,
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
      lanOpen,
      openLan,
      closeLan,
      supportOpen,
      openSupport,
      closeSupport,
      hotspotOpen,
      openHotspot,
      closeHotspot,
      activateLicense,
      verifyServerSupporter,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}