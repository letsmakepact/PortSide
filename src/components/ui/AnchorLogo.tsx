export function AnchorLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="anchorBodyGrad" x1="16" y1="3" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="anchorHighlight" x1="16" y1="3" x2="24" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="60%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <filter id="anchorShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0284c7" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#anchorShadow)">
        <path
          d="M6 16.5C6 22 10.2 26 16 26C21.8 26 26 22 26 16.5"
          stroke="url(#anchorBodyGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        <path
          d="M3.2 16.5L7.4 12.2L9.5 17.5L3.2 16.5Z"
          fill="url(#anchorHighlight)"
          stroke="url(#anchorBodyGrad)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <path
          d="M28.8 16.5L24.6 12.2L22.5 17.5L28.8 16.5Z"
          fill="url(#anchorHighlight)"
          stroke="url(#anchorBodyGrad)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        <rect
          x="14.3"
          y="7"
          width="3.4"
          height="18"
          rx="1.7"
          fill="url(#anchorBodyGrad)"
        />

        <rect
          x="9"
          y="9.8"
          width="14"
          height="3.2"
          rx="1.6"
          fill="url(#anchorHighlight)"
        />

        <circle
          cx="16"
          cy="6.2"
          r="2.8"
          fill="none"
          stroke="url(#anchorHighlight)"
          strokeWidth="2.4"
        />
      </g>
    </svg>
  );
}

export function AnchorIconBox({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const boxClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-12 w-12 rounded-2xl",
  }[size];

  const iconClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }[size];

  return (
    <span
      className={`flex items-center justify-center bg-gradient-to-br from-sky-400/20 via-sky-500/15 to-blue-600/25 border border-sky-400/40 shadow-md shadow-sky-500/20 ${boxClasses}`}
    >
      <AnchorLogo className={iconClasses} />
    </span>
  );
}
