import { ServicesView } from "@/components/dashboard/ServicesView";

export const metadata = { title: "Services" };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project } = await searchParams;
  const initialProject = project === "none" ? "none" : project && Number.isFinite(Number(project)) ? project : "all";
  return <ServicesView key={initialProject} initialProject={initialProject} />;
}
