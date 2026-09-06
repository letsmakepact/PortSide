"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Primitives";
import { useDashboard } from "./DashboardProvider";
import type { ServiceDTO } from "@/lib/types";
import { DEV_SERVICE_ICONS, LEGACY_SERVICE_ICONS, cn, isValidHostname, slugify } from "@/lib/utils";
import { DevIcon, DEV_ICON_REGISTRY } from "@/components/ui/DevIcon";

export function ServiceFormModal({
  open,
  onClose,
  service,
  defaultProjectId,
}: {
  open: boolean;
  onClose: () => void;
  service?: ServiceDTO | null;
  defaultProjectId?: number | null;
}) {
  const editing = Boolean(service);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit service" : "Add a service"}
      description={editing ? "Changes apply to the proxy instantly." : "Map a local port to a memorable hostname."}
      size="lg"
    >
      {open && (
        <ServiceFormContent
          key={service?.id ?? "new"}
          service={service}
          defaultProjectId={defaultProjectId}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function ServiceFormContent({
  service,
  defaultProjectId,
  onClose,
}: {
  service?: ServiceDTO | null;
  defaultProjectId?: number | null;
  onClose: () => void;
}) {
  const { projects, services, createService, updateService, appPort } = useDashboard();
  const editing = Boolean(service);

  const [name, setName] = useState(service?.name ?? "");
  const [hostname, setHostname] = useState(service?.hostname ?? "");
  const [hostTouched, setHostTouched] = useState(Boolean(service));
  const [port, setPort] = useState(service ? String(service.port) : "");
  const [protocol, setProtocol] = useState(service?.protocol ?? "http");
  const [projectId, setProjectId] = useState<string>(
    service?.projectId ? String(service.projectId) : defaultProjectId ? String(defaultProjectId) : "",
  );
  const [icon, setIcon] = useState(service?.icon ?? "server");
  const [tags, setTags] = useState(service?.tags.join(", ") ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [favorite, setFavorite] = useState(service?.favorite ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!hostTouched) {
      setHostname(slugify(val));
    }
  };

  const hostnameTaken = services.some((s) => s.hostname === hostname && s.id !== service?.id);
  const hostnameValid = hostname.length === 0 || isValidHostname(hostname);
  const portNum = Number(port);
  const portConflict = services.find((s) => s.port === portNum && s.id !== service?.id);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Give your service a name.");
    if (!isValidHostname(hostname)) return setError("Hostname may only contain lowercase letters, numbers and hyphens.");
    if (hostnameTaken) return setError(`${hostname}.localhost is already in use.`);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) return setError("Enter a valid port (1–65535).");

    const payload = {
      name: name.trim(),
      hostname,
      port: portNum,
      protocol,
      projectId: projectId ? Number(projectId) : null,
      icon,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      description: description.trim(),
      favorite,
    };

    setSaving(true);
    onClose();
    if (service) await updateService(service.id, payload);
    else await createService(payload);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>Service Icon & Identity</Label>
            <span className="text-[11px] font-mono text-slate-400 capitalize">
              {DEV_ICON_REGISTRY[icon]?.name || icon}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-2">
            <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
              {DEV_SERVICE_ICONS.map((ic) => {
                const meta = DEV_ICON_REGISTRY[ic];
                const selected = icon === ic;
                return (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcon(ic)}
                    title={meta?.name || ic}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-150",
                      selected
                        ? "border-sky-500 bg-sky-500/20 text-sky-400 shadow-xs ring-2 ring-sky-500/30 scale-105"
                        : "border-transparent bg-white/40 dark:bg-slate-800/40 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    <DevIcon icon={ic} className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            {/* Legacy symbols accordion/toggle */}
            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1 overflow-x-auto py-0.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold px-1">Glyphs:</span>
              {LEGACY_SERVICE_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs transition",
                    icon === ic
                      ? "bg-sky-500/20 text-sky-400 ring-1 ring-sky-400"
                      : "text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-slate-200",
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="svc-name">Name</Label>
            <Input id="svc-name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Storefront API" autoFocus required />
          </div>
          <div>
            <Label htmlFor="svc-project">Project</Label>
            <Select id="svc-project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">No project</option>
              {projects.filter((p) => p.id > 0).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <Label htmlFor="svc-host">Hostname</Label>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <input
                id="svc-host"
                value={hostname}
                onChange={(e) => {
                  setHostTouched(true);
                  setHostname(e.target.value.toLowerCase());
                }}
                placeholder="api"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-sm outline-none"
                required
              />
              <span className="border-l border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-500">.localhost</span>
            </div>
            {!hostnameValid && <p className="mt-1 text-xs text-rose-600">Lowercase letters, numbers and hyphens only.</p>}
            {hostnameTaken && <p className="mt-1 text-xs text-rose-600">Already in use by another service.</p>}
          </div>
          <div className="w-full sm:w-24">
            <Label htmlFor="svc-proto">Protocol</Label>
            <Select id="svc-proto" value={protocol} onChange={(e) => setProtocol(e.target.value)}>
              <option value="http">http</option>
              <option value="https">https</option>
            </Select>
          </div>
          <div className="w-full sm:w-28">
            <Label htmlFor="svc-port">Port</Label>
            <Input id="svc-port" type="number" min={1} max={65535} value={port} onChange={(e) => setPort(e.target.value)} placeholder="8081" className="font-mono" required />
            {portConflict && <p className="mt-1 text-xs text-amber-600">Also used by {portConflict.name}</p>}
          </div>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 font-mono text-xs text-slate-500">
          <span className="text-slate-400">http://{hostname || "name"}.localhost{appPort !== "80" ? `:${appPort}` : ""}</span>
          <span>→</span>
          <span className="text-slate-700">{protocol}://localhost:{port || "port"}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="svc-tags">Tags</Label>
          <Input id="svc-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="go, backend, docker" />
          <p className="mt-1 text-xs text-slate-400">Comma separated</p>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
            <input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span>
              <span className="font-medium text-slate-800">Pin to top</span>
              <span className="block text-xs text-slate-500">Show first in lists</span>
            </span>
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="svc-desc">Notes</Label>
        <Textarea id="svc-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="How to start it, credentials, gotchas…" />
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {editing ? "Save changes" : "Add service"}
        </Button>
      </div>
    </form>
  );
}