import { AuthForm } from "@/components/auth/AuthForm";

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

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
