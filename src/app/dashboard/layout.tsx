import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listProjects, listServices } from "@/lib/queries";
import { DashboardProvider } from "@/components/dashboard/DashboardProvider";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DemoBanner } from "@/components/dashboard/DemoBanner";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [services, projects] = await Promise.all([listServices(user.id), listProjects(user.id)]);

  return (
    <DashboardProvider
      user={{ ...user, createdAt: user.createdAt.toISOString() }}
      initialServices={services}
      initialProjects={projects}
    >
      <div className="min-h-screen">
        <Sidebar />
        <main className="lg:pl-60">
          <DemoBanner email={user.email} />
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </DashboardProvider>
  );
}
