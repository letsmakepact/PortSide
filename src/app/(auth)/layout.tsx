import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">Portside</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Stop remembering ports.
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              Start naming them.
            </span>
          </h2>
          <p className="mt-5 text-slate-400">
            Portside runs quietly in the background and gives every local dev server its own hostname.
          </p>
          <div className="mt-8 space-y-3 font-mono text-sm">
            {[
              ["localhost:8081", "api.localhost"],
              ["localhost:5173", "admin.localhost"],
              ["localhost:3030", "metabase.localhost"],
            ].map(([from, to]) => (
              <div key={from} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <span className="text-slate-500 line-through">{from}</span>
                <span className="text-slate-600">→</span>
                <span className="text-emerald-300">{to}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex flex-col gap-1 text-xs text-slate-400">
          <p>Built for developers juggling a dozen localhost processes.</p>
          <p className="text-slate-500">
            Created by{" "}
            <a
              href="https://github.com/letsmakepact"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              pact (letsmakepact)
            </a>{" "}
            ·{" "}
            <a
              href="https://t.me/pactwithdevil"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              telegram @pactwithdevil
            </a>
          </p>
        </div>
      </aside>
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo />
            <span className="text-lg font-semibold tracking-tight text-slate-900">Portside</span>
          </div>
          {children}
          <div className="mt-8 text-center text-xs text-slate-400">
            Created by{" "}
            <a href="https://github.com/letsmakepact" target="_blank" rel="noreferrer" className="font-medium text-slate-600 hover:underline">
              pact
            </a>{" "}
            ·{" "}
            <a href="https://t.me/pactwithdevil" target="_blank" rel="noreferrer" className="font-medium text-slate-600 hover:underline">
              @pactwithdevil
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function Logo() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-600/30">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h16M12 4v16" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    </span>
  );
}
