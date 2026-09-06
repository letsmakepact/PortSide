export function AnchorLogo({
  size,
  className = "h-5 w-5",
  gradient = true,
}: {
  size?: number;
  className?: string;
  gradient?: boolean;
}) {
  if (!gradient) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={size ? { width: size, height: size } : undefined}
      >
        <circle cx="16" cy="6" r="2.5" stroke="currentColor" strokeWidth="2.2" fill="none" />
        <rect x="8.5" y="10.5" width="15" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
        <rect x="14.5" y="8" width="3" height="16" rx="1.5" fill="currentColor" />
        <path d="M7 16C7 21 10.5 25 16 25C21.5 25 25 21 25 16" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <polygon points="3.5,16.5 7.5,12 9.5,17" fill="currentColor" />
        <polygon points="28.5,16.5 24.5,12 22.5,17" fill="currentColor" />
      </svg>
    );
  }

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-md animate-pulse-glow" />
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_4px_12px_rgba(14,165,233,0.35)]"
      >
        <defs>
          <linearGradient id="skyMetal" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#bae6fd" />
            <stop offset="70%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="deepNavy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>
          <radialGradient id="specularGlow" cx="30%" cy="25%" r="45%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="20" r="14" fill="url(#deepNavy)" />
        <circle cx="50" cy="20" r="12" fill="url(#skyMetal)" />
        <circle cx="50" cy="20" r="6" fill="#060b13" />
        <circle cx="47" cy="17" r="3" fill="url(#specularGlow)" />

        <rect x="24" y="32" width="52" height="9" rx="4.5" fill="url(#deepNavy)" />
        <rect x="25" y="33" width="50" height="7" rx="3.5" fill="url(#skyMetal)" />
        <circle cx="26" cy="36.5" r="4.5" fill="url(#deepNavy)" />
        <circle cx="26" cy="36.5" r="3.5" fill="url(#skyMetal)" />
        <circle cx="74" cy="36.5" r="4.5" fill="url(#deepNavy)" />
        <circle cx="74" cy="36.5" r="3.5" fill="url(#skyMetal)" />

        <rect x="45.5" y="26" width="9" height="52" rx="4.5" fill="url(#deepNavy)" />
        <rect x="46.5" y="27" width="7" height="50" rx="3.5" fill="url(#skyMetal)" />
        <rect x="47.5" y="27" width="2" height="50" rx="1" fill="#ffffff" fillOpacity="0.6" />

        <path
          d="M 18 48 C 18 78, 82 78, 82 48"
          stroke="url(#deepNavy)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 18 48 C 18 78, 82 78, 82 48"
          stroke="url(#skyMetal)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 21 50 C 23 75, 77 75, 79 50"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        <polygon points="12,50 18,36 28,48 20,47" fill="url(#deepNavy)" />
        <polygon points="13,49 18,38 26,47 19,46" fill="url(#skyMetal)" />

        <polygon points="88,50 82,36 72,48 80,47" fill="url(#deepNavy)" />
        <polygon points="87,49 82,38 74,47 81,46" fill="url(#skyMetal)" />

        <circle cx="50" cy="81" r="5" fill="url(#deepNavy)" />
        <circle cx="50" cy="81" r="3.5" fill="url(#skyMetal)" />
      </svg>
    </div>
  );
}

export function AnchorIconBox({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const boxClasses = {
    sm: "h-7 w-7 rounded-lg bg-[#060b13] border border-sky-500/20 shadow-xs shadow-sky-500/10",
    md: "h-8 w-8 rounded-lg bg-[#060b13] border border-sky-500/25 shadow-xs shadow-sky-500/10",
    lg: "h-10 w-10 rounded-xl bg-[#060b13] border border-sky-500/30 shadow-sm shadow-sky-500/15",
  }[size];

  const iconClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${boxClasses}`}>
      <AnchorLogo className={iconClasses} />
    </span>
  );
}
