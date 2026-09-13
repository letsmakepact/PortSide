"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  XCircle,
  Key,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Monitor,
  Laptop,
  Cpu,
  Activity,
  Zap,
  Terminal,
  Clock,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileText,
  Sliders,
  Sparkles,
  ArrowUpRight,
  Trash2,
  Edit3,
  HelpCircle,
  Filter,
  Eye,
  EyeOff,
  Radio,
  Share2,
  Wifi,
} from "lucide-react";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

// ─── Interfaces & Types ─────────────────────────────────────────────

interface StatsData {
  totalAppDownloads: number;
  totalSupporters: number;
  totalAccounts?: number;
  verifiedAccounts?: number;
  activeMonthlySubscriptions: number;
  expiredSubscriptions: number;
  totalLicensesIssued: number;
  activeLicenses: number;
}

interface ConfirmedAccountItem {
  id?: string;
  email: string;
  machine_id?: string | null;
  machine_ids?: string[];
  wifi_ip?: string | null;
  name?: string | null;
  status?: string;
  is_verified?: boolean;
  verified?: boolean;
  created_at?: string;
  last_confirmed_at?: string;
}

interface SubscriptionItem {
  id?: string;
  email: string;
  machine_id?: string | null;
  status: "active" | "expired" | "canceled";
  current_period_end: string;
  payment_source?: string;
  created_at: string;
}

interface LicenseItem {
  id?: string;
  email: string;
  machine_id?: string;
  license_key: string;
  status: "active" | "revoked";
  created_at: string;
  expires_at?: string | null;
  notes?: string | null;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

type TabType = "overview" | "accounts" | "subscriptions" | "licenses" | "diagnostics" | "audit";

// ─── Component ──────────────────────────────────────────────────────

export default function MasterControlPanel() {
  // Auth state
  const [adminPasskey, setAdminPasskey] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Core Data
  const [stats, setStats] = useState<StatsData>({
    totalAppDownloads: 0,
    totalSupporters: 0,
    activeMonthlySubscriptions: 0,
    expiredSubscriptions: 0,
    totalLicensesIssued: 0,
    activeLicenses: 0,
  });
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [accounts, setAccounts] = useState<ConfirmedAccountItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Manual Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualDuration, setManualDuration] = useState("30");
  const [manualMachineId, setManualMachineId] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  // Diagnostics state
  const [checkerEmail, setCheckerEmail] = useState("pact@virtuoushigh.com");
  const [checkerMachineId, setCheckerMachineId] = useState("PS-CABDA074-A01FD367");
  const [checkerLoading, setCheckerLoading] = useState(false);
  const [checkerResult, setCheckerResult] = useState<any>(null);
  const [checkerError, setCheckerError] = useState("");
  const [accountCheckResult, setAccountCheckResult] = useState<any>(null);
  const [accountCheckLoading, setAccountCheckLoading] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Host Validation
  const [isAllowedHost, setIsAllowedHost] = useState(true);

  const addToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check host on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hn = window.location.hostname.toLowerCase();
      const valid =
        hn.endsWith(".vercel.app") ||
        hn.endsWith(".portside.lol") ||
        hn === "portside.lol" ||
        hn === "localhost" ||
        hn === "127.0.0.1";

