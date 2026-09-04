import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeeded();
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
