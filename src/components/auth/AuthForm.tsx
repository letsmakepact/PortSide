"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Primitives";

interface DetectedUser {
  email: string;
  name: string;
  tier: string;
}

export function AuthForm({ mode, demo }: { mode: "login" | "register"; demo?: { email: string; password: string } }) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<"login" | "register" | "link">(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" && demo ? demo.email : "");
  const [password, setPassword] = useState(mode === "login" && demo ? demo.password : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [detectedUser, setDetectedUser] = useState<DetectedUser | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if an existing account is already registered locally
    fetch("/api/auth/detect-account")
      .then((r) => r.json())
      .then((d) => {
        if (d.detected && d.user) {
          setDetectedUser(d.user);
          // If in register mode or fresh landing, offer the link choice
          if (mode === "register") {
            setShowPrompt(true);
          }
        }
      })
      .catch(() => {});
  }, [mode]);

  function handleChooseLink() {
    if (!detectedUser) return;
    setEmail(detectedUser.email);
    setName(detectedUser.name || "");
    setCurrentMode("link");
    setShowPrompt(false);
    setError(null);
  }

  function handleChooseNew() {
    setEmail("");
    setName("");
    setPassword("");
    setCurrentMode("register");
    setShowPrompt(false);
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
          setShowPrompt(true);
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

  return (
    <div className="animate-fade-up">
      {/* Existing Account Detected Banner */}
      {showPrompt && detectedUser ? (
        <div className="rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/30 p-5 text-center shadow-xs mb-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 font-bold text-xl mb-2">
            ⚓
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Existing Portside Account Detected</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
            We found an account already installed on this machine:
            <br />
            <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
              {detectedUser.email}
            </span>{" "}
            ({detectedUser.name || "pact"})
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button
              onClick={handleChooseLink}
              size="sm"
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              Link Current Account
            </Button>
            <Button
              onClick={handleChooseNew}
              size="sm"
              variant="secondary"
            >
              Create New Account
            </Button>
          </div>
        </div>
      ) : null}

      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {currentMode === "link"
          ? "Link Your Account"
          : currentMode === "login"
          ? "Welcome back"
          : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {currentMode === "link"
          ? "Confirm your password to link this installation to your account."
          : currentMode === "login"
          ? "Sign in to manage your local hostnames."
          : "Runs entirely on your machine. Confirmed securely on server."}
      </p>

      {mode === "login" && demo && (
        <div className="mt-5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/70 dark:bg-indigo-950/30 px-4 py-3 text-xs text-indigo-800 dark:text-indigo-300">
          <p className="font-semibold">Demo account pre-filled</p>
          <p className="mt-0.5 font-mono">
            {demo.email} · {demo.password}
          </p>
        </div>
      )}

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={currentMode === "register" ? "At least 8 characters" : "••••••••"}
            autoComplete={currentMode === "login" ? "current-password" : "new-password"}
            required
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
            ? "Confirm & Link Account"
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
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
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
