import { SettingsView } from "@/components/dashboard/SettingsView";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  return <SettingsView initialTab={params?.tab} />;
}
