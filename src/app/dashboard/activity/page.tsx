import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listActivity } from "@/lib/queries";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const activity = await listActivity(user.id, 200);
  return <ActivityFeed initialActivity={activity} />;
}
