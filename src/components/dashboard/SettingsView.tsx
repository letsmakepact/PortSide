"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import QRCode from "qrcode";
import {
  Sliders,
  User,
  Sparkles,
  Wifi,
  Shield,
  Network,
  Info,
  CheckCircle2,
  XCircle,
  QrCode,
  Globe,
  Server,
  Lock,
  Radio,
  Tv,
  Check,
  Copy,
  ExternalLink,
  Palette,
  Code2,
  Share2,
  Layers,
  Link2,
  Megaphone,
  MapPin,
  Building2,
  ShieldCheck,
  Activity,
  Eye,
  Trash2,
  Plus,
  AtSign,
  Terminal,
  X,
  Smartphone,
  Laptop,
  KeyRound,
  RefreshCw,
  Zap,
  SlidersHorizontal,
  ArrowUpRight,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { useDashboard } from "./DashboardProvider";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, Input, Label, PageHeader } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { SupporterBadge } from "@/components/ui/SupporterBadge";
import { cn } from "@/lib/utils";

export function SettingsView({ initialTab }: { initialTab?: string } = {}) {
  const {
    user,
    setUser,
    isSupporter,
    activateLicense,
    verifyServerSupporter,
    openSupport,
    appPort,
    autoCheck,
    setAutoCheck,
    theme,
    setTheme,
    services,
  } = useDashboard();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "profile" | "supporter" | "hotspot" | "account" | "routing" | "about">(() => {
    if (initialTab && ["general", "profile", "supporter", "hotspot", "account", "routing", "about"].includes(initialTab)) {
      return initialTab as any;
    }
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab");
      if (p && ["general", "profile", "supporter", "hotspot", "account", "routing", "about"].includes(p)) {
        return p as any;
      }
    }
    return "general";
  });
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [isOnApp, setIsOnApp] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [activatingKey, setActivatingKey] = useState(false);
  const [rechecking, setRechecking] = useState(false);

  const [profileHandle, setProfileHandle] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [profileBannerUrl, setProfileBannerUrl] = useState("");
  const [profileBannerPreset, setProfileBannerPreset] = useState<"cyber-mesh" | "matrix-emerald" | "obsidian-glow" | "midnight-neon" | "pure-carbon">("cyber-mesh");
  const [profileAccentColor, setProfileAccentColor] = useState<"sky" | "emerald" | "violet" | "amber" | "rose" | "cyan">("sky");
  const [profileLocation, setProfileLocation] = useState("");
  const [profilePronouns, setProfilePronouns] = useState("");
  const [profileOrganization, setProfileOrganization] = useState("");
  const [profileStatusText, setProfileStatusText] = useState("Node Online & Active");
  const [profileStatusIndicator, setProfileStatusIndicator] = useState<"online" | "building" | "busy" | "away">("online");
  const [profileVerifiedBadgeText, setProfileVerifiedBadgeText] = useState("PortSide Verified Supporter");
  const [profileGithub, setProfileGithub] = useState("");
  const [profileTwitter, setProfileTwitter] = useState("");
  const [profileBmc, setProfileBmc] = useState("");
  const [profileWebsite, setProfileWebsite] = useState("");
  const [profileDiscord, setProfileDiscord] = useState("");
  const [profileTelegram, setProfileTelegram] = useState("");
  const [profileLinkedin, setProfileLinkedin] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSkills, setProfileSkills] = useState("");
  const [profileVisibleServices, setProfileVisibleServices] = useState<string[]>([]);
  const [profileProjectOverrides, setProfileProjectOverrides] = useState<Record<string, { title?: string; description?: string; tags?: string[]; featured?: boolean; repoUrl?: string }>>({});
  const [profileCustomLinks, setProfileCustomLinks] = useState<Array<{ id: string; label: string; url: string; description?: string }>>([]);
  const [profileShowProjects, setProfileShowProjects] = useState(true);
  const [profileProjectsTitle, setProfileProjectsTitle] = useState("Live Hosted Projects");
  const [profileProjectsSubtitle, setProfileProjectsSubtitle] = useState("Active projects hosted directly through PortSide.");
  const [profileSubTab, setProfileSubTab] = useState<"identity" | "links" | "projects" | "theme">("identity");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "pending" | "saving" | "saved" | "error">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const initialProfileLoadedRef = useRef(false);
  const lastSavedPayloadRef = useRef<string>("");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const [originalProfileHandle, setOriginalProfileHandle] = useState("");
  const [vanityChangesRemaining, setVanityChangesRemaining] = useState(1);
  const [vanityChangesUsed, setVanityChangesUsed] = useState(0);
  const [nextVanityCost, setNextVanityCost] = useState(10);
  const [vanityModalOpen, setVanityModalOpen] = useState(false);
  const [vanityStep, setVanityStep] = useState<"confirm" | "input" | "fee">("confirm");
  const [newHandleInput, setNewHandleInput] = useState("");
  const [vanityError, setVanityError] = useState<string | null>(null);
  const [savingHandle, setSavingHandle] = useState(false);
  const [copiedShowcaseUrl, setCopiedShowcaseUrl] = useState(false);

  const [hotspotActive, setHotspotActive] = useState(false);
  const [hotspotSsid, setHotspotSsid] = useState("PortSide-DevNet");
  const [hotspotKey, setHotspotKey] = useState("portside123");
  const [showHotspotKey, setShowHotspotKey] = useState(false);
  const [copiedHotspotKey, setCopiedHotspotKey] = useState(false);
  const [loadingHotspot, setLoadingHotspot] = useState(false);
  const [savingHotspot, setSavingHotspot] = useState(false);
  const [savedHotspotMsg, setSavedHotspotMsg] = useState("");
  const [serverConfirmedHotspot, setServerConfirmedHotspot] = useState(false);
  const [publicTunnelUrl, setPublicTunnelUrl] = useState<string>("");
  const [copiedTunnel, setCopiedTunnel] = useState(false);
  const [hotspotCustomHost, setHotspotCustomHost] = useState("portside.test");
  const [savingCustomHost, setSavingCustomHost] = useState(false);
  const [savedCustomHostMsg, setSavedCustomHostMsg] = useState("");
  const [hotspotTelemetry, setHotspotTelemetry] = useState<any>(null);
  const [hotspotQrDataUrl, setHotspotQrDataUrl] = useState<string | null>(null);
  const [portalQrDataUrl, setPortalQrDataUrl] = useState<string | null>(null);
  const [hotspotSubTab, setHotspotSubTab] = useState<"config" | "custom_host" | "connect_qr" | "telemetry">("config");
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);
  const [copiedWifiPayload, setCopiedWifiPayload] = useState(false);

  const [diagData, setDiagData] = useState<any>(null);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [healing, setHealing] = useState(false);
  const [healReport, setHealReport] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setLoadingDiag(true);
    try {
      let res = await fetch("http://127.0.0.1:4242/api/pro/diagnostics").catch(() => null);
      if (!res || !res.ok) {
        res = await fetch("/api/diagnostics").catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setDiagData(data);
      }
    } catch {
    } finally {
      setLoadingDiag(false);
    }
  };

  const handleSelfHeal = async () => {
    setHealing(true);
    setHealReport(null);
    try {
      let res = await fetch("http://127.0.0.1:4242/api/pro/heal", { method: "POST" }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch("/api/diagnostics", { method: "POST" }).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setDiagData(data.diagnostics);
        setHealReport(data.actions?.join(" • ") || "Self-healing completed successfully.");
        toast({ tone: "success", title: "Self-Healing Completed", description: "Edge connectors recycled and network bypass verified." });
      } else {
        toast({ tone: "error", title: "Self-Healing Notice", description: "Could not complete all healing actions." });
      }
    } catch {
      toast({ tone: "error", title: "Healing Failed", description: "Could not communicate with background launcher." });
    } finally {
      setHealing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const current = new URLSearchParams(window.location.search).get("tab");
      if (current !== activeTab) {
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("tab", activeTab);
        window.history.replaceState(null, "", nextUrl.toString());
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "supporter" || activeTab === "routing") {
      fetchDiagnostics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "hotspot") return;
    setLoadingHotspot(true);
    fetch("/api/hotspot")
      .then((r) => r.json())
      .then((d) => {
        setServerConfirmedHotspot(Boolean(d.isSupporter && d.serverConfirmed));
        if (d.active !== undefined) setHotspotActive(d.active);
        if (d.ssid) setHotspotSsid(d.ssid);
        if (d.key && d.key !== "********") setHotspotKey(d.key);
        if (d.customHost) setHotspotCustomHost(d.customHost);
        if (d.publicTunnelUrl) setPublicTunnelUrl(d.publicTunnelUrl);
        if (d.qrDataUrl) setHotspotQrDataUrl(d.qrDataUrl);
        if (d.telemetry) setHotspotTelemetry(d.telemetry);
      })
      .catch(() => {
        setServerConfirmedHotspot(false);
      })
      .finally(() => setLoadingHotspot(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "hotspot") return;
    const escapeWifi = (str: string) => str.replace(/([\\;,":])/g, "\\$1");
    const wifiPayload = `WIFI:S:${escapeWifi(hotspotSsid)};T:WPA;P:${escapeWifi(hotspotKey)};;`;
    QRCode.toDataURL(wifiPayload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: { dark: "#0284c7", light: "#ffffff" },
    }).then(setHotspotQrDataUrl).catch(() => {});

    QRCode.toDataURL("http://192.168.137.1/lan", {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then(setPortalQrDataUrl).catch(() => {});
  }, [activeTab, hotspotSsid, hotspotKey]);

  // Hotspot Auto-Kill Leash: Heartbeat ping & window teardown beacon
  useEffect(() => {
    if (!hotspotActive) return;

    // Send heartbeat every 12s while app is open
    const interval = setInterval(() => {
      fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "heartbeat" }),
      }).catch(() => {});
    }, 12000);

    // Auto-kill Wi-Fi connection if user closes window/app, unless background service is active
    const handleUnload = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/hotspot",
          new Blob([JSON.stringify({ action: "teardown" })], { type: "application/json" })
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [hotspotActive]);

  useEffect(() => {
    if (activeTab !== "profile") return;
    setLoadingProfile(true);
    initialProfileLoadedRef.current = false;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          const p = d.profile;
          setProfileHandle(p.handle || "");
          setOriginalProfileHandle(p.handle || "");
          setVanityChangesUsed(d.vanityChangesUsed ?? p.vanityChangesUsed ?? 0);
          setVanityChangesRemaining(d.vanityChangesRemaining ?? 1);
          if (typeof d.nextVanityCost === "number") {
            setNextVanityCost(d.nextVanityCost);
          }
          setProfileName(p.name || "");
          setProfileTitle(p.title || "");
          setProfileBio(p.bio || "");
          setProfileAvatarUrl(p.avatarUrl || "");
          setProfileBannerUrl(p.bannerUrl || "");
          setProfileBannerPreset(p.bannerPreset || "cyber-mesh");
          setProfileAccentColor(p.accentColor || "sky");
          setProfileLocation(p.location || "");
          setProfilePronouns(p.pronouns || "");
          setProfileOrganization(p.organization || "");
          setProfileStatusText(p.statusText || "Node Online & Active");
          setProfileStatusIndicator(p.statusIndicator || "online");
          setProfileVerifiedBadgeText(p.verifiedBadgeText || "PortSide Verified Supporter");
          setProfileGithub(p.github || "");
          setProfileTwitter(p.twitter || "");
          setProfileBmc(p.buymeacoffee || "");
          setProfileWebsite(p.website || "");
          setProfileDiscord(p.discord || "");
          setProfileTelegram(p.telegram || "");
          setProfileLinkedin(p.linkedin || "");
          setProfileEmail(p.email || "");
          const initialSkills = Array.isArray(p.skills) ? p.skills.join(", ") : "";
          setProfileSkills(initialSkills);
          setProfileVisibleServices(p.visibleServices || []);
          setProfileProjectOverrides(p.projectOverrides || {});
          setProfileCustomLinks(p.customLinks || []);
          setProfileShowProjects(p.showProjects !== false);
          setProfileProjectsTitle(p.projectsTitle || "Live Hosted Projects");
          setProfileProjectsSubtitle(p.projectsSubtitle || "Active projects hosted directly through PortSide. Open and test in real-time.");

          const initialObj = {
            handle: p.handle || "",
            name: p.name || "",
            title: p.title || "",
            bio: p.bio || "",
            avatarUrl: p.avatarUrl || "",
            bannerUrl: p.bannerUrl || "",
            bannerPreset: p.bannerPreset || "cyber-mesh",
            accentColor: p.accentColor || "sky",
            location: p.location || "",
            pronouns: p.pronouns || "",
            organization: p.organization || "",
            statusText: p.statusText || "Node Online & Active",
            statusIndicator: p.statusIndicator || "online",
            verifiedBadgeText: p.verifiedBadgeText || "PortSide Verified Supporter",
            github: p.github || "",
            twitter: p.twitter || "",
            buymeacoffee: p.buymeacoffee || "",
            website: p.website || "",
            discord: p.discord || "",
            telegram: p.telegram || "",
            linkedin: p.linkedin || "",
            email: p.email || "",
            skills: Array.isArray(p.skills) ? p.skills : [],
            visibleServices: p.visibleServices || [],
            projectOverrides: p.projectOverrides || {},
            customLinks: p.customLinks || [],
            showProjects: p.showProjects !== false,
            projectsTitle: p.projectsTitle || "Live Hosted Projects",
            projectsSubtitle: p.projectsSubtitle || "Active projects hosted directly through PortSide. Open and test in real-time.",
          };
          lastSavedPayloadRef.current = JSON.stringify(initialObj);
          setAutosaveStatus("saved");
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingProfile(false);
        setTimeout(() => {
          initialProfileLoadedRef.current = true;
        }, 150);
      });
  }, [activeTab]);

  const buildProfilePayload = useCallback(() => {
    const skillsArray = profileSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      handle: profileHandle,
      name: profileName,
      title: profileTitle,
      bio: profileBio,
      avatarUrl: profileAvatarUrl,
      bannerUrl: profileBannerUrl,
      bannerPreset: profileBannerPreset,
      accentColor: profileAccentColor,
      location: profileLocation,
      pronouns: profilePronouns,
      organization: profileOrganization,
      statusText: profileStatusText,
      statusIndicator: profileStatusIndicator,
      verifiedBadgeText: profileVerifiedBadgeText,
      github: profileGithub,
      twitter: profileTwitter,
      buymeacoffee: profileBmc,
      website: profileWebsite,
      discord: profileDiscord,
      telegram: profileTelegram,
      linkedin: profileLinkedin,
      email: profileEmail,
      skills: skillsArray,
      visibleServices: profileVisibleServices,
      projectOverrides: profileProjectOverrides,
      customLinks: profileCustomLinks,
      showProjects: profileShowProjects,
      projectsTitle: profileProjectsTitle,
      projectsSubtitle: profileProjectsSubtitle,
    };
  }, [
    profileHandle,
    profileName,
    profileTitle,
    profileBio,
    profileAvatarUrl,
    profileBannerUrl,
    profileBannerPreset,
    profileAccentColor,
    profileLocation,
    profilePronouns,
    profileOrganization,
    profileStatusText,
    profileStatusIndicator,
    profileVerifiedBadgeText,
    profileGithub,
    profileTwitter,
    profileBmc,
    profileWebsite,
    profileDiscord,
    profileTelegram,
    profileLinkedin,
    profileEmail,
    profileSkills,
    profileVisibleServices,
    profileProjectOverrides,
    profileCustomLinks,
    profileShowProjects,
    profileProjectsTitle,
    profileProjectsSubtitle,
  ]);

  const savePublicProfile = useCallback(
    async (e?: FormEvent, isAutosave = false) => {
      if (e) e.preventDefault();
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      if (!isAutosave) setSavingProfile(true);
      setAutosaveStatus("saving");

      try {
        const payload = buildProfilePayload();
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          lastSavedPayloadRef.current = JSON.stringify(payload);
          setAutosaveStatus("saved");
          setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

          if (data.profile?.handle) {
            setProfileHandle(data.profile.handle);
            setOriginalProfileHandle(data.profile.handle);
          }
          if (typeof data.vanityChangesRemaining === "number") {
            setVanityChangesRemaining(data.vanityChangesRemaining);
          }
          if (typeof data.vanityChangesUsed === "number") {
            setVanityChangesUsed(data.vanityChangesUsed);
          }
          if (typeof data.nextVanityCost === "number") {
            setNextVanityCost(data.nextVanityCost);
          }
          if (!isAutosave) {
            toast({
              tone: "success",
              title: "Public Profile Saved",
              description: "Your custom showcase changes are live immediately.",
            });
          }
        } else {
          setAutosaveStatus("error");
          if (!isAutosave) {
            toast({
              tone: "error",
              title: "Save Failed",
              description: data.error || "Failed to save profile changes.",
            });
          }
        }
      } catch (err: any) {
        setAutosaveStatus("error");
        if (!isAutosave) {
          toast({
            tone: "error",
            title: "Save Failed",
            description: err?.message || "Failed to save profile.",
          });
        }
      } finally {
        isSavingRef.current = false;
        if (!isAutosave) setSavingProfile(false);
      }
    },
    [buildProfilePayload, toast]
  );

  // Debounced Autosave Effect
  useEffect(() => {
    if (activeTab !== "profile" || !initialProfileLoadedRef.current) return;

    const currentPayload = JSON.stringify(buildProfilePayload());
    if (currentPayload === lastSavedPayloadRef.current) {
      return;
    }

    setAutosaveStatus("pending");
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      savePublicProfile(undefined, true);
    }, 750);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [activeTab, buildProfilePayload, savePublicProfile]);

  // Window unload flusher for any pending changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (autosaveStatus === "pending") {
        const payload = buildProfilePayload();
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/profile",
            new Blob([JSON.stringify(payload)], { type: "application/json" })
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [autosaveStatus, buildProfilePayload]);

  function openVanityFlow() {
    setVanityError(null);
    if (!isSupporter) {
      openSupport();
      return;
    }
    // If no free changes remaining, direct to fee warning modal
    if (vanityChangesRemaining <= 0) {
      setVanityStep("fee");
    } else {
      setVanityStep("confirm");
    }
    setNewHandleInput(profileHandle);
    setVanityModalOpen(true);
  }

  function handleConfirmChange() {
    setVanityError(null);
    setNewHandleInput(profileHandle);
    setVanityStep("input");
  }

  async function submitNewHandle(e: FormEvent) {
    e.preventDefault();
    const clean = newHandleInput.toLowerCase().trim().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    if (!clean) {
      setVanityError("Username cannot be empty.");
      return;
    }
    if (clean.length < 3) {
      setVanityError("Username must be at least 3 characters long.");
      return;
    }
    if (clean === profileHandle) {
      setVanityModalOpen(false);
      return;
    }
    setSavingHandle(true);
    setVanityError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: clean }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setProfileHandle(clean);
        setOriginalProfileHandle(clean);
        if (typeof data.vanityChangesRemaining === "number") {
          setVanityChangesRemaining(data.vanityChangesRemaining);
        } else {
          setVanityChangesRemaining((prev) => Math.max(0, prev - 1));
        }
        if (typeof data.vanityChangesUsed === "number") {
          setVanityChangesUsed(data.vanityChangesUsed);
        } else {
          setVanityChangesUsed((prev) => prev + 1);
        }
        if (typeof data.nextVanityCost === "number") {
          setNextVanityCost(data.nextVanityCost);
        }
        setVanityModalOpen(false);
        toast({
          tone: "success",
          title: "Username Updated",
          description: `Your vanity handle is now "${clean}".`,
        });
      } else {
        setVanityError(data.error || "Failed to update username.");
      }
    } catch (err: any) {
      setVanityError(err?.message || "Failed to update username.");
    } finally {
      setSavingHandle(false);
    }
  }

  function toggleServiceVisibility(hostname: string) {
    setProfileVisibleServices((prev) => {
      if (prev.includes(hostname)) {
        return prev.filter((h) => h !== hostname);
      } else {
        return [...prev, hostname];
      }
    });
  }

  function updateProjectOverride(hostname: string, field: string, val: any) {
    setProfileProjectOverrides((prev) => ({
      ...prev,
      [hostname]: {
        ...(prev[hostname] || {}),
        [field]: val,
      },
    }));
  }

  function addCustomLink() {
    setProfileCustomLinks((prev) => [
      ...prev,
      { id: Date.now().toString(), label: "New Resource Link", url: "https://", description: "" },
    ]);
  }

  function removeCustomLink(id: string) {
    setProfileCustomLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function updateCustomLink(id: string, field: "label" | "url" | "description", val: string) {
    setProfileCustomLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: val } : l))
    );
  }

  async function toggleHotspot() {
    setSavingHotspot(true);
    setSavedHotspotMsg("");
    try {
      const res = await fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !hotspotActive, ssid: hotspotSsid, key: hotspotKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 || data.requiresSupporter) {
          setServerConfirmedHotspot(false);
          openSupport();
          return;
        }
      } else {
        setHotspotActive(data.active);
        setServerConfirmedHotspot(true);
        setSavedHotspotMsg(data.active ? "Hotspot broadcasting live!" : "Hotspot stopped.");
        toast({
          tone: "success",
          title: data.active ? "Hotspot Active" : "Hotspot Stopped",
          description: data.active ? `Broadcasting SSID "${hotspotSsid}"` : "Hotspot disabled.",
        });
        setTimeout(() => setSavedHotspotMsg(""), 3000);
      }
    } catch {
      toast({ tone: "error", title: "Failed to toggle hotspot" });
    } finally {
      setSavingHotspot(false);
    }
  }

  async function saveHotspotSettings(e: FormEvent) {
    e.preventDefault();
    if (hotspotKey.length < 8) {
      toast({ tone: "error", title: "Wi-Fi password must be at least 8 characters long." });
      return;
    }
    setSavingHotspot(true);
    setSavedHotspotMsg("");
    try {
      const res = await fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: hotspotActive, ssid: hotspotSsid, key: hotspotKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedHotspotMsg("Settings saved to machine.");
        toast({ tone: "success", title: "Wi-Fi Hotspot configuration saved" });
        setTimeout(() => setSavedHotspotMsg(""), 3000);
      } else {
        toast({ tone: "error", title: data.error ?? "Failed to save hotspot settings" });
      }
    } catch {
      toast({ tone: "error", title: "Failed to save hotspot settings" });
    } finally {
      setSavingHotspot(false);
    }
  }

  function generateRandomKey() {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setHotspotKey(gen);
    toast({ tone: "info", title: "New WPA2 Key Generated", description: "Click 'Save Wi-Fi Config' to apply." });
  }

  function resetDefaultSsid() {
    setHotspotSsid("PortSide-DevNet");
    toast({ tone: "info", title: "SSID Reset", description: "Default SSID 'PortSide-DevNet' restored." });
  }

  async function saveCustomHostSettings(e: FormEvent) {
    e.preventDefault();
    if (!isSupporter) {
      openSupport();
      return;
    }
    const clean = hotspotCustomHost.toLowerCase().trim().replace(/[^a-z0-9.-]/g, "").slice(0, 48);
    if (!clean) {
      toast({ tone: "error", title: "Domain cannot be empty" });
      return;
    }
    setSavingCustomHost(true);
    setSavedCustomHostMsg("");
    try {
      const res = await fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customHost: clean }),
      });
      const data = await res.json();
      if (res.ok) {
        setHotspotCustomHost(data.customHost || clean);
        setSavedCustomHostMsg("Custom host saved!");
        toast({ tone: "success", title: "Custom Host Configured", description: `Subdomains now route via *.${data.customHost || clean}` });
        setTimeout(() => setSavedCustomHostMsg(""), 3000);
      } else {
        toast({ tone: "error", title: data.error ?? "Failed to save custom host" });
      }
    } catch {
      toast({ tone: "error", title: "Network error saving custom host" });
    } finally {
      setSavingCustomHost(false);
    }
  }

  function copyHotspotPassword() {
    navigator.clipboard.writeText(hotspotKey);
    setCopiedHotspotKey(true);
    toast({ tone: "info", title: "Password copied to clipboard" });
    setTimeout(() => setCopiedHotspotKey(false), 2000);
  }

  function copyHotspotPayload() {
    const escapeWifi = (str: string) => str.replace(/([\\;,":])/g, "\\$1");
    const wifiPayload = `WIFI:S:${escapeWifi(hotspotSsid)};T:WPA;P:${escapeWifi(hotspotKey)};;`;
    navigator.clipboard.writeText(wifiPayload);
    setCopiedWifiPayload(true);
    toast({ tone: "info", title: "Wi-Fi QR Payload Copied" });
    setTimeout(() => setCopiedWifiPayload(false), 2000);
  }

  const example = services[0];
  useEffect(() => {
    const isLocal = typeof window !== "undefined" && (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".localhost") ||
      window.location.hostname.endsWith(".local")
    );
    fetch("/api/updates/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.isExe !== undefined) {
          setIsOnApp(Boolean(d.isExe || isLocal));
        } else {
          setIsOnApp(isLocal);
        }
      })
      .catch(() => {
        setIsOnApp(isLocal);
      });
  }, []);

  const portSuffix = appPort !== "80" ? `:${appPort}` : "";

  async function checkForUpdates() {
    setCheckingUpdate(true);
    setUpdateStatus(null);
    try {
      const res = await fetch("/api/updates/check");
      const data = await res.json();
      if (data.updateAvailable) {
        setUpdateStatus(`Update available: v${data.latestVersion}! Click below to view.`);
        toast({ tone: "info", title: `New version v${data.latestVersion} available!` });
      } else {
        setUpdateStatus(`You are on the latest version (v${data.currentVersion}).`);
        toast({ tone: "success", title: "Portside is up to date." });
      }
    } catch {
      setUpdateStatus("Could not reach update server.");
      toast({ tone: "error", title: "Error checking for updates" });
    } finally {
      setCheckingUpdate(false);
    }
  }

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    const prev = user;
    setUser({ ...user, name });
    const res = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (!res.ok) {
      setUser(prev);
      toast({ tone: "error", title: data.error ?? "Couldn't update profile" });
    } else {
      toast({ tone: "success", title: "Profile updated" });
    }
    setSavingName(false);
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setSavingPw(true);
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) toast({ tone: "error", title: data.error ?? "Couldn't change password" });
    else {
      toast({ tone: "success", title: "Password changed" });
      setCurrentPassword("");
      setNewPassword("");
    }
    setSavingPw(false);
  }

  async function handleActivate(e: FormEvent) {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    setActivatingKey(true);
    const res = await activateLicense(licenseKey.trim());
    if (res.ok) {
      setLicenseKey("");
    }
    setActivatingKey(false);
  }

  async function handleReverify() {
    setRechecking(true);
    const confirmed = await verifyServerSupporter();
    if (confirmed) {
      toast({ tone: "success", title: "Server Confirmed", description: "Supporter license verified by the server." });
    } else {
      toast({ tone: "info", title: "Free Tier Confirmed", description: "Server verified instance is on Free tier." });
    }
    setRechecking(false);
  }

  const tabs = [
    { id: "general", label: "Preferences", icon: Sliders },
    { id: "profile", label: "Public Profile", icon: User },
    { id: "supporter", label: "Supporter Perks", icon: Sparkles },
    { id: "hotspot", label: "Wi-Fi Hotspot", icon: Wifi },
    { id: "account", label: "Account", icon: Shield },
    { id: "routing", label: "Proxy Routing", icon: Network },
    { id: "about", label: "Updates & About", icon: Info },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your dashboard preferences, account security, and routing configuration." />

      <nav aria-label="Settings Tabs" className="flex flex-wrap items-center gap-1 p-1 rounded-md bg-[#0b0f17] border border-[#1f2937]">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors shrink-0 sm:shrink",
                isActive
                  ? "bg-[#161f30] text-white border border-[#27354a]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#111827] border border-transparent",
              )}
            >
              <IconComp className={cn("h-3.5 w-3.5", isActive ? "text-sky-400" : "text-slate-500")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {activeTab === "general" && (
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose your preferred dashboard interface style.</p>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-lg border p-3.5 text-left transition-all cursor-pointer",
                  theme === "light"
                    ? "border-sky-500 bg-sky-500/10 text-slate-900 ring-1 ring-sky-500/50 dark:border-sky-500 dark:bg-sky-500/15 dark:text-white"
                    : "border-slate-200 bg-brand-surface text-slate-600 hover:bg-brand-bg dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-800/40",
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-800 border border-slate-200 shadow-xs dark:bg-slate-900 dark:text-amber-400 dark:border-slate-800 shrink-0">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Light Mode</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Clean light theme</p>
                </div>
                <span className={cn(
                  "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                  theme === "light"
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-slate-300 dark:border-slate-700 bg-transparent"
                )}>
                  {theme === "light" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-lg border p-3.5 text-left transition-all cursor-pointer",
                  theme === "dark"
                    ? "border-sky-500 bg-sky-500/10 text-slate-900 ring-1 ring-sky-500/50 dark:border-sky-500 dark:bg-sky-500/15 dark:text-white"
                    : "border-slate-200 bg-brand-surface text-slate-600 hover:bg-brand-bg dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-800/40",
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sky-400 border border-slate-800 shrink-0">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Bluish Black Dark</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">High-contrast dark theme</p>
                </div>
                <span className={cn(
                  "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                  theme === "dark"
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-slate-300 dark:border-slate-700 bg-transparent"
                )}>
                  {theme === "dark" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Background Health Monitor</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Portside periodically probes each registered local port every 15 seconds to log latency and connectivity transitions.</p>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-lg border border-slate-200/90 bg-slate-50/50 p-3.5 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-[#0f172a]/50 dark:hover:bg-slate-800/40">
              <div>
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Automatic health checks</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Turn off to only check ports when you explicitly click “Check now”.</span>
              </div>
              <span
                role="switch"
                aria-checked={autoCheck}
                onClick={() => setAutoCheck(!autoCheck)}
                className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", autoCheck ? "bg-slate-900 dark:bg-sky-500" : "bg-slate-300 dark:bg-slate-800")}
              >
                <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform", autoCheck ? "translate-x-4.5" : "translate-x-0.5")} />
              </span>
            </label>
          </Card>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="space-y-4">
          {/* Top Compact Studio Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-xl border border-white/10 bg-[#070b14]/90 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 font-mono text-sm shrink-0">
                ⌘
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-tight truncate">
                    Developer Showcase Studio
                  </h2>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Manage your public portfolio, verified identity, and live services.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-950/30 px-2.5 py-1 text-xs font-mono text-sky-300">
                <Globe className="h-3 w-3 text-sky-400 shrink-0" />
                <span className="truncate max-w-[200px]">
                  {publicTunnelUrl || (profileHandle ? `https://${profileHandle}.portside.lol` : "https://*.portside.lol")}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const url = publicTunnelUrl || (profileHandle ? `https://${profileHandle}.portside.lol` : "");
                  if (url) {
                    navigator.clipboard.writeText(url);
                    setCopiedShowcaseUrl(true);
                    toast({ tone: "success", title: "Showcase URL copied to clipboard", description: url });
                    setTimeout(() => setCopiedShowcaseUrl(false), 2000);
                  }
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer",
                  copiedShowcaseUrl
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                {copiedShowcaseUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedShowcaseUrl ? "Copied" : "Copy Link"}</span>
              </button>

              <a
                href={publicTunnelUrl || (profileHandle ? `https://${profileHandle}.portside.lol` : "/profile")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Visit</span>
              </a>

              {/* Live Autosave Status Indicator */}
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition select-none",
                  autosaveStatus === "saving"
                    ? "border-sky-500/30 bg-sky-950/40 text-sky-300"
                    : autosaveStatus === "pending"
                    ? "border-amber-500/30 bg-amber-950/40 text-amber-300"
                    : autosaveStatus === "error"
                    ? "border-rose-500/40 bg-rose-950/40 text-rose-300"
                    : "border-emerald-500/25 bg-emerald-950/30 text-emerald-400"
                )}
              >
                {autosaveStatus === "saving" ? (
                  <span className="flex items-center gap-1.5 text-sky-300">
                    <RefreshCw className="h-3 w-3 animate-spin text-sky-400" />
                    <span>Autosaving...</span>
                  </span>
                ) : autosaveStatus === "pending" ? (
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Saving changes...</span>
                  </span>
                ) : autosaveStatus === "error" ? (
                  <button
                    type="button"
                    onClick={() => savePublicProfile()}
                    className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 transition cursor-pointer"
                    title="Autosave failed. Click to retry."
                  >
                    <AlertTriangle className="h-3 w-3 text-rose-400" />
                    <span>Save failed (retry)</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Autosaved{lastSavedTime ? ` · ${lastSavedTime}` : ""}</span>
                  </span>
                )}
              </div>

              <Button
                onClick={() => savePublicProfile()}
                loading={savingProfile}
                className="text-xs px-3.5 py-1.5 shadow-sm"
                title="Force save immediately"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Save All
              </Button>
            </div>
          </div>

          {loadingProfile ? (
            <Card className="p-16 text-center text-xs text-slate-400 border border-white/10 bg-[#0c121e]">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                <p className="font-medium">Loading profile configuration...</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: DENSE EDITOR (7 COLS) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 4 Crisp Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#070b14] border border-white/10">
                  {[
                    { id: "identity", label: "Identity & Bio", icon: User },
                    { id: "links", label: "Links & Socials", icon: Link2, count: profileCustomLinks.length + (profileGithub ? 1 : 0) + (profileTwitter ? 1 : 0) + (profileDiscord ? 1 : 0) + (profileTelegram ? 1 : 0) },
                    { id: "projects", label: "Hosted Services", icon: Layers, count: profileVisibleServices.length },
                    { id: "theme", label: "Theme & Style", icon: Palette },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = profileSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setProfileSubTab(tab.id as any)}
                        className={cn(
                          "flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer",
                          isActive
                            ? "bg-white/10 text-white shadow-xs border border-white/15"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", isActive ? "text-sky-400" : "text-slate-500")} />
                        <span className="truncate">{tab.label}</span>
                        {typeof tab.count === "number" && tab.count > 0 && (
                          <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: IDENTITY & BIO */}
                {profileSubTab === "identity" && (
                  <div className="space-y-4">
                    {/* Handle & Subdomain Selector */}
                    <div className="p-4 rounded-xl border border-white/10 bg-[#070b14]/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AtSign className="h-3.5 w-3.5 text-sky-400" />
                          <span className="text-xs font-bold text-white">Direct Handle & Subdomain</span>
                        </div>
                        {isSupporter ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                            {vanityChangesRemaining > 0 ? "1 Free Change Remaining" : "Change Fee Required"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" /> Supporter Perk
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-white/5 bg-slate-950/60 font-mono text-xs">
                        <div className="flex items-center gap-1 text-slate-400 truncate">
                          <span>https://</span>
                          <span className="text-sky-300 font-bold">{isSupporter ? (profileHandle || "handle") : "your-handle"}</span>
                          <span>.portside.lol</span>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={openVanityFlow}
                          className="text-[11px] h-7 px-2.5 border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 shrink-0"
                        >
                          {isSupporter ? "Change Handle" : "Claim Subdomain"}
                        </Button>
                      </div>
                    </div>

                    {/* Basic Info (Name, Title, Bio) */}
                    <div className="p-4 rounded-xl border border-white/10 bg-[#070b14]/80 space-y-3.5">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                        <User className="h-3.5 w-3.5 text-violet-400" />
                        <span className="text-xs font-bold text-white">Profile Identity</span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="profName" className="text-[11px] text-slate-300">Display Name</Label>
                          <Input
                            id="profName"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="e.g. pact or Elena Rostova"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-9 mt-1"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="profTitle" className="text-[11px] text-slate-300">Professional Headline</Label>
                          <Input
                            id="profTitle"
                            value={profileTitle}
                            onChange={(e) => setProfileTitle(e.target.value)}
                            placeholder="e.g. Systems Architect & Kernel Dev"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-9 mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="profBio" className="text-[11px] text-slate-300">About Me / Bio</Label>
                          <span className="font-mono text-[10px] text-slate-500">{profileBio.length} / 500</span>
                        </div>
                        <textarea
                          id="profBio"
                          rows={3}
                          maxLength={500}
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-slate-950/60 p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40 focus:border-sky-500 mt-1 resize-none leading-relaxed"
                          placeholder="Share your engineering focus, favorite tech stack, or projects..."
                        />
                      </div>

                      {/* Location, Org, Pronouns */}
                      <div className="grid gap-3 sm:grid-cols-3 pt-1">
                        <div>
                          <Label htmlFor="profLoc" className="text-[11px] text-slate-300 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" /> Location
                          </Label>
                          <Input
                            id="profLoc"
                            value={profileLocation}
                            onChange={(e) => setProfileLocation(e.target.value)}
                            placeholder="Node #1"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="profOrg" className="text-[11px] text-slate-300 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-slate-400" /> Organization
                          </Label>
                          <Input
                            id="profOrg"
                            value={profileOrganization}
                            onChange={(e) => setProfileOrganization(e.target.value)}
                            placeholder="PortSide"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="profPronouns" className="text-[11px] text-slate-300">Pronouns</Label>
                          <Input
                            id="profPronouns"
                            value={profilePronouns}
                            onChange={(e) => setProfilePronouns(e.target.value)}
                            placeholder="he/him"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Presence & Status Message */}
                    <div className="p-4 rounded-xl border border-white/10 bg-[#070b14]/80 space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                        <Activity className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-xs font-bold text-white">Presence & Operational Status</span>
                      </div>

                      {/* 4 Compact Status Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "online", label: "Online", activeClass: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" },
                          { id: "building", label: "Building", activeClass: "border-amber-500/50 bg-amber-500/15 text-amber-300" },
                          { id: "busy", label: "Focus", activeClass: "border-rose-500/50 bg-rose-500/15 text-rose-300" },
                          { id: "away", label: "Standby", activeClass: "border-slate-500/50 bg-slate-500/15 text-slate-300" },
                        ].map((st) => {
                          const isSelected = profileStatusIndicator === st.id;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setProfileStatusIndicator(st.id as any)}
                              className={cn(
                                "py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer select-none text-center",
                                isSelected
                                  ? cn(st.activeClass, "shadow-xs")
                                  : "border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20 hover:text-white"
                              )}
                            >
                              <span>{st.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Status Message & Quick Presets */}
                      <div className="space-y-1.5 pt-1">
                        <Label htmlFor="profStatusText" className="text-[11px] text-slate-300">Broadcast Message</Label>
                        <Input
                          id="profStatusText"
                          value={profileStatusText}
                          onChange={(e) => setProfileStatusText(e.target.value)}
                          placeholder="e.g. Building PortSide Edge Tunnels"
                          className="bg-slate-950/60 border-white/10 text-white text-xs h-8"
                        />
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {[
                            "Building PortSide Edge Tunnels",
                            "Compiling Direct Binaries",
                            "Reviewing Architecture",
                            "Node Standby",
                          ].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setProfileStatusText(preset)}
                              className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: LINKS & SOCIALS */}
                {profileSubTab === "links" && (
                  <div className="space-y-4">
                    {/* Social Profiles Grid */}
                    <div className="p-4 rounded-xl border border-white/10 bg-[#070b14]/80 space-y-3">
                      <div className="border-b border-white/5 pb-2.5">
                        <h3 className="text-xs font-bold text-white">Social & Network Accounts</h3>
                        <p className="text-[11px] text-slate-400">Leave blank any platform you don&apos;t want to show.</p>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <div>
                          <Label className="text-[11px] text-slate-300">GitHub</Label>
                          <Input
                            value={profileGithub}
                            onChange={(e) => setProfileGithub(e.target.value)}
                            placeholder="https://github.com/username"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] text-slate-300">X / Twitter</Label>
                          <Input
                            value={profileTwitter}
                            onChange={(e) => setProfileTwitter(e.target.value)}
                            placeholder="https://x.com/username"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] text-slate-300">Telegram</Label>
                          <Input
                            value={profileTelegram}
                            onChange={(e) => setProfileTelegram(e.target.value)}
                            placeholder="https://t.me/username"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] text-slate-300">Discord</Label>
                          <Input
                            value={profileDiscord}
                            onChange={(e) => setProfileDiscord(e.target.value)}
                            placeholder="https://discord.gg/... or username"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] text-slate-300">Buy Me a Coffee / Sponsor</Label>
                          <Input
                            value={profileBmc}
                            onChange={(e) => setProfileBmc(e.target.value)}
                            placeholder="https://buymeacoffee.com/username"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] text-slate-300">Website URL</Label>
                          <Input
                            value={profileWebsite}
                            onChange={(e) => setProfileWebsite(e.target.value)}
                            placeholder="https://your-domain.com"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] text-slate-300">LinkedIn</Label>
                          <Input
                            value={profileLinkedin}
                            onChange={(e) => setProfileLinkedin(e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] text-slate-300">Public Contact Email</Label>
                          <Input
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            placeholder="dev@example.com"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Custom Links Section */}
                    <div className="p-4 rounded-xl border border-white/10 bg-[#070b14]/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <div>
                          <h3 className="text-xs font-bold text-white">Custom Resource Links</h3>
                          <p className="text-[11px] text-slate-400">Documentation, blogs, architecture notes, or repos.</p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={addCustomLink}
                          className="text-[11px] h-7 px-2.5 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Link
                        </Button>
                      </div>

                      {profileCustomLinks.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">
                          No custom links added yet. Click &quot;Add Link&quot; above.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {profileCustomLinks.map((link) => (
                            <div key={link.id} className="p-3 rounded-lg border border-white/10 bg-slate-950/50 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                                  <Link2 className="h-3 w-3 text-sky-400" />
                                  Link Item
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeCustomLink(link.id)}
                                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="h-2.5 w-2.5" /> Remove
                                </button>
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                <Input
                                  value={link.label}
                                  onChange={(e) => updateCustomLink(link.id, "label", e.target.value)}
                                  placeholder="Link Label (e.g. Documentation)"
                                  className="bg-[#070b14] border-white/10 text-white text-xs h-8"
                                />
                                <Input
                                  value={link.url}
                                  onChange={(e) => updateCustomLink(link.id, "url", e.target.value)}
                                  placeholder="Destination URL (https://...)"
                                  className="bg-[#070b14] border-white/10 text-white text-xs h-8"
                                />
                              </div>
                              <Input
                                value={link.description || ""}
                                onChange={(e) => updateCustomLink(link.id, "description", e.target.value)}
                                placeholder="Optional description..."
                                className="bg-[#070b14] border-white/10 text-white text-xs h-8"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: HOSTED SERVICES */}
                {profileSubTab === "projects" && (
                  <div className="p-4 rounded-xl border border-white/10 bg-[#070b14]/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-xs font-bold text-white">Live Hosted Services</h3>
                        <p className="text-[11px] text-slate-400">Routes are private by default unless toggled visible.</p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer select-none bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                        <input
                          type="checkbox"
                          checked={profileShowProjects}
                          onChange={(e) => setProfileShowProjects(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                        />
                        <span>Show on Profile</span>
                      </label>
                    </div>

                    {profileShowProjects && (
                      <div className="space-y-3">
                        {/* Explanatory Guide Banner */}
                        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 flex items-center gap-2 text-xs text-slate-300">
                          <Lock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                          <span>
                            All routes start as <strong className="text-white">Private</strong>. Switch any service to <strong className="text-emerald-400">Public on Profile</strong> to show it on your public link.
                          </span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            value={profileProjectsTitle}
                            onChange={(e) => setProfileProjectsTitle(e.target.value)}
                            placeholder="Section Title"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8"
                          />
                          <Input
                            value={profileProjectsSubtitle}
                            onChange={(e) => setProfileProjectsSubtitle(e.target.value)}
                            placeholder="Section Subtitle"
                            className="bg-slate-950/60 border-white/10 text-white text-xs h-8"
                          />
                        </div>

                        {services.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">
                            No local services currently registered.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {services.map((svc) => {
                              const isVisible = profileVisibleServices.includes(svc.hostname);
                              const override = profileProjectOverrides[svc.hostname] || {};
                              return (
                                <div
                                  key={svc.id}
                                  className={cn(
                                    "p-3 rounded-lg border transition-all space-y-2.5",
                                    isVisible
                                      ? "border-emerald-500/30 bg-emerald-950/10 shadow-sm"
                                      : "border-white/10 bg-slate-950/60 hover:border-white/20"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className={cn(
                                        "flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs shrink-0 transition-colors",
                                        isVisible
                                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                          : "bg-sky-500/10 border border-sky-400/20 text-sky-400"
                                      )}>
                                        ⌘
                                      </span>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <p className="text-xs font-bold text-white leading-none truncate">{svc.name}</p>
                                          {isVisible ? (
                                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-medium">
                                              Public
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                                              Private
                                            </span>
                                          )}
                                        </div>
                                        <p className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                                          :{svc.port} · {svc.hostname}.localhost
                                        </p>
                                      </div>
                                    </div>

                                    {/* Visibility Segmented Control + Featured */}
                                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                                      {isVisible && (
                                        <label className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-md cursor-pointer transition hover:bg-amber-500/20">
                                          <input
                                            type="checkbox"
                                            checked={Boolean(override.featured)}
                                            onChange={(e) => updateProjectOverride(svc.hostname, "featured", e.target.checked)}
                                            className="h-3 w-3 rounded border-amber-500/40 bg-slate-900 text-amber-500 focus:ring-amber-500"
                                          />
                                          <span>Featured</span>
                                        </label>
                                      )}

                                      {/* Interactive Segmented Switch */}
                                      <div className="flex items-center rounded-lg border border-white/10 bg-black/60 p-0.5 shadow-inner">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (isVisible) toggleServiceVisibility(svc.hostname);
                                          }}
                                          className={cn(
                                            "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer",
                                            !isVisible
                                              ? "bg-slate-800 text-rose-300 border border-rose-500/40 shadow-xs"
                                              : "text-slate-400 hover:text-slate-200"
                                          )}
                                          title="Keep private (hidden from public profile)"
                                        >
                                          <Lock className="h-3 w-3 text-rose-400" />
                                          <span>Private</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!isVisible) toggleServiceVisibility(svc.hostname);
                                          }}
                                          className={cn(
                                            "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer",
                                            isVisible
                                              ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-xs"
                                              : "text-slate-400 hover:text-emerald-300 hover:bg-white/5"
                                          )}
                                          title="Publish to public profile"
                                        >
                                          <Eye className="h-3 w-3 text-emerald-400" />
                                          <span>Show on Profile</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid gap-2 sm:grid-cols-2 pt-1 border-t border-white/5">
                                    <Input
                                      className="text-xs h-7 bg-[#070b14] border-white/10 text-white"
                                      value={override.title || ""}
                                      onChange={(e) => updateProjectOverride(svc.hostname, "title", e.target.value)}
                                      placeholder="Display title override..."
                                    />
                                    <Input
                                      className="text-xs h-7 bg-[#070b14] border-white/10 text-white"
                                      value={override.repoUrl || ""}
                                      onChange={(e) => updateProjectOverride(svc.hostname, "repoUrl", e.target.value)}
                                      placeholder="GitHub repo link..."
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: THEME & STYLE */}
                {profileSubTab === "theme" && (
                  <div className="p-4 rounded-xl border border-white/10 bg-[#070b14]/80 space-y-4">
                    {/* Palette Swatches */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-white">Accent Palette</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {[
                          { id: "sky", label: "Sky", bg: "bg-sky-500" },
                          { id: "cyan", label: "Cyan", bg: "bg-cyan-500" },
                          { id: "emerald", label: "Emerald", bg: "bg-emerald-500" },
                          { id: "violet", label: "Violet", bg: "bg-violet-500" },
                          { id: "amber", label: "Amber", bg: "bg-amber-500" },
                          { id: "rose", label: "Rose", bg: "bg-rose-500" },
                        ].map((c) => {
                          const isSelected = profileAccentColor === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setProfileAccentColor(c.id as any)}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold transition cursor-pointer",
                                isSelected
                                  ? "border-white/50 bg-white/10 text-white ring-1 ring-white/20"
                                  : "border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20 hover:text-white"
                              )}
                            >
                              <span className={cn("h-3 w-3 rounded-full shrink-0", c.bg)} />
                              <span className="truncate">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Background Wallpaper Style Presets */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-white">Full-Page Background Wallpaper</Label>
                        <span className="text-[10px] text-sky-400 font-mono">Steam-Style Viewport</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Select an atmospheric backdrop preset or paste a custom artwork/animated GIF URL below to theme your entire public page.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: "cyber-mesh", label: "Cyber Mesh", gradient: "from-sky-950 via-indigo-950 to-slate-950" },
                          { id: "matrix-emerald", label: "Matrix Emerald", gradient: "from-emerald-950 via-teal-950 to-slate-950" },
                          { id: "midnight-neon", label: "Midnight Neon", gradient: "from-purple-950 via-indigo-950 to-slate-950" },
                          { id: "obsidian-glow", label: "Obsidian Glow", gradient: "from-slate-900 via-slate-950 to-black" },
                          { id: "pure-carbon", label: "Pure Carbon", gradient: "from-zinc-900 via-stone-950 to-black" },
                        ].map((b) => {
                          const isSelected = profileBannerPreset === b.id;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setProfileBannerPreset(b.id as any)}
                              className={cn(
                                "p-2 rounded-lg border text-left transition cursor-pointer",
                                isSelected
                                  ? "border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500/30"
                                  : "border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20"
                              )}
                            >
                              <div className={cn("h-5 w-full rounded bg-gradient-to-r mb-1.5 border border-white/10", b.gradient)} />
                              <p className="text-[11px] font-bold text-white truncate">{b.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Images (Wallpaper & Avatar) */}
                    <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-white/5">
                      <div>
                        <Label htmlFor="profAvatar" className="text-[11px] text-slate-300">Avatar Image URL</Label>
                        <Input
                          id="profAvatar"
                          value={profileAvatarUrl}
                          onChange={(e) => setProfileAvatarUrl(e.target.value)}
                          placeholder="https://github.com/username.png"
                          className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="profBanner" className="text-[11px] text-slate-300">Full-Page Wallpaper URL (Steam, GIFs, Art)</Label>
                        <Input
                          id="profBanner"
                          value={profileBannerUrl}
                          onChange={(e) => setProfileBannerUrl(e.target.value)}
                          placeholder="https://community.cloudflare.steamstatic.com/... or .gif"
                          className="bg-slate-950/60 border-white/10 text-white text-xs h-8 mt-1"
                        />
                      </div>
                    </div>

                    {/* Tech Stack Skills Tags */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <Label htmlFor="profSkills" className="text-[11px] text-slate-300">Tech Stack Skills (comma separated)</Label>
                      <Input
                        id="profSkills"
                        value={profileSkills}
                        onChange={(e) => setProfileSkills(e.target.value)}
                        placeholder="TypeScript, Next.js, Go, Tailwind CSS, PostgreSQL, Docker"
                        className="bg-slate-950/60 border-white/10 text-white text-xs h-8"
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        {profileSkills.split(",").map((s) => s.trim()).filter(Boolean).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-sky-300 border border-white/10"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const list = profileSkills.split(",").map((s) => s.trim()).filter(Boolean);
                                list.splice(idx, 1);
                                setProfileSkills(list.join(", "));
                              }}
                              className="text-slate-400 hover:text-rose-400 cursor-pointer"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: STICKY REAL-TIME LIVE PREVIEW (5 COLS) */}
              <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Eye className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Preview</span>
                </div>

                {/* Steam Profile Viewport Frame Preview */}
                <div 
                  className={cn(
                    "relative rounded-2xl border border-white/15 overflow-hidden shadow-2xl p-3 bg-cover bg-center transition-all min-h-[460px]",
                    !profileBannerUrl && profileBannerPreset === "matrix-emerald" && "bg-gradient-to-br from-emerald-950 via-teal-950 to-[#070b14]",
                    !profileBannerUrl && profileBannerPreset === "midnight-neon" && "bg-gradient-to-br from-purple-950 via-indigo-950 to-[#070b14]",
                    !profileBannerUrl && profileBannerPreset === "obsidian-glow" && "bg-gradient-to-br from-slate-900 via-slate-950 to-black",
                    !profileBannerUrl && profileBannerPreset === "pure-carbon" && "bg-gradient-to-br from-zinc-900 via-stone-950 to-black",
                    !profileBannerUrl && profileBannerPreset === "cyber-mesh" && "bg-gradient-to-br from-sky-950 via-indigo-950 to-[#070b14]"
                  )}
                  style={profileBannerUrl ? { backgroundImage: `url(${profileBannerUrl})` } : undefined}
                >
                  {/* Atmospheric Tint Overlay */}
                  <div className="absolute inset-0 bg-[#070b14]/75 backdrop-blur-[2px] pointer-events-none" />

                  {/* Frosted Steam Profile Inner Container */}
                  <div className="relative z-10 rounded-xl border border-white/15 bg-[#0b0f19]/85 backdrop-blur-xl shadow-2xl overflow-hidden">
                    {/* Top Atmospheric Header Strip */}
                    <div className="h-12 w-full relative bg-gradient-to-b from-white/10 to-transparent border-b border-white/5 flex items-center justify-end px-3">
                      <span className="inline-flex items-center rounded-full border border-white/15 bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-slate-200 shadow-sm">
                        <span className="truncate max-w-[140px]">{profileStatusText || "Online"}</span>
                      </span>
                    </div>

                  {/* Profile Card Body */}
                  <div className="p-4 space-y-3.5">
                    <div className="flex items-end justify-between gap-3 -mt-10">
                      <div className="h-14 w-14 rounded-xl border-2 border-sky-400/80 bg-slate-900 overflow-hidden shadow-xl shrink-0">
                        {profileAvatarUrl ? (
                          <img src={profileAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-base text-sky-400 bg-sky-950/40">
                            {(profileName || "P").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {isSupporter && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 shadow-xs">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>{profileVerifiedBadgeText || "Verified"}</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">{profileName || "Developer Name"}</h3>
                        {profilePronouns && <span className="text-[10px] text-slate-400 font-mono">({profilePronouns})</span>}
                      </div>
                      <p className="text-[11px] font-mono text-sky-400">@{profileHandle || "handle"}.portside.lol</p>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">{profileTitle || "Software Engineer & Builder"}</p>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mt-1.5">
                        {profileBio || "Building local infrastructure, distributed network routing, and edge tunnels."}
                      </p>
                    </div>

                    {/* Meta tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                      {profileLocation && (
                        <span className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 border border-white/10">
                          <MapPin className="h-2.5 w-2.5 text-slate-500" />
                          <span>{profileLocation}</span>
                        </span>
                      )}
                      {profileOrganization && (
                        <span className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 border border-white/10">
                          <Building2 className="h-2.5 w-2.5 text-slate-500" />
                          <span>{profileOrganization}</span>
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {profileSkills.split(",").map((s) => s.trim()).filter(Boolean).length > 0 && (
                      <div className="pt-2 border-t border-white/5">
                        <div className="flex flex-wrap gap-1">
                          {profileSkills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8).map((skill, idx) => (
                            <span key={idx} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-300 border border-white/10">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links preview */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">Connected Links</div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {profileGithub && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-slate-300 truncate">
                            <span className="text-sky-400 font-bold">GitHub</span>
                          </div>
                        )}
                        {profileTwitter && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-slate-300 truncate">
                            <span className="text-sky-400 font-bold">X / Twitter</span>
                          </div>
                        )}
                        {profileTelegram && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-slate-300 truncate">
                            <span className="text-sky-400 font-bold">Telegram</span>
                          </div>
                        )}
                        {profileDiscord && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-slate-300 truncate">
                            <span className="text-sky-400 font-bold">Discord</span>
                          </div>
                        )}
                        {profileBmc && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-slate-300 truncate">
                            <span className="text-amber-400 font-bold">BuyMeACoffee</span>
                          </div>
                        )}
                        {profileWebsite && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-slate-300 truncate">
                            <span className="text-emerald-400 font-bold">Website</span>
                          </div>
                        )}
                        {profileCustomLinks.map((l) => (
                          <div key={l.id} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-slate-300 truncate">
                            <span className="text-indigo-300 font-bold truncate">{l.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Hosted Services in Preview */}
                    {profileShowProjects && profileVisibleServices.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
                          <span>{profileProjectsTitle || "Hosted Services"}</span>
                          <span className="text-emerald-400 font-normal lowercase">{profileVisibleServices.length} public</span>
                        </div>
                        <div className="space-y-1">
                          {services.filter((s) => profileVisibleServices.includes(s.hostname)).map((s) => {
                            const override = profileProjectOverrides[s.hostname] || {};
                            return (
                              <div key={s.id} className="flex items-center justify-between px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-[11px]">
                                <span className="text-slate-200 font-medium truncate">{override.title || s.name}</span>
                                <span className="text-[9px] font-mono text-sky-400">:{s.port}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

      )}

      {activeTab === "supporter" && (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Current Tier Status</h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Your current PortSide instance license</p>
                </div>
                {isSupporter ? (
                  <SupporterBadge size="md" />
                ) : (
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Free Tier
                  </span>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {isSupporter
                    ? "Supporter tier is active on this instance."
                    : "You are currently on the Free tier."}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {isSupporter
                    ? "All perks are unlocked: dedicated custom subdomain, remote global hosting, zero-config Mobile & TV LAN access, Dev Wi-Fi hotspot, and unlimited routes."
                    : "Support PortSide for $5.99/mo on Buy Me a Coffee to unlock custom subdomains (*.portside.lol), remote global hosting, and all supporter perks, or enter a license key below."}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {!isSupporter ? (
                    <button
                      type="button"
                      onClick={openSupport}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition"
                    >
                      Become a Supporter for $5.99/mo on Buy Me a Coffee
                    </button>
                  ) : null}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReverify}
                    loading={rechecking}
                  >
                    Verify with Server
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Activate License Key</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Enter your supporter license key or Buy Me a Coffee code.
              </p>
              <form onSubmit={handleActivate} className="mt-4 space-y-3.5">
                <div>
                  <Label htmlFor="licenseKey">Cryptographic License Key</Label>
                  <Input
                    id="licenseKey"
                    placeholder="PSL1.eyJlbWFpbCI6... (Cryptographically signed key)"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    Keys are cryptographically signed and bound to your account email ({user.email}).
                  </p>
                </div>
                <Button type="submit" loading={activatingKey} disabled={!licenseKey.trim()}>
                  Activate Supporter Status
                </Button>
              </form>
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Supporter Perks & Features</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                </span>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Mobile & Smart TV LAN</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Instant launchpad and custom routing for testing on phones, tablets, and TV screens.
                </p>
                <span className="mt-3 inline-block font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isSupporter ? "Unlocked" : "Locked for Free tier"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
                </span>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Dev Wi-Fi Hotspot</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Spawn an isolated private network directly from your workstation.
                </p>
                <span className="mt-3 inline-block font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isSupporter ? "Unlocked" : "Locked for Free tier"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                </span>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Official Desktop App</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Standalone workstation app for background management and seamless operation.
                </p>
                <span className="mt-3 inline-block font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isSupporter ? "Unlocked" : "Included with monthly support"}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-sky-500/20 bg-slate-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 font-bold">
                  <Network className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Edge Connectivity & Self-Healing Diagnostics</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        diagData?.edgeConnected
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      )}
                    >
                      {diagData?.edgeConnected ? `${diagData?.edgeConnections || 4}/4 Edge Connectors Live` : "Diagnostics Warning"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time telemetry between your physical machine and the global edge routing matrix.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchDiagnostics}
                  loading={loadingDiag}
                >
                  Refresh Status
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSelfHeal}
                  loading={healing}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Run Self-Healing Sequence
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Local Workstation</span>
                  <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold", diagData?.localPort80Ready ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25" : "text-rose-400 bg-rose-500/10 border border-rose-500/25")}>
                    {diagData?.localPort80Ready ? "READY" : "OFFLINE"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-white">Port 80 (Node Server)</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {diagData?.localPort80Ready ? "Responding HTTP 200 OK" : "Port 80 offline"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Global Edge Tunnels</span>
                  <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold", diagData?.edgeConnected ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25" : "text-amber-400 bg-amber-500/10 border border-amber-500/25")}>
                    {diagData?.edgeConnected ? "CONNECTED" : "STANDBY"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-white">
                  {diagData?.edgeConnected ? `${diagData?.edgeConnections || 4} Active Mesh Connections` : "Connector Standby"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {diagData?.edgeConnected ? "Encrypted HTTP/2 Edge Tunnel Active" : "Waiting for connector handshake"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Firewall & VPN Status</span>
                  <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold", diagData?.vpnConflictDetected ? "text-rose-400 bg-rose-500/10 border border-rose-500/25" : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25")}>
                    {diagData?.vpnConflictDetected ? "CONFLICT" : "CLEAN"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-white">
                  {diagData?.vpnActive ? (diagData?.vpnName || "Active VPN Detected") : "Native Gateway"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {diagData?.vpnConflictDetected ? "Outbound edge port 7844 restricted" : "Split-tunneling rules passing"}
                </p>
              </div>
            </div>

            {healReport && (
              <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <span className="font-bold">Self-Healing Diagnostic Log:</span> {healReport}
              </div>
            )}

            {diagData?.vpnConflictDetected && (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <div>
                  <p className="font-semibold text-amber-100">VPN / Firewall Restriction Detected</p>
                  <p className="text-[11px] text-amber-300/90 mt-0.5">
                    Outbound connections to the global edge network are being filtered by active VPN or firewall software. Click self-healing to automatically configure split-tunnel bypass rules.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleSelfHeal}
                  loading={healing}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shrink-0"
                >
                  Auto-Fix Network
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "hotspot" && (
        <div className="space-y-6">
          {/* 1. TRANSMITTER RADAR COCKPIT HEADER */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0b0f17] p-6 shadow-xl">
            {/* Ambient Background Glow */}
            <div className={cn(
              "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl transition-opacity duration-700",
              hotspotActive ? "bg-emerald-500/15 opacity-100" : "bg-sky-500/10 opacity-50"
            )} />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <span
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300",
                      hotspotActive
                        ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400 shadow-lg shadow-emerald-500/20"
                        : "border-slate-800 bg-slate-900/80 text-slate-400"
                    )}
                  >
                    <Wifi className={cn("h-7 w-7 transition-transform", hotspotActive && "animate-pulse")} />
                  </span>
                  {hotspotActive && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0b0f17]" />
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-bold text-white tracking-tight">Dev Wi-Fi Hotspot</h2>
                    <SupporterBadge size="xs" />
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-colors ring-1",
                        hotspotActive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ring-emerald-500/20"
                          : "bg-slate-800/70 text-slate-400 border border-slate-700/50 ring-slate-700/30"
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full", hotspotActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500")} />
                      {hotspotActive ? "BROADCASTING LIVE" : "TRANSMITTER STANDBY"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Spawn a private hardware-isolated network directly from your workstation. Test on phones, tablets, and Smart TVs with zero router dependency and custom local domain routing.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHotspotSubTab("connect_qr")}
                  className={cn(
                    "border-slate-800 bg-[#161f30] text-slate-200 hover:text-white hover:bg-[#1f2c42]",
                    hotspotSubTab === "connect_qr" && "border-sky-500/50 text-sky-300 bg-sky-500/10"
                  )}
                >
                  <QrCode className="h-3.5 w-3.5 mr-1.5 text-sky-400" />
                  Camera QR
                </Button>

                <Button
                  variant={hotspotActive ? "secondary" : "primary"}
                  onClick={toggleHotspot}
                  loading={savingHotspot}
                  size="sm"
                  className={cn(
                    "font-semibold transition-all shadow-md",
                    hotspotActive
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                  )}
                >
                  <Radio className="h-3.5 w-3.5 mr-1.5" />
                  {hotspotActive ? "Stop Broadcast" : "Start Hotspot"}
                </Button>
              </div>
            </div>

            {/* 2. HARDWARE & NETWORK TELEMETRY STRIP */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80">
              <div className="rounded-xl border border-slate-800/70 bg-[#070b14]/70 p-3">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Radio Interface</span>
                  <Radio className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <p className="mt-1 font-mono text-xs font-bold text-white truncate">
                  {hotspotActive ? "802.11ax / ac" : "Wi-Fi Direct"}
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  {hotspotTelemetry?.adapterStatus || (hotspotActive ? "Virtual AP Active" : "Adapter Ready")}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/70 bg-[#070b14]/70 p-3">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Gateway Subnet</span>
                  <Server className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-mono text-xs font-bold text-white truncate">
                    192.168.137.1
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("192.168.137.1");
                      setCopiedIp(true);
                      setTimeout(() => setCopiedIp(false), 2000);
                    }}
                    className="text-[10px] font-mono text-sky-400 hover:text-sky-300 ml-1"
                    title="Copy Gateway IP"
                  >
                    {copiedIp ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  Pool: 192.168.137.2-254
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/70 bg-[#070b14]/70 p-3">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Hotspot Domain</span>
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-mono text-xs font-bold text-emerald-400 truncate">
                    {hotspotCustomHost || "portside.test"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(hotspotCustomHost || "portside.test");
                      setCopiedHost(true);
                      setTimeout(() => setCopiedHost(false), 2000);
                    }}
                    className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 ml-1 cursor-pointer"
                    title="Copy Hotspot Domain"
                  >
                    {copiedHost ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  Local DNS: &lt;project&gt;.{(hotspotCustomHost || "portside.test")}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/70 bg-[#070b14]/70 p-3">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Connected Devices</span>
                  <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <p className="mt-1 font-mono text-xs font-bold text-white truncate">
                  {hotspotTelemetry?.clientCount ?? (hotspotActive ? 1 : 0)} Active Clients
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  WPA2-PSK (AES Encrypted)
                </p>
              </div>
            </div>
          </div>

          {!isSupporter ? (
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 p-8 text-center shadow-xl">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20">
                <Lock className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-base font-bold text-white">
                Unlock Dev Wi-Fi Hotspot & Custom Host Domains
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400 max-w-md mx-auto">
                Supporters unlock the ability to broadcast private isolated Wi-Fi networks directly from Windows, set custom host domain suffixes (*.mybrand.dev), and connect physical devices without a router.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={openSupport}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Become a Supporter for $5.99/mo to Unlock
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* SUB-NAVIGATION BAR */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#0b0f17] border border-slate-800">
                <button
                  type="button"
                  onClick={() => setHotspotSubTab("config")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    hotspotSubTab === "config"
                      ? "bg-[#161f30] text-white border border-[#27354a] shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#111827] border border-transparent"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
                  <span>Wi-Fi Credentials & Radio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHotspotSubTab("custom_host")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    hotspotSubTab === "custom_host"
                      ? "bg-[#161f30] text-white border border-[#27354a] shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#111827] border border-transparent"
                  )}
                >
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Custom Host & Domains</span>
                  <span className="rounded bg-emerald-500/20 text-emerald-300 px-1 py-0.2 text-[9px] font-bold">
                    SUPPORTER
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHotspotSubTab("connect_qr")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    hotspotSubTab === "connect_qr"
                      ? "bg-[#161f30] text-white border border-[#27354a] shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#111827] border border-transparent"
                  )}
                >
                  <QrCode className="h-3.5 w-3.5 text-sky-400" />
                  <span>Device Connect & QR Matrix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHotspotSubTab("telemetry")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    hotspotSubTab === "telemetry"
                      ? "bg-[#161f30] text-white border border-[#27354a] shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#111827] border border-transparent"
                  )}
                >
                  <Activity className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Telemetry & Clients</span>
                  {hotspotTelemetry?.clientCount > 0 && (
                    <span className="rounded-full bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 text-[9px] font-bold">
                      {hotspotTelemetry.clientCount}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: WI-FI CREDENTIALS & RADIO CONFIG */}
              {hotspotSubTab === "config" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-[#0b0f17] p-5 shadow-lg space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">Broadcast Parameters</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Set the network SSID and WPA2 security passphrase broadcasted to nearby physical devices.
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">Security: WPA2-Personal (AES)</span>
                    </div>

                    <form onSubmit={saveHotspotSettings} className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="hotspot-ssid" className="text-xs font-semibold text-slate-200">
                            Network Name (SSID)
                          </Label>
                          <button
                            type="button"
                            onClick={resetDefaultSsid}
                            className="text-[10px] text-slate-400 hover:text-slate-200 transition"
                          >
                            Reset Default
                          </button>
                        </div>
                        <input
                          id="hotspot-ssid"
                          type="text"
                          value={hotspotSsid}
                          onChange={(e) => setHotspotSsid(e.target.value)}
                          maxLength={32}
                          className="mt-1.5 w-full rounded-xl border border-slate-800 bg-[#070b14] px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="e.g. PortSide-DevNet"
                        />
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Search for this network in your device's Wi-Fi list</span>
                          <span className="font-mono">{hotspotSsid.length}/32</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="hotspot-key" className="text-xs font-semibold text-slate-200">
                            WPA2 Passphrase
                          </Label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={generateRandomKey}
                              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
                            >
                              <Zap className="h-3 w-3" />
                              Generate Key
                            </button>
                            <span className="text-slate-700">|</span>
                            <button
                              type="button"
                              onClick={copyHotspotPassword}
                              className="text-[10px] text-sky-400 hover:text-sky-300 font-medium transition"
                            >
                              {copiedHotspotKey ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                        <div className="mt-1.5 relative flex items-center">
                          <input
                            id="hotspot-key"
                            type={showHotspotKey ? "text" : "password"}
                            value={hotspotKey}
                            onChange={(e) => setHotspotKey(e.target.value)}
                            minLength={8}
                            className="w-full rounded-xl border border-slate-800 bg-[#070b14] px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-sky-500 pr-16"
                            placeholder="Minimum 8 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowHotspotKey(!showHotspotKey)}
                            className="absolute right-3 rounded px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-white bg-slate-800/80 transition"
                          >
                            {showHotspotKey ? "Hide" : "Show"}
                          </button>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Hardware-encrypted AES passphrase</span>
                          <span className={cn("font-mono", hotspotKey.length >= 8 ? "text-emerald-400" : "text-amber-400")}>
                            {hotspotKey.length >= 8 ? "Valid Passphrase" : "Min 8 chars required"}
                          </span>
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="text-xs font-semibold text-emerald-400">{savedHotspotMsg}</span>
                        <Button type="submit" size="sm" variant="secondary" loading={savingHotspot} className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold">
                          Save Wi-Fi Config
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Architecture & Offline Mobility Explainer */}
                  <div className="rounded-xl border border-slate-800 bg-[#0b0f17]/70 p-4 text-xs text-slate-400 space-y-2">
                    <div className="flex items-center gap-2 text-slate-200 font-bold">
                      <Radio className="h-4 w-4 text-sky-400" />
                      <span>Zero-Router Travel & Mobility Mode</span>
                    </div>
                    <p className="leading-relaxed">
                      Dev Wi-Fi Hotspot uses Windows Hosted Network & Wi-Fi Direct virtualization to broadcast an access point directly from your PC's Wi-Fi card. It requires no physical router, no upstream internet, and operates flawlessly on flights, trains, coffee shops, and client offices.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOM DOMAIN (SUPPORTER PERK) */}
              {hotspotSubTab === "custom_host" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-[#0b0f17] p-5 shadow-lg space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">Hotspot Domain</h3>
                          <span className="rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold">
                            Supporter Perk
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Choose what domain name your phone and devices use while connected to this Wi-Fi.
                        </p>
                      </div>
                      <Globe className="h-5 w-5 text-emerald-400" />
                    </div>

                    <form onSubmit={saveCustomHostSettings} className="space-y-4">
                      <div>
                        <Label htmlFor="custom-host" className="text-xs font-semibold text-slate-200">
                          Hotspot TLD (Top-Level Domain)
                        </Label>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              id="custom-host"
                              type="text"
                              value={hotspotCustomHost}
                              onChange={(e) => setHotspotCustomHost(e.target.value.toLowerCase().trim())}
                              maxLength={48}
                              className="w-full rounded-xl border border-slate-800 bg-[#070b14] px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="test"
                            />
                          </div>
                          <Button
                            type="submit"
                            size="sm"
                            loading={savingCustomHost}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shrink-0 h-9.5 px-4 cursor-pointer"
                          >
                            Save TLD
                          </Button>
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          Set the local domain suffix (e.g. <span className="text-slate-400 font-mono">test</span>, <span className="text-slate-400 font-mono">lan</span>, or <span className="text-slate-400 font-mono">dev</span>).
                        </p>
                      </div>

                      {savedCustomHostMsg && (
                        <p className="text-xs font-semibold text-emerald-400">{savedCustomHostMsg}</p>
                      )}
                    </form>

                    {/* CLEAR VISUAL EXPLANATION */}
                    <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-4 space-y-2.5">
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-emerald-400" />
                        <span>How you access your work on connected devices:</span>
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 gap-1.5">
                          <span className="font-mono text-white">
                            http://<span className="text-emerald-400 font-bold">&lt;your-service&gt;</span>.{hotspotCustomHost || "test"}
                          </span>
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            Opens that specific project (e.g. web.{hotspotCustomHost || "test"})
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 gap-1.5">
                          <span className="font-mono text-white">
                            http://router.{hotspotCustomHost || "test"}
                          </span>
                          <span className="text-[11px] text-sky-400 font-semibold">
                            Opens the PortSide Cockpit (or router.localhost on PC)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SIMPLE HOW IT WORKS NOTE */}
                    <div className="rounded-xl border border-slate-800 bg-[#070b14]/50 p-3.5 text-xs text-slate-400 flex items-start gap-2.5">
                      <Zap className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-[11px]">
                        PortSide runs the private DNS gateway for this Wi-Fi (<code className="font-mono text-emerald-400">192.168.137.1</code>). Any device on the hotspot automatically resolves this domain to your PC without touching the internet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INSTANT DEVICE CONNECT & QR COCKPIT */}
              {hotspotSubTab === "connect_qr" && (
                <div className="space-y-4">
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* QR 1: WI-FI AUTO-JOIN */}
                    <div className="rounded-2xl border border-slate-800 bg-[#0b0f17] p-5 shadow-lg flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 self-start mb-4">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                          <QrCode className="h-4 w-4" />
                        </span>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-white">1. Join Wi-Fi Hotspot</h4>
                          <p className="text-[11px] text-slate-400">Scan with iPhone or Android camera</p>
                        </div>
                      </div>

                      <div className="relative p-3 rounded-2xl bg-white shadow-xl">
                        {hotspotQrDataUrl ? (
                          <img
                            src={hotspotQrDataUrl}
                            alt="Wi-Fi Quick Connect QR Code"
                            className="h-52 w-52 rounded-lg"
                          />
                        ) : (
                          <div className="h-52 w-52 flex items-center justify-center text-slate-400 font-mono text-xs">
                            Generating QR...
                          </div>
                        )}
                      </div>

                      <p className="mt-3 text-xs font-mono font-bold text-white">
                        SSID: <span className="text-sky-400">{hotspotSsid}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Prompts automatic Wi-Fi connection with zero typing
                      </p>

                      <button
                        type="button"
                        onClick={copyHotspotPayload}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#161f30] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                      >
                        <Copy className="h-3.5 w-3.5 text-sky-400" />
                        {copiedWifiPayload ? "Payload Copied!" : "Copy Wi-Fi Payload"}
                      </button>
                    </div>

                    {/* QR 2: WEB PORTAL / COCKPIT */}
                    <div className="rounded-2xl border border-slate-800 bg-[#0b0f17] p-5 shadow-lg flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 self-start mb-4">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Globe className="h-4 w-4" />
                        </span>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-white">2. Open Dev Cockpit</h4>
                          <p className="text-[11px] text-slate-400">Universal browser entrypoint</p>
                        </div>
                      </div>

                      <div className="relative p-3 rounded-2xl bg-white shadow-xl">
                        {portalQrDataUrl ? (
                          <img
                            src={portalQrDataUrl}
                            alt="PortSide Portal QR Code"
                            className="h-52 w-52 rounded-lg"
                          />
                        ) : (
                          <div className="h-52 w-52 flex items-center justify-center text-slate-400 font-mono text-xs">
                            Generating Portal QR...
                          </div>
                        )}
                      </div>

                      <p className="mt-3 text-xs font-mono font-bold text-emerald-400">
                        http://192.168.137.1/lan
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Opens PortSide project list and port selector on mobile
                      </p>

                      <a
                        href="http://192.168.137.1/lan"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                        Open in Browser
                      </a>
                    </div>
                  </div>

                  {/* MULTI-PLATFORM ACCESS MATRIX */}
                  <div className="rounded-2xl border border-slate-800 bg-[#0b0f17] p-5 shadow-lg space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Multi-Platform URL Access Matrix
                    </h4>
                    <p className="text-xs text-slate-400">
                      Standard operating systems handle DNS resolution differently. Use the matching URL pattern for your target test hardware:
                    </p>

                    <div className="grid gap-2.5 sm:grid-cols-2 pt-2">
                      <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Smartphone className="h-4 w-4 text-sky-400" />
                            Android (Chrome) & Smart TVs
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold">
                            Universal IP
                          </span>
                        </div>
                        <p className="font-mono text-xs text-sky-300">
                          http://192.168.137.1/lan
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Also supports wildcard domains: <code className="text-sky-400">&lt;service&gt;.192.168.137.1.nip.io</code>
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Laptop className="h-4 w-4 text-emerald-400" />
                            Apple iOS (Safari) & macOS
                          </span>
                          <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded font-bold">
                            Bonjour mDNS
                          </span>
                        </div>
                        <p className="font-mono text-xs text-emerald-300">
                          http://portside.local
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Apple devices resolve <code className="text-emerald-400">.local</code> hostnames automatically via Bonjour.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Globe className="h-4 w-4 text-amber-400" />
                            Custom Hotspot Domain
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-bold">
                            Hotspot DNS
                          </span>
                        </div>
                        <p className="font-mono text-xs text-amber-300">
                          http://&lt;service&gt;.{hotspotCustomHost || "portside.test"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Direct clean subdomains resolved via PortSide's virtual gateway DNS.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Radio className="h-4 w-4 text-indigo-400" />
                            Remote Access (Outside Hotspot / 5G)
                          </span>
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded font-bold">
                            Global Tunnel
                          </span>
                        </div>
                        <p className="font-mono text-xs text-indigo-300 truncate">
                          {publicTunnelUrl || `https://${profileHandle || 'your-node'}.portside.lol`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Internet-wide encrypted routing when testing away from home or Wi-Fi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TELEMETRY & CONNECTED PEERS */}
              {hotspotSubTab === "telemetry" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-[#0b0f17] p-5 shadow-lg space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">Hardware Adapter Telemetry</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Low-level Windows Virtual Tethering interface details and live socket states.
                        </p>
                      </div>
                      <Activity className="h-5 w-5 text-indigo-400" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-3.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Virtual Interface</p>
                        <p className="mt-1 font-mono text-xs font-bold text-white truncate">
                          {hotspotTelemetry?.adapterName || "Microsoft Wi-Fi Direct Virtual Adapter"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-3.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">DHCP Range</p>
                        <p className="mt-1 font-mono text-xs font-bold text-white">
                          {hotspotTelemetry?.dhcpRange || "192.168.137.2 - 192.168.137.254"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800/80 bg-[#070b14] p-3.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">DNS Server</p>
                        <p className="mt-1 font-mono text-xs font-bold text-emerald-400">
                          {hotspotTelemetry?.dnsServer || "192.168.137.1:53 (PortSide Relay)"}
                        </p>
                      </div>
                    </div>

                    {/* CONNECTED CLIENTS LIST */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Active Client Devices ({hotspotTelemetry?.clients?.length ?? (hotspotActive ? 1 : 0)})
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">Max Capacity: 8 Clients</span>
                      </div>

                      {hotspotTelemetry?.clients && hotspotTelemetry.clients.length > 0 ? (
                        <div className="space-y-2">
                          {hotspotTelemetry.clients.map((c: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-[#070b14]">
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                                  {c.deviceType === "phone" ? (
                                    <Smartphone className="h-4 w-4" />
                                  ) : c.deviceType === "tv" ? (
                                    <Tv className="h-4 w-4" />
                                  ) : (
                                    <Laptop className="h-4 w-4" />
                                  )}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-white">{c.hostname || `Device-${idx + 1}`}</p>
                                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                                    IP: {c.ip} · MAC: {c.mac}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                {c.state || "Connected"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-1">
                          <p className="font-semibold text-slate-400">No client devices currently connected</p>
                          <p className="text-[11px]">
                            Scan the Wi-Fi QR code from your phone or tablet camera to join this private access point.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. LOCAL NETWORK ROUTING & REMOTE TUNNEL QUICK STATUS */}
              <div className="rounded-2xl border border-slate-800 bg-[#0b0f17] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Globe className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">Local Wi-Fi Network Routing</p>
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-400">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Devices connected to your regular home or office Wi-Fi can also view active projects via LAN Cockpit.
                    </p>
                  </div>
                </div>

                <a
                  href="/lan"
                  className="rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition shrink-0 self-start sm:self-auto"
                >
                  View LAN Cockpit
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "account" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Update your account display name.</p>
            <form onSubmit={saveName} className="mt-4 space-y-3.5">
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" value={user.email} disabled />
              </div>
              <Button type="submit" loading={savingName} disabled={name.trim() === user.name}>
                Save profile
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Password & Security</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Change your password for this instance.</p>
            <form onSubmit={savePassword} className="mt-4 space-y-3.5">
              <div>
                <Label htmlFor="cur">Current password</Label>
                <Input id="cur" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              <div>
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
              </div>
              <Button type="submit" variant="secondary" loading={savingPw}>
                Change password
              </Button>
            </form>
          </Card>
        </div>
      )}

      {activeTab === "routing" && (
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Proxy Configuration</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Listening Port</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">:{appPort}</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Registered Routes</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">{services.length} active</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Host Routing Pattern</p>
                <p className="mt-1 font-mono text-xs font-bold text-sky-600 dark:text-sky-400">*.localhost{portSuffix}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">How Reverse Proxy Routing Works</h2>
            <ol className="mt-3 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex gap-2.5">
                <Step n={1} />
                <span>
                  Modern browsers automatically resolve any <code className="rounded bg-slate-100 border border-slate-200 px-1 font-mono text-[11px] text-sky-600 dark:bg-slate-900 dark:border-slate-800 dark:text-sky-400">*.localhost</code> hostname to <code className="font-mono text-[11px]">127.0.0.1</code> — no <code className="font-mono text-[11px]">/etc/hosts</code> configuration required.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Step n={2} />
                <span>
                  Portside listens on <code className="rounded bg-slate-100 border border-slate-200 px-1 font-mono text-[11px] dark:bg-slate-900 dark:border-slate-800">localhost{portSuffix}</code>. When a browser visits{" "}
                  <code className="rounded bg-slate-100 border border-slate-200 px-1 font-mono text-[11px] text-sky-600 dark:bg-slate-900 dark:border-slate-800 dark:text-sky-400">{example?.hostname ?? "api"}.localhost{portSuffix}</code>, Portside reads the hostname header and transparently proxies traffic to port <code className="font-mono font-bold">:{example?.port ?? 3000}</code>.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Step n={3} />
                <span>Unbound or paused routes render an explainer fallback page with shortcut links to resume or map the port.</span>
              </li>
            </ol>

            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-slate-300">
              <p className="text-slate-500"># Verify routing in terminal</p>
              <p>curl -i http://{example?.hostname ?? "api"}.localhost{portSuffix}/</p>
              <p className="mt-2.5 text-slate-500"># Run Portside on standard HTTP port 80 to remove port suffix</p>
              <p>PORT=80 npm start</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "about" && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Version & Application Updates</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Current version: <span className="font-mono font-semibold text-slate-900 dark:text-sky-400">v1.0.0</span>
                </p>
                {updateStatus && <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">{updateStatus}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={checkForUpdates} loading={checkingUpdate}>
                  Check for updates
                </Button>
                {isOnApp ? (
                  <Button
                    variant="secondary"
                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold cursor-default hover:bg-emerald-500/10 hover:text-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-1.5" />
                    You are on the app!
                  </Button>
                ) : (
                  <a
                    href="https://github.com/letsmakepact/PortSide/releases/latest/download/Portside.exe"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button>
                      Get Portside (.exe)
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">About & Attribution</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Portside is an open-source local proxy tool created by pact.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <a
                href="https://github.com/letsmakepact"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-[#0f172a]/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <span>GitHub:</span>
                <span className="font-semibold text-slate-900 dark:text-sky-400">letsmakepact</span>
              </a>
              <a
                href="https://t.me/pactwithdevil"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-[#0f172a]/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <span>Telegram:</span>
                <span className="font-semibold text-slate-900 dark:text-sky-400">@pactwithdevil</span>
              </a>
            </div>
          </Card>
        </div>
      )}

      {/* Vanity Subdomain Handle Change Modal */}
      <Modal
        open={vanityModalOpen}
        onClose={() => {
          if (!savingHandle) setVanityModalOpen(false);
        }}
        title={
          vanityStep === "confirm"
            ? "Change Username"
            : vanityStep === "input"
            ? "Set New Username"
            : "Username Change Fee"
        }
        size="sm"
      >
        {vanityStep === "confirm" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to change your vanity username?
            </p>
            <div className="rounded-md border border-[#1f2937] bg-[#0b0f17] p-3 text-xs">
              <span className="text-slate-400 block text-[11px]">Current Handle</span>
              <span className="font-mono text-white font-semibold">
                {profileHandle || "None configured"}
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
              <Button
                variant="secondary"
                onClick={() => setVanityModalOpen(false)}
                disabled={savingHandle}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmChange}>
                Yes, Change Username
              </Button>
            </div>
          </div>
        )}

        {vanityStep === "input" && (
          <form onSubmit={submitNewHandle} className="space-y-4">
            <div>
              <Label htmlFor="new-handle">What would you like your username to be?</Label>
              <div className="mt-1">
                <Input
                  id="new-handle"
                  value={newHandleInput}
                  onChange={(e) => {
                    setNewHandleInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    if (vanityError) setVanityError(null);
                  }}
                  placeholder="new-username"
                  autoFocus
                  required
                />
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-slate-400">
                https://{newHandleInput || "username"}.portside.lol
              </p>
            </div>

            {vanityError && (
              <div className="rounded-md border border-rose-800/40 bg-rose-950/30 p-2.5 text-xs text-rose-300">
                {vanityError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setVanityModalOpen(false)}
                disabled={savingHandle}
              >
                Cancel
              </Button>
              <Button type="submit" loading={savingHandle}>
                Continue
              </Button>
            </div>
          </form>
        )}

        {vanityStep === "fee" && (
          <div className="space-y-4">
            <div className="rounded-md border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-300 space-y-1">
              <p className="font-semibold">There is a fee to change your username.</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                You have already used your free username change. Additional changes require an unlock fee.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#1f2937]">
              <a
                href="https://buymeacoffee.com/pacts"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-semibold transition"
              >
                <Lock className="h-3.5 w-3.5" />
                Pay Fee & Unlock Change
              </a>
              <Button
                variant="secondary"
                onClick={() => setVanityModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-sky-400">{n}</span>;
}
