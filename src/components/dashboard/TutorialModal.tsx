"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface TutorialModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
  onAddService?: () => void;
  servicesCount?: number;
}

const STEPS = [
  {
    stepNumber: 1,
    badge: "Welcome",
    title: "Welcome to Portside",
    subtitle: "Created by pact",
    description:
      "Portside is your local development reverse proxy and cockpit. Instead of memorizing ports like :3000, :8080, and :5173, Portside automatically gives every local service its own clean *.localhost domain.",
    highlight: [
      { label: "Modern Standard", value: "*.localhost automatically resolves locally without /etc/hosts changes" },
      { label: "Zero Setup", value: "Works directly out of the box with your preferred browser" },
    ],
    icon: "🧭",
  },
  {
    stepNumber: 2,
    badge: "Routing",
    title: "Instant Hostname Mapping",
    subtitle: "Name your localhost processes",
    description:
      "Map any local process to a custom hostname. When you navigate to shop.localhost or api.localhost, Portside seamlessly proxies requests directly to your background server.",
    highlight: [
      { label: "Example Route", value: "api.localhost:3000  →  127.0.0.1:8081" },
      { label: "Header Rewriting", value: "Automatic Host & Location header translation for redirects" },
    ],
    icon: "⚡",
  },
  {
    stepNumber: 3,
    badge: "Monitoring",
    title: "Live Background Port Monitor",
    subtitle: "Know what's running at a glance",
    description:
      "Portside constantly probes your registered ports in the background. If a dev server crashes or stops listening, you'll immediately see its status change from online to offline with latency tracking.",
    highlight: [
      { label: "Proactive Probing", value: "Real-time socket checks with latency measurements" },
      { label: "Configurable", value: "Toggle auto-checks or trigger manual refreshes anytime" },
    ],
    icon: "📡",
  },
  {
    stepNumber: 4,
    badge: "Controls",
    title: "Pin, Pause & Filter",
    subtitle: "Keep your workspace clutter-free",
    description:
      "Pin your most-used services so they are always one click away on the Overview screen. Need to take a service down? Pause its route with one click to show a friendly fallback screen.",
    highlight: [
      { label: "Pinned Favorites", value: "Quick launch panel for high-frequency servers" },
      { label: "Graceful Fallbacks", value: "Paused routes show a polite explainer instead of connection drops" },
    ],
    icon: "📌",
  },
  {
    stepNumber: 5,
    badge: "Organization",
    title: "Projects & Activity Feed",
    subtitle: "Organize microservices & monitor history",
    description:
      "Organize multiple services under color-coded Projects (e.g., E-Commerce, Microservices, Side Projects). Review the Activity tab to audit port changes and server status drops.",
    highlight: [
      { label: "Project Groups", value: "Filter services by stack or application suite" },
      { label: "Audit Log", value: "Every service change and status fluctuation is logged" },
    ],
    icon: "🗂️",
  },
  {
    stepNumber: 6,
    badge: "Ready",
    title: "You're All Set!",
    subtitle: "Start building with clean hostnames",
    description:
      "Your database is completely fresh and ready. Click below to add your first local process or jump into your empty dashboard.",
    highlight: [
      { label: "Created By", value: "pact (github.com/letsmakepact · t.me/pactwithdevil)" },
      { label: "Revisit Anytime", value: "You can reopen this tutorial anytime from the sidebar" },
    ],
    icon: "🚀",
  },
];

export function TutorialModal({ forceOpen, onClose, onAddService, servicesCount = 0 }: TutorialModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (servicesCount > 0) {
      setIsOpen(false);
      localStorage.setItem("portside_tutorial_seen", "true");
      return;
    }
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    } else {
      const seen = localStorage.getItem("portside_tutorial_seen");
      if (!seen) {
        setIsOpen(true);
      }
    }
  }, [forceOpen, servicesCount]);

  function closeTutorial() {
    localStorage.setItem("portside_tutorial_seen", "true");
    setIsOpen(false);
    if (onClose) onClose();
  }

  function handleAddService() {
    closeTutorial();
    if (onAddService) onAddService();
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Modal open={isOpen} onClose={closeTutorial} title="" size="lg">
      <div className="relative pt-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            {current.badge} · Step {current.stepNumber} of {STEPS.length}
          </span>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-sky-600" : "w-2 bg-slate-200 hover:bg-slate-300"}`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-2xl shadow-lg shadow-sky-500/25 text-white">
            {current.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{current.title}</h2>
            <p className="text-xs font-medium text-sky-600">{current.subtitle}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">{current.description}</p>

        <div className="mt-5 space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
          {current.highlight.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{h.label}</span>
              <span className="font-mono text-indigo-600">{h.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={closeTutorial}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition"
          >
            Skip tutorial
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setStep(step - 1)}>
                Previous
              </Button>
            )}

            {!isLast ? (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button size="sm" onClick={handleAddService}>
                Add your first service
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
