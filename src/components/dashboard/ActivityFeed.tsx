"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card, EmptyState, PageHeader } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import type { ActivityDTO } from "@/lib/types";
import { cn, formatRelative } from "@/lib/utils";

const iconFor: Record<string, { bg: string; glyph: string }> = {
  created: { bg: "bg-emerald-100 text-emerald-700", glyph: "+" },
  updated: { bg: "bg-sky-100 text-sky-700", glyph: "✎" },
  deleted: { bg: "bg-rose-100 text-rose-700", glyph: "–" },
  status: { bg: "bg-amber-100 text-amber-700", glyph: "⇅" },
  project: { bg: "bg-violet-100 text-violet-700", glyph: "▣" },
  account: { bg: "bg-indigo-100 text-indigo-700", glyph: "★" },
};

export function ActivityIcon({ action }: { action: string }) {
  const i = iconFor[action] ?? { bg: "bg-slate-100 text-slate-600", glyph: "•" };
  return <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", i.bg)}>{i.glyph}</span>;
}

function groupByDay(items: ActivityDTO[]) {
  const groups: { label: string; items: ActivityDTO[] }[] = [];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  for (const a of items) {
    const d = new Date(a.createdAt).toDateString();
    const label = d === today ? "Today" : d === yesterday ? "Yesterday" : new Date(a.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric" });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(a);
    else groups.push({ label, items: [a] });
  }
  return groups;
}

export function ActivityFeed({ initialActivity }: { initialActivity: ActivityDTO[] }) {
  const [activity, setActivity] = useState(initialActivity);
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();

  async function clearAll() {
    const snapshot = activity;
    setActivity([]);
    const res = await fetch("/api/activity", { method: "DELETE" });
    if (!res.ok) {
      setActivity(snapshot);
      toast({ tone: "error", title: "Couldn't clear activity" });
    } else {
      toast({ tone: "success", title: "Activity cleared" });
    }
  }

  return (
    <div>
      <PageHeader
        title="Activity"
        subtitle="A running log of changes and status transitions, recorded by the background monitor."
        actions={
          activity.length > 0 && (
            <Button variant="secondary" onClick={() => setConfirm(true)}>
              Clear log
            </Button>
          )
        }
      />
      {activity.length === 0 ? (
        <EmptyState icon="🕒" title="No activity yet" description="Create, edit or check services and everything will show up here." />
      ) : (
        <div className="space-y-6">
          {groupByDay(activity).map((g) => (
            <div key={g.label}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{g.label}</p>
              <Card className="bg-brand-surface dark:bg-brand-surface-dark border-brand-bg dark:border-slate-800">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {g.items.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                      <ActivityIcon action={a.action} />
                      <p className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-slate-200">{a.message}</p>
                      <span className="shrink-0 rounded-md bg-brand-bg dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{a.action}</span>
                      <time className="w-16 shrink-0 text-right text-xs text-slate-400" title={new Date(a.createdAt).toLocaleString()}>
                        {formatRelative(a.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={clearAll}
        title="Clear activity log?"
        description="This removes every entry from your activity history."
        confirmLabel="Clear"
      />
    </div>
  );
}
