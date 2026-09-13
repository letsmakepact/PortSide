"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useDashboard } from "./DashboardProvider";
import { PlusIcon } from "./ServicesView";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Input, Label, PageHeader, StatusDot, Textarea } from "@/components/ui/Primitives";
import { DevIcon } from "@/components/ui/DevIcon";
import type { ProjectDTO, ProjectInput } from "@/lib/types";
import {
  PROJECT_COLORS,
  PROJECT_CATEGORIES,
  PROJECT_ACCENTS,
  PROJECT_ICONS,
  cn,
  colorFor,
  type ProjectColor,
} from "@/lib/utils";
import {
  BookOpen,
  User as UserIcon,
  Tag as TagIcon,
  ExternalLink,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Check,
  FolderGit2,
} from "lucide-react";

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
        subtitle="Group related services with custom icons, categories, accents, and quick repository links."
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
          icon={<Layers className="h-5 w-5 text-slate-400" />}
          title="No projects configured"
          description="Group related services together under unified project categories and custom environments."
          action={
            <Button onClick={() => setOpen(true)}>
              <PlusIcon /> Create a project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const c = colorFor(p.color);
            const members = services.filter((s) => s.projectId === p.id);
            const online = members.filter((s) => s.enabled && s.lastStatus === "online").length;
            const categoryMeta = PROJECT_CATEGORIES.find((cat) => cat.id === p.category);
            const accentStyle = p.accent || "glow";

            return (
              <div
                key={p.id}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-lg border bg-[#111827] p-5 transition hover:border-slate-700 hover:bg-[#131b2c]",
                  accentStyle === "bordered"
                    ? cn("border", c.border)
                    : "border-[#1f2937]",
                  p.id < 0 && "animate-pulse",
                )}
              >
                {accentStyle === "glow" && (
                  <div className={cn("absolute inset-x-0 top-0 h-1", c.dot)} />
                )}
                {accentStyle === "solid" && (
                  <div className={cn("absolute inset-x-0 top-0 h-0.5", c.dot)} />
                )}

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-transform group-hover:scale-105",
                          c.bg,
                          c.border,
                          c.text,
                        )}
                      >
                        <DevIcon icon={p.icon || "layers"} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {p.name}
                          </h3>
                          {categoryMeta && (
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {categoryMeta.name}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-500">{p.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {p.repoUrl && (
                        <a
                          href={p.repoUrl.startsWith("http") ? p.repoUrl : `https://${p.repoUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Git Repository"
                          aria-label="Repository"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          <FolderGit2 className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {p.docsUrl && (
                        <a
                          href={p.docsUrl.startsWith("http") ? p.docsUrl : `https://${p.docsUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Documentation"
                          aria-label="Documentation"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                        </a>
                      )}
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

                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {p.description || "No description provided."}
                  </p>

                  {(p.lead || (p.tags && p.tags.length > 0)) && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {p.lead && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                          <UserIcon className="h-2.5 w-2.5 text-slate-400" />
                          {p.lead}
                        </span>
                      )}
                      {p.tags?.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400"
                        >
                          <TagIcon className="h-2.5 w-2.5 text-slate-400" />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {members.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 px-2 py-0.5 font-mono text-[10px] text-slate-700 dark:text-slate-300"
                      >
                        <StatusDot status={s.enabled ? s.lastStatus : "unknown"} className="h-1.5 w-1.5" />
                        {s.hostname}
                      </span>
                    ))}
                    {members.length > 4 && (
                      <span className="px-1 py-0.5 text-[10px] font-mono text-slate-500">
                        +{members.length - 4} more
                      </span>
                    )}
                    {members.length === 0 && (
                      <span className="text-[11px] text-slate-500 italic">No services assigned</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-semibold border",
                      c.bg,
                      c.border,
                      c.text,
                    )}
                  >
                    {online}/{members.length} online
                  </span>
                  <Link
                    href={`/dashboard/services?project=${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                  >
                    Open services <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            );
          })}

          {ungrouped > 0 && (
            <Link
              href="/dashboard/services?project=none"
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-5 text-center transition hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
              <p className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">{ungrouped} ungrouped service{ungrouped === 1 ? "" : "s"}</p>
              <p className="text-[11px] text-slate-500">Click to review and assign</p>
            </Link>
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit project" : "New project"} size="lg">
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
  onSave: (data: ProjectInput) => Promise<void>;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [color, setColor] = useState<ProjectColor>((editing?.color as ProjectColor) ?? "indigo");
  const [icon, setIcon] = useState<string>(editing?.icon ?? "layers");
  const [category, setCategory] = useState<string>(editing?.category ?? "development");
  const [accent, setAccent] = useState<string>(editing?.accent ?? "glow");
  const [tags, setTags] = useState<string>(editing?.tags?.join(", ") ?? "");
  const [repoUrl, setRepoUrl] = useState<string>(editing?.repoUrl ?? "");
  const [docsUrl, setDocsUrl] = useState<string>(editing?.docsUrl ?? "");
  const [lead, setLead] = useState<string>(editing?.lead ?? "");
  const [activeTab, setActiveTab] = useState<"identity" | "styling" | "links">("identity");
  const [error, setError] = useState<string | null>(null);

  const c = colorFor(color);
  const categoryMeta = PROJECT_CATEGORIES.find((cat) => cat.id === category);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      setActiveTab("identity");
      return;
    }
    setError(null);
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    await onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      category,
      accent,
      tags: parsedTags,
      repoUrl: repoUrl.trim(),
      docsUrl: docsUrl.trim(),
      lead: lead.trim(),
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Live Preview
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {color} · {category} · {accent}
          </span>
        </div>

        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-slate-50/60 dark:bg-slate-900/60 p-4 transition-all duration-200",
            accent === "bordered"
              ? cn("border-2", c.border)
              : "border-slate-200 dark:border-slate-800",
            accent === "gradient" && "bg-gradient-to-b from-slate-100/70 dark:from-slate-800/40",
          )}
        >
          {accent === "glow" && (
            <div className={cn("absolute inset-x-0 top-0 h-1", c.dot)} />
          )}
          {accent === "gradient" && (
            <div className={cn("absolute inset-x-0 top-0 h-12 bg-gradient-to-b opacity-20 pointer-events-none", c.gradient)} />
          )}
          {accent === "solid" && (
            <div className={cn("absolute inset-x-0 top-0 h-0.5", c.dot)} />
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-xs",
                  c.bg,
                  c.border,
                  c.text,
                )}
              >
                <DevIcon icon={icon} className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {name.trim() || "Storefront"}
                  </h4>
                  {categoryMeta && (
                    <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {categoryMeta.name}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-slate-400">
                  {name.trim() ? name.toLowerCase().replace(/\s+/g, "-") : "storefront"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {repoUrl && (
                <span className="flex h-6 w-6 items-center justify-center rounded text-slate-400">
                  <FolderGit2 className="h-3.5 w-3.5" />
                </span>
              )}
              {docsUrl && (
                <span className="flex h-6 w-6 items-center justify-center rounded text-slate-400">
                  <BookOpen className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            {description.trim() || "What lives in this project?"}
          </p>

          {(lead || tags) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {lead && (
                <span className="inline-flex items-center gap-1 rounded bg-slate-200/60 dark:bg-slate-800/80 px-1.5 py-0.5 text-[9px] text-slate-600 dark:text-slate-300">
                  <UserIcon className="h-2.5 w-2.5 text-slate-400" />
                  {lead}
                </span>
              )}
              {tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .slice(0, 4)
                .map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded bg-slate-200/40 dark:bg-slate-800/50 px-1.5 py-0.5 text-[9px] font-mono text-slate-500"
                  >
                    #{t}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("identity")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition",
            activeTab === "identity"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
          )}
        >
          <Layers className="h-3.5 w-3.5" /> Identity & Icon
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("styling")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition",
            activeTab === "styling"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
          )}
        >
          <Sparkles className="h-3.5 w-3.5" /> Color & Theme
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("links")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition",
            activeTab === "links"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Links & Team
        </button>
      </div>

      {activeTab === "identity" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="p-name">Project Name</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Storefront"
              autoFocus
              className={cn(error && "border-rose-500 ring-rose-500/20")}
            />
          </div>

          <div>
            <Label>Environment / Category</Label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {PROJECT_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-medium transition",
                      isSelected
                        ? "border-sky-500 bg-sky-500/15 text-sky-400 font-semibold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700",
                    )}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Project Icon</Label>
              <span className="text-[11px] font-mono text-slate-400 capitalize">{icon}</span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-2">
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                {PROJECT_ICONS.map((ic) => {
                  const selected = icon === ic;
                  return (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setIcon(ic)}
                      title={ic}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-150",
                        selected
                          ? "border-sky-500 bg-sky-500/20 text-sky-400 shadow-xs ring-2 ring-sky-500/30 scale-105"
                          : "border-transparent bg-white/40 dark:bg-slate-800/40 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-200",
                      )}
                    >
                      <DevIcon icon={ic} className="h-4.5 w-4.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="p-desc">Description (Optional)</Label>
            <Textarea
              id="p-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What lives in this project?"
              rows={2}
            />
          </div>
        </div>
      )}

      {activeTab === "styling" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Palette Color</Label>
              <span className="text-[11px] font-mono capitalize text-slate-400">{color}</span>
            </div>
            <div className="grid grid-cols-8 gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3">
              {PROJECT_COLORS.map((cKey) => {
                const cDef = colorFor(cKey);
                const isSelected = color === cKey;
                return (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() => setColor(cKey)}
                    className={cn(
                      "group relative flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110",
                      cDef.dot,
                      isSelected && "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 shadow-md",
                    )}
                    aria-label={cKey}
                    title={cKey}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Card Accent Style</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {PROJECT_ACCENTS.map((acc) => {
                const isSelected = accent === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setAccent(acc.id)}
                    className={cn(
                      "flex flex-col items-start rounded-xl border p-2.5 text-left transition",
                      isSelected
                        ? "border-sky-500 bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/40"
                        : "border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700",
                    )}
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {acc.name}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-500">{acc.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "links" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="p-tags">Tags (Comma-separated)</Label>
            <Input
              id="p-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="frontend, nextjs, stripe, docker"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-repo">Repository URL</Label>
              <Input
                id="p-repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="github.com/myorg/repo"
              />
            </div>
            <div>
              <Label htmlFor="p-docs">Documentation URL</Label>
              <Input
                id="p-docs"
                value={docsUrl}
                onChange={(e) => setDocsUrl(e.target.value)}
                placeholder="docs.myproject.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="p-lead">Owner / Team Lead</Label>
            <Input
              id="p-lead"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              placeholder="@kovak or Core Team"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-400 ring-1 ring-rose-500/20">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{editing ? "Save project" : "Create project"}</Button>
      </div>
    </form>
  );
}

function IconButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
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