import { AuthForm } from "@/components/auth/AuthForm";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/seed";

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

export default function LoginPage() {
  return <AuthForm mode="login" demo={{ email: DEMO_EMAIL, password: DEMO_PASSWORD }} />;
}
