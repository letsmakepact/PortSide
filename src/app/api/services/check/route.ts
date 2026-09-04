import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, services } from "@/db/schema";
import { requireUser, UnauthorizedError, unauthorized } from "@/lib/auth";
import { toServiceDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

async function probe(protocol: string, port: number): Promise<{ online: boolean; latency: number | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  const started = Date.now();
  try {
    await fetch(`${protocol}://127.0.0.1:${port}/`, { method: "GET", signal: controller.signal, redirect: "manual" });
    return { online: true, latency: Date.now() - started };
  } catch (err) {
    const code = (err as { cause?: { code?: string } })?.cause?.code;
    if (code && ["ERR_SSL_WRONG_VERSION_NUMBER", "EPROTO", "UND_ERR_SOCKET"].includes(code)) {
      return { online: true, latency: Date.now() - started };
    }
    return { online: false, latency: null };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST() {
  try {
    const user = await requireUser();
    const rows = await db.select().from(services).where(eq(services.userId, user.id));
    const now = new Date();

    const results = await Promise.all(
      rows.map(async (svc) => {
        if (!svc.enabled) return { svc, status: "unknown" as const, latency: null };
        const { online, latency } = await probe(svc.protocol, svc.port);
        return { svc, status: online ? ("online" as const) : ("offline" as const), latency };
      }),
    );

    const transitions: { serviceId: number; message: string }[] = [];
    const updated = await Promise.all(
      results.map(async ({ svc, status, latency }) => {
        if (svc.enabled && svc.lastStatus !== "unknown" && svc.lastStatus !== status) {
          transitions.push({
            serviceId: svc.id,
            message: status === "online" ? `${svc.name} came back online` : `${svc.name} went offline`,
          });
        }
        const [row] = await db
          .update(services)
          .set({ lastStatus: status, lastCheckedAt: now, lastLatencyMs: latency })
          .where(eq(services.id, svc.id))
          .returning();
        return row;
      }),
    );

    if (transitions.length) {
      await db.insert(activityLogs).values(transitions.map((t) => ({ userId: user.id, serviceId: t.serviceId, action: "status", message: t.message })));
    }

    return Response.json({ services: updated.map(toServiceDTO), checkedAt: now.toISOString(), transitions: transitions.length });
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorized();
    throw e;
  }
}
