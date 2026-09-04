import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listProjects, listServices } from "@/lib/queries";
import { DashboardProvider } from "@/components/dashboard/DashboardProvider";
import { Sidebar } from "@/components/dashboard/Sidebar";

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
        <main className="lg:pl-64">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
        </main>
      </div>
    </DashboardProvider>
  );
}
