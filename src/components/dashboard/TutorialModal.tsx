"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Laptop, Smartphone, Tv, QrCode, Wifi, ArrowRight, CheckCircle2, Sparkles, Navigation, Layers } from "lucide-react";

interface TutorialModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
  onAddService?: () => void;
  servicesCount?: number;
}

type DeviceMode = "desktop" | "mobile" | "tv";

interface Step {
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlight: { label: string; value: string }[];
  icon: any;
}

const DESKTOP_STEPS: Step[] = [
  {
    stepNumber: 1,
    badge: "Desktop Cockpit",
    title: "Welcome to Portside",
    subtitle: "Reverse proxy for your dev workstation",
    description:
      "Stop memorizing random port numbers like :3000, :8080, and :5173. Portside routes every background process on your machine to a clean, memorable *.localhost domain automatically.",
    highlight: [
      { label: "Modern Standard", value: "*.localhost resolves locally without modifying /etc/hosts" },
      { label: "Zero Setup", value: "Works directly out of the box in Chrome, Firefox, Edge, and Safari" },
    ],
    icon: Laptop,
  },
  {
    stepNumber: 2,
    badge: "Local Proxy",
    title: "Instant Hostname Mapping",
    subtitle: "Name your background dev servers",
    description:
      "Map your dev servers to custom hostnames like shop.localhost or api.localhost. Portside intercepts requests and proxies them with complete Host and Location header rewriting.",
    highlight: [
      { label: "Example Route", value: "api.localhost:80  →  127.0.0.1:8081" },
      { label: "Header Translation", value: "Seamless cookie and redirect handling across subdomains" },
    ],
    icon: Layers,
  },
  {
    stepNumber: 3,
    badge: "Socket Monitor",
    title: "Proactive Port Health",
    subtitle: "Instant crash and disconnect detection",
    description:
      "Portside constantly probes registered ports in the background. If your Next.js or Vite server crashes, the status dot immediately turns offline with latency logging.",
    highlight: [
      { label: "Proactive Health", value: "Real-time socket probing with millisecond latency" },
      { label: "Service Controls", value: "Pause, resume, or pin services with a single click" },
    ],
    icon: Sparkles,
  },
  {
    stepNumber: 4,
    badge: "Ready",
    title: "Ready to Build",
    subtitle: "Add your first local service",
    description:
      "Your workstation cockpit is ready. Click below to add your first local process or jump straight into your dashboard.",
    highlight: [
      { label: "Created By", value: "pact (github.com/letsmakepact · @pactwithdevil)" },
      { label: "Revisit Anytime", value: "Switch device guides anytime from the sidebar" },
    ],
    icon: CheckCircle2,
  },
];

const MOBILE_STEPS: Step[] = [
  {
    stepNumber: 1,
    badge: "Mobile Handheld",
    title: "Portside on Your Phone",
    subtitle: "Instant Wi-Fi access without cables",
    description:
      "Test responsive designs on real smartphones and tablets without cumbersome USB debugging or cloud deployments. Your phone can open any project running on your computer over local Wi-Fi.",
    highlight: [
      { label: "Zero-Config QR", value: "Point your phone camera to jump straight into your active app" },
      { label: "Direct Redirects", value: "Free wildcard redirects via http://<project>.<ip>.nip.io" },
    ],
    icon: Smartphone,
  },
  {
    stepNumber: 2,
    badge: "Camera & QR",
    title: "Scan & Open in Seconds",
    subtitle: "No manual IP address typing",
    description:
      "Open the 'Mobile / TV LAN' modal on your desktop dashboard, scan the high-resolution QR code with your iOS or Android camera, and your phone opens the dev server immediately.",
    highlight: [
      { label: "Error Level H", value: "30% redundancy for instant camera recognition" },
      { label: "Instant Clipboard", value: "One-tap copy button formatted for mobile messaging" },
    ],
    icon: QrCode,
  },
  {
    stepNumber: 3,
    badge: "Remote & Hotspot",
    title: "Isolated Dev Hotspot & 5G",
    subtitle: "Test in coffee shops or over cellular data",
    description:
      "Traveling without a router? Spawn a hardware-encrypted PortSide Wi-Fi hotspot from your PC, or use global 5G tunneling (*.portside.lol) to review builds away from home.",
    highlight: [
      { label: "Dev Wi-Fi Hotspot", value: "Dedicated PC hotspot for router-free testing" },
      { label: "5G Cellular", value: "Permanent custom tunnel domain accessible anywhere" },
    ],
    icon: Wifi,
  },
  {
    stepNumber: 4,
    badge: "Mobile Ready",
    title: "Phone Testing Ready",
    subtitle: "Start previewing on mobile devices",
    description:
      "Add your local projects on desktop, open the Mobile LAN modal, and test on your phone with zero setup.",
    highlight: [
      { label: "PWA Support", value: "Add to home screen for full-screen standalone testing" },
      { label: "Touch Ergonomics", value: "Optimized touch targets and safe-area notch insets" },
    ],
    icon: CheckCircle2,
  },
];

