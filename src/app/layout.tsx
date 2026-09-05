import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Portside — name your localhost", template: "%s · Portside" },
  description: "Give every local dev server a memorable *.localhost hostname. No more remembering ports. Created by pact.",
  authors: [{ name: "pact", url: "https://github.com/letsmakepact" }],
  creator: "pact (@pactwithdevil)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("portside:theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans bg-slate-50/70 text-slate-900 dark:bg-[#0b0f19] dark:text-slate-100 antialiased selection:bg-slate-900 selection:text-white dark:selection:bg-sky-500">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
