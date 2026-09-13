"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Primitives";

interface AuthFormProps {
  mode: "login" | "register";
  demo?: { email: string; password: string };
  redirectTo?: string;
}

export function AuthForm({
  mode,
  demo,
  redirectTo,
}: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(demo?.email ?? "");
  const [password, setPassword] = useState(demo?.password ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const targetUrl = `/api/auth/${mode}`;

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register" ? { name, email, password } : { email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      const destination = redirectTo || "/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {mode === "login"
          ? "Sign in to manage your local hostnames."
          : "Runs entirely on your machine. Confirmed securely on server."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "register" && (
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
            autoComplete="username"
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
            placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={mode === "register" ? 8 : undefined}
          />
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 dark:bg-rose-950/50 px-3 py-2 text-sm text-rose-700 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {mode === "login" ? (
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

