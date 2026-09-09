import { AuthForm } from "@/components/auth/AuthForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/register",
  },
};

export default async function RegisterPage() {
  const headerList = await headers();
  const rawHost = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const host = rawHost.split(":")[0].toLowerCase();
  const isPortsideApex = host === "portside.lol" || host === "www.portside.lol" || host === "app.portside.lol";
  const isPublicLink = host.endsWith(".portside.lol") && !isPortsideApex;

  if (isPublicLink) {
    redirect("https://portside.lol");
  }

  return <AuthForm mode="register" />;
}
