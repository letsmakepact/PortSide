import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listActivity } from "@/lib/queries";
import { OverviewView } from "@/components/dashboard/OverviewView";

export const metadata = { title: "Overview" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const activity = await listActivity(user.id, 8);
  return <OverviewView initialActivity={activity} />;
}
