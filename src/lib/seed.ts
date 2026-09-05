import { db } from "@/db";
import { users } from "@/db/schema";
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
    await db
      .insert(users)
      .values({ email: DEMO_EMAIL, name: "pact", passwordHash: hashPassword(DEMO_PASSWORD) });
  }
}

