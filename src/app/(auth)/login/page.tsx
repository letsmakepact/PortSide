import { AuthForm } from "@/components/auth/AuthForm";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/seed";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const headerList = await headers();
  const rawHost = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const host = rawHost.split(":")[0].toLowerCase();
  const isPortsideApex = host === "portside.lol" || host === "www.portside.lol" || host === "app.portside.lol";
  const isVanity = host.endsWith(".portside.lol") && !isPortsideApex;
  const vanityHandle = isVanity ? host.split(".")[0] : "";

  const isProfileMode = Boolean(isVanity || resolvedParams.next?.includes("profile"));

  return (
    <AuthForm
      mode="login"
      isProfileMode={isProfileMode}
      vanityHandle={vanityHandle}
      redirectTo={resolvedParams.next || (isVanity ? "/dashboard/settings?tab=profile" : "/dashboard")}
      demo={{ email: DEMO_EMAIL, password: DEMO_PASSWORD }}
    />
  );
}

