import { db } from "@/db";
import { activityLogs, projects, services, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { ensureUserPortsideDirectory } from "@/lib/userDir";

export const DEMO_EMAIL = "demo@portside.dev";
export const DEMO_PASSWORD = "demo1234";

let seedPromise: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  ensureUserPortsideDirectory();
  if (!seedPromise) {
    seedPromise = seed().catch((err) => {
      seedPromise = null;
      console.error("Seed failed", err);
    });
  }
  return seedPromise;
}

async function seed() {
  let [user] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);

  if (!user) {
    const [created] = await db
      .insert(users)
      .values({ email: DEMO_EMAIL, name: "pact", passwordHash: hashPassword(DEMO_PASSWORD) })
      .returning();
    user = created;
  }

  if (!user) return;

  const existingServices = await db.select({ id: services.id }).from(services).where(eq(services.userId, user.id)).limit(1);
  if (existingServices.length > 0) return;

  const projectRows = await db
    .insert(projects)
    .values([
      {
        userId: user.id,
        name: "Storefront",
        slug: "storefront",
        color: "sky",
        description: "Customer-facing e-commerce app: Next.js web, Go API, and the checkout worker.",
      },
      {
        userId: user.id,
        name: "Data Platform",
        slug: "data-platform",
        color: "emerald",
        description: "Analytics pipeline, warehouse UI and the Airflow scheduler.",
      },
      {
        userId: user.id,
        name: "Internal Tools",
        slug: "internal-tools",
        color: "amber",
        description: "Admin panel, feature flags and the design system playground.",
      },
      {
        userId: user.id,
        name: "Side Projects",
        slug: "side-projects",
        color: "rose",
        description: "Weekend hacks and experiments that somehow still need ports.",
      },
    ])
    .returning();

  const byName = Object.fromEntries(projectRows.map((p) => [p.slug, p.id]));
  const now = Date.now();
  const ago = (min: number) => new Date(now - min * 60_000);

  const serviceRows = await db
    .insert(services)
    .values([
      {
        userId: user.id,
        projectId: byName["storefront"],
        name: "Storefront Web",
        hostname: "shop",
        port: 3001,
        icon: "🛒",
        description: "Next.js storefront. Run with pnpm dev in apps/web.",
        tags: ["next.js", "frontend"],
        favorite: true,
        lastStatus: "online",
        lastCheckedAt: ago(1),
        lastLatencyMs: 42,
        createdAt: ago(60 * 24 * 12),
      },
      {
        userId: user.id,
        projectId: byName["storefront"],
        name: "Storefront API",
        hostname: "api",
        port: 8081,
        icon: "⚡",
        description: "Go REST API backing the storefront. Swagger at /docs.",
        tags: ["go", "backend", "rest"],
        favorite: true,
        lastStatus: "online",
        lastCheckedAt: ago(1),
        lastLatencyMs: 8,
        createdAt: ago(60 * 24 * 12),
      },
      {
        userId: user.id,
        projectId: byName["storefront"],
        name: "Checkout Worker",
        hostname: "checkout",
        port: 8082,
        icon: "📦",
        description: "Background job runner for orders & payments. Exposes a small health UI.",
        tags: ["worker", "go"],
        lastStatus: "offline",
        lastCheckedAt: ago(1),
        createdAt: ago(60 * 24 * 10),
      },
      {
        userId: user.id,
        projectId: byName["storefront"],
        name: "Stripe Webhook Tunnel",
        hostname: "webhooks",
        port: 4242,
        icon: "📬",
        description: "Local receiver for stripe listen.",
        tags: ["stripe", "webhooks"],
        lastStatus: "offline",
        lastCheckedAt: ago(1),
        createdAt: ago(60 * 24 * 7),
      },
      {
        userId: user.id,
        projectId: byName["data-platform"],
        name: "Metabase",
        hostname: "metabase",
        port: 3030,
        icon: "📊",
        description: "Dashboards over the local warehouse replica.",
        tags: ["analytics", "docker"],
        lastStatus: "online",
        lastCheckedAt: ago(1),
        lastLatencyMs: 120,
        createdAt: ago(60 * 24 * 30),
      },
      {
        userId: user.id,
        projectId: byName["data-platform"],
        name: "Airflow",
        hostname: "airflow",
        port: 8080,
        icon: "🛰️",
        description: "Scheduler UI. Username/password: airflow / airflow.",
        tags: ["python", "docker", "pipelines"],
        lastStatus: "online",
        lastCheckedAt: ago(1),
        lastLatencyMs: 210,
        createdAt: ago(60 * 24 * 30),
      },
      {
        userId: user.id,
        projectId: byName["data-platform"],
        name: "Jupyter Lab",
        hostname: "notebooks",
        port: 8888,
        icon: "🧪",
        description: "Notebook server for ad-hoc analysis.",
        tags: ["python", "notebooks"],
        lastStatus: "offline",
        lastCheckedAt: ago(1),
        createdAt: ago(60 * 24 * 20),
      },
      {
        userId: user.id,
        projectId: byName["internal-tools"],
        name: "Admin Panel",
        hostname: "admin",
        port: 5173,
        icon: "🔐",
        description: "Vite + React admin. Hot reload is flaky, restart if stuck.",
        tags: ["vite", "react"],
        favorite: true,
        lastStatus: "online",
        lastCheckedAt: ago(1),
        lastLatencyMs: 15,
        createdAt: ago(60 * 24 * 40),
      },
      {
        userId: user.id,
        projectId: byName["internal-tools"],
        name: "Storybook",
        hostname: "storybook",
        port: 6006,
        icon: "🎨",
        description: "Design system component playground.",
        tags: ["storybook", "design-system"],
        lastStatus: "online",
        lastCheckedAt: ago(1),
        lastLatencyMs: 33,
        createdAt: ago(60 * 24 * 40),
      },
      {
        userId: user.id,
        projectId: byName["internal-tools"],
        name: "Feature Flags",
        hostname: "flags",
        port: 4000,
        icon: "🧩",
        description: "Self-hosted Unleash instance.",
        tags: ["docker"],
        lastStatus: "offline",
        lastCheckedAt: ago(1),
        createdAt: ago(60 * 24 * 5),
      },
      {
        userId: user.id,
        projectId: byName["side-projects"],
        name: "Ollama Chat UI",
        hostname: "chat",
        port: 11434,
        icon: "🤖",
        description: "Local LLM playground. Needs ollama serve running first.",
        tags: ["ai", "experiment"],
        lastStatus: "offline",
        lastCheckedAt: ago(1),
        createdAt: ago(60 * 24 * 3),
      },
      {
        userId: user.id,
        projectId: null,
        name: "Mailpit",
        hostname: "mail",
        port: 8025,
        icon: "📝",
        description: "Catches all outgoing dev email.",
        tags: ["email", "docker"],
        lastStatus: "online",
        lastCheckedAt: ago(1),
        lastLatencyMs: 5,
        createdAt: ago(60 * 24 * 60),
      },
      {
        userId: user.id,
        projectId: null,
        name: "pgAdmin",
        hostname: "pgadmin",
        port: 5050,
        icon: "🗄️",
        description: "Postgres admin for every local database.",
        tags: ["postgres", "docker"],
        enabled: false,
        lastStatus: "unknown",
        createdAt: ago(60 * 24 * 90),
      },
    ])
    .returning();

  const svc = Object.fromEntries(serviceRows.map((s) => [s.hostname, s.id]));

  await db.insert(activityLogs).values([
    { userId: user.id, serviceId: svc["shop"], action: "created", message: "Registered shop.localhost → :3001", createdAt: ago(60 * 24 * 12) },
    { userId: user.id, serviceId: svc["api"], action: "created", message: "Registered api.localhost → :8081", createdAt: ago(60 * 24 * 12) },
    { userId: user.id, serviceId: svc["admin"], action: "updated", message: "Changed Admin Panel port from 3000 to 5173", createdAt: ago(60 * 24 * 2) },
    { userId: user.id, serviceId: svc["chat"], action: "created", message: "Registered chat.localhost → :11434", createdAt: ago(60 * 24 * 3) },
    { userId: user.id, serviceId: svc["checkout"], action: "status", message: "Checkout Worker went offline", createdAt: ago(190) },
    { userId: user.id, serviceId: svc["metabase"], action: "status", message: "Metabase came back online", createdAt: ago(95) },
    { userId: user.id, serviceId: svc["flags"], action: "created", message: "Registered flags.localhost → :4000", createdAt: ago(60 * 24 * 5) },
    { userId: user.id, serviceId: svc["pgadmin"], action: "updated", message: "Disabled pgAdmin route", createdAt: ago(60 * 24) },
    { userId: user.id, serviceId: svc["storybook"], action: "status", message: "Storybook came back online", createdAt: ago(40) },
    { userId: user.id, serviceId: svc["webhooks"], action: "status", message: "Stripe Webhook Tunnel went offline", createdAt: ago(12) },
  ]);
}
