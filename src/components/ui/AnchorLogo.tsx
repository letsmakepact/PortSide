export function AnchorLogo({
  size,
  className = "h-5 w-5",
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
        className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(56,189,248,0.45)]"
      >
        <defs>
          <linearGradient id="cyanMetal" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#bae6fd" />
            <stop offset="65%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="cyanOutline" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <radialGradient id="specularGlow" cx="30%" cy="25%" r="45%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <mask id="ringCutout">
            <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
            <circle cx="50" cy="20" r="6" fill="#000000" />
          </mask>
        </defs>

        <g mask="url(#ringCutout)">
          {/* Top Ring */}
          <circle cx="50" cy="20" r="14" fill="url(#cyanOutline)" />
          <circle cx="50" cy="20" r="12" fill="url(#cyanMetal)" />
          <circle cx="47" cy="17" r="3" fill="url(#specularGlow)" />

          {/* Crossbar */}
          <rect x="23.5" y="32" width="53" height="9" rx="4.5" fill="url(#cyanOutline)" />
          <rect x="25" y="33" width="50" height="7" rx="3.5" fill="url(#cyanMetal)" />
          <circle cx="26" cy="36.5" r="4.5" fill="url(#cyanOutline)" />
          <circle cx="26" cy="36.5" r="3.5" fill="url(#cyanMetal)" />
          <circle cx="74" cy="36.5" r="4.5" fill="url(#cyanOutline)" />
          <circle cx="74" cy="36.5" r="3.5" fill="url(#cyanMetal)" />

          {/* Vertical Shaft */}
          <rect x="45.5" y="26" width="9" height="52" rx="4.5" fill="url(#cyanOutline)" />
          <rect x="46.5" y="27" width="7" height="50" rx="3.5" fill="url(#cyanMetal)" />
          <rect x="47.5" y="27" width="2" height="50" rx="1" fill="#ffffff" fillOpacity="0.85" />

          {/* Curved Arc */}
          <path d="M 18 48 C 18 78, 82 78, 82 48" stroke="url(#cyanOutline)" strokeWidth="11" strokeLinecap="round" />
          <path d="M 18 48 C 18 78, 82 78, 82 48" stroke="url(#cyanMetal)" strokeWidth="7.5" strokeLinecap="round" />
          <path d="M 21 50 C 23 75, 77 75, 79 50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />

          {/* Flukes */}
          <polygon points="12,50 18,36 28,48 20,47" fill="url(#cyanOutline)" />
          <polygon points="13,49 18,38 26,47 19,46" fill="url(#cyanMetal)" />
          <polygon points="88,50 82,36 72,48 80,47" fill="url(#cyanOutline)" />
          <polygon points="87,49 82,38 74,47 81,46" fill="url(#cyanMetal)" />

          {/* Bottom Finial */}
          <circle cx="50" cy="81" r="5" fill="url(#cyanOutline)" />
          <circle cx="50" cy="81" r="3.5" fill="url(#cyanMetal)" />
        </g>
      </svg>
    </div>
  );
}

export function AnchorIconBox({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const boxClasses = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-11 w-11 rounded-xl",
  }[size];

  const iconClasses = {
    sm: "h-5 w-5",
    md: "h-6.5 w-6.5",
    lg: "h-8.5 w-8.5",
  }[size];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center bg-[#070e1c] border border-sky-400/40 shadow-xs shadow-sky-500/25 ${boxClasses}`}
    >
      <AnchorLogo className={iconClasses} />
    </span>
  );
}
