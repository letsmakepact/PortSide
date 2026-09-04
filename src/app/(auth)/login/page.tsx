import { AuthForm } from "@/components/auth/AuthForm";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/seed";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return <AuthForm mode="login" demo={{ email: DEMO_EMAIL, password: DEMO_PASSWORD }} />;
}
