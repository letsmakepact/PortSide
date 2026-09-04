import { db } from "@/db";
import { activityLogs, projects, services, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const DEMO_EMAIL = "demo@portside.dev";
export const DEMO_PASSWORD = "demo1234";

let seedPromise: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seed().catch((err) => {
      seedPromise = null;
      console.error("Seed failed", err);
    });
  }
  return seedPromise;
}

async function seed() {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (existing.length > 0) return;

  await db
    .insert(users)
    .values({ email: DEMO_EMAIL, name: "pact", passwordHash: hashPassword(DEMO_PASSWORD) })
    .returning();
}

