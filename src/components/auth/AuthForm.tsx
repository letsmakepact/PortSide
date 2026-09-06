"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Primitives";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

interface DetectedUser {
  email: string;
  name: string;
  tier: string;
  isPremium?: boolean;
  isLinked?: boolean;
}

export function AuthForm({ mode, demo }: { mode: "login" | "register"; demo?: { email: string; password: string } }) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<"login" | "register" | "link">(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [detectedUser, setDetectedUser] = useState<DetectedUser | null>(null);
  const [isChoiceScreen, setIsChoiceScreen] = useState(false);
  const [hasDismissedChoice, setHasDismissedChoice] = useState(false);

  const isPremiumAccount = Boolean(
    detectedUser?.isPremium || detectedUser?.tier === "supporter" || email.toLowerCase().startsWith("pact@")
  );
  const isPasswordMandatory = currentMode !== "link" || isPremiumAccount;

  useEffect(() => {
    // Detect if an account already exists locally on this machine
    fetch("/api/auth/detect-account")
      .then((r) => r.json())
      .then((d) => {
        if (d.detected && d.user) {
          setDetectedUser(d.user);
          if (!hasDismissedChoice) {
            setIsChoiceScreen(true);
          }
        } else if (mode === "login" && demo) {
          setEmail(demo.email);
          setPassword(demo.password);
        }
      })
      .catch(() => {});
  }, [mode, demo, hasDismissedChoice]);

  function handleChooseLink() {
    if (!detectedUser) return;
    setEmail(detectedUser.email);
    setName(detectedUser.name || "");
    setPassword("");
    setCurrentMode("link");
    setIsChoiceScreen(false);
    setHasDismissedChoice(true);
    setError(null);
  }

  function handleChooseNew() {
    setEmail("");
    setName("");
    setPassword("");
    setCurrentMode("register");
    setIsChoiceScreen(false);
    setHasDismissedChoice(true);
    setError(null);
  }

  function handleBackToChoice() {
    setIsChoiceScreen(true);
    setError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const targetUrl = currentMode === "link" ? "/api/auth/link" : `/api/auth/${currentMode}`;

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          currentMode === "register" ? { name, email, password } : { email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        if (data.canLink && detectedUser) {
          setIsChoiceScreen(true);
        }
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  // CHOICE SCREEN: If an existing account was detected on this machine
  if (isChoiceScreen && detectedUser) {
    return (
      <div className="animate-fade-up">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs mb-3">
            <AnchorLogo className="h-7 w-7 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Existing Account Found
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Portside detected an existing account registered on this machine.
          </p>
        </div>

        <div className="rounded-2xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 flex items-center justify-center font-bold text-sky-700 dark:text-sky-300">
              {detectedUser.name ? detectedUser.name.charAt(0).toUpperCase() : "P"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {detectedUser.name || "Portside User"}
              </p>
              <p className="text-xs font-mono text-sky-700 dark:text-sky-300">
                {detectedUser.email}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-sky-100 dark:bg-sky-900/50 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:text-sky-200">
            {detectedUser.isLinked ? "Linked" : "Detected"}
          </span>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleChooseLink}
            className="w-full text-left p-4 rounded-xl border border-sky-500 bg-sky-500/5 hover:bg-sky-500/10 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Use Current Account
                {isPremiumAccount && (
                  <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                    Supporter
                  </span>
                )}
                <span className="text-xs bg-sky-600 text-white px-2 py-0.5 rounded-full font-normal">
                  Recommended
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isPremiumAccount
                  ? "Enter your password to verify on server and unlock supporter perks."
                  : detectedUser.isLinked
                  ? "Enter your password to sign into your linked account."
                  : "Sign in with your password to link this device and sync your hosts."}
              </p>
            </div>
            <span className="text-sky-600 dark:text-sky-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            type="button"
            onClick={handleChooseNew}
            className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Create a Different Account
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Register a new account or sign in with another email.
              </p>
            </div>
            <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        {detectedUser && hasDismissedChoice && (
          <button
            type="button"
            onClick={handleBackToChoice}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← Back to account choice
          </button>
        )}
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {currentMode === "link"
          ? "Confirm & Link Account"
          : currentMode === "login"
          ? "Welcome back"
          : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {currentMode === "link"
          ? `Link ${email} to this PC and sync your supporter status.`
          : currentMode === "login"
          ? "Sign in to manage your local hostnames."
          : "Runs entirely on your machine. Confirmed securely on server."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {currentMode === "register" && (
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              autoComplete="name"
              required
            />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            readOnly={currentMode === "link"}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">
            {currentMode === "link"
              ? isPremiumAccount
                ? "Password (Required to verify Supporter Account on server)"
                : "Password (Optional)"
              : "Password"}
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              currentMode === "link"
                ? isPremiumAccount
                  ? "Enter your password to verify on server"
                  : "Enter password or leave blank to link"
                : currentMode === "register"
                ? "At least 8 characters"
                : "••••••••"
            }
            autoComplete={currentMode === "login" ? "current-password" : "new-password"}
            required={isPasswordMandatory}
            minLength={currentMode === "register" ? 8 : undefined}
          />
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 dark:bg-rose-950/50 px-3 py-2 text-sm text-rose-700 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {currentMode === "link"
            ? isPremiumAccount
              ? "Verify on Server & Link Account"
              : "Confirm & Link Account"
            : currentMode === "login"
            ? "Sign in"
            : "Create account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {currentMode === "link" ? (
          <button
            type="button"
            onClick={handleChooseNew}
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Create a different account instead
          </button>
        ) : currentMode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
