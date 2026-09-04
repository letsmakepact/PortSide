"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Primitives";

export function AuthForm({ mode, demo }: { mode: "login" | "register"; demo?: { email: string; password: string } }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" && demo ? demo.email : "");
  const [password, setPassword] = useState(mode === "login" && demo ? demo.password : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
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
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {mode === "login" ? "Sign in to manage your local hostnames." : "Free forever. Runs entirely on your machine."}
      </p>

      {mode === "login" && demo && (
        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-xs text-indigo-800">
          <p className="font-semibold">Demo account pre-filled</p>
          <p className="mt-0.5 font-mono">{demo.email} · {demo.password}</p>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "register" && (
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" required />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
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
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