const TV_STEPS: Step[] = [
  {
    stepNumber: 1,
    badge: "Smart TV & 10-Foot",
    title: "Portside on Big Screen TVs",
    subtitle: "Presentations, dashboards & TV app testing",
    description:
      "Turn any Smart TV (LG webOS, Samsung Tizen, Android TV, Fire TV, Apple TV) into a live development monitor and interactive presentation kiosk without needing HDMI cables.",
    highlight: [
      { label: "10-Foot UI", value: "Large, high-contrast cards designed for viewing from across the room" },
      { label: "Browser Friendly", value: "Works directly inside your TV's built-in web browser" },
    ],
    icon: Tv,
  },
  {
    stepNumber: 2,
    badge: "D-Pad Control",
    title: "TV Remote D-Pad Navigation",
    subtitle: "Navigate with Arrow keys without a mouse",
    description:
      "Portside features built-in spatial keyboard navigation. Use the Up, Down, Left, and Right directional arrows on your TV remote control to glide between service cards and press OK to launch.",
    highlight: [
      { label: "Spatial Arrow Keys", value: "Cycle focus seamlessly using physical TV remote buttons" },
      { label: "Electric Focus Ring", value: "Glowing 4px sky-blue outline ensures clear visibility at 10 feet" },
    ],
    icon: Navigation,
  },
  {
    stepNumber: 3,
    badge: "TV Launchpad",
    title: "The /lan TV Portal",
    subtitle: "All your services in one directory",
    description:
      "Open your TV browser and navigate to http://<your-lan-ip>/lan. All running projects appear as high-contrast launch tiles ready for instant full-screen remote viewing.",
    highlight: [
      { label: "Kiosk Mode", value: "Keep continuous live dashboards running on wall-mounted displays" },
      { label: "Direct Jumps", value: "Free tier users can bookmark http://<lan-ip>/s/<project>" },
    ],
    icon: QrCode,
  },
  {
    stepNumber: 4,
    badge: "TV Ready",
    title: "Smart TV Setup Complete",
    subtitle: "Ready to launch on the big screen",
    description:
      "Open your TV browser, enter your local Portside IP, and control your dev projects from your couch with your remote control.",
    highlight: [
      { label: "Input Method", value: "Supports physical D-pad remotes and TV air mice" },
      { label: "Performance", value: "Lightweight zero-heavyweight CSS for fluid TV rendering" },
    ],
    icon: CheckCircle2,
  },
];

export function TutorialModal({ forceOpen, onClose, onAddService, servicesCount = 0 }: TutorialModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");

  useEffect(() => {
    // Detect device environment
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      const isTv =
        ua.includes("smart-tv") ||
        ua.includes("smarttv") ||
        ua.includes("tizen") ||
        ua.includes("webos") ||
        ua.includes("appletv") ||
        ua.includes("googletv") ||
        ua.includes("android tv") ||
        ua.includes("hbbtv") ||
        ua.includes("crkey") ||
        window.location.pathname.startsWith("/lan");

      const isMobile =
        !isTv &&
        (ua.includes("iphone") ||
          ua.includes("ipad") ||
          ua.includes("android") ||
          ua.includes("mobile") ||
          window.innerWidth <= 768);

      if (isTv) {
        setDeviceMode("tv");
      } else if (isMobile) {
        setDeviceMode("mobile");
      } else {
        setDeviceMode("desktop");
      }
    }
  }, []);

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

  const steps = deviceMode === "mobile" ? MOBILE_STEPS : deviceMode === "tv" ? TV_STEPS : DESKTOP_STEPS;
  const safeStep = Math.min(step, steps.length - 1);
  const current = steps[safeStep];
  const isLast = safeStep === steps.length - 1;
  const CurrentIcon = current.icon;

  return (
    <Modal open={isOpen} onClose={closeTutorial} title="" size="lg">
      <div className="relative pt-1">
        {/* Device Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
            <button
              type="button"
              onClick={() => {
                setDeviceMode("desktop");
                setStep(0);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                deviceMode === "desktop"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>Laptop & PC</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDeviceMode("mobile");
                setStep(0);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                deviceMode === "mobile"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Phone & Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDeviceMode("tv");
                setStep(0);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                deviceMode === "tv"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Tv className="h-3.5 w-3.5" />
              <span>Smart TV</span>
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400">
            Step {current.stepNumber} of {steps.length}
          </span>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex gap-1.5 mb-5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === safeStep
                  ? deviceMode === "mobile"
                    ? "w-8 bg-emerald-500"
                    : deviceMode === "tv"
                    ? "w-8 bg-amber-500"
                    : "w-8 bg-sky-500"
                  : "w-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Step Header */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg text-white ${
              deviceMode === "mobile"
                ? "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-emerald-500/25"
                : deviceMode === "tv"
                ? "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 shadow-orange-500/25"
                : "bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 shadow-sky-500/25"
            }`}
          >
            <CurrentIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <span
              className={`inline-block text-[11px] font-bold uppercase tracking-wider mb-0.5 ${
                deviceMode === "mobile"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : deviceMode === "tv"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-sky-600 dark:text-sky-400"
              }`}
            >
              {current.badge}
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {current.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{current.subtitle}</p>
          </div>
        </div>

        <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {current.description}
        </p>

        {/* Highlights List */}
        <div className="mt-4 space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-3.5">
          {current.highlight.map((h, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{h.label}:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400 break-all">{h.value}</span>
            </div>
          ))}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={closeTutorial}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            Skip guide
          </button>

          <div className="flex items-center gap-2">
            {safeStep > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setStep(safeStep - 1)}>
                Previous
              </Button>
            )}

            {!isLast ? (
              <Button size="sm" onClick={() => setStep(safeStep + 1)}>
                Next <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleAddService}>
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
