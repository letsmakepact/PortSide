export function AnchorLogo({
  size,
  className = "h-5 w-5",
  gradient = true,
}: {
  size?: number;
  className?: string;
  gradient?: boolean;
}) {
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]"
      >
        <defs>
          <linearGradient id="psSkyMetal" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e0f2fe" />
            <stop offset="65%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="psCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <radialGradient id="psShine" cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Top Ring / Loop */}
        <circle cx="50" cy="18" r="14" fill="url(#psCyanGlow)" />
        <circle cx="50" cy="18" r="11" fill="url(#psSkyMetal)" />
        <circle cx="50" cy="18" r="5.5" fill="#060b13" />
        <circle cx="47" cy="15" r="3" fill="url(#psShine)" />

        {/* Horizontal Crossbar */}
        <rect x="22" y="32" width="56" height="8" rx="4" fill="url(#psCyanGlow)" />
        <rect x="23" y="33" width="54" height="6" rx="3" fill="url(#psSkyMetal)" />
        <circle cx="24.5" cy="36" r="4" fill="url(#psCyanGlow)" />
        <circle cx="24.5" cy="36" r="3" fill="url(#psSkyMetal)" />
        <circle cx="75.5" cy="36" r="4" fill="url(#psCyanGlow)" />
        <circle cx="75.5" cy="36" r="3" fill="url(#psSkyMetal)" />

        {/* Vertical Central Shank */}
        <rect x="45.5" y="26" width="9" height="52" rx="4.5" fill="url(#psCyanGlow)" />
        <rect x="46.5" y="27" width="7" height="50" rx="3.5" fill="url(#psSkyMetal)" />
        <rect x="48.5" y="27" width="3" height="50" rx="1.5" fill="#ffffff" fillOpacity="0.8" />

        {/* Curved Lower Anchor Arc */}
        <path
          d="M 18 48 C 18 80, 82 80, 82 48"
          stroke="url(#psCyanGlow)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 18 48 C 18 80, 82 80, 82 48"
          stroke="url(#psSkyMetal)"
          strokeWidth="7.5"
          strokeLinecap="round"
        />
        <path
          d="M 21 50 C 23 76, 77 76, 79 50"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />

        {/* Upward Pointing Triangular Flukes */}
        <polygon points="11,50 18,34 27,48 19,46" fill="url(#psCyanGlow)" />
        <polygon points="12,49 18,36 25,47 19,45" fill="url(#psSkyMetal)" />

        <polygon points="89,50 82,34 73,48 81,46" fill="url(#psCyanGlow)" />
        <polygon points="88,49 82,36 75,47 81,45" fill="url(#psSkyMetal)" />

        {/* Bottom Crown Jewel */}
        <circle cx="50" cy="81" r="5" fill="url(#psCyanGlow)" />
        <circle cx="50" cy="81" r="3.5" fill="url(#psSkyMetal)" />
      </svg>
    </div>
  );
}

export function AnchorIconBox({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const boxClasses = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-8.5 w-8.5 rounded-xl",
    lg: "h-10 w-10 rounded-xl",
  }[size];

  const iconClasses = {
    sm: "h-4.5 w-4.5",
    md: "h-5.5 w-5.5",
    lg: "h-6.5 w-6.5",
  }[size];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center bg-gradient-to-b from-[#0b1629] to-[#040813] border border-sky-400/40 shadow-xs shadow-sky-500/20 ring-1 ring-sky-500/15 ${boxClasses}`}
    >
      <AnchorLogo className={iconClasses} />
    </span>
  );
}
