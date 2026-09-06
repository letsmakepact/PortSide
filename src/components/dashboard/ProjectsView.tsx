"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useDashboard } from "./DashboardProvider";
import { PlusIcon } from "./ServicesView";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Input, Label, PageHeader, StatusDot, Textarea } from "@/components/ui/Primitives";
import type { ProjectDTO } from "@/lib/types";
import { PROJECT_COLORS, cn, colorFor } from "@/lib/utils";

export function ProjectsView() {
  const { projects, services, createProject, updateProject, deleteProject } = useDashboard();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectDTO | null>(null);
  const [deleting, setDeleting] = useState<ProjectDTO | null>(null);

  const ungrouped = services.filter((s) => s.projectId === null).length;

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Group related services so your sidebar of ports reads like a map of your work."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <PlusIcon /> New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>}
          title="No projects configured"
          description="Group related services together under unified project categories."
          action={
            <Button onClick={() => setOpen(true)}>
              <PlusIcon /> Create a project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const c = colorFor(p.color);
            const members = services.filter((s) => s.projectId === p.id);
            const online = members.filter((s) => s.enabled && s.lastStatus === "online").length;
            return (
              <div
                key={p.id}
                className={cn("group relative flex flex-col rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-brand-surface dark:bg-brand-surface-dark p-4.5 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-brand-bg dark:hover:bg-[#0f172a] backdrop-blur-xs", p.id < 0 && "animate-pulse")}
              >
                <div className={cn("absolute inset-x-4 top-0 h-0.5 rounded-b", c.dot)} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{p.name}</h3>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-500">{p.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <IconButton
                      label="Edit"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                    >
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3l3 3-9 9H5v-3l9-9z" /></svg>
                    </IconButton>
                    <IconButton label="Delete" onClick={() => setDeleting(p)} danger>
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" /></svg>
                    </IconButton>
                  </div>
                </div>
                <p className="mt-2.5 line-clamp-2 min-h-[2.25rem] text-xs leading-relaxed text-slate-400">{p.description || "No description provided."}</p>

                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {members.slice(0, 5).map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                      <StatusDot status={s.enabled ? s.lastStatus : "unknown"} className="h-1.5 w-1.5" />
                      {s.hostname}
                    </span>
                  ))}
                  {members.length > 5 && <span className="px-1 py-0.5 text-[10px] font-mono text-slate-500">+{members.length - 5} more</span>}
                  {members.length === 0 && <span className="text-[11px] text-slate-500">No services assigned</span>}
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-brand-bg dark:border-slate-800/80 pt-2.5">
                  <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700/40", c.bg, c.text)}>
                    {online}/{members.length} online
                  </span>
                  <Link href={`/dashboard/services?project=${p.id}`} className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    Open services →
                  </Link>
                </div>
              </div>
            );
          })}

          {ungrouped > 0 && (
            <Link
              href="/dashboard/services?project=none"
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4.5 text-center transition hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
              <p className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">{ungrouped} ungrouped service{ungrouped === 1 ? "" : "s"}</p>
              <p className="text-[11px] text-slate-500">Click to review and assign</p>
            </Link>
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit project" : "New project"} size="sm">
        {open && (
          <ProjectForm
            key={editing?.id ?? "new"}
            editing={editing}
            onClose={() => setOpen(false)}
            onSave={async (payload) => {
              setOpen(false);
              if (editing) await updateProject(editing.id, payload);
              else await createProject(payload);
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteProject(deleting.id)}
        title={`Delete "${deleting?.name}"?`}
        description="Services in this project will be kept but become ungrouped."
      />
    </div>
  );
}

function ProjectForm({
  editing,
  onClose,
  onSave,
}: {
  editing: ProjectDTO | null;
  onClose: () => void;
  onSave: (data: { name: string; description: string; color: string }) => Promise<void>;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [color, setColor] = useState<string>(editing?.color ?? "indigo");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Project name is required.");
    await onSave({ name: name.trim(), description: description.trim(), color });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="p-name">Name</Label>
        <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Storefront" autoFocus required />
      </div>
      <div>
        <Label htmlFor="p-desc">Description</Label>
        <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What lives in this project?" />
      </div>
      <div>
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn("h-7 w-7 rounded-full transition", colorFor(c).dot, color === c ? "ring-2 ring-slate-900 ring-offset-2" : "hover:scale-110")}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{editing ? "Save" : "Create project"}</Button>
      </div>
    </form>
  );
}

function IconButton({ children, onClick, label, danger }: { children: React.ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition touch-action-manipulation",
        danger
          ? "hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
          : "hover:bg-brand-bg dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}