      if (!valid) {
        setIsAllowedHost(false);
        return;
      }
    }

    const saved = sessionStorage.getItem("portside_admin_passkey");
    if (saved) {
      setAdminPasskey(saved);
      verifySavedPasskey(saved);
    }
  }, []);

  const verifySavedPasskey = async (passkey: string) => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey }),
      });
      if (res.ok) {
        setIsUnlocked(true);
      } else {
        sessionStorage.removeItem("portside_admin_passkey");
        setIsUnlocked(false);
      }
    } catch {
      setIsUnlocked(false);
    }
  };

  // Data fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      const key = adminPasskey || (typeof window !== "undefined" ? sessionStorage.getItem("portside_admin_passkey") || "" : "");
      const res = await fetch(`/api/admin/licenses?q=${encodeURIComponent(searchQuery)}`, {
        headers: { "x-admin-key": key },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.stats) setStats(data.stats);
        if (data.subscriptions) setSubscriptions(data.subscriptions);
        if (data.licenses) setLicenses(data.licenses);
        if (data.accounts) setAccounts(data.accounts);
        setLastSyncedAt(new Date());
      } else if (res.status === 401) {
        sessionStorage.removeItem("portside_admin_passkey");
        setIsUnlocked(false);
        addToast("error", "Session expired", "Please re-enter your passkey.");
      }
    } catch (err: any) {
      addToast("error", "Sync Failed", err.message || "Unable to reach server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchData();
    }
  }, [isUnlocked, searchQuery]);

  // Auth submission
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!adminPasskey.trim()) {
      setAuthError("Please enter your administrator passkey.");
      return;
    }
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: adminPasskey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Access denied. Invalid credentials.");

      sessionStorage.setItem("portside_admin_passkey", adminPasskey.trim());
      setIsUnlocked(true);
      addToast("success", "Console Unlocked", "Authenticated with master clearance.");
    } catch (err: any) {
      setAuthError(err.message || "Access denied.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem("portside_admin_passkey");
    setIsUnlocked(false);
    addToast("info", "Console Locked", "Administrative session terminated.");
  };

  // Create Supporter / License
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");
    setGeneratedKey("");
    setManualLoading(true);

    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPasskey,
        },
        body: JSON.stringify({
          email: manualEmail.trim(),
          durationDays: manualDuration === "0" ? null : parseInt(manualDuration, 10),
          machineId: manualMachineId.trim() || undefined,
          notes: manualNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate supporter license.");

      setGeneratedKey(data.licenseKey);
      addToast("success", "License Provisioned", `Issued for ${manualEmail.trim()}`);
      fetchData();
    } catch (err: any) {
      setManualError(err.message || "Failed to generate supporter license.");
    } finally {
      setManualLoading(false);
    }
  };

  // License Status Toggle (Revoke / Activate)
  const handleToggleLicenseStatus = async (license: LicenseItem) => {
    const newStatus = license.status === "active" ? "revoked" : "active";
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPasskey,
        },
        body: JSON.stringify({
          id: license.id,
          licenseKey: license.license_key,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setLicenses((prev) =>
        prev.map((item) => (item.id === license.id || item.license_key === license.license_key ? { ...item, status: newStatus } : item))
      );
      addToast("success", `License ${newStatus === "active" ? "Activated" : "Revoked"}`, license.email);
    } catch (err: any) {
      addToast("error", "Action Failed", err.message);
    }
  };

  // Subscription Status Update
  const handleUpdateSubscriptionStatus = async (sub: SubscriptionItem, newStatus: "active" | "expired" | "canceled") => {
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPasskey,
        },
        body: JSON.stringify({
          email: sub.email,
          subscriptionStatus: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update subscription");

      setSubscriptions((prev) =>
        prev.map((item) => (item.email.toLowerCase() === sub.email.toLowerCase() ? { ...item, status: newStatus } : item))
      );
      addToast("success", `Subscription Set to ${newStatus}`, sub.email);
    } catch (err: any) {
      addToast("error", "Update Failed", err.message);
    }
  };

  // Subscription Diagnostic Check
  const handleCheckSubscription = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!checkerEmail.trim()) return;
    setCheckerLoading(true);
    setCheckerResult(null);
    setCheckerError("");
    try {
      const res = await fetch("/api/subscription/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: checkerEmail.trim() }),
      });
      const data = await res.json();
      setCheckerResult(data);
      addToast("info", "Diagnostic Query Finished", `Status: ${data.active ? "Active" : "Inactive"}`);
    } catch (err: any) {
      setCheckerError(err.message || "Failed to query subscription.");
      addToast("error", "Query Error", err.message);
    } finally {
      setCheckerLoading(false);
    }
  };

  // Account & Vanity Domain Check
  const handleCheckAccount = async () => {
    if (!checkerEmail.trim()) return;
    setAccountCheckLoading(true);
    setAccountCheckResult(null);
    try {
      const res = await fetch("/api/account/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: checkerEmail.trim(),
          machineId: checkerMachineId.trim(),
        }),
      });
      const data = await res.json();
      setAccountCheckResult(data);
    } catch (err: any) {
      addToast("error", "Account Check Failed", err.message);
    } finally {
      setAccountCheckLoading(false);
    }
  };

  // Export to JSON
  const handleExportJSON = () => {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      stats,
      accounts,
      subscriptions,
      licenses,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portside-telemetry-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Export Generated", "Full telemetry downloaded in JSON format.");
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Email", "Status", "Payment Source", "Period End", "Machine ID"];
    const rows = subscriptions.map((s) => [
      s.email,
      s.status,
      s.payment_source || "buymeacoffee",
      s.current_period_end ? new Date(s.current_period_end).toISOString() : "",
      s.machine_id || "",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = `portside-supporters-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    addToast("success", "CSV Export Ready", "Supporter spreadsheet downloaded.");
  };

  // Filtered lists
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !query ||
        a.email.toLowerCase().includes(query) ||
        (a.name && a.name.toLowerCase().includes(query)) ||
        (a.machine_id && a.machine_id.toLowerCase().includes(query)) ||
        (a.machine_ids && a.machine_ids.some((m) => m.toLowerCase().includes(query)));
      return matchSearch;
    });
  }, [accounts, searchQuery]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      const query = searchQuery.toLowerCase();
      const matchSearch = !query || s.email.toLowerCase().includes(query) || (s.payment_source && s.payment_source.toLowerCase().includes(query));
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  const filteredLicenses = useMemo(() => {
    return licenses.filter((l) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !query ||
        l.email.toLowerCase().includes(query) ||
        l.license_key.toLowerCase().includes(query) ||
        (l.notes && l.notes.toLowerCase().includes(query));
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [licenses, searchQuery, statusFilter]);

  if (!isAllowedHost) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200 font-sans flex flex-col antialiased relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-sky-600/10 blur-[140px]" />
        <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[700px] h-[700px] rounded-full bg-blue-900/15 blur-[160px]" />
      </div>

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all transform translate-y-0 ${
              toast.type === "success"
                ? "bg-[#0b1b2a]/95 border-emerald-500/30 text-emerald-200"
                : toast.type === "error"
                ? "bg-[#250d14]/95 border-rose-500/30 text-rose-200"
                : "bg-[#091526]/95 border-sky-500/30 text-sky-200"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs">
              <div className="font-semibold">{toast.title}</div>
              {toast.message && <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{toast.message}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Top Master Navigation Bar ────────────────────────────── */}
      <header className="border-b border-sky-900/30 bg-[#09101d]/85 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <AnchorLogo size={32} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white group-hover:text-sky-400 transition-colors">
                    Portside
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/25 text-sky-300 font-mono text-[10px] uppercase font-semibold tracking-wider">
                    Portside Core
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-tight">
                  Master Telemetry Deck · v1.1.0
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {isUnlocked ? (
              <>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition shadow-lg shadow-sky-500/20 flex items-center gap-1.5 active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Issue Supporter Key</span>
                  <span className="sm:hidden">Issue</span>
                </button>

                <div className="relative group">
                  <button
                    onClick={handleExportJSON}
                    className="p-2 rounded-lg bg-[#0e192c] border border-sky-900/40 text-slate-300 hover:text-white hover:border-sky-700/60 transition text-xs flex items-center gap-1"
                    title="Export all data as JSON"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden md:inline text-[11px] font-medium">Export</span>
                  </button>
                </div>

                <button
                  onClick={handleLock}
                  className="p-2 rounded-lg bg-[#0e192c] border border-sky-900/40 text-slate-400 hover:text-white hover:border-sky-700/60 transition text-xs flex items-center gap-1.5"
                  title="Lock Console"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">Lock</span>
                </button>
              </>
            ) : null}

            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-[#0e192c] border border-sky-900/40 text-slate-300 hover:text-white hover:border-sky-700/60 transition text-xs flex items-center gap-1.5"
            >
              <span>Public Gateway</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content Deck ───────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative z-10">
        {!isUnlocked ? (
          /* ─── Locked Access Wall ──────────────────────────────────── */
          <div className="max-w-md mx-auto mt-16 p-8 rounded-3xl bg-[#0c1527]/90 border border-sky-900/40 shadow-2xl shadow-sky-950/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Master Clearance</h1>
                <p className="text-xs text-slate-400">Restricted administrative telemetry console.</p>
              </div>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Master Security Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="Enter admin passkey..."
                    className="w-full px-4 py-3 rounded-xl bg-[#070d18] border border-sky-900/50 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
                    autoFocus
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-sm transition shadow-lg shadow-sky-500/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Clearance...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Master Console</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500 font-mono">
                  Hardware HMAC & SHA-256 Signature Enforcement
                </span>
              </div>
            </form>
          </div>
        ) : (
          /* ─── Unlocked Command Deck ───────────────────────────────── */
          <div className="space-y-7">
            {/* Mission Control Top Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-sky-900/30">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-white tracking-tight">Master Telemetry Deck</h1>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Primary control plane for Portside hardware, supporters, and cryptographic licensing.</span>
                  {lastSyncedAt && (
                    <span className="text-slate-500 font-mono">
                      (Synced {lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="px-3 py-2 rounded-xl bg-[#0c1527] border border-sky-900/40 text-slate-300 hover:text-white hover:border-sky-600/60 transition text-xs font-medium flex items-center gap-2 shadow-sm"
                  title="Synchronize metrics with cloud and memory state"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
                  <span>{loading ? "Syncing..." : "Sync Deck"}</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-[#0c1527] border border-sky-900/40 text-slate-300 hover:text-white hover:border-sky-600/60 transition text-xs font-medium flex items-center gap-1.5"
                  title="Export supporter list as CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">CSV Export</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold text-xs transition shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Issue Supporter Key</span>
                </button>
              </div>
            </div>

            {/* ─── 6 Elevated Metric Telemetry Cards ─────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
              {/* Card 1: Unique Installs */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#080f1e] border border-sky-900/40 hover:border-sky-500/40 transition-all shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-sky-300 font-mono uppercase tracking-wider">
                    Unique Installs
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight">{stats.totalAppDownloads}</span>
                  <span className="text-[11px] text-sky-400 font-mono font-medium">machines</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-sky-950/60 font-mono">
                  <span>Hardware bound</span>
                  <span className="text-emerald-400">100% active</span>
                </div>
              </div>

              {/* Card 2: Registered Hardware Nodes */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#080f1e] border border-sky-500/30 hover:border-sky-400/50 transition-all shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-sky-300 font-mono uppercase tracking-wider">
                    PC Fleet Nodes
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                    <Monitor className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-sky-400 tracking-tight">
                    {accounts.length || stats.totalAccounts || 0}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono font-medium">verified</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-sky-950/60 font-mono">
                  <span>Attached hardware</span>
                  <span className="text-sky-300">MAC / HMAC</span>
                </div>
              </div>

              {/* Card 3: Supporters All-Time */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#080f1e] border border-sky-900/40 hover:border-sky-500/40 transition-all shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider">
                    All Supporters
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight">{stats.totalSupporters}</span>
                  <span className="text-[11px] text-emerald-400 font-mono font-medium">patrons</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-sky-950/60 font-mono">
                  <span>BuyMeACoffee & Web</span>
                  <span className="text-slate-300">Lifetime</span>
                </div>
              </div>

              {/* Card 4: Active Monthly Recurring */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0a1e1b] to-[#081515] border border-emerald-500/30 hover:border-emerald-400/50 transition-all shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-300 font-mono uppercase tracking-wider">
                    Active Monthly
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400 tracking-tight">
                    {stats.activeMonthlySubscriptions}
                  </span>
                  <span className="text-[11px] text-emerald-400/80 font-mono font-medium">valid</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-emerald-950/80 font-mono">
                  <span>Current 30d window</span>
                  <span className="text-emerald-400">Confirmed</span>
                </div>
              </div>

              {/* Card 5: Expired / Inactive */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#080f1e] border border-sky-900/40 hover:border-sky-500/40 transition-all shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 font-mono uppercase tracking-wider">
                    Lapsed / Expired
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-300 tracking-tight">
                    {stats.expiredSubscriptions}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">lapsed</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-sky-950/60 font-mono">
                  <span>Cycle concluded</span>
                  <span className="text-slate-400">Grace</span>
                </div>
              </div>

              {/* Card 6: Cryptographic Keys */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#080f1e] border border-sky-900/40 hover:border-sky-500/40 transition-all shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-sky-300 font-mono uppercase tracking-wider">
                    Issued Tokens
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight">{stats.totalLicensesIssued}</span>
                  <span className="text-[11px] text-sky-400 font-mono font-medium">issued</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-sky-950/60 font-mono">
                  <span>{stats.activeLicenses} active tokens</span>
                  <span className="text-sky-300">RSA-2048</span>
                </div>
              </div>
            </div>

            {/* ─── Global Search & Filtering Deck ─────────────────────── */}
            <div className="p-4 rounded-2xl bg-[#0c1527]/70 border border-sky-900/40 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter fleet by email, hardware PC ID (e.g. PS-CABDA074), user alias, or license key..."
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#070d18] border border-sky-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 font-mono transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                  >
                    &times;
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1 pl-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                {[
                  { id: "all", label: "All Records" },
                  { id: "active", label: "Active" },
                  { id: "expired", label: "Expired" },
                  { id: "revoked", label: "Revoked" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition shrink-0 ${
                      statusFilter === f.id
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                        : "bg-[#080f1e] text-slate-400 border border-sky-950 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Tab Navigation Bar ─────────────────────────────────── */}
            <div className="flex items-center gap-2 border-b border-sky-900/30 overflow-x-auto scrollbar-none pb-px">
              {[
                {
                  id: "overview" as TabType,
                  label: "Fleet Overview",
                  icon: Layers,
                  badge: null,
                },
                {
                  id: "accounts" as TabType,
                  label: "Hardware PC Registry",
                  icon: Monitor,
                  badge: accounts.length,
                },
                {
                  id: "subscriptions" as TabType,
                  label: "Supporter Subscriptions",
                  icon: Users,
                  badge: subscriptions.length,
                },
                {
                  id: "licenses" as TabType,
                  label: "License Vault",
                  icon: Key,
                  badge: licenses.length,
                },
                {
                  id: "diagnostics" as TabType,
                  label: "Verification Sandbox",
                  icon: Terminal,
                  badge: "Live API",
                },
                {
                  id: "audit" as TabType,
                  label: "Event Telemetry",
                  icon: Activity,
                  badge: null,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 shrink-0 border-b-2 ${
                      isActive
                        ? "bg-[#0c1527] text-sky-300 border-sky-400 shadow-lg shadow-sky-500/5"
                        : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#0c1527]/40"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== null && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isActive
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            : "bg-[#080f1e] text-slate-500 border border-sky-950"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ─── TAB CONTENT 1: OVERVIEW ────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Fleet & Architecture Health */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl bg-[#0c1527]/80 border border-sky-900/40 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-sky-900/30 pb-3">
                        <div className="flex items-center gap-2.5">
                          <Radio className="w-4 h-4 text-sky-400" />
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                            Primary Ingress & Routing Nodes
                          </h2>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#070d18] border border-sky-950 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-mono">Local Proxy Loopback</span>
                            <span className="text-sky-300 font-mono text-[11px]">*.localhost:80</span>
                          </div>
                          <div className="text-xs text-white font-medium">RFC 6761 Loopback Engine</div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Zero-configuration port binding. Eliminates hosts file pollution and maps local microservices seamlessly.
                          </p>
                          <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono border-t border-sky-950">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>100% Free Core Developer Tier</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#070d18] border border-sky-950 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-mono">Open-Air LAN Ingress</span>
                            <span className="text-emerald-300 font-mono text-[11px]">*.local mDNS</span>
                          </div>
                          <div className="text-xs text-white font-medium">Mobile & TV Level H Dual Ingress</div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Zero-setup smart TV testing and phone pairing over Wi-Fi. Supports Level H error-corrected brand QR emblem codes.
                          </p>
                          <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono border-t border-sky-950">
                            <ShieldCheck className="w-3 h-3 text-sky-400" />
                            <span>Supporter Verified Perk</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#070d18] border border-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                            Custom Vanity Edge Subdomains
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Live prefix: <span className="text-sky-300">*.portside.lol</span> (e.g. pact.portside.lol)
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono font-medium shrink-0">
                          Active CDN Routing
                        </span>
                      </div>
                    </div>

                    {/* Recent Hardware Registrations Snippet */}
                    <div className="p-6 rounded-2xl bg-[#0c1527]/80 border border-sky-900/40 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-sky-900/30 pb-3">
                        <div className="flex items-center gap-2.5">
                          <Monitor className="w-4 h-4 text-sky-400" />
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                            Recent Verified PC Fleet Nodes
                          </h2>
                        </div>
                        <button
                          onClick={() => setActiveTab("accounts")}
                          className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
                        >
                          View All ({accounts.length}) <ChevronDown className="w-3 h-3 -rotate-90" />
                        </button>
                      </div>

                      <div className="divide-y divide-sky-950/60">
                        {accounts.slice(0, 4).map((acc, idx) => {
                          const pcId = acc.machine_id || (acc.machine_ids && acc.machine_ids[0]) || "PS-CABDA074-A01FD367";
                          const isPact = acc.email.toLowerCase().includes("pact");
                          return (
                            <div key={acc.id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                                    isPact
                                      ? "bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 shadow-md shadow-sky-500/20"
                                      : "bg-sky-500/10 border border-sky-500/20 text-sky-300"
                                  }`}
                                >
                                  {(acc.name || acc.email).slice(0, 1).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{acc.email}</span>
                                    {isPact && (
                                      <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-mono uppercase">
                                        Architect
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                                    <span className="text-sky-300">{`PC #${idx + 1}`}:</span>
                                    <span>{pcId}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <ShieldCheck className="w-3 h-3" />
                                  Verified
                                </span>
                                <div className="text-[10px] text-slate-500 font-mono mt-1">
                                  {new Date(acc.last_confirmed_at || acc.created_at || Date.now()).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Quick Diagnostic Tool & Telemetry Summary */}
                  <div className="space-y-6">
                    {/* Quick Checker Box */}
                    <div className="p-6 rounded-2xl bg-[#0c1527]/80 border border-sky-900/40 shadow-xl space-y-4">
                      <div className="border-b border-sky-900/30 pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                            Subscription Checker
                          </h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Test live master endpoint verification for any supporter email.
                        </p>
                      </div>

                      <form onSubmit={handleCheckSubscription} className="space-y-3">
                        <input
                          type="email"
                          required
                          value={checkerEmail}
                          onChange={(e) => setCheckerEmail(e.target.value)}
                          placeholder="donor@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#070d18] border border-sky-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono transition"
                        />
                        <button
                          type="submit"
                          disabled={checkerLoading}
                          className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${checkerLoading ? "animate-spin" : ""}`} />
                          <span>Check Subscription</span>
                        </button>
                      </form>

                      {checkerResult && (
                        <div
                          className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                            checkerResult.active
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-1.5">
                              {checkerResult.active ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              {checkerResult.active ? "Active Supporter" : "Inactive / Not Found"}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 capitalize">
                              {checkerResult.source || "Database"}
                            </span>
                          </div>
                          {checkerResult.currentPeriodEnd && (
                            <div className="text-[11px] text-slate-300 pt-1 border-t border-emerald-500/20 font-mono">
                              Period End: {new Date(checkerResult.currentPeriodEnd).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cryptographic Key Gen Quick Launcher */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#0a1830] border border-sky-500/30 shadow-xl space-y-3 relative overflow-hidden">
                      <div className="flex items-center gap-2.5">
                        <Key className="w-4 h-4 text-sky-400" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                          Offline License Vault
                        </h2>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Need to issue an offline token for a local PC installation or Patreon backer without BuyMeACoffee?
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Open Key Provisioner</span>
                      </button>
                    </div>

                    {/* Attribution Box */}
                    <div className="p-4 rounded-2xl bg-[#070d18] border border-sky-950 text-[11px] text-slate-400 space-y-1.5 font-mono">
                      <div className="text-white font-semibold flex items-center gap-1.5">
                        <AnchorLogo size={14} />
                        Portside Infrastructure Architecture
                      </div>
                      <div className="text-slate-500 leading-relaxed">
                        Crafted & architected by <span className="text-sky-300">pact</span> (
                        <a
                          href="https://github.com/letsmakepact"
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-slate-300"
                        >
                          letsmakepact
                        </a>
                        ) · Telegram:{" "}
                        <a
                          href="https://t.me/pactwithdevil"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:underline"
                        >
                          @pactwithdevil
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB CONTENT 2: HARDWARE PC REGISTRY ────────────────── */}
            {activeTab === "accounts" && (
              <div className="p-6 rounded-2xl bg-[#0c1527]/80 border border-sky-900/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-900/30 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                      <Monitor className="w-4 h-4 text-sky-400" />
                      Registered Hardware Nodes & PC Machine IDs
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Live accounts synced from Portside desktop installations with verified cryptographic machine IDs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {filteredAccounts.length} Verified Hardware Nodes
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-sky-900/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070f1c] text-slate-400 border-b border-sky-900/50 uppercase font-mono text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Account & User</th>
                        <th className="py-3 px-4">Attached PC Hardware ID</th>
                        <th className="py-3 px-4">Wi-Fi LAN IP</th>
                        <th className="py-3 px-4">Hardware Node</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Last Synced / Heartbeat</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-950/60 font-sans">
                      {filteredAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                            No registered hardware nodes found matching the search query.
                          </td>
                        </tr>
                      ) : (
                        filteredAccounts.map((acc, idx) => {
                          const pcId = acc.machine_id || (acc.machine_ids && acc.machine_ids[0]) || "PS-CABDA074-A01FD367";
                          const pcNumber = `PC #${idx + 1}`;
                          const isPact = acc.email.toLowerCase().includes("pact");
                          const machinesCount = acc.machine_ids ? acc.machine_ids.length : 1;

                          return (
                            <tr key={acc.id || idx} className="hover:bg-[#0e1b33]/60 transition group">
                              <td className="py-3.5 px-4 font-semibold text-white">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs ${
                                      isPact
                                        ? "bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 font-bold"
                                        : "bg-sky-500/10 border border-sky-500/20 text-sky-300"
                                    }`}
                                  >
                                    {(acc.name || acc.email).slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-white text-xs">{acc.email}</span>
                                      {isPact && (
                                        <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-mono">
                                          Creator
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-normal">
                                      User alias: <span className="text-slate-300 capitalize">{acc.name || "pact"}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="inline-flex items-center gap-2 font-mono text-[11px] text-sky-300 bg-[#070f1c] border border-sky-800/50 px-3 py-1.5 rounded-lg shadow-inner">
                                  <Monitor className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                  <span>{pcId}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(pcId);
                                      addToast("success", "Copied Machine ID", pcId);
                                    }}
                                    className="text-slate-500 hover:text-sky-300 transition-colors ml-1"
                                    title="Copy Machine ID"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                {acc.wifi_ip ? (
                                  <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-300 bg-[#070f1c] border border-emerald-900/50 px-2.5 py-1 rounded-lg">
                                    <Wifi className="w-3 h-3 text-emerald-400 shrink-0" />
                                    <span>{acc.wifi_ip}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(acc.wifi_ip!);
                                        addToast("success", "Copied Wi-Fi IP", acc.wifi_ip!);
                                      }}
                                      className="text-slate-500 hover:text-emerald-300 transition-colors ml-0.5"
                                      title="Copy Wi-Fi IP"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-mono text-slate-500">127.0.0.1</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 font-mono text-xs">
                                <span className="px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-800/60 text-sky-200 text-[11px] font-bold">
                                  {pcNumber}
                                </span>
                                {machinesCount > 1 && (
                                  <span className="ml-1.5 text-[10px] text-slate-400 font-mono">
                                    (+{machinesCount - 1} bound)
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm font-mono">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  Verified
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                                <div>
                                  {new Date(acc.last_confirmed_at || acc.created_at || Date.now()).toLocaleDateString()}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {new Date(acc.last_confirmed_at || acc.created_at || Date.now()).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setCheckerEmail(acc.email);
                                    setCheckerMachineId(pcId);
                                    setActiveTab("diagnostics");
                                    addToast("info", "Loaded into Sandbox", acc.email);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[11px] font-mono transition"
                                >
                                  Diagnose
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB CONTENT 3: SUPPORTER SUBSCRIPTIONS ─────────────── */}
            {activeTab === "subscriptions" && (
              <div className="p-6 rounded-2xl bg-[#0c1527]/80 border border-sky-900/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-900/30 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-sky-400" />
                      Active & Historical Supporter Entitlements
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Directly control subscription tiers, expiry timestamps, and payment provider mappings.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 rounded-lg bg-[#070f1c] border border-sky-900/50 text-slate-300 hover:text-white text-xs font-mono transition flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      Export Spreadsheet
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-sky-900/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070f1c] text-slate-400 border-b border-sky-900/50 uppercase font-mono text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Supporter Email</th>
                        <th className="py-3 px-4">Entitlement Status</th>
                        <th className="py-3 px-4">Provider / Source</th>
                        <th className="py-3 px-4">Period End / Validity</th>
                        <th className="py-3 px-4 text-right">Quick Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-950/60 font-sans">
                      {filteredSubscriptions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                            No supporter subscription records found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredSubscriptions.map((sub, idx) => {
                          const isExpired = new Date(sub.current_period_end).getTime() < Date.now();
                          const isPact = sub.email.toLowerCase().includes("pact");

                          return (
                            <tr key={sub.id || idx} className="hover:bg-[#0e1b33]/60 transition">
                              <td className="py-3.5 px-4 font-semibold text-white font-mono text-xs">
                                <div className="flex items-center gap-2">
                                  <span>{sub.email}</span>
                                  {isPact && (
                                    <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] uppercase">
                                      Creator
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                    sub.status === "active" && !isExpired
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      sub.status === "active" && !isExpired ? "bg-emerald-400" : "bg-rose-400"
                                    }`}
                                  />
                                  {sub.status.toUpperCase()}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-slate-300">
                                <span className="capitalize px-2 py-0.5 rounded bg-sky-950/60 border border-sky-900/40 text-[11px]">
                                  {sub.payment_source || "buymeacoffee"}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                                <div>{new Date(sub.current_period_end).toLocaleDateString()}</div>
                                <div className="text-[10px] text-slate-500">
                                  {isExpired ? "Expired" : "Active entitlement"}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {sub.status === "active" ? (
                                    <button
                                      onClick={() => handleUpdateSubscriptionStatus(sub, "expired")}
                                      className="px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-mono transition"
                                      title="Mark subscription as expired"
                                    >
                                      Expire
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateSubscriptionStatus(sub, "active")}
                                      className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono transition"
                                      title="Activate subscription"
                                    >
                                      Activate
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(sub.email);
                                      addToast("success", "Email Copied", sub.email);
                                    }}
                                    className="p-1 rounded bg-[#070f1c] border border-sky-950 text-slate-400 hover:text-white"
                                    title="Copy Email"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB CONTENT 4: LICENSE VAULT ───────────────────────── */}
            {activeTab === "licenses" && (
              <div className="p-6 rounded-2xl bg-[#0c1527]/80 border border-sky-900/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-900/30 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                      <Key className="w-4 h-4 text-sky-400" />
                      Cryptographic License Vault (RSA-2048 Signed)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Offline and server-side signed tokens for Portside desktop installations.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="py-1.5 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Generate New Token</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-sky-900/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070f1c] text-slate-400 border-b border-sky-900/50 uppercase font-mono text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4">License Key Signature</th>
                        <th className="py-3 px-4">Hardware Lock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Created / Expiry</th>
                        <th className="py-3 px-4 text-right">Revoke / Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-950/60 font-sans">
                      {filteredLicenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                            No cryptographic licenses found matching query.
                          </td>
                        </tr>
                      ) : (
                        filteredLicenses.map((lic, idx) => {
                          const isRevoked = lic.status === "revoked";
                          const isExpired = lic.expires_at ? new Date(lic.expires_at).getTime() < Date.now() : false;

                          return (
                            <tr key={lic.id || idx} className="hover:bg-[#0e1b33]/60 transition font-mono text-xs">
                              <td className="py-3.5 px-4 font-semibold text-white">
                                <div>{lic.email}</div>
                                {lic.notes && <div className="text-[10px] text-slate-500 mt-0.5">{lic.notes}</div>}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sky-300 text-[11px] bg-[#070f1c] px-2 py-1 rounded border border-sky-950">
                                    {lic.license_key.slice(0, 24)}...
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(lic.license_key);
                                      addToast("success", "License Key Copied", lic.email);
                                    }}
                                    className="text-slate-400 hover:text-white p-1"
                                    title="Copy full license string"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                                {lic.machine_id ? (
                                  <span className="text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded">
                                    {lic.machine_id}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Universal Fleet</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    isRevoked
                                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                      : isExpired
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  }`}
                                >
                                  {isRevoked ? "REVOKED" : isExpired ? "EXPIRED" : "ACTIVE"}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                                <div>{new Date(lic.created_at).toLocaleDateString()}</div>
                                <div className="text-[10px] text-slate-500">
                                  {lic.expires_at ? `Exp: ${new Date(lic.expires_at).toLocaleDateString()}` : "Lifetime"}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => handleToggleLicenseStatus(lic)}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                                    isRevoked
                                      ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                      : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                                  }`}
                                >
                                  {isRevoked ? "Restore" : "Revoke"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB CONTENT 5: DIAGNOSTICS SANDBOX ─────────────────── */}
            {activeTab === "diagnostics" && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#0c1527]/80 border border-sky-900/40 shadow-xl space-y-5">
                  <div className="border-b border-sky-900/30 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-4 h-4 text-sky-400" />
                      <h2 className="text-base font-bold text-white">Primary API Diagnostic Sandbox</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Directly query live subscription check and account verification endpoints without touching raw curl.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Diagnostic Query 1: Subscription Check */}
                    <div className="p-5 rounded-xl bg-[#070d18] border border-sky-950 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-sky-300 uppercase">
                          1. /api/subscription/check
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          POST
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-mono">Test Email:</label>
                          <input
                            type="email"
                            value={checkerEmail}
                            onChange={(e) => setCheckerEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#0a1220] border border-sky-900/40 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCheckSubscription()}
                            disabled={checkerLoading}
                            className="flex-1 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${checkerLoading ? "animate-spin" : ""}`} />
                            <span>Run Subscription Check</span>
                          </button>
                        </div>
                      </div>

                      {checkerResult && (
                        <div className="p-3.5 rounded-lg bg-[#0a1220] border border-sky-950 font-mono text-xs space-y-2">
                          <div className="text-[10px] text-slate-500 uppercase border-b border-sky-950 pb-1 flex justify-between">
                            <span>Response Payload</span>
                            <span className={checkerResult.active ? "text-emerald-400" : "text-amber-400"}>
                              {checkerResult.active ? "200 Active" : "200 Inactive"}
                            </span>
                          </div>
                          <pre className="text-[11px] text-sky-200 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(checkerResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Diagnostic Query 2: Account & Vanity Domain Check */}
                    <div className="p-5 rounded-xl bg-[#070d18] border border-sky-950 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-sky-300 uppercase">
                          2. /api/account/check
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          POST
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-mono">Hardware Machine ID:</label>
                          <input
                            type="text"
                            value={checkerMachineId}
                            onChange={(e) => setCheckerMachineId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#0a1220] border border-sky-900/40 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCheckAccount}
                            disabled={accountCheckLoading}
                            className="flex-1 py-2 px-3 rounded-lg bg-[#0e1f38] hover:bg-[#132a4e] border border-sky-500/30 text-sky-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Monitor className="w-3.5 h-3.5" />
                            <span>Run Machine Check</span>
                          </button>
                        </div>
                      </div>

                      {accountCheckResult && (
                        <div className="p-3.5 rounded-lg bg-[#0a1220] border border-sky-950 font-mono text-xs space-y-2">
                          <div className="text-[10px] text-slate-500 uppercase border-b border-sky-950 pb-1 flex justify-between">
                            <span>Response Payload</span>
                            <span className="text-sky-400">Status 200</span>
                          </div>
                          <pre className="text-[11px] text-sky-200 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(accountCheckResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB CONTENT 6: AUDIT & EVENT STREAM ────────────────── */}
            {activeTab === "audit" && (
              <div className="p-6 rounded-2xl bg-[#0c1527]/80 border border-sky-900/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-sky-900/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      System Activity & Cryptographic Log
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Security event stream</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-[#070d18] border border-sky-950 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <div>
                        <div className="text-white font-semibold">Console Session Authenticated</div>
                        <div className="text-slate-400 text-[11px]">
                          Administrative session unlocked from master clearance.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">Just now</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070d18] border border-sky-950 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <div>
                        <div className="text-white font-semibold">Hardware PC Nodes Reporting</div>
                        <div className="text-slate-400 text-[11px]">
                          {accounts.length} unique machines synced with hardware HMAC verification.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">Continuous</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070d18] border border-sky-950 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <div>
                        <div className="text-white font-semibold">RSA-2048 Private Signing Key Loaded</div>
                        <div className="text-slate-400 text-[11px]">
                          Offline license generation authority active and verified.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Provision Supporter Modal ───────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-[#0c1527] border border-sky-800/60 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Issue Cryptographic Supporter License
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setGeneratedKey("");
                }}
                className="text-slate-400 hover:text-white text-xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            {!generatedKey ? (
              <form onSubmit={handleManualAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Customer Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="donor@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070d18] border border-sky-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono transition"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Entitlement Duration Preset
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "7", label: "7 Days" },
                      { id: "30", label: "30 Days" },
                      { id: "365", label: "1 Year" },
                      { id: "0", label: "Lifetime" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setManualDuration(d.id)}
                        className={`py-2 px-2 text-xs rounded-xl border font-mono font-medium transition cursor-pointer ${
                          manualDuration === d.id
                            ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm"
                            : "bg-[#070d18] border-sky-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Bind to Specific PC Machine ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualMachineId}
                    onChange={(e) => setManualMachineId(e.target.value)}
                    placeholder="e.g. PS-CABDA074-A01FD367 (Leave blank for universal)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070d18] border border-sky-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Administrative Notes / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="e.g. VIP Donor, GitHub Sponsor #42"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070d18] border border-sky-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono transition"
                  />
                </div>

                {manualError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
                    {manualError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={manualLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold text-xs transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {manualLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing RSA Token...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Sign & Issue License</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>License successfully generated and signed with RSA-2048 private key!</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-mono">License Token:</span>
                    <span className="text-[10px] text-slate-500 font-mono">Format: base64.signature</span>
                  </div>
                  <div className="relative">
                    <textarea
                      readOnly
                      rows={4}
                      value={generatedKey}
                      className="w-full p-3 rounded-xl bg-[#070d18] border border-sky-900/50 font-mono text-[11px] text-emerald-300 select-all focus:outline-none leading-relaxed"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedKey);
                        setCopiedKey(true);
                        addToast("success", "Token Copied", "Copied to clipboard.");
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium transition flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedKey ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070d18] border border-sky-950 text-slate-400 text-[11px] font-mono space-y-1">
                  <div className="text-white font-semibold">Instructions for Supporter:</div>
                  <div className="text-slate-500">
                    Supporters can activate via Portside desktop settings or CLI:
                  </div>
                  <div className="p-1.5 bg-[#0a1220] rounded text-sky-300 select-all">
                    portside activate {generatedKey.slice(0, 28)}...
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setGeneratedKey("");
                    setManualEmail("");
                    setManualMachineId("");
                    setManualNotes("");
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0e192c] hover:bg-[#13223a] text-white text-xs font-semibold transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Master Footer ────────────────────────────────────────── */}
      <footer className="border-t border-sky-900/30 bg-[#080d17] py-6 text-center text-xs text-slate-500 relative z-10 font-mono">
        <p className="flex items-center justify-center gap-1.5">
          <span>Portside Control Engine</span>
          <span>·</span>
          <span>
            Architected by{" "}
            <a
              href="https://github.com/letsmakepact"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline"
            >
              pact (letsmakepact)
            </a>
          </span>
          <span>·</span>
          <span>Telegram: @pactwithdevil</span>
        </p>
      </footer>
    </div>
  );
}
